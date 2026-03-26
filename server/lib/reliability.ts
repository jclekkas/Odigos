/**
 * Shared reliability helpers for server-side retry and error classification.
 */

export interface RetriableErrorOptions {
  status?: number;
  code?: string;
  message?: string;
}

/**
 * Classifies whether an error/status is retriable.
 * Retriable: 408, 429, 5xx, network/timeout errors.
 * Non-retriable: other 4xx (bad request, validation, auth failures).
 */
export function isRetriableError(errorOrStatus: Error | number | RetriableErrorOptions): boolean {
  if (typeof errorOrStatus === "number") {
    return errorOrStatus === 408 || errorOrStatus === 429 || errorOrStatus >= 500;
  }

  if (errorOrStatus instanceof Error) {
    const msg = errorOrStatus.message.toLowerCase();
    // Network/timeout signals
    if (
      msg.includes("econnrefused") ||
      msg.includes("econnreset") ||
      msg.includes("etimedout") ||
      msg.includes("enotfound") ||
      msg.includes("network") ||
      msg.includes("timeout") ||
      msg.includes("timed out") ||
      msg.includes("socket hang up") ||
      msg.includes("fetch failed") ||
      msg.includes("failed to fetch")
    ) {
      return true;
    }
    // HTTP status embedded in message like "429: ..." or "503: ..."
    const statusMatch = msg.match(/^(\d{3}):/);
    if (statusMatch) {
      const status = parseInt(statusMatch[1], 10);
      return status === 408 || status === 429 || status >= 500;
    }
    // OpenAI SDK / axios-style errors with a numeric .status property
    if (
      typeof (errorOrStatus as { status?: unknown }).status === "number"
    ) {
      return isRetriableError((errorOrStatus as { status: number }).status);
    }
    return false;
  }

  // RetriableErrorOptions shape
  const opts = errorOrStatus as RetriableErrorOptions;
  if (typeof opts.status === "number") {
    return isRetriableError(opts.status);
  }
  if (opts.code) {
    const c = opts.code.toLowerCase();
    if (
      c === "econnrefused" ||
      c === "econnreset" ||
      c === "etimedout" ||
      c === "enotfound" ||
      c === "network_error" ||
      c === "rate_limit_exceeded"
    ) {
      return true;
    }
  }
  if (opts.message) {
    const m = opts.message.toLowerCase();
    if (m.includes("timeout") || m.includes("network")) return true;
  }
  return false;
}

export interface BackoffOptions {
  maxAttempts?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  timeoutMs?: number;
  totalBudgetMs?: number;
  onRetry?: (attempt: number, error: unknown, delayMs: number) => void;
}

/**
 * Jittered exponential backoff: delay = base * 2^(attempt-1) * (0.5 + random*0.5)
 */
export function jitteredBackoffMs(attempt: number, baseDelayMs = 200, maxDelayMs = 10000): number {
  const exp = Math.pow(2, attempt - 1);
  const raw = baseDelayMs * exp;
  const jitter = 0.5 + Math.random() * 0.5;
  return Math.min(raw * jitter, maxDelayMs);
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Wraps an async function with jittered exponential backoff retries.
 * Only retries if isRetriableError returns true for the caught error.
 * Respects per-attempt timeout and total budget.
 */
export async function withJitteredBackoff<T>(
  fn: (attempt: number) => Promise<T>,
  options: BackoffOptions = {},
): Promise<T> {
  const {
    maxAttempts = 3,
    baseDelayMs = 200,
    maxDelayMs = 10000,
    timeoutMs,
    totalBudgetMs,
    onRetry,
  } = options;

  const startTime = Date.now();
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    if (attempt > 1 && totalBudgetMs != null && Date.now() - startTime >= totalBudgetMs) {
      throw lastError ?? new Error("Total budget exceeded");
    }

    try {
      if (timeoutMs) {
        const result = await Promise.race([
          fn(attempt),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error(`Attempt ${attempt} timed out after ${timeoutMs}ms`)), timeoutMs)
          ),
        ]);
        return result;
      }
      return await fn(attempt);
    } catch (err) {
      lastError = err;

      if (attempt >= maxAttempts) break;

      if (!isRetriableError(err as Error)) {
        throw err;
      }

      const backoff = jitteredBackoffMs(attempt, baseDelayMs, maxDelayMs);

      if (onRetry) {
        onRetry(attempt, err, backoff);
      }

      if (totalBudgetMs != null && Date.now() - startTime + backoff >= totalBudgetMs) {
        break;
      }

      await delay(backoff);
    }
  }

  throw lastError;
}
