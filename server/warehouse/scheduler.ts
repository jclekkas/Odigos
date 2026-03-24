import { refreshAllViews } from "./warehouseUtils";
import { runPiiCleanup } from "../jobs/piiCleanup";

const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
const STARTUP_DELAY_MS = 30_000;

let viewTimer: ReturnType<typeof setInterval> | null = null;
let piiTimer: ReturnType<typeof setInterval> | null = null;

async function runDailyRefresh(): Promise<void> {
  try {
    console.log("[scheduler] Running daily materialized view refresh…");
    await refreshAllViews();
    console.log("[scheduler] Daily refresh complete.");
  } catch (err) {
    console.error("[scheduler] Daily refresh failed:", err);
  }
}

async function runDailyPiiCleanup(): Promise<void> {
  try {
    console.log("[scheduler] Running daily PII cleanup…");
    await runPiiCleanup({ dryRun: false, batchSize: 500 });
    console.log("[scheduler] Daily PII cleanup complete.");
  } catch (err) {
    console.error("[scheduler] Daily PII cleanup failed:", err);
  }
}

export function startDailyScheduler(): void {
  if (viewTimer) return;

  console.log("[scheduler] Daily warehouse refresh scheduled (every 24h).");

  viewTimer = setInterval(() => {
    runDailyRefresh();
  }, TWENTY_FOUR_HOURS);

  if (viewTimer && typeof viewTimer === "object" && "unref" in viewTimer) {
    viewTimer.unref();
  }

  if (piiTimer) return;

  console.log("[scheduler] Daily PII cleanup scheduled (startup + every 24h).");

  // Run once at startup after a short delay to avoid contention
  const startupTimeout = setTimeout(() => {
    runDailyPiiCleanup();
  }, STARTUP_DELAY_MS);

  if (typeof startupTimeout === "object" && "unref" in startupTimeout) {
    startupTimeout.unref();
  }

  piiTimer = setInterval(() => {
    runDailyPiiCleanup();
  }, TWENTY_FOUR_HOURS);

  if (piiTimer && typeof piiTimer === "object" && "unref" in piiTimer) {
    piiTimer.unref();
  }
}
