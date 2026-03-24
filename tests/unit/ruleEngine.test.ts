import { describe, it, expect } from "vitest";
import { applyRuleEngine, checkDocFeeCap } from "../../server/ruleEngine";
import type { AnalysisResponse, DetectedFields, Fee } from "../../shared/schema";

const makeFields = (overrides: Partial<DetectedFields> = {}): DetectedFields => ({
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
  ...overrides,
});

const makeLlm = (overrides: Partial<AnalysisResponse> = {}): AnalysisResponse => ({
  dealScore: "YELLOW",
  confidenceLevel: "MEDIUM",
  verdictLabel: "PAUSE — GET OTD BREAKDOWN",
  goNoGo: "NEED-MORE-INFO",
  summary: "Test summary",
  detectedFields: makeFields(),
  missingInfo: [],
  suggestedReply: "Test reply",
  reasoning: "Test reasoning",
  ...overrides,
});

// ─── checkDocFeeCap ────────────────────────────────────────────────────────────

describe("checkDocFeeCap", () => {
  const CA_STATE = { docFeeCap: true, docFeeCapAmount: 85 };
  const NO_CAP_STATE = { docFeeCap: false, docFeeCapAmount: null };

  it("returns null when state has no doc fee cap", () => {
    const fees: Fee[] = [{ name: "Doc Fee", amount: 999 }];
    expect(checkDocFeeCap(fees, NO_CAP_STATE)).toBeNull();
  });

  it("returns null when no doc fee is detected in fees list", () => {
    const fees: Fee[] = [{ name: "Tax", amount: 200 }];
    expect(checkDocFeeCap(fees, CA_STATE)).toBeNull();
  });

  it("detects violation when doc fee exceeds CA cap of $85", () => {
    const fees: Fee[] = [{ name: "documentation fee", amount: 150 }];
    const result = checkDocFeeCap(fees, CA_STATE);
    expect(result).not.toBeNull();
    expect(result!.violated).toBe(true);
    expect(result!.capAmount).toBe(85);
    expect(result!.chargedAmount).toBe(150);
    expect(result!.overage).toBe(65);
  });

  it("does not flag a violation when doc fee is at or below cap", () => {
    const fees: Fee[] = [{ name: "doc fee", amount: 85 }];
    const result = checkDocFeeCap(fees, CA_STATE);
    expect(result).not.toBeNull();
    expect(result!.violated).toBe(false);
    expect(result!.overage).toBe(0);
  });

  it("picks the maximum doc fee when multiple matching fees exist", () => {
    const fees: Fee[] = [
      { name: "doc fee", amount: 60 },
      { name: "documentation fee", amount: 120 },
    ];
    const result = checkDocFeeCap(fees, CA_STATE);
    expect(result!.chargedAmount).toBe(120);
    expect(result!.violated).toBe(true);
  });

  it("treats broad keyword 'dealer fee' as a doc fee when no exact match exists", () => {
    const fees: Fee[] = [{ name: "dealer fee", amount: 200 }];
    const result = checkDocFeeCap(fees, CA_STATE);
    expect(result!.violated).toBe(true);
  });

  it("IL cap is $378 — detects violation correctly", () => {
    const IL_STATE = { docFeeCap: true, docFeeCapAmount: 378 };
    const fees: Fee[] = [{ name: "doc fee", amount: 400 }];
    const result = checkDocFeeCap(fees, IL_STATE);
    expect(result!.violated).toBe(true);
    expect(result!.overage).toBe(22);
  });

  it("IN cap is $251 — no violation when fee is below cap", () => {
    const IN_STATE = { docFeeCap: true, docFeeCapAmount: 251 };
    const fees: Fee[] = [{ name: "doc fee", amount: 200 }];
    const result = checkDocFeeCap(fees, IN_STATE);
    expect(result!.violated).toBe(false);
  });
});

// ─── applyRuleEngine ──────────────────────────────────────────────────────────

describe("applyRuleEngine", () => {
  it("returns RED/NO-GO immediately when doc fee cap is violated", () => {
    const capResult = { violated: true, capAmount: 85, chargedAmount: 300, overage: 215 };
    const result = applyRuleEngine(makeLlm(), makeFields(), capResult);
    expect(result.dealScore).toBe("RED");
    expect(result.goNoGo).toBe("NO-GO");
    expect(result.verdictLabel).toMatch(/DOC FEE/i);
  });

  it("returns RED when market adjustment is present", () => {
    const fees: Fee[] = [{ name: "Market Adjustment", amount: 3000 }];
    const result = applyRuleEngine(makeLlm(), makeFields({ fees }));
    expect(result.dealScore).toBe("RED");
    expect(result.goNoGo).toBe("NO-GO");
  });

  it("returns RED when market adjustment AND 2+ high-cost add-ons", () => {
    const fees: Fee[] = [
      { name: "market adjustment", amount: 2000 },
      { name: "protection package", amount: 600 },
      { name: "gap insurance", amount: 800 },
    ];
    const result = applyRuleEngine(makeLlm(), makeFields({ fees }));
    expect(result.dealScore).toBe("RED");
    expect(result.goNoGo).toBe("NO-GO");
  });

  it("returns RED when 2+ high-cost add-ons (>= $500 each)", () => {
    const fees: Fee[] = [
      { name: "paint protection", amount: 500 },
      { name: "gap insurance", amount: 700 },
    ];
    const result = applyRuleEngine(makeLlm(), makeFields({ fees }));
    expect(result.dealScore).toBe("RED");
    expect(result.goNoGo).toBe("NO-GO");
    expect(result.verdictLabel).toMatch(/ADD-ON/i);
  });

  it("returns YELLOW when exactly 1 high-cost add-on", () => {
    const fees: Fee[] = [{ name: "extended warranty", amount: 800 }];
    const result = applyRuleEngine(makeLlm(), makeFields({ fees }));
    expect(result.dealScore).toBe("YELLOW");
    expect(result.goNoGo).toBe("NEED-MORE-INFO");
  });

  it("returns YELLOW when payment-only quote (no sale price, no OTD)", () => {
    const fields = makeFields({ monthlyPayment: 450 });
    const result = applyRuleEngine(makeLlm(), fields);
    expect(result.dealScore).toBe("YELLOW");
    expect(result.goNoGo).toBe("NEED-MORE-INFO");
    expect(result.verdictLabel).toMatch(/OTD/i);
  });

  it("returns YELLOW when OTD is missing", () => {
    const fields = makeFields({ salePrice: 30000 });
    const result = applyRuleEngine(makeLlm(), fields);
    expect(result.dealScore).toBe("YELLOW");
  });

  it("returns GREEN/HIGH when OTD + APR + term present, no vague fees", () => {
    const fields = makeFields({
      outTheDoorPrice: 35000,
      apr: 4.9,
      termMonths: 60,
      salePrice: 32000,
      fees: [{ name: "Tax", amount: 2000 }],
    });
    const result = applyRuleEngine(makeLlm(), fields);
    expect(result.dealScore).toBe("GREEN");
    expect(result.goNoGo).toBe("GO");
  });

  it("returns GREEN/MEDIUM when OTD + APR + term but no MSRP/sale price", () => {
    const fields = makeFields({
      outTheDoorPrice: 35000,
      apr: 3.9,
      termMonths: 72,
    });
    const result = applyRuleEngine(makeLlm(), fields);
    expect(result.dealScore).toBe("GREEN");
    expect(result.goNoGo).toBe("GO");
  });

  it("returns YELLOW when OTD present but vague fees detected", () => {
    const fields = makeFields({
      outTheDoorPrice: 35000,
      fees: [{ name: "dealer fee", amount: 400 }],
    });
    const result = applyRuleEngine(makeLlm(), fields);
    expect(result.dealScore).toBe("YELLOW");
    expect(result.goNoGo).toBe("NEED-MORE-INFO");
  });

  it("returns GREEN/MEDIUM when OTD present and no red flags", () => {
    const fields = makeFields({
      outTheDoorPrice: 28000,
      fees: [{ name: "Title Fee", amount: 150 }],
    });
    const result = applyRuleEngine(makeLlm(), fields);
    expect(result.dealScore).toBe("GREEN");
  });

  it("rule engine takes precedence over LLM — LLM RED is overridden to YELLOW when only rule is 'no OTD'", () => {
    const llm = makeLlm({ dealScore: "RED", goNoGo: "NO-GO" });
    const fields = makeFields({ salePrice: 30000 });
    const result = applyRuleEngine(llm, fields);
    expect(result.dealScore).toBe("YELLOW");
    expect(result.goNoGo).toBe("NEED-MORE-INFO");
  });
});
