import type { MarketBenchmark } from "../../server/marketValuation.js";

/** A valuation that meets the GO provenance, range, and vehicle-match rules. */
export function auditedCamryBenchmark(overrides: Partial<MarketBenchmark> = {}): MarketBenchmark {
  return {
    status: "verified",
    source: "example-licensed-book",
    kind: "market_transaction",
    low: 26000,
    high: 30000,
    reason: "Licensed independent valuation for a 2025 Toyota Camry LE.",
    sourceQuality: "licensed_independent",
    provenance: {
      sourceId: "example-licensed-book",
      retrievedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      reference: "https://example.com/valuations/2025-toyota-camry-le",
    },
    vehicleMatch: {
      year: 2025,
      make: "Toyota",
      model: "Camry",
      trim: "LE",
      condition: "new",
      mileageMin: 0,
      mileageMax: 100,
    },
    ...overrides,
  };
}
