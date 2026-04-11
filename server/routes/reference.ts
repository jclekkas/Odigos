import type { Express } from "express";
import { getStateFeeData } from "../stateFeeLookup.js";

export function registerReferenceRoutes(app: Express): void {
  app.get("/api/state-fee/:state", (req, res) => {
    const state = (req.params.state ?? "").toUpperCase();
    const data = getStateFeeData(state);
    if (!data) {
      return res.status(404).json({ error: "Unknown state abbreviation" });
    }
    return res.json(data);
  });

  // /api/health is registered synchronously at module load in server/index.ts
  // so that it remains available even when initialize() fails. Do not add it
  // here — Express would just shadow this registration with the synchronous one.

  app.get("/sitemap.xml", (_req, res) => {
    res.type("application/xml");
    res.sendFile("sitemap.xml", { root: "." });
  });

  app.get("/robots.txt", (_req, res) => {
    const CANONICAL_ORIGIN = "https://odigosauto.com";
    res.type("text/plain");
    res.send(`User-agent: *\nAllow: /\nSitemap: ${CANONICAL_ORIGIN}/sitemap.xml`);
  });
}
