-- Migration: Add DLQ replay tracking columns and idempotency constraints
-- These changes support bounded self-healing error recovery (Task #122).

-- ── failed_warehouse_writes: DLQ replay columns ──────────────────────────────
ALTER TABLE public.failed_warehouse_writes ADD COLUMN IF NOT EXISTS status varchar(16) NOT NULL DEFAULT 'pending';
ALTER TABLE public.failed_warehouse_writes ADD COLUMN IF NOT EXISTS max_attempts integer NOT NULL DEFAULT 5;
ALTER TABLE public.failed_warehouse_writes ADD COLUMN IF NOT EXISTS next_attempt_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.failed_warehouse_writes ADD COLUMN IF NOT EXISTS first_failed_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.failed_warehouse_writes ADD COLUMN IF NOT EXISTS last_failed_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.failed_warehouse_writes ADD COLUMN IF NOT EXISTS lease_expires_at timestamptz;
ALTER TABLE public.failed_warehouse_writes ADD COLUMN IF NOT EXISTS last_error_code varchar(64);
ALTER TABLE public.failed_warehouse_writes ADD COLUMN IF NOT EXISTS last_error_message text;

-- DLQ replay worker indexes
CREATE INDEX IF NOT EXISTS dlq_status_next_attempt_idx ON public.failed_warehouse_writes (status, next_attempt_at);
CREATE INDEX IF NOT EXISTS dlq_submission_id_idx ON public.failed_warehouse_writes (submission_id);
CREATE INDEX IF NOT EXISTS dlq_failed_at_idx ON public.failed_warehouse_writes (failed_at);

-- ── raw.user_analyses: unique constraint on dealer_submission_id ──────────────
-- Guarantees idempotent inserts: ON CONFLICT DO NOTHING skips duplicates safely.
CREATE UNIQUE INDEX IF NOT EXISTS raw_ua_dealer_submission_unique_idx
  ON raw.user_analyses (dealer_submission_id);

-- ── core.listings: unique constraint on dealer_submission_id ─────────────────
-- Guarantees idempotent inserts: ON CONFLICT DO NOTHING skips duplicates safely.
-- Column is added via ALTER TABLE in setupViews.ts; index is safe to create here.
CREATE UNIQUE INDEX IF NOT EXISTS core_listings_dealer_submission_unique_idx
  ON core.listings (dealer_submission_id);
