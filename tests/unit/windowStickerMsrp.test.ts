import { describe, expect, it } from "vitest";
import { applyRuleEngine } from "../../server/ruleEngine.js";
import { getStateFeeData } from "../../server/stateFeeLookup.js";
import {
  benchmarkCopiesSubmittedPrice,
  factoryMarkup,
  independentMarketBenchmark,
} from "../../server/marketValuation.js";
import { replyEndorsesUnverifiedPrice } from "../../server/replyConstraint.js";
import { FACTORY_STICKER_COMPARISON } from "../../shared/windowSticker.js";
import { analysisRequestSchema } from "../../shared/schema.js";
import type { AnalysisResponse, DetectedFields } from "../../shared/schema.js";

/**
 * Buyer-supplied Monroney MSRP. The selling price and the out-the-door price
 * are not the benchmark. A model-extracted MSRP is not the benchmark either.
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

const CA_MSRP = 28700;
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
    vehicle_model: "Camry",
    vehicle_year: 2025,
    ...partial,
  };
}

function camry(sale: number, doc: number, extractedMsrp: number | null = null): DetectedFields {
  const tax = 1000;
  const reg = 400;
  return blank({
    salePrice: sale,
    msrp: extractedMsrp,
    outTheDoorPrice: Math.round((sale + doc + tax + reg) * 100) / 100,
    fees: [
      { name: "Doc fee", amount: doc },
      { name: "Sales tax", amount: tax },
      { name: "Reg & title", amount: reg },
    ],
  });
}

function analyze(fields: DetectedFields, sticker: number | null | undefined) {
  return applyRuleEngine(llm, fields, null, "cash", null, {
    stateData,
    buyerWindowStickerMsrp: sticker,
  });
}

describe("buyer-supplied factory window sticker MSRP", () => {
  it("flags a $45,000 Camry LE against a $28,700 factory MSRP as NO-GO", () => {
    const fields = camry(45000, 70, 45000);
    const result = analyze(fields, CA_MSRP);
    const markup = factoryMarkup(45000, CA_MSRP);
    expect(markup.dollarsLabel).toBe("$16,300");
    expect(markup.percentLabel).toBe("56.79%");
    expect(result.goNoGo).toBe("NO-GO");
    expect(result.verdictLabel).toMatch(/MARKUP OVER FACTORY MSRP/);
    expect(result.primaryIssue).toContain(markup.dollarsLabel);
    expect(result.primaryIssue).toContain(markup.percentLabel);
    expect(result.primaryIssue).toContain("$28,700");
    expect(result.summary).toContain(FACTORY_STICKER_COMPARISON);
    expect(result.marketBenchmark?.status).toBe("verified");
    expect(result.marketBenchmark?.source).toBe("buyer_window_sticker_msrp");
    expect(result.marketBenchmark?.kind).toBe("factory_msrp");
    expect(result.marketBenchmark?.high).toBe(CA_MSRP);
    expect(result.marketBenchmark?.low).toBe(CA_MSRP);
    expect(result.suggestedReply).toMatch(/markup/i);
    expect(result.suggestedReply).toContain(FACTORY_STICKER_COMPARISON);
    expect(result.suggestedReply).not.toMatch(/buyer's order|buyers order|good deal|fair price/i);
    expect(replyEndorsesUnverifiedPrice(result.suggestedReply ?? "", result.goNoGo)).toBe(false);
    expect(result.dimensions?.marketCompetitiveness.status).toBe("fail");
  });

  it("still NO-GOs the $45,000 ask when the California doc fee is the conditional $85", () => {
    const result = analyze(camry(45000, 85), CA_MSRP);
    expect(result.goNoGo).toBe("NO-GO");
    expect(result.verdictLabel).toMatch(/MARKUP OVER FACTORY MSRP/);
    expect(result.suggestedReply).toMatch(/markup/i);
    expect(replyEndorsesUnverifiedPrice(result.suggestedReply ?? "", result.goNoGo)).toBe(false);
  });

  it("reaches GO when the selling price is exactly the factory MSRP and the $70 CA doc fee is clean", () => {
    const result = analyze(camry(CA_MSRP, 70), CA_MSRP);
    expect(result.goNoGo).toBe("GO");
    expect(result.summary).toMatch(/at or below/i);
    expect(result.summary).toContain(FACTORY_STICKER_COMPARISON);
    expect(result.marketBenchmark?.source).toBe("buyer_window_sticker_msrp");
  });

  it("reaches GO for a $28,000 Camry LE at or below a $28,700 factory MSRP with a $70 CA doc fee", () => {
    const result = analyze(camry(28000, 70), CA_MSRP);
    expect(result.goNoGo).toBe("GO");
    expect(result.verdictLabel).toMatch(/FACTORY WINDOW STICKER MSRP/);
    expect(result.summary).toContain(FACTORY_STICKER_COMPARISON);
    expect(result.summary).toMatch(/at or below/i);
    expect(result.suggestedReply).toContain(FACTORY_STICKER_COMPARISON);
    expect(result.suggestedReply).toMatch(/buyer-supplied factory window sticker MSRP/i);
    expect(result.marketBenchmark?.source).toBe("buyer_window_sticker_msrp");
    expect(result.dimensions?.marketCompetitiveness.status).toBe("clear");
    expect(result.dimensions?.mathematicalAccuracy.status).toBe("clear");
  });

  it("still catches a conditional $85 California doc fee when the selling price is under factory MSRP", () => {
    const result = analyze(camry(28000, 85), CA_MSRP);
    expect(result.goNoGo).toBe("PROCEED-WITH-CAUTION");
    expect(result.verdictLabel).toMatch(/CONDITIONAL DOC FEE/i);
    expect(result.suggestedReply).toMatch(/private-industry-partner|1685/i);
    expect(result.suggestedReply).not.toMatch(/buyer's order|good deal|fair price/i);
    expect(replyEndorsesUnverifiedPrice(result.suggestedReply ?? "", result.goNoGo)).toBe(false);
    expect(result.marketBenchmark?.source).toBe("buyer_window_sticker_msrp");
  });

  it("keeps the safe abstention when the same quotes have no factory MSRP", () => {
    const markupAsk = analyze(camry(45000, 70, 28700), null);
    const clean = analyze(camry(28000, 70, 28700), undefined);
    const conditional = analyze(camry(28000, 85, 45000), undefined);
    expect(markupAsk.goNoGo).toBe("INSUFFICIENT-INFORMATION");
    expect(markupAsk.verdictLabel).toMatch(/MARKET VALUE NOT VERIFIED/i);
    expect(markupAsk.marketBenchmark?.status).toBe("unverified");
    expect(markupAsk.marketBenchmark?.low).toBeNull();
    expect(markupAsk.marketBenchmark?.high).toBeNull();
    expect(markupAsk.marketBenchmark?.source).toBeNull();
    expect(clean.goNoGo).toBe("INSUFFICIENT-INFORMATION");
    expect(clean.verdictLabel).toMatch(/MARKET VALUE NOT VERIFIED/i);
    expect(conditional.goNoGo).toBe("PROCEED-WITH-CAUTION");
    expect(conditional.verdictLabel).toMatch(/CONDITIONAL DOC FEE/i);
    expect(conditional.marketBenchmark).toEqual(clean.marketBenchmark);
    for (const result of [markupAsk, clean, conditional]) {
      expect(result.goNoGo).not.toBe("GO");
      expect(result.suggestedReply ?? "").not.toMatch(/buyer's order/i);
      expect(replyEndorsesUnverifiedPrice(result.suggestedReply ?? "", result.goNoGo)).toBe(false);
    }
  });

  it("does not let the asking price move a fixed factory MSRP", () => {
    const benchmarks = [20000, 28000, 45000, 100000].map((sale) =>
      independentMarketBenchmark({
        submittedSalePrice: sale,
        submittedOutTheDoor: sale + 1485,
        vehicleYear: 2025,
        vehicleMake: "Toyota",
        vehicleModel: "Camry",
        buyerWindowStickerMsrp: CA_MSRP,
      }),
    );
    for (const benchmark of benchmarks) {
      expect(benchmark.high).toBe(CA_MSRP);
      expect(benchmark.low).toBe(CA_MSRP);
      expect(benchmark.source).toBe("buyer_window_sticker_msrp");
    }
    expect(new Set(benchmarks.map((benchmark) => benchmark.high)).size).toBe(1);
  });

  it("rejects invalid, negative, and out-the-door prices copied into the sticker", () => {
    const sale = 45000;
    const otd = 46470;
    const rejected = [
      Number.NaN,
      Number.POSITIVE_INFINITY,
      Number.NEGATIVE_INFINITY,
      -1,
      0,
      12,
      9_000_000,
      otd,
      otd - 0.4,
    ];
    for (const sticker of rejected) {
      const benchmark = independentMarketBenchmark({
        submittedSalePrice: sale,
        submittedOutTheDoor: otd,
        buyerWindowStickerMsrp: sticker,
      });
      expect(benchmark.status, String(sticker)).toBe("unverified");
      expect(benchmark.low, String(sticker)).toBeNull();
      expect(benchmark.high, String(sticker)).toBeNull();
      expect(benchmark.source, String(sticker)).toBeNull();
      const result = analyze(camry(sale, 70), sticker);
      expect(result.goNoGo, String(sticker)).not.toBe("GO");
      expect(result.goNoGo, String(sticker)).not.toBe("NO-GO");
    }
  });

  it("discards a caller benchmark that copies the asking price even when the model extracted an MSRP", () => {
    const fields = camry(45000, 70, 28700);
    const copied = {
      status: "verified" as const,
      source: "copied-from-quote",
      low: 45000,
      high: 45000,
      reason: "This copies the asking price and must be ignored.",
    };
    expect(benchmarkCopiesSubmittedPrice(copied, 45000, 46470)).toBe(true);
    const result = applyRuleEngine(llm, fields, null, "cash", null, {
      stateData,
      marketBenchmark: copied,
    });
    expect(result.goNoGo).toBe("INSUFFICIENT-INFORMATION");
    expect(result.marketBenchmark?.status).toBe("unverified");
    expect(result.marketBenchmark?.high).toBeNull();
  });

  it("uses a real sticker after discarding a benchmark copied from the quote", () => {
    const fields = camry(45000, 70, 45000);
    const result = applyRuleEngine(llm, fields, null, "cash", null, {
      stateData,
      buyerWindowStickerMsrp: CA_MSRP,
      marketBenchmark: {
        status: "verified",
        source: "copied-from-quote",
        low: 45000,
        high: 45000,
        reason: "Copied asking price.",
      },
    });
    expect(result.goNoGo).toBe("NO-GO");
    expect(result.marketBenchmark?.source).toBe("buyer_window_sticker_msrp");
    expect(result.marketBenchmark?.high).toBe(CA_MSRP);
  });

  it("accepts an optional factory MSRP on the analyze request and rejects a bad one", () => {
    const omitted = analysisRequestSchema.safeParse({ dealerText: "Selling price $28,000." });
    expect(omitted.success).toBe(true);
    const present = analysisRequestSchema.safeParse({
      dealerText: "Selling price $28,000.",
      factoryWindowStickerMsrp: 28700,
    });
    expect(present.success).toBe(true);
    if (present.success) expect(present.data.factoryWindowStickerMsrp).toBe(28700);
    const empty = analysisRequestSchema.safeParse({
      dealerText: "Selling price $28,000.",
      factoryWindowStickerMsrp: null,
    });
    expect(empty.success).toBe(true);
    for (const bad of [-1, 0, 50, Number.NaN, Number.POSITIVE_INFINITY]) {
      const parsed = analysisRequestSchema.safeParse({
        dealerText: "Selling price $28,000.",
        factoryWindowStickerMsrp: bad,
      });
      expect(parsed.success, String(bad)).toBe(false);
    }
  });
});
