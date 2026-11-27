import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import BuyerReportedCard from "../../client/src/components/results/BuyerReportedCard.js";
import type { BuyerReported, VinCheck } from "../../shared/buyerReported.js";

const mismatch: VinCheck = {
  status: "decoded",
  provenance: "quote",
  source: "nhtsa_vpic",
  vin: "4T1G11AK5NU123456",
  decoded: { year: 2023, make: "TOYOTA", model: "Camry", trim: "LE", trim2: null, series: null },
  mismatches: [
    { field: "year", quoteValue: "2025", decodedValue: "2023" },
    { field: "trim", quoteValue: "XLE", decodedValue: "LE" },
  ],
  basePrice: {
    amount: 26320,
    label: "Base price for standard equipment",
    detail: "It is not the MSRP with options and it is not a market value.",
    citation: "NHTSA vPIC DecodeVinValues BasePrice.",
    citationStatus: "sourced",
  },
  errorText: null,
  summary: "The quote says 2025 Toyota Camry XLE, but the VIN decodes to a 2023 Toyota Camry LE.",
};

const reported: BuyerReported = {
  label: "buyer-reported",
  verifiesMarketValue: false,
  citationStatus: "needs_source",
  comps: {
    count: 3,
    min: 28000,
    max: 30000,
    median: 29000,
    aboveCount: 3,
    position: "above_all",
    listings: [
      { askingPrice: 28000, url: "https://example.com/a", source: "dealer site", mileage: 12000 },
      { askingPrice: 29000, url: null, source: null, mileage: null },
      { askingPrice: 30000, url: null, source: "cars.com", mileage: null },
    ],
    summary: "Your quote is above 3 of the 3 listings you entered. Those listings are buyer-reported and are not a verified market value. The dollar gap is not guaranteed savings.",
  },
  bookValue: {
    amount: 27500,
    sourceLabel: "Edmunds",
    relation: "above",
    citationStatus: "needs_source",
    summary: "You entered a book value of $27,500 from Edmunds. It is buyer-reported and needs_source.",
  },
  competingQuote: {
    status: "compared",
    citationStatus: "needs_source",
    lines: [
      { key: "docFee", label: "Documentation fee", thisQuote: 199, otherQuote: 899, detail: null },
    ],
    summary: "The other quote's documentation fee is $700 higher. It is buyer-reported and needs_source.",
  },
  summary: "buyer-reported",
};

describe("BuyerReportedCard", () => {
  it("shows a VIN mismatch, base price, comps, book value, and the other doc fee", () => {
    render(<BuyerReportedCard vinCheck={mismatch} buyerReported={reported} />);
    expect(screen.getByTestId("text-buyer-reported-result-note")).toHaveTextContent(/does not treat them as a verified market value/i);
    expect(screen.getByTestId("vin-mismatch-year")).toHaveTextContent("2025");
    expect(screen.getByTestId("vin-mismatch-trim")).toHaveTextContent("XLE");
    expect(screen.getByTestId("vin-base-price")).toHaveTextContent(/Base price for standard equipment/i);
    expect(screen.getByTestId("vin-base-price")).toHaveTextContent(/not the MSRP with options/i);
    expect(screen.getByTestId("buyer-comps-summary")).toHaveTextContent(/above 3 of the 3 listings you entered/i);
    expect(screen.getByTestId("buyer-book-summary")).toHaveTextContent(/needs_source/);
    expect(screen.getByTestId("competing-line-docFee")).toHaveTextContent("$899");
    expect(screen.getByTestId("competing-quote-summary")).toHaveTextContent(/\$700 higher/);
  });
});
