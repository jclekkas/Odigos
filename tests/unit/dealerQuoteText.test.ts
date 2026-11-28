import { describe, expect, it } from "vitest";
import { applyDealerQuoteFacts, collapseRebateLines, parseDealerQuoteFacts } from "../../server/dealerQuoteText.js";
import type { DetectedFields, Fee } from "../../shared/schema.js";

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

function named(fees: Fee[], pattern: RegExp): Fee[] {
  return fees.filter((fee) => pattern.test(fee.name));
}

describe("raw-text fee extraction", () => {
  it("reads an Arkansas service and handling fee from the quote text", () => {
    const facts = parseDealerQuoteFacts("Service and handling fee: $140\nSelling price: $18,000");
    expect(facts.docFees).toEqual([expect.objectContaining({ name: expect.stringMatching(/service and handling/i), amount: 140 })]);
    const tabbed = parseDealerQuoteFacts("Service and handling\t129");
    expect(tabbed.docFees.map((fee) => fee.amount)).toEqual([129]);
  });

  it("keeps one row when the model repeats a single printed line", () => {
    const text = "Selling price: $28,000\nDoc fee: $60\nSales tax: $2,000";
    const parsed = applyDealerQuoteFacts(
      fields({
        fees: [
          { name: "Doc fee", amount: 60 },
          { name: "Doc fee", amount: 60 },
        ],
      }),
      parseDealerQuoteFacts(text),
    );
    expect(named(parsed.fees, /doc fee/i)).toHaveLength(1);
  });

  it("keeps two rows when the quote prints the same line twice", () => {
    const text = "Selling price: $28,000\nDoc fee: $60\nDoc fee: $60";
    const parsed = applyDealerQuoteFacts(
      fields({ fees: [{ name: "Doc fee", amount: 60 }] }),
      parseDealerQuoteFacts(text),
    );
    expect(named(parsed.fees, /doc fee/i)).toHaveLength(2);
    expect(parsed.fees.filter((fee) => fee.amount === 60)).toHaveLength(2);
  });

  it("keeps two printed credits of the same amount and their eligibility text", () => {
    const text = [
      "Selling price: $28,000",
      "-$500 rebate with dealer financing",
      "($500) loyalty",
    ].join("\n");
    const parsed = applyDealerQuoteFacts(fields(), parseDealerQuoteFacts(text));
    expect(parsed.rebateLines).toEqual([
      expect.objectContaining({ amount: 500, condition: "with dealer financing", name: expect.stringMatching(/rebate/i) }),
      expect.objectContaining({ amount: 500, condition: null, name: expect.stringMatching(/loyalty/i) }),
    ]);
    expect(parsed.rebates).toBe(1000);
  });

  it("sums different credit amounts instead of dropping the rebate", () => {
    const text = [
      "Selling price: $28,000",
      "Rebate: $500",
      "Loyalty credit: $750",
    ].join("\n");
    const parsed = applyDealerQuoteFacts(fields({ rebates: 9000 }), parseDealerQuoteFacts(text));
    expect(parsed.rebates).toBe(1250);
    expect(parsed.rebateLines?.map((line) => line.amount).sort((a, b) => a - b)).toEqual([500, 750]);
  });

  it("collapses a second read of the same printed line and keeps a distinct charge", () => {
    const collapsed = collapseRebateLines([
      { name: "Rebate", amount: 500, condition: "with dealer financing", sourceLine: 1, sourceOffset: 4 },
      { name: "Rebate", amount: 500, condition: "with dealer financing", sourceLine: 1, sourceOffset: 4 },
      { name: "Loyalty", amount: 500, condition: null, sourceLine: 2, sourceOffset: 0 },
    ]);
    expect(collapsed).toHaveLength(2);
    expect(collapsed.map((line) => line.sourceLine)).toEqual([1, 2]);
    expect(collapsed[0].condition).toBe("with dealer financing");
  });

  it("reads an explicit odometer below 100 miles, including zero", () => {
    expect(parseDealerQuoteFacts("12 miles\nSelling price: $28,000").mileage).toBe(12);
    expect(parseDealerQuoteFacts("Odometer: 7\nSelling price: $28,000").mileage).toBe(7);
    expect(parseDealerQuoteFacts("0 mi\nSelling price: $28,000").mileage).toBe(0);
    expect(parseDealerQuoteFacts("Mileage: 12").mileage).toBe(12);
    expect(parseDealerQuoteFacts("Odometer: 42,150 miles").mileage).toBe(42150);
  });

  it("does not invent mileage when the quote does not state an odometer", () => {
    expect(parseDealerQuoteFacts("Selling price: $28,000\nDoc fee: $70\n12").mileage).toBeNull();
    expect(parseDealerQuoteFacts("Excess mileage: $0.25 per mile").mileage).toBeNull();
    expect(parseDealerQuoteFacts("Mileage allowance: 10,000 miles per year").mileage).toBeNull();
    expect(parseDealerQuoteFacts("12,000 miles per year").mileage).toBeNull();
  });

  it("extracts an electronic filing line separately from the doc fee", () => {
    const facts = parseDealerQuoteFacts("Doc fee: $70\nElectronic filing fee: $25");
    expect(facts.docFees.map((fee) => fee.amount)).toEqual([70]);
    expect(facts.filingFees.map((fee) => fee.amount)).toEqual([25]);
  });
});
