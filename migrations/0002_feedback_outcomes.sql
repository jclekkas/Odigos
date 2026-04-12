-- Phase 5: Add progressive disclosure outcome fields to deal_feedback
-- All columns are nullable — collected in a second stage after initial rating submission.

ALTER TABLE public.deal_feedback ADD COLUMN IF NOT EXISTS final_paid_amount numeric;
ALTER TABLE public.deal_feedback ADD COLUMN IF NOT EXISTS fees_removed boolean;
ALTER TABLE public.deal_feedback ADD COLUMN IF NOT EXISTS outcome_status text;
ALTER TABLE public.deal_feedback ADD COLUMN IF NOT EXISTS follow_up_completed_at timestamptz;
