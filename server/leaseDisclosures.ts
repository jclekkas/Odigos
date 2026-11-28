/**
 * Consumer-lease disclosures.
 *
 * Statutory rows are copied from Regulation M (12 CFR Part 1013) as published
 * by the CFPB and the eCFR text fetched for this change, and from the FTC's
 * enforcement of the Consumer Leasing Act advertising triggers.
 *
 * Recommended rows are questions a buyer should ask. They are not required by
 * those fetched rules. Their source status is needs_source.
 */

export type LeaseDisclosureClass = "statutory" | "recommended";

export interface LeaseDisclosureRule {
  id: string;
  classification: LeaseDisclosureClass;
  title: string;
  /** What the fetched rule actually requires, or why this row is only a recommendation. */
  requirement: string;
  citation: string | null;
  sourceUrl: string | null;
  sourceStatus: "sourced" | "needs_source";
}

const ECFR = "https://www.ecfr.gov/current/title-12/chapter-X/part-1013";
const CFPB_1013_4 = "https://www.consumerfinance.gov/rules-policy/regulations/1013/4/";
const CFPB_1013_7 = "https://www.consumerfinance.gov/rules-policy/regulations/1013/7/";

export const LEASE_DISCLOSURE_RULES: LeaseDisclosureRule[] = [
  {
    id: "form-and-timing",
    classification: "statutory",
    title: "Clear written disclosures before consummation",
    requirement:
      "Disclosures must be clear and conspicuous, in writing, in a form the consumer may keep, and given before consummation. Segregated disclosures (12 CFR 1013.4(b) through (f), (g)(2), (h)(3), (i)(1), (j), and (m)(1)) must follow the model form.",
    citation: "12 CFR 1013.3(a), (a)(2), and (a)(3)",
    sourceUrl: ECFR,
    sourceStatus: "sourced",
  },
  {
    id: "property-description",
    classification: "statutory",
    title: "Description of the leased property",
    requirement: "A brief description sufficient to identify the property to the lessee and the lessor.",
    citation: "12 CFR 1013.4(a)",
    sourceUrl: CFPB_1013_4,
    sourceStatus: "sourced",
  },
  {
    id: "amount-due-at-signing",
    classification: "statutory",
    title: "Amount due at lease signing or delivery",
    requirement:
      "The total paid at consummation or delivery, using that term, itemized by type and amount (refundable security deposit, advance periodic payment, and capitalized cost reduction), plus how that amount will be paid (net trade-in, rebates, noncash credits, and cash).",
    citation: "12 CFR 1013.4(b)",
    sourceUrl: CFPB_1013_4,
    sourceStatus: "sourced",
  },
  {
    id: "payment-schedule",
    classification: "statutory",
    title: "Payment schedule and total of periodic payments",
    requirement: "The number, amount, and due dates or periods of scheduled payments, and the total of those periodic payments.",
    citation: "12 CFR 1013.4(c)",
    sourceUrl: CFPB_1013_4,
    sourceStatus: "sourced",
  },
  {
    id: "other-charges",
    classification: "statutory",
    title: "Other charges, including end-of-term liability",
    requirement:
      "Other charges payable to the lessor that are not in the periodic payments, itemized by type and amount. The official interpretation of 1013.4(d) includes disposition charges imposed at the scheduled end of the lease.",
    citation: "12 CFR 1013.4(d); Supplement I to Part 1013, comment 4(d)-5",
    sourceUrl: ECFR,
    sourceStatus: "sourced",
  },
  {
    id: "total-of-payments",
    classification: "statutory",
    title: "Total of payments",
    requirement:
      "The amount the lessee will have paid by the end of the lease: amount due at signing less refundable amounts, plus periodic payments less any portion paid at signing, plus other charges under 1013.4(b), (c), and (d).",
    citation: "12 CFR 1013.4(e)",
    sourceUrl: CFPB_1013_4,
    sourceStatus: "sourced",
  },
  {
    id: "payment-calculation",
    classification: "statutory",
    title: "Motor-vehicle payment calculation",
    requirement:
      "Gross capitalized cost (including the agreed-upon value and the lessee's option to receive an itemization), capitalized cost reduction, adjusted capitalized cost, residual value, depreciation and amortized amounts, rent charge, total of base periodic payments, number of payments, base periodic payment, other charges in the payment, and total periodic payment.",
    citation: "12 CFR 1013.4(f)(1)–(11)",
    sourceUrl: CFPB_1013_4,
    sourceStatus: "sourced",
  },
  {
    id: "early-termination",
    classification: "statutory",
    title: "Early termination",
    requirement:
      "When the lease may be ended early, how the charge is determined, and the motor-vehicle early-termination notice.",
    citation: "12 CFR 1013.4(g)",
    sourceUrl: CFPB_1013_4,
    sourceStatus: "sourced",
  },
  {
    id: "maintenance-and-mileage",
    classification: "statutory",
    title: "Maintenance, wear, and excess mileage",
    requirement:
      "Who maintains the vehicle, the wear-and-use standard, the excessive-wear notice, and the amount or method for any excess-mileage charge.",
    citation: "12 CFR 1013.4(h)",
    sourceUrl: CFPB_1013_4,
    sourceStatus: "sourced",
  },
  {
    id: "purchase-option",
    classification: "statutory",
    title: "Purchase option",
    requirement: "Whether the lessee may buy the vehicle and, if so, the price or the method for determining it.",
    citation: "12 CFR 1013.4(i)",
    sourceUrl: CFPB_1013_4,
    sourceStatus: "sourced",
  },
  {
    id: "fees-and-taxes",
    classification: "statutory",
    title: "Official fees and taxes",
    requirement: "The total dollar amount of official and license fees, registration, title, and taxes required in connection with the lease.",
    citation: "12 CFR 1013.4(n)",
    sourceUrl: CFPB_1013_4,
    sourceStatus: "sourced",
  },
  {
    id: "rate-limitation-notice",
    classification: "statutory",
    title: "Limitation on a stated percentage rate",
    requirement:
      "If a percentage rate is stated, it must be accompanied by: “this percentage may not measure the overall cost of financing this lease.” The lessor may not call it an annual percentage rate or an annual lease rate. A money factor by itself is not this percentage-rate disclosure.",
    citation: "12 CFR 1013.4(s) and 12 CFR 1013.7(b)(2)",
    sourceUrl: CFPB_1013_7,
    sourceStatus: "sourced",
  },
  {
    id: "advertising-triggers",
    classification: "statutory",
    title: "Advertising triggers",
    requirement:
      "An advertisement that states a payment, or states a capitalized-cost reduction or other amount due at signing (including that none is due), must also state that it is a lease, the total due at signing or delivery, the number, amounts, and timing of payments, whether a security deposit is required, and that an extra charge may be imposed at the end where liability is based on residual versus realized value. The CFPB interpretation of 1013.7(b)(1) says the advertisement itself need not itemize the amount due at signing. The FTC Courtesy Auto complaint describes the same Consumer Leasing Act triggers under 15 U.S.C. § 1667c. That complaint cites former 12 CFR 213.7; the current rule is 12 CFR 1013.7.",
    citation: "12 CFR 1013.7(d); 15 U.S.C. § 1667c",
    sourceUrl: CFPB_1013_7,
    sourceStatus: "sourced",
  },
  {
    id: "buy-rate-money-factor",
    classification: "recommended",
    title: "Captive buy-rate money factor",
    requirement:
      "Ask the lessor for the buy-rate money factor and any dealer participation. Regulation M does not require that buy rate to be disclosed. A stored buyer benchmark is not a substitute.",
    citation: null,
    sourceUrl: null,
    sourceStatus: "needs_source",
  },
  {
    id: "msd-reduction-schedule",
    classification: "recommended",
    title: "Multiple-security-deposit money-factor reduction",
    requirement:
      "Ask whether refundable security deposits reduce the money factor and by how much. No reduction is applied unless the quote states the amount. A per-deposit reduction is not assumed.",
    citation: null,
    sourceUrl: null,
    sourceStatus: "needs_source",
  },
  {
    id: "state-tax-method",
    classification: "recommended",
    title: "How this state taxes a lease",
    requirement:
      "Ask whether tax is added to each payment, collected upfront on the total of payments, or charged on the capitalized cost. 12 CFR 1013.4(n) requires the tax dollars, not the state's computation method. The method is needs_source until an official state source is fetched.",
    citation: "12 CFR 1013.4(n) requires the dollar amount only",
    sourceUrl: CFPB_1013_4,
    sourceStatus: "needs_source",
  },
  {
    id: "effective-monthly-cost",
    classification: "recommended",
    title: "Effective monthly cost",
    requirement:
      "Spread the non-refundable amount due at signing across the term and compare it with the advertised payment. This is an analytical comparison. It is not a Regulation M disclosure line. The statutory figures are the payment schedule, the amount due at signing, and the total of payments.",
    citation: null,
    sourceUrl: null,
    sourceStatus: "needs_source",
  },
];

export function statutoryLeaseDisclosures(): LeaseDisclosureRule[] {
  return LEASE_DISCLOSURE_RULES.filter((rule) => rule.classification === "statutory");
}

export function recommendedLeaseDisclosures(): LeaseDisclosureRule[] {
  return LEASE_DISCLOSURE_RULES.filter((rule) => rule.classification === "recommended");
}

export interface LeaseDisclosureCoverage {
  id: string;
  classification: LeaseDisclosureClass;
  title: string;
  present: boolean;
  citation: string | null;
  sourceStatus: "sourced" | "needs_source";
  dealerQuestion: string;
}

export interface LeaseDisclosureInput {
  vehicleNamed: boolean;
  dueAtSigning: number | null;
  dueAtSigningItemized: boolean;
  termMonths: number | null;
  monthlyPayment: number | null;
  grossCapCost: number | null;
  adjustedCapCost: number | null;
  residualKnown: boolean;
  moneyFactor: number | null;
  dispositionFee: number | null;
  excessMileageRate: number | null;
  mileageAllowance: number | null;
  securityDepositStated: boolean;
  saysLease: boolean;
  percentageRateStated: boolean;
  rateLimitationNotice: boolean;
}

function question(title: string, ask: string): string {
  return `Ask the dealer: "${ask}" (${title}).`;
}

/**
 * Which fetched disclosure duties this quote already satisfies.
 * A missing statutory row is a question, not a finding that the dealer broke the rule.
 * A pasted worksheet is not the signed lease.
 */
export function coverLeaseDisclosures(input: LeaseDisclosureInput): LeaseDisclosureCoverage[] {
  const present: Record<string, boolean> = {
    "form-and-timing": false,
    "property-description": input.vehicleNamed,
    "amount-due-at-signing": input.dueAtSigning != null && input.dueAtSigningItemized,
    "payment-schedule": input.termMonths != null && input.monthlyPayment != null,
    "other-charges": input.dispositionFee != null,
    "total-of-payments": false,
    "payment-calculation":
      input.grossCapCost != null && input.adjustedCapCost != null && input.residualKnown && input.moneyFactor != null && input.termMonths != null,
    "early-termination": false,
    "maintenance-and-mileage": input.excessMileageRate != null || input.mileageAllowance != null,
    "purchase-option": false,
    "fees-and-taxes": false,
    "rate-limitation-notice": !input.percentageRateStated || input.rateLimitationNotice,
    "advertising-triggers":
      input.monthlyPayment == null ||
      (input.saysLease && input.dueAtSigning != null && input.termMonths != null && input.securityDepositStated),
    "buy-rate-money-factor": false,
    "msd-reduction-schedule": false,
    "state-tax-method": false,
    "effective-monthly-cost": false,
  };

  return LEASE_DISCLOSURE_RULES.map((rule) => ({
    id: rule.id,
    classification: rule.classification,
    title: rule.title,
    present: present[rule.id] === true,
    citation: rule.citation,
    sourceStatus: rule.sourceStatus,
    dealerQuestion: question(rule.title, rule.requirement),
  }));
}
