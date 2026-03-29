import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
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
  await registerRoutes(server, app);
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

  it("does not echo banned data-limitation phrases in user-facing fields under thin market context", async () => {
    const thinContextResponse = {
      ...VALID_LLM_RESPONSE,
      summary: "The deal looks reasonable based on the terms provided.",
      verdictLabel: "PROCEED — VERIFY DETAILS",
      reasoning: "OTD price and APR are stated. No major red flags.",
    };
    mockOpenAiSuccess(thinContextResponse);
    const res = await request(app)
      .post("/api/analyze")
      .send({ dealerText: "OTD $35,000, APR 4.9%, 60 months. CA dealer." });
    expect(res.status).toBe(200);
    const BANNED = [/limited local data/i, /early signal/i, /limited — treat/i, /treat as early signal/i];
    for (const field of ["summary", "verdictLabel", "reasoning"] as const) {
      const value: string = res.body[field] ?? "";
      for (const pattern of BANNED) {
        expect(value, `banned phrase "${pattern}" found in ${field}`).not.toMatch(pattern);
      }
    }
    if (res.body.marketContextSummary) {
      const mcs: string = res.body.marketContextSummary;
      for (const pattern of BANNED) {
        expect(mcs, `banned phrase "${pattern}" found in marketContextSummary`).not.toMatch(pattern);
      }
    }
  });
});

describe("POST /api/analyze — thin market context prompt text", () => {
  it("system prompt sent to LLM contains no banned phrases regardless of market context state", async () => {
    mockOpenAiSuccess();
    const res = await request(app)
      .post("/api/analyze")
      .send({ dealerText: "OTD $35,000, APR 4.9%, 60 months. CA dealer." });
    expect(res.status).toBe(200);

    const createMock = openai.chat.completions.create as ReturnType<typeof vi.fn>;
    const callArgs = createMock.mock.calls.at(-1)?.[0] as { messages: Array<{ role: string; content: string }> } | undefined;
    const systemMsg = callArgs?.messages.find((m) => m.role === "system")?.content ?? "";

    expect(systemMsg.length).toBeGreaterThan(0);

    const PROMPT_BANNED = [
      /data is limited — treat as early signal/i,
      /treat as early signal only/i,
      /Note: data is limited/i,
      /Early local signal suggests \(limited data\)/i,
    ];
    for (const pattern of PROMPT_BANNED) {
      expect(systemMsg, `banned phrase "${pattern}" in system prompt`).not.toMatch(pattern);
    }
  });
});
