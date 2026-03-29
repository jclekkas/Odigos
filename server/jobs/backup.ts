import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

export interface BackupResult {
  filePath: string;
  sizeBytes: number;
}

export function runBackup(): BackupResult {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is not set.");
  }

  const backupsDir = path.resolve("backups");
  if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir, { recursive: true });
  }

  const now = new Date();
  const timestamp = now.toISOString().replace(/:/g, "-").replace(/\..+$/, "");
  const filename = `backup-${timestamp}.dump`;
  const dumpPath = path.join(backupsDir, filename);

  execSync(`pg_dump --format=custom --file="${dumpPath}" "${databaseUrl}"`, {
    stdio: "pipe",
  });

  const stat = fs.statSync(dumpPath);
  return { filePath: dumpPath, sizeBytes: stat.size };
}
