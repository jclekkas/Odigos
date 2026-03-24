/**
 * CLI entry point for the PII cleanup job.
 *
 * Usage:
 *   npm run pii:cleanup          — live run (clears expired PII from DB)
 *   npm run pii:cleanup:dry      — dry-run (prints what WOULD be cleared, no DB changes)
 *   npx tsx server/scripts/runPiiCleanup.ts --dry-run
 *
 * Cutoff rule: submitted_at < (NOW - 90 days), strict less-than.
 */

import { runPiiCleanup, PII_RETENTION_DAYS } from "../jobs/piiCleanup";

const dryRun = process.argv.includes("--dry-run");

async function main(): Promise<void> {
  console.log("=".repeat(60));
  console.log(`PII Cleanup — ${dryRun ? "DRY RUN (no changes)" : "LIVE RUN"}`);
  console.log(`Retention window: ${PII_RETENTION_DAYS} days`);
  console.log(`Cutoff operator:  submitted_at < cutoff (strict less-than)`);
  console.log("=".repeat(60));

  const result = await runPiiCleanup({ dryRun, batchSize: 500 });

  console.log("\nCutoff timestamp:", result.cutoffAt.toISOString());
  console.log("Mode:            ", dryRun ? "DRY RUN" : "LIVE");
  console.log("Duration:        ", `${result.durationMs}ms`);
  console.log("\nPer-table summary:");
  console.log("-".repeat(60));

  for (const t of result.tables) {
    const errorStr = t.error ? `  !! ERROR: ${t.error}` : "";
    console.log(
      `  ${t.table.padEnd(30)} action=${t.action}` +
      `  scanned=${t.scannedCount}  eligible=${t.eligibleCount}` +
      `  cleared=${t.clearedCount}  skipped=${t.skippedCount}${errorStr}`,
    );
  }

  console.log("-".repeat(60));
  console.log(`  total cleared: ${result.totalCleared}`);

  const hasErrors = result.tables.some((t) => t.error);
  if (hasErrors) {
    console.error("\nWARNING: One or more tables encountered errors. Check logs above.");
    process.exit(1);
  }

  console.log("\nDone.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal error running PII cleanup:", err);
  process.exit(1);
});
