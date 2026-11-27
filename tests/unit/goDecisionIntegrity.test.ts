import { readFileSync } from "fs";
import { resolve } from "path";
import { describe, expect, it } from "vitest";
import { applyRuleEngine } from "../../server/ruleEngine.js";
import { getStateFeeData } from "../../server/stateFeeLookup.js";
import { factoryMarkup } from "../../server/marketValuation.js";
import type { AnalysisResponse, DetectedFields } from "../../shared/schema.js";

/**
 * GO requires completed financial reconciliation, disclosure, regulatory
 * verification, and an independent market valuation. A buyer-entered factory
 * MSRP is a separate comparison and never verifies market value.
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

const stateData = getStateFeeData("CA");

function blank(partial: Partial<DetectedFields>): DetectedFields {
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
    vehicle_model: "Camry LE",
    vehicle_year: 2025,
    ...partial,
  };
}

function run(
  fields: DetectedFields,
  options: Parameters<typeof applyRuleEngine>[5],
) {
  return applyRuleEngine(llm, fields, null, "cash", null, options);
}

describe("GO decision integrity", () => {
  it("never returns GO for ODIGOS_SYNTHETIC_QA when tax and registration are missing", () => {
    const result = run(
      blank({
        salePrice: 28000,
        outTheDoorPrice: 40000,
        fees: [{ name: "Doc fee", amount: 70 }],
      }),
      {
        stateData,
        buyerWindowStickerMsrp: 28700,
        dealerText:
          "ODIGOS_SYNTHETIC_QA 2025 Toyota Camry LE selling price $28,000. Factory MSRP $28,700. Doc fee $70. Out the door $40,000. No tax or registration breakdown.",
      },
    );
    expect(result.goNoGo).not.toBe("GO");
    expect(result.verdictLabel).not.toMatch(/^GO/);
    expect(result.dealScore).not.toBe("GREEN");
    expect(result.marketValuation?.status).toBe("unverified");
    expect(result.dimensions?.mathematicalAccuracy.status).not.toBe("clear");
    expect(result.dimensions?.mathematicalAccuracy.summary).toMatch(/not fully reconciled|not reconciled/i);
    expect(result.msrpComparison?.relation).toBe("at_or_below");
    expect(result.summary ?? "").not.toMatch(/guaranteed savings|overpaying by/i);
  });

  it("does not give an unqualified GO to a used Camry priced under its original MSRP", () => {
    const result = run(
      blank({
        salePrice: 28000,
        outTheDoorPrice: 28000 + 70 + 1000 + 400,
        fees: [
          { name: "Doc fee", amount: 70 },
          { name: "Sales tax", amount: 1000 },
          { name: "Registration", amount: 400 },
        ],
      }),
      {
        stateData,
        condition: "used",
        mileage: 32000,
        buyerWindowStickerMsrp: 28700,
      },
    );
    expect(result.goNoGo).not.toBe("GO");
    expect(result.verdictLabel).not.toMatch(/^GO/);
    expect(result.marketValuation?.status).toBe("unverified");
    expect(result.msrpComparison?.relation).toBe("at_or_below");
    expect(result.msrpComparison?.markupDollars).toBeNull();
    expect(result.summary).toMatch(/used vehicle/i);
    expect(result.summary ?? "").not.toMatch(/\$700/);
    expect(result.summary ?? "").not.toMatch(/guaranteed savings|you save|overpaying by/i);
    expect(result.suggestedReply ?? "").not.toMatch(/buyer's order|good deal|fair price/i);
  });

  it("does not give an unqualified GO when a $45,000 Camry is paired with an incorrect $50,000 MSRP", () => {
    const result = run(
      blank({
        salePrice: 45000,
        outTheDoorPrice: 45000 + 70 + 1000 + 400,
        fees: [
          { name: "Doc fee", amount: 70 },
          { name: "Sales tax", amount: 1000 },
          { name: "Registration", amount: 400 },
        ],
      }),
      {
        stateData,
        buyerWindowStickerMsrp: 50000,
      },
    );
    expect(result.goNoGo).not.toBe("GO");
    expect(result.goNoGo).not.toBe("NO-GO");
    expect(result.verdictLabel).not.toMatch(/MARKUP OVER FACTORY MSRP/);
    expect(result.marketValuation?.status).toBe("unverified");
    expect(result.msrpComparison?.relation).toBe("at_or_below");
    expect(result.msrpComparison?.factoryMsrp).toBe(50000);
    expect(result.msrpComparison?.markupDollars).toBeNull();
    expect(result.summary ?? "").not.toMatch(/guaranteed savings|you save|overpaying by/i);
  });

  it("still NO-GOs an exact factory MSRP markup without calling it market overpayment", () => {
    const markup = factoryMarkup(45000, 28700);
    const result = run(
      blank({
        salePrice: 45000,
        outTheDoorPrice: 45000 + 70 + 1000 + 400,
        fees: [
          { name: "Doc fee", amount: 70 },
          { name: "Sales tax", amount: 1000 },
          { name: "Registration", amount: 400 },
        ],
      }),
      { stateData, buyerWindowStickerMsrp: 28700 },
    );
    expect(markup.dollarsLabel).toBe("$16,300");
    expect(markup.percentLabel).toBe("56.79%");
    expect(result.goNoGo).toBe("NO-GO");
    expect(result.verdictLabel).toMatch(/MARKUP OVER FACTORY MSRP/);
    expect(result.primaryIssue).toContain("$16,300");
    expect(result.primaryIssue).toContain("56.79%");
    expect(result.marketValuation?.status).toBe("unverified");
    expect(result.summary).toMatch(/not an estimated market overpayment or guaranteed savings/i);
  });

  it("does not GO from an independent benchmark when tax and registration are absent", () => {
    const result = run(
      blank({
        salePrice: 28000,
        outTheDoorPrice: 40000,
        fees: [{ name: "Doc fee", amount: 70 }],
      }),
      {
        stateData,
        marketBenchmark: {
          status: "verified",
          source: "licensed-valuation",
          kind: "market_transaction",
          low: 26000,
          high: 30000,
          reason: "Fixture valuation that does not copy the asking price.",
        },
      },
    );
    expect(result.goNoGo).not.toBe("GO");
    expect(result.verdictLabel).toMatch(/FINANCIAL RECONCILIATION INCOMPLETE/i);
    expect(result.marketValuation?.status).toBe("verified");
  });

  it("still permits GO when independent valuation, tax, registration, and the out-the-door total all reconcile", () => {
    const result = run(
      blank({
        salePrice: 28000,
        outTheDoorPrice: 28000 + 70 + 1000 + 400,
        fees: [
          { name: "Doc fee", amount: 70 },
          { name: "Sales tax", amount: 1000 },
          { name: "Registration", amount: 400 },
        ],
      }),
      {
        stateData,
        marketBenchmark: {
          status: "verified",
          source: "licensed-valuation",
          kind: "market_transaction",
          low: 26000,
          high: 30000,
          reason: "Fixture valuation that does not copy the asking price.",
        },
      },
    );
    expect(result.goNoGo).toBe("GO");
    expect(result.marketValuation?.status).toBe("verified");
    expect(result.marketValuation?.kind).toBe("market_transaction");
    expect(result.dimensions?.mathematicalAccuracy.status).toBe("clear");
    expect(result.dimensions?.regulatoryCompliance.status).toBe("clear");
  });
});

describe("analysis prompt", () => {
  it("does not instruct a fair-market range or a GREEN verdict without independent evidence", () => {
    const source = readFileSync(resolve(import.meta.dirname, "../../server/services/analyzeService.ts"), "utf8");
    expect(source).not.toMatch(/This scenario is GREEN/);
    expect(source).not.toMatch(/"estimatedOverpaymentMin": 1200/);
    expect(source).not.toMatch(/"primaryIssue": "Price appears fair"/);
    expect(source).not.toMatch(/GREEN \+ HIGH confidence: Out-the-door price present/);
    expect(source).toMatch(/Factory MSRP comparison and independent market valuation are different|FACTORY MSRP AND MARKET VALUE ARE DIFFERENT/);
    expect(source).toMatch(/Do not return GO/);
  });
});
