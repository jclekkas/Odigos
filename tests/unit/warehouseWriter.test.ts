import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mock drizzle db ──────────────────────────────────────────────────────────
// NOTE: vi.mock is hoisted to the top of the file so we cannot reference
// variables defined with `const` here. Use vi.fn() inline.

vi.mock("../../server/db", () => ({
  db: {
    insert: vi.fn(),
    select: vi.fn(),
    execute: vi.fn(),
  },
}));

// Mock delay to skip real wait times in tests
vi.mock("../../server/warehouse/warehouseUtils", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../server/warehouse/warehouseUtils")>();
  return {
    ...actual,
    delay: vi.fn().mockResolvedValue(undefined),
  };
});

import { writeSubmissionToWarehouse } from "../../server/warehouse/warehouseWriter";
import { db } from "../../server/db";
import type { AnalysisRequest, AnalysisResponse } from "../../shared/schema";

// ─── Typed mock helpers ───────────────────────────────────────────────────────

const mockInsert = db.insert as ReturnType<typeof vi.fn>;
const mockSelect = db.select as ReturnType<typeof vi.fn>;
const mockExecute = db.execute as ReturnType<typeof vi.fn>;

// ─── Test fixtures ────────────────────────────────────────────────────────────

function makeRequest(overrides: Partial<AnalysisRequest> = {}): AnalysisRequest {
  return {
    dealerText: "OTD is $35,000.",
    condition: "new",
    purchaseType: "finance",
    ...overrides,
  };
}

function makeResult(overrides: Partial<AnalysisResponse> = {}): AnalysisResponse {
  return {
    dealScore: "GREEN",
    confidenceLevel: "HIGH",
    verdictLabel: "GO — TERMS LOOK CLEAN",
    goNoGo: "GO",
    summary: "Looks good.",
    detectedFields: {
      salePrice: 32000,
      msrp: 33000,
      rebates: null,
      fees: [{ name: "Doc Fee", amount: 299 }],
      outTheDoorPrice: 35000,
      monthlyPayment: 500,
      tradeInValue: null,
      apr: 4.9,
      termMonths: 60,
      downPayment: 3000,
    },
    missingInfo: [],
    suggestedReply: "Proceed.",
    reasoning: "OTD and APR provided.",
    ...overrides,
  };
}

const BASE_PAYLOAD = {
  dealerSubmissionId: "sub-001",
  request: makeRequest(),
  result: makeResult(),
  stateCode: "CA",
  contentHash: "abc123deadbeef",
};

// Build a chainable select mock returning specified rows
function buildSelectChain(rows: unknown[] = []) {
  return {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue(rows),
  };
}

// Helper: build a chainable insert mock.
// values() returns a thenable chain so it can be both awaited directly
// (rawUserAnalyses / coreListings pattern) AND chained with
// .onConflictDoNothing().returning() (coreDealers pattern).
function buildFullInsertChain(onValues?: (vals: Record<string, unknown>) => void) {
  const chain: Record<string, unknown> = {};
  const promise = Promise.resolve(undefined);
  // Make chain thenable so `await chain.values(...)` resolves
  chain.then = promise.then.bind(promise);
  chain.catch = promise.catch.bind(promise);
  chain.finally = promise.finally.bind(promise);
  chain.returning = vi.fn().mockResolvedValue([{ id: "dealer-uuid" }]);
  chain.onConflictDoNothing = vi.fn().mockReturnValue(chain);
  chain.values = vi.fn().mockImplementation((vals: Record<string, unknown>) => {
    onValues?.(vals);
    return chain;
  });
  return chain;
}

// ─── Success path ─────────────────────────────────────────────────────────────

describe("writeSubmissionToWarehouse — success path", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockExecute.mockResolvedValue({ rowCount: 1 });
    mockSelect.mockReturnValue(buildSelectChain([]));
    mockInsert.mockReturnValue(buildFullInsertChain());
  });

  it("resolves without error on first attempt", async () => {
    await expect(writeSubmissionToWarehouse(BASE_PAYLOAD)).resolves.toBeUndefined();
  });
});

// ─── Dedup: first submission → non-duplicate ─────────────────────────────────

describe("writeSubmissionToWarehouse — dedup: first submission", () => {
  it("inserts listing with isDuplicate=false when no prior match exists", async () => {
    vi.clearAllMocks();
    mockExecute.mockResolvedValue({ rowCount: 1 });
    mockSelect.mockReturnValue(buildSelectChain([]));

    let listingValues: Record<string, unknown> | null = null;
    mockInsert.mockImplementation(() =>
      buildFullInsertChain((vals) => {
        if ("isDuplicate" in vals) listingValues = vals;
      })
    );

    await writeSubmissionToWarehouse(BASE_PAYLOAD);
    expect(listingValues).not.toBeNull();
    expect(listingValues!.isDuplicate).toBe(false);
    expect(listingValues!.duplicateOfListingId).toBeFalsy();
  });
});

// ─── Dedup: second identical submission → duplicate ───────────────────────────

describe("writeSubmissionToWarehouse — dedup: second identical submission", () => {
  it("inserts listing with isDuplicate=true when prior matching hash exists", async () => {
    vi.clearAllMocks();
    mockExecute.mockResolvedValue({ rowCount: 1 });

    // Simulate existing listing found with same content hash
    mockSelect.mockReturnValue({
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ id: "original-listing-id" }]),
    });

    let capturedListingValues: Record<string, unknown> | null = null;
    mockInsert.mockImplementation(() =>
      buildFullInsertChain((vals) => {
        if ("isDuplicate" in vals) capturedListingValues = vals;
      })
    );

    await writeSubmissionToWarehouse(BASE_PAYLOAD);

    expect(capturedListingValues).not.toBeNull();
    expect(capturedListingValues!.isDuplicate).toBe(true);
    expect(capturedListingValues!.duplicateOfListingId).toBe("original-listing-id");
  });
});

// ─── Retry: succeeds before DLQ ──────────────────────────────────────────────

describe("writeSubmissionToWarehouse — retry: succeeds on second attempt", () => {
  it("resolves without writing to DLQ when a retry succeeds", async () => {
    vi.clearAllMocks();
    mockExecute.mockResolvedValue({ rowCount: 1 });
    mockSelect.mockReturnValue(buildSelectChain([]));

    let insertCallCount = 0;
    mockInsert.mockImplementation(() => {
      insertCallCount++;
      if (insertCallCount === 1) {
        // First call: values() returns a rejected promise to simulate transient failure
        const failChain: Record<string, unknown> = {};
        const rejectedPromise = Promise.reject(new Error("transient DB error"));
        rejectedPromise.catch(() => {}); // avoid unhandled rejection warning
        failChain.then = (rejectedPromise as Promise<unknown>).then.bind(rejectedPromise);
        failChain.catch = (rejectedPromise as Promise<unknown>).catch.bind(rejectedPromise);
        failChain.finally = (rejectedPromise as Promise<unknown>).finally.bind(rejectedPromise);
        failChain.onConflictDoNothing = vi.fn().mockReturnValue(failChain);
        failChain.returning = vi.fn().mockResolvedValue([]);
        failChain.values = vi.fn().mockReturnValue(failChain);
        return failChain;
      }
      // Subsequent attempts succeed
      return buildFullInsertChain();
    });

    // Should resolve without error (retry succeeded)
    await expect(writeSubmissionToWarehouse(BASE_PAYLOAD)).resolves.toBeUndefined();
  });
});

// ─── Persistent failure → DLQ ────────────────────────────────────────────────

describe("writeSubmissionToWarehouse — persistent failure → DLQ", () => {
  it("writes exactly ONE DLQ row with attemptCount=3 after all retries fail", async () => {
    vi.clearAllMocks();
    mockExecute.mockResolvedValue({ rowCount: 1 });
    mockSelect.mockReturnValue(buildSelectChain([]));

    const dlqInsertValues: Record<string, unknown>[] = [];

    mockInsert.mockImplementation(() => {
      // We need to return a chain that resolves or rejects based on the vals
      // We use a deferred approach: build chain, decide on values() call
      const makeChain = (shouldReject: boolean, captureVals?: Record<string, unknown>) => {
        const c: Record<string, unknown> = {};
        const p = shouldReject
          ? (() => { const r = Promise.reject(new Error("persistent DB failure")); r.catch(() => {}); return r; })()
          : Promise.resolve(undefined);
        c.then = (p as Promise<unknown>).then.bind(p);
        c.catch = (p as Promise<unknown>).catch.bind(p);
        c.finally = (p as Promise<unknown>).finally.bind(p);
        c.onConflictDoNothing = vi.fn().mockReturnValue(c);
        c.returning = vi.fn().mockResolvedValue([]);
        c.values = vi.fn().mockReturnValue(c);
        return c;
      };

      const outer: Record<string, unknown> = {};
      outer.onConflictDoNothing = vi.fn().mockReturnValue(outer);
      outer.returning = vi.fn().mockResolvedValue([]);
      outer.values = vi.fn().mockImplementation((vals: Record<string, unknown>) => {
        if ("submissionId" in vals && "errorMessage" in vals) {
          dlqInsertValues.push(vals);
          return makeChain(false);
        }
        return makeChain(true);
      });
      return outer;
    });

    await writeSubmissionToWarehouse(BASE_PAYLOAD);

    expect(dlqInsertValues).toHaveLength(1);
    expect(dlqInsertValues[0].submissionId).toBe("sub-001");
    expect(dlqInsertValues[0].attemptCount).toBe(0);
    expect(typeof dlqInsertValues[0].errorMessage).toBe("string");
    expect((dlqInsertValues[0].errorMessage as string).length).toBeGreaterThan(0);
  });

  it("DLQ payload does not contain raw document text", async () => {
    vi.clearAllMocks();
    mockExecute.mockResolvedValue({ rowCount: 1 });
    mockSelect.mockReturnValue(buildSelectChain([]));

    let dlqPayload: Record<string, unknown> = {};

    mockInsert.mockImplementation(() => {
      const outer: Record<string, unknown> = {};
      outer.onConflictDoNothing = vi.fn().mockReturnValue(outer);
      outer.returning = vi.fn().mockResolvedValue([]);
      outer.values = vi.fn().mockImplementation((vals: Record<string, unknown>) => {
        if ("submissionId" in vals && "errorMessage" in vals) {
          dlqPayload = (vals.payload as Record<string, unknown>) ?? {};
          const c: Record<string, unknown> = {};
          const p = Promise.resolve(undefined);
          c.then = p.then.bind(p); c.catch = p.catch.bind(p); c.finally = p.finally.bind(p);
          c.onConflictDoNothing = vi.fn().mockReturnValue(c);
          c.returning = vi.fn().mockResolvedValue([]);
          c.values = vi.fn().mockReturnValue(c);
          return c;
        }
        const c: Record<string, unknown> = {};
        const r = Promise.reject(new Error("fail")); r.catch(() => {});
        c.then = (r as Promise<unknown>).then.bind(r); c.catch = (r as Promise<unknown>).catch.bind(r); c.finally = (r as Promise<unknown>).finally.bind(r);
        c.onConflictDoNothing = vi.fn().mockReturnValue(c);
        c.returning = vi.fn().mockResolvedValue([]);
        c.values = vi.fn().mockReturnValue(c);
        return c;
      });
      return outer;
    });

    await writeSubmissionToWarehouse({
      ...BASE_PAYLOAD,
      request: makeRequest({ dealerText: "VERY SENSITIVE DEALER TEXT PII DATA" }),
    });

    expect(dlqPayload).not.toHaveProperty("dealerText");
    expect(JSON.stringify(dlqPayload)).not.toContain("SENSITIVE");
  });
});

// ─── Financial sanity flags: out-of-bounds still inserts ─────────────────────

describe("writeSubmissionToWarehouse — sanity_flags populated but listing still inserted", () => {
  it("inserts listing even when financial values are out of bounds", async () => {
    vi.clearAllMocks();
    mockExecute.mockResolvedValue({ rowCount: 1 });
    mockSelect.mockReturnValue(buildSelectChain([]));

    let listingInserted = false;
    let capturedSanityFlags: unknown = null;

    mockInsert.mockImplementation(() =>
      buildFullInsertChain((vals) => {
        if ("isDuplicate" in vals && "sanityFlags" in vals) {
          listingInserted = true;
          capturedSanityFlags = vals.sanityFlags;
        }
      })
    );

    // salePrice of 10 is below min 500 → should generate a sanity flag
    await writeSubmissionToWarehouse({
      ...BASE_PAYLOAD,
      result: makeResult({
        detectedFields: {
          salePrice: 10,
          msrp: null,
          rebates: null,
          fees: [],
          outTheDoorPrice: 35000,
          monthlyPayment: null,
          tradeInValue: null,
          apr: null,
          termMonths: null,
          downPayment: null,
        },
      }),
    });

    expect(listingInserted).toBe(true);
    expect(Array.isArray(capturedSanityFlags)).toBe(true);
    const flags = capturedSanityFlags as Array<{ field: string; reason: string }>;
    expect(flags.length).toBeGreaterThan(0);
    const vehiclePriceFlag = flags.find((f) => f.field === "vehiclePrice");
    expect(vehiclePriceFlag).toBeDefined();
    expect(vehiclePriceFlag!.reason).toBe("below_min");
  });
});

// ─── Vehicle make/model/year — wired into both raw and listing inserts ────────

describe("writeSubmissionToWarehouse — vehicle fields", () => {
  it("persists vehicle_make, vehicle_model, vehicle_year from detectedFields into raw and listing rows", async () => {
    vi.clearAllMocks();
    mockExecute.mockResolvedValue({ rowCount: 1 });
    mockSelect.mockReturnValue(buildSelectChain([]));

    let rawValues: Record<string, unknown> | null = null;
    let listingValues: Record<string, unknown> | null = null;

    mockInsert.mockImplementation(() =>
      buildFullInsertChain((vals) => {
        if ("dealerSubmissionId" in vals && !("isDuplicate" in vals)) {
          rawValues = vals;
        }
        if ("isDuplicate" in vals) {
          listingValues = vals;
        }
      })
    );

    await writeSubmissionToWarehouse({
      ...BASE_PAYLOAD,
      result: makeResult({
        detectedFields: {
          salePrice: 32000,
          msrp: 33000,
          rebates: null,
          fees: [],
          outTheDoorPrice: 35000,
          monthlyPayment: 500,
          tradeInValue: null,
          apr: 4.9,
          termMonths: 60,
          downPayment: 3000,
          vehicle_make: "Toyota",
          vehicle_model: "Camry",
          vehicle_year: 2024,
        },
      }),
    });

    expect(rawValues).not.toBeNull();
    expect(rawValues!.vehicleMake).toBe("Toyota");
    expect(rawValues!.vehicleModel).toBe("Camry");
    expect(rawValues!.vehicleYear).toBe(2024);

    expect(listingValues).not.toBeNull();
    expect(listingValues!.vehicleMake).toBe("Toyota");
    expect(listingValues!.vehicleModel).toBe("Camry");
    expect(listingValues!.vehicleYear).toBe(2024);
  });

  it("stores null for vehicle fields when not present in detectedFields", async () => {
    vi.clearAllMocks();
    mockExecute.mockResolvedValue({ rowCount: 1 });
    mockSelect.mockReturnValue(buildSelectChain([]));

    let rawValues: Record<string, unknown> | null = null;
    let listingValues: Record<string, unknown> | null = null;

    mockInsert.mockImplementation(() =>
      buildFullInsertChain((vals) => {
        if ("dealerSubmissionId" in vals && !("isDuplicate" in vals)) {
          rawValues = vals;
        }
        if ("isDuplicate" in vals) {
          listingValues = vals;
        }
      })
    );

    await writeSubmissionToWarehouse(BASE_PAYLOAD);

    expect(rawValues).not.toBeNull();
    expect(rawValues!.vehicleMake).toBeNull();
    expect(rawValues!.vehicleModel).toBeNull();
    expect(rawValues!.vehicleYear).toBeNull();

    expect(listingValues).not.toBeNull();
    expect(listingValues!.vehicleMake).toBeNull();
    expect(listingValues!.vehicleModel).toBeNull();
    expect(listingValues!.vehicleYear).toBeNull();
  });
});

// ─── Doc-fee cap logic unchanged ─────────────────────────────────────────────

describe("ruleEngine doc-fee cap — unchanged behavior", () => {
  it("checkDocFeeCap still returns violation when fee exceeds state cap", async () => {
    const { checkDocFeeCap } = await import("../../server/ruleEngine");
    const CA_STATE = { docFeeCap: true, docFeeCapAmount: 85, name: "California", abbreviation: "CA", statuteCitation: "CA Vehicle Code § 11713.1(i)" };
    const fees = [{ name: "documentation fee", amount: 200 }];
    const result = checkDocFeeCap(fees, CA_STATE);
    expect(result).not.toBeNull();
    expect(result!.violated).toBe(true);
    expect(result!.overage).toBe(115);
  });

  it("checkDocFeeCap returns null when state has no doc fee cap", async () => {
    const { checkDocFeeCap } = await import("../../server/ruleEngine");
    const NO_CAP_STATE = { docFeeCap: false, docFeeCapAmount: null, name: "Alabama", abbreviation: "AL", statuteCitation: null };
    const fees = [{ name: "doc fee", amount: 999 }];
    expect(checkDocFeeCap(fees, NO_CAP_STATE)).toBeNull();
  });
});
