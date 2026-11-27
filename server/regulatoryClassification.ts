/**
 * Doc-fee classification.
 *
 * California's two ceilings come from Vehicle Code § 4456.5, fetched from
 * leginfo.legislature.ca.gov on 2026-11-27. Oregon's two ceilings come from
 * ORS 822.043, fetched from oregonlegislature.gov on 2026-11-27. Other states
 * are called illegal only when this dataset records a citation and does not
 * list the cap as unverified. Otherwise the result is needs_source.
 */

export type ChargeClassification =
  | "illegal"
  | "potentially_noncompliant"
  | "negotiable"
  | "permissible"
  | "government"
  | "needs_source"
  | "not_checked";

export interface RegulatoryStateInput {
  name?: string;
  abbreviation?: string;
  docFeeCap?: boolean;
  docFeeCapAmount?: number | null;
  statuteCitation?: string | null;
  source_status?: string;
  unverified_fields?: string[];
  citations?: { url?: string; supports?: string }[];
}

export interface DocFeeAssessment {
  classification: ChargeClassification;
  chargedAmount: number | null;
  hardCeiling: number | null;
  conditionalCeiling: number | null;
  condition: string | null;
  exceedsStoredCap: boolean;
  jurisdiction: string;
  statutoryReference: string;
  officialSource: string;
  effectiveDate: string;
  lastVerificationDate: string;
  summary: string;
}

const CA_SOURCE =
  "https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=VEH&sectionNum=4456.5";
const CA_STATUTE = "Cal. Veh. Code § 4456.5";
const CA_EFFECTIVE = "2019-01-01";
const CA_VERIFIED = "2026-11-27";
const CA_PARTNER_CONDITION =
  "A dealer with a contractual agreement to be a DMV private industry partner under Vehicle Code § 1685 may charge up to $85. A dealer without that agreement may charge up to $70.";

const OR_SOURCE = "https://www.oregonlegislature.gov/bills_laws/ors/ors822.html";
const OR_STATUTE = "ORS 822.043";
const OR_VERIFIED = "2026-11-27";
const OR_INTEGRATOR_CONDITION =
  "A dealer that uses an integrator may charge a document processing fee of up to $250. A dealer that does not use an integrator may charge up to $200.";

const DOC_FEE_EXACT = [
  "doc fee",
  "documentation fee",
  "document fee",
  "documentary fee",
  "documentary service",
  "documentary preparation",
  "document processing",
];

const DOC_FEE_BROAD = ["dealer fee", "processing fee", "admin fee", "administrative fee"];

export function detectDocFeeAmount(fees: { name: string; amount: number | null }[]): number | null {
  const exact: number[] = [];
  const broad: number[] = [];
  for (const fee of fees) {
    if (fee.amount == null || !Number.isFinite(fee.amount)) continue;
    const name = fee.name.toLowerCase();
    if (DOC_FEE_EXACT.some((kw) => name.includes(kw))) exact.push(fee.amount);
    else if (DOC_FEE_BROAD.some((kw) => name.includes(kw))) broad.push(fee.amount);
  }
  const candidates = exact.length > 0 ? exact : broad;
  return candidates.length > 0 ? Math.max(...candidates) : null;
}

function needsSource(summary: string, jurisdiction: string, charged: number | null): DocFeeAssessment {
  return {
    classification: "needs_source",
    chargedAmount: charged,
    hardCeiling: null,
    conditionalCeiling: null,
    condition: null,
    exceedsStoredCap: false,
    jurisdiction,
    statutoryReference: "needs_source",
    officialSource: "needs_source",
    effectiveDate: "needs_source",
    lastVerificationDate: "needs_source",
    summary,
  };
}

function capIsVerified(state: RegulatoryStateInput): boolean {
  if (state.source_status === "needs_source") return false;
  if ((state.unverified_fields ?? []).includes("docFeeCapAmount")) return false;
  if (!state.citations || state.citations.length === 0) return false;
  if (!state.citations.some((c) => typeof c.url === "string" && c.url.startsWith("http"))) return false;
  return state.docFeeCap === true && state.docFeeCapAmount != null;
}

export function classifyDocFee(
  fees: { name: string; amount: number | null }[],
  state: RegulatoryStateInput | null | undefined,
  privateIndustryPartner: boolean | null = null,
  electronicIntegrator: boolean | null = null,
): DocFeeAssessment {
  const charged = detectDocFeeAmount(fees);
  const jurisdiction = state?.name ?? state?.abbreviation ?? "Unknown";

  if (!state) {
    return needsSource(
      charged == null
        ? "No documentation fee was found, and no state was identified."
        : "A documentation fee is present, but the state was not identified, so no legal ceiling was applied.",
      jurisdiction,
      charged,
    );
  }

  if (state.abbreviation === "CA") {
    return classifyCalifornia(charged, privateIndustryPartner);
  }

  if (state.abbreviation === "OR") {
    return classifyOregon(charged, electronicIntegrator);
  }

  if (charged == null) {
    return {
      classification: "not_checked",
      chargedAmount: null,
      hardCeiling: state.docFeeCapAmount ?? null,
      conditionalCeiling: null,
      condition: null,
      exceedsStoredCap: false,
      jurisdiction,
      statutoryReference: state.statuteCitation ?? "needs_source",
      officialSource: state.citations?.[0]?.url ?? "needs_source",
      effectiveDate: "needs_source",
      lastVerificationDate: "needs_source",
      summary: "No documentation fee amount was found to compare with a state rule.",
    };
  }

  if (!state.docFeeCap || state.docFeeCapAmount == null) {
    return {
      classification: "negotiable",
      chargedAmount: charged,
      hardCeiling: null,
      conditionalCeiling: null,
      condition: null,
      exceedsStoredCap: false,
      jurisdiction,
      statutoryReference: state.statuteCitation ?? "needs_source",
      officialSource: state.citations?.[0]?.url ?? "needs_source",
      effectiveDate: "needs_source",
      lastVerificationDate: "needs_source",
      summary: `${jurisdiction} has no verified hard cap in this dataset. The $${charged} documentation fee is a dealer charge and is negotiable.`,
    };
  }

  if (!capIsVerified(state)) {
    const over = charged > state.docFeeCapAmount;
    return {
      classification: "needs_source",
      chargedAmount: charged,
      hardCeiling: null,
      conditionalCeiling: null,
      condition: null,
      exceedsStoredCap: over,
      jurisdiction,
      statutoryReference: "needs_source",
      officialSource: "needs_source",
      effectiveDate: "needs_source",
      lastVerificationDate: "needs_source",
      summary: over
        ? `${jurisdiction} has a stored documentation-fee figure of $${state.docFeeCapAmount}, but that figure is not backed by a verified citation in this dataset. This audit does not treat the $${charged} charge as a legal violation.`
        : `${jurisdiction}'s stored documentation-fee figure is not a verified legal finding. This audit does not treat the $${charged} charge as a legal violation.`,
    };
  }

  const citation = state.citations?.[0]?.url ?? "needs_source";
  const statute = state.statuteCitation ?? "needs_source";
  if (charged > state.docFeeCapAmount) {
    return {
      classification: "illegal",
      chargedAmount: charged,
      hardCeiling: state.docFeeCapAmount,
      conditionalCeiling: null,
      condition: null,
      exceedsStoredCap: true,
      jurisdiction,
      statutoryReference: statute,
      officialSource: citation,
      effectiveDate: "needs_source",
      lastVerificationDate: "needs_source",
      summary: `The $${charged} documentation fee exceeds the verified ${jurisdiction} ceiling of $${state.docFeeCapAmount}.`,
    };
  }

  return {
    classification: "permissible",
    chargedAmount: charged,
    hardCeiling: state.docFeeCapAmount,
    conditionalCeiling: null,
    condition: null,
    exceedsStoredCap: false,
    jurisdiction,
    statutoryReference: statute,
    officialSource: citation,
    effectiveDate: "needs_source",
    lastVerificationDate: "needs_source",
    summary: `The $${charged} documentation fee is at or under the verified ${jurisdiction} ceiling of $${state.docFeeCapAmount}.`,
  };
}

function classifyCalifornia(charged: number | null, partner: boolean | null): DocFeeAssessment {
  const base = {
    hardCeiling: 85,
    conditionalCeiling: 70,
    condition: CA_PARTNER_CONDITION,
    jurisdiction: "California",
    statutoryReference: CA_STATUTE,
    officialSource: CA_SOURCE,
    effectiveDate: CA_EFFECTIVE,
    lastVerificationDate: CA_VERIFIED,
  };

  if (charged == null) {
    return {
      ...base,
      classification: "not_checked",
      chargedAmount: null,
      exceedsStoredCap: false,
      summary: "No documentation fee amount was found to compare with California Vehicle Code § 4456.5.",
    };
  }

  if (charged > 85 || (partner === false && charged > 70)) {
    return {
      ...base,
      classification: "illegal",
      chargedAmount: charged,
      exceedsStoredCap: true,
      summary:
        partner === false
          ? `The $${charged} document processing charge exceeds the $70 ceiling in Vehicle Code § 4456.5(a)(1)(B) for a dealer that is not a DMV private industry partner.`
          : `The $${charged} document processing charge exceeds $85, the maximum in Vehicle Code § 4456.5(a)(1)(A).`,
    };
  }

  if (partner === true || charged <= 70) {
    return {
      ...base,
      classification: "permissible",
      chargedAmount: charged,
      exceedsStoredCap: false,
      summary:
        partner === true
          ? `The dealer is confirmed as a DMV private industry partner, so the $${charged} document processing charge is within the $85 ceiling in Vehicle Code § 4456.5(a)(1)(A).`
          : `The $${charged} document processing charge is within the $70 ceiling that applies when a dealer is not a DMV private industry partner.`,
    };
  }

  return {
    ...base,
    classification: "potentially_noncompliant",
    chargedAmount: charged,
    exceedsStoredCap: false,
    summary: `The $${charged} document processing charge is above $70 and at or below $85. Vehicle Code § 4456.5 allows $85 only when the dealer has a DMV private-industry-partner agreement under § 1685. That agreement was not confirmed.`,
  };
}

function classifyOregon(charged: number | null, integrator: boolean | null): DocFeeAssessment {
  const base = {
    hardCeiling: 250,
    conditionalCeiling: 200,
    condition: OR_INTEGRATOR_CONDITION,
    jurisdiction: "Oregon",
    statutoryReference: OR_STATUTE,
    officialSource: OR_SOURCE,
    effectiveDate: "not stated",
    lastVerificationDate: OR_VERIFIED,
  };

  if (charged == null) {
    return {
      ...base,
      classification: "not_checked",
      chargedAmount: null,
      exceedsStoredCap: false,
      summary: "No documentation fee amount was found to compare with ORS 822.043.",
    };
  }

  if (charged > 250 || (integrator === false && charged > 200)) {
    return {
      ...base,
      classification: "illegal",
      chargedAmount: charged,
      exceedsStoredCap: true,
      summary:
        integrator === false
          ? `The $${charged} document processing fee exceeds the $200 ceiling in ORS 822.043(4)(b) for a dealer that does not use an integrator.`
          : `The $${charged} document processing fee exceeds $250, the maximum in ORS 822.043(4)(a) for a dealer that uses an integrator.`,
    };
  }

  if (integrator === true || charged <= 200) {
    return {
      ...base,
      classification: "permissible",
      chargedAmount: charged,
      exceedsStoredCap: false,
      summary:
        integrator === true
          ? `The dealer is confirmed to use an integrator, so the $${charged} document processing fee is within the $250 ceiling in ORS 822.043(4)(a).`
          : `The $${charged} document processing fee is within the $200 ceiling that applies when a dealer does not use an integrator.`,
    };
  }

  return {
    ...base,
    classification: "potentially_noncompliant",
    chargedAmount: charged,
    exceedsStoredCap: false,
    summary: `The $${charged} document processing fee is above $200 and at or below $250. ORS 822.043(4) allows $250 only when the dealer uses an integrator. Integrator use was not confirmed.`,
  };
}

export function classifyLineItem(name: string): ChargeClassification {
  const n = name.toLowerCase();
  if (/\b(sales tax|use tax|excise tax|tax)\b/.test(n)) return "government";
  if (/\b(title|registration|license plate|tag fee|plates)\b/.test(n)) return "government";
  if (/market.?adjust|additional dealer markup|\badm\b|dealer markup/.test(n)) return "negotiable";
  if (/declined|removed|waived/.test(n)) return "negotiable";
  return "negotiable";
}
