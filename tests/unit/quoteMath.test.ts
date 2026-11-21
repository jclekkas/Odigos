import { describe, expect, it } from "vitest";
import { checkDocFeeCap, applyRuleEngine } from "../../server/ruleEngine.js";
import { getStateFeeData } from "../../server/stateFeeLookup.js";
import {
  amortizingPayment,
  computePurchase,
  roundCents,
  splitFees,
} from "../../server/quoteMath.js";
import type { AnalysisResponse, DetectedFields, Fee } from "../../shared/schema.js";

/**
 * Hand-calculated purchase math.
 *
 * Tax assumption used below, matching the public OTD page: sales tax is
 * vehicle price minus rebates, minus the trade-in allowance only when
 * tradeInTaxCredit is true. Doc fees, add-ons, title, and registration are
 * not taxed. Whether a state gives a trade-in credit is taken from
 * data/state_fees.json and is marked below when that flag was not re-fetched
 * for this test.
 *
 * Verified rates (see docs/STATE_FEE_AUDIT.md):
 * - California statewide rate 7.25% (CDTFA).
 * - Iowa state rate 6% (Iowa Department of Revenue).
 * - Florida general rate 6% (Florida Department of Revenue).
 * - Oregon has no general sales tax (Oregon Department of Revenue).
 * Montana, New Hampshire, and Delaware are 0 in the dataset. Those three
 * rates were not re-fetched for this file; the tests treat 0 as the dataset
 * value, not as a new citation.
 */

const llm = {
  dealScore: "GREEN",
  confidenceLevel: "HIGH",
  verdictLabel: "PROCEED",
  goNoGo: "GO",
  summary: "fixture",
  detectedFields: {} as DetectedFields,
  missingInfo: [],
  suggestedReply: "fixture",
  reasoning: "fixture",
} as AnalysisResponse;

function fields(partial: Partial<DetectedFields>): DetectedFields {
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
    ...partial,
  };
}

describe("roundCents", () => {
  it("rounds half a cent up and repairs the binary 1.005 case", () => {
    // 1.005 cannot be stored exactly in binary. Without a nudge, 1.005 * 100
    // is 100.49999999999999 and Math.round drops it to 100 ($1.00).
    expect(roundCents(1.005)).toBe(1.01);
    expect(roundCents(1.015)).toBe(1.02);
    // 2.675 × 100 = 267.5, and half rounds away from zero → 268 cents.
    expect(roundCents(2.675)).toBe(2.68);
    expect(roundCents(-1.005)).toBe(-1.01);
  });
});

describe("sales tax and out-the-door total", () => {
  it("matches the published $28,500 example at 7%", () => {
    // Tax = 28500 × 0.07 = 1995.00 exactly.
    // OTD = 28500 + 1995 + 75 + 210 + 399 + 595 = 31774.00.
    const result = computePurchase({
      vehiclePrice: 28500,
      salesTaxRate: 0.07,
      titleFee: 75,
      registrationFee: 210,
      docFee: 399,
      addOns: 595,
    });
    expect(result.ok).toBe(true);
    expect(result.taxablePrice).toBe(28500);
    expect(result.salesTax).toBe(1995);
    expect(result.outTheDoor).toBe(31774);
  });

  it("taxes a California purchase at 7.25% with no trade-in credit", () => {
    // Dataset note (not re-fetched here): California does not subtract a trade-in.
    // Tax = 20000 × 0.0725 = 1450.00.
    // The $5,000 trade still lowers what the buyer pays, but not the tax.
    // OTD = 20000 − 5000 + 1450 + 85 + 25 + 150 = 16710.
    const ca = getStateFeeData("CA")!;
    expect(ca.stateSalesTaxRate).toBe(0.0725);
    expect(ca.tradeInTaxCredit).toBe(false);
    const result = computePurchase({
      vehiclePrice: 20000,
      tradeInAllowance: 5000,
      tradePayoff: 0,
      docFee: 85,
      titleFee: 25,
      registrationFee: 150,
      salesTaxRate: ca.stateSalesTaxRate,
      tradeInTaxCredit: ca.tradeInTaxCredit,
    });
    expect(result.salesTax).toBe(1450);
    expect(result.outTheDoor).toBe(16710);
    expect(result.negativeEquity).toBe(0);
  });

  it("uses Iowa's 6% rate and subtracts a same-transaction trade-in", () => {
    // Dataset: Iowa allows a trade-in credit. The 6% rate was fetched from
    // the Iowa Department of Revenue. The credit rule itself is the dataset
    // note, not a statute opened for this test.
    // Taxable = 30000 − 1000 rebate − 8000 allowance = 21000.
    // Tax = 21000 × 0.06 = 1260.
    // OTD = 21000 + 1260 + 180 doc + 15 title + 50 registration = 22505.
    // Payoff 10000 is not in the OTD. Negative equity = 10000 − 8000 = 2000.
    // Amount financed with $2,000 down = 22505 + 10000 − 2000 = 30505.
    const ia = getStateFeeData("IA")!;
    expect(ia.stateSalesTaxRate).toBe(0.06);
    expect(ia.tradeInTaxCredit).toBe(true);
    const result = computePurchase({
      vehiclePrice: 30000,
      rebates: 1000,
      tradeInAllowance: 8000,
      tradePayoff: 10000,
      docFee: 180,
      titleFee: 15,
      registrationFee: 50,
      downPayment: 2000,
      salesTaxRate: ia.stateSalesTaxRate,
      tradeInTaxCredit: ia.tradeInTaxCredit,
    });
    expect(result.taxablePrice).toBe(21000);
    expect(result.salesTax).toBe(1260);
    expect(result.outTheDoor).toBe(22505);
    expect(result.negativeEquity).toBe(2000);
    expect(result.amountFinanced).toBe(30505);
  });

  it("does not tax doc fees or add-ons", () => {
    // Tax = 10000 × 0.06 = 600, not 6% of (10000 + 500 + 400).
    // OTD = 10000 + 600 + 500 + 400 + 76 + 225 = 11801.
    const result = computePurchase({
      vehiclePrice: 10000,
      salesTaxRate: 0.06,
      docFee: 500,
      addOns: 400,
      titleFee: 76,
      registrationFee: 225,
    });
    expect(result.salesTax).toBe(600);
    expect(result.outTheDoor).toBe(11801);
  });

  it("charges no sales tax in Oregon, Montana, New Hampshire, and Delaware", () => {
    // Oregon's $0 rate was fetched from the Department of Revenue.
    // Montana, New Hampshire, and Delaware are $0 in the dataset and were
    // not re-fetched here. Oregon's privilege tax on some out-of-state
    // purchases is not in this worksheet.
    for (const code of ["OR", "MT", "NH", "DE"] as const) {
      const state = getStateFeeData(code)!;
      expect(state.stateSalesTaxRate, code).toBe(0);
      const result = computePurchase({
        vehiclePrice: 25000,
        docFee: 200,
        titleFee: 100,
        registrationFee: 100,
        salesTaxRate: state.stateSalesTaxRate,
        tradeInTaxCredit: state.tradeInTaxCredit,
        tradeInAllowance: 4000,
      });
      // OTD = 25000 − 4000 + 0 tax + 200 + 100 + 100 = 21400.
      expect(result.salesTax, code).toBe(0);
      expect(result.outTheDoor, code).toBe(21400);
    }
  });

  it("keeps a Texas trade-in out of the tax base only because the dataset says so", () => {
    // Texas rate 6.25% is the dataset value (not re-fetched in the math pass).
    // tradeInTaxCredit is true in the dataset. That flag was not re-fetched.
    // Taxable = 25000 − 5000 = 20000. Tax = 20000 × 0.0625 = 1250.
    // OTD = 20000 + 1250 + 150 doc = 21400.
    const tx = getStateFeeData("TX")!;
    expect(tx.tradeInTaxCredit).toBe(true);
    const result = computePurchase({
      vehiclePrice: 25000,
      tradeInAllowance: 5000,
      docFee: 150,
      salesTaxRate: tx.stateSalesTaxRate,
      tradeInTaxCredit: tx.tradeInTaxCredit,
    });
    expect(result.salesTax).toBe(1250);
    expect(result.outTheDoor).toBe(21400);
  });

  it("floors tax at zero when a rebate is larger than the price", () => {
    const result = computePurchase({
      vehiclePrice: 500,
      rebates: 800,
      salesTaxRate: 0.07,
      docFee: 85,
    });
    expect(result.taxablePrice).toBe(-300);
    expect(result.salesTax).toBe(0);
    // OTD = 500 − 800 + 0 + 85 = −215. The dealer would owe the buyer.
    expect(result.outTheDoor).toBe(-215);
  });

  it("rounds a tax that is not an even cent", () => {
    // 12345.67 × 0.0725 = 895.061075 → 895.06.
    const result = computePurchase({
      vehiclePrice: 12345.67,
      salesTaxRate: 0.0725,
    });
    expect(result.salesTax).toBe(895.06);
    expect(result.outTheDoor).toBe(13240.73);
  });
});

describe("monthly payment", () => {
  it("divides the principal evenly at 0% APR", () => {
    // 10000 / 60 = 166.666... → 166.67.
    expect(amortizingPayment(10000, 0, 60)).toBe(166.67);
    // 100 / 3 = 33.333... → 33.33.
    expect(amortizingPayment(100, 0, 3)).toBe(33.33);
  });

  it("uses the standard amortization formula at 6% for 60 months", () => {
    // Monthly rate r = 0.06 / 12 = 0.005.
    // (1.005)^60 = 1.3488501525493075.
    // Payment = 20000 × 0.005 × 1.3488501525493075 / (1.3488501525493075 − 1)
    //         = 386.6560305885654 → 386.66.
    expect(amortizingPayment(20000, 6, 60)).toBe(386.66);
  });

  it("finances the out-the-door price minus the down payment", () => {
    // OTD from the published example is 31774. Down payment 2000.
    // Principal = 29774.
    // r = 0.049 / 12 = 0.004083333333333333.
    // (1+r)^60 = 1.2769841297187767.
    // Raw payment = 560.5090534505938 → 560.51.
    const result = computePurchase({
      vehiclePrice: 28500,
      salesTaxRate: 0.07,
      titleFee: 75,
      registrationFee: 210,
      docFee: 399,
      addOns: 595,
      downPayment: 2000,
      apr: 4.9,
      termMonths: 60,
    });
    expect(result.outTheDoor).toBe(31774);
    expect(result.amountFinanced).toBe(29774);
    expect(result.monthlyPayment).toBe(560.51);
  });

  it("adds the old-loan payoff on top of a positive-equity trade", () => {
    // Allowance 10000, payoff 4000. Equity is 6000, so negative equity is 0.
    // OTD already subtracts the whole 10000 allowance.
    // Amount financed = OTD + 4000 payoff − 0 down.
    // Price 20000, no tax, no fees: OTD = 10000. Financed = 14000.
    const result = computePurchase({
      vehiclePrice: 20000,
      tradeInAllowance: 10000,
      tradePayoff: 4000,
      salesTaxRate: 0,
    });
    expect(result.negativeEquity).toBe(0);
    expect(result.outTheDoor).toBe(10000);
    expect(result.amountFinanced).toBe(14000);
  });

  it("rejects a negative APR, a zero term, and a fractional term", () => {
    expect(amortizingPayment(10000, -1, 60)).toBeNull();
    expect(amortizingPayment(10000, 5, 0)).toBeNull();
    expect(amortizingPayment(10000, 5, 60.5)).toBeNull();
  });
});

describe("edges and contradictions", () => {
  it("rejects a missing or negative vehicle price", () => {
    expect(computePurchase({ vehiclePrice: null }).reason).toMatch(/missing/);
    expect(computePurchase({ vehiclePrice: -1 }).ok).toBe(false);
  });

  it("rejects negative fees instead of treating them as discounts", () => {
    expect(computePurchase({ vehiclePrice: 10000, docFee: -50 }).ok).toBe(false);
    expect(computePurchase({ vehiclePrice: 10000, tradePayoff: -1 }).ok).toBe(false);
  });

  it("accepts a zero price and still adds the fees", () => {
    const result = computePurchase({
      vehiclePrice: 0,
      docFee: 85,
      salesTaxRate: 0.0725,
    });
    expect(result.salesTax).toBe(0);
    expect(result.outTheDoor).toBe(85);
    expect(result.monthlyPayment).toBeNull();
  });

  it("computes a huge but finite price without overflowing the cent", () => {
    // 9999999.99 × 0.06 = 599999.9994 → 600000.00.
    // OTD = 9999999.99 + 600000.00 = 10599999.99.
    const result = computePurchase({
      vehiclePrice: 9999999.99,
      salesTaxRate: 0.06,
    });
    expect(result.salesTax).toBe(600000);
    expect(result.outTheDoor).toBe(10599999.99);
  });

  it("reports how far a stated out-the-door price is from the parts", () => {
    const result = computePurchase({
      vehiclePrice: 28500,
      salesTaxRate: 0.07,
      titleFee: 75,
      registrationFee: 210,
      docFee: 399,
      addOns: 595,
      statedOutTheDoor: 30000,
    });
    expect(result.outTheDoor).toBe(31774);
    // 30000 − 31774 = −1774.
    expect(result.outTheDoorMismatch).toBe(-1774);
  });

  it("reports a stated payment that is not the amortizing payment", () => {
    const result = computePurchase({
      vehiclePrice: 20000,
      salesTaxRate: 0,
      apr: 6,
      termMonths: 60,
      statedMonthlyPayment: 300,
    });
    expect(result.monthlyPayment).toBe(386.66);
    // 300 − 386.66 = −86.66.
    expect(result.paymentMismatch).toBe(-86.66);
  });

  it("does not call a doc fee over the cap in a state with no cap", () => {
    const fl = getStateFeeData("FL")!;
    expect(fl.docFeeCap).toBe(false);
    expect(checkDocFeeCap([{ name: "doc fee", amount: 999 }], fl)).toBeNull();
  });

  it("flags a California doc fee of $199 against the $85 cap", () => {
    const ca = getStateFeeData("CA")!;
    const cap = checkDocFeeCap([{ name: "documentation fee", amount: 199 }], ca);
    expect(cap?.violated).toBe(true);
    expect(cap?.capAmount).toBe(85);
    expect(cap?.overage).toBe(114);
  });
});

describe("splitFees", () => {
  it("keeps tax, title, registration, payoff, and the doc fee apart from add-ons", () => {
    const fees: Fee[] = [
      { name: "Sales tax", amount: 1450 },
      { name: "Title fee", amount: 25 },
      { name: "Registration", amount: 150 },
      { name: "Doc fee", amount: 85 },
      { name: "Paint protection", amount: 595 },
      { name: "Trade payoff", amount: 4000 },
    ];
    const split = splitFees(fees, (name) => name.includes("doc fee"));
    expect(split.statedTax).toBe(1450);
    expect(split.titleFee).toBe(25);
    expect(split.registrationFee).toBe(150);
    expect(split.docFee).toBe(85);
    expect(split.addOns).toBe(595);
    expect(split.tradePayoff).toBe(4000);
  });
});

describe("rule engine sees a quote that contradicts itself", () => {
  it("does not invent a tax line for quotes that never itemized tax", () => {
    // The existing golden shape: a price, an OTD, and a doc fee, but no tax
    // line. That must stay a clean GO. Local tax is not the state base rate.
    const parsed = fields({
      salePrice: 32000,
      outTheDoorPrice: 36000,
      apr: 4.9,
      termMonths: 60,
      fees: [{ name: "doc fee", amount: 85 }],
    });
    const cap = checkDocFeeCap(parsed.fees, getStateFeeData("CA")!);
    const result = applyRuleEngine(llm, parsed, cap, "finance");
    expect(result.goNoGo).toBe("GO");
  });

  it("returns need-more-info when the stated out-the-door price is not the sum of the lines", () => {
    // Lines: 28500 + tax 1995 + title 75 + registration 210 + doc 399 + addon 595
    //      = 31774.
    // The quote says the out-the-door price is 30000. Difference = 1774.
    const parsed = fields({
      salePrice: 28500,
      outTheDoorPrice: 30000,
      apr: 4.9,
      termMonths: 60,
      fees: [
        { name: "sales tax", amount: 1995 },
        { name: "title fee", amount: 75 },
        { name: "registration", amount: 210 },
        { name: "doc fee", amount: 399 },
        { name: "paint protection", amount: 595 },
      ],
    });
    const result = applyRuleEngine(llm, parsed, null, "finance");
    expect(result.goNoGo).toBe("NEED-MORE-INFO");
    expect(result.verdictLabel.toUpperCase()).toContain("DOESN'T ADD UP");
  });

  it("returns need-more-info when the monthly payment is not the amortizing payment", () => {
    // OTD 20000, no down payment, 6% for 60 months → 386.66.
    // The quote says $300.
    const parsed = fields({
      salePrice: 20000,
      outTheDoorPrice: 20000,
      apr: 6,
      termMonths: 60,
      monthlyPayment: 300,
      fees: [{ name: "sales tax", amount: 0 }],
    });
    const result = applyRuleEngine(llm, parsed, null, "finance");
    expect(result.goNoGo).toBe("NEED-MORE-INFO");
    expect(result.verdictLabel.toUpperCase()).toContain("PAYMENT");
  });

  it("keeps a doc-fee cap violation ahead of a bad total", () => {
    const parsed = fields({
      salePrice: 20000,
      outTheDoorPrice: 1,
      fees: [
        { name: "sales tax", amount: 1450 },
        { name: "doc fee", amount: 199 },
      ],
    });
    const cap = checkDocFeeCap(parsed.fees, getStateFeeData("CA")!);
    const result = applyRuleEngine(llm, parsed, cap, "finance");
    expect(result.goNoGo).toBe("NO-GO");
    expect(result.verdictLabel.toUpperCase()).toContain("DOC FEE");
  });
});
