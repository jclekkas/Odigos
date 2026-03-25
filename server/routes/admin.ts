import { timingSafeEqual } from "crypto";
import type { Express, Request, Response } from "express";
import { getStripeClient, isStripeConfigured } from "../stripeClient";
import { getImportedSessionIds, importHistoricalEvents } from "../events";

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
    } catch (error: any) {
      console.error("Metrics error:", error?.message || error);
      res.status(500).json({ error: "Failed to fetch metrics", message: error?.message, hasDbUrl: !!process.env.DATABASE_URL });
    }
  });

  app.get("/api/alerts", async (req, res) => {
    if (!requireAdminKey(req, res)) return;
    try {
      const { getAlertsStatus } = await import("../alerts");
      const status = await getAlertsStatus();
      res.json(status);
    } catch (error: any) {
      console.error("[alerts] /api/alerts error:", error?.message || error);
      res.status(500).json({ error: "Failed to fetch alert status", message: error?.message });
    }
  });

  app.get("/api/technical", async (req, res) => {
    if (!requireAdminKey(req, res)) return;
    try {
      const { getTechnicalSummary, getPiiExpiryStatus } = await import("../analytics");
      const [summary, piiRetention] = await Promise.all([getTechnicalSummary(), getPiiExpiryStatus()]);
      res.json({ ...summary, piiRetention });
    } catch (error: any) {
      console.error("Technical metrics error:", error?.message || error);
      res.status(500).json({ error: "Failed to fetch technical metrics", message: error?.message });
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
    } catch (error: any) {
      console.error("Stripe import error:", error);
      res.status(500).json({ error: "Failed to import Stripe history", message: error?.message });
    }
  });
}
