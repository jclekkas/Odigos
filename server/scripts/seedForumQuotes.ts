/**
 * Cold-start data flywheel — curated forum quote seeding script.
 *
 * Reads a JSON fixture of dealer quotes that have been manually curated
 * from public car-buying forums (factual numbers; dealer-voice prose is
 * reconstructed), runs each entry through the existing `runAnalysis()`
 * pipeline, and then post-patches the resulting rows in both
 * `dealer_submissions` (source of truth) and `core.listings` (analytics)
 * to tag them as seeded / exclude-from-metrics.
 *
 * Modes:
 *   (none)          — implicit --dry-run, no writes
 *   --validate      — validation only, exit non-zero if any row fails
 *   --dry-run       — explicit dry-run
 *   --commit        — run analysis and persist; requires --batch-id
 *   --limit N       — process only first N entries
 *   --max-cost-usd  — abort if projected spend exceeds N (default $2)
 *   --batch-id ID   — required with --commit; tags the batch
 *
 * Usage:
 *   npm run seed:forum                    # dry-run
 *   npm run seed:forum -- --validate      # validation only
 *   npm run seed:forum -- --commit --batch-id seed-2026-04-08-a
 *
 * This script intentionally bypasses the HTTP rate limiter but still
 * respects the in-process circuit breaker in analyzeService.ts. It does
 * NOT bypass PII redaction (redactPII runs inside runAnalysis).
 */

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { runAnalysis, type AnalyzeInput } from "../services/analyzeService.js";
import { storage } from "../storage.js";
import { db, getEnvironmentLabel } from "../db.js";
import { sql } from "drizzle-orm";
import { normalizeSubmissionText, sha256Hex, refreshAllViews } from "../warehouse/warehouseUtils.js";

// ---------------------------------------------------------------------------
// Fixture shape + validation
// ---------------------------------------------------------------------------

interface FixtureEntry {
  sourceId: string;
  reviewStatus: string;
  vehicle: string;
  zipCode?: string;
  stateCode?: string;
  condition: "unknown" | "new" | "used";
  purchaseType: "unknown" | "cash" | "finance" | "lease";
  msrp?: number;
  sellingPrice?: number;
  docFee?: number;
  otdPrice?: number;
  dealerText: string;
}

interface ValidationResult {
  approved: FixtureEntry[];
  rejected: Array<{ entry: Partial<FixtureEntry>; reason: string }>;
  missingStateCode: number;
}

function validateAll(fixtures: unknown[]): ValidationResult {
  const approved: FixtureEntry[] = [];
  const rejected: Array<{ entry: Partial<FixtureEntry>; reason: string }> = [];
  let missingStateCode = 0;

  for (const raw of fixtures) {
    const entry = raw as Partial<FixtureEntry>;
    const label = entry.sourceId ?? "(no sourceId)";

    if (entry.reviewStatus !== "approved") {
      rejected.push({ entry, reason: `${label}: reviewStatus must be "approved"` });
      continue;
    }
    if (!entry.dealerText || typeof entry.dealerText !== "string") {
      rejected.push({ entry, reason: `${label}: missing dealerText` });
      continue;
    }
    if (!entry.condition) {
      rejected.push({ entry, reason: `${label}: missing condition` });
      continue;
    }
    if (!entry.purchaseType) {
      rejected.push({ entry, reason: `${label}: missing purchaseType` });
      continue;
    }

    const hasAnyPricing =
      entry.msrp != null ||
      entry.sellingPrice != null ||
      entry.docFee != null ||
      entry.otdPrice != null;
    if (!hasAnyPricing) {
      rejected.push({ entry, reason: `${label}: must include at least one of msrp/sellingPrice/docFee/otdPrice` });
      continue;
    }

    // Numeric consistency — HARD REJECT
    const numericFields: Array<[string, number | undefined]> = [
      ["msrp", entry.msrp],
      ["sellingPrice", entry.sellingPrice],
      ["docFee", entry.docFee],
      ["otdPrice", entry.otdPrice],
    ];
    let consistencyReason: string | null = null;
    for (const [name, val] of numericFields) {
      if (val != null && (!Number.isFinite(val) || val < 0)) {
        consistencyReason = `${label}: ${name} is negative or non-finite`;
        break;
      }
    }
    if (!consistencyReason && entry.otdPrice != null && entry.sellingPrice != null && entry.otdPrice < entry.sellingPrice) {
      consistencyReason = `${label}: otdPrice ($${entry.otdPrice}) < sellingPrice ($${entry.sellingPrice})`;
    }
    if (!consistencyReason && entry.docFee != null && entry.otdPrice != null && entry.docFee > entry.otdPrice) {
      consistencyReason = `${label}: docFee ($${entry.docFee}) > otdPrice ($${entry.otdPrice})`;
    }
    if (!consistencyReason && entry.sellingPrice != null && entry.msrp != null && entry.sellingPrice > entry.msrp * 2) {
      consistencyReason = `${label}: sellingPrice ($${entry.sellingPrice}) > 2x MSRP ($${entry.msrp})`;
    }
    if (!consistencyReason && entry.docFee != null && entry.docFee > 5000) {
      consistencyReason = `${label}: docFee ($${entry.docFee}) exceeds sanity bound $5000`;
    }
    if (consistencyReason) {
      rejected.push({ entry, reason: consistencyReason });
      continue;
    }

    if (!entry.stateCode) {
      missingStateCode++;
    }

    approved.push(entry as FixtureEntry);
  }

  return { approved, rejected, missingStateCode };
}

// ---------------------------------------------------------------------------
// Cost estimation (rough — gpt-4o-class pricing)
// ---------------------------------------------------------------------------

function estimateCost(entry: FixtureEntry): number {
  // Rough budget: each seeded row runs one full runAnalysis() call which
  // includes prompt + completion tokens. Budget conservatively at $0.04/row.
  const textLen = entry.dealerText.length;
  const base = 0.02;
  const perChar = 0.00003;
  return base + textLen * perChar;
}

// ---------------------------------------------------------------------------
// CLI arg parsing
// ---------------------------------------------------------------------------

type Mode = "dry-run" | "validate" | "commit";

interface Args {
  mode: Mode;
  limit: number | null;
  maxCostUsd: number;
  batchId: string | null;
  fixturePath: string;
}

function parseArgs(argv: string[]): Args {
  const has = (flag: string) => argv.includes(flag);
  const getVal = (flag: string): string | null => {
    const idx = argv.indexOf(flag);
    if (idx < 0 || idx === argv.length - 1) return null;
    return argv[idx + 1];
  };

  let mode: Mode = "dry-run";
  if (has("--commit")) mode = "commit";
  else if (has("--validate")) mode = "validate";
  else if (has("--dry-run")) mode = "dry-run";

  const limitStr = getVal("--limit");
  const limit = limitStr != null ? Number(limitStr) : null;
  const maxCostStr = getVal("--max-cost-usd");
  const maxCostUsd = maxCostStr != null ? Number(maxCostStr) : 2;
  const batchId = getVal("--batch-id");

  const scriptDir = dirname(fileURLToPath(import.meta.url));
  const fixturePath = getVal("--fixture") ?? resolve(scriptDir, "seed-fixtures", "forum-quotes.json");

  return { mode, limit, maxCostUsd, batchId, fixturePath };
}

// ---------------------------------------------------------------------------
// Reports
// ---------------------------------------------------------------------------

function printValidationReport(
  args: Args,
  total: number,
  validation: ValidationResult,
  projectedCost: number,
): void {
  const approvedCount = validation.approved.length;
  console.log("");
  console.log(args.mode === "dry-run"
    ? "DRY RUN (pass --commit to actually analyze)"
    : "VALIDATION");
  console.log(`Fixture: ${args.fixturePath}`);
  console.log(`  Total loaded:           ${total}`);
  console.log(`  Approved:               ${approvedCount}`);
  console.log(`  Rejected:               ${validation.rejected.length}`);
  console.log(`  Missing stateCode:      ${validation.missingStateCode}`);
  console.log(`  Projected cost (gpt-4o): ~$${projectedCost.toFixed(2)}`);
  if (validation.rejected.length > 0) {
    console.log("");
    console.log("  Rejection reasons:");
    for (const r of validation.rejected) {
      console.log(`    - ${r.reason}`);
    }
  }
  console.log("");
}

// ---------------------------------------------------------------------------
// Post-commit patching: tag both dealer_submissions AND core.listings
// ---------------------------------------------------------------------------

/**
 * After a seeded row lands in `dealer_submissions` + `core.listings`, patch
 * both tables so the row is correctly excluded from funnel metrics and
 * dealer-level aggregates, while still contributing to state-level
 * aggregates (via `core.state_stats`).
 *
 * Actions:
 *  1. `storage.markAsSeed()` — sets is_seeded/exclude_* flags on dealer_submissions
 *  2. Updates core.listings for the matching dealer_submission_id:
 *     - ingestion_source = 'seed' (already an allowed value per CHECK constraint)
 *     - counts_toward_real_deals = false (excludes from platform_metrics)
 *  3. Decrements core.dealers.listing_count for the dealer row the writer
 *     associated this listing with, so dealer-level listing counts reflect
 *     only real user submissions. (marketContext.getDealerStats reads this
 *     counter directly.)
 */
async function tagSeededRow(
  dealerSubmissionId: string,
  batchId: string,
): Promise<void> {
  await storage.markAsSeed(dealerSubmissionId, { seedBatchId: batchId });

  const listingRows = await db.execute<{ id: string; dealer_id: string | null }>(sql`
    SELECT id, dealer_id
    FROM core.listings
    WHERE dealer_submission_id = ${dealerSubmissionId}
    LIMIT 1
  `);
  const listingRow = listingRows.rows?.[0];
  if (!listingRow) {
    console.warn(`[seed] No core.listings row found for submission ${dealerSubmissionId} — patching skipped.`);
    return;
  }

  await db.execute(sql`
    UPDATE core.listings
    SET ingestion_source = 'seed',
        counts_toward_real_deals = false
    WHERE id = ${listingRow.id}
  `);

  if (listingRow.dealer_id) {
    await db.execute(sql`
      UPDATE core.dealers
      SET listing_count = GREATEST(listing_count - 1, 0)
      WHERE id = ${listingRow.dealer_id}
    `);
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function loadFixtures(path: string): unknown[] {
  const raw = readFileSync(path, "utf8");
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error(`Fixture at ${path} is not a JSON array`);
  }
  return parsed;
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const env = getEnvironmentLabel();

  console.log(`[seed:forum] Environment: ${env}`);

  if (args.mode === "commit" && env === "production" && !process.argv.includes("--i-know-this-is-production")) {
    console.error(
      "ERROR: Refusing to commit seed data to production database.\n" +
      "  If you really mean to do this, add the --i-know-this-is-production flag.",
    );
    process.exit(1);
  }

  if (args.mode === "commit" && !args.batchId) {
    console.error("ERROR: --commit requires --batch-id <id>");
    process.exit(1);
  }

  let fixtures: unknown[];
  try {
    fixtures = loadFixtures(args.fixturePath);
  } catch (err) {
    console.error(`Failed to load fixture: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }

  const validation = validateAll(fixtures);
  const projectedCost = validation.approved.reduce((sum, e) => sum + estimateCost(e), 0);

  if (args.mode === "validate") {
    printValidationReport(args, fixtures.length, validation, projectedCost);
    if (validation.rejected.length > 0) {
      console.error(`Validation failed: ${validation.rejected.length} row(s) rejected.`);
      process.exit(1);
    }
    console.log("Validation OK.");
    process.exit(0);
  }

  if (args.mode === "dry-run") {
    printValidationReport(args, fixtures.length, validation, projectedCost);
    process.exit(0);
  }

  // --commit
  printValidationReport(args, fixtures.length, validation, projectedCost);
  const batchId = args.batchId!;
  console.log(`COMMIT mode — batch=${batchId}, maxCost=$${args.maxCostUsd.toFixed(2)}`);
  console.log("");

  let processed = 0;
  let skipped = 0;
  let failed = 0;
  let totalCostUsd = 0;

  const slice = args.limit != null ? validation.approved.slice(0, args.limit) : validation.approved;

  for (const entry of slice) {
    const hash = sha256Hex(normalizeSubmissionText(entry.dealerText));
    const existing = await storage.findByContentHash(hash);
    if (existing) {
      skipped++;
      console.log(`  [skip] ${entry.sourceId} — duplicate contentHash`);
      continue;
    }

    const estimate = estimateCost(entry);
    if (totalCostUsd + estimate > args.maxCostUsd) {
      console.error(`  [abort] cost cap exceeded: ${(totalCostUsd + estimate).toFixed(2)} > ${args.maxCostUsd}`);
      break;
    }

    try {
      const input: AnalyzeInput = {
        dealerText: entry.dealerText,
        vehicle: entry.vehicle,
        zipCode: entry.zipCode,
        condition: entry.condition,
        purchaseType: entry.purchaseType,
        source: "paste",
        language: "en",
      };
      const result = await runAnalysis(input);
      if (!result.listingId) {
        failed++;
        console.error(`  [fail] ${entry.sourceId} — runAnalysis returned no listingId`);
        continue;
      }

      // Give the warehouse writer a brief window to finish its insert
      // into core.listings before we patch it. The writer runs via
      // setImmediate inside ingestor.ts, so a short delay is sufficient.
      await new Promise((r) => setTimeout(r, 400));

      await tagSeededRow(result.listingId, batchId);
      processed++;
      totalCostUsd += estimate;
      console.log(`  [ok]   ${entry.sourceId} — listingId=${result.listingId}`);
    } catch (err) {
      failed++;
      console.error(`  [fail] ${entry.sourceId} — ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  console.log("");
  console.log(`Summary: processed=${processed} skipped=${skipped} failed=${failed} rejected=${validation.rejected.length} cost=$${totalCostUsd.toFixed(2)}`);

  if (processed > 0) {
    try {
      await refreshAllViews();
      const summary = await storage.getStateAggregateSummary();
      console.log("");
      console.log("State aggregates after seeding:");
      for (const row of summary) {
        const avg = row.avgDocFee != null ? `$${row.avgDocFee.toFixed(2)}` : "n/a";
        console.log(`  ${row.stateCode} → avgDocFee: ${avg}, count: ${row.count}`);
      }
    } catch (err) {
      console.error(`Post-commit summary failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  process.exit(failed > 0 && processed === 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("Fatal error in seedForumQuotes:", err);
  process.exit(1);
});
