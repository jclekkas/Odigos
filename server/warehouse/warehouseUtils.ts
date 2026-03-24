import { db } from "../db";
import { sql } from "drizzle-orm";

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
 * Strips common corporate suffixes, lowercases, and collapses whitespace.
 */
export function normalizeDealerName(name: string): string {
  return name
    .toLowerCase()
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
