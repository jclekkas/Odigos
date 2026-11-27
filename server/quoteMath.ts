/**
 * Deterministic purchase worksheet.
 *
 * The analyzer used to trust whatever out-the-door total and monthly payment
 * the model extracted. This module recomputes both from the parts.
 *
 * Formula, matching the published guide at /calculate-out-the-door-price:
 *
 *   taxable price = vehicle price
 *                   − rebates
 *                   − trade-in allowance, only when the state gives a trade-in tax credit
 *   sales tax     = round(taxable price × state rate) to the cent, never below zero
 *   out the door  = vehicle price − rebates − trade-in allowance
 *                   + sales tax + title + registration + doc fee + dealer add-ons
 *
 * The old loan payoff is not part of the out-the-door price. It is added to
 * the amount financed. If the payoff is larger than the trade-in allowance,
 * that difference is negative equity.
 *
 *   amount financed = out the door + payoff − down payment
 *
 * Monthly payment is the standard fully amortizing loan payment, rounded to
 * the cent (half up). At 0% APR it is principal ÷ term.
 *
 * Assumptions, not re-verified statutes:
 * - Doc fees and add-ons are not included in the taxable price. The public
 *   example on the OTD page taxes the vehicle price only.
 * - Title and registration are not taxed.
 * - Rebates reduce the taxable price.
 * - The trade-in tax credit uses the allowance (what the dealer gave for the
 *   car), not the equity after payoff.
 * - stateSalesTaxRate is the state base rate from data/state_fees.json. Local
 *   add-ons are not applied. Oregon's separate vehicle privilege tax is not
 *   modeled; the file's rate for Oregon is 0.
 */

export interface PurchaseInputs {
  vehiclePrice: number | null;
  rebates?: number | null;
  tradeInAllowance?: number | null;
  tradePayoff?: number | null;
  docFee?: number | null;
  addOns?: number | null;
  titleFee?: number | null;
  registrationFee?: number | null;
  /**
   * A combined government line (title & registration, DMV, license) that is
   * not already split into titleFee and registrationFee.
   */
  govFees?: number | null;
  /** Decimal. 0.0725 means 7.25%. Ignored when salesTaxAmount is set. */
  salesTaxRate?: number | null;
  /** Tax already printed on the quote. Used to add the dealer's own lines. */
  salesTaxAmount?: number | null;
  tradeInTaxCredit?: boolean | null;
  downPayment?: number | null;
  /** Percent. 4.9 means 4.9% APR. */
  apr?: number | null;
  termMonths?: number | null;
  statedOutTheDoor?: number | null;
  statedMonthlyPayment?: number | null;
  /** When true on a cash purchase, rebates are not subtracted from the price. */
  rebateContingentOnFinancing?: boolean | null;
  cashPurchase?: boolean | null;
}

export interface PurchaseMath {
  ok: boolean;
  reason?: string;
  taxablePrice: number | null;
  salesTax: number | null;
  outTheDoor: number | null;
  negativeEquity: number | null;
  amountFinanced: number | null;
  monthlyPayment: number | null;
  outTheDoorMismatch: number | null;
  paymentMismatch: number | null;
  tradeEquity: number | null;
  governmentCharges: number | null;
  dealerImposedCharges: number | null;
  totalOfPayments: number | null;
  financeCharge: number | null;
  conditionalRebateExcluded: number | null;
  derivation: string[];
}

export function roundCents(amount: number): number {
  if (!Number.isFinite(amount)) return Number.NaN;
  const sign = amount < 0 ? -1 : 1;
  const cents = Math.round(Math.abs(amount) * 100 + 1e-8);
  return (sign * cents) / 100;
}

/** Standard amortization. Returns null when the inputs cannot form a loan. */
export function amortizingPayment(
  principal: number,
  aprPercent: number,
  termMonths: number,
): number | null {
  if (!Number.isFinite(principal) || !Number.isFinite(aprPercent) || !Number.isFinite(termMonths)) {
    return null;
  }
  if (principal < 0 || aprPercent < 0 || termMonths <= 0 || !Number.isInteger(termMonths)) {
    return null;
  }
  if (principal === 0) return 0;
  if (aprPercent === 0) return roundCents(principal / termMonths);
  const monthlyRate = aprPercent / 100 / 12;
  const growth = Math.pow(1 + monthlyRate, termMonths);
  return roundCents((principal * monthlyRate * growth) / (growth - 1));
}

function moneyLine(label: string, amount: number): string {
  const sign = amount < 0 ? "-" : "";
  return `${label} ${sign}$${Math.abs(amount).toFixed(2)}`;
}

function money(value: number | null | undefined, label: string): number | { error: string } {
  if (value == null) return 0;
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return { error: `${label} is not a usable number` };
  }
  if (value < 0) return { error: `${label} cannot be negative` };
  return value;
}

export function computePurchase(input: PurchaseInputs): PurchaseMath {
  const blank: PurchaseMath = {
    ok: false,
    taxablePrice: null,
    salesTax: null,
    outTheDoor: null,
    negativeEquity: null,
    amountFinanced: null,
    monthlyPayment: null,
    outTheDoorMismatch: null,
    paymentMismatch: null,
    tradeEquity: null,
    governmentCharges: null,
    dealerImposedCharges: null,
    totalOfPayments: null,
    financeCharge: null,
    conditionalRebateExcluded: null,
    derivation: [],
  };

  if (input.vehiclePrice == null || !Number.isFinite(input.vehiclePrice)) {
    return { ...blank, reason: "vehicle price is missing" };
  }
  if (input.vehiclePrice < 0) {
    return { ...blank, reason: "vehicle price cannot be negative" };
  }

  const parts = {
    rebates: money(input.rebates, "rebates"),
    tradeInAllowance: money(input.tradeInAllowance, "trade-in allowance"),
    tradePayoff: money(input.tradePayoff, "trade payoff"),
    docFee: money(input.docFee, "doc fee"),
    addOns: money(input.addOns, "add-ons"),
    titleFee: money(input.titleFee, "title fee"),
    registrationFee: money(input.registrationFee, "registration"),
    govFees: money(input.govFees, "government fees"),
    downPayment: money(input.downPayment, "down payment"),
  };
  for (const part of Object.values(parts)) {
    if (typeof part === "object") return { ...blank, reason: part.error };
  }
  const rebates = parts.rebates as number;
  const tradeInAllowance = parts.tradeInAllowance as number;
  const tradePayoff = parts.tradePayoff as number;
  const docFee = parts.docFee as number;
  const addOns = parts.addOns as number;
  const titleFee = parts.titleFee as number;
  const registrationFee = parts.registrationFee as number;
  const govFees = parts.govFees as number;
  const downPayment = parts.downPayment as number;

  const rate = input.salesTaxRate ?? 0;
  if (!Number.isFinite(rate) || rate < 0) {
    return { ...blank, reason: "sales tax rate cannot be negative" };
  }
  if (input.salesTaxAmount != null && (!Number.isFinite(input.salesTaxAmount) || input.salesTaxAmount < 0)) {
    return { ...blank, reason: "sales tax cannot be negative" };
  }

  const excludeRebate = input.rebateContingentOnFinancing === true && input.cashPurchase === true && rebates > 0;
  const appliedRebates = excludeRebate ? 0 : rebates;
  const conditionalRebateExcluded = excludeRebate ? rebates : null;
  const credit = input.tradeInTaxCredit === true ? tradeInAllowance : 0;
  const taxablePrice = roundCents(input.vehiclePrice - appliedRebates - credit);
  const salesTax = input.salesTaxAmount != null
    ? roundCents(input.salesTaxAmount)
    : roundCents(Math.max(0, taxablePrice) * rate);
  const netVehicle = roundCents(input.vehiclePrice - appliedRebates - tradeInAllowance);
  const governmentCharges = roundCents(salesTax + titleFee + registrationFee + govFees);
  const dealerImposedCharges = roundCents(docFee + addOns);
  const outTheDoor = roundCents(netVehicle + salesTax + titleFee + registrationFee + govFees + docFee + addOns);
  const tradeEquity = roundCents(tradeInAllowance - tradePayoff);
  const negativeEquity = roundCents(Math.max(0, tradePayoff - tradeInAllowance));
  const amountFinanced = roundCents(outTheDoor + tradePayoff - downPayment);

  let monthlyPayment: number | null = null;
  if (input.apr != null || input.termMonths != null) {
    if (input.apr == null || input.termMonths == null) {
      return { ...blank, reason: "APR and term are both required to compute a payment" };
    }
    monthlyPayment = amortizingPayment(Math.max(0, amountFinanced), input.apr, input.termMonths);
    if (monthlyPayment == null) {
      return { ...blank, reason: "APR or term cannot produce a payment" };
    }
  }

  const outTheDoorMismatch =
    input.statedOutTheDoor == null || !Number.isFinite(input.statedOutTheDoor)
      ? null
      : roundCents(input.statedOutTheDoor - outTheDoor);
  const paymentMismatch =
    input.statedMonthlyPayment == null || monthlyPayment == null || !Number.isFinite(input.statedMonthlyPayment)
      ? null
      : roundCents(input.statedMonthlyPayment - monthlyPayment);

  const totalOfPayments =
    monthlyPayment != null && input.termMonths != null
      ? roundCents(monthlyPayment * input.termMonths)
      : null;
  const financeCharge =
    totalOfPayments != null ? roundCents(totalOfPayments - Math.max(0, amountFinanced)) : null;

  const derivation = [
    moneyLine("Vehicle price", input.vehiclePrice),
    appliedRebates > 0 ? moneyLine("Rebates subtracted", appliedRebates) : null,
    conditionalRebateExcluded != null
      ? `Financing-contingent rebate of $${conditionalRebateExcluded.toFixed(2)} was not applied to this cash quote.`
      : null,
    tradeInAllowance > 0 ? moneyLine("Trade-in allowance", tradeInAllowance) : null,
    tradePayoff > 0 ? moneyLine("Trade payoff", tradePayoff) : null,
    moneyLine("Trade equity", tradeEquity),
    moneyLine("Sales tax (government, as stated or computed)", salesTax),
    moneyLine("Title (government)", titleFee),
    moneyLine("Registration (government)", registrationFee),
    govFees > 0 ? moneyLine("Other government fees", govFees) : null,
    moneyLine("Government charges", governmentCharges),
    moneyLine("Doc fee (dealer)", docFee),
    moneyLine("Dealer add-ons", addOns),
    moneyLine("Dealer-imposed charges", dealerImposedCharges),
    moneyLine("Computed out-the-door", outTheDoor),
    input.statedOutTheDoor != null ? moneyLine("Stated out-the-door", input.statedOutTheDoor) : null,
    outTheDoorMismatch != null ? moneyLine("Out-the-door difference (stated minus computed)", outTheDoorMismatch) : null,
    amountFinanced != null ? moneyLine("Amount financed", amountFinanced) : null,
    monthlyPayment != null ? moneyLine("Computed monthly payment", monthlyPayment) : null,
    paymentMismatch != null ? moneyLine("Payment difference (stated minus computed)", paymentMismatch) : null,
    totalOfPayments != null ? moneyLine("Total of payments", totalOfPayments) : null,
    financeCharge != null ? moneyLine("Finance charge", financeCharge) : null,
    negativeEquity > 0 ? moneyLine("Negative equity", negativeEquity) : null,
  ].filter((line): line is string => line != null);

  return {
    ok: true,
    taxablePrice,
    salesTax,
    outTheDoor,
    negativeEquity,
    amountFinanced,
    monthlyPayment,
    outTheDoorMismatch,
    paymentMismatch,
    tradeEquity,
    governmentCharges,
    dealerImposedCharges,
    totalOfPayments,
    financeCharge,
    conditionalRebateExcluded,
    derivation,
  };
}

const PAYOFF_NAME = /\b(payoff|negative equity)\b/i;

export type GovernmentBucket = "tax" | "title" | "registration" | "gov";

/**
 * Which worksheet bucket a fee name belongs in.
 * Combined title/registration, DMV, and generic government lines are "gov"
 * so they are added once and not treated as dealer add-ons.
 * Returns null for dealer charges the caller may still treat as a doc fee.
 */
export function classifyFeeBucket(name: string): GovernmentBucket | "payoff" | null {
  const n = name.toLowerCase();
  if (PAYOFF_NAME.test(n)) return "payoff";
  if (isCombinedGovernmentName(n)) return "gov";
  if (isTaxFeeName(n)) return "tax";
  if (/\btitle\b/.test(n) && !/\btitle\s+loan\b/.test(n)) return "title";
  if (isRegistrationFeeName(n)) return "registration";
  return null;
}

function isCombinedGovernmentName(n: string): boolean {
  if (/\btitle\s*(?:&|and|\/)\s*(?:reg(?:istration)?|license)\b/.test(n)) return true;
  if (/\b(?:reg(?:istration)?|license)\s*(?:&|and|\/)\s*title\b/.test(n)) return true;
  if (/\btitle\s*\/\s*license\s*\/\s*reg/.test(n)) return true;
  if (/\blicense\s*\/\s*(?:registration|reg)\b/.test(n)) return true;
  if (/\b(?:registration|reg)\s*\/\s*license\b/.test(n)) return true;
  if (/\b(?:tag|plate)s?\s*(?:&|and|\/)\s*title\b/.test(n)) return true;
  if (/\bdmv\s+fees?\b/.test(n) || /\bdmv\s+charges?\b/.test(n)) return true;
  if (/\bgovernment\s+fees?\b/.test(n) || /\bgov\.?\s+fees?\b/.test(n)) return true;
  if (/\btax(?:es)?\b/.test(n) && /\b(title|registration|license)\b/.test(n)) return true;
  return false;
}

function isTaxFeeName(n: string): boolean {
  if (/\btax\s+credit\b/.test(n) || /\bpre-?tax\b/.test(n) || /\btaxable\b/.test(n)) return false;
  if (/\btax\s+rate\b/.test(n)) return false;
  return /\b(?:sales\s+tax|use\s+tax|excise\s+tax|state\s+tax|county\s+tax|city\s+tax|local\s+tax|district\s+tax|vehicle\s+tax|property\s+tax|tax(?:es)?)\b/.test(n);
}

function isRegistrationFeeName(n: string): boolean {
  if (/frame|bracket|cover|holder|surround/.test(n)) return false;
  if (/driver'?s?\s+license/.test(n)) return false;
  return /\b(?:registration|license\s+fees?|licensing\s+fees?|license\s+plates?|tag\s+fees?|plate\s+fees?|plates)\b/.test(n)
    || /\breg\b/.test(n);
}

export interface ExtractedMoney {
  docFee: number;
  addOns: number;
  titleFee: number;
  registrationFee: number;
  /** Combined title/registration, DMV, or other government lines. */
  govFees: number;
  statedTax: number | null;
  tradePayoff: number;
  sawTax: boolean;
  sawTitle: boolean;
  sawRegistration: boolean;
  sawGov: boolean;
}

/** Split an extracted fee list into worksheet lines. Unrecognized fees are add-ons. */
export function splitFees(
  fees: { name: string; amount: number | null }[],
  isDocFee: (name: string) => boolean,
): ExtractedMoney {
  const out: ExtractedMoney = {
    docFee: 0,
    addOns: 0,
    titleFee: 0,
    registrationFee: 0,
    govFees: 0,
    statedTax: null,
    tradePayoff: 0,
    sawTax: false,
    sawTitle: false,
    sawRegistration: false,
    sawGov: false,
  };
  for (const fee of fees) {
    if (fee.amount == null || !Number.isFinite(fee.amount)) continue;
    const bucket = classifyFeeBucket(fee.name);
    if (bucket === "payoff") {
      out.tradePayoff = roundCents(out.tradePayoff + fee.amount);
    } else if (isDocFee(fee.name.toLowerCase())) {
      out.docFee = roundCents(out.docFee + fee.amount);
    } else if (bucket === "gov") {
      out.govFees = roundCents(out.govFees + fee.amount);
      out.sawGov = true;
    } else if (bucket === "tax") {
      out.statedTax = roundCents((out.statedTax ?? 0) + fee.amount);
      out.sawTax = true;
    } else if (bucket === "title") {
      out.titleFee = roundCents(out.titleFee + fee.amount);
      out.sawTitle = true;
    } else if (bucket === "registration") {
      out.registrationFee = roundCents(out.registrationFee + fee.amount);
      out.sawRegistration = true;
    } else {
      out.addOns = roundCents(out.addOns + fee.amount);
    }
  }
  return out;
}
