/**
 * Deterministic facts read from raw dealer text.
 *
 * The model extraction is a hint. Labeled amounts in the quote win when they
 * disagree, invented amounts that never appear in the text are dropped, and
 * a tax rate is never stored as a dollar charge.
 */

import type { DetectedFields, Fee } from "../shared/schema.js";
import { matchesExtractedDocFeeLabel, matchesExtractedFilingLabel } from "../shared/feeVocabulary.js";
import type { FieldProvenance } from "./fieldProvenance.js";
import { prepareQuoteText, scanMoney, textContainsAmount } from "./ocrMoney.js";
import { parseGovernmentLines, selectGovernmentLines } from "./governmentCharges.js";
import { classifyFeeBucket, roundCents, splitFees } from "./quoteMath.js";

export interface LocatedFee extends Fee {
  /** 0-based line index in the normalized quote. Absent on a model-only row. */
  sourceLine?: number;
  /** Character offset of the amount on that line, so two charges on one line stay distinct. */
  sourceOffset?: number;
}

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
  docFees: LocatedFee[];
  filingFees: LocatedFee[];
  addOnFees: LocatedFee[];
  inflatedMsrpAmounts: number[];
  originalMsrpAmounts: number[];
  msrpAmounts: number[];
}

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

export function feeIdentity(name: string, amount: number): string {
  const normalized = name.toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
  return `${normalized}|${amount}`;
}

function segments(line: string): { label: string; amount: number; offset: number }[] {
  const out: { label: string; amount: number; offset: number }[] = [];
  const spans = scanMoney(line);
  let previous = 0;
  for (const span of spans) {
    out.push({
      label: line.slice(previous, span.start),
      amount: span.amount,
      offset: span.start,
    });
    previous = span.end;
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
  const trailing = /(?:\$\s*|USD\s*|US\$\s*)?(\d{1,3}(?:,\d{3})+|\d+)(?:\.(\d{1,2}))?\s*(?:USD\s*)?(?:\/\s*mo\b|per month\b|a month\b)/gi;
  for (const match of text.matchAll(trailing)) {
    const start = match.index ?? 0;
    if (/%\s*$/.test(text.slice(Math.max(0, start - 6), start))) continue;
    const dollars = Number(match[1].replace(/,/g, ""));
    const cents = match[2] ? (match[2].length === 1 ? Number(match[2]) / 10 : Number(match[2]) / 100) : 0;
    if (!Number.isFinite(dollars)) continue;
    amounts.push(roundCents(dollars + cents));
  }
  return amounts;
}

function appears(text: string, amount: number): boolean {
  return textContainsAmount(text, amount);
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

/** A printed label wins. A model number with no printed label is dropped. */
function onlyPrinted(labeled: number[]): number | null {
  const found = unique(labeled);
  if (found.length === 1) return found[0];
  return null;
}

const LEASE_LABELS: { field: keyof DetectedFields; label: RegExp }[] = [
  { field: "moneyFactor", label: /money\s*factor/i },
  { field: "residualValue", label: /residual/i },
  { field: "residualPercent", label: /residual/i },
  { field: "acquisitionFee", label: /acquisition/i },
  { field: "dispositionFee", label: /disposition/i },
  { field: "mileageAllowance", label: /mileage\s+allowance|miles\s+per\s+year|annual\s+mileage/i },
  { field: "excessMileageRate", label: /excess\s+mileage/i },
];

function keepLabeledMoney(current: number | null | undefined, text: string, label: RegExp): number | null {
  if (current == null || !Number.isFinite(current)) return null;
  if (!label.test(text)) return null;
  const printed = scanMoney(text).some((span) => Math.abs(Math.abs(span.amount) - Math.abs(current)) < 0.01);
  if (printed) return current;
  const plain = String(current).replace(".", "\\.");
  const haystack = text.replace(/,/g, "");
  if (new RegExp(String.raw`(?<![\d.])${plain}(?![\d.])`).test(haystack)) return current;
  return null;
}

function addFee(fees: Fee[], name: string, amount: number): void {
  const key = feeIdentity(name, amount);
  const exists = fees.some((fee) => {
    if (fee.amount == null || !Number.isFinite(fee.amount)) return false;
    return feeIdentity(fee.name, fee.amount) === key;
  });
  if (!exists) fees.push({ name, amount });
}

/**
 * A model row with no second printed line is one line seen twice.
 * Two printed lines with the same name and amount are two charges.
 * When the quote prints any documentation or filing line, those lines
 * replace model rows for that kind so a renamed duplicate is not added.
 */
function usePrintedLines(modelFees: Fee[], printed: LocatedFee[], match: (name: string) => boolean): Fee[] {
  const found = printed.filter((fee) => fee.amount != null && Number.isFinite(fee.amount) && match(fee.name));
  const others = modelFees.filter((fee) => !match(fee.name));
  if (found.length === 0) {
    const collapsed: Fee[] = [];
    for (const fee of modelFees) {
      if (!match(fee.name) || fee.amount == null || !Number.isFinite(fee.amount)) continue;
      addFee(collapsed, fee.name, fee.amount);
    }
    return [...others, ...collapsed];
  }
  const rows: Fee[] = [];
  const seen = new Set<string>();
  for (const fee of found) {
    const key = `${fee.sourceLine ?? "na"}:${fee.sourceOffset ?? rows.length}|${feeIdentity(fee.name, fee.amount as number)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    rows.push({ name: fee.name, amount: fee.amount });
  }
  return [...others, ...rows];
}

function keepSeparatePrintedAddOns(modelFees: Fee[], printed: LocatedFee[]): Fee[] {
  const printedByIdentity = new Map<string, LocatedFee[]>();
  for (const fee of printed) {
    if (fee.amount == null || !Number.isFinite(fee.amount)) continue;
    const key = feeIdentity(fee.name, fee.amount);
    const list = printedByIdentity.get(key) ?? [];
    if (fee.sourceLine != null && list.some((item) => item.sourceLine === fee.sourceLine && item.sourceOffset === fee.sourceOffset)) continue;
    list.push(fee);
    printedByIdentity.set(key, list);
  }
  const out: Fee[] = [];
  const used = new Map<string, number>();
  for (const fee of modelFees) {
    if (!ADDON_LABEL.test(fee.name) || fee.amount == null || !Number.isFinite(fee.amount)) {
      out.push(fee);
      continue;
    }
    const key = feeIdentity(fee.name, fee.amount);
    const allowed = printedByIdentity.get(key)?.length ?? 1;
    const seen = used.get(key) ?? 0;
    if (seen >= allowed) continue;
    out.push({ name: fee.name, amount: fee.amount });
    used.set(key, seen + 1);
  }
  for (const lines of printedByIdentity.values()) {
    const key = feeIdentity(lines[0].name, lines[0].amount as number);
    const seen = used.get(key) ?? 0;
    for (let i = seen; i < lines.length; i++) {
      out.push({ name: lines[i].name, amount: lines[i].amount });
    }
  }
  return out;
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
  const normalizedText = prepareQuoteText(dealerText ?? "");
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
    filingFees: [],
    addOnFees: [],
    inflatedMsrpAmounts: [],
    originalMsrpAmounts: [],
    msrpAmounts: [],
  };

  for (const [lineIndex, line] of normalizedText.split(/\r?\n/).entries()) {
    const pieces = segments(line);
    for (const segment of pieces) {
      const label = segment.label;
      const scope = pieces.length === 1 ? line : label;
      const name = cleanLabel(label) || cleanLabel(scope);
      const amount = segment.amount;
      const located: LocatedFee = { name, amount, sourceLine: lineIndex, sourceOffset: segment.offset };
      if (amount < 0) {
        if (!SALE_LABEL.test(scope) && !OTD_LABEL.test(scope) && !PAYMENT_LABEL.test(scope) && !MSRP_LABEL.test(scope)) {
          facts.rebates.push(Math.abs(amount));
        }
        continue;
      }
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
        facts.msrpAmounts.push(amount);
      } else if (PAYMENT_LABEL.test(scope)) {
        facts.monthlyPayments.push(amount);
      } else if (REBATE_LABEL.test(scope)) {
        facts.rebates.push(amount);
      } else if (DOWN_LABEL.test(scope)) {
        facts.downPayments.push(amount);
      } else if (matchesExtractedFilingLabel(scope)) {
        if (name) facts.filingFees.push(located);
      } else if (matchesExtractedDocFeeLabel(scope)) {
        if (name) facts.docFees.push(located);
      } else if (ADDON_LABEL.test(scope) && name) {
        facts.addOnFees.push(located);
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
  facts.msrpAmounts = unique(facts.msrpAmounts);
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
  let fees = correctTaxFees([...(fields.fees ?? [])], facts.normalizedText);
  fees = usePrintedLines(fees, facts.docFees, matchesExtractedDocFeeLabel);
  fees = usePrintedLines(fees, facts.filingFees, matchesExtractedFilingLabel);
  fees = keepSeparatePrintedAddOns(fees, facts.addOnFees);
  const payoff = unique(facts.tradePayoffs);
  if (payoff.length === 1) {
    const already = fees.some((fee) => {
      return classifyFeeBucket(fee.name) === "payoff"
        && fee.amount != null
        && Math.abs(fee.amount - payoff[0]) < 0.01;
    });
    if (!already) addFee(fees, "Trade payoff", payoff[0]);
  }

  fees = fees.filter((fee) => {
    const amount = fee.amount;
    if (amount == null || !Number.isFinite(amount)) return true;
    return scanMoney(facts.normalizedText).some((span) => span.amount >= 0 && Math.abs(span.amount - amount) < 0.01);
  });

  const split = splitFees(fees, () => false);
  const next: DetectedFields = {
    ...fields,
    fees,
    salePrice: reconcile(fields.salePrice, facts.salePrices, facts.normalizedText),
    msrp: onlyPrinted(facts.msrpAmounts),
    outTheDoorPrice: reconcile(fields.outTheDoorPrice, facts.outTheDoorPrices, facts.normalizedText),
    monthlyPayment: reconcile(fields.monthlyPayment, facts.monthlyPayments, facts.normalizedText),
    apr: facts.apr,
    termMonths: facts.termMonths,
    rebates: onlyPrinted(facts.rebates),
    tradeInValue: onlyPrinted(facts.tradeAllowances),
    downPayment: onlyPrinted(facts.downPayments),
    taxes: split.sawTax ? split.statedTax : null,
    titleFee: split.sawTitle ? split.titleFee : null,
    registrationFee: split.sawRegistration ? split.registrationFee : null,
    govFees: split.sawGov ? split.govFees : null,
  };
  for (const lease of LEASE_LABELS) {
    const key = lease.field;
    const current = fields[key];
    const value = typeof current === "number" ? current : null;
    (next as Record<string, unknown>)[key] = keepLabeledMoney(value, facts.normalizedText, lease.label);
  }
  return next;
}

function spanForAmount(text: string, amount: number): Pick<FieldProvenance, "start" | "end" | "raw"> | undefined {
  const spans = scanMoney(text).filter((span) => Math.abs(Math.abs(span.amount) - Math.abs(amount)) < 0.01);
  const span = spans[0];
  if (!span) return undefined;
  return { start: span.start, end: span.end, raw: text.slice(span.start, span.end) };
}

function spanForPattern(text: string, patterns: RegExp[], value: number): Pick<FieldProvenance, "start" | "end" | "raw"> | undefined {
  for (const pattern of patterns) {
    const flags = pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`;
    const re = new RegExp(pattern.source, flags);
    for (const match of text.matchAll(re)) {
      const rawNumber = match.slice(1).find((group) => group != null && /\d/.test(group));
      if (!rawNumber) continue;
      const parsed = Number(rawNumber.replace(/,/g, ""));
      if (!Number.isFinite(parsed) || Math.abs(parsed - value) > 0.001) continue;
      const start = match.index ?? 0;
      return { start, end: start + match[0].length, raw: match[0] };
    }
  }
  return undefined;
}

function locateField(text: string, field: string, amount: number): Pick<FieldProvenance, "start" | "end" | "raw"> | undefined {
  if (field === "apr") {
    return spanForPattern(text, [
      /\bapr\s*(?:of|is|:)?\s*(\d{1,2}(?:\.\d+)?)\s*%/i,
      /\b(\d{1,2}(?:\.\d+)?)\s*%\s*apr\b/i,
      /\binterest\s+rate\s*(?:of|is|:)?\s*(\d{1,2}(?:\.\d+)?)\s*%/i,
    ], amount);
  }
  if (field === "termMonths") {
    return spanForPattern(text, [
      /\bterm\s*[:#-]?\s*(\d{2,3})\s*months?\b/i,
      /\bfor\s+(\d{2,3})\s*months?\b/i,
      /\b(\d{2,3})\s*months?\b/i,
    ], amount);
  }
  return spanForAmount(text, amount);
}

function pushNumberProvenance(
  out: FieldProvenance[],
  field: string,
  modelValue: number | null | undefined,
  kept: number | null | undefined,
  text: string,
): void {
  if (typeof kept === "number" && Number.isFinite(kept)) {
    out.push({
      field,
      origin: "dealer_text",
      verified: true,
      amount: kept,
      ...locateField(text, field, kept),
    });
    return;
  }
  if (typeof modelValue === "number" && Number.isFinite(modelValue)) {
    out.push({ field, origin: "model", verified: false, amount: modelValue });
  }
}

/**
 * The same field cleanup as `applyDealerQuoteFacts`, plus a record of whether
 * each money and financing figure was printed or invented by the model.
 */
export function applyDealerQuoteFactsWithProvenance(
  fields: DetectedFields,
  facts: DealerQuoteFacts,
): { fields: DetectedFields; provenance: FieldProvenance[] } {
  const next = applyDealerQuoteFacts(fields, facts);
  const text = facts.normalizedText;
  const provenance: FieldProvenance[] = [];
  const numericKeys: (keyof DetectedFields)[] = [
    "salePrice",
    "msrp",
    "rebates",
    "taxes",
    "titleFee",
    "registrationFee",
    "govFees",
    "outTheDoorPrice",
    "monthlyPayment",
    "tradeInValue",
    "apr",
    "termMonths",
    "downPayment",
    "moneyFactor",
    "residualValue",
    "residualPercent",
    "acquisitionFee",
    "dispositionFee",
    "mileageAllowance",
    "excessMileageRate",
  ];
  for (const key of numericKeys) {
    const modelValue = fields[key];
    const kept = next[key];
    pushNumberProvenance(
      provenance,
      key,
      typeof modelValue === "number" ? modelValue : null,
      typeof kept === "number" ? kept : null,
      text,
    );
  }
  const keptFees = next.fees ?? [];
  for (const fee of fields.fees ?? []) {
    const amount = fee.amount;
    if (amount == null || !Number.isFinite(amount)) continue;
    const kept = keptFees.some((item) => item.name === fee.name && item.amount != null && Math.abs(item.amount - amount) < 0.01);
    if (kept) {
      provenance.push({
        field: `fee:${fee.name}`,
        origin: "dealer_text",
        verified: true,
        amount,
        ...spanForAmount(text, amount),
      });
    } else {
      provenance.push({ field: `fee:${fee.name}`, origin: "model", verified: false, amount });
    }
  }
  for (const fee of keptFees) {
    const amount = fee.amount;
    if (amount == null || !Number.isFinite(amount)) continue;
    const recorded = provenance.some((row) => row.field === `fee:${fee.name}` && row.verified && row.amount != null && Math.abs(row.amount - amount) < 0.01);
    if (recorded) continue;
    provenance.push({
      field: `fee:${fee.name}`,
      origin: "dealer_text",
      verified: true,
      amount,
      ...spanForAmount(text, amount),
    });
  }
  return { fields: next, provenance };
}
