// @vitest-environment jsdom
import "@testing-library/jest-dom";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import FinancialImpactHero from "../../client/src/components/results/FinancialImpactHero.js";

describe("FinancialImpactHero valuation source", () => {
  it("shows the adapter reference when market value is verified", () => {
    render(
      <FinancialImpactHero
        overpaymentMin={0}
        overpaymentMax={0}
        confidence="high"
        financialSummary="Independent market valuation $26,000–$30,000."
        fallbackSummary="Market value not verified."
        marketValueStatus="verified"
        benchmarkKind="market_transaction"
        sourceReference="test-only://odigos/trusted-valuation/2025-toyota-camry-le"
      />,
    );
    expect(screen.getByTestId("valuation-source-reference")).toHaveTextContent(
      "test-only://odigos/trusted-valuation/2025-toyota-camry-le",
    );
  });

  it("does not show a source line when market value is unverified", () => {
    render(
      <FinancialImpactHero
        overpaymentMin={null}
        overpaymentMax={null}
        confidence={null}
        financialSummary="Market value not verified."
        fallbackSummary="Market value not verified."
        marketValueStatus="unverified"
      />,
    );
    expect(screen.queryByTestId("valuation-source-reference")).not.toBeInTheDocument();
  });
});
