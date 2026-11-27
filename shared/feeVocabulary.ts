/**
 * Fee names shared by raw-text extraction and the regulatory classifier.
 *
 * Exact documentation aliases are the names statutes use for the capped
 * charge. Broader administrative aliases are fallbacks used only when no
 * exact line is present. California electronic filing and Minnesota's
 * optional electronic transfer fee are not documentation aliases.
 */

export const DOC_FEE_EXACT_ALIASES = [
  "doc fee",
  "documentation fee",
  "document fee",
  "documentary fee",
  "documentary service",
  "documentary preparation",
  "document processing",
  "document administration fee",
] as const;

export const DOC_FEE_BROAD_ALIASES = [
  "dealer fee",
  "processing fee",
  "admin fee",
  "administrative fee",
  "administrative processing",
] as const;

/** Arkansas Code § 23-112-317 and 23 CAR § 410-801 name the capped fee this way. */
export const ARKANSAS_SERVICE_HANDLING_ALIASES = [
  "dealer service and handling",
  "dealer service & handling",
  "dealer service or handling",
  "service and handling",
  "service & handling",
  "service or handling",
  "dealer service fee",
] as const;

/** Vehicle Code § 4456.5(a)(2) and Civil Code § 2982(a)(1)(H). Not a doc fee. */
export const CALIFORNIA_ELECTRONIC_FILING_ALIASES = [
  "electronic filing",
  "electronically register",
  "electronically transfer",
  "electronic registration",
  "e-file fee",
  "e-filing fee",
  "e-filing charge",
] as const;

/** DMV handbook 2.015 / 3.030: a registration service is not the document processing charge. */
export const CALIFORNIA_REGISTRATION_SERVICE_ALIASES = [
  "registration service",
] as const;

/** Minn. Stat. § 168.27, subd. 31(c), pointing at § 53C.01, subd. 14. */
export const MINNESOTA_ELECTRONIC_TRANSFER_ALIASES = [
  "optional electronic transfer",
  "electronic transfer fee",
  "electronic transfer charge",
] as const;

export type DocFeeAliasTier = "exact" | "broad" | "arkansas";

export type SeparateFilingKind =
  | "ca_electronic_filing"
  | "ca_registration_service"
  | "mn_electronic_transfer";

/** Collapse punctuation and extra spaces so "Doc   fee" still matches "doc fee". */
export function squashFeeName(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function includesAlias(name: string, aliases: readonly string[]): boolean {
  const squashed = squashFeeName(name);
  return aliases.some((alias) => squashed.includes(squashFeeName(alias)));
}

export function separateFilingKind(nameLower: string): SeparateFilingKind | null {
  const name = nameLower.toLowerCase();
  // An exact documentation name on the same line is the document processing
  // charge, even when the line also says "electronic filing".
  if (includesAlias(name, DOC_FEE_EXACT_ALIASES)) return null;
  if (includesAlias(name, CALIFORNIA_REGISTRATION_SERVICE_ALIASES)) return "ca_registration_service";
  if (includesAlias(name, MINNESOTA_ELECTRONIC_TRANSFER_ALIASES)) return "mn_electronic_transfer";
  if (includesAlias(name, CALIFORNIA_ELECTRONIC_FILING_ALIASES)) return "ca_electronic_filing";
  return null;
}

/**
 * Exact documentation names win over broader administrative names.
 * Arkansas service-and-handling names count only for Arkansas.
 * Electronic filing and optional electronic transfer names are not doc fees.
 */
export function docFeeAliasTier(nameLower: string, stateAbbreviation?: string | null): DocFeeAliasTier | null {
  const name = nameLower.toLowerCase();
  if (separateFilingKind(name)) return null;
  if (includesAlias(name, DOC_FEE_EXACT_ALIASES)) return "exact";
  if (stateAbbreviation === "AR" && includesAlias(name, ARKANSAS_SERVICE_HANDLING_ALIASES)) return "arkansas";
  if (includesAlias(name, DOC_FEE_BROAD_ALIASES)) return "broad";
  return null;
}

/** True for a documentation-fee alias. Arkansas names require the state. */
export function isDocFeeName(nameLower: string, stateAbbreviation?: string | null): boolean {
  const tier = docFeeAliasTier(nameLower, stateAbbreviation);
  return tier != null;
}

/** Raw-text extraction keeps Arkansas names even before the state is known. */
export function matchesExtractedDocFeeLabel(text: string): boolean {
  const name = text.toLowerCase();
  if (separateFilingKind(name)) return false;
  return (
    includesAlias(name, DOC_FEE_EXACT_ALIASES) ||
    includesAlias(name, DOC_FEE_BROAD_ALIASES) ||
    includesAlias(name, ARKANSAS_SERVICE_HANDLING_ALIASES)
  );
}

export function matchesExtractedFilingLabel(text: string): boolean {
  return separateFilingKind(text.toLowerCase()) != null;
}
