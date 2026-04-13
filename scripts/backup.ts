/**
 * Database backup script using pg_dump.
 *
 * Usage:
 *   tsx scripts/backup.ts
 *
 * Writes a timestamped .dump file into backups/ using pg_dump's custom format.
 * Uploads to S3 if BACKUP_REMOTE_ENABLED=true and BACKUP_S3_BUCKET is set.
 * Exits non-zero on failure.
 */

import { runBackup } from "../server/jobs/backup";

async function run(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("[backup] ERROR: DATABASE_URL environment variable is not set.");
    process.exit(1);
  }

  console.log("[backup] Starting pg_dump…");

  try {
    const result = await runBackup();
    console.log(`[backup] Success. File: ${result.filePath}  Size: ${result.sizeBytes} bytes`);
    if (result.remotePath) {
      console.log(`[backup] Remote: ${result.remotePath}`);
    }
    if (result.cleanedUpCount > 0) {
      console.log(`[backup] Cleaned up ${result.cleanedUpCount} old backup(s)`);
    }
  } catch (err) {
    console.error("[backup] ERROR: backup failed:", err);
    process.exit(1);
  }
}

run();
