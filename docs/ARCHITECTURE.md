# Rule engine

Odigos reads a dealer quote, asks an OpenAI-compatible model to pull out prices and fees, then applies its own rules before the buyer sees a verdict. The model does not get the last word on a doc fee that breaks a state cap.

## What happens to a quote

1. The buyer pastes text, uploads a screenshot, photo, or PDF, or submits a URL. Uploads and URLs are turned into text first.
2. The server guesses the state from a ZIP code, a state name, or a city. Ambiguous cities are not assigned a state.
3. `data/state_fees.json` supplies that state's doc-fee cap, typical range, sales-tax rate, trade-in credit flag, and notes. Those lines are added to the model prompt as context.
4. The model returns structured fields: sale price, out-the-door price, payment, APR, term, fees, and a draft reply.
5. `server/ruleEngine.ts` scores the structured fields. A doc fee above the state's effective cap is a NO-GO before any other rule runs. The effective cap is the CPI-adjusted amount when the state record says the cap is indexed, otherwise `docFeeCapAmount`.
6. The response includes the verdict, red flags, missing information, and the draft reply. On the hosted site that full result is free.

Without `OPENAI_API_KEY` (or the legacy integration variable), analysis returns a configuration error. There is no built-in key.

## Verdicts

`applyRuleEngine` returns a deal score of GREEN, YELLOW, or RED and a GO, NO-GO, or NEED-MORE-INFO label.

The first matching rule wins:

- Doc fee over the state cap: RED, NO-GO.
- Lease quotes: a marked-up acquisition fee, a rate markup, a payment that does not match the terms, a low residual, a high excess-mileage rate, or missing money factor, residual, or mileage.
- A market adjustment plus two or more expensive add-ons, or a market adjustment alone: RED, NO-GO.
- Two or more expensive add-ons: RED, NO-GO. One expensive add-on: YELLOW.
- A monthly payment with no sale price and no out-the-door price: YELLOW.
- No out-the-door price: YELLOW.
- An out-the-door price with APR and term, and no vague high fees: GREEN.
- An out-the-door price with vague fees still to clarify: YELLOW.

Add-on and junk-fee checks look for names such as doc fee, protection package, nitrogen, etch, paint protection, and dealer prep. A market adjustment matches phrases such as ADM, markup, and market adjustment. Dollar thresholds for those checks live next to the keyword lists in `server/ruleEngine.ts`.

## What the engine does not do

It does not decide that a fee is illegal just because it is high. The cap check runs only when the dataset says `docFeeCap` is true and an amount is present. Many states are uncapped, and many capped states are still marked `needs_source` in the dataset. A NO-GO on a cap is only as good as that row.

Typical ranges and tax rates are context. They do not, by themselves, change the color of the verdict.

Lease brand benchmarks come from `server/leaseBrandData.ts`, not from the state file.

## Where the pieces live

| Piece | File |
| --- | --- |
| State detection and rule lookup | `server/stateFeeLookup.ts` |
| Rule file | `data/state_fees.json` |
| Cap check and verdict order | `server/ruleEngine.ts` |
| Model call and prompt | `server/services/analyzeService.ts` |
| Model name and key | `server/config/aiModel.ts`, `server/openaiClient.ts` |
| HTTP entry | `server/routes/analyze.ts` |

Written state guides in `client/src/data/stateFees.ts` are separate from the rule file. The comparison tables on the doc-fee and fees-by-state pages read `data/state_fees.json`.
