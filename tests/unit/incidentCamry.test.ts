import { describe, expect, it } from "vitest";
import { applyRuleEngine } from "../../server/ruleEngine.js";
import { getStateFeeData } from "../../server/stateFeeLookup.js";
import { independentMarketBenchmark } from "../../server/marketValuation.js";
import { replyEndorsesUnverifiedPrice } from "../../server/replyConstraint.js";
import type { AnalysisResponse, DetectedFields } from "../../shared/schema.js";

/**
 * The live incident: a 2025 Toyota Camry LE in California, cash, was approved
 * at both $28,000 and $45,000, with a "normal" range copied from the asking
 * price and a dealer reply that endorsed the price.
 */

const llm = {
  dealScore: "GREEN",
  confidenceLevel: "MEDIUM",
  verdictLabel: "GO — TERMS LOOK CLEAN",
  goNoGo: "GO",
  summary: "This deal appears broadly fair.",
  detectedFields: {} as DetectedFields,
  missingInfo: [],
  suggestedReply: "The price looks good. Please have the buyer's order ready.",
  reasoning: "Price appears fair.",
} as AnalysisResponse;

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
    vehicle_model: "Camry",
    vehicle_year: 2025,
    ...partial,
  };
}

function camry(sale: number, doc = 85, tax = 1000): DetectedFields {
  const reg = 400;
  return blank({
    salePrice: sale,
    outTheDoorPrice: Math.round((sale + doc + tax + reg) * 100) / 100,
    fees: [
      { name: "Doc fee", amount: doc },
      { name: "Sales tax", amount: tax },
      { name: "Reg & title", amount: reg },
    ],
  });
}

const PRICES = [20000, 28000, 35000, 45000, 60000, 100000];

describe("2025 Camry LE metamorphic quotes", () => {
  const stateData = getStateFeeData("CA");

  it("keeps one unverified benchmark at every asking price", () => {
    const benchmarks = PRICES.map((sale) =>
      independentMarketBenchmark({
        submittedSalePrice: sale,
        submittedOutTheDoor: sale + 1485,
        vehicleYear: 2025,
        vehicleMake: "Toyota",
        vehicleModel: "Camry",
      }),
    );
    for (const benchmark of benchmarks) {
      expect(benchmark).toEqual(benchmarks[0]);
      expect(benchmark.status).toBe("unverified");
      expect(benchmark.low).toBeNull();
      expect(benchmark.high).toBeNull();
    }
  });

  it("never approves or endorses the six asking prices", () => {
    for (const sale of PRICES) {
      const fields = camry(sale);
      const result = applyRuleEngine(llm, fields, null, "cash", null, { stateData });
      expect(result.goNoGo, String(sale)).not.toBe("GO");
      expect(result.marketBenchmark?.status).toBe("unverified");
      expect(result.marketBenchmark?.low).toBeNull();
      expect(result.suggestedReply ?? "").not.toMatch(/buyer's order|buyers order/i);
      expect(result.suggestedReply ?? "").toMatch(/VIN/i);
      expect(result.suggestedReply ?? "").toMatch(/window sticker/i);
      expect(replyEndorsesUnverifiedPrice(result.suggestedReply ?? "", result.goNoGo)).toBe(false);
      if (sale >= 45000) {
        expect(result.goNoGo).not.toBe("GO");
      }
    }
  });

  it("reproduces Test A and Test B as not GO, with no savings range", () => {
    const testA = blank({
      salePrice: 28000,
      outTheDoorPrice: 30661.59,
      fees: [
        { name: "Doc fee", amount: 85 },
        { name: "Sales tax", amount: 2176.59 },
        { name: "Reg & title", amount: 400 },
      ],
    });
    const testB = blank({
      salePrice: 45000,
      outTheDoorPrice: 48985,
      fees: [
        { name: "Doc fee", amount: 85 },
        { name: "Sales tax", amount: 3500 },
        { name: "Reg & title", amount: 400 },
      ],
    });
    const a = applyRuleEngine(llm, testA, null, "cash", null, { stateData });
    const b = applyRuleEngine(llm, testB, null, "cash", null, { stateData });
    expect(a.goNoGo).not.toBe("GO");
    expect(b.goNoGo).not.toBe("GO");
    expect(a.marketBenchmark).toEqual(b.marketBenchmark);
    expect(a.verdictLabel).toMatch(/CONDITIONAL DOC FEE/i);
    expect(b.verdictLabel).toMatch(/CONDITIONAL DOC FEE/i);
    expect(a.suggestedReply).not.toMatch(/buyer's order/i);
    expect(b.suggestedReply).not.toMatch(/good deal|fair price|buyer's order/i);
    expect(28000 + 85 + 2176.59 + 400).toBeCloseTo(30661.59, 2);
    expect(45000 + 85 + 3500 + 400).toBe(48985);
  });

  it("still withholds GO when the doc fee is inside the $70 ceiling", () => {
    for (const sale of [28000, 45000, 100000]) {
      const result = applyRuleEngine(llm, camry(sale, 70), null, "cash", null, { stateData });
      expect(result.goNoGo).toBe("INSUFFICIENT-INFORMATION");
      expect(result.verdictLabel).toMatch(/MARKET VALUE NOT VERIFIED/i);
    }
  });
});
