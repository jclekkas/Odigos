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

import { registerRoutes } from "../../server/routes.js";

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

// ─── robots.txt runtime checks ────────────────────────────────────────────────

describe("GET /robots.txt", () => {
  it("responds with 200 and text/plain content-type", async () => {
    const res = await request(app).get("/robots.txt");
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/text\/plain/);
  });

  it("does not contain odigos.replit.app", async () => {
    const res = await request(app).get("/robots.txt");
    expect(res.text).not.toContain("odigos.replit.app");
  });

  it("contains sitemap reference to odigosauto.com", async () => {
    const res = await request(app).get("/robots.txt");
    expect(res.text).toContain("odigosauto.com/sitemap.xml");
  });

  it("allows all user agents", async () => {
    const res = await request(app).get("/robots.txt");
    expect(res.text).toContain("User-agent: *");
    expect(res.text).toContain("Allow: /");
  });
});

// ─── sitemap.xml runtime checks ───────────────────────────────────────────────

describe("GET /sitemap.xml", () => {
  it("responds with 200 and application/xml content-type", async () => {
    const res = await request(app).get("/sitemap.xml");
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/xml/);
  });

  it("does not contain odigos.replit.app", async () => {
    const res = await request(app).get("/sitemap.xml");
    expect(res.text).not.toContain("odigos.replit.app");
  });

  it("contains /calculate-out-the-door-price", async () => {
    const res = await request(app).get("/sitemap.xml");
    expect(res.text).toContain("odigosauto.com/calculate-out-the-door-price");
  });

  it("contains /why-dealers-wont-give-out-the-door-price", async () => {
    const res = await request(app).get("/sitemap.xml");
    expect(res.text).toContain("odigosauto.com/why-dealers-wont-give-out-the-door-price");
  });

  it("does not contain /admin routes", async () => {
    const res = await request(app).get("/sitemap.xml");
    expect(res.text).not.toContain("/admin/");
  });

  it("does not contain /guides redirect route", async () => {
    const res = await request(app).get("/sitemap.xml");
    const lines = res.text.split("\n").filter((l) => l.includes("/guides"));
    expect(lines.length).toBe(0);
  });
});
