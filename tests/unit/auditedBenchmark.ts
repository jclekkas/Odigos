import type { MarketBenchmark } from "../../server/marketValuation.js";

/**
 * A caller-shaped valuation. It is not registered as a server adapter and
 * must not unlock GO, even though the label says licensed.
 */
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
      retrievedAt: "2026-11-27T15:00:00.000Z",
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
