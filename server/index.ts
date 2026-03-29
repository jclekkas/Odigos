import * as Sentry from "@sentry/node";
import crypto from "node:crypto";
import express, { type Request, Response, NextFunction } from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { trackEvent } from "./metrics";
import { db } from "./db";
import { sql } from "drizzle-orm";
import { writeAuditEvent } from "./audit";
import { logger } from "./logger";

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

// ── Security headers ─────────────────────────────────────────────────────────
// Generate a per-request cryptographic nonce for CSP script-src.
app.use((_req, res, next) => {
  res.locals.cspNonce = crypto.randomBytes(16).toString("base64");
  next();
});

// Use Helmet for non-CSP security headers; CSP is set manually below so we
// can include the per-request nonce.
app.use(
  helmet({
    contentSecurityPolicy: false,
    frameguard: { action: "deny" },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  })
);

// Manual CSP header with per-request nonce (replaces 'unsafe-inline' for scripts).
app.use((_req, res, next) => {
  const nonce = res.locals.cspNonce as string;
  const directives = [
    "default-src 'self'",
    `script-src 'self' https://js.stripe.com 'nonce-${nonce}'`,
    "connect-src 'self' https://api.stripe.com https://*.sentry.io https://app.posthog.com https://us.posthog.com",
    "frame-src https://js.stripe.com",
    "img-src 'self' data: https:",
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self' data:",
  ];
  res.setHeader("Content-Security-Policy", directives.join("; "));
  next();
});

// ── CORS ─────────────────────────────────────────────────────────────────────
// Exclude /api/stripe-webhook and /api/health from CORS enforcement
// (these are server-to-server routes)
const corsMiddleware = cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      origin === "https://odigosauto.com" ||
      /^http:\/\/localhost(:\d+)?$/.test(origin)
    ) {
      return callback(null, true);
    }
    if (
      process.env.NODE_ENV !== "production" &&
      /\.replit\.dev$/.test(origin)
    ) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"), false);
  },
  methods: ["GET", "POST"],
  credentials: false,
});

app.use((req, res, next) => {
  if (req.hostname && req.hostname.endsWith(".replit.app")) {
    return res.redirect(301, `https://odigosauto.com${req.originalUrl}`);
  }
  return next();
});

app.use((req, res, next) => {
  if (req.path === "/api/stripe-webhook" || req.path === "/api/health") {
    return next();
  }
  if (req.path.startsWith("/api/")) {
    return corsMiddleware(req, res, next);
  }
  return next();
});

// ── Proxy trust (required for rate limiter to work behind Replit/CF reverse proxy) ───
app.set("trust proxy", 1);

// ── Rate limiting ─────────────────────────────────────────────────────────────
//
// ⚠️  SINGLE-INSTANCE LIMITATION
// express-rate-limit uses an in-memory store by default. All request counters
// live in the JavaScript heap of a single Node.js process. There is no
// cross-instance coordination. Running multiple server replicas means each
// replica tracks its own independent rate-limit windows — a client could
// send max*replicas requests per window by spreading traffic across replicas.
// Redis (via rate-limit-redis) or a shared store is required for accurate,
// cross-instance rate limiting when scaling beyond one process.
const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: async (req, res) => {
    await writeAuditEvent(req, "rate_limit_breach", "failure", {
      route: req.originalUrl,
      method: req.method,
      rateLimitBucket: "general",
      statusCode: 429,
    });
    res.status(429).json({ error: "Too many requests", message: "Rate limit exceeded. Please try again in a minute." });
  },
});

const analyzeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: async (req, res) => {
    await writeAuditEvent(req, "rate_limit_breach", "failure", {
      route: req.originalUrl,
      method: req.method,
      rateLimitBucket: "analyze",
      statusCode: 429,
    });
    res.status(429).json({ error: "Too many requests", message: "Analysis rate limit exceeded. Please wait a minute before trying again." });
  },
});

app.use("/api/", generalLimiter);
app.use("/api/analyze", analyzeLimiter);

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

/** @deprecated Use `logger` from "./logger" instead. */
export function log(message: string, source = "express") {
  logger.info(message, { source });
}

export function buildApiLogLine(
  method: string,
  path: string,
  statusCode: number,
  duration: number,
  capturedJsonResponse: Record<string, any> | undefined
): string {
  let logLine = `${method} ${path} ${statusCode} in ${duration}ms`;
  if (statusCode >= 400 && capturedJsonResponse) {
    const safeValue = capturedJsonResponse.message ?? capturedJsonResponse.error;
    if (typeof safeValue === "string") {
      logLine += ` :: ${safeValue}`;
    }
  }
  return logLine;
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
      const logLine = buildApiLogLine(req.method, path, res.statusCode, duration, capturedJsonResponse);

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
      // Ensure dealer_submission_id column exists on core.listings (idempotent).
      try {
        await db.execute(sql`
          ALTER TABLE core.listings
            ADD COLUMN IF NOT EXISTS dealer_submission_id varchar(36)
        `);
        await db.execute(sql`
          CREATE INDEX IF NOT EXISTS core_listings_dealer_submission_idx
            ON core.listings (dealer_submission_id)
        `);
        console.log("[warehouse] dealer_submission_id column ensured on core.listings.");
      } catch (colErr) {
        console.error("[warehouse] Failed to ensure dealer_submission_id column (non-fatal):", colErr);
      }
      // Ensure content_hash column exists on core.listings (idempotent).
      try {
        await db.execute(sql`
          ALTER TABLE core.listings
            ADD COLUMN IF NOT EXISTS content_hash text
        `);
        console.log("[warehouse] content_hash column ensured on core.listings.");
      } catch (hashColErr) {
        console.error("[warehouse] Failed to ensure content_hash column (non-fatal):", hashColErr);
      }
      // Ensure duplicate_of_listing_id column exists on core.listings (idempotent).
      try {
        await db.execute(sql`
          ALTER TABLE core.listings
            ADD COLUMN IF NOT EXISTS duplicate_of_listing_id varchar(36)
        `);
        await db.execute(sql`
          ALTER TABLE core.listings
            ADD COLUMN IF NOT EXISTS sanity_flags jsonb NOT NULL DEFAULT '[]'::jsonb
        `);
        console.log("[warehouse] duplicate_of_listing_id and sanity_flags columns ensured on core.listings.");
      } catch (dupColErr) {
        console.error("[warehouse] Failed to ensure duplicate_of_listing_id column (non-fatal):", dupColErr);
      }
      // Ensure the dealer_feedback_stats view exists (idempotent via CREATE OR REPLACE).
      try {
        await db.execute(sql`
          CREATE OR REPLACE VIEW core.dealer_feedback_stats AS
          SELECT
            cl.dealer_id,
            SUM(CASE WHEN df.rating = true THEN 1 ELSE 0 END)::bigint AS positive_feedback_count,
            COUNT(CASE WHEN df.rating IS NOT NULL THEN 1 END)::bigint AS total_feedback_count,
            CASE
              WHEN COUNT(CASE WHEN df.rating IS NOT NULL THEN 1 END) > 0
              THEN SUM(CASE WHEN df.rating = true THEN 1 ELSE 0 END)::float
                   / COUNT(CASE WHEN df.rating IS NOT NULL THEN 1 END)
              ELSE NULL
            END AS feedback_agreement_pct
          FROM public.deal_feedback df
          JOIN public.dealer_submissions ds ON ds.id = df.listing_id
          JOIN core.listings cl ON cl.dealer_submission_id = ds.id
          GROUP BY cl.dealer_id
        `);
        console.log("[warehouse] dealer_feedback_stats view ensured.");
      } catch (viewErr) {
        console.error("[warehouse] Failed to ensure dealer_feedback_stats view (non-fatal):", viewErr);
      }
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

async function ensureAppSchema(): Promise<void> {
  if (!process.env.DATABASE_URL) return;
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS deal_feedback (
        id serial PRIMARY KEY,
        listing_id varchar NOT NULL REFERENCES dealer_submissions(id) ON DELETE CASCADE,
        rating boolean NOT NULL,
        comment text,
        created_at timestamptz DEFAULT now() NOT NULL,
        CONSTRAINT deal_feedback_listing_id_unique UNIQUE (listing_id)
      )
    `);
    console.log("[app-schema] deal_feedback table ensured.");
  } catch (err) {
    console.error("[app-schema] Failed to ensure deal_feedback schema (non-fatal):", err);
  }

  // ── DLQ replay columns migration (idempotent) ────────────────────────────
  try {
    await db.execute(sql`ALTER TABLE failed_warehouse_writes ADD COLUMN IF NOT EXISTS status varchar(16) NOT NULL DEFAULT 'pending'`);
    await db.execute(sql`ALTER TABLE failed_warehouse_writes ADD COLUMN IF NOT EXISTS max_attempts integer NOT NULL DEFAULT 5`);
    await db.execute(sql`ALTER TABLE failed_warehouse_writes ADD COLUMN IF NOT EXISTS next_attempt_at timestamptz NOT NULL DEFAULT now()`);
    await db.execute(sql`ALTER TABLE failed_warehouse_writes ADD COLUMN IF NOT EXISTS first_failed_at timestamptz NOT NULL DEFAULT now()`);
    await db.execute(sql`ALTER TABLE failed_warehouse_writes ADD COLUMN IF NOT EXISTS last_failed_at timestamptz NOT NULL DEFAULT now()`);
    await db.execute(sql`ALTER TABLE failed_warehouse_writes ADD COLUMN IF NOT EXISTS lease_expires_at timestamptz`);
    await db.execute(sql`ALTER TABLE failed_warehouse_writes ADD COLUMN IF NOT EXISTS last_error_code varchar(64)`);
    await db.execute(sql`ALTER TABLE failed_warehouse_writes ADD COLUMN IF NOT EXISTS last_error_message text`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS dlq_status_next_attempt_idx ON failed_warehouse_writes (status, next_attempt_at)`);
    console.log("[app-schema] DLQ replay columns ensured.");
  } catch (err) {
    console.error("[app-schema] Failed to ensure DLQ replay columns (non-fatal):", err);
  }

  try {
    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE audit_event_type AS ENUM ('analyze', 'payment', 'admin_action', 'rate_limit_breach');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE audit_outcome AS ENUM ('success', 'failure');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS audit_log (
        id serial PRIMARY KEY,
        event_type audit_event_type NOT NULL,
        occurred_at timestamptz DEFAULT now() NOT NULL,
        ip_hash text NOT NULL,
        user_agent_hash text NOT NULL,
        outcome audit_outcome NOT NULL,
        meta jsonb NOT NULL DEFAULT '{}'
      )
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS audit_log_event_type_idx ON audit_log (event_type)
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS audit_log_occurred_at_idx ON audit_log (occurred_at)
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS audit_log_event_type_occurred_at_idx ON audit_log (event_type, occurred_at)
    `);
    console.log("[app-schema] audit_log table ensured.");
  } catch (err) {
    console.error("[app-schema] Failed to ensure audit_log schema (non-fatal):", err);
  }

  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS metrics_events (
        id serial PRIMARY KEY,
        event_type text NOT NULL,
        created_at timestamptz DEFAULT now() NOT NULL,
        metadata jsonb NOT NULL DEFAULT '{}'
      )
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS metrics_events_event_type_idx ON metrics_events (event_type)
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS metrics_events_created_at_idx ON metrics_events (created_at)
    `);
    console.log("[app-schema] metrics_events table ensured.");
  } catch (err) {
    console.error("[app-schema] Failed to ensure metrics_events schema (non-fatal):", err);
  }
}

(async () => {
  await ensureWarehouseSchema();
  await ensureAppSchema();

  await registerRoutes(httpServer, app);

  if (sentryEnabled) {
    Sentry.setupExpressErrorHandler(app);
  }

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    logger.error("unhandled error", { statusCode: status, error: message });
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
      logger.info("server started", { port });

      try {
        const { startDailyScheduler } = await import("./warehouse/scheduler");
        startDailyScheduler();
      } catch (err) {
        logger.error("Failed to start daily scheduler", { source: "scheduler", error: String(err) });
      }

      try {
        const { startAlertScheduler } = await import("./alerts");
        startAlertScheduler();
      } catch (err) {
        logger.error("Failed to start alert scheduler", { source: "alerts", error: String(err) });
      }

      try {
        const { startDlqReplayWorker } = await import("./warehouse/dlqReplay");
        startDlqReplayWorker();
      } catch (err) {
        logger.error("Failed to start DLQ replay worker", { source: "dlq-replay", error: String(err) });
      }
    },
  );

  // ── Graceful shutdown ────────────────────────────────────────────────────────
  let shuttingDown = false;
  async function shutdown(signal: string) {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info("starting graceful shutdown", { signal });

    // 1. Stop accepting new connections
    httpServer.close(() => {
      logger.info("HTTP server closed");
    });

    // 2. Stop scheduled tasks
    try {
      const { stopDailyScheduler } = await import("./warehouse/scheduler");
      stopDailyScheduler();
    } catch { /* scheduler may not have been imported */ }

    // 3. Drain database pool
    try {
      const { pool } = await import("./db");
      await pool.end();
      logger.info("Database pool drained");
    } catch { /* pool may not exist */ }

    // 4. Flush Sentry
    if (sentryEnabled) {
      await Sentry.close(2000);
    }

    process.exit(0);
  }

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
})();
