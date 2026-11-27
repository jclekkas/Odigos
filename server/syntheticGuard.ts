/**
 * Synthetic QA submissions must not be written to dealer_submissions,
 * core.listings, or the aggregate stats those tables feed.
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
