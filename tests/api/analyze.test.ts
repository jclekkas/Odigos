import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
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
    expect(res.body.message).toMatch(/AI_INTEGRATIONS_OPENAI_API_KEY/);
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
});
