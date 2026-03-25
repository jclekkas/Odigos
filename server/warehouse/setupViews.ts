import { db } from "../db";
import { sql } from "drizzle-orm";

export async function setupWarehouseViews(): Promise<void> {
  // ── 1. Schemas ──────────────────────────────────────────────────────────────
  await db.execute(sql`CREATE SCHEMA IF NOT EXISTS raw`);
  await db.execute(sql`CREATE SCHEMA IF NOT EXISTS core`);

  // ── 2. Base tables (no cross-schema FKs) ────────────────────────────────────

  // raw.enforcement_records — no FK dependencies
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS raw.enforcement_records (
      id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
      source text NOT NULL,
      source_record_id text,
      source_url text,
      raw_json jsonb,
      fetched_at timestamp DEFAULT now() NOT NULL,
      ingestion_version integer NOT NULL DEFAULT 1
    )
  `);
  await db.execute(sql`
    CREATE UNIQUE INDEX IF NOT EXISTS raw_er_source_record_idx
      ON raw.enforcement_records (source, source_record_id)
  `);

  // core.states — no FK dependencies; needed by most other core tables
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS core.states (
      state_code text PRIMARY KEY,
      state_name text NOT NULL,
      doc_fee_cap numeric,
      doc_fee_cap_type text,
      doc_fee_cap_statute text,
      sales_tax_base numeric,
      trade_in_credit boolean,
      updated_at timestamp DEFAULT now() NOT NULL
    )
  `);

  // raw.user_analyses — no inline FKs (the FK to public.dealer_submissions
  //                     is added as raw SQL below to avoid circular imports)
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS raw.user_analyses (
      id varchar(36) PRIMARY KEY DEFAULT gen_random_uuid(),
      dealer_submission_id varchar(36),
      submitted_text_redacted text,
      state_code text,
      vehicle_year integer,
      vehicle_make text,
      vehicle_model text,
      analysis_result jsonb,
      deal_score integer,
      verdict text,
      flags text[],
      is_paid boolean DEFAULT false,
      ingestion_source text,
      submitted_at timestamp DEFAULT now() NOT NULL,
      retention_expires_at timestamp
    )
  `);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS raw_ua_state_idx ON raw.user_analyses (state_code)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS raw_ua_submitted_at_idx ON raw.user_analyses (submitted_at)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS raw_ua_dealer_submission_idx ON raw.user_analyses (dealer_submission_id)`);

  // ── 3. Tables with FK dependencies ─────────────────────────────────────────

  // core.metro_areas → core.states
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS core.metro_areas (
      id varchar(36) PRIMARY KEY DEFAULT gen_random_uuid(),
      metro_name text NOT NULL,
      state_code text REFERENCES core.states(state_code),
      population integer
    )
  `);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS core_metro_state_idx ON core.metro_areas (state_code)`);
  await db.execute(sql`
    CREATE UNIQUE INDEX IF NOT EXISTS core_metro_name_state_idx
      ON core.metro_areas (metro_name, state_code)
  `);

  // core.dealers → core.states, core.metro_areas
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS core.dealers (
      id varchar(36) PRIMARY KEY DEFAULT gen_random_uuid(),
      dealer_name text NOT NULL,
      dealer_name_normalized text NOT NULL,
      city text,
      state_code text REFERENCES core.states(state_code),
      metro_area_id varchar(36) REFERENCES core.metro_areas(id),
      first_seen_at timestamp DEFAULT now() NOT NULL,
      last_seen_at timestamp DEFAULT now() NOT NULL,
      listing_count integer NOT NULL DEFAULT 0,
      complaint_count integer NOT NULL DEFAULT 0,
      avg_deal_score numeric
    )
  `);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS core_dealers_state_idx ON core.dealers (state_code)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS core_dealers_normalized_idx ON core.dealers (dealer_name_normalized)`);
  await db.execute(sql`
    CREATE UNIQUE INDEX IF NOT EXISTS core_dealers_unique_idx
      ON core.dealers (dealer_name_normalized, city, state_code)
  `);

  // core.listings → core.dealers, core.states
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS core.listings (
      id varchar(36) PRIMARY KEY DEFAULT gen_random_uuid(),
      dealer_id varchar(36) REFERENCES core.dealers(id),
      ingestion_source text NOT NULL,
      is_fully_processed boolean NOT NULL DEFAULT false,
      counts_toward_real_deals boolean NOT NULL DEFAULT false,
      analysis_version integer NOT NULL DEFAULT 1,
      is_duplicate boolean NOT NULL DEFAULT false,
      is_test_data boolean NOT NULL DEFAULT false,
      has_pipeline_error boolean NOT NULL DEFAULT false,
      pipeline_error_reason text,
      vehicle_year integer,
      vehicle_make text,
      vehicle_model text,
      vehicle_trim text,
      vehicle_type text,
      listed_price numeric,
      otd_price numeric,
      monthly_payment numeric,
      apr_value numeric,
      loan_term_months integer,
      down_payment numeric,
      doc_fee numeric,
      doc_fee_over_state_cap boolean,
      market_adjustment numeric,
      addon_total numeric,
      fee_names text[],
      flag_count integer NOT NULL DEFAULT 0,
      deal_score integer,
      verdict text,
      flags text[],
      fee_to_price_ratio numeric,
      state_code text REFERENCES core.states(state_code),
      listing_date date,
      analyzed_at timestamp,
      CONSTRAINT listings_ingestion_source_check
        CHECK (ingestion_source IN ('user_submitted', 'seed', 'internal_backfill'))
    )
  `);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS core_listings_dealer_idx ON core.listings (dealer_id)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS core_listings_score_idx ON core.listings (deal_score)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS core_listings_date_idx ON core.listings (listing_date)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS core_listings_state_idx ON core.listings (state_code)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS core_listings_source_idx ON core.listings (ingestion_source)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS core_listings_analyzed_at_idx ON core.listings (analyzed_at)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS core_listings_counts_real_idx ON core.listings (counts_toward_real_deals)`);
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS core_listings_vehicle_idx
      ON core.listings (vehicle_make, vehicle_model, vehicle_year)
  `);

  // core.consumer_complaints → raw.enforcement_records, core.states, core.dealers
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS core.consumer_complaints (
      id varchar(36) PRIMARY KEY DEFAULT gen_random_uuid(),
      raw_record_id integer REFERENCES raw.enforcement_records(id),
      complaint_date date,
      state_code text REFERENCES core.states(state_code),
      company_name text,
      dealer_id varchar(36) REFERENCES core.dealers(id),
      complaint_type text,
      complaint_subtype text,
      company_response text,
      analyzed_at timestamp DEFAULT now() NOT NULL
    )
  `);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS core_complaints_state_idx ON core.consumer_complaints (state_code, complaint_date)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS core_complaints_dealer_idx ON core.consumer_complaints (dealer_id)`);

  // ── 4. FK constraint: raw.user_analyses → public.dealer_submissions ─────────
  // Added via SQL to avoid importing shared/schema.ts into the warehouse module.
  await db.execute(sql`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'user_analyses_dealer_submission_id_dealer_submissions_id_fk'
          AND conrelid = 'raw.user_analyses'::regclass
      ) THEN
        ALTER TABLE raw.user_analyses
          ADD CONSTRAINT user_analyses_dealer_submission_id_dealer_submissions_id_fk
          FOREIGN KEY (dealer_submission_id)
          REFERENCES public.dealer_submissions(id)
          ON DELETE SET NULL;
      END IF;
    END;
    $$
  `);

  // ── 5. Materialized views ───────────────────────────────────────────────────
  await db.execute(sql`
    CREATE MATERIALIZED VIEW IF NOT EXISTS core.platform_metrics AS
    SELECT
      COUNT(*) FILTER (WHERE counts_toward_real_deals = TRUE) AS real_deals_analyzed,
      COUNT(*) FILTER (WHERE ingestion_source = 'user_submitted') AS user_submissions,
      COUNT(DISTINCT dealer_id) AS unique_dealers,
      MAX(analyzed_at) AS last_updated_at
    FROM core.listings
  `);

  await db.execute(sql`
    CREATE MATERIALIZED VIEW IF NOT EXISTS core.national_stats AS
    SELECT
      (SELECT COUNT(*) FROM core.listings) AS total_listings,
      (SELECT COUNT(*) FROM raw.user_analyses) AS total_user_analyses,
      (SELECT AVG(deal_score) FROM core.listings WHERE deal_score IS NOT NULL) AS avg_deal_score,
      (SELECT AVG(doc_fee) FROM core.listings WHERE doc_fee IS NOT NULL) AS avg_doc_fee,
      (SELECT COUNT(*) FROM core.dealers) AS total_dealers
  `);

  await db.execute(sql`
    CREATE MATERIALIZED VIEW IF NOT EXISTS core.state_stats AS
    SELECT
      l.state_code,
      COUNT(*) AS listing_count,
      AVG(l.deal_score) AS avg_deal_score,
      AVG(l.doc_fee) AS avg_doc_fee,
      COUNT(*) FILTER (WHERE l.doc_fee_over_state_cap = TRUE) AS doc_fee_over_cap_count
    FROM core.listings l
    GROUP BY l.state_code
  `);

  // ── 6. dealer_submission_id column on core.listings ─────────────────────────
  // Bridges the feedback loop: deal_feedback → dealer_submissions → core.listings.
  // Added idempotently via ALTER TABLE ... ADD COLUMN IF NOT EXISTS.
  await db.execute(sql`
    ALTER TABLE core.listings
      ADD COLUMN IF NOT EXISTS dealer_submission_id varchar(36)
  `);
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS core_listings_dealer_submission_idx
      ON core.listings (dealer_submission_id)
  `);

  // ── 7. Dealer feedback aggregate view ───────────────────────────────────────
  // Joins public.deal_feedback to public.dealer_submissions (via listing_id),
  // then to core.listings via dealer_submission_id to resolve the dealer_id.
  // Uses a regular view (not materialized) so it always reflects live feedback.
  await db.execute(sql`
    CREATE OR REPLACE VIEW core.dealer_feedback_stats AS
    SELECT
      cl.dealer_id,
      SUM(CASE WHEN df.rating = true THEN 1 ELSE 0 END)::bigint AS positive_feedback_count,
      COUNT(CASE WHEN df.rating IS NOT NULL THEN 1 END)::bigint AS total_feedback_count,
      CASE
        WHEN COUNT(CASE WHEN df.rating IS NOT NULL THEN 1 END) > 0
        THEN SUM(CASE WHEN df.rating = true THEN 1 ELSE 0 END)::float
             / COUNT(CASE WHEN df.rating IS NOT NULL THEN 1 END)
        ELSE NULL
      END AS feedback_agreement_pct
    FROM public.deal_feedback df
    JOIN public.dealer_submissions ds ON ds.id = df.listing_id
    JOIN core.listings cl ON cl.dealer_submission_id = ds.id
    GROUP BY cl.dealer_id
  `);

  console.log("[warehouse] Schemas, tables, FK constraint, and materialized views set up (idempotent).");
}

// Run directly: npx tsx server/warehouse/setupViews.ts
const isMain =
  process.argv[1]?.endsWith("setupViews.ts") ||
  process.argv[1]?.endsWith("setupViews.js");

if (isMain) {
  setupWarehouseViews()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("[warehouse] Fatal error:", err);
      process.exit(1);
    });
}
