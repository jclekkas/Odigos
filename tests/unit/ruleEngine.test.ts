import { describe, it, expect } from "vitest";
import { applyRuleEngine, checkDocFeeCap } from "../../server/ruleEngine.js";
import type { AnalysisResponse, DetectedFields, Fee } from "../../shared/schema.js";

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
  moneyFactor: null,
  residualValue: null,
  residualPercent: null,
  acquisitionFee: null,
  dispositionFee: null,
  mileageAllowance: null,
  excessMileageRate: null,
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
  const CA_STATE = { docFeeCap: true, docFeeCapAmount: 85, name: "California", abbreviation: "CA", statuteCitation: "CA Vehicle Code § 11713.1(i)" };
  const NO_CAP_STATE = { docFeeCap: false, docFeeCapAmount: null, name: "Alabama", abbreviation: "AL", statuteCitation: null };

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
    expect(result!.stateName).toBe("California");
    expect(result!.stateAbbreviation).toBe("CA");
    expect(result!.statuteCitation).toBe("Cal. Veh. Code § 4456.5");
  });

  it("does not flag a violation when doc fee is at or below cap", () => {
    const fees: Fee[] = [{ name: "doc fee", amount: 85 }];
    const result = checkDocFeeCap(fees, CA_STATE);
    expect(result).not.toBeNull();
    expect(result!.violated).toBe(false);
    expect(result!.overage).toBe(0);
    expect(result!.stateName).toBe("California");
    expect(result!.statuteCitation).toBe("Cal. Veh. Code § 4456.5");
  });

  it("sums distinct doc-fee lines and does not count the same line twice", () => {
    const fees: Fee[] = [
      { name: "doc fee", amount: 60 },
      { name: "documentation fee", amount: 120 },
      { name: ". Doc fee", amount: 60 },
    ];
    const result = checkDocFeeCap(fees, CA_STATE);
    expect(result!.chargedAmount).toBe(180);
    expect(result!.violated).toBe(true);
    expect(result!.overage).toBe(95);
  });

  it("does not add a separate title or registration fee to the documentation charge", () => {
    const fees: Fee[] = [
      { name: "doc fee", amount: 60 },
      { name: "title fee", amount: 60 },
      { name: "registration fee", amount: 90 },
    ];
    const result = checkDocFeeCap(fees, CA_STATE);
    expect(result!.chargedAmount).toBe(60);
    expect(result!.violated).toBe(false);
  });

  it("does not treat an uncited stored figure as a legal violation", () => {
    const TX_STATE = { docFeeCap: true, docFeeCapAmount: 225, name: "Texas", abbreviation: "TX", statuteCitation: null };
    const fees: Fee[] = [{ name: "doc fee", amount: 300 }];
    expect(checkDocFeeCap(fees, TX_STATE)).toBeNull();
  });

  it("treats broad keyword 'dealer fee' as a doc fee when no exact match exists", () => {
    const fees: Fee[] = [{ name: "dealer fee", amount: 200 }];
    const result = checkDocFeeCap(fees, CA_STATE);
    expect(result!.violated).toBe(true);
  });

  it("does not call an unverified Illinois figure a legal violation", () => {
    const IL_STATE = { docFeeCap: true, docFeeCapAmount: 378, name: "Illinois", abbreviation: "IL", statuteCitation: "815 ILCS 306/1" };
    const fees: Fee[] = [{ name: "doc fee", amount: 400 }];
    expect(checkDocFeeCap(fees, IL_STATE)).toBeNull();
  });

  it("does not report a cap result for an unverified Indiana figure", () => {
    const IN_STATE = { docFeeCap: true, docFeeCapAmount: 251, name: "Indiana", abbreviation: "IN", statuteCitation: "IC 9-23-3-7" };
    const fees: Fee[] = [{ name: "doc fee", amount: 200 }];
    expect(checkDocFeeCap(fees, IN_STATE)).toBeNull();
  });
});

// ─── applyRuleEngine ──────────────────────────────────────────────────────────

describe("applyRuleEngine", () => {
  it("returns RED/NO-GO immediately when a verified doc fee cap is exceeded", () => {
    const fields = makeFields({ fees: [{ name: "doc fee", amount: 199 }] });
    const result = applyRuleEngine(makeLlm(), fields, null, "cash", null, {
      stateData: { name: "California", abbreviation: "CA", docFeeCap: true, docFeeCapAmount: 85 },
      asOf: "2026-11-27",
    });
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
    expect(result.goNoGo).toBe("PROCEED-WITH-CAUTION");
  });

  it("returns YELLOW when payment-only quote (no sale price, no OTD)", () => {
    const fields = makeFields({ monthlyPayment: 450 });
    const result = applyRuleEngine(makeLlm(), fields);
    expect(result.dealScore).toBe("YELLOW");
    expect(result.goNoGo).toBe("INSUFFICIENT-INFORMATION");
    expect(result.verdictLabel).toMatch(/OTD/i);
  });

  it("returns YELLOW when OTD is missing", () => {
    const fields = makeFields({ salePrice: 30000 });
    const result = applyRuleEngine(makeLlm(), fields);
    expect(result.dealScore).toBe("YELLOW");
  });

  it("does not approve a reconciled quote when market value is unverified", () => {
    // 32000 + 2000 tax = 34000, which is the stated out-the-door price.
    const fields = makeFields({
      outTheDoorPrice: 34000,
      apr: 4.9,
      termMonths: 60,
      salePrice: 32000,
      fees: [{ name: "Tax", amount: 2000 }],
    });
    const result = applyRuleEngine(makeLlm(), fields);
    expect(result.dealScore).toBe("YELLOW");
    expect(result.goNoGo).toBe("INSUFFICIENT-INFORMATION");
    expect(result.verdictLabel).toMatch(/MARKET VALUE NOT VERIFIED/i);
    expect(result.summary).toMatch(/year, make, and model/i);
    expect(result.marketBenchmark?.low).toBeNull();
  });

  it("does not call a quote clean when the out-the-door price leaves $1,000 unexplained", () => {
    const fields = makeFields({
      outTheDoorPrice: 35000,
      apr: 4.9,
      termMonths: 60,
      salePrice: 32000,
      fees: [{ name: "Tax", amount: 2000 }],
    });
    const result = applyRuleEngine(makeLlm(), fields);
    expect(result.dealScore).toBe("YELLOW");
    expect(result.verdictLabel).toMatch(/DOESN'T ADD UP/i);
  });

  it("does not approve an out-the-door quote that has no selling price", () => {
    const fields = makeFields({
      outTheDoorPrice: 35000,
      apr: 3.9,
      termMonths: 72,
    });
    const result = applyRuleEngine(makeLlm(), fields);
    expect(result.goNoGo).not.toBe("GO");
    expect(result.dealScore).not.toBe("GREEN");
  });

  it("returns YELLOW when OTD present but vague fees detected", () => {
    const fields = makeFields({
      outTheDoorPrice: 35000,
      fees: [{ name: "dealer fee", amount: 400 }],
    });
    const result = applyRuleEngine(makeLlm(), fields);
    expect(result.dealScore).toBe("YELLOW");
    expect(result.goNoGo).toBe("PROCEED-WITH-CAUTION");
  });

  it("does not call a title-only quote a clean approval", () => {
    const fields = makeFields({
      outTheDoorPrice: 28000,
      fees: [{ name: "Title Fee", amount: 150 }],
    });
    const result = applyRuleEngine(makeLlm(), fields);
    expect(result.goNoGo).toBe("INSUFFICIENT-INFORMATION");
  });

  it("rule engine takes precedence over LLM — LLM RED is overridden to YELLOW when only rule is 'no OTD'", () => {
    const llm = makeLlm({ dealScore: "RED", goNoGo: "NO-GO" });
    const fields = makeFields({ salePrice: 30000 });
    const result = applyRuleEngine(llm, fields);
    expect(result.dealScore).toBe("YELLOW");
    expect(result.goNoGo).toBe("INSUFFICIENT-INFORMATION");
  });
});

// ─── CPI-indexed cap tracking ─────────────────────────────────────────────────

describe("checkDocFeeCap delegates to the classifier", () => {
  it("does not treat an unverified CPI figure as a legal cap", () => {
    const IL_STATE_CPI = {
      docFeeCap: true,
      docFeeCapAmount: 300,
      name: "Illinois",
      abbreviation: "IL",
      statuteCitation: "815 ILCS 306/1",
      cpiIndexing: { isIndexed: true, currentAmount: 378 },
    };
    expect(checkDocFeeCap([{ name: "doc fee", amount: 400 }], IL_STATE_CPI)).toBeNull();
  });

  it("uses California's verified ceiling rather than a caller-supplied citation", () => {
    const CA_STATE = { docFeeCap: true, docFeeCapAmount: 85, name: "California", abbreviation: "CA", statuteCitation: "CA Vehicle Code § 11713.1(i)" };
    const result = checkDocFeeCap([{ name: "doc fee", amount: 100 }], CA_STATE);
    expect(result!.violated).toBe(true);
    expect(result!.capAmount).toBe(85);
    expect(result!.statuteCitation).toBe("Cal. Veh. Code § 4456.5");
  });

  it("does not turn an uncited Washington figure into a violation", () => {
    const STATE = {
      docFeeCap: true,
      docFeeCapAmount: 200,
      name: "Washington",
      abbreviation: "WA",
      statuteCitation: "RCW 46.70.180",
      cpiIndexing: { isIndexed: false, currentAmount: 999 },
    };
    expect(checkDocFeeCap([{ name: "doc fee", amount: 250 }], STATE)).toBeNull();
  });
});

// ─── Lease-specific rules ─────────────────────────────────────────────────────

describe("applyRuleEngine — lease-specific rules", () => {
  it("does not treat an unsourced acquisition-fee level as a verdict", () => {
    const fields = makeFields({
      outTheDoorPrice: 30000,
      acquisitionFee: 1200,
      moneyFactor: 0.00125,
      residualValue: 18000,
      mileageAllowance: 12000,
      termMonths: 36,
    });
    const result = applyRuleEngine(makeLlm(), fields, null, "lease");
    expect(result.verdictLabel).not.toMatch(/ACQUISITION|MARKUP/i);
    expect(result.goNoGo).toBe("INSUFFICIENT-INFORMATION");
    expect(result.dealScore).not.toBe("GREEN");
  });

  it("does not treat an unsourced excess-mileage cutoff as a verdict", () => {
    const fields = makeFields({
      outTheDoorPrice: 30000,
      moneyFactor: 0.00125,
      residualValue: 18000,
      mileageAllowance: 10000,
      excessMileageRate: 0.35,
      termMonths: 36,
    });
    const result = applyRuleEngine(makeLlm(), fields, null, "lease");
    expect(result.verdictLabel).not.toMatch(/MILEAGE PENALTY/i);
    expect(result.goNoGo).toBe("INSUFFICIENT-INFORMATION");
    expect(result.dealScore).not.toBe("GREEN");
  });

  it("returns YELLOW/PAUSE when lease is missing key terms (money factor, residual, mileage)", () => {
    const fields = makeFields({ monthlyPayment: 350 });
    const result = applyRuleEngine(makeLlm(), fields, null, "lease");
    expect(result.dealScore).toBe("YELLOW");
    expect(result.goNoGo).toBe("INSUFFICIENT-INFORMATION");
    expect(result.verdictLabel).toMatch(/LEASE TERMS/i);
  });

  it("does not apply lease rules when purchaseType is not lease", () => {
    const fields = makeFields({ monthlyPayment: 350 });
    const result = applyRuleEngine(makeLlm(), fields, null, "finance");
    // Should hit payment-only rule, not lease rule
    expect(result.verdictLabel).toMatch(/OTD/i);
  });

  it("detects lease from fields even when purchaseType is unknown", () => {
    const fields = makeFields({
      moneyFactor: 0.00125,
      // missing residual and mileage
    });
    const result = applyRuleEngine(makeLlm(), fields, null, "unknown");
    expect(result.dealScore).toBe("YELLOW");
    expect(result.verdictLabel).toMatch(/LEASE TERMS/i);
  });

  it("does not flag acquisition fee at $995 (below threshold)", () => {
    const fields = makeFields({
      outTheDoorPrice: 30000,
      acquisitionFee: 995,
      moneyFactor: 0.00125,
      residualValue: 18000,
      mileageAllowance: 12000,
    });
    const result = applyRuleEngine(makeLlm(), fields, null, "lease");
    expect(result.goNoGo).toBe("INSUFFICIENT-INFORMATION");
    expect(result.dealScore).not.toBe("GREEN");
  });

  it("does not flag mileage rate at $0.25 (below threshold)", () => {
    const fields = makeFields({
      outTheDoorPrice: 30000,
      moneyFactor: 0.00125,
      residualValue: 18000,
      mileageAllowance: 12000,
      excessMileageRate: 0.25,
    });
    const result = applyRuleEngine(makeLlm(), fields, null, "lease");
    expect(result.goNoGo).toBe("INSUFFICIENT-INFORMATION");
    expect(result.dealScore).not.toBe("GREEN");
  });

  it("doc fee cap violation still takes priority over lease rules", () => {
    const fields = makeFields({
      acquisitionFee: 1500,
      fees: [{ name: "doc fee", amount: 300 }],
    });
    const result = applyRuleEngine(makeLlm(), fields, null, "lease", null, {
      stateData: { name: "California", abbreviation: "CA", docFeeCap: true, docFeeCapAmount: 85 },
      asOf: "2026-11-27",
    });
    expect(result.dealScore).toBe("RED");
    expect(result.verdictLabel).toMatch(/DOC FEE/i);
  });

  it("missing lease terms outrank an unsourced acquisition-fee level", () => {
    const fields = makeFields({ acquisitionFee: 1200 });
    const result = applyRuleEngine(makeLlm(), fields, null, "lease");
    expect(result.verdictLabel).toMatch(/LEASE TERMS/i);
    expect(result.goNoGo).not.toBe("GO");
  });
});

// ─── New junk fee keywords ────────────────────────────────────────────────────

describe("applyRuleEngine — expanded junk fee keywords", () => {
  it("detects dealer prep as a high-cost add-on", () => {
    const fees: Fee[] = [
      { name: "Dealer Prep Fee", amount: 600 },
      { name: "Reconditioning Fee", amount: 700 },
    ];
    const result = applyRuleEngine(makeLlm(), makeFields({ fees }));
    expect(result.dealScore).toBe("RED");
    expect(result.goNoGo).toBe("NO-GO");
  });

  it("detects anti-theft package as a vague fee", () => {
    const fees: Fee[] = [{ name: "Anti-Theft Package", amount: 400 }];
    const result = applyRuleEngine(makeLlm(), makeFields({ outTheDoorPrice: 30000, fees }));
    expect(result.dealScore).toBe("YELLOW");
  });

  it("detects VIN etch as a vague fee", () => {
    const fees: Fee[] = [{ name: "VIN Etch", amount: 350 }];
    const result = applyRuleEngine(makeLlm(), makeFields({ outTheDoorPrice: 30000, fees }));
    expect(result.dealScore).toBe("YELLOW");
  });
});
