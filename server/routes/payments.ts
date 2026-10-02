import * as Sentry from "@sentry/node";
import type { Express } from "express";
import { getStripeClient, isStripeConfigured } from "../stripeClient.js";
import { trackEvent } from "../events.js";
import { writeAuditEvent } from "../audit.js";

export function registerPaymentRoutes(app: Express): void {
  app.get("/api/stripe-status", (_req, res) => {
    res.json({ configured: false, freeAccess: true });
  });

  // Reject stale clients and direct checkout requests without creating a charge.
  // Keep verification and webhooks below for payments already in flight.
  app.post(["/api/checkout", "/api/create-checkout-session"], (_req, res) => {
    res.status(410).json({
      error: "PAYMENTS_DISABLED",
      message: "Odigos is free. No pass or payment is required.",
    });
  });

  app.get("/api/verify-session", async (req, res) => {
    try {
      const { session_id } = req.query;
      if (!session_id || typeof session_id !== "string") {
        return res.json({ paid: false, tier: null, passProduct: null, durationHours: null });
      }

      const configured = await isStripeConfigured();
      if (!configured) {
        return res.json({ paid: false, tier: null, passProduct: null, durationHours: null });
      }

      const stripe = await getStripeClient();
      const session = await stripe.checkout.sessions.retrieve(session_id, { expand: ["line_items.data.price"] });

      if (session.payment_status !== "paid") {
        return res.json({ paid: false, tier: null, passProduct: null, durationHours: null });
      }

      // Prefer metadata; fall back to amount-based inference for sessions
      // created before this deploy.
      let tier: "29" | "49" | "79" = "79";
      let passProduct: "weekend_warrior" | "car_buyers_pass" | null = null;
      let durationHours: number | null = null;

      const metadataPassProduct = session.metadata?.passProduct;
      if (metadataPassProduct === "weekend_warrior" || metadataPassProduct === "car_buyers_pass") {
        passProduct = metadataPassProduct;
        durationHours = passProduct === "weekend_warrior" ? 72 : 14 * 24;
        tier = passProduct === "weekend_warrior" ? "29" : "49";
      } else if (session.metadata?.tier) {
        const t = session.metadata.tier;
        tier = t === "29" ? "29" : t === "49" ? "49" : "79";
        if (tier === "29") {
          passProduct = "weekend_warrior";
          durationHours = 72;
        } else if (tier === "49") {
          passProduct = "car_buyers_pass";
          durationHours = 14 * 24;
        }
      } else {
        const lineItems = session.line_items?.data || [];
        const priceAmount = (lineItems[0]?.price as unknown as Record<string, unknown>)?.unit_amount;
        if (priceAmount === 2900) {
          tier = "29";
          passProduct = "weekend_warrior";
          durationHours = 72;
        } else if (priceAmount === 4900) {
          tier = "49";
          passProduct = "car_buyers_pass";
          durationHours = 14 * 24;
        }
      }

      const paymentSessionId = session.metadata?.sessionId || undefined;
      trackEvent("payment_completed", {
        tier,
        sessionId: paymentSessionId,
        stripeSessionId: session_id,
        selected_pass: passProduct ?? undefined,
      });
      res.json({ paid: true, tier, passProduct, durationHours });
    } catch (error) {
      console.error("Session verification error:", error);
      res.json({ paid: false, tier: null, passProduct: null, durationHours: null });
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
          const metaTier = session.metadata?.tier;
          const tier: "29" | "49" | "79" =
            metaTier === "29" ? "29" : metaTier === "79" ? "79" : "49";
          const metadataPassProduct = session.metadata?.passProduct;
          const passProduct: "weekend_warrior" | "car_buyers_pass" | undefined =
            metadataPassProduct === "weekend_warrior" || metadataPassProduct === "car_buyers_pass"
              ? metadataPassProduct
              : tier === "29"
                ? "weekend_warrior"
                : tier === "49"
                  ? "car_buyers_pass"
                  : undefined;
          const paymentSessionId = session.metadata?.sessionId || undefined;
          trackEvent("payment_completed", {
            tier,
            sessionId: paymentSessionId,
            stripeSessionId: session.id,
            selected_pass: passProduct,
          });
          console.log(`[stripe-webhook] Payment recorded: session=${session.id} tier=${tier} pass=${passProduct ?? "n/a"}`);
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
