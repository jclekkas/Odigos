import { describe, expect, it } from "vitest";
import { normalizeOcrMoney, prepareQuoteText, scanMoney } from "../../server/ocrMoney.js";
import { enrichDetectedFields, parseGovernmentLines } from "../../server/governmentCharges.js";
import { applyDealerQuoteFacts, parseDealerQuoteFacts } from "../../server/dealerQuoteText.js";
import { classifyFeeBucket, computePurchase, splitFees } from "../../server/quoteMath.js";
import { matchesExtractedDocFeeLabel } from "../../shared/feeVocabulary.js";
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

  it("reads a bare amount, a single decimal, credits, and a wrapped spreadsheet cell", () => {
    expect(amounts("Doc fee 85")).toEqual([85]);
    expect(amounts("Selling price 28000")).toContain(28000);
    expect(amounts("Balance $450.5")).toEqual([450.5]);
    expect(amounts("Rebate -$500")).toEqual([-500]);
    expect(amounts("Rebate ($500)")).toEqual([-500]);
    expect(amounts("credit 500")).toEqual([-500]);
    expect(amounts("500-")).toEqual([-500]);
    expect(amounts("credit score 750")).toEqual([]);
    expect(amounts("Tax rate: 7.75%")).toEqual([]);
    const wrapped = "Doc fee\t\"$\n450.5\"";
    expect(amounts(wrapped)).toEqual([450.5]);
    const quoted = "\"Selling price\"\t\"$28,000\"";
    expect(amounts(quoted)).toContain(28000);
  });

  it("keeps a printed credit and drops a credit the model invented", () => {
    const text = "Selling price: $28,000\nRebate: ($500)\nDoc fee: $70";
    const parsed = applyDealerQuoteFacts(
      fields({ salePrice: 28000, rebates: 9000, apr: 3.9, termMonths: 72 }),
      parseDealerQuoteFacts(text),
    );
    expect(parsed.rebates).toBe(500);
    expect(parsed.apr).toBeNull();
    expect(parsed.termMonths).toBeNull();
    expect(parsed.salePrice).toBe(28000);
  });

  it("computes the same out-the-door price and principal for every money format", () => {
    const parts = { sale: 28000, doc: 70, tax: 2170, title: 15, reg: 400, down: 2000 };
    const expectedOtd = 28000 + 70 + 2170 + 15 + 400;
    const expectedPrincipal = expectedOtd - 2000;
    const decimal = { sale: 28000.5, doc: 70.5, tax: 2170.5, title: 15.5, reg: 400.5, down: 2000.5 };
    const expectedDecimalOtd = 28000.5 + 70.5 + 2170.5 + 15.5 + 400.5;
    const expectedDecimalPrincipal = expectedDecimalOtd - 2000.5;

    function ocr(amount: number): string {
      const body = amount.toLocaleString("en-US").replace(/0/g, "O").replace(/1/g, "l");
      return `S${body}`;
    }

    function quote(fmt: (amount: number) => string, values: typeof parts): string {
      return [
        `Selling price: ${fmt(values.sale)}`,
        `Doc fee: ${fmt(values.doc)}`,
        `Sales tax: ${fmt(values.tax)}`,
        `Title fee: ${fmt(values.title)}`,
        `Registration: ${fmt(values.reg)}`,
        `Down payment: ${fmt(values.down)}`,
        `Amount financed: ${fmt(values.sale + values.doc + values.tax + values.title + values.reg - values.down)}`,
      ].join("\n");
    }

    function wrapped(values: typeof parts): string {
      const row = (label: string, amount: number) => `${label}\t"$\n${amount}"`;
      const principal = values.sale + values.doc + values.tax + values.title + values.reg - values.down;
      return [
        row("Selling price", values.sale),
        row("Doc fee", values.doc),
        row("Sales tax", values.tax),
        row("Title fee", values.title),
        row("Registration", values.reg),
        row("Down payment", values.down),
        row("Amount financed", principal),
      ].join("\n");
    }

    function outcome(text: string) {
      const enriched = enrichDetectedFields(fields(), text);
      const applied = applyDealerQuoteFacts(enriched, parseDealerQuoteFacts(text));
      const split = splitFees(applied.fees ?? [], (name) => matchesExtractedDocFeeLabel(name));
      const math = computePurchase({
        vehiclePrice: applied.salePrice,
        rebates: applied.rebates,
        docFee: split.docFee,
        addOns: split.addOns,
        titleFee: split.titleFee,
        registrationFee: split.registrationFee,
        govFees: split.govFees,
        salesTaxAmount: split.statedTax,
        downPayment: applied.downPayment,
      });
      return { applied, split, math };
    }

    const integerQuotes = [
      quote((amount) => `$${amount.toLocaleString("en-US")}`, parts),
      quote((amount) => `USD ${amount}`, parts),
      quote((amount) => String(amount), parts),
      quote(ocr, parts),
      wrapped(parts),
    ];
    for (const text of integerQuotes) {
      const result = outcome(text);
      expect(result.math.ok, text).toBe(true);
      expect(result.math.outTheDoor, text).toBe(expectedOtd);
      expect(result.math.amountFinanced, text).toBe(expectedPrincipal);
      expect(result.applied.taxes, text).toBe(2170);
      expect(result.applied.titleFee, text).toBe(15);
      expect(result.applied.registrationFee, text).toBe(400);
      expect(result.split.docFee, text).toBe(70);
      expect(result.split.addOns, text).toBe(0);
      expect(classifyFeeBucket("Sales tax")).toBe("tax");
      expect(classifyFeeBucket("Title fee")).toBe("title");
      expect(classifyFeeBucket("Registration")).toBe("registration");
      expect(result.applied.fees.some((fee) => /financed|principal/i.test(fee.name)), text).toBe(false);
      const financedLine = prepareQuoteText(text).split("\n").find((line) => /financed/i.test(line));
      expect(financedLine, text).toBeTruthy();
      expect(scanMoney(financedLine ?? "").map((span) => span.amount), text).toEqual([expectedPrincipal]);
    }

    const decimalQuotes = [
      quote((amount) => `$${amount.toLocaleString("en-US")}`, decimal),
      quote((amount) => `USD ${amount}`, decimal),
      quote((amount) => String(amount), decimal),
      quote(ocr, decimal),
      wrapped(decimal),
    ];
    for (const text of decimalQuotes) {
      const result = outcome(text);
      expect(result.math.ok, text).toBe(true);
      expect(result.math.outTheDoor, text).toBe(expectedDecimalOtd);
      expect(result.math.amountFinanced, text).toBe(expectedDecimalPrincipal);
      expect(result.split.addOns, text).toBe(0);
    }
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
