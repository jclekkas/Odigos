import { describe, it, expect } from "vitest";
import { rankSignals, type SignalRankerContext, type RankedSignal } from "../../server/signalRanker";

// ---------------------------------------------------------------------------
// Helpers to build minimal context objects
// ---------------------------------------------------------------------------

function baseContext(overrides: Partial<SignalRankerContext> = {}): SignalRankerContext {
  return {
    docFeeCapCheck: null,
    detectedFields: {
      salePrice: 35000,
      msrp: 36000,
      rebates: null,
      fees: [],
      outTheDoorPrice: 37000,
      monthlyPayment: null,
      tradeInValue: null,
      apr: 4.9,
      termMonths: 60,
      downPayment: null,
    },
    marketContext: null,
    ruleEngineResult: {
      dealScore: "GREEN",
      confidenceLevel: "HIGH",
      verdictLabel: "GO — TERMS LOOK CLEAN",
      goNoGo: "GO",
    },
    leaseMath: null,
    missingInfo: [],
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("rankSignals", () => {
  it("returns empty array when no signals apply", () => {
    const signals = rankSignals(baseContext());
    expect(signals).toEqual([]);
  });

  it("produces a legal signal when doc fee cap is violated", () => {
    const signals = rankSignals(
      baseContext({
        docFeeCapCheck: {
          violated: true,
          capAmount: 250,
          chargedAmount: 800,
          overage: 550,
          stateName: "Colorado",
          stateAbbreviation: "CO",
          statuteCitation: "C.R.S. § 42-10-101",
        },
      }),
    );
    expect(signals.length).toBeGreaterThanOrEqual(1);
    expect(signals[0].category).toBe("legal");
    expect(signals[0].priority).toBe(1);
    expect(signals[0].severity).toBe("critical");
    expect(signals[0].action).toContain("$250");
  });

  it("legal signal always sorts before all other signal types", () => {
    const signals = rankSignals(
      baseContext({
        docFeeCapCheck: {
          violated: true,
          capAmount: 250,
          chargedAmount: 800,
          overage: 550,
          stateName: "Colorado",
          stateAbbreviation: "CO",
          statuteCitation: null,
        },
        detectedFields: {
          salePrice: null,
          msrp: null,
          rebates: null,
          fees: [{ name: "Market Adjustment", amount: 3000 }],
          outTheDoorPrice: null,
          monthlyPayment: 500,
          tradeInValue: null,
          apr: null,
          termMonths: null,
          downPayment: null,
        },
        marketContext: {
          stateCode: "CO",
          stateTotalAnalyses: 50,
          stateAvgDealScore: 55,
          stateAvgDocFee: 200,
          docFeeVsStateAvg: 600,
          dealerAnalysisCount: 5,
          dealerAvgDealScore: 30,
          stateStrength: "strong",
          dealerStrength: "moderate",
          overallStrength: "strong",
        },
      }),
    );
    expect(signals[0].category).toBe("legal");
    expect(signals[0].priority).toBe(1);
    // Subsequent signals should have higher priority numbers
    for (let i = 1; i < signals.length; i++) {
      expect(signals[i].priority).toBeGreaterThanOrEqual(signals[0].priority);
    }
  });

  it("dealer pattern signal requires >= 3 analyses and avg score < 40", () => {
    // Should produce a dealer pattern signal
    const signals = rankSignals(
      baseContext({
        marketContext: {
          stateCode: "TX",
          stateTotalAnalyses: 20,
          stateAvgDealScore: 55,
          stateAvgDocFee: 150,
          docFeeVsStateAvg: null,
          dealerAnalysisCount: 5,
          dealerAvgDealScore: 30,
          dealerStrength: "moderate",
          stateStrength: "strong",
          overallStrength: "strong",
        },
      }),
    );
    const dealerSignal = signals.find((s) => s.category === "dealer_pattern");
    expect(dealerSignal).toBeDefined();
    expect(dealerSignal!.priority).toBe(2);
    expect(dealerSignal!.severity).toBe("warning");
  });

  it("dealer pattern signal NOT produced when avg score >= 40", () => {
    const signals = rankSignals(
      baseContext({
        marketContext: {
          stateCode: "TX",
          stateTotalAnalyses: 20,
          stateAvgDealScore: 55,
          stateAvgDocFee: 150,
          docFeeVsStateAvg: null,
          dealerAnalysisCount: 5,
          dealerAvgDealScore: 55,
          dealerStrength: "moderate",
          stateStrength: "strong",
          overallStrength: "strong",
        },
      }),
    );
    const dealerSignal = signals.find((s) => s.category === "dealer_pattern");
    expect(dealerSignal).toBeUndefined();
  });

  it("state norm signal produced when doc fee delta > $200 with strong state data", () => {
    const signals = rankSignals(
      baseContext({
        detectedFields: {
          salePrice: 35000,
          msrp: 36000,
          rebates: null,
          fees: [{ name: "Doc Fee", amount: 700 }],
          outTheDoorPrice: 37000,
          monthlyPayment: null,
          tradeInValue: null,
          apr: 4.9,
          termMonths: 60,
          downPayment: null,
        },
        marketContext: {
          stateCode: "NC",
          stateTotalAnalyses: 50,
          stateAvgDealScore: 55,
          stateAvgDocFee: 400,
          docFeeVsStateAvg: 300,
          dealerAnalysisCount: null,
          dealerAvgDealScore: null,
          stateStrength: "strong",
          overallStrength: "strong",
        },
      }),
    );
    const stateSignal = signals.find((s) => s.category === "state_norm");
    expect(stateSignal).toBeDefined();
    expect(stateSignal!.priority).toBe(3);
  });

  it("market adjustment produces a line_item signal", () => {
    const signals = rankSignals(
      baseContext({
        detectedFields: {
          salePrice: 35000,
          msrp: 36000,
          rebates: null,
          fees: [{ name: "Market Adjustment", amount: 3000 }],
          outTheDoorPrice: 40000,
          monthlyPayment: null,
          tradeInValue: null,
          apr: 4.9,
          termMonths: 60,
          downPayment: null,
        },
      }),
    );
    const lineItem = signals.find((s) => s.category === "line_item" && s.label.includes("Market adjustment"));
    expect(lineItem).toBeDefined();
    expect(lineItem!.priority).toBe(4);
    expect(lineItem!.action).toContain("market adjustment removed");
  });

  it("high-cost add-ons produce line_item signals", () => {
    const signals = rankSignals(
      baseContext({
        detectedFields: {
          salePrice: 35000,
          msrp: 36000,
          rebates: null,
          fees: [
            { name: "Protection Package", amount: 995 },
            { name: "Ceramic Coating", amount: 799 },
          ],
          outTheDoorPrice: 38000,
          monthlyPayment: null,
          tradeInValue: null,
          apr: 4.9,
          termMonths: 60,
          downPayment: null,
        },
      }),
    );
    const addOnSignal = signals.find((s) => s.category === "line_item" && s.label.includes("high-cost"));
    expect(addOnSignal).toBeDefined();
  });

  it("payment-only quote produces info_gap signal", () => {
    const signals = rankSignals(
      baseContext({
        detectedFields: {
          salePrice: null,
          msrp: null,
          rebates: null,
          fees: [],
          outTheDoorPrice: null,
          monthlyPayment: 450,
          tradeInValue: null,
          apr: null,
          termMonths: null,
          downPayment: null,
        },
      }),
    );
    const infoGap = signals.find((s) => s.category === "info_gap" && s.label.includes("Payment-only"));
    expect(infoGap).toBeDefined();
    expect(infoGap!.priority).toBe(5);
    expect(infoGap!.severity).toBe("info");
  });

  it("every signal has a non-empty action string", () => {
    const signals = rankSignals(
      baseContext({
        docFeeCapCheck: {
          violated: true,
          capAmount: 250,
          chargedAmount: 800,
          overage: 550,
          stateName: "Colorado",
          stateAbbreviation: "CO",
          statuteCitation: null,
        },
        detectedFields: {
          salePrice: null,
          msrp: null,
          rebates: null,
          fees: [
            { name: "Market Adjustment", amount: 2000 },
            { name: "Protection Package", amount: 995 },
          ],
          outTheDoorPrice: null,
          monthlyPayment: 500,
          tradeInValue: null,
          apr: null,
          termMonths: null,
          downPayment: null,
        },
        missingInfo: [
          { field: "Trade-in value", question: "What trade-in credit will you apply?" },
        ],
      }),
    );
    expect(signals.length).toBeGreaterThan(0);
    for (const signal of signals) {
      expect(signal.action.length).toBeGreaterThan(0);
      expect(signal.label.length).toBeGreaterThan(0);
      expect(signal.detail.length).toBeGreaterThan(0);
    }
  });

  it("signals are sorted by priority (ascending)", () => {
    const signals = rankSignals(
      baseContext({
        docFeeCapCheck: {
          violated: true,
          capAmount: 250,
          chargedAmount: 800,
          overage: 550,
          stateName: "Colorado",
          stateAbbreviation: "CO",
          statuteCitation: null,
        },
        detectedFields: {
          salePrice: null,
          msrp: null,
          rebates: null,
          fees: [{ name: "Market Adjustment", amount: 2000 }],
          outTheDoorPrice: null,
          monthlyPayment: 500,
          tradeInValue: null,
          apr: null,
          termMonths: null,
          downPayment: null,
        },
        marketContext: {
          stateCode: "CO",
          stateTotalAnalyses: 50,
          stateAvgDealScore: 55,
          stateAvgDocFee: 200,
          docFeeVsStateAvg: 600,
          dealerAnalysisCount: 5,
          dealerAvgDealScore: 30,
          stateStrength: "strong",
          dealerStrength: "moderate",
          overallStrength: "strong",
        },
      }),
    );
    for (let i = 1; i < signals.length; i++) {
      expect(signals[i].priority).toBeGreaterThanOrEqual(signals[i - 1].priority);
    }
  });

  it("dealer pattern sorts before state norms", () => {
    const signals = rankSignals(
      baseContext({
        detectedFields: {
          salePrice: 35000,
          msrp: 36000,
          rebates: null,
          fees: [{ name: "Doc Fee", amount: 700 }],
          outTheDoorPrice: 37000,
          monthlyPayment: null,
          tradeInValue: null,
          apr: 4.9,
          termMonths: 60,
          downPayment: null,
        },
        marketContext: {
          stateCode: "NC",
          stateTotalAnalyses: 50,
          stateAvgDealScore: 55,
          stateAvgDocFee: 400,
          docFeeVsStateAvg: 300,
          dealerAnalysisCount: 5,
          dealerAvgDealScore: 30,
          stateStrength: "strong",
          dealerStrength: "moderate",
          overallStrength: "strong",
        },
      }),
    );
    const dealerIdx = signals.findIndex((s) => s.category === "dealer_pattern");
    const stateIdx = signals.findIndex((s) => s.category === "state_norm");
    expect(dealerIdx).not.toBe(-1);
    expect(stateIdx).not.toBe(-1);
    expect(dealerIdx).toBeLessThan(stateIdx);
  });
});
