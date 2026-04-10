import type { AnalysisResponse, DetectedFields, Fee } from "@shared/schema";
import type { LeaseMathResult } from "./leaseMathEngine";

interface RuleEngineResult {
  dealScore: "GREEN" | "YELLOW" | "RED";
  confidenceLevel: "HIGH" | "MEDIUM" | "LOW";
  verdictLabel: string;
  goNoGo: "GO" | "NO-GO" | "NEED-MORE-INFO";
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

function hasVagueFees(fees: Fee[]): boolean {
  return fees.some((fee) => {
    const nameLower = fee.name.toLowerCase();
    const isVagueName = VAGUE_FEE_KEYWORDS.some((keyword) =>
      nameLower.includes(keyword.toLowerCase())
    );
    return isVagueName && (fee.amount === null || fee.amount > ADD_ON_THRESHOLD);
  });
}

function hasMarketAdjustment(fees: Fee[]): boolean {
  return fees.some((fee) => {
    const nameLower = fee.name.toLowerCase();
    return MARKET_ADJUSTMENT_KEYWORDS.some((keyword) =>
      nameLower.includes(keyword.toLowerCase())
    );
  });
}

function countHighCostAddOns(fees: Fee[]): number {
  return fees.filter((fee) => {
    const nameLower = fee.name.toLowerCase();
    const isAddOn = VAGUE_FEE_KEYWORDS.some((keyword) =>
      nameLower.includes(keyword.toLowerCase())
    );
    return isAddOn && fee.amount !== null && fee.amount >= HIGH_ADD_ON_THRESHOLD;
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
  // Missing if any of the core lease terms are absent
  return !hasMoneyFactor || !hasResidual || !hasMileage;
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

function hasAPRAndTerm(fields: DetectedFields): boolean {
  return fields.apr !== null && fields.termMonths !== null;
}

function hasMSRPOrSalePrice(fields: DetectedFields): boolean {
  return fields.msrp !== null || fields.salePrice !== null;
}

export function applyRuleEngine(
  llmResult: AnalysisResponse,
  fields: DetectedFields,
  docFeeCapResult?: DocFeeCapResult | null,
  purchaseType?: string,
  leaseMath?: LeaseMathResult | null,
): RuleEngineResult {
  if (docFeeCapResult?.violated) {
    return {
      dealScore: "RED",
      confidenceLevel: "HIGH",
      verdictLabel: "NO-GO — DOC FEE EXCEEDS STATE CAP",
      goNoGo: "NO-GO",
    };
  }

  // Lease-specific rules (applied before general rules)
  if (isLeaseQuote(fields, purchaseType)) {
    // Brand-aware acquisition fee check (replaces fixed $1000 threshold when brand data available)
    if (leaseMath?.acquisitionFeeBenchmark?.isMarkedUp) {
      return {
        dealScore: "YELLOW",
        confidenceLevel: "MEDIUM",
        verdictLabel: "PAUSE — ACQUISITION FEE ABOVE LENDER STANDARD",
        goNoGo: "NEED-MORE-INFO",
      };
    }
    if (!leaseMath?.acquisitionFeeBenchmark && hasHighAcquisitionFee(fields)) {
      return {
        dealScore: "YELLOW",
        confidenceLevel: "MEDIUM",
        verdictLabel: "PAUSE — HIGH ACQUISITION FEE",
        goNoGo: "NEED-MORE-INFO",
      };
    }
    // Lease math-driven rules
    if (leaseMath?.rateMarkup && leaseMath.rateMarkup.totalMarkupDollars > 1500) {
      return {
        dealScore: "YELLOW",
        confidenceLevel: "MEDIUM",
        verdictLabel: "PAUSE — RATE MARKUP DETECTED",
        goNoGo: "NEED-MORE-INFO",
      };
    }
    if (leaseMath?.paymentValidation?.isSignificant && Math.abs(leaseMath.paymentValidation.discrepancy) > 50) {
      return {
        dealScore: "YELLOW",
        confidenceLevel: "MEDIUM",
        verdictLabel: "PAUSE — PAYMENT DOESN'T MATCH",
        goNoGo: "NEED-MORE-INFO",
      };
    }
    if (leaseMath?.residualCheck?.status === "low") {
      return {
        dealScore: "YELLOW",
        confidenceLevel: "MEDIUM",
        verdictLabel: "PAUSE — LOW RESIDUAL VALUE",
        goNoGo: "NEED-MORE-INFO",
      };
    }
    if (hasExcessiveMileageRate(fields)) {
      return {
        dealScore: "YELLOW",
        confidenceLevel: "MEDIUM",
        verdictLabel: "PAUSE — HIGH MILEAGE PENALTY",
        goNoGo: "NEED-MORE-INFO",
      };
    }
    if (isMissingLeaseTerms(fields)) {
      return {
        dealScore: "YELLOW",
        confidenceLevel: "MEDIUM",
        verdictLabel: "PAUSE — GET LEASE TERMS",
        goNoGo: "NEED-MORE-INFO",
      };
    }
  }

  const fees = fields.fees || [];

  const hasMarketAdj = hasMarketAdjustment(fees);
  const highCostAddOnCount = countHighCostAddOns(fees);
  const paymentOnly = isPaymentOnlyQuote(fields);
  const otdPresent = hasOTD(fields);
  const aprTermPresent = hasAPRAndTerm(fields);
  const msrpOrSalePricePresent = hasMSRPOrSalePrice(fields);
  const vagueFeesDetected = hasVagueFees(fees);

  if (hasMarketAdj && highCostAddOnCount >= 2) {
    return {
      dealScore: "RED",
      confidenceLevel: "LOW",
      verdictLabel: "NO-GO — TOO MANY RED FLAGS",
      goNoGo: "NO-GO",
    };
  }

  if (hasMarketAdj) {
    return {
      dealScore: "RED",
      confidenceLevel: "LOW",
      verdictLabel: "NO-GO — REMOVE MARKET ADJUSTMENT",
      goNoGo: "NO-GO",
    };
  }

  if (highCostAddOnCount >= 2) {
    return {
      dealScore: "RED",
      confidenceLevel: "LOW",
      verdictLabel: "NO-GO — TOO MANY ADD-ONS",
      goNoGo: "NO-GO",
    };
  }

  if (highCostAddOnCount === 1) {
    return {
      dealScore: "YELLOW",
      confidenceLevel: "LOW",
      verdictLabel: "PAUSE — REMOVE ADD-ONS / MARKUP",
      goNoGo: "NEED-MORE-INFO",
    };
  }

  if (paymentOnly) {
    return {
      dealScore: "YELLOW",
      confidenceLevel: "MEDIUM",
      verdictLabel: "PAUSE — ASK FOR ITEMIZED OTD",
      goNoGo: "NEED-MORE-INFO",
    };
  }

  if (!otdPresent) {
    return {
      dealScore: "YELLOW",
      confidenceLevel: "MEDIUM",
      verdictLabel: "PAUSE — GET OTD BREAKDOWN",
      goNoGo: "NEED-MORE-INFO",
    };
  }

  if (otdPresent && aprTermPresent && !msrpOrSalePricePresent) {
    return {
      dealScore: "GREEN",
      confidenceLevel: "MEDIUM",
      verdictLabel: "PROCEED — CONFIRM DETAILS",
      goNoGo: "GO",
    };
  }

  if (otdPresent && aprTermPresent && !vagueFeesDetected) {
    return {
      dealScore: "GREEN",
      confidenceLevel: "HIGH",
      verdictLabel: "GO — TERMS LOOK CLEAN",
      goNoGo: "GO",
    };
  }

  if (otdPresent && vagueFeesDetected) {
    return {
      dealScore: "YELLOW",
      confidenceLevel: "MEDIUM",
      verdictLabel: "PAUSE — CLARIFY FEES",
      goNoGo: "NEED-MORE-INFO",
    };
  }

  if (otdPresent) {
    return {
      dealScore: "GREEN",
      confidenceLevel: "MEDIUM",
      verdictLabel: "PROCEED — CONFIRM DETAILS",
      goNoGo: "GO",
    };
  }

  return {
    dealScore: llmResult.dealScore,
    confidenceLevel: llmResult.confidenceLevel || "MEDIUM",
    verdictLabel: llmResult.verdictLabel || "REVIEW — CHECK DETAILS",
    goNoGo: llmResult.goNoGo,
  };
}
