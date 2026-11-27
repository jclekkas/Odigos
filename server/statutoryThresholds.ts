/**
 * Dated statutory doc-fee amounts. A value applies only when the quote or
 * analysis date falls inside its effective_from / effective_to window.
 */
import stateFees from "../data/state_fees.json" with { type: "json" };

export interface StatutoryThreshold {
  id: string;
  amount: number | null;
  percent: number | null;
  basis: string | null;
  condition: string | null;
  effective_from: string;
  effective_to: string | null;
  statutoryReference: string;
  officialSource: string;
  lastVerificationDate: string;
}

export interface ThresholdGap {
  abbreviation: string;
  name: string;
  reason: "effective_to_passed" | "no_value_for_current_year";
  thresholdId: string | null;
  effective_to: string | null;
  detail: string;
}

interface ThresholdState {
  name: string;
  abbreviation: string;
  statutoryThresholds?: StatutoryThreshold[];
}

const states = (stateFees as { states: Record<string, ThresholdState> }).states;

export function utcDateOnly(value: string | Date): string {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "invalid";
  return date.toISOString().slice(0, 10);
}

export function thresholdCovers(
  threshold: { effective_from: string; effective_to: string | null },
  day: string,
): boolean {
  if (day < threshold.effective_from) return false;
  if (threshold.effective_to && day > threshold.effective_to) return false;
  return true;
}

function rangesOverlap(from: string, to: string | null, start: string, end: string): boolean {
  const effectiveTo = to ?? "9999-12-31";
  return from <= end && effectiveTo >= start;
}

export function activeThresholds(
  thresholds: StatutoryThreshold[] | undefined,
  asOf: string | Date | null | undefined,
): StatutoryThreshold[] {
  const day = utcDateOnly(asOf ?? new Date());
  return (thresholds ?? []).filter((threshold) => thresholdCovers(threshold, day));
}

export function listPassedThresholds(asOf: string | Date = new Date()): Array<StatutoryThreshold & { abbreviation: string; name: string }> {
  const day = utcDateOnly(asOf);
  const passed: Array<StatutoryThreshold & { abbreviation: string; name: string }> = [];
  for (const state of Object.values(states)) {
    for (const threshold of state.statutoryThresholds ?? []) {
      if (threshold.effective_to && threshold.effective_to < day) {
        passed.push({ ...threshold, abbreviation: state.abbreviation, name: state.name });
      }
    }
  }
  return passed;
}

/**
 * Gaps worth a startup warning: a dollar threshold that ended and has no
 * later successor for the same condition, or a scheduled state with no dollar
 * amount covering the calendar year of `asOf`. Superseded rows (a later window
 * exists) are listed by listPassedThresholds and are not repeated here.
 */
export function findStatutoryThresholdGaps(asOf: string | Date = new Date()): ThresholdGap[] {
  const day = utcDateOnly(asOf);
  const year = day.slice(0, 4);
  const yearStart = `${year}-01-01`;
  const yearEnd = `${year}-12-31`;
  const gaps: ThresholdGap[] = [];

  for (const state of Object.values(states)) {
    const thresholds = state.statutoryThresholds ?? [];
    if (thresholds.length === 0) continue;
    const dollars = thresholds.filter((threshold) => threshold.amount != null);

    for (const threshold of dollars) {
      if (!threshold.effective_to || threshold.effective_to >= day) continue;
      const successor = dollars.some(
        (other) =>
          other.id !== threshold.id &&
          other.condition === threshold.condition &&
          other.effective_from > threshold.effective_to!,
      );
      if (!successor) {
        gaps.push({
          abbreviation: state.abbreviation,
          name: state.name,
          reason: "effective_to_passed",
          thresholdId: threshold.id,
          effective_to: threshold.effective_to,
          detail: `${state.abbreviation} threshold ${threshold.id} ended ${threshold.effective_to}, before ${day}, and no later amount is on file.`,
        });
      }
    }

    const coversYear = dollars.some((threshold) =>
      rangesOverlap(threshold.effective_from, threshold.effective_to, yearStart, yearEnd),
    );
    if (!coversYear) {
      gaps.push({
        abbreviation: state.abbreviation,
        name: state.name,
        reason: "no_value_for_current_year",
        thresholdId: null,
        effective_to: null,
        detail: `${state.abbreviation} has no documentation-fee dollar threshold covering calendar year ${year}.`,
      });
    }
  }

  return gaps;
}

export function logStatutoryThresholdGaps(
  warn: (message: string, fields: Record<string, unknown>) => void,
  asOf: string | Date = new Date(),
): ThresholdGap[] {
  const gaps = findStatutoryThresholdGaps(asOf);
  if (gaps.length > 0) {
    warn("statutory doc-fee thresholds need review", {
      count: gaps.length,
      gaps: gaps.map((gap) => gap.detail),
    });
  }
  return gaps;
}
