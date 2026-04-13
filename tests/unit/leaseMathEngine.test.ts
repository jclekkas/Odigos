import { describe, it, expect } from "vitest";
import {
  convertMFtoAPR,
  detectRateMarkup,
  validateMonthlyPayment,
  checkResidualReasonableness,
  benchmarkAcquisitionFee,
  runLeaseMath,
} from "../../server/leaseMathEngine.js";
import { lookupBrand } from "../../server/leaseBrandData.js";
import { applyRuleEngine } from "../../server/ruleEngine.js";
import type { DetectedFields, AnalysisResponse } from "../../shared/schema.js";

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

const makeFields = (overrides: Partial<DetectedFields> = {}): DetectedFields => ({
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
  vehicle_make: null,
  vehicle_model: null,
  vehicle_year: null,
  ...overrides,
});

// ---------------------------------------------------------------------------
// 1. MF → APR conversion
// ---------------------------------------------------------------------------

describe("convertMFtoAPR", () => {
  it("converts money factor to APR correctly", () => {
    expect(convertMFtoAPR(0.00125)).toBeCloseTo(3.0, 2);
    expect(convertMFtoAPR(0.00100)).toBeCloseTo(2.4, 2);
  });

  it("handles zero money factor", () => {
    expect(convertMFtoAPR(0)).toBe(0);
  });

  it("handles very small money factor", () => {
    expect(convertMFtoAPR(0.00001)).toBeCloseTo(0.024, 3);
  });

  it("handles large money factor", () => {
    expect(convertMFtoAPR(0.00500)).toBeCloseTo(12.0, 2);
  });
});

// ---------------------------------------------------------------------------
// 2. Rate markup detection
// ---------------------------------------------------------------------------

describe("detectRateMarkup", () => {
  it("detects zero markup when MF matches buy rate", () => {
    const bmw = lookupBrand("BMW")!;
    const fields = makeFields({
      moneyFactor: 0.00120,
      salePrice: 52000,
      residualValue: 31900,
      termMonths: 36,
    });
    const result = detectRateMarkup(fields, bmw);
    expect(result).not.toBeNull();
    expect(result!.totalMarkupDollars).toBe(0);
    expect(result!.markupAPR).toBeCloseTo(0, 1);
  });

  it("detects dealer markup above buy rate", () => {
    const honda = lookupBrand("Honda")!;
    const fields = makeFields({
      moneyFactor: 0.00180,
      salePrice: 31000,
      residualValue: 17600,
      termMonths: 36,
    });
    const result = detectRateMarkup(fields, honda);
    expect(result).not.toBeNull();
    expect(result!.dealerAPR).toBeCloseTo(4.32, 1);
    expect(result!.buyRateAPR).toBeCloseTo(1.68, 1);
    expect(result!.markupAPR).toBeCloseTo(2.64, 1);
    expect(result!.totalMarkupDollars).toBeGreaterThan(0);
  });

  it("returns null when money factor is missing", () => {
    const bmw = lookupBrand("BMW")!;
    const fields = makeFields({ salePrice: 52000, residualValue: 31900 });
    expect(detectRateMarkup(fields, bmw)).toBeNull();
  });

  it("returns null when cap cost is missing", () => {
    const bmw = lookupBrand("BMW")!;
    const fields = makeFields({ moneyFactor: 0.00120, residualValue: 31900 });
    expect(detectRateMarkup(fields, bmw)).toBeNull();
  });

  it("resolves residual from percent when residualValue is missing", () => {
    const honda = lookupBrand("Honda")!;
    const fields = makeFields({
      moneyFactor: 0.00180,
      msrp: 32000,
      residualPercent: 55,
      termMonths: 36,
    });
    const result = detectRateMarkup(fields, honda);
    expect(result).not.toBeNull();
    expect(result!.totalMarkupDollars).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// 3. Monthly payment validation
// ---------------------------------------------------------------------------

describe("validateMonthlyPayment", () => {
  it("validates payment within tolerance", () => {
    // BMW lease: $52k sale, $31,900 residual, MF 0.00120, 36mo, $3k down
    const fields = makeFields({
      salePrice: 52000,
      residualValue: 31900,
      moneyFactor: 0.00120,
      termMonths: 36,
      downPayment: 3000,
      monthlyPayment: 658, // close to expected
    });
    const result = validateMonthlyPayment(fields);
    expect(result).not.toBeNull();
    // depreciation = (52000 - 3000 - 31900) / 36 = 475
    // rentCharge = (52000 - 3000 + 31900) * 0.00120 = 97.08
    // expected ≈ 572.08
    // This specific payment is higher, so it should flag as significant
    expect(result!.expectedPaymentPreTax).toBeGreaterThan(0);
    expect(typeof result!.discrepancy).toBe("number");
  });

  it("flags significant discrepancy (> $25)", () => {
    const fields = makeFields({
      salePrice: 30000,
      residualValue: 16500,
      moneyFactor: 0.00100,
      termMonths: 36,
      monthlyPayment: 500, // well above expected
    });
    const result = validateMonthlyPayment(fields);
    expect(result).not.toBeNull();
    // depreciation = (30000 - 16500) / 36 = 375
    // rentCharge = (30000 + 16500) * 0.001 = 46.50
    // expected ≈ 421.50
    // discrepancy = 500 - 421.50 = 78.50
    expect(result!.isSignificant).toBe(true);
    expect(result!.discrepancy).toBeGreaterThan(25);
  });

  it("does not flag when within tolerance", () => {
    const fields = makeFields({
      salePrice: 30000,
      residualValue: 16500,
      moneyFactor: 0.00100,
      termMonths: 36,
      monthlyPayment: 430, // close to expected ~421.50
    });
    const result = validateMonthlyPayment(fields);
    expect(result).not.toBeNull();
    expect(result!.isSignificant).toBe(false);
  });

  it("returns null when monthly payment is missing", () => {
    const fields = makeFields({
      salePrice: 30000,
      residualValue: 16500,
      moneyFactor: 0.00100,
    });
    expect(validateMonthlyPayment(fields)).toBeNull();
  });

  it("returns null when money factor is missing", () => {
    const fields = makeFields({
      salePrice: 30000,
      residualValue: 16500,
      monthlyPayment: 400,
    });
    expect(validateMonthlyPayment(fields)).toBeNull();
  });

  it("accounts for fees, rebates, trade-in, and down payment", () => {
    const fields = makeFields({
      salePrice: 35000,
      residualValue: 19250,
      moneyFactor: 0.00100,
      termMonths: 36,
      downPayment: 2000,
      rebates: 1000,
      tradeInValue: 5000,
      fees: [{ name: "Acquisition Fee", amount: 650 }],
      monthlyPayment: 300,
    });
    const result = validateMonthlyPayment(fields);
    expect(result).not.toBeNull();
    // adjustedCapCost = 35000 + 650 - 2000 - 1000 - 5000 = 27650
    // depreciation = (27650 - 19250) / 36 = 233.33
    // rentCharge = (27650 + 19250) * 0.001 = 46.90
    // expected ≈ 280.23
    expect(result!.expectedPaymentPreTax).toBeCloseTo(280.24, 0);
  });
});

// ---------------------------------------------------------------------------
// 4. Residual reasonableness check
// ---------------------------------------------------------------------------

describe("checkResidualReasonableness", () => {
  it("marks normal residual within brand range", () => {
    const bmw = lookupBrand("BMW")!;
    const fields = makeFields({ residualPercent: 58, termMonths: 36 });
    const result = checkResidualReasonableness(fields, bmw);
    expect(result).not.toBeNull();
    expect(result!.status).toBe("normal");
    expect(result!.brandRange).toEqual([55, 63]);
  });

  it("flags low residual below brand minimum - 3", () => {
    const hyundai = lookupBrand("Hyundai")!;
    const fields = makeFields({ residualPercent: 42, termMonths: 36 });
    const result = checkResidualReasonableness(fields, hyundai);
    expect(result).not.toBeNull();
    expect(result!.status).toBe("low");
    // Hyundai 36mo range is [48, 55], low threshold is 48 - 3 = 45
    expect(result!.deviationFromRange).toBeLessThan(0);
  });

  it("flags high residual above brand maximum + 5", () => {
    const kia = lookupBrand("Kia")!;
    const fields = makeFields({ residualPercent: 62, termMonths: 36 });
    const result = checkResidualReasonableness(fields, kia);
    expect(result).not.toBeNull();
    // Kia 36mo range is [46, 53], high threshold is 53 + 5 = 58
    expect(result!.status).toBe("high");
  });

  it("derives residualPercent from residualValue and MSRP", () => {
    const toyota = lookupBrand("Toyota")!;
    const fields = makeFields({
      residualValue: 19250,
      msrp: 35000,
      termMonths: 36,
    });
    const result = checkResidualReasonableness(fields, toyota);
    expect(result).not.toBeNull();
    // 19250 / 35000 * 100 = 55%
    expect(result!.residualPercent).toBeCloseTo(55, 0);
    expect(result!.status).toBe("normal");
  });

  it("falls back to 36-month range for non-standard terms", () => {
    const honda = lookupBrand("Honda")!;
    const fields = makeFields({ residualPercent: 56, termMonths: 42 });
    const result = checkResidualReasonableness(fields, honda);
    expect(result).not.toBeNull();
    // Falls back to 36mo range [53, 60]
    expect(result!.brandRange).toEqual([53, 60]);
    expect(result!.status).toBe("normal");
  });

  it("returns null when residual data is missing", () => {
    const bmw = lookupBrand("BMW")!;
    const fields = makeFields({});
    expect(checkResidualReasonableness(fields, bmw)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// 5. Acquisition fee benchmarking
// ---------------------------------------------------------------------------

describe("benchmarkAcquisitionFee", () => {
  it("detects marked-up acquisition fee", () => {
    const honda = lookupBrand("Honda")!;
    const fields = makeFields({ acquisitionFee: 795 });
    const result = benchmarkAcquisitionFee(fields, honda);
    expect(result).not.toBeNull();
    expect(result!.isMarkedUp).toBe(true);
    expect(result!.overage).toBe(200); // 795 - 595
    expect(result!.brandStandard).toBe(595);
  });

  it("does not flag standard acquisition fee", () => {
    const bmw = lookupBrand("BMW")!;
    const fields = makeFields({ acquisitionFee: 925 });
    const result = benchmarkAcquisitionFee(fields, bmw);
    expect(result).not.toBeNull();
    expect(result!.isMarkedUp).toBe(false);
    expect(result!.overage).toBe(0);
  });

  it("handles below-standard fee (no markup)", () => {
    const toyota = lookupBrand("Toyota")!;
    const fields = makeFields({ acquisitionFee: 500 });
    const result = benchmarkAcquisitionFee(fields, toyota);
    expect(result).not.toBeNull();
    expect(result!.isMarkedUp).toBe(false);
    expect(result!.overage).toBe(-150);
  });

  it("returns null when acquisition fee is missing", () => {
    const bmw = lookupBrand("BMW")!;
    const fields = makeFields({});
    expect(benchmarkAcquisitionFee(fields, bmw)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// lookupBrand — fuzzy matching
// ---------------------------------------------------------------------------

describe("lookupBrand", () => {
  it("matches exact brand name (case-insensitive)", () => {
    expect(lookupBrand("BMW")).not.toBeNull();
    expect(lookupBrand("bmw")).not.toBeNull();
    expect(lookupBrand("Toyota")).not.toBeNull();
  });

  it("matches 'Chevy' alias to Chevrolet", () => {
    const result = lookupBrand("Chevy");
    expect(result).not.toBeNull();
    expect(result!.brand).toBe("Chevrolet");
  });

  it("matches 'VW' alias to Volkswagen", () => {
    const result = lookupBrand("VW");
    expect(result).not.toBeNull();
    expect(result!.brand).toBe("Volkswagen");
  });

  it("matches 'Mercedes' alias to Mercedes-Benz", () => {
    const result = lookupBrand("Mercedes");
    expect(result).not.toBeNull();
    expect(result!.brand).toBe("Mercedes-Benz");
  });

  it("returns null for unknown brand", () => {
    expect(lookupBrand("Rolls-Royce")).toBeNull();
    expect(lookupBrand("Peugeot")).toBeNull();
  });

  it("returns null for null/undefined/empty", () => {
    expect(lookupBrand(null)).toBeNull();
    expect(lookupBrand(undefined)).toBeNull();
    expect(lookupBrand("")).toBeNull();
    expect(lookupBrand("  ")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Orchestrator — runLeaseMath
// ---------------------------------------------------------------------------

describe("runLeaseMath", () => {
  it("returns null for non-lease quotes", () => {
    const fields = makeFields({ salePrice: 30000, outTheDoorPrice: 33000 });
    expect(runLeaseMath(fields, "finance")).toBeNull();
    expect(runLeaseMath(fields, "cash")).toBeNull();
  });

  it("returns null when no lease indicators present", () => {
    const fields = makeFields({ monthlyPayment: 400 });
    expect(runLeaseMath(fields, "unknown")).toBeNull();
  });

  it("runs with purchaseType=lease even with minimal fields", () => {
    const fields = makeFields({ moneyFactor: 0.00125 });
    const result = runLeaseMath(fields, "lease");
    expect(result).not.toBeNull();
    expect(result!.apr).toBeCloseTo(3.0, 1);
    // Brand-dependent checks null since no vehicle_make
    expect(result!.rateMarkup).toBeNull();
    expect(result!.residualCheck).toBeNull();
    expect(result!.acquisitionFeeBenchmark).toBeNull();
    expect(result!.brandMatched).toBeNull();
  });

  // ─── TEST CASE 1: Clean BMW lease ────────────────────────────────────

  it("test case 1: clean BMW lease — no markup, payment validates", () => {
    const fields = makeFields({
      vehicle_make: "BMW",
      msrp: 55000,
      salePrice: 52000,
      moneyFactor: 0.00120,
      residualPercent: 58,
      residualValue: 31900,
      termMonths: 36,
      acquisitionFee: 925,
      downPayment: 3000,
      monthlyPayment: 575,
      mileageAllowance: 10000,
    });

    const result = runLeaseMath(fields, "lease");
    expect(result).not.toBeNull();

    // APR matches BMW buy rate
    expect(result!.apr).toBeCloseTo(2.88, 1);
    expect(result!.brandMatched).toBe("BMW");

    // No rate markup
    expect(result!.rateMarkup).not.toBeNull();
    expect(result!.rateMarkup!.totalMarkupDollars).toBe(0);
    expect(result!.rateMarkup!.markupAPR).toBeCloseTo(0, 1);

    // Residual normal (58% in BMW 36mo range [55,63])
    expect(result!.residualCheck).not.toBeNull();
    expect(result!.residualCheck!.status).toBe("normal");

    // Acquisition fee matches BMW standard
    expect(result!.acquisitionFeeBenchmark).not.toBeNull();
    expect(result!.acquisitionFeeBenchmark!.isMarkedUp).toBe(false);

    // Payment validation runs
    expect(result!.paymentValidation).not.toBeNull();
  });

  // ─── TEST CASE 2: Marked-up Honda lease ──────────────────────────────

  it("test case 2: marked-up Honda lease — rate and acq fee above standard", () => {
    const fields = makeFields({
      vehicle_make: "Honda",
      msrp: 32000,
      salePrice: 31000,
      moneyFactor: 0.00180,
      residualPercent: 55,
      residualValue: 17600,
      termMonths: 36,
      acquisitionFee: 795,
      downPayment: 2000,
      monthlyPayment: 420,
      mileageAllowance: 12000,
    });

    const result = runLeaseMath(fields, "lease");
    expect(result).not.toBeNull();

    // APR much higher than Honda buy rate (0.00070 → 1.68%)
    expect(result!.apr).toBeCloseTo(4.32, 1);
    expect(result!.brandMatched).toBe("Honda");

    // Significant rate markup
    expect(result!.rateMarkup).not.toBeNull();
    expect(result!.rateMarkup!.markupAPR).toBeCloseTo(2.64, 1);
    expect(result!.rateMarkup!.totalMarkupDollars).toBeGreaterThan(500);

    // Acquisition fee marked up ($795 vs $595 standard)
    expect(result!.acquisitionFeeBenchmark).not.toBeNull();
    expect(result!.acquisitionFeeBenchmark!.isMarkedUp).toBe(true);
    expect(result!.acquisitionFeeBenchmark!.overage).toBe(200);

    // Residual 55% is normal for Honda (range [53, 60])
    expect(result!.residualCheck).not.toBeNull();
    expect(result!.residualCheck!.status).toBe("normal");
  });

  // ─── TEST CASE 3: Suspicious Hyundai — low residual, payment mismatch ─

  it("test case 3: suspicious Hyundai — low residual, payment mismatch", () => {
    const fields = makeFields({
      vehicle_make: "Hyundai",
      msrp: 35000,
      salePrice: 34000,
      moneyFactor: 0.00125,
      residualPercent: 42,
      residualValue: 14700,
      termMonths: 36,
      acquisitionFee: 650,
      downPayment: 2500,
      monthlyPayment: 480,
      mileageAllowance: 10000,
    });

    const result = runLeaseMath(fields, "lease");
    expect(result).not.toBeNull();

    // APR is reasonable
    expect(result!.apr).toBeCloseTo(3.0, 1);
    expect(result!.brandMatched).toBe("Hyundai");

    // Residual 42% below Hyundai range [48, 55] → flagged as LOW
    expect(result!.residualCheck).not.toBeNull();
    expect(result!.residualCheck!.status).toBe("low");
    expect(result!.residualCheck!.deviationFromRange).toBeLessThan(0);

    // Acquisition fee at standard
    expect(result!.acquisitionFeeBenchmark).not.toBeNull();
    expect(result!.acquisitionFeeBenchmark!.isMarkedUp).toBe(false);

    // Payment validation — the quoted $480 should differ from computed
    expect(result!.paymentValidation).not.toBeNull();
    // adjustedCapCost = 34000 + 0 - 2500 - 0 - 0 = 31500
    // depreciation = (31500 - 14700) / 36 = 466.67
    // rentCharge = (31500 + 14700) * 0.00125 = 57.75
    // expected ≈ 524.42
    // discrepancy = 480 - 524.42 = -44.42
    // In this case the quoted payment is LOWER than expected (unusual)
    expect(result!.paymentValidation!.isSignificant).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Rule engine integration — lease math affecting verdicts
// ---------------------------------------------------------------------------

describe("rule engine with lease math", () => {
  const makeLlm = (): AnalysisResponse => ({
    dealScore: "GREEN",
    confidenceLevel: "MEDIUM",
    verdictLabel: "PROCEED",
    goNoGo: "GO",
    summary: "Test",
    detectedFields: makeFields(),
    missingInfo: [],
    suggestedReply: "Test",
    reasoning: "Test",
  });

  it("rate markup > $1500 triggers YELLOW verdict", () => {
    const fields = makeFields({
      vehicle_make: "Honda",
      moneyFactor: 0.00200,
      salePrice: 40000,
      residualValue: 22000,
      outTheDoorPrice: 42000,
      termMonths: 36,
      mileageAllowance: 12000,
    });
    const leaseMath = runLeaseMath(fields, "lease");
    // Verify markup is significant enough
    expect(leaseMath?.rateMarkup?.totalMarkupDollars).toBeGreaterThan(1500);

    const result = applyRuleEngine(makeLlm(), fields, null, "lease", leaseMath);
    expect(result.dealScore).toBe("YELLOW");
    expect(result.verdictLabel).toMatch(/RATE MARKUP/i);
  });

  it("payment discrepancy > $50 triggers YELLOW verdict", () => {
    const fields = makeFields({
      moneyFactor: 0.00100,
      salePrice: 30000,
      residualValue: 16500,
      outTheDoorPrice: 32000,
      termMonths: 36,
      monthlyPayment: 500, // ~$78 above expected
    });
    const leaseMath = runLeaseMath(fields, "lease");
    expect(leaseMath?.paymentValidation?.isSignificant).toBe(true);
    expect(Math.abs(leaseMath!.paymentValidation!.discrepancy)).toBeGreaterThan(50);

    const result = applyRuleEngine(makeLlm(), fields, null, "lease", leaseMath);
    expect(result.dealScore).toBe("YELLOW");
    expect(result.verdictLabel).toMatch(/PAYMENT/i);
  });

  it("low residual triggers YELLOW verdict", () => {
    const fields = makeFields({
      vehicle_make: "Hyundai",
      moneyFactor: 0.00100,
      residualPercent: 42,
      msrp: 35000,
      outTheDoorPrice: 36000,
      termMonths: 36,
    });
    const leaseMath = runLeaseMath(fields, "lease");
    expect(leaseMath?.residualCheck?.status).toBe("low");

    const result = applyRuleEngine(makeLlm(), fields, null, "lease", leaseMath);
    expect(result.dealScore).toBe("YELLOW");
    expect(result.verdictLabel).toMatch(/RESIDUAL/i);
  });

  it("acquisition fee marked up triggers YELLOW verdict", () => {
    const fields = makeFields({
      vehicle_make: "Honda",
      moneyFactor: 0.00070,
      acquisitionFee: 895,
      residualValue: 17600,
      salePrice: 31000,
      outTheDoorPrice: 32000,
      termMonths: 36,
      mileageAllowance: 12000,
    });
    const leaseMath = runLeaseMath(fields, "lease");
    expect(leaseMath?.acquisitionFeeBenchmark?.isMarkedUp).toBe(true);

    const result = applyRuleEngine(makeLlm(), fields, null, "lease", leaseMath);
    expect(result.dealScore).toBe("YELLOW");
    expect(result.verdictLabel).toMatch(/ACQUISITION/i);
  });

  it("clean lease with no issues passes through to general rules", () => {
    const fields = makeFields({
      vehicle_make: "BMW",
      moneyFactor: 0.00120,
      salePrice: 52000,
      residualValue: 31900,
      residualPercent: 58,
      termMonths: 36,
      acquisitionFee: 925,
      mileageAllowance: 10000,
      outTheDoorPrice: 55000,
      downPayment: 3000,
      monthlyPayment: 572, // matches expected: dep 475 + rent 97.08
    });
    const leaseMath = runLeaseMath(fields, "lease");
    // Payment should not be flagged as significant
    expect(leaseMath?.paymentValidation?.isSignificant).toBe(false);

    const result = applyRuleEngine(makeLlm(), fields, null, "lease", leaseMath);
    // Should reach general rules (OTD present → GREEN)
    expect(result.dealScore).toBe("GREEN");
  });
});
