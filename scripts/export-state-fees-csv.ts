/**
 * Rewrite data/state_fees.csv from data/state_fees.json.
 * The JSON file is the source of truth.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

interface Citation {
  url: string;
}

interface StateRow {
  name: string;
  docFeeCap: boolean;
  docFeeCapAmount: number | null;
  docFeeTypicalRange: [number, number];
  docFeeAverage: number | null;
  stateSalesTaxRate: number;
  maxCombinedTaxRate: number;
  tradeInTaxCredit: boolean;
  titleFee: number | null;
  registrationFee: string;
  statuteCitation: string | null;
  source_status: string;
  citations?: Citation[];
}

interface Dataset {
  states: Record<string, StateRow>;
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dataset = JSON.parse(readFileSync(resolve(root, "data/state_fees.json"), "utf8")) as Dataset;

function cell(value: string | number | boolean | null): string {
  if (value === null || value === undefined) return "";
  const text = String(value);
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

const header = [
  "code",
  "name",
  "doc_fee_cap",
  "doc_fee_cap_amount",
  "doc_fee_typical_low",
  "doc_fee_typical_high",
  "doc_fee_average",
  "state_sales_tax_rate",
  "max_combined_tax_rate",
  "trade_in_tax_credit",
  "title_fee",
  "registration_fee",
  "statute_citation",
  "source_status",
  "citation_urls",
];

const lines = [header.join(",")];
for (const [code, state] of Object.entries(dataset.states)) {
  const [low, high] = state.docFeeTypicalRange;
  lines.push(
    [
      code,
      state.name,
      state.docFeeCap,
      state.docFeeCapAmount,
      low,
      high,
      state.docFeeAverage,
      state.stateSalesTaxRate,
      state.maxCombinedTaxRate,
      state.tradeInTaxCredit,
      state.titleFee,
      state.registrationFee,
      state.statuteCitation,
      state.source_status,
      (state.citations ?? []).map((citation) => citation.url).join(" "),
    ]
      .map(cell)
      .join(","),
  );
}

writeFileSync(resolve(root, "data/state_fees.csv"), lines.join("\n") + "\n");
console.log(`Wrote ${Object.keys(dataset.states).length} rows to data/state_fees.csv`);
