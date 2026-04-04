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
import { registerPaymentRoutes } from "../../server/routes/payments";
import { trackEvent } from "../../server/events";
import { writeAuditEvent } from "../../server/audit";

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

describe("POST /api/checkout", () => {
  it("returns 400 for an invalid product", async () => {
    const res = await request(app)
      .post("/api/checkout")
      .send({ product: "invalid_product" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("INVALID_PRODUCT");
  });

  it("returns 400 when STRIPE_SECRET_KEY is missing", async () => {
    delete process.env.STRIPE_SECRET_KEY;

    const res = await request(app)
      .post("/api/checkout")
      .send({ product: "deal_clarity" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("PAYMENTS_NOT_CONFIGURED");
  });

  it("returns 400 when price ID env var is missing", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_xxx";
    delete process.env.STRIPE_PRICE_ID_49;

    const res = await request(app)
      .post("/api/checkout")
      .send({ product: "deal_clarity" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("PAYMENTS_NOT_CONFIGURED");
  });
});

// ─── GET /api/verify-session ─────────────────────────────────────────────────

describe("GET /api/verify-session", () => {
  it("returns { paid: true, tier } for a paid session", async () => {
    mockSessionsRetrieve.mockResolvedValue({
      payment_status: "paid",
      metadata: { tier: "79", sessionId: "sess-1" },
      line_items: { data: [] },
    });

    const res = await request(app)
      .get("/api/verify-session")
      .query({ session_id: "cs_test_456" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ paid: true, tier: "79" });
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
    expect(res.body).toEqual({ paid: false, tier: null });
  });

  it("returns { paid: false } when session_id is missing", async () => {
    const res = await request(app).get("/api/verify-session");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ paid: false, tier: null });
  });
});

afterEach(() => {
  delete process.env.STRIPE_WEBHOOK_SECRET;
  delete process.env.STRIPE_SECRET_KEY;
  delete process.env.STRIPE_PRICE_ID_49;
  delete process.env.STRIPE_PRICE_ID_79;
});
