# Odigos — Business Overview

## Product

Odigos is a consumer protection tool for car buyers negotiating with dealerships.

Users either:
- paste dealer text, or
- upload a screenshot, photo, email, or PDF of a dealer quote

Odigos extracts the text and analyzes the quote in seconds.

The system returns a structured report including:
- a GO / NO-GO verdict
- detected pricing risks or missing information
- explanations of dealership tactics
- a checklist of information the buyer should request
- a ready-to-send reply script for the dealer

The product is intentionally narrow: it provides a fast second opinion on a specific dealer quote.

---

## Product Tiers

Odigos uses a free → paid unlock model.

**Free**
- GO / NO-GO verdict
- high-level issue summary

Purpose: Give the user an immediate answer to the question: "Does this deal look safe or suspicious?"

**Paid ($49 one-time)**

Unlocks the full report:
- detailed reasoning
- missing information checklist
- negotiation reply script
- deeper explanation of detected tactics
- confidence assessment

Purpose: Help the buyer respond to the dealer and correct the deal.

This model mirrors the buyer's behavior: the purchase is episodic and high-stakes, so a single-transaction payment aligns better than a subscription.

---

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

---

## The Wedge

Odigos focuses on a specific moment in the buying process: the buyer already has a quote and wants a second opinion.

Typical scenario:
1. Buyer requests pricing from a dealership.
2. Dealer sends a quote, worksheet, or email.
3. The buyer senses something is unclear or off.
4. The buyer searches for help.

Odigos sits directly in that moment and answers the question: "Is this deal safe to proceed with?"

This is a late-stage decision problem, which is why users may be willing to pay for clarity.

---

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

---

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

---

## Competitive Landscape

Odigos competes less with traditional car-pricing tools and more with informal advice channels.

| Alternative | What Users Do | Limitations |
|---|---|---|
| Reddit / forums | Post their deal and wait for feedback | slow, inconsistent advice |
| Friends or family | Ask someone with car experience | limited expertise |
| Dealer assurances | Trust the salesperson | conflict of interest |
| DIY research | Read articles and guess | requires interpretation |

Odigos automates what many buyers already do: asking someone to sanity-check a quote.

The difference is speed and structure.

---

## The Impact of LLMs (ChatGPT, Claude, etc.)

General LLMs introduce both risk and opportunity for Odigos.

### Why LLMs are a real substitute

A buyer could paste a dealer quote into ChatGPT and ask: "Is this deal good?"

The model may produce a reasonable explanation.

Because LLM access is widespread and often free, this creates a natural substitute product. In many cases, users will try ChatGPT first.

### Why LLMs do not fully replace Odigos

However, general LLMs have limitations for this use case.

**1. Prompting skill requirement**

ChatGPT requires users to know what questions to ask. Many buyers do not know what elements of a quote matter or what signals to request. Odigos provides a structured analysis without prompting.

**2. Structured output**

Odigos returns a consistent format: verdict, detected issues, missing information, negotiation response. ChatGPT responses are less standardized and may vary significantly depending on the prompt.

**3. Domain-specific logic**

Odigos can embed: dealership-specific pricing patterns, fee terminology detection, known negotiation tactics, future benchmark comparisons. A general LLM is not optimized for this specific domain.

**4. Reduced friction**

Odigos supports file uploads, allowing users to submit: screenshots, photos, PDFs, dealer worksheets. This removes the need to copy text or format prompts.

**5. Data accumulation**

Each analysis contributes anonymized pricing signals to Odigos' internal dataset. Over time this dataset can reveal patterns such as: typical dealer documentation fees by state, frequency of add-ons, how often quotes omit out-the-door pricing. These insights can improve analysis quality and support data-driven content. General LLMs do not accumulate user-specific industry datasets in the same way.

### Net effect of LLMs

LLMs lower the barrier to creating tools like Odigos. However, they also increase demand for domain-specific applications built on top of them.

The long-term value of Odigos is not simply using AI, but applying it to a narrow consumer protection use case and accumulating structured pricing intelligence over time.

---

## Economics

Odigos uses a simple transaction model.

**Price:** $49 per analysis unlock

Typical costs per transaction:
- AI analysis: ~$0.02–$0.10
- payment processing: ~3%

**Estimated gross margin: ~90–95%**

The model avoids:
- subscription friction
- human support overhead
- fulfillment costs

Revenue scales primarily with traffic and conversion rate.

---

## Trust & Product Risks

The biggest risks are not technical. They are behavioral:

- **Trust:** Buyers must believe the analysis is credible before paying.
- **Expectations:** Some users may expect legal or financial certainty from the tool.
- **Input quality:** Blurry photos or incomplete quotes may limit analysis accuracy.

The product is best positioned as a decision-support tool, not a guarantee.

---

## Data Flywheel

Each submission contributes anonymized signals about dealership pricing practices.

Over time this enables:
- improved detection logic
- benchmark statistics
- data-driven consumer guides
- stronger authority in search results

This creates a data flywheel where product usage strengthens the system for future users.

---

## What Odigos Is Not

Odigos does not attempt to be:
- a VIN pricing database
- a dealership marketplace
- a negotiation coaching service
- a legal opinion

Its purpose is narrowly defined: a fast second opinion on a dealer quote.

---

## Current State

The product is live.

Core components include:
- paste + upload quote analysis
- AI-driven review engine
- Stripe payment integration
- PII-redacted submission storage
- SEO content targeting buyer intent queries

The immediate milestone is validating that organic search traffic converts into paid analyses.

---

## Near-Term Milestones

Key validation metrics over the next year include:
- organic traffic growth
- analyzer submissions
- free → paid conversion rate
- early evidence of repeat pricing patterns in submissions

These signals determine whether the product has strong product-market fit.
