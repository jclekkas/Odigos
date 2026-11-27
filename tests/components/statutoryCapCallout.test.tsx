// @vitest-environment jsdom
import "@testing-library/jest-dom";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import StatutoryCapCallout from "../../client/src/components/results/StatutoryCapCallout.js";
import { classifyDocFee } from "../../server/regulatoryClassification.js";
import { getStateFeeData } from "../../server/stateFeeLookup.js";

describe("StatutoryCapCallout", () => {
  it("shows a verified violation as a legal cap", () => {
    const assessment = classifyDocFee(
      [{ name: "doc fee", amount: 199 }],
      getStateFeeData("CA"),
      null,
      null,
      { asOf: "2026-11-27" },
    );
    render(<StatutoryCapCallout docFeeAssessment={assessment} />);
    const callout = screen.getByTestId("statutory-cap-callout");
    expect(callout).toHaveTextContent("exceeds the legal cap");
    expect(callout).toHaveTextContent("$85");
    expect(callout).toHaveTextContent("California");
  });

  it("does not call an unverified Illinois fee a legal violation", () => {
    const assessment = classifyDocFee(
      [{ name: "doc fee", amount: 500 }],
      getStateFeeData("IL"),
      null,
      null,
      { asOf: "2026-11-27" },
    );
    render(<StatutoryCapCallout docFeeAssessment={assessment} />);
    const callout = screen.getByTestId("statutory-cap-unverified");
    expect(callout).toHaveTextContent(/high/i);
    expect(callout).toHaveTextContent(/could not be verified/i);
    expect(callout.textContent ?? "").not.toMatch(/\billegal\b|exceeds the legal cap/i);
    expect(screen.queryByTestId("statutory-cap-callout")).not.toBeInTheDocument();
  });
});
