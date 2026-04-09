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

      // Accepted product keys:
      //   - "weekend_warrior" → 72-hour pass at $29
      //   - "car_buyers_pass" → 14-day pass at $49
      //   - "deal_clarity"    → legacy alias for car_buyers_pass (one deploy cycle)
      //   - "negotiation_pack" → legacy $79 tier (kept on backend for in-flight checkouts)
      if (!product || !["weekend_warrior", "car_buyers_pass", "deal_clarity", "negotiation_pack"].includes(product)) {
        return res.status(400).json({ error: "INVALID_PRODUCT" });
      }

      const secretKey = process.env.STRIPE_SECRET_KEY;
      if (!secretKey) {
        return res.status(400).json({ error: "PAYMENTS_NOT_CONFIGURED" });
      }

      // Normalise legacy alias before pricing
      const normalisedProduct = product === "deal_clarity" ? "car_buyers_pass" : product;

      let priceId: string | undefined;
      let passProduct: "weekend_warrior" | "car_buyers_pass" | null = null;
      let durationHours: number | null = null;

      if (normalisedProduct === "weekend_warrior") {
        priceId = process.env.STRIPE_PRICE_ID_29;
        passProduct = "weekend_warrior";
        durationHours = 72;
        if (!priceId) return res.status(400).json({ error: "PAYMENTS_NOT_CONFIGURED" });
      } else if (normalisedProduct === "car_buyers_pass") {
        priceId = process.env.STRIPE_PRICE_ID_49;
        passProduct = "car_buyers_pass";
        durationHours = 14 * 24;
        if (!priceId) return res.status(400).json({ error: "PAYMENTS_NOT_CONFIGURED" });
      } else {
        // legacy negotiation_pack
        priceId = process.env.STRIPE_PRICE_ID_79;
        if (!priceId) return res.status(400).json({ error: "PAYMENTS_NOT_CONFIGURED" });
      }

      const stripe = await getStripeClient();
      const baseUrl = process.env.REPLIT_DOMAINS
        ? `https://${process.env.REPLIT_DOMAINS.split(",")[0]}`
        : "http://localhost:5000";

      const metadata: Record<string, string> = {
        product: normalisedProduct,
        sessionId: sessionId ?? "",
      };
      if (passProduct) metadata.passProduct = passProduct;
      if (durationHours !== null) metadata.durationHours = String(durationHours);

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        ui_mode: "embedded",
        line_items: [{ price: priceId, quantity: 1 }],
        return_url: `${baseUrl}/analyze?session_id={CHECKOUT_SESSION_ID}&product=${normalisedProduct}`,
        metadata,
      });

      trackEvent("checkout_started", {
        stripeSessionId: session.id,
        sessionId,
        selected_pass: passProduct ?? undefined,
      });
      res.json({ clientSecret: session.client_secret });
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

      // Tier "29" → Weekend Warrior Pass, "49" → Car Buyer's Pass, "79" → legacy
      const selectedTier: "29" | "49" | "79" =
        tier === "29" ? "29" : tier === "49" ? "49" : "79";
      const stripe = await getStripeClient();
      const baseUrl = process.env.REPLIT_DOMAINS
        ? `https://${process.env.REPLIT_DOMAINS.split(",")[0]}`
        : "http://localhost:5000";

      // Price IDs must be pre-configured in Stripe Dashboard — never create at request time
      // (dynamic creation causes race conditions and duplicate products)
      const priceId =
        selectedTier === "29"
          ? process.env.STRIPE_PRICE_ID_29
          : selectedTier === "49"
            ? process.env.STRIPE_PRICE_ID_49
            : (process.env.STRIPE_PRICE_ID_79 || process.env.STRIPE_PRICE_ID);

      if (!priceId) {
        console.error(`[checkout] Missing STRIPE_PRICE_ID_${selectedTier} environment variable`);
        return res.status(503).json({ error: "Payments not configured" });
      }

      let passProduct: "weekend_warrior" | "car_buyers_pass" | null = null;
      let durationHours: number | null = null;
      if (selectedTier === "29") {
        passProduct = "weekend_warrior";
        durationHours = 72;
      } else if (selectedTier === "49") {
        passProduct = "car_buyers_pass";
        durationHours = 14 * 24;
      }

      const metadata: Record<string, string> = {
        tier: selectedTier,
        sessionId: sessionId ?? "",
      };
      if (passProduct) metadata.passProduct = passProduct;
      if (durationHours !== null) metadata.durationHours = String(durationHours);

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        ui_mode: "embedded",
        line_items: [{ price: priceId, quantity: 1 }],
        return_url: `${baseUrl}/analyze?session_id={CHECKOUT_SESSION_ID}&analysisId=${analysisId}`,
        metadata,
      });

      trackEvent("checkout_started", {
        tier: selectedTier,
        stripeSessionId: session.id,
        sessionId,
        selected_pass: passProduct ?? undefined,
      });
      res.json({ clientSecret: session.client_secret });
    } catch (error) {
      console.error("Checkout session error:", error);
      res.status(500).json({ error: "Failed to create checkout session" });
    }
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
