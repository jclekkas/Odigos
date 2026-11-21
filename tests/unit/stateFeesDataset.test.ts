import { describe, expect, it } from "vitest";
import dataset from "../../data/state_fees.json" with { type: "json" };
import { getStateFeeData } from "../../server/stateFeeLookup.js";

const STATUSES = new Set(["verified", "partial", "needs_source"]);

describe("state fee dataset", () => {
  it("has a schema version, a review date, and 51 jurisdictions", () => {
    expect(dataset.schema_version).toBe("1.1.0");
    expect(dataset.last_reviewed).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(Object.keys(dataset.states)).toHaveLength(51);
    expect(dataset.states.DC).toBeDefined();
  });

  it("feeds the analyzer without changing stored caps", () => {
    expect(getStateFeeData("CA")?.docFeeCapAmount).toBe(dataset.states.CA.docFeeCapAmount);
    expect(getStateFeeData("CA")?.docFeeCapAmount).toBe(85);
    expect(getStateFeeData("IL")?.docFeeCapAmount).toBe(378);
    expect(getStateFeeData("TX")?.docFeeCap).toBe(false);
    expect(getStateFeeData("TX")?.docFeeCapAmount).toBeNull();
    expect(getStateFeeData("OH")?.docFeeCapAmount).toBe(398);
    expect(getStateFeeData("LA")?.docFeeCapAmount).toBe(436);
    expect(getStateFeeData("IA")?.stateSalesTaxRate).toBe(0.06);
    expect(getStateFeeData("AL")?.docFeeCap).toBe(false);
    expect(getStateFeeData("FL")?.stateSalesTaxRate).toBe(0.06);
  });

  it("only marks a citation when one was recorded, and never invents one for needs_source", () => {
    for (const [code, state] of Object.entries(dataset.states)) {
      expect(STATUSES.has(state.source_status), code).toBe(true);
      expect(Array.isArray(state.citations), code).toBe(true);
      expect(Array.isArray(state.unverified_fields), code).toBe(true);
      if (state.source_status === "needs_source") {
        expect(state.citations, code).toEqual([]);
      } else {
        expect(state.citations.length, code).toBeGreaterThan(0);
        for (const citation of state.citations) {
          expect(citation.url, code).toMatch(/^https?:\/\//);
          expect(citation.retrieved, code).toMatch(/^\d{4}-\d{2}-\d{2}$/);
          expect(citation.supports.length, code).toBeGreaterThan(40);
        }
      }
    }
  });

  it("records the caps that were checked against a fetched page", () => {
    expect(dataset.states.WA.source_status).toBe("partial");
    expect(dataset.states.WA.citations[0].url).toContain("46.70.180");
    expect(dataset.states.IA.source_status).toBe("verified");
    expect(dataset.states.IA.stateSalesTaxRate).toBe(0.06);
    expect(dataset.states.MD.docFeeCapAmount).toBe(800);
    expect(dataset.states.GA.docFeeCap).toBe(false);
    expect(dataset.states.GA.stateSalesTaxRate).toBe(0.07);
    expect(dataset.states.GA.source_status).toBe("verified");
    expect(dataset.states.CA.source_status).toBe("verified");
    expect(dataset.states.TX.docFeeCap).toBe(false);
    expect(dataset.states.TX.source_status).toBe("partial");
  });
});
