import { describe, expect, it } from "vitest";
import { applyRuleEngine } from "../../server/ruleEngine.js";
import { getStateFeeData } from "../../server/stateFeeLookup.js";
import { amortizingPayment } from "../../server/quoteMath.js";
import {
  applyDealerQuoteFactsWithProvenance,
  parseDealerQuoteFacts,
} from "../../server/dealerQuoteText.js";
import { blockGoWhenInventedFieldsRemain } from "../../server/fieldProvenance.js";
import type { AnalysisResponse, DetectedFields } from "../../shared/schema.js";
import { auditedCamryBenchmark } from "./auditedBenchmark.js";

const llm = {
  dealScore: "GREEN",
  confidenceLevel: "HIGH",
  verdictLabel: "GO — TERMS LOOK CLEAN",
  goNoGo: "GO",
  summary: "This deal appears broadly fair.",
  detectedFields: {} as DetectedFields,
  missingInfo: [],
  suggestedReply: "The price looks good.",
  reasoning: "Price appears fair.",
} as AnalysisResponse;

const ca = getStateFeeData("CA");

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
    vehicle_make: "Toyota",
    vehicle_model: "Camry",
    vehicle_year: 2025,
    ...partial,
  };
}

describe("field provenance rejects model-invented money", () => {
  it("records a printed doc fee with its span and marks an invented APR unverified", () => {
    const text = "2025 Toyota Camry LE\nSelling price: $28,000\nDoc fee: $70\nAPR is not on this pencil.";
    const applied = applyDealerQuoteFactsWithProvenance(
      blank({
        salePrice: 28000,
        apr: 4.9,
        termMonths: 60,
        rebates: 2000,
        fees: [{ name: "Doc fee", amount: 70 }, { name: "Nitrogen", amount: 899 }],
      }),
      parseDealerQuoteFacts(text),
    );
    const doc = applied.provenance.find((row) => row.field === "fee:Doc fee");
    expect(doc).toMatchObject({ origin: "dealer_text", verified: true, amount: 70 });
    expect(doc?.raw).toMatch(/70/);
    expect(doc?.start).toEqual(expect.any(Number));
    expect(doc?.end).toBeGreaterThan(doc?.start ?? 0);

    expect(applied.fields.apr).toBeNull();
    expect(applied.fields.termMonths).toBeNull();
    expect(applied.fields.rebates).toBeNull();
    expect(applied.fields.fees.map((fee) => fee.amount)).toEqual([70]);
    expect(applied.provenance).toEqual(expect.arrayContaining([
      expect.objectContaining({ field: "apr", origin: "model", verified: false, amount: 4.9 }),
      expect.objectContaining({ field: "termMonths", origin: "model", verified: false, amount: 60 }),
      expect.objectContaining({ field: "rebates", origin: "model", verified: false, amount: 2000 }),
      expect.objectContaining({ field: "fee:Nitrogen", origin: "model", verified: false, amount: 899 }),
    ]));
  });

  it("keeps an APR and term that the dealer actually printed", () => {
    const text = "Selling price: $28,000\nAPR 4.9% for 60 months\nDoc fee: $70";
    const applied = applyDealerQuoteFactsWithProvenance(
      blank({ salePrice: 28000, apr: 9.9, termMonths: 72, fees: [{ name: "Doc fee", amount: 70 }] }),
      parseDealerQuoteFacts(text),
    );
    expect(applied.fields.apr).toBe(4.9);
    expect(applied.fields.termMonths).toBe(60);
    const apr = applied.provenance.find((row) => row.field === "apr");
    expect(apr).toMatchObject({ origin: "dealer_text", verified: true, amount: 4.9 });
    expect(apr?.raw?.toLowerCase()).toContain("apr");
  });

  it("does not GO when a model-invented rebate is the only way the total adds up", () => {
    const text = [
      "2025 Toyota Camry LE",
      "Selling price: $28,000",
      "Doc fee: $70",
      "Sales tax: $1,000",
      "Registration: $400",
      "Out the door: $27,470",
    ].join("\n");
    const invented = blank({
      salePrice: 28000,
      rebates: 2000,
      outTheDoorPrice: 27470,
      fees: [
        { name: "Doc fee", amount: 70 },
        { name: "Sales tax", amount: 1000 },
        { name: "Registration", amount: 400 },
      ],
    });
    const applied = applyDealerQuoteFactsWithProvenance(invented, parseDealerQuoteFacts(text));
    expect(applied.fields.rebates).toBeNull();
    const result = applyRuleEngine(llm, applied.fields, null, "cash", null, {
      stateData: ca,
      marketBenchmark: auditedCamryBenchmark(),
      condition: "new",
      mileage: 12,
      trim: "LE",
      dealerText: text,
    });
    expect(applied.fields.salePrice).toBe(28000);
    expect(applied.fields.rebates).toBeNull();
    expect(applied.fields.taxes).toBe(1000);
    expect(applied.fields.registrationFee).toBe(400);
    expect(applied.fields.fees.find((fee) => /doc fee/i.test(fee.name))?.amount).toBe(70);
    expect(applied.fields.fees.find((fee) => /nitrogen|rebate/i.test(fee.name))).toBeUndefined();
    expect(result.goNoGo).not.toBe("GO");
    expect(result.mathematicalDerivation).toEqual(expect.arrayContaining([
      "Sales tax (government, as stated or computed) $1000.00",
      "Registration (government) $400.00",
      "Doc fee (dealer) $70.00",
      "Computed out-the-door $29470.00",
    ]));
    expect(result.mathematicalDerivation?.join("\n") ?? "").not.toMatch(/Rebates subtracted/);
    expect(applied.provenance).toEqual(expect.arrayContaining([
      expect.objectContaining({ field: "rebates", origin: "model", verified: false, amount: 2000 }),
    ]));
  });

  it("does not authenticate an APR from a percent printed on another line", () => {
    const text = [
      "2025 Toyota Camry LE",
      "Selling price: $28,000",
      "Sales tax 4.9%",
      "APR available on request",
      "Doc fee: $70",
      "Monthly payment: $499",
    ].join("\n");
    const applied = applyDealerQuoteFactsWithProvenance(
      blank({
        salePrice: 499,
        apr: 4.9,
        monthlyPayment: 499,
        fees: [
          { name: "Doc fee", amount: 70 },
          { name: "Nitrogen", amount: 70 },
        ],
      }),
      parseDealerQuoteFacts(text),
    );
    expect(applied.fields.apr).toBeNull();
    expect(applied.fields.salePrice).toBe(28000);
    expect(applied.fields.monthlyPayment).toBe(499);
    expect(applied.fields.fees.map((fee) => fee.name)).toEqual(["Doc fee"]);
    const apr = applied.provenance.find((row) => row.field === "apr");
    expect(apr).toMatchObject({ origin: "model", verified: false, amount: 4.9 });
    expect(apr?.start).toBeUndefined();
    expect(apr?.raw).toBeUndefined();
    const doc = applied.provenance.find((row) => row.field === "fee:Doc fee");
    expect(doc).toMatchObject({ origin: "dealer_text", verified: true, amount: 70 });
    expect(doc?.raw).toMatch(/70/);
    const nitrogen = applied.provenance.find((row) => row.field === "fee:Nitrogen");
    expect(nitrogen).toMatchObject({ origin: "model", verified: false, amount: 70 });
  });

  it("does not GO when a model-invented APR and term would make the payment match", () => {
    const amountFinanced = 28000 + 70 + 1000 + 400;
    const payment = amortizingPayment(amountFinanced, 4.9, 60);
    expect(payment).not.toBeNull();
    const text = [
      "2025 Toyota Camry LE",
      "Selling price: $28,000",
      "Doc fee: $70",
      "Sales tax: $1,000",
      "Registration: $400",
      `Out the door: $${amountFinanced.toLocaleString("en-US")}`,
      `Monthly payment: $${payment}`,
      "Financing available.",
    ].join("\n");
    const invented = blank({
      salePrice: 28000,
      apr: 4.9,
      termMonths: 60,
      monthlyPayment: payment,
      outTheDoorPrice: amountFinanced,
      fees: [
        { name: "Doc fee", amount: 70 },
        { name: "Sales tax", amount: 1000 },
        { name: "Registration", amount: 400 },
      ],
    });
    const withInvention = applyRuleEngine(llm, invented, null, "finance", null, {
      stateData: ca,
      marketBenchmark: auditedCamryBenchmark(),
      condition: "new",
      mileage: 12,
      trim: "LE",
      dealerText: "Cash purchase. Not a loan.",
    });
    expect(withInvention.goNoGo).toBe("GO");

    const applied = applyDealerQuoteFactsWithProvenance(invented, parseDealerQuoteFacts(text));
    expect(applied.fields.apr).toBeNull();
    expect(applied.fields.termMonths).toBeNull();
    const result = applyRuleEngine(llm, applied.fields, null, "finance", null, {
      stateData: ca,
      marketBenchmark: auditedCamryBenchmark(),
      condition: "new",
      mileage: 12,
      trim: "LE",
      dealerText: text,
    });
    expect(result.goNoGo).not.toBe("GO");
    expect(result.verdictLabel).toMatch(/FINANCING TERMS NEEDED/);
  });

  it("blocks GO when invented financing figures are still on the worksheet", () => {
    const fields = blank({
      salePrice: 28000,
      apr: 4.9,
      termMonths: 60,
      rebates: 2000,
      fees: [
        { name: "Doc fee", amount: 70 },
        { name: "Sales tax", amount: 1000 },
        { name: "Registration", amount: 400 },
      ],
      outTheDoorPrice: 29470,
    });
    const blocked = blockGoWhenInventedFieldsRemain(
      {
        ...llm,
        goNoGo: "GO",
        verdictLabel: "GO — PRICE INSIDE INDEPENDENT BENCHMARK",
        summary: "Approved.",
        dealScore: "GREEN",
        confidenceLevel: "HIGH",
        primaryIssue: "Approved.",
      },
      fields,
      [
        { field: "apr", origin: "model", verified: false, amount: 4.9 },
        { field: "termMonths", origin: "model", verified: false, amount: 60 },
        { field: "rebates", origin: "model", verified: false, amount: 2000 },
      ],
    );
    expect(blocked.goNoGo).not.toBe("GO");
    expect(blocked.verdictLabel).toMatch(/UNVERIFIED EXTRACTED TERMS/);
  });
});
