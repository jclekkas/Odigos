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
| `BACKUP_S3_BUCKET` | S3 bucket name | S3 download/upload |
| `BACKUP_S3_REGION` | AWS region | S3 operations |
| `BACKUP_S3_PREFIX` | Key prefix inside bucket | S3 operations |
| `RESTORE_VERIFY_DB_URL` | Throwaway DB for automated verification | Scheduled verification |
| `AWS_ACCESS_KEY_ID` | AWS credentials | S3 operations |
| `AWS_SECRET_ACCESS_KEY` | AWS credentials | S3 operations |

## Manual Restore

### From S3 (latest backup)

```bash
TARGET_DB_URL="postgresql://user:pass@host:5432/dbname" \
BACKUP_S3_BUCKET="your-bucket" \
  tsx scripts/restore.ts
```

### From a local file

```bash
TARGET_DB_URL="postgresql://user:pass@host:5432/dbname" \
  tsx scripts/restore.ts backups/backup-2026-04-13T10-30-00.dump
```

### Production Restore

Production restores require an explicit safety flag:

```bash
NODE_ENV=production \
TARGET_DB_URL="$DATABASE_URL" \
BACKUP_S3_BUCKET="your-bucket" \
  tsx scripts/restore.ts --i-know-this-is-production
```

**Before restoring to production:**

1. Notify stakeholders that the service will be temporarily unavailable
2. Stop the application server to prevent writes during restore
3. Take a fresh backup of the current state (even if corrupted, for forensics)
4. Run the restore
5. Verify critical tables have expected row counts
6. Restart the application server

## Automated Verification

A daily scheduled job (`server/jobs/restoreVerification.ts`) automatically:

1. Downloads the latest backup from S3
2. Restores it into the database specified by `RESTORE_VERIFY_DB_URL`
3. Runs sanity queries (row counts > 0) against:
   - `raw.user_analyses`
   - `core.dealers`
   - `core.listings`
   - `core.analysis_line_items`
4. Fires a `backup_restore_failed` alert on any failure

This runs only when both `RESTORE_VERIFY_DB_URL` and `BACKUP_S3_BUCKET` are configured.

## Estimated Recovery Times

| Step | Estimate |
|---|---|
| S3 download | 1-5 minutes (depends on backup size and network) |
| pg_restore | 2-15 minutes (depends on data volume) |
| Application restart | 30 seconds - 2 minutes |
| **Total RTO** | **~5-20 minutes** |

These are placeholder estimates. Actual times depend on database size and infrastructure.

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

**Symptom:** `pg_restore` exits with code 1 but data appears restored

**Explanation:** Exit code 1 means non-fatal warnings (e.g., `DROP TABLE` on a table that doesn't exist during `--clean`). This is normal for first restores or schema mismatches. The restore script treats exit code 1 as a warning, not a failure.

### Empty backup file

**Symptom:** `pg_dump produced an empty file` or download succeeds but file is 0 bytes

**Fix:** Check that `DATABASE_URL` points to a valid, running database. Verify disk space on the backup host. Check S3 for the most recent non-zero backup.
