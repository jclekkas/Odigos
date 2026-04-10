import type { VercelRequest, VercelResponse } from "@vercel/node";
import { initialize, app } from "../server/index";

// Initialize the Express app once on cold start. All concurrent requests
// during init await the same promise — no race conditions.
const ready = initialize();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await ready;
  return app(req, res);
}
