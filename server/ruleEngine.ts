import type { AnalysisDimensions, AnalysisResponse, DetectedFields, Fee, GoNoGo } from "../shared/schema.js";
import type { LeaseMathResult } from "./leaseMathEngine.js";
import { computePurchase, type PurchaseMath } from "./quoteMath.js";
import { resolvePurchaseLines } from "./governmentCharges.js";
import {
  acceptIndependentBenchmark,
  compareFactoryMsrp,
  formatUsd,
  toMarketValuation,
  type MarketBenchmark,
  type MarketValuation,
  type MsrpComparison,
  type QuotedVehicle,
} from "./marketValuation.js";
import {
  FACTORY_MSRP_TOLERANCE_DOLLARS,
  FACTORY_STICKER_COMPARISON,
} from "../shared/windowSticker.js";
import {
  classifyDocFee,
  classifySeparateFilingCharges,
  type DocFeeAssessment,
  type DocFeeQuoteContext,
  type RegulatoryStateInput,
  type SeparateFilingAssessment,
} from "./regulatoryClassification.js";
import { docFeeSurfaceCopy } from "../shared/docFeeSurfaceCopy.js";
import { buildConstrainedReply } from "./replyConstraint.js";
import { isDocFeeName } from "./docFeeName.js";
import type { VinCheck } from "../shared/buyerReported.js";
import { FINDING_RANK, dedupeSentences, normalizeGeneratedPunctuation } from "./findingRank.js";
import { scanVins } from "./vinIdentity.js";
import { resolveTransactionDate, stateUsesDatedCeiling } from "./transactionDate.js";

export interface RuleEngineOptions {
  stateData?: RegulatoryStateInput | null;
  /** null means the dealer did not say whether it is a DMV private industry partner. */
  privateIndustryPartner?: boolean | null;
  /** null means the quote did not say whether an Oregon dealer uses an electronic integrator. */
  electronicIntegrator?: boolean | null;
  /**
   * Pennsylvania only. True when the dealer provides electronic transaction
   * services, false when it does not, null when the quote does not say.
   */
  electronicTransaction?: boolean | null;
  /** Quote or analysis date used to choose a dated statutory ceiling. */
  asOf?: string | Date | null;
  /** A caller-supplied benchmark. Ignored when it merely copies the submitted price. */
  marketBenchmark?: MarketBenchmark | null;
  condition?: "new" | "used" | "unknown" | null;
  mileage?: number | null;
  alternateSalePrices?: number[];
  /** Distinct out-the-door totals printed in the same quote or thread. */
  alternateOutTheDoorPrices?: number[];
  buyerState?: string | null;
  dealerState?: string | null;
  rebateContingentOnFinancing?: boolean | null;
  /** Raw quote text. Used to restore a tax or registration line the model dropped. */
  dealerText?: string | null;
  /**
   * Monroney MSRP the buyer typed. Not the MSRP extracted from the dealer quote.
   * A licensed valuation can still be passed as marketBenchmark later.
   */
  buyerWindowStickerMsrp?: number | null;
  /**
   * Plain-English note about buyer-typed listings, a book value, or a second
   * quote. It is not an independent market valuation.
   */
  buyerReportedExplanation?: string | null;
  /** True only when the selling price is clearly above every buyer-typed listing. */
  quoteAboveAllBuyerComps?: boolean;
  /** Plain-English note when the NHTSA VIN decode does not match the quote. */
  vinMismatchNote?: string | null;
  /** Trim named on the quote when it is not already part of the model string. */
  trim?: string | null;
  /**
   * NHTSA decode for a VIN on the quote. Absent or not_provided means no VIN.
   * A present VIN must decode consistently before GO.
   */
  vinCheck?: Pick<VinCheck, "status" | "vin" | "mismatches" | "summary"> | null;
}

export interface RuleEngineResult {
  dealScore: "GREEN" | "YELLOW" | "RED";
  confidenceLevel: "HIGH" | "MEDIUM" | "LOW";
  verdictLabel: string;
  goNoGo: GoNoGo;
  summary?: string;
  reasoning?: string;
  suggestedReply?: string;
  primaryIssue?: string;
  dimensions?: AnalysisDimensions;
  marketBenchmark?: MarketBenchmark;
  marketValuation?: MarketValuation;
  msrpComparison?: MsrpComparison;
  mathematicalDerivation?: string[];
  docFeeAssessment?: DocFeeAssessment | null;
  separateFilingAssessments?: SeparateFilingAssessment[];
}

export interface DocFeeCapResult {
  violated: boolean;
  capAmount: number;
  chargedAmount: number;
  overage: number;
  stateName: string;
  stateAbbreviation: string;
  statuteCitation: string | null;
}

/**
 * Legacy cap check. It reports a violation only when classifyDocFee returns
 * illegal. An unverified stored figure and a conditional ceiling do not.
 */
export function checkDocFeeCap(
  fees: Fee[],
  stateData: RegulatoryStateInput & { abbreviation?: string },
  quote?: DocFeeQuoteContext | null,
): DocFeeCapResult | null {
  const assessment = classifyDocFee(fees, stateData, null, null, quote ?? null);
  const projected = docFeeSurfaceCopy(assessment);
  if (!projected.capCheck || assessment.chargedAmount == null) return null;
  if (assessment.classification !== "illegal" && assessment.classification !== "permissible" && assessment.classification !== "potentially_noncompliant") {
    return null;
  }
  return {
    violated: projected.capCheck.violated,
    capAmount: projected.capCheck.capAmount,
    chargedAmount: projected.capCheck.chargedAmount,
    overage: projected.capCheck.overage,
    stateName: assessment.jurisdiction,
    stateAbbreviation: stateData.abbreviation ?? "",
    statuteCitation: projected.capCheck.statuteCitation,
  };
}

// "Junk fees" — charges that provide little/no value or duplicate other charges.
// Aligned with FTC junk fee terminology for regulatory and SEO relevance.
const JUNK_FEE_KEYWORDS = [
  "dealer fee",
  "doc fee",
  "documentation fee",
  "protection package",
  "nitrogen",
  "etch",
  "paint protection",
  "ceramic",
  "appearance package",
  "dealer add",
  "dealer accessories",
  "window tint",
  "wheel locks",
  "pinstripe",
  "fabric protection",
  "undercoating",
  "clear coat",
  "gap insurance",
  "extended warranty",
  "dealer prep",
  "lot fee",
  "pre-delivery inspection",
  "delivery fee",
  "reconditioning fee",
  "anti-theft",
  "vin etch",
];

// Backward-compatible alias
const VAGUE_FEE_KEYWORDS = JUNK_FEE_KEYWORDS;

const MARKET_ADJUSTMENT_KEYWORDS = [
  "market adjustment",
  "markup",
  "adm",
  "additional dealer markup",
  "dealer markup",
  "market value adjustment",
  "addendum",
];

const ADD_ON_THRESHOLD = 300;
const HIGH_ADD_ON_THRESHOLD = 500;

/** A doc fee at or under a known cap is legal. It is not an add-on. */
function isDocFeeWithinCap(fee: Fee, capAmount: number | null): boolean {
  if (capAmount === null || fee.amount === null) return false;
  return isDocFeeName(fee.name.toLowerCase()) && fee.amount <= capAmount;
}

function hasVagueFees(fees: Fee[], allowedDocCap: number | null = null): boolean {
  return fees.some((fee) => {
    if (isDocFeeWithinCap(fee, allowedDocCap)) return false;
    const nameLower = fee.name.toLowerCase();
    return isJunkName(nameLower) && (fee.amount === null || fee.amount > ADD_ON_THRESHOLD);
  });
}

function hasMarketAdjustment(fees: Fee[]): boolean {
  return fees.some((fee) => {
    const nameLower = fee.name.toLowerCase();
    return MARKET_ADJUSTMENT_KEYWORDS.some((keyword) => {
      // "adm" is contained in "admin". Match it only as its own word.
      if (keyword === "adm") return /\badm\b/i.test(nameLower);
      return nameLower.includes(keyword.toLowerCase());
    });
  });
}

function isJunkName(nameLower: string): boolean {
  return (
    isDocFeeName(nameLower) ||
    VAGUE_FEE_KEYWORDS.some((keyword) => nameLower.includes(keyword.toLowerCase()))
  );
}

function countHighCostAddOns(fees: Fee[], allowedDocCap: number | null = null): number {
  return fees.filter((fee) => {
    if (isDocFeeWithinCap(fee, allowedDocCap)) return false;
    const nameLower = fee.name.toLowerCase();
    return isJunkName(nameLower) && fee.amount !== null && fee.amount >= HIGH_ADD_ON_THRESHOLD;
  }).length;
}

function hasSingleSignificantAddOn(fees: Fee[]): boolean {
  return fees.some((fee) => {
    const nameLower = fee.name.toLowerCase();
    const isAddOn = VAGUE_FEE_KEYWORDS.some((keyword) =>
      nameLower.includes(keyword.toLowerCase())
    );
    return isAddOn && fee.amount !== null && fee.amount >= ADD_ON_THRESHOLD;
  });
}

// --- Lease-specific detection ---

function isLeaseQuote(fields: DetectedFields, purchaseType?: string): boolean {
  if (purchaseType === "lease") return true;
  return (
    fields.moneyFactor !== null && fields.moneyFactor !== undefined ||
    fields.residualValue !== null && fields.residualValue !== undefined ||
    fields.residualPercent !== null && fields.residualPercent !== undefined ||
    fields.acquisitionFee !== null && fields.acquisitionFee !== undefined ||
    fields.dispositionFee !== null && fields.dispositionFee !== undefined
  );
}

function isMissingLeaseTerms(fields: DetectedFields): boolean {
  const hasMoneyFactor = fields.moneyFactor !== null && fields.moneyFactor !== undefined;
  const hasResidual = (fields.residualValue !== null && fields.residualValue !== undefined) ||
    (fields.residualPercent !== null && fields.residualPercent !== undefined);
  const hasMileage = fields.mileageAllowance !== null && fields.mileageAllowance !== undefined;
  const hasPrice =
    (fields.salePrice !== null && fields.salePrice !== undefined) ||
    (fields.msrp !== null && fields.msrp !== undefined) ||
    (fields.outTheDoorPrice !== null && fields.outTheDoorPrice !== undefined);
  // Missing if any of the core lease terms are absent. A payment with no
  // capitalized-cost basis cannot be checked.
  return !hasMoneyFactor || !hasResidual || !hasMileage || !hasPrice;
}

function hasExcessiveMileageRate(fields: DetectedFields): boolean {
  return fields.excessMileageRate !== null && fields.excessMileageRate !== undefined && fields.excessMileageRate > 0.30;
}

function hasHighAcquisitionFee(fields: DetectedFields): boolean {
  return fields.acquisitionFee !== null && fields.acquisitionFee !== undefined && fields.acquisitionFee > 1000;
}

function isPaymentOnlyQuote(fields: DetectedFields): boolean {
  return (
    fields.monthlyPayment !== null &&
    fields.salePrice === null &&
    fields.outTheDoorPrice === null
  );
}

function hasOTD(fields: DetectedFields): boolean {
  return fields.outTheDoorPrice !== null;
}

interface VerdictDraft {
  dealScore: "GREEN" | "YELLOW" | "RED";
  confidenceLevel: "HIGH" | "MEDIUM" | "LOW";
  verdictLabel: string;
  goNoGo: GoNoGo;
  primaryIssue: string;
  summary: string;
}

function appendContextNotes(summary: string, notes: string[]): string {
  let next = summary;
  for (const note of notes) {
    if (!note || next.includes(note)) continue;
    next = `${next} ${note}`;
  }
  return next;
}

function distinctPrices(values: number[] | undefined): number[] {
  const out: number[] = [];
  for (const price of values ?? []) {
    if (!Number.isFinite(price)) continue;
    if (out.some((existing) => Math.abs(existing - price) < 1)) continue;
    out.push(price);
  }
  return out;
}

function declinedAddOnStillCharged(fees: Fee[]): Fee | null {
  return (
    fees.find((fee) => {
      if (fee.amount == null || fee.amount <= 0) return false;
      return /declined|removed|waived|buyer refused/i.test(fee.name);
    }) ?? null
  );
}

function finishVerdict(
  draft: VerdictDraft,
  extras: {
    fields: DetectedFields;
    benchmark: MarketBenchmark;
    docFee: DocFeeAssessment | null;
    separateFilingAssessments?: SeparateFilingAssessment[];
    derivation: string[];
    dimensions: AnalysisDimensions;
    marketVerified: boolean;
    marketValuation: MarketValuation;
    msrpComparison: MsrpComparison;
    notes?: string[];
    extraAsks?: string[];
  },
): RuleEngineResult {
  const askForVehicleEvidence = !extras.marketVerified || draft.goNoGo !== "GO";
  const suggestedReply = buildConstrainedReply({
    verdict: draft.goNoGo,
    marketVerified: extras.marketVerified,
    docFee: extras.docFee,
    primaryIssue: draft.primaryIssue,
    derivation: extras.derivation,
    askForVehicleEvidence,
    benchmarkKind: extras.benchmark.kind ?? null,
    msrpMarkup: extras.msrpComparison.relation === "above",
    extraAsks: extras.extraAsks,
  });
  const summary = normalizeGeneratedPunctuation(
    dedupeSentences(appendContextNotes(draft.summary, extras.notes ?? [])),
  );
  const reasoning = [
    summary,
    extras.benchmark.reason,
    ...extras.derivation,
    `Pricing transparency: ${extras.dimensions.pricingTransparency.summary}`,
    `Mathematical accuracy: ${extras.dimensions.mathematicalAccuracy.summary}`,
    `Regulatory compliance: ${extras.dimensions.regulatoryCompliance.summary}`,
    `Market competitiveness: ${extras.dimensions.marketCompetitiveness.summary}`,
    `Negotiation opportunities: ${extras.dimensions.negotiationOpportunities.summary}`,
    `Information completeness: ${extras.dimensions.informationCompleteness.summary}`,
  ].join("\n");
  return {
    ...draft,
    primaryIssue: normalizeGeneratedPunctuation(draft.primaryIssue),
    summary,
    reasoning: normalizeGeneratedPunctuation(reasoning),
    suggestedReply,
    dimensions: extras.dimensions,
    marketBenchmark: extras.benchmark,
    marketValuation: extras.marketValuation,
    msrpComparison: extras.msrpComparison,
    mathematicalDerivation: extras.derivation,
    docFeeAssessment: extras.docFee,
    separateFilingAssessments: extras.separateFilingAssessments ?? [],
  };
}

const FINANCING_TERMS_ASK =
  "A monthly payment or financing language is on this quote, but the financing payment could not be calculated. That unavailable calculation was not treated as a reconciled payment. Please provide the APR, the term in months, and the amount financed.";

const FINANCING_LANGUAGE = [
  /\bmonthly\s+payment\b/i,
  /\bamount\s+financed\b/i,
  /\bper\s+month\b/i,
  /\binterest\s+rate\b/i,
  /\bapr\b/i,
  /(?<!\b(?:not|no|without)(?:\s+\w+){0,3}\s)\b(?:financ(?:e|ed|ing)|loan)\b/i,
];

export type RegulatoryGoStatus = "validated" | "unknown" | "ineligible";

export function regulatoryGoDecision(
  docFee: DocFeeAssessment | null,
  stateKnown: boolean,
): { status: RegulatoryGoStatus; reason: string } {
  if (!stateKnown) {
    return {
      status: "unknown",
      reason: "The dealership state is unknown, so no fee rule was validated. An unknown regulatory status cannot approve this quote.",
    };
  }
  if (!docFee) {
    return {
      status: "unknown",
      reason: "No regulatory check was completed, so this quote cannot be approved.",
    };
  }
  if (docFee.classification === "needs_source") {
    return {
      status: "unknown",
      reason: `${docFee.summary} A cap that needs a source was not treated as a validated check.`,
    };
  }
  if (docFee.classification === "potentially_noncompliant") {
    return {
      status: "unknown",
      reason: `${docFee.summary} A conditional rule that was not confirmed was not treated as a validated check.`,
    };
  }
  if (docFee.classification === "permissible") {
    return { status: "validated", reason: docFee.summary };
  }
  if (
    docFee.classification === "not_checked" &&
    docFee.chargedAmount == null &&
    docFee.officialSource.startsWith("http") &&
    docFee.statutoryReference !== "needs_source"
  ) {
    return {
      status: "validated",
      reason: "No documentation fee was charged, and the state rule was identified.",
    };
  }
  if (docFee.classification === "not_checked") {
    return {
      status: "unknown",
      reason: "The documentation-fee check did not reach a validated result, so it cannot approve this quote.",
    };
  }
  return {
    status: "ineligible",
    reason: docFee.summary || "The regulatory check did not validate this quote.",
  };
}

function quoteShowsFinancingLanguage(text: string | null | undefined): boolean {
  if (!text) return false;
  return FINANCING_LANGUAGE.some((pattern) => pattern.test(text));
}

function hasFinancingIntent(
  fields: DetectedFields,
  purchaseType: string | undefined,
  dealerText: string | null | undefined,
  leaseQuote: boolean,
): boolean {
  if (leaseQuote || purchaseType === "lease") return false;
  if (purchaseType === "finance") return true;
  if (fields.monthlyPayment != null && fields.monthlyPayment > 0) return true;
  if (fields.apr != null || fields.termMonths != null) return true;
  return quoteShowsFinancingLanguage(dealerText);
}

function financingPaymentReconciled(
  fields: DetectedFields,
  worksheet: PurchaseMath | null,
  financingIntent: boolean,
  paymentGap: number,
): boolean {
  if (!financingIntent) return true;
  if (!worksheet?.ok) return false;
  if (fields.apr == null || fields.termMonths == null) return false;
  if (worksheet.monthlyPayment == null || worksheet.amountFinanced == null) return false;
  if (fields.monthlyPayment == null) return false;
  return paymentGap < 0.01;
}

function yearMakeModelPresent(fields: DetectedFields): boolean {
  return fields.vehicle_year != null &&
    Number.isInteger(fields.vehicle_year) &&
    !!fields.vehicle_make?.trim() &&
    !!fields.vehicle_model?.trim();
}

function vehicleIdentityForGo(
  fields: DetectedFields,
  vinCheck: RuleEngineOptions["vinCheck"],
): { ok: boolean; vinProblem: boolean; reason: string } {
  if (!yearMakeModelPresent(fields)) {
    return {
      ok: false,
      vinProblem: false,
      reason: "Year, make, and model are required before this quote can be approved.",
    };
  }
  if (!vinCheck || vinCheck.status === "not_provided" || !vinCheck.vin) {
    return { ok: true, vinProblem: false, reason: "" };
  }
  if (vinCheck.status === "decoded" && vinCheck.mismatches.length === 0) {
    return { ok: true, vinProblem: false, reason: "" };
  }
  return {
    ok: false,
    vinProblem: true,
    reason: vinCheck.summary?.trim()
      ? vinCheck.summary
      : "A VIN is present, but the VIN decoder did not confirm the year, make, and model, so this quote cannot be approved.",
  };
}

function readStatedAmountFinanced(text: string | null | undefined): number | null {
  if (!text) return null;
  const match = text.match(/\bamount\s+financed\b[^$\d]{0,40}\$?\s*(\d{1,3}(?:,\d{3})+|\d+)(?:\.(\d{2}))?/i);
  if (!match) return null;
  const dollars = Number(match[1].replace(/,/g, ""));
  const cents = match[2] ? Number(match[2]) / 100 : 0;
  if (!Number.isFinite(dollars)) return null;
  return Math.round((dollars + cents) * 100) / 100;
}

export function applyRuleEngine(
  _llmResult: AnalysisResponse,
  fields: DetectedFields,
  _docFeeCapResult?: DocFeeCapResult | null,
  purchaseType?: string,
  leaseMath?: LeaseMathResult | null,
  options?: RuleEngineOptions,
): RuleEngineResult {
  const fees = fields.fees || [];
  const partner = options?.privateIndustryPartner ?? null;
  const integrator = options?.electronicIntegrator ?? null;
  const transactionDate = resolveTransactionDate(options?.dealerText, options?.asOf ?? new Date());
  const docFee = options?.stateData
    ? classifyDocFee(fees, options.stateData, partner, integrator, {
        vehicleCashPrice: fields.salePrice,
        electronicTransaction: options.electronicTransaction ?? null,
        dealerText: options.dealerText,
        asOf: transactionDate.day,
      })
    : null;
  const separateFilingAssessments = classifySeparateFilingCharges(
    fees,
    options?.stateData,
    options?.dealerText,
  );
  const quoteVehicle: QuotedVehicle = {
    year: fields.vehicle_year,
    make: fields.vehicle_make,
    model: fields.vehicle_model,
    trim: options?.trim,
    condition: options?.condition === "new" || options?.condition === "used" ? options.condition : options?.condition ?? null,
    mileage: options?.mileage,
  };
  const benchmark: MarketBenchmark = acceptIndependentBenchmark(
    options?.marketBenchmark,
    quoteVehicle,
    fields.salePrice,
    fields.outTheDoorPrice,
  );
  const marketValuation = toMarketValuation(benchmark, quoteVehicle);
  const marketVerified = marketValuation.status === "verified";
  const msrpComparison = compareFactoryMsrp({
    submittedSalePrice: fields.salePrice,
    submittedOutTheDoor: fields.outTheDoorPrice,
    vehicleYear: fields.vehicle_year,
    vehicleMake: fields.vehicle_make,
    vehicleModel: fields.vehicle_model,
    buyerWindowStickerMsrp: options?.buyerWindowStickerMsrp,
    condition: options?.condition,
  });

  const leaseQuote = isLeaseQuote(fields, purchaseType);
  const lines = resolvePurchaseLines(fields, isDocFeeName, options?.dealerText);
  const taxKnown = lines.statedTax != null;
  let worksheet: PurchaseMath | null = null;
  if (!leaseQuote && fields.salePrice != null) {
    const cash = purchaseType === "cash" || (fields.apr == null && fields.termMonths == null);
    worksheet = computePurchase({
      vehiclePrice: fields.salePrice,
      rebates: fields.rebates,
      tradeInAllowance: fields.tradeInValue,
      tradePayoff: lines.tradePayoff,
      docFee: lines.docFee,
      addOns: lines.addOns,
      titleFee: lines.titleFee,
      registrationFee: lines.registrationFee,
      govFees: lines.govFees,
      salesTaxAmount: lines.statedTax,
      downPayment: fields.downPayment,
      apr: fields.apr,
      termMonths: fields.termMonths,
      // An unstated tax is not zero. Comparing the printed total against a
      // worksheet that omitted it reports a false mismatch.
      statedOutTheDoor: taxKnown ? fields.outTheDoorPrice : null,
      statedMonthlyPayment: fields.monthlyPayment,
      rebateContingentOnFinancing: options?.rebateContingentOnFinancing === true,
      cashPurchase: cash,
    });
  }
  let derivation = worksheet?.ok ? [...worksheet.derivation] : [];
  if (worksheet?.ok && !taxKnown) {
    derivation = derivation.map((line) =>
      line.startsWith("Sales tax") ? "Sales tax not stated on the quote" : line,
    );
  }

  const allowedDocCap =
    docFee?.classification === "permissible" && docFee.hardCeiling != null
      ? docFee.hardCeiling
      : null;
  const hasMarketAdj = hasMarketAdjustment(fees);
  const highCostAddOnCount = countHighCostAddOns(fees, allowedDocCap);
  const paymentOnly = isPaymentOnlyQuote(fields);
  const otdPresent = hasOTD(fields);
  const vagueFeesDetected = hasVagueFees(fees, allowedDocCap);
  const declined = declinedAddOnStillCharged(fees);
  const saleOffers = distinctPrices(options?.alternateSalePrices);
  const otdOffers = distinctPrices(options?.alternateOutTheDoorPrices);
  const competing =
    saleOffers.length >= 2 ||
    otdOffers.length >= 2 ||
    saleOffers.some((price) => fields.salePrice != null && Math.abs(price - fields.salePrice) >= 1);
  const interstate =
    !!options?.buyerState &&
    !!options?.dealerState &&
    options.buyerState.toUpperCase() !== options.dealerState.toUpperCase();
  const usedWithoutMileage = options?.condition === "used" && (options.mileage == null || options.mileage <= 0);
  const vehicleNamed = !!(fields.vehicle_make || fields.vehicle_model || fields.vehicle_year);
  const negativeEquity = worksheet?.ok && (worksheet.negativeEquity ?? 0) > 0;
  const conditionalRebate = worksheet?.ok && worksheet.conditionalRebateExcluded != null;
  const otdGap =
    taxKnown && worksheet?.ok && worksheet.outTheDoorMismatch != null ? Math.abs(worksheet.outTheDoorMismatch) : 0;
  const paymentGap =
    worksheet?.ok && worksheet.paymentMismatch != null ? Math.abs(worksheet.paymentMismatch) : 0;
  const mathMismatch = (worksheet?.ok && otdGap >= 0.01) || paymentGap >= 0.01;
  const govFeesStated = lines.sawTitle || lines.sawRegistration || lines.sawGov;
  const financingIntent = hasFinancingIntent(fields, purchaseType, options?.dealerText, leaseQuote);
  const financingReconciled = financingPaymentReconciled(fields, worksheet, financingIntent, paymentGap);
  const priceAboveBenchmark =
    marketVerified &&
    fields.salePrice != null &&
    benchmark.high != null &&
    fields.salePrice > benchmark.high + (benchmark.kind === "factory_msrp" ? FACTORY_MSRP_TOLERANCE_DOLLARS : 0);
  const priceInsideBenchmark =
    marketVerified &&
    fields.salePrice != null &&
    benchmark.low != null &&
    benchmark.high != null &&
    fields.salePrice >= benchmark.low &&
    fields.salePrice <= benchmark.high + (benchmark.kind === "factory_msrp" ? FACTORY_MSRP_TOLERANCE_DOLLARS : 0);
  const stickerMarkup = msrpComparison.relation === "above" ? msrpComparison : null;

  const transparencyConcerns: string[] = [];
  if (paymentOnly) transparencyConcerns.push("Only a monthly payment is shown.");
  if (!otdPresent && !leaseQuote) transparencyConcerns.push("No out-the-door total is shown.");
  if (fees.some((fee) => fee.amount == null)) transparencyConcerns.push("At least one fee has no dollar amount.");
  const mathStatus = !worksheet?.ok
    ? leaseQuote
      ? "Lease payment math is checked separately from the purchase worksheet."
      : worksheet?.reason ?? "The worksheet could not be completed."
    : mathMismatch
      ? `The stated figures do not reconcile. ${derivation.find((line) => /difference/i.test(line)) ?? ""}`.trim()
      : (!leaseQuote && fields.outTheDoorPrice != null && (lines.statedTax == null || !govFeesStated))
        ? "Tax or government fees were not itemized, so the out-the-door total was not fully reconciled."
        : "The itemized lines reconcile to the stated out-the-door price.";
  const filingNote = separateFilingAssessments.map((item) => item.summary).join(" ");
  const regulatorySummary = [
    docFee?.summary ?? "No verified documentation-fee violation was established.",
    filingNote,
  ].filter((part) => part.trim() !== "").join(" ");
  const negotiation: string[] = [];
  if (hasMarketAdj) negotiation.push("An explicit market adjustment is negotiable dealer markup.");
  if (highCostAddOnCount > 0) negotiation.push("High-cost dealer add-ons can be removed.");
  if (docFee && (docFee.classification === "negotiable" || docFee.classification === "potentially_noncompliant")) {
    negotiation.push("The documentation fee should be questioned.");
  }
  if (negativeEquity) negotiation.push("Negative equity is being rolled into the deal.");
  if (conditionalRebate) negotiation.push("A rebate appears to require financing and was not counted on this cash quote.");
  if (stickerMarkup?.markupDollars != null && stickerMarkup.markupPercent != null) {
    negotiation.push(
      `The selling price is ${formatUsd(stickerMarkup.markupDollars)} (${stickerMarkup.markupPercent}) above the buyer-supplied factory window sticker MSRP.`,
    );
  }
  if (negotiation.length === 0) negotiation.push("No dealer charge was identified as a negotiation target beyond verifying the vehicle price.");

  const missing: string[] = [];
  if (!vehicleNamed) missing.push("Vehicle year, make, or model is missing.");
  if (usedWithoutMileage) missing.push("A used vehicle has no mileage.");
  if (!options?.stateData) missing.push("Dealership state was not identified.");
  if (paymentOnly || (!otdPresent && !leaseQuote && fields.salePrice == null)) missing.push("Key pricing is missing.");
  if (!marketVerified) missing.push("Independent market value is not verified.");
  if (financingIntent && !financingReconciled) {
    missing.push("Please provide the APR, the term in months, and the amount financed.");
  }
  if (!yearMakeModelPresent(fields)) missing.push("Vehicle year, make, and model are required.");

  const dimensions: AnalysisDimensions = {
    pricingTransparency: {
      status: transparencyConcerns.length > 0 ? "concern" : otdPresent || leaseQuote ? "clear" : "insufficient",
      summary: transparencyConcerns.length > 0 ? transparencyConcerns.join(" ") : "Material charges that were extracted are itemized.",
    },
    mathematicalAccuracy: {
      status: mathMismatch
        ? "fail"
        : !leaseQuote &&
            worksheet?.ok &&
            lines.statedTax != null &&
            govFeesStated &&
            fields.outTheDoorPrice != null &&
            otdGap < 0.01 &&
            paymentGap < 0.01 &&
            financingReconciled
          ? "clear"
          : "not_checked",
      summary: mathStatus,
    },
    regulatoryCompliance: {
      status:
        docFee?.classification === "illegal"
          ? "fail"
          : docFee?.classification === "potentially_noncompliant" || docFee?.classification === "needs_source"
            ? "concern"
            : docFee
              ? "clear"
              : "not_checked",
      summary: regulatorySummary,
    },
    marketCompetitiveness: {
      status: !marketVerified ? "insufficient" : priceAboveBenchmark ? "fail" : priceInsideBenchmark ? "clear" : "concern",
      summary: !marketVerified
        ? msrpComparison.status === "compared"
          ? `${msrpComparison.summary} Independent market value is not verified.`
          : "Market value not verified. Factory MSRP comparison and independent market valuation are different checks."
        : priceAboveBenchmark
          ? `Selling price $${fields.salePrice} is above the independent benchmark of $${benchmark.low}–$${benchmark.high} (${benchmark.source ?? "independent source"}).`
          : `Selling price is compared with an independent benchmark of $${benchmark.low}–$${benchmark.high}. The submitted price did not set that range.`,
    },
    negotiationOpportunities: {
      status: negotiation[0].startsWith("No dealer charge") ? "not_checked" : "concern",
      summary: negotiation.join(" "),
    },
    informationCompleteness: {
      status: missing.length > 1 || usedWithoutMileage || paymentOnly ? "insufficient" : missing.length === 1 ? "concern" : "clear",
      summary: missing.length > 0 ? missing.join(" ") : "The quote includes the vehicle, price, and terms needed for this audit.",
    },
  };

  const statedFinanced = readStatedAmountFinanced(options?.dealerText);
  const amountFinancedMismatch =
    statedFinanced != null &&
    worksheet?.ok === true &&
    worksheet.amountFinanced != null &&
    Math.abs(statedFinanced - worksheet.amountFinanced) >= 1;
  if (amountFinancedMismatch) {
    const sentence = `The quote says the amount financed is ${formatUsd(statedFinanced!)}. The itemized lines come to ${formatUsd(worksheet!.amountFinanced!)}.`;
    dimensions.mathematicalAccuracy = {
      status: "fail",
      summary: dimensions.mathematicalAccuracy.status === "fail"
        ? `${dimensions.mathematicalAccuracy.summary} ${sentence}`
        : sentence,
    };
  }

  const openFilings = separateFilingAssessments.filter((item) => item.classification !== "permissible");
  if (
    openFilings.length > 0 &&
    (dimensions.regulatoryCompliance.status === "clear" || dimensions.regulatoryCompliance.status === "not_checked")
  ) {
    dimensions.regulatoryCompliance = {
      status: "concern",
      summary: [dimensions.regulatoryCompliance.summary, ...openFilings.map((item) => item.summary)]
        .filter((part) => part.trim() !== "")
        .join(" "),
    };
  }

  const scannedVins = scanVins(options?.dealerText);
  const decoderCheckDigitFailed = !!options?.vinCheck &&
    /check digit/i.test(`${options.vinCheck.summary ?? ""} ${options.vinCheck.vin ?? ""}`) &&
    /does not|incorrect|invalid|wrong/i.test(options.vinCheck.summary ?? "");
  const mismatchText =
    options?.vinCheck && options.vinCheck.mismatches.length > 0
      ? options.vinCheck.summary?.trim() || options.vinMismatchNote || "The VIN does not match the vehicle on the quote."
      : options?.vinMismatchNote?.trim() || null;
  if (
    mismatchText ||
    scannedVins.conflicting ||
    scannedVins.badCheckDigits.length > 0 ||
    decoderCheckDigitFailed ||
    (options?.vinCheck && options.vinCheck.status !== "decoded" && options.vinCheck.status !== "not_provided" && !!options.vinCheck.vin)
  ) {
    const vinNote = [
      mismatchText,
      scannedVins.conflicting ? `The quote contains more than one VIN: ${scannedVins.vins.join(" and ")}.` : "",
      scannedVins.badCheckDigits.length > 0
        ? `The check digit does not match for ${scannedVins.badCheckDigits.join(" and ")}.`
        : "",
    ].filter((part) => part && part.trim() !== "").join(" ");
    if (dimensions.informationCompleteness.status === "clear") {
      dimensions.informationCompleteness = {
        status: "concern",
        summary: vinNote || dimensions.informationCompleteness.summary,
      };
    } else if (vinNote && !dimensions.informationCompleteness.summary.includes(vinNote)) {
      dimensions.informationCompleteness = {
        ...dimensions.informationCompleteness,
        summary: `${dimensions.informationCompleteness.summary} ${vinNote}`,
      };
    }
  }

  const notes = [options?.buyerReportedExplanation].filter(
    (note): note is string => !!note && note.trim() !== "",
  );
  if (
    transactionDate.source === "transaction_date" ||
    stateUsesDatedCeiling(options?.stateData?.abbreviation)
  ) {
    notes.push(transactionDate.explanation);
    if (stateUsesDatedCeiling(options?.stateData?.abbreviation) && docFee?.summary) {
      notes.push(docFee.summary);
    }
  }
  if (options?.marketBenchmark?.status === "verified" && !marketVerified && benchmark.reason) {
    notes.push(benchmark.reason);
  }
  if (scannedVins.lowercaseRaw.length > 0) {
    notes.push(
      `The VIN was printed in lowercase (${scannedVins.lowercaseRaw.join(", ")}). It was read as ${scannedVins.vins.join(", ")}.`,
    );
  }

  interface MaterialFinding {
    id: string;
    rank: number;
    order: number;
    dealScore: "GREEN" | "YELLOW" | "RED";
    confidenceLevel: "HIGH" | "MEDIUM" | "LOW";
    verdictLabel: string;
    goNoGo: GoNoGo;
    primaryIssue: string;
    summary: string;
    dealerAsk: string;
  }
  const findings: MaterialFinding[] = [];
  const findingsPush = (finding: Omit<MaterialFinding, "order" | "summary"> & { summary?: string }) => {
    findings.push({
      ...finding,
      summary: finding.summary ?? finding.primaryIssue,
      order: findings.length,
    });
  };

  const illegal = docFee?.classification === "illegal";
  if (illegal) {
    findingsPush({
      id: "illegal-doc",
      rank: FINDING_RANK.illegalDocFee,
      dealScore: "RED",
      confidenceLevel: "HIGH",
      verdictLabel: "NO-GO — DOC FEE EXCEEDS STATE CAP",
      goNoGo: "NO-GO",
      primaryIssue: docFee?.summary ?? "Documentation fee exceeds the verified state cap",
      summary: `A documentation fee exceeds a verified legal ceiling. That is a NO-GO. Market value was not used to reach this finding. ${docFee?.summary ?? ""}`.trim(),
      dealerAsk: "",
    });
  }


  if (declined) {
    findingsPush({
      id: "declined",
      rank: FINDING_RANK.declinedAddOn,
      dealScore: "RED",
      confidenceLevel: "HIGH",
      verdictLabel: "NO-GO — DECLINED ADD-ON STILL CHARGED",
      goNoGo: "NO-GO",
      primaryIssue: `${declined.name} is still charged at $${declined.amount}`,
      summary: "A charge the buyer declined is still on the quote. That is a NO-GO.",
      dealerAsk: `Please remove ${declined.name}. It is still charged at $${declined.amount}.`,
    });
  }

  const rebateExcluded = worksheet?.ok ? worksheet.conditionalRebateExcluded : null;
  const rebateExplainsOtd =
    rebateExcluded != null && taxKnown && Math.abs(otdGap - rebateExcluded) < 1;
  if (rebateExplainsOtd) {
    findingsPush({
      id: "rebate-explains",
      rank: FINDING_RANK.rebateExplainsOtd,
      dealScore: "YELLOW",
      confidenceLevel: "MEDIUM",
      verdictLabel: "PROCEED WITH CAUTION — CONDITIONAL REBATE",
      goNoGo: "PROCEED-WITH-CAUTION",
      primaryIssue: "A financing-contingent rebate was excluded from the cash price",
      dealerAsk: "Please confirm in writing whether this rebate requires financing. It was not counted on the cash price.",
    });
  }

  if (!rebateExplainsOtd && !leaseQuote && worksheet?.ok && lines.statedTax != null && otdGap >= 0.01) {
    findingsPush({
      id: "otd",
      rank: FINDING_RANK.otdMismatch,
      dealScore: "YELLOW",
      confidenceLevel: "HIGH",
      verdictLabel: "PROCEED WITH CAUTION — OTD DOESN'T ADD UP",
      goNoGo: "PROCEED-WITH-CAUTION",
      primaryIssue: "The out-the-door total does not equal the itemized lines",
      summary: `The stated out-the-door price does not reconcile. ${mathStatus}`,
      dealerAsk: "Please send an itemized out-the-door total that equals the lines on the quote.",
    });
  }

  if (!leaseQuote && worksheet?.ok && paymentGap >= 0.01 && fields.outTheDoorPrice != null) {
    findingsPush({
      id: "payment",
      rank: FINDING_RANK.paymentMismatch,
      dealScore: "YELLOW",
      confidenceLevel: "HIGH",
      verdictLabel: "PROCEED WITH CAUTION — PAYMENT DOESN'T MATCH",
      goNoGo: "PROCEED-WITH-CAUTION",
      primaryIssue: "The monthly payment does not match the amortized loan",
      summary: `The stated payment does not match the deterministic amortization. ${mathStatus}`,
      dealerAsk: "Please show how the monthly payment was calculated from the APR, the term, and the amount financed.",
    });
  }

  if (amountFinancedMismatch && statedFinanced != null && worksheet?.amountFinanced != null) {
    const issue = `The quote says the amount financed is ${formatUsd(statedFinanced)}. The itemized lines come to ${formatUsd(worksheet.amountFinanced)}.`;
    findingsPush({
      id: "amount-financed",
      rank: FINDING_RANK.amountFinancedMismatch,
      dealScore: "YELLOW",
      confidenceLevel: "HIGH",
      verdictLabel: "PROCEED WITH CAUTION — AMOUNT FINANCED DOES NOT MATCH",
      goNoGo: "PROCEED-WITH-CAUTION",
      primaryIssue: issue,
      summary: issue,
      dealerAsk: `${issue} Please explain that difference in writing.`,
    });
  }

  if (leaseQuote) {
    if (leaseMath?.acquisitionFeeBenchmark?.isMarkedUp) {
      findingsPush(cautionFinding(
        FINDING_RANK.leaseAcquisitionMarkup,
        "lease-acquisition",
        "PROCEED WITH CAUTION — ACQUISITION FEE ABOVE LENDER STANDARD",
        "Acquisition fee is above the lender benchmark",
        "Please reduce the acquisition fee to the lender standard.",
      ));
    }
    if (!leaseMath?.acquisitionFeeBenchmark && hasHighAcquisitionFee(fields)) {
      findingsPush(cautionFinding(
        FINDING_RANK.leaseHighAcquisition,
        "lease-acquisition-high",
        "PROCEED WITH CAUTION — HIGH ACQUISITION FEE",
        "Acquisition fee is above $1,000 and no lender benchmark was available",
        "Please explain the acquisition fee. It is above $1,000.",
      ));
    }
    if (leaseMath?.rateMarkup && leaseMath.rateMarkup.totalMarkupDollars > 1500) {
      findingsPush(cautionFinding(
        FINDING_RANK.leaseRateMarkup,
        "lease-rate",
        "PROCEED WITH CAUTION — RATE MARKUP DETECTED",
        "The lease money factor is marked up versus the stored buy rate",
        "Please offer the base money factor and show the markup in dollars.",
      ));
    }
    if (leaseMath?.paymentValidation?.isSignificant && Math.abs(leaseMath.paymentValidation.discrepancy) > 50) {
      findingsPush(cautionFinding(
        FINDING_RANK.leasePayment,
        "lease-payment",
        "PROCEED WITH CAUTION — PAYMENT DOESN'T MATCH",
        "The lease payment does not match the money-factor formula",
        "Please show the money factor, residual, and payment math.",
      ));
    }
    if (leaseMath?.residualCheck?.status === "low") {
      findingsPush(cautionFinding(
        FINDING_RANK.leaseResidual,
        "lease-residual",
        "PROCEED WITH CAUTION — LOW RESIDUAL VALUE",
        "The residual is below the stored brand band",
        "Please confirm the residual percentage in writing.",
      ));
    }
    if (hasExcessiveMileageRate(fields)) {
      findingsPush(cautionFinding(
        FINDING_RANK.leaseMileagePenalty,
        "lease-mileage-rate",
        "PROCEED WITH CAUTION — HIGH MILEAGE PENALTY",
        "The excess-mileage rate is above $0.30 per mile",
        "Please reduce the excess-mileage rate or explain it in writing.",
      ));
    }
    if (isMissingLeaseTerms(fields)) {
      findingsPush(insufficientFinding(
        FINDING_RANK.leaseMissingTerms,
        "lease-terms",
        "INSUFFICIENT INFORMATION — GET LEASE TERMS",
        "Money factor, residual, mileage allowance, or price is missing",
        "Please send the money factor, residual, mileage allowance, and capitalized cost.",
      ));
    }
  }

  if (hasMarketAdj && highCostAddOnCount >= 2) {
    findingsPush(noGoFinding(
      FINDING_RANK.stackedRedFlags,
      "stacked",
      "NO-GO — TOO MANY RED FLAGS",
      "The quote stacks a market adjustment with multiple high-cost add-ons",
      "Please remove the market adjustment and the dealer add-ons.",
    ));
  }
  if (hasMarketAdj) {
    findingsPush(noGoFinding(
      FINDING_RANK.marketAdjustment,
      "market-adj",
      "NO-GO — REMOVE MARKET ADJUSTMENT",
      "An explicit market adjustment is on the quote",
      "Please remove the market adjustment.",
    ));
  }
  if (highCostAddOnCount >= 2) {
    findingsPush(noGoFinding(
      FINDING_RANK.tooManyAddOns,
      "add-ons",
      "NO-GO — TOO MANY ADD-ONS",
      "Two or more high-cost dealer add-ons are on the quote",
      "Please remove the dealer add-ons that were not requested.",
    ));
  }
  if (docFee?.classification === "needs_source" && docFee.exceedsStoredCap) {
    findingsPush(cautionFinding(
      FINDING_RANK.docFeeCapUnverified,
      "doc-unverified",
      "PROCEED WITH CAUTION — DOC FEE CAP NOT VERIFIED",
      docFee.summary,
      "Please cite the statute that allows this documentation charge. The stored figure was not treated as a legal cap.",
    ));
  }
  if (highCostAddOnCount === 1) {
    findingsPush(cautionFinding(
      FINDING_RANK.singleAddOn,
      "one-add-on",
      "PROCEED WITH CAUTION — REMOVE ADD-ONS / MARKUP",
      "A high-cost dealer add-on is on the quote",
      "Please remove the high-cost dealer add-on or confirm the buyer asked for it.",
    ));
  }
  if (
    stickerMarkup &&
    stickerMarkup.markupDollars != null &&
    stickerMarkup.markupPercent != null &&
    stickerMarkup.factoryMsrp != null
  ) {
    const issue = `The selling price is ${formatUsd(stickerMarkup.markupDollars)} (${stickerMarkup.markupPercent}) above the buyer-supplied factory window sticker MSRP of ${formatUsd(stickerMarkup.factoryMsrp)}`;
    findingsPush({
      id: "sticker",
      rank: FINDING_RANK.factoryMsrpMarkup,
      dealScore: "RED",
      confidenceLevel: "HIGH",
      verdictLabel: "NO-GO — MARKUP OVER FACTORY MSRP",
      goNoGo: "NO-GO",
      primaryIssue: issue,
      summary: `${issue}. This factory-sticker markup is not an estimated market overpayment or guaranteed savings. ${FACTORY_STICKER_COMPARISON}`,
      dealerAsk: `${issue}. Please remove the markup over the factory window sticker MSRP.`,
    });
  }
  if (priceAboveBenchmark) {
    findingsPush(noGoFinding(
      FINDING_RANK.priceAboveBenchmark,
      "above-benchmark",
      "NO-GO — PRICE ABOVE INDEPENDENT BENCHMARK",
      `The selling price is above the independent benchmark of $${benchmark.low}–$${benchmark.high}`,
      "Please revise the selling price. It is above the independent benchmark.",
    ));
  }
  if (docFee?.classification === "potentially_noncompliant") {
    findingsPush(cautionFinding(
      FINDING_RANK.conditionalDocFee,
      "conditional-doc",
      "PROCEED WITH CAUTION — CONDITIONAL DOC FEE",
      docFee.summary,
      "",
    ));
  }
  if (openFilings.length > 0) {
    const docNote = docFee?.chargedAmount != null
      ? ` The $${docFee.chargedAmount} documentation charge was classified separately and was not added to this filing charge.`
      : "";
    const filingSummary = `${openFilings.map((item) => item.summary).join(" ")}${docNote}`;
    const electronic = openFilings.some((item) => item.kind === "ca_electronic_filing" || item.kind === "mn_electronic_transfer");
    findingsPush(cautionFinding(
      FINDING_RANK.unresolvedFiling,
      "filing",
      electronic
        ? "PROCEED WITH CAUTION — ELECTRONIC FILING NOT CONFIRMED"
        : "PROCEED WITH CAUTION — FILING CHARGE NOT CONFIRMED",
      filingSummary,
      electronic
        ? "Please explain each electronic filing charge in writing, including the provider's actual charge and whether the filing was completed. I am not treating that charge as confirmed."
        : "Please explain this filing charge in writing. I am not treating it as confirmed.",
    ));
  }
  if (conditionalRebate && !rebateExplainsOtd) {
    findingsPush(cautionFinding(
      FINDING_RANK.conditionalRebate,
      "rebate",
      "PROCEED WITH CAUTION — CONDITIONAL REBATE",
      "A financing-contingent rebate was excluded from the cash price",
      "Please confirm in writing whether this rebate requires financing.",
    ));
  }
  if (negativeEquity) {
    findingsPush(cautionFinding(
      FINDING_RANK.negativeEquity,
      "negative-equity",
      "PROCEED WITH CAUTION — NEGATIVE EQUITY",
      `Negative equity is $${worksheet!.negativeEquity}`,
      "Please show the trade allowance and the payoff separately. Negative equity is being rolled in.",
    ));
  }
  if (competing) {
    findingsPush(cautionFinding(
      FINDING_RANK.competingOffers,
      "competing",
      "PROCEED WITH CAUTION — COMPETING OFFERS",
      "The message contains more than one selling price or out-the-door total",
      "Which selling price and which out-the-door total is the offer?",
    ));
  }
  if (interstate) {
    findingsPush(cautionFinding(
      FINDING_RANK.interstate,
      "interstate",
      "PROCEED WITH CAUTION — CONFIRM TAX JURISDICTION",
      "The buyer state and dealer state differ, so tax and fee rules may not be the dealer's state",
      "Please confirm which state's tax and fee rules apply to this sale.",
    ));
  }
  if (scannedVins.conflicting) {
    findingsPush(cautionFinding(
      FINDING_RANK.conflictingVins,
      "vin-conflict",
      "PROCEED WITH CAUTION — CONFLICTING VINS",
      `The quote contains more than one VIN (${scannedVins.vins.join(" and ")}). Those VINs were not treated as the same vehicle.`,
      `Which VIN is on the vehicle in this quote? The quote lists ${scannedVins.vins.join(" and ")}.`,
    ));
  }
  if (scannedVins.badCheckDigits.length > 0 || decoderCheckDigitFailed) {
    const listed = scannedVins.badCheckDigits.length > 0
      ? scannedVins.badCheckDigits.join(" and ")
      : options?.vinCheck?.vin ?? "the VIN";
    findingsPush(cautionFinding(
      FINDING_RANK.badCheckDigit,
      "vin-check-digit",
      "PROCEED WITH CAUTION — VIN CHECK DIGIT IS WRONG",
      `The VIN check digit does not match for ${listed}. That VIN was not treated as confirmed.`,
      `Please send the VIN from the vehicle. The check digit does not match for ${listed}.`,
    ));
  }
  if (mismatchText) {
    findingsPush(cautionFinding(
      FINDING_RANK.vinMismatch,
      "vin-mismatch",
      "PROCEED WITH CAUTION — VIN DOES NOT MATCH THE QUOTE",
      mismatchText,
      "Please confirm the VIN matches the year, make, and model on this quote.",
    ));
  }
  if (vagueFeesDetected) {
    findingsPush(cautionFinding(
      FINDING_RANK.vagueFees,
      "vague",
      "PROCEED WITH CAUTION — CLARIFY FEES",
      "A dealer fee needs an itemized explanation",
      "Please itemize each dealer fee and say what it is for.",
    ));
  }
  if (paymentOnly) {
    findingsPush(insufficientFinding(
      FINDING_RANK.paymentOnly,
      "payment-only",
      "INSUFFICIENT INFORMATION — ASK FOR ITEMIZED OTD",
      "The quote is payment-only",
      "Please send the itemized out-the-door price, not only the monthly payment.",
    ));
  }
  const missingFinancingTerms = financingIntent && (fields.apr == null || fields.termMonths == null);
  if (missingFinancingTerms) {
    findingsPush(insufficientFinding(
      FINDING_RANK.missingFinancingTerms,
      "financing-terms",
      "INSUFFICIENT INFORMATION — FINANCING TERMS NEEDED",
      FINANCING_TERMS_ASK,
      "Please provide the APR, the term in months, and the amount financed.",
    ));
  } else if (financingIntent && !financingReconciled) {
    findingsPush(insufficientFinding(
      FINDING_RANK.financingPaymentUnstated,
      "financing-unstated",
      "INSUFFICIENT INFORMATION — FINANCING TERMS NEEDED",
      FINANCING_TERMS_ASK,
      "Please provide the monthly payment that goes with the APR, the term, and the amount financed.",
    ));
  }
  const identity = vehicleIdentityForGo(fields, options?.vinCheck);
  if (!identity.ok && !mismatchText) {
    findingsPush(insufficientFinding(
      identity.vinProblem ? FINDING_RANK.vinNotConfirmed : FINDING_RANK.vehicleNotIdentified,
      identity.vinProblem ? "vin-unconfirmed" : "vehicle",
      identity.vinProblem
        ? "INSUFFICIENT INFORMATION — VIN NOT CONFIRMED"
        : "INSUFFICIENT INFORMATION — VEHICLE NOT IDENTIFIED",
      identity.reason,
      identity.vinProblem
        ? "Please send a VIN the decoder can confirm against the year, make, and model on this quote."
        : "Please send the year, make, and model.",
    ));
  }
  if (usedWithoutMileage) {
    findingsPush(insufficientFinding(
      FINDING_RANK.missingMileage,
      "mileage",
      "INSUFFICIENT INFORMATION — MILEAGE NOT PROVIDED",
      "A used vehicle cannot be assessed without mileage",
      "Please send the odometer mileage.",
    ));
  }
  if (!otdPresent && !leaseQuote) {
    findingsPush(insufficientFinding(
      FINDING_RANK.missingOtd,
      "missing-otd",
      "INSUFFICIENT INFORMATION — GET OTD BREAKDOWN",
      "The out-the-door price is missing",
      "Please send the itemized out-the-door price.",
    ));
  }
  if (options?.quoteAboveAllBuyerComps && !marketVerified && options.buyerReportedExplanation) {
    findingsPush(cautionFinding(
      FINDING_RANK.buyerComps,
      "buyer-comps",
      "PROCEED WITH CAUTION — ABOVE THE LISTINGS YOU ENTERED",
      options.buyerReportedExplanation,
      "The asking price is above the listings that were typed in. Those listings are not a verified market value.",
    ));
  }
  const regulatory = regulatoryGoDecision(docFee, !!options?.stateData);
  if (regulatory.status === "unknown") {
    findingsPush(insufficientFinding(
      FINDING_RANK.regulatoryUnknown,
      "regulatory",
      "INSUFFICIENT INFORMATION — REGULATORY STATUS UNKNOWN",
      regulatory.reason,
      "Please tell me the dealership state and the condition that allows this documentation charge. The fee rule was not validated.",
    ));
  }

  const leaseDiscrepancy = findings.some((finding) => finding.id.startsWith("lease-"));
  if (!marketVerified) {
    const stickerNote = msrpComparison.status === "compared" && msrpComparison.relation === "at_or_below"
      ? ` The selling price is at or below the buyer-supplied factory window sticker MSRP${msrpComparison.factoryMsrp != null ? ` of ${formatUsd(msrpComparison.factoryMsrp)}` : ""}. ${FACTORY_STICKER_COMPARISON}${options?.condition === "used" ? " A used vehicle's original factory MSRP is not an independent used-market valuation." : ""} Being at or below that sticker is not a buy decision.`
      : "";
    const useLeaseLead = leaseQuote && !leaseDiscrepancy;
    const lead = useLeaseLead
      ? "Lease math did not show a discrepancy, and vehicle market value is not verified."
      : `Math and fee checks that could run did not establish a reason to approve the price.${stickerNote}`;
    findingsPush(insufficientFinding(
      useLeaseLead ? FINDING_RANK.leaseMarketUnverified : FINDING_RANK.marketUnverified,
      "market",
      "INSUFFICIENT INFORMATION — MARKET VALUE NOT VERIFIED",
      lead,
      "",
    ));
  }

  const specificMath = findings.some((finding) =>
    ["amount-financed", "otd", "payment", "financing-terms", "financing-unstated"].includes(finding.id),
  );
  const reconciliation = assessFinancialReconciliation();
  if (marketVerified && !specificMath && !(reconciliation.completed && reconciliation.successful)) {
    findingsPush(insufficientFinding(
      FINDING_RANK.reconciliationIncomplete,
      "reconciliation",
      "INSUFFICIENT INFORMATION — FINANCIAL RECONCILIATION INCOMPLETE",
      reconciliation.summary,
      "Please send the tax, title, registration, and out-the-door total so the figures can be reconciled.",
    ));
  }

  if (
    findings.length === 0 &&
    (!(reconciliation.completed && reconciliation.successful) || !disclosureAdequate() || regulatory.status !== "validated")
  ) {
    const incomplete = !(reconciliation.completed && reconciliation.successful);
    findingsPush(insufficientFinding(
      FINDING_RANK.reconciliationIncomplete,
      incomplete ? "reconciliation" : "checks",
      incomplete
        ? "INSUFFICIENT INFORMATION — FINANCIAL RECONCILIATION INCOMPLETE"
        : "INSUFFICIENT INFORMATION — CHECKS NOT COMPLETE",
      incomplete
        ? reconciliation.summary
        : "Disclosure or the applicable regulatory verification is not complete, so this quote cannot be approved.",
      incomplete
        ? "Please send the tax, title, registration, and out-the-door total so the figures can be reconciled."
        : "Please complete the itemized quote so the fee and disclosure checks can be finished.",
    ));
  }
  if (findings.length === 0 && marketVerified && !priceInsideBenchmark && !priceAboveBenchmark) {
    findingsPush(insufficientFinding(
      FINDING_RANK.priceNotInsideValuation,
      "price-band",
      "INSUFFICIENT INFORMATION — PRICE NOT INSIDE INDEPENDENT VALUATION",
      "The selling price is not inside the independent market valuation, so this quote cannot be approved.",
      "Please revise the selling price so it can be compared with the independent valuation.",
    ));
  }

  const lowercaseAsk = scannedVins.lowercaseRaw.length > 0
    ? `Please confirm the VIN ${scannedVins.vins.join(" and ")}, which was printed in lowercase.`
    : "";

  if (findings.length === 0) {
    const context = {
      fields,
      benchmark,
      docFee,
      separateFilingAssessments,
      derivation,
      dimensions,
      marketVerified,
      marketValuation,
      msrpComparison,
      notes,
      extraAsks: lowercaseAsk ? [lowercaseAsk] : [],
    };
    return finishVerdict(
      {
        dealScore: "GREEN",
        confidenceLevel: "HIGH",
        verdictLabel: "GO — PRICE INSIDE INDEPENDENT BENCHMARK",
        goNoGo: "GO",
        primaryIssue: "Price is inside an independent market valuation and the applicable math, disclosure, and fee checks are complete",
        summary: `The selling price is inside the independent market valuation of $${benchmark.low}–$${benchmark.high}. ${reconciliation.summary} Factory MSRP comparison is a separate check and was not used as this valuation.`,
      },
      context,
    );
  }

  findings.sort((a, b) => a.rank - b.rank || a.order - b.order);
  const winner = findings[0];
  const summary = findings.map((finding) => {
    if (finding.id === "market" && finding !== winner) return "Market value not verified.";
    return finding.summary;
  }).join(" ");
  const extraAsks = findings
    .map((finding) => finding.dealerAsk.trim())
    .filter((ask) => ask !== "" && !winner.primaryIssue.includes(ask));
  if (lowercaseAsk) extraAsks.push(lowercaseAsk);
  return finishVerdict(
    {
      dealScore: winner.dealScore,
      confidenceLevel: winner.confidenceLevel,
      verdictLabel: winner.verdictLabel,
      goNoGo: winner.goNoGo,
      primaryIssue: winner.primaryIssue,
      summary,
    },
    {
      fields,
      benchmark,
      docFee,
      separateFilingAssessments,
      derivation,
      dimensions,
      marketVerified,
      marketValuation,
      msrpComparison,
      notes,
      extraAsks,
    },
  );

  function cautionFinding(
    rank: number,
    id: string,
    verdictLabel: string,
    primaryIssue: string,
    dealerAsk: string,
  ): Omit<MaterialFinding, "order"> {
    return {
      id,
      rank,
      dealScore: "YELLOW",
      confidenceLevel: "MEDIUM",
      verdictLabel,
      goNoGo: "PROCEED-WITH-CAUTION",
      primaryIssue,
      summary: primaryIssue,
      dealerAsk,
    };
  }

  function noGoFinding(
    rank: number,
    id: string,
    verdictLabel: string,
    primaryIssue: string,
    dealerAsk: string,
  ): Omit<MaterialFinding, "order"> {
    return {
      id,
      rank,
      dealScore: "RED",
      confidenceLevel: "HIGH",
      verdictLabel,
      goNoGo: "NO-GO",
      primaryIssue,
      summary: primaryIssue,
      dealerAsk,
    };
  }

  function insufficientFinding(
    rank: number,
    id: string,
    verdictLabel: string,
    primaryIssue: string,
    dealerAsk: string,
  ): Omit<MaterialFinding, "order"> {
    const low = usedWithoutMileage || paymentOnly || !vehicleNamed;
    const summary = id === "market" || !marketVerified
      ? `${primaryIssue} Market value not verified.`
      : primaryIssue;
    return {
      id,
      rank,
      dealScore: "YELLOW",
      confidenceLevel: low && (id === "mileage" || id === "payment-only" || id === "vehicle") ? "LOW" : "MEDIUM",
      verdictLabel,
      goNoGo: "INSUFFICIENT-INFORMATION",
      primaryIssue,
      summary,
      dealerAsk,
    };
  }

  function assessFinancialReconciliation(): { completed: boolean; successful: boolean; summary: string } {
    if (leaseQuote) {
      const payment = leaseMath?.paymentValidation;
      if (isMissingLeaseTerms(fields) || !leaseMath || !payment) {
        return {
          completed: false,
          successful: false,
          summary: "Lease math was not completed, so the payment was not reconciled.",
        };
      }
      const successful = Math.abs(payment.discrepancy) < 0.01;
      return {
        completed: true,
        successful,
        summary: successful
          ? "The lease payment reconciles to the money-factor formula."
          : "The lease payment does not reconcile to the money-factor formula.",
      };
    }
    if (fields.salePrice == null || !worksheet?.ok) {
      return {
        completed: false,
        successful: false,
        summary: !worksheet?.ok
          ? worksheet?.reason ?? "The purchase worksheet could not be completed."
          : "The purchase worksheet could not be completed.",
      };
    }
    if (lines.statedTax == null || !govFeesStated || fields.outTheDoorPrice == null) {
      return {
        completed: false,
        successful: false,
        summary: "Tax or government fees were not stated, so the out-the-door total was not reconciled.",
      };
    }
    if (financingIntent && !financingReconciled) {
      return {
        completed: false,
        successful: false,
        summary: FINANCING_TERMS_ASK,
      };
    }
    const otdOk = otdGap < 0.01;
    const paymentOk = !financingIntent || paymentGap < 0.01;
    if (!otdOk || !paymentOk) {
      return {
        completed: true,
        successful: false,
        summary: !otdOk
          ? "The stated out-the-door price does not reconcile to the itemized lines."
          : "The financed payment does not reconcile.",
      };
    }
    return {
      completed: true,
      successful: true,
      summary: financingIntent
        ? "The out-the-door total and the financed payment reconcile, with stated tax and government fees."
        : "The itemized lines, including stated tax and government fees, reconcile to the stated out-the-door price.",
    };
  }

  function disclosureAdequate(): boolean {
    if (!vehicleNamed || paymentOnly || vagueFeesDetected) return false;
    if (fees.some((fee) => fee.amount == null)) return false;
    if (leaseQuote) return !isMissingLeaseTerms(fields);
    if (usedWithoutMileage) return false;
    return fields.salePrice != null && otdPresent;
  }

}
