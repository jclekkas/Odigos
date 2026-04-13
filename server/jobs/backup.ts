import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

export interface BackupResult {
  filePath: string;
  sizeBytes: number;
  remotePath: string | null;
  cleanedUpCount: number;
}

const BACKUPS_DIR = path.resolve("backups");

/**
 * Upload a backup file to S3-compatible storage.
 * Requires: BACKUP_S3_BUCKET, BACKUP_S3_REGION (optional prefix via BACKUP_S3_PREFIX).
 */
async function uploadToS3(filePath: string): Promise<string> {
  const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");

  const bucket = process.env.BACKUP_S3_BUCKET!;
  const region = process.env.BACKUP_S3_REGION || "us-east-1";
  const prefix = process.env.BACKUP_S3_PREFIX || "odigos-backups";

  const client = new S3Client({ region });
  const key = `${prefix}/${path.basename(filePath)}`;

  const fileStream = fs.readFileSync(filePath);

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: fileStream,
      ContentType: "application/octet-stream",
    }),
  );

  const remotePath = `s3://${bucket}/${key}`;
  console.log(`[backup] Uploaded to ${remotePath}`);
  return remotePath;
}

/**
 * Delete local backup files older than the retention period.
 * Returns the number of files cleaned up.
 */
function cleanupOldBackups(): number {
  const retentionDays = parseInt(process.env.BACKUP_LOCAL_RETENTION_DAYS || "7", 10);
  const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000;

  if (!fs.existsSync(BACKUPS_DIR)) return 0;

  const files = fs.readdirSync(BACKUPS_DIR).filter((f) => f.endsWith(".dump"));
  let cleaned = 0;

  for (const file of files) {
    const fullPath = path.join(BACKUPS_DIR, file);
    const stat = fs.statSync(fullPath);
    if (stat.mtimeMs < cutoff) {
      fs.unlinkSync(fullPath);
      console.log(`[backup] Cleaned up old backup: ${file}`);
      cleaned++;
    }
  }

  return cleaned;
}

export async function runBackup(): Promise<BackupResult> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is not set.");
  }

  if (!fs.existsSync(BACKUPS_DIR)) {
    fs.mkdirSync(BACKUPS_DIR, { recursive: true });
  }

  const now = new Date();
  const timestamp = now.toISOString().replace(/:/g, "-").replace(/\..+$/, "");
  const filename = `backup-${timestamp}.dump`;
  const dumpPath = path.join(BACKUPS_DIR, filename);

  // Capture stderr so pg_dump failures are visible instead of silently swallowed
  let stderr = "";
  try {
    execSync(`pg_dump --format=custom --file="${dumpPath}" "${databaseUrl}"`, {
      stdio: ["pipe", "pipe", "pipe"],
      encoding: "utf-8",
    });
  } catch (err: unknown) {
    const execErr = err as { stderr?: string };
    stderr = execErr.stderr ?? "";
    throw new Error(`pg_dump failed: ${stderr || "unknown error"}`);
  }

  // Verify the dump file was actually created and is non-empty
  if (!fs.existsSync(dumpPath)) {
    throw new Error(`pg_dump completed but dump file not found at ${dumpPath}`);
  }
  const stat = fs.statSync(dumpPath);
  if (stat.size === 0) {
    fs.unlinkSync(dumpPath);
    throw new Error("pg_dump produced an empty file — backup is invalid");
  }

  console.log(`[backup] Local backup created: ${filename} (${stat.size} bytes)`);

  // Upload to S3 if configured
  let remotePath: string | null = null;
  const remoteEnabled = process.env.BACKUP_REMOTE_ENABLED === "true";
  const s3Bucket = process.env.BACKUP_S3_BUCKET;

  if (remoteEnabled && s3Bucket) {
    try {
      remotePath = await uploadToS3(dumpPath);
    } catch (uploadErr) {
      // Remote upload failure should not fail the backup — local copy still exists
      console.error("[backup] Remote upload failed (local backup is safe):", uploadErr);
    }
  }

  // Clean up old local backups
  const cleanedUpCount = cleanupOldBackups();

  return { filePath: dumpPath, sizeBytes: stat.size, remotePath, cleanedUpCount };
}
