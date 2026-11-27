import { describe, expect, it } from "vitest";
import { isSyntheticSubmission } from "../../server/syntheticGuard.js";

describe("synthetic submission guard", () => {
  it("isolates explicit QA submissions", () => {
    expect(isSyntheticSubmission({ synthetic: true, dealerText: "2025 Camry" })).toBe(true);
    expect(isSyntheticSubmission({ dealerText: "Quote ODIGOS_SYNTHETIC_QA price $28000" })).toBe(true);
  });

  it("does not treat a normal buyer quote as synthetic", () => {
    expect(isSyntheticSubmission({ synthetic: false, dealerText: "Selling price $28,000, doc fee $85" })).toBe(false);
    expect(isSyntheticSubmission({ dealerText: "Selling price $45,000" })).toBe(false);
  });
});
