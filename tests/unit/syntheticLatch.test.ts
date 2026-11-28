import { describe, expect, it, beforeEach } from "vitest";
import { freezeSyntheticSubmission } from "../../shared/syntheticSubmission.js";
import {
  holdSyntheticSubmission,
  latchedSyntheticSubmission,
  resetSyntheticLatchForTests,
  syntheticTelemetrySuppressed,
} from "../../client/src/lib/syntheticLatch.js";

describe("synthetic status survives mutation callbacks", () => {
  beforeEach(() => {
    resetSyntheticLatchForTests();
  });

  it("freezes the decision so a success or error callback cannot clear it", () => {
    const frozen = freezeSyntheticSubmission({
      dealerText: "ODIGOS_SYNTHETIC_QA selling price $28,000",
      competingQuoteText: "",
    });
    expect(frozen.synthetic).toBe(true);
    expect(Object.isFrozen(frozen)).toBe(true);
    expect(() => {
      (frozen as { synthetic: boolean }).synthetic = false;
    }).toThrow(TypeError);
    expect(frozen.synthetic).toBe(true);
  });

  it("keeps the first decision across a retry that rewrites the quote", () => {
    const first = holdSyntheticSubmission(null, {
      dealerText: "ODIGOS_SYNTHETIC_QA selling price $28,000",
      competingQuoteText: "second pencil",
    });
    const retry = holdSyntheticSubmission(first, {
      synthetic: false,
      dealerText: "Selling price $28,000",
      competingQuoteText: "",
    });
    expect(retry).toBe(first);
    expect(retry.synthetic).toBe(true);
    expect(retry.dealerText).toContain("ODIGOS_SYNTHETIC_QA");
    expect(syntheticTelemetrySuppressed()).toBe(true);
    expect(latchedSyntheticSubmission()).toBe(first);
  });

  it("allows telemetry again after a later real submission", () => {
    holdSyntheticSubmission(null, { dealerText: "ODIGOS_SYNTHETIC_QA" });
    expect(syntheticTelemetrySuppressed()).toBe(true);
    const real = holdSyntheticSubmission(null, { dealerText: "Selling price $28,000. Doc fee $70." });
    expect(real.synthetic).toBe(false);
    expect(syntheticTelemetrySuppressed()).toBe(false);
  });
});
