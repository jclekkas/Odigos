/**
 * Independent vehicle-price benchmark, kept separate from factory MSRP comparison.
 *
 * The submitted selling price and out-the-door price are accepted as arguments
 * so a caller can prove they do not move the benchmark. They are not read as
 * the benchmark. No licensed valuation provider is configured, so this function
 * stays unverified.
 *
 * A buyer-supplied factory window sticker MSRP is not an independent market
 * value. compareFactoryMsrp records that sticker comparison. A later
 * bring-your-own-key provider can return its own MarketBenchmark
 * (kind "market_transaction", with a low and a high that do not copy the quote).
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

/** A verified market valuation requires an independent source, never a buyer-entered MSRP. */
export function toMarketValuation(benchmark: MarketBenchmark): MarketValuation {
  const independent =
    benchmark.status === "verified" &&
    benchmark.kind !== "factory_msrp" &&
    benchmark.source !== BUYER_WINDOW_STICKER_SOURCE &&
    benchmark.low != null &&
    benchmark.high != null;
  if (!independent) {
    return {
      status: "unverified",
      source: null,
      low: null,
      high: null,
      reason: benchmark.kind === "factory_msrp" || benchmark.source === BUYER_WINDOW_STICKER_SOURCE
        ? "A buyer-supplied factory MSRP is not an independent market valuation. No independent valuation source is configured."
        : benchmark.reason,
      kind: null,
    };
  }
  return {
    status: "verified",
    source: benchmark.source,
    low: benchmark.low,
    high: benchmark.high,
    reason: benchmark.reason,
    kind: "market_transaction",
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
