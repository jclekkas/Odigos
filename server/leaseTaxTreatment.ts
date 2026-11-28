/**
 * State lease-tax method.
 *
 * A lease payment may be taxed on each monthly payment, upfront on the total
 * of payments, or on the capitalized cost. None of those methods is applied
 * unless an official source for that state was fetched and recorded here.
 * No state method is on file. The worksheet abstains instead of guessing.
 */

export type LeaseTaxMethod = "monthly_payment" | "upfront_total_payments" | "cap_cost" | "abstain";

export interface LeaseTaxTreatment {
  state: string | null;
  method: LeaseTaxMethod;
  sourceStatus: "sourced" | "needs_source";
  citation: string | null;
  statement: string;
}

export function leaseTaxTreatment(state?: string | null): LeaseTaxTreatment {
  const named = state?.trim().toUpperCase() || null;
  const where = named ? `for ${named}` : "because the quote did not identify a state";
  return {
    state: named,
    method: "abstain",
    sourceStatus: "needs_source",
    citation: null,
    statement: `State lease-tax treatment ${where} was not applied. No fetched official source says whether tax is charged on each monthly payment, upfront on the total of payments, or on the capitalized cost (needs_source). A tax-inclusive payment was not compared with the pre-tax payment.`,
  };
}
