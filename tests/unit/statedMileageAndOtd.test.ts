import { describe, expect, it } from "vitest";
import { applyRuleEngine } from "../../server/ruleEngine.js";
import { parseDealerQuoteFacts } from "../../server/dealerQuoteText.js";
import { mergeMissingInfo } from "../../server/services/analyzeService.js";
import type { AnalysisResponse, DetectedFields } from "../../shared/schema.js";

const llm = {
  dealScore: "GREEN",
  confidenceLevel: "HIGH",
  verdictLabel: "GO",
  goNoGo: "GO",
  summary: "Approve it.",
  detectedFields: {} as DetectedFields,
  missingInfo: [],
  suggestedReply: "Sign it.",
  reasoning: "Fine.",
} as AnalysisResponse;

function camry(partial: Partial<DetectedFields> = {}): DetectedFields {
  return {
    salePrice: 28000,
    msrp: null,
    rebates: null,
    fees: [],
    outTheDoorPrice: null,
    monthlyPayment: null,
    tradeInValue: null,
    apr: null,
    termMonths: null,
    downPayment: null,
    vehicle_make: "Toyota",
    vehicle_model: "Camry",
    vehicle_year: 2025,
    ...partial,
  };
}

function shown(text: string, condition: "used" | "new" = "used") {
  const facts = parseDealerQuoteFacts(text);
  const result = applyRuleEngine(llm, camry(), null, "cash", null, {
    condition,
    mileage: facts.mileage,
    dealerText: text,
  });
  return { facts, result, missingInfo: mergeMissingInfo([], result.missingInfo) };
}

describe("stated odometer is displayed and never invented", () => {
  it("shows 12 for a quote that says 12 miles", () => {
    const { facts, result } = shown("2025 Toyota Camry\n12 miles\nSelling price: $28,000");
    expect(facts.mileage).toBe(12);
    expect(result.statedMileage).toBe(12);
    expect(result.summary).toContain("The quote states 12 miles.");
    expect(result.dimensions?.informationCompleteness.summary).toContain("The quote states 12 miles.");
    expect(result.verdictLabel).not.toBe("INSUFFICIENT INFORMATION — MILEAGE NOT PROVIDED");
  });

  it("shows 0 for a quote that says 0 mi", () => {
    const { facts, result } = shown("2025 Toyota Camry\n0 mi\nSelling price: $28,000");
    expect(facts.mileage).toBe(0);
    expect(result.statedMileage).toBe(0);
    expect(result.summary).toContain("The quote states 0 miles.");
    expect(result.dimensions?.informationCompleteness.summary).toContain("The quote states 0 miles.");
    expect(result.verdictLabel).not.toBe("INSUFFICIENT INFORMATION — MILEAGE NOT PROVIDED");
  });

  it("leaves mileage absent and keeps the mileage-not-provided finding when none is stated", () => {
    const { facts, result } = shown("2025 Toyota Camry\nSelling price: $28,000");
    expect(facts.mileage).toBeNull();
    expect(result.statedMileage).toBeNull();
    expect(result.verdictLabel).toBe("INSUFFICIENT INFORMATION — MILEAGE NOT PROVIDED");
    expect(result.summary).toContain("A used vehicle cannot be assessed without mileage.");
    expect(result.summary).not.toMatch(/The quote states \d+ miles/);
    expect(result.dimensions?.informationCompleteness.summary).toContain("A used vehicle has no mileage.");
    expect(result.dimensions?.informationCompleteness.summary).not.toMatch(/The quote states \d+ miles/);
  });
});

describe("incomplete out-the-door breakdown outranks unverified market value", () => {
  it("headlines the missing itemized breakdown for a $28,000 Camry with a $40,000 out-the-door price", () => {
    const text = "2025 Toyota Camry\nSelling price: $28,000\nOut the door: $40,000";
    const facts = parseDealerQuoteFacts(text);
    const fields = camry({
      salePrice: facts.salePrices[0] ?? 28000,
      outTheDoorPrice: facts.outTheDoorPrices[0] ?? 40000,
      fees: [],
    });
    const result = applyRuleEngine(llm, fields, null, "cash", null, {
      condition: "new",
      dealerText: text,
      mileage: facts.mileage,
    });
    const missingInfo = mergeMissingInfo([], result.missingInfo);
    const ask = "Please send an itemized out-the-door breakdown, including tax, title, and registration.";

    expect(result.verdictLabel).toBe("INSUFFICIENT INFORMATION — ITEMIZED OTD BREAKDOWN MISSING");
    expect(result.summary).toContain("The out-the-door price of $40,000 is $12,000 above the selling price of $28,000 plus the itemized lines.");
    expect(result.summary).toContain("Tax, title, and registration are not itemized.");
    expect(result.summary).toContain(ask);
    expect(result.summary).toContain("Market value not verified.");
    expect(result.suggestedReply).toContain(ask);
    expect(result.suggestedReply).toContain("$40,000");
    expect(result.suggestedReply).toContain("$12,000");
    expect(result.goNoGo).not.toBe("GO");
    expect(missingInfo).toEqual([
      { field: "Out-the-door breakdown", question: ask },
    ]);
  });
});
