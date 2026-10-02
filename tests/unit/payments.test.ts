import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ─── Mocks ───────────────────────────────────────────────────────────────────

const mockConstructEvent = vi.fn();
const mockSessionsCreate = vi.fn();
const mockSessionsRetrieve = vi.fn();

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
import { createServer } from "http";
import request from "supertest";
import { registerPaymentRoutes } from "../../server/routes/payments.js";
import { trackEvent } from "../../server/events.js";
import { writeAuditEvent } from "../../server/audit.js";

const mockTrackEvent = trackEvent as ReturnType<typeof vi.fn>;
const mockWriteAuditEvent = writeAuditEvent as ReturnType<typeof vi.fn>;

let app: express.Express;

function buildApp() {
  const a = express();
  // Add rawBody support to mimic production setup
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
});

// ─── POST /api/stripe-webhook ────────────────────────────────────────────────

describe("POST /api/stripe-webhook", () => {
  const WEBHOOK_URL = "/api/stripe-webhook";

  it("returns 400 when stripe-signature header is missing", async () => {
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";

    const res = await request(app).post(WEBHOOK_URL).send({ data: "test" });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/missing/i);
  });

  it("returns 400 when signature verification fails", async () => {
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
    mockConstructEvent.mockImplementation(() => {
      throw new Error("Invalid signature");
    });

    const res = await request(app)
      .post(WEBHOOK_URL)
      .set("stripe-signature", "bad_sig")
      .send({ data: "test" });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/verification failed/i);
    expect(mockWriteAuditEvent).toHaveBeenCalledWith(
      expect.anything(),
      "payment",
      "failure",
      expect.objectContaining({ statusCode: 400 }),
    );
  });

  it("processes checkout.session.completed with valid signature", async () => {
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
    mockConstructEvent.mockReturnValue({
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_test_123",
          payment_status: "paid",
          metadata: { tier: "49", sessionId: "sess-abc" },
        },
      },
    });

    const res = await request(app)
      .post(WEBHOOK_URL)
      .set("stripe-signature", "valid_sig")
      .send({ data: "test" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ received: true });
    expect(mockTrackEvent).toHaveBeenCalledWith(
      "payment_completed",
      expect.objectContaining({ tier: "49", stripeSessionId: "cs_test_123" }),
    );
    expect(mockWriteAuditEvent).toHaveBeenCalledWith(
      expect.anything(),
      "payment",
      "success",
      expect.objectContaining({ stripeEventType: "checkout.session.completed" }),
    );
  });

  it("returns 500 when STRIPE_WEBHOOK_SECRET is not set", async () => {
    delete process.env.STRIPE_WEBHOOK_SECRET;

    const res = await request(app)
      .post(WEBHOOK_URL)
      .set("stripe-signature", "sig_test")
      .send({ data: "test" });

    expect(res.status).toBe(500);
  });
});

// ─── POST /api/checkout ──────────────────────────────────────────────────────

describe("Free access checkout protection", () => {
  it.each(["/api/checkout", "/api/create-checkout-session"])("rejects new payments at %s even when Stripe is configured", async (url) => {
    process.env.STRIPE_SECRET_KEY = "sk_test_configured";
    const res = await request(app).post(url).send({ product: "car_buyers_pass", analysisId: "123", tier: "49" });
    expect(res.status).toBe(410);
    expect(res.body.error).toBe("PAYMENTS_DISABLED");
    expect(mockSessionsCreate).not.toHaveBeenCalled();
  });

  it("advertises free access without enabling checkout", async () => {
    const res = await request(app).get("/api/stripe-status");
    expect(res.body).toEqual({ configured: false, freeAccess: true });
  });
});

describe("GET /api/verify-session", () => {
  it("returns paid + tier + passProduct for a paid legacy $79 session", async () => {
    mockSessionsRetrieve.mockResolvedValue({
      payment_status: "paid",
      metadata: { tier: "79", sessionId: "sess-1" },
      line_items: { data: [] },
    });

    const res = await request(app)
      .get("/api/verify-session")
      .query({ session_id: "cs_test_456" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      paid: true,
      tier: "79",
      passProduct: null,
      durationHours: null,
    });
  });

  it("returns car_buyers_pass passProduct + 336h for a $49 session", async () => {
    mockSessionsRetrieve.mockResolvedValue({
      payment_status: "paid",
      metadata: { passProduct: "car_buyers_pass", durationHours: "336", sessionId: "sess-2" },
      line_items: { data: [] },
    });

    const res = await request(app)
      .get("/api/verify-session")
      .query({ session_id: "cs_test_car" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      paid: true,
      tier: "49",
      passProduct: "car_buyers_pass",
      durationHours: 14 * 24,
    });
  });

  it("returns weekend_warrior passProduct + 72h for a $29 session", async () => {
    mockSessionsRetrieve.mockResolvedValue({
      payment_status: "paid",
      metadata: { passProduct: "weekend_warrior", durationHours: "72", sessionId: "sess-3" },
      line_items: { data: [] },
    });

    const res = await request(app)
      .get("/api/verify-session")
      .query({ session_id: "cs_test_weekend" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      paid: true,
      tier: "29",
      passProduct: "weekend_warrior",
      durationHours: 72,
    });
  });

  it("falls back to amount-based inference when metadata is absent", async () => {
    mockSessionsRetrieve.mockResolvedValue({
      payment_status: "paid",
      metadata: {},
      line_items: { data: [{ price: { unit_amount: 2900 } }] },
    });

    const res = await request(app)
      .get("/api/verify-session")
      .query({ session_id: "cs_test_legacy" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      paid: true,
      tier: "29",
      passProduct: "weekend_warrior",
      durationHours: 72,
    });
  });

  it("returns { paid: false } for an unpaid session", async () => {
    mockSessionsRetrieve.mockResolvedValue({
      payment_status: "unpaid",
      metadata: {},
      line_items: { data: [] },
    });

    const res = await request(app)
      .get("/api/verify-session")
      .query({ session_id: "cs_test_789" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      paid: false,
      tier: null,
      passProduct: null,
      durationHours: null,
    });
  });

  it("returns { paid: false } when session_id is missing", async () => {
    const res = await request(app).get("/api/verify-session");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      paid: false,
      tier: null,
      passProduct: null,
      durationHours: null,
    });
  });
});

afterEach(() => {
  delete process.env.STRIPE_WEBHOOK_SECRET;
  delete process.env.STRIPE_SECRET_KEY;
  delete process.env.STRIPE_PRICE_ID_29;
  delete process.env.STRIPE_PRICE_ID_49;
  delete process.env.STRIPE_PRICE_ID_79;
});
