import { db } from "../db";
import { sql } from "drizzle-orm";

export async function setupWarehouseViews(): Promise<void> {
  await db.execute(sql`CREATE SCHEMA IF NOT EXISTS raw`);
  await db.execute(sql`CREATE SCHEMA IF NOT EXISTS core`);

  await db.execute(sql`
    CREATE MATERIALIZED VIEW IF NOT EXISTS core.platform_metrics AS
    SELECT
      COUNT(*) FILTER (WHERE counts_toward_real_deals = TRUE) AS real_deals_analyzed,
      COUNT(*) FILTER (WHERE ingestion_source = 'user_submitted') AS user_submissions,
      COUNT(*) FILTER (WHERE ingestion_source = 'cfpb') AS enforcement_records,
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
      (SELECT COUNT(*) FROM core.consumer_complaints) AS total_complaints,
      (SELECT COUNT(*) FROM core.dealers) AS total_dealers
  `);

  await db.execute(sql`
    CREATE MATERIALIZED VIEW IF NOT EXISTS core.state_stats AS
    SELECT
      l.state_code,
      COUNT(*) AS listing_count,
      AVG(l.deal_score) AS avg_deal_score,
      AVG(l.doc_fee) AS avg_doc_fee,
      COUNT(*) FILTER (WHERE l.doc_fee_over_state_cap = TRUE) AS doc_fee_over_cap_count,
      (SELECT COUNT(*) FROM core.consumer_complaints cc WHERE cc.state_code = l.state_code) AS complaint_count
    FROM core.listings l
    GROUP BY l.state_code
  `);

  console.log("[warehouse] Materialized views created (or already exist).");
}
