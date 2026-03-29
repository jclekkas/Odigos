import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../server/db", () => ({
  db: {
    execute: vi.fn(),
  },
}));

import { db } from "../../server/db";
import { getMarketContext, getDealerStats } from "../../server/marketContext";

const mockExecute = vi.mocked(db.execute);

function stateRow(listing_count: number, avg_deal_score = "75.0", avg_doc_fee = "300.0") {
  return { rows: [{ listing_count: String(listing_count), avg_deal_score, avg_doc_fee }] };
}

function dealerRow(listing_count: number, id = "dealer-1", avg_deal_score: string | null = "80.0") {
  return { rows: [{ id, listing_count: String(listing_count), avg_deal_score }] };
}

function feedbackRow(total: number, pct: string | null = "0.85") {
  return {
    rows: [{
      positive_feedback_count: String(Math.round(total * 0.85)),
      total_feedback_count: String(total),
      feedback_agreement_pct: pct,
    }],
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ── State-only lookup with no dealer ─────────────────────────────────────────

describe("getMarketContext — state-only lookup (no dealer)", () => {
  it("returns null immediately when state is falsy", async () => {
    const result = await getMarketContext({ state: null, dealerName: null, docFee: null });
    expect(result).toBeNull();
    expect(mockExecute).not.toHaveBeenCalled();
  });

  it("returns null when state has fewer than 10 analyses", async () => {
    mockExecute.mockResolvedValueOnce(stateRow(5) as never);
    const result = await getMarketContext({ state: "CA", dealerName: null, docFee: null });
    expect(result).toBeNull();
  });

  it("returns state context when stateTotalAnalyses >= 10 and no dealer", async () => {
    mockExecute.mockResolvedValueOnce(stateRow(50) as never);
    const result = await getMarketContext({ state: "CA", dealerName: null, docFee: null });
    expect(result).not.toBeNull();
    expect(result!.stateCode).toBe("CA");
    expect(result!.stateTotalAnalyses).toBe(50);
    expect(result!.stateAvgDealScore).toBe(75.0);
    expect(result!.stateAvgDocFee).toBe(300.0);
    expect(result!.dealerAnalysisCount).toBeNull();
    expect(result!.dealerAvgDealScore).toBeNull();
  });

  it("returns null when state row is missing", async () => {
    mockExecute.mockResolvedValueOnce({ rows: [] } as never);
    const result = await getMarketContext({ state: "CA", dealerName: null, docFee: null });
    expect(result).toBeNull();
  });

  it("computes docFeeVsStateAvg correctly when docFee is provided", async () => {
    mockExecute.mockResolvedValueOnce(stateRow(50, "75.0", "300.0") as never);
    const result = await getMarketContext({ state: "CA", dealerName: null, docFee: 400 });
    expect(result!.docFeeVsStateAvg).toBe(100);
  });

  it("clamps docFeeVsStateAvg to null when delta > 2000", async () => {
    mockExecute.mockResolvedValueOnce(stateRow(50, "75.0", "100.0") as never);
    const result = await getMarketContext({ state: "CA", dealerName: null, docFee: 5000 });
    expect(result!.docFeeVsStateAvg).toBeNull();
  });
});

// ── Dealer-specific branch ────────────────────────────────────────────────────

describe("getMarketContext — dealer-specific branch", () => {
  it("includes dealer fields when dealer has >= 3 analyses", async () => {
    mockExecute
      .mockResolvedValueOnce(stateRow(50) as never)
      .mockResolvedValueOnce(dealerRow(10) as never)
      .mockResolvedValueOnce({ rows: [] } as never);

    const result = await getMarketContext({ state: "TX", dealerName: "Acme Toyota", docFee: null });
    expect(result).not.toBeNull();
    expect(result!.dealerAnalysisCount).toBe(10);
    expect(result!.dealerAvgDealScore).toBe(80.0);
  });

  it("omits dealer fields when dealer has fewer than 3 analyses", async () => {
    mockExecute
      .mockResolvedValueOnce(stateRow(50) as never)
      .mockResolvedValueOnce(dealerRow(2) as never);

    const result = await getMarketContext({ state: "TX", dealerName: "Acme Toyota", docFee: null });
    expect(result).not.toBeNull();
    expect(result!.dealerAnalysisCount).toBeNull();
    expect(result!.dealerAvgDealScore).toBeNull();
  });

  it("still returns state context when dealer lookup miss (no row)", async () => {
    mockExecute
      .mockResolvedValueOnce(stateRow(50) as never)
      .mockResolvedValueOnce({ rows: [] } as never);

    const result = await getMarketContext({ state: "TX", dealerName: "Unknown Dealer", docFee: null });
    expect(result).not.toBeNull();
    expect(result!.stateTotalAnalyses).toBe(50);
    expect(result!.dealerAnalysisCount).toBeNull();
  });
});

// ── Feedback threshold guard at >= 3 ─────────────────────────────────────────

describe("getMarketContext — feedback threshold guard", () => {
  it("includes feedback fields when total_feedback_count >= 3", async () => {
    mockExecute
      .mockResolvedValueOnce(stateRow(50) as never)
      .mockResolvedValueOnce(dealerRow(10) as never)
      .mockResolvedValueOnce(feedbackRow(5) as never);

    const result = await getMarketContext({ state: "CA", dealerName: "Good Dealer", docFee: null });
    expect(result!.feedbackCount).toBe(5);
    expect(result!.feedbackAgreementPct).toBeCloseTo(0.85);
  });

  it("omits feedback fields when total_feedback_count < 3", async () => {
    mockExecute
      .mockResolvedValueOnce(stateRow(50) as never)
      .mockResolvedValueOnce(dealerRow(10) as never)
      .mockResolvedValueOnce(feedbackRow(2) as never);

    const result = await getMarketContext({ state: "CA", dealerName: "Good Dealer", docFee: null });
    expect(result!.feedbackCount).toBeUndefined();
    expect(result!.feedbackAgreementPct).toBeUndefined();
  });

  it("omits feedback fields when feedback row is absent", async () => {
    mockExecute
      .mockResolvedValueOnce(stateRow(50) as never)
      .mockResolvedValueOnce(dealerRow(10) as never)
      .mockResolvedValueOnce({ rows: [] } as never);

    const result = await getMarketContext({ state: "CA", dealerName: "Good Dealer", docFee: null });
    expect(result!.feedbackCount).toBeUndefined();
  });
});

// ── Database failure fallback ─────────────────────────────────────────────────

describe("getMarketContext — database failure fallback", () => {
  it("returns null when state query throws", async () => {
    mockExecute.mockRejectedValueOnce(new Error("DB connection lost") as never);
    const result = await getMarketContext({ state: "FL", dealerName: null, docFee: null });
    expect(result).toBeNull();
  });

  it("still returns state context when feedback query throws (feedback is optional)", async () => {
    mockExecute
      .mockResolvedValueOnce(stateRow(50) as never)
      .mockResolvedValueOnce(dealerRow(10) as never)
      .mockRejectedValueOnce(new Error("feedback table unavailable") as never);

    const result = await getMarketContext({ state: "FL", dealerName: "Some Dealer", docFee: null });
    expect(result).not.toBeNull();
    expect(result!.stateTotalAnalyses).toBe(50);
    expect(result!.feedbackCount).toBeUndefined();
  });
});

// ── getDealerStats ────────────────────────────────────────────────────────────

describe("getDealerStats", () => {
  it("returns null when dealer row not found", async () => {
    mockExecute.mockResolvedValueOnce({ rows: [] } as never);
    const result = await getDealerStats({ state: "CA", dealerName: "Unknown" });
    expect(result).toBeNull();
  });

  it("returns null when dealer has fewer than 3 analyses", async () => {
    mockExecute.mockResolvedValueOnce({ rows: [{ listing_count: "2", avg_deal_score: "70.0" }] } as never);
    const result = await getDealerStats({ state: "CA", dealerName: "Small Dealer" });
    expect(result).toBeNull();
  });

  it("returns stats when dealer has >= 3 analyses", async () => {
    mockExecute.mockResolvedValueOnce({ rows: [{ listing_count: "5", avg_deal_score: "82.5" }] } as never);
    const result = await getDealerStats({ state: "CA", dealerName: "Big Dealer" });
    expect(result).not.toBeNull();
    expect(result!.dealerAnalysisCount).toBe(5);
    expect(result!.dealerAvgDealScore).toBeCloseTo(82.5);
  });

  it("returns null on DB error (non-fatal)", async () => {
    mockExecute.mockRejectedValueOnce(new Error("timeout") as never);
    const result = await getDealerStats({ state: "CA", dealerName: "Dealer" });
    expect(result).toBeNull();
  });
});
