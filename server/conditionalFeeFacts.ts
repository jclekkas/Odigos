/**
 * Conditional doc-fee facts the classifier already accepts.
 *
 * California's partner status, Oregon's purchaser integrator election, and
 * Pennsylvania's electronic-processing flag stay null unless the quote says
 * so or the buyer confirms it. Nothing here is guessed, and the classifier
 * itself is not reimplemented.
 */

export interface ConditionalFeeFacts {
  /** null means the dealer did not say whether it is a DMV private industry partner. */
  privateIndustryPartner: boolean | null;
  /** null means the purchaser did not elect whether an Oregon dealer uses an integrator. */
  electronicIntegrator: boolean | null;
  /** null means the quote did not say whether a Pennsylvania transaction is electronic. */
  electronicTransaction: boolean | null;
}

export interface ConditionalFeeFactInput {
  dealerText?: string | null;
  californiaDmvBusinessPartner?: boolean | null;
  oregonIntegratorElection?: boolean | null;
  pennsylvaniaElectronicProcessing?: boolean | null;
}

const CA_YES =
  /\b(?:is|are)\s+a\s+(?:dmv\s+)?(?:private[\s-]+industry|business)[\s-]+partner\b|\bprivate[\s-]+industry[\s-]+partner\s*:\s*yes\b|\bconfirmed\s+dmv\s+(?:private[\s-]+industry|business)[\s-]+partner\b/i;
const CA_NO =
  /\b(?:is|are)\s+not\s+a\s+(?:dmv\s+)?(?:private[\s-]+industry|business)[\s-]+partner\b|\bprivate[\s-]+industry[\s-]+partner\s*:\s*no\b|\bno\s+dmv\s+(?:private[\s-]+industry|business)[\s-]+partner\s+agreement\b/i;

const OR_YES =
  /\b(?:uses|using)\s+an?\s+(?:electronic\s+)?integrator\b|\bpurchaser\s+elects\s+to\s+use\s+an?\s+integrator\b|\bintegrator\s+election\s*:\s*yes\b/i;
const OR_NO =
  /\bdoes\s+not\s+use\s+an?\s+(?:electronic\s+)?integrator\b|\bpurchaser\s+elects\s+not\s+to\s+use\s+an?\s+integrator\b|\bintegrator\s+election\s*:\s*no\b/i;

const PA_YES =
  /(?<!non-)(?<!not\s)\belectronic\s+(?:transaction|processing)\b|\belectronic\s+title\s+and\s+registration\b|\belectronic\s+processing\s*:\s*yes\b/i;
const PA_NO =
  /\bnon-?electronic\s+(?:transaction|processing)\b|\bnot\s+electronic\s+(?:transaction|processing)\b|\bpaper(?:-|\s)based\s+(?:transaction|processing)\b|\belectronic\s+processing\s*:\s*no\b/i;

function flagFromText(text: string, yes: RegExp, no: RegExp): boolean | null {
  const isNo = no.test(text);
  const isYes = yes.test(text);
  if (isYes === isNo) return null;
  return isYes;
}

function buyerOrText(buyer: boolean | null | undefined, fromText: boolean | null): boolean | null {
  if (buyer === true || buyer === false) return buyer;
  return fromText;
}

export function conditionalFeeFactsFromText(dealerText: string | null | undefined): ConditionalFeeFacts {
  const text = dealerText ?? "";
  return {
    privateIndustryPartner: flagFromText(text, CA_YES, CA_NO),
    electronicIntegrator: flagFromText(text, OR_YES, OR_NO),
    electronicTransaction: flagFromText(text, PA_YES, PA_NO),
  };
}

export function resolveConditionalFeeFacts(input: ConditionalFeeFactInput): ConditionalFeeFacts {
  const fromText = conditionalFeeFactsFromText(input.dealerText);
  return {
    privateIndustryPartner: buyerOrText(input.californiaDmvBusinessPartner, fromText.privateIndustryPartner),
    electronicIntegrator: buyerOrText(input.oregonIntegratorElection, fromText.electronicIntegrator),
    electronicTransaction: buyerOrText(input.pennsylvaniaElectronicProcessing, fromText.electronicTransaction),
  };
}
