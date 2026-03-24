import { describe, it, expect, vi, beforeAll, afterAll, beforeEach } from "vitest";
import express from "express";
import { createServer } from "http";
import request from "supertest";

vi.mock("../../server/openaiClient", () => ({
  openai: {
    chat: {
      completions: {
        create: vi.fn(),
      },
    },
  },
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

vi.mock("../../server/extractText", () => ({
  extractTextFromFile: vi.fn(),
}));

vi.mock("../../server/db", () => ({
  db: {
    execute: vi.fn().mockResolvedValue({ rows: [] }),
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    onConflictDoNothing: vi.fn().mockResolvedValue([]),
  },
}));

import { extractTextFromFile } from "../../server/extractText";
import { registerRoutes } from "../../server/routes";

let app: express.Express;
let server: ReturnType<typeof createServer>;

beforeAll(async () => {
  app = express();
  app.use(express.json());
  server = createServer(app);
  await registerRoutes(server, app);
});

afterAll(() => {
  server.close();
});

beforeEach(() => {
  vi.mocked(extractTextFromFile).mockReset();
});

// ─── POST /api/extract-text ───────────────────────────────────────────────────

describe("POST /api/extract-text", () => {
  it("returns 400 when no file is uploaded", async () => {
    const res = await request(app)
      .post("/api/extract-text")
      .set("Content-Type", "multipart/form-data");
    expect(res.status).toBe(400);
  });

  it("returns 400 for unsupported file type (text/plain)", async () => {
    const res = await request(app)
      .post("/api/extract-text")
      .attach("file", Buffer.from("hello world"), {
        filename: "test.txt",
        contentType: "text/plain",
      });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/supported/i);
  });

  it("returns extracted text for a valid image (image/jpeg)", async () => {
    vi.mocked(extractTextFromFile).mockResolvedValueOnce(
      "OTD price $35,000. APR 4.9%. 60 months financing."
    );
    const res = await request(app)
      .post("/api/extract-text")
      .attach("file", Buffer.from("fake-jpeg-data"), {
        filename: "quote.jpg",
        contentType: "image/jpeg",
      });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("text");
    expect(res.body.text).toContain("OTD price");
  });

  it("returns extracted text for a valid PDF (application/pdf)", async () => {
    vi.mocked(extractTextFromFile).mockResolvedValueOnce(
      "Sale price $28,000. Documentation fee $199."
    );
    const res = await request(app)
      .post("/api/extract-text")
      .attach("file", Buffer.from("%PDF-fake"), {
        filename: "dealer.pdf",
        contentType: "application/pdf",
      });
    expect(res.status).toBe(200);
    expect(typeof res.body.text).toBe("string");
  });

  it("returns 422 when extracted text is too short (< 20 chars)", async () => {
    vi.mocked(extractTextFromFile).mockResolvedValueOnce("hi");
    const res = await request(app)
      .post("/api/extract-text")
      .attach("file", Buffer.from("fake-jpeg"), {
        filename: "blurry.jpg",
        contentType: "image/jpeg",
      });
    expect(res.status).toBe(422);
    expect(res.body.message).toMatch(/couldn't read/i);
  });

  it("returns 422 when extractTextFromFile throws", async () => {
    vi.mocked(extractTextFromFile).mockRejectedValueOnce(
      new Error("OCR failed")
    );
    const res = await request(app)
      .post("/api/extract-text")
      .attach("file", Buffer.from("fake-png"), {
        filename: "image.png",
        contentType: "image/png",
      });
    expect(res.status).toBe(422);
  });
});

// ─── GET /api/stripe-status ───────────────────────────────────────────────────

describe("GET /api/stripe-status", () => {
  it("returns { configured: false } when Stripe is not set up", async () => {
    const res = await request(app).get("/api/stripe-status");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("configured");
    expect(typeof res.body.configured).toBe("boolean");
  });
});

// ─── GET /api/health ──────────────────────────────────────────────────────────

describe("GET /api/health", () => {
  it("returns 200 with ok status", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
  });
});
