/**
 * Where a money or financing figure came from.
 *
 * `dealer_text` means the number was printed in the quote. `start` and `end`
 * are indexes into the normalized quote (after OCR repair and spreadsheet
 * unwrapping), and `raw` is the matched text.
 *
 * `model` means the extractor invented a number that is not in the quote.
 * Those rows are unverified. They are removed from the worksheet and cannot
 * support a GO.
 */

import type { AnalysisDimensions, DetectedFields } from "../shared/schema.js";
import { alignOutputsWithVerdict } from "./verdictOutputs.js";

export type FieldOrigin = "dealer_text" | "model";

export interface FieldProvenance {
  field: string;
  origin: FieldOrigin;
  verified: boolean;
  amount: number | null;
  start?: number;
  end?: number;
  raw?: string;
  /** Money factors, percents, dollars, and mileage are not interchangeable. */
  kind?: "money_factor" | "percent" | "dollars" | "mileage" | "count" | "months";
}

const NUMERIC_FIELDS = [
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
  "grossCapCost",
  "adjustedCapCost",
  "capCostReduction",
  "dueAtSigning",
  "buyRateMoneyFactor",
  "moneyFactorReduction",
  "securityDepositCount",
  "securityDepositAmount",
  "monthlyTax",
  "upfrontTax",
  "tradePayoff",
] as const;

type NumericField = (typeof NUMERIC_FIELDS)[number];

function readNumeric(fields: DetectedFields, field: string): number | null {
  if (field.startsWith("fee:")) {
    const name = field.slice(4);
    const fee = (fields.fees ?? []).find((item) => item.name === name && item.amount != null && Number.isFinite(item.amount));
    return fee?.amount ?? null;
  }
  if (!(NUMERIC_FIELDS as readonly string[]).includes(field)) return null;
  const value = fields[field as NumericField];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

/** Invented figures that are still sitting on the worksheet. */
export function inventedFieldsStillInUse(fields: DetectedFields, provenance: FieldProvenance[]): FieldProvenance[] {
  return provenance.filter((row) => {
    if (row.origin !== "model" || row.verified || row.amount == null) return false;
    const live = readNumeric(fields, row.field);
    if (live == null) return false;
    const tolerance = row.kind === "money_factor" ? 1e-8 : row.kind === "percent" ? 0.05 : 0.01;
    return Math.abs(live - row.amount) <= tolerance;
  });
}

type GoShape = {
  goNoGo: string;
  verdictLabel: string;
  summary: string;
  dealScore: string;
  confidenceLevel: string;
  primaryIssue?: string | null;
  suggestedReply?: string | null;
  reasoning?: string | null;
  dimensions?: AnalysisDimensions | null;
};

/**
 * A GO that still depends on a model-invented money or financing figure is
 * downgraded. Figures already removed from the worksheet are not treated as
 * evidence, so a cash quote can still pass on the numbers the dealer printed.
 */
export function blockGoWhenInventedFieldsRemain<T extends GoShape>(
  result: T,
  fields: DetectedFields,
  provenance: FieldProvenance[],
): T {
  if (result.goNoGo !== "GO") return result;
  const blockers = inventedFieldsStillInUse(fields, provenance);
  if (blockers.length === 0) return result;
  const names = blockers.map((row) => row.field).join(", ");
  const reason = `A financing or money figure was not printed on the dealer quote (${names}) and cannot support a GO.`;
  const reply = `${reason} I am not approving this quote or the selling price. Please send the APR, the term in months, and the amount financed only when they are printed on the quote.`;
  return alignOutputsWithVerdict({
    ...result,
    dealScore: "YELLOW",
    confidenceLevel: "MEDIUM",
    goNoGo: "INSUFFICIENT-INFORMATION",
    verdictLabel: "INSUFFICIENT INFORMATION — UNVERIFIED EXTRACTED TERMS",
    primaryIssue: reason,
    summary: reason,
    suggestedReply: reply,
    reasoning: reason,
  });
}
