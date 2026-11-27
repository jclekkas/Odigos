/**
 * Plain-language fee claims for guides and comparison tables.
 *
 * A documentation-fee ceiling is "verified" only when the state file has a
 * fetched citation and does not list the cap amount as unverified. Every
 * stored typical range is labeled unverified unless the file says otherwise.
 * California's $85 figure is the DMV-partner ceiling, not a universal cap.
 */

export interface FeeStateRecord {
  name: string;
  abbreviation: string;
  docFeeCap?: boolean;
  docFeeCapAmount?: number | null;
  docFeeTypicalRange?: [number, number];
  statuteCitation?: string | null;
  source_status?: string;
  unverified_fields?: string[];
  citations?: { url?: string; supports?: string }[];
  specialNotes?: string | null;
}

export type CapPosture =
  | "verified_conditional_ca"
  | "verified_conditional_or"
  | "verified_cap"
  | "verified_no_cap"
  | "unverified_stored_cap"
  | "unverified";

export interface PublicDocFeeClaim {
  abbreviation: string;
  name: string;
  posture: CapPosture;
  hasVerifiedCap: boolean;
  rangeLabel: string;
  capCell: string;
  rangeCell: string;
  capNote: string;
  /** Shorter quick-answer lead. The full cap note still appears in the guide. */
  shortAnswer: string;
  metaDescription: string;
}

export const HONEST_ANALYSIS_BLURB =
  "Paste the quote and Odigos checks whether the charges are itemized, whether the totals reconcile, and whether a fee exceeds a verified state cap. It does not estimate a fair vehicle price, and it does not treat an unverified fee range as a legal limit.";

export function formatFeeMoney(amount: number): string {
  const hasCents = Math.round(amount * 100) % 100 !== 0;
  return hasCents
    ? `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : `$${amount.toLocaleString("en-US")}`;
}

export function isDocFeeCapVerified(state: FeeStateRecord): boolean {
  if (state.source_status === "needs_source") return false;
  if ((state.unverified_fields ?? []).includes("docFeeCapAmount")) return false;
  if (!state.citations?.some((citation) => typeof citation.url === "string" && citation.url.startsWith("http"))) {
    return false;
  }
  return state.docFeeCap === true && state.docFeeCapAmount != null;
}

export function isDocFeeCapFlagVerified(state: FeeStateRecord): boolean {
  if (state.source_status === "needs_source") return false;
  if ((state.unverified_fields ?? []).includes("docFeeCap")) return false;
  if (!state.citations?.some((citation) => typeof citation.url === "string" && citation.url.startsWith("http"))) {
    return false;
  }
  return state.docFeeCap === false;
}

function rangeIsUnverified(state: FeeStateRecord): boolean {
  return (state.unverified_fields ?? []).includes("docFeeTypicalRange");
}

export function reportedRangePhrase(state: FeeStateRecord): string {
  const [low, high] = state.docFeeTypicalRange ?? [0, 0];
  const span =
    low === high
      ? `around ${formatFeeMoney(low)}`
      : low === 0
        ? `up to ${formatFeeMoney(high)}`
        : `around ${formatFeeMoney(low)}–${formatFeeMoney(high)}`;
  if (rangeIsUnverified(state)) {
    return `Unverified reports mention documentation fees ${span}. That range is not a market standard.`;
  }
  return `This file lists documentation fees ${span}.`;
}

export function reportedRangeLabel(state: FeeStateRecord): string {
  const [low, high] = state.docFeeTypicalRange ?? [0, 0];
  const span = low === high ? formatFeeMoney(low) : `${formatFeeMoney(low)}–${formatFeeMoney(high)}`;
  return rangeIsUnverified(state) ? `Reported ${span} (not verified)` : `Listed ${span}`;
}

function capPosture(state: FeeStateRecord): CapPosture {
  if (state.abbreviation === "CA" && isDocFeeCapVerified(state)) return "verified_conditional_ca";
  if (state.abbreviation === "OR" && isDocFeeCapVerified(state)) return "verified_conditional_or";
  if (isDocFeeCapVerified(state)) return "verified_cap";
  if (isDocFeeCapFlagVerified(state)) return "verified_no_cap";
  if (state.docFeeCap === true && state.docFeeCapAmount != null) return "unverified_stored_cap";
  return "unverified";
}

function capNoteFor(state: FeeStateRecord, posture: CapPosture): string {
  const range = reportedRangePhrase(state);
  const compare =
    " Compare the itemized out-the-door price. A lower documentation fee with a higher vehicle price is not automatically a better deal.";
  const money = state.docFeeCapAmount != null ? formatFeeMoney(state.docFeeCapAmount) : "";

  switch (posture) {
    case "verified_conditional_ca":
      return (
        "California Vehicle Code § 4456.5, operative January 1, 2019, limits the document processing charge to $85 only if the dealer is a DMV private industry partner under § 1685, and to $70 otherwise. $85 is not allowed for every dealer, and the charge cannot be presented as a government fee. Ask whether the dealer has that partner agreement. A fee above $85 is above both ceilings. A fee from $70 to $85 is allowed only when the partner agreement is confirmed. " +
        range +
        compare
      );
    case "verified_conditional_or":
      return (
        "Oregon Revised Statutes § 822.043 limits the document processing fee to $250 if the dealer uses an integrator and to $200 if not. The ceiling stored for the analyzer is $250, so a fee from $201 to $250 is not automatically called a violation. " +
        range +
        compare
      );
    case "verified_cap":
      return verifiedCapDetail(state, money) + " " + range + compare;
    case "verified_no_cap":
      return verifiedNoCapDetail(state) + " " + range + compare;
    case "unverified_stored_cap":
      return (
        `${state.name} has a stored documentation-fee figure of ${money} in this file, and that figure needs a source. It is not a verified legal cap. Odigos will not call a higher fee illegal from that number alone. ` +
        range +
        " Ask the dealer to itemize the charge, and confirm any limit with the state before you rely on it." +
        compare
      );
    default:
      return (
        `${state.name} does not have a verified documentation-fee cap in this file. A stored note may say dealers set the fee, but that is not a legal finding that no cap exists. ` +
        range +
        " Compare itemized out-the-door quotes instead of treating one line as legal or illegal."
      );
  }
}

function verifiedCapDetail(state: FeeStateRecord, money: string): string {
  switch (state.abbreviation) {
    case "PA":
      return "Pennsylvania's 2026 notice under 63 P.S. § 818.327 sets the documentary preparation fee at no more than $490 for an electronic transaction and $409 for a non-electronic one. The analyzer's hard ceiling is the $490 electronic figure.";
    case "RI":
      return "Rhode Island's rule (280-RICR-30-20-1.6(N)) allows a documentary preparation fee of up to $400 only on transactions over $10,000. The analyzer checks the $400 ceiling and does not by itself apply the $10,000 price floor.";
    case "MN":
      return "Minnesota's fetched statute text says that on or after July 1, 2025, the maximum documentary fee is the lesser of $350 or ten percent of the sale or lease. This file stores the $350 ceiling.";
    case "IN":
      return "An Indiana Secretary of State memo says the office will not take enforcement action on documentation preparation fees at or below $251.05, citing IC 9-32-13-7(b). Odigos treats a higher documentation fee as above that verified ceiling.";
    case "OH":
      return "Ohio's verified documentary service charge ceiling is $398 for calendar year 2026 under ORC § 4517.261. The state's note also describes a 10% cash-price limit. The fetched page quoted here supports the $398 ceiling.";
    case "IA":
      return "Iowa Code § 322.19A says a documentary fee may not exceed $180.";
    case "LA":
      return "Louisiana's 2026 bulletin sets the CPI-adjusted maximum documentary fee at $436 under La. R.S. 6:969.18.";
    case "MO":
      return "Missouri's 2026 maximum dealer administrative fee on file is $620.79 under Mo. Rev. Stat. § 301.558.";
    case "WA":
      return "Washington requires dealers to disclose that a documentary service fee of up to $200 may be added (RCW 46.70.180). Dealers cannot present that fee as required by law.";
    case "MD":
      return "Maryland's dealer processing-charge ceiling is $800 on and after July 1, 2024 (Md. Code, Transp. § 15-311.1).";
    default: {
      const statute = state.statuteCitation ? ` (${state.statuteCitation})` : "";
      return `${state.name} has a verified documentation-fee ceiling of ${money}${statute}. Odigos can flag a documentation fee above that ceiling.`;
    }
  }
}

function verifiedNoCapDetail(state: FeeStateRecord): string {
  if (state.abbreviation === "TX") {
    return "Texas Finance Code § 348.006 does not set a hard dollar cap. The documentary fee must be a reasonable amount the parties agree to. A bulletin in this file says a fee of $225 or less needs no OCCC filing, and a higher fee can be charged only after the dealer files a notice and a cost analysis. A fee above $225 is not automatically illegal.";
  }
  if (state.abbreviation === "GA") {
    return "A fetched Georgia page says the state does not regulate how much a dealer can charge for a document or processing fee. That is not a finding about a typical price.";
  }
  const statute = state.statuteCitation ? ` (${state.statuteCitation})` : "";
  return `${state.name} does not have a hard documentation-fee dollar cap in the citation on file${statute}.`;
}

function capCellFor(state: FeeStateRecord, posture: CapPosture): string {
  const money = state.docFeeCapAmount != null ? formatFeeMoney(state.docFeeCapAmount) : "";
  switch (posture) {
    case "verified_conditional_ca":
      return "Verified split: $85 for a DMV partner, $70 otherwise";
    case "verified_conditional_or":
      return "Verified split: $250 with an integrator, $200 otherwise";
    case "verified_cap":
      if (state.abbreviation === "PA") return "Verified: $490 electronic, $409 non-electronic";
      if (state.abbreviation === "RI") return "Verified: up to $400 on sales over $10,000";
      if (state.abbreviation === "MN") return "Verified: lesser of $350 or 10% of the sale";
      return `Verified ceiling: ${money}`;
    case "verified_no_cap":
      return state.abbreviation === "TX" ? "No hard dollar cap verified" : "No statutory cap verified";
    case "unverified_stored_cap":
      return `Stored ${money} (not verified)`;
    default:
      return "Cap not verified";
  }
}

function metaDescriptionFor(state: FeeStateRecord, posture: CapPosture, rangeLabel: string): string {
  const lead = (() => {
    switch (posture) {
      case "verified_conditional_ca":
        return "California's document processing charge is $85 for a DMV partner and $70 otherwise.";
      case "verified_conditional_or":
        return "Oregon's document processing fee is $250 with an integrator and $200 otherwise.";
      case "verified_cap":
        return `${state.name} documentation fee: verified ceiling ${state.docFeeCapAmount != null ? formatFeeMoney(state.docFeeCapAmount) : "on file"}.`;
      case "verified_no_cap":
        return state.abbreviation === "TX"
          ? "Texas has no verified hard dollar cap on the documentary fee. A fee above $225 is not automatically illegal."
          : `${state.name} has no verified statutory cap on the documentation fee.`;
      case "unverified_stored_cap":
        return `${state.name}'s stored documentation-fee figure is not a verified legal cap.`;
      default:
        return `${state.name} does not have a verified documentation-fee cap on file.`;
    }
  })();
  return `${lead} ${rangeLabel}. Compare the itemized out-the-door price before you sign.`;
}

export function publicDocFeeClaim(state: FeeStateRecord): PublicDocFeeClaim {
  const posture = capPosture(state);
  const rangeLabel = reportedRangeLabel(state);
  const hasVerifiedCap =
    posture === "verified_cap" ||
    posture === "verified_conditional_ca" ||
    posture === "verified_conditional_or";
  const capNote = capNoteFor(state, posture);
  const shortAnswer = `${capNote.split(". ").slice(0, 2).join(". ")}. ${reportedRangePhrase(state)}`;
  return {
    abbreviation: state.abbreviation,
    name: state.name,
    posture,
    hasVerifiedCap,
    rangeLabel,
    capCell: capCellFor(state, posture),
    rangeCell: rangeLabel,
    capNote,
    shortAnswer,
    metaDescription: metaDescriptionFor(state, posture, rangeLabel),
  };
}
