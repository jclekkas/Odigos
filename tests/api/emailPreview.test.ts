import { describe, it, expect, beforeAll, afterAll } from "vitest";
import express from "express";
import { createServer } from "http";
import request from "supertest";

vi.mock("../../server/db.js", () => ({
  db: {
    execute: vi.fn().mockResolvedValue({ rows: [] }),
  },
}));

vi.mock("../../server/metrics.js", () => ({
  trackEvent: vi.fn(),
  getMetricsSummary: vi.fn().mockResolvedValue({}),
  getTechnicalSummary: vi.fn().mockResolvedValue({}),
  getPaymentCountLastNHours: vi.fn().mockResolvedValue(0),
}));

import { registerEmailPreviewRoutes } from "../../server/routes/emailPreview.js";
import { signEmailPayload } from "../../server/emailPreviewToken.js";

const EMAIL_ENV_KEYS = ["EMAIL_TOKEN_SECRET", "SESSION_SECRET", "ALERT_SMTP_URL"] as const;

function withEmailEnv(
  values: Partial<Record<(typeof EMAIL_ENV_KEYS)[number], string | undefined>>,
  run: () => Promise<void>,
): Promise<void> {
  const previous: Record<string, string | undefined> = {};
  for (const key of EMAIL_ENV_KEYS) {
    previous[key] = process.env[key];
  }
  for (const [key, value] of Object.entries(values)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  return run().finally(() => {
    for (const key of EMAIL_ENV_KEYS) {
      if (previous[key] === undefined) delete process.env[key];
      else process.env[key] = previous[key];
    }
  });
}

let app: express.Express;
let server: ReturnType<typeof createServer>;

beforeAll(() => {
  app = express();
  app.use(express.json());
  server = createServer(app);
  registerEmailPreviewRoutes(app);
});

afterAll(() => {
  server.close();
});

describe("POST /api/email-preview SMTP gate", () => {
  it("returns 503 SMTP_NOT_CONFIGURED when ALERT_SMTP_URL is unset and a signing secret is set", async () => {
    await withEmailEnv(
      { EMAIL_TOKEN_SECRET: "test-secret", SESSION_SECRET: undefined, ALERT_SMTP_URL: undefined },
      async () => {
        const res = await request(app).post("/api/email-preview").send({
          email: "reader@example.com",
          emailToken: "not-a-real-token",
        });
        expect(res.status).toBe(503);
        expect(res.body.error).toBe("SMTP_NOT_CONFIGURED");
      },
    );
  });

  it("returns 503 SMTP_NOT_CONFIGURED when ALERT_SMTP_URL is blank or whitespace", async () => {
    await withEmailEnv(
      { EMAIL_TOKEN_SECRET: "", SESSION_SECRET: "session-secret", ALERT_SMTP_URL: " \n " },
      async () => {
        const res = await request(app).post("/api/email-preview").send({
          email: "reader@example.com",
          emailToken: signEmailPayload({
            goNoGo: "GO",
            verdictLabel: "Solid deal",
            confidenceLevel: "high",
          }) ?? "missing",
        });
        expect(res.status).toBe(503);
        expect(res.body.error).toBe("SMTP_NOT_CONFIGURED");
      },
    );
  });

  it("does not report SMTP_NOT_CONFIGURED once ALERT_SMTP_URL is configured", async () => {
    await withEmailEnv(
      {
        EMAIL_TOKEN_SECRET: "test-secret",
        SESSION_SECRET: undefined,
        ALERT_SMTP_URL: "smtp://127.0.0.1:2525",
      },
      async () => {
        const res = await request(app).post("/api/email-preview").send({
          email: "reader@example.com",
          emailToken: "not-a-real-token",
        });
        expect(res.status).not.toBe(503);
        expect(res.body.error).not.toBe("SMTP_NOT_CONFIGURED");
        expect(res.status).toBe(400);
        expect(res.body.error).toBe("INVALID_TOKEN");
      },
    );
  });
});
