import { db } from "../db";
import { sql } from "drizzle-orm";

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
