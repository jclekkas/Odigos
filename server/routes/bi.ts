import type { Express, Request } from "express";
import type { DateRange } from "../bi";
import { requireAdminKey } from "./admin";

const VALID_RANGES: DateRange[] = ["today", "week", "month", "all"];

function parseRange(req: Request): DateRange {
  const r = req.query.range;
  return (typeof r === "string" && VALID_RANGES.includes(r as DateRange)) ? (r as DateRange) : "all";
}

export function registerBIRoutes(app: Express): void {
  app.get("/api/admin/bi/funnel", async (req, res) => {
    if (!requireAdminKey(req, res)) return;
    try { const { getBIFunnel } = await import("../bi"); res.json(await getBIFunnel(parseRange(req))); }
    catch (e: any) { res.status(500).json({ error: e?.message }); }
  });

  app.get("/api/admin/bi/attribution", async (req, res) => {
    if (!requireAdminKey(req, res)) return;
    try { const { getBIPageAttribution } = await import("../bi"); res.json(await getBIPageAttribution(parseRange(req))); }
    catch (e: any) { res.status(500).json({ error: e?.message }); }
  });

  app.get("/api/admin/bi/behavior", async (req, res) => {
    if (!requireAdminKey(req, res)) return;
    try { const { getBIUserBehavior } = await import("../bi"); res.json(await getBIUserBehavior(parseRange(req))); }
    catch (e: any) { res.status(500).json({ error: e?.message }); }
  });

  app.get("/api/admin/bi/deal-outcome", async (req, res) => {
    if (!requireAdminKey(req, res)) return;
    try { const { getBIDealOutcome } = await import("../bi"); res.setHeader("Cache-Control", "private, max-age=120"); res.json(await getBIDealOutcome(parseRange(req))); }
    catch (e: any) { res.status(500).json({ error: e?.message }); }
  });

  app.get("/api/admin/bi/geographic", async (req, res) => {
    if (!requireAdminKey(req, res)) return;
    try { const { getBIGeographic } = await import("../bi"); res.setHeader("Cache-Control", "private, max-age=120"); res.json(await getBIGeographic(parseRange(req))); }
    catch (e: any) { res.status(500).json({ error: e?.message }); }
  });

  app.get("/api/admin/bi/acquisition", async (req, res) => {
    if (!requireAdminKey(req, res)) return;
    try { const { getBIAcquisition } = await import("../bi"); res.json(await getBIAcquisition(parseRange(req))); }
    catch (e: any) { res.status(500).json({ error: e?.message }); }
  });

  app.get("/api/admin/bi/revenue", async (req, res) => {
    if (!requireAdminKey(req, res)) return;
    try { const { getBIRevenue } = await import("../bi"); res.json(await getBIRevenue(parseRange(req))); }
    catch (e: any) { res.status(500).json({ error: e?.message }); }
  });

  app.get("/api/admin/bi/fallout", async (req, res) => {
    if (!requireAdminKey(req, res)) return;
    try { const { getBIFallout } = await import("../bi"); res.json(await getBIFallout(parseRange(req))); }
    catch (e: any) { res.status(500).json({ error: e?.message }); }
  });

  app.get("/api/admin/bi/subscription", async (req, res) => {
    if (!requireAdminKey(req, res)) return;
    try { const { getBISubscriptionHealth } = await import("../bi"); res.json(await getBISubscriptionHealth(parseRange(req))); }
    catch (e: any) { res.status(500).json({ error: e?.message }); }
  });

  app.get("/api/admin/users/lookup", async (req, res) => {
    if (!requireAdminKey(req, res)) return;
    try {
      const { lookupUserSessions } = await import("../bi");
      const q = typeof req.query.q === "string" ? req.query.q : "";
      const limit = Math.min(parseInt(typeof req.query.limit === "string" ? req.query.limit : "20", 10) || 20, 100);
      const sessions = await lookupUserSessions(q, limit);
      res.json({ sessions });
    } catch (e: any) { res.status(500).json({ error: e?.message }); }
  });

  app.get("/api/admin/feedback-accuracy", async (req, res) => {
    if (!requireAdminKey(req, res)) return;
    try {
      if (!process.env.DATABASE_URL) {
        return res.json({
          overallAgreementRate: null,
          byScoreColor: { GREEN: null, YELLOW: null, RED: null },
          topDealers: [],
        });
      }
      const { db } = await import("../db");
      const { sql } = await import("drizzle-orm");

      const overallResult = await db.execute<{ agreement_rate: string | null }>(sql`
        SELECT
          CASE
            WHEN COUNT(CASE WHEN df.rating IS NOT NULL THEN 1 END) > 0
            THEN SUM(CASE WHEN df.rating = true THEN 1 ELSE 0 END)::float
                 / COUNT(CASE WHEN df.rating IS NOT NULL THEN 1 END)
            ELSE NULL
          END AS agreement_rate
        FROM public.deal_feedback df
      `);
      const overallAgreementRate = overallResult.rows?.[0]?.agreement_rate != null
        ? Number(overallResult.rows[0].agreement_rate)
        : null;

      const byColorResult = await db.execute<{ deal_score: string; agreement_rate: string | null }>(sql`
        SELECT
          ds.deal_score,
          CASE
            WHEN COUNT(CASE WHEN df.rating IS NOT NULL THEN 1 END) > 0
            THEN SUM(CASE WHEN df.rating = true THEN 1 ELSE 0 END)::float
                 / COUNT(CASE WHEN df.rating IS NOT NULL THEN 1 END)
            ELSE NULL
          END AS agreement_rate
        FROM public.deal_feedback df
        JOIN public.dealer_submissions ds ON ds.id = df.listing_id
        WHERE ds.deal_score IN ('GREEN', 'YELLOW', 'RED')
        GROUP BY ds.deal_score
      `);
      const byScoreColor: { GREEN: number | null; YELLOW: number | null; RED: number | null } = {
        GREEN: null,
        YELLOW: null,
        RED: null,
      };
      for (const row of byColorResult.rows ?? []) {
        const score = row.deal_score as "GREEN" | "YELLOW" | "RED";
        byScoreColor[score] = row.agreement_rate != null ? Number(row.agreement_rate) : null;
      }

      const topDealersResult = await db.execute<{
        dealer_name: string;
        total_feedback_count: string;
        positive_feedback_count: string;
        agreement_rate: string | null;
      }>(sql`
        SELECT
          d.dealer_name,
          COUNT(CASE WHEN df.rating IS NOT NULL THEN 1 END)::bigint AS total_feedback_count,
          SUM(CASE WHEN df.rating = true THEN 1 ELSE 0 END)::bigint AS positive_feedback_count,
          CASE
            WHEN COUNT(CASE WHEN df.rating IS NOT NULL THEN 1 END) > 0
            THEN SUM(CASE WHEN df.rating = true THEN 1 ELSE 0 END)::float
                 / COUNT(CASE WHEN df.rating IS NOT NULL THEN 1 END)
            ELSE NULL
          END AS agreement_rate
        FROM public.deal_feedback df
        JOIN public.dealer_submissions ds ON ds.id = df.listing_id
        JOIN core.listings cl ON cl.dealer_submission_id = ds.id
        JOIN core.dealers d ON d.id = cl.dealer_id
        GROUP BY d.id, d.dealer_name
        HAVING COUNT(CASE WHEN df.rating IS NOT NULL THEN 1 END) >= 3
        ORDER BY total_feedback_count DESC
        LIMIT 10
      `);
      const topDealers = (topDealersResult.rows ?? []).map((row) => ({
        dealerName: row.dealer_name,
        totalFeedbackCount: Number(row.total_feedback_count),
        positiveFeedbackCount: Number(row.positive_feedback_count),
        agreementRate: row.agreement_rate != null ? Number(row.agreement_rate) : null,
      }));

      res.json({ overallAgreementRate, byScoreColor, topDealers });
    } catch (e: any) {
      res.status(500).json({ error: e?.message });
    }
  });

  app.get("/api/stats", async (_req, res) => {
    try {
      if (!process.env.DATABASE_URL) {
        return res.json({ real_analyzed_deals: 0, user_submissions: 0, total_dataset_size: 0, unique_dealers: 0, new_last_24h: 0, last_updated_at: null });
      }
      const { db } = await import("../db");
      const { sql } = await import("drizzle-orm");

      let viewRow: Record<string, unknown> | null = null;
      let viewHasData = false;
      try {
        const viewResult = await db.execute(sql`SELECT * FROM core.platform_metrics LIMIT 1`);
        const candidate = viewResult.rows?.[0] as Record<string, unknown> | undefined;
        if (candidate && Number(candidate.real_deals_analyzed ?? 0) > 0) { viewRow = candidate; viewHasData = true; }
      } catch { viewRow = null; }

      let fallbackRow: Record<string, unknown> | null = null;
      if (!viewHasData) {
        try {
          const fbResult = await db.execute(sql`SELECT COUNT(*) FILTER (WHERE counts_toward_real_deals = TRUE) AS real_deals_analyzed, COUNT(*) FILTER (WHERE ingestion_source = 'user_submitted') AS user_submissions, COUNT(DISTINCT dealer_id) AS unique_dealers, MAX(analyzed_at) AS last_updated_at FROM core.listings`);
          fallbackRow = (fbResult.rows?.[0] as Record<string, unknown>) ?? null;
        } catch { fallbackRow = null; }
      }

      const statsRow = viewRow ?? fallbackRow ?? {};
      let totalDatasetSize = 0, newLast24h = 0;
      try {
        const liveResult = await db.execute(sql`SELECT COUNT(*) AS total_dataset_size, COUNT(*) FILTER (WHERE analyzed_at >= NOW() - INTERVAL '24 hours') AS new_last_24h FROM core.listings`);
        const lr = liveResult.rows?.[0] as Record<string, unknown> | undefined;
        totalDatasetSize = Number(lr?.total_dataset_size ?? 0);
        newLast24h = Number(lr?.new_last_24h ?? 0);
      } catch {}

      res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
      res.json({ real_analyzed_deals: Number(statsRow.real_deals_analyzed ?? 0), user_submissions: Number(statsRow.user_submissions ?? 0), total_dataset_size: totalDatasetSize, unique_dealers: Number(statsRow.unique_dealers ?? 0), new_last_24h: newLast24h, last_updated_at: statsRow.last_updated_at ?? null });
    } catch (err) {
      console.error("[stats] /api/stats error:", err);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  app.get("/api/stats/count", async (_req, res) => {
    try {
      if (!process.env.DATABASE_URL) return res.json({ count: 0, type: "none" });
      const { db } = await import("../db");
      const { sql } = await import("drizzle-orm");
      let count = 0, type: "real_deals" | "none" = "none";
      try {
        const realResult = await db.execute(sql`SELECT COUNT(*) AS cnt FROM core.listings WHERE counts_toward_real_deals = TRUE`);
        const rr = realResult.rows?.[0] as Record<string, unknown> | undefined;
        const realCount = Number(rr?.cnt ?? 0);
        if (realCount > 0) { count = realCount; type = "real_deals"; }
      } catch {}
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
      const rows = await db.execute(sql`SELECT ss.*, s.doc_fee_cap, s.doc_fee_cap_type, s.doc_fee_cap_statute, s.sales_tax_base, s.trade_in_credit FROM core.state_stats ss LEFT JOIN core.states s ON s.state_code = ss.state_code WHERE ss.state_code = ${code} LIMIT 1`);
      const row = rows.rows?.[0] ?? null;
      if (!row) return res.status(404).json({ error: "State not found" });
      res.json(row);
    } catch (err) {
      console.error("[stats] /api/warehouse/stats/state error:", err);
      res.status(500).json({ error: "Failed to fetch state stats" });
    }
  });
}
