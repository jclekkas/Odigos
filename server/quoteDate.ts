/**
 * The day used for a date-based fee limit.
 *
 * A single transaction or quote date written on the quote is that day.
 * If the quote does not state one, the analysis date is used and labeled
 * as the analysis date. Two different dates are a conflict: neither is
 * treated as the quote date.
 */

import { utcDateOnly } from "./statutoryThresholds.js";

export type ThresholdDateSource = "quote" | "analysis" | "conflict";

export interface ResolvedThresholdDate {
  asOf: string;
  source: ThresholdDateSource;
  quoteDates: string[];
}

const MONTHS: Record<string, number> = {
  january: 1,
  jan: 1,
  february: 2,
  feb: 2,
  march: 3,
  mar: 3,
  april: 4,
  apr: 4,
  may: 5,
  june: 6,
  jun: 6,
  july: 7,
  jul: 7,
  august: 8,
  aug: 8,
  september: 9,
  sept: 9,
  sep: 9,
  october: 10,
  oct: 10,
  november: 11,
  nov: 11,
  december: 12,
  dec: 12,
};

const DATE_TOKEN = String.raw`\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4}|[A-Za-z]+\s+\d{1,2},?\s+\d{4}`;
const LABELED_DATE = new RegExp(
  String.raw`(?:quote|transaction|contract|buyer'?s\s+order|purchase\s+agreement|invoice|sale)\s+date\s*[:#-.]?\s*(${DATE_TOKEN})`,
  "gi",
);
const ISO_DATE = /\b(\d{4}-\d{2}-\d{2})\b/g;
const MDY_DATE = /\b(\d{1,2}\/\d{1,2}\/\d{4})\b/g;
const MONTH_DATE = /\b((?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)\s+\d{1,2},?\s+\d{4})\b/gi;

function calendarDay(year: number, month: number, day: number): string | null {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return null;
  if (year < 1990 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) return null;
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  const monthText = String(month).padStart(2, "0");
  const dayText = String(day).padStart(2, "0");
  return `${year}-${monthText}-${dayText}`;
}

export function parseQuoteDateToken(raw: string): string | null {
  const text = raw.trim();
  const iso = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) return calendarDay(Number(iso[1]), Number(iso[2]), Number(iso[3]));
  const mdy = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (mdy) return calendarDay(Number(mdy[3]), Number(mdy[1]), Number(mdy[2]));
  const month = text.match(/^([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})$/);
  if (!month) return null;
  const monthNumber = MONTHS[month[1].toLowerCase()];
  if (!monthNumber) return null;
  return calendarDay(Number(month[3]), monthNumber, Number(month[2]));
}

function uniqueDays(tokens: string[]): string[] {
  const days: string[] = [];
  for (const token of tokens) {
    const day = parseQuoteDateToken(token);
    if (day && !days.includes(day)) days.push(day);
  }
  return days;
}

function collect(pattern: RegExp, text: string): string[] {
  const flags = pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`;
  return [...text.matchAll(new RegExp(pattern.source, flags))].map((match) => match[1]).filter((token): token is string => !!token);
}

export function resolveThresholdDate(
  dealerText: string | null | undefined,
  analysisDate: string | Date,
): ResolvedThresholdDate {
  const analysisDay = utcDateOnly(analysisDate);
  const text = dealerText ?? "";
  const labeled = uniqueDays(collect(LABELED_DATE, text));
  if (labeled.length === 1) return { asOf: labeled[0], source: "quote", quoteDates: labeled };
  if (labeled.length > 1) return { asOf: analysisDay, source: "conflict", quoteDates: labeled };
  const unlabeled = uniqueDays([
    ...collect(ISO_DATE, text),
    ...collect(MDY_DATE, text),
    ...collect(MONTH_DATE, text),
  ]);
  if (unlabeled.length === 1) return { asOf: unlabeled[0], source: "quote", quoteDates: unlabeled };
  if (unlabeled.length > 1) return { asOf: analysisDay, source: "conflict", quoteDates: unlabeled };
  return { asOf: analysisDay, source: "analysis", quoteDates: [] };
}

/**
 * The quote date wins when the text states one. A caller-supplied day is
 * used only when the quote does not state a date. A conflict in the text
 * is not replaced by a caller-supplied day.
 */
export function thresholdDateForAnalysis(input: {
  dealerText?: string | null;
  asOf?: string | Date | null;
  asOfSource?: ThresholdDateSource | null;
}): { asOf: string | Date; asOfSource?: ThresholdDateSource; asOfConflictDates?: string[] } {
  const fallback = input.asOf ?? new Date();
  const analysisDate = fallback instanceof Date ? fallback : new Date(fallback);
  const fromText = resolveThresholdDate(input.dealerText, Number.isNaN(analysisDate.getTime()) ? new Date() : analysisDate);
  if (fromText.source === "quote" || fromText.source === "conflict") {
    return {
      asOf: fromText.asOf,
      asOfSource: fromText.source,
      asOfConflictDates: fromText.source === "conflict" ? fromText.quoteDates : undefined,
    };
  }
  if (input.asOfSource === "quote" || input.asOfSource === "analysis" || input.asOfSource === "conflict") {
    return { asOf: fallback, asOfSource: input.asOfSource };
  }
  return { asOf: fallback };
}
