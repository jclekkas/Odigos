import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import express from "express";
import { createServer } from "http";
import request from "supertest";

vi.mock("../../server/openaiClient", () => ({
  openai: { chat: { completions: { create: vi.fn() } } },
}));

vi.mock("../../server/metrics", () => ({
  trackEvent: vi.fn(),
  getMetricsSummary: vi.fn().mockResolvedValue({}),
}));

vi.mock("../../server/ingestor", () => ({
  enqueueSubmission: vi.fn(),
}));

vi.mock("../../server/stripeClient", () => ({
  isStripeConfigured: vi.fn().mockResolvedValue(false),
  getStripeClient: vi.fn(),
}));

vi.mock("../../server/db", () => ({
  db: {
    execute: vi.fn().mockResolvedValue({ rows: [] }),
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockResolvedValue([{ id: "mock-submission-id" }]),
    onConflictDoNothing: vi.fn().mockResolvedValue([]),
  },
}));

import { registerRoutes } from "../../server/routes";

let app: express.Express;
let server: ReturnType<typeof createServer>;

beforeAll(async () => {
  app = express();
  app.use(express.json());
  server = createServer(app);
  await registerRoutes(app);
});

afterAll(() => {
  server.close();
});

describe("GET /api/state-fee/:state", () => {
  it("returns fee data for California (CA)", async () => {
    const res = await request(app).get("/api/state-fee/CA");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("docFeeCap", true);
    expect(res.body.docFeeCapAmount).toBe(85);
  });

  it("returns fee data for Texas (TX) with doc fee cap", async () => {
    const res = await request(app).get("/api/state-fee/TX");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("docFeeCap", true);
    expect(res.body.docFeeCapAmount).toBe(225);
  });

  it("returns fee data for Alabama (AL) — no doc fee cap", async () => {
    const res = await request(app).get("/api/state-fee/AL");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("docFeeCap", false);
  });

  it("is case-insensitive — accepts lowercase 'ca'", async () => {
    const res = await request(app).get("/api/state-fee/ca");
    expect(res.status).toBe(200);
    expect(res.body.docFeeCapAmount).toBe(85);
  });

  it("returns 404 for unknown state abbreviation", async () => {
    const res = await request(app).get("/api/state-fee/ZZ");
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error");
  });

  it("returns a numeric state sales tax rate", async () => {
    const res = await request(app).get("/api/state-fee/FL");
    expect(res.status).toBe(200);
    expect(typeof res.body.stateSalesTaxRate).toBe("number");
  });
});
