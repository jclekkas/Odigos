import { db } from "../db.js";
import { sql } from "drizzle-orm";
import { createHash } from "crypto";
import type { Fee } from "../../shared/schema.js";

// ---------------------------------------------------------------------------
// Fee name normalization — canonical mapping
// ---------------------------------------------------------------------------
// Maps common fee-name variants to a single canonical label so warehouse
// aggregates collapse correctly. Order matters — first match wins.
// ---------------------------------------------------------------------------
const FEE_CANONICAL_MAP: [RegExp, string][] = [
  // Doc / processing fees
  [/doc(umentation|ument|umentary)?\s*fee/i, "doc fee"],
  [/admin(istrative)?\s*fee/i, "admin fee"],
  [/processing\s*fee/i, "processing fee"],
  [/dealer\s*fee/i, "dealer fee"],
  // Market adjustments
  [/market\s*(adjust|value\s*adjust)|additional\s*dealer\s*markup|dealer\s*markup|\badm\b|\bmarkup\b/i, "market adjustment"],
  // Protection / appearance packages
  [/appearance\s*(package|protection)/i, "appearance package"],
  [/protection\s*(package|pkg|plan)/i, "protection package"],
  [/paint\s*protection/i, "paint protection"],
  [/fabric\s*(protection|guard)/i, "fabric protection"],
  [/interior\s*(protection|guard)/i, "fabric protection"],
  [/ceramic\s*(coat|coating)?/i, "ceramic coating"],
  [/clear\s*coat/i, "clear coat"],
  [/undercoat(ing)?/i, "undercoating"],
  // Individual add-ons
  [/nitrogen|n2\s*(fill|tire)/i, "nitrogen fill"],
  [/vin\s*etch(ing)?/i, "vin etching"],
  [/anti[- ]?theft/i, "anti-theft package"],
  [/window\s*tint(ing)?/i, "window tint"],
  [/wheel\s*lock/i, "wheel locks"],
  [/pinstripe|pin\s*stripe/i, "pinstriping"],
  // Insurance / warranty
  [/gap\s*(insurance|waiver|coverage)/i, "gap insurance"],
  [/extended\s*(warranty|service|coverage)|service\s*contract/i, "extended warranty"],
  // Dealer overhead fees
  [/dealer\s*prep/i, "dealer prep"],
  [/pre[- ]?delivery\s*(inspection|service)/i, "pre-delivery inspection"],
  [/reconditioning\s*fee/i, "reconditioning fee"],
  [/lot\s*fee/i, "lot fee"],
  [/delivery\s*fee/i, "delivery fee"],
  // Dealer add-ons (catch-all for dealer accessories/add-ons)
  [/dealer\s*(add[- ]?on|accessor)/i, "dealer add-ons"],
];

/**
 * Normalize a single fee name to its canonical form.
 * Returns the first matching canonical label, or the lowercased/trimmed input
 * if no pattern matches (graceful passthrough).
 */
export function normalizeFeeName(raw: string): string {
  const lower = raw.toLowerCase().trim();
  if (!lower) return lower;
  for (const [pattern, canonical] of FEE_CANONICAL_MAP) {
    if (pattern.test(lower)) return canonical;
  }
  return lower;
}

/**
 * Normalize an array of Fee objects to canonical fee name strings.
 * Deduplicates after canonicalization via Set.
 */
export function normalizeFeeNames(fees: Fee[]): string[] {
  return Array.from(new Set(fees.map((f) => normalizeFeeName(f.name))));
}

// Valid US state codes (plus DC) that are seeded in core.states
const US_STATE_CODES = new Set([
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY","DC",
]);

/**
 * Returns the 2-letter state code if it's a valid seeded US state, otherwise null.
 * This prevents FK violations against core.states for unknown/synthetic codes.
 */
export function validateStateCode(code: string | null | undefined): string | null {
  if (!code) return null;
  const upper = code.toUpperCase().slice(0, 2);
  return US_STATE_CODES.has(upper) ? upper : null;
}

/**
 * Normalize a dealer name for deduplication matching.
 * Strips possessives, common corporate suffixes, lowercases, and collapses whitespace.
 */
export function normalizeDealerName(name: string): string {
  return name
    .toLowerCase()
    .replace(/['\u2018\u2019]s\b/g, "")     // Strip possessive 's (straight + smart quotes)
    .replace(/['\u2018\u2019]/g, "")          // Strip remaining apostrophes
    .replace(/\b(llc|inc|corp|corporation|motors|automotive|auto|group|ltd|co|dealership|dealer|sales|of|the)\b/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Refresh all three warehouse materialized views.
 * Called after any bulk ingestion run.
 */
export async function refreshAllViews(): Promise<void> {
  await db.execute(sql`REFRESH MATERIALIZED VIEW core.platform_metrics`);
  await db.execute(sql`REFRESH MATERIALIZED VIEW core.national_stats`);
  await db.execute(sql`REFRESH MATERIALIZED VIEW core.state_stats`);
  console.log("[warehouse] Materialized views refreshed.");
}

/**
 * Normalize raw submission text for content-hash deduplication.
 * Rules: CRLF → LF, trim outer whitespace.
 * Does NOT lowercase or collapse internal whitespace.
 */
export function normalizeSubmissionText(raw: string): string {
  return raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
}

/**
 * Compute SHA-256 hex digest of the input string.
 */
export function sha256Hex(input: string): string {
  return createHash("sha256").update(input, "utf8").digest("hex");
}

/**
 * Returns a Promise that resolves after `ms` milliseconds.
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Returns the backoff delay in milliseconds for a given attempt number (1-indexed).
 * attempt 1 → 0ms (immediate)
 * attempt 2 → ~100ms
 * attempt 3 → ~300ms
 */
export function getBackoffMs(attempt: number): number {
  if (attempt <= 1) return 0;
  if (attempt === 2) return 100;
  return 300;
}

/**
 * Normalize a fee/line-item name for pattern matching and deduplication.
 * Maps common synonyms, lowercases, strips noise words, collapses whitespace.
 */
export function normalizeLineItemName(name: string): string {
  let n = name.toLowerCase().trim();
  // Map common synonyms to canonical names
  n = n.replace(/\bdocument(?:ation)?\s*fee\b/g, "doc fee");
  n = n.replace(/\bdealer\s*(?:prep|preparation)\b/g, "dealer prep");
  n = n.replace(/\bvin\s*etch(?:ing)?\b/g, "vin etch");
  n = n.replace(/\bfabric\s*(?:guard|protection)\b/g, "fabric protection");
  n = n.replace(/\bpaint\s*(?:guard|protection|sealant)\b/g, "paint protection");
  n = n.replace(/\bnitrogen\s*(?:fill|tire)s?\b/g, "nitrogen fill");
  n = n.replace(/\b(?:anti[- ]?theft|lo[- ]?jack)\b/g, "anti-theft");
  n = n.replace(/\bmarket\s*adjust(?:ment)?\b/g, "market adjustment");
  n = n.replace(/\b(?:addendum|adm)\b/g, "market adjustment");
  // Strip noise
  n = n.replace(/[^a-z0-9\s-]/g, " ");
  n = n.replace(/\s+/g, " ").trim();
  return n;
}

/**
 * Categorize a normalized line item name into a bucket.
 */
export function categorizeLineItem(normalizedName: string): string {
  if (/doc fee/.test(normalizedName)) return "doc_fee";
  if (/market adjustment/.test(normalizedName)) return "market_adjustment";
  if (/(?:sales|state|county|city)\s*tax/.test(normalizedName)) return "tax";
  if (/(?:title|registration|license|plate|tag|emission|smog)/.test(normalizedName)) return "government";
  if (/(?:protection|nitrogen|etch|ceramic|fabric|undercoat|pinstripe|dealer prep|anti-theft|gap|warranty|maintenance)/.test(normalizedName)) return "addon";
  return "other";
}

// ---------------------------------------------------------------------------
// Financial sanity validation
// ---------------------------------------------------------------------------

export interface SanityFlag {
  field: string;
  value: number;
  min?: number;
  max?: number;
  reason: "below_min" | "above_max" | "not_finite";
}

interface FinancialBoundsInput {
  vehiclePrice?: number | null;
  tradeInValue?: number | null;
  docFee?: number | null;
  dealerAddonCost?: number | null;
  totalFees?: number | null;
}

const FINANCIAL_BOUNDS: Record<string, { min: number; max: number }> = {
  vehiclePrice: { min: 500, max: 500000 },
  tradeInValue: { min: 0, max: 500000 },
  docFee: { min: 0, max: 10000 },
  dealerAddonCost: { min: 0, max: 100000 },
  totalFees: { min: 0, max: 10000 },
};

/**
 * Validates financial field values against plausibility bounds.
 * Missing values (null/undefined) produce no flag.
 * NaN or Infinity produce a "not_finite" flag.
 * Out-of-range values produce "below_min" or "above_max" flags.
 */
export function validateFinancialBounds(input: FinancialBoundsInput): SanityFlag[] {
  const flags: SanityFlag[] = [];
  for (const [field, bounds] of Object.entries(FINANCIAL_BOUNDS)) {
    const value = (input as Record<string, number | null | undefined>)[field];
    if (value == null) continue;
    if (!Number.isFinite(value)) {
      flags.push({ field, value, reason: "not_finite" });
      continue;
    }
    if (value < bounds.min) {
      flags.push({ field, value, min: bounds.min, reason: "below_min" });
    } else if (value > bounds.max) {
      flags.push({ field, value, max: bounds.max, reason: "above_max" });
    }
  }
  return flags;
}

/**
 * Safely serialize a warehouse write payload for DLQ storage.
 * Strips any raw document text to avoid PII leakage.
 */
export function safeSerializePayload(payload: {
  dealerSubmissionId: string;
  stateCode: string | null;
  dealScore?: string | null;
  verdict?: string | null;
}): Record<string, unknown> {
  return {
    dealerSubmissionId: payload.dealerSubmissionId,
    stateCode: payload.stateCode,
    dealScore: payload.dealScore ?? null,
    verdict: payload.verdict ?? null,
  };
}

/**
 * Extract a string message from an unknown error value.
 */
export function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}
