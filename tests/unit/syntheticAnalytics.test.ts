import { readFileSync } from "fs";
import { resolve } from "path";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../server/events.js", () => ({
  trackEvent: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../../server/logger.js", () => ({
  logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn() },
}));

import { trackEvent } from "../../server/events.js";
import { recordAnalysisEvent } from "../../server/analysisTelemetry.js";
import { isSyntheticTrackingPayload, shouldEmitSubmissionAnalytics } from "../../shared/syntheticSubmission.js";

describe("synthetic submissions emit no analytics", () => {
  beforeEach(() => {
    vi.mocked(trackEvent).mockClear();
  });

  it("drops server analysis events for synthetic:true and the QA marker", async () => {
    recordAnalysisEvent({ synthetic: true, dealerText: "2025 Camry" }, "submission", { vehicle: "Camry" });
    recordAnalysisEvent(
      { dealerText: "ODIGOS_SYNTHETIC_QA selling price $28,000" },
      "submission_score",
      { dealScore: "YELLOW" },
    );
    recordAnalysisEvent(
      { dealerText: "Selling price $28,000", competingQuoteText: "ODIGOS_SYNTHETIC_QA doc fee $85" },
      "state_detection",
      { state: "CA" },
    );
    await Promise.resolve();
    expect(trackEvent).not.toHaveBeenCalled();
  });

  it("still records a normal buyer submission", async () => {
    recordAnalysisEvent(
      { synthetic: false, dealerText: "Selling price $28,000. Doc fee $70." },
      "content_validation",
      { isRelevant: true },
    );
    expect(trackEvent).toHaveBeenCalledWith("content_validation", { isRelevant: true });
  });

  it("treats the QA marker and synthetic flag as not worth analytics", () => {
    expect(shouldEmitSubmissionAnalytics({ synthetic: true, dealerText: "Camry" })).toBe(false);
    expect(shouldEmitSubmissionAnalytics({ dealerText: "Quote ODIGOS_SYNTHETIC_QA" })).toBe(false);
    expect(shouldEmitSubmissionAnalytics({ dealerText: "Selling price $28,000" })).toBe(true);
    expect(isSyntheticTrackingPayload({ metadata: { synthetic: true } })).toBe(true);
    expect(isSyntheticTrackingPayload({ metadata: { dealerText: "ODIGOS_SYNTHETIC_QA" } })).toBe(true);
    expect(isSyntheticTrackingPayload({ metadata: { page: "/analyze" } })).toBe(false);
  });

  it("keeps analysis telemetry behind the synthetic check in the server and client", () => {
    const server = readFileSync(resolve(import.meta.dirname, "../../server/services/analyzeService.ts"), "utf8");
    expect(server).not.toMatch(/trackEvent\(/);
    expect(server).toMatch(/recordAnalysisEvent\(data,/);
    const client = readFileSync(resolve(import.meta.dirname, "../../client/src/pages/home.tsx"), "utf8");
    expect(client).toMatch(/captureSubmissionEvent\(submission, "analysis_submitted"/);
    expect(client).toMatch(/trackSubmissionEvent\(submission, "analyze_start"\)/);
    expect(client).not.toMatch(/capture\("analysis_submitted"/);
    expect(client).not.toMatch(/trackAnalyzeStart\(\)/);
  });
});
