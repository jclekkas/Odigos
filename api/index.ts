import type { IncomingMessage, ServerResponse } from "http";
import { initialize, app } from "../server/index.js";

// Initialize the Express app once on cold start. All concurrent requests
// during init await the same promise — no race conditions.
const ready = initialize();

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  await ready;
  return app(req, res);
}
