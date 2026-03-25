import { timingSafeEqual } from "crypto";
import type { Express, Request, Response } from "express";
import type { DateRange } from "../bi";

const VALID_RANGES: DateRange[] = ["today", "week", "month", "all"];

function requireAdminKey(req: Request, res: Response): boolean {
  const configuredKey = process.env.ADMIN_KEY;
  if (!configuredKey) { res.status(503).json({ error: "Admin access not configured" }); return false; }
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" }); return false;
  }
  const providedKey = authHeader.slice("Bearer ".length);
  try {
    const a = Buffer.from(configuredKey);
    const b = Buffer.from(providedKey);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      res.status(401).json({ error: "Unauthorized" }); return false;
    }
  } catch {
    res.status(401).json({ error: "Unauthorized" }); return false;
  }
  return true;
}

function parseRange(req: Request): DateRange {
  const r = req.query.range;
  return (typeof r === "string" && VALID_RANGES.includes(r as DateRange)) ? (r as DateRange) : "all";
}

export function registerAdminRoutes(app: Express): void {
  app.get("/api/metrics", async (req, res) => {
    if (!requireAdminKey(req, res)) return;
    
    try {
      const { getMetricsSummary } = await import("../analytics");
      const summary = await getMetricsSummary();
      res.json(summary);
    } catch (error: any) {
      console.error("Metrics error:", error?.message || error);
      res.status(500).json({ 
        error: "Failed to fetch metrics",
        message: error?.message,
        hasDbUrl: !!process.env.DATABASE_URL
      });
    }
  });

  app.get("/api/alerts", async (req, res) => {
    if (!requireAdminKey(req, res)) return;
    try {
      const { getAlertsStatus } = await import("../alerts");
      const status = await getAlertsStatus();
      res.json(status);
    } catch (error: any) {
      console.error("[alerts] /api/alerts error:", error?.message || error);
      res.status(500).json({ error: "Failed to fetch alert status", message: error?.message });
    }
  });

  app.get("/api/technical", async (req, res) => {
    if (!requireAdminKey(req, res)) return;
    try {
      const { getTechnicalSummary, getPiiExpiryStatus } = await import("../analytics");
      const [summary, piiRetention] = await Promise.all([
        getTechnicalSummary(),
        getPiiExpiryStatus(),
      ]);
      res.json({ ...summary, piiRetention });
    } catch (error: any) {
      console.error("Technical metrics error:", error?.message || error);
      res.status(500).json({ error: "Failed to fetch technical metrics", message: error?.message });
    }
  });

  app.get("/api/admin/bi/funnel", async (req, res) => {
    if (!requireAdminKey(req, res)) return;
    try {
      const range = parseRange(req);
      const { getBIFunnel } = await import("../bi");
      res.json(await getBIFunnel(range));
    } catch (e: any) { res.status(500).json({ error: e?.message }); }
  });

  app.get("/api/admin/bi/attribution", async (req, res) => {
    if (!requireAdminKey(req, res)) return;
    try {
      const range = parseRange(req);
      const { getBIPageAttribution } = await import("../bi");
      res.json(await getBIPageAttribution(range));
    } catch (e: any) { res.status(500).json({ error: e?.message }); }
  });

  app.get("/api/admin/bi/behavior", async (req, res) => {
    if (!requireAdminKey(req, res)) return;
    try {
      const range = parseRange(req);
      const { getBIUserBehavior } = await import("../bi");
      res.json(await getBIUserBehavior(range));
    } catch (e: any) { res.status(500).json({ error: e?.message }); }
  });

  app.get("/api/admin/bi/deal-outcome", async (req, res) => {
    if (!requireAdminKey(req, res)) return;
    try {
      const range = parseRange(req);
      const { getBIDealOutcome } = await import("../bi");
      res.setHeader("Cache-Control", "private, max-age=120");
      res.json(await getBIDealOutcome(range));
    } catch (e: any) { res.status(500).json({ error: e?.message }); }
  });

  app.get("/api/admin/bi/geographic", async (req, res) => {
    if (!requireAdminKey(req, res)) return;
    try {
      const range = parseRange(req);
      const { getBIGeographic } = await import("../bi");
      res.setHeader("Cache-Control", "private, max-age=120");
      res.json(await getBIGeographic(range));
    } catch (e: any) { res.status(500).json({ error: e?.message }); }
  });

  app.get("/api/admin/bi/acquisition", async (req, res) => {
    if (!requireAdminKey(req, res)) return;
    try {
      const range = parseRange(req);
      const { getBIAcquisition } = await import("../bi");
      res.json(await getBIAcquisition(range));
    } catch (e: any) { res.status(500).json({ error: e?.message }); }
  });

  app.get("/api/admin/bi/revenue", async (req, res) => {
    if (!requireAdminKey(req, res)) return;
    try {
      const range = parseRange(req);
      const { getBIRevenue } = await import("../bi");
      res.json(await getBIRevenue(range));
    } catch (e: any) { res.status(500).json({ error: e?.message }); }
  });

  app.get("/api/admin/bi/fallout", async (req, res) => {
    if (!requireAdminKey(req, res)) return;
    try {
      const range = parseRange(req);
      const { getBIFallout } = await import("../bi");
      res.json(await getBIFallout(range));
    } catch (e: any) { res.status(500).json({ error: e?.message }); }
  });
}
