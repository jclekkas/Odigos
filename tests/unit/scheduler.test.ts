import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("../../server/warehouse/warehouseUtils", () => ({
  refreshAllViews: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../../server/jobs/piiCleanup", () => ({
  runPiiCleanup: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../../server/jobs/backup", () => ({
  runBackup: vi.fn().mockReturnValue({ filePath: "/tmp/backup.dump", sizeBytes: 1024 }),
}));

import { startDailyScheduler, stopDailyScheduler } from "../../server/warehouse/scheduler.js";
import { refreshAllViews } from "../../server/warehouse/warehouseUtils.js";
import { runPiiCleanup } from "../../server/jobs/piiCleanup.js";
import { runBackup } from "../../server/jobs/backup.js";

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

  it("database backup interval fires after 24 hours", () => {
    startDailyScheduler();

    expect(runBackup).not.toHaveBeenCalled();

    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
    vi.advanceTimersByTime(TWENTY_FOUR_HOURS);

    expect(runBackup).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(TWENTY_FOUR_HOURS);
    expect(runBackup).toHaveBeenCalledTimes(2);
  });

  it("a single runDailyRefresh failure does not stop subsequent interval ticks", async () => {
    (refreshAllViews as ReturnType<typeof vi.fn>)
      .mockRejectedValueOnce(new Error("db down"))
      .mockResolvedValueOnce(undefined);

    startDailyScheduler();

    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
    await vi.advanceTimersByTimeAsync(TWENTY_FOUR_HOURS);
    await vi.advanceTimersByTimeAsync(TWENTY_FOUR_HOURS);

    expect(refreshAllViews).toHaveBeenCalledTimes(2);
  });

  it("a runBackup failure does not throw out of the scheduled tick", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    (runBackup as ReturnType<typeof vi.fn>).mockImplementationOnce(() => {
      throw new Error("pg_dump not installed");
    });

    startDailyScheduler();

    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
    expect(() => vi.advanceTimersByTime(TWENTY_FOUR_HOURS)).not.toThrow();
    expect(runBackup).toHaveBeenCalledTimes(1);
    expect(errorSpy).toHaveBeenCalledWith(
      "[scheduler] Daily backup failed:",
      expect.any(Error),
    );
    errorSpy.mockRestore();
  });
});
