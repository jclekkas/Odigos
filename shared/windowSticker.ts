/**
 * Buyer-supplied factory window sticker (Monroney) MSRP.
 *
 * This is not a licensed market feed and not a transaction price.
 * A later bring-your-own-key valuation provider should return its own
 * MarketBenchmark and must not reuse this source id.
 */

export const BUYER_WINDOW_STICKER_SOURCE = "buyer_window_sticker_msrp";

/**
 * Shown wherever a factory-sticker check could be mistaken for a market comp.
 * Factory MSRP comparison and independent market valuation are different.
 */
export const FACTORY_STICKER_COMPARISON =
  "Compared with a buyer-supplied factory window sticker MSRP. This is a factory MSRP comparison, not an independent market valuation and not a live market transaction price.";

/** Differences of a dollar or less are rounding, not a markup over MSRP. */
export const FACTORY_MSRP_TOLERANCE_DOLLARS = 1;

export const FACTORY_MSRP_MIN = 1000;
export const FACTORY_MSRP_MAX = 2_000_000;
