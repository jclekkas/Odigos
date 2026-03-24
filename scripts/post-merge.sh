#!/bin/bash
set -e

npm install

# ── Step 1: Drop materialized views so drizzle-kit push can proceed without
#            an interactive prompt asking for confirmation.
echo "[post-merge] Dropping materialized views (schema-qualified, IF EXISTS)..."
psql "$DATABASE_URL" \
  -c "DROP MATERIALIZED VIEW IF EXISTS core.platform_metrics CASCADE;" \
  -c "DROP MATERIALIZED VIEW IF EXISTS core.national_stats CASCADE;" \
  -c "DROP MATERIALIZED VIEW IF EXISTS core.state_stats CASCADE;"
echo "[post-merge] Materialized views dropped."

# ── Step 2: Push schema changes non-interactively.
#            --force auto-approves any data-loss statements (truncations, etc.).
echo "[post-merge] Running drizzle-kit push --force..."
npx drizzle-kit push --force
echo "[post-merge] Schema push complete."

# ── Step 3: Recreate materialized views and seed reference data now that all
#            underlying warehouse tables exist.
echo "[post-merge] Recreating warehouse views..."
npx tsx server/warehouse/setupViews.ts
echo "[post-merge] Seeding reference data..."
npx tsx server/warehouse/seedReference.ts
echo "[post-merge] Done."
