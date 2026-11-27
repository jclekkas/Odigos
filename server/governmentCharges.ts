/**
 * Keep explicitly labeled sales tax, title, registration, license, and DMV
 * dollars on the purchase worksheet.
 *
 * The model sometimes returns those amounts as null, or parks them on a
 * field the worksheet never read. This module:
 * - accepts the numeric fields and the older aliases before schema parsing
 * - copies a missing labeled dollar line out of the raw dealer text
 * - never treats a tax rate (7.75%) as a dollar amount
 * - never adds a line that is already present
 */

import type { DetectedFields, Fee } from "../shared/schema.js";
import { normalizeOcrMoney, stitchWrappedAmounts } from "./ocrMoney.js";
import { classifyFeeBucket, roundCents, splitFees, type ExtractedMoney } from "./quoteMath.js";

export type ParsedKind = "tax" | "title" | "registration" | "titleReg" | "gov";

export interface ParsedGovLine {
  kind: ParsedKind;
  amount: number;
  label: string;
}

export interface GovernmentFieldSource {
  fees?: { name: string; amount: number | null }[] | null;
  taxes?: number | null;
  titleFee?: number | null;
  registrationFee?: number | null;
  govFees?: number | null;
}

const TAX_LABEL =
  /\b(?:(?:ca|california|state|county|city|local|district)\s+)?(?:(?:sales|use|excise|vehicle|personal\s+property|property)\s+)?tax(?:es)?\b/gi;

const LABEL_PATTERNS: { kind: ParsedKind; re: RegExp }[] = [
  { kind: "gov", re: /\btax(?:es)?\s*,\s*title\s*(?:,|\s+and\s+|\s*&\s*|\s*\/\s*)\s*(?:license|registration|reg)\b/gi },
  { kind: "titleReg", re: /\btitle\s*(?:&|and|\/)\s*license\s*(?:&|and|\/)\s*reg(?:istration)?\b/gi },
  { kind: "titleReg", re: /\btitle\s*(?:&|and|\/)\s*(?:reg(?:istration)?|license)\b/gi },
  { kind: "titleReg", re: /\b(?:reg(?:istration)?|license)\s*(?:&|and|\/)\s*title\b/gi },
  { kind: "titleReg", re: /\blicense\s*\/\s*(?:registration|reg)\b/gi },
  { kind: "titleReg", re: /\b(?:registration|reg)\s*\/\s*license\b/gi },
  { kind: "titleReg", re: /\b(?:tag|plate)s?\s*(?:&|and|\/)\s*title\b/gi },
  { kind: "gov", re: /\bdmv\s+fees?\b/gi },
  { kind: "gov", re: /\bdmv\s+charges?\b/gi },
  { kind: "gov", re: /\bgovernment\s+fees?\b/gi },
  { kind: "gov", re: /\bgov\.?\s+fees?\b/gi },
  { kind: "tax", re: TAX_LABEL },
  { kind: "registration", re: /\bregistration\b/gi },
  { kind: "registration", re: /\blicen[sc]e\s+fees?\b/gi },
  { kind: "registration", re: /\blicensing\s+fees?\b/gi },
  { kind: "registration", re: /\btag\s+fees?\b/gi },
  { kind: "registration", re: /\bplate\s+fees?\b/gi },
  { kind: "registration", re: /\breg\.?\b/gi },
  { kind: "title", re: /\btitle\s+fees?\b/gi },
  { kind: "title", re: /\btitle\b/gi },
];

const OTHER_LABELS: RegExp[] = [
  /\bout[\s-]*the[\s-]*door(?:\s+price)?\b/gi,
  /\bo\.?t\.?d\.?(?:\s+price)?\b/gi,
  /\b(?:selling|sale|purchase|vehicle|cash|internet|asking|advertised)\s+price\b/gi,
  /\bmsrp\b/gi,
  /\bsticker\s+price\b/gi,
  /\bdoc(?:ument(?:ation)?)?\s*fee\b/gi,
  /\bdocumentation\s+fee\b/gi,
  /\bdocumentary\s+fee\b/gi,
  /\bdealer\s+fee\b/gi,
  /\badmin(?:istrative)?\s+fee\b/gi,
  /\bprocessing\s+fee\b/gi,
  /\bdown\s+payment\b/gi,
  /\bmonthly\s+payment\b/gi,
  /\brebates?\b/gi,
  /\btrade(?:-|\s)?in(?:\s+(?:allowance|value|payoff))?\b/gi,
  /\bpaint\s+protection\b/gi,
  /\bextended\s+warranty\b/gi,
  /\bdue\s+at\s+signing\b/gi,
];

const DOLLAR = /\$\s*(\d{1,3}(?:,\d{3})+|\d+)(?:\.(\d{2}))?/g;

const BRIDGE =
  /^[\s:=–\-]*(?:of\s+)?(?:rate[\s:=–\-]*)?(?:\(\s*(?:estimated|est\.?|approx\.?)?\s*\d+(?:\.\d+)?\s*%\s*\)[\s:=–\-]*)?$/i;

interface Span {
  kind: ParsedKind;
  start: number;
  end: number;
  label: string;
}

interface DollarSpan {
  start: number;
  end: number;
  amount: number;
}

export function governmentChargeExtractionRules(): string {
  return `GOVERNMENT CHARGE EXTRACTION (REQUIRED — these lines are part of the out-the-door total):
Extract every explicitly printed dollar amount for sales tax, use tax, excise tax, title, registration, license, and DMV fees. Never drop one because it is a government charge, and never leave it only in the written summary.

Put each amount in the numeric field the worksheet adds, and also list that same line in fees using the label printed on the quote:
- taxes: sales, use, or excise tax in dollars. Sum separate printed tax lines (for example state and county) that each have their own dollar amount. null if no tax dollars are printed.
- titleFee: a title fee printed on its own line. null if title is not stated separately.
- registrationFee: a registration, tag, plate, or license fee printed on its own line. null if not stated separately.
- govFees: one combined line that is not already split into the fields above, such as "Title & registration", "Registration and title", "Reg & title", "Title/License/Reg", "License/Registration", or "DMV fees". null if there is no combined line.
Do not store the same dollars in more than one of taxes, titleFee, registrationFee, and govFees.

A percentage is not a dollar amount. "7.75%", "tax rate 7.75%", and "sales tax 7.25%" with no dollar figure are null. When a line shows both a rate and a dollar amount ("Sales tax (7.75%): $3,500"), store 3500. Do not calculate tax from a rate. Do not estimate a missing registration or title fee. If the quote does not state the amount, return null.`;
}

function isMoney(value: number | null | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

export function coerceMoney(value: unknown): number | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value === "number") {
    if (!Number.isFinite(value) || value < 0) return null;
    return roundCents(value);
  }
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/%|percent/i.test(trimmed) && !/\$/.test(trimmed)) return null;
  const match = trimmed.match(/^\$?\s*(\d{1,3}(?:,\d{3})+|\d+)(?:\.(\d{2}))?$/);
  if (!match) return null;
  const dollars = Number(match[1].replace(/,/g, ""));
  const cents = match[2] ? Number(match[2]) / 100 : 0;
  return roundCents(dollars + cents);
}

function readFeeArray(value: unknown): Fee[] {
  if (!Array.isArray(value)) return [];
  const out: Fee[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const rec = item as Record<string, unknown>;
    const name = typeof rec.name === "string" ? rec.name : typeof rec.label === "string" ? rec.label : "";
    if (!name.trim()) continue;
    const amount = coerceMoney(rec.amount);
    out.push({ name: name.trim(), amount: amount ?? null });
  }
  return out;
}

function firstMoney(values: unknown[]): number | null | undefined {
  for (const value of values) {
    if (value == null) continue;
    const money = coerceMoney(value);
    if (money != null) return money;
  }
  return undefined;
}

/**
 * Map aliases and array-shaped government buckets onto the fields the
 * schema keeps. Runs before validation so an unread key is not stripped.
 */
export function coerceGovernmentFields(df: Record<string, unknown>): void {
  const folded: Fee[] = [];
  if (Array.isArray(df.govFees)) {
    folded.push(...readFeeArray(df.govFees));
    delete df.govFees;
  }
  if (Array.isArray(df.taxes)) {
    folded.push(...readFeeArray(df.taxes));
    df.taxes = null;
  }
  if (Array.isArray(df.governmentFees)) {
    folded.push(...readFeeArray(df.governmentFees));
  }

  if (df.taxes == null) {
    const alias = firstMoney([df.salesTax, df.salesTaxAmount, df.taxAmount]);
    if (alias != null) df.taxes = alias;
  }
  if (df.registrationFee == null) {
    const alias = firstMoney([df.registration, df.regFee]);
    if (alias != null) df.registrationFee = alias;
  }
  if (df.titleFee == null && typeof df.title === "number") {
    const alias = firstMoney([df.title]);
    if (alias != null) df.titleFee = alias;
  }
  if (df.govFees == null) {
    const alias = firstMoney([df.governmentFees, df.dmvFees]);
    if (alias != null) df.govFees = alias;
  }

  for (const key of ["taxes", "titleFee", "registrationFee", "govFees"] as const) {
    if (key in df) {
      const coerced = coerceMoney(df[key]);
      df[key] = coerced === undefined ? null : coerced;
    }
  }

  if (folded.length > 0) {
    const existing = Array.isArray(df.fees) ? (df.fees as Fee[]) : [];
    const merged = [...existing];
    for (const fee of folded) {
      const key = fee.name.trim().toLowerCase();
      const duplicate = merged.some((item) => {
        if (!item || typeof item !== "object") return false;
        const name = typeof item.name === "string" ? item.name.trim().toLowerCase() : "";
        return name === key && item.amount === fee.amount;
      });
      if (!duplicate) merged.push(fee);
    }
    df.fees = merged;
  }
}

function bridgeOk(gap: string): boolean {
  return BRIDGE.test(gap);
}

function rejectedLabel(line: string, kind: ParsedKind, start: number, end: number): boolean {
  if (kind === "tax") {
    const before = line.slice(Math.max(0, start - 5), start);
    if (/pre-?$/i.test(before)) return true;
    const after = line.slice(end);
    if (/^\s*credit\b/i.test(after)) return true;
    if (/^\s*able\b/i.test(after)) return true;
  }
  if (kind === "title") {
    const after = line.slice(end);
    if (/^\s+loan\b/i.test(after)) return true;
  }
  if (kind === "registration" || kind === "titleReg") {
    const before = line.slice(Math.max(0, start - 12), start);
    if (/driver'?s?\s+$/i.test(before)) return true;
  }
  return false;
}

function collectSpans(line: string, patterns: { kind: ParsedKind; re: RegExp }[]): Span[] {
  const hits: Span[] = [];
  for (const pattern of patterns) {
    const re = new RegExp(pattern.re.source, "gi");
    for (const match of line.matchAll(re)) {
      const start = match.index ?? 0;
      const label = match[0];
      const end = start + label.length;
      if (rejectedLabel(line, pattern.kind, start, end)) continue;
      hits.push({ kind: pattern.kind, start, end, label: label.replace(/\s+/g, " ").trim() });
    }
  }
  hits.sort((a, b) => a.start - b.start || b.end - a.end);
  const kept: Span[] = [];
  let cursor = 0;
  for (const hit of hits) {
    if (hit.start < cursor) continue;
    kept.push(hit);
    cursor = hit.end;
  }
  return kept;
}

function collectDollars(line: string): DollarSpan[] {
  const out: DollarSpan[] = [];
  const re = new RegExp(DOLLAR.source, "g");
  for (const match of line.matchAll(re)) {
    const start = match.index ?? 0;
    const end = start + match[0].length;
    const after = line.slice(end);
    if (/^\s*%/.test(after)) continue;
    const dollars = Number(match[1].replace(/,/g, ""));
    const cents = match[2] ? Number(match[2]) / 100 : 0;
    if (!Number.isFinite(dollars)) continue;
    out.push({ start, end, amount: roundCents(dollars + cents) });
  }
  return out;
}

function claimForward(
  line: string,
  labelEnd: number,
  nextBoundary: number,
  dollars: DollarSpan[],
  claimed: Set<DollarSpan>,
): DollarSpan | null {
  for (const dollar of dollars) {
    if (claimed.has(dollar)) continue;
    if (dollar.start < labelEnd || dollar.start >= nextBoundary) continue;
    if (bridgeOk(line.slice(labelEnd, dollar.start))) return dollar;
  }
  return null;
}

function claimBackward(
  line: string,
  labelStart: number,
  prevBoundary: number,
  dollars: DollarSpan[],
  claimed: Set<DollarSpan>,
): DollarSpan | null {
  for (let i = dollars.length - 1; i >= 0; i--) {
    const dollar = dollars[i];
    if (claimed.has(dollar)) continue;
    if (dollar.end > labelStart || dollar.end <= prevBoundary) continue;
    if (bridgeOk(line.slice(dollar.end, labelStart))) return dollar;
  }
  return null;
}

function parseLine(line: string): ParsedGovLine[] {
  const dollars = collectDollars(line);
  if (dollars.length === 0) return [];
  const others = collectSpans(
    line,
    OTHER_LABELS.map((re) => ({ kind: "gov" as ParsedKind, re })),
  );
  const labels = collectSpans(line, LABEL_PATTERNS);
  const claimed = new Set<DollarSpan>();
  const matchedOthers = new Set<Span>();
  others.forEach((label, index) => {
    const next = others[index + 1]?.start ?? line.length;
    const prev = index === 0 ? -1 : others[index - 1].end;
    const dollar = claimForward(line, label.end, next, dollars, claimed)
      ?? claimBackward(line, label.start, prev, dollars, claimed);
    if (!dollar) return;
    claimed.add(dollar);
    matchedOthers.add(label);
  });

  const found: ParsedGovLine[] = [];
  labels.forEach((label, index) => {
    const next = labels[index + 1]?.start ?? line.length;
    const prev = index === 0 ? -1 : labels[index - 1].end;
    const dollar = claimForward(line, label.end, next, dollars, claimed)
      ?? claimBackward(line, label.start, prev, dollars, claimed);
    if (!dollar) return;
    // "Out the door including tax: $48,970" binds the only dollars to the
    // price, not to the word tax. A government label keeps its dollar when
    // it comes first or when the price label has a dollar of its own.
    const earlierUnmatchedPrice = others.some((other) => other.start < label.start && !matchedOthers.has(other));
    if (earlierUnmatchedPrice) return;
    claimed.add(dollar);
    found.push({ kind: label.kind, amount: dollar.amount, label: label.label });
  });
  return found;
}

/** Labeled government dollar lines. Percentages and unlabeled numbers are ignored. */
export function parseGovernmentLines(text: string): ParsedGovLine[] {
  const normalized = stitchWrappedAmounts(normalizeOcrMoney(text));
  const lines = normalized.split(/\r?\n/);
  const found: ParsedGovLine[] = [];
  for (const line of lines) {
    found.push(...parseLine(line));
  }
  return dedupeLines(found);
}

function lineKey(line: ParsedGovLine): string {
  return `${line.kind}|${line.amount}|${line.label.toLowerCase()}`;
}

function dedupeLines(lines: ParsedGovLine[]): ParsedGovLine[] {
  const seen = new Set<string>();
  const out: ParsedGovLine[] = [];
  for (const line of lines) {
    const key = lineKey(line);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(line);
  }
  return out;
}

function sum(lines: ParsedGovLine[]): number {
  return roundCents(lines.reduce((total, line) => total + line.amount, 0));
}

/** Drop a combined line when the quote also itemizes the same dollars. */
export function selectGovernmentLines(lines: ParsedGovLine[]): ParsedGovLine[] {
  const unique = dedupeLines(lines);
  const taxes = unique.filter((line) => line.kind === "tax");
  const parts = taxes.filter((line) => !/\btotal\b/i.test(line.label));
  const keptTax = taxes.filter((line) => {
    if (!/\btotal\b/i.test(line.label)) return true;
    if (parts.length === 0) return true;
    return sum(parts) !== line.amount;
  });
  const titles = unique.filter((line) => line.kind === "title");
  const regs = unique.filter((line) => line.kind === "registration");
  const titleSum = sum(titles);
  const regSum = sum(regs);
  const combined = unique.filter((line) => line.kind === "titleReg" || line.kind === "gov");
  const itemized = titles.length + regs.length > 0;
  const keptCombined = combined.filter((line) => {
    if (!itemized) return true;
    if (line.kind === "gov" && line.amount !== titleSum && line.amount !== regSum && line.amount !== roundCents(titleSum + regSum)) {
      return true;
    }
    return false;
  });
  return [...keptTax, ...titles, ...regs, ...keptCombined];
}

function hasBucket(fees: Fee[], bucket: "tax" | "title" | "registration" | "gov"): boolean {
  return fees.some((fee) => fee.amount != null && Number.isFinite(fee.amount) && classifyFeeBucket(fee.name) === bucket);
}

function pushFee(fees: Fee[], name: string, amount: number): void {
  const rounded = roundCents(amount);
  const key = name.trim().toLowerCase();
  const exists = fees.some((fee) => {
    if (fee.amount == null || !Number.isFinite(fee.amount)) return false;
    return fee.name.trim().toLowerCase() === key && roundCents(fee.amount) === rounded;
  });
  if (exists) return;
  fees.push({ name: name.trim(), amount: rounded });
}

function amountDuplicatesParts(amount: number, fees: Fee[]): boolean {
  const split = splitFees(fees, () => false);
  const title = split.titleFee;
  const registration = split.registrationFee;
  const gov = split.govFees;
  return amount === title
    || amount === registration
    || amount === gov
    || amount === roundCents(title + registration)
    || amount === roundCents(title + registration + gov);
}

/** A separate title or registration line that repeats a combined government line already counted. */
function coveredByCombinedLine(amount: number, fees: Fee[]): boolean {
  const split = splitFees(fees, () => false);
  if (!split.sawGov) return false;
  return amount === split.govFees
    || amount === roundCents(split.govFees + split.titleFee)
    || amount === roundCents(split.govFees + split.registrationFee)
    || amount === roundCents(split.govFees + split.titleFee + split.registrationFee);
}

/**
 * Copy dedicated numeric fields and unambiguous dealer-text lines into fees.
 * A bucket that already has an amount is left alone.
 */
export function mergeGovernmentFees(fields: GovernmentFieldSource, dealerText?: string | null): Fee[] {
  const fees: Fee[] = (fields.fees ?? []).map((fee) => ({ name: fee.name, amount: fee.amount }));
  const sawTax = hasBucket(fees, "tax");
  const sawTitle = hasBucket(fees, "title");
  const sawRegistration = hasBucket(fees, "registration");
  const sawGov = hasBucket(fees, "gov");

  if (!sawTax && isMoney(fields.taxes)) pushFee(fees, "Sales tax", fields.taxes);
  if (!sawTitle && !sawGov && isMoney(fields.titleFee)) pushFee(fees, "Title fee", fields.titleFee);
  if (!sawRegistration && !sawGov && isMoney(fields.registrationFee)) pushFee(fees, "Registration", fields.registrationFee);
  if (!sawGov && !sawTitle && !sawRegistration && isMoney(fields.govFees)) pushFee(fees, "Government fees", fields.govFees);

  const parsed = dealerText ? selectGovernmentLines(parseGovernmentLines(dealerText)) : [];
  const taxFilled = sawTax || isMoney(fields.taxes);
  const titleFilled = sawTitle || (!sawGov && isMoney(fields.titleFee));
  const registrationFilled = sawRegistration || (!sawGov && isMoney(fields.registrationFee));
  const govFilled = sawGov || (!sawTitle && !sawRegistration && isMoney(fields.govFees));

  if (!taxFilled) {
    for (const line of parsed) {
      if (line.kind === "tax") pushFee(fees, line.label, line.amount);
    }
  }
  if (!titleFilled) {
    for (const line of parsed) {
      if (line.kind !== "title") continue;
      if (coveredByCombinedLine(line.amount, fees)) continue;
      pushFee(fees, line.label, line.amount);
    }
  }
  if (!registrationFilled) {
    for (const line of parsed) {
      if (line.kind !== "registration") continue;
      if (coveredByCombinedLine(line.amount, fees)) continue;
      pushFee(fees, line.label, line.amount);
    }
  }
  if (!govFilled) {
    for (const line of parsed) {
      if (line.kind !== "titleReg" && line.kind !== "gov") continue;
      if (line.kind === "titleReg" && (titleFilled || registrationFilled || hasBucket(fees, "title") || hasBucket(fees, "registration"))) {
        continue;
      }
      if (amountDuplicatesParts(line.amount, fees)) continue;
      pushFee(fees, line.label, line.amount);
    }
  }
  return fees;
}

export function resolvePurchaseLines(
  fields: GovernmentFieldSource,
  isDocFee: (name: string) => boolean,
  dealerText?: string | null,
): ExtractedMoney {
  return splitFees(mergeGovernmentFees(fields, dealerText), isDocFee);
}

/** Fill null tax, title, registration, and combined government amounts from the quote text. */
export function enrichDetectedFields(fields: DetectedFields, dealerText?: string | null): DetectedFields {
  const fees = mergeGovernmentFees(fields, dealerText);
  const split = splitFees(fees, () => false);
  return {
    ...fields,
    fees,
    taxes: split.sawTax ? split.statedTax : null,
    titleFee: split.sawTitle ? split.titleFee : null,
    registrationFee: split.sawRegistration ? split.registrationFee : null,
    govFees: split.sawGov ? split.govFees : null,
  };
}
