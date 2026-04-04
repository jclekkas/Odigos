import * as Sentry from "@sentry/node";
import type { Express } from "express";
import { getStripeClient, isStripeConfigured } from "../stripeClient";
import { trackEvent } from "../events";
import { writeAuditEvent } from "../audit";

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
        if (!priceId) return res.status(400).json({ error: "PAYMENTS_NOT_CONFIGURED" });
      } else {
        priceId = process.env.STRIPE_PRICE_ID_79;
        if (!priceId) return res.status(400).json({ error: "PAYMENTS_NOT_CONFIGURED" });
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

      trackEvent("checkout_started", { stripeSessionId: session.id, sessionId });
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
      if (!configured) return res.status(503).json({ error: "Payments not configured" });

      const { analysisId, tier, sessionId } = req.body;
      if (!analysisId) return res.status(400).json({ error: "Missing analysisId" });

      const selectedTier = tier === "49" ? "49" : "79";
      const stripe = await getStripeClient();
      const baseUrl = process.env.REPLIT_DOMAINS
        ? `https://${process.env.REPLIT_DOMAINS.split(",")[0]}`
        : "http://localhost:5000";

      // Price IDs must be pre-configured in Stripe Dashboard — never create at request time
      // (dynamic creation causes race conditions and duplicate products)
      const priceId = selectedTier === "49"
        ? process.env.STRIPE_PRICE_ID_49
        : (process.env.STRIPE_PRICE_ID_79 || process.env.STRIPE_PRICE_ID);

      if (!priceId) {
        console.error(`[checkout] Missing STRIPE_PRICE_ID_${selectedTier} environment variable`);
        return res.status(503).json({ error: "Payments not configured" });
      }

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${baseUrl}/analyze?session_id={CHECKOUT_SESSION_ID}&analysisId=${analysisId}`,
        cancel_url: `${baseUrl}/analyze?canceled=1&analysisId=${analysisId}`,
        metadata: { tier: selectedTier, sessionId: sessionId ?? "" },
      });

      trackEvent("checkout_started", { tier: selectedTier, stripeSessionId: session.id, sessionId });
      res.json({ url: session.url });
    } catch (error) {
      console.error("Checkout session error:", error);
      res.status(500).json({ error: "Failed to create checkout session" });
    }
  });

  app.get("/api/verify-session", async (req, res) => {
    try {
      const { session_id } = req.query;
      if (!session_id || typeof session_id !== "string") return res.json({ paid: false, tier: null });

      const configured = await isStripeConfigured();
      if (!configured) return res.json({ paid: false, tier: null });

      const stripe = await getStripeClient();
      const session = await stripe.checkout.sessions.retrieve(session_id, { expand: ["line_items.data.price"] });

      if (session.payment_status !== "paid") return res.json({ paid: false, tier: null });

      let tier: "49" | "79" = "79";
      if (session.metadata?.tier) {
        tier = session.metadata.tier === "49" ? "49" : "79";
      } else {
        const lineItems = session.line_items?.data || [];
        const priceAmount = (lineItems[0]?.price as unknown as Record<string, unknown>)?.unit_amount;
        if (priceAmount === 4900) tier = "49";
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
      await writeAuditEvent(req, "payment", "failure", {
        route: req.originalUrl,
        method: req.method,
        statusCode: 400,
        provider: "stripe",
        errorClass: err instanceof Error ? err.name : "UnknownError",
      });
      return res.status(400).json({ error: "Webhook signature verification failed" });
    }
    trackEvent("stripe_webhook", { webhookEvent: event.type, webhookStatus: "success" });

    // ── Process relevant payment events ──────────────────────────────────
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as import("stripe").Stripe.Checkout.Session;
        if (session.payment_status === "paid") {
          const tier = session.metadata?.tier === "79" ? "79" : "49";
          const paymentSessionId = session.metadata?.sessionId || undefined;
          trackEvent("payment_completed", {
            tier,
            sessionId: paymentSessionId,
            stripeSessionId: session.id,
          });
          console.log(`[stripe-webhook] Payment recorded: session=${session.id} tier=${tier}`);
        }
        break;
      }
      case "checkout.session.expired": {
        const session = event.data.object as import("stripe").Stripe.Checkout.Session;
        trackEvent("checkout_failed", {
          stripeSessionId: session.id,
          sessionId: session.metadata?.sessionId || undefined,
        });
        console.log(`[stripe-webhook] Checkout expired: session=${session.id}`);
        break;
      }
      default:
        // Log unhandled event types for future triage
        console.log(`[stripe-webhook] Unhandled event type: ${event.type}`);
    }

    const paymentIntentId = (event.data.object as unknown as Record<string, unknown>)?.payment_intent ?? null;
    await writeAuditEvent(req, "payment", "success", {
      route: req.originalUrl,
      method: req.method,
      statusCode: 200,
      provider: "stripe",
      stripeEventType: event.type,
      paymentIntentId,
    });

    res.json({ received: true });
  });
}
