import { describe, expect, it } from "vitest";
import { classifyDocFee } from "../../server/regulatoryClassification.js";
import { applyRuleEngine } from "../../server/ruleEngine.js";
import { getStateFeeData } from "../../server/stateFeeLookup.js";
import dataset from "../../data/state_fees.json" with { type: "json" };
import type { AnalysisResponse, DetectedFields } from "../../shared/schema.js";

describe("California document processing charge", () => {
  const ca = getStateFeeData("CA")!;

  it("stores both statutory ceilings from the fetched statute", () => {
    const conditions = dataset.states.CA.docFeeConditions;
    expect(conditions.map((item) => item.maxAmount)).toEqual([85, 70]);
    expect(conditions[0].effectiveDate).toBe("2019-01-01");
    expect(conditions[0].officialSource).toContain("leginfo.legislature.ca.gov");
    expect(conditions[0].statutoryReference).toContain("4456.5");
    expect(conditions.every((item) => item.lastVerificationDate === "2026-11-27")).toBe(true);
  });

  it("treats $85 as conditional when partner status is unknown", () => {
    const result = classifyDocFee([{ name: "doc fee", amount: 85 }], ca, null);
    expect(result.classification).toBe("potentially_noncompliant");
    expect(result.hardCeiling).toBe(85);
    expect(result.conditionalCeiling).toBe(70);
  });

  it("allows $85 only when the partner agreement is confirmed", () => {
    expect(classifyDocFee([{ name: "doc fee", amount: 85 }], ca, true).classification).toBe("permissible");
    expect(classifyDocFee([{ name: "doc fee", amount: 80 }], ca, false).classification).toBe("illegal");
  });

  it("treats $70 as permissible and anything above $85 as illegal", () => {
    expect(classifyDocFee([{ name: "documentation fee", amount: 70 }], ca, null).classification).toBe("permissible");
    expect(classifyDocFee([{ name: "documentation fee", amount: 85.01 }], ca, true).classification).toBe("illegal");
    expect(classifyDocFee([{ name: "documentation fee", amount: 199 }], ca, null).classification).toBe("illegal");
  });

  it("does not call an unverified stored cap a legal violation", () => {
    const il = getStateFeeData("IL")!;
    const result = classifyDocFee([{ name: "processing fee", amount: 400 }], il, null);
    expect(result.classification).toBe("needs_source");
    expect(result.exceedsStoredCap).toBe(true);
    expect(result.statutoryReference).toBe("needs_source");
    expect(result.summary.toLowerCase()).not.toContain("illegal");
  });
});

describe("Oregon document processing fee", () => {
  const or = getStateFeeData("OR")!;

  it("stores both statutory ceilings from the fetched statute", () => {
    const conditions = dataset.states.OR.docFeeConditions;
    expect(conditions.map((item) => item.maxAmount)).toEqual([250, 200]);
    expect(conditions[0].officialSource).toContain("oregonlegislature.gov");
    expect(conditions[0].statutoryReference).toContain("822.043");
    expect(conditions[0].effectiveDate).toBeNull();
    expect(conditions.every((item) => item.lastVerificationDate === "2026-11-27")).toBe(true);
  });

  it("treats $200 as permissible and $201–$250 as conditional when integrator status is unknown", () => {
    expect(classifyDocFee([{ name: "doc fee", amount: 200 }], or, null, null).classification).toBe("permissible");
    const conditional = classifyDocFee([{ name: "document processing fee", amount: 225 }], or, null, null);
    expect(conditional.classification).toBe("potentially_noncompliant");
    expect(conditional.hardCeiling).toBe(250);
    expect(conditional.conditionalCeiling).toBe(200);
    expect(conditional.officialSource).toContain("oregonlegislature.gov");
    expect(conditional.lastVerificationDate).toBe("2026-11-27");
    expect(classifyDocFee([{ name: "doc fee", amount: 250 }], or, null, null).classification).toBe("potentially_noncompliant");
  });

  it("allows $250 only when integrator use is confirmed", () => {
    expect(classifyDocFee([{ name: "doc fee", amount: 250 }], or, null, true).classification).toBe("permissible");
    expect(classifyDocFee([{ name: "doc fee", amount: 201 }], or, null, false).classification).toBe("illegal");
    expect(classifyDocFee([{ name: "doc fee", amount: 200 }], or, null, false).classification).toBe("permissible");
  });

  it("treats a fee above $250 as a violation", () => {
    const result = classifyDocFee([{ name: "documentation fee", amount: 250.01 }], or, null, true);
    expect(result.classification).toBe("illegal");
    expect(result.summary.toLowerCase()).not.toMatch(/not a legal violation/);
    expect(classifyDocFee([{ name: "documentation fee", amount: 275 }], or, null, null).classification).toBe("illegal");
  });

  it("asks the buyer to verify integrator status instead of approving $250", () => {
    const fields = {
      salePrice: 32000,
      outTheDoorPrice: 36000,
      fees: [{ name: "document processing fee", amount: 225 }],
    } as DetectedFields;
    const llm = {
      dealScore: "GREEN",
      confidenceLevel: "MEDIUM",
      verdictLabel: "PROCEED",
      goNoGo: "GO",
      summary: "fixture",
      detectedFields: fields,
      missingInfo: [],
      suggestedReply: "fixture",
      reasoning: "fixture",
    } as AnalysisResponse;
    const result = applyRuleEngine(llm, fields, null, "cash", null, { stateData: or });
    expect(result.goNoGo).toBe("PROCEED-WITH-CAUTION");
    expect(result.verdictLabel.toUpperCase()).toContain("CONDITIONAL DOC FEE");
    expect(result.suggestedReply).toMatch(/integrator/i);
    expect(result.suggestedReply).not.toMatch(/1685/);
    expect(result.suggestedReply?.toLowerCase()).not.toContain("illegal");
  });
});

describe("caps checked against a fetched government page", () => {
  it("enforces the New York, Arkansas, and Michigan dollar ceilings", () => {
    const ny = getStateFeeData("NY")!;
    const ar = getStateFeeData("AR")!;
    const mi = getStateFeeData("MI")!;
    expect(classifyDocFee([{ name: "doc fee", amount: 175 }], ny).classification).toBe("permissible");
    expect(classifyDocFee([{ name: "doc fee", amount: 175.01 }], ny).classification).toBe("illegal");
    expect(classifyDocFee([{ name: "doc fee", amount: 129 }], ar).classification).toBe("permissible");
    expect(classifyDocFee([{ name: "doc fee", amount: 130 }], ar).classification).toBe("illegal");
    expect(classifyDocFee([{ name: "documentary preparation fee", amount: 280 }], mi).classification).toBe("permissible");
    expect(classifyDocFee([{ name: "doc fee", amount: 281 }], mi).classification).toBe("illegal");
  });

  it("never labels a still-unverified cap illegal", () => {
    for (const [code, state] of Object.entries(dataset.states)) {
      const capUnverified =
        state.source_status === "needs_source" || (state.unverified_fields ?? []).includes("docFeeCapAmount");
      if (!capUnverified || code === "CA" || code === "OR") continue;
      const charged = (state.docFeeCapAmount ?? 1000) + 500;
      const result = classifyDocFee([{ name: "doc fee", amount: charged }], getStateFeeData(code)!);
      expect(result.classification, code).not.toBe("illegal");
      expect(result.summary.toLowerCase(), code).not.toContain("illegal");
    }
  });
});
