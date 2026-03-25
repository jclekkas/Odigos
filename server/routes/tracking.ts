import type { Express } from "express";
import { trackEvent } from "../events";
import { getExperimentStats } from "../analytics";

export function registerTrackingRoutes(app: Express): void {
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

  app.get("/api/experiments", async (_req, res) => {
    try {
      const stats = await getExperimentStats();
      res.json(stats);
    } catch (error) {
      console.error("Experiments error:", error);
      res.status(500).json({ error: "Failed to fetch experiment stats" });
    }
  });
}
