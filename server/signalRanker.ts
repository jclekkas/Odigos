/**
 * signalRanker — deterministic signal ranking for analysis results.
 *
 * Produces a priority-ordered list of RankedSignal objects from the
 * analysis context. Each signal includes a concrete negotiation action
 * the user can take.
 *
 * Priority tiers (lower number = higher priority):
 *   1. Legal cap violation
 *   2. Dealer-specific repeat pattern
 *   3. State norm violation
 *   4. Line-item patterns (market adjustment, high-cost add-ons, vague fees)
 *   5. Info gaps (missing OTD, APR, etc.)
 */
import type { DetectedFields, Fee, MarketContext, MissingInfo } from "../shared/schema.js";
import type { DocFeeCapResult, RuleEngineResult } from "./ruleEngine.js";
import type { LeaseMathResult } from "./leaseMathEngine.js";

export interface RankedSignal {
  priority: number;
  category: "legal" | "dealer_pattern" | "state_norm" | "line_item" | "info_gap";
  label: string;
  detail: string;
  action: string;
  severity: "critical" | "warning" | "info";
}

export interface SignalRankerContext {
  docFeeCapCheck: DocFeeCapResult | null | undefined;
  detectedFields: DetectedFields;
  marketContext: MarketContext | null | undefined;
  ruleEngineResult: RuleEngineResult;
  leaseMath: LeaseMathResult | null | undefined;
  missingInfo: MissingInfo[];
}

// ---------------------------------------------------------------------------
// Fee detection helpers (mirror ruleEngine patterns)
// ---------------------------------------------------------------------------

function hasMarketAdjustment(fees: Fee[]): boolean {
  return fees.some((f) =>
    /market.?adjust|markup|adm|additional\s*dealer\s*markup|dealer\s*markup/i.test(f.name),
  );
}

function getMarketAdjustmentAmount(fees: Fee[]): number {
  return fees
    .filter((f) => /market.?adjust|markup|adm/i.test(f.name))
    .reduce((sum, f) => sum + (f.amount ?? 0), 0);
}

function getHighCostAddOns(fees: Fee[]): Fee[] {
  const VAGUE_FEE_RE = /protection|nitrogen|etch|ceramic|fabric|undercoat|pinstripe|clear\s*coat|anti.?theft|window\s*tint|wheel\s*lock|gap|extended\s*warranty|dealer\s*(prep|add|accessor)/i;
  return fees.filter((f) => VAGUE_FEE_RE.test(f.name) && f.amount !== null && f.amount >= 500);
}

function hasVagueFees(fees: Fee[]): boolean {
  const VAGUE_FEE_RE = /protection|nitrogen|etch|ceramic|fabric|undercoat|pinstripe/i;
  return fees.some((f) => VAGUE_FEE_RE.test(f.name) && (f.amount === null || f.amount > 300));
}

// ---------------------------------------------------------------------------
// Signal builders
// ---------------------------------------------------------------------------

function buildLegalSignal(cap: DocFeeCapResult): RankedSignal {
  const citation = cap.statuteCitation ? ` per ${cap.statuteCitation}` : "";
  return {
    priority: 1,
    category: "legal",
    label: "Doc fee exceeds state cap",
    detail: `This dealer's $${cap.chargedAmount} doc fee exceeds ${cap.stateName}'s $${cap.capAmount} legal cap by $${cap.overage}${citation}.`,
    action: `Tell the dealer: "Your doc fee of $${cap.chargedAmount} exceeds the ${cap.stateName} cap of $${cap.capAmount}${citation}. Please reduce it to $${cap.capAmount} or below."`,
    severity: "critical",
  };
}

function buildDealerPatternSignal(mc: MarketContext): RankedSignal | null {
  if (
    mc.dealerAnalysisCount == null ||
    mc.dealerAnalysisCount < 3 ||
    mc.dealerAvgDealScore == null
  ) {
    return null;
  }
  // A consistently poor dealer score (avg < 40 on 75/50/25 scale) is a repeat pattern
  if (mc.dealerAvgDealScore < 40) {
    return {
      priority: 2,
      category: "dealer_pattern",
      label: "Dealer has a pattern of poor-scoring deals",
      detail: `Across ${mc.dealerAnalysisCount} analyzed quotes, this dealer averages a deal score of ${mc.dealerAvgDealScore.toFixed(0)} — below the threshold for fair deals.`,
      action: "Get competing quotes from at least two other dealers before committing. This dealer's track record suggests negotiation will be harder.",
      severity: "warning",
    };
  }
  return null;
}

function buildStateNormSignal(mc: MarketContext, docFee: number | null): RankedSignal | null {
  if (
    mc.stateStrength !== "strong" ||
    mc.stateAvgDocFee == null ||
    docFee == null ||
    mc.docFeeVsStateAvg == null
  ) {
    return null;
  }
  const delta = mc.docFeeVsStateAvg;
  // Only flag if doc fee is meaningfully above state average
  if (delta > 200) {
    return {
      priority: 3,
      category: "state_norm",
      label: "Doc fee above state average",
      detail: `Your doc fee is $${Math.round(delta)} above the ${mc.stateCode} average of $${Math.round(mc.stateAvgDocFee)} based on ${mc.stateTotalAnalyses} analyzed deals.`,
      action: `Ask the dealer: "The average doc fee in ${mc.stateCode} is around $${Math.round(mc.stateAvgDocFee)}. Can you match that?"`,
      severity: "warning",
    };
  }
  return null;
}

function buildLineItemSignals(fees: Fee[]): RankedSignal[] {
  const signals: RankedSignal[] = [];

  if (hasMarketAdjustment(fees)) {
    const amount = getMarketAdjustmentAmount(fees);
    const amountStr = amount > 0 ? ` ($${amount.toLocaleString()})` : "";
    signals.push({
      priority: 4,
      category: "line_item",
      label: "Market adjustment detected",
      detail: `This quote includes a market adjustment${amountStr}. This is pure dealer markup above MSRP.`,
      action: `Tell the dealer: "I'd like the market adjustment removed. I'm prepared to walk if it stays."`,
      severity: "warning",
    });
  }

  const highCostAddOns = getHighCostAddOns(fees);
  if (highCostAddOns.length >= 2) {
    const names = highCostAddOns.map((f) => f.name).join(", ");
    const total = highCostAddOns.reduce((s, f) => s + (f.amount ?? 0), 0);
    signals.push({
      priority: 4,
      category: "line_item",
      label: `${highCostAddOns.length} high-cost add-ons ($${total.toLocaleString()})`,
      detail: `Found ${highCostAddOns.length} add-ons over $500 each: ${names}.`,
      action: `Tell the dealer: "I'd like all dealer-installed add-ons removed from the price. These were not requested."`,
      severity: "warning",
    });
  } else if (highCostAddOns.length === 1) {
    const addon = highCostAddOns[0];
    signals.push({
      priority: 4,
      category: "line_item",
      label: `High-cost add-on: ${addon.name}`,
      detail: `${addon.name} is listed at $${(addon.amount ?? 0).toLocaleString()}. This is a common dealer-installed add-on that was likely not requested.`,
      action: `Tell the dealer: "Please remove the ${addon.name} charge. I did not request this add-on."`,
      severity: "warning",
    });
  } else if (hasVagueFees(fees)) {
    signals.push({
      priority: 4,
      category: "line_item",
      label: "Unclear fees detected",
      detail: "Some fees are vaguely described or have no clear value to you. These may be negotiable.",
      action: `Ask the dealer: "Can you itemize each fee and explain what it covers? I'd like to understand what I'm paying for."`,
      severity: "info",
    });
  }

  return signals;
}

function buildInfoGapSignals(
  fields: DetectedFields,
  missingInfo: MissingInfo[],
  ruleResult: RuleEngineResult,
): RankedSignal[] {
  const signals: RankedSignal[] = [];

  // Payment-only quote
  if (
    fields.monthlyPayment !== null &&
    fields.salePrice === null &&
    fields.outTheDoorPrice === null
  ) {
    signals.push({
      priority: 5,
      category: "info_gap",
      label: "Payment-only quote",
      detail: "This quote only shows a monthly payment without the total price. The real cost may be hidden.",
      action: `Ask the dealer: "What is the complete out-the-door price including all fees, taxes, and charges?"`,
      severity: "info",
    });
  } else if (fields.outTheDoorPrice === null) {
    signals.push({
      priority: 5,
      category: "info_gap",
      label: "Missing out-the-door price",
      detail: "No total out-the-door price was found. Without it, hidden fees may not be visible.",
      action: `Ask the dealer: "What is the full out-the-door price including all fees and taxes?"`,
      severity: "info",
    });
  }

  // Missing APR/term for finance deals
  if (fields.apr === null && fields.monthlyPayment !== null) {
    signals.push({
      priority: 5,
      category: "info_gap",
      label: "APR not disclosed",
      detail: "The interest rate is not shown. A high APR can add thousands to the total cost.",
      action: `Ask the dealer: "What APR am I being quoted, and is that contingent on credit approval?"`,
      severity: "info",
    });
  }

  // Include remaining LLM-generated missingInfo that aren't already covered
  const coveredPatterns = [/out.?the.?door|otd/i, /apr|interest/i, /payment/i];
  for (const item of missingInfo) {
    const alreadyCovered = coveredPatterns.some(
      (re) => re.test(item.field) || re.test(item.question),
    );
    if (!alreadyCovered && signals.length < 5) {
      signals.push({
        priority: 5,
        category: "info_gap",
        label: item.field,
        detail: item.question,
        action: `Ask the dealer: "${item.question}"`,
        severity: "info",
      });
    }
  }

  return signals;
}

// ---------------------------------------------------------------------------
// Lease-specific signals
// ---------------------------------------------------------------------------

function buildLeaseSignals(leaseMath: LeaseMathResult, fields: DetectedFields): RankedSignal[] {
  const signals: RankedSignal[] = [];

  if (leaseMath.acquisitionFeeBenchmark?.isMarkedUp) {
    const bench = leaseMath.acquisitionFeeBenchmark;
    signals.push({
      priority: 4,
      category: "line_item",
      label: "Acquisition fee marked up",
      detail: `The acquisition fee of $${bench.charged} is $${bench.overage} above the lender standard of $${bench.brandStandard}.`,
      action: `Tell the dealer: "The standard acquisition fee for this brand is $${bench.brandStandard}. Please adjust to the standard rate."`,
      severity: "warning",
    });
  }

  if (leaseMath.rateMarkup && leaseMath.rateMarkup.totalMarkupDollars > 1500) {
    const rm = leaseMath.rateMarkup;
    signals.push({
      priority: 4,
      category: "line_item",
      label: "Lease rate markup detected",
      detail: `The dealer APR of ${rm.dealerAPR.toFixed(1)}% is marked up from the buy rate of ${rm.buyRateAPR.toFixed(1)}%, costing you $${rm.totalMarkupDollars.toLocaleString()} over the lease term.`,
      action: `Ask the dealer: "Can you offer the base money factor from ${leaseMath.brandMatched ?? 'the manufacturer'}? I'm seeing a rate markup."`,
      severity: "warning",
    });
  }

  if (leaseMath.residualCheck?.status === "low") {
    signals.push({
      priority: 4,
      category: "line_item",
      label: "Low residual value",
      detail: `The residual is ${leaseMath.residualCheck.residualPercent}%, which is below the expected range for this brand. This increases your monthly payment.`,
      action: `Ask the dealer: "What residual percentage are you using? The typical range for this brand is ${leaseMath.residualCheck.brandRange[0]}%–${leaseMath.residualCheck.brandRange[1]}%."`,
      severity: "warning",
    });
  }

  if (fields.excessMileageRate != null && fields.excessMileageRate > 0.30) {
    signals.push({
      priority: 5,
      category: "info_gap",
      label: "High excess mileage rate",
      detail: `The excess mileage rate of $${fields.excessMileageRate.toFixed(2)}/mile is above the typical $0.15–$0.25 range.`,
      action: `Ask the dealer: "Can the excess mileage rate be reduced to $0.25/mile or below?"`,
      severity: "info",
    });
  }

  return signals;
}

// ---------------------------------------------------------------------------
// Main ranking function
// ---------------------------------------------------------------------------

export function rankSignals(ctx: SignalRankerContext): RankedSignal[] {
  const signals: RankedSignal[] = [];
  const fees = ctx.detectedFields.fees ?? [];

  // 1. Legal cap violation (priority 1)
  if (ctx.docFeeCapCheck?.violated) {
    signals.push(buildLegalSignal(ctx.docFeeCapCheck));
  }

  // 2. Dealer-specific repeat pattern (priority 2)
  if (ctx.marketContext) {
    const dealerSignal = buildDealerPatternSignal(ctx.marketContext);
    if (dealerSignal) signals.push(dealerSignal);
  }

  // 3. State norm violation (priority 3)
  if (ctx.marketContext) {
    const docFee = fees.find((f) => /doc.?fee|document/i.test(f.name))?.amount ?? null;
    const stateSignal = buildStateNormSignal(ctx.marketContext, docFee);
    if (stateSignal) signals.push(stateSignal);
  }

  // 4. Line-item patterns (priority 4)
  signals.push(...buildLineItemSignals(fees));

  // 4b. Lease-specific signals (priority 4)
  if (ctx.leaseMath) {
    signals.push(...buildLeaseSignals(ctx.leaseMath, ctx.detectedFields));
  }

  // 5. Info gaps (priority 5)
  signals.push(...buildInfoGapSignals(ctx.detectedFields, ctx.missingInfo, ctx.ruleEngineResult));

  // Sort by priority (stable sort preserves insertion order within same priority)
  signals.sort((a, b) => a.priority - b.priority);

  return signals;
}
