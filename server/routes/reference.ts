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

  // /robots.txt and /sitemap.xml are static files at client/public/. Vite
  // copies them into dist/public/ at build time; Vercel then serves them
  // straight from the CDN and Express's express.static serves them in
  // local/Replit prod. No dynamic routes needed.
}
