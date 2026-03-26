/**
 * Integration test for POST /api/analyze — REAL OpenAI call.
 *
 * These tests are opt-in. They will be SKIPPED unless E2E=true is set,
 * so normal `npx vitest run` (and `test:api`) are never affected.
 *
 * Run manually:
 *   E2E=true npx vitest run tests/api/analyze.integration.test.ts
 *
 * Or via the `test:integration` workflow in the Replit UI.
 *
 * Why this exists:
 *   Every other test that touches /api/analyze mocks the OpenAI client.
 *   This file is the only test that exercises the real GPT-4o call path,
 *   validating that the prompt, json_object response_format, and
 *   analysisResponseSchema all stay in sync with one another.
 */

import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import express from "express";
import { createServer } from "http";
import request from "supertest";

const RUN_E2E = Boolean(process.env.E2E);

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
    returning: vi.fn().mockResolvedValue([{ id: "integration-test-id" }]),
    onConflictDoNothing: vi.fn().mockResolvedValue([]),
    limit: vi.fn().mockResolvedValue([]),
  },
}));

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

const CLEAR_QUOTE =
  "2024 Toyota Camry LE. " +
  "OTD price confirmed in writing at $29,500. " +
  "APR 3.9% for 60 months. $2,000 down payment. " +
  "Doc fee $199. No add-ons. Texas dealer.";

describe.skipIf(!RUN_E2E)(
  "POST /api/analyze — real OpenAI call (E2E=true required)",
  () => {
    it(
      "returns HTTP 200 with a fully structured analysis response",
      async () => {
        const res = await request(app)
          .post("/api/analyze")
          .send({
            dealerText: CLEAR_QUOTE,
            condition: "new",
            purchaseType: "finance",
          })
          .timeout(60_000);

        expect(res.status).toBe(200);

        const body = res.body as Record<string, unknown>;

        expect(["GREEN", "YELLOW", "RED"]).toContain(body.dealScore);
        expect(["GO", "NO-GO", "NEED-MORE-INFO"]).toContain(body.goNoGo);
        expect(["HIGH", "MEDIUM", "LOW"]).toContain(body.confidenceLevel);

        expect(typeof body.summary).toBe("string");
        expect((body.summary as string).length).toBeGreaterThan(20);

        expect(typeof body.reasoning).toBe("string");
        expect((body.reasoning as string).length).toBeGreaterThan(20);

        expect(typeof body.suggestedReply).toBe("string");
        expect((body.suggestedReply as string).length).toBeGreaterThan(0);

        expect(body.detectedFields).toBeTruthy();
        expect(typeof body.detectedFields).toBe("object");

        expect(Array.isArray(body.missingInfo)).toBe(true);

        expect(typeof body.verdictLabel).toBe("string");
        expect((body.verdictLabel as string).length).toBeGreaterThan(0);
      },
      60_000,
    );
  },
);
