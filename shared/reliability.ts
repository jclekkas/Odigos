/**
 * Shared reliability helpers usable in both browser and server contexts.
 * Server-only retry orchestration is in server/lib/reliability.ts.
 */

/**
 * Returns true if the error represents a transient/retriable failure.
 * Retriable: 408, 429, 5xx, network/timeout errors.
 * Non-retriable: other 4xx (client validation/auth errors).
 */
export function isClientRetriableError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  const msg = error.message;

  // HTTP status embedded in message, e.g. "429: Too Many Requests"
  const statusMatch = msg.match(/^(\d{3}):/);
  if (statusMatch) {
    const status = parseInt(statusMatch[1], 10);
    return status === 408 || status === 429 || status >= 500;
  }

  // Network / fetch failure patterns
  const lower = msg.toLowerCase();
  return (
    lower.includes("network") ||
    lower.includes("timeout") ||
    lower.includes("timed out") ||
    lower.includes("failed to fetch") ||
    lower.includes("load failed") ||
    lower.includes("fetch failed")
  );
}

/**
 * Jittered exponential backoff delay (ms).
 * delay = min(base * 2^attemptIndex * jitter(0.5..1), maxMs)
 */
export function clientBackoffMs(
  attemptIndex: number,
  baseMs = 300,
  maxMs = 5000,
): number {
  const exp = baseMs * Math.pow(2, attemptIndex);
  const jitter = 0.5 + Math.random() * 0.5;
  return Math.min(exp * jitter, maxMs);
}
