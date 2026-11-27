import type { AnalysisDimensions, AnalysisResponse, DetectedFields, Fee, GoNoGo } from "../shared/schema.js";
import type { LeaseMathResult } from "./leaseMathEngine.js";
import { computePurchase, splitFees, type PurchaseMath } from "./quoteMath.js";
import {
  benchmarkCopiesSubmittedPrice,
  independentMarketBenchmark,
  type MarketBenchmark,
} from "./marketValuation.js";
import {
  classifyDocFee,
  type DocFeeAssessment,
  type RegulatoryStateInput,
} from "./regulatoryClassification.js";
import { buildConstrainedReply } from "./replyConstraint.js";

export interface RuleEngineOptions {
  stateData?: RegulatoryStateInput | null;
  /** null means the dealer did not say whether it is a DMV private industry partner. */
  privateIndustryPartner?: boolean | null;
  /** A caller-supplied benchmark. Ignored when it merely copies the submitted price. */
  marketBenchmark?: MarketBenchmark | null;
  condition?: "new" | "used" | "unknown" | null;
  mileage?: number | null;
  alternateSalePrices?: number[];
  buyerState?: string | null;
  dealerState?: string | null;
  rebateContingentOnFinancing?: boolean | null;
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
  mathematicalDerivation?: string[];
  docFeeAssessment?: DocFeeAssessment | null;
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

interface StateData {
  docFeeCap: boolean;
  docFeeCapAmount: number | null;
  name?: string;
  abbreviation?: string;
  statuteCitation?: string | null;
  cpiIndexing?: {
    isIndexed: boolean;
    currentAmount: number;
  };
}

// High-confidence doc-fee terms (explicit, low false-positive risk)
const DOC_FEE_KEYWORDS_EXACT = [
  "doc fee",
  "documentation fee",
  "document fee",
  "documentary fee",
  "documentary service",
  "documentary preparation",
  "document processing",
];

// Broader terms accepted only when a more specific doc-fee term is not found
const DOC_FEE_KEYWORDS_BROAD = [
  "dealer fee",
  "processing fee",
  "admin fee",
  "administrative fee",
];

function detectDocFee(fees: Fee[]): number | null {
  // Collect all matching fees across both tiers; prefer explicit-tier matches.
  // Return the maximum charged amount so cap violation is never understated.
  const exactMatches: number[] = [];
  const broadMatches: number[] = [];

  for (const fee of fees) {
    if (fee.amount === null) continue;
    const nameLower = fee.name.toLowerCase();
    if (DOC_FEE_KEYWORDS_EXACT.some((kw) => nameLower.includes(kw))) {
      exactMatches.push(fee.amount);
    } else if (DOC_FEE_KEYWORDS_BROAD.some((kw) => nameLower.includes(kw))) {
      broadMatches.push(fee.amount);
    }
  }

  const candidates = exactMatches.length > 0 ? exactMatches : broadMatches;
  return candidates.length > 0 ? Math.max(...candidates) : null;
}

function getEffectiveCapAmount(stateData: StateData): number | null {
  if (stateData.cpiIndexing?.isIndexed) {
    return stateData.cpiIndexing.currentAmount;
  }
  return stateData.docFeeCapAmount;
}

export function checkDocFeeCap(fees: Fee[], stateData: StateData): DocFeeCapResult | null {
  if (!stateData.docFeeCap) {
    return null;
  }
  const capAmount = getEffectiveCapAmount(stateData);
  if (capAmount === null) {
    return null;
  }
  const chargedAmount = detectDocFee(fees);
  if (chargedAmount === null) {
    return null;
  }
  const stateName = stateData.name ?? "Unknown";
  const stateAbbreviation = stateData.abbreviation ?? "";
  const statuteCitation = stateData.statuteCitation ?? null;

  if (chargedAmount > capAmount) {
    return {
      violated: true,
      capAmount,
      chargedAmount,
      overage: chargedAmount - capAmount,
      stateName,
      stateAbbreviation,
      statuteCitation,
    };
  }
  return { violated: false, capAmount, chargedAmount, overage: 0, stateName, stateAbbreviation, statuteCitation };
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
];

const ADD_ON_THRESHOLD = 300;
const HIGH_ADD_ON_THRESHOLD = 500;

function isDocFeeName(nameLower: string): boolean {
  return (
    DOC_FEE_KEYWORDS_EXACT.some((keyword) => nameLower.includes(keyword)) ||
    DOC_FEE_KEYWORDS_BROAD.some((keyword) => nameLower.includes(keyword))
  );
}

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
    derivation: string[];
    dimensions: AnalysisDimensions;
    marketVerified: boolean;
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
  });
  const reasoning = [
    draft.summary,
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
    reasoning,
    suggestedReply,
    dimensions: extras.dimensions,
    marketBenchmark: extras.benchmark,
    mathematicalDerivation: extras.derivation,
    docFeeAssessment: extras.docFee,
  };
}

export function applyRuleEngine(
  _llmResult: AnalysisResponse,
  fields: DetectedFields,
  docFeeCapResult?: DocFeeCapResult | null,
  purchaseType?: string,
  leaseMath?: LeaseMathResult | null,
  options?: RuleEngineOptions,
): RuleEngineResult {
  const fees = fields.fees || [];
  const partner = options?.privateIndustryPartner ?? null;
  const docFee = options?.stateData
    ? classifyDocFee(fees, options.stateData, partner)
    : null;
  const supplied = options?.marketBenchmark ?? null;
  const anchored =
    supplied != null &&
    benchmarkCopiesSubmittedPrice(supplied, fields.salePrice, fields.outTheDoorPrice);
  const benchmark: MarketBenchmark =
    supplied && supplied.status === "verified" && !anchored
      ? supplied
      : independentMarketBenchmark({
          submittedSalePrice: fields.salePrice,
          submittedOutTheDoor: fields.outTheDoorPrice,
          vehicleYear: fields.vehicle_year,
          vehicleMake: fields.vehicle_make,
          vehicleModel: fields.vehicle_model,
        });
  const marketVerified =
    benchmark.status === "verified" && benchmark.low != null && benchmark.high != null;

  const leaseQuote = isLeaseQuote(fields, purchaseType);
  const lines = splitFees(fees, isDocFeeName);
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
      salesTaxAmount: lines.statedTax,
      downPayment: fields.downPayment,
      apr: fields.apr,
      termMonths: fields.termMonths,
      statedOutTheDoor: fields.outTheDoorPrice,
      statedMonthlyPayment: fields.monthlyPayment,
      rebateContingentOnFinancing: options?.rebateContingentOnFinancing === true,
      cashPurchase: cash,
    });
  }
  const derivation = worksheet?.ok ? worksheet.derivation : [];

  const allowedDocCap =
    docFee?.classification === "permissible" && docFee.hardCeiling != null
      ? docFee.hardCeiling
      : docFeeCapResult && !docFeeCapResult.violated
        ? docFeeCapResult.capAmount
        : null;
  const hasMarketAdj = hasMarketAdjustment(fees);
  const highCostAddOnCount = countHighCostAddOns(fees, allowedDocCap);
  const paymentOnly = isPaymentOnlyQuote(fields);
  const otdPresent = hasOTD(fields);
  const vagueFeesDetected = hasVagueFees(fees, allowedDocCap);
  const declined = declinedAddOnStillCharged(fees);
  const competing =
    (options?.alternateSalePrices ?? []).some(
      (price) => fields.salePrice != null && Math.abs(price - fields.salePrice) >= 1,
    ) || (options?.alternateSalePrices ?? []).length >= 2;
  const interstate =
    !!options?.buyerState &&
    !!options?.dealerState &&
    options.buyerState.toUpperCase() !== options.dealerState.toUpperCase();
  const usedWithoutMileage = options?.condition === "used" && (options.mileage == null || options.mileage <= 0);
  const vehicleNamed = !!(fields.vehicle_make || fields.vehicle_model || fields.vehicle_year);
  const negativeEquity = worksheet?.ok && (worksheet.negativeEquity ?? 0) > 0;
  const conditionalRebate = worksheet?.ok && worksheet.conditionalRebateExcluded != null;
  const otdGap =
    worksheet?.ok && worksheet.outTheDoorMismatch != null ? Math.abs(worksheet.outTheDoorMismatch) : 0;
  const paymentGap =
    worksheet?.ok && worksheet.paymentMismatch != null ? Math.abs(worksheet.paymentMismatch) : 0;
  const mathMismatch = (worksheet?.ok && otdGap >= 0.01) || paymentGap >= 0.01;
  const priceAboveBenchmark =
    marketVerified &&
    fields.salePrice != null &&
    benchmark.high != null &&
    fields.salePrice > benchmark.high;
  const priceInsideBenchmark =
    marketVerified &&
    fields.salePrice != null &&
    benchmark.low != null &&
    benchmark.high != null &&
    fields.salePrice >= benchmark.low &&
    fields.salePrice <= benchmark.high;

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
      : lines.statedTax == null && fields.outTheDoorPrice != null
        ? "Tax was not itemized, so the out-the-door total was not fully reconciled."
        : "The itemized lines reconcile to the stated out-the-door price.";
  const regulatorySummary = docFee?.summary ?? (
    docFeeCapResult?.violated
      ? `Documentation fee exceeds the supplied cap of $${docFeeCapResult.capAmount}.`
      : "No verified documentation-fee violation was established."
  );
  const negotiation: string[] = [];
  if (hasMarketAdj) negotiation.push("An explicit market adjustment is negotiable dealer markup.");
  if (highCostAddOnCount > 0) negotiation.push("High-cost dealer add-ons can be removed.");
  if (docFee && (docFee.classification === "negotiable" || docFee.classification === "potentially_noncompliant")) {
    negotiation.push("The documentation fee should be questioned.");
  }
  if (negativeEquity) negotiation.push("Negative equity is being rolled into the deal.");
  if (conditionalRebate) negotiation.push("A rebate appears to require financing and was not counted on this cash quote.");
  if (negotiation.length === 0) negotiation.push("No dealer charge was identified as a negotiation target beyond verifying the vehicle price.");

  const missing: string[] = [];
  if (!vehicleNamed) missing.push("Vehicle year, make, or model is missing.");
  if (usedWithoutMileage) missing.push("A used vehicle has no mileage.");
  if (!options?.stateData && !docFeeCapResult) missing.push("Dealership state was not identified.");
  if (paymentOnly || (!otdPresent && !leaseQuote && fields.salePrice == null)) missing.push("Key pricing is missing.");
  if (!marketVerified) missing.push("Independent market value is not verified.");

  const dimensions: AnalysisDimensions = {
    pricingTransparency: {
      status: transparencyConcerns.length > 0 ? "concern" : otdPresent || leaseQuote ? "clear" : "insufficient",
      summary: transparencyConcerns.length > 0 ? transparencyConcerns.join(" ") : "Material charges that were extracted are itemized.",
    },
    mathematicalAccuracy: {
      status: mathMismatch ? "fail" : worksheet?.ok && lines.statedTax != null && otdGap < 0.01 && paymentGap < 0.01 ? "clear" : "not_checked",
      summary: mathStatus,
    },
    regulatoryCompliance: {
      status:
        docFee?.classification === "illegal" || docFeeCapResult?.violated && !docFee
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
      summary: marketVerified
        ? priceAboveBenchmark
          ? `Selling price $${fields.salePrice} is above the independent benchmark of $${benchmark.low}–$${benchmark.high} (${benchmark.source ?? "independent source"}).`
          : `Selling price is compared with an independent benchmark of $${benchmark.low}–$${benchmark.high}. The submitted price did not set that range.`
        : "Market value not verified.",
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

  const context = { fields, benchmark, docFee, derivation, dimensions, marketVerified };

  const illegal =
    docFee?.classification === "illegal" || (!docFee && !!docFeeCapResult?.violated);
  if (illegal) {
    return finishVerdict(
      {
        dealScore: "RED",
        confidenceLevel: "HIGH",
        verdictLabel: "NO-GO — DOC FEE EXCEEDS STATE CAP",
        goNoGo: "NO-GO",
        primaryIssue: docFee?.summary ?? "Documentation fee exceeds the verified state cap",
        summary: "A documentation fee exceeds a verified legal ceiling. That is a NO-GO. Market value was not used to reach this finding.",
      },
      context,
    );
  }

  if (declined) {
    return finishVerdict(
      {
        dealScore: "RED",
        confidenceLevel: "HIGH",
        verdictLabel: "NO-GO — DECLINED ADD-ON STILL CHARGED",
        goNoGo: "NO-GO",
        primaryIssue: `${declined.name} is still charged at $${declined.amount}`,
        summary: "A charge the buyer declined is still on the quote. That is a NO-GO.",
      },
      context,
    );
  }

  if (!leaseQuote && worksheet?.ok && lines.statedTax != null && otdGap >= 0.01) {
    return finishVerdict(
      {
        dealScore: "YELLOW",
        confidenceLevel: "HIGH",
        verdictLabel: "PROCEED WITH CAUTION — OTD DOESN'T ADD UP",
        goNoGo: "PROCEED-WITH-CAUTION",
        primaryIssue: "The out-the-door total does not equal the itemized lines",
        summary: `The stated out-the-door price does not reconcile. ${mathStatus}`,
      },
      context,
    );
  }

  if (!leaseQuote && worksheet?.ok && paymentGap >= 0.01 && fields.outTheDoorPrice != null) {
    return finishVerdict(
      {
        dealScore: "YELLOW",
        confidenceLevel: "HIGH",
        verdictLabel: "PROCEED WITH CAUTION — PAYMENT DOESN'T MATCH",
        goNoGo: "PROCEED-WITH-CAUTION",
        primaryIssue: "The monthly payment does not match the amortized loan",
        summary: `The stated payment does not match the deterministic amortization. ${mathStatus}`,
      },
      context,
    );
  }

  if (leaseQuote) {
    if (leaseMath?.acquisitionFeeBenchmark?.isMarkedUp) {
      return caution("PROCEED WITH CAUTION — ACQUISITION FEE ABOVE LENDER STANDARD", "Acquisition fee is above the lender benchmark");
    }
    if (!leaseMath?.acquisitionFeeBenchmark && hasHighAcquisitionFee(fields)) {
      return caution("PROCEED WITH CAUTION — HIGH ACQUISITION FEE", "Acquisition fee is above $1,000 and no lender benchmark was available");
    }
    if (leaseMath?.rateMarkup && leaseMath.rateMarkup.totalMarkupDollars > 1500) {
      return caution("PROCEED WITH CAUTION — RATE MARKUP DETECTED", "The lease money factor is marked up versus the stored buy rate");
    }
    if (leaseMath?.paymentValidation?.isSignificant && Math.abs(leaseMath.paymentValidation.discrepancy) > 50) {
      return caution("PROCEED WITH CAUTION — PAYMENT DOESN'T MATCH", "The lease payment does not match the money-factor formula");
    }
    if (leaseMath?.residualCheck?.status === "low") {
      return caution("PROCEED WITH CAUTION — LOW RESIDUAL VALUE", "The residual is below the stored brand band");
    }
    if (hasExcessiveMileageRate(fields)) {
      return caution("PROCEED WITH CAUTION — HIGH MILEAGE PENALTY", "The excess-mileage rate is above $0.30 per mile");
    }
    if (isMissingLeaseTerms(fields)) {
      return insufficient("INSUFFICIENT INFORMATION — GET LEASE TERMS", "Money factor, residual, mileage allowance, or price is missing");
    }
  }

  if (hasMarketAdj && highCostAddOnCount >= 2) {
    return noGo("NO-GO — TOO MANY RED FLAGS", "The quote stacks a market adjustment with multiple high-cost add-ons");
  }
  if (hasMarketAdj) {
    return noGo("NO-GO — REMOVE MARKET ADJUSTMENT", "An explicit market adjustment is on the quote");
  }
  if (highCostAddOnCount >= 2) {
    return noGo("NO-GO — TOO MANY ADD-ONS", "Two or more high-cost dealer add-ons are on the quote");
  }
  if (highCostAddOnCount === 1) {
    return caution("PROCEED WITH CAUTION — REMOVE ADD-ONS / MARKUP", "A high-cost dealer add-on is on the quote");
  }
  if (priceAboveBenchmark) {
    return noGo(
      "NO-GO — PRICE ABOVE INDEPENDENT BENCHMARK",
      `The selling price is above the independent benchmark of $${benchmark.low}–$${benchmark.high}`,
    );
  }
  if (docFee?.classification === "needs_source" && docFee.exceedsStoredCap) {
    return caution("PROCEED WITH CAUTION — DOC FEE CAP NOT VERIFIED", docFee.summary);
  }
  if (docFee?.classification === "potentially_noncompliant") {
    return caution("PROCEED WITH CAUTION — CONDITIONAL DOC FEE", docFee.summary);
  }
  if (conditionalRebate) {
    return caution("PROCEED WITH CAUTION — CONDITIONAL REBATE", "A financing-contingent rebate was excluded from the cash price");
  }
  if (negativeEquity) {
    return caution("PROCEED WITH CAUTION — NEGATIVE EQUITY", `Negative equity is $${worksheet!.negativeEquity}`);
  }
  if (competing) {
    return caution("PROCEED WITH CAUTION — COMPETING OFFERS", "The message contains more than one vehicle price");
  }
  if (interstate) {
    return caution("PROCEED WITH CAUTION — CONFIRM TAX JURISDICTION", "The buyer state and dealer state differ, so tax and fee rules may not be the dealer's state");
  }
  if (vagueFeesDetected) {
    return caution("PROCEED WITH CAUTION — CLARIFY FEES", "A dealer fee needs an itemized explanation");
  }

  if (paymentOnly) {
    return insufficient("INSUFFICIENT INFORMATION — ASK FOR ITEMIZED OTD", "The quote is payment-only");
  }
  if (usedWithoutMileage) {
    return insufficient("INSUFFICIENT INFORMATION — MILEAGE NOT PROVIDED", "A used vehicle cannot be assessed without mileage");
  }
  if (!otdPresent && !leaseQuote) {
    return insufficient("INSUFFICIENT INFORMATION — GET OTD BREAKDOWN", "The out-the-door price is missing");
  }
  if (leaseQuote && !marketVerified) {
    return insufficient(
      "INSUFFICIENT INFORMATION — MARKET VALUE NOT VERIFIED",
      "Lease math did not show a discrepancy, and vehicle market value is not verified",
    );
  }
  if (!marketVerified) {
    return insufficient(
      "INSUFFICIENT INFORMATION — MARKET VALUE NOT VERIFIED",
      "Math and fee checks that could run did not establish a reason to approve the price. Market value is not verified.",
    );
  }
  if (priceInsideBenchmark && !mathMismatch) {
    return finishVerdict(
      {
        dealScore: "GREEN",
        confidenceLevel: "HIGH",
        verdictLabel: "GO — PRICE INSIDE INDEPENDENT BENCHMARK",
        goNoGo: "GO",
        primaryIssue: "Price is inside an independent benchmark and the checked math is clean",
        summary: `The selling price is inside the independent benchmark of $${benchmark.low}–$${benchmark.high}, and the checked math and fee rules are clean.`,
      },
      context,
    );
  }

  return insufficient(
    "INSUFFICIENT INFORMATION — MARKET VALUE NOT VERIFIED",
    "A reliable buy decision cannot be made from this quote",
  );

  function caution(verdictLabel: string, primaryIssue: string): RuleEngineResult {
    return finishVerdict(
      {
        dealScore: "YELLOW",
        confidenceLevel: "MEDIUM",
        verdictLabel,
        goNoGo: "PROCEED-WITH-CAUTION",
        primaryIssue,
        summary: primaryIssue,
      },
      context,
    );
  }

  function noGo(verdictLabel: string, primaryIssue: string): RuleEngineResult {
    return finishVerdict(
      {
        dealScore: "RED",
        confidenceLevel: "HIGH",
        verdictLabel,
        goNoGo: "NO-GO",
        primaryIssue,
        summary: primaryIssue,
      },
      context,
    );
  }

  function insufficient(verdictLabel: string, primaryIssue: string): RuleEngineResult {
    return finishVerdict(
      {
        dealScore: "YELLOW",
        confidenceLevel: usedWithoutMileage || paymentOnly || !vehicleNamed ? "LOW" : "MEDIUM",
        verdictLabel,
        goNoGo: "INSUFFICIENT-INFORMATION",
        primaryIssue,
        summary: `${primaryIssue} Market value not verified.`,
      },
      context,
    );
  }
}
