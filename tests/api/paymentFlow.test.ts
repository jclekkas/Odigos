/**
 * End-to-end payment round-trip tests.
 *
 * Unlike the isolated tests in tests/unit/payments.test.ts, these exercise
 * the full checkout → verify-session → webhook pipeline in a single act,
 * catching metadata-key drift between the three code paths.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mockSessionsCreate = vi.fn();
const mockSessionsRetrieve = vi.fn();
const mockConstructEvent = vi.fn();

vi.mock("../../server/stripeClient", () => ({
  isStripeConfigured: vi.fn().mockResolvedValue(true),
  getStripeClient: vi.fn().mockResolvedValue({
    checkout: {
      sessions: {
        create: (...args: unknown[]) => mockSessionsCreate(...args),
        retrieve: (...args: unknown[]) => mockSessionsRetrieve(...args),
      },
    },
    webhooks: {
      constructEvent: (...args: unknown[]) => mockConstructEvent(...args),
    },
  }),
}));

vi.mock("../../server/events", () => ({
  trackEvent: vi.fn(),
}));

vi.mock("../../server/audit", () => ({
  writeAuditEvent: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@sentry/node", () => ({
  withScope: vi.fn(),
  captureException: vi.fn(),
}));

vi.mock("../../server/db", () => ({
  db: {},
}));

import express from "express";
import request from "supertest";
import {
  registerPaymentRoutes,
  __resetWebhookIdempotencyForTests,
} from "../../server/routes/payments";
import { trackEvent } from "../../server/events";
import { writeAuditEvent } from "../../server/audit";

const mockTrackEvent = trackEvent as ReturnType<typeof vi.fn>;
const mockWriteAuditEvent = writeAuditEvent as ReturnType<typeof vi.fn>;

let app: express.Express;

function buildApp() {
  const a = express();
  a.use(
    express.json({
      verify: (req: express.Request & { rawBody?: Buffer }, _res, buf) => {
        req.rawBody = buf;
      },
    }),
  );
  registerPaymentRoutes(a);
  return a;
}

beforeEach(() => {
  app = buildApp();
  vi.clearAllMocks();
  __resetWebhookIdempotencyForTests();
  process.env.STRIPE_SECRET_KEY = "sk_test_xxx";
  process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
  process.env.STRIPE_PRICE_ID_29 = "price_test_29";
  process.env.STRIPE_PRICE_ID_49 = "price_test_49";
});

afterEach(() => {
  delete process.env.STRIPE_SECRET_KEY;
  delete process.env.STRIPE_WEBHOOK_SECRET;
  delete process.env.STRIPE_PRICE_ID_29;
  delete process.env.STRIPE_PRICE_ID_49;
});

// ─── Full round-trip: checkout → verify-session ─────────────────────────────

describe("checkout → verify-session round-trip", () => {
  it("weekend_warrior ($29): metadata flows through checkout into verify", async () => {
    let capturedMetadata: Record<string, string> = {};
    mockSessionsCreate.mockImplementation((args: { metadata: Record<string, string> }) => {
      capturedMetadata = args.metadata;
      return { id: "cs_test_ww", client_secret: "cs_secret_ww" };
    });

    // Step 1: checkout
    const checkoutRes = await request(app)
      .post("/api/checkout")
      .send({ product: "weekend_warrior", sessionId: "sess-ww" });

    expect(checkoutRes.status).toBe(200);
    expect(capturedMetadata.passProduct).toBe("weekend_warrior");
    expect(capturedMetadata.durationHours).toBe("72");

    // Step 2: prime retrieve with the SAME metadata that checkout produced
    mockSessionsRetrieve.mockResolvedValue({
      payment_status: "paid",
      metadata: capturedMetadata,
      line_items: { data: [] },
    });

    // Step 3: verify-session
    const verifyRes = await request(app)
      .get("/api/verify-session")
      .query({ session_id: "cs_test_ww" });

    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body).toEqual({
      paid: true,
      tier: "29",
      passProduct: "weekend_warrior",
      durationHours: 72,
    });

    // Analytics fired in sequence
    expect(mockTrackEvent).toHaveBeenCalledWith(
      "checkout_started",
      expect.objectContaining({ selected_pass: "weekend_warrior" }),
    );
    expect(mockTrackEvent).toHaveBeenCalledWith(
      "payment_completed",
      expect.objectContaining({ tier: "29", selected_pass: "weekend_warrior" }),
    );
  });

  it("car_buyers_pass ($49): metadata flows through checkout into verify", async () => {
    let capturedMetadata: Record<string, string> = {};
    mockSessionsCreate.mockImplementation((args: { metadata: Record<string, string> }) => {
      capturedMetadata = args.metadata;
      return { id: "cs_test_cbp", client_secret: "cs_secret_cbp" };
    });

    const checkoutRes = await request(app)
      .post("/api/checkout")
      .send({ product: "car_buyers_pass", sessionId: "sess-cbp" });

    expect(checkoutRes.status).toBe(200);
    expect(capturedMetadata.passProduct).toBe("car_buyers_pass");
    expect(capturedMetadata.durationHours).toBe("336");

    mockSessionsRetrieve.mockResolvedValue({
      payment_status: "paid",
      metadata: capturedMetadata,
      line_items: { data: [] },
    });

    const verifyRes = await request(app)
      .get("/api/verify-session")
      .query({ session_id: "cs_test_cbp" });

    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body).toEqual({
      paid: true,
      tier: "49",
      passProduct: "car_buyers_pass",
      durationHours: 336,
    });
  });
});

// ─── Webhook ↔ verify-session consistency ────────────────────────────────────

describe("webhook → verify-session metadata consistency", () => {
  it("webhook and verify-session agree on tier and passProduct", async () => {
    const sharedMetadata = {
      passProduct: "weekend_warrior",
      durationHours: "72",
      tier: "29",
      sessionId: "sess-consist",
    };

    // Step 1: webhook delivery
    mockConstructEvent.mockReturnValue({
      id: "evt_consist_1",
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_test_consist",
          payment_status: "paid",
          metadata: sharedMetadata,
        },
      },
    });

    const webhookRes = await request(app)
      .post("/api/stripe-webhook")
      .set("stripe-signature", "valid_sig")
      .send({ data: "test" });

    expect(webhookRes.status).toBe(200);

    // Capture what the webhook path concluded about the payment
    const webhookPaymentCall = mockTrackEvent.mock.calls.find(
      ([name]: [string]) => name === "payment_completed",
    );
    expect(webhookPaymentCall).toBeTruthy();
    const webhookTier = webhookPaymentCall![1].tier;
    const webhookPass = webhookPaymentCall![1].selected_pass;

    // Step 2: verify-session with the same session metadata
    mockSessionsRetrieve.mockResolvedValue({
      payment_status: "paid",
      metadata: sharedMetadata,
      line_items: { data: [] },
    });

    const verifyRes = await request(app)
      .get("/api/verify-session")
      .query({ session_id: "cs_test_consist" });

    expect(verifyRes.status).toBe(200);

    // The two paths MUST agree
    expect(verifyRes.body.tier).toBe(webhookTier);
    expect(verifyRes.body.passProduct).toBe(webhookPass);
    expect(verifyRes.body.durationHours).toBe(72);
  });
});
