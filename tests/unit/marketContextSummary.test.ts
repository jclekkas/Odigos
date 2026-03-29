import { describe, it, expect } from "vitest";
import { buildMarketContextSummary } from "../../server/services/analyzeService";
import type { MarketContext } from "@shared/schema";

function makeMarketContext(overrides: Partial<MarketContext> = {}): MarketContext {
  return {
    stateCode: "CA",
    stateTotalAnalyses: 5,
    stateAvgDealScore: 75,
    stateAvgDocFee: 300,
    docFeeVsStateAvg: null,
    dealerAnalysisCount: null,
    dealerAvgDealScore: null,
    stateSampleSize: 5,
    stateStrength: "moderate",
    dealerSampleSize: 0,
    dealerStrength: "none",
    feedbackSampleSize: 0,
    feedbackStrength: "none",
    overallStrength: "moderate",
    ...overrides,
  };
}

describe("buildMarketContextSummary", () => {
  it("returns undefined when strength is 'none'", () => {
    const mc = makeMarketContext();
    expect(buildMarketContextSummary("none", mc, "CA")).toBeUndefined();
  });

  it("returns undefined when mc is null", () => {
    expect(buildMarketContextSummary("strong", null, "CA")).toBeUndefined();
  });

  it("uses state deals when state drives overallStrength", () => {
    const mc = makeMarketContext({ stateTotalAnalyses: 5, stateStrength: "moderate" });
    const summary = buildMarketContextSummary("moderate", mc, "CA");
    expect(summary).toContain("5 similar deals");
    expect(summary).toContain("CA");
  });

  it("uses dealer quotes when dealer drives overallStrength (higher rank than state)", () => {
    const mc = makeMarketContext({
      stateSampleSize: 2,
      stateStrength: "thin",
      dealerSampleSize: 10,
      dealerStrength: "strong",
      dealerAnalysisCount: 10,
    });
    const summary = buildMarketContextSummary("strong", mc, "TX");
    expect(summary).toContain("dealer quotes");
    expect(summary).toContain("10+");
    expect(summary).toContain("TX");
    expect(summary).not.toContain("2");
  });

  it("uses feedback ratings when feedback drives overallStrength (higher rank than state/dealer)", () => {
    const mc = makeMarketContext({
      stateSampleSize: 1,
      stateStrength: "thin",
      dealerSampleSize: 3,
      dealerStrength: "moderate",
      feedbackSampleSize: 15,
      feedbackStrength: "strong",
      feedbackCount: 15,
    });
    const summary = buildMarketContextSummary("strong", mc, "FL");
    expect(summary).toContain("user feedback ratings");
    expect(summary).toContain("15+");
    expect(summary).toContain("FL");
  });

  it("produces 'strong' phrasing with 10+ for strong tier", () => {
    const mc = makeMarketContext({ stateTotalAnalyses: 20, stateStrength: "strong" });
    const summary = buildMarketContextSummary("strong", mc, "CA");
    expect(summary).toMatch(/Based on strong local data/);
    expect(summary).toContain("20+");
  });

  it("produces 'moderate' phrasing for moderate tier", () => {
    const mc = makeMarketContext({ stateTotalAnalyses: 5, stateStrength: "moderate" });
    const summary = buildMarketContextSummary("moderate", mc, "CA");
    expect(summary).toMatch(/Based on local data/);
    expect(summary).toContain("5 similar deals");
  });

  it("produces 'thin' phrasing for thin tier", () => {
    const mc = makeMarketContext({ stateTotalAnalyses: 1, stateStrength: "thin" });
    const summary = buildMarketContextSummary("thin", mc, "CA");
    expect(summary).toMatch(/Based on early deal data/);
    expect(summary).not.toMatch(/limited local data/);
    expect(summary).not.toMatch(/early signal/);
  });

  it("uses stateCode from mc when stateCode param is null", () => {
    const mc = makeMarketContext({ stateCode: "NY", stateTotalAnalyses: 3, stateStrength: "moderate" });
    const summary = buildMarketContextSummary("moderate", mc, null);
    expect(summary).toContain("NY");
  });

  describe("banned phrase regression — no user-visible limitation labels", () => {
    const BANNED = [/limited local data/i, /early signal/i, /limited — treat/i, /treat as early signal/i];

    for (const strength of ["thin", "moderate", "strong"] as const) {
      it(`strength='${strength}' produces no banned phrases in marketContextSummary payload field`, () => {
        const mc = makeMarketContext({
          stateTotalAnalyses: strength === "thin" ? 1 : strength === "moderate" ? 5 : 20,
          stateStrength: strength,
        });
        const summary = buildMarketContextSummary(strength, mc, "CA");
        if (summary === undefined) return;
        for (const pattern of BANNED) {
          expect(summary).not.toMatch(pattern);
        }
      });
    }
  });
});
