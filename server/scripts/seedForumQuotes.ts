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
 * All validation rules and row-tagging behavior live in
 * `server/services/seedService.ts` so the CLI and the admin web UI
 * stay in lockstep.
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

import { runAnalysis, type AnalyzeInput } from "../services/analyzeService";
import { storage } from "../storage";
import { normalizeSubmissionText, sha256Hex, refreshAllViews } from "../warehouse/warehouseUtils";
import {
  validateEntry,
  tagSeededRow,
  estimateEntryCostUsd,
  type SeedEntry,
} from "../services/seedService";

// ---------------------------------------------------------------------------
// Fixture loading + validation aggregation
// ---------------------------------------------------------------------------

interface AggregateValidationResult {
  approved: SeedEntry[];
  rejected: Array<{ entry: Partial<SeedEntry>; reason: string }>;
  missingStateCode: number;
}

function validateAll(fixtures: unknown[]): AggregateValidationResult {
  const approved: SeedEntry[] = [];
  const rejected: Array<{ entry: Partial<SeedEntry>; reason: string }> = [];
  let missingStateCode = 0;

  for (const raw of fixtures) {
    const entry = raw as Partial<SeedEntry>;
    const label = entry.sourceId ?? "(no sourceId)";

    const result = validateEntry(entry);
    if (!result.valid) {
      rejected.push({ entry, reason: `${label}: ${result.errors.join("; ")}` });
      continue;
    }

    if (!entry.stateCode) {
      missingStateCode++;
    }

    approved.push(entry as SeedEntry);
  }

  return { approved, rejected, missingStateCode };
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
  validation: AggregateValidationResult,
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
  const projectedCost = validation.approved.reduce((sum, e) => sum + estimateEntryCostUsd(e), 0);

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

    const estimate = estimateEntryCostUsd(entry);
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
