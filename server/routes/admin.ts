import { timingSafeEqual } from "crypto";
import type { Express, Request, Response } from "express";
import { getStripeClient, isStripeConfigured } from "../stripeClient";
import { getImportedSessionIds, importHistoricalEvents } from "../events";
import { listAuditLog, storage } from "../storage";
import { writeAuditEvent } from "../audit";
import {
  validateEntry,
  processSeedEntry,
  type SeedEntry,
} from "../services/seedService";

/**
 * Per-request cost cap for the admin seed UI. Deliberately low — a single
 * quote should cost ~$0.03, so $0.10 is a generous ceiling that still
 * prevents runaway spend if a giant payload slips through.
 */
const ADMIN_SEED_MAX_COST_USD = 0.10;

export function requireAdminKey(req: Request, res: Response): boolean {
  const configuredKey = process.env.ADMIN_KEY;
  if (!configuredKey) { res.status(503).json({ error: "Admin access not configured" }); return false; }
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" }); return false;
  }
  const providedKey = authHeader.slice("Bearer ".length);
  try {
    const a = Buffer.from(configuredKey);
    const b = Buffer.from(providedKey);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      res.status(401).json({ error: "Unauthorized" }); return false;
    }
  } catch {
    res.status(401).json({ error: "Unauthorized" }); return false;
  }
  return true;
}

export function registerAdminRoutes(app: Express): void {
  app.get("/api/metrics", async (req, res) => {
    if (!requireAdminKey(req, res)) return;
    try {
      const { getMetricsSummary } = await import("../analytics");
      const summary = await getMetricsSummary();
      res.json(summary);
    } catch (error: unknown) {
      console.error("Metrics error:", error instanceof Error ? error.message : error);
      res.status(500).json({ error: "Failed to fetch metrics" });
    }
  });

  app.get("/api/alerts", async (req, res) => {
    if (!requireAdminKey(req, res)) return;
    try {
      const { getAlertsStatus } = await import("../alerts");
      const status = await getAlertsStatus();
      res.json(status);
    } catch (error: unknown) {
      console.error("[alerts] /api/alerts error:", error instanceof Error ? error.message : error);
      res.status(500).json({ error: "Failed to fetch alert status" });
    }
  });

  app.get("/api/technical", async (req, res) => {
    if (!requireAdminKey(req, res)) return;
    try {
      const { getTechnicalSummary, getPiiExpiryStatus } = await import("../analytics");
      const [summary, piiRetention] = await Promise.all([getTechnicalSummary(), getPiiExpiryStatus()]);
      res.json({ ...summary, piiRetention });
    } catch (error: unknown) {
      console.error("Technical metrics error:", error instanceof Error ? error.message : error);
      res.status(500).json({ error: "Failed to fetch technical metrics" });
    }
  });

  app.post("/api/admin/import-stripe-history", async (req, res) => {
    if (!requireAdminKey(req, res)) return;
    try {
      const configured = await isStripeConfigured();
      if (!configured) return res.status(400).json({ error: "Stripe is not configured" });

      const stripe = await getStripeClient();
      const alreadyImported = await getImportedSessionIds();

      const payments: Array<{ id: string; amount: number; created: Date; tier: "49" | "79" }> = [];
      let hasMore = true;
      let startingAfter: string | undefined;
      let skipped = 0;

      while (hasMore) {
        const sessions = await stripe.checkout.sessions.list({
          limit: 100,
          starting_after: startingAfter,
          expand: ["data.line_items"],
        });
        for (const session of sessions.data) {
          if (session.payment_status === "paid") {
            if (alreadyImported.has(session.id)) { skipped++; continue; }
            let tier: "49" | "79" = "49";
            const amount = session.amount_total ? session.amount_total / 100 : 49;
            if (session.metadata?.tier) {
              tier = session.metadata.tier === "79" ? "79" : "49";
            } else if (amount >= 79) {
              tier = "79";
            }
            payments.push({ id: session.id, amount, created: new Date(session.created * 1000), tier });
          }
        }
        hasMore = sessions.has_more;
        if (sessions.data.length > 0) {
          startingAfter = sessions.data[sessions.data.length - 1].id;
        } else {
          hasMore = false;
        }
      }

      if (payments.length === 0) {
        return res.json({
          success: true, imported: 0, skipped, totalEvents: 0,
          message: skipped > 0 ? `No new payments to import (${skipped} already imported)` : "No payments found in Stripe",
        });
      }

      const events = [];
      for (const payment of payments) {
        events.push({ eventType: "checkout_started" as const, createdAt: new Date(payment.created.getTime() - 60000).toISOString(), metadata: { tier: payment.tier, stripeSessionId: payment.id } });
        events.push({ eventType: "payment_completed" as const, createdAt: payment.created.toISOString(), metadata: { tier: payment.tier, stripeSessionId: payment.id } });
        events.push({ eventType: "submission" as const, createdAt: new Date(payment.created.getTime() - 120000).toISOString(), metadata: { stripeSessionId: payment.id } });
      }

      await importHistoricalEvents(events);
      res.json({
        success: true, imported: payments.length, skipped, totalEvents: events.length,
        message: `Imported ${payments.length} new payments (${events.length} events)${skipped > 0 ? `, skipped ${skipped} duplicates` : ""}`,
      });
    } catch (error: unknown) {
      console.error("Stripe import error:", error);
      res.status(500).json({ error: "Failed to import Stripe history" });
    }
  });

  // ───────────────────────────────────────────────────────────────────────
  // Admin seed UI endpoints
  //
  // Private, ADMIN_KEY-gated endpoints powering the /admin/seed page.
  // They wrap the same shared seedService that the CLI script uses so
  // validation rules, row-tagging, and cost accounting stay identical
  // across both entrypoints.
  //
  // - POST /api/admin/seed/validate: dry-check one entry, no writes
  // - POST /api/admin/seed/commit:   validate → runAnalysis → tag → refresh
  // - GET  /api/admin/seed/recent:   list most recent seeded rows
  //
  // Per-request cost cap is hardcoded to ADMIN_SEED_MAX_COST_USD ($0.10).
  // ───────────────────────────────────────────────────────────────────────

  /**
   * Coerce a raw JSON value from req.body into a clean SeedEntry shape.
   * Anything ambiguous becomes undefined so downstream validation can
   * produce clean error messages. Numbers are parsed and coerced from
   * strings since HTML form inputs deliver strings.
   */
  function coerceSeedEntry(body: unknown): Partial<SeedEntry> {
    const b = (body ?? {}) as Record<string, unknown>;
    const str = (v: unknown): string | undefined =>
      typeof v === "string" && v.trim() ? v.trim() : undefined;
    const num = (v: unknown): number | undefined => {
      if (v == null || v === "") return undefined;
      const n = typeof v === "number" ? v : Number(v);
      return Number.isFinite(n) ? n : undefined;
    };
    const condition = (() => {
      const c = str(b.condition);
      return c === "new" || c === "used" || c === "unknown" ? c : undefined;
    })();
    const purchaseType = (() => {
      const p = str(b.purchaseType);
      return p === "new" ? undefined : p === "cash" || p === "finance" || p === "lease" || p === "unknown" ? p : undefined;
    })();
    return {
      sourceId: str(b.sourceId),
      reviewStatus: str(b.reviewStatus) ?? "approved",
      vehicle: str(b.vehicle),
      zipCode: str(b.zipCode),
      stateCode: str(b.stateCode)?.toUpperCase().slice(0, 2),
      condition,
      purchaseType,
      msrp: num(b.msrp),
      sellingPrice: num(b.sellingPrice),
      docFee: num(b.docFee),
      otdPrice: num(b.otdPrice),
      dealerText: str(b.dealerText) ?? "",
    };
  }

  app.post("/api/admin/seed/validate", async (req, res) => {
    if (!requireAdminKey(req, res)) return;
    try {
      const entry = coerceSeedEntry(req.body);
      const result = validateEntry(entry);
      res.json({
        valid: result.valid,
        errors: result.errors,
        missingStateCode: !entry.stateCode,
      });
    } catch (err: unknown) {
      console.error("[admin/seed/validate] error:", err instanceof Error ? err.message : err);
      res.status(500).json({ error: "Validation failed" });
    }
  });

  app.post("/api/admin/seed/commit", async (req, res) => {
    if (!requireAdminKey(req, res)) return;
    try {
      const body = (req.body ?? {}) as Record<string, unknown>;
      const rawBatchId = typeof body.batchId === "string" ? body.batchId.trim() : "";
      if (!rawBatchId) {
        return res.status(400).json({ error: "batchId is required" });
      }
      // Prevent weirdness in the batch id — only allow [A-Za-z0-9-_]
      if (!/^[A-Za-z0-9_-]{1,64}$/.test(rawBatchId)) {
        return res.status(400).json({
          error: "batchId must be 1–64 chars: letters, digits, hyphens, underscores only",
        });
      }

      const partial = coerceSeedEntry(req.body);
      const upfront = validateEntry(partial);
      if (!upfront.valid) {
        return res.status(400).json({
          status: "validation_failed",
          errors: upfront.errors,
        });
      }

      const outcome = await processSeedEntry({
        entry: partial as SeedEntry,
        batchId: rawBatchId,
        maxCostUsd: ADMIN_SEED_MAX_COST_USD,
        refreshViewsAfter: true,
      });

      if (outcome.status === "committed") {
        const stateSummary = await storage.getStateAggregateSummary();
        await writeAuditEvent(req, "admin_action", "success", {
          route: req.originalUrl,
          method: req.method,
          statusCode: 200,
          action: "seed_commit",
          listingId: outcome.listingId,
          batchId: rawBatchId,
          stateCode: partial.stateCode ?? null,
        });
        return res.json({
          status: "committed",
          listingId: outcome.listingId,
          coreListingId: outcome.coreListingId,
          costUsd: outcome.costUsd,
          analysis: outcome.analysis,
          stateAggregateSummary: stateSummary,
        });
      }

      // Non-committed outcomes: validation_failed / duplicate / cost_capped / analysis_failed
      const statusCode =
        outcome.status === "validation_failed" ? 400
        : outcome.status === "duplicate" ? 409
        : outcome.status === "cost_capped" ? 402
        : 502;

      await writeAuditEvent(req, "admin_action", "failure", {
        route: req.originalUrl,
        method: req.method,
        statusCode,
        action: "seed_commit",
        reason: outcome.status,
      });
      return res.status(statusCode).json(outcome);
    } catch (err: unknown) {
      console.error("[admin/seed/commit] error:", err instanceof Error ? err.message : err);
      await writeAuditEvent(req, "admin_action", "failure", {
        route: req.originalUrl,
        method: req.method,
        statusCode: 500,
        action: "seed_commit",
        errorClass: err instanceof Error ? err.name : "UnknownError",
      });
      res.status(500).json({ error: "Commit failed" });
    }
  });

  app.get("/api/admin/seed/recent", async (req, res) => {
    if (!requireAdminKey(req, res)) return;
    try {
      const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
      const rows = await storage.listRecentSeededRows(limit);
      res.json({ rows });
    } catch (err: unknown) {
      console.error("[admin/seed/recent] error:", err instanceof Error ? err.message : err);
      res.status(500).json({ error: "Failed to list recent seeded rows" });
    }
  });

  app.get("/api/admin/audit-log", async (req, res, next) => {
    if (!requireAdminKey(req, res)) return;
    try {
      const limit = Math.min(Number(req.query.limit) || 100, 500);
      const offset = Math.max(Number(req.query.offset) || 0, 0);
      const VALID_EVENT_TYPES = ["analyze", "payment", "admin_action", "rate_limit_breach"] as const;
      type ValidEventType = typeof VALID_EVENT_TYPES[number];
      const rawEventType = typeof req.query.event_type === "string" ? req.query.event_type : undefined;
      const eventType: ValidEventType | undefined = rawEventType && (VALID_EVENT_TYPES as readonly string[]).includes(rawEventType)
        ? rawEventType as ValidEventType
        : undefined;
      const from = typeof req.query.from === "string" ? new Date(req.query.from) : undefined;
      const to = typeof req.query.to === "string" ? new Date(req.query.to) : undefined;

      const rows = await listAuditLog({
        eventType,
        from: from && !Number.isNaN(from.getTime()) ? from : undefined,
        to: to && !Number.isNaN(to.getTime()) ? to : undefined,
        limit,
        offset,
      });

      await writeAuditEvent(req, "admin_action", "success", {
        route: req.originalUrl,
        method: req.method,
        statusCode: 200,
        action: "view_audit_log",
        filters: { eventType: eventType ?? null, from: req.query.from ?? null, to: req.query.to ?? null, limit, offset },
      });

      res.json({ items: rows, limit, offset, count: rows.length });
    } catch (err) {
      await writeAuditEvent(req, "admin_action", "failure", {
        route: req.originalUrl,
        method: req.method,
        statusCode: 500,
        action: "view_audit_log",
        errorClass: err instanceof Error ? err.name : "UnknownError",
      });
      next(err);
    }
  });
}
