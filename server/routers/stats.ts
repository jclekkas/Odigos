import type { Express } from "express";

export function registerStatsRoutes(app: Express): void {
  app.get("/api/stats", async (_req, res) => {
    try {
      if (!process.env.DATABASE_URL) {
        return res.json({
          real_analyzed_deals: 0,
          user_submissions: 0,
          total_dataset_size: 0,
          unique_dealers: 0,
          new_last_24h: 0,
          last_updated_at: null,
        });
      }

      const { db } = await import("../db");
      const { sql } = await import("drizzle-orm");

      let viewRow: Record<string, unknown> | null = null;
      let viewHasData = false;
      try {
        const viewResult = await db.execute(
          sql`SELECT * FROM core.platform_metrics LIMIT 1`,
        );
        const candidate = viewResult.rows?.[0] as Record<string, unknown> | undefined;
        if (candidate && Number(candidate.real_deals_analyzed ?? 0) > 0) {
          viewRow = candidate;
          viewHasData = true;
        }
      } catch {
        viewRow = null;
      }

      let fallbackRow: Record<string, unknown> | null = null;
      if (!viewHasData) {
        try {
          const fbResult = await db.execute(sql`
            SELECT
              COUNT(*) FILTER (WHERE counts_toward_real_deals = TRUE)          AS real_deals_analyzed,
              COUNT(*) FILTER (WHERE ingestion_source = 'user_submitted')      AS user_submissions,
              COUNT(DISTINCT dealer_id)                                         AS unique_dealers,
              MAX(analyzed_at)                                                  AS last_updated_at
            FROM core.listings
          `);
          fallbackRow = (fbResult.rows?.[0] as Record<string, unknown>) ?? null;
        } catch {
          fallbackRow = null;
        }
      }

      const statsRow = viewRow ?? fallbackRow ?? {};

      let totalDatasetSize = 0;
      let newLast24h = 0;
      try {
        const liveResult = await db.execute(sql`
          SELECT
            COUNT(*) AS total_dataset_size,
            COUNT(*) FILTER (WHERE analyzed_at >= NOW() - INTERVAL '24 hours') AS new_last_24h
          FROM core.listings
        `);
        const lr = liveResult.rows?.[0] as Record<string, unknown> | undefined;
        totalDatasetSize = Number(lr?.total_dataset_size ?? 0);
        newLast24h = Number(lr?.new_last_24h ?? 0);
      } catch {
        // Ignore — return 0
      }

      res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
      res.json({
        real_analyzed_deals: Number(statsRow.real_deals_analyzed ?? 0),
        user_submissions: Number(statsRow.user_submissions ?? 0),
        total_dataset_size: totalDatasetSize,
        unique_dealers: Number(statsRow.unique_dealers ?? 0),
        new_last_24h: newLast24h,
        last_updated_at: statsRow.last_updated_at ?? null,
      });
    } catch (err) {
      console.error("[stats] /api/stats error:", err);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  app.get("/api/stats/count", async (_req, res) => {
    try {
      if (!process.env.DATABASE_URL) {
        return res.json({ count: 0, type: "none" });
      }

      const { db } = await import("../db");
      const { sql } = await import("drizzle-orm");

      let count = 0;
      let type: "real_deals" | "none" = "none";

      try {
        const realResult = await db.execute(
          sql`SELECT COUNT(*) AS cnt FROM core.listings
              WHERE counts_toward_real_deals = TRUE`
        );
        const rr = realResult.rows?.[0] as Record<string, unknown> | undefined;
        const realCount = Number(rr?.cnt ?? 0);
        if (realCount > 0) {
          count = realCount;
          type = "real_deals";
        }
      } catch {
      }

      res.setHeader("Cache-Control", "public, max-age=300, stale-while-revalidate=600");
      res.json({ count, type });
    } catch (err) {
      console.error("[stats] /api/stats/count error:", err);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  app.get("/api/warehouse/stats", async (_req, res) => {
    try {
      if (!process.env.DATABASE_URL) return res.json([]);
      const { db } = await import("../db");
      const { sql } = await import("drizzle-orm");
      const rows = await db.execute(sql`SELECT * FROM core.national_stats LIMIT 1`);
      res.json(rows.rows?.[0] ?? {});
    } catch (err) {
      console.error("[stats] /api/warehouse/stats error:", err);
      res.status(500).json({ error: "Failed to fetch national stats" });
    }
  });

  app.get("/api/warehouse/stats/state/:stateCode", async (req, res) => {
    try {
      if (!process.env.DATABASE_URL) return res.json(null);
      const { db } = await import("../db");
      const { sql } = await import("drizzle-orm");
      const code = (req.params.stateCode ?? "").toUpperCase().slice(0, 2);
      if (!code) return res.status(400).json({ error: "Invalid state code" });

      const rows = await db.execute(sql`
        SELECT
          ss.*,
          s.doc_fee_cap,
          s.doc_fee_cap_type,
          s.doc_fee_cap_statute,
          s.sales_tax_base,
          s.trade_in_credit
        FROM core.state_stats ss
        LEFT JOIN core.states s ON s.state_code = ss.state_code
        WHERE ss.state_code = ${code}
        LIMIT 1
      `);
      const row = rows.rows?.[0] ?? null;
      if (!row) return res.status(404).json({ error: "State not found" });
      res.json(row);
    } catch (err) {
      console.error("[stats] /api/warehouse/stats/state error:", err);
      res.status(500).json({ error: "Failed to fetch state stats" });
    }
  });
}
