/**
 * Server-only proof that a valuation was produced in this process.
 *
 * The signing key is generated when the process starts. It is not a
 * valuation-provider API key, it is not read from a request, and it is not
 * embedded as a vendor credential. A caller cannot mint a matching signature.
 *
 * Identity is also held in memory. Copying a signed object out of a response
 * and sending it back creates a different object, so it is not trusted.
 */

import crypto from "node:crypto";

const attestationKey = crypto.randomBytes(32);
const serverValuations = new WeakSet<object>();

export const DEFAULT_VALUATION_MAX_AGE_MS = 72 * 60 * 60 * 1000;

export type AttestedSourceQuality = "licensed_independent" | "government_record";

export interface AttestationVehicle {
  year: number;
  make: string;
  model: string;
  trim: string;
  condition: "new" | "used";
  mileageMin: number;
  mileageMax: number;
}

export interface AttestationPayload {
  adapterId: string;
  sourceQuality: AttestedSourceQuality;
  low: number;
  high: number;
  retrievedAt: string;
  reference: string;
  vehicleMatch: AttestationVehicle;
}

export interface AttestableValuation {
  low: number | null;
  high: number | null;
  source?: string | null;
  reason?: string | null;
  sourceQuality?: AttestedSourceQuality | "buyer_reported" | "unspecified" | null;
  provenance?: {
    sourceId: string;
    retrievedAt: string;
    reference: string;
    attestation?: string;
  } | null;
  vehicleMatch?: AttestationVehicle | null;
}

const INFORMATIONAL_SOURCE =
  /nhtsa|base[-_\s]?price|window[-_\s]?sticker|\bmsrp\b|buyer[-_\s]?reported|buyer[-_\s]?comp|competing[-_\s]?quote|book[-_\s]?value/i;

function canonical(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value) ?? "null";
  if (Array.isArray(value)) return `[${value.map((item) => canonical(item)).join(",")}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonical(record[key])}`)
    .join(",")}}`;
}

export function isInformationalValuationClaim(...parts: Array<string | null | undefined>): boolean {
  return parts.some((part) => !!part && INFORMATIONAL_SOURCE.test(part));
}

export function markServerValuation(benchmark: object): void {
  serverValuations.add(benchmark);
}

export function isServerValuation(benchmark: object): boolean {
  return serverValuations.has(benchmark);
}

export function signAttestation(payload: AttestationPayload): string {
  return crypto.createHmac("sha256", attestationKey).update(canonical(payload)).digest("hex");
}

export function payloadFromBenchmark(benchmark: AttestableValuation): AttestationPayload | null {
  if (benchmark.low == null || benchmark.high == null) return null;
  if (benchmark.sourceQuality !== "licensed_independent" && benchmark.sourceQuality !== "government_record") return null;
  const provenance = benchmark.provenance;
  const match = benchmark.vehicleMatch;
  if (!provenance?.sourceId?.trim() || !provenance.retrievedAt || !provenance.reference?.trim() || !match) return null;
  if (match.condition !== "new" && match.condition !== "used") return null;
  return {
    adapterId: provenance.sourceId.trim(),
    sourceQuality: benchmark.sourceQuality,
    low: benchmark.low,
    high: benchmark.high,
    retrievedAt: provenance.retrievedAt,
    reference: provenance.reference.trim(),
    vehicleMatch: {
      year: match.year,
      make: match.make,
      model: match.model,
      trim: match.trim,
      condition: match.condition,
      mileageMin: match.mileageMin,
      mileageMax: match.mileageMax,
    },
  };
}

export function attestationIsAuthentic(payload: AttestationPayload, signature: string | null | undefined): boolean {
  if (!signature || !/^[0-9a-f]{64}$/i.test(signature)) return false;
  const expected = Buffer.from(signAttestation(payload), "hex");
  const actual = Buffer.from(signature, "hex");
  if (expected.length !== actual.length) return false;
  return crypto.timingSafeEqual(expected, actual);
}

/**
 * Hours come from server configuration (`ODIGOS_VALUATION_MAX_AGE_HOURS`).
 * A non-positive or non-numeric value keeps the default. An explicit
 * millisecond override is for the server call, not for a request body.
 */
export function valuationMaxAgeMs(override?: number | null, envHours?: string | null): number {
  if (override != null && Number.isFinite(override) && override > 0) return override;
  if (envHours != null && envHours.trim() !== "") {
    const hours = Number(envHours);
    if (Number.isFinite(hours) && hours > 0 && hours <= 24 * 366) return hours * 60 * 60 * 1000;
  }
  return DEFAULT_VALUATION_MAX_AGE_MS;
}

export function valuationFreshness(
  retrievedAt: string,
  nowMs: number,
  maxAgeMs: number,
): "fresh" | "stale" | "unusable" {
  const parsed = Date.parse(retrievedAt);
  if (!Number.isFinite(parsed)) return "unusable";
  if (parsed < Date.parse("1990-01-01T00:00:00Z")) return "unusable";
  if (parsed > nowMs + 5 * 60 * 1000) return "unusable";
  if (nowMs - parsed > maxAgeMs) return "stale";
  return "fresh";
}
