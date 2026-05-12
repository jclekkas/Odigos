# Odigos — Business Plan

## Product

Odigos is a consumer protection tool for car buyers negotiating with dealerships.

Users either:
- paste dealer text, or
- upload a screenshot, photo, or PDF of a dealer quote

Odigos extracts the text and analyzes the quote in seconds.

The system returns a structured report including:
- a GO / NO-GO verdict
- detected pricing risks or missing information
- explanations of dealership tactics
- a checklist of information the buyer should request
- a ready-to-send reply script for the dealer

The product is intentionally narrow: it provides a fast second opinion on a specific dealer quote.

## Product Tiers

Odigos uses a free → paid unlock model.

Free
- GO / NO-GO verdict and color-coded score (GREEN / YELLOW / RED)
- high-level issue summary
- a partial preview of the missing-information checklist and dealer reply (full versions gated behind a pass)

Purpose:
Give the user an immediate answer to the question:
"Does this deal look safe or suspicious?" — and a clear taste of what the paid analysis adds.

Paid (two-tier time-windowed passes, one-time)

Weekend Warrior Pass — $29 / 72 hours unlimited scans
- Built for buyers hitting 2–3 dealers this weekend
- Same paid features as Car Buyer's Pass; intentionally constrained by time

Car Buyer's Pass — $49 / 14 days unlimited scans (default)
- Built for the typical buyer comparing 4–6 quotes over a couple of weeks
- Covers the entire car-shopping cycle

Both unlock the same full report:
- detailed reasoning
- missing information checklist
- negotiation reply script
- deeper explanation of detected tactics
- confidence assessment

Purpose:
Help the buyer respond to multiple dealers and correct the deal across the
full shopping cycle, not just a single quote.

This model mirrors how buyers actually shop: car purchases are episodic but **non-atomic** — most buyers solicit quotes from multiple dealers across a weekend or a couple of weeks before committing. A time-windowed pass aligns the purchase to the *shopping cycle*, not the *individual quote*. The 72-hour Weekend Warrior tier captures decisive weekend shoppers; the 14-day Car Buyer's Pass captures the more deliberate multi-week comparison shopper. Both avoid the friction of subscriptions because the window is intentionally short — you buy a pass for *this car purchase*, not forever.

On price differential: the $20 gap between the two tiers is deliberately small. The 14-day pass is the default and what we expect most buyers to choose; the 72-hour pass exists to convert decisive shoppers who would otherwise bounce on price anchoring rather than to maximize ARPU. We accept some cannibalization in exchange for a lower-friction entry SKU.

## The Core Problem

Car buyers face a large information imbalance when negotiating with dealerships.

Common issues include:
- incomplete quotes that omit the out-the-door price
- dealer documentation fees
- dealer-installed add-ons
- "market adjustment" fees
- negotiation tactics that focus on monthly payment instead of total cost

These practices are not rare edge cases — they are common features of dealership sales processes.

Most buyers suspect something is wrong but lack the expertise to identify specific problems or respond effectively, especially under time pressure during negotiations.

## The Wedge

Odigos focuses on a specific moment in the buying process:
The buyer already has a quote and wants a second opinion.

Typical scenario:
1. Buyer requests pricing from a dealership.
2. Dealer sends a quote, worksheet, or email.
3. The buyer senses something is unclear or off.
4. The buyer searches for help.

Odigos sits directly in that moment and answers the question:
"Is this deal safe to proceed with?"

This is a late-stage decision problem, which is why users may be willing to pay for clarity.

## Market Context

Each year in the United States:
- ~14 million new cars are sold
- ~36 million used cars are sold

Not all buyers need assistance reviewing a quote.

The most relevant segment consists of buyers who:
- research pricing online
- communicate with dealers digitally
- compare offers from multiple dealers
- seek external validation before committing

This segment likely represents millions of buyers per year.

The product does not need to capture a large percentage of all car buyers to become a meaningful business.

## Distribution Strategy

The primary distribution channel is high-intent search traffic.

Odigos publishes articles targeting queries such as:
- "dealer doc fee by state"
- "are dealer add-ons mandatory"
- "dealer won't give out the door price"
- "dealer added fees after agreement"

These searches often occur when buyers are already dealing with a dealership and are trying to verify pricing practices.

Articles act as the entry point to the analyzer.

Secondary discovery sources include:
- community forums
- personal finance communities
- word-of-mouth sharing among buyers comparing deals

However, SEO is a slow, compounding channel, and early traction depends on search indexing and ranking improvements over time.

If organic compounding underperforms, two fallback channels are available without breaking the unit economics:
- **B2B2C partnerships** — credit unions, employer benefits platforms, and auto-loan refinance products that want a free consumer-protection feature to offer their members. These channels deliver high-intent users at near-zero CAC in exchange for co-branding or a revenue share.
- **Community and creator placement** — personal-finance creators and subreddits whose audiences match the buyer profile. Lower-volume than SEO but cheaper to test in weeks rather than quarters.

Paid acquisition is constrained by the one-time LTV described in *Economics* and is treated as a last resort.

## Competitive Landscape

Odigos is positioned at a different point in the buying funnel than most existing car-pricing products. Competition splits into three groups:

**Pre-quote pricing tools** — TrueCar, Edmunds TMV, CarGurus Deal Rating, Kelley Blue Book.
These help buyers form an expectation *before* contacting a dealer. They do not analyze the dealer's actual quote, do not flag specific tactics in a specific message, and several have dealer-paid distribution that creates a perceived conflict of interest. Odigos is post-quote: it activates after the dealer has responded.

**Negotiation services and coaching** — CarEdge, YAA (Your Auto Advocate), independent car-buying consultants.
These offer human advice or concierge negotiation, typically $50–$500+ per engagement, with turnaround measured in hours or days. Odigos is faster (seconds), cheaper ($29–$49), and unattended.

**Informal advice channels** — Reddit (r/askcarsales, r/cars), forums, friends with car experience, the dealer's own assurances.
Free and widely used, but slow, inconsistent, and biased.

| Alternative | What Users Do | Limitations |
|---|---|---|
| TrueCar / Edmunds / KBB | Look up expected pricing | Pre-quote only; doesn't read the dealer's message |
| CarEdge / YAA / coaches | Pay a human to advise or negotiate | $50–$500+, slow, scheduling friction |
| Reddit / forums | Post their deal and wait for feedback | slow, inconsistent advice |
| Friends or family | Ask someone with car experience | limited expertise |
| Dealer assurances | Trust the salesperson | conflict of interest |

Odigos's wedge is the post-quote moment: a buyer who already has a specific dealer message and needs a fast, independent read on it. Pricing tools occupy the pre-quote moment; coaching services occupy the high-touch moment. The middle — fast, structured, AI-driven analysis of a real quote — is where Odigos lives.

## The Impact of LLMs (ChatGPT, Claude, etc.)

General LLMs introduce both risk and opportunity for Odigos.

### Why LLMs are a real substitute

A buyer could paste a dealer quote into ChatGPT and ask:
"Is this deal good?"

The model may produce a reasonable explanation.

Because LLM access is widespread and often free, this creates a natural substitute product.
In many cases, users will try ChatGPT first.

### Why LLMs do not fully replace Odigos

However, general LLMs have limitations for this use case.

**1. Prompting skill requirement.** ChatGPT requires users to know what questions to ask. Many buyers do not know what elements of a quote matter or what signals to request. Odigos provides a structured analysis without prompting.

**2. Structured output.** Odigos returns a consistent format — verdict, detected issues, missing information, negotiation response. ChatGPT responses are less standardized and may vary significantly depending on the prompt.

**3. Domain-specific logic.** Odigos can embed dealership-specific pricing patterns, fee terminology detection, known negotiation tactics, and benchmark comparisons. A general LLM is not optimized for this specific domain.

**4. Reduced friction.** Odigos supports file uploads (screenshots, photos, PDFs, dealer worksheets) and a paste box pre-tuned for dealer messages, removing the need to copy text or format prompts.

**5. Data accumulation.** Each analysis contributes anonymized pricing signals to Odigos' internal dataset. Over time this dataset can reveal patterns such as typical dealer documentation fees by state, frequency of add-ons, and how often quotes omit out-the-door pricing. General LLMs do not accumulate user-specific industry datasets in the same way.

We are clear-eyed that points 1–4 are positioning advantages, not durable moats — a general-purpose LLM product could close each gap in a release cycle. The durable defensibility, if it materializes, is point 5 combined with brand and SEO authority in the post-quote moment.

### Net effect of LLMs

LLMs lower the barrier to creating tools like Odigos.
However, they also increase demand for domain-specific applications built on top of them.

The long-term value of Odigos is not simply using AI, but applying it to a narrow consumer protection use case and accumulating structured pricing intelligence over time.

## Economics

Odigos uses a simple transaction model.

Price: $29 (72-hour Weekend Warrior Pass) or $49 (14-day Car Buyer's Pass). Customers buy one pass per car-shopping cycle and run unlimited scans inside the window.

Typical costs per transaction:
- AI analysis: ~$0.02–$0.10 (vision input on photo/PDF uploads is the high end)
- payment processing: Stripe at 2.9% + $0.30 per transaction

Estimated gross margin per pass: ~92–95% (≈$27 contribution on a $29 pass; ≈$46 on a $49 pass).

The model avoids:
- subscription friction
- human support overhead
- fulfillment costs

**Lifetime value.** A car purchase is episodic — most buyers transact once every 5–7 years — so per-buyer LTV is approximately one pass (≈$40–$45 contribution) absent referral, gifting, or adjacent-product expansion. This bounds allowable CAC: organic search and referral traffic must remain the dominant acquisition channels for the unit economics to compound. Paid acquisition is viable only at low single-digit dollar CAC, which constrains channel choice but is consistent with the high-intent search wedge described below.

Revenue scales primarily with traffic and conversion rate.

## Trust & Product Risks

The biggest risks are not technical.
They are behavioral:

Trust
Buyers must believe the analysis is credible before paying.

Expectations
Some users may expect legal or financial certainty from the tool.

Input quality
Blurry photos or incomplete quotes may limit analysis accuracy.

The product is best positioned as a decision-support tool, not a guarantee.

## Data Flywheel

Each submission contributes anonymized signals about dealership pricing practices.

Over time this enables:
- improved detection logic
- benchmark statistics
- data-driven consumer guides
- stronger authority in search results

This creates a data flywheel where product usage strengthens the system for future users.

## What Odigos Is Not

Odigos does not attempt to be:
- a VIN pricing database
- a dealership marketplace
- a negotiation coaching service
- a legal opinion

Its purpose is narrowly defined:
a fast second opinion on a dealer quote.

## Current State

The product is live at [odigosauto.com](https://odigosauto.com).

Core components include:
- paste + upload quote analysis (paste, image upload, PDF, camera)
- AI-driven review engine (OpenAI GPT-4o with GPT-4o-mini fallback)
- Stripe payment integration with two pass tiers
- PII-redacted submission storage with 90-day retention
- SEO content targeting buyer intent queries (130+ indexed pages, all 50 states)

The immediate milestone is validating that organic search traffic converts into paid analyses.

## Traction

<!-- TODO: replace placeholders with your real numbers before sending. -->
*Reporting period: [START DATE] – [END DATE]*

- **Submissions (free analyses started):** [N]
- **Paid pass purchases:** [N] (Weekend Warrior: [N], Car Buyer's Pass: [N])
- **Free → paid conversion rate:** [X]%
- **Revenue to date:** $[N]
- **Organic sessions (last 30 days):** [N], up [X]% MoM
- **Top-ranking SEO pages:** [page 1] (#[rank] for "[query]"), [page 2] (#[rank] for "[query]"), [page 3] (#[rank] for "[query]")
- **Repeat-pattern signal in dataset:** [one-sentence example, e.g. "67% of TX-state submissions show doc fees above the $150 statutory cap"]

[Optional: one chart or sparkline — submissions / week or organic sessions / week.]

## Team

<!-- TODO: replace with real bios. One paragraph per person is plenty. -->

**[Founder name], [role]** — [one-sentence credential: prior company, relevant domain experience, technical or commercial background]. [One sentence on why this person, this problem: personal car-buying experience, prior work in consumer protection / fintech / marketplaces, etc.]

[If solo: a one-line note on advisors or planned hires. If multiple founders: repeat the block above per person.]

## Near-Term Milestones

Key validation metrics over the next year include:
- organic traffic growth
- analyzer submissions
- free → paid conversion rate
- early evidence of repeat pricing patterns in submissions

These signals determine whether the product has strong product-market fit.

## The Ask

<!-- TODO: fill in round details. Remove this section entirely if this is an intro meeting rather than a fundraising conversation. -->

**Stage:** [pre-seed / seed]
**Raising:** $[amount] on a [SAFE / priced round] at a [post-money cap / valuation] of $[amount]
**Lead status:** [seeking lead / lead committed at $X / party round]

**Use of funds (next [12 / 18] months):**
- [X]% — content and SEO production (writers, programmatic state pages, link building)
- [X]% — engineering and AI cost (model usage, vision-input support, dataset tooling)
- [X]% — founder runway
- [X]% — B2B2C partnership development (credit unions, employer benefits)

**Milestones the round buys:**
- [target: monthly organic sessions]
- [target: monthly paid conversions and revenue run-rate]
- [target: signed partnership pilot or first B2B distribution deal]
- [target: dataset milestone — e.g. "10,000 analyzed quotes, first state-level fee benchmark report published"]
