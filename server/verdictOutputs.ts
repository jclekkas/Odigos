/**
 * After any downgrade, the summary, dealer reply, scorecard, and reasoning
 * have to describe the new verdict. An approving sentence from an earlier GO
 * is not kept.
 */

import type { AnalysisDimensions } from "../shared/schema.js";
import { normalizeGeneratedPunctuation } from "./findingRank.js";

const APPROVING =
  /buyer'?s order|buyers order|fair price|good deal|great deal|looks good|priced fairly|reasonably priced|accept this price|looking forward to coming|we'?ll be there|we will be there|go ahead and|numbers in this quote reconcile|this quote is approved|^\s*approved\b/i;

export interface VerdictShape {
  goNoGo: string;
  verdictLabel: string;
  summary: string;
  dealScore: string;
  confidenceLevel: string;
  primaryIssue?: string | null;
  suggestedReply?: string | null;
  reasoning?: string | null;
  dimensions?: AnalysisDimensions | null;
}

export function alignOutputsWithVerdict<T extends VerdictShape>(result: T): T {
  const primaryIssue = result.primaryIssue ? normalizeGeneratedPunctuation(result.primaryIssue) : result.primaryIssue;
  const reason = primaryIssue || normalizeGeneratedPunctuation(result.summary || "") || "This quote cannot be approved.";
  if (result.goNoGo === "GO") {
    return {
      ...result,
      primaryIssue,
      summary: normalizeGeneratedPunctuation(result.summary || ""),
      reasoning: result.reasoning ? normalizeGeneratedPunctuation(result.reasoning) : result.reasoning,
      suggestedReply: result.suggestedReply ? normalizeGeneratedPunctuation(result.suggestedReply) : result.suggestedReply,
    };
  }

  let summary = normalizeGeneratedPunctuation(result.summary || "");
  if (!summary || APPROVING.test(summary)) summary = reason;

  let suggestedReply = result.suggestedReply ? normalizeGeneratedPunctuation(result.suggestedReply) : "";
  if (!suggestedReply || APPROVING.test(suggestedReply)) {
    suggestedReply = normalizeGeneratedPunctuation(`${reason} I am not approving this quote or the selling price.`);
  }

  let reasoning = result.reasoning ? normalizeGeneratedPunctuation(result.reasoning) : result.reasoning;
  if (reasoning && APPROVING.test(reasoning)) reasoning = summary;

  let dimensions = result.dimensions ?? null;
  if (dimensions && /UNVERIFIED EXTRACTED TERMS/.test(result.verdictLabel)) {
    dimensions = {
      ...dimensions,
      mathematicalAccuracy: dimensions.mathematicalAccuracy.status === "clear"
        ? {
            status: "not_checked",
            summary: `${reason} Those figures were not used to approve the quote.`,
          }
        : dimensions.mathematicalAccuracy,
      informationCompleteness: {
        status: "insufficient",
        summary: reason,
      },
    };
  }

  return {
    ...result,
    primaryIssue,
    summary,
    suggestedReply,
    reasoning,
    dimensions,
    dealScore: result.dealScore === "GREEN" ? "YELLOW" : result.dealScore,
  };
}
