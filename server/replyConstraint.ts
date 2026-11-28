/**
 * Dealer replies are written from validated findings. The model draft is not used.
 */

import type { DocFeeAssessment } from "./regulatoryClassification.js";
import type { MarketBenchmarkKind } from "./marketValuation.js";
import { FACTORY_STICKER_COMPARISON } from "../shared/windowSticker.js";
import { normalizeGeneratedPunctuation } from "./findingRank.js";

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
  benchmarkKind?: MarketBenchmarkKind | null;
  /** True only when the selling price exceeds a buyer-supplied factory MSRP. */
  msrpMarkup?: boolean;
  /** Questions for material findings that are not already the headline. */
  extraAsks?: string[];

  /**
   * Set when financing is involved and APR, term, or the disclosed amount
   * financed is missing, or those figures do not reconcile. Included even
   * when the verdict headline is about unverified market value.
   */
  financingAsk?: string | null;
}

const ENDORSEMENT =
  /buyer'?s order|buyers order|fair price|good deal|great deal|reasonably priced|accept this price|looking forward to coming|we'?ll be there|we will be there|priced fairly|go ahead and/i;

function conditionalDocFeeAsk(docFee: DocFeeAssessment): string {
  if (docFee.jurisdiction === "Oregon") {
    return "Please state in writing whether you elect to have the dealership use an integrator. ORS 822.043(6) gives you that election when the fee is higher than the non-integrator amount, and ORS 822.043(5) requires $35 of an integrator-tier fee to be paid to the integrator. Aside from that $35, ORS 822.043(4) says the fee is negotiable and still cannot exceed $250 with an integrator or $200 without one.";
  }
  if (docFee.jurisdiction === "Pennsylvania") {
    const electronic = docFee.hardCeiling != null ? `$${docFee.hardCeiling}` : "the electronic ceiling";
    const nonElectronic = docFee.conditionalCeiling != null ? `$${docFee.conditionalCeiling}` : "the non-electronic ceiling";
    return `Please confirm in writing whether this is an electronic transaction under 63 P.S. § 818.327(c)(1), which allows up to ${electronic}, or a non-electronic transaction under § 818.327(c)(2), which allows up to ${nonElectronic}.`;
  }
  if (docFee.jurisdiction === "California") {
    return "Please confirm in writing whether the dealership has a Vehicle Code § 1685 private-industry-partner agreement.";
  }
  return "Please confirm in writing which statutory condition allows this documentation charge.";
}

export function buildConstrainedReply(facts: ReplyFacts): string {
  const parts: string[] = [];

  if (facts.verdict === "GO" && facts.marketVerified && facts.benchmarkKind !== "factory_msrp") {
    parts.push(
      "The numbers in this quote reconcile, the checked fees are within the verified rules, and the selling price is inside an independent market valuation. Please send the buyer's order only if it matches these exact figures.",
    );
  } else if (facts.docFee?.classification === "illegal") {
    parts.push(
      `${facts.docFee.summary} Please reduce that documentation charge before any paperwork is prepared.`,
    );
  } else if (facts.verdict === "NO-GO" && (facts.msrpMarkup || facts.benchmarkKind === "factory_msrp")) {
    parts.push(
      `${facts.primaryIssue}. Please remove the markup over the factory window sticker MSRP and send an itemized out-the-door quote. I am not approving this selling price. ${FACTORY_STICKER_COMPARISON}`,
    );
    if (facts.docFee?.classification === "potentially_noncompliant") {
      parts.push(`${facts.docFee.summary} I am not treating that documentation charge as confirmed.`);
    }
  } else if (facts.docFee?.feeNameAmbiguity) {
    parts.push(`${facts.docFee.feeNameAmbiguity} I am not approving the vehicle price.`);
  } else if (facts.docFee?.classification === "potentially_noncompliant") {
    const ask = conditionalDocFeeAsk(facts.docFee);
    parts.push(`${facts.docFee.summary} ${ask} I am not approving the vehicle price.`);
  } else if (facts.verdict === "NO-GO") {
    parts.push(
      `${facts.primaryIssue}. Please correct that item and send an itemized out-the-door quote.`,
    );
  } else if (facts.verdict === "PROCEED-WITH-CAUTION") {
    parts.push(
      `${facts.primaryIssue}. Please resolve that in writing with an itemized quote. I am not approving the vehicle price.`,
    );
  } else if (facts.marketVerified) {
    parts.push(`${facts.primaryIssue} I am not approving the vehicle price until that is resolved.`);
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

  if (facts.financingAsk && !parts.join(" ").toLowerCase().includes("amount financed")) {
    parts.push(facts.financingAsk);
  }

  if (facts.derivation.length > 0 && facts.verdict !== "GO") {
    const mismatch = facts.derivation.find((line) => /difference/i.test(line) && !/\$0\.00\b/.test(line));
    if (mismatch) parts.push(`My worksheet shows: ${mismatch}.`);
  }

  if (facts.verdict !== "GO" && !facts.marketVerified && !parts.some((part) => /market value is not verified/i.test(part))) {
    parts.push("Market value is not verified, so I am not accepting the selling price from this quote.");
  }

  for (const ask of facts.extraAsks ?? []) {
    const trimmed = ask.trim();
    if (!trimmed) continue;
    if (parts.some((part) => part.includes(trimmed))) continue;
    parts.push(trimmed);
  }

  const reply = normalizeGeneratedPunctuation(parts.join(" "));
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
