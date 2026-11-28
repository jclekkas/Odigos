# P0 incident report: false GO on an overpriced quote

Date of this audit: 2026-11-27. This report covers the two synthetic quotes submitted against live odigosauto.com and the code path that produced them. It does not change production, Vercel config, or deploy workflows.

## Confirmed root cause

The live results match the code that was on `main`.

Test A (2025 Toyota Camry LE, California, cash, selling price $28,000, doc fee $85, sales tax $2,176.59, reg and title $400, out-the-door $30,661.59) and Test B (same structure at a $45,000 selling price and a $48,985 out-the-door price) both came back GO, medium confidence, estimated savings $0–$400. Test B also showed an expected normal out-the-door range of $48,500–$49,000 and a dealer reply that endorsed the price and asked for a buyer's order.

That happened for five independent reasons:

1. **The verdict did not look at the vehicle price.** `applyRuleEngine` in `server/ruleEngine.ts` returned `GO — TERMS LOOK CLEAN` or `PROCEED — CONFIRM DETAILS` once an out-the-door price was present and no add-on or doc-fee-cap rule fired. A complete, internally consistent quote was treated as a good deal. GO rewarded completeness and fee compliance.

2. **The expected range and the savings were invented by the model.** `server/services/analyzeService.ts` asked the model to "estimate a plausible normal OTD range" and showed a worked example of a "roughly fair" deal with savings of $0–$400. No vehicle-level comparable, MSRP feed, or licensed valuation was passed in. When market context is absent, the model anchored the "normal" range on the quoted out-the-door price. Test B's $48,500–$49,000 range sits on top of the submitted $48,985 total. The submitted price determined the benchmark.

3. **No vehicle-level comparable is retrieved.** `server/marketContext.ts` reads state doc-fee averages and dealer score counts from Odigos's own submitted quotes. It does not retrieve a price for a 2025 Camry LE. Those aggregates are not comparables, and unrelated dealer quotes are not used as a price for this vehicle. The prompt forbade invented statistics, then still required a normal-price range. The model filled the gap.

4. **Savings were a heuristic, not evidence.** The same prompt told the model to return a small range such as $0–$400 even when the deal "looks roughly fair." That is the savings figure in both live results.

5. **The dealer reply was not bound to a finding.** The prompt told the model, for a GREEN result, to ask that the final buyer's order reflect the agreed terms. Nothing stopped the reply from endorsing a price the rules had never checked.

California's $85 doc fee was also treated as universally allowed. The stored note already said $85 is only for a DMV private-industry partner and $70 otherwise, and the analyzer used the higher number as the only ceiling.

## Official sources fetched for this change

These pages were fetched on 2026-11-27:

- California Vehicle Code § 4456.5, https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=VEH&sectionNum=4456.5
  - Operative January 1, 2019.
  - § 4456.5(a)(1)(A): if the dealer has a contractual agreement with the department to be a private industry partner under § 1685, the document processing charge shall not exceed $85.
  - § 4456.5(a)(1)(B): if the dealer does not have that agreement, the charge shall not exceed $70.
  - The charge shall not be represented as a governmental fee.
- California Vehicle Code § 1685, https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=VEH&sectionNum=1685
  - Authorizes contracts with qualified private industry partners for electronic registration and titling programs, including first-line business partners, first-line service providers, and second-line business partners.

Other state caps already in `data/state_fees.json` were not re-fetched for this change. A cap is now called a legal violation only when that file records a citation and does not list `docFeeCapAmount` under `unverified_fields`. New York's stored $175 figure is `needs_source` and is no longer described as illegal. Fields that were not verified stay `needs_source`.

## Verdict mapping

The decision is deterministic. The model may still extract fields. It does not choose the verdict, the savings, the benchmark, or the dealer reply.

| Outcome | When it is used |
| --- | --- |
| GO | Selling price is inside an independent benchmark that was not copied from the quote, the checked math reconciles, and no verified or conditional fee problem is open. |
| PROCEED WITH CAUTION | A specific problem can be named: the total does not reconcile, a payment does not match the amortization, a conditional California doc fee is unverified, an add-on or negative equity or competing price needs a decision. Stored enum: `PROCEED-WITH-CAUTION`. |
| INSUFFICIENT INFORMATION | A reliable buy decision cannot be made. This includes a complete quote whose math is clean when market value is not verified, a payment-only quote, a missing out-the-door price, a used vehicle with no mileage, and a lease with no discrepancy whose price is still unverified. Stored enum: `INSUFFICIENT-INFORMATION`. |
| NO-GO | A material problem is established: a verified illegal doc fee, a declined add-on that is still charged, an explicit market adjustment, two or more high-cost add-ons, or a selling price above a real independent benchmark. |

**Mapping choice:** a clean quote with unverified market value is INSUFFICIENT INFORMATION, not PROCEED WITH CAUTION and not GO. "Proceed with caution" is reserved for a named problem the buyer can take back to the dealer. Saying the paperwork looks complete is not approval of the price. Older stored rows may still contain `NEED-MORE-INFO`; the UI still renders that legacy value.

Confidence follows the evidence. A verified cap violation or a deterministic math break is high. A complete quote with unverified market value is medium: the audit of the pages that exist is usable, and the price verdict is an abstention. A quote missing the price, the vehicle, or used-vehicle mileage is low.

The six analytical dimensions are returned on every new analysis: pricing transparency, mathematical accuracy, regulatory compliance, market competitiveness, negotiation opportunities, and information completeness.

## Containment

Until a licensed valuation source is configured, `independentMarketBenchmark` returns `unverified` and null bounds. The submitted selling price and out-the-door price are arguments so tests can prove they are not read. A caller-supplied benchmark that is just the submitted price copied into both ends is discarded.

Unsupported overpayment ranges and "normal" out-the-door ranges from the model are dropped. The screen says "Market value not verified" instead of a dollar range. Dealer replies are rebuilt from the findings. They ask for the VIN, the window sticker, and an equipment or market-adjustment breakdown. They do not endorse a price or request purchase paperwork unless the verdict is GO.

Synthetic submissions (`synthetic: true` or the marker `ODIGOS_SYNTHETIC_QA`) are not written to `dealer_submissions` and are not sent to the warehouse, so they cannot enter listing or stats tables. The same flag also skips analysis audit rows, file and URL processing events, and the other analytics around that submission. Rate-limit abuse logs still record. The flag is fixed when the request arrives. See `docs/SYNTHETIC_QA.md`.

## Before and after

| | Test A, $28,000 | Test B, $45,000 |
| --- | --- | --- |
| Before | GO, medium, savings $0–$400 | GO, medium, savings $0–$400, normal range $48,500–$49,000, reply endorses the price |
| After | PROCEED WITH CAUTION. The $85 doc fee is allowed under § 4456.5 only if the dealer is a private industry partner. Market value not verified. No savings range. Reply asks for VIN, window sticker, and partner status. | Same verdict class and the same unverified benchmark. The higher asking price does not move the benchmark and is not approved. |

A Camry quote with a $70 doc fee (inside the non-partner ceiling), reconciled tax, and no other defect is INSUFFICIENT INFORMATION — MARKET VALUE NOT VERIFIED at $20,000, $28,000, $35,000, $45,000, $60,000, and $100,000.

## Regression metrics

The adjudicated suite lives in `tests/unit/adversarialQuotes.test.ts` (the test requires at least 100 quotes and passes) and `tests/unit/incidentCamry.test.ts` (the six-price metamorphic check plus Test A and Test B).

Verification on this branch:

- `npm test`: 883 passed, 1 skipped
- `npm run check`: passed
- `npm run lint`: passed, 0 errors (existing warnings remain)
- `npm run build`: passed. Chromium prerender was skipped because Chromium is not installed; server-side meta injection remains the fallback.

Required result: critical false approvals = 0. False approvals of any non-GO case = 0. A quote is GO in that suite only when the test itself supplies an independent benchmark and the selling price sits inside it. The same benchmark rejects a $45,000 ask. A benchmark copied from the asking price is ignored.

Calculation checks cover out-the-door reconciliation, payment versus amortization, negative equity, and financing-contingent rebates that must not be counted on a cash deal. Regulatory checks cover the California $70 / $85 split, verified caps that were already cited in the dataset, and New York's unverified stored figure.

## Deterministic math

`server/quoteMath.ts` remains the authority for purchase math. It now also reports trade equity, government charges versus dealer-imposed charges, total of payments, finance charge, a financing-contingent rebate excluded from a cash deal, and a line-by-line derivation. Lease payment, money-factor markup, residual, and acquisition fee checks stay in `server/leaseMathEngine.ts`. A clean lease is no longer a GO while the vehicle price is unverified. Disposition fees are still stored and are not scored against an invented dollar limit.

## Independent valuation options

No provider is wired. Do not embed an owner API key. Any future source should be bring-your-own-key and must not be computed from the quote under review.

| Option | What it would add | Licensing and limits |
| --- | --- | --- |
| Buyer-supplied window sticker | Manufacturer MSRP, options, and destination for that VIN. The buyer or the sticker is the source. | No license. It is not a market transaction price. A dealer-printed addendum is not the sticker. |
| VIN decode (NHTSA vPIC or similar) | Year, make, model, and plant. | Public decode endpoints do not return a selling price. Cost: needs_source. |
| Licensed book or listing APIs (Kelley Blue Book, Edmunds, J.D. Power, Black Book, listing aggregators) | A third-party price or a set of listings for the configuration. | Commercial license required. Prices, rate limits, and permitted display: needs_source. Estimates are not offers. Coverage for a brand-new, option-specific car is often MSRP rather than transaction price. |
| Manufacturer build data | Official MSRP for a configuration. | No integration is configured. Contract terms: needs_source. |
| Odigos normalized observations | The warehouse today stores doc fees, deal scores, and line items from submitted quotes. | Using those rows as a Camry price would repeat this incident: the sample is not a controlled comparable set, seeded and real quotes are mixed at state level by current policy, and a thin sample will track whatever buyers happen to submit. Not a valuation source. |

Recommendation: keep market value unverified until one of the licensed or sticker-based sources is chosen and returns a figure that does not depend on the asking price. That commercial choice is separate from this fix.

## Outstanding risks

- Field extraction is still a model step. A wrong extracted price makes the worksheet wrong. The verdict no longer treats that extraction as a market opinion.
- State caps other than California were not re-fetched. Enforcing them depends on citations already stored in `data/state_fees.json`. Oregon's note describes a $200 / $250 integrator split that this change does not re-implement; the stored $250 ceiling is unchanged. Effective dates for non-California caps remain `needs_source` unless the existing citation states one.
- Local sales-tax add-ons are still not fully modeled. A stated tax line is reconciled; a missing tax line is not invented.
- Educational pages still describe typical fee ranges that the dataset marks unverified. Product claims that said Odigos finds illegal and overpriced deals, beats generic AI, or updates market data continuously were aligned with what the auditor actually does. Remaining articles should be read the same way before they are cited as product capability.
