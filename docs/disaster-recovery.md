# Disaster Recovery Runbook

## Backup Storage

Backups are PostgreSQL custom-format dumps created daily by `server/jobs/backup.ts`.

| Item | Value |
|---|---|
| Format | `pg_dump --format=custom` (.dump) |
| Local path | `backups/` directory (retention: 7 days, configurable via `BACKUP_LOCAL_RETENTION_DAYS`) |
| Remote | S3 bucket specified by `BACKUP_S3_BUCKET` |
| S3 prefix | `BACKUP_S3_PREFIX` (default: `odigos-backups`) |
| S3 region | `BACKUP_S3_REGION` (default: `us-east-1`) |
| Schedule | Every 24 hours via `server/warehouse/scheduler.ts` |

## Required Environment Variables

| Variable | Purpose | Required for |
|---|---|---|
| `TARGET_DB_URL` | Connection string for the restore target database | Manual restore |
| `DATABASE_URL` | Production connection string (also used for prod-target detection) | Production safety gate |
| `BACKUP_S3_BUCKET` | S3 bucket name | S3 download/upload |
| `BACKUP_S3_REGION` | AWS region | S3 operations |
| `BACKUP_S3_PREFIX` | Key prefix inside bucket | S3 operations |
| `RESTORE_VERIFY_DB_URL` | Persistent scratch DB for automated verification | Scheduled verification |
| `RESTORE_VERIFY_MAX_AGE_HOURS` | Max allowed age of latest listing (default: 48) | Recency check |
| `AWS_ACCESS_KEY_ID` | AWS credentials | S3 operations |
| `AWS_SECRET_ACCESS_KEY` | AWS credentials | S3 operations |

## Manual Restore

### From S3 (latest backup)

```bash
TARGET_DB_URL="postgresql://user:pass@host:5432/mydb" \
BACKUP_S3_BUCKET="my-backup-bucket" \
BACKUP_S3_PREFIX="odigos-backups" \
BACKUP_S3_REGION="us-east-1" \
NODE_ENV=staging \
  tsx scripts/restore.ts
```

### From a local file

```bash
TARGET_DB_URL="postgresql://user:pass@host:5432/mydb" \
NODE_ENV=staging \
  tsx scripts/restore.ts backups/backup-2026-04-13T10-30-00.dump
```

### Production Restore

Production restores are blocked by two independent safety checks:

1. `NODE_ENV === "production"`
2. `TARGET_DB_URL === DATABASE_URL` (target matches the known production DB)

Either condition triggers the gate. Both require `--i-know-this-is-production`:

```bash
NODE_ENV=production \
TARGET_DB_URL="$DATABASE_URL" \
DATABASE_URL="$DATABASE_URL" \
BACKUP_S3_BUCKET="my-backup-bucket" \
  tsx scripts/restore.ts --i-know-this-is-production
```

**Before restoring to production:**

1. Notify stakeholders that the service will be temporarily unavailable
2. Stop the application server to prevent writes during restore
3. Take a fresh backup of the current state (even if corrupted, for forensics)
4. Run the restore
5. Verify critical tables have expected row counts
6. Restart the application server

### pg_restore exit code behavior

| Context | Exit code 0 | Exit code 1 | Exit code > 1 |
|---|---|---|---|
| **Manual restore** (`scripts/restore.ts`) | Success | Warning logged, operator verifies | Fatal error |
| **Automated verification** (`restoreVerification.ts`) | Success | **Failure** — alert fired | **Failure** — alert fired |

Exit code 1 is treated as a **failure** in the automated verification path because it can include missing extensions, failed schema objects, or permission errors that leave the database in an incomplete state. Operators running manual restores can inspect the warnings and make their own judgment.

## Automated Verification

A daily scheduled job (`server/jobs/restoreVerification.ts`) validates backups end-to-end:

1. Downloads the latest backup from S3
2. Restores it into the database at `RESTORE_VERIFY_DB_URL`
3. Runs sanity queries — all must return > 0 rows:
   - `raw.user_analyses`
   - `core.dealers`
   - `core.listings`
   - `core.analysis_line_items`
4. Checks data recency — latest `core.listings.analyzed_at` must be within `RESTORE_VERIFY_MAX_AGE_HOURS` (default: 48h)
5. Fires a `backup_restore_failed` alert on any failure (with 4-hour cooldown)

### Verification database lifecycle

The verification database is a **persistent scratch database** that you provision once. It is NOT created or dropped by the job — `pg_restore --clean` overwrites its contents on each run.

**Setup (one-time):**

```bash
createdb -h host -U user odigos_verify
```

Then set `RESTORE_VERIFY_DB_URL=postgresql://user:pass@host:5432/odigos_verify`.

The scheduler only activates verification when **both** `RESTORE_VERIFY_DB_URL` and `BACKUP_S3_BUCKET` are set. If either is missing, startup logs will say:

```
[scheduler] Restore verification SKIPPED — missing env: RESTORE_VERIFY_DB_URL
```

### Overlap protection

If a verification run is still in progress when the next scheduler tick fires, the new run is skipped with a log message. This prevents resource contention during slow S3 downloads or large restores.

## Estimated Recovery Times

| Step | Estimate |
|---|---|
| S3 download | 1-5 minutes (depends on backup size and network) |
| pg_restore | 2-15 minutes (depends on data volume) |
| Application restart | 30 seconds - 2 minutes |
| **Total RTO** | **~5-20 minutes** |

These are placeholder estimates. Actual times depend on database size and infrastructure. The automated verification job logs exact durations for each run — use those to calibrate.

## Common Failure Modes

### S3 authentication failure

**Symptom:** `CredentialsProviderError` or `AccessDenied`

**Fix:** Verify `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` are set and have `s3:GetObject` + `s3:ListBucket` permissions on the backup bucket.

### pg_restore version mismatch

**Symptom:** `pg_restore: error: unsupported version` or `pg_restore: [archiver] unsupported version`

**Fix:** Ensure the `pg_restore` binary matches the PostgreSQL version used by `pg_dump`. If the server was upgraded, you may need to install the matching `postgresql-client` package.

### Connection refused / timeout

**Symptom:** `ECONNREFUSED` or `connection timed out`

**Fix:**
- Verify `TARGET_DB_URL` is correct and the database is running
- Check firewall rules / security groups allow inbound connections
- Ensure the database is not at max connections

### pg_restore exit code 1 (warnings)

**Symptom:** `pg_restore` exits with code 1, automated verification fails

**Explanation:** Exit code 1 means non-fatal warnings (e.g., `DROP TABLE` on a table that doesn't exist during `--clean`). This is normal for first restores into an empty database. The automated verification treats this as a failure to avoid masking real issues. If you see this consistently:

1. Run a manual restore and inspect stderr
2. If the warnings are only `DROP ... does not exist` from `--clean`, the data is fine
3. If the warnings include `ERROR` lines about missing extensions, types, or permissions, those are real problems

### Empty backup file

**Symptom:** `pg_dump produced an empty file` or download succeeds but file is 0 bytes

**Fix:** Check that `DATABASE_URL` points to a valid, running database. Verify disk space on the backup host. Check S3 for the most recent non-zero backup.

### Stale backup (recency check failure)

**Symptom:** `Recency check failed: latest listing is Xh old, exceeds 48h threshold`

**Fix:** This means the backup contains data but no recent activity. Possible causes:
- Backup job ran but captured an old snapshot
- No user submissions in the last 48 hours (may be normal for low-traffic periods)
- Adjust `RESTORE_VERIFY_MAX_AGE_HOURS` if 48h is too aggressive for your traffic
