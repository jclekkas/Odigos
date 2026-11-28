/**
 * Trusted valuation sources.
 *
 * Production starts with an empty registry, so market value stays unverified.
 * A GO-eligible price can only be returned by an adapter registered in this
 * process. The adapter's result is signed here. A licensed label, a
 * government label, or a URL in the request body is not an adapter.
 *
 * No paid valuation feed is registered. Adding one later is a code change
 * that calls a bring-your-own-key provider; this module does not embed a key.
 */

import {
  benchmarkCopiesSubmittedPrice,
  benchmarkQualifiesAsVerified,
  type MarketBenchmark,
  type QuotedVehicle,
  type ValuationSourceQuality,
  type ValuationVehicleMatch,
} from "./marketValuation.js";
import {
  markServerValuation,
  payloadFromBenchmark,
  signAttestation,
  type AttestedSourceQuality,
} from "./valuationAttestation.js";

export interface ValuationLookup {
  vehicle: QuotedVehicle;
  submittedSalePrice?: number | null;
  submittedOutTheDoor?: number | null;
}

export interface ValuationAdapterResult {
  low: number;
  high: number;
  retrievedAt: string;
  reference: string;
  reason: string;
  vehicleMatch: ValuationVehicleMatch;
  sourceQuality?: AttestedSourceQuality;
}

export interface ValuationSourceAdapter {
  id: string;
  label: string;
  sourceQuality: AttestedSourceQuality;
  lookup(query: ValuationLookup): ValuationAdapterResult | null;
}

const adapters: ValuationSourceAdapter[] = [];

export function listValuationAdapters(): readonly ValuationSourceAdapter[] {
  return adapters;
}

/** Registers adapters for the duration of `fn`, then removes them. */
export function withValuationAdapters<T>(next: ValuationSourceAdapter[], fn: () => T): T {
  adapters.push(...next);
  try {
    return fn();
  } finally {
    adapters.splice(Math.max(0, adapters.length - next.length), next.length);
  }
}

export const TEST_VALUATION_REFERENCE = "test-only://odigos/trusted-valuation/2025-toyota-camry-le";

/**
 * Test-only adapter. It is not registered at startup. Tests opt in with
 * withValuationAdapters. It does not call a paid data vendor.
 */
export function createTestTrustedValuationAdapter(options?: {
  id?: string;
  retrievedAt?: string;
  low?: number;
  high?: number;
  reference?: string;
  sourceQuality?: AttestedSourceQuality;
}): ValuationSourceAdapter {
  const id = options?.id ?? "test-trusted-valuation";
  const sourceQuality = options?.sourceQuality ?? "licensed_independent";
  const reference = options?.reference ?? TEST_VALUATION_REFERENCE;
  return {
    id,
    label: "Test-only trusted valuation",
    sourceQuality,
    lookup() {
      return {
        low: options?.low ?? 26000,
        high: options?.high ?? 30000,
        retrievedAt: options?.retrievedAt ?? new Date().toISOString(),
        reference,
        sourceQuality,
        reason: `Test-only trusted valuation for a 2025 Toyota Camry LE. Source: ${reference}`,
        vehicleMatch: {
          year: 2025,
          make: "Toyota",
          model: "Camry",
          trim: "LE",
          condition: "new",
          mileageMin: 0,
          mileageMax: 100,
        },
      };
    },
  };
}

function unverified(reason: string): MarketBenchmark {
  return {
    status: "unverified",
    source: null,
    low: null,
    high: null,
    reason,
  };
}

function callerRejection(supplied: MarketBenchmark): string {
  const informational =
    supplied.kind === "factory_msrp" ||
    supplied.sourceQuality === "buyer_reported" ||
    /buyer|msrp|nhtsa|window sticker|book value|competing quote/i.test(
      `${supplied.source ?? ""} ${supplied.provenance?.sourceId ?? ""} ${supplied.provenance?.reference ?? ""} ${supplied.reason ?? ""}`,
    );
  if (informational) {
    return "A buyer-reported input, factory MSRP, book value, competing quote, or NHTSA base price cannot verify market value.";
  }
  return "A caller-supplied valuation label, URL, or provenance was not used. Market value stays unverified unless a trusted server-side adapter produces it.";
}

function seal(adapter: ValuationSourceAdapter, raw: ValuationAdapterResult): MarketBenchmark | null {
  const sourceQuality: ValuationSourceQuality = raw.sourceQuality ?? adapter.sourceQuality;
  if (sourceQuality !== "licensed_independent" && sourceQuality !== "government_record") return null;
  if (!raw.reference?.trim() || !raw.retrievedAt || !raw.vehicleMatch) return null;
  if (!Number.isFinite(raw.low) || !Number.isFinite(raw.high)) return null;
  const benchmark: MarketBenchmark = {
    status: "verified",
    source: adapter.id,
    kind: "market_transaction",
    low: raw.low,
    high: raw.high,
    reason: raw.reason,
    sourceQuality,
    provenance: {
      sourceId: adapter.id,
      retrievedAt: raw.retrievedAt,
      reference: raw.reference.trim(),
    },
    vehicleMatch: raw.vehicleMatch,
  };
  const payload = payloadFromBenchmark(benchmark);
  if (!payload) return null;
  benchmark.provenance = {
    sourceId: payload.adapterId,
    retrievedAt: payload.retrievedAt,
    reference: payload.reference,
    attestation: signAttestation(payload),
  };
  markServerValuation(benchmark);
  return benchmark;
}

export interface TrustedBenchmarkQuery {
  quote: QuotedVehicle;
  submittedSalePrice?: number | null;
  submittedOutTheDoor?: number | null;
  /** Present only so it can be rejected. It is never the valuation. */
  callerSupplied?: MarketBenchmark | null;
  now?: Date;
  maxAgeMs?: number;
}

export function resolveTrustedBenchmark(input: TrustedBenchmarkQuery): MarketBenchmark {
  const nowMs = input.now?.getTime() ?? Date.now();
  const clock = { nowMs, maxAgeMs: input.maxAgeMs };
  let failure: string | null = input.callerSupplied ? callerRejection(input.callerSupplied) : null;

  if (adapters.length === 0) {
    return unverified(
      failure ??
        "No independent valuation source is configured. Submitted asking prices are not used as a market benchmark.",
    );
  }

  for (const adapter of adapters) {
    let raw: ValuationAdapterResult | null = null;
    try {
      raw = adapter.lookup({
        vehicle: input.quote,
        submittedSalePrice: input.submittedSalePrice ?? null,
        submittedOutTheDoor: input.submittedOutTheDoor ?? null,
      });
    } catch {
      failure = "A valuation adapter failed, so its result was not used.";
      continue;
    }
    if (!raw) continue;
    const sealed = seal(adapter, raw);
    if (!sealed) {
      failure = "A valuation adapter returned a result that could not be authenticated.";
      continue;
    }
    if (benchmarkCopiesSubmittedPrice(sealed, input.submittedSalePrice, input.submittedOutTheDoor)) {
      failure = "The valuation copied the submitted price, so it was not used.";
      continue;
    }
    const check = benchmarkQualifiesAsVerified(sealed, input.quote, clock);
    if (!check.ok) {
      failure = check.reason;
      continue;
    }
    return sealed;
  }

  return unverified(failure ?? "No trusted valuation adapter produced a price for this vehicle.");
}
