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
