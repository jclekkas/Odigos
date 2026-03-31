import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../server/metrics/events", () => ({
  loadMetrics: vi.fn(),
}));

vi.mock("../../server/db", () => ({
  db: {
    execute: vi.fn().mockResolvedValue({ rows: [] }),
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
  },
}));

import { loadMetrics } from "../../server/metrics/events";
import { getTechnicalSummary } from "../../server/metrics/technical";

const mockLoadMetrics = vi.mocked(loadMetrics);

function makeEvent(daysAgo: number, eventType = "api_request", extra: Record<string, unknown> = {}) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return {
    id: Math.random(),
    eventType,
    createdAt: d.toISOString(),
    metadata: { endpoint: "/api/analyze", responseTimeMs: 100, ...extra },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getTechnicalSummary range=all consistency", () => {
  it("includes api_request events older than 30 days in aggregate totals", async () => {
    mockLoadMetrics.mockResolvedValue({
      events: [
        makeEvent(0),
        makeEvent(15),
        makeEvent(45),
        makeEvent(60),
      ] as never,
      nextId: 5,
    });

    const result = await getTechnicalSummary("all");

    expect(result.totalRequests).toBe(4);
  });

  it("does not include events older than 30 days when range=month", async () => {
    mockLoadMetrics.mockResolvedValue({
      events: [
        makeEvent(0),
        makeEvent(15),
        makeEvent(45),
        makeEvent(60),
      ] as never,
      nextId: 5,
    });

    const result = await getTechnicalSummary("month");

    expect(result.totalRequests).toBe(2);
  });

  it("hourlyErrorRate buckets cover the full all-time span (>30 days when oldest event is 60d ago)", async () => {
    mockLoadMetrics.mockResolvedValue({
      events: [
        makeEvent(0, "api_error"),
        makeEvent(60, "api_error"),
      ] as never,
      nextId: 3,
    });

    const result = await getTechnicalSummary("all");

    expect(result.hourlyErrorRate.length).toBeGreaterThan(30);
    expect(result.totalErrors).toBe(2);
  });

  it("hourlyErrorRate bucket count is exactly 30 for range=month", async () => {
    mockLoadMetrics.mockResolvedValue({
      events: [makeEvent(0, "api_error"), makeEvent(60, "api_error")] as never,
      nextId: 3,
    });

    const result = await getTechnicalSummary("month");

    expect(result.hourlyErrorRate.length).toBe(30);
    expect(result.totalErrors).toBe(1);
  });

  it("aiUsage callCount includes events older than 30 days when range=all", async () => {
    mockLoadMetrics.mockResolvedValue({
      events: [
        makeEvent(5, "api_request", { endpoint: "openai_chat", promptTokens: 100, completionTokens: 50 }),
        makeEvent(45, "api_request", { endpoint: "openai_chat", promptTokens: 200, completionTokens: 75 }),
      ] as never,
      nextId: 3,
    });

    const result = await getTechnicalSummary("all");

    expect(result.aiUsage.callCount).toBe(2);
  });
});
