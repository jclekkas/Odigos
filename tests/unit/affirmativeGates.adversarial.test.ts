import { describe, expect, it } from "vitest";
import { applyRuleEngine } from "../../server/ruleEngine.js";
import { getStateFeeData } from "../../server/stateFeeLookup.js";
import { classifyDocFee } from "../../server/regulatoryClassification.js";
import { checkVin, vinPositivelyAgrees } from "../../server/nhtsaVin.js";
import { createTestTrustedValuationAdapter, withValuationAdapters } from "../../server/valuationAdapters.js";
import type { AnalysisResponse, DetectedFields } from "../../shared/schema.js";
import type { VinCheck } from "../../shared/buyerReported.js";

/**
 * Positive-GO attempts that use incomplete or forged evidence.
 * A real affirmative VIN match is covered in goGateIntegrity.test.ts.
 */

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

const CLEAN_ERROR = "0 - VIN decoded clean. Check Digit (9th position) is correct";
const VALID_VIN = "1G4AH59H45G118341";

function fields(partial: Partial<DetectedFields> = {}): DetectedFields {
  const salePrice = partial.salePrice ?? 28000;
  const fees = partial.fees ?? [
    { name: "Doc fee", amount: 70 },
    { name: "Sales tax", amount: 1000 },
    { name: "Registration", amount: 400 },
  ];
  const feeTotal = fees.reduce((sum, fee) => sum + (fee.amount ?? 0), 0);
  return {
    salePrice,
    msrp: null,
    rebates: null,
    fees,
    outTheDoorPrice: partial.outTheDoorPrice ?? salePrice + feeTotal,
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
  detected: DetectedFields,
  options: NonNullable<Parameters<typeof applyRuleEngine>[5]> = {},
) {
  return withValuationAdapters([createTestTrustedValuationAdapter()], () => applyRuleEngine(llm, detected, null, "cash", null, {
    stateData: getStateFeeData("CA"),
    condition: "new",
    mileage: 12,
    trim: "LE",
    dealerText: "Cash purchase. Not a loan.",
    ...options,
  }));
}

function decodedVin(overrides: Partial<NonNullable<VinCheck["decoded"]>> = {}): NonNullable<VinCheck["decoded"]> {
  return {
    year: 2025,
    make: "TOYOTA",
    model: "Camry",
    trim: "LE",
    trim2: null,
    series: null,
    ...overrides,
  };
}

describe("affirmative VIN agreement", () => {
  it("does not GO on a decoded status with an empty mismatch list and no NHTSA payload", () => {
    const result = run(fields(), {
      vinCheck: {
        status: "decoded",
        vin: VALID_VIN,
        mismatches: [],
        summary: "The VIN matches the quote.",
      },
    });
    expect(result.goNoGo).not.toBe("GO");
    expect(result.verdictLabel).toMatch(/VIN NOT CONFIRMED/);
  });

  it("does not GO when the check digit fails, even if the names were copied from the quote", () => {
    const result = run(fields(), {
      vinCheck: {
        status: "decoded",
        vin: "4T1G11AK5NU123456",
        mismatches: [],
        summary: "The VIN matches the quote.",
        decoded: decodedVin(),
        errorCode: "0",
        errorText: CLEAN_ERROR,
      },
    });
    expect(result.goNoGo).not.toBe("GO");
    expect(result.summary).toMatch(/check digit/i);
  });

  it("does not GO on a partial decode or an NHTSA error code", () => {
    const partial = run(fields(), {
      vinCheck: {
        status: "decoded",
        vin: VALID_VIN,
        mismatches: [],
        summary: "Decoded.",
        decoded: decodedVin({ model: null }),
        errorCode: "0",
        errorText: CLEAN_ERROR,
      },
    });
    const errorCode = run(fields(), {
      vinCheck: {
        status: "decoded",
        vin: VALID_VIN,
        mismatches: [],
        summary: "Check digit failed but the names match.",
        decoded: decodedVin(),
        errorCode: "1",
        errorText: "1 - Check Digit (9th position) does not calculate properly",
      },
    });
    for (const result of [partial, errorCode]) {
      expect(result.goNoGo).not.toBe("GO");
      expect(result.verdictLabel).toMatch(/VIN NOT CONFIRMED/);
    }
  });

  it("does not GO when the model or trim is ambiguous", () => {
    const hybrid = run(fields(), {
      vinCheck: {
        status: "decoded",
        vin: VALID_VIN,
        mismatches: [],
        summary: "The VIN matches the quote.",
        decoded: decodedVin({ model: "Camry Hybrid" }),
        errorCode: "0",
        errorText: CLEAN_ERROR,
      },
    });
    const trim = run(fields(), {
      vinCheck: {
        status: "decoded",
        vin: VALID_VIN,
        mismatches: [],
        summary: "The VIN matches the quote.",
        decoded: decodedVin({ trim: null }),
        errorCode: "0",
        errorText: CLEAN_ERROR,
      },
    });
    expect(hybrid.goNoGo).not.toBe("GO");
    expect(hybrid.summary).toMatch(/powertrain/i);
    expect(hybrid.summary).toMatch(/hybrid/i);
    expect(trim.goNoGo).not.toBe("GO");
    expect(trim.summary).toMatch(/trim/i);
    expect(vinPositivelyAgrees(
      {
        status: "decoded",
        vin: VALID_VIN,
        decoded: decodedVin({ model: "Camry Hybrid" }),
        errorCode: "0",
        errorText: CLEAN_ERROR,
      },
      { year: 2025, make: "Toyota", model: "Camry" },
    ).affirmative).toBe(false);
  });

  it("does not GO when the quote has two VINs, and a lowercase VIN is still extracted", async () => {
    const conflict = run(fields(), {
      vinCheck: {
        status: "failed",
        vin: null,
        mismatches: [],
        summary: "The quote contains more than one VIN.",
        conflictingVins: [VALID_VIN, "4T1G11AK5NU123456"],
      },
    });
    expect(conflict.goNoGo).not.toBe("GO");
    expect(conflict.verdictLabel).toMatch(/VIN NOT CONFIRMED/);

    const fetchImpl = async (url: string) => {
      expect(url).toContain(VALID_VIN);
      expect(url).not.toContain(VALID_VIN.toLowerCase());
      return {
        ok: true,
        status: 200,
        text: async () => JSON.stringify({
          Results: [{
            ModelYear: "2025",
            Make: "TOYOTA",
            Model: "Camry",
            Trim: "LE",
            Trim2: "",
            Series: "",
            BasePrice: "",
            ErrorCode: "0",
            ErrorText: CLEAN_ERROR,
          }],
        }),
      };
    };
    const decoded = await checkVin({
      dealerText: `the vin is ${VALID_VIN.toLowerCase()}`,
      identity: { year: 2025, make: "Toyota", model: "Camry LE" },
      fetchImpl,
    });
    expect(decoded.vin).toBe(VALID_VIN);
    expect(decoded.mismatches).toEqual([]);
    expect(vinPositivelyAgrees(decoded, { year: 2025, make: "Toyota", model: "Camry LE" }).affirmative).toBe(true);
  });
});

describe("every regulatory assessment participates in GO", () => {
  it("does not let a permissible $70 California doc fee override an unresolved $100 electronic filing charge", () => {
    const result = run(fields({
      fees: [
        { name: "Doc fee", amount: 70 },
        { name: "Electronic filing charge", amount: 100 },
        { name: "Sales tax", amount: 1000 },
        { name: "Registration", amount: 400 },
      ],
    }));
    expect(result.docFeeAssessment?.classification).toBe("permissible");
    expect(result.docFeeAssessment?.chargedAmount).toBe(70);
    expect(result.goNoGo).not.toBe("GO");
    expect(result.summary).toMatch(/electronic filing/i);
    expect(result.summary).toMatch(/4456\.5|unresolved|not treated as a validated/i);
    expect(result.dimensions?.regulatoryCompliance.status).not.toBe("clear");
    expect(result.separateFilingAssessments?.[0]?.classification).not.toBe("permissible");
  });

  it("does not GO while a registration-service charge or a Minnesota electronic transfer fee is unresolved", () => {
    const registration = run(fields({
      fees: [
        { name: "Doc fee", amount: 70 },
        { name: "Registration service fee", amount: 45 },
        { name: "Sales tax", amount: 1000 },
        { name: "Registration", amount: 400 },
      ],
    }));
    expect(registration.goNoGo).not.toBe("GO");
    expect(registration.separateFilingAssessments?.some((item) => item.classification === "needs_source")).toBe(true);

    const minnesota = run(fields({
      salePrice: 20000,
      fees: [
        { name: "Documentary fee", amount: 125 },
        { name: "Optional electronic transfer fee", amount: 40 },
        { name: "Sales tax", amount: 1000 },
        { name: "Registration", amount: 400 },
      ],
    }), { stateData: getStateFeeData("MN") });
    expect(minnesota.docFeeAssessment?.classification).toBe("permissible");
    expect(minnesota.goNoGo).not.toBe("GO");
    expect(minnesota.summary).toMatch(/168\.27|electronic transfer/i);
    expect(minnesota.dimensions?.regulatoryCompliance.status).not.toBe("clear");
  });
});

describe("ambiguous mixed-name charges", () => {
  it("asks the dealer and does not GO when a doc fee and an administrative processing charge are both listed", () => {
    const result = run(fields({
      fees: [
        { name: "Documentation fee", amount: 60 },
        { name: "Administrative processing charge", amount: 60 },
        { name: "Sales tax", amount: 1000 },
        { name: "Registration", amount: 400 },
      ],
    }));
    expect(result.goNoGo).not.toBe("GO");
    expect(result.verdictLabel).toMatch(/AMBIGUOUS FEE NAMES/);
    expect(result.suggestedReply).toMatch(/ask the dealer/i);
    expect(result.suggestedReply).toMatch(/administrative processing charge/i);
    expect(result.docFeeAssessment?.classification).not.toBe("permissible");
    expect(result.docFeeAssessment?.classification).not.toBe("illegal");
  });

  it("still counts two printed lines with the same name twice", () => {
    const dealerText = "Doc fee: $60\nSelling price: $28,000\nDoc fee: $60";
    const result = classifyDocFee(
      [{ name: "Doc fee", amount: 60 }],
      getStateFeeData("CA"),
      true,
      null,
      { dealerText },
    );
    expect(result.chargedAmount).toBe(120);
    expect(result.classification).toBe("illegal");
    expect(result.feeNameAmbiguity ?? null).toBeNull();
  });
});

describe("transaction date for date-based fee limits", () => {
  const oh = getStateFeeData("OH");
  const pa = getStateFeeData("PA");

  it("uses a stated quote date for Ohio, and labels the analysis date when the quote has none", () => {
    const quoteDate = classifyDocFee(
      [{ name: "Documentary service charge", amount: 400 }],
      oh,
      null,
      null,
      { asOf: "2027-01-15", asOfSource: "quote", vehicleCashPrice: 32000 },
    );
    expect(quoteDate.classification).toBe("permissible");
    expect(quoteDate.hardCeiling).toBe(412);
    expect(quoteDate.evaluatedAsOf).toBe("2027-01-15");
    expect(quoteDate.evaluatedAsOfSource).toBe("quote");
    expect(quoteDate.summary).toMatch(/quote date 2027-01-15/);

    const in2026 = classifyDocFee(
      [{ name: "Documentary service charge", amount: 400 }],
      oh,
      null,
      null,
      { asOf: "2026-06-01", asOfSource: "quote", vehicleCashPrice: 32000 },
    );
    expect(in2026.classification).toBe("illegal");
    expect(in2026.hardCeiling).toBe(398);

    const analysis = run(fields({
      fees: [
        { name: "Documentary service charge", amount: 398 },
        { name: "Sales tax", amount: 1000 },
        { name: "Registration", amount: 400 },
      ],
    }), {
      stateData: oh,
      asOf: "2026-11-28",
      asOfSource: "analysis",
      dealerText: "Cash purchase. Not a loan.",
    });
    expect(analysis.docFeeAssessment?.evaluatedAsOf).toBe("2026-11-28");
    expect(analysis.docFeeAssessment?.evaluatedAsOfSource).toBe("analysis");
    expect(analysis.docFeeAssessment?.summary).toMatch(/analysis date 2026-11-28/);
    expect(analysis.dimensions?.regulatoryCompliance.summary).toMatch(/analysis date 2026-11-28/);
  });

  it("does not let a caller-supplied 2027 date override a 2026 quote date", () => {
    const result = run(fields({
      fees: [
        { name: "Documentary service charge", amount: 400 },
        { name: "Sales tax", amount: 1000 },
        { name: "Registration", amount: 400 },
      ],
    }), {
      stateData: oh,
      asOf: "2027-06-01",
      asOfSource: "analysis",
      dealerText: "Quote date: June 1, 2026. Cash purchase. Not a loan.",
    });
    expect(result.docFeeAssessment?.evaluatedAsOf).toBe("2026-06-01");
    expect(result.docFeeAssessment?.evaluatedAsOfSource).toBe("quote");
    expect(result.docFeeAssessment?.classification).toBe("illegal");
    expect(result.docFeeAssessment?.hardCeiling).toBe(398);
    expect(result.goNoGo).not.toBe("GO");
  });

  it("does not pick a favorable date when the quote states two dates", () => {
    const result = run(fields({
      fees: [
        { name: "Documentary service charge", amount: 400 },
        { name: "Sales tax", amount: 1000 },
        { name: "Registration", amount: 400 },
      ],
    }), {
      stateData: oh,
      asOf: "2027-06-01",
      dealerText: "Quote date: June 1, 2026. Transaction date: January 15, 2027. Cash purchase. Not a loan.",
    });
    expect(result.docFeeAssessment?.classification).toBe("needs_source");
    expect(result.docFeeAssessment?.evaluatedAsOfSource).toBe("conflict");
    expect(result.docFeeAssessment?.summary).toMatch(/more than one transaction date/i);
    expect(result.goNoGo).not.toBe("GO");
    expect(result.summary.toLowerCase()).not.toMatch(/\billegal\b/);
  });

  it("uses the quote year for Pennsylvania's electronic and non-electronic ceilings", () => {
    const during2025 = classifyDocFee(
      [{ name: "Documentary preparation fee", amount: 400 }],
      pa,
      null,
      null,
      { asOf: "2025-06-01", asOfSource: "quote" },
    );
    const during2026 = classifyDocFee(
      [{ name: "Documentary preparation fee", amount: 400 }],
      pa,
      null,
      null,
      { asOf: "2026-06-01", asOfSource: "quote" },
    );
    expect(during2025.classification).toBe("potentially_noncompliant");
    expect(during2025.summary).toMatch(/\$398/);
    expect(during2025.evaluatedAsOfSource).toBe("quote");
    expect(during2026.classification).toBe("permissible");
    expect(during2026.hardCeiling).toBe(490);
    expect(during2026.summary).toMatch(/quote date 2026-06-01/);
  });
});
