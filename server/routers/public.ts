import type { Express } from "express";
import { trackEvent } from "../events";
import { getExperimentStats } from "../analytics";
import { getStateFeeData } from "../stateFeeLookup";

export function registerPublicRoutes(app: Express): void {
  app.post("/api/track", async (req, res) => {
    try {
      const { eventType, metadata } = req.body;
      
      const validTypes = [
        "page_view", "cta_click", "form_start", "form_focus",
        "file_upload_failed", "analysis_failed", "checkout_failed",
        "scorecard_downloaded", "copy_summary", "optional_details_expanded",
        "experiment_assigned", "experiment_converted",
      ];
      if (!eventType || !validTypes.includes(eventType)) {
        return res.status(400).json({ error: "Invalid event type" });
      }
      
      await trackEvent(eventType, {
        ...metadata,
        referrer: req.headers.referer || metadata?.referrer,
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error("Track error:", error);
      res.status(500).json({ error: "Failed to track event" });
    }
  });

  app.get("/api/experiments", async (_req, res) => {
    try {
      const stats = await getExperimentStats();
      res.json(stats);
    } catch (error) {
      console.error("Experiments error:", error);
      res.status(500).json({ error: "Failed to fetch experiment stats" });
    }
  });

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
    const status = rssM > 1536 ? "degraded" : "healthy";
    res.json({
      status,
      uptimeSeconds: Math.round(uptimeSeconds),
      memory: { heapUsedMb, heapTotalMb, rssMb: rssM },
    });
  });

  app.post("/api/vitals", async (req, res) => {
    try {
      const { name, value, rating } = req.body;
      const validNames = ["LCP", "CLS", "FID", "INP", "TTFB", "FCP"];
      if (!name || !validNames.includes(name) || typeof value !== "number") {
        return res.status(400).json({ error: "Invalid vitals payload" });
      }
      await trackEvent("vitals", {
        vitalsName: name,
        vitalsValue: value,
        vitalsRating: rating || null,
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Vitals error:", error);
      res.status(500).json({ error: "Failed to record vitals" });
    }
  });

  app.get("/sitemap.xml", (_req, res) => {
    res.type("application/xml");
    res.sendFile("sitemap.xml", { root: "." });
  });

  app.get("/robots.txt", (_req, res) => {
    const siteUrl = process.env.SITE_URL || "https://odigosauto.com";
    res.type("text/plain");
    res.send(`User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml`);
  });
}
