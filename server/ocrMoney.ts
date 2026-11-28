/**
 * Normalize common OCR / paste damage in dealer quotes before dollar parsing.
 *
 * - `$28,00O` (letter O) becomes `$28,000`
 * - `S3,500` or `S85` (letter S standing in for $) becomes `$3,500` / `$85`
 * - `$l,234.56` and `l85` (letter l standing in for 1) become `$1,234.56` / `185`
 * - `$ 28,000` and `$28, 000` collapse to `$28,000`
 * - A single decimal digit is cents of a dime: `$450.5` is `$450.50`
 * - Credits and rebates may be negative: `-$500`, `($500)`, `500-`, `credit 500`
 * - A spreadsheet cell may wrap the amount across a line, a tab, or quotes
 *
 * A percentage such as `7.75%` is not given a dollar sign.
 */

import { roundCents } from "./quoteMath.js";

export interface MoneySpan {
  start: number;
  end: number;
  amount: number;
}

const NUMBER_BODY = String.raw`(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d{1,2})?`;
/** One or two decimal digits. A third digit means this is not a currency token. */
const NUMBER = String.raw`${NUMBER_BODY}(?!\d)(?!\.\d)`;
const MARKED_SOURCE =
  String.raw`(?:(?:USD|US\$)\s*(${NUMBER})|\$\s*(${NUMBER})|(${NUMBER})\s*(?:USD|US\$))`;

const BARE_LABEL =
  /(?:out[\s-]*the[\s-]*door|o\.?t\.?d\.?|fee|fees|charge|charges|price|cost|payment|payoff|rebate|rebates|allowance|msrp|tax|title|registration|license|tag|plate|plates|handling|deposit|down|credit)/i;

const CREDIT_WORD =
  /\bcredit\b(?!\s+(?:score|card|report|application|check|approval)\b)/i;

function repairDigits(token: string): string {
  return token.replace(/[Oo]/g, "0").replace(/[Il|]/g, "1");
}

function isCleanNumber(token: string): boolean {
  return new RegExp(`^${NUMBER_BODY}$`).test(token);
}

/**
 * Pull a quoted spreadsheet cell onto one line.
 * Cells may split a label and an amount across newlines, tabs, or quotes.
 */
export function unwrapSpreadsheetCells(text: string): string {
  let out = "";
  let i = 0;
  while (i < text.length) {
    const prev = i === 0 ? "\n" : text[i - 1];
    if (text[i] === '"' && /[\n\r\t,]/.test(prev)) {
      i += 1;
      let cell = "";
      let closed = false;
      while (i < text.length) {
        if (text[i] === '"') {
          if (text[i + 1] === '"') {
            cell += '"';
            i += 2;
            continue;
          }
          i += 1;
          closed = true;
          break;
        }
        const ch = text[i];
        cell += ch === "\n" || ch === "\r" || ch === "\t" ? " " : ch;
        i += 1;
      }
      out += closed ? cell : `"${cell}`;
      continue;
    }
    out += text[i];
    i += 1;
  }

  const lines = out.split(/\r?\n/);
  const joined: string[] = [];
  for (let line = 0; line < lines.length; line++) {
    const trimmed = lines[line].trim();
    const next = lines[line + 1]?.trim() ?? "";
    if (/^(?:\(\s*)?(?:USD|US\$|\$)\s*$/.test(trimmed) && /^\d/.test(next)) {
      joined.push(`${lines[line].trimEnd()} ${next}`);
      line += 1;
      continue;
    }
    joined.push(lines[line]);
  }
  return joined.join("\n");
}

export function normalizeOcrMoney(text: string): string {
  let normalized = unwrapSpreadsheetCells(text).replace(/[\u00a0\u2007\u202f]/g, " ");
  normalized = normalized.replace(/\$\s+(?=[0-9OoIl|])/g, "$");
  normalized = normalized.replace(/\$(\d{1,3}),\s+(\d{3})\b/g, "$$$1,$2");
  normalized = normalized.replace(
    /(^|[\s:(])S(?=[0-9OlI|])/g,
    "$1$",
  );
  normalized = normalized.replace(/\$([0-9OoIl|,.]+)/g, (match, token: string) => {
    if (!/[OoIl|]/.test(token)) return match;
    if (!/\d/.test(token)) return match;
    const repaired = repairDigits(token);
    return isCleanNumber(repaired) ? `$${repaired}` : match;
  });
  normalized = normalized.replace(
    /(^|[\s:(\t])([Il|][0-9OoIl|,.]{1,}|[0-9][0-9OoIl|,.]*)(?=$|[\s)\t,;])/g,
    (match, prefix: string, token: string) => {
      if (!/[OoIl|]/.test(token) || !/\d/.test(token)) return match;
      const repaired = repairDigits(token);
      return isCleanNumber(repaired) ? `${prefix}${repaired}` : match;
    },
  );
  return normalized;
}

function amountFromParts(whole: string, cents: string | undefined): number | null {
  const dollars = Number(whole.replace(/,/g, ""));
  if (!Number.isFinite(dollars)) return null;
  let fraction = 0;
  if (cents) {
    fraction = cents.length === 1 ? Number(cents) / 10 : Number(cents) / 100;
  }
  return roundCents(dollars + fraction);
}

function splitNumber(token: string): { whole: string; cents?: string } | null {
  const match = token.match(/^(\d{1,3}(?:,\d{3})+|\d+)(?:\.(\d{1,2}))?$/);
  if (!match) return null;
  if (match[2] && token.includes(".") && /\.\d{3,}/.test(token)) return null;
  return { whole: match[1], cents: match[2] };
}

function rejectedSuffix(text: string, end: number): boolean {
  const after = text.slice(end);
  // Stay on this line. A later line that starts with "APR" is not a suffix of this amount.
  return /^[^\S\n]*(?:%|percent\b|months?\b|miles?\b|mi\b|apr\b|years?\b)/i.test(after);
}

function trailingMinus(text: string, end: number): boolean {
  return /^[^\S\n]*-(?![^\S\n]*\d)/.test(text.slice(end));
}

function pushSpan(out: MoneySpan[], start: number, end: number, amount: number | null): void {
  if (amount == null || !Number.isFinite(amount)) return;
  if (out.some((span) => start < span.end && end > span.start)) return;
  out.push({ start, end, amount });
}

function creditContext(text: string, start: number): boolean {
  const before = text.slice(Math.max(0, start - 48), start);
  return CREDIT_WORD.test(before) || /\brebates?\b/i.test(before);
}

/**
 * Dollar amounts in one string.
 * Accepts `$1,234.56`, `$450.5`, `USD 1,234`, `1,234 USD`, a bare labeled
 * amount (`Doc fee 85` or `Doc fee: 85`), and a credit written as `-$500`,
 * `($500)`, `500-`, or `credit 500`.
 * `7.75%` is not a dollar amount.
 */
export function scanMoney(text: string): MoneySpan[] {
  const out: MoneySpan[] = [];

  const paren = new RegExp(
    String.raw`\(\s*((?:USD|US\$|\$)\s*)?(${NUMBER})\s*\)`,
    "gi",
  );
  for (const match of text.matchAll(paren)) {
    const start = match.index ?? 0;
    const end = start + match[0].length;
    const token = match[2];
    if (!token) continue;
    const hasDollar = Boolean(match[1]);
    const hasCents = token.includes(".");
    if (!hasDollar && !hasCents && !creditContext(text, start)) continue;
    const amount = parseTokenAmount(token);
    if (amount == null) continue;
    pushSpan(out, start, end, -Math.abs(amount));
  }

  const leadingMinus = new RegExp(
    String.raw`-\s*(?:(?:USD|US\$)\s*|\$\s*)(${NUMBER})`,
    "gi",
  );
  for (const match of text.matchAll(leadingMinus)) {
    const start = match.index ?? 0;
    const end = start + match[0].length;
    if (rejectedSuffix(text, end)) continue;
    const amount = parseTokenAmount(match[1] ?? "");
    pushSpan(out, start, end, amount == null ? null : -Math.abs(amount));
  }

  const credit = new RegExp(
    String.raw`\bcredit\b(?!\s+(?:score|card|report|application|check|approval)\b)[^0-9\n%]{0,24}?(?:(?:USD|US\$)\s*|\$\s*)?(${NUMBER})`,
    "gi",
  );
  for (const match of text.matchAll(credit)) {
    const token = match[1];
    if (!token) continue;
    const numberIndex = (match.index ?? 0) + match[0].length - token.length;
    const end = numberIndex + token.length;
    if (rejectedSuffix(text, end)) continue;
    const amount = parseTokenAmount(token);
    pushSpan(out, numberIndex, trailingMinus(text, end) ? endOfMinus(text, end) : end, amount == null ? null : -Math.abs(amount));
  }

  const cellMinus = new RegExp(
    String.raw`(^|[\n\t,])\s*(${NUMBER})\s*-(?!\s*\d)`,
    "g",
  );
  for (const match of text.matchAll(cellMinus)) {
    const token = match[2];
    if (!token) continue;
    const rawStart = (match.index ?? 0) + (match[1]?.length ?? 0);
    const slice = text.slice(rawStart, (match.index ?? 0) + match[0].length);
    const tokenAt = slice.lastIndexOf(token);
    const start = rawStart + (tokenAt < 0 ? 0 : tokenAt);
    const end = (match.index ?? 0) + match[0].length;
    if (rejectedSuffix(text, start + token.length)) continue;
    const amount = parseTokenAmount(token);
    pushSpan(out, start, end, amount == null ? null : -Math.abs(amount));
  }

  const marked = new RegExp(MARKED_SOURCE, "gi");
  for (const match of text.matchAll(marked)) {
    const start = match.index ?? 0;
    let end = start + match[0].length;
    if (rejectedSuffix(text, end)) continue;
    const token = match[1] ?? match[2] ?? match[3];
    if (!token) continue;
    let amount = parseTokenAmount(token);
    if (amount == null) continue;
    if (trailingMinus(text, end)) {
      amount = -Math.abs(amount);
      end = endOfMinus(text, end);
    } else if (hasLeadingMinus(text, start)) {
      continue;
    }
    pushSpan(out, start, end, amount);
  }

  const bare = new RegExp(
    String.raw`(${BARE_LABEL.source})([^0-9%\n]{0,40}?)(?<!\$)\b(${NUMBER})`,
    "gi",
  );
  for (const match of text.matchAll(bare)) {
    const label = match[1] ?? "";
    const gap = match[2] ?? "";
    const token = match[3];
    if (!token) continue;
    if (/\brate\b/i.test(`${label}${gap}`)) continue;
    if (/\bcredit\b/i.test(label) && /\b(?:score|card|report|application|check|approval)\b/i.test(`${label}${gap}`)) continue;
    const separated = /[:\t=]/.test(gap) || /\s/.test(gap);
    if (!separated) continue;
    let numberIndex = (match.index ?? 0) + match[0].length - token.length;
    let end = numberIndex + token.length;
    if (rejectedSuffix(text, end)) continue;
    if (/^(?:19|20)\d{2}$/.test(token) && /^\s+[A-Za-z]/.test(text.slice(end))) continue;
    if (out.some((span) => numberIndex < span.end && end > span.start)) continue;
    let amount = parseTokenAmount(token);
    if (amount == null) continue;
    const credit = CREDIT_WORD.test(label) || /\brebates?\b/i.test(label);
    if (trailingMinus(text, end)) {
      amount = -Math.abs(amount);
      end = endOfMinus(text, end);
    } else if (credit) {
      amount = -Math.abs(amount);
    }
    pushSpan(out, numberIndex, end, amount);
  }

  out.sort((a, b) => a.start - b.start);
  return out;
}

function parseTokenAmount(token: string): number | null {
  const parts = splitNumber(token);
  if (!parts) return null;
  return amountFromParts(parts.whole, parts.cents);
}

function endOfMinus(text: string, end: number): number {
  const match = text.slice(end).match(/^[^\S\n]*-/);
  return end + (match?.[0].length ?? 0);
}

function hasLeadingMinus(text: string, start: number): boolean {
  return /-\s*$/.test(text.slice(Math.max(0, start - 3), start));
}

export function textContainsAmount(text: string, amount: number): boolean {
  return scanMoney(text).some((span) => Math.abs(span.amount - amount) < 0.01);
}

/**
 * A label on one line and its dollar amount on the next is one charge.
 * Lines that already contain a dollar are left as printed.
 * Quotes around a spreadsheet cell are ignored when the next line is only an amount.
 */
export function stitchWrappedAmounts(text: string): string {
  const lines = text.split(/\r?\n/);
  const stitched: string[] = [];
  const amountOnly = /^[\s"']*(?:\(\s*)?(?:(?:USD|US\$)\s*)?-?\$?\d[\d,]*(?:\.\d{1,2})?\s*-?\s*\)?\s*(?:USD|US\$)?[\s"']*$/i;
  for (let i = 0; i < lines.length; i++) {
    const next = lines[i + 1];
    const labelOnly = scanMoney(lines[i]).length === 0 && /[A-Za-z]/.test(lines[i]);
    const nextTrimmed = (next ?? "").trim().replace(/^["']+|["']+$/g, "");
    const nextIsAmount = next != null && amountOnly.test(next.trim()) && !/%/.test(nextTrimmed);
    if (labelOnly && nextIsAmount) {
      stitched.push(`${lines[i].trim()} ${nextTrimmed}`);
      i += 1;
      continue;
    }
    stitched.push(lines[i]);
  }
  return stitched.join("\n");
}

/** OCR repair, spreadsheet unwrap, and wrapped amount stitch, in that order. */
export function prepareQuoteText(text: string): string {
  return stitchWrappedAmounts(normalizeOcrMoney(text ?? ""));
}
