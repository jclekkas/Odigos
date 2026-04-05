/**
 * CPI Cap Staleness Audit
 *
 * Scans state_fee_reference.json for CPI-indexed states and flags any
 * whose caps may need updating based on their next expected adjustment date.
 *
 * Usage:
 *   npx tsx server/scripts/auditCpiCaps.ts              — report only
 *   npx tsx server/scripts/auditCpiCaps.ts --days=30    — flag caps stale within 30 days (default: 60)
 *
 * Output: table of CPI-indexed states with staleness status.
 */

import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface CpiIndexing {
  isIndexed: boolean;
  baseAmount: number | null;
  baseYear: number | null;
  currentAmount: number;
  effectiveDate: string;
  frequency: "annual" | "biennial";
  indexType: string;
  nextExpectedDate: string | null;
}

interface StateEntry {
  name: string;
  abbreviation: string;
  docFeeCap: boolean;
  docFeeCapAmount: number | null;
  cpiIndexing?: CpiIndexing;
  lastVerified: string;
  confidence: string;
}

interface StateFeeReference {
  _metadata: { version: string; lastUpdated: string };
  states: Record<string, StateEntry>;
  _summary: Record<string, unknown>;
}

function parseDaysArg(): number {
  const arg = process.argv.find((a) => a.startsWith("--days="));
  if (arg) {
    const val = parseInt(arg.split("=")[1], 10);
    if (!isNaN(val) && val > 0) return val;
  }
  return 60;
}

function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

async function main(): Promise<void> {
  const thresholdDays = parseDaysArg();
  const now = new Date();

  const refPath = path.resolve(__dirname, "../state_fee_reference.json");
  const raw = fs.readFileSync(refPath, "utf-8");
  const data: StateFeeReference = JSON.parse(raw);

  console.log("=".repeat(70));
  console.log(`CPI Cap Staleness Audit`);
  console.log(`Reference version: ${data._metadata.version} (last updated: ${data._metadata.lastUpdated})`);
  console.log(`Threshold: flag if next adjustment is within ${thresholdDays} days of today`);
  console.log(`Today: ${now.toISOString().slice(0, 10)}`);
  console.log("=".repeat(70));

  const cpiStates: Array<{
    abbrev: string;
    name: string;
    currentAmount: number;
    frequency: string;
    effectiveDate: string;
    nextExpected: string | null;
    daysUntilNext: number | null;
    status: "OK" | "DUE_SOON" | "OVERDUE" | "UNKNOWN";
    lastVerified: string;
  }> = [];

  for (const [abbrev, state] of Object.entries(data.states)) {
    if (!state.cpiIndexing?.isIndexed) continue;

    const cpi = state.cpiIndexing;
    let daysUntilNext: number | null = null;
    let status: "OK" | "DUE_SOON" | "OVERDUE" | "UNKNOWN" = "UNKNOWN";

    if (cpi.nextExpectedDate) {
      const nextDate = new Date(cpi.nextExpectedDate);
      daysUntilNext = daysBetween(now, nextDate);

      if (daysUntilNext < 0) {
        status = "OVERDUE";
      } else if (daysUntilNext <= thresholdDays) {
        status = "DUE_SOON";
      } else {
        status = "OK";
      }
    }

    cpiStates.push({
      abbrev,
      name: state.name,
      currentAmount: cpi.currentAmount,
      frequency: cpi.frequency,
      effectiveDate: cpi.effectiveDate,
      nextExpected: cpi.nextExpectedDate,
      daysUntilNext,
      status,
      lastVerified: state.lastVerified,
    });
  }

  // Sort: OVERDUE first, then DUE_SOON, then OK, then UNKNOWN
  const priority: Record<string, number> = { OVERDUE: 0, DUE_SOON: 1, OK: 2, UNKNOWN: 3 };
  cpiStates.sort((a, b) => (priority[a.status] ?? 9) - (priority[b.status] ?? 9));

  console.log("");
  console.log(
    "State".padEnd(6) +
    "Name".padEnd(18) +
    "Cap $".padEnd(8) +
    "Freq".padEnd(10) +
    "Effective".padEnd(13) +
    "Next Due".padEnd(13) +
    "Days".padEnd(7) +
    "Status".padEnd(10) +
    "Verified"
  );
  console.log("-".repeat(95));

  let overdueCount = 0;
  let dueSoonCount = 0;

  for (const s of cpiStates) {
    const daysStr = s.daysUntilNext !== null ? String(s.daysUntilNext) : "?";
    const statusIcon =
      s.status === "OVERDUE" ? "!! OVERDUE" :
      s.status === "DUE_SOON" ? "* DUE SOON" :
      s.status === "OK" ? "  OK" :
      "  ???";

    console.log(
      s.abbrev.padEnd(6) +
      s.name.padEnd(18) +
      `$${s.currentAmount}`.padEnd(8) +
      s.frequency.padEnd(10) +
      s.effectiveDate.padEnd(13) +
      (s.nextExpected ?? "unknown").padEnd(13) +
      daysStr.padEnd(7) +
      statusIcon.padEnd(10) +
      s.lastVerified
    );

    if (s.status === "OVERDUE") overdueCount++;
    if (s.status === "DUE_SOON") dueSoonCount++;
  }

  console.log("-".repeat(95));
  console.log(`\nTotal CPI-indexed states: ${cpiStates.length}`);
  console.log(`  OVERDUE:  ${overdueCount}`);
  console.log(`  DUE SOON: ${dueSoonCount}`);
  console.log(`  OK:       ${cpiStates.length - overdueCount - dueSoonCount}`);

  if (overdueCount > 0) {
    console.log(`\n** ACTION REQUIRED: ${overdueCount} state(s) have CPI cap adjustments past their expected date.`);
    console.log("   Check BLS CPI-U data and update state_fee_reference.json.");
  }

  if (dueSoonCount > 0) {
    console.log(`\n* HEADS UP: ${dueSoonCount} state(s) have CPI cap adjustments due within ${thresholdDays} days.`);
  }

  console.log("");
  process.exit(overdueCount > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("Audit failed:", err);
  process.exit(2);
});
