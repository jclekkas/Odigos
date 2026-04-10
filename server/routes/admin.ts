import { timingSafeEqual } from "crypto";
import * as fs from "fs";
import * as path from "path";
import type { Express, Request, Response } from "express";
import { getStripeClient, isStripeConfigured } from "../stripeClient.js";
import { getImportedSessionIds, importHistoricalEvents } from "../events.js";
import { listAuditLog } from "../storage.js";
import { writeAuditEvent } from "../audit.js";

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

  app.get("/api/admin/backup/status", (req, res) => {
    if (!requireAdminKey(req, res)) return;
    try {
      const backupsDir = path.resolve("backups");
      if (!fs.existsSync(backupsDir)) {
        return res.json({ backup: null });
      }

      const files = fs.readdirSync(backupsDir).filter((f) => f.endsWith(".dump"));
      if (files.length === 0) {
        return res.json({ backup: null });
      }

      let newest: { name: string; size: number; modifiedAt: string } | null = null;
      for (const file of files) {
        const filePath = path.join(backupsDir, file);
        const stat = fs.statSync(filePath);
        if (!newest || stat.mtimeMs > new Date(newest.modifiedAt).getTime()) {
          newest = { name: file, size: stat.size, modifiedAt: stat.mtime.toISOString() };
        }
      }

      res.json({ backup: newest });
    } catch (err: any) {
      console.error("[admin] /api/admin/backup/status error:", err?.message || err);
      res.status(500).json({ error: "Failed to read backup status", message: err?.message });
    }
  });
}
