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
const VIN_IN_TEXT = /\b[A-HJ-NPR-Z0-9]{17}\b/g;

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
  "hybrid",
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

export function findVin(explicit: string | null | undefined, dealerText: string | null | undefined): {
  vin: string | null;
  provenance: "buyer-reported" | "quote" | null;
  invalidExplicit: boolean;
} {
  const typed = explicit?.trim() ? normalizeVin(explicit) : "";
  if (typed) {
    return {
      vin: typed,
      provenance: "buyer-reported",
      invalidExplicit: !isPlausibleVin(typed),
    };
  }
  const found = dealerText?.match(VIN_IN_TEXT)?.find((token) => isPlausibleVin(token.toUpperCase()));
  if (!found) return { vin: null, provenance: null, invalidExplicit: false };
  return { vin: found.toUpperCase(), provenance: "quote", invalidExplicit: false };
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
    const makeAgrees = left === right || left.includes(right) || right.includes(left);
    if (!makeAgrees) {
      mismatches.push({ field: "make", quoteValue: quoteMake, decodedValue: displayMake(decoded.make) });
    }
  }

  const quoteModel = identity.model?.trim() || "";
  if (quoteModel && decoded.model) {
    const quoteModelKey = lettersOnly(stripTrimTokens(quoteModel));
    const decodedModelKey = lettersOnly(decoded.model);
    const textKey = lettersOnly(stripTrimTokens(quoteText));
    const modelAgrees =
      (decodedModelKey.length > 0 && (quoteModelKey.includes(decodedModelKey) || textKey.includes(decodedModelKey))) ||
      (quoteModelKey.length > 0 && decodedModelKey.includes(quoteModelKey));
    if (!modelAgrees) {
      mismatches.push({ field: "model", quoteValue: quoteModel, decodedValue: decoded.model });
    }
  }

  const quoteTrims = trimTokensIn(`${quoteModel} ${identity.vehicleText ?? ""}`);
  const decodedTrims = [decoded.trim, decoded.trim2].filter((value): value is string => !!value).map(lettersOnly);
  if (quoteTrims.length > 0 && decodedTrims.length > 0) {
    // Exact trim token only. "XLE" must not count as "LE".
    const agrees = quoteTrims.some((token) => decodedTrims.some((decodedTrim) => decodedTrim === token));
    if (!agrees) {
      mismatches.push({
        field: "trim",
        quoteValue: quoteTrims.join(", ").toUpperCase(),
        decodedValue: [decoded.trim, decoded.trim2].filter(Boolean).join(" / "),
      });
    }
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

function dollars(amount: number): string {
  const rounded = Math.round(amount);
  return `$${rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

export function withQuoteIdentity(check: VinCheck, identity: QuoteVehicleIdentity): VinCheck {
  if (check.status !== "decoded" || !check.decoded || !check.vin) return check;
  return checkFromDecoded(
    {
      year: check.decoded.year,
      make: check.decoded.make,
      model: check.decoded.model,
      trim: check.decoded.trim,
      trim2: check.decoded.trim2,
      series: check.decoded.series,
      basePrice: check.basePrice?.amount ?? null,
      errorCode: check.errorText && !check.errorText.startsWith("0 ") ? "1" : "0",
      errorText: check.errorText ?? "",
    },
    identity,
    check.provenance,
    check.vin,
  );
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
  let summary: string;
  if (mismatches.length > 0) {
    const fields = mismatches.map((item) => item.field).join(", ");
    summary = `The quote says ${quote}, but the VIN decodes to a ${vehicle}. The mismatch is on ${fields}. This is a vehicle identity check from NHTSA, not a market value.${warning}${priceNote}`;
  } else if (compared) {
    summary = `The VIN matches the quote (${vehicle}). NHTSA decoded this VIN. This is a vehicle identity check, not a market value.${warning}${priceNote}`;
  } else {
    summary = `NHTSA decodes this VIN as ${vehicle}. The quote did not name a year, make, and model to compare. This is not a market value.${warning}${priceNote}`;
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
