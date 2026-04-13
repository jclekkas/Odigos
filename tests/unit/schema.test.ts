import { describe, it, expect } from "vitest";
import {
  analysisRequestSchema,
  analysisResponseSchema,
  feeSchema,
  detectedFieldsSchema,
} from "../../shared/schema.js";

const validDetectedFields = {
  salePrice: 30000,
  msrp: 32000,
  rebates: null,
  fees: [{ name: "Doc Fee", amount: 199 }],
  outTheDoorPrice: 33000,
  monthlyPayment: null,
  tradeInValue: null,
  apr: 4.9,
  termMonths: 60,
  downPayment: 3000,
};

const validResponse = {
  dealScore: "GREEN",
  confidenceLevel: "HIGH",
  verdictLabel: "GO — TERMS LOOK CLEAN",
  goNoGo: "GO",
  summary: "The deal looks solid.",
  detectedFields: validDetectedFields,
  missingInfo: [],
  suggestedReply: "Thank you, we'll be in touch.",
  reasoning: "OTD price and APR are clear.",
};

// ─── analysisRequestSchema ────────────────────────────────────────────────────

describe("analysisRequestSchema", () => {
  it("accepts a minimal valid request (dealerText only)", () => {
    const result = analysisRequestSchema.safeParse({ dealerText: "OTD is $35,000." });
    expect(result.success).toBe(true);
  });

  it("rejects an empty dealerText", () => {
    const result = analysisRequestSchema.safeParse({ dealerText: "" });
    expect(result.success).toBe(false);
  });

  it("rejects a request with no dealerText field", () => {
    const result = analysisRequestSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("accepts valid condition enum values", () => {
    for (const condition of ["unknown", "new", "used"]) {
      const r = analysisRequestSchema.safeParse({ dealerText: "text", condition });
      expect(r.success, `condition=${condition}`).toBe(true);
    }
  });

  it("rejects invalid condition value", () => {
    const result = analysisRequestSchema.safeParse({ dealerText: "text", condition: "ancient" });
    expect(result.success).toBe(false);
  });

  it("accepts valid purchaseType enum values", () => {
    for (const pt of ["unknown", "cash", "finance", "lease"]) {
      const r = analysisRequestSchema.safeParse({ dealerText: "text", purchaseType: pt });
      expect(r.success, `purchaseType=${pt}`).toBe(true);
    }
  });

  it("accepts optional numeric fields (apr, termMonths, downPayment)", () => {
    const result = analysisRequestSchema.safeParse({
      dealerText: "text",
      apr: 3.9,
      termMonths: 60,
      downPayment: 5000,
    });
    expect(result.success).toBe(true);
  });
});

// ─── analysisResponseSchema ───────────────────────────────────────────────────

describe("analysisResponseSchema", () => {
  it("accepts a fully valid response", () => {
    const result = analysisResponseSchema.safeParse(validResponse);
    expect(result.success).toBe(true);
  });

  it("rejects invalid dealScore", () => {
    const result = analysisResponseSchema.safeParse({ ...validResponse, dealScore: "BLUE" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid confidenceLevel", () => {
    const result = analysisResponseSchema.safeParse({ ...validResponse, confidenceLevel: "VERY_HIGH" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid goNoGo", () => {
    const result = analysisResponseSchema.safeParse({ ...validResponse, goNoGo: "MAYBE" });
    expect(result.success).toBe(false);
  });

  it("rejects when required fields are missing", () => {
    const { summary: _s, ...withoutSummary } = validResponse;
    const result = analysisResponseSchema.safeParse(withoutSummary);
    expect(result.success).toBe(false);
  });

  it("accepts all three dealScore values", () => {
    for (const score of ["GREEN", "YELLOW", "RED"]) {
      const r = analysisResponseSchema.safeParse({ ...validResponse, dealScore: score });
      expect(r.success, `dealScore=${score}`).toBe(true);
    }
  });
});

// ─── feeSchema ────────────────────────────────────────────────────────────────

describe("feeSchema", () => {
  it("accepts a fee with a numeric amount", () => {
    const result = feeSchema.safeParse({ name: "Doc Fee", amount: 199 });
    expect(result.success).toBe(true);
  });

  it("accepts a fee with a null amount", () => {
    const result = feeSchema.safeParse({ name: "Protection Package", amount: null });
    expect(result.success).toBe(true);
  });

  it("rejects a fee missing the name field", () => {
    const result = feeSchema.safeParse({ amount: 100 });
    expect(result.success).toBe(false);
  });
});

// ─── detectedFieldsSchema ─────────────────────────────────────────────────────

describe("detectedFieldsSchema", () => {
  it("accepts all-null fields", () => {
    const result = detectedFieldsSchema.safeParse({
      salePrice: null, msrp: null, rebates: null, fees: [],
      outTheDoorPrice: null, monthlyPayment: null, tradeInValue: null,
      apr: null, termMonths: null, downPayment: null,
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid numeric fields", () => {
    const result = detectedFieldsSchema.safeParse(validDetectedFields);
    expect(result.success).toBe(true);
  });
});
