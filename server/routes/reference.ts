import type { Express } from "express";
import { getStateFeeData } from "../stateFeeLookup";

export function registerReferenceRoutes(app: Express): void {
  app.get("/api/state-fee/:state", (req, res) => {
    const state = (req.params.state ?? "").toUpperCase();
    const data = getStateFeeData(state);
    if (!data) {
      return res.status(404).json({ error: "Unknown state abbreviation" });
    }
    return res.json(data);
  });

  app.get("/api/health", (_req, res) => {
    const uptimeSeconds = process.uptime();
    const mem = process.memoryUsage();
    const heapUsedMb = Math.round(mem.heapUsed / 1024 / 1024 * 10) / 10;
    const heapTotalMb = Math.round(mem.heapTotal / 1024 / 1024 * 10) / 10;
    const rssM = Math.round(mem.rss / 1024 / 1024 * 10) / 10;
    const status = rssM > 1536 ? "degraded" : "ok";
    res.json({
      status,
      uptimeSeconds: Math.round(uptimeSeconds),
      memory: { heapUsedMb, heapTotalMb, rssMb: rssM },
    });
  });

  app.get("/sitemap.xml", (_req, res) => {
    res.type("application/xml");
    res.sendFile("sitemap.xml", { root: "." });
  });

  app.get("/robots.txt", (_req, res) => {
    const CANONICAL_ORIGIN = "https://odigosauto.com";
    res.type("text/plain");
    res.send(`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /admin/\nSitemap: ${CANONICAL_ORIGIN}/sitemap.xml`);
  });
}
