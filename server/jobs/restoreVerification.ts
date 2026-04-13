/**
 * Restore Verification Job
 *
 * Validates disaster recovery readiness by:
 *   1. Downloading the latest S3 backup
 *   2. Restoring it into a throwaway verification database
 *   3. Running sanity queries against the restored data
 *
 * Fires an alert via the existing alert system on any failure.
 * Logs success silently (no alert on success).
 *
 * Environment variables:
 *   RESTORE_VERIFY_DB_URL  — connection string for the throwaway verification DB (required)
 *   BACKUP_S3_BUCKET       — S3 bucket (required)
 *   BACKUP_S3_REGION       — AWS region (default: us-east-1)
 *   BACKUP_S3_PREFIX       — key prefix (default: odigos-backups)
 */

import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import pg from "pg";

export interface VerificationResult {
  success: boolean;
  backupFile: string | null;
  restoreDurationMs: number;
  validationDurationMs: number;
  counts: Record<string, number>;
  error: string | null;
  failedStep: "download" | "restore" | "query" | null;
}

// ── S3 helpers (duplicated from restore.ts to avoid import issues with CLI module) ──

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

// ── Validation queries ──────────────────────────────────────────────────────

const VALIDATION_QUERIES: Array<{ label: string; query: string }> = [
  { label: "raw.user_analyses", query: "SELECT COUNT(*)::integer AS cnt FROM raw.user_analyses" },
  { label: "core.dealers", query: "SELECT COUNT(*)::integer AS cnt FROM core.dealers" },
  { label: "core.listings", query: "SELECT COUNT(*)::integer AS cnt FROM core.listings" },
  { label: "core.analysis_line_items", query: "SELECT COUNT(*)::integer AS cnt FROM core.analysis_line_items" },
];

// ── Main verification function ──────────────────────────────────────────────

export async function runRestoreVerification(): Promise<VerificationResult> {
  const verifyDbUrl = process.env.RESTORE_VERIFY_DB_URL;
  if (!verifyDbUrl) {
    throw new Error(
      "RESTORE_VERIFY_DB_URL is not set — cannot run restore verification.\n" +
      "Set this to a throwaway database connection string.",
    );
  }

  let backupFile: string | null = null;
  let dumpPath: string | null = null;
  const restoreStart = Date.now();
  let restoreDurationMs = 0;
  let validationDurationMs = 0;

  try {
    // ── Step 1: Download ──────────────────────────────────────────────────
    console.log("[restore-verify] Downloading latest backup from S3…");

    let backupKey: string;
    try {
      const latest = await getLatestBackupKey();
      backupKey = latest.key;
      backupFile = path.basename(backupKey);
      console.log(`[restore-verify] Latest backup: ${backupKey} (${latest.lastModified.toISOString()})`);
    } catch (err) {
      return {
        success: false,
        backupFile: null,
        restoreDurationMs: 0,
        validationDurationMs: 0,
        counts: {},
        error: `S3 download failed: ${err instanceof Error ? err.message : String(err)}`,
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
        restoreDurationMs: 0,
        validationDurationMs: 0,
        counts: {},
        error: `S3 download failed: ${err instanceof Error ? err.message : String(err)}`,
        failedStep: "download",
      };
    }

    // ── Step 2: Restore ───────────────────────────────────────────────────
    console.log("[restore-verify] Running pg_restore into verification database…");

    try {
      execSync(
        `pg_restore --clean --if-exists --no-owner --dbname="${verifyDbUrl}" "${dumpPath}"`,
        { stdio: "inherit" },
      );
    } catch (err) {
      const execErr = err as { status?: number };
      // Exit code 1 = warnings only (non-fatal), >1 = real failure
      if (execErr.status && execErr.status > 1) {
        return {
          success: false,
          backupFile,
          restoreDurationMs: Date.now() - restoreStart,
          validationDurationMs: 0,
          counts: {},
          error: `pg_restore failed with exit code ${execErr.status}`,
          failedStep: "restore",
        };
      }
      console.warn("[restore-verify] pg_restore completed with warnings (exit code 1).");
    }

    restoreDurationMs = Date.now() - restoreStart;
    console.log(`[restore-verify] Restore complete (${(restoreDurationMs / 1000).toFixed(1)}s)`);

    // ── Step 3: Validation queries ────────────────────────────────────────
    console.log("[restore-verify] Running validation queries…");
    const validationStart = Date.now();

    const pool = new pg.Pool({
      connectionString: verifyDbUrl,
      max: 1,
      connectionTimeoutMillis: 10000,
    });

    const counts: Record<string, number> = {};

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
            restoreDurationMs,
            validationDurationMs: Date.now() - validationStart,
            counts,
            error: `Validation failed: ${label} has 0 rows — backup may be empty or corrupt`,
            failedStep: "query",
          };
        }

        console.log(`[restore-verify]   ${label}: ${count} rows`);
      }

      // Optional: check latest timestamp recency
      try {
        const recencyResult = await pool.query(
          "SELECT MAX(analyzed_at) AS latest FROM core.listings",
        );
        const latest = recencyResult.rows[0]?.latest;
        if (latest) {
          const ageHours = (Date.now() - new Date(latest).getTime()) / (1000 * 60 * 60);
          console.log(`[restore-verify]   Latest listing: ${new Date(latest).toISOString()} (${ageHours.toFixed(1)}h ago)`);
        }
      } catch {
        // Recency check is optional — don't fail on it
      }

      await pool.end();
    } catch (err) {
      try { await pool.end(); } catch { /* ignore */ }
      return {
        success: false,
        backupFile,
        restoreDurationMs,
        validationDurationMs: Date.now() - validationStart,
        counts,
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
      restoreDurationMs,
      validationDurationMs,
      counts,
      error: null,
      failedStep: null,
    };
  } finally {
    // Clean up temp file
    if (dumpPath) {
      try {
        fs.unlinkSync(dumpPath);
        fs.rmdirSync(path.dirname(dumpPath));
      } catch {
        // best-effort
      }
    }
  }
}
