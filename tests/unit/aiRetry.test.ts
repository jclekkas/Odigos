/**
 * Unit tests for AI retry + circuit breaker behavior in the analyze route.
 *
 * These tests focus on:
 *  - Transient retriable errors (5xx, timeout) trigger up to maxAttempts retries
 *  - Non-retriable errors (4xx validation) stop immediately after 1 attempt
 *  - Circuit-open error propagates as CircuitOpenError
 *  - Budget exhaustion halts retries early
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@sentry/node", () => ({
  addBreadcrumb: vi.fn(),
  captureException: vi.fn(),
  withScope: vi.fn((fn: (s: unknown) => void) => fn({ setTag: vi.fn() })),
}));

import { withJitteredBackoff, isRetriableError } from "../../server/lib/reliability";
import { CircuitBreaker, CircuitOpenError } from "../../server/lib/circuitBreaker";

describe("AI retry: isRetriableError classification", () => {
  it("classifies 503 as retriable", () => {
    expect(isRetriableError(new Error("503: Service Unavailable"))).toBe(true);
  });

  it("classifies 429 as retriable", () => {
    expect(isRetriableError(new Error("429: Too Many Requests"))).toBe(true);
  });

  it("classifies timeout as retriable", () => {
    expect(isRetriableError(new Error("AI attempt 1 timed out after 30000ms"))).toBe(true);
  });

  it("classifies generic OpenAI error as NOT retriable", () => {
    expect(isRetriableError(new Error("OpenAI unavailable"))).toBe(false);
  });

  it("classifies 400 validation error as NOT retriable", () => {
    expect(isRetriableError(new Error("400: Bad Request"))).toBe(false);
  });
});

describe("AI retry: withJitteredBackoff retry count behavior", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("retries up to maxAttempts on retriable error and then throws", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("503: Service Unavailable"));

    const promise = withJitteredBackoff(fn, {
      maxAttempts: 3,
      baseDelayMs: 1,
      maxDelayMs: 10,
    });
    const assertion = expect(promise).rejects.toThrow("503: Service Unavailable");
    await vi.runAllTimersAsync();
    await assertion;

    expect(fn).toHaveBeenCalledTimes(3);
  });

  it("stops after 1 attempt on non-retriable error", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("OpenAI unavailable"));

    await expect(
      withJitteredBackoff(fn, { maxAttempts: 3, baseDelayMs: 1 }),
    ).rejects.toThrow("OpenAI unavailable");

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("succeeds after a transient failure on retry", async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error("503: Service Unavailable"))
      .mockResolvedValue("success");

    const promise = withJitteredBackoff(fn, { maxAttempts: 3, baseDelayMs: 1, maxDelayMs: 10 });
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result).toBe("success");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("respects totalBudgetMs=0 — runs exactly 1 attempt then stops", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("503: Service Unavailable"));

    const promise = withJitteredBackoff(fn, {
      maxAttempts: 10,
      baseDelayMs: 500,
      totalBudgetMs: 0,
    });
    const assertion = expect(promise).rejects.toThrow();
    await vi.runAllTimersAsync();
    await assertion;

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("calls onRetry for each retry with correct metadata", async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error("429: Too Many Requests"))
      .mockResolvedValue("ok");
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
});

describe("AI retry: CircuitBreaker integration with withJitteredBackoff", () => {
  it("CircuitOpenError from breaker is NOT retried (non-retriable)", async () => {
    const breaker = new CircuitBreaker("test-ai", {
      failureThreshold: 1,
      windowMs: 5000,
      cooldownMs: 60_000,
    });

    // Trip the breaker
    await expect(
      breaker.execute(() => Promise.reject(new Error("fail"))),
    ).rejects.toThrow();
    expect(breaker.getState()).toBe("OPEN");

    // Now wrap via withJitteredBackoff: CircuitOpenError should NOT be retried
    const innerFn = vi.fn(() => breaker.execute(() => Promise.resolve("ok")));

    await expect(
      withJitteredBackoff(innerFn, { maxAttempts: 3, baseDelayMs: 1 }),
    ).rejects.toBeInstanceOf(CircuitOpenError);

    // Only called once — no retry
    expect(innerFn).toHaveBeenCalledTimes(1);
  });

  it("CircuitOpenError message does not match retriable patterns", () => {
    const err = new CircuitOpenError("openai");
    expect(isRetriableError(err)).toBe(false);
  });

  it("breaker transitions OPEN after failureThreshold repeated failures", async () => {
    const breaker = new CircuitBreaker("test-open", {
      failureThreshold: 3,
      windowMs: 5000,
      cooldownMs: 60_000,
    });

    for (let i = 0; i < 3; i++) {
      await expect(
        breaker.execute(() => Promise.reject(new Error("503: Service Unavailable"))),
      ).rejects.toThrow();
    }

    expect(breaker.getState()).toBe("OPEN");

    await expect(
      breaker.execute(() => Promise.resolve("ok")),
    ).rejects.toBeInstanceOf(CircuitOpenError);
  });
});
