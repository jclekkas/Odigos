/**
 * Independent vehicle-price benchmark, kept separate from factory MSRP comparison.
 *
 * The submitted selling price and out-the-door price are accepted as arguments
 * so a caller can prove they do not move the benchmark. They are not read as
 * the benchmark. No licensed valuation provider is configured, so this function
 * stays unverified.
 *
 * A buyer-supplied factory window sticker MSRP is not an independent market
 * value. compareFactoryMsrp records that sticker comparison. A GO-eligible
 * market value comes only from a trusted server-side adapter, which signs
 * the result in this process. A licensed or government label, or a URL,
 * supplied by the caller does not verify the price.
 */

import {
  BUYER_WINDOW_STICKER_SOURCE,
  FACTORY_MSRP_MAX,
  FACTORY_MSRP_MIN,
  FACTORY_MSRP_TOLERANCE_DOLLARS,
  FACTORY_STICKER_COMPARISON,
} from "../shared/windowSticker.js";
import {
  attestationIsAuthentic,
  isInformationalValuationClaim,
  isServerValuation,
  payloadFromBenchmark,
  valuationFreshness,
  valuationMaxAgeMs,
} from "./valuationAttestation.js";

export interface MarketBenchmarkInput {
  submittedSalePrice?: number | null;
  submittedOutTheDoor?: number | null;
  vehicleYear?: number | null;
  vehicleMake?: string | null;
  vehicleModel?: string | null;
  /**
   * Monroney MSRP the buyer typed. Never assign this from the selling price,
   * the out-the-door price, or an MSRP extracted from the dealer quote.
   */
  buyerWindowStickerMsrp?: number | null;
}

export type MarketBenchmarkKind = "factory_msrp" | "market_transaction";

/**
 * licensed_independent and government_record can verify a price.
 * buyer_reported and unspecified cannot, even when a range is attached.
 */
export type ValuationSourceQuality =
  | "licensed_independent"
  | "government_record"
  | "buyer_reported"
  | "unspecified";

/** Retrieval record produced by a server-side adapter. Buyer-typed notes are not this. */
export interface ValuationProvenance {
  sourceId: string;
  /** ISO-8601 time the adapter retrieved the benchmark. */
  retrievedAt: string;
  /** Reference the adapter says a reviewer can open. A caller-supplied URL is not this. */
  reference: string;
  /** HMAC the server adds when the adapter returns. Absent on request JSON. */
  attestation?: string;
}

/** The vehicle the benchmark actually covers. All of these must match the quote. */
export interface ValuationVehicleMatch {
  year: number;
  make: string;
  model: string;
  trim: string;
  condition: "new" | "used";
  mileageMin: number;
  mileageMax: number;
}

export interface QuotedVehicle {
  year?: number | null;
  make?: string | null;
  model?: string | null;
  trim?: string | null;
  condition?: "new" | "used" | "unknown" | null;
  mileage?: number | null;
}

export interface MsrpComparison {
  status: "compared" | "not_provided" | "rejected";
  source: string | null;
  factoryMsrp: number | null;
  sellingPrice: number | null;
  relation: "above" | "at_or_below" | "unavailable";
  markupDollars: number | null;
  markupPercent: string | null;
  summary: string;
}

export interface MarketValuation {
  status: "unverified" | "verified";
  source: string | null;
  low: number | null;
  high: number | null;
  reason: string;
  kind: "market_transaction" | null;
  /** Adapter reference shown with a verified result. Null when unverified. */
  reference?: string | null;
}

export interface MarketBenchmark {
  status: "unverified" | "verified";
  source: string | null;
  low: number | null;
  high: number | null;
  reason: string;
  /**
   * factory_msrp: high is a selling-price ceiling (at or below is acceptable).
   * market_transaction: selling price must fall inside [low, high].
   * Omitted on an unverified result. A future licensed provider sets
   * "market_transaction" and its own band.
   */
  kind?: MarketBenchmarkKind;
  sourceQuality?: ValuationSourceQuality | null;
  provenance?: ValuationProvenance | null;
  vehicleMatch?: ValuationVehicleMatch | null;
}

const UNVERIFIED_REASON =
  "No independent valuation source is configured. Submitted asking prices are not used as a market benchmark.";

function unverified(reason: string): MarketBenchmark {
  return {
    status: "unverified",
    source: null,
    low: null,
    high: null,
    reason,
  };
}

function nearMoney(value: number, other: number | null | undefined): boolean {
  return other != null && Number.isFinite(other) && Math.abs(value - other) < FACTORY_MSRP_TOLERANCE_DOLLARS;
}

function emptyComparison(status: MsrpComparison["status"], summary: string): MsrpComparison {
  return {
    status,
    source: null,
    factoryMsrp: null,
    sellingPrice: null,
    relation: "unavailable",
    markupDollars: null,
    markupPercent: null,
    summary,
  };
}

/**
 * Buyer-supplied Monroney comparison. A numeric MSRP does not verify market value.
 * The selling price and the out-the-door price never become the sticker.
 */
export function compareFactoryMsrp(input: MarketBenchmarkInput & {
  condition?: "new" | "used" | "unknown" | null;
} = {}): MsrpComparison {
  if (input.buyerWindowStickerMsrp == null) {
    return emptyComparison(
      "not_provided",
      "No buyer-supplied factory window sticker MSRP was entered. Factory MSRP comparison was not run. Independent market valuation is a separate check.",
    );
  }
  const raw = input.buyerWindowStickerMsrp;
  if (typeof raw !== "number" || !Number.isFinite(raw) || raw <= 0) {
    return emptyComparison(
      "rejected",
      "The factory window sticker MSRP was not a positive number, so it was not used. It was not treated as a market valuation.",
    );
  }
  if (raw < FACTORY_MSRP_MIN || raw > FACTORY_MSRP_MAX) {
    return emptyComparison(
      "rejected",
      "The factory window sticker MSRP was outside a usable dollar range, so it was not used. It was not treated as a market valuation.",
    );
  }
  const sticker = Math.round(raw * 100) / 100;
  const sale = input.submittedSalePrice;
  const matchesSale = sale != null && nearMoney(sticker, sale);
  const matchesOtd = nearMoney(sticker, input.submittedOutTheDoor);
  if (matchesOtd && !matchesSale) {
    return emptyComparison(
      "rejected",
      "The factory window sticker MSRP matched the submitted out-the-door price, so it was not used. It was not treated as a market valuation.",
    );
  }
  const usedNote = input.condition === "used"
    ? " A used vehicle's original factory MSRP is not an independent used-market valuation."
    : "";
  if (sale == null || !Number.isFinite(sale)) {
    return {
      status: "compared",
      source: BUYER_WINDOW_STICKER_SOURCE,
      factoryMsrp: sticker,
      sellingPrice: null,
      relation: "unavailable",
      markupDollars: null,
      markupPercent: null,
      summary: `A buyer-supplied factory window sticker MSRP of ${formatUsd(sticker)} was recorded, but the selling price was not available to compare. ${FACTORY_STICKER_COMPARISON}${usedNote}`,
    };
  }
  const markup = factoryMarkup(sale, sticker);
  const above = sale > sticker + FACTORY_MSRP_TOLERANCE_DOLLARS;
  if (above) {
    return {
      status: "compared",
      source: BUYER_WINDOW_STICKER_SOURCE,
      factoryMsrp: sticker,
      sellingPrice: sale,
      relation: "above",
      markupDollars: markup.dollars,
      markupPercent: markup.percentLabel,
      summary: `The selling price of ${formatUsd(sale)} is ${markup.dollarsLabel} (${markup.percentLabel}) above the buyer-supplied factory window sticker MSRP of ${formatUsd(sticker)}. This factory-sticker markup is not an estimated market overpayment or guaranteed savings. ${FACTORY_STICKER_COMPARISON}${usedNote}`,
    };
  }
  return {
    status: "compared",
    source: BUYER_WINDOW_STICKER_SOURCE,
    factoryMsrp: sticker,
    sellingPrice: sale,
    relation: "at_or_below",
    markupDollars: null,
    markupPercent: null,
    summary: `The selling price of ${formatUsd(sale)} is at or below the buyer-supplied factory window sticker MSRP of ${formatUsd(sticker)}. That gap is not estimated savings or a market valuation. ${FACTORY_STICKER_COMPARISON}${usedNote}`,
  };
}

export function independentMarketBenchmark(input: MarketBenchmarkInput = {}): MarketBenchmark {
  const submitted = [input.submittedSalePrice, input.submittedOutTheDoor];
  const unusable = submitted.some((price) => price != null && !Number.isFinite(price));
  return unverified(
    unusable
      ? "A submitted price was not a usable number. It was not used as a benchmark."
      : UNVERIFIED_REASON,
  );
}

const BUYER_SOURCE_IDS = new Set([
  "buyer_window_sticker_msrp",
  "buyer-reported",
  "buyer_reported",
  "buyer_comparables",
  "buyer_book_value",
  "buyer_book",
]);

const TRIM_TOKENS = [
  "ex-l", "xle", "xse", "sr5", "trd", "limited", "platinum", "touring", "premium",
  "luxury", "sport", "hybrid", "lariat", "sel", "xlt", "le", "se", "lx", "ex",
  "sr", "sv", "sl", "lt", "ls", "base",
];

function unverifiedValuation(reason: string): MarketValuation {
  return {
    status: "unverified",
    source: null,
    low: null,
    high: null,
    reason,
    kind: null,
    reference: null,
  };
}

export function isBuyerReportedSource(source: string | null | undefined): boolean {
  if (!source) return false;
  const key = source.trim().toLowerCase().replace(/\s+/g, "_");
  if (BUYER_SOURCE_IDS.has(key)) return true;
  return key.includes("buyer_reported") || key.includes("buyer-reported") || key.includes("window_sticker");
}

function normalizeName(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function splitModelAndTrim(model: string | null | undefined, explicitTrim?: string | null): { model: string; trim: string | null } {
  const rawModel = (model ?? "").trim();
  const explicit = explicitTrim?.trim() ?? "";
  if (explicit) {
    const pattern = new RegExp(`\\b${explicit.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    const stripped = rawModel.replace(pattern, " ").replace(/\s+/g, " ").trim();
    return { model: stripped || rawModel, trim: explicit };
  }
  let spaced = ` ${rawModel.toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ")} `;
  const ordered = [...TRIM_TOKENS].sort((a, b) => b.length - a.length);
  for (const token of ordered) {
    const needle = ` ${token.replace(/-/g, " ")} `;
    if (spaced.includes(needle)) {
      spaced = spaced.replace(needle, " ");
      return { model: spaced.replace(/\s+/g, " ").trim(), trim: token };
    }
  }
  return { model: rawModel, trim: null };
}

/**
 * Readable freshness check for a valuation's retrieval time. It delegates to the
 * same `valuationFreshness` rule the verification gate uses, so a missing time,
 * a time before 1990, a future time, and a time past the window all fail.
 */
export function assessRetrievalFreshness(
  retrievedAt: string | null | undefined,
  nowMs: number = Date.now(),
  maxAgeMs: number = valuationMaxAgeMs(undefined, process.env.ODIGOS_VALUATION_MAX_AGE_HOURS),
): { ok: true } | { ok: false; reason: string } {
  if (!retrievedAt || !retrievedAt.trim()) {
    return { ok: false, reason: "This valuation has no usable retrieval time, so it was not treated as verified." };
  }
  const freshness = valuationFreshness(retrievedAt, nowMs, maxAgeMs);
  if (freshness === "stale") {
    return { ok: false, reason: "This valuation is older than the configured freshness limit, so it was not treated as verified." };
  }
  if (freshness !== "fresh") {
    return { ok: false, reason: "This valuation has no usable retrieval time, so it was not treated as verified." };
  }
  return { ok: true };
}

export function benchmarkQualifiesAsVerified(
  benchmark: MarketBenchmark,
  quote: QuotedVehicle,
  clock?: { nowMs?: number; maxAgeMs?: number },
): { ok: true } | { ok: false; reason: string } {
  if (
    benchmark.kind === "factory_msrp" ||
    isBuyerReportedSource(benchmark.source) ||
    benchmark.sourceQuality === "buyer_reported" ||
    isInformationalValuationClaim(
      benchmark.source,
      benchmark.provenance?.sourceId,
      benchmark.provenance?.reference,
      benchmark.reason,
    )
  ) {
    return {
      ok: false,
      reason: "A buyer-reported input, factory MSRP, book value, competing quote, or NHTSA base price cannot verify market value.",
    };
  }
  if (!isServerValuation(benchmark)) {
    return {
      ok: false,
      reason: "This valuation was not produced by a trusted server-side adapter, so it was not treated as verified.",
    };
  }
  const payload = payloadFromBenchmark(benchmark);
  if (!payload || !attestationIsAuthentic(payload, benchmark.provenance?.attestation)) {
    return {
      ok: false,
      reason: "This valuation's provenance is not authenticated, so it was not treated as verified.",
    };
  }
  if (benchmark.sourceQuality !== "licensed_independent" && benchmark.sourceQuality !== "government_record") {
    return {
      ok: false,
      reason: "The valuation source is not an independent licensed or government record, so it was not treated as verified.",
    };
  }
  const provenance = benchmark.provenance;
  if (!provenance?.sourceId?.trim() || isBuyerReportedSource(provenance.sourceId)) {
    return { ok: false, reason: "This valuation has no independent source id, so it was not treated as verified." };
  }
  const freshness = provenance.retrievedAt
    ? valuationFreshness(
        provenance.retrievedAt,
        clock?.nowMs ?? Date.now(),
        valuationMaxAgeMs(clock?.maxAgeMs, process.env.ODIGOS_VALUATION_MAX_AGE_HOURS),
      )
    : "unusable";
  if (freshness === "stale") {
    return {
      ok: false,
      reason: "This valuation is older than the configured freshness limit, so it was not treated as verified.",
    };
  }
  if (freshness !== "fresh") {
    return { ok: false, reason: "This valuation has no usable retrieval time, so it was not treated as verified." };
  }
  if (!provenance.reference?.trim()) {
    return { ok: false, reason: "This valuation has no source reference, so it was not treated as verified." };
  }
  const low = benchmark.low;
  const high = benchmark.high;
  if (low == null || high == null || !Number.isFinite(low) || !Number.isFinite(high) || low <= 0 || high <= 0 || low > high) {
    return {
      ok: false,
      reason: "The valuation range is not a finite positive range with the low price at or below the high price, so it was not treated as verified.",
    };
  }
  const match = benchmark.vehicleMatch;
  if (!match || match.condition !== "new" && match.condition !== "used") {
    return { ok: false, reason: "This valuation does not name the vehicle it covers, so it was not treated as verified." };
  }
  if (!match.trim?.trim() || !match.make?.trim() || !match.model?.trim() || !Number.isInteger(match.year)) {
    return {
      ok: false,
      reason: "This valuation does not name the year, make, model, and trim it covers, so it was not treated as verified.",
    };
  }
  if (
    !Number.isFinite(match.mileageMin) ||
    !Number.isFinite(match.mileageMax) ||
    match.mileageMin < 0 ||
    match.mileageMax < match.mileageMin
  ) {
    return { ok: false, reason: "This valuation does not include a mileage band, so it was not treated as verified." };
  }
  if (quote.year == null || !Number.isInteger(quote.year) || quote.year !== match.year) {
    return { ok: false, reason: "This valuation does not match the quote's year, so it was not treated as verified." };
  }
  if (!quote.make?.trim() || normalizeName(quote.make) !== normalizeName(match.make)) {
    return { ok: false, reason: "This valuation does not match the quote's make, so it was not treated as verified." };
  }
  const quoteParts = splitModelAndTrim(quote.model, quote.trim);
  const benchParts = splitModelAndTrim(match.model, match.trim);
  if (!quoteParts.model || normalizeName(quoteParts.model) !== normalizeName(benchParts.model)) {
    return { ok: false, reason: "This valuation does not match the quote's model, so it was not treated as verified." };
  }
  const quoteTrim = quoteParts.trim;
  const benchmarkTrim = benchParts.trim;
  if (!quoteTrim || !benchmarkTrim || normalizeName(quoteTrim) !== normalizeName(benchmarkTrim)) {
    return { ok: false, reason: "This valuation does not match the quote's trim, so it was not treated as verified." };
  }
  if (quote.condition !== "new" && quote.condition !== "used") {
    return { ok: false, reason: "This valuation cannot be matched until the quote says whether the vehicle is new or used." };
  }
  if (quote.condition !== match.condition) {
    return { ok: false, reason: "This valuation is for a different new-or-used condition, so it was not treated as verified." };
  }
  if (quote.mileage == null || !Number.isFinite(quote.mileage) || quote.mileage < 0) {
    return { ok: false, reason: "This valuation cannot be matched until the quote includes mileage." };
  }
  if (quote.mileage < match.mileageMin || quote.mileage > match.mileageMax) {
    return { ok: false, reason: "The quote's mileage is outside this valuation's mileage band, so it was not treated as verified." };
  }
  return { ok: true };
}

/**
 * Caller-supplied benchmarks are not a valuation source. The rule engine asks
 * the adapter registry instead. This remains so a direct call cannot promote
 * a request body into a verified price.
 */
export function acceptIndependentBenchmark(
  supplied: MarketBenchmark | null | undefined,
  quote: QuotedVehicle,
  submittedSalePrice: number | null | undefined,
  submittedOutTheDoor: number | null | undefined,
): MarketBenchmark {
  const fallback = independentMarketBenchmark({
    submittedSalePrice,
    submittedOutTheDoor,
    vehicleYear: quote.year,
    vehicleMake: quote.make,
    vehicleModel: quote.model,
  });
  if (!supplied) return fallback;
  if (
    supplied.kind === "factory_msrp" ||
    supplied.source === BUYER_WINDOW_STICKER_SOURCE ||
    isBuyerReportedSource(supplied.source) ||
    supplied.sourceQuality === "buyer_reported" ||
    isInformationalValuationClaim(supplied.source, supplied.provenance?.sourceId, supplied.provenance?.reference, supplied.reason)
  ) {
    return unverified("A buyer-reported input, factory MSRP, book value, competing quote, or NHTSA base price cannot verify market value.");
  }
  return unverified(
    "A caller-supplied valuation label, URL, or provenance was not used. Market value stays unverified unless a trusted server-side adapter produces it.",
  );
}

/** A verified market valuation requires a server-produced adapter result and a matching vehicle. */
export function toMarketValuation(
  benchmark: MarketBenchmark,
  quote?: QuotedVehicle,
  clock?: { nowMs?: number; maxAgeMs?: number },
): MarketValuation {
  if (benchmark.status !== "verified" || benchmark.kind === "factory_msrp" || isBuyerReportedSource(benchmark.source)) {
    return unverifiedValuation(
      benchmark.kind === "factory_msrp" || isBuyerReportedSource(benchmark.source) || benchmark.source === BUYER_WINDOW_STICKER_SOURCE
        ? "A buyer-supplied factory MSRP is not an independent market valuation. No independent valuation source is configured."
        : benchmark.reason,
    );
  }
  if (!quote) {
    return unverifiedValuation("Vehicle identity was not available to confirm this valuation, so it was not treated as verified.");
  }
  const check = benchmarkQualifiesAsVerified(benchmark, quote, clock);
  if (!check.ok) return unverifiedValuation(check.reason);
  return {
    status: "verified",
    source: benchmark.source,
    low: benchmark.low,
    high: benchmark.high,
    reason: benchmark.reason,
    kind: "market_transaction",
    reference: benchmark.provenance?.reference?.trim() || null,
  };
}

/**
 * A benchmark that is just the submitted price copied into both ends is not
 * independent. Wider ranges are left to the caller that supplied them.
 * A factory-sticker ceiling is not this shape unless the sticker itself was
 * already rejected as a copy of the quote.
 */
export function benchmarkCopiesSubmittedPrice(
  benchmark: MarketBenchmark,
  submittedSalePrice: number | null | undefined,
  submittedOutTheDoor: number | null | undefined,
): boolean {
  if (benchmark.low == null || benchmark.high == null) return false;
  const copies = (price: number | null | undefined) =>
    price != null &&
    Number.isFinite(price) &&
    Math.abs(benchmark.low! - price) < 1 &&
    Math.abs(benchmark.high! - price) < 1;
  return copies(submittedSalePrice) || copies(submittedOutTheDoor);
}

export function formatUsd(amount: number): string {
  if (!Number.isFinite(amount)) return "$0";
  const negative = amount < 0;
  const cents = Math.round(Math.abs(amount) * 100);
  const whole = Math.floor(cents / 100);
  const fraction = cents % 100;
  const grouped = whole.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const digits = fraction === 0 ? grouped : `${grouped}.${fraction.toString().padStart(2, "0")}`;
  return `${negative ? "-" : ""}$${digits}`;
}

export function formatMarkupPercent(dollars: number, base: number): string {
  if (!(base > 0) || !Number.isFinite(dollars)) return "0.00%";
  return `${((dollars / base) * 100).toFixed(2)}%`;
}

export function factoryMarkup(salePrice: number, factoryMsrp: number): {
  dollars: number;
  dollarsLabel: string;
  percentLabel: string;
} {
  const dollars = Math.round((salePrice - factoryMsrp) * 100) / 100;
  return {
    dollars,
    dollarsLabel: formatUsd(dollars),
    percentLabel: formatMarkupPercent(dollars, factoryMsrp),
  };
}
