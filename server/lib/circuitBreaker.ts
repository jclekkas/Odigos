/**
 * In-process circuit breaker for wrapping AI/external service calls.
 *
 * States:
 *   CLOSED  – requests pass through normally
 *   OPEN    – fast-fail all requests (raise CircuitOpenError)
 *   HALF_OPEN – allow a small probe quota; close on success, re-open on failure
 *
 * ⚠️  SINGLE-INSTANCE LIMITATION
 * This circuit breaker is in-process / memory-backed. All state (failure counts,
 * open/half-open transitions) lives in the JavaScript heap of a single Node.js
 * process. There is no cross-instance coordination. Running multiple server
 * replicas means each replica has its own independent breaker state — a replica
 * that has not personally seen failures will keep its breaker CLOSED even when
 * the upstream service is down for other replicas.
 * Redis (or a shared store) is required for a distributed, cross-instance
 * circuit breaker when scaling beyond one process.
 */

import * as Sentry from "@sentry/node";

export class CircuitOpenError extends Error {
  constructor(name: string) {
    super(`Circuit breaker [${name}] is OPEN — fast-failing`);
    this.name = "CircuitOpenError";
  }
}

export type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";

interface Outcome {
  success: boolean;
  at: number;
}

export interface CircuitBreakerOptions {
  /** How many failures within windowMs before opening */
  failureThreshold?: number;
  /** Rolling time window for failure tracking (ms) */
  windowMs?: number;
  /** How long to stay OPEN before moving to HALF_OPEN (ms) */
  cooldownMs?: number;
  /** Max concurrent probes allowed in HALF_OPEN state */
  halfOpenProbeQuota?: number;
}

export class CircuitBreaker {
  private state: CircuitState = "CLOSED";
  private outcomes: Outcome[] = [];
  private openedAt: number | null = null;
  private halfOpenProbeCount = 0;

  private readonly name: string;
  private readonly failureThreshold: number;
  private readonly windowMs: number;
  private readonly cooldownMs: number;
  private readonly halfOpenProbeQuota: number;

  constructor(name: string, options: CircuitBreakerOptions = {}) {
    this.name = name;
    this.failureThreshold = options.failureThreshold ?? 5;
    this.windowMs = options.windowMs ?? 60_000;
    this.cooldownMs = options.cooldownMs ?? 30_000;
    this.halfOpenProbeQuota = options.halfOpenProbeQuota ?? 1;
  }

  getState(): CircuitState {
    return this.state;
  }

  private pruneWindow(): void {
    const cutoff = Date.now() - this.windowMs;
    this.outcomes = this.outcomes.filter((o) => o.at >= cutoff);
  }

  private countRecentFailures(): number {
    this.pruneWindow();
    return this.outcomes.filter((o) => !o.success).length;
  }

  private transition(to: CircuitState): void {
    if (this.state === to) return;
    const from = this.state;
    this.state = to;
    console.log(`[circuit-breaker:${this.name}] ${from} → ${to}`);
    Sentry.addBreadcrumb({
      category: "circuit-breaker",
      message: `[${this.name}] ${from} → ${to}`,
      level: to === "OPEN" ? "error" : "info",
      data: { name: this.name, from, to },
    });
  }

  private recordOutcome(success: boolean): void {
    this.outcomes.push({ success, at: Date.now() });
  }

  /**
   * Execute `fn` through the circuit breaker.
   * Throws CircuitOpenError when the breaker is OPEN and cooldown hasn't elapsed.
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    const now = Date.now();

    if (this.state === "OPEN") {
      if (this.openedAt !== null && now - this.openedAt >= this.cooldownMs) {
        this.transition("HALF_OPEN");
        this.halfOpenProbeCount = 0;
      } else {
        throw new CircuitOpenError(this.name);
      }
    }

    if (this.state === "HALF_OPEN") {
      if (this.halfOpenProbeCount >= this.halfOpenProbeQuota) {
        throw new CircuitOpenError(this.name);
      }
      this.halfOpenProbeCount++;
    }

    try {
      const result = await fn();
      this.recordOutcome(true);

      if (this.state === "HALF_OPEN") {
        this.transition("CLOSED");
        this.outcomes = [];
      }

      return result;
    } catch (err) {
      this.recordOutcome(false);

      if (this.state === "HALF_OPEN") {
        this.transition("OPEN");
        this.openedAt = Date.now();
        this.halfOpenProbeCount = 0;
        throw err;
      }

      // In CLOSED state: check whether we should open
      const failures = this.countRecentFailures();
      if (failures >= this.failureThreshold) {
        this.transition("OPEN");
        this.openedAt = Date.now();
        console.error(
          `[circuit-breaker:${this.name}] Opened after ${failures} failures in ${this.windowMs}ms window`
        );
      }

      throw err;
    }
  }
}

/** Singleton AI circuit breaker instance */
export const aiCircuitBreaker = new CircuitBreaker("openai", {
  failureThreshold: parseInt(process.env.AI_CB_FAILURE_THRESHOLD ?? "5", 10),
  windowMs: parseInt(process.env.AI_CB_WINDOW_MS ?? "60000", 10),
  cooldownMs: parseInt(process.env.AI_CB_COOLDOWN_MS ?? "30000", 10),
  halfOpenProbeQuota: 1,
});
