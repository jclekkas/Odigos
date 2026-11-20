# Engine scorecard

Date: November 20, 2026. The deterministic checks do not call a model.

## Score

48 golden quotes in `tests/unit/goldenQuotes.test.ts`. 33 are purchases. 15 are leases. All 48 match the verdict the rules should give after the bug fixes below.

`npx tsx scripts/eval-golden-quotes.ts` sends three short quotes to a model only when `OPENAI_API_KEY` is set. With no key it skips and spends nothing. It was skipped in this audit. It is not a pass/fail score.

## Bugs fixed

1. **Texas was treated as a $225 legal maximum.** The statute says the fee must be reasonable. $225 is the amount that does not need an OCCC filing. A higher filed fee can still be legal. The file no longer sets a hard cap, so the engine no longer says that fee is illegal.
2. **Stale cap dollars.** Ohio is $398 for 2026, not $387. Louisiana is $436 for 2026, not $425. Missouri is $620.79 for 2026, not $500. Indiana's enforcement figure is $251.05, not $251.
3. **Wrong tax rates the engine was repeating.** Iowa is 6%, not 5%. Nevada's base rate is 6.85%, not 4.6%. Alabama's automotive rate is 2%, not the 4% general rate. Georgia titled vehicles pay 7% title ad valorem tax, not 4% sales tax.
4. **A legal doc fee was called an add-on.** Any doc fee over $300, or over $500, could turn a clean quote yellow even when it was under the state cap. A fee at or under the cap is no longer counted as junk.
5. **"adm" matched the word "admin".** An admin fee was labeled a market adjustment. The short keyword now has to stand alone.
6. **Doc-fee names the cap checker knew were invisible to the junk checker.** "Documentary fee" and "documentary service charge" could miss the vague-fee path. Those names are checked in both places.
7. **A complete lease was failed for having no out-the-door price.** After the lease checks pass, the engine no longer demands a purchase-style out-the-door total.
8. **A lease with no price at all could look finished.** Money factor, residual, and miles without a selling price, MSRP, or out-the-door figure now ask for the missing terms.
9. **Rate-markup dollars ignored the down payment.** The markup now uses the same adjusted cap cost as the payment check.

## What still fails a careful buyer

These are gaps, not tests we turned green by lowering the bar.

- The payment check is pre-tax. In a state that taxes the monthly lease payment, a correct payment looks too high.
- Oregon's $200 non-integrator cap and Pennsylvania's $409 non-electronic cap are notes. The engine uses the higher ceiling only.
- Ohio also limits the fee to 10% of the amount due. The engine only checks $398.
- Rhode Island forbids any documentary fee on a vehicle sold for $10,000 or less. The engine only checks $400.
- Disposition fees are stored and not scored.
- Mileage allowance (10,000 vs 15,000) is not scored. Only an excess-mileage rate over $0.30 is.
- Yo-yo financing, spot delivery, and payment packing are not detected.
- Buy-rate money factors are benchmarks in the repo, not a lender's current sheet.
- 26 states still have no fetched citation for either the doc-fee rule or the state tax. See `docs/STATE_FEE_AUDIT.md`.
