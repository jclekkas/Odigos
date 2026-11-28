/**
 * Which calendar day selects a dated statutory fee ceiling.
 *
 * A transaction date printed on the quote wins. Otherwise the analysis date
 * is used, and the summary says which one and why.
 */

const MONTHS: Record<string, number> = {
  january: 1, jan: 1,
  february: 2, feb: 2,
  march: 3, mar: 3,
  april: 4, apr: 4,
  may: 5,
  june: 6, jun: 6,
  july: 7, jul: 7,
  august: 8, aug: 8,
  september: 9, sep: 9, sept: 9,
  october: 10, oct: 10,
  november: 11, nov: 11,
  december: 12, dec: 12,
};

const LABELED_DATE =
  /\b(?:transaction|contract|sale|purchase|deal)\s+date\s*[:\-]?\s*([A-Za-z]+\.?\s+\d{1,2},\s*\d{4}|\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4})/i;

const LINE_DATE =
  /(?:^|\n)\s*date\s*[:\-]\s*([A-Za-z]+\.?\s+\d{1,2},\s*\d{4}|\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4})/i;

export interface ResolvedTransactionDate {
  /** YYYY-MM-DD in UTC. */
  day: string;
  source: "transaction_date" | "analysis_date";
  explanation: string;
}

export function formatLongDate(day: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(day);
  if (!match) return day;
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function parseCalendarDay(raw: string): string | null {
  const text = raw.trim().replace(/\s+/g, " ");
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
  if (iso) return validDay(iso[1], iso[2], iso[3]);
  const slash = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(text);
  if (slash) return validDay(slash[3], slash[1].padStart(2, "0"), slash[2].padStart(2, "0"));
  const named = /^([A-Za-z]+)\.?\s+(\d{1,2}),\s*(\d{4})$/.exec(text);
  if (!named) return null;
  const month = MONTHS[named[1].toLowerCase()];
  if (!month) return null;
  return validDay(named[3], String(month).padStart(2, "0"), named[2].padStart(2, "0"));
}

function validDay(year: string, month: string, day: string): string | null {
  const y = Number(year);
  const m = Number(month);
  const d = Number(day);
  if (!Number.isInteger(y) || m < 1 || m > 12 || d < 1 || d > 31) return null;
  const probe = new Date(Date.UTC(y, m - 1, d));
  if (probe.getUTCFullYear() !== y || probe.getUTCMonth() !== m - 1 || probe.getUTCDate() !== d) return null;
  return `${year}-${month}-${day}`;
}

function analysisDay(asOf: string | Date | null | undefined): string {
  if (typeof asOf === "string" && /^\d{4}-\d{2}-\d{2}$/.test(asOf)) return asOf;
  const date = asOf instanceof Date ? asOf : typeof asOf === "string" ? new Date(asOf) : new Date();
  if (Number.isNaN(date.getTime())) return new Date().toISOString().slice(0, 10);
  return date.toISOString().slice(0, 10);
}

export function resolveTransactionDate(
  dealerText: string | null | undefined,
  analysisAsOf: string | Date | null | undefined,
): ResolvedTransactionDate {
  const analysis = analysisDay(analysisAsOf);
  const labeled = dealerText ? LABELED_DATE.exec(dealerText) ?? LINE_DATE.exec(dealerText) : null;
  const printed = labeled ? parseCalendarDay(labeled[1]) : null;
  if (printed) {
    const long = formatLongDate(printed);
    return {
      day: printed,
      source: "transaction_date",
      explanation: `Statutory ceilings use ${long} because that transaction date is printed on the quote. The analysis date was not used for the fee ceiling.`,
    };
  }
  const long = formatLongDate(analysis);
  return {
    day: analysis,
    source: "analysis_date",
    explanation: `Statutory ceilings use ${long}, the analysis date, because the quote does not print a transaction date.`,
  };
}

/** Ohio and Pennsylvania ceilings change on a calendar date. */
export function stateUsesDatedCeiling(abbreviation: string | null | undefined): boolean {
  const code = abbreviation?.toUpperCase();
  return code === "OH" || code === "PA";
}
