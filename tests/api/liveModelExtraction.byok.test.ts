/**
 * Optional live-model extraction. Bring your own key:
 *
 *   OPENAI_API_KEY=... npx vitest run tests/api/liveModelExtraction.byok.test.ts
 *
 * CI does not set OPENAI_API_KEY, so this file skips and spends nothing.
 * The vitest dummy AI_INTEGRATIONS_OPENAI_API_KEY is not a developer key.
 * Every quote contains ODIGOS_SYNTHETIC_QA. Do not put a real customer's quote here.
 */

import { describe, expect, it } from "vitest";
import { AI_PRIMARY_MODEL } from "../../server/config/aiModel.js";
import { applyDealerQuoteFacts, parseDealerQuoteFacts } from "../../server/dealerQuoteText.js";
import { openai } from "../../server/openaiClient.js";
import { isSyntheticSubmission } from "../../server/syntheticGuard.js";
import type { DetectedFields, Fee } from "../../shared/schema.js";

const developerKey = process.env.OPENAI_API_KEY?.trim() ?? "";
const runLive = developerKey.length > 0 && developerKey !== "sk-test-dummy-key-for-vitest";

const QUOTES = [
  `ODIGOS_SYNTHETIC_QA
California dealer
Selling price: $28,000
Doc fee: $60
Administrative processing charge: $60
Electronic filing fee: $25
Sales tax: $2,100
Registration: $400`,
  `ODIGOS_SYNTHETIC_QA
Selling price: USD 1,234
Doc fee: 85
Out the door: 1,400 USD`,
  "ODIGOS_SYNTHETIC_QA\nService and handling\t129\nSelling price\t18000",
  `ODIGOS_SYNTHETIC_QA
Selling price: $28,00O
Doc fee: S85
Sales tax 7.75%`,
];

function blank(partial: Partial<DetectedFields> = {}): DetectedFields {
  return {
    salePrice: null,
    msrp: null,
    rebates: null,
    fees: [],
    outTheDoorPrice: null,
    monthlyPayment: null,
    tradeInValue: null,
    apr: null,
    termMonths: null,
    downPayment: null,
    moneyFactor: null,
    residualValue: null,
    residualPercent: null,
    acquisitionFee: null,
    dispositionFee: null,
    mileageAllowance: null,
    excessMileageRate: null,
    ...partial,
  };
}

async function extractLive(dealerText: string): Promise<DetectedFields> {
  if (!dealerText.includes("ODIGOS_SYNTHETIC_QA")) {
    throw new Error("Refusing a live extraction that is not marked ODIGOS_SYNTHETIC_QA.");
  }
  const response = await openai.chat.completions.create({
    model: AI_PRIMARY_MODEL,
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          'Extract the dealer quote as JSON: {"salePrice": number|null, "outTheDoorPrice": number|null, "fees": [{"name": string, "amount": number|null}]}. Copy printed amounts. A percentage is not dollars. Do not invent fees.',
      },
      { role: "user", content: dealerText },
    ],
  });
  const raw = response.choices[0]?.message?.content ?? "";
  if (!raw.trim()) throw new Error("The live model returned an empty extraction.");
  let parsed: { salePrice?: unknown; outTheDoorPrice?: unknown; fees?: { name?: unknown; amount?: unknown }[] } = {};
  try {
    parsed = JSON.parse(raw) as typeof parsed;
  } catch {
    parsed = {};
  }
  const fees: Fee[] = Array.isArray(parsed.fees)
    ? parsed.fees
        .filter((fee) => typeof fee?.name === "string")
        .map((fee) => ({
          name: String(fee.name),
          amount: typeof fee.amount === "number" && Number.isFinite(fee.amount) ? fee.amount : null,
        }))
    : [];
  return applyDealerQuoteFacts(
    blank({
      salePrice: typeof parsed.salePrice === "number" ? parsed.salePrice : null,
      outTheDoorPrice: typeof parsed.outTheDoorPrice === "number" ? parsed.outTheDoorPrice : null,
      fees,
    }),
    parseDealerQuoteFacts(dealerText),
  );
}

describe.skipIf(!runLive)("live model extraction (OPENAI_API_KEY)", () => {
  it("runs a handful of synthetic quotes through the live model and the raw-text parser", async () => {
    expect(QUOTES.every((quote) => quote.includes("ODIGOS_SYNTHETIC_QA"))).toBe(true);
    for (const quote of QUOTES) {
      expect(isSyntheticSubmission({ dealerText: quote })).toBe(true);
      const extracted = await extractLive(quote);
      expect(extracted.fees.length + (extracted.salePrice == null ? 0 : 1)).toBeGreaterThan(0);
      expect(extracted.fees.some((fee) => fee.amount === 7.75)).toBe(false);
    }
  }, 120_000);
});
