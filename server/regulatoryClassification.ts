/**
 * Doc-fee classification.
 *
 * California's two ceilings come from Vehicle Code § 4456.5, fetched from
 * leginfo.legislature.ca.gov on 2026-11-27. Oregon's ceilings and the
 * purchaser's integrator election come from ORS 822.043, fetched from
 * oregonlegislature.gov on 2026-11-27. Michigan, Pennsylvania, Rhode Island,
 * Minnesota, and Ohio use only the government pages fetched on 2026-11-27.
 * Other states are called illegal only when this dataset records a citation
 * and does not list the cap as unverified. Otherwise the result is needs_source.
 */

export type ChargeClassification =
  | "illegal"
  | "potentially_noncompliant"
  | "negotiable"
  | "permissible"
  | "government"
  | "needs_source"
  | "not_checked";

export interface RegulatoryStateInput {
  name?: string;
  abbreviation?: string;
  docFeeCap?: boolean;
  docFeeCapAmount?: number | null;
  statuteCitation?: string | null;
  source_status?: string;
  unverified_fields?: string[];
  citations?: { url?: string; supports?: string }[];
}

export interface DocFeeAssessment {
  classification: ChargeClassification;
  chargedAmount: number | null;
  hardCeiling: number | null;
  conditionalCeiling: number | null;
  condition: string | null;
  exceedsStoredCap: boolean;
  jurisdiction: string;
  statutoryReference: string;
  officialSource: string;
  effectiveDate: string;
  lastVerificationDate: string;
  summary: string;
}

/** Quote facts a conditional ceiling can use. Missing facts are not guessed. */
export interface DocFeeQuoteContext {
  /** Vehicle cash or selling price, when the quote states one. */
  vehicleCashPrice?: number | null;
  /**
   * Pennsylvania only. True when the dealer provides electronic transaction
   * services, false when it does not, null when the quote does not say.
   */
  electronicTransaction?: boolean | null;
}

const CA_SOURCE =
  "https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=VEH&sectionNum=4456.5";
const CA_STATUTE = "Cal. Veh. Code § 4456.5";
const CA_EFFECTIVE = "2019-01-01";
const CA_VERIFIED = "2026-11-27";
const CA_PARTNER_CONDITION =
  "A dealer with a contractual agreement to be a DMV private industry partner under Vehicle Code § 1685 may charge up to $85. A dealer without that agreement may charge up to $70.";

const OR_SOURCE = "https://www.oregonlegislature.gov/bills_laws/ors/ors822.html";
const OR_STATUTE = "ORS 822.043";
const OR_VERIFIED = "2026-11-27";
const OR_INTEGRATOR_CONDITION =
  "ORS 822.043(4) lets the purchaser negotiate the document processing fee, other than the $35 paid to an integrator under subsection (5), but the fee shall not exceed $250 if the dealer uses an integrator or $200 if the dealer does not. ORS 822.043(5): if the dealer charges under subsection (4)(a), $35 of the amount charged shall be paid to the integrator. ORS 822.043(6): unless otherwise provided by rule, if the dealer uses an integrator and charges more than the non-integrator fee, the dealer must inform the purchaser of the option of using an integrator, and the purchaser may elect whether or not the dealer uses an integrator to prepare the documents.";

const MI_SOURCE =
  "https://www.michigan.gov/difs/-/media/Project/Websites/difs/Bulletins/2025/Bulletin_2025-03-CF.pdf";
const MI_STATUTE_SOURCE = "https://www.legislature.mi.gov/Laws/MCL?objectName=mcl-492-113";
const MI_STATUTE = "MCL 492.113(2)(a); DIFS Bulletin 2025-03-CF";
const MI_VERIFIED = "2026-11-27";
const MI_DOLLAR = 280;
const MI_CONDITION =
  "DIFS Bulletin 2025-03-CF, issued and entered January 28, 2025, adjusts the MCL 492.113(2)(a) documentary preparation fee to the lesser of 5% of the vehicle cash price or $280. When the vehicle cash price is not on the quote, only the $280 ceiling is applied, and the 5% limb is not treated as satisfied.";

const PA_SOURCE =
  "https://www.pa.gov/content/dam/copapwp-pagov/en/dos/department-and-offices/bpoa/vehicle/Annual%20Fee.pdf";
const PA_STATUTE = "63 P.S. § 818.327(c)";
const PA_VERIFIED = "2026-11-27";
const PA_ELECTRONIC = 490;
const PA_NONELECTRONIC = 409;
const PA_CONDITION =
  "The State Board of Vehicle Manufacturers, Dealers and Salespersons notice dated January 13, 2026, under 63 P.S. § 818.327(c), sets the 2026 documentary preparation fee at no more than $490 for an electronic transaction under subsection (c)(1) and no more than $409 for a non-electronic transaction under subsection (c)(2).";

const RI_SOURCE = "https://rules.sos.ri.gov/regulations/part/280-30-20-1";
const RI_STATUTE = "280-RICR-30-20-1.6(N)";
const RI_VERIFIED = "2026-11-27";
const RI_DOLLAR = 400;
const RI_PRICE_FLOOR = 10000;
const RI_CONDITION =
  "280-RICR-30-20-1.6(N) allows a documentary preparation fee of up to $400 only on vehicle transactions in excess of $10,000. Charging any documentary preparation fee on a sale for less than $10,000 is a violation. A sale of exactly $10,000 is not stated in the fetched rule. The separate title preparation fee in subsection (M) is capped at $20 and is not part of this documentary fee.";

const MN_SOURCE = "https://www.revisor.mn.gov/statutes/cite/168.27";
const MN_STATUTE = "Minn. Stat. § 168.27, subd. 31";
const MN_VERIFIED = "2026-11-27";
const MN_DOLLAR = 350;
const MN_CONDITION =
  "Minn. Stat. § 168.27, subd. 31(b): for a sale or lease on or after July 1, 2025, the maximum documentary fee or document administration fee is the lesser of $350 or ten percent of the value of the sale or lease. When the sale value is not on the quote, only the $350 ceiling is applied, and the 10% limb is not treated as satisfied.";

const OH_SOURCE = "https://codes.ohio.gov/ohio-revised-code/section-4517.261";
const OH_BOARD_SOURCE =
  "https://autodealers.ohio.gov/resources-for-dealers/resources/documentary-service-charge";
const OH_STATUTE = "Ohio Rev. Code § 4517.261";
const OH_VERIFIED = "2026-11-27";
const OH_DOLLAR = 398;
const OH_EFFECTIVE = "2026-01-01";
const OH_CONDITION =
  "Ohio Rev. Code § 4517.261(B) limits the documentary service charge to the lesser of the registrar's adjusted amount and 10% of the amount the buyer or lessee must pay under the contract, excluding tax, title, and registration fees, and any negative equity adjustment. The Ohio Dealer Board page states the registrar amount is $398 from January 1, 2026 through December 31, 2026. When the contract amount is not on the quote, only the $398 ceiling is applied.";

const DOC_FEE_EXACT = [
  "doc fee",
  "documentation fee",
  "document fee",
  "documentary fee",
  "documentary service",
  "documentary preparation",
  "document processing",
  "document administration fee",
];

/** Arkansas Code § 23-112-317 and 23 CAR § 410-801 use these names for the capped fee. */
const AR_DOC_FEE_ALIASES = [
  "dealer service and handling",
  "dealer service & handling",
  "dealer service or handling",
  "service and handling",
  "service & handling",
  "service or handling",
  "dealer service fee",
];

const DOC_FEE_BROAD = ["dealer fee", "processing fee", "admin fee", "administrative fee"];

const SEPARATE_GOVERNMENT_FEE =
  /\b(sales tax|use tax|excise tax|privilege tax|tax|title fee|title preparation|registration|license plate|tag fee|plate fee|license fee)\b/;

type FeeLine = { name: string; amount: number | null };

function roundMoney(amount: number): number {
  return Math.round(amount * 100) / 100;
}

function exceeds(charged: number, ceiling: number): boolean {
  return Math.round(charged * 100) > Math.round(ceiling * 100);
}

function positiveAmount(value: number | null | undefined): number | null {
  if (value == null || !Number.isFinite(value) || value <= 0) return null;
  return roundMoney(value);
}

function moneyLabel(amount: number): string {
  return Number.isInteger(amount) ? `$${amount}` : `$${amount.toFixed(2)}`;
}

function matchesExactDocFee(name: string, stateAbbreviation?: string | null): boolean {
  if (DOC_FEE_EXACT.some((keyword) => name.includes(keyword))) return true;
  if (stateAbbreviation === "AR" && AR_DOC_FEE_ALIASES.some((keyword) => name.includes(keyword))) return true;
  return false;
}

function isSeparateGovernmentFee(name: string, stateAbbreviation?: string | null): boolean {
  return SEPARATE_GOVERNMENT_FEE.test(name) && !matchesExactDocFee(name, stateAbbreviation);
}

/**
 * Sum every line that names the same regulated documentation service.
 * A separate government title, registration, or tax line is not included,
 * even when its name also contains a broad word such as "processing fee".
 * Exact documentation names take priority over broad names so a distinct
 * "dealer fee" is not added on top of an itemized documentation fee.
 */
export function detectDocFeeAmount(fees: FeeLine[], stateAbbreviation?: string | null): number | null {
  const exact: number[] = [];
  const broad: number[] = [];
  for (const fee of fees) {
    if (fee.amount == null || !Number.isFinite(fee.amount)) continue;
    const name = fee.name.toLowerCase();
    if (isSeparateGovernmentFee(name, stateAbbreviation)) continue;
    if (matchesExactDocFee(name, stateAbbreviation)) exact.push(fee.amount);
    else if (DOC_FEE_BROAD.some((keyword) => name.includes(keyword))) broad.push(fee.amount);
  }
  const candidates = exact.length > 0 ? exact : broad;
  if (candidates.length === 0) return null;
  return roundMoney(candidates.reduce((sum, amount) => sum + amount, 0));
}

function contractAmountExcludingGovernment(salePrice: number, fees: FeeLine[]): number {
  let base = salePrice;
  for (const fee of fees) {
    if (fee.amount == null || !Number.isFinite(fee.amount) || fee.amount === 0) continue;
    const name = fee.name.toLowerCase();
    if (SEPARATE_GOVERNMENT_FEE.test(name) && !matchesExactDocFee(name)) continue;
    if (/\bnegative equity\b/.test(name)) continue;
    base += fee.amount;
  }
  return roundMoney(base);
}

function needsSource(summary: string, jurisdiction: string, charged: number | null): DocFeeAssessment {
  return {
    classification: "needs_source",
    chargedAmount: charged,
    hardCeiling: null,
    conditionalCeiling: null,
    condition: null,
    exceedsStoredCap: false,
    jurisdiction,
    statutoryReference: "needs_source",
    officialSource: "needs_source",
    effectiveDate: "needs_source",
    lastVerificationDate: "needs_source",
    summary,
  };
}

function capIsVerified(state: RegulatoryStateInput): boolean {
  if (state.source_status === "needs_source") return false;
  if ((state.unverified_fields ?? []).includes("docFeeCapAmount")) return false;
  if (!state.citations || state.citations.length === 0) return false;
  if (!state.citations.some((c) => typeof c.url === "string" && c.url.startsWith("http"))) return false;
  return state.docFeeCap === true && state.docFeeCapAmount != null;
}

export function classifyDocFee(
  fees: FeeLine[],
  state: RegulatoryStateInput | null | undefined,
  privateIndustryPartner: boolean | null = null,
  electronicIntegrator: boolean | null = null,
  quote: DocFeeQuoteContext | null = null,
): DocFeeAssessment {
  const charged = detectDocFeeAmount(fees, state?.abbreviation);
  const jurisdiction = state?.name ?? state?.abbreviation ?? "Unknown";

  if (!state) {
    return needsSource(
      charged == null
        ? "No documentation fee was found, and no state was identified."
        : "A documentation fee is present, but the state was not identified, so no legal ceiling was applied.",
      jurisdiction,
      charged,
    );
  }

  if (state.abbreviation === "CA") {
    return classifyCalifornia(charged, privateIndustryPartner);
  }

  if (state.abbreviation === "OR") {
    return classifyOregon(charged, electronicIntegrator);
  }

  if (state.abbreviation === "MI") {
    return classifyMichigan(charged, quote?.vehicleCashPrice);
  }

  if (state.abbreviation === "PA") {
    return classifyPennsylvania(charged, quote?.electronicTransaction ?? null);
  }

  if (state.abbreviation === "RI") {
    return classifyRhodeIsland(charged, quote?.vehicleCashPrice);
  }

  if (state.abbreviation === "MN") {
    return classifyMinnesota(charged, quote?.vehicleCashPrice);
  }

  if (state.abbreviation === "OH") {
    return classifyOhio(charged, quote?.vehicleCashPrice, fees);
  }

  if (charged == null) {
    return {
      classification: "not_checked",
      chargedAmount: null,
      hardCeiling: state.docFeeCapAmount ?? null,
      conditionalCeiling: null,
      condition: null,
      exceedsStoredCap: false,
      jurisdiction,
      statutoryReference: state.statuteCitation ?? "needs_source",
      officialSource: state.citations?.[0]?.url ?? "needs_source",
      effectiveDate: "needs_source",
      lastVerificationDate: "needs_source",
      summary: "No documentation fee amount was found to compare with a state rule.",
    };
  }

  if (!state.docFeeCap || state.docFeeCapAmount == null) {
    return {
      classification: "negotiable",
      chargedAmount: charged,
      hardCeiling: null,
      conditionalCeiling: null,
      condition: null,
      exceedsStoredCap: false,
      jurisdiction,
      statutoryReference: state.statuteCitation ?? "needs_source",
      officialSource: state.citations?.[0]?.url ?? "needs_source",
      effectiveDate: "needs_source",
      lastVerificationDate: "needs_source",
      summary: `${jurisdiction} has no verified hard cap in this dataset. The $${charged} documentation fee is a dealer charge and is negotiable.`,
    };
  }

  if (!capIsVerified(state)) {
    const over = charged > state.docFeeCapAmount;
    return {
      classification: "needs_source",
      chargedAmount: charged,
      hardCeiling: null,
      conditionalCeiling: null,
      condition: null,
      exceedsStoredCap: over,
      jurisdiction,
      statutoryReference: "needs_source",
      officialSource: "needs_source",
      effectiveDate: "needs_source",
      lastVerificationDate: "needs_source",
      summary: over
        ? `${jurisdiction} has a stored documentation-fee figure of $${state.docFeeCapAmount}, but that figure is not backed by a verified citation in this dataset. This audit does not treat the $${charged} charge as a legal violation.`
        : `${jurisdiction}'s stored documentation-fee figure is not a verified legal finding. This audit does not treat the $${charged} charge as a legal violation.`,
    };
  }

  const citation = state.citations?.[0]?.url ?? "needs_source";
  const statute = state.statuteCitation ?? "needs_source";
  if (charged > state.docFeeCapAmount) {
    return {
      classification: "illegal",
      chargedAmount: charged,
      hardCeiling: state.docFeeCapAmount,
      conditionalCeiling: null,
      condition: null,
      exceedsStoredCap: true,
      jurisdiction,
      statutoryReference: statute,
      officialSource: citation,
      effectiveDate: "needs_source",
      lastVerificationDate: "needs_source",
      summary: `The $${charged} documentation fee exceeds the verified ${jurisdiction} ceiling of $${state.docFeeCapAmount}.`,
    };
  }

  return {
    classification: "permissible",
    chargedAmount: charged,
    hardCeiling: state.docFeeCapAmount,
    conditionalCeiling: null,
    condition: null,
    exceedsStoredCap: false,
    jurisdiction,
    statutoryReference: statute,
    officialSource: citation,
    effectiveDate: "needs_source",
    lastVerificationDate: "needs_source",
    summary: `The $${charged} documentation fee is at or under the verified ${jurisdiction} ceiling of $${state.docFeeCapAmount}.`,
  };
}

function classifyCalifornia(charged: number | null, partner: boolean | null): DocFeeAssessment {
  const base = {
    hardCeiling: 85,
    conditionalCeiling: 70,
    condition: CA_PARTNER_CONDITION,
    jurisdiction: "California",
    statutoryReference: CA_STATUTE,
    officialSource: CA_SOURCE,
    effectiveDate: CA_EFFECTIVE,
    lastVerificationDate: CA_VERIFIED,
  };

  if (charged == null) {
    return {
      ...base,
      classification: "not_checked",
      chargedAmount: null,
      exceedsStoredCap: false,
      summary: "No documentation fee amount was found to compare with California Vehicle Code § 4456.5.",
    };
  }

  if (charged > 85 || (partner === false && charged > 70)) {
    return {
      ...base,
      classification: "illegal",
      chargedAmount: charged,
      exceedsStoredCap: true,
      summary:
        partner === false
          ? `The $${charged} document processing charge exceeds the $70 ceiling in Vehicle Code § 4456.5(a)(1)(B) for a dealer that is not a DMV private industry partner.`
          : `The $${charged} document processing charge exceeds $85, the maximum in Vehicle Code § 4456.5(a)(1)(A).`,
    };
  }

  if (partner === true || charged <= 70) {
    return {
      ...base,
      classification: "permissible",
      chargedAmount: charged,
      exceedsStoredCap: false,
      summary:
        partner === true
          ? `The dealer is confirmed as a DMV private industry partner, so the $${charged} document processing charge is within the $85 ceiling in Vehicle Code § 4456.5(a)(1)(A).`
          : `The $${charged} document processing charge is within the $70 ceiling that applies when a dealer is not a DMV private industry partner.`,
    };
  }

  return {
    ...base,
    classification: "potentially_noncompliant",
    chargedAmount: charged,
    exceedsStoredCap: false,
    summary: `The $${charged} document processing charge is above $70 and at or below $85. Vehicle Code § 4456.5 allows $85 only when the dealer has a DMV private-industry-partner agreement under § 1685. That agreement was not confirmed.`,
  };
}

function classifyOregon(charged: number | null, integrator: boolean | null): DocFeeAssessment {
  const base = {
    hardCeiling: 250,
    conditionalCeiling: 200,
    condition: OR_INTEGRATOR_CONDITION,
    jurisdiction: "Oregon",
    statutoryReference: OR_STATUTE,
    officialSource: OR_SOURCE,
    effectiveDate: "not stated",
    lastVerificationDate: OR_VERIFIED,
  };

  if (charged == null) {
    return {
      ...base,
      classification: "not_checked",
      chargedAmount: null,
      exceedsStoredCap: false,
      summary: "No documentation fee amount was found to compare with ORS 822.043.",
    };
  }

  if (charged > 250 || (integrator === false && charged > 200)) {
    return {
      ...base,
      classification: "illegal",
      chargedAmount: charged,
      exceedsStoredCap: true,
      summary:
        integrator === false
          ? `The $${charged} document processing fee exceeds the $200 ceiling in ORS 822.043(4)(b) for a dealer that does not use an integrator.`
          : `The $${charged} document processing fee exceeds $250, the maximum in ORS 822.043(4)(a) for a dealer that uses an integrator.`,
    };
  }

  if (integrator === true || charged <= 200) {
    return {
      ...base,
      classification: "permissible",
      chargedAmount: charged,
      exceedsStoredCap: false,
      summary:
        integrator === true
          ? `The dealer is confirmed to use an integrator, so the $${charged} document processing fee is within the $250 ceiling in ORS 822.043(4)(a). ORS 822.043(5) requires $35 of that integrator-tier fee to be paid to the integrator. ${charged > 200 ? "ORS 822.043(6) requires the dealer to tell the purchaser that the purchaser may elect whether or not the dealer uses an integrator." : "ORS 822.043(6) applies when the integrator fee is higher than the non-integrator fee."}`
          : `The $${charged} document processing fee is within the $200 ceiling that applies when a dealer does not use an integrator. ORS 822.043(4) still lets the purchaser negotiate that fee.`,
    };
  }

  return {
    ...base,
    classification: "potentially_noncompliant",
    chargedAmount: charged,
    exceedsStoredCap: false,
    summary: `The $${charged} document processing fee is above $200 and at or below $250. ORS 822.043(4) allows $250 only when the dealer uses an integrator, and integrator use was not confirmed. ORS 822.043(6) requires the dealer to inform the purchaser of the integrator option, and the purchaser may elect whether or not the dealer uses an integrator. ORS 822.043(5) requires $35 of an integrator-tier fee to be paid to the integrator. Aside from that $35, the fee is negotiable.`,
  };
}

function classifyMichigan(charged: number | null, vehicleCashPrice: number | null | undefined): DocFeeAssessment {
  const cashPrice = positiveAmount(vehicleCashPrice);
  const fivePercent = cashPrice == null ? null : roundMoney(cashPrice * 0.05);
  const applicable = fivePercent == null ? MI_DOLLAR : Math.min(MI_DOLLAR, fivePercent);
  const base = {
    hardCeiling: applicable,
    conditionalCeiling: fivePercent != null && fivePercent !== MI_DOLLAR ? fivePercent : null,
    condition: MI_CONDITION,
    jurisdiction: "Michigan",
    statutoryReference: MI_STATUTE,
    officialSource: MI_SOURCE,
    effectiveDate: "2025-01-28",
    lastVerificationDate: MI_VERIFIED,
  };
  const priceNote =
    cashPrice == null
      ? "The vehicle cash price was not on the quote, so the 5% limb in MCL 492.113(2)(a) and DIFS Bulletin 2025-03-CF was not applied and the ceiling used is $280."
      : `The applicable ceiling is ${moneyLabel(applicable)}, the lesser of $280 and 5% of the ${moneyLabel(cashPrice)} vehicle cash price (${moneyLabel(fivePercent ?? applicable)}).`;

  if (charged == null) {
    return {
      ...base,
      classification: "not_checked",
      chargedAmount: null,
      exceedsStoredCap: false,
      summary: `No documentation fee amount was found to compare with Michigan's documentary preparation fee rule. ${priceNote}`,
    };
  }

  if (exceeds(charged, applicable)) {
    return {
      ...base,
      classification: "illegal",
      chargedAmount: charged,
      exceedsStoredCap: true,
      summary: `The $${charged} documentary preparation fee exceeds Michigan's ceiling of ${moneyLabel(applicable)}. ${priceNote} Source: ${MI_STATUTE}, fetched ${MI_VERIFIED} from ${MI_STATUTE_SOURCE} and ${MI_SOURCE}.`,
    };
  }

  return {
    ...base,
    classification: "permissible",
    chargedAmount: charged,
    exceedsStoredCap: false,
    summary: `The $${charged} documentary preparation fee is at or under Michigan's ceiling of ${moneyLabel(applicable)}. ${priceNote}`,
  };
}

function classifyPennsylvania(charged: number | null, electronic: boolean | null): DocFeeAssessment {
  const base = {
    hardCeiling: PA_ELECTRONIC,
    conditionalCeiling: PA_NONELECTRONIC,
    condition: PA_CONDITION,
    jurisdiction: "Pennsylvania",
    statutoryReference: PA_STATUTE,
    officialSource: PA_SOURCE,
    effectiveDate: "2026-01-13",
    lastVerificationDate: PA_VERIFIED,
  };

  if (charged == null) {
    return {
      ...base,
      classification: "not_checked",
      chargedAmount: null,
      exceedsStoredCap: false,
      summary: "No documentation fee amount was found to compare with Pennsylvania's 2026 documentary preparation fee notice.",
    };
  }

  if (exceeds(charged, PA_ELECTRONIC) || (electronic === false && exceeds(charged, PA_NONELECTRONIC))) {
    return {
      ...base,
      classification: "illegal",
      chargedAmount: charged,
      exceedsStoredCap: true,
      summary:
        electronic === false
          ? `The $${charged} documentary preparation fee exceeds the $409 ceiling in 63 P.S. § 818.327(c)(2) for a 2026 non-electronic transaction.`
          : `The $${charged} documentary preparation fee exceeds $490, the 2026 electronic maximum in 63 P.S. § 818.327(c)(1).`,
    };
  }

  if (electronic === true || !exceeds(charged, PA_NONELECTRONIC)) {
    return {
      ...base,
      classification: "permissible",
      chargedAmount: charged,
      exceedsStoredCap: false,
      summary:
        electronic === true
          ? `The transaction is confirmed as electronic, so the $${charged} documentary preparation fee is within the $490 ceiling in 63 P.S. § 818.327(c)(1) for 2026.`
          : `The $${charged} documentary preparation fee is within the $409 ceiling that applies to a 2026 non-electronic transaction under 63 P.S. § 818.327(c)(2).`,
    };
  }

  return {
    ...base,
    classification: "potentially_noncompliant",
    chargedAmount: charged,
    exceedsStoredCap: false,
    summary: `The $${charged} documentary preparation fee is above $409 and at or below $490. The January 13, 2026 board notice allows $490 only for an electronic transaction under 63 P.S. § 818.327(c)(1). A non-electronic transaction is limited to $409 under subsection (c)(2). Electronic processing was not confirmed.`,
  };
}

function classifyRhodeIsland(charged: number | null, vehicleCashPrice: number | null | undefined): DocFeeAssessment {
  const price = positiveAmount(vehicleCashPrice);
  const belowFloor = price != null && price < RI_PRICE_FLOOR;
  const aboveFloor = price != null && price > RI_PRICE_FLOOR;
  const applicable = belowFloor ? 0 : RI_DOLLAR;
  const base = {
    hardCeiling: price != null && price === RI_PRICE_FLOOR ? null : applicable,
    conditionalCeiling: null as number | null,
    condition: RI_CONDITION,
    jurisdiction: "Rhode Island",
    statutoryReference: RI_STATUTE,
    officialSource: RI_SOURCE,
    effectiveDate: "needs_source",
    lastVerificationDate: RI_VERIFIED,
  };

  if (charged == null) {
    return {
      ...base,
      hardCeiling: applicable,
      classification: "not_checked",
      chargedAmount: null,
      exceedsStoredCap: false,
      summary: "No documentation fee amount was found to compare with 280-RICR-30-20-1.6(N).",
    };
  }

  if (price != null && price === RI_PRICE_FLOOR && !exceeds(charged, RI_DOLLAR)) {
    return {
      ...base,
      classification: "needs_source",
      chargedAmount: charged,
      exceedsStoredCap: false,
      summary: `The fetched text of 280-RICR-30-20-1.6(N) allows a documentary preparation fee only on transactions in excess of $10,000 and prohibits any such fee on a sale for less than $10,000. It does not state the result for a sale of exactly $10,000, so this $${charged} charge is needs_source.`,
    };
  }

  if (exceeds(charged, RI_DOLLAR) || (belowFloor && charged > 0)) {
    return {
      ...base,
      hardCeiling: belowFloor ? 0 : RI_DOLLAR,
      classification: "illegal",
      chargedAmount: charged,
      exceedsStoredCap: true,
      summary: belowFloor
        ? `The $${charged} documentary preparation fee is charged on a ${moneyLabel(price ?? 0)} sale. 280-RICR-30-20-1.6(N) prohibits any documentary preparation fee on a motor vehicle sold for less than $10,000.`
        : `The $${charged} documentary preparation fee exceeds the $400 maximum in 280-RICR-30-20-1.6(N).`,
    };
  }

  return {
    ...base,
    classification: "permissible",
    chargedAmount: charged,
    exceedsStoredCap: false,
    summary: aboveFloor
      ? `The $${charged} documentary preparation fee is within the $400 ceiling in 280-RICR-30-20-1.6(N) for a transaction in excess of $10,000.`
      : `The $${charged} documentary preparation fee is at or under the $400 ceiling in 280-RICR-30-20-1.6(N). The vehicle price was not on the quote, so the rule's prohibition on any documentary preparation fee for a sale under $10,000 was not applied.`,
  };
}

function classifyMinnesota(charged: number | null, vehicleCashPrice: number | null | undefined): DocFeeAssessment {
  const saleValue = positiveAmount(vehicleCashPrice);
  const tenPercent = saleValue == null ? null : roundMoney(saleValue * 0.1);
  const applicable = tenPercent == null ? MN_DOLLAR : Math.min(MN_DOLLAR, tenPercent);
  const base = {
    hardCeiling: applicable,
    conditionalCeiling: tenPercent != null && tenPercent !== MN_DOLLAR ? tenPercent : null,
    condition: MN_CONDITION,
    jurisdiction: "Minnesota",
    statutoryReference: MN_STATUTE,
    officialSource: MN_SOURCE,
    effectiveDate: "2025-07-01",
    lastVerificationDate: MN_VERIFIED,
  };
  const priceNote =
    saleValue == null
      ? "The value of the sale or lease was not on the quote, so the 10% limb in Minn. Stat. § 168.27, subd. 31 was not applied and the ceiling used is $350."
      : `The applicable ceiling is ${moneyLabel(applicable)}, the lesser of $350 and 10% of the ${moneyLabel(saleValue)} sale or lease value (${moneyLabel(tenPercent ?? applicable)}) under Minn. Stat. § 168.27, subd. 31, for a sale on or after July 1, 2025.`;

  if (charged == null) {
    return {
      ...base,
      classification: "not_checked",
      chargedAmount: null,
      exceedsStoredCap: false,
      summary: `No documentation fee amount was found to compare with Minnesota's documentary fee rule. ${priceNote}`,
    };
  }

  if (exceeds(charged, applicable)) {
    return {
      ...base,
      classification: "illegal",
      chargedAmount: charged,
      exceedsStoredCap: true,
      summary: `The $${charged} documentary fee exceeds Minnesota's ceiling of ${moneyLabel(applicable)}. ${priceNote}`,
    };
  }

  return {
    ...base,
    classification: "permissible",
    chargedAmount: charged,
    exceedsStoredCap: false,
    summary: `The $${charged} documentary fee is at or under Minnesota's ceiling of ${moneyLabel(applicable)}. ${priceNote}`,
  };
}

function classifyOhio(
  charged: number | null,
  vehicleCashPrice: number | null | undefined,
  fees: FeeLine[],
): DocFeeAssessment {
  const salePrice = positiveAmount(vehicleCashPrice);
  const contractBase = salePrice == null ? null : contractAmountExcludingGovernment(salePrice, fees);
  const tenPercent = contractBase == null ? null : roundMoney(contractBase * 0.1);
  const applicable = tenPercent == null ? OH_DOLLAR : Math.min(OH_DOLLAR, tenPercent);
  const base = {
    hardCeiling: applicable,
    conditionalCeiling: tenPercent != null && tenPercent !== OH_DOLLAR ? tenPercent : null,
    condition: OH_CONDITION,
    jurisdiction: "Ohio",
    statutoryReference: OH_STATUTE,
    officialSource: OH_SOURCE,
    effectiveDate: OH_EFFECTIVE,
    lastVerificationDate: OH_VERIFIED,
  };
  const priceNote =
    contractBase == null
      ? "The contract amount excluding tax, title, registration, and negative equity was not on the quote, so the 10% limb in Ohio Rev. Code § 4517.261(B)(2) was not applied and the ceiling used is the $398 registrar amount for calendar year 2026."
      : `The applicable ceiling is ${moneyLabel(applicable)} under Ohio Rev. Code § 4517.261, the lesser of the $398 registrar amount for 2026 and 10% of the ${moneyLabel(contractBase)} contract amount excluding tax, title, registration, and negative equity (${moneyLabel(tenPercent ?? applicable)}).`;

  if (charged == null) {
    return {
      ...base,
      classification: "not_checked",
      chargedAmount: null,
      exceedsStoredCap: false,
      summary: `No documentation fee amount was found to compare with Ohio Rev. Code § 4517.261. ${priceNote}`,
    };
  }

  if (exceeds(charged, applicable)) {
    return {
      ...base,
      classification: "illegal",
      chargedAmount: charged,
      exceedsStoredCap: true,
      summary: `The $${charged} documentary service charge exceeds Ohio's ceiling of ${moneyLabel(applicable)}. ${priceNote} The $398 amount was fetched from ${OH_BOARD_SOURCE} on ${OH_VERIFIED}.`,
    };
  }

  return {
    ...base,
    classification: "permissible",
    chargedAmount: charged,
    exceedsStoredCap: false,
    summary: `The $${charged} documentary service charge is at or under Ohio's ceiling of ${moneyLabel(applicable)}. ${priceNote}`,
  };
}

export function classifyLineItem(name: string): ChargeClassification {
  const n = name.toLowerCase();
  if (/\b(sales tax|use tax|excise tax|tax)\b/.test(n)) return "government";
  if (/\b(title|registration|license plate|tag fee|plates)\b/.test(n)) return "government";
  if (/market.?adjust|additional dealer markup|\badm\b|dealer markup/.test(n)) return "negotiable";
  if (/declined|removed|waived/.test(n)) return "negotiable";
  return "negotiable";
}
