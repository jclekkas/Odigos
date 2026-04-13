import { describe, it, expect } from "vitest";
import { normalizeFeeName, normalizeFeeNames } from "../../server/warehouse/warehouseUtils.js";

// ─── normalizeFeeName ────────────────────────────────────────────────────────

describe("normalizeFeeName", () => {
  // Doc fee variants
  it.each([
    ["Doc Fee", "doc fee"],
    ["Documentation Fee", "doc fee"],
    ["Document Fee", "doc fee"],
    ["documentary fee", "doc fee"],
    ["DOC FEE", "doc fee"],
  ])('"%s" → "%s"', (input, expected) => {
    expect(normalizeFeeName(input)).toBe(expected);
  });

  // Admin / processing / dealer fees
  it.each([
    ["Admin Fee", "admin fee"],
    ["Administrative Fee", "admin fee"],
    ["Processing Fee", "processing fee"],
    ["Dealer Fee", "dealer fee"],
  ])('"%s" → "%s"', (input, expected) => {
    expect(normalizeFeeName(input)).toBe(expected);
  });

  // Market adjustment variants
  it.each([
    ["Market Adjustment", "market adjustment"],
    ["Market Value Adjustment", "market adjustment"],
    ["Additional Dealer Markup", "market adjustment"],
    ["Dealer Markup", "market adjustment"],
    ["ADM", "market adjustment"],
    ["Markup", "market adjustment"],
  ])('"%s" → "%s"', (input, expected) => {
    expect(normalizeFeeName(input)).toBe(expected);
  });

  // Protection package variants — the core fragmentation problem
  it.each([
    ["Protection Package", "protection package"],
    ["Protection Pkg", "protection package"],
    ["Protection Plan", "protection package"],
    ["Appearance Package", "appearance package"],
    ["Appearance Protection", "appearance package"],
    ["Paint Protection", "paint protection"],
    ["Fabric Protection", "fabric protection"],
    ["Fabric Guard", "fabric protection"],
    ["Interior Protection", "fabric protection"],
    ["Interior Guard", "fabric protection"],
  ])('"%s" → "%s"', (input, expected) => {
    expect(normalizeFeeName(input)).toBe(expected);
  });

  // Individual add-ons
  it.each([
    ["Ceramic Coating", "ceramic coating"],
    ["Ceramic Coat", "ceramic coating"],
    ["Ceramic", "ceramic coating"],
    ["Clear Coat", "clear coat"],
    ["Undercoating", "undercoating"],
    ["Undercoat", "undercoating"],
    ["Nitrogen", "nitrogen fill"],
    ["Nitrogen Fill", "nitrogen fill"],
    ["VIN Etch", "vin etching"],
    ["VIN Etching", "vin etching"],
    ["Anti-Theft", "anti-theft package"],
    ["Anti Theft Package", "anti-theft package"],
    ["Window Tint", "window tint"],
    ["Window Tinting", "window tint"],
    ["Wheel Locks", "wheel locks"],
    ["Wheel Lock", "wheel locks"],
    ["Pinstripe", "pinstriping"],
    ["Pin Stripe", "pinstriping"],
  ])('"%s" → "%s"', (input, expected) => {
    expect(normalizeFeeName(input)).toBe(expected);
  });

  // Insurance / warranty
  it.each([
    ["GAP Insurance", "gap insurance"],
    ["GAP Waiver", "gap insurance"],
    ["GAP Coverage", "gap insurance"],
    ["Extended Warranty", "extended warranty"],
    ["Extended Service", "extended warranty"],
    ["Service Contract", "extended warranty"],
  ])('"%s" → "%s"', (input, expected) => {
    expect(normalizeFeeName(input)).toBe(expected);
  });

  // Dealer overhead fees
  it.each([
    ["Dealer Prep", "dealer prep"],
    ["Pre-Delivery Inspection", "pre-delivery inspection"],
    ["Predelivery Inspection", "pre-delivery inspection"],
    ["Reconditioning Fee", "reconditioning fee"],
    ["Lot Fee", "lot fee"],
    ["Delivery Fee", "delivery fee"],
    ["Dealer Add-ons", "dealer add-ons"],
    ["Dealer Accessories", "dealer add-ons"],
  ])('"%s" → "%s"', (input, expected) => {
    expect(normalizeFeeName(input)).toBe(expected);
  });

  // Passthrough for unknown fee names
  it("passes through unknown fee names as lowercase/trimmed", () => {
    expect(normalizeFeeName("Destination Charge")).toBe("destination charge");
    expect(normalizeFeeName("  Title and Registration  ")).toBe("title and registration");
    expect(normalizeFeeName("Sales Tax")).toBe("sales tax");
  });

  // Edge cases
  it("handles empty string", () => {
    expect(normalizeFeeName("")).toBe("");
  });

  it("handles whitespace-only string", () => {
    expect(normalizeFeeName("   ")).toBe("");
  });
});

// ─── normalizeFeeNames ──────────────────────────────────────────────────────

describe("normalizeFeeNames", () => {
  it("normalizes and deduplicates fee names", () => {
    const fees = [
      { name: "Protection Package", amount: 995 },
      { name: "Protection Pkg", amount: 895 },
      { name: "Doc Fee", amount: 599 },
    ];
    const result = normalizeFeeNames(fees);
    expect(result).toContain("protection package");
    expect(result).toContain("doc fee");
    // "Protection Package" and "Protection Pkg" should collapse to one entry
    expect(result.filter((n) => n === "protection package")).toHaveLength(1);
    expect(result).toHaveLength(2);
  });

  it("returns empty array for empty input", () => {
    expect(normalizeFeeNames([])).toEqual([]);
  });

  it("deduplicates after canonicalization", () => {
    const fees = [
      { name: "VIN Etch", amount: 299 },
      { name: "VIN Etching", amount: 299 },
      { name: "Vin etch", amount: 199 },
    ];
    const result = normalizeFeeNames(fees);
    expect(result).toEqual(["vin etching"]);
  });

  it("preserves distinct canonical names", () => {
    const fees = [
      { name: "Doc Fee", amount: 599 },
      { name: "Nitrogen Fill", amount: 199 },
      { name: "Window Tint", amount: 399 },
    ];
    const result = normalizeFeeNames(fees);
    expect(result).toHaveLength(3);
    expect(result).toContain("doc fee");
    expect(result).toContain("nitrogen fill");
    expect(result).toContain("window tint");
  });
});
