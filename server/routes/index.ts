import type { Express } from "express";
import { registerAnalyzeRoutes } from "./analyze.js";
import { registerPaymentRoutes } from "./payments.js";
import { registerTrackingRoutes } from "./tracking.js";
import { registerAdminRoutes } from "./admin.js";
import { registerBIRoutes } from "./bi.js";
import { registerReferenceRoutes } from "./reference.js";
import { registerGscRoutes } from "./gsc.js";
import { registerEmailPreviewRoutes } from "./emailPreview.js";

export async function registerRoutes(app: Express): Promise<void> {
  registerAnalyzeRoutes(app);
  registerPaymentRoutes(app);
  registerTrackingRoutes(app);
  registerAdminRoutes(app);
  registerBIRoutes(app);
  registerReferenceRoutes(app);
  registerGscRoutes(app);
  registerEmailPreviewRoutes(app);
}
