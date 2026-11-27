import { describe, expect, it } from "vitest";
import { classifyDocFee } from "../../server/regulatoryClassification.js";
import { getStateFeeData } from "../../server/stateFeeLookup.js";
import dataset from "../../data/state_fees.json" with { type: "json" };

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
    const ny = getStateFeeData("NY")!;
    const result = classifyDocFee([{ name: "processing fee", amount: 250 }], ny, null);
    expect(result.classification).toBe("needs_source");
    expect(result.exceedsStoredCap).toBe(true);
    expect(result.statutoryReference).toBe("needs_source");
    expect(result.summary.toLowerCase()).not.toContain("illegal");
  });
});
