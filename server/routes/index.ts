import type { Express } from "express";
import { createServer, type Server } from "http";
import { registerAnalyzeRoutes } from "./analyze";
import { registerPaymentRoutes } from "./payments";
import { registerTrackingRoutes } from "./tracking";
import { registerAdminRoutes } from "./admin";
import { registerBIRoutes } from "./bi";
import { registerReferenceRoutes } from "./reference";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  registerAnalyzeRoutes(app);
  registerPaymentRoutes(app);
  registerTrackingRoutes(app);
  registerAdminRoutes(app);
  registerBIRoutes(app);
  registerReferenceRoutes(app);
  return httpServer;
}
