/**
 * Independent vehicle-price benchmark.
 *
 * The submitted selling price and out-the-door price are accepted as arguments
 * so a caller can prove they do not move the benchmark. They are not read as
 * the benchmark. No licensed valuation provider is configured.
 *
 * A buyer-supplied factory window sticker MSRP is an explicit ceiling on the
 * selling price. It is not a market transaction price. A later bring-your-own-key
 * provider can return its own MarketBenchmark (kind "market_transaction", with
 * a low and a high that do not copy the quote). The rule engine already accepts
 * that object and does not need a new verdict path.
 */

import {
  BUYER_WINDOW_STICKER_SOURCE,
  FACTORY_MSRP_MAX,
  FACTORY_MSRP_MIN,
  FACTORY_MSRP_TOLERANCE_DOLLARS,
  FACTORY_STICKER_COMPARISON,
} from "../shared/windowSticker.js";

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

/**
 * A positive finite Monroney figure. An out-the-door total is not a factory
 * sticker. Matching the selling price is an at-sticker deal and is kept.
 * The engine never fills this field from either submitted price.
 */
function buyerWindowStickerBenchmark(input: MarketBenchmarkInput): MarketBenchmark | null {
  if (input.buyerWindowStickerMsrp == null) return null;
  const raw = input.buyerWindowStickerMsrp;
  if (typeof raw !== "number" || !Number.isFinite(raw) || raw <= 0) {
    return unverified(
      "The factory window sticker MSRP was not a positive number, so it was not used as a benchmark.",
    );
  }
  if (raw < FACTORY_MSRP_MIN || raw > FACTORY_MSRP_MAX) {
    return unverified(
      "The factory window sticker MSRP was outside a usable dollar range, so it was not used as a benchmark.",
    );
  }
  const sticker = Math.round(raw * 100) / 100;
  const matchesSale = nearMoney(sticker, input.submittedSalePrice);
  const matchesOtd = nearMoney(sticker, input.submittedOutTheDoor);
  if (matchesOtd && !matchesSale) {
    return unverified(
      "The factory window sticker MSRP matched the submitted out-the-door price, so it was not used as a benchmark.",
    );
  }
  return {
    status: "verified",
    source: BUYER_WINDOW_STICKER_SOURCE,
    kind: "factory_msrp",
    low: sticker,
    high: sticker,
    reason: FACTORY_STICKER_COMPARISON,
  };
}

export function independentMarketBenchmark(input: MarketBenchmarkInput = {}): MarketBenchmark {
  const sticker = buyerWindowStickerBenchmark(input);
  if (sticker) return sticker;

  const submitted = [input.submittedSalePrice, input.submittedOutTheDoor];
  const unusable = submitted.some((price) => price != null && !Number.isFinite(price));
  return unverified(
    unusable
      ? "A submitted price was not a usable number. It was not used as a benchmark."
      : UNVERIFIED_REASON,
  );
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
