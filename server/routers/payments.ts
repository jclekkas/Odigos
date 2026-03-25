import * as Sentry from "@sentry/node";
import type { Express } from "express";
import { getStripeClient, isStripeConfigured } from "../stripeClient";
import { trackEvent, getImportedSessionIds, importHistoricalEvents } from "../events";

export function registerPaymentRoutes(app: Express): void {
  app.get("/api/stripe-status", async (_req, res) => {
    try {
      const configured = await isStripeConfigured();
      res.json({ configured });
    } catch {
      res.json({ configured: false });
    }
  });

  app.post("/api/checkout", async (req, res) => {
    try {
      const { product, sessionId } = req.body;
      
      if (!product || !["deal_clarity", "negotiation_pack"].includes(product)) {
        return res.status(400).json({ error: "INVALID_PRODUCT" });
      }

      const secretKey = process.env.STRIPE_SECRET_KEY;
      if (!secretKey) {
        return res.status(400).json({ error: "PAYMENTS_NOT_CONFIGURED" });
      }

      let priceId: string | undefined;
      
      if (product === "deal_clarity") {
        priceId = process.env.STRIPE_PRICE_ID_49;
        if (!priceId) {
          return res.status(400).json({ error: "PAYMENTS_NOT_CONFIGURED" });
        }
      } else {
        priceId = process.env.STRIPE_PRICE_ID_79;
        if (!priceId) {
          return res.status(400).json({ error: "PAYMENTS_NOT_CONFIGURED" });
        }
      }

      const stripe = await getStripeClient();
      
      const baseUrl = process.env.REPLIT_DOMAINS
        ? `https://${process.env.REPLIT_DOMAINS.split(",")[0]}`
        : "http://localhost:5000";

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${baseUrl}/analyze?paid=1&product=${product}`,
        cancel_url: `${baseUrl}/analyze?paid=0`,
        metadata: { product, sessionId: sessionId ?? "" },
      });

      trackEvent("checkout_started", {
        stripeSessionId: session.id,
        sessionId: sessionId,
      });

      res.json({ url: session.url });
    } catch (error) {
      console.error("Checkout error:", error);
      Sentry.withScope((scope) => {
        scope.setTag("feature", "checkout");
        scope.setTag("route", "/api/checkout");
        scope.setTag("error_type", error instanceof Error ? error.constructor.name : "unknown");
        Sentry.captureException(error);
      });
      res.status(500).json({ error: "CHECKOUT_FAILED" });
    }
  });

  app.post("/api/create-checkout-session", async (req, res) => {
    try {
      const configured = await isStripeConfigured();
      if (!configured) {
        return res.status(503).json({ error: "Payments not configured" });
      }

      const { analysisId, tier, sessionId } = req.body;
      if (!analysisId) {
        return res.status(400).json({ error: "Missing analysisId" });
      }
      
      const selectedTier = tier === "49" ? "49" : "79";

      const stripe = await getStripeClient();
      
      const baseUrl = process.env.REPLIT_DOMAINS
        ? `https://${process.env.REPLIT_DOMAINS.split(",")[0]}`
        : "http://localhost:5000";

      let priceId: string | undefined;

      if (selectedTier === "49") {
        if (process.env.STRIPE_PRICE_ID_49) {
          priceId = process.env.STRIPE_PRICE_ID_49;
        } else {
          const products = await stripe.products.list({ active: true, limit: 20 });
          let product = products.data.find(p => p.name === "Odigos Deal Clarity Pack");
          
          if (!product) {
            product = await stripe.products.create({
              name: "Odigos Deal Clarity Pack",
              description: "Unlock red flags, missing info, and deal explanation",
            });
            const price = await stripe.prices.create({
              product: product.id,
              unit_amount: 4900,
              currency: "usd",
            });
            priceId = price.id;
          } else {
            const prices = await stripe.prices.list({ product: product.id, active: true, limit: 1 });
            priceId = prices.data[0]?.id;
          }
        }
      } else {
        if (process.env.STRIPE_PRICE_ID) {
          priceId = process.env.STRIPE_PRICE_ID;
        } else {
          const products = await stripe.products.list({ active: true, limit: 20 });
          let product = products.data.find(p => p.name === "Odigos Negotiation Pack");
          
          if (!product) {
            product = await stripe.products.create({
              name: "Odigos Negotiation Pack",
              description: "Unlock suggested dealer reply and detailed analysis reasoning",
            });
            const price = await stripe.prices.create({
              product: product.id,
              unit_amount: 7900,
              currency: "usd",
            });
            priceId = price.id;
          } else {
            const prices = await stripe.prices.list({ product: product.id, active: true, limit: 1 });
            priceId = prices.data[0]?.id;
          }
        }
      }

      if (!priceId) {
        return res.status(500).json({ error: "No price configured" });
      }

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${baseUrl}/analyze?session_id={CHECKOUT_SESSION_ID}&analysisId=${analysisId}`,
        cancel_url: `${baseUrl}/analyze?canceled=1&analysisId=${analysisId}`,
        metadata: { tier: selectedTier, sessionId: sessionId ?? "" },
      });

      trackEvent("checkout_started", {
        tier: selectedTier,
        stripeSessionId: session.id,
        sessionId: sessionId,
      });

      res.json({ url: session.url });
    } catch (error) {
      console.error("Checkout session error:", error);
      res.status(500).json({ error: "Failed to create checkout session" });
    }
  });

  app.get("/api/verify-session", async (req, res) => {
    try {
      const { session_id } = req.query;
      
      if (!session_id || typeof session_id !== "string") {
        return res.json({ paid: false, tier: null });
      }

      const configured = await isStripeConfigured();
      if (!configured) {
        return res.json({ paid: false, tier: null });
      }

      const stripe = await getStripeClient();
      const session = await stripe.checkout.sessions.retrieve(session_id, {
        expand: ["line_items.data.price"],
      });
      
      if (session.payment_status !== "paid") {
        return res.json({ paid: false, tier: null });
      }

      let tier: "49" | "79" = "79";
      
      if (session.metadata?.tier) {
        tier = session.metadata.tier === "49" ? "49" : "79";
      } else {
        const lineItems = session.line_items?.data || [];
        const priceAmount = (lineItems[0]?.price as any)?.unit_amount;
        if (priceAmount === 4900) {
          tier = "49";
        }
      }
      
      const paymentSessionId = session.metadata?.sessionId || undefined;
      trackEvent("payment_completed", { tier, sessionId: paymentSessionId, stripeSessionId: session_id });
      
      res.json({ paid: true, tier });
    } catch (error) {
      console.error("Session verification error:", error);
      res.json({ paid: false, tier: null });
    }
  });

  app.post("/api/stripe-webhook", async (req, res) => {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("[stripe-webhook] STRIPE_WEBHOOK_SECRET is not configured — rejecting webhook");
      return res.status(500).json({ error: "Webhook signing secret is not configured" });
    }
    const sig = req.headers["stripe-signature"];
    if (!sig) {
      trackEvent("stripe_webhook", { webhookStatus: "failed", errorMessage: "missing_signature" });
      return res.status(400).json({ error: "Missing stripe-signature header" });
    }
    let event: import("stripe").Stripe.Event;
    try {
      const stripe = await getStripeClient();
      const rawBody = req.rawBody instanceof Buffer ? req.rawBody : Buffer.from(req.rawBody as string ?? "");
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "signature_verification_failed";
      trackEvent("stripe_webhook", { webhookStatus: "failed", errorMessage: errMsg });
      return res.status(400).json({ error: "Webhook signature verification failed" });
    }
    
    trackEvent("stripe_webhook", { webhookEvent: event.type, webhookStatus: "success" });
    res.json({ received: true });
  });

  app.post("/api/admin/import-stripe-history", async (req, res) => {
    // Admin key check done inline here since this route is payment-domain but admin-gated
    const configuredKey = process.env.ADMIN_KEY;
    if (!configuredKey) { return res.status(503).json({ error: "Admin access not configured" }); }
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { timingSafeEqual } = await import("crypto");
    try {
      const a = Buffer.from(configuredKey);
      const b = Buffer.from(authHeader.slice("Bearer ".length));
      if (a.length !== b.length || !timingSafeEqual(a, b)) {
        return res.status(401).json({ error: "Unauthorized" });
      }
    } catch {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const configured = await isStripeConfigured();
      if (!configured) {
        return res.status(400).json({ error: "Stripe is not configured" });
      }
      
      const stripe = await getStripeClient();
      
      const alreadyImported = await getImportedSessionIds();
      
      const payments: Array<{
        id: string;
        amount: number;
        created: Date;
        tier: "49" | "79";
      }> = [];
      
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
            if (alreadyImported.has(session.id)) {
              skipped++;
              continue;
            }
            
            let tier: "49" | "79" = "49";
            const amount = session.amount_total ? session.amount_total / 100 : 49;
            
            if (session.metadata?.tier) {
              tier = session.metadata.tier === "79" ? "79" : "49";
            } else if (amount >= 79) {
              tier = "79";
            }
            
            payments.push({
              id: session.id,
              amount,
              created: new Date(session.created * 1000),
              tier,
            });
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
          success: true, 
          imported: 0,
          skipped,
          totalEvents: 0,
          message: skipped > 0 
            ? `No new payments to import (${skipped} already imported)` 
            : "No payments found in Stripe"
        });
      }
      
      const events = [];
      for (const payment of payments) {
        events.push({
          eventType: "checkout_started" as const,
          createdAt: new Date(payment.created.getTime() - 60000).toISOString(),
          metadata: { tier: payment.tier, stripeSessionId: payment.id },
        });
        events.push({
          eventType: "payment_completed" as const,
          createdAt: payment.created.toISOString(),
          metadata: { tier: payment.tier, stripeSessionId: payment.id },
        });
        events.push({
          eventType: "submission" as const,
          createdAt: new Date(payment.created.getTime() - 120000).toISOString(),
          metadata: { stripeSessionId: payment.id },
        });
      }
      
      await importHistoricalEvents(events);
      
      res.json({ 
        success: true, 
        imported: payments.length,
        skipped,
        totalEvents: events.length,
        message: `Imported ${payments.length} new payments (${events.length} events)${skipped > 0 ? `, skipped ${skipped} duplicates` : ''}`
      });
    } catch (error: any) {
      console.error("Stripe import error:", error);
      res.status(500).json({ 
        error: "Failed to import Stripe history",
        message: error?.message 
      });
    }
  });
}
