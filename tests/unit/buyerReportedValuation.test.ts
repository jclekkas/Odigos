import { describe, expect, it } from "vitest";
import { buildBuyerReported, buyerReportedRuleOptions, median } from "../../server/buyerReportedValuation.js";
import { applyRuleEngine } from "../../server/ruleEngine.js";
import { getStateFeeData } from "../../server/stateFeeLookup.js";
import type { AnalysisResponse, DetectedFields } from "../../shared/schema.js";

const stateData = getStateFeeData("CA");

function fields(salePrice = 32000, partial: Partial<DetectedFields> = {}): DetectedFields {
  const doc = 70;
  const tax = 2000;
  const registration = 400;
  return {
    salePrice,
    msrp: null,
    rebates: null,
    fees: [
      { name: "Doc fee", amount: doc },
      { name: "Sales tax", amount: tax },
      { name: "Registration", amount: registration },
    ],
    outTheDoorPrice: salePrice + doc + tax + registration,
    monthlyPayment: null,
    tradeInValue: null,
    apr: null,
    termMonths: null,
    downPayment: null,
    vehicle_make: "Toyota",
    vehicle_model: "Camry LE",
    vehicle_year: 2024,
    ...partial,
  };
}

const llm = {
  dealScore: "GREEN",
  confidenceLevel: "HIGH",
  verdictLabel: "GO — TERMS LOOK CLEAN",
  goNoGo: "GO",
  summary: "This deal appears broadly fair.",
  detectedFields: {} as DetectedFields,
  missingInfo: [],
  suggestedReply: "The price looks good.",
  reasoning: "Price appears fair.",
} as AnalysisResponse;

function analyze(quote: DetectedFields, report = buildBuyerReported({ salePrice: quote.salePrice, primary: quote })) {
  const options = buyerReportedRuleOptions(report);
  return applyRuleEngine(llm, quote, null, "cash", null, { stateData, ...options });
}

describe("buyer-reported valuation", () => {
  it("computes a median", () => {
    expect(median([28000, 30000, 29000])).toBe(29000);
    expect(median([28000, 30000])).toBe(29000);
  });

  it("says the quote is above 3 of the 3 listings and does not unlock GO", () => {
    const quote = fields(32000);
    const report = buildBuyerReported({
      salePrice: quote.salePrice,
      primary: quote,
      comps: [
        { askingPrice: 28000, source: "dealer site", mileage: 5000 },
        { askingPrice: 29000, url: "https://example.com/a" },
        { askingPrice: 30000, source: "cars.com", mileage: 8000 },
      ],
    });
    expect(report.label).toBe("buyer-reported");
    expect(report.verifiesMarketValue).toBe(false);
    expect(report.citationStatus).toBe("needs_source");
    expect(report.comps?.position).toBe("above_all");
    expect(report.comps?.aboveCount).toBe(3);
    expect(report.comps?.min).toBe(28000);
    expect(report.comps?.max).toBe(30000);
    expect(report.comps?.median).toBe(29000);
    expect(report.comps?.summary).toMatch(/above 3 of the 3 listings you entered/i);
    expect(report.comps?.summary).toMatch(/not guaranteed savings/i);
    expect(report.summary).not.toMatch(/you save|overpaying by/i);

    const result = analyze(quote, report);
    expect(result.goNoGo).not.toBe("GO");
    expect(result.goNoGo).toBe("PROCEED-WITH-CAUTION");
    expect(result.verdictLabel).toMatch(/ABOVE THE LISTINGS YOU ENTERED/);
    expect(result.marketValuation?.status).toBe("unverified");
    expect(result.marketValuation?.low).toBeNull();
    expect(result.summary).toMatch(/above 3 of the 3 listings you entered/i);
    expect(result.summary).toMatch(/buyer-reported/i);
  });

  it("places a quote inside the listings without unlocking GO", () => {
    const quote = fields(29000);
    const report = buildBuyerReported({
      salePrice: quote.salePrice,
      primary: quote,
      comps: [{ askingPrice: 28000 }, { askingPrice: 30000 }, { askingPrice: 31000 }],
    });
    expect(report.comps?.position).toBe("inside");
    expect(report.comps?.aboveCount).toBe(1);
    expect(report.comps?.summary).toMatch(/above 1 of the 3 listings you entered/i);
    const result = analyze(quote, report);
    expect(result.goNoGo).not.toBe("GO");
    expect(result.marketValuation?.status).toBe("unverified");
    expect(result.verdictLabel).not.toMatch(/ABOVE THE LISTINGS/);
  });

  it("places a quote below every listing without unlocking GO", () => {
    const quote = fields(27000);
    const report = buildBuyerReported({
      salePrice: quote.salePrice,
      primary: quote,
      comps: [{ askingPrice: 30000 }, { askingPrice: 31000 }, { askingPrice: 32000 }],
    });
    expect(report.comps?.position).toBe("below_all");
    expect(report.comps?.aboveCount).toBe(0);
    expect(report.comps?.summary).toMatch(/below every listing you entered/i);
    const result = analyze(quote, report);
    expect(result.goNoGo).not.toBe("GO");
    expect(result.dealScore).not.toBe("GREEN");
    expect(result.marketValuation?.status).toBe("unverified");
  });

  it("records a buyer-entered book value as needs_source and does not fetch it", () => {
    const quote = fields(32000);
    const report = buildBuyerReported({
      salePrice: quote.salePrice,
      primary: quote,
      bookValue: { amount: 27500, sourceLabel: "Edmunds" },
    });
    expect(report.bookValue).toMatchObject({
      amount: 27500,
      sourceLabel: "Edmunds",
      relation: "above",
      citationStatus: "needs_source",
    });
    expect(report.bookValue?.summary).toMatch(/did not look that up/i);
    expect(report.bookValue?.summary).toMatch(/needs_source/);
    expect(report.bookValue?.summary).toMatch(/not guaranteed savings/i);
    const result = analyze(quote, report);
    expect(result.goNoGo).not.toBe("GO");
    expect(result.marketValuation?.status).toBe("unverified");
    expect(result.summary).toMatch(/Edmunds/);
    expect(result.summary).toMatch(/needs_source/);
  });

  it("compares a competing quote whose documentation fee is higher", () => {
    const quote = fields(32000, {
      fees: [
        { name: "Doc fee", amount: 199 },
        { name: "Sales tax", amount: 2000 },
        { name: "Registration", amount: 400 },
        { name: "Paint protection", amount: 500 },
      ],
      outTheDoorPrice: 35099,
    });
    const competing = [
      "Selling price: $31,000",
      "Doc fee: $899",
      "Paint protection: $500",
      "Sales tax: $2,000",
      "Registration: $400",
      "Out the door: $34,799",
    ].join("\n");
    const report = buildBuyerReported({
      salePrice: quote.salePrice,
      primary: quote,
      primaryText: "Selling price $32,000. Doc fee $199. Paint protection $500. Sales tax $2,000. Registration $400. Out the door $35,099.",
      competingQuoteText: competing,
    });
    expect(report.competingQuote?.status).toBe("compared");
    expect(report.competingQuote?.citationStatus).toBe("needs_source");
    const doc = report.competingQuote?.lines.find((line) => line.key === "docFee");
    expect(doc).toMatchObject({ thisQuote: 199, otherQuote: 899 });
    const selling = report.competingQuote?.lines.find((line) => line.key === "sellingPrice");
    expect(selling).toMatchObject({ thisQuote: 32000, otherQuote: 31000 });
    const addOns = report.competingQuote?.lines.find((line) => line.key === "addOns");
    expect(addOns?.thisQuote).toBe(500);
    expect(addOns?.otherQuote).toBe(500);
    const tax = report.competingQuote?.lines.find((line) => line.key === "taxAndFees");
    expect(tax?.thisQuote).toBe(2400);
    expect(tax?.otherQuote).toBe(2400);
    const otd = report.competingQuote?.lines.find((line) => line.key === "outTheDoor");
    expect(otd).toMatchObject({ thisQuote: 35099, otherQuote: 34799 });
    expect(report.competingQuote?.summary).toMatch(/documentation fee is \$700 higher/i);
    expect(report.competingQuote?.summary).toMatch(/buyer-reported/i);
    expect(report.competingQuote?.summary).toMatch(/not guaranteed savings/i);
    const result = analyze(quote, report);
    expect(result.goNoGo).not.toBe("GO");
    expect(result.marketValuation?.status).toBe("unverified");
  });
});
