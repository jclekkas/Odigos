import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("../../server/warehouse/warehouseUtils", () => ({
  refreshAllViews: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../../server/jobs/piiCleanup", () => ({
  runPiiCleanup: vi.fn().mockResolvedValue(undefined),
}));

import { startDailyScheduler, stopDailyScheduler } from "../../server/warehouse/scheduler";
import { refreshAllViews } from "../../server/warehouse/warehouseUtils";
import { runPiiCleanup } from "../../server/jobs/piiCleanup";

describe("Daily scheduler", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Ensure scheduler state is clean
    stopDailyScheduler();
    vi.clearAllMocks();
  });

  afterEach(() => {
    stopDailyScheduler();
    vi.useRealTimers();
  });

  it("startDailyScheduler sets up intervals", () => {
    const setIntervalSpy = vi.spyOn(global, "setInterval");
    startDailyScheduler();
    // Three intervals: view refresh, PII cleanup, pg_dump backup (Task #170)
    expect(setIntervalSpy).toHaveBeenCalledTimes(3);
    setIntervalSpy.mockRestore();
  });

  it("stopDailyScheduler clears intervals", () => {
    const clearIntervalSpy = vi.spyOn(global, "clearInterval");
    startDailyScheduler();
    stopDailyScheduler();
    // Should clear all three intervals (view refresh, PII cleanup, pg_dump backup)
    expect(clearIntervalSpy).toHaveBeenCalledTimes(3);
    clearIntervalSpy.mockRestore();
  });

  it("calling startDailyScheduler twice does not create duplicate intervals", () => {
    const setIntervalSpy = vi.spyOn(global, "setInterval");
    startDailyScheduler();
    const firstCallCount = setIntervalSpy.mock.calls.length;
    startDailyScheduler(); // second call — should be a no-op
    expect(setIntervalSpy).toHaveBeenCalledTimes(firstCallCount);
    setIntervalSpy.mockRestore();
  });

  it("view refresh interval fires after 24 hours", () => {
    startDailyScheduler();

    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
    vi.advanceTimersByTime(TWENTY_FOUR_HOURS);

    expect(refreshAllViews).toHaveBeenCalled();
  });

  it("PII cleanup runs once after startup delay then on interval", () => {
    startDailyScheduler();

    // After 30s startup delay the first PII cleanup fires
    vi.advanceTimersByTime(30_000);
    expect(runPiiCleanup).toHaveBeenCalledTimes(1);

    // After 24h the interval fires
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
    vi.advanceTimersByTime(TWENTY_FOUR_HOURS);
    expect(runPiiCleanup).toHaveBeenCalledTimes(2);
  });
});
