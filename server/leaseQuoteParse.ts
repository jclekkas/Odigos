/**
 * Lease figures read from the quote itself.
 *
 * A money factor (0.00125), a percent, a dollar amount, and a mileage
 * allowance are different kinds of numbers. A model value is kept only when
 * the same number is printed next to its label. Instruction lines are ignored.
 */

import type { DetectedFields } from "../shared/schema.js";

export type LeaseValueKind = "money_factor" | "percent" | "dollars" | "mileage" | "count" | "months";

export interface ParsedLeaseNumber {
  value: number;
  start: number;
  end: number;
  raw: string;
  kind: LeaseValueKind;
}

export interface ParsedLeaseQuote {
  moneyFactor: ParsedLeaseNumber | null;
  buyRateMoneyFactor: ParsedLeaseNumber | null;
  moneyFactorReduction: ParsedLeaseNumber | null;
  residualPercent: ParsedLeaseNumber | null;
  residualDollars: ParsedLeaseNumber | null;
  acquisitionFee: ParsedLeaseNumber | null;
  acquisitionFeeCapitalized: boolean | null;
  dispositionFee: ParsedLeaseNumber | null;
  mileageAllowance: ParsedLeaseNumber | null;
  excessMileageRate: ParsedLeaseNumber | null;
  dueAtSigning: ParsedLeaseNumber | null;
  grossCapCost: ParsedLeaseNumber | null;
  adjustedCapCost: ParsedLeaseNumber | null;
  capCostReduction: ParsedLeaseNumber | null;
  securityDepositCount: ParsedLeaseNumber | null;
  securityDepositAmount: ParsedLeaseNumber | null;
  monthlyTax: ParsedLeaseNumber | null;
  upfrontTax: ParsedLeaseNumber | null;
  paymentIncludesTax: boolean | null;
  firstPaymentInDueAtSigning: boolean | null;
  rateLimitationNotice: boolean;
  conflicts: string[];
}

const INSTRUCTION = /\b(ignore\b.{0,40}\binstructions?\b|system prompt|jailbreak|you are now|verdict\s+to\s+go|set the verdict)\b/i;

export function lineIsInstruction(line: string): boolean {
  return INSTRUCTION.test(line);
}

export function withoutInstructionLines(text: string): string {
  return text.split(/\r?\n/).filter((line) => !lineIsInstruction(line)).join("\n");
}

interface Hit {
  value: number;
  start: number;
  end: number;
  raw: string;
}

function collect(text: string, pattern: RegExp): Hit[] {
  const flags = pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`;
  const re = new RegExp(pattern.source, flags);
  const hits: Hit[] = [];
  for (const match of text.matchAll(re)) {
    const start = match.index ?? 0;
    const lineStart = text.lastIndexOf("\n", Math.max(0, start - 1)) + 1;
    const lineEnd = text.indexOf("\n", start);
    const line = text.slice(lineStart, lineEnd === -1 ? text.length : lineEnd);
    if (lineIsInstruction(line)) continue;
    const rawNumber = match.slice(1).find((group) => group != null && /\d/.test(group));
    if (!rawNumber) continue;
    const value = Number(rawNumber.replace(/,/g, ""));
    if (!Number.isFinite(value)) continue;
    hits.push({ value, start, end: start + match[0].length, raw: match[0] });
  }
  return hits;
}

function one(text: string, pattern: RegExp, kind: LeaseValueKind, conflicts: string[], label: string): ParsedLeaseNumber | null {
  const hits = collect(text, pattern);
  if (hits.length === 0) return null;
  const unique = hits.filter((hit, index) => hits.findIndex((other) => Math.abs(other.value - hit.value) < 1e-8) === index);
  if (unique.length > 1) {
    conflicts.push(`${label} is printed more than once with different values, so none was chosen.`);
    return null;
  }
  const hit = unique[0];
  return { ...hit, kind };
}

function dollars(text: string, pattern: RegExp, conflicts: string[], label: string): ParsedLeaseNumber | null {
  return one(text, pattern, "dollars", conflicts, label);
}

const MONEY = String.raw`\$?\s*(\d{1,3}(?:,\d{3})+|\d+)(?:\.(\d{1,2}))?`;

function moneyValue(match: RegExpMatchArray): number | null {
  const whole = match[1]?.replace(/,/g, "");
  if (!whole) return null;
  const cents = match[2] ? Number(match[2]) / (match[2].length === 1 ? 10 : 100) : 0;
  const value = Number(whole) + cents;
  return Number.isFinite(value) ? value : null;
}

function oneMoney(text: string, pattern: RegExp, conflicts: string[], label: string): ParsedLeaseNumber | null {
  const flags = pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`;
  const re = new RegExp(pattern.source, flags);
  const hits: Hit[] = [];
  for (const match of text.matchAll(re)) {
    const start = match.index ?? 0;
    const lineStart = text.lastIndexOf("\n", Math.max(0, start - 1)) + 1;
    const lineEnd = text.indexOf("\n", start);
    const line = text.slice(lineStart, lineEnd === -1 ? text.length : lineEnd);
    if (lineIsInstruction(line)) continue;
    const value = moneyValue(match);
    if (value == null) continue;
    hits.push({ value, start, end: start + match[0].length, raw: match[0] });
  }
  if (hits.length === 0) return null;
  const unique = hits.filter((hit, index) => hits.findIndex((other) => Math.abs(other.value - hit.value) < 0.001) === index);
  if (unique.length > 1) {
    conflicts.push(`${label} is printed more than once with different values, so none was chosen.`);
    return null;
  }
  return { ...unique[0], kind: "dollars" };
}

export function parseConditionalIncentives(text: string): { name: string; amount: number; condition: string; eligible: boolean | null }[] {
  const out: { name: string; amount: number; condition: string; eligible: boolean | null }[] = [];
  for (const line of (text ?? "").split(/\r?\n/)) {
    if (lineIsInstruction(line) || !/\b(loyalty|conquest)\b/i.test(line)) continue;
    const money = line.match(/\$\s*(\d{1,3}(?:,\d{3})+|\d+)/);
    if (!money) continue;
    const confirmed = /\b(buyer qualifies|eligibility confirmed|you qualify)\b/i.test(line);
    out.push({
      name: /conquest/i.test(line) ? "Conquest" : "Loyalty",
      amount: Number(money[1].replace(/,/g, "")),
      condition: line.trim(),
      eligible: confirmed ? true : null,
    });
  }
  return out;
}

export function parseLeaseQuote(text: string): ParsedLeaseQuote {
  const conflicts: string[] = [];
  const source = text ?? "";
  const moneyFactor = one(
    source,
    /(?:^|\n)\s*(?:money\s*factor|mf)\s*(?:is|of|=|:)\s*(0(?:\.\d+)?|\.\d+)\b/gi,
    "money_factor",
    conflicts,
    "Money factor",
  );
  const buyRateMoneyFactor = one(
    source,
    /^[^\S\r\n]*buy\s*rate(?:\s*money\s*factor)?\s*(?:is|of|=|:)?\s*(0(?:\.\d+)?|\.\d+)\b/gim,
    "money_factor",
    conflicts,
    "Buy-rate money factor",
  );
  const moneyFactorReduction = one(
    source,
    /money\s*factor\s+(?:is\s+)?reduced\s+by\s+(0(?:\.\d+)?|\.\d+)\b/gi,
    "money_factor",
    conflicts,
    "Money-factor reduction",
  );
  const residualPercent = one(
    source,
    /^[^\S\r\n]*residual(?:\s+(?:value|percent|percentage))?\s*(?:is|of|=|:)?\s*(\d{1,2}(?:\.\d+)?)\s*%/gim,
    "percent",
    conflicts,
    "Residual percent",
  );
  const residualDollars = oneMoney(
    source,
    new RegExp(String.raw`^[^\S\r\n]*residual(?:\s+value)?\s*(?:is|of|=|:)?\s*${MONEY}\b(?!\s*%)`, "gim"),
    conflicts,
    "Residual dollars",
  );
  const acquisitionLine = /acquisition\s+fee[^\n]*/i.exec(source);
  const acquisitionFee = oneMoney(
    source,
    new RegExp(String.raw`^[^\S\r\n]*acquisition\s+fee\s*(?:is|of|=|:)?\s*${MONEY}\b`, "gim"),
    conflicts,
    "Acquisition fee",
  );
  let acquisitionFeeCapitalized: boolean | null = null;
  if (acquisitionLine) {
    if (/\bcapitalized\b/i.test(acquisitionLine[0])) acquisitionFeeCapitalized = true;
    else if (/\b(up[\s-]?front|due at signing)\b/i.test(acquisitionLine[0])) acquisitionFeeCapitalized = false;
  }
  const dispositionFee = oneMoney(
    source,
    new RegExp(String.raw`^[^\S\r\n]*disposition\s+fee\s*(?:is|of|=|:)?\s*${MONEY}\b`, "gim"),
    conflicts,
    "Disposition fee",
  );
  const mileageAllowance = one(
    source,
    /(?:mileage\s+allowance|annual\s+mileage)\s*(?:is|of|=|:)?\s*(\d{1,3}(?:,\d{3})+|\d+)\b|(\d{1,3}(?:,\d{3})+|\d+)\s*miles?\s*(?:per|a|\/)\s*year/gi,
    "mileage",
    conflicts,
    "Mileage allowance",
  );
  const excessMileageRate = oneMoney(
    source,
    /excess\s+mileage(?:\s+rate)?\s*(?:is|of|=|:)?\s*\$?\s*(\d+(?:\.\d{1,2})?)\s*(?:\/\s*mile|per mile)?/gi,
    conflicts,
    "Excess mileage",
  );
  const dueAtSigning = oneMoney(
    source,
    new RegExp(String.raw`(?:due\s+at\s+signing|amount\s+due\s+at\s+(?:lease\s+)?signing(?:\s+or\s+delivery)?)\s*(?:is|of|=|:)?\s*${MONEY}\b`, "gi"),
    conflicts,
    "Due at signing",
  );
  const grossCapCost = oneMoney(
    source,
    new RegExp(String.raw`^[^\S\r\n]*gross\s+cap(?:italized)?\s+cost\s*(?:is|of|=|:)?\s*${MONEY}\b`, "gim"),
    conflicts,
    "Gross capitalized cost",
  );
  const adjustedCapCost = oneMoney(
    source,
    new RegExp(String.raw`^[^\S\r\n]*adjusted\s+cap(?:italized)?\s+cost\s*(?:is|of|=|:)?\s*${MONEY}\b`, "gim"),
    conflicts,
    "Adjusted capitalized cost",
  );
  const capCostReduction = oneMoney(
    source,
    new RegExp(String.raw`^[^\S\r\n]*(?:cap(?:italized)?\s+cost\s+reduction|cash\s+cap\s+reduction)\s*(?:is|of|=|:)?\s*${MONEY}\b`, "gim"),
    conflicts,
    "Cap cost reduction",
  );
  const depositCount = one(
    source,
    /(\d+)[ \t]+(?:multiple[ \t]+)?security[ \t]+deposits?\b/gi,
    "count",
    conflicts,
    "Security deposit count",
  );
  const securityDepositAmount = oneMoney(
    source,
    new RegExp(String.raw`(?:security\s+deposits?\s+of|security\s+deposit\s*(?:is|of|=|:)?)\s*${MONEY}\b`, "gi"),
    conflicts,
    "Security deposit",
  );
  const monthlyTax = oneMoney(
    source,
    new RegExp(String.raw`^[^\S\r\n]*(?:monthly\s+tax|tax\s+per\s+month)\s*(?:is|of|=|:)?\s*${MONEY}\b`, "gim"),
    conflicts,
    "Monthly tax",
  );
  const upfrontTax = oneMoney(
    source,
    new RegExp(String.raw`^[^\S\r\n]*upfront\s+tax\s*(?:is|of|=|:)?\s*${MONEY}\b`, "gim"),
    conflicts,
    "Upfront tax",
  );

  let paymentIncludesTax: boolean | null = null;
  const taxBasisText = withoutInstructionLines(source);
  if (/(?:payment[^\n]{0,80}(?:includes|including|with)\s+tax|(?:includes|including|with)\s+tax[^\n]{0,40}payment)/i.test(taxBasisText)) {
    paymentIncludesTax = true;
  } else if (/(?:payment[^\n]{0,80}(?:plus tax|before tax|pre-tax|pretax|excluding tax|excludes tax)|(?:pre-tax|pretax|before tax)[^\n]{0,40}payment)/i.test(taxBasisText)) {
    paymentIncludesTax = false;
  }
  let firstPaymentInDueAtSigning: boolean | null = null;
  const clean = withoutInstructionLines(source);
  if (/first\s+(?:month(?:'s)?\s+)?payment[^\n]{0,40}(?:not included|separate)/i.test(clean)) firstPaymentInDueAtSigning = false;
  else if (/due at signing[^\n]{0,80}includes first payment|first payment (?:is )?included in (?:the )?(?:due at signing|amount due)/i.test(clean)) {
    firstPaymentInDueAtSigning = true;
  }

  return {
    moneyFactor,
    buyRateMoneyFactor,
    moneyFactorReduction,
    residualPercent,
    residualDollars,
    acquisitionFee,
    acquisitionFeeCapitalized,
    dispositionFee,
    mileageAllowance,
    excessMileageRate,
    dueAtSigning,
    grossCapCost,
    adjustedCapCost,
    capCostReduction,
    securityDepositCount: depositCount,
    securityDepositAmount,
    monthlyTax,
    upfrontTax,
    paymentIncludesTax,
    firstPaymentInDueAtSigning,
    rateLimitationNotice: /may not measure the overall cost of financing this lease/i.test(clean),
    conflicts,
  };
}

type LeaseFieldKey =
  | "moneyFactor"
  | "buyRateMoneyFactor"
  | "moneyFactorReduction"
  | "residualPercent"
  | "residualValue"
  | "acquisitionFee"
  | "dispositionFee"
  | "mileageAllowance"
  | "excessMileageRate"
  | "dueAtSigning"
  | "grossCapCost"
  | "adjustedCapCost"
  | "capCostReduction"
  | "securityDepositCount"
  | "securityDepositAmount"
  | "monthlyTax"
  | "upfrontTax";

const PARSED_KEYS: { key: LeaseFieldKey; pick: (parsed: ParsedLeaseQuote) => ParsedLeaseNumber | null }[] = [
  { key: "moneyFactor", pick: (parsed) => parsed.moneyFactor },
  { key: "buyRateMoneyFactor", pick: (parsed) => parsed.buyRateMoneyFactor },
  { key: "moneyFactorReduction", pick: (parsed) => parsed.moneyFactorReduction },
  { key: "residualPercent", pick: (parsed) => parsed.residualPercent },
  { key: "residualValue", pick: (parsed) => parsed.residualDollars },
  { key: "acquisitionFee", pick: (parsed) => parsed.acquisitionFee },
  { key: "dispositionFee", pick: (parsed) => parsed.dispositionFee },
  { key: "mileageAllowance", pick: (parsed) => parsed.mileageAllowance },
  { key: "excessMileageRate", pick: (parsed) => parsed.excessMileageRate },
  { key: "dueAtSigning", pick: (parsed) => parsed.dueAtSigning },
  { key: "grossCapCost", pick: (parsed) => parsed.grossCapCost },
  { key: "adjustedCapCost", pick: (parsed) => parsed.adjustedCapCost },
  { key: "capCostReduction", pick: (parsed) => parsed.capCostReduction },
  { key: "securityDepositCount", pick: (parsed) => parsed.securityDepositCount },
  { key: "securityDepositAmount", pick: (parsed) => parsed.securityDepositAmount },
  { key: "monthlyTax", pick: (parsed) => parsed.monthlyTax },
  { key: "upfrontTax", pick: (parsed) => parsed.upfrontTax },
];

/**
 * Printed lease labels replace model values. A model number with no matching
 * label is removed. Instruction text cannot supply the number.
 */
export function applyParsedLeaseFields(fields: DetectedFields, text: string): DetectedFields {
  const parsed = parseLeaseQuote(text);
  const next: DetectedFields = { ...fields };
  for (const row of PARSED_KEYS) {
    const found = row.pick(parsed);
    (next as Record<string, unknown>)[row.key] = found ? found.value : null;
  }
  next.acquisitionFeeCapitalized = parsed.acquisitionFee ? parsed.acquisitionFeeCapitalized : null;
  next.paymentIncludesTax = parsed.paymentIncludesTax;
  next.firstPaymentInDueAtSigning = parsed.firstPaymentInDueAtSigning;
  next.rateLimitationNotice = parsed.rateLimitationNotice;
  next.conditionalIncentives = parseConditionalIncentives(text);
  if (parsed.acquisitionFee && parsed.acquisitionFeeCapitalized != null) {
    next.fees = (next.fees ?? []).map((fee) => {
      if (!/acquisition/i.test(fee.name)) return fee;
      return { ...fee, capitalized: parsed.acquisitionFeeCapitalized };
    });
  }
  return next;
}

export function leaseFieldSpan(text: string, field: string, amount: number): Pick<ParsedLeaseNumber, "start" | "end" | "raw"> | undefined {
  const parsed = parseLeaseQuote(text);
  const row = PARSED_KEYS.find((item) => item.key === field);
  const found = row?.pick(parsed);
  if (!found) return undefined;
  const tolerance = found.kind === "money_factor" ? 1e-8 : found.kind === "percent" ? 0.001 : 0.01;
  if (Math.abs(found.value - amount) > tolerance) return undefined;
  return { start: found.start, end: found.end, raw: found.raw };
}

export function leaseFieldKind(field: string): LeaseValueKind | undefined {
  switch (field) {
    case "moneyFactor":
    case "buyRateMoneyFactor":
    case "moneyFactorReduction":
      return "money_factor";
    case "residualPercent":
    case "apr":
      return "percent";
    case "mileageAllowance":
      return "mileage";
    case "termMonths":
      return "months";
    case "securityDepositCount":
      return "count";
    case "residualValue":
    case "acquisitionFee":
    case "dispositionFee":
    case "excessMileageRate":
    case "dueAtSigning":
    case "grossCapCost":
    case "adjustedCapCost":
    case "capCostReduction":
    case "securityDepositAmount":
    case "monthlyTax":
    case "upfrontTax":
    case "salePrice":
    case "msrp":
    case "monthlyPayment":
    case "downPayment":
    case "rebates":
      return "dollars";
    default:
      return undefined;
  }
}

export interface LeaseOfferSlice {
  label: string;
  text: string;
}

/** Two or more labeled offers in one message. A single quote is not a comparison. */
export function splitLeaseOffers(text: string): LeaseOfferSlice[] {
  const lines = (text ?? "").split(/\r?\n/);
  const headers: { label: string; line: number }[] = [];
  const header = /^(?:offer|quote)\s+#?\s*([a-z0-9]{1,3})\b/i;
  lines.forEach((line, index) => {
    const match = line.trim().match(header);
    if (!match || lineIsInstruction(line)) return;
    headers.push({ label: `Offer ${match[1].toUpperCase()}`, line: index });
  });
  if (headers.length < 2) return [];
  return headers.map((item, index) => ({
    label: item.label,
    text: lines.slice(item.line, headers[index + 1]?.line ?? lines.length).join("\n"),
  }));
}
