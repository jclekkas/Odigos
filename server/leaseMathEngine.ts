/**
 * Lease math adapter.
 *
 * The worksheet is the calculation. Stored brand tables are unverified buyer
 * benchmarks: a difference is reported as informational and is never called a
 * markup. A markup exists only when the quote itself prints a buy rate and a
 * higher money factor.
 */

import type { DetectedFields } from "../shared/schema.js";
import type { LeaseComparisonPublic, LeaseOfferPublic } from "../shared/schema.js";
import { lookupBrand, type LeaseBrandInfo } from "./leaseBrandData.js";
import { applyDealerQuoteFacts, parseDealerQuoteFacts } from "./dealerQuoteText.js";
import { applyParsedLeaseFields, splitLeaseOffers } from "./leaseQuoteParse.js";
import {
  computeLeaseWorksheet,
  moneyFactorApr,
  worksheetInputFromFields,
  type LeaseWorksheet,
} from "./leaseWorksheet.js";

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
  basis: "pre_tax" | "after_tax";
}

export interface ResidualCheckResult {
  residualPercent: number;
  brandRange: [number, number];
  status: "low" | "normal" | "high";
  deviationFromRange: number;
  verification: "unverified";
  sourceStatus: "needs_source";
  informationalOnly: true;
  canUnlockGo: false;
}

export interface AcqFeeBenchmarkResult {
  charged: number;
  brandStandard: number;
  overage: number;
  isMarkedUp: false;
  verification: "unverified";
  classification: "unverified_difference" | "no_difference";
  informationalOnly: true;
  canUnlockGo: false;
  sourceStatus: "needs_source";
}

export interface BuyerBenchmarkComparison {
  verification: "unverified";
  sourceStatus: "needs_source";
  informationalOnly: true;
  canUnlockGo: false;
  moneyFactorDifference: number | null;
  acquisitionFeeDifference: number | null;
  note: string;
}

export interface LeaseMathResult {
  apr: number | null;
  /** Quote-disclosed buy-rate gap only. Null when the only comparison is an unverified benchmark. */
  rateMarkup: RateMarkupResult | null;
  paymentValidation: PaymentValidationResult | null;
  residualCheck: ResidualCheckResult | null;
  acquisitionFeeBenchmark: AcqFeeBenchmarkResult | null;
  brandMatched: string | null;
  buyerBenchmark: BuyerBenchmarkComparison | null;
  worksheet: LeaseWorksheet | null;
  comparison: LeaseComparisonPublic | null;
}

export interface LeaseMathContext {
  state?: string | null;
  dealerText?: string | null;
  competingText?: string | null;
}

function isNum(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function convertMFtoAPR(moneyFactor: number): number {
  return moneyFactor * 2400;
}

function isLeaseContext(fields: DetectedFields, purchaseType?: string): boolean {
  if (purchaseType === "lease") return true;
  return (
    (isNum(fields.moneyFactor) && fields.moneyFactor >= 0) ||
    (isNum(fields.residualValue) && fields.residualValue > 0) ||
    (isNum(fields.residualPercent) && fields.residualPercent > 0) ||
    (isNum(fields.acquisitionFee) && fields.acquisitionFee >= 0) ||
    (isNum(fields.dispositionFee) && fields.dispositionFee >= 0)
  );
}

function residualRange(brand: LeaseBrandInfo, termMonths: number | null): [number, number] | null {
  if (termMonths == null) return null;
  return brand.typicalResidualPct[termMonths] ?? null;
}

function buyerBenchmark(fields: DetectedFields, brand: LeaseBrandInfo | null): BuyerBenchmarkComparison | null {
  if (!brand) return null;
  const moneyFactorDifference = isNum(fields.moneyFactor)
    ? Math.round((fields.moneyFactor - brand.buyRateMF) * 1e8) / 1e8
    : null;
  const acquisitionFeeDifference = isNum(fields.acquisitionFee)
    ? Math.round(fields.acquisitionFee - brand.standardAcquisitionFee)
    : null;
  return {
    verification: "unverified",
    sourceStatus: "needs_source",
    informationalOnly: true,
    canUnlockGo: false,
    moneyFactorDifference,
    acquisitionFeeDifference,
    note: `${brand.brand} buyer benchmarks are unverified (needs_source). A difference from those figures is informational only and cannot support a GO.`,
  };
}

function residualCheck(fields: DetectedFields, brand: LeaseBrandInfo | null, worksheet: LeaseWorksheet): ResidualCheckResult | null {
  if (!brand || worksheet.residualContradiction || worksheet.residualPercent == null) return null;
  const range = residualRange(brand, worksheet.termMonths);
  if (!range) return null;
  let status: ResidualCheckResult["status"] = "normal";
  let deviationFromRange = 0;
  if (worksheet.residualPercent < range[0] - 3) {
    status = "low";
    deviationFromRange = worksheet.residualPercent - range[0];
  } else if (worksheet.residualPercent > range[1] + 5) {
    status = "high";
    deviationFromRange = worksheet.residualPercent - range[1];
  }
  return {
    residualPercent: Math.round(worksheet.residualPercent * 10) / 10,
    brandRange: range,
    status,
    deviationFromRange: Math.round(deviationFromRange * 10) / 10,
    verification: "unverified",
    sourceStatus: "needs_source",
    informationalOnly: true,
    canUnlockGo: false,
  };
}

function acquisitionBenchmark(fields: DetectedFields, brand: LeaseBrandInfo | null): AcqFeeBenchmarkResult | null {
  if (!brand || !isNum(fields.acquisitionFee)) return null;
  const overage = Math.round(fields.acquisitionFee - brand.standardAcquisitionFee);
  return {
    charged: fields.acquisitionFee,
    brandStandard: brand.standardAcquisitionFee,
    overage,
    isMarkedUp: false,
    verification: "unverified",
    classification: overage === 0 ? "no_difference" : "unverified_difference",
    informationalOnly: true,
    canUnlockGo: false,
    sourceStatus: "needs_source",
  };
}

function quoteDisclosedMarkup(worksheet: LeaseWorksheet): RateMarkupResult | null {
  const gap = worksheet.disclosedMarkup;
  if (!gap) return null;
  return {
    dealerAPR: gap.aprEquivalentCharged,
    buyRateAPR: gap.aprEquivalentBuyRate,
    markupAPR: Math.round((gap.aprEquivalentCharged - gap.aprEquivalentBuyRate) * 100) / 100,
    markupPerMonth: gap.extraRentPerMonth ?? 0,
    totalMarkupDollars: gap.extraRentOverTerm ?? 0,
  };
}

function paymentValidation(worksheet: LeaseWorksheet): PaymentValidationResult | null {
  const comparison = worksheet.paymentComparison;
  if (!comparison.compared || comparison.basis == null || comparison.expected == null || comparison.quoted == null || comparison.discrepancy == null) {
    return null;
  }
  return {
    expectedPaymentPreTax: comparison.basis === "pre_tax" ? comparison.expected : comparison.expected,
    quotedPayment: comparison.quoted,
    discrepancy: comparison.discrepancy,
    isSignificant: Math.abs(comparison.discrepancy) > 25,
    basis: comparison.basis,
  };
}

function fieldsFromOffer(text: string): DetectedFields {
  const blank: DetectedFields = {
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
  };
  return applyDealerQuoteFacts(blank, parseDealerQuoteFacts(text));
}

function offerPublic(label: string, worksheet: LeaseWorksheet, quoted: number | null): LeaseOfferPublic {
  return {
    label,
    effectiveMonthly: worksheet.effectiveMonthlyCost,
    totalCost: worksheet.totalContractualCost,
    mileageAllowance: worksheet.annualMileage,
    upfront: worksheet.dueAtSigning.stated,
    advertisedPayment: quoted,
    dispositionFee: worksheet.dispositionFee,
    excessMileageRate: worksheet.excessMileageRate,
  };
}

export function compareLeaseTexts(texts: { label: string; text: string }[], state?: string | null): LeaseComparisonPublic | null {
  if (texts.length < 2) return null;
  const offers = texts.map((item) => {
    const fields = fieldsFromOffer(item.text);
    const worksheet = computeLeaseWorksheet(worksheetInputFromFields(fields, { stateCode: state, saysLease: true }));
    return offerPublic(item.label, worksheet, fields.monthlyPayment ?? null);
  });
  return {
    offers,
    note: "Offers are compared on effective monthly cost, total contractual cost, mileage allowance, amount due at signing, and end-of-lease charges. The lower advertised payment is not treated as the lower cost.",
  };
}

/**
 * Run the lease worksheet. Returns null when this is not a lease.
 * Sub-results stay null when their own inputs were not stated.
 */
export function runLeaseMath(
  fields: DetectedFields,
  purchaseType?: string,
  context?: LeaseMathContext,
): LeaseMathResult | null {
  const sourced = context?.dealerText ? applyParsedLeaseFields(fields, context.dealerText) : fields;
  if (!isLeaseContext(sourced, purchaseType)) return null;

  const brand = lookupBrand(sourced.vehicle_make);
  const worksheet = computeLeaseWorksheet(worksheetInputFromFields(sourced, {
    stateCode: context?.state,
    saysLease: purchaseType === "lease" || /lease/i.test(context?.dealerText ?? ""),
  }));
  const apr = isNum(sourced.moneyFactor) && sourced.moneyFactor >= 0
    ? Math.round(moneyFactorApr(sourced.moneyFactor) * 100) / 100
    : null;

  const slices = [
    ...splitLeaseOffers(context?.dealerText ?? ""),
    ...(context?.competingText ? splitLeaseOffers(context.competingText) : []),
  ];
  const competing = context?.competingText?.trim()
    ? [{ label: "Offer A", text: context.dealerText ?? "" }, { label: "Offer B", text: context.competingText }]
    : slices;

  return {
    apr,
    rateMarkup: quoteDisclosedMarkup(worksheet),
    paymentValidation: paymentValidation(worksheet),
    residualCheck: residualCheck(sourced, brand, worksheet),
    acquisitionFeeBenchmark: acquisitionBenchmark(sourced, brand),
    brandMatched: brand?.brand ?? null,
    buyerBenchmark: buyerBenchmark(sourced, brand),
    worksheet,
    comparison: compareLeaseTexts(competing.length >= 2 ? competing : [], context?.state),
  };
}

/** Kept for tests that still call the old name. Benchmarks are never a markup. */
export function detectRateMarkup(): null {
  return null;
}

export function validateMonthlyPayment(fields: DetectedFields): PaymentValidationResult | null {
  const result = runLeaseMath(fields, "lease");
  return result?.paymentValidation ?? null;
}

export function checkResidualReasonableness(
  fields: DetectedFields,
  brandInfo: LeaseBrandInfo,
): ResidualCheckResult | null {
  const result = runLeaseMath({ ...fields, vehicle_make: brandInfo.brand }, "lease");
  return result?.residualCheck ?? null;
}

export function benchmarkAcquisitionFee(
  fields: DetectedFields,
  brandInfo: LeaseBrandInfo,
): AcqFeeBenchmarkResult | null {
  return acquisitionBenchmark({ ...fields, vehicle_make: brandInfo.brand }, brandInfo);
}
