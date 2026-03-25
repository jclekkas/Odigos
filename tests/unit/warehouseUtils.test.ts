import { describe, it, expect } from "vitest";
import {
  normalizeSubmissionText,
  sha256Hex,
  delay,
  getBackoffMs,
  validateFinancialBounds,
  safeSerializePayload,
  getErrorMessage,
} from "../../server/warehouse/warehouseUtils";

// ─── normalizeSubmissionText ──────────────────────────────────────────────────

describe("normalizeSubmissionText", () => {
  it("converts CRLF to LF", () => {
    const result = normalizeSubmissionText("line1\r\nline2\r\nline3");
    expect(result).toBe("line1\nline2\nline3");
  });

  it("converts bare CR to LF", () => {
    const result = normalizeSubmissionText("line1\rline2");
    expect(result).toBe("line1\nline2");
  });

  it("trims outer whitespace", () => {
    const result = normalizeSubmissionText("  hello world  ");
    expect(result).toBe("hello world");
  });

  it("does NOT collapse internal whitespace", () => {
    const result = normalizeSubmissionText("hello   world");
    expect(result).toBe("hello   world");
  });

  it("does NOT lowercase", () => {
    const result = normalizeSubmissionText("Hello WORLD");
    expect(result).toBe("Hello WORLD");
  });

  it("handles mixed CRLF and LF", () => {
    const result = normalizeSubmissionText("line1\r\nline2\nline3");
    expect(result).toBe("line1\nline2\nline3");
  });

  it("returns empty string when input is only whitespace", () => {
    const result = normalizeSubmissionText("   \r\n  ");
    expect(result).toBe("");
  });
});

// ─── sha256Hex ────────────────────────────────────────────────────────────────

describe("sha256Hex", () => {
  it("produces a 64-character hex string", () => {
    const hash = sha256Hex("hello");
    expect(hash).toHaveLength(64);
    expect(/^[0-9a-f]+$/.test(hash)).toBe(true);
  });

  it("same text → identical hash", () => {
    expect(sha256Hex("hello world")).toBe(sha256Hex("hello world"));
  });

  it("different text → different hash", () => {
    expect(sha256Hex("hello world")).not.toBe(sha256Hex("hello world!"));
  });

  it("CRLF and LF produce different hashes before normalization", () => {
    const crlfHash = sha256Hex("line1\r\nline2");
    const lfHash = sha256Hex("line1\nline2");
    expect(crlfHash).not.toBe(lfHash);
  });

  it("CRLF → LF normalized texts produce same hash", () => {
    const text1 = normalizeSubmissionText("line1\r\nline2");
    const text2 = normalizeSubmissionText("line1\nline2");
    expect(sha256Hex(text1)).toBe(sha256Hex(text2));
  });
});

// ─── delay ───────────────────────────────────────────────────────────────────

describe("delay", () => {
  it("resolves after approximately the given ms", async () => {
    const start = Date.now();
    await delay(50);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(40);
  });

  it("resolves immediately for 0ms", async () => {
    await expect(delay(0)).resolves.toBeUndefined();
  });
});

// ─── getBackoffMs ─────────────────────────────────────────────────────────────

describe("getBackoffMs", () => {
  it("attempt 1 → 0ms (immediate)", () => {
    expect(getBackoffMs(1)).toBe(0);
  });

  it("attempt 2 → 100ms", () => {
    expect(getBackoffMs(2)).toBe(100);
  });

  it("attempt 3 → 300ms", () => {
    expect(getBackoffMs(3)).toBe(300);
  });

  it("attempt 0 or negative → 0ms (treated as first attempt)", () => {
    expect(getBackoffMs(0)).toBe(0);
    expect(getBackoffMs(-1)).toBe(0);
  });
});

// ─── validateFinancialBounds ──────────────────────────────────────────────────

describe("validateFinancialBounds", () => {
  it("returns empty array when all values are within bounds", () => {
    const flags = validateFinancialBounds({
      vehiclePrice: 25000,
      tradeInValue: 5000,
      docFee: 299,
      dealerAddonCost: 500,
      totalFees: 1500,
    });
    expect(flags).toHaveLength(0);
  });

  it("returns no flags for missing (null/undefined) values", () => {
    const flags = validateFinancialBounds({
      vehiclePrice: null,
      tradeInValue: undefined,
    });
    expect(flags).toHaveLength(0);
  });

  it("flags vehiclePrice below minimum (500)", () => {
    const flags = validateFinancialBounds({ vehiclePrice: 100 });
    expect(flags).toHaveLength(1);
    expect(flags[0]).toMatchObject({
      field: "vehiclePrice",
      value: 100,
      min: 500,
      reason: "below_min",
    });
  });

  it("flags vehiclePrice above maximum (500000)", () => {
    const flags = validateFinancialBounds({ vehiclePrice: 600000 });
    expect(flags).toHaveLength(1);
    expect(flags[0]).toMatchObject({
      field: "vehiclePrice",
      value: 600000,
      max: 500000,
      reason: "above_max",
    });
  });

  it("flags docFee above maximum (10000)", () => {
    const flags = validateFinancialBounds({ docFee: 15000 });
    expect(flags).toHaveLength(1);
    expect(flags[0]).toMatchObject({
      field: "docFee",
      value: 15000,
      max: 10000,
      reason: "above_max",
    });
  });

  it("does NOT flag docFee at exactly 0 (boundary)", () => {
    const flags = validateFinancialBounds({ docFee: 0 });
    expect(flags).toHaveLength(0);
  });

  it("flags NaN values with 'not_finite' reason", () => {
    const flags = validateFinancialBounds({ vehiclePrice: NaN });
    expect(flags).toHaveLength(1);
    expect(flags[0]).toMatchObject({ field: "vehiclePrice", reason: "not_finite" });
    expect(flags[0].min).toBeUndefined();
    expect(flags[0].max).toBeUndefined();
  });

  it("flags Infinity values with 'not_finite' reason", () => {
    const flags = validateFinancialBounds({ tradeInValue: Infinity });
    expect(flags).toHaveLength(1);
    expect(flags[0]).toMatchObject({ field: "tradeInValue", reason: "not_finite" });
  });

  it("flags multiple out-of-bounds fields independently", () => {
    const flags = validateFinancialBounds({
      vehiclePrice: 100,   // below min
      docFee: 20000,        // above max
    });
    expect(flags).toHaveLength(2);
    const fields = flags.map((f) => f.field);
    expect(fields).toContain("vehiclePrice");
    expect(fields).toContain("docFee");
  });

  it("accepts tradeInValue of 0 (boundary — valid)", () => {
    const flags = validateFinancialBounds({ tradeInValue: 0 });
    expect(flags).toHaveLength(0);
  });

  it("flags negative totalFees as below_min", () => {
    const flags = validateFinancialBounds({ totalFees: -100 });
    expect(flags).toHaveLength(1);
    expect(flags[0]).toEqual({ field: "totalFees", reason: "below_min", value: -100, min: 0 });
  });

  it("flags negative dealerAddonCost as below_min", () => {
    const flags = validateFinancialBounds({ dealerAddonCost: -50 });
    expect(flags).toHaveLength(1);
    expect(flags[0]).toEqual({ field: "dealerAddonCost", reason: "below_min", value: -50, min: 0 });
  });

  it("flags negative vehiclePrice as below_min", () => {
    const flags = validateFinancialBounds({ vehiclePrice: -1000 });
    expect(flags).toHaveLength(1);
    expect(flags[0]).toEqual({ field: "vehiclePrice", reason: "below_min", value: -1000, min: 500 });
  });
});

// ─── safeSerializePayload ─────────────────────────────────────────────────────

describe("safeSerializePayload", () => {
  it("includes expected fields and excludes raw document text", () => {
    const result = safeSerializePayload({
      dealerSubmissionId: "sub-123",
      stateCode: "CA",
      dealScore: "GREEN",
      verdict: "GO",
    });
    expect(result).toEqual({
      dealerSubmissionId: "sub-123",
      stateCode: "CA",
      dealScore: "GREEN",
      verdict: "GO",
    });
    expect(result).not.toHaveProperty("dealerText");
    expect(result).not.toHaveProperty("rawText");
  });

  it("handles null stateCode gracefully", () => {
    const result = safeSerializePayload({
      dealerSubmissionId: "sub-456",
      stateCode: null,
    });
    expect(result.stateCode).toBeNull();
    expect(result.dealScore).toBeNull();
    expect(result.verdict).toBeNull();
  });
});

// ─── getErrorMessage ──────────────────────────────────────────────────────────

describe("getErrorMessage", () => {
  it("extracts message from Error instance", () => {
    expect(getErrorMessage(new Error("boom"))).toBe("boom");
  });

  it("returns string as-is", () => {
    expect(getErrorMessage("plain error")).toBe("plain error");
  });

  it("JSON-serializes objects", () => {
    const msg = getErrorMessage({ code: 42 });
    expect(msg).toContain("42");
  });

  it("handles null safely", () => {
    expect(typeof getErrorMessage(null)).toBe("string");
  });
});
