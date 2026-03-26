/**
 * DLQ Replay Worker
 *
 * On startup and every N minutes (DLQ_REPLAY_INTERVAL_MINUTES, default 15),
 * fetches a page of `pending` DLQ rows where next_attempt_at <= now(), leases
 * each row, attempts the warehouse write, and either marks it resolved or
 * advances the backoff / marks it dead.
 *
 * Guards with a simple in-process lock so runs don't overlap.
 * Non-fatal to server startup.
 */

import * as Sentry from "@sentry/node";
import { db } from "../db";
import { lte, eq, and, or } from "drizzle-orm";
import { failedWarehouseWrites } from "@shared/schema";
import { performWarehouseWriteById } from "./warehouseWriter";
import { jitteredBackoffMs } from "../lib/reliability";

const DLQ_PAGE_SIZE = parseInt(process.env.DLQ_PAGE_SIZE ?? "20", 10);
const DLQ_LEASE_TIMEOUT_MS = parseInt(process.env.DLQ_LEASE_TIMEOUT_MS ?? "120000", 10);
const DLQ_REPLAY_INTERVAL_MINUTES = parseInt(process.env.DLQ_REPLAY_INTERVAL_MINUTES ?? "15", 10);
const DLQ_BASE_BACKOFF_MS = 60_000;
const DLQ_MAX_BACKOFF_MS = 60 * 60 * 1000;

let replayRunning = false;

async function replayOnePage(): Promise<{ replayed: number; resolved: number; dead: number }> {
  const now = new Date();
  const leaseExpiry = new Date(now.getTime() + DLQ_LEASE_TIMEOUT_MS);

  // Select pending rows OR rows whose lease has expired (crash recovery)
  const rows = await db
    .select()
    .from(failedWarehouseWrites)
    .where(
      and(
        or(
          eq(failedWarehouseWrites.status, "pending"),
          and(
            eq(failedWarehouseWrites.status, "leased"),
            lte(failedWarehouseWrites.leaseExpiresAt, now),
          ),
        ),
        lte(failedWarehouseWrites.nextAttemptAt, now),
      )
    )
    .limit(DLQ_PAGE_SIZE);

  if (rows.length === 0) return { replayed: 0, resolved: 0, dead: 0 };

  let resolved = 0;
  let dead = 0;

  for (const row of rows) {
    // Acquire lease atomically: only update if still pending OR lease expired (crash recovery)
    const leaseResult = await db
      .update(failedWarehouseWrites)
      .set({
        status: "leased",
        leaseExpiresAt: leaseExpiry,
      })
      .where(
        and(
          eq(failedWarehouseWrites.id, row.id),
          or(
            eq(failedWarehouseWrites.status, "pending"),
            and(
              eq(failedWarehouseWrites.status, "leased"),
              lte(failedWarehouseWrites.leaseExpiresAt, now),
            ),
          ),
        )
      )
      .returning({ id: failedWarehouseWrites.id });

    if (leaseResult.length === 0) {
      // Another worker grabbed it — skip
      continue;
    }

    const attemptNumber = row.attemptCount + 1;

    try {
      await performWarehouseWriteById(row.submissionId, row.payload);

      await db
        .update(failedWarehouseWrites)
        .set({ status: "resolved", lastFailedAt: new Date() })
        .where(eq(failedWarehouseWrites.id, row.id));

      console.log(
        `[dlq-replay] submissionId=${row.submissionId} resolved on attempt ${attemptNumber}`,
      );
      resolved++;
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      const newAttemptCount = row.attemptCount + 1;
      const isDead = newAttemptCount >= row.maxAttempts;
      const backoffMs = isDead
        ? 0
        : Math.min(jitteredBackoffMs(newAttemptCount, DLQ_BASE_BACKOFF_MS, DLQ_MAX_BACKOFF_MS), DLQ_MAX_BACKOFF_MS);

      const nextAttemptAt = isDead ? null : new Date(Date.now() + backoffMs);

      await db
        .update(failedWarehouseWrites)
        .set({
          status: isDead ? "dead" : "pending",
          attemptCount: newAttemptCount,
          lastFailedAt: new Date(),
          leaseExpiresAt: null,
          nextAttemptAt: nextAttemptAt ?? new Date(),
          lastErrorMessage: errMsg.slice(0, 500),
        })
        .where(eq(failedWarehouseWrites.id, row.id));

      if (isDead) {
        console.error(
          `[dlq-replay] submissionId=${row.submissionId} marked DEAD after ${newAttemptCount} attempts. lastError=${errMsg}`,
        );
        Sentry.captureException(new Error(`DLQ row dead: ${row.submissionId}`), {
          level: "error",
          extra: { submissionId: row.submissionId, attempts: newAttemptCount, lastError: errMsg },
        });
        dead++;
      } else {
        console.warn(
          `[dlq-replay] submissionId=${row.submissionId} attempt ${newAttemptCount}/${row.maxAttempts} failed, next retry in ${Math.round(backoffMs / 1000)}s. error=${errMsg}`,
        );
      }
    }
  }

  return { replayed: rows.length, resolved, dead };
}

export async function runDlqReplay(): Promise<void> {
  if (replayRunning) {
    console.log("[dlq-replay] Skipping run — another replay is in progress");
    return;
  }
  replayRunning = true;
  try {
    console.log("[dlq-replay] Starting replay run");
    const stats = await replayOnePage();
    console.log(
      `[dlq-replay] Complete: replayed=${stats.replayed} resolved=${stats.resolved} dead=${stats.dead}`,
    );
    Sentry.addBreadcrumb({
      category: "dlq-replay",
      message: "DLQ replay run complete",
      level: "info",
      data: stats,
    });
  } catch (err) {
    console.error("[dlq-replay] Replay run failed:", err);
    Sentry.captureException(err, { level: "warning", extra: { context: "dlq-replay-run" } });
  } finally {
    replayRunning = false;
  }
}

export function startDlqReplayWorker(): void {
  if (!process.env.DATABASE_URL) {
    console.log("[dlq-replay] No DATABASE_URL — skipping DLQ replay worker");
    return;
  }

  // Initial run on startup (non-blocking)
  void runDlqReplay();

  const intervalMs = DLQ_REPLAY_INTERVAL_MINUTES * 60 * 1000;
  setInterval(() => void runDlqReplay(), intervalMs);
  console.log(`[dlq-replay] Worker started, interval=${DLQ_REPLAY_INTERVAL_MINUTES}min`);
}
