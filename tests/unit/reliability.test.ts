import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  isRetriableError,
  withJitteredBackoff,
  jitteredBackoffMs,
} from "../../server/lib/reliability";

// ─── isRetriableError ────────────────────────────────────────────────────────

describe("isRetriableError", () => {
  describe("with numeric status codes", () => {
    it("408 is retriable", () => expect(isRetriableError(408)).toBe(true));
    it("429 is retriable", () => expect(isRetriableError(429)).toBe(true));
    it("500 is retriable", () => expect(isRetriableError(500)).toBe(true));
    it("502 is retriable", () => expect(isRetriableError(502)).toBe(true));
    it("503 is retriable", () => expect(isRetriableError(503)).toBe(true));
    it("400 is NOT retriable", () => expect(isRetriableError(400)).toBe(false));
    it("401 is NOT retriable", () => expect(isRetriableError(401)).toBe(false));
    it("403 is NOT retriable", () => expect(isRetriableError(403)).toBe(false));
    it("404 is NOT retriable", () => expect(isRetriableError(404)).toBe(false));
    it("422 is NOT retriable", () => expect(isRetriableError(422)).toBe(false));
    it("200 is NOT retriable", () => expect(isRetriableError(200)).toBe(false));
  });

  describe("with Error objects", () => {
    it("network error is retriable", () => {
      expect(isRetriableError(new Error("Failed to fetch"))).toBe(true);
    });
    it("timeout error is retriable", () => {
      expect(isRetriableError(new Error("Request timed out"))).toBe(true);
    });
    it("ECONNREFUSED is retriable", () => {
      expect(isRetriableError(new Error("ECONNREFUSED"))).toBe(true);
    });
    it("ETIMEDOUT is retriable", () => {
      expect(isRetriableError(new Error("ETIMEDOUT"))).toBe(true);
    });
    it("message with 429: prefix is retriable", () => {
      expect(isRetriableError(new Error("429: Too Many Requests"))).toBe(true);
    });
    it("message with 503: prefix is retriable", () => {
      expect(isRetriableError(new Error("503: Service Unavailable"))).toBe(true);
    });
    it("message with 400: prefix is NOT retriable", () => {
      expect(isRetriableError(new Error("400: Bad Request"))).toBe(false);
    });
    it("validation error is NOT retriable", () => {
      expect(isRetriableError(new Error("Validation failed"))).toBe(false);
    });
    it("generic error is NOT retriable", () => {
      expect(isRetriableError(new Error("Something went wrong"))).toBe(false);
    });
    it("error with status property 429 is retriable", () => {
      const err = new Error("rate limited");
      (err as any).status = 429;
      expect(isRetriableError(err)).toBe(true);
    });
    it("error with status property 400 is NOT retriable", () => {
      const err = new Error("bad request");
      (err as any).status = 400;
      expect(isRetriableError(err)).toBe(false);
    });
  });

  describe("with options object", () => {
    it("status 500 is retriable", () => {
      expect(isRetriableError({ status: 500 })).toBe(true);
    });
    it("status 200 is NOT retriable", () => {
      expect(isRetriableError({ status: 200 })).toBe(false);
    });
    it("network code is retriable", () => {
      expect(isRetriableError({ code: "ECONNREFUSED" })).toBe(true);
    });
    it("rate limit code is retriable", () => {
      expect(isRetriableError({ code: "rate_limit_exceeded" })).toBe(true);
    });
    it("timeout message is retriable", () => {
      expect(isRetriableError({ message: "Request timeout" })).toBe(true);
    });
  });
});

// ─── jitteredBackoffMs ───────────────────────────────────────────────────────

describe("jitteredBackoffMs", () => {
  it("returns a positive number", () => {
    for (let i = 1; i <= 5; i++) {
      expect(jitteredBackoffMs(i)).toBeGreaterThan(0);
    }
  });

  it("respects maxDelayMs cap", () => {
    const cap = 500;
    for (let i = 1; i <= 10; i++) {
      expect(jitteredBackoffMs(i, 200, cap)).toBeLessThanOrEqual(cap);
    }
  });

  it("grows with attempt number", () => {
    const base = 100;
    const a1 = jitteredBackoffMs(1, base, 100_000);
    const a3 = jitteredBackoffMs(3, base, 100_000);
    const a5 = jitteredBackoffMs(5, base, 100_000);
    expect(a3).toBeGreaterThan(a1);
    expect(a5).toBeGreaterThan(a3);
  });
});

// ─── withJitteredBackoff ─────────────────────────────────────────────────────

describe("withJitteredBackoff", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("succeeds on first attempt", async () => {
    const fn = vi.fn().mockResolvedValue("ok");
    const result = await withJitteredBackoff(fn, { maxAttempts: 3 });
    expect(result).toBe("ok");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("retries on transient error and succeeds", async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error("503: Service Unavailable"))
      .mockResolvedValue("ok");

    const promise = withJitteredBackoff(fn, { maxAttempts: 3, baseDelayMs: 1, maxDelayMs: 10 });
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result).toBe("ok");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("does NOT retry on non-retriable error", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("400: Bad Request"));

    await expect(
      withJitteredBackoff(fn, { maxAttempts: 3, baseDelayMs: 1 }),
    ).rejects.toThrow("400: Bad Request");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("exhausts max attempts on persistent transient errors", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("503: Service Unavailable"));

    const promise = withJitteredBackoff(fn, { maxAttempts: 3, baseDelayMs: 1, maxDelayMs: 10 });
    const assertion = expect(promise).rejects.toThrow("503: Service Unavailable");
    await vi.runAllTimersAsync();
    await assertion;
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it("calls onRetry callback on each retry", async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error("429: Too Many Requests"))
      .mockResolvedValue("done");
    const onRetry = vi.fn();

    const promise = withJitteredBackoff(fn, {
      maxAttempts: 3,
      baseDelayMs: 1,
      maxDelayMs: 10,
      onRetry,
    });
    await vi.runAllTimersAsync();
    await promise;

    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onRetry).toHaveBeenCalledWith(1, expect.any(Error), expect.any(Number));
  });

  it("stops early when totalBudgetMs is exhausted", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("503: Service Unavailable"));

    const promise = withJitteredBackoff(fn, {
      maxAttempts: 10,
      baseDelayMs: 1000,
      maxDelayMs: 10000,
      totalBudgetMs: 0,
    });
    const assertion = expect(promise).rejects.toThrow();
    await vi.runAllTimersAsync();
    await assertion;
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
