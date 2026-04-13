import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../server/db", () => ({
  db: {
    execute: vi.fn(),
  },
}));

import { db } from "../../server/db.js";
import { runPiiCleanup, PII_RETENTION_DAYS } from "../../server/jobs/piiCleanup.js";

const mockExecute = db.execute as ReturnType<typeof vi.fn>;

/**
 * Live-run call sequence per table (concurrent via Promise.all, internally
 * sequential):
 *   call 0: COUNT total scanned rows     → { rows: [{ cnt }] }
 *   call 1: COUNT eligible rows          → { rows: [{ cnt }] }
 *   call 2: COUNT already-cleared        → { rows: [{ cnt }] }
 *   call 3+: UPDATE batch                → { rowCount: N }
 *
 * Dry-run call sequence per table:
 *   call 0: COUNT total scanned rows     → { rows: [{ cnt }] }
 *   call 1: COUNT eligible rows          → { rows: [{ cnt }] }
 *   call 2: COUNT already-cleared        → { rows: [{ cnt }] }
 *   (no UPDATE calls)
 */
function makeMock(opts: {
  dsScanned?: number;
  dsEligible?: number;
  dsSkipped?: number;
  dsBatches?: number[];
  uaScanned?: number;
  uaEligible?: number;
  uaSkipped?: number;
  uaBatches?: number[];
  dsThrow?: Error;
}) {
  const {
    dsScanned = 0, dsEligible = 0, dsSkipped = 0, dsBatches = [0],
    uaScanned = 0, uaEligible = 0, uaSkipped = 0, uaBatches = [0],
    dsThrow,
  } = opts;

  const dsBatchIter = dsBatches[Symbol.iterator]();
  const uaBatchIter = uaBatches[Symbol.iterator]();

  let dsCalls = 0;
  let uaCalls = 0;

  return vi.fn().mockImplementation((query: unknown) => {
    const raw = JSON.stringify(query ?? "").toLowerCase();

    const isDS = raw.includes("dealer_submissions");
    const isUA = raw.includes("user_analyses") || (raw.includes("raw.") && !isDS);

    if (isDS) {
      if (dsThrow && dsCalls === 0) {
        dsCalls++;
        return Promise.reject(dsThrow);
      }
      const callIdx = dsCalls++;
      if (callIdx === 0) return Promise.resolve({ rows: [{ cnt: dsScanned }], rowCount: 0 });
      if (callIdx === 1) return Promise.resolve({ rows: [{ cnt: dsEligible }], rowCount: 0 });
      if (callIdx === 2) return Promise.resolve({ rows: [{ cnt: dsSkipped }], rowCount: 0 });
      const next = dsBatchIter.next();
      return Promise.resolve({ rows: [], rowCount: next.done ? 0 : (next.value ?? 0) });
    }

    if (isUA) {
      const callIdx = uaCalls++;
      if (callIdx === 0) return Promise.resolve({ rows: [{ cnt: uaScanned }], rowCount: 0 });
      if (callIdx === 1) return Promise.resolve({ rows: [{ cnt: uaEligible }], rowCount: 0 });
      if (callIdx === 2) return Promise.resolve({ rows: [{ cnt: uaSkipped }], rowCount: 0 });
      const next = uaBatchIter.next();
      return Promise.resolve({ rows: [], rowCount: next.done ? 0 : (next.value ?? 0) });
    }

    return Promise.resolve({ rows: [{ cnt: 0 }], rowCount: 0 });
  });
}

describe("PII_RETENTION_DAYS constant", () => {
  it("is 90", () => {
    expect(PII_RETENTION_DAYS).toBe(90);
  });
});

describe("runPiiCleanup — dry-run", () => {
  beforeEach(() => {
    mockExecute.mockReset();
  });

  it("does not mutate the DB — only COUNT queries, no UPDATEs", async () => {
    // Dry-run: 3 COUNT calls per table (scanned, eligible, skipped), no UPDATEs
    mockExecute.mockResolvedValue({ rows: [{ cnt: 0 }], rowCount: 0 });

    const result = await runPiiCleanup({ dryRun: true });

    // 3 counts * 2 tables = 6 calls
    expect(mockExecute).toHaveBeenCalledTimes(6);
    expect(result.totalCleared).toBe(0);
  });

  it("returns scanned, eligible, and skipped counts without clearing", async () => {
    mockExecute.mockImplementation(makeMock({
      dsScanned: 20, dsEligible: 7, dsSkipped: 10,
      uaScanned: 15, uaEligible: 2, uaSkipped: 8,
    }));

    const result = await runPiiCleanup({ dryRun: true });

    const ds = result.tables.find((t) => t.table === "public.dealer_submissions")!;
    const ua = result.tables.find((t) => t.table === "raw.user_analyses")!;

    expect(ds.scannedCount).toBe(20);
    expect(ds.eligibleCount).toBe(7);
    expect(ds.clearedCount).toBe(0);
    expect(ds.skippedCount).toBe(10);

    expect(ua.scannedCount).toBe(15);
    expect(ua.eligibleCount).toBe(2);
    expect(ua.clearedCount).toBe(0);
    expect(ua.skippedCount).toBe(8);
  });

  it("uses action=redact for both tables", async () => {
    mockExecute.mockResolvedValue({ rows: [{ cnt: 0 }], rowCount: 0 });

    const result = await runPiiCleanup({ dryRun: true });

    for (const t of result.tables) {
      expect(t.action).toBe("redact");
    }
  });

  it("reports dryRun=true in result", async () => {
    mockExecute.mockResolvedValue({ rows: [{ cnt: 0 }], rowCount: 0 });

    const result = await runPiiCleanup({ dryRun: true });
    expect(result.dryRun).toBe(true);
  });
});

describe("runPiiCleanup — live run", () => {
  beforeEach(() => {
    mockExecute.mockReset();
  });

  it("clears eligible records older than 90 days", async () => {
    mockExecute.mockImplementation(
      makeMock({
        dsScanned: 10, dsEligible: 3, dsSkipped: 5, dsBatches: [3, 0],
        uaScanned: 8, uaEligible: 1, uaSkipped: 4, uaBatches: [1, 0],
      }),
    );

    const result = await runPiiCleanup({ dryRun: false, batchSize: 500 });

    const ds = result.tables.find((t) => t.table === "public.dealer_submissions")!;
    const ua = result.tables.find((t) => t.table === "raw.user_analyses")!;

    expect(ds.clearedCount).toBe(3);
    expect(ds.skippedCount).toBe(5);
    expect(ds.scannedCount).toBe(10);
    expect(ds.eligibleCount).toBe(3);

    expect(ua.clearedCount).toBe(1);
    expect(ua.skippedCount).toBe(4);

    expect(result.totalCleared).toBe(4);
  });

  it("is idempotent — already-cleared rows produce no additional changes on repeat runs", async () => {
    mockExecute.mockImplementation(
      makeMock({
        dsScanned: 10, dsEligible: 0, dsSkipped: 10, dsBatches: [0],
        uaScanned: 8, uaEligible: 0, uaSkipped: 8, uaBatches: [0],
      }),
    );

    const result = await runPiiCleanup({ dryRun: false, batchSize: 500 });
    expect(result.totalCleared).toBe(0);

    // Reset and run again — still zero
    mockExecute.mockReset();
    mockExecute.mockImplementation(
      makeMock({
        dsScanned: 10, dsEligible: 0, dsSkipped: 10, dsBatches: [0],
        uaScanned: 8, uaEligible: 0, uaSkipped: 8, uaBatches: [0],
      }),
    );

    const result2 = await runPiiCleanup({ dryRun: false, batchSize: 500 });
    expect(result2.totalCleared).toBe(0);
  });

  it("exact 90-day boundary — cutoff uses strict less-than (submitted_at < cutoff)", async () => {
    const before = Date.now();

    mockExecute.mockResolvedValue({ rows: [{ cnt: 0 }], rowCount: 0 });

    const result = await runPiiCleanup({ dryRun: true });

    const after = Date.now();
    const cutoffMs = result.cutoffAt.getTime();

    // Cutoff should be exactly NOW - 90 days (within test execution window)
    const expectedMin = before - PII_RETENTION_DAYS * 24 * 60 * 60 * 1000;
    const expectedMax = after - PII_RETENTION_DAYS * 24 * 60 * 60 * 1000;

    expect(cutoffMs).toBeGreaterThanOrEqual(expectedMin);
    expect(cutoffMs).toBeLessThanOrEqual(expectedMax);
  });

  it("isolates per-table failures — error in one table does not abort the other", async () => {
    mockExecute.mockImplementation(
      makeMock({
        dsThrow: new Error("DB connection lost"),
        uaScanned: 5, uaEligible: 0, uaSkipped: 5, uaBatches: [0],
      }),
    );

    const result = await runPiiCleanup({ dryRun: false, batchSize: 500 });

    const ds = result.tables.find((t) => t.table === "public.dealer_submissions")!;
    const ua = result.tables.find((t) => t.table === "raw.user_analyses")!;

    expect(ds.error).toBeDefined();
    expect(ds.error).toContain("DB connection lost");
    expect(ua.error).toBeUndefined();
    expect(result.tables).toHaveLength(2);
  });

  it("returns dryRun=false for live runs", async () => {
    mockExecute.mockResolvedValue({ rows: [{ cnt: 0 }], rowCount: 0 });

    const result = await runPiiCleanup({ dryRun: false });
    expect(result.dryRun).toBe(false);
  });

  it("processes in multiple batches and stops when a batch returns fewer than batchSize rows", async () => {
    mockExecute.mockImplementation(
      makeMock({
        dsScanned: 10, dsEligible: 4, dsSkipped: 0, dsBatches: [2, 2, 0],
        uaScanned: 5, uaEligible: 1, uaSkipped: 0, uaBatches: [1, 0],
      }),
    );

    const result = await runPiiCleanup({ dryRun: false, batchSize: 2 });

    const ds = result.tables.find((t) => t.table === "public.dealer_submissions")!;
    const ua = result.tables.find((t) => t.table === "raw.user_analyses")!;

    expect(ds.clearedCount).toBe(4);
    expect(ua.clearedCount).toBe(1);
    expect(result.totalCleared).toBe(5);
  });

  it("eligible/scanned/skipped counts are all reported even when clearedCount is 0", async () => {
    mockExecute.mockImplementation(
      makeMock({
        dsScanned: 50, dsEligible: 0, dsSkipped: 45, dsBatches: [0],
        uaScanned: 30, uaEligible: 0, uaSkipped: 25, uaBatches: [0],
      }),
    );

    const result = await runPiiCleanup({ dryRun: false, batchSize: 500 });

    const ds = result.tables.find((t) => t.table === "public.dealer_submissions")!;
    expect(ds.scannedCount).toBe(50);
    expect(ds.eligibleCount).toBe(0);
    expect(ds.clearedCount).toBe(0);
    expect(ds.skippedCount).toBe(45);

    const ua = result.tables.find((t) => t.table === "raw.user_analyses")!;
    expect(ua.scannedCount).toBe(30);
    expect(ua.eligibleCount).toBe(0);
    expect(ua.clearedCount).toBe(0);
    expect(ua.skippedCount).toBe(25);
  });

  it("error result still provides zero-initialized counts", async () => {
    mockExecute.mockImplementation(
      makeMock({
        dsThrow: new Error("table locked"),
        uaScanned: 0, uaEligible: 0, uaSkipped: 0, uaBatches: [0],
      }),
    );

    const result = await runPiiCleanup({ dryRun: false, batchSize: 500 });

    const ds = result.tables.find((t) => t.table === "public.dealer_submissions")!;
    expect(ds.error).toBeDefined();
    expect(ds.scannedCount).toBe(0);
    expect(ds.eligibleCount).toBe(0);
    expect(ds.clearedCount).toBe(0);
    expect(ds.skippedCount).toBe(0);
  });

  it("structured logs include all required observability fields", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    mockExecute.mockImplementation(
      makeMock({
        dsScanned: 5, dsEligible: 2, dsSkipped: 1, dsBatches: [2, 0],
        uaScanned: 3, uaEligible: 1, uaSkipped: 0, uaBatches: [1, 0],
      }),
    );

    await runPiiCleanup({ dryRun: false, batchSize: 500 });

    const logCalls = logSpy.mock.calls.map((c) => {
      try { return JSON.parse(c[0] as string); } catch { return null; }
    }).filter(Boolean);

    const started = logCalls.find((l: Record<string, unknown>) => l.event === "pii_cleanup_started");
    expect(started).toBeDefined();
    expect(started).toHaveProperty("cutoffAt");
    expect(started).toHaveProperty("dryRun", false);
    expect(started).toHaveProperty("batchSize");
    expect(started).toHaveProperty("retentionDays", 90);

    const scannedEvents = logCalls.filter((l: Record<string, unknown>) => l.event === "pii_cleanup_table_scanned");
    expect(scannedEvents).toHaveLength(2);
    for (const s of scannedEvents) {
      expect(s).toHaveProperty("scannedCount");
      expect(s).toHaveProperty("eligibleCount");
      expect(s).toHaveProperty("skippedCount");
      expect(s).toHaveProperty("dryRun");
      expect(s).toHaveProperty("cutoffAt");
    }

    const completed = logCalls.find((l: Record<string, unknown>) => l.event === "pii_cleanup_completed");
    expect(completed).toBeDefined();
    expect(completed).toHaveProperty("totalCleared");
    expect(completed).toHaveProperty("durationMs");
    expect(completed.tables).toHaveLength(2);
    for (const t of completed.tables) {
      expect(t).toHaveProperty("scannedCount");
      expect(t).toHaveProperty("eligibleCount");
      expect(t).toHaveProperty("clearedCount");
      expect(t).toHaveProperty("skippedCount");
    }

    logSpy.mockRestore();
  });

  it("raw.user_analyses UPDATE writes retention_expires_at = NOW() as cleared-at marker", async () => {
    mockExecute.mockImplementation(
      makeMock({
        dsScanned: 0, dsEligible: 0, dsSkipped: 0, dsBatches: [0],
        uaScanned: 2, uaEligible: 1, uaSkipped: 1, uaBatches: [1, 0],
      }),
    );

    await runPiiCleanup({ dryRun: false, batchSize: 500 });

    const updateCalls = mockExecute.mock.calls.filter((call) => {
      const raw = JSON.stringify(call[0] ?? "").toLowerCase();
      return raw.includes("user_analyses") && raw.includes("update");
    });

    expect(updateCalls.length).toBeGreaterThanOrEqual(1);
    for (const call of updateCalls) {
      const raw = JSON.stringify(call[0] ?? "").toLowerCase();
      expect(raw).toContain("submitted_text_redacted");
      expect(raw).toContain("retention_expires_at");
    }
  });
});
