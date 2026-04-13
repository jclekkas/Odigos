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

// Minimal stand-in for the real parseOpenAIError helper. Mirrors the field
// extraction logic so tests can assert on requestId / code / retryAfter
// without pulling the real implementation into the mock (which would
// require an async factory via importOriginal).
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
      (typeof e.requestID === "string" && (e.requestID as string)) ||
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
    returning: vi.fn().mockResolvedValue([{ id: "mock-submission-id" }]),
    onConflictDoNothing: vi.fn().mockResolvedValue([]),
  },
}));

import { openai } from "../../server/openaiClient";
import { registerRoutes } from "../../server/routes";
import { aiCircuitBreaker } from "../../server/lib/circuitBreaker";

const VALID_LLM_RESPONSE = {
  dealScore: "GREEN",
  confidenceLevel: "HIGH",
  verdictLabel: "GO — TERMS LOOK CLEAN",
  goNoGo: "GO",
  summary: "The deal looks solid with a clear OTD price and favorable APR.",
  detectedFields: {
    salePrice: 30000,
    msrp: 32000,
    rebates: null,
    fees: [{ name: "Doc Fee", amount: 199 }],
    outTheDoorPrice: 35000,
    monthlyPayment: 499,
    tradeInValue: null,
    apr: 4.9,
    termMonths: 60,
    downPayment: 3000,
  },
  missingInfo: [],
  suggestedReply: "Thank you for this quote. Looking forward to finalizing.",
  reasoning: "OTD price, APR, and term are clearly stated. No red flags.",
};

let app: express.Express;
let server: ReturnType<typeof createServer>;

beforeAll(async () => {
  app = express();
  app.use(express.json());
  server = createServer(app);
  await registerRoutes(app);
});

beforeEach(() => {
  // Reset the process-global AI mock and the AI circuit breaker so that
  // one test's persistent mockRejectedValue or accumulated failures
  // cannot bleed into the next test (which would otherwise trip the
  // breaker → fast-fail → assertion failure).
  (openai.chat.completions.create as ReturnType<typeof vi.fn>).mockReset();
  aiCircuitBreaker.reset();
});

afterAll(() => {
  server.close();
});

function mockOpenAiSuccess(response = VALID_LLM_RESPONSE) {
  (openai.chat.completions.create as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
    choices: [
      {
        message: { content: JSON.stringify(response) },
        finish_reason: "stop",
      },
    ],
    usage: { prompt_tokens: 100, completion_tokens: 300, total_tokens: 400 },
  });
}

// ─── POST /api/analyze ────────────────────────────────────────────────────────

describe("POST /api/analyze", () => {
  it("rejects a request with missing dealerText — 400", async () => {
    const res = await request(app).post("/api/analyze").send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("rejects an empty dealerText string — 400", async () => {
    const res = await request(app)
      .post("/api/analyze")
      .send({ dealerText: "" });
    expect(res.status).toBe(400);
  });

  it("returns 200 and a valid analysis for a clean deal", async () => {
    mockOpenAiSuccess();
    const res = await request(app)
      .post("/api/analyze")
      .send({ dealerText: "OTD $35,000, APR 4.9%, 60 months. CA dealer." });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("dealScore");
    expect(["GREEN", "YELLOW", "RED"]).toContain(res.body.dealScore);
    expect(res.body).toHaveProperty("goNoGo");
    expect(res.body).toHaveProperty("summary");
    expect(res.body).toHaveProperty("detectedFields");
    expect(res.body).toHaveProperty("suggestedReply");
    expect(res.body).toHaveProperty("reasoning");
  });

  it("rule engine overrides LLM: RED when doc fee violates CA cap", async () => {
    const capViolationResponse = {
      ...VALID_LLM_RESPONSE,
      dealScore: "GREEN",
      goNoGo: "GO",
      detectedFields: {
        ...VALID_LLM_RESPONSE.detectedFields,
        fees: [{ name: "Doc Fee", amount: 500 }],
      },
    };
    mockOpenAiSuccess(capViolationResponse);
    const res = await request(app)
      .post("/api/analyze")
      .send({
        dealerText: "OTD $35,000 from our California dealership.",
        zipCode: "90210",
      });
    expect(res.status).toBe(200);
    expect(res.body.dealScore).toBe("RED");
    expect(res.body.goNoGo).toBe("NO-GO");
  });

  it("returns 422 content_not_relevant for garbage text with no dealer keywords", async () => {
    // The content validator will find zero keywords and call the LLM
    // classifier. Mock it to reject the content.
    (openai.chat.completions.create as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      choices: [{
        message: {
          content: JSON.stringify({
            isRelevant: false,
            confidence: "high",
            category: "unrelated_text",
            rejectionReason: "This text doesn't appear to contain any car dealer pricing, fees, or deal terms.",
          }),
        },
      }],
    });
    const res = await request(app)
      .post("/api/analyze")
      .send({ dealerText: "My cat is orange and loves tuna. He sleeps on the couch all day long." });
    expect(res.status).toBe(422);
    expect(res.body.error).toBe("content_not_relevant");
    expect(res.body.message).toMatch(/dealer/i);
  });

  it("returns 502 when OpenAI throws (AI error after retries)", async () => {
    (openai.chat.completions.create as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("OpenAI unavailable")
    );
    const res = await request(app)
      .post("/api/analyze")
      .send({ dealerText: "Some dealer text here." });
    expect(res.status).toBe(502);
    expect(res.body).toHaveProperty("error");
  });

  it("returns 502 when OpenAI returns JSON that fails schema validation", async () => {
    (openai.chat.completions.create as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      choices: [
        {
          message: {
            content: JSON.stringify({
              dealScore: "BLUE",
              confidenceLevel: "SUPER_HIGH",
              verdictLabel: "UNKNOWN",
              goNoGo: "MAYBE",
              summary: "x",
              detectedFields: {},
              missingInfo: [],
              suggestedReply: "x",
              reasoning: "x",
            }),
          },
          finish_reason: "stop",
        },
      ],
      usage: {},
    });
    const res = await request(app)
      .post("/api/analyze")
      .send({ dealerText: "Some dealer text here." });
    expect(res.status).toBe(502);
  });

  it("returns 500 when OpenAI returns unparseable JSON", async () => {
    (openai.chat.completions.create as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      choices: [{ message: { content: "not valid json {{{{" }, finish_reason: "stop" }],
      usage: {},
    });
    const res = await request(app)
      .post("/api/analyze")
      .send({ dealerText: "Some dealer text here." });
    expect(res.status).toBe(500);
  });

  it("always includes suggestedReply in response regardless of tier (gating is client-side)", async () => {
    mockOpenAiSuccess();
    const res = await request(app)
      .post("/api/analyze")
      .send({ dealerText: "Price is $30,000 OTD. APR 3.9% for 72 months." });
    expect(res.status).toBe(200);
    expect(typeof res.body.suggestedReply).toBe("string");
    expect(res.body.suggestedReply.length).toBeGreaterThan(0);
  });

  it("adds missing state question to missingInfo when state is unknown", async () => {
    const noStateResponse = {
      ...VALID_LLM_RESPONSE,
      missingInfo: [],
    };
    mockOpenAiSuccess(noStateResponse);
    const res = await request(app)
      .post("/api/analyze")
      .send({ dealerText: "The price is $30,000 out the door." });
    expect(res.status).toBe(200);
    const hasStateQuestion = res.body.missingInfo.some(
      (item: { field: string }) => item.field === "Dealership state"
    );
    expect(hasStateQuestion).toBe(true);
  });

  it("accepts optional fields (vehicle, condition, purchaseType)", async () => {
    mockOpenAiSuccess();
    const res = await request(app)
      .post("/api/analyze")
      .send({
        dealerText: "OTD $35,000 from Chicago dealer.",
        vehicle: "2024 Toyota Camry",
        condition: "new",
        purchaseType: "finance",
      });
    expect(res.status).toBe(200);
  });

  // ─── Error classification regression guards ───────────────────────────────
  // These guard against the "every failure looks like a generic 502" bug
  // where a missing API key, an auth failure, and a transient outage all
  // returned the same opaque body, making production diagnosis impossible.

  it("returns 503 'AI service not configured' when the API key is missing", async () => {
    mockIsOpenAIConfigured.mockReturnValueOnce(false);
    const res = await request(app)
      .post("/api/analyze")
      .send({ dealerText: "OTD $30,000 from a Texas dealer." });
    expect(res.status).toBe(503);
    expect(res.body.error).toBe("AI service not configured");
    expect(res.body.message).toMatch(/OPENAI_API_KEY/);
    // Must NOT have called the AI — pre-flight short-circuits before the retry loop.
    expect(openai.chat.completions.create).not.toHaveBeenCalled();
  });

  it("returns 502 'AI authentication failed' when OpenAI rejects credentials (401)", async () => {
    const authErr = Object.assign(new Error("Invalid API key provided"), { status: 401 });
    (openai.chat.completions.create as ReturnType<typeof vi.fn>).mockRejectedValue(authErr);
    const res = await request(app)
      .post("/api/analyze")
      .send({ dealerText: "OTD $30,000 from a Texas dealer." });
    expect(res.status).toBe(502);
    expect(res.body.error).toBe("AI authentication failed");
  });

  it("returns 504 'AI service timeout' when the per-attempt timer fires", async () => {
    (openai.chat.completions.create as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("AI attempt 1 timed out after 22000ms")
    );
    const res = await request(app)
      .post("/api/analyze")
      .send({ dealerText: "OTD $30,000 from a Texas dealer." });
    expect(res.status).toBe(504);
    expect(res.body.error).toBe("AI service timeout");
  });

  it("returns 402 'AI quota exhausted' when OpenAI returns insufficient_quota", async () => {
    const quotaErr = Object.assign(new Error("You exceeded your current quota"), {
      status: 429,
      code: "insufficient_quota",
      request_id: "req_quota_123",
    });
    (openai.chat.completions.create as ReturnType<typeof vi.fn>).mockRejectedValue(quotaErr);
    const res = await request(app)
      .post("/api/analyze")
      .send({ dealerText: "OTD $30,000 from a Texas dealer." });
    expect(res.status).toBe(402);
    expect(res.body.error).toBe("AI quota exhausted");
    expect(res.body.code).toBe("insufficient_quota");
    expect(res.body.requestId).toBe("req_quota_123");
  });

  it("returns 429 with retryAfter when OpenAI rate limits (not quota)", async () => {
    const rateLimitErr = Object.assign(new Error("Rate limit reached"), {
      status: 429,
      code: "rate_limit_exceeded",
      headers: { "retry-after": "12" },
      request_id: "req_rl_456",
    });
    (openai.chat.completions.create as ReturnType<typeof vi.fn>).mockRejectedValue(rateLimitErr);
    const res = await request(app)
      .post("/api/analyze")
      .send({ dealerText: "OTD $30,000 from a Texas dealer." });
    expect(res.status).toBe(429);
    expect(res.body.error).toBe("AI rate limit");
    expect(res.body.retryAfter).toBe("12");
    expect(res.body.requestId).toBe("req_rl_456");
  });

  it("retries against the fallback model when primary returns model_not_found", async () => {
    const modelErr = Object.assign(new Error("The model `gpt-4o` does not exist"), {
      status: 404,
      code: "model_not_found",
      request_id: "req_mnf_789",
    });
    const createMock = openai.chat.completions.create as ReturnType<typeof vi.fn>;
    // Primary (gpt-4o) rejects once, then the fallback (gpt-4o-mini) call succeeds.
    createMock.mockRejectedValueOnce(modelErr).mockResolvedValueOnce({
      choices: [
        {
          message: { content: JSON.stringify(VALID_LLM_RESPONSE) },
          finish_reason: "stop",
        },
      ],
      usage: { prompt_tokens: 100, completion_tokens: 300, total_tokens: 400 },
    });
    const res = await request(app)
      .post("/api/analyze")
      .send({ dealerText: "OTD $35,000, APR 4.9%, 60 months. CA dealer." });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("dealScore");
    // Assert the second call was the fallback model.
    expect(createMock).toHaveBeenCalledTimes(2);
    const secondCallArgs = createMock.mock.calls[1][0];
    expect(secondCallArgs.model).toBe("gpt-4o-mini");
  });

  it("returns 502 'AI model unavailable' when both primary and fallback fail", async () => {
    const modelErr = Object.assign(new Error("model_not_found"), {
      status: 404,
      code: "model_not_found",
      request_id: "req_fb_fail",
    });
    (openai.chat.completions.create as ReturnType<typeof vi.fn>).mockRejectedValue(modelErr);
    const res = await request(app)
      .post("/api/analyze")
      .send({ dealerText: "OTD $30,000 from a Texas dealer." });
    expect(res.status).toBe(502);
    expect(res.body.error).toBe("AI model unavailable");
    expect(res.body.message).toMatch(/gpt-4o/);
    expect(res.body.message).toMatch(/gpt-4o-mini/);
    expect(res.body.code).toBe("model_not_found");
  });

  it("returns 502 'AI provider unavailable' when OpenAI responds with 5xx", async () => {
    // 503 is retriable so the retry loop will fire; make ALL attempts return 503
    // so the backoff exhausts and classification kicks in.
    const upstreamErr = Object.assign(new Error("Bad gateway from OpenAI"), {
      status: 503,
      code: "server_error",
      request_id: "req_upstream_001",
    });
    (openai.chat.completions.create as ReturnType<typeof vi.fn>).mockRejectedValue(upstreamErr);
    const res = await request(app)
      .post("/api/analyze")
      .send({ dealerText: "OTD $30,000 from a Texas dealer." });
    expect(res.status).toBe(502);
    expect(res.body.error).toBe("AI provider unavailable");
    expect(res.body.message).toMatch(/upstream 503/);
    expect(res.body.requestId).toBe("req_upstream_001");
  });

  it("includes debugCode and requestId in the generic 502 fallback body", async () => {
    const unknownErr = Object.assign(new Error("Something weird happened"), {
      request_id: "req_unknown_999",
    });
    (openai.chat.completions.create as ReturnType<typeof vi.fn>).mockRejectedValue(unknownErr);
    const res = await request(app)
      .post("/api/analyze")
      .send({ dealerText: "OTD $30,000 from a Texas dealer." });
    expect(res.status).toBe(502);
    expect(res.body.error).toBe("AI service error");
    expect(res.body.requestId).toBe("req_unknown_999");
    expect(res.body.debugCode).toBeDefined();
  });
});
