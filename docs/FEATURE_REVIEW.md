# Feature review

Odigos today is a quote checker. A buyer pastes a dealer message. A model pulls out prices and fees. A small set of rules then decides GO, NO-GO, or need-more-info. The hosted site is free. This note says what is worth keeping, what to stop promising, and what leasing would take. It does not add those features.

## What the product does now

- Paste text, upload a photo or PDF, or try a URL.
- A GREEN / YELLOW / RED score and a GO / NO-GO / need-more-info label.
- Red flags the rules actually know: missing out-the-door price, payment-only quotes, market adjustments, expensive add-ons, and a doc fee over a number in the state file.
- A missing-info list and a draft reply. The draft is written by the model. The rules do not check it.
- Lease math for money factor, residual, acquisition fee, and excess-mileage rate, for 15 brands. The brand rates are benchmarks typed into the repo, not live lender sheets.
- State pages and a published fee file. Many rows are still `needs_source`.

## What buyers run into, and who else helps

Buyers lose money in a few repeatable ways: the out-the-door price is missing, a doc fee is over a legal cap, add-ons are presented as required, the monthly payment hides the price, a lease money factor is marked up, and the deal changes after a deposit (yo-yo or spot delivery).

Other tools cover pieces of that, not the uploaded quote:

- **CarEdge** publishes doc-fee and out-the-door guides so a buyer can look up a state. It does not read the buyer's own worksheet.
- **Edmunds** and **Kelley Blue Book** publish price benchmarks. Both also send shoppers toward dealers.
- **TrueCar** is a price and lead service. The dealer is the customer.
- **Consumer Reports** gives buying advice and price context. It does not score a pasted quote.
- **Leasehackr** is the lease-specific consumer site: shared money factors, residuals, and a calculator. It is a community, not a check of one dealer's email.
- The **FTC** has gone after bait-and-switch and junk fees in car sales. That is the problem this app is for. It is not a substitute for a statute.

Odigos is the rare tool that starts from the message the buyer already has and is not selling that buyer to a dealer. That is the part to protect.

## Keep

The paste box, the cap check, the out-the-door check, and the draft reply. Those match the way people actually get a quote.

## Simplify or stop showing

- The old $29 and $49 pass screens are still in the code and are not what the site charges. They confuse a reader of the repo. Remove them in a later cleanup. Do not turn payments back on.
- Do not describe the state file as fully verified. The audit table is `docs/STATE_FEE_AUDIT.md`.
- The lease buy-rate table will be wrong for some credit tiers and months. The pause it creates should be labeled as a benchmark, not as the lender's sheet. That is a wording change, not a new detector.

## Leasing: what exists, and what full support should mean

Today the app can:

- Read money factor, residual, acquisition fee, disposition fee, mileage allowance, and excess-mileage rate when the model extracts them.
- Convert money factor to APR with the usual times-2,400 shortcut.
- Estimate how many dollars a money factor above a stored buy rate costs, using the cap cost after down payment, trade, and rebates.
- Compare the quoted payment with a pre-tax payment. It does not know which states tax the monthly payment, which tax the cap cost up front, and which tax the whole price.
- Flag a residual that sits below a rough brand band, an acquisition fee above a stored standard, and an excess-mileage rate over $0.30.
- It stores a disposition fee and then ignores it.
- It does not have a field for capitalized cost reduction as its own line. A down payment is the stand-in.

Lease tax checked against a fetched page, not a full 50-state table:

- Alabama taxes an automotive purchase at 2% and an automotive rental or lease at 1.5% (Department of Revenue rate table).
- Connecticut's 6.35% sales tax applies to the lease of most goods (Department of Revenue Services).
- Wisconsin's 5% sales tax applies when a retailer leases tangible personal property (Department of Revenue).
- Oregon has no general sales tax (Department of Revenue). A privilege tax can still apply to some vehicles bought out of state.
- Georgia taxes a titled vehicle with title ad valorem tax, including dealer leases, instead of sales tax (Department of Revenue). The standard rate on the page is 7%.

Every other state's lease-tax method is unverified here. Do not invent the list.

Recommended leasing work, in order. None of this is built in this audit.

1. **Say the payment check is pre-tax.** Small change to the verdict text in `server/ruleEngine.ts`. Stops a taxed payment from sounding like a math error. Low risk.
2. **A lease-tax table.** New rows on the state file: tax the monthly payment, tax the depreciation up front, or tax the full price, with a citation per state. Then teach `validateMonthlyPayment` to use that row. Medium change. The risk is a wrong method, which makes a fair lease look bad. Ship only rows with a fetched page.
3. **Due at signing.** Fields for capitalized cost, cap-cost reduction, and the amount due at signing, in the model prompt and `shared/schema.ts`. Medium. This is what buyers compare.
4. **Disposition fee and mileage allowance.** Compare disposition with a published lender figure when we have one, and flag a 7,500-mile allowance when the buyer did not ask for it. Small additions to `leaseMathEngine.ts`. Easy to nag, so keep the threshold obvious.
5. **Buy rates.** Keep the 15-brand table as a hint until someone files a dated lender sheet. Do not add more brands from memory.

Yo-yo financing, spot delivery, and payment packing are purchase problems as well as lease problems. They need their own detectors and fixtures. That is a separate project. The rules do not see them today.

## Quick wins already in this audit

- Texas is no longer treated as a hard $225 cap.
- A doc fee inside a real cap is no longer called an add-on.
- A complete lease is no longer failed for lacking an out-the-door price.
- Rate-markup dollars use the cap cost after the down payment.

## Do not build next

More SEO pages, a payment wall, or a national "fair price" score. The fee file and the lease-tax table will do more for a buyer than another article.
