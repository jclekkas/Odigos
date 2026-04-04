import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mock @sentry/node ────────────────────────────────────────────────────────
vi.mock("@sentry/node", () => ({
  addBreadcrumb: vi.fn(),
  captureException: vi.fn(),
}));

// ─── Mock db ──────────────────────────────────────────────────────────────────
vi.mock("../../server/db", () => ({
  db: {
    select: vi.fn(),
    update: vi.fn(),
    insert: vi.fn(),
    execute: vi.fn().mockResolvedValue({ rows: [{ pg_try_advisory_lock: true }] }),
  },
}));

// ─── Mock warehouseWriter ────────────────────────────────────────────────────
vi.mock("../../server/warehouse/warehouseWriter", () => ({
  performWarehouseWriteById: vi.fn(),
}));

import { db } from "../../server/db";
import { performWarehouseWriteById } from "../../server/warehouse/warehouseWriter";
import { runDlqReplay } from "../../server/warehouse/dlqReplay";

const mockSelect = db.select as ReturnType<typeof vi.fn>;
const mockUpdate = db.update as ReturnType<typeof vi.fn>;
const mockPerformWrite = performWarehouseWriteById as ReturnType<typeof vi.fn>;

function makePendingRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "dlq-row-1",
    submissionId: "sub-abc",
    payload: { dealerSubmissionId: "sub-abc", stateCode: "CA" },
    errorMessage: "DB down",
    attemptCount: 0,
    maxAttempts: 5,
    status: "pending",
    nextAttemptAt: new Date(Date.now() - 1000),
    firstFailedAt: new Date(),
    lastFailedAt: new Date(),
    leaseExpiresAt: null,
    lastErrorMessage: null,
    ...overrides,
  };
}

function setupDbMocks(rows: ReturnType<typeof makePendingRow>[]) {
  // select chain: .from().where().limit()
  const limitFn = vi.fn().mockResolvedValue(rows);
  const whereFn = vi.fn().mockReturnValue({ limit: limitFn });
  const fromFn = vi.fn().mockReturnValue({ where: whereFn });
  mockSelect.mockReturnValue({ from: fromFn });

  // update chain: .set().where().returning()
  const returningFn = vi.fn();
  const updateWhereFn = vi.fn().mockReturnValue({ returning: returningFn });
  const setFn = vi.fn().mockReturnValue({ where: updateWhereFn });
  mockUpdate.mockReturnValue({ set: setFn });

  return { returningFn, setFn, updateWhereFn };
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("runDlqReplay", () => {
  it("skips when no eligible rows", async () => {
    setupDbMocks([]);
    await runDlqReplay();
    expect(mockPerformWrite).not.toHaveBeenCalled();
  });

  it("replays an eligible pending row", async () => {
    const row = makePendingRow();
    const { returningFn } = setupDbMocks([row]);

    // Lease acquisition succeeds
    returningFn.mockResolvedValueOnce([{ id: row.id }]);
    // Status update after success
    returningFn.mockResolvedValueOnce([]);

    mockPerformWrite.mockResolvedValue(undefined);

    await runDlqReplay();

    expect(mockPerformWrite).toHaveBeenCalledTimes(1);
    expect(mockPerformWrite).toHaveBeenCalledWith(row.submissionId, row.payload);
  });

  it("increments attempt_count on failure", async () => {
    const row = makePendingRow({ attemptCount: 1, maxAttempts: 5 });
    const { returningFn, setFn } = setupDbMocks([row]);

    // Lease acquisition succeeds
    returningFn.mockResolvedValueOnce([{ id: row.id }]);
    // Status update after failure
    returningFn.mockResolvedValueOnce([]);

    mockPerformWrite.mockRejectedValue(new Error("DB error"));

    await runDlqReplay();

    expect(setFn).toHaveBeenCalledWith(
      expect.objectContaining({ attemptCount: 2, status: "pending" }),
    );
  });

  it("advances next_attempt_at after failure", async () => {
    const row = makePendingRow({ attemptCount: 2, maxAttempts: 5 });
    const { returningFn, setFn } = setupDbMocks([row]);

    returningFn.mockResolvedValueOnce([{ id: row.id }]);
    returningFn.mockResolvedValueOnce([]);

    mockPerformWrite.mockRejectedValue(new Error("DB error"));

    const before = Date.now();
    await runDlqReplay();
    const after = Date.now();

    const updateCall = setFn.mock.calls[setFn.mock.calls.length - 1][0];
    expect(updateCall.nextAttemptAt).toBeInstanceOf(Date);
    expect(updateCall.nextAttemptAt.getTime()).toBeGreaterThan(after);
  });

  it("marks row as dead after max_attempts reached", async () => {
    const row = makePendingRow({ attemptCount: 4, maxAttempts: 5 });
    const { returningFn, setFn } = setupDbMocks([row]);

    returningFn.mockResolvedValueOnce([{ id: row.id }]);
    returningFn.mockResolvedValueOnce([]);

    mockPerformWrite.mockRejectedValue(new Error("persistent failure"));

    await runDlqReplay();

    expect(setFn).toHaveBeenCalledWith(
      expect.objectContaining({ status: "dead", attemptCount: 5 }),
    );
  });

  it("skips row if lease acquisition fails (concurrent worker)", async () => {
    const row = makePendingRow();
    const { returningFn } = setupDbMocks([row]);

    // Lease acquisition returns empty — another worker grabbed it
    returningFn.mockResolvedValueOnce([]);

    await runDlqReplay();

    expect(mockPerformWrite).not.toHaveBeenCalled();
  });

  it("is idempotent — replaying same row twice is a no-op on second call", async () => {
    const row = makePendingRow();

    let call = 0;
    const { returningFn } = setupDbMocks([row]);

    // First call: lease acquired, write succeeds, resolved
    returningFn.mockResolvedValueOnce([{ id: row.id }]);
    returningFn.mockResolvedValueOnce([]);

    mockPerformWrite.mockResolvedValue(undefined);

    await runDlqReplay();
    expect(mockPerformWrite).toHaveBeenCalledTimes(1);

    // Second call: no more pending rows (already resolved)
    const limitFn2 = vi.fn().mockResolvedValue([]);
    const whereFn2 = vi.fn().mockReturnValue({ limit: limitFn2 });
    const fromFn2 = vi.fn().mockReturnValue({ where: whereFn2 });
    mockSelect.mockReturnValue({ from: fromFn2 });

    await runDlqReplay();
    expect(mockPerformWrite).toHaveBeenCalledTimes(1);
  });
});
