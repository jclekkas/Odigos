import type { Express } from "express";
import { getStateFeeData } from "../stateFeeLookup.js";
import { CANONICAL_ORIGIN } from "../../shared/siteConfig.js";

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

  // /sitemap.xml is a static file at client/public/sitemap.xml. Vite copies it
  // into dist/public/sitemap.xml at build time; Vercel then serves it straight
  // from the CDN and Express's express.static serves it in local/Replit prod.
  // No dynamic route needed.

  app.get("/robots.txt", (_req, res) => {
    res.type("text/plain");
    res.send(`User-agent: *\nAllow: /\nSitemap: ${CANONICAL_ORIGIN}/sitemap.xml`);
  });
}
