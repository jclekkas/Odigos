import * as Sentry from "@sentry/node";
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { trackEvent } from "./metrics";
import { db } from "./db";
import { sql } from "drizzle-orm";

const SENSITIVE_KEYS = ["dealerText", "body", "text", "content", "rawBody", "file", "buffer", "password", "token"];

function sanitizeEvent(event: Sentry.ErrorEvent): Sentry.ErrorEvent | null {
  if (event.request) {
    delete event.request.data;
    if (event.request.headers) {
      delete (event.request.headers as Record<string, unknown>)["authorization"];
      delete (event.request.headers as Record<string, unknown>)["cookie"];
    }
  }
  if (event.extra) {
    for (const key of SENSITIVE_KEYS) {
      if (key in event.extra) {
        delete event.extra[key];
      }
    }
  }
  return event;
}

const sentryEnabled = !!(process.env.SENTRY_DSN &&
  (process.env.NODE_ENV === "production" || process.env.SENTRY_ENABLED === "true"));

if (sentryEnabled) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || "development",
    integrations: [Sentry.expressIntegration()],
    tracesSampleRate: 0.1,
    beforeSend: sanitizeEvent,
  });

  process.on("unhandledRejection", (reason) => {
    Sentry.captureException(reason);
  });

  process.on("uncaughtException", (err) => {
    Sentry.captureException(err);
  });
}

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);

      const trackedEndpoints = ["/api/analyze", "/api/extract-text", "/api/track", "/api/metrics", "/api/checkout"];
      const matchedEndpoint = trackedEndpoints.find(e => path === e || path.startsWith(e + "/"));
      if (matchedEndpoint) {
        const statusCode = res.statusCode;
        if (statusCode >= 400) {
          const errorMessage = capturedJsonResponse
            ? (capturedJsonResponse.message || capturedJsonResponse.error || undefined)
            : undefined;
          trackEvent("api_error", {
            endpoint: matchedEndpoint,
            method: req.method,
            statusCode,
            responseTimeMs: duration,
            errorMessage: typeof errorMessage === "string" ? errorMessage : undefined,
          });
        } else {
          trackEvent("api_request", {
            endpoint: matchedEndpoint,
            method: req.method,
            statusCode,
            responseTimeMs: duration,
          });
        }
      }
    }
  });

  next();
});

/**
 * Ensures the warehouse schema exists on every server startup.
 *
 * Checks for the presence of raw.user_analyses. If it does not exist the full
 * warehouse bootstrap runs (schemas → tables → materialized views → reference
 * data). If it already exists nothing is touched. All errors are caught so the
 * server always starts even if the warehouse is unavailable.
 */
async function ensureWarehouseSchema(): Promise<void> {
  try {
    const result = await db.execute(sql`
      SELECT EXISTS (
        SELECT 1 FROM pg_tables
        WHERE schemaname = 'raw' AND tablename = 'user_analyses'
      ) AS exists
    `);

    const exists = (result.rows[0] as { exists: boolean }).exists;

    if (exists) {
      console.log("[warehouse] Schema already exists — skipping bootstrap.");
      return;
    }

    console.log("[warehouse] raw.user_analyses not found — running warehouse bootstrap...");

    const { setupWarehouseViews } = await import("./warehouse/setupViews");
    await setupWarehouseViews();

    const { seedReferenceData } = await import("./warehouse/seedReference");
    await seedReferenceData();

    console.log("[warehouse] Bootstrap complete.");
  } catch (err) {
    console.error("[warehouse] Bootstrap failed (server will still start):", err);
  }
}

(async () => {
  await ensureWarehouseSchema();

  await registerRoutes(httpServer, app);

  if (sentryEnabled) {
    Sentry.setupExpressErrorHandler(app);
  }

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    async () => {
      log(`serving on port ${port}`);

      try {
        const { startDailyScheduler } = await import("./warehouse/scheduler");
        startDailyScheduler();
      } catch (err) {
        console.error("[scheduler] Failed to start daily scheduler:", err);
      }
    },
  );
})();
