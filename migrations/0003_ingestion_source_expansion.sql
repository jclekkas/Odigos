-- Expand ingestion_source CHECK constraint to allow future data sources
-- (forum_scrape, external_api) without requiring a migration when they're built.
ALTER TABLE core.listings DROP CONSTRAINT IF EXISTS listings_ingestion_source_check;
ALTER TABLE core.listings ADD CONSTRAINT listings_ingestion_source_check
  CHECK (ingestion_source IN ('user_submitted', 'seed', 'internal_backfill', 'forum_scrape', 'external_api'));
