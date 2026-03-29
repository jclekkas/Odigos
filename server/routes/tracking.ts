import { createHash } from "crypto";
import type { Express } from "express";
import { trackEvent } from "../events";
import { getExperimentStats } from "../analytics";

function hashIp(req: { ip?: string; headers: Record<string, string | string[] | undefined> }): string {
  const forwarded = req.headers["x-forwarded-for"];
  const raw = (Array.isArray(forwarded) ? forwarded[0] : forwarded)?.split(",")[0]?.trim() || req.ip || "unknown";
  return createHash("sha256").update("odigos-ip:" + raw).digest("hex").slice(0, 16);
}

export function registerTrackingRoutes(app: Express): void {
  app.post("/api/track-event", (req, res) => {
    try {
      const { event, props, timestamp } = req.body;
      if (!event || typeof event !== "string" || event.trim() === "") {
        return res.status(400).json({ error: "event must be a non-empty string" });
      }
      console.log(JSON.stringify({ type: "[track-event]", event, props: props ?? {}, timestamp: timestamp ?? new Date().toISOString() }));
      res.json({ ok: true });
    } catch {
      res.status(500).json({ error: "Failed to record event" });
    }
  });

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
        ipHash: hashIp(req),
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
