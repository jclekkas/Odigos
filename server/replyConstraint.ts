/**
 * Dealer replies are written from validated findings. The model draft is not used.
 */

import type { DocFeeAssessment } from "./regulatoryClassification.js";

export type ReplyVerdict =
  | "GO"
  | "NO-GO"
  | "NEED-MORE-INFO"
  | "PROCEED-WITH-CAUTION"
  | "INSUFFICIENT-INFORMATION";

export interface ReplyFacts {
  verdict: ReplyVerdict;
  marketVerified: boolean;
  docFee: DocFeeAssessment | null;
  primaryIssue: string;
  derivation: string[];
  askForVehicleEvidence: boolean;
}

const ENDORSEMENT =
  /buyer'?s order|buyers order|fair price|good deal|great deal|reasonably priced|accept this price|looking forward to coming|we'?ll be there|we will be there|priced fairly|go ahead and/i;

export function buildConstrainedReply(facts: ReplyFacts): string {
  const parts: string[] = [];

  if (facts.verdict === "GO" && facts.marketVerified) {
    parts.push(
      "The numbers in this quote reconcile, the checked fees are within the verified rules, and the selling price is inside an independent benchmark. Please send the buyer's order only if it matches these exact figures.",
    );
  } else if (facts.docFee?.classification === "illegal") {
    parts.push(
      `${facts.docFee.summary} Please reduce that documentation charge before any paperwork is prepared.`,
    );
  } else if (facts.docFee?.classification === "potentially_noncompliant") {
    parts.push(
      `${facts.docFee.summary} Please confirm in writing whether the dealership has a Vehicle Code § 1685 private-industry-partner agreement. I am not approving the vehicle price.`,
    );
  } else if (facts.verdict === "NO-GO") {
    parts.push(
      `${facts.primaryIssue}. Please correct that item and send an itemized out-the-door quote.`,
    );
  } else if (facts.verdict === "PROCEED-WITH-CAUTION") {
    parts.push(
      `${facts.primaryIssue}. Please resolve that in writing with an itemized quote. I am not approving the vehicle price.`,
    );
  } else {
    parts.push(
      `${facts.primaryIssue}. Market value is not verified, so I cannot accept the selling price from this quote alone.`,
    );
  }

  if (facts.askForVehicleEvidence || !facts.marketVerified) {
    parts.push(
      "Please send the VIN, the window sticker, and a breakdown of factory equipment and any market adjustments.",
    );
  }

  if (facts.derivation.length > 0 && facts.verdict !== "GO") {
    const mismatch = facts.derivation.find((line) => /difference/i.test(line) && !/difference \$0\.00/i.test(line));
    if (mismatch) parts.push(`My worksheet shows: ${mismatch}.`);
  }

  const reply = parts.join(" ");
  if (facts.verdict !== "GO" && ENDORSEMENT.test(reply)) {
    throw new Error("Constrained reply endorsed a price the decision did not approve");
  }
  if (facts.docFee?.classification !== "illegal" && /\billegal\b|\bunlawful\b/i.test(reply)) {
    throw new Error("Constrained reply accused the dealer without an illegal finding");
  }
  return reply;
}

export function replyEndorsesUnverifiedPrice(reply: string, verdict: ReplyVerdict): boolean {
  if (verdict === "GO") return false;
  return ENDORSEMENT.test(reply);
}
