import type { AnalysisResponse, DetectedFields, Fee } from "@shared/schema";

interface RuleEngineResult {
  dealScore: "GREEN" | "YELLOW" | "RED";
  confidenceLevel: "HIGH" | "MEDIUM" | "LOW";
  verdictLabel: string;
  goNoGo: "GO" | "NO-GO" | "NEED-MORE-INFO";
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
  fields: DetectedFields
): RuleEngineResult {
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
