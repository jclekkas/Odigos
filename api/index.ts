import type { IncomingMessage, ServerResponse } from "http";
import { initialize, app } from "../server/index.js";

// Initialize the Express app once on cold start. The `.catch` swallows the
// rejection so a single init failure does NOT leave `ready` in a sticky-rejected
// state that kills every subsequent request on this cold container. On failure
// we log prominently; the synchronous /api/health route (registered in
// server/index.ts before initialize() runs) remains available so operators can
// read initState and diagnose via Vercel function logs.
const ready = initialize().catch((err) => {
  console.error("[cold-start] initialize() failed:", err);
  return undefined;
});

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  await ready;
  return app(req, res);
}
