/**
 * Deterministic closed-end lease worksheet.
 *
 * Nothing is filled in. A missing term is not 36 months, a missing fee is not
 * $0, a missing drive-off is not $0, and a missing capitalized cost is not the
 * MSRP or the selling price. A money factor of exactly 0 is a real rate: the
 * rent charge is zero.
 *
 * Standard money-factor identity, rounded half-up to the cent on each piece:
 *   monthly depreciation = (adjusted cap cost − residual) / term
 *   monthly rent charge  = (adjusted cap cost + residual) × money factor
 *   base payment         = depreciation + rent charge
 *   APR equivalent       = money factor × 2400
 *
 * An after-tax payment is compared only with an after-tax figure, and a
 * pre-tax payment only with the base payment. State tax methods are not
 * applied here; see leaseTaxTreatment.
 */

import type { DetectedFields, Fee } from "../shared/schema.js";
import { roundCents } from "./quoteMath.js";
import { leaseTaxTreatment, type LeaseTaxTreatment } from "./leaseTaxTreatment.js";
import { coverLeaseDisclosures, type LeaseDisclosureCoverage } from "./leaseDisclosures.js";

export interface ConditionalIncentive {
  name: string;
  amount: number;
  condition: string;
  /** True only when the quote says the buyer qualifies. */
  eligible: boolean | null;
}

export interface LeaseWorksheetInput {
  msrp: number | null;
  sellingPrice: number | null;
  statedGrossCapCost: number | null;
  statedAdjustedCapCost: number | null;
  /** Null when the quote does not say which fees are capitalized. */
  capitalizedFees: number | null;
  /** Null when the quote does not say which fees are paid upfront. */
  upfrontFees: number | null;
  /** Unconditional rebates applied to the cap. Null when rebates were not stated. */
  rebates: number | null;
  conditionalIncentives: ConditionalIncentive[];
  /** Cash capitalized-cost reduction. Null when it was not stated. Zero is stated. */
  capCostReductionCash: number | null;
  tradeAllowance: number | null;
  tradePayoff: number | null;
  /** Null when missing. Zero is a stated money factor. */
  moneyFactor: number | null;
  /** Buy rate printed on the quote. A stored brand table is never passed here. */
  statedBuyRateMoneyFactor: number | null;
  residualPercent: number | null;
  residualDollars: number | null;
  termMonths: number | null;
  annualMileage: number | null;
  dispositionFee: number | null;
  excessMileageRate: number | null;
  quotedPayment: number | null;
  /** Null when the quote does not say whether the payment includes tax. */
  paymentIncludesTax: boolean | null;
  /** Tax dollars inside or added to one payment. Not a tax rate. */
  statedMonthlyTax: number | null;
  statedUpfrontTax: number | null;
  dueAtSigningStated: number | null;
  /** Null when the quote does not say whether the first payment is in the drive-off. */
  firstPaymentInDueAtSigning: boolean | null;
  securityDepositCount: number | null;
  securityDepositAmount: number | null;
  /** Total reduction in the money factor. Applied only when this number is stated. */
  statedMoneyFactorReduction: number | null;
  stateCode: string | null;
  vehicleNamed: boolean;
  saysLease: boolean;
  percentageRateStated: boolean;
  rateLimitationNotice: boolean;
}

export interface LeaseMoneyLine {
  amount: number | null;
  reason: string | null;
}

export interface LeaseWorksheet {
  msrp: number | null;
  sellingPrice: number | null;
  grossCapCost: number | null;
  adjustedCapCost: number | null;
  capCostContradiction: boolean;
  capCostDisclosed: boolean;
  capitalizedFees: number | null;
  upfrontFees: number | null;
  rebatesApplied: number | null;
  conditionalIncentives: ConditionalIncentive[];
  conditionalIncentiveUnconfirmed: boolean;
  capCostReduction: number | null;
  tradeEquity: number | null;
  negativeEquity: number | null;
  moneyFactor: number | null;
  aprEquivalent: number | null;
  statedBuyRateMoneyFactor: number | null;
  /** Set only when the quote itself prints both a buy rate and a higher money factor. */
  disclosedMarkup: {
    chargedMoneyFactor: number;
    buyRateMoneyFactor: number;
    difference: number;
    aprEquivalentCharged: number;
    aprEquivalentBuyRate: number;
    extraRentPerMonth: number | null;
    extraRentOverTerm: number | null;
  } | null;
  residualPercent: number | null;
  residualDollars: number | null;
  residualContradiction: boolean;
  termMonths: number | null;
  annualMileage: number | null;
  depreciationMonthly: number | null;
  rentChargeMonthly: number | null;
  baseMonthlyPayment: number | null;
  afterTaxMonthlyPayment: number | null;
  taxTreatment: LeaseTaxTreatment;
  paymentTaxBasis: "pre_tax" | "after_tax" | "unknown";
  paymentComparison: {
    compared: boolean;
    basis: "pre_tax" | "after_tax" | null;
    expected: number | null;
    quoted: number | null;
    discrepancy: number | null;
    reason: string;
  };
  dueAtSigning: {
    stated: number | null;
    computed: number | null;
    reconciles: boolean | null;
    discrepancy: number | null;
    firstPayment: number | null;
    upfrontFees: number | null;
    taxes: number | null;
    capReduction: number | null;
    securityDeposits: number | null;
    reason: string | null;
  };
  securityDeposits: {
    count: number | null;
    amountEach: number | null;
    total: number | null;
    refundable: boolean | null;
    statedMoneyFactorReduction: number | null;
    reductionApplied: boolean;
    note: string;
  };
  totalContractualCost: number | null;
  effectiveMonthlyCost: number | null;
  dispositionFee: number | null;
  excessMileageRate: number | null;
  advertisedPaymentIsNotFullCost: boolean;
  missingTerm: boolean;
  undisclosedCapCost: boolean;
  dealerQuestions: string[];
  disclosures: LeaseDisclosureCoverage[];
  derivation: string[];
  abstentions: string[];
}

function isNum(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function money(value: number | null, label: string, abstentions: string[]): number | null {
  if (value == null) {
    abstentions.push(`${label} was not stated, so it was not treated as zero.`);
    return null;
  }
  if (!isNum(value) || value < 0) {
    abstentions.push(`${label} is not a usable non-negative amount.`);
    return null;
  }
  return roundCents(value);
}

export function moneyFactorApr(moneyFactor: number): number {
  return Math.round(moneyFactor * 2400 * 100) / 100;
}

function nearly(a: number, b: number, tolerance = 0.05): boolean {
  return Math.abs(a - b) <= tolerance;
}

export function computeLeaseWorksheet(input: LeaseWorksheetInput): LeaseWorksheet {
  const abstentions: string[] = [];
  const derivation: string[] = [];
  const dealerQuestions: string[] = [];

  const taxTreatment = leaseTaxTreatment(input.stateCode);
  abstentions.push(taxTreatment.statement);

  const msrp = input.msrp == null ? null : money(input.msrp, "MSRP", abstentions);
  const sellingPrice = input.sellingPrice == null ? null : money(input.sellingPrice, "Selling price", abstentions);
  const capitalizedFees = input.capitalizedFees == null ? null : money(input.capitalizedFees, "Capitalized fees", abstentions);
  const upfrontFees = input.upfrontFees == null ? null : money(input.upfrontFees, "Upfront fees", abstentions);
  const rebates = input.rebates == null ? null : money(input.rebates, "Rebates", abstentions);
  const capCash = input.capCostReductionCash == null
    ? null
    : money(input.capCostReductionCash, "Capitalized cost reduction", abstentions);

  const incentives = input.conditionalIncentives.filter((item) => isNum(item.amount) && item.amount > 0);
  const conditionalIncentiveUnconfirmed = incentives.some((item) => item.eligible !== true);
  if (conditionalIncentiveUnconfirmed) {
    abstentions.push("A conditional incentive was kept off the capitalized cost because eligibility was not confirmed.");
    dealerQuestions.push("Ask the dealer which rebates require loyalty, conquest, or financing, and which of those the buyer qualifies for.");
  }
  const rebatesApplied = rebates;

  let tradeEquity: number | null = null;
  let negativeEquity: number | null = null;
  const tradeMentioned = input.tradeAllowance != null || input.tradePayoff != null;
  if (tradeMentioned) {
    if (input.tradeAllowance == null || input.tradePayoff == null) {
      abstentions.push("Trade equity was not computed because the allowance or the payoff was missing. Neither was treated as zero.");
      dealerQuestions.push("Ask the dealer for the trade allowance and the payoff as separate amounts.");
    } else if (input.tradeAllowance < 0 || input.tradePayoff < 0) {
      abstentions.push("Trade allowance and payoff have to be zero or positive.");
    } else {
      tradeEquity = roundCents(input.tradeAllowance - input.tradePayoff);
      negativeEquity = tradeEquity < 0 ? roundCents(-tradeEquity) : 0;
      derivation.push(`Trade equity $${tradeEquity.toFixed(2)} (allowance $${input.tradeAllowance.toFixed(2)} minus payoff $${input.tradePayoff.toFixed(2)}).`);
    }
  }

  let grossFromParts: number | null = null;
  if (sellingPrice != null && capitalizedFees != null && (tradeEquity != null || !tradeMentioned)) {
    const rolled = negativeEquity ?? 0;
    grossFromParts = roundCents(sellingPrice + capitalizedFees + rolled);
    derivation.push(`Gross capitalized cost $${grossFromParts.toFixed(2)} from selling price, capitalized fees, and negative equity.`);
  } else if (input.statedGrossCapCost == null) {
    abstentions.push("Gross capitalized cost was not computed because the selling price, capitalized fees, or trade equity was not fully stated.");
  }

  const statedGross = input.statedGrossCapCost == null ? null : money(input.statedGrossCapCost, "Stated gross capitalized cost", abstentions);
  let grossCapCost = statedGross ?? grossFromParts;
  if (statedGross != null && grossFromParts != null && !nearly(statedGross, grossFromParts)) {
    abstentions.push(`Stated gross capitalized cost $${statedGross.toFixed(2)} does not match the parts at $${grossFromParts.toFixed(2)}.`);
    grossCapCost = null;
  }

  let capCostReduction: number | null = null;
  if (capCash != null && rebatesApplied != null && (tradeEquity != null || !tradeMentioned)) {
    const positiveEquity = tradeEquity != null && tradeEquity > 0 ? tradeEquity : 0;
    capCostReduction = roundCents(capCash + rebatesApplied + positiveEquity);
    derivation.push(`Capitalized cost reduction $${capCostReduction.toFixed(2)}.`);
  } else {
    abstentions.push("Capitalized cost reduction was not computed because cash, rebates, or trade equity was not fully stated. Missing cash was not treated as zero.");
  }

  const statedAdjusted = input.statedAdjustedCapCost == null
    ? null
    : money(input.statedAdjustedCapCost, "Stated adjusted capitalized cost", abstentions);
  const computedAdjusted = grossCapCost != null && capCostReduction != null
    ? roundCents(grossCapCost - capCostReduction)
    : null;
  let capCostContradiction = false;
  let adjustedCapCost: number | null = null;
  if (statedAdjusted != null && computedAdjusted != null && !nearly(statedAdjusted, computedAdjusted)) {
    capCostContradiction = true;
    abstentions.push(
      `Adjusted capitalized cost $${statedAdjusted.toFixed(2)} contradicts the parts at $${computedAdjusted.toFixed(2)}. Neither figure was used as the payment base.`,
    );
    dealerQuestions.push("Ask the dealer to reconcile the adjusted capitalized cost to the selling price, fees, rebates, trade, and cash cap reduction.");
  } else {
    adjustedCapCost = computedAdjusted ?? statedAdjusted;
    if (adjustedCapCost != null) derivation.push(`Adjusted capitalized cost $${adjustedCapCost.toFixed(2)}.`);
  }

  const moneyFactor = input.moneyFactor == null
    ? null
    : input.moneyFactor < 0 || !isNum(input.moneyFactor)
      ? null
      : input.moneyFactor;
  if (input.moneyFactor == null) {
    abstentions.push("Money factor was not stated.");
  } else if (moneyFactor === 0) {
    derivation.push("Money factor is 0, so the rent charge is $0.00.");
  }
  const aprEquivalent = moneyFactor == null ? null : moneyFactorApr(moneyFactor);

  let residualContradiction = false;
  let residualDollars = input.residualDollars == null ? null : money(input.residualDollars, "Residual dollars", abstentions);
  let residualPercent = input.residualPercent == null ? null : input.residualPercent;
  if (residualPercent != null && (residualPercent <= 0 || residualPercent > 100)) {
    abstentions.push("Residual percent is outside 0 to 100 and was not used.");
    residualPercent = null;
  }
  if (residualPercent != null && residualDollars != null && msrp != null && msrp > 0) {
    const fromPercent = roundCents(msrp * residualPercent / 100);
    const fromDollars = roundCents(residualDollars / msrp * 1000) / 10;
    if (!nearly(fromPercent, residualDollars) || Math.abs(fromDollars - residualPercent) > 0.15) {
      residualContradiction = true;
      residualDollars = null;
      abstentions.push(
        `Residual ${residualPercent}% of MSRP $${msrp.toFixed(2)} is $${fromPercent.toFixed(2)}, which does not match residual $${input.residualDollars?.toFixed(2)}. Neither residual was used.`,
      );
      dealerQuestions.push("Ask the dealer whether the contract residual is the dollar amount or the percentage, and which MSRP was multiplied.");
    }
  } else if (residualDollars == null && residualPercent != null && msrp != null && msrp > 0) {
    residualDollars = roundCents(msrp * residualPercent / 100);
    derivation.push(`Residual $${residualDollars.toFixed(2)} from ${residualPercent}% of MSRP.`);
  } else if (residualPercent == null && residualDollars != null && msrp != null && msrp > 0) {
    residualPercent = Math.round(residualDollars / msrp * 1000) / 10;
    derivation.push(`Residual ${residualPercent}% from residual dollars and MSRP.`);
  }

  const termMonths = input.termMonths == null ? null : input.termMonths;
  const missingTerm = termMonths == null || !Number.isInteger(termMonths) || termMonths <= 0;
  if (missingTerm) {
    abstentions.push("The lease term was not stated. A 36-month term was not assumed.");
    dealerQuestions.push("Ask the dealer for the lease term in months. Do not accept a payment that does not name the term.");
  }

  let depreciationMonthly: number | null = null;
  let rentChargeMonthly: number | null = null;
  let baseMonthlyPayment: number | null = null;
  if (!missingTerm && adjustedCapCost != null && residualDollars != null && moneyFactor != null) {
    depreciationMonthly = roundCents((adjustedCapCost - residualDollars) / termMonths);
    rentChargeMonthly = roundCents((adjustedCapCost + residualDollars) * moneyFactor);
    baseMonthlyPayment = roundCents(depreciationMonthly + rentChargeMonthly);
    derivation.push(
      `Base payment $${baseMonthlyPayment.toFixed(2)} = depreciation $${depreciationMonthly.toFixed(2)} + rent $${rentChargeMonthly.toFixed(2)}.`,
    );
  } else if (adjustedCapCost == null) {
    abstentions.push("The base payment was not calculated because the adjusted capitalized cost is undisclosed.");
    dealerQuestions.push("Ask the dealer for the gross capitalized cost and the adjusted capitalized cost.");
  }

  let disclosedMarkup: LeaseWorksheet["disclosedMarkup"] = null;
  if (
    moneyFactor != null &&
    input.statedBuyRateMoneyFactor != null &&
    isNum(input.statedBuyRateMoneyFactor) &&
    input.statedBuyRateMoneyFactor >= 0 &&
    moneyFactor > input.statedBuyRateMoneyFactor + 1e-8
  ) {
    const extraRentPerMonth = adjustedCapCost != null && residualDollars != null
      ? roundCents((adjustedCapCost + residualDollars) * (moneyFactor - input.statedBuyRateMoneyFactor))
      : null;
    disclosedMarkup = {
      chargedMoneyFactor: moneyFactor,
      buyRateMoneyFactor: input.statedBuyRateMoneyFactor,
      difference: Math.round((moneyFactor - input.statedBuyRateMoneyFactor) * 1e8) / 1e8,
      aprEquivalentCharged: moneyFactorApr(moneyFactor),
      aprEquivalentBuyRate: moneyFactorApr(input.statedBuyRateMoneyFactor),
      extraRentPerMonth,
      extraRentOverTerm: extraRentPerMonth != null && !missingTerm ? roundCents(extraRentPerMonth * termMonths) : null,
    };
    dealerQuestions.push("Ask the dealer why the contract money factor is higher than the buy rate printed on this quote.");
  }

  const reductionStated = input.statedMoneyFactorReduction != null && isNum(input.statedMoneyFactorReduction);
  const depositCount = input.securityDepositCount;
  const depositEach = input.securityDepositAmount == null ? null : money(input.securityDepositAmount, "Security deposit", abstentions);
  let depositTotal: number | null = null;
  if (depositCount != null && depositEach != null && depositCount >= 0) {
    depositTotal = roundCents(depositCount * depositEach);
  } else if (depositEach != null && depositCount == null) {
    depositTotal = depositEach;
  }
  const securityNote = reductionStated
    ? `The quote states a money-factor reduction of ${input.statedMoneyFactorReduction}. The payment uses the stated money factor and does not apply a second reduction.`
    : depositTotal != null && depositTotal > 0
      ? "Security deposits are on the quote. No money-factor reduction was stated, so none was applied."
      : "No security deposit was stated.";
  if (!reductionStated && depositCount != null && depositCount > 1) {
    abstentions.push("Multiple security deposits were not given an assumed money-factor reduction.");
    dealerQuestions.push("Ask the dealer whether the security deposits reduce the money factor and by how much per deposit.");
  }

  let afterTaxMonthlyPayment: number | null = null;
  if (input.paymentIncludesTax === true && baseMonthlyPayment != null && input.statedMonthlyTax != null && input.statedMonthlyTax >= 0) {
    afterTaxMonthlyPayment = roundCents(baseMonthlyPayment + input.statedMonthlyTax);
    derivation.push(`After-tax payment $${afterTaxMonthlyPayment.toFixed(2)} uses the tax dollars stated on the quote, not a state tax rule.`);
  } else if (input.paymentIncludesTax === true) {
    abstentions.push("The payment is described as tax-inclusive, but the tax dollars were not stated, so no after-tax payment was built from a state rule.");
  }

  const paymentTaxBasis: LeaseWorksheet["paymentTaxBasis"] =
    input.paymentIncludesTax === true ? "after_tax" : input.paymentIncludesTax === false ? "pre_tax" : "unknown";

  let paymentComparison: LeaseWorksheet["paymentComparison"];
  if (input.quotedPayment == null || input.quotedPayment < 0) {
    paymentComparison = {
      compared: false,
      basis: null,
      expected: null,
      quoted: null,
      discrepancy: null,
      reason: "No monthly payment was stated.",
    };
  } else if (paymentTaxBasis === "unknown") {
    paymentComparison = {
      compared: false,
      basis: null,
      expected: baseMonthlyPayment,
      quoted: input.quotedPayment,
      discrepancy: null,
      reason: "The quote does not say whether the monthly payment includes tax, so it was not compared with the pre-tax payment.",
    };
    abstentions.push(paymentComparison.reason);
    dealerQuestions.push("Ask the dealer whether the monthly payment includes tax, and for the pre-tax base payment.");
  } else if (paymentTaxBasis === "pre_tax" && baseMonthlyPayment != null) {
    const discrepancy = roundCents(input.quotedPayment - baseMonthlyPayment);
    paymentComparison = {
      compared: true,
      basis: "pre_tax",
      expected: baseMonthlyPayment,
      quoted: input.quotedPayment,
      discrepancy,
      reason: nearly(discrepancy, 0, 0.01)
        ? "The quoted pre-tax payment matches the money-factor formula."
        : "The quoted pre-tax payment does not match the money-factor formula.",
    };
  } else if (paymentTaxBasis === "after_tax" && afterTaxMonthlyPayment != null) {
    const discrepancy = roundCents(input.quotedPayment - afterTaxMonthlyPayment);
    paymentComparison = {
      compared: true,
      basis: "after_tax",
      expected: afterTaxMonthlyPayment,
      quoted: input.quotedPayment,
      discrepancy,
      reason: nearly(discrepancy, 0, 0.01)
        ? "The quoted tax-inclusive payment matches the base payment plus the tax dollars stated on the quote."
        : "The quoted tax-inclusive payment does not match the base payment plus the tax dollars stated on the quote.",
    };
  } else {
    paymentComparison = {
      compared: false,
      basis: paymentTaxBasis === "after_tax" ? "after_tax" : "pre_tax",
      expected: null,
      quoted: input.quotedPayment,
      discrepancy: null,
      reason: "The payment could not be checked because the worksheet is missing a cap cost, residual, money factor, or term.",
    };
  }

  const periodic = paymentTaxBasis === "after_tax" ? afterTaxMonthlyPayment : paymentTaxBasis === "pre_tax" ? baseMonthlyPayment : null;
  const upfrontTax = input.statedUpfrontTax == null ? null : money(input.statedUpfrontTax, "Upfront tax", abstentions);
  let firstPayment: number | null = null;
  if (input.firstPaymentInDueAtSigning === true) firstPayment = periodic;
  else if (input.firstPaymentInDueAtSigning === false) firstPayment = 0;
  else abstentions.push("The quote does not say whether the first payment is included in the amount due at signing.");

  let dueComputed: number | null = null;
  if (firstPayment != null && upfrontFees != null && upfrontTax != null && capCash != null && depositTotal != null) {
    dueComputed = roundCents(firstPayment + upfrontFees + upfrontTax + capCash + depositTotal);
  }
  let dueReconciles: boolean | null = null;
  let dueDiscrepancy: number | null = null;
  if (input.dueAtSigningStated != null && dueComputed != null) {
    dueDiscrepancy = roundCents(input.dueAtSigningStated - dueComputed);
    dueReconciles = nearly(dueDiscrepancy, 0, 0.01);
    derivation.push(
      dueReconciles
        ? `Amount due at signing $${dueComputed.toFixed(2)} matches the quote.`
        : `Amount due at signing $${input.dueAtSigningStated.toFixed(2)} does not match the itemized $${dueComputed.toFixed(2)}.`,
    );
  } else if (input.dueAtSigningStated != null && dueComputed == null) {
    abstentions.push("The amount due at signing was stated but its parts were not all stated, so it was not reconciled and its contents were not assumed.");
    dealerQuestions.push("Ask the dealer to itemize the amount due at signing: first payment, fees, taxes, cap reduction, and refundable security deposits.");
  }

  const dispositionFee = input.dispositionFee == null ? null : money(input.dispositionFee, "Disposition fee", abstentions);
  let totalContractualCost: number | null = null;
  if (
    periodic != null &&
    termMonths != null &&
    termMonths > 0 &&
    dueComputed != null &&
    dueReconciles !== false &&
    depositTotal != null &&
    firstPayment != null &&
    dispositionFee != null
  ) {
    const driveOffKept = roundCents(dueComputed - depositTotal - firstPayment);
    totalContractualCost = roundCents(driveOffKept + periodic * termMonths + dispositionFee);
    derivation.push(
      `Total contractual cost $${totalContractualCost.toFixed(2)} excludes refundable security deposits of $${depositTotal.toFixed(2)} and does not count the first payment twice.`,
    );
  } else if (periodic != null && !missingTerm) {
    abstentions.push("Total contractual cost was not calculated because the drive-off, security deposits, or disposition fee was not fully stated. None of those was treated as zero.");
  }

  const effectiveMonthlyCost = totalContractualCost != null && termMonths != null && termMonths > 0
    ? roundCents(totalContractualCost / termMonths)
    : null;
  if (effectiveMonthlyCost != null) {
    derivation.push(`Effective monthly cost $${effectiveMonthlyCost.toFixed(2)} is the total contractual cost divided by the term.`);
  }

  const advertisedPaymentIsNotFullCost = input.quotedPayment != null &&
    input.dueAtSigningStated != null &&
    input.dueAtSigningStated > input.quotedPayment + 1 &&
    (effectiveMonthlyCost == null || effectiveMonthlyCost > input.quotedPayment + 1);
  if (advertisedPaymentIsNotFullCost) {
    dealerQuestions.push("Ask the dealer for the amount due at signing itemized beside the monthly payment, and for the total of payments.");
  }

  const capCostDisclosed = adjustedCapCost != null;
  const disclosures = coverLeaseDisclosures({
    vehicleNamed: input.vehicleNamed,
    dueAtSigning: input.dueAtSigningStated,
    dueAtSigningItemized: dueComputed != null && dueReconciles === true,
    termMonths: missingTerm ? null : termMonths,
    monthlyPayment: input.quotedPayment,
    grossCapCost,
    adjustedCapCost,
    residualKnown: residualDollars != null,
    moneyFactor,
    dispositionFee,
    excessMileageRate: input.excessMileageRate,
    mileageAllowance: input.annualMileage,
    securityDepositStated: depositTotal != null,
    saysLease: input.saysLease,
    percentageRateStated: input.percentageRateStated,
    rateLimitationNotice: input.rateLimitationNotice,
  });
  for (const row of disclosures) {
    if (row.classification === "statutory" && !row.present) dealerQuestions.push(row.dealerQuestion);
  }

  return {
    msrp,
    sellingPrice,
    grossCapCost,
    adjustedCapCost,
    capCostContradiction,
    capCostDisclosed,
    capitalizedFees,
    upfrontFees,
    rebatesApplied,
    conditionalIncentives: incentives,
    conditionalIncentiveUnconfirmed,
    capCostReduction,
    tradeEquity,
    negativeEquity,
    moneyFactor,
    aprEquivalent,
    statedBuyRateMoneyFactor: input.statedBuyRateMoneyFactor,
    disclosedMarkup,
    residualPercent,
    residualDollars,
    residualContradiction,
    termMonths: missingTerm ? null : termMonths,
    annualMileage: input.annualMileage,
    depreciationMonthly,
    rentChargeMonthly,
    baseMonthlyPayment,
    afterTaxMonthlyPayment,
    taxTreatment,
    paymentTaxBasis,
    paymentComparison,
    dueAtSigning: {
      stated: input.dueAtSigningStated,
      computed: dueComputed,
      reconciles: dueReconciles,
      discrepancy: dueDiscrepancy,
      firstPayment,
      upfrontFees,
      taxes: upfrontTax,
      capReduction: capCash,
      securityDeposits: depositTotal,
      reason: dueComputed == null && input.dueAtSigningStated != null
        ? "Due-at-signing parts are incomplete."
        : null,
    },
    securityDeposits: {
      count: depositCount,
      amountEach: depositEach,
      total: depositTotal,
      refundable: depositTotal != null ? true : null,
      statedMoneyFactorReduction: reductionStated ? input.statedMoneyFactorReduction : null,
      reductionApplied: reductionStated,
      note: securityNote,
    },
    totalContractualCost,
    effectiveMonthlyCost,
    dispositionFee,
    excessMileageRate: input.excessMileageRate,
    advertisedPaymentIsNotFullCost,
    missingTerm,
    undisclosedCapCost: adjustedCapCost == null,
    dealerQuestions: [...new Set(dealerQuestions)],
    disclosures,
    derivation,
    abstentions,
  };
}

function splitLeaseRebates(fields: DetectedFields): { rebates: number | null; incentives: ConditionalIncentive[] } {
  const explicit = fields.conditionalIncentives ?? [];
  const lines = fields.rebateLines ?? [];
  if (lines.length === 0) {
    return { rebates: fields.rebates ?? null, incentives: explicit };
  }
  const conditional = lines.filter((line) => /\b(loyalty|conquest)\b/i.test(`${line.name} ${line.condition ?? ""}`) || line.condition != null);
  const plain = lines.filter((line) => !conditional.includes(line));
  const fromLines = conditional.map((line) => ({
    name: /\bconquest\b/i.test(line.name) ? "Conquest" : /\bloyalty\b/i.test(line.name) ? "Loyalty" : line.name,
    amount: line.amount,
    condition: line.condition ?? line.name,
    eligible: /\b(buyer qualifies|eligibility confirmed|you qualify)\b/i.test(`${line.name} ${line.condition ?? ""}`) ? true : null,
  }));
  const incentives = explicit.length > 0 ? explicit : fromLines;
  if (conditional.length === 0) return { rebates: fields.rebates ?? null, incentives };
  const rebates = plain.length === 0 ? 0 : roundCents(plain.reduce((sum, line) => sum + line.amount, 0));
  return { rebates, incentives };
}

function feeAmount(fee: Fee): number | null {
  return isNum(fee.amount) ? fee.amount : null;
}

/**
 * Build worksheet inputs from extracted fields.
 * A null field stays null. Zero is kept. Fees without an explicit
 * capitalized/upfront flag make the fee totals unknown.
 */
export function worksheetInputFromFields(
  fields: DetectedFields,
  options?: { stateCode?: string | null; saysLease?: boolean },
): LeaseWorksheetInput {
  const fees = (fields.fees ?? []).filter((fee) => !/acquisition/i.test(fee.name));
  const tagged = fees.every((fee) => fee.capitalized === true || fee.capitalized === false);
  const acquisitionKnown = fields.acquisitionFee != null && (fields.acquisitionFeeCapitalized === true || fields.acquisitionFeeCapitalized === false);
  const feesKnown = tagged && (acquisitionKnown || (fields.feesItemized === true && fields.acquisitionFee == null && fees.length === 0));
  let capitalizedFees: number | null = null;
  let upfrontFees: number | null = null;
  if (feesKnown) {
    let capitalized = 0;
    let upfront = 0;
    for (const fee of fees) {
      const amount = feeAmount(fee) ?? 0;
      if (fee.capitalized === true) capitalized += amount;
      else upfront += amount;
    }
    if (fields.acquisitionFee != null) {
      if (fields.acquisitionFeeCapitalized === true) capitalized += fields.acquisitionFee;
      else upfront += fields.acquisitionFee;
    }
    capitalizedFees = roundCents(capitalized);
    upfrontFees = roundCents(upfront);
  }

  const split = splitLeaseRebates(fields);
  return {
    msrp: fields.msrp ?? null,
    sellingPrice: fields.salePrice ?? null,
    statedGrossCapCost: fields.grossCapCost ?? null,
    statedAdjustedCapCost: fields.adjustedCapCost ?? null,
    capitalizedFees,
    upfrontFees,
    rebates: split.rebates,
    conditionalIncentives: split.incentives,
    capCostReductionCash: fields.capCostReduction ?? fields.downPayment ?? null,
    tradeAllowance: fields.tradeInValue ?? null,
    tradePayoff: fields.tradePayoff ?? null,
    moneyFactor: fields.moneyFactor ?? null,
    statedBuyRateMoneyFactor: fields.buyRateMoneyFactor ?? null,
    residualPercent: fields.residualPercent ?? null,
    residualDollars: fields.residualValue ?? null,
    termMonths: fields.termMonths ?? null,
    annualMileage: fields.mileageAllowance ?? null,
    dispositionFee: fields.dispositionFee ?? null,
    excessMileageRate: fields.excessMileageRate ?? null,
    quotedPayment: fields.monthlyPayment ?? null,
    paymentIncludesTax: fields.paymentIncludesTax ?? null,
    statedMonthlyTax: fields.monthlyTax ?? null,
    statedUpfrontTax: fields.upfrontTax ?? null,
    dueAtSigningStated: fields.dueAtSigning ?? null,
    firstPaymentInDueAtSigning: fields.firstPaymentInDueAtSigning ?? null,
    securityDepositCount: fields.securityDepositCount ?? null,
    securityDepositAmount: fields.securityDepositAmount ?? null,
    statedMoneyFactorReduction: fields.moneyFactorReduction ?? null,
    stateCode: options?.stateCode ?? null,
    vehicleNamed: !!(fields.vehicle_make || fields.vehicle_model || fields.vehicle_year),
    saysLease: options?.saysLease === true,
    percentageRateStated: fields.apr != null,
    rateLimitationNotice: fields.rateLimitationNotice === true,
  };
}
