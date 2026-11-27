/**
 * Deterministic facts read from raw dealer text.
 *
 * The model extraction is a hint. Labeled amounts in the quote win when they
 * disagree, invented amounts that never appear in the text are dropped, and
 * a tax rate is never stored as a dollar charge.
 */

import type { DetectedFields, Fee } from "../shared/schema.js";
import { normalizeOcrMoney, stitchWrappedAmounts } from "./ocrMoney.js";
import { parseGovernmentLines, selectGovernmentLines } from "./governmentCharges.js";
import { classifyFeeBucket, roundCents, splitFees } from "./quoteMath.js";

export interface DealerQuoteFacts {
  normalizedText: string;
  salePrices: number[];
  outTheDoorPrices: number[];
  monthlyPayments: number[];
  apr: number | null;
  termMonths: number | null;
  rebates: number[];
  tradeAllowances: number[];
  tradePayoffs: number[];
  downPayments: number[];
  mileage: number | null;
  docFees: Fee[];
  addOnFees: Fee[];
  inflatedMsrpAmounts: number[];
  originalMsrpAmounts: number[];
}

const MONEY = /\$(\d{1,3}(?:,\d{3})+|\d+)(?:\.(\d{2}))?/g;

const DOC_LABEL =
  /\b(?:doc(?:ument(?:ation)?)?\s*fee|document fee|documentary|electronic filing|admin(?:istrative)?\s*fee|processing\s*fee|dealer\s*fee)\b/i;
const ADDON_LABEL =
  /\b(?:nitrogen|vin etch|paint protection|ceramic|protection package|market adjustment|dealer addendum|addendum|dealer add-?ons?|undercoating|fabric protection|anti-?theft|window tint|appearance package)\b/i;
const PAYOFF_LABEL = /\b(?:payoff|amount owed)\b/i;
const TRADE_LABEL = /\btrade(?:-|\s)?in\b/i;
const OTD_LABEL = /\bout[\s-]*the[\s-]*door\b|\bo\.?t\.?d\.?\b/i;
const SALE_LABEL = /\b(?:selling|sale|purchase|vehicle|cash|internet|asking|advertised)\s+price\b/i;
const PAYMENT_LABEL = /\bmonthly(?:\s+payment)?\b|\bper month\b|\/\s*mo\b|\ba month\b/i;
const REBATE_LABEL = /\brebates?\b/i;
const DOWN_LABEL = /\bdown\s+payment\b/i;
const INFLATED_MSRP_LABEL =
  /\b(?:adjusted|dealer|total)\s+msrp\b|\bmsrp\b[^\n]{0,80}(?:addendum|market adjustment)|\b(?:addendum|market adjustment)[^\n]{0,80}\bmsrp\b/i;
const ORIGINAL_MSRP_LABEL = /\boriginal\s+msrp\b|\boriginal\s+sticker\b/i;
const MSRP_LABEL = /\bmsrp\b|\bsticker\s+price\b/i;

function moneyAmount(whole: string, cents: string | undefined): number {
  const dollars = Number(whole.replace(/,/g, ""));
  const fraction = cents ? Number(cents) / 100 : 0;
  return roundCents(dollars + fraction);
}

function unique(values: number[]): number[] {
  const out: number[] = [];
  for (const value of values) {
    if (!Number.isFinite(value)) continue;
    if (out.some((existing) => Math.abs(existing - value) < 0.01)) continue;
    out.push(value);
  }
  return out;
}

function cleanLabel(label: string): string {
  return label
    .replace(/\s+/g, " ")
    .replace(/^[\s.:;\-–=,]+/, "")
    .replace(/[\s.:;\-–=,]+$/g, "")
    .trim();
}

function feeIdentity(name: string, amount: number): string {
  const normalized = name.toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
  return `${normalized}|${amount}`;
}

function segments(line: string): { label: string; amount: number }[] {
  const out: { label: string; amount: number }[] = [];
  const matches = line.matchAll(MONEY);
  let previous = 0;
  for (const match of matches) {
    const start = match.index ?? 0;
    out.push({
      label: line.slice(previous, start),
      amount: moneyAmount(match[1], match[2]),
    });
    previous = start + match[0].length;
  }
  return out;
}

function firstNumber(text: string, patterns: RegExp[]): number | null {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (!match) continue;
    const raw = match.slice(1).find((group) => group != null && /\d/.test(group));
    if (!raw) continue;
    const value = Number(raw.replace(/,/g, ""));
    if (Number.isFinite(value)) return value;
  }
  return null;
}

function parseMileage(text: string): number | null {
  const value = firstNumber(text, [
    /\b(?:mileage|odometer)\b\s*[:#-]?\s*(\d{1,3}(?:,\d{3})+|\d{2,7})\b/i,
    /\b(\d{1,3}(?:,\d{3})+|\d{4,6})\s*(?:miles|mi)\b(?!\s*(?:per|\/|a year|allowance))/i,
  ]);
  if (value == null || value < 100 || value > 2_000_000) return null;
  return Math.round(value);
}

function parseApr(text: string): number | null {
  const value = firstNumber(text, [
    /\bapr\s*(?:of|is|:)?\s*(\d{1,2}(?:\.\d+)?)\s*%/i,
    /\b(\d{1,2}(?:\.\d+)?)\s*%\s*apr\b/i,
  ]);
  if (value == null || value < 0 || value > 40) return null;
  return value;
}

function parseTerm(text: string): number | null {
  const value = firstNumber(text, [
    /\bterm\s*[:#-]?\s*(\d{2,3})\s*months?\b/i,
    /\bfor\s+(\d{2,3})\s*months?\b/i,
    /\b(\d{2,3})\s*months?\b/i,
  ]);
  if (value == null || value < 12 || value > 96) return null;
  return value;
}

function paymentAmounts(text: string): number[] {
  const amounts: number[] = [];
  const trailing = /\$(\d{1,3}(?:,\d{3})+|\d+)(?:\.(\d{2}))?\s*(?:\/\s*mo\b|per month\b|a month\b)/gi;
  for (const match of text.matchAll(trailing)) {
    amounts.push(moneyAmount(match[1], match[2]));
  }
  return amounts;
}

function appears(text: string, amount: number): boolean {
  for (const match of text.matchAll(MONEY)) {
    if (Math.abs(moneyAmount(match[1], match[2]) - amount) < 0.01) return true;
  }
  return false;
}

function reconcile(current: number | null | undefined, labeled: number[], text: string): number | null {
  const found = unique(labeled);
  if (found.length === 1) return found[0];
  if (found.length > 1) {
    if (current != null && found.some((value) => Math.abs(value - current) < 0.01)) return current;
    return null;
  }
  if (current != null && !appears(text, current)) return null;
  return current ?? null;
}

function preferLabeled(current: number | null | undefined, labeled: number[]): number | null {
  const found = unique(labeled);
  if (found.length === 1) return found[0];
  return current ?? null;
}

function addFee(fees: Fee[], name: string, amount: number): void {
  const key = feeIdentity(name, amount);
  const exists = fees.some((fee) => {
    if (fee.amount == null || !Number.isFinite(fee.amount)) return false;
    return feeIdentity(fee.name, fee.amount) === key;
  });
  if (!exists) fees.push({ name, amount });
}

function correctTaxFees(fees: Fee[], dealerText: string): Fee[] {
  const parsed = selectGovernmentLines(parseGovernmentLines(dealerText)).filter((line) => line.kind === "tax");
  if (parsed.length > 0) {
    const kept = fees.filter((fee) => {
      if (classifyFeeBucket(fee.name) !== "tax") return true;
      return parsed.some((line) => fee.amount != null && Math.abs(fee.amount - line.amount) < 0.01);
    });
    for (const line of parsed) addFee(kept, line.label, line.amount);
    return kept;
  }
  return fees.filter((fee) => classifyFeeBucket(fee.name) !== "tax");
}

export function parseDealerQuoteFacts(dealerText: string): DealerQuoteFacts {
  const normalizedText = stitchWrappedAmounts(normalizeOcrMoney(dealerText ?? ""));
  const facts: DealerQuoteFacts = {
    normalizedText,
    salePrices: [],
    outTheDoorPrices: [],
    monthlyPayments: paymentAmounts(normalizedText),
    apr: parseApr(normalizedText),
    termMonths: parseTerm(normalizedText),
    rebates: [],
    tradeAllowances: [],
    tradePayoffs: [],
    downPayments: [],
    mileage: parseMileage(normalizedText),
    docFees: [],
    addOnFees: [],
    inflatedMsrpAmounts: [],
    originalMsrpAmounts: [],
  };

  for (const line of normalizedText.split(/\r?\n/)) {
    const pieces = segments(line);
    for (const segment of pieces) {
      const label = segment.label;
      const scope = pieces.length === 1 ? line : label;
      const name = cleanLabel(label) || cleanLabel(scope);
      const amount = segment.amount;
      if (PAYOFF_LABEL.test(scope)) {
        facts.tradePayoffs.push(amount);
      } else if (TRADE_LABEL.test(scope) && !OTD_LABEL.test(scope)) {
        facts.tradeAllowances.push(amount);
      } else if (OTD_LABEL.test(scope)) {
        facts.outTheDoorPrices.push(amount);
      } else if (SALE_LABEL.test(scope)) {
        facts.salePrices.push(amount);
      } else if (INFLATED_MSRP_LABEL.test(scope)) {
        facts.inflatedMsrpAmounts.push(amount);
      } else if (ORIGINAL_MSRP_LABEL.test(scope)) {
        facts.originalMsrpAmounts.push(amount);
      } else if (MSRP_LABEL.test(scope)) {
        continue;
      } else if (PAYMENT_LABEL.test(scope)) {
        facts.monthlyPayments.push(amount);
      } else if (REBATE_LABEL.test(scope)) {
        facts.rebates.push(amount);
      } else if (DOWN_LABEL.test(scope)) {
        facts.downPayments.push(amount);
      } else if (DOC_LABEL.test(scope)) {
        if (name) facts.docFees.push({ name, amount });
      } else if (ADDON_LABEL.test(scope) && name) {
        facts.addOnFees.push({ name, amount });
      }
    }
  }

  facts.salePrices = unique(facts.salePrices);
  facts.outTheDoorPrices = unique(facts.outTheDoorPrices);
  facts.monthlyPayments = unique(facts.monthlyPayments);
  facts.rebates = unique(facts.rebates);
  facts.tradeAllowances = unique(facts.tradeAllowances);
  facts.tradePayoffs = unique(facts.tradePayoffs);
  facts.downPayments = unique(facts.downPayments);
  facts.inflatedMsrpAmounts = unique(facts.inflatedMsrpAmounts);
  facts.originalMsrpAmounts = unique(facts.originalMsrpAmounts);
  return facts;
}

/**
 * A buyer-typed "factory MSRP" that copies a dealer addendum total, or the
 * original MSRP printed on a used-car quote, is not a Monroney ceiling.
 */
export function buyerStickerCopiesInflatedMsrp(
  sticker: number | null | undefined,
  facts: DealerQuoteFacts,
  condition?: string | null,
): boolean {
  if (sticker == null || !Number.isFinite(sticker)) return false;
  if (facts.inflatedMsrpAmounts.some((amount) => Math.abs(amount - sticker) < 1)) return true;
  if (condition === "used" && facts.originalMsrpAmounts.some((amount) => Math.abs(amount - sticker) < 1)) {
    return true;
  }
  return false;
}

export function applyDealerQuoteFacts(fields: DetectedFields, facts: DealerQuoteFacts): DetectedFields {
  const fees = correctTaxFees([...(fields.fees ?? [])], facts.normalizedText);
  for (const fee of [...facts.docFees, ...facts.addOnFees]) {
    if (fee.amount == null) continue;
    addFee(fees, fee.name, fee.amount);
  }
  const payoff = unique(facts.tradePayoffs);
  if (payoff.length === 1) {
    const already = fees.some((fee) => {
      return classifyFeeBucket(fee.name) === "payoff"
        && fee.amount != null
        && Math.abs(fee.amount - payoff[0]) < 0.01;
    });
    if (!already) addFee(fees, "Trade payoff", payoff[0]);
  }

  const split = splitFees(fees, () => false);
  return {
    ...fields,
    fees,
    salePrice: reconcile(fields.salePrice, facts.salePrices, facts.normalizedText),
    outTheDoorPrice: reconcile(fields.outTheDoorPrice, facts.outTheDoorPrices, facts.normalizedText),
    monthlyPayment: reconcile(fields.monthlyPayment, facts.monthlyPayments, facts.normalizedText),
    apr: facts.apr ?? fields.apr ?? null,
    termMonths: facts.termMonths ?? fields.termMonths ?? null,
    rebates: preferLabeled(fields.rebates, facts.rebates),
    tradeInValue: preferLabeled(fields.tradeInValue, facts.tradeAllowances),
    downPayment: preferLabeled(fields.downPayment, facts.downPayments),
    taxes: split.sawTax ? split.statedTax : null,
    titleFee: split.sawTitle ? split.titleFee : null,
    registrationFee: split.sawRegistration ? split.registrationFee : null,
    govFees: split.sawGov ? split.govFees : null,
  };
}
