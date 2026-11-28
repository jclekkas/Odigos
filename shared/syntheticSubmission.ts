/**
 * Synthetic QA submissions.
 *
 * A submission is synthetic when the request says `synthetic: true` or the
 * dealer text (or a competing quote) contains the marker `ODIGOS_SYNTHETIC_QA`.
 * That decision is made once, at request entry, and then locked. Later stages
 * and model output cannot turn a synthetic run into a real one, or a real
 * run into a synthetic one.
 *
 * Synthetic submissions are not stored and do not emit analytics. That covers
 * the warehouse, dealer_submissions, the main analysis events, and the
 * ancillary streams around a submission:
 * - audit_log rows for the analysis itself
 * - file and URL processing events
 * - API request / API error metrics for that request
 * - model-call metrics
 * - client product analytics and first-party tracking for that submission
 *
 * Security logs are the exception. They still record abuse even when the
 * caller is a synthetic probe:
 * - audit event `rate_limit_breach` (rate limiting)
 * - metrics event `rate_limit_breach`, if one is emitted
 *
 * Those rows do not store the quote text. See docs/SYNTHETIC_QA.md.
 */

export const SYNTHETIC_QA_MARKER = "ODIGOS_SYNTHETIC_QA";

/** Audit events that stay on for synthetic traffic. */
export const SECURITY_AUDIT_EVENTS = ["rate_limit_breach"] as const;

/** Metrics events that stay on for synthetic traffic. */
export const SECURITY_TELEMETRY_EVENTS = ["rate_limit_breach"] as const;

export type SecurityAuditEvent = (typeof SECURITY_AUDIT_EVENTS)[number];

export function isSecurityAuditEvent(eventType: string): boolean {
  return (SECURITY_AUDIT_EVENTS as readonly string[]).includes(eventType);
}

export function isSecurityTelemetryEvent(eventType: string): boolean {
  return (SECURITY_TELEMETRY_EVENTS as readonly string[]).includes(eventType);
}

function flagIsOn(value: unknown): boolean {
  return value === true || value === "true";
}

export function isSyntheticSubmission(input: {
  synthetic?: boolean | string | null;
  dealerText?: string | null;
  competingQuoteText?: string | null;
}): boolean {
  if (flagIsOn(input.synthetic)) return true;
  const text = `${input.dealerText ?? ""}\n${input.competingQuoteText ?? ""}`;
  return text.includes(SYNTHETIC_QA_MARKER);
}

export function shouldEmitSubmissionAnalytics(input: {
  synthetic?: boolean | string | null;
  dealerText?: string | null;
  competingQuoteText?: string | null;
}): boolean {
  return !isSyntheticSubmission(input);
}

export interface FrozenSyntheticSubmission {
  readonly synthetic: boolean;
  readonly dealerText: string;
  readonly competingQuoteText: string;
}

/**
 * The synthetic decision for one submission. Later callbacks receive this
 * object and cannot flip the flag or replace the quote text it was made from.
 */
export function freezeSyntheticSubmission(input: {
  synthetic?: boolean | string | null;
  dealerText?: string | null;
  competingQuoteText?: string | null;
}): FrozenSyntheticSubmission {
  return Object.freeze({
    synthetic: isSyntheticSubmission(input),
    dealerText: input.dealerText ?? "",
    competingQuoteText: input.competingQuoteText ?? "",
  });
}

export function isSyntheticTrackingPayload(body: {
  metadata?: Record<string, unknown> | null;
  synthetic?: boolean | string | null;
  dealerText?: string | null;
  competingQuoteText?: string | null;
} | null | undefined): boolean {
  if (!body) return false;
  if (isSyntheticSubmission(body)) return true;
  const metadata = body.metadata ?? {};
  const dealerText = typeof metadata.dealerText === "string" ? metadata.dealerText : "";
  const competingQuoteText = typeof metadata.competingQuoteText === "string" ? metadata.competingQuoteText : "";
  const text = typeof metadata.text === "string" ? metadata.text : "";
  return isSyntheticSubmission({
    synthetic: metadata.synthetic === true || metadata.synthetic === "true" ? true : null,
    dealerText: `${dealerText}\n${text}`,
    competingQuoteText,
  });
}
