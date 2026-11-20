# State fee dataset

`state_fees.json` is the rule file the quote analyzer and the state fee comparison tables read. `state_fees.csv` is the same rows in a spreadsheet-friendly form. Edit the JSON, then regenerate the CSV so the two files stay in step (see below).

This is not legal advice. Caps, tax rates, and title fees change. A value with `"source_status": "needs_source"` is carried forward from the previous internal file and was not confirmed against a statute, DMV, or attorney-general page for this export.

## Schema

| Field | Meaning |
| --- | --- |
| `schema_version` | Shape of this file. Current version is `1.1.0`. |
| `last_reviewed` | Date of the last pass that checked citations (`YYYY-MM-DD`). |
| `dataset_version` | Version string inherited from the previous internal file. |
| `states` | One object per US state and the District of Columbia, keyed by postal abbreviation. |
| `source_status` | `verified`, `partial`, or `needs_source`. |
| `citations` | Pages fetched for this export that state the value. Empty when nothing was verified. |
| `unverified_fields` | Rule fields that do not have a citation in this file. |
| `sources` | Older URLs kept so research leads are not thrown away. They were **not** re-fetched. Do not treat them as citations. |

`verified` means a fetched page states the doc-fee cap flag and, when the state is capped, the dollar amount stored here.

`partial` means a fetched page supports some but not all of the stored rule. Read `citations[].supports` before relying on a number.

`needs_source` means this export did not verify a citation for that state.

## How a correction gets in

1. Open a [state dataset correction](../.github/ISSUE_TEMPLATE/state_fee_correction.yml) issue, or send a pull request that starts from one.
2. Include a link to a statute, adopted regulation, DMV or revenue department page, or state attorney-general page that states the number you want changed. A blog, forum, or dealer site is not enough for a cap or a tax rate.
3. Quote the sentence that states the value, and say the date you retrieved the page.
4. Change only the fields the source supports. Leave everything else as it is.
5. Set `source_status` to `verified` or `partial`, replace `citations` with the page you fetched, and remove the updated fields from `unverified_fields`.
6. Set `last_reviewed` to the date of the change.
7. Regenerate the CSV:

```bash
npx tsx scripts/export-state-fees-csv.ts
```

8. Run `npm test`. The dataset test checks that every state has a status, that `needs_source` rows have no citations, and that the analyzer still reads this file.

A maintainer reviews the linked page before merging. If the page does not state the value, the change stays at `needs_source`.

Narrative guides under `client/src/data/stateFees.ts` are written pages, not this dataset. If a correction changes a cap or a tax rate, update the matching guide in the same pull request so the article does not contradict the rule file.

## What the analyzer uses

For each detected state, the analyzer reads `docFeeCap`, `docFeeCapAmount`, `cpiIndexing` (when present), `docFeeTypicalRange`, `stateSalesTaxRate`, `tradeInTaxCredit`, `statuteCitation`, and `specialNotes`. A doc fee above the effective cap forces a NO-GO verdict. Typical ranges and tax rates are context for the model. They are not, by themselves, a legal conclusion.
