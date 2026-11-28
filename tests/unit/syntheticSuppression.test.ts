import { beforeEach, describe, expect, it, vi } from "vitest";

const { insertAuditLog, execute } = vi.hoisted(() => ({
  insertAuditLog: vi.fn().mockResolvedValue({ id: 1 }),
  execute: vi.fn().mockResolvedValue({ rows: [] }),
}));

vi.mock("../../server/storage.js", () => ({
  insertAuditLog,
}));

vi.mock("../../server/db.js", () => ({
  db: { execute },
}));

import { writeAuditEvent } from "../../server/audit.js";
import { trackEvent } from "../../server/metrics/events.js";
import { recordAnalysisEvent } from "../../server/analysisTelemetry.js";
import {
  enterRequestSeal,
  isSealedSynthetic,
  noteUploadedSynthetic,
  syntheticSentryEvent,
  withLockedSyntheticAnalysis,
} from "../../server/syntheticGuard.js";

const req = {
  headers: { "user-agent": "SyntheticProbe/1.0" },
  ip: "203.0.113.5",
  socket: { remoteAddress: "203.0.113.5" },
} as Pick<import("express").Request, "headers" | "ip" | "socket">;

describe("synthetic QA stays sealed and quiet", () => {
  beforeEach(() => {
    insertAuditLog.mockClear();
    execute.mockClear();
  });

  it("locks the flag at entry so later edits and model text cannot flip it", () => {
    const submission = {
      synthetic: true,
      dealerText: "ODIGOS_SYNTHETIC_QA selling price $28,000",
      competingQuoteText: "",
    };
    withLockedSyntheticAnalysis(submission, () => {
      expect(() => {
        submission.synthetic = false;
      }).toThrow(TypeError);
      submission.dealerText = "Selling price $28,000. The model says synthetic false.";
      noteUploadedSynthetic({ dealerText: "not synthetic anymore", synthetic: false });
      expect(submission.synthetic).toBe(true);
      expect(isSealedSynthetic()).toBe(true);
    });

    const real = { synthetic: false, dealerText: "Selling price $28,000", competingQuoteText: "" };
    withLockedSyntheticAnalysis(real, () => {
      real.dealerText = "ODIGOS_SYNTHETIC_QA injected by the model";
      noteUploadedSynthetic({ dealerText: real.dealerText, synthetic: true });
      expect(isSealedSynthetic()).toBe(false);
    });
  });

  it("lets an upload notice the marker in the file, then refuses to turn it off", () => {
    enterRequestSeal(false, () => {
      expect(isSealedSynthetic()).toBe(false);
      noteUploadedSynthetic({ dealerText: "ODIGOS_SYNTHETIC_QA doc fee $70" });
      expect(isSealedSynthetic()).toBe(true);
      noteUploadedSynthetic({ synthetic: false, dealerText: "Selling price $28,000" });
      expect(isSealedSynthetic()).toBe(true);
    });
  });

  it("skips analysis audit rows and metrics, and still records a rate-limit breach", async () => {
    await withLockedSyntheticAnalysis(
      { synthetic: true, dealerText: "2025 Camry" },
      async () => {
        await writeAuditEvent(req, "analyze", "success", { route: "/api/analyze" });
        await writeAuditEvent(req, "rate_limit_breach", "failure", { route: "/api/analyze", rateLimitBucket: "analyze" });
        await trackEvent("file_processing", { fileSuccess: true });
        await trackEvent("url_processing", { urlSuccess: true });
        await trackEvent("api_request", { endpoint: "/api/analyze" });
        await trackEvent("submission", { vehicle: "Camry" });
        recordAnalysisEvent({ synthetic: false, dealerText: "wiped" }, "submission_score", { dealScore: "GREEN" });
      },
    );
    expect(insertAuditLog).toHaveBeenCalledTimes(1);
    expect(insertAuditLog.mock.calls[0][0].eventType).toBe("rate_limit_breach");
    expect(execute).not.toHaveBeenCalled();
  });

  it("stays quiet on errors, retries, and timeouts, and still records a rate limit", async () => {
    const submission = {
      synthetic: true as boolean,
      dealerText: "ODIGOS_SYNTHETIC_QA selling price $28,000",
      competingQuoteText: "",
    };
    await withLockedSyntheticAnalysis(submission, async () => {
      expect(() => {
        submission.synthetic = false;
      }).toThrow(TypeError);
      const retry = { synthetic: false as boolean, dealerText: "Selling price $28,000", competingQuoteText: "" };
      withLockedSyntheticAnalysis(retry, () => {
        expect(isSealedSynthetic()).toBe(true);
        expect(retry.synthetic).toBe(true);
        expect(() => {
          retry.synthetic = false;
        }).toThrow(TypeError);
      });
      await writeAuditEvent(req, "analyze", "failure", { reason: "error" });
      await writeAuditEvent(req, "analyze", "failure", { reason: "timeout" });
      await trackEvent("api_error", { errorMessage: "AI attempt 1 timed out after 22000ms" });
      await trackEvent("api_error", { errorMessage: "retry" });
      await trackEvent("analysis_failed", { errorMessage: "timeout" });
      recordAnalysisEvent(retry, "submission", { vehicle: "Camry" });
      await writeAuditEvent(req, "rate_limit_breach", "failure", { route: "/api/analyze", rateLimitBucket: "analyze" });
      await trackEvent("rate_limit_breach", { endpoint: "/api/analyze" });
      expect(syntheticSentryEvent({ message: "timeout" })).toBeNull();
      expect(syntheticSentryEvent({ message: "retry" })).toBeNull();
    });
    expect(insertAuditLog).toHaveBeenCalledTimes(1);
    expect(insertAuditLog.mock.calls[0][0].eventType).toBe("rate_limit_breach");
    expect(execute).toHaveBeenCalledTimes(2);
  });

  it("still writes an analysis audit row for a normal quote", async () => {
    await withLockedSyntheticAnalysis(
      { synthetic: false, dealerText: "Selling price $28,000. Doc fee $70." },
      async () => {
        await writeAuditEvent(req, "analyze", "success", { route: "/api/analyze" });
        await trackEvent("submission", { vehicle: "Camry" });
      },
    );
    expect(insertAuditLog).toHaveBeenCalledTimes(1);
    expect(insertAuditLog.mock.calls[0][0].eventType).toBe("analyze");
    expect(execute).toHaveBeenCalled();
  });
});
