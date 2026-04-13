/**
 * Database restore script with S3 download support.
 *
 * Usage:
 *   tsx scripts/restore.ts                                          # download latest from S3, restore to TARGET_DB_URL
 *   tsx scripts/restore.ts backups/backup-2026-03-29T10-30-00.dump  # restore a local file
 *   tsx scripts/restore.ts --i-know-this-is-production              # allow restore when target looks like production
 *
 * Environment variables:
 *   TARGET_DB_URL          — connection string for the restore target (required)
 *   DATABASE_URL           — production connection string (used to detect prod target)
 *   BACKUP_S3_BUCKET       — S3 bucket name (required when no local file arg)
 *   BACKUP_S3_REGION       — AWS region (default: us-east-1)
 *   BACKUP_S3_PREFIX       — key prefix inside bucket (default: odigos-backups)
 *   NODE_ENV               — when "production", requires --i-know-this-is-production flag
 *
 * Exits non-zero on any failure.
 */

import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

// ── Arg parsing ─────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const forceProduction = args.includes("--i-know-this-is-production");
const localFileArg = args.find((a) => !a.startsWith("--"));

// ── Resolve target DB ───────────────────────────────────────────────────────

const targetDbUrl = process.env.TARGET_DB_URL;
if (!targetDbUrl) {
  console.error("[restore] ERROR: TARGET_DB_URL environment variable is not set.");
  process.exit(1);
}

// ── Production safety gate ──────────────────────────────────────────────────
// Two checks: (1) NODE_ENV === production, (2) TARGET_DB_URL matches DATABASE_URL.
// Either condition triggers the gate. NODE_ENV can be misconfigured, but a
// matching DATABASE_URL is a stronger signal that this is the production DB.

const nodeEnv = (process.env.NODE_ENV || "production").toLowerCase();
const productionDbUrl = process.env.DATABASE_URL;
const targetMatchesProd = productionDbUrl && targetDbUrl === productionDbUrl;

if ((nodeEnv === "production" || targetMatchesProd) && !forceProduction) {
  const reasons: string[] = [];
  if (nodeEnv === "production") reasons.push("NODE_ENV is \"production\"");
  if (targetMatchesProd) reasons.push("TARGET_DB_URL matches DATABASE_URL (production)");

  console.error(
    `[restore] ERROR: ${reasons.join(" and ")}.\n` +
    "  Restoring into a production database requires the --i-know-this-is-production flag.\n" +
    "  Example: tsx scripts/restore.ts --i-know-this-is-production",
  );
  process.exit(1);
}

if (targetMatchesProd && forceProduction) {
  console.warn(
    "[restore] WARNING: TARGET_DB_URL matches DATABASE_URL — you are restoring into the PRODUCTION database.",
  );
}

// ── S3 download helper ──────────────────────────────────────────────────────

interface S3BackupInfo {
  key: string;
  lastModified: Date;
}

async function getLatestS3Backup(): Promise<S3BackupInfo> {
  const { S3Client, ListObjectsV2Command } = await import("@aws-sdk/client-s3");

  const bucket = process.env.BACKUP_S3_BUCKET;
  if (!bucket) {
    throw new Error("BACKUP_S3_BUCKET is not set — cannot list remote backups.");
  }

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

async function downloadFromS3(key: string): Promise<string> {
  const { S3Client, GetObjectCommand } = await import("@aws-sdk/client-s3");

  const bucket = process.env.BACKUP_S3_BUCKET!;
  const region = process.env.BACKUP_S3_REGION || "us-east-1";

  const client = new S3Client({ region });
  const resp = await client.send(
    new GetObjectCommand({ Bucket: bucket, Key: key }),
  );

  if (!resp.Body) {
    throw new Error(`S3 returned empty body for key: ${key}`);
  }

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "odigos-restore-"));
  const localPath = path.join(tmpDir, path.basename(key));

  // Stream body to file
  const bodyBytes = await resp.Body.transformToByteArray();
  fs.writeFileSync(localPath, bodyBytes);

  const stat = fs.statSync(localPath);
  if (stat.size === 0) {
    throw new Error(`Downloaded file is empty: ${localPath}`);
  }

  return localPath;
}

// ── Restore logic ───────────────────────────────────────────────────────────

export interface RestoreResult {
  backupFile: string;
  backupKey: string | null;
  source: "local" | "s3";
  durationMs: number;
}

export async function runRestore(opts?: {
  localFile?: string;
  targetUrl?: string;
}): Promise<RestoreResult> {
  const dbUrl = opts?.targetUrl ?? targetDbUrl!;
  const fileArg = opts?.localFile ?? localFileArg;
  const startMs = Date.now();

  let dumpPath: string;
  let source: "local" | "s3";
  let isTempFile = false;
  let s3Key: string | null = null;

  if (fileArg) {
    // ── Local file path provided ──────────────────────────────────────────
    dumpPath = path.resolve(fileArg);
    source = "local";

    if (!fs.existsSync(dumpPath)) {
      throw new Error(`Dump file not found: ${dumpPath}`);
    }
    console.log(`[restore] Using local file: ${dumpPath}`);
  } else {
    // ── Download latest from S3 ───────────────────────────────────────────
    console.log("[restore] No local file specified — downloading latest from S3…");
    const latest = await getLatestS3Backup();
    s3Key = latest.key;
    console.log(`[restore] Latest backup: s3://${process.env.BACKUP_S3_BUCKET}/${latest.key} (${latest.lastModified.toISOString()})`);

    dumpPath = await downloadFromS3(latest.key);
    source = "s3";
    isTempFile = true;

    const stat = fs.statSync(dumpPath);
    console.log(`[restore] Downloaded to ${dumpPath} (${stat.size} bytes)`);
  }

  // ── Run pg_restore ────────────────────────────────────────────────────────
  console.log("[restore] Starting pg_restore…");

  try {
    execSync(
      `pg_restore --clean --if-exists --no-owner --dbname="${dbUrl}" "${dumpPath}"`,
      { stdio: "inherit" },
    );
  } catch (err) {
    // pg_restore exits non-zero on warnings (e.g., "table does not exist" during --clean).
    // In the manual restore path, exit code 1 is treated as a warning because the
    // operator can inspect the output and verify the result. Exit code >1 is fatal.
    const execErr = err as { status?: number };
    if (execErr.status && execErr.status > 1) {
      throw new Error(`pg_restore failed with exit code ${execErr.status}`);
    }
    console.warn(
      "[restore] pg_restore completed with warnings (exit code 1).\n" +
      "  This typically means --clean tried to drop objects that don't exist yet.\n" +
      "  Verify restored data manually if this is unexpected.",
    );
  }

  const durationMs = Date.now() - startMs;

  // Clean up temp file
  if (isTempFile) {
    try {
      fs.unlinkSync(dumpPath);
      fs.rmdirSync(path.dirname(dumpPath));
    } catch {
      // best-effort cleanup
    }
  }

  const keyInfo = s3Key ? `  S3 key: ${s3Key}` : "";
  console.log(`[restore] Restore complete. Duration: ${(durationMs / 1000).toFixed(1)}s  Source: ${source}  File: ${path.basename(dumpPath)}${keyInfo}`);

  return { backupFile: path.basename(dumpPath), backupKey: s3Key, source, durationMs };
}

// ── CLI entrypoint ──────────────────────────────────────────────────────────

async function main(): Promise<void> {
  try {
    await runRestore();
  } catch (err) {
    console.error("[restore] ERROR:", err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

// Only run as CLI when executed directly (not when imported)
const isDirectRun = process.argv[1]?.endsWith("restore.ts") || process.argv[1]?.endsWith("restore.js");
if (isDirectRun) {
  main();
}
