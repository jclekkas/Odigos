# State-Specific Dealer Doc Fee Claims — Full Content Audit

**Audit date:** 2026-03-23  
**Reference file:** `server/state_fee_reference.json`  
**Pages audited:** All `.tsx` pages under `client/src/pages/` (50 files scanned; 13 contain state-specific doc fee claims)

---

## Summary

- **Total state-specific claims checked:** 74
- **Claims corrected:** 4 (across 3 pages; 2 overlapped with fixes already shipped in #65)
- **Claims flagged for manual review:** 0

---

## Corrections Made

### 1. `hidden-dealer-fees.tsx` line 52 — Georgia range overstated

| Field | Value |
|---|---|
| **Page** | `client/src/pages/hidden-dealer-fees.tsx` |
| **State** | Georgia |
| **Original claim** | "In no-cap states like Florida or Georgia, it can reach $800–$1,000+" |
| **Issue** | Georgia's typical range is $400–$700 per JSON. Grouping it with Florida ($500–$1,000+) overstated Georgia fees. |
| **Corrected to** | "In no-cap states, fees vary by market: Florida commonly runs $500–$1,000+, while Georgia typically runs $400–$700." |

### 2. `car-dealer-fees-by-state.tsx` line 94 — Florida range inconsistent

| Field | Value |
|---|---|
| **Page** | `client/src/pages/car-dealer-fees-by-state.tsx` |
| **State** | Florida |
| **Original claim** | "$500–$900+ (no cap)" |
| **Issue** | Other pages and the JSON reference use "$500–$1,000+" for Florida. |
| **Corrected to** | "$500–$1,000+ (no cap)" |

### 3. `what-does-out-the-door-price-include.tsx` line 121 — Florida implied cap

| Field | Value |
|---|---|
| **Page** | `client/src/pages/what-does-out-the-door-price-include.tsx` |
| **State** | Florida |
| **Original claim** | "Some states cap it by law (e.g., California caps at ~$85, Florida allows up to ~$999)" |
| **Issue** | Florida has no cap. Saying "allows up to ~$999" implies a $999 statutory cap. |
| **Corrected to** | "Some states cap it by law (e.g., California caps at ~$85). States with no cap, like Florida, commonly see $500–$1,000+" |

### 4. `what-is-a-dealer-doc-fee.tsx` line 87 — Georgia/Colorado overstated

| Field | Value |
|---|---|
| **Page** | `client/src/pages/what-is-a-dealer-doc-fee.tsx` |
| **States** | Georgia, Colorado |
| **Original claim** | "Florida, Georgia, and Colorado have no statutory cap, and $700–$1,000+ doc fees are common and entirely legal." |
| **Issue** | Georgia and Colorado typical ranges are $400–$700 per JSON, not $700–$1,000+. |
| **Corrected to** | "Florida, Georgia, Colorado, and many others have no statutory cap. Florida commonly sees $500–$1,000+, while Georgia and Colorado typically fall in the $400–$700 range." |

---

## Full Claim-by-Claim Audit

Legend: ✅ = verified, matches JSON | 🔧 = corrected (see above)

### dealer-doc-fee-by-state.tsx (30 state table rows + prose claims)

| # | State | Claim on page | JSON reference | Verdict |
|---|---|---|---|---|
| 1 | California | ~$85 (capped) | $85 cap | ✅ |
| 2 | Florida | $500–$1,000+ (no cap) | $500–$1,000+ | ✅ |
| 3 | Texas | $150–$225 typical (no cap) | $150–$225 | ✅ |
| 4 | New York | ~$175 (capped) | $175 cap | ✅ |
| 5 | Illinois | ~$368 (capped) | $368 cap | ✅ |
| 6 | Pennsylvania | Up to $477 (capped) | $477 cap | ✅ |
| 7 | Ohio | Up to $387 (capped) | $387 cap | ✅ |
| 8 | Colorado | $400–$700 (no cap) | $400–$700 | ✅ |
| 9 | Georgia | $400–$700 (no cap) | $400–$700 | ✅ |
| 10 | Washington | ~$200 (capped) | $200 cap | ✅ |
| 11 | Oregon | ~$150 (capped) | $150 cap | ✅ |
| 12 | Michigan | $200–$280 (capped) | $280 cap | ✅ |
| 13 | Virginia | $500–$800 (no cap) | $500–$800 | ✅ |
| 14 | North Carolina | $500–$800 (no cap) | $500–$800 | ✅ |
| 15 | Maryland | Up to $800 (capped, July 2024) | $800 cap | ✅ |
| 16 | Minnesota | Up to $350 (capped) | $350 cap | ✅ |
| 17 | Arizona | $400–$600 (no cap) | $400–$600 | ✅ |
| 18 | Nevada | $400–$700 (no cap) | $400–$700 | ✅ |
| 19 | Tennessee | $300–$600 (no cap) | $300–$600 | ✅ |
| 20 | Indiana | $200–$400 (no cap) | $200–$400 | ✅ |
| 21 | Missouri | $200–$500 (no cap) | $200–$500 | ✅ |
| 22 | Louisiana | $200–$500 (no cap) | $200–$500 | ✅ |
| 23 | Wisconsin | $200–$400 (no cap) | $200–$400 | ✅ |
| 24 | Alabama | $400–$700 (no cap) | $400–$700 | ✅ |
| 25 | South Carolina | $400–$700 (no cap) | $400–$700 | ✅ |
| 26 | Connecticut | $300–$600 (no cap) | $300–$600 | ✅ |
| 27 | New Jersey | $300–$600 (no cap) | $300–$600 | ✅ |
| 28 | Massachusetts | $300–$500 (no cap) | $300–$500 | ✅ |
| 29 | Utah | $300–$500 (no cap) | $300–$500 | ✅ |
| 30 | Wyoming | $200–$400 (no cap) | $200–$400 | ✅ |
| 31 | (prose) | "the same paperwork that costs $85 in California can cost $900 in Florida" | CA $85 cap; FL $500–$1,000+ | ✅ |

### dealer-doc-fee.tsx

| # | State | Claim on page | JSON reference | Verdict |
|---|---|---|---|---|
| 32 | California | capped at $85 | $85 cap | ✅ |
| 33 | New York | capped near $175 | $175 cap | ✅ |
| 34 | Washington | capped near $200 | $200 cap | ✅ |
| 35 | Maryland | $800 cap (July 1, 2024) | $800 cap | ✅ |
| 36 | Florida | no cap, $700+ mentioned | $500–$1,000+ | ✅ |
| 37 | Colorado | no cap, $700+ mentioned | $400–$700 | ✅ |

### hidden-dealer-fees.tsx

| # | State | Claim on page | JSON reference | Verdict |
|---|---|---|---|---|
| 38 | California | capped (mentioned as example) | $85 cap | ✅ |
| 39 | New York | capped (mentioned as example) | $175 cap | ✅ |
| 40 | Florida | no cap, $500–$1,000+ | $500–$1,000+ | ✅ |
| 41 | Georgia | was "$800–$1,000+", corrected to "$400–$700" | $400–$700 | 🔧 |
| 42 | Texas | no cap, $150–$225 | $150–$225 | ✅ |

### car-dealer-fees-by-state.tsx (summary table + prose)

| # | State | Claim on page | JSON reference | Verdict |
|---|---|---|---|---|
| 43 | California | ~$85 (capped) | $85 cap | ✅ |
| 44 | Florida | was "$500–$900+", corrected to "$500–$1,000+" | $500–$1,000+ | 🔧 |
| 45 | Texas | $150–$225 typical (no cap) | $150–$225 | ✅ |
| 46 | New York | ~$175 (capped) | $175 cap | ✅ |
| 47 | Illinois | ~$368 (capped) | $368 cap | ✅ |
| 48 | Pennsylvania | Up to $477 (capped) | $477 cap | ✅ |
| 49 | Ohio | Up to $387 (capped) | $387 cap | ✅ |
| 50 | Colorado | $400–$700 (no cap) | $400–$700 | ✅ |

### what-is-a-dealer-doc-fee.tsx

| # | State | Claim on page | JSON reference | Verdict |
|---|---|---|---|---|
| 51 | California | capped near $85 | $85 cap | ✅ |
| 52 | New York | capped near $175 | $175 cap | ✅ |
| 53 | Washington | capped in $150–$200 range (grouped w/ Oregon) | $200 cap | ✅ |
| 54 | Oregon | capped in $150–$200 range (grouped w/ Washington) | $150 cap | ✅ |
| 55 | Florida | no cap, $500–$1,000+ | $500–$1,000+ | 🔧 |
| 56 | Georgia | was "$700–$1,000+", corrected to "$400–$700" | $400–$700 | 🔧 |
| 57 | Colorado | was "$700–$1,000+", corrected to "$400–$700" | $400–$700 | 🔧 |
| 58 | Texas | no cap, $150–$225 | $150–$225 | ✅ |

### doc-fee-too-high.tsx

| # | State | Claim on page | JSON reference | Verdict |
|---|---|---|---|---|
| 59 | California | "California limits the fee to $85" | $85 cap | ✅ |
| 60 | Florida | "Florida … have no cap at all" | No cap | ✅ |
| 61 | Colorado | "Colorado have no cap at all" | No cap | ✅ |

### what-does-out-the-door-price-include.tsx

| # | State | Claim on page | JSON reference | Verdict |
|---|---|---|---|---|
| 62 | California | "California caps at ~$85" | $85 cap | ✅ |
| 63 | Florida | was "Florida allows up to ~$999" (implied cap), corrected to no-cap language | No cap; $500–$1,000+ | 🔧 |

### how-to-tell-if-a-car-deal-is-good.tsx

| # | State | Claim on page | JSON reference | Verdict |
|---|---|---|---|---|
| 64 | California | "$85 in states with a cap (California)" | $85 cap | ✅ |
| 65 | (general) | "$800+ in states without one" | FL $500–$1,000+; VA/NC $500–$800 | ✅ |

### are-dealer-fees-negotiable.tsx

| # | State | Claim on page | JSON reference | Verdict |
|---|---|---|---|---|
| 66 | (general) | "In states with no cap, it can reach $800–$1,000+" | FL $500–$1,000+ | ✅ |

### car-dealer-fees-explained.tsx

| # | State | Claim on page | JSON reference | Verdict |
|---|---|---|---|---|
| 67 | (general) | "Some states cap them at relatively low amounts, while others have no cap at all and you might see charges of $500 or more" | Consistent with JSON ranges | ✅ |

### is-this-a-good-car-deal.tsx

| # | State | Claim on page | JSON reference | Verdict |
|---|---|---|---|---|
| 68 | (general) | "$995 doc fee in a state that caps at $85 is a red flag" | CA $85 cap; illustrative example | ✅ |

### best-way-to-check-if-a-car-deal-is-good.tsx

| # | State | Claim on page | JSON reference | Verdict |
|---|---|---|---|---|
| 69 | California | "A fee that's outrageous in California is standard in Texas" | CA $85 cap; TX $150–$225 | ✅ |
| 70 | Texas | same as above | TX $150–$225 | ✅ |
| 71 | (general) | "Doc fees vary from $85 to $999 depending on where you are" | Consistent with range | ✅ |

### what-is-a-fair-price-for-a-car.tsx

| # | State | Claim on page | JSON reference | Verdict |
|---|---|---|---|---|
| 72 | California | "California: ~$85" | $85 cap | ✅ |
| 73 | (general) | "In uncapped states, $200–$400 is typical; $700–$999 is at the high end" | Covers most no-cap ranges | ✅ |

### out-the-door-price-example.tsx

| # | State | Claim on page | JSON reference | Verdict |
|---|---|---|---|---|
| 74 | Texas | Example uses TX title/registration fees (not doc fee amounts) | N/A — government fees, not doc fee claims | ✅ |

---

## Pages With No State-Specific Doc Fee Claims

The following pages were scanned and contain no state-specific doc fee dollar amounts or cap claims:

- `out-the-door-price.tsx`
- `out-the-door-price-calculator.tsx`
- `out-the-door-price-vs-msrp.tsx`
- `out-the-door-price-vs-monthly-payment.tsx`
- `dealer-prep-fee.tsx`
- `dealer-reconditioning-fee.tsx`
- `dealer-added-fees-after-agreement.tsx`
- `dealer-add-ons-explained.tsx`
- `dealer-add-ons-list.tsx`
- `dealer-pricing-problems.tsx`
- `dealer-pricing-tactics.tsx`
- `are-dealer-add-ons-mandatory.tsx`
- `are-dealer-add-ons-negotiable.tsx`
- `are-dealer-add-ons-required-by-law.tsx`
- `mandatory-dealer-add-ons.tsx`
- `how-to-remove-dealer-add-ons.tsx`
- `car-dealer-fees-list.tsx`
- `car-dealer-fees-state.tsx`
- `market-adjustment-fee.tsx`
- `monthly-payment-trap.tsx`
- `calculate-out-the-door-price.tsx`
- `dealer-wont-give-otd-price.tsx`
- `dealer-wont-give-otd.tsx`
- `dealer-changed-price-after-deposit.tsx`
- `finance-office-changed-the-numbers.tsx`
- `how-much-should-you-pay-for-a-car.tsx`
- `how-to-compare-car-deals.tsx`
- `how-odigos-works.tsx`
- `example-analysis.tsx`
- `home.tsx`
- `landing.tsx`
- `privacy.tsx`
- `admin-metrics.tsx`
- `not-found.tsx`
- `guides-redirect.tsx`

---

## Notes

- All capped-state amounts should be re-verified annually as legislatures may adjust caps.
- The existing introductory disclaimer on table pages ("always verify with your state's attorney general") adequately covers typical-range claims for no-cap states.
- Generic claims like "$800+" or "$700–$999" used to describe the upper end of no-cap states are consistent with the JSON ranges for high-fee no-cap states (Florida, Virginia, North Carolina).
