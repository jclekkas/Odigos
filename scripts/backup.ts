/**
 * Database backup script using pg_dump.
 *
 * Usage:
 *   tsx scripts/backup.ts
 *
 * Writes a timestamped .dump file into backups/ using pg_dump's custom format.
 * Exits non-zero on failure.
 */

import { runBackup } from "../server/jobs/backup";

function run(): void {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("[backup] ERROR: DATABASE_URL environment variable is not set.");
    process.exit(1);
  }

  console.log("[backup] Starting pg_dump…");

  try {
    const result = runBackup();
    console.log(`[backup] Success. File: ${result.filePath}  Size: ${result.sizeBytes} bytes`);
  } catch (err) {
    console.error("[backup] ERROR: pg_dump failed:", err);
    process.exit(1);
  }
}

run();
