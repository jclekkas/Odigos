import { describe, it, expect, vi, beforeAll, afterAll, beforeEach } from "vitest";
import express from "express";
import { createServer } from "http";
import request from "supertest";

const { mockIsOpenAIConfigured, MockOpenAIConfigurationError } = vi.hoisted(() => {
  class MockOpenAIConfigurationError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "OpenAIConfigurationError";
    }
  }
  return {
    mockIsOpenAIConfigured: vi.fn(() => true),
    MockOpenAIConfigurationError,
  };
});

// Minimal mirror of the real parseOpenAIError helper. Keeps the test mock
// synchronous (vi.mock factories cannot be async without importOriginal).
function mockParseOpenAIError(err: unknown) {
  const e = (err ?? {}) as Record<string, unknown>;
  const inner = (e.error ?? {}) as Record<string, unknown>;
  const headers = (e.headers ?? {}) as Record<string, unknown>;
  return {
    status: typeof e.status === "number" ? (e.status as number) : undefined,
    code:
      (typeof e.code === "string" && e.code) ||
      (typeof inner.code === "string" && inner.code) ||
      undefined,
    type:
      (typeof e.type === "string" && e.type) ||
      (typeof inner.type === "string" && inner.type) ||
      undefined,
    param: undefined,
    requestId:
      (typeof e.request_id === "string" && (e.request_id as string)) ||
      (typeof headers["x-request-id"] === "string" && (headers["x-request-id"] as string)) ||
      undefined,
    retryAfter:
      (typeof headers["retry-after"] === "string" && (headers["retry-after"] as string)) ||
      undefined,
    message: err instanceof Error ? err.message : String(err),
  };
}

vi.mock("../../server/openaiClient", () => ({
  openai: {
    chat: {
      completions: {
        create: vi.fn(),
      },
    },
  },
  isOpenAIConfigured: mockIsOpenAIConfigured,
  OpenAIConfigurationError: MockOpenAIConfigurationError,
  parseOpenAIError: mockParseOpenAIError,
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

vi.mock("../../server/extractText", () => {
  class IrrelevantContentError extends Error {
    constructor(
      public readonly rejectionReason: string,
      public readonly documentType: string,
    ) {
      super(rejectionReason);
      this.name = "IrrelevantContentError";
    }
  }
  return {
    extractTextFromFile: vi.fn(),
    IrrelevantContentError,
  };
});

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

import { extractTextFromFile, IrrelevantContentError } from "../../server/extractText";
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

  it("does NOT invoke extractTextFromFile when no file is uploaded", async () => {
    vi.mocked(extractTextFromFile).mockClear();
    await request(app)
      .post("/api/extract-text")
      .set("Content-Type", "multipart/form-data");
    expect(extractTextFromFile).not.toHaveBeenCalled();
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

  it("returns 500 with debugCode when extractTextFromFile throws an unclassified error", async () => {
    vi.mocked(extractTextFromFile).mockRejectedValueOnce(
      Object.assign(new Error("OCR failed"), { request_id: "req_unknown_ext" })
    );
    const res = await request(app)
      .post("/api/extract-text")
      .attach("file", Buffer.from("fake-png"), {
        filename: "image.png",
        contentType: "image/png",
      });
    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Text extraction failed");
    expect(res.body.requestId).toBe("req_unknown_ext");
    expect(res.body.debugCode).toBeDefined();
  });

  it("returns 422 SHORT_TEXT_MSG when the PDF parser throws 'Could not parse PDF file'", async () => {
    vi.mocked(extractTextFromFile).mockRejectedValueOnce(
      new Error("Could not parse PDF file")
    );
    const res = await request(app)
      .post("/api/extract-text")
      .attach("file", Buffer.from("%PDF-fake"), {
        filename: "broken.pdf",
        contentType: "application/pdf",
      });
    expect(res.status).toBe(422);
    expect(res.body.message).toMatch(/couldn't read/i);
  });

  it("returns 422 SHORT_TEXT_MSG when the PDF parser throws 'insufficient extractable text'", async () => {
    vi.mocked(extractTextFromFile).mockRejectedValueOnce(
      new Error("PDF contained insufficient extractable text")
    );
    const res = await request(app)
      .post("/api/extract-text")
      .attach("file", Buffer.from("%PDF-fake"), {
        filename: "scan.pdf",
        contentType: "application/pdf",
      });
    expect(res.status).toBe(422);
    expect(res.body.message).toMatch(/couldn't read/i);
  });

  it("returns 422 with content_not_relevant when image is not a dealer document", async () => {
    vi.mocked(extractTextFromFile).mockRejectedValueOnce(
      new IrrelevantContentError(
        "This appears to be a photo of a pet, not a dealer document.",
        "photo_not_document",
      )
    );
    const res = await request(app)
      .post("/api/extract-text")
      .attach("file", Buffer.from("fake-cat-photo"), {
        filename: "cat.jpg",
        contentType: "image/jpeg",
      });
    expect(res.status).toBe(422);
    expect(res.body.error).toBe("content_not_relevant");
    expect(res.body.message).toMatch(/pet/i);
    expect(res.body.documentType).toBe("photo_not_document");
  });

  // ─── Error classifier regression guards ─────────────────────────────────
  // These guard against the "every failure masquerades as 'couldn't read
  // enough text'" bug. Before the classifier existed, a missing API key, an
  // auth failure, and a rate limit all returned the same misleading 422
  // message that blamed the user's photo instead of the real root cause.

  it("returns 503 'AI service not configured' when the API key is missing (preflight)", async () => {
    mockIsOpenAIConfigured.mockReturnValueOnce(false);
    const res = await request(app)
      .post("/api/extract-text")
      .attach("file", Buffer.from("fake-png"), {
        filename: "image.png",
        contentType: "image/png",
      });
    expect(res.status).toBe(503);
    expect(res.body.error).toBe("AI service not configured");
    // Must NOT have called the vision client — pre-flight short-circuits.
    expect(extractTextFromFile).not.toHaveBeenCalled();
  });

  it("returns 502 'AI authentication failed' when OpenAI rejects credentials (401)", async () => {
    const authErr = Object.assign(new Error("Invalid API key"), {
      status: 401,
      code: "invalid_api_key",
      request_id: "req_auth_xx",
    });
    vi.mocked(extractTextFromFile).mockRejectedValueOnce(authErr);
    const res = await request(app)
      .post("/api/extract-text")
      .attach("file", Buffer.from("fake-png"), {
        filename: "image.png",
        contentType: "image/png",
      });
    expect(res.status).toBe(502);
    expect(res.body.error).toBe("AI authentication failed");
    expect(res.body.requestId).toBe("req_auth_xx");
  });

  it("returns 402 'AI quota exhausted' when OpenAI reports insufficient_quota", async () => {
    const quotaErr = Object.assign(new Error("Quota exceeded"), {
      status: 429,
      code: "insufficient_quota",
      request_id: "req_quota_yy",
    });
    vi.mocked(extractTextFromFile).mockRejectedValueOnce(quotaErr);
    const res = await request(app)
      .post("/api/extract-text")
      .attach("file", Buffer.from("fake-png"), {
        filename: "image.png",
        contentType: "image/png",
      });
    expect(res.status).toBe(402);
    expect(res.body.error).toBe("AI quota exhausted");
    expect(res.body.code).toBe("insufficient_quota");
  });

  it("returns 429 with retryAfter when OpenAI plain-rate-limits", async () => {
    const rateErr = Object.assign(new Error("Rate limit reached"), {
      status: 429,
      code: "rate_limit_exceeded",
      headers: { "retry-after": "8" },
      request_id: "req_rate_zz",
    });
    vi.mocked(extractTextFromFile).mockRejectedValueOnce(rateErr);
    const res = await request(app)
      .post("/api/extract-text")
      .attach("file", Buffer.from("fake-png"), {
        filename: "image.png",
        contentType: "image/png",
      });
    expect(res.status).toBe(429);
    expect(res.body.error).toBe("AI rate limit");
    expect(res.body.retryAfter).toBe("8");
  });

  it("returns 502 'AI model unavailable' when OpenAI returns model_not_found", async () => {
    const modelErr = Object.assign(new Error("Model not found"), {
      status: 404,
      code: "model_not_found",
      request_id: "req_mnf",
    });
    vi.mocked(extractTextFromFile).mockRejectedValueOnce(modelErr);
    const res = await request(app)
      .post("/api/extract-text")
      .attach("file", Buffer.from("fake-png"), {
        filename: "image.png",
        contentType: "image/png",
      });
    expect(res.status).toBe(502);
    expect(res.body.error).toBe("AI model unavailable");
    expect(res.body.code).toBe("model_not_found");
  });

  it("returns 502 'AI provider unavailable' on upstream 5xx", async () => {
    const upstreamErr = Object.assign(new Error("Bad gateway"), {
      status: 503,
      code: "server_error",
      request_id: "req_up",
    });
    vi.mocked(extractTextFromFile).mockRejectedValueOnce(upstreamErr);
    const res = await request(app)
      .post("/api/extract-text")
      .attach("file", Buffer.from("fake-png"), {
        filename: "image.png",
        contentType: "image/png",
      });
    expect(res.status).toBe(502);
    expect(res.body.error).toBe("AI provider unavailable");
    expect(res.body.message).toMatch(/upstream 503/);
  });
});

// ─── GET /api/stripe-status ───────────────────────────────────────────────────

describe("GET /api/stripe-status", () => {
  it("returns { configured: false } when Stripe is not set up", async () => {
    const res = await request(app).get("/api/stripe-status");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("configured");
    expect(typeof res.body.configured).toBe("boolean");
    // Our mock in this file returns false from isStripeConfigured — assert value.
    expect(res.body.configured).toBe(false);
  });

  it("returns JSON content-type", async () => {
    const res = await request(app).get("/api/stripe-status");
    expect(res.headers["content-type"]).toMatch(/application\/json/);
  });
});

// Note: /api/health is now registered synchronously in server/index.ts (not
// via registerRoutes) so that it remains available when initialize() fails.
// Its integration is covered by scripts/smoke-test.ts against a running server.
