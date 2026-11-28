/**
 * Synthetic QA submissions must not be written to dealer_submissions,
 * core.listings, analytics, audit_log (except security events), or the
 * file/URL processing stream.
 *
 * The seal is created at request entry. `locked` means later stages and
 * model output cannot flip it. Upload routes may still confirm the marker
 * inside the uploaded bytes before the seal is locked, because that text
 * is the submission itself, not model output.
 *
 * Security exceptions that still persist are listed in
 * `SECURITY_AUDIT_EVENTS` and `SECURITY_TELEMETRY_EVENTS`
 * (rate-limit / abuse). See docs/SYNTHETIC_QA.md.
 */
import { AsyncLocalStorage } from "node:async_hooks";
import { isSyntheticSubmission } from "../shared/syntheticSubmission.js";

export {
  isSyntheticSubmission,
  shouldEmitSubmissionAnalytics,
  isSyntheticTrackingPayload,
  isSecurityAuditEvent,
  isSecurityTelemetryEvent,
  SECURITY_AUDIT_EVENTS,
  SECURITY_TELEMETRY_EVENTS,
  SYNTHETIC_QA_MARKER,
} from "../shared/syntheticSubmission.js";

interface SyntheticSeal {
  synthetic: boolean;
  /** Once locked, the flag cannot change for this request. */
  locked: boolean;
}

const seals = new AsyncLocalStorage<SyntheticSeal>();

export function isSealedSynthetic(): boolean {
  return seals.getStore()?.synthetic === true;
}

export function syntheticSealLocked(): boolean {
  return seals.getStore()?.locked === true;
}

/**
 * Run `fn` with a seal taken from the request body. Used by the HTTP
 * middleware so every later `trackEvent` on this request sees the same flag.
 * The seal starts unlocked so an upload can still notice the marker in the
 * file before anything is saved.
 */
export function enterRequestSeal<T>(synthetic: boolean, fn: () => T): T {
  return seals.run({ synthetic, locked: false }, fn);
}

/**
 * Lock the analysis flag from the submission that arrived. If this request
 * already has a seal, that seal is updated once and then frozen. Model output
 * cannot call this again and change the result.
 */
export function withLockedSyntheticAnalysis<T>(
  input: {
    synthetic?: boolean | string | null;
    dealerText?: string | null;
    competingQuoteText?: string | null;
  },
  fn: () => T,
): T {
  const synthetic = isSyntheticSubmission(input);
  const existing = seals.getStore();
  if (existing) {
    if (!existing.locked) {
      // A request that already arrived as synthetic stays synthetic.
      // A retry, timeout, or model edit cannot clear the flag.
      if (synthetic) existing.synthetic = true;
      existing.locked = true;
      freezeSeal(existing);
    }
    freezeSyntheticProperty(input, existing.synthetic);
    return fn();
  }
  const created: SyntheticSeal = { synthetic, locked: true };
  freezeSeal(created);
  freezeSyntheticProperty(input, synthetic);
  return seals.run(created, fn);
}

/**
 * An uploaded file or fetched page is part of the submission. Noting the
 * marker here is still request entry. After the seal is locked this is a no-op,
 * so model text cannot flip the flag.
 */
export function noteUploadedSynthetic(input: {
  synthetic?: boolean | string | null;
  dealerText?: string | null;
  competingQuoteText?: string | null;
}): void {
  const seal = seals.getStore();
  if (!seal || seal.locked) return;
  if (isSyntheticSubmission(input)) seal.synthetic = true;
}

export function lockSyntheticSeal(): void {
  const seal = seals.getStore();
  if (seal) seal.locked = true;
}

/** JSON body seen by middleware, before a route has read a file. */
export function requestBodyIsSynthetic(body: unknown): boolean {
  if (!body || typeof body !== "object") return false;
  const rec = body as Record<string, unknown>;
  const dealerText = typeof rec.dealerText === "string"
    ? rec.dealerText
    : typeof rec.text === "string"
      ? rec.text
      : "";
  const competingQuoteText = typeof rec.competingQuoteText === "string" ? rec.competingQuoteText : "";
  return isSyntheticSubmission({
    synthetic: rec.synthetic === true || rec.synthetic === "true" ? true : null,
    dealerText,
    competingQuoteText,
  });
}

function freezeSyntheticProperty(input: object, synthetic: boolean): void {
  try {
    Object.defineProperty(input, "synthetic", {
      value: synthetic,
      writable: false,
      enumerable: true,
      configurable: false,
    });
  } catch {
    // Already sealed on this object.
  }
}

function freezeSeal(seal: SyntheticSeal): void {
  Object.defineProperty(seal, "synthetic", {
    value: seal.synthetic,
    writable: false,
    enumerable: true,
    configurable: false,
  });
  Object.defineProperty(seal, "locked", {
    value: true,
    writable: false,
    enumerable: true,
    configurable: false,
  });
}

/**
 * Sentry and other external error reporters call this before sending.
 * A synthetic submission produces no external event. Rate-limit rows are
 * written through the audit and metrics paths, not through this filter.
 */
export function syntheticSentryEvent<T>(event: T): T | null {
  if (isSealedSynthetic()) return null;
  return event;
}
