import { describe, expect, it } from "vitest";
import { normalizeOcrMoney, scanMoney } from "../../server/ocrMoney.js";
import { parseGovernmentLines } from "../../server/governmentCharges.js";
import { applyDealerQuoteFacts, parseDealerQuoteFacts } from "../../server/dealerQuoteText.js";
import type { DetectedFields } from "../../shared/schema.js";

function amounts(text: string): number[] {
  return scanMoney(normalizeOcrMoney(text)).map((span) => span.amount);
}

function fields(partial: Partial<DetectedFields> = {}): DetectedFields {
  return {
    salePrice: null,
    msrp: null,
    rebates: null,
    fees: [],
    outTheDoorPrice: null,
    monthlyPayment: null,
    tradeInValue: null,
    apr: null,
    termMonths: null,
    downPayment: null,
    moneyFactor: null,
    residualValue: null,
    residualPercent: null,
    acquisitionFee: null,
    dispositionFee: null,
    mileageAllowance: null,
    excessMileageRate: null,
    ...partial,
  };
}

describe("raw-text money formats", () => {
  it("accepts a dollar amount, USD before or after the number, and a bare labeled amount", () => {
    expect(amounts("Balance $1,234.56")).toEqual([1234.56]);
    expect(amounts("Selling price: USD 1,234")).toEqual([1234]);
    expect(amounts("Amount due 1,234 USD")).toEqual([1234]);
    expect(amounts("Doc fee: 85")).toEqual([85]);
    expect(amounts("Doc fee\t85")).toEqual([85]);
    expect(amounts("Service and handling\t129")).toEqual([129]);
  });

  it("repairs O/0, S/$, and l/1 without turning a percent into dollars", () => {
    expect(normalizeOcrMoney("Selling price $28,00O")).toContain("$28,000");
    expect(normalizeOcrMoney("Sales tax S2,170")).toContain("$2,170");
    expect(amounts("Doc fee: S85")).toEqual([85]);
    expect(amounts("Doc fee: $l,234.56")).toEqual([1234.56]);
    expect(amounts("Selling price: l8500")).toContain(18500);
    expect(normalizeOcrMoney("Sales tax 7.75%")).not.toContain("$");
    expect(amounts("Sales tax 7.75%")).toEqual([]);
    expect(amounts("Tax rate: 7.75%")).toEqual([]);
    expect(amounts("Sales tax: $7.75%")).toEqual([]);
    expect(amounts("Sales tax (7.75%): $3,500")).toEqual([3500]);
    expect(parseGovernmentLines("Sales tax 7.75%")).toEqual([]);
    expect(parseGovernmentLines("Tax rate: 7.75%")).toEqual([]);
    expect(parseGovernmentLines("Sales tax: $7.75%")).toEqual([]);
    expect(parseGovernmentLines("Sales tax (7.75%): $3,500")).toEqual([
      expect.objectContaining({ kind: "tax", amount: 3500 }),
    ]);
  });

  it("keeps an AI-extracted amount that the quote prints without a dollar sign", () => {
    const text = "Selling price: USD 1,234\nDoc fee: 85\nOut the door: 1,400 USD";
    const parsed = applyDealerQuoteFacts(
      fields({ salePrice: 1234, outTheDoorPrice: 1400, fees: [] }),
      parseDealerQuoteFacts(text),
    );
    expect(parsed.salePrice).toBe(1234);
    expect(parsed.outTheDoorPrice).toBe(1400);
    expect(parsed.fees).toEqual([expect.objectContaining({ amount: 85 })]);
  });

  it("still drops an AI amount the quote never states", () => {
    const text = "We can do $399 per month. No other figures on this pencil.";
    const parsed = applyDealerQuoteFacts(
      fields({ salePrice: 25000, outTheDoorPrice: 27000, monthlyPayment: 399 }),
      parseDealerQuoteFacts(text),
    );
    expect(parsed.salePrice).toBeNull();
    expect(parsed.outTheDoorPrice).toBeNull();
    expect(parsed.monthlyPayment).toBe(399);
  });
});
