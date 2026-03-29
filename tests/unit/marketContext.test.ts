import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../server/db", () => ({
  db: {
    execute: vi.fn(),
  },
}));

import { db } from "../../server/db";
import { getMarketContext, getDealerStats, getStrength } from "../../server/marketContext";

const mockExecute = vi.mocked(db.execute);

function stateRow(listing_count: number, avg_deal_score = "75.0", avg_doc_fee = "300.0") {
  return { rows: [{ listing_count: String(listing_count), observed_count: String(listing_count), avg_deal_score, avg_doc_fee }] };
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

// ── getStrength helper ────────────────────────────────────────────────────────

describe("getStrength", () => {
  it("returns 'none' for 0", () => {
    expect(getStrength(0)).toBe("none");
  });
  it("returns 'thin' for 1", () => {
    expect(getStrength(1)).toBe("thin");
  });
  it("returns 'thin' for 2", () => {
    expect(getStrength(2)).toBe("thin");
  });
  it("returns 'moderate' for 3", () => {
    expect(getStrength(3)).toBe("moderate");
  });
  it("returns 'moderate' for 9", () => {
    expect(getStrength(9)).toBe("moderate");
  });
  it("returns 'strong' for 10", () => {
    expect(getStrength(10)).toBe("strong");
  });
  it("returns 'strong' for 50", () => {
    expect(getStrength(50)).toBe("strong");
  });
});

// ── State-only lookup with no dealer ─────────────────────────────────────────

describe("getMarketContext — state-only lookup (no dealer)", () => {
  it("returns null immediately when state is falsy", async () => {
    const result = await getMarketContext({ state: null, dealerName: null, docFee: null });
    expect(result).toBeNull();
    expect(mockExecute).not.toHaveBeenCalled();
  });

  it("returns null when state row is missing", async () => {
    mockExecute.mockResolvedValueOnce({ rows: [] } as never);
    const result = await getMarketContext({ state: "CA", dealerName: null, docFee: null });
    expect(result).toBeNull();
  });

  it("returns null when state has 0 analyses", async () => {
    mockExecute.mockResolvedValueOnce(stateRow(0) as never);
    const result = await getMarketContext({ state: "CA", dealerName: null, docFee: null });
    expect(result).toBeNull();
  });

  it("returns state context with 'thin' strength when stateTotalAnalyses is 1", async () => {
    mockExecute.mockResolvedValueOnce(stateRow(1) as never);
    const result = await getMarketContext({ state: "CA", dealerName: null, docFee: null });
    expect(result).not.toBeNull();
    expect(result!.stateCode).toBe("CA");
    expect(result!.stateTotalAnalyses).toBe(1);
    expect(result!.stateStrength).toBe("thin");
    expect(result!.overallStrength).toBe("thin");
  });

  it("returns state context with 'thin' strength when stateTotalAnalyses is 5 (previously returned null)", async () => {
    mockExecute.mockResolvedValueOnce(stateRow(5) as never);
    const result = await getMarketContext({ state: "CA", dealerName: null, docFee: null });
    expect(result).not.toBeNull();
    expect(result!.stateStrength).toBe("moderate");
    expect(result!.overallStrength).toBe("moderate");
  });

  it("returns state context with 'strong' strength when stateTotalAnalyses >= 10 and no dealer", async () => {
    mockExecute.mockResolvedValueOnce(stateRow(50) as never);
    const result = await getMarketContext({ state: "CA", dealerName: null, docFee: null });
    expect(result).not.toBeNull();
    expect(result!.stateCode).toBe("CA");
    expect(result!.stateTotalAnalyses).toBe(50);
    expect(result!.stateAvgDealScore).toBe(75.0);
    expect(result!.stateAvgDocFee).toBe(300.0);
    expect(result!.dealerAnalysisCount).toBeNull();
    expect(result!.dealerAvgDealScore).toBeNull();
    expect(result!.stateStrength).toBe("strong");
    expect(result!.overallStrength).toBe("strong");
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
    expect(result!.dealerStrength).toBe("strong");
  });

  it("includes dealer fields when dealer has 1 analysis (previously omitted)", async () => {
    mockExecute
      .mockResolvedValueOnce(stateRow(50) as never)
      .mockResolvedValueOnce(dealerRow(1) as never)
      .mockResolvedValueOnce({ rows: [] } as never);

    const result = await getMarketContext({ state: "TX", dealerName: "Acme Toyota", docFee: null });
    expect(result).not.toBeNull();
    expect(result!.dealerAnalysisCount).toBe(1);
    expect(result!.dealerStrength).toBe("thin");
  });

  it("includes dealer fields with 'thin' strength when dealer has 2 analyses (previously omitted)", async () => {
    mockExecute
      .mockResolvedValueOnce(stateRow(50) as never)
      .mockResolvedValueOnce(dealerRow(2) as never)
      .mockResolvedValueOnce({ rows: [] } as never);

    const result = await getMarketContext({ state: "TX", dealerName: "Acme Toyota", docFee: null });
    expect(result).not.toBeNull();
    expect(result!.dealerAnalysisCount).toBe(2);
    expect(result!.dealerStrength).toBe("thin");
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

// ── Feedback threshold guard at >= 1 ─────────────────────────────────────────

describe("getMarketContext — feedback threshold guard", () => {
  it("includes feedback fields when total_feedback_count >= 3", async () => {
    mockExecute
      .mockResolvedValueOnce(stateRow(50) as never)
      .mockResolvedValueOnce(dealerRow(10) as never)
      .mockResolvedValueOnce(feedbackRow(5) as never);

    const result = await getMarketContext({ state: "CA", dealerName: "Good Dealer", docFee: null });
    expect(result!.feedbackCount).toBe(5);
    expect(result!.feedbackAgreementPct).toBeCloseTo(0.85);
    expect(result!.feedbackStrength).toBe("moderate");
  });

  it("includes feedback fields when total_feedback_count is 1 (previously omitted)", async () => {
    mockExecute
      .mockResolvedValueOnce(stateRow(50) as never)
      .mockResolvedValueOnce(dealerRow(10) as never)
      .mockResolvedValueOnce(feedbackRow(1) as never);

    const result = await getMarketContext({ state: "CA", dealerName: "Good Dealer", docFee: null });
    expect(result!.feedbackCount).toBe(1);
    expect(result!.feedbackStrength).toBe("thin");
  });

  it("omits feedback fields when total_feedback_count < 1 (zero)", async () => {
    mockExecute
      .mockResolvedValueOnce(stateRow(50) as never)
      .mockResolvedValueOnce(dealerRow(10) as never)
      .mockResolvedValueOnce(feedbackRow(0) as never);

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

// ── overallStrength computation ───────────────────────────────────────────────

describe("getMarketContext — overallStrength", () => {
  it("overallStrength is max of state, dealer, feedback strengths", async () => {
    mockExecute
      .mockResolvedValueOnce(stateRow(2) as never)
      .mockResolvedValueOnce(dealerRow(10) as never)
      .mockResolvedValueOnce({ rows: [] } as never);

    const result = await getMarketContext({ state: "CA", dealerName: "Dealer", docFee: null });
    expect(result!.stateStrength).toBe("thin");
    expect(result!.dealerStrength).toBe("strong");
    expect(result!.overallStrength).toBe("strong");
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

  it("returns null when dealer has 0 analyses", async () => {
    mockExecute.mockResolvedValueOnce({ rows: [{ listing_count: "0", avg_deal_score: "70.0" }] } as never);
    const result = await getDealerStats({ state: "CA", dealerName: "Small Dealer" });
    expect(result).toBeNull();
  });

  it("returns stats when dealer has 1 analysis (previously required >= 3)", async () => {
    mockExecute.mockResolvedValueOnce({ rows: [{ listing_count: "1", avg_deal_score: "70.0" }] } as never);
    const result = await getDealerStats({ state: "CA", dealerName: "Small Dealer" });
    expect(result).not.toBeNull();
    expect(result!.dealerAnalysisCount).toBe(1);
  });

  it("returns stats when dealer has 2 analyses (previously required >= 3)", async () => {
    mockExecute.mockResolvedValueOnce({ rows: [{ listing_count: "2", avg_deal_score: "70.0" }] } as never);
    const result = await getDealerStats({ state: "CA", dealerName: "Small Dealer" });
    expect(result).not.toBeNull();
    expect(result!.dealerAnalysisCount).toBe(2);
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
