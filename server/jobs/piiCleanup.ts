/**
 * PII Cleanup Job — 90-day retention enforcement
 *
 * WHAT IT DOES
 * ────────────
 * Enforces the app's 90-day PII retention policy by clearing user-submitted
 * text from every table that stores it.  Uses a single canonical cutoff:
 *   NOW() - 90 days, anchored to the row's creation timestamp.
 *
 * CUTOFF OPERATOR
 * ───────────────
 * Rows are eligible when:   submitted_at < cutoff   (strictly less than)
 * This means a row submitted at exactly the cutoff timestamp is NOT eligible.
 * The cutoff is computed as:  new Date(Date.now() - 90 * 86400000)
 * All WHERE clauses, comments, and tests use this same strict-less-than rule.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * FULL PII SURFACE AUDIT
 * ═══════════════════════════════════════════════════════════════════════════
 * Every data surface in the application was reviewed for user-submitted or
 * identifying data. Each surface is categorized as REDACTED, EXCLUDED, or
 * NOT APPLICABLE.
 *
 * ── DATABASE TABLES ──────────────────────────────────────────────────────
 *
 * 1. public.dealer_submissions
 *    PII fields: rawTextRedacted (best-effort redacted user pasted text)
 *    Decision:   REDACT (null rawTextRedacted, stamp rawTextClearedAt)
 *    Reason:     Row retains financial signals (deal score, fee data, state)
 *                needed for aggregate analytics and business reconciliation.
 *    Cutoff:     submitted_at < cutoff
 *    Idempotent: Rows with rawTextClearedAt IS NOT NULL are skipped.
 *
 * 2. raw.user_analyses
 *    PII fields: submittedTextRedacted (best-effort redacted user pasted text)
 *    Decision:   REDACT (null submittedTextRedacted, stamp retentionExpiresAt
 *                with NOW() — see retentionExpiresAt note below)
 *    Reason:     Row retains financial signals (deal score, verdict, flags,
 *                state, vehicle info) needed for warehouse analytics.
 *    Cutoff:     submitted_at < cutoff
 *    Idempotent: Rows with submittedTextRedacted IS NULL are skipped.
 *
 * 3. core.listings
 *    PII fields: NONE — contains only structured financial signals (prices,
 *                fees, scores, vehicle info, state code). No user text stored.
 *    Decision:   EXCLUDED (no action required)
 *
 * 4. core.dealers
 *    PII fields: NONE — dealer business name and geography only. Dealer names
 *                are business entities, not individual PII.
 *    Decision:   EXCLUDED (no action required)
 *
 * 5. core.consumer_complaints
 *    PII fields: NONE — sourced from public regulatory data (CFPB etc.),
 *                contains complaint types and company responses only.
 *    Decision:   EXCLUDED (no action required)
 *
 * 6. raw.enforcement_records
 *    PII fields: NONE — sourced from public regulatory data, raw JSON from
 *                government APIs.
 *    Decision:   EXCLUDED (no action required)
 *
 * 7. core.states / core.metro_areas
 *    PII fields: NONE — reference data (state names, doc fee caps, metro areas).
 *    Decision:   EXCLUDED (no action required)
 *
 * 8. public.metrics_events
 *    PII fields: Metadata JSONB may contain zipCode (low-sensitivity),
 *                sessionId (pseudonymous), errorMessage (could theoretically
 *                echo user input on error). No raw dealerText is stored.
 *    Decision:   EXCLUDED — zip codes are not directly identifying, session IDs
 *                are anonymous browser-generated tokens, and error messages do
 *                not contain user-submitted text by design. The metrics system
 *                uses a rolling 5,000-event window providing implicit retention.
 *    Remaining risk: If an upstream error handler ever echoes raw user text into
 *                errorMessage, that could leak PII into metrics. This is a known
 *                minor residual risk that would require a broader logging audit
 *                to fully mitigate (out of scope for this task).
 *
 * 9. public.users
 *    PII fields: username and password (auth credentials only).
 *    Decision:   EXCLUDED — no submission text; auth credentials are not
 *                subject to the 90-day retention policy.
 *
 * ── MATERIALIZED VIEWS ───────────────────────────────────────────────────
 *
 * core.platform_metrics, core.national_stats, core.state_stats
 *    These views aggregate only COUNT, AVG, and MAX over numerical columns
 *    from core.listings and raw.user_analyses. They do NOT read any text
 *    fields (submitted_text_redacted, raw_text_redacted). Nulling those
 *    fields has zero effect on view correctness or refreshability.
 *    Decision:   VERIFIED SAFE — no action required.
 *
 * ── NON-TABLE SURFACES ───────────────────────────────────────────────────
 *
 * File uploads (multer)
 *    Uses memoryStorage() — uploaded files exist only as in-memory Buffers
 *    for the duration of the HTTP request. No disk persistence. Buffers are
 *    GC'd after the request completes.
 *    Decision:   NOT APPLICABLE (no persistence)
 *
 * OpenAI API calls
 *    Raw user text and base64 images are sent to OpenAI for analysis. These
 *    are transient HTTP payloads — the app does not persist them locally.
 *    OpenAI's own data retention policies apply.
 *    Decision:   NOT APPLICABLE (no local persistence)
 *
 * Express request/response logs (server/index.ts)
 *    The request logger logs method, path, status, duration, and JSON response
 *    bodies for /api routes. It does NOT log request bodies (which contain
 *    dealerText). Response bodies may echo portions of the analysis result but
 *    not the raw user text.
 *    Decision:   EXCLUDED (raw text not logged)
 *
 * Stripe integration
 *    Stripe metadata contains only { product/tier, sessionId }. No user text,
 *    names, or emails are stored in Stripe metadata. Payment/billing PII is
 *    managed entirely by Stripe's hosted checkout — the app never receives or
 *    stores card details, billing names, or billing emails.
 *    Decision:   EXCLUDED (managed by Stripe; no app-side PII)
 *
 * Analysis response echoed to client
 *    The /api/analyze response includes the LLM's structured analysis output
 *    (scores, fees, suggested reply). This is transient — returned in the HTTP
 *    response and not separately persisted. The structured output in
 *    dealer_submissions.detectedFields (JSONB) contains extracted financial
 *    signals, not raw user text.
 *    Decision:   EXCLUDED (financial signals only, not raw text)
 *
 * Temporary files
 *    No temp files are written to disk anywhere in the pipeline. All file
 *    processing uses in-memory buffers.
 *    Decision:   NOT APPLICABLE
 *
 * ── retentionExpiresAt FIELD SEMANTICS ───────────────────────────────────
 *
 * IMPORTANT: The raw.user_analyses.retentionExpiresAt column serves a DUAL
 * purpose in the current schema:
 *
 *   (a) BEFORE cleanup: holds the scheduled expiry timestamp (submitted_at + 90d)
 *   (b) AFTER cleanup:  overwritten with NOW() to serve as a cleared-at marker
 *
 * This overloading is acknowledged as semantic debt. It is preserved because
 * adding a dedicated cleared_at column is out of scope (no schema changes).
 *
 * SAFEGUARDS against misuse:
 *   1. The cleanup job uses submitted_at < cutoff for eligibility — it NEVER
 *      reads retentionExpiresAt to decide whether to clear a row.
 *   2. After cleanup, submittedTextRedacted IS NULL is the canonical indicator
 *      that a row has been cleared. Any future code should check
 *      submittedTextRedacted IS NULL rather than inspecting retentionExpiresAt.
 *   3. A codebase search confirmed NO other code reads retentionExpiresAt for
 *      any conditional logic. It is only written during ingestion (warehouseWriter,
 *      backfill) and during cleanup. This means the overloading is currently safe.
 *   4. If a dedicated cleared_at column is added in the future, the cleanup job
 *      should be updated to write to that column instead of retentionExpiresAt.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * REMAINING TECHNICAL DEBT
 * ═══════════════════════════════════════════════════════════════════════════
 * - retentionExpiresAt is overloaded (see above). A dedicated cleared_at
 *   column on raw.user_analyses would eliminate this ambiguity.
 * - metrics_events.metadata could theoretically contain PII if an upstream
 *   error handler echoes user text into errorMessage. A broader logging audit
 *   would be needed to fully mitigate this.
 * - piiRedact.ts is best-effort regex-based. Non-standard PII formats may
 *   escape redaction, meaning rawTextRedacted may still contain some PII
 *   during the 90-day retention window. The cleanup job eliminates this
 *   residual risk by nulling the field entirely after 90 days.
 *
 * HOW TO RUN
 * ──────────
 * Normal run (live, batched):
 *   npm run pii:cleanup
 *
 * Dry-run (no DB changes, prints what WOULD be cleared):
 *   npm run pii:cleanup:dry
 *   — or —
 *   npx tsx server/scripts/runPiiCleanup.ts --dry-run
 *
 * The job is also registered in server/warehouse/scheduler.ts and runs
 * automatically once at server startup (after a short delay) and then
 * every 24 hours.
 */

import { db } from "../db";
import { sql } from "drizzle-orm";

export const PII_RETENTION_DAYS = 90;

export interface PiiCleanupOptions {
  dryRun?: boolean;
  batchSize?: number;
}

export interface TableResult {
  table: string;
  action: "redact" | "delete";
  scannedCount: number;
  eligibleCount: number;
  clearedCount: number;
  skippedCount: number;
  error?: string;
}

export interface PiiCleanupResult {
  cutoffAt: Date;
  dryRun: boolean;
  tables: TableResult[];
  totalCleared: number;
  durationMs: number;
}

function log(event: string, data: Record<string, unknown>): void {
  console.log(JSON.stringify({ event, timestamp: new Date().toISOString(), ...data }));
}

/**
 * Redact rawTextRedacted from public.dealer_submissions for rows with
 * submitted_at < cutoffAt where rawTextClearedAt is still NULL (idempotent).
 */
async function cleanDealerSubmissions(
  cutoffAt: Date,
  dryRun: boolean,
  batchSize: number,
): Promise<TableResult> {
  const table = "public.dealer_submissions";
  let clearedCount = 0;

  try {
    // Count total rows in the retention window (scanned)
    const scannedResult = await db.execute(sql`
      SELECT COUNT(*)::int AS cnt
      FROM dealer_submissions
      WHERE submitted_at < ${cutoffAt}
    `);
    const scannedCount = (scannedResult.rows[0] as { cnt: number }).cnt ?? 0;

    // Count eligible rows (have text, not yet cleared)
    const eligibleResult = await db.execute(sql`
      SELECT COUNT(*)::int AS cnt
      FROM dealer_submissions
      WHERE submitted_at < ${cutoffAt}
        AND raw_text_redacted IS NOT NULL
        AND raw_text_cleared_at IS NULL
    `);
    const eligibleCount = (eligibleResult.rows[0] as { cnt: number }).cnt ?? 0;

    // Count already-cleared (skipped)
    const skippedResult = await db.execute(sql`
      SELECT COUNT(*)::int AS cnt
      FROM dealer_submissions
      WHERE submitted_at < ${cutoffAt}
        AND raw_text_cleared_at IS NOT NULL
    `);
    const skippedCount = (skippedResult.rows[0] as { cnt: number }).cnt ?? 0;

    log("pii_cleanup_table_scanned", {
      table, cutoffAt, dryRun,
      scannedCount, eligibleCount, skippedCount,
    });

    if (dryRun) {
      return { table, action: "redact", scannedCount, eligibleCount, clearedCount: 0, skippedCount };
    }

    // Process in batches — eligible condition: submitted_at < cutoffAt (strict less-than)
    while (true) {
      const result = await db.execute(sql`
        WITH batch AS (
          SELECT id FROM dealer_submissions
          WHERE submitted_at < ${cutoffAt}
            AND raw_text_redacted IS NOT NULL
            AND raw_text_cleared_at IS NULL
          LIMIT ${batchSize}
        )
        UPDATE dealer_submissions
        SET
          raw_text_redacted = NULL,
          raw_text_cleared_at = NOW()
        FROM batch
        WHERE dealer_submissions.id = batch.id
      `);

      const batchCount = result.rowCount ?? 0;
      clearedCount += batchCount;

      log("pii_cleanup_table_deleted", {
        table, action: "redact",
        batchRows: batchCount, totalSoFar: clearedCount, cutoffAt,
      });

      if (batchCount < batchSize) break;
    }

    return { table, action: "redact", scannedCount, eligibleCount, clearedCount, skippedCount };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    log("pii_cleanup_failed", { table, cutoffAt, error });
    return { table, action: "redact", scannedCount: 0, eligibleCount: 0, clearedCount, skippedCount: 0, error };
  }
}

/**
 * Redact submittedTextRedacted from raw.user_analyses for rows with
 * submitted_at < cutoffAt where submittedTextRedacted is still non-NULL (idempotent).
 *
 * NOTE on retentionExpiresAt: This UPDATE also stamps retention_expires_at = NOW()
 * as a cleared-at audit marker. This OVERWRITES the original expiry timestamp.
 * See the file-level comment block for the full rationale and safeguards around
 * this semantic overloading. After this update, submittedTextRedacted IS NULL is
 * the canonical indicator that the row has been cleared — do NOT rely on
 * retentionExpiresAt alone to determine cleared status.
 */
async function cleanRawUserAnalyses(
  cutoffAt: Date,
  dryRun: boolean,
  batchSize: number,
): Promise<TableResult> {
  const table = "raw.user_analyses";
  let clearedCount = 0;

  try {
    // Count total rows in the retention window (scanned)
    const scannedResult = await db.execute(sql`
      SELECT COUNT(*)::int AS cnt
      FROM raw.user_analyses
      WHERE submitted_at < ${cutoffAt}
    `);
    const scannedCount = (scannedResult.rows[0] as { cnt: number }).cnt ?? 0;

    // Count eligible rows (have text, not yet cleared)
    const eligibleResult = await db.execute(sql`
      SELECT COUNT(*)::int AS cnt
      FROM raw.user_analyses
      WHERE submitted_at < ${cutoffAt}
        AND submitted_text_redacted IS NOT NULL
    `);
    const eligibleCount = (eligibleResult.rows[0] as { cnt: number }).cnt ?? 0;

    // Count already-cleared (skipped)
    const skippedResult = await db.execute(sql`
      SELECT COUNT(*)::int AS cnt
      FROM raw.user_analyses
      WHERE submitted_at < ${cutoffAt}
        AND submitted_text_redacted IS NULL
    `);
    const skippedCount = (skippedResult.rows[0] as { cnt: number }).cnt ?? 0;

    log("pii_cleanup_table_scanned", {
      table, cutoffAt, dryRun,
      scannedCount, eligibleCount, skippedCount,
    });

    if (dryRun) {
      return { table, action: "redact", scannedCount, eligibleCount, clearedCount: 0, skippedCount };
    }

    // Process in batches — eligible condition: submitted_at < cutoffAt (strict less-than)
    // retentionExpiresAt is OVERWRITTEN with NOW() as the cleared-at audit marker.
    // See file-level comment for rationale and safeguards.
    while (true) {
      const result = await db.execute(sql`
        WITH batch AS (
          SELECT id FROM raw.user_analyses
          WHERE submitted_at < ${cutoffAt}
            AND submitted_text_redacted IS NOT NULL
          LIMIT ${batchSize}
        )
        UPDATE raw.user_analyses
        SET
          submitted_text_redacted = NULL,
          retention_expires_at = NOW()
        FROM batch
        WHERE raw.user_analyses.id = batch.id
      `);

      const batchCount = result.rowCount ?? 0;
      clearedCount += batchCount;

      log("pii_cleanup_table_deleted", {
        table, action: "redact",
        batchRows: batchCount, totalSoFar: clearedCount, cutoffAt,
      });

      if (batchCount < batchSize) break;
    }

    return { table, action: "redact", scannedCount, eligibleCount, clearedCount, skippedCount };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    log("pii_cleanup_failed", { table, cutoffAt, error });
    return { table, action: "redact", scannedCount: 0, eligibleCount: 0, clearedCount, skippedCount: 0, error };
  }
}

/**
 * Main PII cleanup job.
 *
 * Processes all PII-bearing tables in isolation — a failure in one table does
 * not abort the others.  Returns a full summary including per-table counts.
 *
 * Cutoff rule: submitted_at < cutoff (strict less-than).
 * A row submitted at exactly the cutoff timestamp is NOT eligible for cleanup.
 */
export async function runPiiCleanup(options: PiiCleanupOptions = {}): Promise<PiiCleanupResult> {
  const { dryRun = false, batchSize = 500 } = options;
  const startMs = Date.now();

  const cutoffAt = new Date(Date.now() - PII_RETENTION_DAYS * 24 * 60 * 60 * 1000);

  log("pii_cleanup_started", { cutoffAt, dryRun, batchSize, retentionDays: PII_RETENTION_DAYS });

  const [dealerResult, rawResult] = await Promise.all([
    cleanDealerSubmissions(cutoffAt, dryRun, batchSize),
    cleanRawUserAnalyses(cutoffAt, dryRun, batchSize),
  ]);

  const tables = [dealerResult, rawResult];
  const totalCleared = tables.reduce((sum, r) => sum + r.clearedCount, 0);
  const durationMs = Date.now() - startMs;

  log("pii_cleanup_completed", {
    cutoffAt, dryRun, totalCleared, durationMs,
    tables: tables.map((r) => ({
      table: r.table,
      action: r.action,
      scannedCount: r.scannedCount,
      eligibleCount: r.eligibleCount,
      clearedCount: r.clearedCount,
      skippedCount: r.skippedCount,
      error: r.error ?? null,
    })),
  });

  return { cutoffAt, dryRun, tables, totalCleared, durationMs };
}
