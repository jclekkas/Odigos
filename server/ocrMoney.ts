/**
 * Normalize common OCR / paste damage in dealer quotes before dollar parsing.
 *
 * - `$28,00O` (letter O) becomes `$28,000`
 * - `S3,500` or `S85` (letter S standing in for $) becomes `$3,500` / `$85`
 * - `$l,234.56` and `l85` (letter l standing in for 1) become `$1,234.56` / `185`
 * - `$ 28,000` and `$28, 000` collapse to `$28,000`
 *
 * A percentage such as `7.75%` is not given a dollar sign.
 */

import { roundCents } from "./quoteMath.js";

export interface MoneySpan {
  start: number;
  end: number;
  amount: number;
}

const NUMBER = String.raw`(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d{2})?`;
const MARKED_SOURCE =
  String.raw`(?:(?:USD|US\$)\s*(${NUMBER})|\$\s*(${NUMBER})|(${NUMBER})\s*(?:USD|US\$))`;

const BARE_LABEL =
  /(?:out[\s-]*the[\s-]*door|o\.?t\.?d\.?|fee|fees|charge|charges|price|cost|payment|payoff|rebate|rebates|allowance|msrp|tax|title|registration|license|tag|plate|plates|handling|deposit|down)/i;

function repairDigits(token: string): string {
  return token.replace(/[Oo]/g, "0").replace(/[Il|]/g, "1");
}

function isCleanNumber(token: string): boolean {
  return new RegExp(`^${NUMBER}$`).test(token);
}

export function normalizeOcrMoney(text: string): string {
  let normalized = text.replace(/[\u00a0\u2007\u202f]/g, " ");
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
  const fraction = cents ? Number(cents) / 100 : 0;
  return roundCents(dollars + fraction);
}

function splitNumber(token: string): { whole: string; cents?: string } | null {
  const match = token.match(/^(\d{1,3}(?:,\d{3})+|\d+)(?:\.(\d{2}))?$/);
  if (!match) return null;
  return { whole: match[1], cents: match[2] };
}

function rejectedSuffix(text: string, end: number): boolean {
  const after = text.slice(end);
  return /^\s*(?:%|percent\b|months?\b|miles?\b|mi\b|apr\b|years?\b)/i.test(after);
}

function pushSpan(out: MoneySpan[], start: number, end: number, amount: number | null): void {
  if (amount == null) return;
  if (out.some((span) => start < span.end && end > span.start)) return;
  out.push({ start, end, amount });
}

/**
 * Dollar amounts in one string.
 * Accepts `$1,234.56`, `USD 1,234`, `1,234 USD`, and a bare amount that
 * follows a fee or price label (`Doc fee: 85`, or a tab-separated cell).
 * `7.75%` is not a dollar amount.
 */
export function scanMoney(text: string): MoneySpan[] {
  const out: MoneySpan[] = [];
  const marked = new RegExp(MARKED_SOURCE, "gi");
  for (const match of text.matchAll(marked)) {
    const start = match.index ?? 0;
    const end = start + match[0].length;
    if (rejectedSuffix(text, end)) continue;
    const token = match[1] ?? match[2] ?? match[3];
    if (!token) continue;
    const parts = splitNumber(token);
    if (!parts) continue;
    pushSpan(out, start, end, amountFromParts(parts.whole, parts.cents));
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
    // A colon, tab, equals sign, or a wide gap. A single space is not enough,
    // so "60 months" and "tax 7.75%" are not read as prices.
    if (!/[:\t=]/.test(gap) && !/\s{2,}/.test(gap)) continue;
    const numberIndex = (match.index ?? 0) + match[0].length - token.length;
    const end = numberIndex + token.length;
    if (rejectedSuffix(text, end)) continue;
    if (out.some((span) => numberIndex < span.end && end > span.start)) continue;
    const parts = splitNumber(token);
    if (!parts) continue;
    pushSpan(out, numberIndex, end, amountFromParts(parts.whole, parts.cents));
  }

  out.sort((a, b) => a.start - b.start);
  return out;
}

export function textContainsAmount(text: string, amount: number): boolean {
  return scanMoney(text).some((span) => Math.abs(span.amount - amount) < 0.01);
}

/**
 * A label on one line and its dollar amount on the next is one charge.
 * Lines that already contain a dollar are left as printed.
 */
export function stitchWrappedAmounts(text: string): string {
  const lines = text.split(/\r?\n/);
  const stitched: string[] = [];
  const amountOnly = /^(?:(?:USD|US\$)\s*)?\$?\d[\d,]*(?:\.\d{2})?\s*(?:USD|US\$)?$/i;
  for (let i = 0; i < lines.length; i++) {
    const next = lines[i + 1];
    const labelOnly = scanMoney(lines[i]).length === 0 && /[A-Za-z]/.test(lines[i]);
    const nextTrimmed = next?.trim() ?? "";
    const nextIsAmount = next != null && amountOnly.test(nextTrimmed) && !/%/.test(nextTrimmed);
    if (labelOnly && nextIsAmount) {
      stitched.push(`${lines[i].trim()} ${nextTrimmed}`);
      i += 1;
      continue;
    }
    stitched.push(lines[i]);
  }
  return stitched.join("\n");
}
