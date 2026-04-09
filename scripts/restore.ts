/**
 * Manual database restore script using pg_restore.
 *
 * Usage:
 *   tsx scripts/restore.ts backups/backup-2026-03-29T10-30-00.dump
 *
 * This script is for manual use only — it is NOT scheduled.
 * Requires DATABASE_URL to be set and the dump file to exist.
 * Exits non-zero on failure.
 */

import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

function run(): void {
  const dumpArg = process.argv[2];
  if (!dumpArg) {
    console.error("[restore] ERROR: No dump file path provided.");
    console.error("  Usage: tsx scripts/restore.ts backups/backup-2026-03-29T10-30-00.dump");
    process.exit(1);
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("[restore] ERROR: DATABASE_URL environment variable is not set.");
    process.exit(1);
  }

  const dumpPath = path.resolve(dumpArg);
  if (!fs.existsSync(dumpPath)) {
    console.error(`[restore] ERROR: Dump file not found: ${dumpPath}`);
    process.exit(1);
  }

  console.log(`[restore] Starting pg_restore from ${dumpPath}`);

  try {
    execSync(`pg_restore --clean --if-exists --no-owner --dbname="${databaseUrl}" "${dumpPath}"`, {
      stdio: "inherit",
    });
  } catch (err) {
    console.error("[restore] ERROR: pg_restore failed:", err);
    process.exit(1);
  }

  console.log("[restore] Success. Database restored from:", dumpPath);
}

run();
