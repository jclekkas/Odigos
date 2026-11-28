/**
 * Headline ranking for one quote.
 *
 * Lower rank wins the verdict label. Every material finding is still written
 * into the summary and the dealer reply. Mileage and unverified market value
 * are real gaps, and they lose the headline when a sharper VIN, financial, or
 * regulatory finding is present.
 *
 * Specific statutory problems (an illegal doc fee, an unresolved electronic
 * filing charge) outrank market value. A dealership state that was never
 * named is reported with the market-value gap and becomes the headline only
 * when market value is already verified.
 */
export const FINDING_RANK = {
  illegalDocFee: 10,
  declinedAddOn: 20,
  /** The disclosed amount financed, the computed principal, and the stated payment do not reconcile. */
  financingMismatch: 25,
  amountFinancedMismatch: 30,
  rebateExplainsOtd: 35,
  otdMismatch: 40,
  paymentMismatch: 50,
  leaseCapContradiction: 61,
  leaseResidual: 63,
  leaseRateMarkup: 64,
  leasePayment: 66,
  leaseConditionalIncentive: 67,
  leaseAdvertisedPayment: 69,
  leaseMissingTerms: 72,
  stackedRedFlags: 80,
  marketAdjustment: 82,
  tooManyAddOns: 84,
  docFeeCapUnverified: 100,
  singleAddOn: 110,
  factoryMsrpMarkup: 120,
  priceAboveBenchmark: 130,
  ambiguousFeeNames: 139,
  conditionalDocFee: 140,
  unresolvedFiling: 145,
  conditionalRebate: 150,
  negativeEquity: 160,
  competingOffers: 170,
  interstate: 180,
  conflictingVins: 190,
  badCheckDigit: 192,
  vinMismatch: 194,
  vagueFees: 200,
  paymentOnly: 210,
  missingFinancingTerms: 222,
  vinNotConfirmed: 224,
  missingMileage: 236,
  missingOtd: 238,
  buyerComps: 260,
  reconciliationIncomplete: 310,
  priceNotInsideValuation: 320,
  /** A stated out-the-door total that the itemized lines do not explain. */
  incompleteOtdBreakdown: 390,
  leaseMarketUnverified: 398,
  marketUnverified: 400,
  regulatoryUnknown: 410,
  /**
   * Missing year/make/model is reported in the summary. It becomes the
   * headline only when market value is already verified. An unverified
   * market value stays the headline so a quote that never named the car
   * is not rewritten around an empty identity field.
   */
  vehicleNotIdentified: 420,
  financingPaymentUnstated: 450,
} as const;

export type FindingRank = (typeof FINDING_RANK)[keyof typeof FINDING_RANK];

/** Collapse repeated punctuation and extra spaces in buyer-facing sentences. */
export function normalizeGeneratedPunctuation(text: string): string {
  const lines = text.split("\n").map((line) =>
    line
      .replace(/[ \t]{2,}/g, " ")
      .replace(/[ \t]+([,.;:!?])/g, "$1")
      .replace(/([.!?])\1+/g, "$1")
      .trim(),
  );
  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

/** Drop a repeated sentence so stacked findings do not say the same thing twice. */
export function dedupeSentences(text: string): string {
  const seen = new Set<string>();
  const kept: string[] = [];
  for (const part of text.split(/(?<=[.!?])\s+/)) {
    const sentence = part.trim();
    const key = sentence.toLowerCase();
    if (!sentence || seen.has(key)) continue;
    seen.add(key);
    kept.push(sentence);
  }
  return kept.join(" ");
}
