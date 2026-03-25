import type { Express } from "express";
import { createServer, type Server } from "http";
import { registerAnalyzeRoutes } from "./routers/analyze";
import { registerPaymentRoutes } from "./routers/payments";
import { registerAdminRoutes } from "./routers/admin";
import { registerStatsRoutes } from "./routers/stats";
import { registerPublicRoutes } from "./routers/public";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  registerAnalyzeRoutes(app);
  registerPaymentRoutes(app);
  registerAdminRoutes(app);
  registerStatsRoutes(app);
  registerPublicRoutes(app);
  return httpServer;
}
