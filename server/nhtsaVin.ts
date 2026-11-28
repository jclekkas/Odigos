/**
 * NHTSA Product Information Catalog Vehicle Listing (vPIC) VIN decode.
 *
 * Official API (fetched from https://vpic.nhtsa.dot.gov/api/):
 *   Decode VIN (flat format)
 *   GET /api/vehicles/DecodeVinValues/{vin}?format=json
 *   Optional query `modelyear` selects the VIN standard era (current, or
 *   pre-1980). It is omitted here so a quote that names the wrong year
 *   cannot constrain the decode. The buyer example is a quote that says
 *   2025 when the VIN decodes to 2023.
 *
 * Flat-format result keys, confirmed against a live DecodeVinValues response
 * and the vPIC Analytical User's Manual (DOT HS 813 795):
 *   Results[0].ModelYear, Make, Model, Trim, Trim2, Series,
 *   BasePrice, ErrorCode, ErrorText
 *
 * BasePrice (manual): "Base price of the vehicle is the cost of a new vehicle
 * with only the standard equipment and factory warranty. It is the cost
 * without any optional packages."
 * The API returns it as a string and leaves it blank when NHTSA has no value.
 * A blank value is not zero and is not shown.
 *
 * No API key. Failures time out and return a failed check. They do not throw
 * and they do not change marketValuation.
 */

import type { VinCheck, VinMismatch } from "../shared/buyerReported.js";

export const NHTSA_VPIC_DECODE_PATH = "/api/vehicles/DecodeVinValues/";
export const NHTSA_VPIC_ORIGIN = "https://vpic.nhtsa.dot.gov";
export const NHTSA_DOCS_URL = "https://vpic.nhtsa.dot.gov/api/";
export const VPIC_TIMEOUT_MS = 4_000;

export const BASE_PRICE_LABEL = "Base price for standard equipment" as const;

export const BASE_PRICE_DETAIL =
  "NHTSA vPIC Base Price is the cost of a new vehicle with only the standard equipment and factory warranty, without optional packages. It is not the MSRP with options and it is not a market value.";

export const BASE_PRICE_CITATION =
  "NHTSA Product Information Catalog and Vehicle Listing (vPIC), DecodeVinValues field BasePrice. DOT HS 813 795, Product Information Catalog and Vehicle Listing (vPIC) Analytical User's Manual, 2024.";

const VIN_CHARS = /^[A-HJ-NPR-Z0-9]{17}$/;
// Case-insensitive so a lowercase VIN in the quote is still found, then uppercased.
const VIN_IN_TEXT = /\b[A-HJ-NPR-Z0-9]{17}\b/gi;

const TRIM_TOKENS = [
  "ex-l",
  "xle",
  "xse",
  "sr5",
  "trd",
  "limited",
  "platinum",
  "touring",
  "premium",
  "luxury",
  "sport",
  "lariat",
  "sel",
  "xlt",
  "le",
  "se",
  "lx",
  "ex",
  "sr",
  "sv",
  "sl",
  "lt",
  "ls",
  "base",
];

const MAKE_ALIASES: Record<string, string> = {
  chevy: "chevrolet",
  chevrolet: "chevrolet",
  vw: "volkswagen",
  volkswagen: "volkswagen",
  mercedes: "mercedes-benz",
  "mercedes benz": "mercedes-benz",
  "mercedes-benz": "mercedes-benz",
  mini: "mini",
};

export interface NhtsaFetchInit {
  signal?: AbortSignal;
  headers?: Record<string, string>;
}

export interface NhtsaResponseLike {
  ok: boolean;
  status: number;
  text: () => Promise<string>;
}

export type NhtsaFetch = (url: string, init?: NhtsaFetchInit) => Promise<NhtsaResponseLike>;

export interface QuoteVehicleIdentity {
  year?: number | null;
  make?: string | null;
  model?: string | null;
  vehicleText?: string | null;
}

interface DecodedIdentity {
  year: number | null;
  make: string | null;
  model: string | null;
  trim: string | null;
  trim2: string | null;
  series: string | null;
  basePrice: number | null;
  errorCode: string;
  errorText: string;
}

export function vpicDecodeVinValuesUrl(vin: string): string {
  return `${NHTSA_VPIC_ORIGIN}${NHTSA_VPIC_DECODE_PATH}${encodeURIComponent(vin)}?format=json`;
}

export function normalizeVin(raw: string): string {
  return raw.replace(/[\s-]/g, "").toUpperCase();
}

export function isPlausibleVin(vin: string): boolean {
  return VIN_CHARS.test(vin) && /[A-HJ-NPR-Z]/.test(vin);
}

/**
 * Check digit in VIN position 9.
 * 49 CFR § 565.15(c), fetched from
 * https://www.ecfr.gov/current/title-49/subtitle-B/chapter-V/part-565
 * The worked example there is 1G4AH59H45G118341 (check digit 4).
 */
const VIN_CHECK_WEIGHTS = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];
const VIN_LETTER_VALUES: Record<string, number> = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8,
  J: 1, K: 2, L: 3, M: 4, N: 5, P: 7, R: 9,
  S: 2, T: 3, U: 4, V: 5, W: 6, X: 7, Y: 8, Z: 9,
};

export const VIN_CHECK_DIGIT_CITATION =
  "49 CFR § 565.15(c). Fetched from https://www.ecfr.gov/current/title-49/subtitle-B/chapter-V/part-565.";

export function vinCheckDigitIsValid(vin: string): boolean {
  const normalized = normalizeVin(vin);
  if (!isPlausibleVin(normalized)) return false;
  let sum = 0;
  for (let index = 0; index < 17; index += 1) {
    const character = normalized[index];
    const value = /[0-9]/.test(character) ? Number(character) : VIN_LETTER_VALUES[character];
    if (value == null || !Number.isFinite(value)) return false;
    sum += value * VIN_CHECK_WEIGHTS[index];
  }
  const remainder = sum % 11;
  const expected = remainder === 10 ? "X" : String(remainder);
  return normalized[8] === expected;
}

/** NHTSA ErrorCode is clean only when the sole code is 0 and the text says so. */
export function nhtsaDecodeIsClean(errorCode: string | null | undefined, errorText: string | null | undefined): boolean {
  const text = errorText?.trim() ?? "";
  // vPIC's clean result starts with error code 0 and says the VIN decoded clean.
  if (!text.startsWith("0") || !/vin decoded clean/i.test(text)) return false;
  if (/does not calculate/i.test(text)) return false;
  const code = (errorCode ?? "").trim() || "0";
  const parts = code.split(/[^0-9]+/).filter(Boolean);
  return parts.length === 1 && parts[0] === "0";
}

export function vinsInText(dealerText: string | null | undefined): string[] {
  if (!dealerText) return [];
  const found: string[] = [];
  for (const token of dealerText.match(VIN_IN_TEXT) ?? []) {
    const vin = token.toUpperCase();
    if (!isPlausibleVin(vin) || found.includes(vin)) continue;
    found.push(vin);
  }
  return found;
}

export function findVin(explicit: string | null | undefined, dealerText: string | null | undefined): {
  vin: string | null;
  provenance: "buyer-reported" | "quote" | null;
  invalidExplicit: boolean;
  conflictingVins: string[];
} {
  const textVins = vinsInText(dealerText);
  const typed = explicit?.trim() ? normalizeVin(explicit) : "";
  if (typed) {
    const distinct = new Set<string>(textVins);
    if (isPlausibleVin(typed)) distinct.add(typed);
    if (distinct.size > 1) {
      return {
        vin: null,
        provenance: "buyer-reported",
        invalidExplicit: false,
        conflictingVins: [...distinct],
      };
    }
    return {
      vin: typed,
      provenance: "buyer-reported",
      invalidExplicit: !isPlausibleVin(typed),
      conflictingVins: [],
    };
  }
  if (textVins.length > 1) {
    return { vin: null, provenance: "quote", invalidExplicit: false, conflictingVins: textVins };
  }
  if (textVins.length === 1) {
    return { vin: textVins[0], provenance: "quote", invalidExplicit: false, conflictingVins: [] };
  }
  return { vin: null, provenance: null, invalidExplicit: false, conflictingVins: [] };
}

function asText(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return "";
}

function parseBasePrice(raw: string): number | null {
  if (!raw || /not applicable|n\/a/i.test(raw)) return null;
  const cleaned = raw.replace(/[$,\s]/g, "");
  if (!cleaned) return null;
  const amount = Number(cleaned);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  return Math.round(amount * 100) / 100;
}

function emptyCheck(
  status: VinCheck["status"],
  summary: string,
  provenance: VinCheck["provenance"],
  vin: string | null,
  errorText: string | null = null,
): VinCheck {
  return {
    status,
    provenance,
    source: status === "decoded" ? "nhtsa_vpic" : null,
    vin,
    decoded: null,
    mismatches: [],
    basePrice: null,
    errorText,
    errorCode: null,
    conflictingVins: [],
    summary,
  };
}

function lettersOnly(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function normalizeMake(value: string): string {
  const spaced = value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  return MAKE_ALIASES[spaced] ?? spaced;
}

function displayMake(value: string): string {
  const trimmed = value.trim();
  if (trimmed.length <= 3) return trimmed.toUpperCase();
  return trimmed
    .toLowerCase()
    .replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
}

function trimTokensIn(value: string): string[] {
  const normalized = value.toLowerCase().replace(/[^a-z0-9]+/g, " ");
  const found: string[] = [];
  let rest = ` ${normalized} `;
  const ordered = [...TRIM_TOKENS].sort((a, b) => b.length - a.length);
  for (const token of ordered) {
    const needle = ` ${token.replace(/-/g, " ")} `;
    if (rest.includes(needle)) {
      found.push(lettersOnly(token));
      rest = rest.replace(needle, " ");
    }
  }
  return found;
}

function quoteLabel(identity: QuoteVehicleIdentity): string {
  const model = identity.model?.trim() || "";
  const parts = [identity.year ? String(identity.year) : "", identity.make?.trim() || "", model].filter(Boolean);
  if (parts.length > 0) return parts.join(" ");
  return identity.vehicleText?.trim() || "the vehicle on the quote";
}

function decodedLabel(decoded: DecodedIdentity): string {
  const parts = [
    decoded.year ? String(decoded.year) : "",
    decoded.make ? displayMake(decoded.make) : "",
    decoded.model ?? "",
    decoded.trim ?? "",
  ].filter(Boolean);
  return parts.join(" ") || "an unidentified vehicle";
}

export function compareDecodedVin(decoded: DecodedIdentity, identity: QuoteVehicleIdentity): VinMismatch[] {
  const mismatches: VinMismatch[] = [];
  const quoteText = [identity.vehicleText, identity.make, identity.model].filter(Boolean).join(" ");
  const quoteYear = identity.year ?? yearInText(identity.vehicleText);
  if (quoteYear != null && decoded.year != null && quoteYear !== decoded.year) {
    mismatches.push({ field: "year", quoteValue: String(quoteYear), decodedValue: String(decoded.year) });
  }

  const quoteMake = identity.make?.trim() || makeInText(quoteText, decoded.make);
  if (quoteMake && decoded.make) {
    const left = normalizeMake(quoteMake);
    const right = normalizeMake(decoded.make);
    if (left !== right) {
      mismatches.push({ field: "make", quoteValue: quoteMake, decodedValue: displayMake(decoded.make) });
    }
  }

  const quoteModel = identity.model?.trim() || "";
  if (quoteModel && decoded.model) {
    const quoteCore = modelCore(quoteModel);
    const decodedCore = modelCore(decoded.model);
    const quoteVariants = variantTokensIn(`${quoteModel} ${identity.vehicleText ?? ""}`);
    const decodedVariants = variantTokensIn(`${decoded.model} ${decoded.trim ?? ""} ${decoded.trim2 ?? ""}`);
    const coresEqual = quoteCore.length > 0 && quoteCore === decodedCore;
    const variantsEqual = sameStringSet(quoteVariants, decodedVariants);
    // "Camry" does not affirmatively match "Camry Hybrid". A shorter name
    // contained in a longer one is ambiguous, not a match.
    if (!coresEqual || !variantsEqual) {
      mismatches.push({
        field: "model",
        quoteValue: quoteModel,
        decodedValue: [decoded.model, decoded.trim, decoded.trim2].filter(Boolean).join(" "),
      });
    }
  }

  const quoteTrims = trimTokensIn(`${quoteModel} ${identity.vehicleText ?? ""}`);
  const decodedTrims = trimTokensIn(`${decoded.trim ?? ""} ${decoded.trim2 ?? ""}`);
  // One side naming a trim the other does not is ambiguity, not a match.
  // "XLE" does not count as "LE".
  if (!sameStringSet(quoteTrims, decodedTrims)) {
    mismatches.push({
      field: "trim",
      quoteValue: quoteTrims.join(", ").toUpperCase() || "not stated",
      decodedValue: decodedTrims.join(", ").toUpperCase() || "not stated",
    });
  }
  return mismatches;
}

function yearInText(text: string | null | undefined): number | null {
  const match = text?.match(/\b(19|20)\d{2}\b/);
  if (!match) return null;
  const year = Number(match[0]);
  return Number.isInteger(year) ? year : null;
}

function makeInText(text: string, decodedMake: string | null): string | null {
  if (!decodedMake) return null;
  const normalizedText = normalizeMake(text);
  const normalizedMake = normalizeMake(decodedMake);
  if (normalizedText.includes(normalizedMake)) return decodedMake;
  return null;
}

function stripTrimTokens(value: string): string {
  let rest = ` ${value.toLowerCase().replace(/[^a-z0-9]+/g, " ")} `;
  const ordered = [...TRIM_TOKENS].sort((a, b) => b.length - a.length);
  for (const token of ordered) {
    rest = rest.replace(` ${token.replace(/-/g, " ")} `, " ");
  }
  return rest.trim();
}

function sameStringSet(left: string[], right: string[]): boolean {
  if (left.length !== right.length) return false;
  const sortedRight = [...right].sort();
  return [...left].sort().every((token, index) => token === sortedRight[index]);
}

/** Powertrain words that make "Camry" and "Camry Hybrid" different vehicles. */
function variantTokensIn(value: string): string[] {
  const spaced = ` ${value.toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim()} `;
  const found: string[] = [];
  if (spaced.includes(" plug in ") || spaced.includes(" plugin ") || spaced.includes(" phev ")) found.push("plugin");
  if (spaced.includes(" hybrid ")) found.push("hybrid");
  if (spaced.includes(" prime ")) found.push("prime");
  return found;
}

function stripVariants(value: string): string {
  let rest = ` ${value.toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim()} `;
  for (const token of ["plug in", "plugin", "phev", "hybrid", "prime"]) {
    rest = rest.split(` ${token} `).join(" ");
  }
  return rest.trim();
}

function modelCore(value: string): string {
  return lettersOnly(stripTrimTokens(stripVariants(value)));
}

function dollars(amount: number): string {
  const rounded = Math.round(amount);
  return `$${rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

export function withQuoteIdentity(check: VinCheck, identity: QuoteVehicleIdentity): VinCheck {
  if (check.conflictingVins && check.conflictingVins.length > 1) return check;
  if (check.status !== "decoded" || !check.decoded || !check.vin) return check;
  const next = checkFromDecoded(
    {
      year: check.decoded.year,
      make: check.decoded.make,
      model: check.decoded.model,
      trim: check.decoded.trim,
      trim2: check.decoded.trim2,
      series: check.decoded.series,
      basePrice: check.basePrice?.amount ?? null,
      errorCode: check.errorCode ?? (check.errorText && !check.errorText.startsWith("0 ") ? "1" : "0"),
      errorText: check.errorText ?? "",
    },
    identity,
    check.provenance,
    check.vin,
  );
  return { ...next, conflictingVins: check.conflictingVins ?? [] };
}

function basePriceBlock(amount: number): VinCheck["basePrice"] {
  return {
    amount,
    label: BASE_PRICE_LABEL,
    detail: BASE_PRICE_DETAIL,
    citation: BASE_PRICE_CITATION,
    citationStatus: "sourced",
  };
}

function checkFromDecoded(
  decoded: DecodedIdentity,
  identity: QuoteVehicleIdentity,
  provenance: VinCheck["provenance"],
  vin: string,
): VinCheck {
  const mismatches = compareDecodedVin(decoded, identity);
  const quote = quoteLabel(identity);
  const vehicle = decodedLabel(decoded);
  const warning =
    decoded.errorText && decoded.errorCode && decoded.errorCode !== "0" && !decoded.errorText.startsWith("0 ")
      ? ` NHTSA also reported: ${decoded.errorText}.`
      : "";
  const priceNote =
    decoded.basePrice != null
      ? ` NHTSA lists a base price of ${dollars(decoded.basePrice)} for standard equipment and the factory warranty, without optional packages. That is not the MSRP with options and it is not a market value.`
      : "";
  const compared = identity.year != null || !!identity.make?.trim() || !!identity.model?.trim();
  const partial = decoded.year == null || !decoded.make || !decoded.model;
  const checkDigitNote = vinCheckDigitIsValid(vin)
    ? ""
    : " The check digit in position 9 does not match 49 CFR § 565.15(c), so this is not a confirmed vehicle match.";
  const partialNote = partial
    ? " NHTSA did not return a year, make, and model, so this is not a confirmed vehicle match."
    : "";
  let summary: string;
  if (mismatches.length > 0) {
    const fields = mismatches.map((item) => item.field).join(", ");
    summary = `The quote says ${quote}, but the VIN decodes to a ${vehicle}. The mismatch is on ${fields}. This is a vehicle identity check from NHTSA, not a market value.${warning}${partialNote}${checkDigitNote}${priceNote}`;
  } else if (compared) {
    summary = `The VIN matches the quote (${vehicle}). NHTSA decoded this VIN. This is a vehicle identity check, not a market value.${warning}${partialNote}${checkDigitNote}${priceNote}`;
  } else {
    summary = `NHTSA decodes this VIN as ${vehicle}. The quote did not name a year, make, and model to compare. This is not a market value.${warning}${partialNote}${checkDigitNote}${priceNote}`;
  }
  return {
    status: "decoded",
    provenance,
    source: "nhtsa_vpic",
    vin,
    decoded: {
      year: decoded.year,
      make: decoded.make,
      model: decoded.model,
      trim: decoded.trim,
      trim2: decoded.trim2,
      series: decoded.series,
    },
    mismatches,
    basePrice: decoded.basePrice != null ? basePriceBlock(decoded.basePrice) : null,
    errorText: decoded.errorText || null,
    errorCode: decoded.errorCode || null,
    conflictingVins: [],
    summary,
  };
}

function parseResultRow(row: Record<string, unknown>): DecodedIdentity | null {
  const yearRaw = asText(row.ModelYear);
  const year = /^\d{4}$/.test(yearRaw) ? Number(yearRaw) : null;
  const make = asText(row.Make) || null;
  const model = asText(row.Model) || null;
  const trim = asText(row.Trim) || null;
  const trim2 = asText(row.Trim2) || null;
  const series = asText(row.Series) || null;
  if (year == null && !make && !model) return null;
  return {
    year,
    make,
    model,
    trim,
    trim2,
    series,
    basePrice: parseBasePrice(asText(row.BasePrice)),
    errorCode: asText(row.ErrorCode),
    errorText: asText(row.ErrorText),
  };
}

async function defaultFetch(url: string, init?: NhtsaFetchInit): Promise<NhtsaResponseLike> {
  const response = await fetch(url, {
    signal: init?.signal,
    headers: init?.headers,
  });
  return {
    ok: response.ok,
    status: response.status,
    text: () => response.text(),
  };
}

export function unavailableVinCheck(): VinCheck {
  return emptyCheck(
    "failed",
    "The NHTSA VIN check could not be completed. The rest of the analysis continued. This is not a vehicle confirmation and it is not a market value.",
    null,
    null,
  );
}

export async function checkVin(input: {
  explicitVin?: string | null;
  dealerText?: string | null;
  identity: QuoteVehicleIdentity;
  fetchImpl?: NhtsaFetch;
  timeoutMs?: number;
}): Promise<VinCheck> {
  const located = findVin(input.explicitVin, input.dealerText);
  if (located.conflictingVins.length > 1) {
    return {
      ...emptyCheck(
        "failed",
        `The quote contains more than one VIN (${located.conflictingVins.join(", ")}). They are not the same, so none of them is a confirmed vehicle match.`,
        located.provenance,
        null,
      ),
      conflictingVins: located.conflictingVins,
    };
  }
  if (!located.vin) {
    return emptyCheck(
      "not_provided",
      "No VIN was entered and none was found in the quote. A VIN check was not run.",
      null,
      null,
    );
  }
  if (located.invalidExplicit || !isPlausibleVin(located.vin)) {
    return emptyCheck(
      "invalid",
      "This VIN is not 17 characters from the allowed VIN letters and numbers, so it was not sent to NHTSA. The letters I, O, and Q are not used in a VIN.",
      located.provenance,
      located.vin,
    );
  }

  const timeoutMs = input.timeoutMs ?? VPIC_TIMEOUT_MS;
  const fetchImpl = input.fetchImpl ?? defaultFetch;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(vpicDecodeVinValuesUrl(located.vin), {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    if (!response.ok) {
      return emptyCheck(
        "failed",
        "NHTSA did not return a VIN decode. The rest of the analysis continued. This is not a vehicle confirmation and it is not a market value.",
        located.provenance,
        located.vin,
        `HTTP ${response.status}`,
      );
    }
    const body = await response.text();
    if (body.length > 1_000_000) {
      return emptyCheck(
        "failed",
        "The NHTSA VIN response was too large to use. The rest of the analysis continued.",
        located.provenance,
        located.vin,
      );
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(body);
    } catch {
      return emptyCheck(
        "failed",
        "NHTSA returned a VIN response that could not be read. The rest of the analysis continued. This is not a vehicle confirmation.",
        located.provenance,
        located.vin,
      );
    }
    const results = (parsed as { Results?: unknown }).Results;
    const row = Array.isArray(results) ? results[0] : null;
    if (!row || typeof row !== "object") {
      return emptyCheck(
        "failed",
        "NHTSA returned no VIN decode. The rest of the analysis continued. This is not a vehicle confirmation.",
        located.provenance,
        located.vin,
      );
    }
    const decoded = parseResultRow(row as Record<string, unknown>);
    if (!decoded) {
      const errorText = asText((row as Record<string, unknown>).ErrorText) || null;
      return emptyCheck(
        "failed",
        "NHTSA could not identify a year, make, or model for this VIN. The rest of the analysis continued. This is not a vehicle confirmation.",
        located.provenance,
        located.vin,
        errorText,
      );
    }
    return checkFromDecoded(decoded, input.identity, located.provenance, located.vin);
  } catch (error) {
    const aborted = error instanceof Error && (error.name === "AbortError" || /abort|timeout/i.test(error.message));
    return emptyCheck(
      "failed",
      aborted
        ? "The NHTSA VIN check timed out. The rest of the analysis continued. This is not a vehicle confirmation and it is not a market value."
        : "The NHTSA VIN check could not be completed. The rest of the analysis continued. This is not a vehicle confirmation and it is not a market value.",
      located.provenance,
      located.vin,
    );
  } finally {
    clearTimeout(timer);
  }
}

/**
 * GO may rely on a VIN only when NHTSA returned a clean, complete decode
 * that affirmatively matches the quote. An empty mismatch list is not enough.
 */
export function vinPositivelyAgrees(
  check: {
    status: VinCheck["status"];
    vin: string | null;
    decoded?: VinCheck["decoded"];
    errorText?: string | null;
    errorCode?: string | null;
    conflictingVins?: string[];
  },
  identity: QuoteVehicleIdentity,
): { affirmative: boolean; reason: string } {
  if (check.conflictingVins && check.conflictingVins.length > 1) {
    return {
      affirmative: false,
      reason: `The quote contains more than one VIN (${check.conflictingVins.join(", ")}). They are not the same, so none of them is a confirmed vehicle match.`,
    };
  }
  if (check.status !== "decoded" || !check.vin) {
    return {
      affirmative: false,
      reason: "This VIN was not confirmed by a completed NHTSA decode, so it cannot approve the quote.",
    };
  }
  if (!vinCheckDigitIsValid(check.vin)) {
    return {
      affirmative: false,
      reason: `The VIN ${check.vin} fails the check digit in position 9 under 49 CFR § 565.15(c). A failed check digit is not a confirmed vehicle match.`,
    };
  }
  if (!nhtsaDecodeIsClean(check.errorCode, check.errorText)) {
    const detail = check.errorText?.trim() ? ` NHTSA reported: ${check.errorText.trim()}.` : "";
    return {
      affirmative: false,
      reason: `NHTSA did not report a clean decode for this VIN.${detail} An error code or an incomplete NHTSA result is not a confirmed vehicle match.`,
    };
  }
  if (check.decoded?.year == null || !check.decoded.make || !check.decoded.model) {
    return {
      affirmative: false,
      reason: "NHTSA did not return a year, make, and model for this VIN. A partial decode is not a confirmed vehicle match.",
    };
  }
  if (identity.year == null || !identity.make?.trim() || !identity.model?.trim()) {
    return {
      affirmative: false,
      reason: "The quote does not name a year, make, and model to compare with the VIN, so the decode is not a confirmed match.",
    };
  }
  const mismatches = compareDecodedVin(
    {
      year: check.decoded.year,
      make: check.decoded.make,
      model: check.decoded.model,
      trim: check.decoded.trim,
      trim2: check.decoded.trim2,
      series: check.decoded.series,
      basePrice: null,
      errorCode: check.errorCode ?? "",
      errorText: check.errorText ?? "",
    },
    identity,
  );
  if (mismatches.length > 0) {
    const fields = mismatches.map((item) => item.field).join(", ");
    return {
      affirmative: false,
      reason: `The VIN does not affirmatively match the quote on ${fields}. A partial, ambiguous, or conflicting vehicle name is not a confirmed match.`,
    };
  }
  return { affirmative: true, reason: "" };
}
