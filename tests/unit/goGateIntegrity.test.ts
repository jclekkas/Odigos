import { readFileSync } from "fs";
import { resolve } from "path";
import { describe, expect, it } from "vitest";
import { applyRuleEngine, regulatoryGoDecision } from "../../server/ruleEngine.js";
import { getStateFeeData } from "../../server/stateFeeLookup.js";
import { amortizingPayment } from "../../server/quoteMath.js";
import { benchmarkQualifiesAsVerified } from "../../server/marketValuation.js";
import { createTestTrustedValuationAdapter, withValuationAdapters } from "../../server/valuationAdapters.js";
import { resolveConditionalFeeFacts } from "../../server/conditionalFeeFacts.js";
import { classifyDocFee } from "../../server/regulatoryClassification.js";
import type { AnalysisResponse, DetectedFields } from "../../shared/schema.js";
import { auditedCamryBenchmark } from "./auditedBenchmark.js";

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

const ca = getStateFeeData("CA");

function blank(partial: Partial<DetectedFields>): DetectedFields {
  return {
    salePrice: 28000,
    msrp: null,
    rebates: null,
    fees: [
      { name: "Doc fee", amount: 70 },
      { name: "Sales tax", amount: 1000 },
      { name: "Registration", amount: 400 },
    ],
    outTheDoorPrice: 28000 + 70 + 1000 + 400,
    monthlyPayment: null,
    tradeInValue: null,
    apr: null,
    termMonths: null,
    downPayment: null,
    vehicle_make: "Toyota",
    vehicle_model: "Camry LE",
    vehicle_year: 2025,
    ...partial,
  };
}

function run(
  fields: DetectedFields,
  options: (NonNullable<Parameters<typeof applyRuleEngine>[5]> & { purchaseType?: string }) = {},
) {
  const forgedBenchmark = Object.prototype.hasOwnProperty.call(options, "marketBenchmark");
  const { purchaseType, ...rest } = options;
  const execute = () => applyRuleEngine(llm, fields, null, purchaseType ?? "cash", null, {
    stateData: ca,
    condition: "new",
    mileage: 12,
    trim: "LE",
    ...rest,
  });
  if (forgedBenchmark) return execute();
  return withValuationAdapters([createTestTrustedValuationAdapter()], execute);
}

describe("valuation provenance required before GO", () => {
  it("does not treat a status-only verified range as a market valuation", () => {
    const thin = {
      status: "verified" as const,
      source: "licensed-valuation",
      kind: "market_transaction" as const,
      low: 26000,
      high: 30000,
      reason: "No provenance.",
    };
    expect(benchmarkQualifiesAsVerified(thin, {
      year: 2025, make: "Toyota", model: "Camry LE", condition: "new", mileage: 12,
    }).ok).toBe(false);
    const result = run(blank({}), { marketBenchmark: thin });
    expect(result.marketValuation?.status).toBe("unverified");
    expect(result.goNoGo).not.toBe("GO");
  });

  it("rejects an unordered, non-finite, or non-positive range", () => {
    for (const range of [
      { low: 30000, high: 26000 },
      { low: Number.NaN, high: 30000 },
      { low: -10, high: 30000 },
      { low: 0, high: 30000 },
    ]) {
      const benchmark = auditedCamryBenchmark(range);
      const result = run(blank({}), { marketBenchmark: benchmark });
      expect(result.marketValuation?.status, JSON.stringify(range)).toBe("unverified");
      expect(result.goNoGo, JSON.stringify(range)).not.toBe("GO");
    }
  });

  it("rejects a buyer-reported source even when provenance is filled in", () => {
    const result = run(blank({}), {
      marketBenchmark: auditedCamryBenchmark({
        source: "buyer_window_sticker_msrp",
        sourceQuality: "buyer_reported",
        provenance: {
          sourceId: "buyer_window_sticker_msrp",
          retrievedAt: "2026-11-27T15:00:00.000Z",
          reference: "https://example.com/buyer-typed",
        },
      }),
    });
    expect(result.marketValuation?.status).toBe("unverified");
    expect(result.marketValuation?.reason).toMatch(/buyer-reported/i);
    expect(result.goNoGo).not.toBe("GO");
  });

  it("rejects a valuation that does not match year, trim, condition, or mileage band", () => {
    const mismatched = [
      auditedCamryBenchmark({ vehicleMatch: { ...auditedCamryBenchmark().vehicleMatch!, year: 2024 } }),
      auditedCamryBenchmark({ vehicleMatch: { ...auditedCamryBenchmark().vehicleMatch!, trim: "XLE" } }),
      auditedCamryBenchmark({ vehicleMatch: { ...auditedCamryBenchmark().vehicleMatch!, condition: "used" } }),
      auditedCamryBenchmark({ vehicleMatch: { ...auditedCamryBenchmark().vehicleMatch!, mileageMin: 20000, mileageMax: 40000 } }),
    ];
    for (const benchmark of mismatched) {
      const result = run(blank({}), { marketBenchmark: benchmark });
      expect(result.marketValuation?.status).toBe("unverified");
      expect(result.goNoGo).not.toBe("GO");
    }
  });
});

describe("financing intent without a complete loan", () => {
  it("asks for APR, term, and amount financed when only a monthly payment is present", () => {
    const result = run(blank({ monthlyPayment: 450 }));
    expect(result.goNoGo).not.toBe("GO");
    expect(result.verdictLabel).toMatch(/FINANCING TERMS NEEDED/);
    expect(result.summary).toMatch(/APR/);
    expect(result.summary).toMatch(/term/i);
    expect(result.summary).toMatch(/amount financed/i);
    expect(result.summary).toMatch(/not treated as a reconciled payment/i);
    expect(result.suggestedReply).toMatch(/APR/);
    expect(result.dimensions?.mathematicalAccuracy.status).not.toBe("clear");
  });

  it("recognizes financing language when APR and term are missing", () => {
    const result = run(blank({}), {
      dealerText: "Financing available. Selling price $28,000. Doc fee $70.",
      purchaseType: "cash",
    });
    expect(result.goNoGo).not.toBe("GO");
    expect(result.verdictLabel).toMatch(/FINANCING TERMS NEEDED/);
    expect(result.summary).toMatch(/amount financed/i);
  });

  it("still approves a cash quote that does not mention financing", () => {
    const result = run(blank({}), { dealerText: "Cash purchase. Not a loan." });
    expect(result.goNoGo).toBe("GO");
  });

  it("approves when the stated payment matches the APR, term, and disclosed amount financed", () => {
    const amountFinanced = 28000 + 70 + 1000 + 400;
    const payment = amortizingPayment(amountFinanced, 4.9, 60);
    expect(payment).not.toBeNull();
    const result = run(blank({ apr: 4.9, termMonths: 60, monthlyPayment: payment }), {
      purchaseType: "finance",
      dealerText: `Amount financed: $${amountFinanced.toFixed(2)}`,
    });
    expect(result.goNoGo).toBe("GO");
    expect(result.summary).toMatch(/financed payment reconcile/i);
  });
});

describe("vehicle identification required for GO", () => {
  it("requires year, make, and model before a valuation can approve the quote", () => {
    const missingModel = run(blank({ vehicle_model: null }));
    const missingYear = run(blank({ vehicle_year: null }));
    const missingMake = run(blank({ vehicle_make: null }));
    for (const result of [missingModel, missingYear, missingMake]) {
      expect(result.goNoGo).not.toBe("GO");
      expect(result.marketValuation?.status).toBe("unverified");
      expect(result.dimensions?.informationCompleteness.summary).toMatch(/year, make, and model/i);
    }
  });

  it("blocks GO when a VIN is present but the decoder did not confirm it", () => {
    const result = run(blank({}), {
      vinCheck: {
        status: "failed",
        vin: "4T1G11AK5NU123456",
        mismatches: [],
        summary: "The NHTSA VIN check could not be completed.",
      },
    });
    expect(result.goNoGo).not.toBe("GO");
    expect(result.verdictLabel).toMatch(/VIN NOT CONFIRMED/);
    expect(result.summary).toMatch(/NHTSA/);
  });

  it("blocks GO when the VIN decode disagrees with the quote", () => {
    const result = run(blank({}), {
      vinCheck: {
        status: "decoded",
        vin: "4T1G11AK5NU123456",
        mismatches: [{ field: "year", quoteValue: "2025", decodedValue: "2023" }],
        summary: "The quote says 2025, but the VIN decodes to 2023.",
      },
    });
    expect(result.goNoGo).not.toBe("GO");
  });

  it("does not GO when the decode is a hybrid and the quote never says so", () => {
    const result = run(blank({}), {
      vinCheck: {
        status: "decoded",
        vin: "1G4AH59H45G118341",
        mismatches: [],
        summary: "The VIN matches the quote.",
        decoded: {
          year: 2025,
          make: "TOYOTA",
          model: "Camry",
          trim: "LE",
          trim2: null,
          series: null,
          fuelTypePrimary: "Gasoline",
          fuelTypeSecondary: "Electric",
          electrificationLevel: "Strong HEV (Hybrid Electric Vehicle)",
        },
        errorCode: "0",
        errorText: "0 - VIN decoded clean. Check Digit (9th position) is correct",
      },
    });
    expect(result.goNoGo).not.toBe("GO");
    expect(result.verdictLabel).toMatch(/VIN NOT CONFIRMED/);
    expect(result.summary).toMatch(/powertrain/i);
    expect(result.summary).toMatch(/hybrid/i);
  });

  it("does not GO when the quote trim and the VIN trim are different", () => {
    const result = run(blank({ vehicle_model: "Camry LE" }), {
      trim: null,
      vinCheck: {
        status: "decoded",
        vin: "1G4AH59H45G118341",
        mismatches: [],
        summary: "The VIN matches the quote.",
        decoded: {
          year: 2025,
          make: "TOYOTA",
          model: "Camry",
          trim: "XLE",
          trim2: null,
          series: null,
        },
        errorCode: "0",
        errorText: "0 - VIN decoded clean. Check Digit (9th position) is correct",
      },
    });
    expect(result.goNoGo).not.toBe("GO");
    expect(result.verdictLabel).toMatch(/VIN NOT CONFIRMED/);
    expect(result.summary).toMatch(/trim/i);
  });

  it("treats an odometer of 0 or 12 as provided and still asks when mileage is absent", () => {
    for (const mileage of [0, 12]) {
      const provided = run(blank({}), { condition: "used", mileage });
      expect(provided.verdictLabel, String(mileage)).not.toMatch(/MILEAGE NOT PROVIDED/);
      expect(provided.dimensions?.informationCompleteness.summary, String(mileage)).not.toMatch(/no mileage/i);
    }
    const absent = run(blank({}), { condition: "used", mileage: null });
    expect(absent.verdictLabel).toMatch(/MILEAGE NOT PROVIDED/);
    expect(absent.goNoGo).not.toBe("GO");
    expect(absent.dimensions?.informationCompleteness.summary).toMatch(/no mileage/i);
  });

  it("allows GO when the VIN decode matches the quote", () => {
    const result = run(blank({}), {
      vinCheck: {
        status: "decoded",
        vin: "1G4AH59H45G118341",
        mismatches: [],
        summary: "The VIN matches the quote.",
        decoded: {
          year: 2025,
          make: "TOYOTA",
          model: "Camry",
          trim: "LE",
          trim2: null,
          series: null,
        },
        errorCode: "0",
        errorText: "0 - VIN decoded clean. Check Digit (9th position) is correct",
      },
    });
    expect(result.goNoGo).toBe("GO");
  });
});

describe("unknown regulatory status cannot satisfy GO", () => {
  it("distinguishes unknown from a validated check", () => {
    expect(regulatoryGoDecision(null, false).status).toBe("unknown");
    const needsSource = classifyDocFee(
      [{ name: "doc fee", amount: 85 }],
      {
        name: "Alaska",
        abbreviation: "AK",
        docFeeCap: true,
        docFeeCapAmount: 500,
        source_status: "needs_source",
        unverified_fields: ["docFeeCapAmount"],
        citations: [],
      },
    );
    expect(needsSource.classification).toBe("needs_source");
    expect(regulatoryGoDecision(needsSource, true).status).toBe("unknown");
    const unconfirmed = classifyDocFee([{ name: "doc fee", amount: 80 }], ca, null);
    expect(unconfirmed.classification).toBe("potentially_noncompliant");
    expect(regulatoryGoDecision(unconfirmed, true).status).toBe("unknown");
    const validated = classifyDocFee([{ name: "doc fee", amount: 70 }], ca, null);
    expect(regulatoryGoDecision(validated, true).status).toBe("validated");
  });

  it("does not GO when the state is unknown", () => {
    const result = run(blank({}), { stateData: null });
    expect(result.goNoGo).not.toBe("GO");
    expect(result.verdictLabel).toMatch(/REGULATORY STATUS UNKNOWN/);
    expect(result.summary).toMatch(/state is unknown/i);
  });

  it("does not GO when the cap needs a source", () => {
    const result = run(blank({}), {
      stateData: {
        name: "Alaska",
        abbreviation: "AK",
        docFeeCap: true,
        docFeeCapAmount: 500,
        source_status: "needs_source",
        unverified_fields: ["docFeeCapAmount"],
        citations: [],
      },
    });
    expect(result.goNoGo).not.toBe("GO");
    expect(result.verdictLabel).toMatch(/REGULATORY STATUS UNKNOWN/);
    expect(result.summary).toMatch(/needs a source/i);
  });

  it("does not GO while a conditional California fee is unconfirmed", () => {
    const result = run(blank({
      fees: [
        { name: "Doc fee", amount: 80 },
        { name: "Sales tax", amount: 1000 },
        { name: "Registration", amount: 400 },
      ],
      outTheDoorPrice: 28000 + 80 + 1000 + 400,
    }));
    expect(result.goNoGo).not.toBe("GO");
    expect(result.goNoGo).toBe("PROCEED-WITH-CAUTION");
    expect(result.verdictLabel).toMatch(/CONDITIONAL DOC FEE/);
  });
});

describe("conditional fee facts reach the classifier", () => {
  it("resolves a confirmed California partner, Oregon election, and Pennsylvania electronic transaction", () => {
    const fromQuote = resolveConditionalFeeFacts({
      dealerText: [
        "The dealer is a DMV private industry partner.",
        "The purchaser elects to use an integrator.",
        "This is an electronic transaction.",
      ].join(" "),
    });
    expect(fromQuote).toEqual({
      privateIndustryPartner: true,
      electronicIntegrator: true,
      electronicTransaction: true,
    });

    const buyerOverrides = resolveConditionalFeeFacts({
      dealerText: "The dealer is not a DMV private industry partner. The purchaser elects not to use an integrator. Non-electronic processing.",
      californiaDmvBusinessPartner: true,
      oregonIntegratorElection: true,
      pennsylvaniaElectronicProcessing: true,
    });
    expect(buyerOverrides.privateIndustryPartner).toBe(true);
    expect(buyerOverrides.electronicIntegrator).toBe(true);
    expect(buyerOverrides.electronicTransaction).toBe(true);

    const silent = resolveConditionalFeeFacts({ dealerText: "Doc fee $80. Selling price $28,000." });
    expect(silent).toEqual({
      privateIndustryPartner: null,
      electronicIntegrator: null,
      electronicTransaction: null,
    });
  });

  it("lets a confirmed California partner validate an $80 doc fee", () => {
    const facts = resolveConditionalFeeFacts({
      dealerText: "Dealer is a DMV business partner under the DMV agreement.",
    });
    expect(facts.privateIndustryPartner).toBe(true);
    const result = run(blank({
      fees: [
        { name: "Doc fee", amount: 80 },
        { name: "Sales tax", amount: 1000 },
        { name: "Registration", amount: 400 },
      ],
      outTheDoorPrice: 28000 + 80 + 1000 + 400,
    }), { privateIndustryPartner: facts.privateIndustryPartner });
    expect(result.docFeeAssessment?.classification).toBe("permissible");
    expect(result.goNoGo).toBe("GO");
  });

  it("lets an Oregon integrator election and Pennsylvania electronic processing resolve", () => {
    const oregon = resolveConditionalFeeFacts({
      dealerText: "The dealer uses an electronic integrator.",
    });
    expect(classifyDocFee(
      [{ name: "doc fee", amount: 220 }],
      getStateFeeData("OR"),
      null,
      oregon.electronicIntegrator,
    ).classification).toBe("permissible");
    expect(classifyDocFee(
      [{ name: "doc fee", amount: 220 }],
      getStateFeeData("OR"),
      null,
      null,
    ).classification).toBe("potentially_noncompliant");

    const pennsylvania = resolveConditionalFeeFacts({
      dealerText: "Electronic title and registration.",
    });
    expect(classifyDocFee(
      [{ name: "doc fee", amount: 450 }],
      getStateFeeData("PA"),
      null,
      null,
      { electronicTransaction: pennsylvania.electronicTransaction },
    ).classification).toBe("permissible");
    expect(classifyDocFee(
      [{ name: "doc fee", amount: 450 }],
      getStateFeeData("PA"),
      null,
      null,
      { electronicTransaction: null },
    ).classification).toBe("potentially_noncompliant");
  });

  it("wires the three facts through the production analysis call", () => {
    const source = readFileSync(resolve(import.meta.dirname, "../../server/services/analyzeService.ts"), "utf8");
    expect(source).toMatch(/resolveConditionalFeeFacts/);
    expect(source).toMatch(/privateIndustryPartner: feeFacts.privateIndustryPartner/);
    expect(source).toMatch(/electronicIntegrator: feeFacts.electronicIntegrator/);
    expect(source).toMatch(/electronicTransaction: feeFacts.electronicTransaction/);
    expect(source).not.toMatch(/trackEvent\(/);
  });
});
