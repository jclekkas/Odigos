import type { Express } from "express";
import { registerAnalyzeRoutes } from "./analyze";
import { registerPaymentRoutes } from "./payments";
import { registerTrackingRoutes } from "./tracking";
import { registerAdminRoutes } from "./admin";
import { registerBIRoutes } from "./bi";
import { registerReferenceRoutes } from "./reference";
import { registerGscRoutes } from "./gsc";
import { registerEmailPreviewRoutes } from "./emailPreview";

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
