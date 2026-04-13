import { describe, it, expect } from "vitest";
import { detectStateFromText, getStateFeeData } from "../../server/stateFeeLookup.js";

// ─── getStateFeeData ──────────────────────────────────────────────────────────

describe("getStateFeeData", () => {
  it("returns data for a known state abbreviation (CA)", () => {
    const data = getStateFeeData("CA");
    expect(data).not.toBeNull();
    expect(data!.abbreviation).toBe("CA");
    expect(data!.name).toBe("California");
  });

  it("CA has a doc fee cap of $85", () => {
    const data = getStateFeeData("CA");
    expect(data!.docFeeCap).toBe(true);
    expect(data!.docFeeCapAmount).toBe(85);
  });

  it("IL has a doc fee cap of $378", () => {
    const data = getStateFeeData("IL");
    expect(data!.docFeeCap).toBe(true);
    expect(data!.docFeeCapAmount).toBe(378);
  });

  it("IN has a doc fee cap of $251", () => {
    const data = getStateFeeData("IN");
    expect(data!.docFeeCap).toBe(true);
    expect(data!.docFeeCapAmount).toBe(251);
  });

  it("AR has a doc fee cap of $129", () => {
    const data = getStateFeeData("AR");
    expect(data!.docFeeCap).toBe(true);
    expect(data!.docFeeCapAmount).toBe(129);
  });

  it("LA has a doc fee cap of $425", () => {
    const data = getStateFeeData("LA");
    expect(data!.docFeeCap).toBe(true);
    expect(data!.docFeeCapAmount).toBe(425);
  });

  it("AL does not have a doc fee cap", () => {
    const data = getStateFeeData("AL");
    expect(data!.docFeeCap).toBe(false);
  });

  it("returns null for an unknown state abbreviation", () => {
    expect(getStateFeeData("ZZ")).toBeNull();
  });

  it("returns data for FL", () => {
    const data = getStateFeeData("FL");
    expect(data).not.toBeNull();
    expect(data!.abbreviation).toBe("FL");
  });

  it("every known state entry has required fields", () => {
    const knownStates = ["CA", "TX", "FL", "NY", "WA", "CO", "GA", "MI"];
    for (const code of knownStates) {
      const data = getStateFeeData(code);
      expect(data, `missing data for ${code}`).not.toBeNull();
      expect(typeof data!.stateSalesTaxRate).toBe("number");
      expect(Array.isArray(data!.docFeeTypicalRange)).toBe(true);
    }
  });
});

// ─── detectStateFromText ──────────────────────────────────────────────────────

describe("detectStateFromText", () => {
  it("detects state from a 2-letter abbreviation", () => {
    const result = detectStateFromText("The dealer is located in CA.");
    expect(result.state).toBe("CA");
  });

  it("detects state from a full state name", () => {
    const result = detectStateFromText("We are a California dealer.");
    expect(result.state).toBe("CA");
  });

  it("detects state from an unambiguous city (Houston → TX)", () => {
    const result = detectStateFromText("Come visit us in Houston.");
    expect(result.state).toBe("TX");
  });

  it("detects state from Chicago → IL", () => {
    const result = detectStateFromText("Our dealership is in Chicago.");
    expect(result.state).toBe("IL");
  });

  it("detects state via ZIP code override", () => {
    const result = detectStateFromText("Come see us at the lot.", "90210");
    expect(result.state).toBe("CA");
  });

  it("returns null state when no state clue is present", () => {
    const result = detectStateFromText("Price is $35,000 OTD.");
    expect(result.state).toBeNull();
  });

  it("marks ambiguous city as ambiguous (Portland)", () => {
    const result = detectStateFromText("Our dealership is in Portland.");
    expect(result.state).toBeNull();
    expect(result.ambiguousCity).toBeTruthy();
  });
});
