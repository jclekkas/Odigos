// @vitest-environment jsdom
import "@testing-library/jest-dom";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import LeaseMathBlock from "../../client/src/components/LeaseMathBlock.js";
import type { LeaseMathResult } from "@shared/schema";

const unverified = {
  apr: 4.32,
  rateMarkup: null,
  paymentValidation: null,
  residualCheck: null,
  acquisitionFeeBenchmark: {
    charged: 795,
    brandStandard: 595,
    overage: 200,
    isMarkedUp: false,
    verification: "unverified",
    classification: "unverified_difference",
    informationalOnly: true,
    canUnlockGo: false,
    sourceStatus: "needs_source",
  },
  brandMatched: "Honda",
  buyerBenchmark: {
    verification: "unverified",
    sourceStatus: "needs_source",
    informationalOnly: true,
    canUnlockGo: false,
    moneyFactorDifference: 0.0011,
    acquisitionFeeDifference: 200,
    note: "Honda buyer benchmarks are unverified (needs_source).",
  },
} as LeaseMathResult;

describe("LeaseMathBlock", () => {
  it("does not call an unverified buyer benchmark a markup", () => {
    render(<LeaseMathBlock leaseMath={unverified} />);
    expect(screen.getByTestId("lease-math-block").textContent).toMatch(/cannot support a GO/i);
    expect(screen.getByTestId("lease-math-block").textContent).not.toMatch(/markup/i);
  });

  it("shows a buy rate only when the quote itself printed one", () => {
    render(
      <LeaseMathBlock
        leaseMath={{
          ...unverified,
          buyerBenchmark: null,
          acquisitionFeeBenchmark: null,
          rateMarkup: {
            dealerAPR: 4.8,
            buyRateAPR: 2.4,
            markupAPR: 2.4,
            markupPerMonth: 62,
            totalMarkupDollars: 2232,
          },
          worksheet: {
            disclosedMarkup: {
              chargedMoneyFactor: 0.002,
              buyRateMoneyFactor: 0.001,
              extraRentOverTerm: 2232,
            },
          },
        } as LeaseMathResult}
      />,
    );
    expect(screen.getByText(/Buy rate printed on the quote/i)).toBeInTheDocument();
  });
});
