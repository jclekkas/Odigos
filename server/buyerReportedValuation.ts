/**
 * Buyer-reported price context.
 *
 * Comparable listings, a book value, and a second dealer quote are typed by
 * the buyer. Odigos does not fetch listing sites or book-value sites. None of
 * these inputs verify market value. marketValuation stays unverified.
 *
 * A competing quote is read with the same purchase pipeline as the primary
 * quote after extraction: enrichDetectedFields, then resolvePurchaseLines
 * with the same documentation-fee name check. The dollar lines compared are
 * selling price, documentation fee, add-ons, tax and government fees, and
 * the out-the-door total.
 */

import type { DetectedFields, Fee } from "../shared/schema.js";
import type { BuyerBookValueInput, BuyerComparableInput, BuyerReported } from "../shared/buyerReported.js";
import { isDocFeeName } from "./docFeeName.js";
import { enrichDetectedFields, resolvePurchaseLines } from "./governmentCharges.js";
import { formatUsd } from "./marketValuation.js";
import { classifyFeeBucket } from "./quoteMath.js";

/** A listing counts as clearly above or below only past this cushion. */
export const BUYER_COMP_CLEAR_GAP_RATIO = 0.01;
export const BUYER_COMP_CLEAR_GAP_FLOOR = 50;

const DOLLAR_SOURCE = String.raw`\$\s*(\d{1,3}(?:,\d{3})+|\d+)(?:\.(\d{2}))?`;

const SALE_LABEL = /(?:selling|sale|vehicle|purchase|internet|advertised)\s+price/i;
const OTD_LABEL = /out[\s-]*the[\s-]*door|o\.?t\.?d\.?/i;
const DOC_LABEL = /doc(?:ument(?:ation)?)?\s*fee|documentary\s+fee|document\s+fee/i;
const IGNORE_LABEL = /msrp|sticker\s+price|window\s+sticker|down\s+payment|monthly\s+payment|rebate|trade(?:-|\s)?in|money\s+factor|residual|\bapr\b/i;

export interface BuyerReportedInput {
  salePrice?: number | null;
  primary: DetectedFields;
  primaryText?: string | null;
  comps?: BuyerComparableInput[] | null;
  bookValue?: BuyerBookValueInput | null;
  competingQuoteText?: string | null;
}

export function clearGapDollars(price: number): number {
  return Math.max(BUYER_COMP_CLEAR_GAP_FLOOR, Math.round(price * BUYER_COMP_CLEAR_GAP_RATIO));
}

export function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[mid];
  return Math.round(((sorted[mid - 1] + sorted[mid]) / 2) * 100) / 100;
}

function money(raw: string, fraction: string | undefined): number {
  const whole = Number(raw.replace(/,/g, ""));
  const cents = fraction ? Number(fraction) / 100 : 0;
  return Math.round((whole + cents) * 100) / 100;
}

function labelBefore(text: string, index: number, previousEnd: number): string {
  const start = Math.max(previousEnd, index - 80);
  const window = text.slice(start, index);
  const line = window.split(/[\n\r.;]+/).pop() ?? window;
  return line.replace(/[:\-–=\s$]+$/g, "").trim();
}

interface ParsedQuoteDraft {
  salePrice: number | null;
  outTheDoorPrice: number | null;
  fees: Fee[];
}

export function parseCompetingQuoteDraft(text: string): ParsedQuoteDraft {
  const draft: ParsedQuoteDraft = { salePrice: null, outTheDoorPrice: null, fees: [] };
  const source = text.replace(/\u00a0/g, " ");
  const dollar = new RegExp(DOLLAR_SOURCE, "g");
  let previousEnd = 0;
  for (const match of source.matchAll(dollar)) {
    const amount = money(match[1], match[2]);
    const index = match.index ?? 0;
    const nextEnd = index + match[0].length;
    if (!Number.isFinite(amount) || amount <= 0) {
      previousEnd = nextEnd;
      continue;
    }
    const label = labelBefore(source, index, previousEnd);
    previousEnd = nextEnd;
    if (!label || label.length < 2) continue;
    if (OTD_LABEL.test(label)) {
      if (draft.outTheDoorPrice == null) draft.outTheDoorPrice = amount;
      continue;
    }
    if (SALE_LABEL.test(label)) {
      if (draft.salePrice == null) draft.salePrice = amount;
      continue;
    }
    if (IGNORE_LABEL.test(label) || classifyFeeBucket(label) != null) continue;
    const name = DOC_LABEL.test(label) ? "Doc fee" : label.slice(0, 80);
    draft.fees.push({ name, amount });
  }
  return draft;
}

export interface QuoteMoneyView {
  sellingPrice: number | null;
  docFee: number | null;
  addOns: number | null;
  addOnNames: string[];
  taxAndFees: number | null;
  outTheDoor: number | null;
}

function blankDetected(partial: Partial<DetectedFields>): DetectedFields {
  return {
    salePrice: null,
    msrp: null,
    rebates: null,
    fees: [],
    outTheDoorPrice: null,
    monthlyPayment: null,
    tradeInValue: null,
    apr: null,
    termMonths: null,
    downPayment: null,
    ...partial,
  };
}

/** Same fee split the primary quote uses after its fields are enriched. */
export function quoteMoneyFromFields(fields: DetectedFields, dealerText?: string | null): QuoteMoneyView {
  const enriched = enrichDetectedFields(fields, dealerText);
  const lines = resolvePurchaseLines(enriched, isDocFeeName, dealerText);
  const addOnNames = (enriched.fees ?? [])
    .filter((fee) => fee.amount != null && fee.amount > 0 && classifyFeeBucket(fee.name) == null && !isDocFeeName(fee.name.toLowerCase()))
    .map((fee) => fee.name);
  const sawDoc = (enriched.fees ?? []).some((fee) => fee.amount != null && isDocFeeName(fee.name.toLowerCase()));
  const sawAddOn = addOnNames.length > 0;
  const sawGov = lines.sawTax || lines.sawTitle || lines.sawRegistration || lines.sawGov;
  const taxAndFees = sawGov
    ? Math.round((((lines.statedTax ?? 0) + lines.titleFee + lines.registrationFee + lines.govFees) * 100)) / 100
    : null;
  return {
    sellingPrice: enriched.salePrice,
    docFee: sawDoc ? lines.docFee : null,
    addOns: sawAddOn ? lines.addOns : null,
    addOnNames,
    taxAndFees,
    outTheDoor: enriched.outTheDoorPrice,
  };
}

export function extractCompetingQuote(text: string): QuoteMoneyView | null {
  const draft = parseCompetingQuoteDraft(text);
  if (draft.salePrice == null && draft.outTheDoorPrice == null && draft.fees.length === 0) return null;
  return quoteMoneyFromFields(
    blankDetected({
      salePrice: draft.salePrice,
      fees: draft.fees,
      outTheDoorPrice: draft.outTheDoorPrice,
    }),
    text,
  );
}

function compSummary(count: number, aboveCount: number, position: NonNullable<BuyerReported["comps"]>["position"], min: number, max: number, mid: number): string {
  const range = `The asking prices you entered run from ${formatUsd(min)} to ${formatUsd(max)}, with a median of ${formatUsd(mid)}.`;
  const where = `Your quote is above ${aboveCount} of the ${count} listings you entered.`;
  const tail = "Those listings are buyer-reported and are not a verified market value. The dollar gap is not guaranteed savings.";
  if (position === "below_all") {
    return `${where} It is below every listing you entered. ${range} ${tail} That is not a buy decision.`;
  }
  if (position === "above_all") {
    return `${where} ${range} ${tail}`;
  }
  return `${where} It sits inside the prices you entered. ${range} ${tail} That is not a buy decision.`;
}

function bookSummary(amount: number, sourceLabel: string, relation: "above" | "at_or_below" | "unavailable"): string {
  const lookedUp = `You entered a book value of ${formatUsd(amount)} from ${sourceLabel}. Odigos did not look that up. It is buyer-reported and needs_source. It is not a verified market value.`;
  if (relation === "above") return `${lookedUp} Your selling price is above that book value. The gap is not guaranteed savings.`;
  if (relation === "at_or_below") return `${lookedUp} Your selling price is at or below that book value. That is not a buy decision.`;
  return lookedUp;
}

function lineSentence(label: string, thisQuote: number | null, otherQuote: number | null): string | null {
  if (thisQuote == null || otherQuote == null) return null;
  const gap = Math.round((otherQuote - thisQuote) * 100) / 100;
  const name = label.toLowerCase();
  if (gap > 0) return `The other quote's ${name} is ${formatUsd(gap)} higher.`;
  if (gap < 0) return `This quote's ${name} is ${formatUsd(Math.abs(gap))} higher.`;
  return `The ${name} matches the other quote.`;
}

function competingSummary(lines: NonNullable<BuyerReported["competingQuote"]>["lines"]): string {
  const sentences = lines
    .map((line) => lineSentence(line.label, line.thisQuote, line.otherQuote))
    .filter((sentence): sentence is string => !!sentence);
  const body = sentences.length > 0 ? sentences.join(" ") : "The other quote did not have enough labeled prices to compare line by line.";
  return `${body} This compares the two quotes you pasted. It is buyer-reported and needs_source. It is not a verified market value, and a lower line is not guaranteed savings.`;
}

export function buildBuyerReported(input: BuyerReportedInput): BuyerReported {
  const comps = (input.comps ?? []).filter((comp) => Number.isFinite(comp.askingPrice) && comp.askingPrice > 0).slice(0, 5);
  const sale = input.salePrice;
  let compsBlock: BuyerReported["comps"] = null;
  if (comps.length > 0) {
    const prices = comps.map((comp) => comp.askingPrice);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const mid = median(prices);
    const aboveCount =
      sale == null
        ? 0
        : prices.filter((price) => sale > price + clearGapDollars(price)).length;
    const belowCount =
      sale == null
        ? 0
        : prices.filter((price) => sale < price - clearGapDollars(price)).length;
    const position =
      sale == null
        ? "unavailable"
        : aboveCount === prices.length
          ? "above_all"
          : belowCount === prices.length
            ? "below_all"
            : "inside";
    compsBlock = {
      count: prices.length,
      min,
      max,
      median: mid,
      aboveCount,
      position,
      listings: comps.map((comp) => ({
        askingPrice: comp.askingPrice,
        url: comp.url ?? null,
        source: comp.source ?? null,
        mileage: comp.mileage ?? null,
      })),
      summary: sale == null
        ? `You entered ${prices.length} listing ${prices.length === 1 ? "price" : "prices"} from ${formatUsd(min)} to ${formatUsd(max)}, median ${formatUsd(mid)}. The quote has no selling price to place against them. Those listings are buyer-reported and are not a verified market value.`
        : compSummary(prices.length, aboveCount, position, min, max, mid),
    };
  }

  let bookBlock: BuyerReported["bookValue"] = null;
  if (input.bookValue && Number.isFinite(input.bookValue.amount) && input.bookValue.amount > 0) {
    const amount = input.bookValue.amount;
    const relation =
      sale == null
        ? "unavailable"
        : sale > amount + clearGapDollars(amount)
          ? "above"
          : "at_or_below";
    bookBlock = {
      amount,
      sourceLabel: input.bookValue.sourceLabel.trim(),
      relation,
      citationStatus: "needs_source",
      summary: bookSummary(amount, input.bookValue.sourceLabel.trim(), relation),
    };
  }

  let competingBlock: BuyerReported["competingQuote"] = null;
  const competingText = input.competingQuoteText?.trim() ?? "";
  if (competingText) {
    const other = extractCompetingQuote(competingText);
    if (!other) {
      competingBlock = {
        status: "unparsed",
        citationStatus: "needs_source",
        lines: [],
        summary: "The other quote did not include labeled prices we could compare. It is buyer-reported and was not used as a market value.",
      };
    } else {
      const primary = quoteMoneyFromFields(input.primary, input.primaryText);
      const addOnDetail = (names: string[]) => (names.length > 0 ? names.join(", ") : null);
      const lines: NonNullable<BuyerReported["competingQuote"]>["lines"] = [
        { key: "sellingPrice", label: "Selling price", thisQuote: primary.sellingPrice, otherQuote: other.sellingPrice, detail: null },
        { key: "docFee", label: "Documentation fee", thisQuote: primary.docFee, otherQuote: other.docFee, detail: null },
        {
          key: "addOns",
          label: "Dealer add-ons",
          thisQuote: primary.addOns,
          otherQuote: other.addOns,
          detail: [addOnDetail(primary.addOnNames), addOnDetail(other.addOnNames)].filter(Boolean).join(" vs ") || null,
        },
        { key: "taxAndFees", label: "Tax and government fees", thisQuote: primary.taxAndFees, otherQuote: other.taxAndFees, detail: null },
        { key: "outTheDoor", label: "Out-the-door total", thisQuote: primary.outTheDoor, otherQuote: other.outTheDoor, detail: null },
      ];
      competingBlock = {
        status: "compared",
        citationStatus: "needs_source",
        lines,
        summary: competingSummary(lines),
      };
    }
  }

  const parts = [compsBlock?.summary, bookBlock?.summary, competingBlock?.summary].filter((part): part is string => !!part);
  return {
    label: "buyer-reported",
    verifiesMarketValue: false,
    citationStatus: "needs_source",
    comps: compsBlock,
    bookValue: bookBlock,
    competingQuote: competingBlock,
    summary: parts.join(" "),
  };
}

export function buyerReportedRuleOptions(report: BuyerReported): {
  buyerReportedExplanation: string | null;
  quoteAboveAllBuyerComps: boolean;
} {
  return {
    buyerReportedExplanation: report.summary.trim() ? report.summary.trim() : null,
    quoteAboveAllBuyerComps: report.comps?.position === "above_all",
  };
}

export function buyerReportedHasInput(report: BuyerReported): boolean {
  return report.comps != null || report.bookValue != null || report.competingQuote != null;
}
