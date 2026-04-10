/**
 * Lease Math Engine — deterministic post-processing on LLM-parsed fields.
 *
 * Five core computations:
 *   1. MF → APR conversion
 *   2. Rate markup detection (in dollars)
 *   3. Monthly payment validation
 *   4. Residual reasonableness check
 *   5. Acquisition fee benchmarking
 *
 * All functions are pure — no side effects, no external calls, never throw.
 */

import type { DetectedFields } from "@shared/schema";
import { lookupBrand, type LeaseBrandInfo } from "./leaseBrandData.js";

// ---------------------------------------------------------------------------
// Result types
// ---------------------------------------------------------------------------

export interface RateMarkupResult {
  dealerAPR: number;
  buyRateAPR: number;
  markupAPR: number;
  markupPerMonth: number;
  totalMarkupDollars: number;
}

export interface PaymentValidationResult {
  expectedPaymentPreTax: number;
  quotedPayment: number;
  discrepancy: number;
  isSignificant: boolean;
}

export interface ResidualCheckResult {
  residualPercent: number;
  brandRange: [number, number];
  status: "low" | "normal" | "high";
  deviationFromRange: number;
}

export interface AcqFeeBenchmarkResult {
  charged: number;
  brandStandard: number;
  overage: number;
  isMarkedUp: boolean;
}

export interface LeaseMathResult {
  apr: number | null;
  rateMarkup: RateMarkupResult | null;
  paymentValidation: PaymentValidationResult | null;
  residualCheck: ResidualCheckResult | null;
  acquisitionFeeBenchmark: AcqFeeBenchmarkResult | null;
  brandMatched: string | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isNum(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

/** Resolve residual dollar value from fields + MSRP. */
function resolveResidualValue(fields: DetectedFields): number | null {
  if (isNum(fields.residualValue) && fields.residualValue > 0) {
    return fields.residualValue;
  }
  if (isNum(fields.residualPercent) && isNum(fields.msrp) && fields.msrp > 0) {
    return fields.msrp * fields.residualPercent / 100;
  }
  return null;
}

/** Resolve residual percent from fields + MSRP. */
function resolveResidualPercent(fields: DetectedFields): number | null {
  if (isNum(fields.residualPercent) && fields.residualPercent > 0) {
    return fields.residualPercent;
  }
  if (isNum(fields.residualValue) && isNum(fields.msrp) && fields.msrp > 0) {
    return (fields.residualValue / fields.msrp) * 100;
  }
  return null;
}

/** Sum fee amounts from the fee array, ignoring nulls. */
function sumFees(fields: DetectedFields): number {
  if (!fields.fees || fields.fees.length === 0) return 0;
  return fields.fees.reduce((sum, f) => sum + (isNum(f.amount) ? f.amount : 0), 0);
}

/** Get the closest matching residual range for a given term. */
function getResidualRange(
  brandInfo: LeaseBrandInfo,
  termMonths: number,
): [number, number] | null {
  // Direct match
  if (brandInfo.typicalResidualPct[termMonths]) {
    return brandInfo.typicalResidualPct[termMonths];
  }
  // Fall back to 36-month
  if (brandInfo.typicalResidualPct[36]) {
    return brandInfo.typicalResidualPct[36];
  }
  return null;
}

// ---------------------------------------------------------------------------
// 1. MF → APR conversion
// ---------------------------------------------------------------------------

export function convertMFtoAPR(moneyFactor: number): number {
  return moneyFactor * 2400;
}

// ---------------------------------------------------------------------------
// 2. Rate markup detection
// ---------------------------------------------------------------------------

export function detectRateMarkup(
  fields: DetectedFields,
  brandInfo: LeaseBrandInfo,
): RateMarkupResult | null {
  if (!isNum(fields.moneyFactor) || fields.moneyFactor <= 0) return null;

  const capCost = fields.salePrice ?? fields.msrp;
  if (!isNum(capCost) || capCost <= 0) return null;

  const residual = resolveResidualValue(fields);
  if (!isNum(residual) || residual <= 0) return null;

  const termMonths = fields.termMonths ?? 36;

  const dealerAPR = fields.moneyFactor * 2400;
  const buyRateAPR = brandInfo.buyRateMF * 2400;
  const markupAPR = dealerAPR - buyRateAPR;

  const markupPerMonth = (capCost + residual) * (fields.moneyFactor - brandInfo.buyRateMF);
  const totalMarkupDollars = markupPerMonth * termMonths;

  return {
    dealerAPR: Math.round(dealerAPR * 100) / 100,
    buyRateAPR: Math.round(buyRateAPR * 100) / 100,
    markupAPR: Math.round(markupAPR * 100) / 100,
    markupPerMonth: Math.round(markupPerMonth * 100) / 100,
    totalMarkupDollars: Math.round(totalMarkupDollars),
  };
}

// ---------------------------------------------------------------------------
// 3. Monthly payment validation
// ---------------------------------------------------------------------------

export function validateMonthlyPayment(
  fields: DetectedFields,
): PaymentValidationResult | null {
  if (!isNum(fields.monthlyPayment) || fields.monthlyPayment <= 0) return null;
  if (!isNum(fields.moneyFactor) || fields.moneyFactor <= 0) return null;

  const basePrice = fields.salePrice ?? fields.msrp;
  if (!isNum(basePrice) || basePrice <= 0) return null;

  const residual = resolveResidualValue(fields);
  if (!isNum(residual) || residual <= 0) return null;

  const termMonths = fields.termMonths ?? 36;

  const totalFees = sumFees(fields);
  const downPayment = isNum(fields.downPayment) ? fields.downPayment : 0;
  const rebates = isNum(fields.rebates) ? fields.rebates : 0;
  const tradeIn = isNum(fields.tradeInValue) ? fields.tradeInValue : 0;

  const adjustedCapCost = basePrice + totalFees - downPayment - rebates - tradeIn;

  const depreciation = (adjustedCapCost - residual) / termMonths;
  const rentCharge = (adjustedCapCost + residual) * fields.moneyFactor;
  const expectedPaymentPreTax = depreciation + rentCharge;

  const discrepancy = fields.monthlyPayment - expectedPaymentPreTax;

  return {
    expectedPaymentPreTax: Math.round(expectedPaymentPreTax * 100) / 100,
    quotedPayment: fields.monthlyPayment,
    discrepancy: Math.round(discrepancy * 100) / 100,
    isSignificant: Math.abs(discrepancy) > 25,
  };
}

// ---------------------------------------------------------------------------
// 4. Residual reasonableness check
// ---------------------------------------------------------------------------

export function checkResidualReasonableness(
  fields: DetectedFields,
  brandInfo: LeaseBrandInfo,
): ResidualCheckResult | null {
  const residualPct = resolveResidualPercent(fields);
  if (!isNum(residualPct) || residualPct <= 0) return null;

  const termMonths = fields.termMonths ?? 36;
  const range = getResidualRange(brandInfo, termMonths);
  if (!range) return null;

  let status: "low" | "normal" | "high" = "normal";
  let deviationFromRange = 0;

  if (residualPct < range[0] - 3) {
    status = "low";
    deviationFromRange = residualPct - range[0];
  } else if (residualPct > range[1] + 5) {
    status = "high";
    deviationFromRange = residualPct - range[1];
  }

  return {
    residualPercent: Math.round(residualPct * 10) / 10,
    brandRange: range,
    status,
    deviationFromRange: Math.round(deviationFromRange * 10) / 10,
  };
}

// ---------------------------------------------------------------------------
// 5. Acquisition fee benchmarking
// ---------------------------------------------------------------------------

export function benchmarkAcquisitionFee(
  fields: DetectedFields,
  brandInfo: LeaseBrandInfo,
): AcqFeeBenchmarkResult | null {
  if (!isNum(fields.acquisitionFee) || fields.acquisitionFee <= 0) return null;

  const overage = fields.acquisitionFee - brandInfo.standardAcquisitionFee;

  return {
    charged: fields.acquisitionFee,
    brandStandard: brandInfo.standardAcquisitionFee,
    overage: Math.round(overage),
    isMarkedUp: overage > 0,
  };
}

// ---------------------------------------------------------------------------
// Orchestrator
// ---------------------------------------------------------------------------

function isLeaseContext(fields: DetectedFields, purchaseType?: string): boolean {
  if (purchaseType === "lease") return true;
  return (
    (isNum(fields.moneyFactor) && fields.moneyFactor > 0) ||
    (isNum(fields.residualValue) && fields.residualValue > 0) ||
    (isNum(fields.residualPercent) && fields.residualPercent > 0)
  );
}

/**
 * Run all five lease math computations on parsed fields.
 * Returns null if the quote is not a lease or lacks minimum lease data.
 * Each sub-computation returns null independently if its inputs are missing.
 */
export function runLeaseMath(
  fields: DetectedFields,
  purchaseType?: string,
): LeaseMathResult | null {
  if (!isLeaseContext(fields, purchaseType)) return null;

  const brandInfo = lookupBrand(fields.vehicle_make);

  const apr = isNum(fields.moneyFactor) && fields.moneyFactor > 0
    ? Math.round(convertMFtoAPR(fields.moneyFactor) * 100) / 100
    : null;

  const rateMarkup = brandInfo ? detectRateMarkup(fields, brandInfo) : null;
  const paymentValidation = validateMonthlyPayment(fields);
  const residualCheck = brandInfo ? checkResidualReasonableness(fields, brandInfo) : null;
  const acquisitionFeeBenchmark = brandInfo ? benchmarkAcquisitionFee(fields, brandInfo) : null;

  return {
    apr,
    rateMarkup,
    paymentValidation,
    residualCheck,
    acquisitionFeeBenchmark,
    brandMatched: brandInfo?.brand ?? null,
  };
}
