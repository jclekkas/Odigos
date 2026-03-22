import type { AnalysisResponse, DetectedFields, Fee } from "@shared/schema";

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
}

interface StateData {
  docFeeCap: boolean;
  docFeeCapAmount: number | null;
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

export function checkDocFeeCap(fees: Fee[], stateData: StateData): DocFeeCapResult | null {
  if (!stateData.docFeeCap || stateData.docFeeCapAmount === null) {
    return null;
  }
  const chargedAmount = detectDocFee(fees);
  if (chargedAmount === null) {
    return null;
  }
  if (chargedAmount > stateData.docFeeCapAmount) {
    return {
      violated: true,
      capAmount: stateData.docFeeCapAmount,
      chargedAmount,
      overage: chargedAmount - stateData.docFeeCapAmount,
    };
  }
  return { violated: false, capAmount: stateData.docFeeCapAmount, chargedAmount, overage: 0 };
}

const VAGUE_FEE_KEYWORDS = [
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
];

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
  docFeeCapResult?: DocFeeCapResult | null
): RuleEngineResult {
  if (docFeeCapResult?.violated) {
    return {
      dealScore: "RED",
      confidenceLevel: "HIGH",
      verdictLabel: "NO-GO — DOC FEE EXCEEDS STATE CAP",
      goNoGo: "NO-GO",
    };
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
