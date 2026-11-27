/**
 * QA submissions marked synthetic or containing ODIGOS_SYNTHETIC_QA
 * are not stored and do not emit analytics, telemetry, or warehouse events.
 */

export function isSyntheticSubmission(input: {
  synthetic?: boolean | null;
  dealerText?: string | null;
  competingQuoteText?: string | null;
}): boolean {
  if (input.synthetic === true) return true;
  const text = `${input.dealerText ?? ""}\n${input.competingQuoteText ?? ""}`;
  return text.includes("ODIGOS_SYNTHETIC_QA");
}

export function shouldEmitSubmissionAnalytics(input: {
  synthetic?: boolean | null;
  dealerText?: string | null;
  competingQuoteText?: string | null;
}): boolean {
  return !isSyntheticSubmission(input);
}

export function isSyntheticTrackingPayload(body: {
  metadata?: Record<string, unknown> | null;
} | null | undefined): boolean {
  const metadata = body?.metadata ?? {};
  const synthetic = metadata.synthetic === true;
  const dealerText = typeof metadata.dealerText === "string" ? metadata.dealerText : "";
  const competingQuoteText = typeof metadata.competingQuoteText === "string" ? metadata.competingQuoteText : "";
  const text = typeof metadata.text === "string" ? metadata.text : "";
  return isSyntheticSubmission({
    synthetic,
    dealerText: `${dealerText}\n${text}`,
    competingQuoteText,
  });
}
