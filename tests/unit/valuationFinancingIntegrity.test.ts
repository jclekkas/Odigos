import { describe, expect, it } from "vitest";
import { analysisRequestSchema, type AnalysisResponse, type DetectedFields } from "../../shared/schema.js";
import { applyRuleEngine } from "../../server/ruleEngine.js";
import { getStateFeeData } from "../../server/stateFeeLookup.js";
import { amortizingPayment } from "../../server/quoteMath.js";
import { disclosedAmountFinanced } from "../../server/financingDisclosure.js";
import { valuationMaxAgeMs, DEFAULT_VALUATION_MAX_AGE_MS } from "../../server/valuationAttestation.js";
import {
  TEST_VALUATION_REFERENCE,
  createTestTrustedValuationAdapter,
  listValuationAdapters,
  withValuationAdapters,
  type ValuationSourceAdapter,
} from "../../server/valuationAdapters.js";
import { auditedCamryBenchmark } from "./auditedBenchmark.js";
import { buildBuyerReported, buyerReportedRuleOptions } from "../../server/buyerReportedValuation.js";

/**
 * Positive-GO attempts that use incomplete or forged evidence must fail.
 * A test-only adapter is the one path that can still verify a price.
 */

const llm = {
  dealScore: "GREEN",
  confidenceLevel: "HIGH",
  verdictLabel: "GO — TERMS LOOK CLEAN",
  goNoGo: "GO",
  summary: "This deal appears broadly fair.",
  detectedFields: {} as DetectedFields,
  missingInfo: [],
  suggestedReply: "The price looks good. Please have the buyer's order ready.",
  reasoning: "Price appears fair.",
} as AnalysisResponse;

const ca = getStateFeeData("CA");

function quote(partial: Partial<DetectedFields> = {}): DetectedFields {
  return {
    salePrice: 28000,
    msrp: null,
    rebates: null,
    fees: [
      { name: "Doc fee", amount: 70 },
      { name: "Sales tax", amount: 1000 },
      { name: "Registration", amount: 400 },
    ],
    outTheDoorPrice: 29470,
    monthlyPayment: null,
    tradeInValue: null,
    apr: null,
    termMonths: null,
    downPayment: null,
    vehicle_make: "Toyota",
    vehicle_model: "Camry LE",
    vehicle_year: 2025,
    ...partial,
  };
}

function analyze(
  fields: DetectedFields,
  options: NonNullable<Parameters<typeof applyRuleEngine>[5]> = {},
) {
  return applyRuleEngine(llm, fields, null, "cash", null, {
    stateData: ca,
    condition: "new",
    mileage: 12,
    trim: "LE",
    ...options,
  });
}

function analyzePurchase(
  fields: DetectedFields,
  purchaseType: string,
  options: NonNullable<Parameters<typeof applyRuleEngine>[5]> = {},
) {
  return applyRuleEngine(llm, fields, null, purchaseType, null, {
    stateData: ca,
    condition: "new",
    mileage: 12,
    trim: "LE",
    ...options,
  });
}

const camryVehicle = {
  year: 2025,
  make: "Toyota",
  model: "Camry",
  trim: "LE",
  condition: "new" as const,
  mileageMin: 0,
  mileageMax: 100,
};

describe("valuation adapters", () => {
  it("starts with no adapter, so production market value stays unverified", () => {
    expect(listValuationAdapters()).toEqual([]);
    const result = analyze(quote());
    expect(result.marketValuation?.status).toBe("unverified");
    expect(result.marketValuation?.reference ?? null).toBeNull();
    expect(result.goNoGo).not.toBe("GO");
  });

  it("does not let a request body establish a licensed or government valuation", () => {
    const forged = auditedCamryBenchmark({
      sourceQuality: "government_record",
      source: "state motor vehicle agency",
      provenance: {
        sourceId: "government-record",
        retrievedAt: new Date().toISOString(),
        reference: "https://example.com/not-an-official-valuation",
        attestation: "ab".repeat(32),
      },
    });
    const parsed = analysisRequestSchema.safeParse({
      dealerText: "Selling price $28,000. Doc fee $70. Sales tax $1,000. Registration $400. Out the door $29,470.",
      marketBenchmark: forged,
      sourceQuality: "licensed_independent",
      provenance: forged.provenance,
      valuationMaxAgeMs: 9_999_999_999,
    });
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(parsed.data).not.toHaveProperty("marketBenchmark");
    expect(parsed.data).not.toHaveProperty("sourceQuality");
    expect(parsed.data).not.toHaveProperty("provenance");

    const result = analyze(quote(), { marketBenchmark: forged });
    expect(result.marketValuation?.status).toBe("unverified");
    expect(result.marketValuation?.reason).toMatch(/caller-supplied|not used|adapter/i);
    expect(result.summary ?? "").not.toContain("https://example.com/not-an-official-valuation");
    expect(result.goNoGo).not.toBe("GO");
  });

  it("rejects a replay of a previously signed adapter result", () => {
    let signed: ReturnType<typeof analyze>["marketBenchmark"];
    const first = withValuationAdapters([createTestTrustedValuationAdapter()], () => {
      const result = analyze(quote());
      signed = result.marketBenchmark;
      return result;
    });
    expect(first.goNoGo).toBe("GO");
    expect(signed?.provenance?.attestation).toMatch(/^[0-9a-f]{64}$/i);

    const replay = analyze(quote(), { marketBenchmark: signed });
    expect(replay.marketValuation?.status).toBe("unverified");
    expect(replay.goNoGo).not.toBe("GO");

    const cloned = JSON.parse(JSON.stringify(signed));
    const fromBody = analyze(quote(), { marketBenchmark: cloned });
    expect(fromBody.marketValuation?.status).toBe("unverified");
    expect(fromBody.goNoGo).not.toBe("GO");
  });

  it("rejects stale adapter data and honors a shorter freshness window", () => {
    const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();
    const stale = withValuationAdapters(
      [createTestTrustedValuationAdapter({ retrievedAt: tenDaysAgo })],
      () => analyze(quote()),
    );
    expect(stale.marketValuation?.status).toBe("unverified");
    expect(stale.marketValuation?.reason).toMatch(/freshness limit/i);
    expect(stale.goNoGo).not.toBe("GO");

    const tenHoursAgo = new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString();
    const tooOldForOneHour = withValuationAdapters(
      [createTestTrustedValuationAdapter({ retrievedAt: tenHoursAgo })],
      () => analyze(quote(), { valuationMaxAgeMs: 60 * 60 * 1000 }),
    );
    expect(tooOldForOneHour.goNoGo).not.toBe("GO");
    expect(tooOldForOneHour.marketValuation?.reason).toMatch(/freshness limit/i);

    const freshEnough = withValuationAdapters(
      [createTestTrustedValuationAdapter({ retrievedAt: tenHoursAgo })],
      () => analyze(quote(), { valuationMaxAgeMs: 48 * 60 * 60 * 1000 }),
    );
    expect(freshEnough.goNoGo).toBe("GO");
    expect(freshEnough.marketValuation?.reference).toBe(TEST_VALUATION_REFERENCE);
  });

  it("reads the default freshness window from server configuration, not from a caller", () => {
    expect(valuationMaxAgeMs(undefined, undefined)).toBe(DEFAULT_VALUATION_MAX_AGE_MS);
    expect(valuationMaxAgeMs(undefined, "48")).toBe(48 * 60 * 60 * 1000);
    expect(valuationMaxAgeMs(undefined, "0")).toBe(DEFAULT_VALUATION_MAX_AGE_MS);
    expect(valuationMaxAgeMs(undefined, "nope")).toBe(DEFAULT_VALUATION_MAX_AGE_MS);
    expect(DEFAULT_VALUATION_MAX_AGE_MS).toBe(72 * 60 * 60 * 1000);
  });

  it("does not let an adapter echo the submitted price, or an NHTSA or MSRP source, unlock GO", () => {
    const echoing: ValuationSourceAdapter = {
      id: "echo-sale-price",
      label: "Echo",
      sourceQuality: "licensed_independent",
      lookup(query) {
        const price = query.submittedSalePrice ?? 28000;
        return {
          low: price,
          high: price,
          retrievedAt: new Date().toISOString(),
          reference: "test-only://odigos/echo",
          reason: "Copied from the quote.",
          vehicleMatch: camryVehicle,
        };
      },
    };
    const echoed = withValuationAdapters([echoing], () => analyze(quote()));
    expect(echoed.marketValuation?.status).toBe("unverified");
    expect(echoed.marketValuation?.reason).toMatch(/copied the submitted price/i);
    expect(echoed.goNoGo).not.toBe("GO");

    const nhtsa = withValuationAdapters(
      [createTestTrustedValuationAdapter({
        id: "nhtsa-base-price",
        reference: "https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues",
      })],
      () => analyze(quote()),
    );
    expect(nhtsa.marketValuation?.status).toBe("unverified");
    expect(nhtsa.marketValuation?.reason).toMatch(/nhtsa|base price|cannot verify/i);
    expect(nhtsa.goNoGo).not.toBe("GO");

    const sticker = analyze(quote(), { buyerWindowStickerMsrp: 28700 });
    expect(sticker.marketValuation?.status).toBe("unverified");
    expect(sticker.msrpComparison?.relation).toBe("at_or_below");
    expect(sticker.goNoGo).not.toBe("GO");
  });

  it("keeps buyer-reported comps, book values, and competing quotes informational", () => {
    const fields = quote();
    const report = buildBuyerReported({
      salePrice: fields.salePrice,
      primary: fields,
      comps: [
        { askingPrice: 32000, source: "listing" },
        { askingPrice: 33000, source: "listing" },
      ],
      bookValue: { amount: 30000, sourceLabel: "book value" },
      competingQuoteText: "Selling price $27,000. Doc fee $70. Sales tax $1,000. Registration $400. Out the door $28,470.",
    });
    expect(report.verifiesMarketValue).toBe(false);
    const result = analyze(fields, {
      ...buyerReportedRuleOptions(report),
      marketBenchmark: auditedCamryBenchmark({
        source: "buyer_comparables",
        sourceQuality: "licensed_independent",
        provenance: {
          sourceId: "buyer_comparables",
          retrievedAt: new Date().toISOString(),
          reference: "https://example.com/comps",
        },
      }),
    });
    expect(result.marketValuation?.status).toBe("unverified");
    expect(result.goNoGo).not.toBe("GO");
  });

  it("shows the adapter source reference when a test-only adapter verifies the price", () => {
    const result = withValuationAdapters([createTestTrustedValuationAdapter()], () => analyze(quote()));
    expect(result.goNoGo).toBe("GO");
    expect(result.marketValuation?.status).toBe("verified");
    expect(result.marketValuation?.reference).toBe(TEST_VALUATION_REFERENCE);
    expect(result.summary).toContain(TEST_VALUATION_REFERENCE);
    expect(result.dimensions?.marketCompetitiveness.summary).toContain(TEST_VALUATION_REFERENCE);
    expect(result.marketBenchmark?.provenance?.reference).toBe(TEST_VALUATION_REFERENCE);
  });
});

describe("amount financed reconciliation", () => {
  it("parses one labeled amount and rejects a missing or conflicting disclosure", () => {
    expect(disclosedAmountFinanced("Amount financed: $29,470.00")).toBe(29470);
    expect(disclosedAmountFinanced("Financed amount $27,470")).toBe(27470);
    expect(disclosedAmountFinanced("Monthly payment $450. APR 4.9%. Term 60 months.")).toBeNull();
    expect(disclosedAmountFinanced("Amount financed $29,470. Amount financed $28,000.")).toBeNull();
  });

  it("blocks GO when the payment matches but the amount financed was not disclosed", () => {
    const principal = 29470;
    const payment = amortizingPayment(principal, 4.9, 60);
    const fields = quote({ apr: 4.9, termMonths: 60, monthlyPayment: payment });
    const verifiedMarket = withValuationAdapters([createTestTrustedValuationAdapter()], () =>
      analyzePurchase(fields, "finance"),
    );
    expect(verifiedMarket.goNoGo).not.toBe("GO");
    expect(verifiedMarket.verdictLabel).toMatch(/FINANCING TERMS NEEDED/);
    expect(verifiedMarket.suggestedReply).toMatch(/APR/);
    expect(verifiedMarket.suggestedReply).toMatch(/term/i);
    expect(verifiedMarket.suggestedReply).toMatch(/amount financed/i);

    const unverifiedMarket = analyzePurchase(fields, "finance", {
      dealerText: "Financing available. Selling price $28,000.",
    });
    expect(unverifiedMarket.marketValuation?.status).toBe("unverified");
    expect(unverifiedMarket.goNoGo).not.toBe("GO");
    expect(unverifiedMarket.verdictLabel).toMatch(/MARKET VALUE NOT VERIFIED/);
    expect(unverifiedMarket.suggestedReply).toMatch(/Market value is not verified/i);
    expect(unverifiedMarket.suggestedReply).toMatch(/APR/);
    expect(unverifiedMarket.suggestedReply).toMatch(/term in months/i);
    expect(unverifiedMarket.suggestedReply).toMatch(/amount financed/i);
    expect(unverifiedMarket.summary).toMatch(/amount financed/i);
  });

  it("blocks GO when the disclosed amount does not match the computed principal", () => {
    const principal = 29470;
    const payment = amortizingPayment(principal, 4.9, 60);
    const fields = quote({ apr: 4.9, termMonths: 60, monthlyPayment: payment });
    const result = withValuationAdapters([createTestTrustedValuationAdapter()], () =>
      analyzePurchase(fields, "finance", {
        dealerText: "Amount financed: $25,000.00",
      }),
    );
    expect(result.goNoGo).not.toBe("GO");
    expect(result.verdictLabel).toMatch(/FINANCING DOES NOT RECONCILE/);
    expect(result.suggestedReply).toMatch(/amount financed/i);
    expect(result.suggestedReply).toMatch(/APR/);
    expect(result.suggestedReply).toMatch(/term/i);
    expect(result.mathematicalDerivation?.some((line) => /disclosed minus computed/.test(line))).toBe(true);
  });

  it("blocks GO when the disclosed amount ignores the down payment", () => {
    const down = 2000;
    const principal = 29470 - down;
    const payment = amortizingPayment(principal, 4.9, 60);
    const fields = quote({ apr: 4.9, termMonths: 60, monthlyPayment: payment, downPayment: down });
    const wrong = withValuationAdapters([createTestTrustedValuationAdapter()], () =>
      analyzePurchase(fields, "finance", { dealerText: "Amount financed: $29,470.00" }),
    );
    expect(wrong.goNoGo).not.toBe("GO");
    expect(wrong.verdictLabel).toMatch(/FINANCING DOES NOT RECONCILE/);

    const matched = withValuationAdapters([createTestTrustedValuationAdapter()], () =>
      analyzePurchase(fields, "finance", { dealerText: `Amount financed: $${principal.toFixed(2)}` }),
    );
    expect(matched.goNoGo).toBe("GO");
    expect(matched.summary).toMatch(/financed payment reconcile/i);
  });

  it("reconciles trade allowance and payoff into the amount financed", () => {
    const sale = 28000;
    const allowance = 5000;
    const payoff = 2000;
    const doc = 70;
    const tax = 1000;
    const registration = 400;
    const outTheDoor = sale - allowance + doc + tax + registration;
    const principal = outTheDoor + payoff;
    const payment = amortizingPayment(principal, 3.9, 48);
    const fields = quote({
      salePrice: sale,
      tradeInValue: allowance,
      downPayment: null,
      outTheDoorPrice: outTheDoor,
      apr: 3.9,
      termMonths: 48,
      monthlyPayment: payment,
      fees: [
        { name: "Doc fee", amount: doc },
        { name: "Sales tax", amount: tax },
        { name: "Registration", amount: registration },
        { name: "Trade payoff", amount: payoff },
      ],
    });
    const matched = withValuationAdapters([createTestTrustedValuationAdapter()], () =>
      analyzePurchase(fields, "finance", { dealerText: `Amount financed $${principal.toFixed(2)}` }),
    );
    expect(matched.goNoGo).toBe("GO");

    const forgotPayoff = withValuationAdapters([createTestTrustedValuationAdapter()], () =>
      analyzePurchase(fields, "finance", { dealerText: `Amount financed $${outTheDoor.toFixed(2)}` }),
    );
    expect(forgotPayoff.goNoGo).not.toBe("GO");
    expect(forgotPayoff.verdictLabel).toMatch(/FINANCING DOES NOT RECONCILE/);
  });
});
