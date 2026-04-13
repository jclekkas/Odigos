/**
 * Submission ingestion abstraction layer.
 *
 * enqueueSubmission() fires after the HTTP response has already been sent,
 * so the user is never blocked by storage writes.
 *
 * Uses a simple in-process concurrency limiter (Semaphore) to prevent
 * database pool exhaustion when many submissions arrive at once.
 * The semaphore limits concurrent warehouse writes and caps queue depth
 * to prevent unbounded memory growth.
 *
 * To swap for a real job queue (Bull, BullMQ, Temporal, etc.) in the future,
 * replace only the body of this function — no route changes needed.
 *
 * ⚠️  SINGLE-INSTANCE LIMITATION
 * The internal queue implemented here uses an in-process semaphore —
 * it is memory-backed. All pending submissions live in the Node.js event
 * loop of a single process. There is no cross-instance coordination.
 * If the process crashes, any queued-but-not-yet-written submissions are lost.
 * Running multiple server replicas does not distribute or share the queue —
 * each replica independently writes its own submissions.
 * Redis, BullMQ, or a similar durable queue is required for reliability and
 * cross-instance coordination when scaling beyond one process.
 */
import { storage } from "./storage.js";
import { redactPII } from "./piiRedact.js";
import { zipToStateCode } from "./zipToState.js";
import type { AnalysisResponse, AnalysisRequest } from "../shared/schema.js";
import { dealerSubmissions } from "../shared/schema.js";
import { normalizeSubmissionText, sha256Hex, normalizeFeeNames } from "./warehouse/warehouseUtils.js";
import { db } from "./db.js";
import { eq, isNull } from "drizzle-orm";

// ── Concurrency limiter ─────────────────────────────────────────────────────

const MAX_CONCURRENT = parseInt(process.env.WAREHOUSE_WRITE_CONCURRENCY || "5", 10);
const MAX_QUEUE_DEPTH = parseInt(process.env.WAREHOUSE_QUEUE_MAX_DEPTH || "1000", 10);

let _activeCount = 0;
let _queueDepth = 0;
const _waitQueue: Array<() => void> = [];

function semaphoreAcquire(): Promise<void> {
  if (_activeCount < MAX_CONCURRENT) {
    _activeCount++;
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    _waitQueue.push(() => {
      _activeCount++;
      resolve();
    });
  });
}

function semaphoreRelease(): void {
  _activeCount--;
  const next = _waitQueue.shift();
  if (next) next();
}

/** Expose queue stats for health checks / monitoring. */
export function getIngestionQueueStats(): { active: number; queued: number; maxConcurrent: number; maxDepth: number } {
  return { active: _activeCount, queued: _queueDepth, maxConcurrent: MAX_CONCURRENT, maxDepth: MAX_QUEUE_DEPTH };
}

// ── Submission payload ──────────────────────────────────────────────────────

export interface SubmissionPayload {
  request: AnalysisRequest;
  result: AnalysisResponse;
  // When the route pre-saves the dealer_submissions row (to get listingId before the response),
  // it passes the already-persisted id here so the ingestor skips the save step.
  preSavedListingId?: string | null;
}

export function enqueueSubmission(payload: SubmissionPayload): void {
  // Check queue depth before enqueuing to prevent unbounded memory growth
  if (_queueDepth >= MAX_QUEUE_DEPTH) {
    console.error(
      `[submission-ingestor] Queue depth limit reached (${MAX_QUEUE_DEPTH}). Dropping submission. ` +
      `Consider increasing WAREHOUSE_QUEUE_MAX_DEPTH or switching to a durable queue.`,
    );
    return;
  }

  _queueDepth++;

  // Non-blocking: setImmediate fires after the current event loop tick,
  // well after res.json() has completed.
  setImmediate(async () => {
    await semaphoreAcquire();
    try {
      const { request: data, result: finalResult, preSavedListingId } = payload;

      const stateCode = zipToStateCode(data.zipCode);

      // Compute content hash for deduplication
      const contentHash = sha256Hex(normalizeSubmissionText(data.dealerText));

      let submissionId: string | null = preSavedListingId ?? null;

      if (submissionId) {
        try {
          await db.update(dealerSubmissions)
            .set({ contentHash })
            .where(eq(dealerSubmissions.id, submissionId));
        } catch (_backfillErr) {
        }
      }

      if (!submissionId) {
        const fees = finalResult.detectedFields.fees ?? [];
        const feeAmounts = fees
          .map((f) => f.amount)
          .filter((a): a is number => a !== null);

        // Numeric values are passed as strings — Drizzle's numeric() type maps to
        // PostgreSQL NUMERIC which preserves precision; JS strings avoid float drift.
        const toNum = (n: number | null | undefined): string | null =>
          n != null ? String(n) : null;

        const submission = await storage.saveDealerSubmission({
          analysisVersion: "v2",
          dealScore: finalResult.dealScore,
          confidenceLevel: finalResult.confidenceLevel,
          goNoGo: finalResult.goNoGo,
          verdictLabel: finalResult.verdictLabel,
          condition: data.condition,
          purchaseType: data.purchaseType,
          source: data.source ?? "paste",
          stateCode,
          contentHash,

          // Financial signals
          salePrice: toNum(finalResult.detectedFields.salePrice),
          msrp: toNum(finalResult.detectedFields.msrp),
          otdPrice: toNum(finalResult.detectedFields.outTheDoorPrice),
          monthlyPayment: toNum(finalResult.detectedFields.monthlyPayment),
          apr: toNum(finalResult.detectedFields.apr),
          termMonths: finalResult.detectedFields.termMonths,
          downPayment: toNum(finalResult.detectedFields.downPayment),
          rebates: toNum(finalResult.detectedFields.rebates),
          tradeInValue: toNum(finalResult.detectedFields.tradeInValue),
          totalFeesAmount:
            feeAmounts.length > 0
              ? String(feeAmounts.reduce((a, b) => a + b, 0))
              : null,

          // Fee intelligence
          feeCount: fees.length,
          feeNames: normalizeFeeNames(fees),

          // Tactic flags
          flagMarketAdjustment: fees.some((f) =>
            /market.?adjust|markup|adm/i.test(f.name),
          ),
          flagPaymentOnly:
            finalResult.detectedFields.monthlyPayment !== null &&
            finalResult.detectedFields.salePrice === null &&
            finalResult.detectedFields.outTheDoorPrice === null,
          flagMissingOtd: finalResult.detectedFields.outTheDoorPrice === null,
          flagVagueFees: fees.some((f) =>
            /protection|nitrogen|etch|ceramic|fabric|undercoat|pinstripe/i.test(
              f.name,
            ),
          ),
          flagHighCostAddons:
            fees.filter(
              (f) =>
                /dealer.?add|add.?on|package/i.test(f.name) &&
                (f.amount ?? 0) >= 500,
            ).length > 0,
          highCostAddonCount: fees.filter((f) => (f.amount ?? 0) >= 500).length,
          missingInfoCount: finalResult.missingInfo?.length ?? 0,

          // Full structured payload
          detectedFields: finalResult.detectedFields,

          // Tier 2: PII-redacted text + 90-day expiry
          rawTextRedacted: redactPII(data.dealerText),
          rawTextStoredAt: new Date(),
          rawTextExpiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        });
        submissionId = submission?.id ?? null;
      }

      // ── Warehouse write path ────────────────────────────────────────────────
      // Retry logic and DLQ are handled inside writeSubmissionToWarehouse.
      if (process.env.DATABASE_URL && submissionId) {
        const { writeSubmissionToWarehouse } = await import(
          "./warehouse/warehouseWriter"
        );
        await writeSubmissionToWarehouse({
          dealerSubmissionId: submissionId,
          request: data,
          result: finalResult,
          stateCode,
          contentHash,
        });
      }
    } catch (err) {
      console.error("[submission-ingestor] non-blocking write failed:", err);
      // Never rethrows — user already has their result
    } finally {
      _queueDepth--;
      semaphoreRelease();
    }
  });
}
