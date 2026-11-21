/**
 * Flag state rows whose last_reviewed date is older than N months.
 * Does not call a model or use any API key.
 *
 *   npx tsx scripts/check-state-review-age.ts --months=6
 */
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

interface StateRow {
  name: string;
  last_reviewed?: string;
}

interface Dataset {
  states: Record<string, StateRow>;
}

const arg = process.argv.find((value) => value.startsWith("--months="));
const months = Number(arg?.split("=")[1] ?? "6");
if (!Number.isFinite(months) || months <= 0) {
  console.error("Pass --months=N with a positive number.");
  process.exit(2);
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dataset = JSON.parse(readFileSync(resolve(root, "data/state_fees.json"), "utf8")) as Dataset;
const cutoff = new Date();
cutoff.setUTCMonth(cutoff.getUTCMonth() - months);

const stale: string[] = [];
for (const [code, state] of Object.entries(dataset.states)) {
  if (!state.last_reviewed) {
    stale.push(`${code} ${state.name}: no last_reviewed date`);
    continue;
  }
  const reviewed = new Date(`${state.last_reviewed}T00:00:00Z`);
  if (Number.isNaN(reviewed.getTime()) || reviewed < cutoff) {
    stale.push(`${code} ${state.name}: last reviewed ${state.last_reviewed}`);
  }
}

if (stale.length > 0) {
  console.error(`State rows older than ${months} months:`);
  for (const line of stale) console.error(`- ${line}`);
  process.exit(1);
}

console.log(`All ${Object.keys(dataset.states).length} state rows were reviewed within ${months} months.`);
