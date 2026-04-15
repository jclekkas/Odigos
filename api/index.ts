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
  try {
    await ready;
    return app(req, res);
  } catch (err) {
    // Last-line defense against FUNCTION_INVOCATION_FAILED: if anything in the
    // initialization await or the synchronous Express dispatch throws, return a
    // structured 500 instead of letting Vercel report a generic crash. Express
    // handles its own async errors via the registered error middleware; this
    // catch only fires for truly exceptional failures (e.g. import-time state
    // corruption), so it should never mask normal request-handling errors.
    console.error("[handler] uncaught error during request dispatch:", err);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Internal Server Error", message: "Function dispatch failed; see /api/health for init state." }));
    } else {
      try { res.end(); } catch { /* ignore */ }
    }
  }
}
