/**
 * Restore Verification Job
 *
 * Validates disaster recovery readiness by:
 *   1. Downloading the latest S3 backup
 *   2. Restoring it into a persistent throwaway verification database
 *   3. Running sanity queries against the restored data
 *   4. Checking data recency against a concrete threshold
 *
 * The verification database (RESTORE_VERIFY_DB_URL) is a persistent scratch DB
 * that gets overwritten on each run via pg_restore --clean. It is NOT
 * created or dropped by this job — provision it once and leave it.
 *
 * pg_restore ANY non-zero exit code (including exit code 1) is treated as a
 * failure in the automated path. Exit code 1 can mask real issues (e.g.,
 * missing extensions, failed schema objects) that would leave the restored
 * database in an incomplete state. Operators running manual restores via
 * scripts/restore.ts can make their own judgment about warnings.
 *
 * Fires an alert via the existing alert system on any failure.
 * Logs success silently (no alert on success).
 *
 * Environment variables:
 *   RESTORE_VERIFY_DB_URL          — connection string for the throwaway verification DB (required)
 *   BACKUP_S3_BUCKET               — S3 bucket (required)
 *   BACKUP_S3_REGION               — AWS region (default: us-east-1)
 *   BACKUP_S3_PREFIX               — key prefix (default: odigos-backups)
 *   RESTORE_VERIFY_MAX_AGE_HOURS   — fail if latest listing is older than this (default: 48)
 */

import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import pg from "pg";

export interface VerificationResult {
  success: boolean;
  backupFile: string | null;
  backupKey: string | null;
  restoreDurationMs: number;
  validationDurationMs: number;
  counts: Record<string, number>;
  latestListingAge: number | null;
  error: string | null;
  failedStep: "download" | "restore" | "query" | null;
}

// ── Overlap guard ───────────────────────────────────────────────────────────
// Prevents concurrent runs if the scheduler ticks while a prior run is still
// in progress (e.g., slow S3 download or large restore).

let _running = false;

// ── S3 helpers ──────────────────────────────────────────────────────────────

async function getLatestBackupKey(): Promise<{ key: string; lastModified: Date }> {
  const { S3Client, ListObjectsV2Command } = await import("@aws-sdk/client-s3");

  const bucket = process.env.BACKUP_S3_BUCKET;
  if (!bucket) throw new Error("BACKUP_S3_BUCKET is not set");

  const region = process.env.BACKUP_S3_REGION || "us-east-1";
  const prefix = process.env.BACKUP_S3_PREFIX || "odigos-backups";

  const client = new S3Client({ region });
  const resp = await client.send(
    new ListObjectsV2Command({ Bucket: bucket, Prefix: `${prefix}/` }),
  );

  const dumps = (resp.Contents ?? [])
    .filter((obj) => obj.Key?.endsWith(".dump") && obj.LastModified)
    .sort((a, b) => b.LastModified!.getTime() - a.LastModified!.getTime());

  if (dumps.length === 0) {
    throw new Error(`No .dump files found in s3://${bucket}/${prefix}/`);
  }

  return { key: dumps[0].Key!, lastModified: dumps[0].LastModified! };
}

async function downloadBackup(key: string): Promise<string> {
  const { S3Client, GetObjectCommand } = await import("@aws-sdk/client-s3");

  const bucket = process.env.BACKUP_S3_BUCKET!;
  const region = process.env.BACKUP_S3_REGION || "us-east-1";

  const client = new S3Client({ region });
  const resp = await client.send(
    new GetObjectCommand({ Bucket: bucket, Key: key }),
  );

  if (!resp.Body) throw new Error(`S3 returned empty body for key: ${key}`);

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "odigos-verify-"));
  const localPath = path.join(tmpDir, path.basename(key));

  const bodyBytes = await resp.Body.transformToByteArray();
  fs.writeFileSync(localPath, bodyBytes);

  if (fs.statSync(localPath).size === 0) {
    throw new Error(`Downloaded file is empty: ${localPath}`);
  }

  return localPath;
}

function cleanupTempFile(filePath: string | null): void {
  if (!filePath) return;
  try { fs.unlinkSync(filePath); } catch { /* best-effort */ }
  try { fs.rmdirSync(path.dirname(filePath)); } catch { /* best-effort */ }
}

// ── Validation queries ──────────────────────────────────────────────────────

const VALIDATION_QUERIES: Array<{ label: string; query: string }> = [
  { label: "raw.user_analyses", query: "SELECT COUNT(*)::integer AS cnt FROM raw.user_analyses" },
  { label: "core.dealers", query: "SELECT COUNT(*)::integer AS cnt FROM core.dealers" },
  { label: "core.listings", query: "SELECT COUNT(*)::integer AS cnt FROM core.listings" },
  { label: "core.analysis_line_items", query: "SELECT COUNT(*)::integer AS cnt FROM core.analysis_line_items" },
];

// ── Main verification function ──────────────────────────────────────────────

export async function runRestoreVerification(): Promise<VerificationResult> {
  if (_running) {
    console.warn("[restore-verify] Skipping — previous run still in progress.");
    return {
      success: true,
      backupFile: null,
      backupKey: null,
      restoreDurationMs: 0,
      validationDurationMs: 0,
      counts: {},
      latestListingAge: null,
      error: null,
      failedStep: null,
    };
  }

  _running = true;

  const verifyDbUrl = process.env.RESTORE_VERIFY_DB_URL;
  if (!verifyDbUrl) {
    _running = false;
    throw new Error(
      "RESTORE_VERIFY_DB_URL is not set — cannot run restore verification.\n" +
      "Set this to a persistent throwaway database connection string.",
    );
  }

  const maxAgeHours = parseInt(process.env.RESTORE_VERIFY_MAX_AGE_HOURS || "48", 10);

  let backupFile: string | null = null;
  let backupKey: string | null = null;
  let dumpPath: string | null = null;
  const restoreStart = Date.now();
  let restoreDurationMs = 0;
  let validationDurationMs = 0;

  try {
    // ── Step 1: Download ──────────────────────────────────────────────────
    console.log("[restore-verify] Downloading latest backup from S3…");

    try {
      const latest = await getLatestBackupKey();
      backupKey = latest.key;
      backupFile = path.basename(backupKey);
      console.log(`[restore-verify] Latest backup: ${backupKey} (${latest.lastModified.toISOString()})`);
    } catch (err) {
      return {
        success: false,
        backupFile: null,
        backupKey: null,
        restoreDurationMs: 0,
        validationDurationMs: 0,
        counts: {},
        latestListingAge: null,
        error: `S3 list failed: ${err instanceof Error ? err.message : String(err)}`,
        failedStep: "download",
      };
    }

    try {
      dumpPath = await downloadBackup(backupKey);
      console.log(`[restore-verify] Downloaded: ${dumpPath} (${fs.statSync(dumpPath).size} bytes)`);
    } catch (err) {
      return {
        success: false,
        backupFile,
        backupKey,
        restoreDurationMs: 0,
        validationDurationMs: 0,
        counts: {},
        latestListingAge: null,
        error: `S3 download failed: ${err instanceof Error ? err.message : String(err)}`,
        failedStep: "download",
      };
    }

    // ── Step 2: Restore (strict — ANY non-zero exit code is a failure) ────
    console.log("[restore-verify] Running pg_restore into verification database…");

    try {
      // Capture stderr so we can include it in failure messages
      execSync(
        `pg_restore --clean --if-exists --no-owner --dbname="${verifyDbUrl}" "${dumpPath}"`,
        { stdio: ["pipe", "pipe", "pipe"], encoding: "utf-8" },
      );
    } catch (err) {
      const execErr = err as { status?: number; stderr?: string };
      const exitCode = execErr.status ?? -1;
      const stderr = (execErr.stderr ?? "").trim();
      const stderrSnippet = stderr.length > 500 ? stderr.slice(0, 500) + "…" : stderr;

      // In the automated verification path, ANY non-zero exit code is a failure.
      // Exit code 1 ("warnings") can include missing extensions, failed object
      // restores, or permission errors that leave the DB in an incomplete state.
      return {
        success: false,
        backupFile,
        backupKey,
        restoreDurationMs: Date.now() - restoreStart,
        validationDurationMs: 0,
        counts: {},
        latestListingAge: null,
        error: `pg_restore exited with code ${exitCode}. stderr: ${stderrSnippet || "(empty)"}`,
        failedStep: "restore",
      };
    }

    restoreDurationMs = Date.now() - restoreStart;
    console.log(`[restore-verify] Restore complete — exit code 0 (${(restoreDurationMs / 1000).toFixed(1)}s)`);

    // ── Step 3: Validation queries ────────────────────────────────────────
    console.log("[restore-verify] Running validation queries…");
    const validationStart = Date.now();

    const pool = new pg.Pool({
      connectionString: verifyDbUrl,
      max: 1,
      connectionTimeoutMillis: 10000,
    });

    const counts: Record<string, number> = {};
    let latestListingAge: number | null = null;

    try {
      for (const { label, query } of VALIDATION_QUERIES) {
        const result = await pool.query(query);
        const count = parseInt(result.rows[0]?.cnt ?? "0", 10);
        counts[label] = count;

        if (count === 0) {
          await pool.end();
          return {
            success: false,
            backupFile,
            backupKey,
            restoreDurationMs,
            validationDurationMs: Date.now() - validationStart,
            counts,
            latestListingAge: null,
            error: `Validation failed: ${label} has 0 rows — backup may be empty or corrupt`,
            failedStep: "query",
          };
        }

        console.log(`[restore-verify]   ${label}: ${count} rows`);
      }

      // ── Recency check with concrete threshold ─────────────────────────
      const recencyResult = await pool.query(
        "SELECT MAX(analyzed_at) AS latest FROM core.listings",
      );
      const latestTimestamp = recencyResult.rows[0]?.latest;

      if (latestTimestamp) {
        const ageHours = (Date.now() - new Date(latestTimestamp).getTime()) / (1000 * 60 * 60);
        latestListingAge = ageHours;
        console.log(`[restore-verify]   Latest listing: ${new Date(latestTimestamp).toISOString()} (${ageHours.toFixed(1)}h ago, threshold: ${maxAgeHours}h)`);

        if (ageHours > maxAgeHours) {
          await pool.end();
          return {
            success: false,
            backupFile,
            backupKey,
            restoreDurationMs,
            validationDurationMs: Date.now() - validationStart,
            counts,
            latestListingAge: ageHours,
            error: `Recency check failed: latest listing is ${ageHours.toFixed(1)}h old, exceeds ${maxAgeHours}h threshold — backup may be stale`,
            failedStep: "query",
          };
        }
      } else {
        await pool.end();
        return {
          success: false,
          backupFile,
          backupKey,
          restoreDurationMs,
          validationDurationMs: Date.now() - validationStart,
          counts,
          latestListingAge: null,
          error: "Recency check failed: no analyzed_at timestamps found in core.listings",
          failedStep: "query",
        };
      }

      await pool.end();
    } catch (err) {
      try { await pool.end(); } catch { /* ignore */ }
      return {
        success: false,
        backupFile,
        backupKey,
        restoreDurationMs,
        validationDurationMs: Date.now() - validationStart,
        counts,
        latestListingAge,
        error: `Validation query failed: ${err instanceof Error ? err.message : String(err)}`,
        failedStep: "query",
      };
    }

    validationDurationMs = Date.now() - validationStart;

    console.log(
      `[restore-verify] Verification passed. ` +
      `Restore: ${(restoreDurationMs / 1000).toFixed(1)}s, ` +
      `Validation: ${(validationDurationMs / 1000).toFixed(1)}s`,
    );

    return {
      success: true,
      backupFile,
      backupKey,
      restoreDurationMs,
      validationDurationMs,
      counts,
      latestListingAge,
      error: null,
      failedStep: null,
    };
  } finally {
    cleanupTempFile(dumpPath);
    _running = false;
  }
}
