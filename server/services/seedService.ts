/**
 * Shared seed service — single source of truth for the cold-start data
 * flywheel pipeline. Both the CLI script (`seedForumQuotes.ts`) and the
 * admin web UI (`/api/admin/seed/*`) go through this module so the
 * validation rules, row-tagging behavior, and cost accounting stay in
 * lockstep.
 *
 * Rules live here in one place:
 *  - validateEntry(): hard-reject rules (required fields, numeric sanity)
 *  - tagSeededRow():  post-analysis patching of dealer_submissions and
 *                     core.listings, plus dealer listing_count decrement
 *  - processSeedEntry(): full end-to-end (validate → dedup → runAnalysis
 *                     → tag → return). Used by the web UI for one-shot
 *                     submissions. The CLI script composes the same
 *                     primitives directly so it can print per-entry
 *                     progress lines.
 */

import { db } from "../db";
import { sql } from "drizzle-orm";
import { storage } from "../storage";
import { runAnalysis, type AnalyzeInput } from "./analyzeService";
import { normalizeSubmissionText, sha256Hex, refreshAllViews } from "../warehouse/warehouseUtils";
import type { AnalysisResponse } from "@shared/schema";

// ---------------------------------------------------------------------------
// Entry shape + validation
// ---------------------------------------------------------------------------

export interface SeedEntry {
  sourceId: string;
  reviewStatus: string;
  vehicle?: string;
  zipCode?: string;
  stateCode?: string;
  condition: "unknown" | "new" | "used";
  purchaseType: "unknown" | "cash" | "finance" | "lease";
  msrp?: number | null;
  sellingPrice?: number | null;
  docFee?: number | null;
  otdPrice?: number | null;
  dealerText: string;
}

export interface ValidationError {
  sourceId: string;
  reason: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Hard-rejection validation for a single seed entry. Returns `valid:true`
 * with an empty `errors` array on success, or `valid:false` with one or
 * more human-readable reasons on failure.
 *
 * Rules enforced:
 *  - reviewStatus === "approved"
 *  - condition, purchaseType, dealerText present
 *  - at least one of msrp/sellingPrice/docFee/otdPrice provided
 *  - no negative numbers; all numbers finite
 *  - otdPrice >= sellingPrice (OTD must include the selling price)
 *  - docFee <= otdPrice
 *  - sellingPrice <= 2 * msrp (sanity bound)
 *  - docFee <= $5,000 (sanity bound)
 */
export function validateEntry(entry: Partial<SeedEntry>): ValidationResult {
  const errors: string[] = [];

  if (entry.reviewStatus !== "approved") {
    errors.push('reviewStatus must be "approved"');
  }
  if (!entry.dealerText || typeof entry.dealerText !== "string" || !entry.dealerText.trim()) {
    errors.push("dealerText is required");
  }
  if (!entry.condition) {
    errors.push("condition is required");
  }
  if (!entry.purchaseType) {
    errors.push("purchaseType is required");
  }

  const hasAnyPricing =
    entry.msrp != null ||
    entry.sellingPrice != null ||
    entry.docFee != null ||
    entry.otdPrice != null;
  if (!hasAnyPricing) {
    errors.push("at least one of msrp/sellingPrice/docFee/otdPrice is required");
  }

  const numericFields: Array<[string, number | null | undefined]> = [
    ["msrp", entry.msrp],
    ["sellingPrice", entry.sellingPrice],
    ["docFee", entry.docFee],
    ["otdPrice", entry.otdPrice],
  ];
  for (const [name, val] of numericFields) {
    if (val != null && (!Number.isFinite(val) || val < 0)) {
      errors.push(`${name} is negative or non-finite`);
    }
  }

  if (
    entry.otdPrice != null &&
    entry.sellingPrice != null &&
    Number.isFinite(entry.otdPrice) &&
    Number.isFinite(entry.sellingPrice) &&
    entry.otdPrice < entry.sellingPrice
  ) {
    errors.push(`otdPrice ($${entry.otdPrice}) < sellingPrice ($${entry.sellingPrice})`);
  }

  if (
    entry.docFee != null &&
    entry.otdPrice != null &&
    Number.isFinite(entry.docFee) &&
    Number.isFinite(entry.otdPrice) &&
    entry.docFee > entry.otdPrice
  ) {
    errors.push(`docFee ($${entry.docFee}) > otdPrice ($${entry.otdPrice})`);
  }

  if (
    entry.sellingPrice != null &&
    entry.msrp != null &&
    Number.isFinite(entry.sellingPrice) &&
    Number.isFinite(entry.msrp) &&
    entry.sellingPrice > entry.msrp * 2
  ) {
    errors.push(`sellingPrice ($${entry.sellingPrice}) > 2x MSRP ($${entry.msrp})`);
  }

  if (entry.docFee != null && Number.isFinite(entry.docFee) && entry.docFee > 5000) {
    errors.push(`docFee ($${entry.docFee}) exceeds sanity bound $5000`);
  }

  return { valid: errors.length === 0, errors };
}

// ---------------------------------------------------------------------------
// Row tagging — patches dealer_submissions + core.listings + decrements
//                  core.dealers.listing_count
// ---------------------------------------------------------------------------

/**
 * After a seeded row lands in `dealer_submissions` + `core.listings`, patch
 * both tables so the row is correctly excluded from funnel metrics and
 * dealer-level aggregates, while still contributing to state-level
 * aggregates (via `core.state_stats`).
 *
 * Actions:
 *   1. `storage.markAsSeed()` — sets is_seeded/exclude_* flags on dealer_submissions
 *   2. Updates core.listings for the matching dealer_submission_id:
 *      - ingestion_source = 'seed' (already allowed by CHECK constraint)
 *      - counts_toward_real_deals = false (excludes from platform_metrics)
 *   3. Decrements core.dealers.listing_count for the dealer row the writer
 *      associated this listing with, so dealer-level listing counts reflect
 *      only real user submissions. (marketContext.getDealerStats reads this
 *      counter directly.)
 */
export async function tagSeededRow(
  dealerSubmissionId: string,
  batchId: string,
): Promise<{ patched: boolean; coreListingId: string | null; decrementedDealerId: string | null }> {
  await storage.markAsSeed(dealerSubmissionId, { seedBatchId: batchId });

  const listingRows = await db.execute<{ id: string; dealer_id: string | null }>(sql`
    SELECT id, dealer_id
    FROM core.listings
    WHERE dealer_submission_id = ${dealerSubmissionId}
    LIMIT 1
  `);
  const listingRow = listingRows.rows?.[0];
  if (!listingRow) {
    return { patched: false, coreListingId: null, decrementedDealerId: null };
  }

  await db.execute(sql`
    UPDATE core.listings
    SET ingestion_source = 'seed',
        counts_toward_real_deals = false
    WHERE id = ${listingRow.id}
  `);

  let decrementedDealerId: string | null = null;
  if (listingRow.dealer_id) {
    await db.execute(sql`
      UPDATE core.dealers
      SET listing_count = GREATEST(listing_count - 1, 0)
      WHERE id = ${listingRow.dealer_id}
    `);
    decrementedDealerId = listingRow.dealer_id;
  }

  return { patched: true, coreListingId: listingRow.id, decrementedDealerId };
}

// ---------------------------------------------------------------------------
// Cost estimation — rough, conservative
// ---------------------------------------------------------------------------

/**
 * Rough per-entry cost estimate for gpt-4o-class pricing. Deliberately
 * conservative (over-estimates) so the cost cap trips early rather than
 * late. A typical entry is ~$0.02–$0.04.
 */
export function estimateEntryCostUsd(entry: Pick<SeedEntry, "dealerText">): number {
  const base = 0.02;
  const perChar = 0.00003;
  return base + (entry.dealerText?.length ?? 0) * perChar;
}

// ---------------------------------------------------------------------------
// processSeedEntry — one-shot path used by the admin web UI
// ---------------------------------------------------------------------------

export interface ProcessSeedOptions {
  entry: SeedEntry;
  batchId: string;
  maxCostUsd: number;
  refreshViewsAfter: boolean;
}

export type ProcessSeedOutcome =
  | {
      status: "validation_failed";
      errors: string[];
    }
  | {
      status: "duplicate";
      existingId: string;
    }
  | {
      status: "cost_capped";
      projectedCostUsd: number;
      maxCostUsd: number;
    }
  | {
      status: "analysis_failed";
      error: string;
    }
  | {
      status: "committed";
      listingId: string;
      analysis: AnalysisResponse & { listingId?: string };
      costUsd: number;
      coreListingId: string | null;
    };

/**
 * End-to-end pipeline for a single seed entry submitted via the web UI.
 * The CLI script does NOT use this helper directly — it runs the same
 * primitives (validateEntry, findByContentHash, runAnalysis, tagSeededRow)
 * inline so it can print per-entry progress and cost accumulation.
 */
export async function processSeedEntry(opts: ProcessSeedOptions): Promise<ProcessSeedOutcome> {
  const { entry, batchId, maxCostUsd, refreshViewsAfter } = opts;

  const validation = validateEntry(entry);
  if (!validation.valid) {
    return { status: "validation_failed", errors: validation.errors };
  }

  const hash = sha256Hex(normalizeSubmissionText(entry.dealerText));
  const existing = await storage.findByContentHash(hash);
  if (existing) {
    return { status: "duplicate", existingId: existing.id };
  }

  const projectedCostUsd = estimateEntryCostUsd(entry);
  if (projectedCostUsd > maxCostUsd) {
    return { status: "cost_capped", projectedCostUsd, maxCostUsd };
  }

  const analyzeInput: AnalyzeInput = {
    dealerText: entry.dealerText,
    vehicle: entry.vehicle,
    zipCode: entry.zipCode,
    condition: entry.condition,
    purchaseType: entry.purchaseType,
    source: "paste",
    language: "en",
  };

  let listingId: string | null = null;
  let analysis: (AnalysisResponse & { listingId?: string }) | null = null;
  try {
    const result = await runAnalysis(analyzeInput);
    listingId = result.listingId;
    analysis = result.payload as AnalysisResponse & { listingId?: string };
  } catch (err) {
    return {
      status: "analysis_failed",
      error: err instanceof Error ? err.message : String(err),
    };
  }

  if (!listingId || !analysis) {
    return {
      status: "analysis_failed",
      error: "runAnalysis returned no listingId",
    };
  }

  // Give the ingestor's setImmediate handler a beat to finish writing
  // the matching row to core.listings before we patch it.
  await new Promise((r) => setTimeout(r, 400));

  const tagResult = await tagSeededRow(listingId, batchId);

  if (refreshViewsAfter) {
    try {
      await refreshAllViews();
    } catch {
      // Non-fatal — stats will catch up on the next scheduled refresh.
    }
  }

  return {
    status: "committed",
    listingId,
    analysis,
    costUsd: projectedCostUsd,
    coreListingId: tagResult.coreListingId,
  };
}
