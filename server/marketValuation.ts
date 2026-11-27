/**
 * Independent vehicle-price benchmark.
 *
 * The submitted selling price and out-the-door price are accepted as arguments
 * so a caller can prove they do not move the benchmark. They are not read.
 * No licensed valuation provider is configured, so the benchmark stays unverified.
 */

export interface MarketBenchmarkInput {
  submittedSalePrice?: number | null;
  submittedOutTheDoor?: number | null;
  vehicleYear?: number | null;
  vehicleMake?: string | null;
  vehicleModel?: string | null;
}

export interface MarketBenchmark {
  status: "unverified" | "verified";
  source: string | null;
  low: number | null;
  high: number | null;
  reason: string;
}

const UNVERIFIED_REASON =
  "No independent valuation source is configured. Submitted asking prices are not used as a market benchmark.";

export function independentMarketBenchmark(input: MarketBenchmarkInput = {}): MarketBenchmark {
  const submitted = [input.submittedSalePrice, input.submittedOutTheDoor];
  const unusable = submitted.some((price) => price != null && !Number.isFinite(price));
  return {
    status: "unverified",
    source: null,
    low: null,
    high: null,
    reason: unusable
      ? "A submitted price was not a usable number. It was not used as a benchmark."
      : UNVERIFIED_REASON,
  };
}

/**
 * A benchmark that is just the submitted price copied into both ends is not
 * independent. Wider ranges are left to the caller that supplied them.
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
