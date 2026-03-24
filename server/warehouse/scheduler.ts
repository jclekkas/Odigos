import { refreshAllViews } from "./warehouseUtils";

const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

let timer: ReturnType<typeof setInterval> | null = null;

async function runDailyRefresh(): Promise<void> {
  try {
    console.log("[scheduler] Running daily materialized view refresh…");
    await refreshAllViews();
    console.log("[scheduler] Daily refresh complete.");
  } catch (err) {
    console.error("[scheduler] Daily refresh failed:", err);
  }
}

export function startDailyScheduler(): void {
  if (timer) return;

  console.log("[scheduler] Daily warehouse refresh scheduled (every 24h).");

  timer = setInterval(() => {
    runDailyRefresh();
  }, TWENTY_FOUR_HOURS);

  if (timer && typeof timer === "object" && "unref" in timer) {
    timer.unref();
  }
}
