import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@sentry/node", () => ({
  addBreadcrumb: vi.fn(),
  captureException: vi.fn(),
}));

import { CircuitBreaker, CircuitOpenError } from "../../server/lib/circuitBreaker.js";

function makeBreaker(opts?: ConstructorParameters<typeof CircuitBreaker>[1]) {
  return new CircuitBreaker("test", {
    failureThreshold: 3,
    windowMs: 5000,
    cooldownMs: 1000,
    halfOpenProbeQuota: 1,
    ...opts,
  });
}

// ─── CLOSED state ────────────────────────────────────────────────────────────

describe("CircuitBreaker — CLOSED state", () => {
  it("starts in CLOSED state", () => {
    const cb = makeBreaker();
    expect(cb.getState()).toBe("CLOSED");
  });

  it("passes through successful calls", async () => {
    const cb = makeBreaker();
    const result = await cb.execute(() => Promise.resolve("hello"));
    expect(result).toBe("hello");
  });

  it("lets errors bubble through when below threshold", async () => {
    const cb = makeBreaker({ failureThreshold: 5 });
    for (let i = 0; i < 4; i++) {
      await expect(cb.execute(() => Promise.reject(new Error("fail")))).rejects.toThrow("fail");
    }
    expect(cb.getState()).toBe("CLOSED");
  });

  it("opens after reaching failure threshold", async () => {
    const cb = makeBreaker({ failureThreshold: 3 });
    for (let i = 0; i < 3; i++) {
      await expect(cb.execute(() => Promise.reject(new Error("fail")))).rejects.toThrow();
    }
    expect(cb.getState()).toBe("OPEN");
  });
});

// ─── OPEN state ─────────────────────────────────────────────────────────────

describe("CircuitBreaker — OPEN state", () => {
  it("fast-fails with CircuitOpenError when open", async () => {
    const cb = makeBreaker({ failureThreshold: 1 });
    await expect(cb.execute(() => Promise.reject(new Error("fail")))).rejects.toThrow();
    expect(cb.getState()).toBe("OPEN");

    await expect(cb.execute(() => Promise.resolve("ok"))).rejects.toThrow(CircuitOpenError);
  });

  it("transitions to HALF_OPEN after cooldown", async () => {
    vi.useFakeTimers();
    const cb = makeBreaker({ failureThreshold: 1, cooldownMs: 500 });
    await expect(cb.execute(() => Promise.reject(new Error("fail")))).rejects.toThrow();
    expect(cb.getState()).toBe("OPEN");

    vi.advanceTimersByTime(600);

    // Next call should move to HALF_OPEN and attempt
    const fn = vi.fn().mockResolvedValue("recovered");
    await cb.execute(fn);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(cb.getState()).toBe("CLOSED");

    vi.useRealTimers();
  });
});

// ─── HALF_OPEN state ─────────────────────────────────────────────────────────

describe("CircuitBreaker — HALF_OPEN state", () => {
  async function openAndCoolBreaker() {
    vi.useFakeTimers();
    const cb = makeBreaker({ failureThreshold: 1, cooldownMs: 100, halfOpenProbeQuota: 1 });
    await expect(cb.execute(() => Promise.reject(new Error("fail")))).rejects.toThrow();
    vi.advanceTimersByTime(200);
    return cb;
  }

  it("closes on successful probe", async () => {
    const cb = await openAndCoolBreaker();
    await cb.execute(() => Promise.resolve("ok"));
    expect(cb.getState()).toBe("CLOSED");
    vi.useRealTimers();
  });

  it("re-opens on probe failure", async () => {
    const cb = await openAndCoolBreaker();
    await expect(cb.execute(() => Promise.reject(new Error("still broken")))).rejects.toThrow();
    expect(cb.getState()).toBe("OPEN");
    vi.useRealTimers();
  });

  it("limits probes to halfOpenProbeQuota", async () => {
    const cb = await openAndCoolBreaker();
    // First probe — goes through
    const probe1 = cb.execute(() => new Promise(() => {})); // never resolves
    // Second probe — should be rejected immediately
    await expect(cb.execute(() => Promise.resolve("ok"))).rejects.toThrow(CircuitOpenError);
    vi.useRealTimers();
  });
});
