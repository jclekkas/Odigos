# Odigos — Product Requirements Document (PRD)

## Problem

Buying a car is one of the largest purchases most people make, and dealer communication is designed to favor the dealer. Quotes arrive as texts, emails, or verbal summaries that emphasize monthly payments while omitting total cost, APR, fees, and add-ons. Most buyers don't know what to look for, what's missing, or what questions to ask — and they only find out after they've already committed at the dealership.

There is no simple, consumer-facing tool that takes a real dealer message and tells you whether the deal is safe to move forward on.

## Solution

Odigos is a web app where a user pastes a dealer quote, text, or email. An AI backend analyzes the message and returns:

- A **GO / NO-GO recommendation** with a color-coded score (GREEN / YELLOW / RED)
- **Extracted pricing details** (sale price, OTD, APR, term, monthly payment, fees, add-ons)
- **What's missing or unclear** in the dealer's message
- **Red flags** (hidden fees, payment-only framing, vague terms)
- **Suggested questions** to ask the dealer before visiting

A free preview shows the verdict and score. To unlock the complete analysis (red flags, missing info checklist, copy-paste dealer reply, full reasoning), buyers pick a **time-windowed pass**: Weekend Warrior Pass ($29 / 72 hours) or Car Buyer's Pass ($49 / 14 days). Both unlock identical features and grant unlimited scans inside the window. The default is the 14-day pass — most buyers compare 4–6 dealers before deciding.

## Target User

U.S. car buyers who have received a dealer quote (text, email, or written offer) and want to understand it before going to the dealership. Non-technical. First-time or infrequent car buyers. Price-conscious.

## Core User Flow

1. User lands on homepage (`/`)
2. Clicks "Check My Dealer Messages" → routed to `/analyze`
3. Pastes dealer text into the form, optionally adds context (vehicle, location)
4. Submits → AI analyzes the message
5. Free preview displays: verdict (GREEN/YELLOW/RED), score, detected pricing fields
6. User picks a pass (Weekend Warrior $29 / 72h, or Car Buyer's Pass $49 / 14d) → Stripe checkout (one-time)
7. After payment → full analysis revealed: red flags, missing info, copy-paste reply, reasoning

## Pages & Routes

| Route | Purpose |
|---|---|
| `/` | Landing page — value prop, trust signals, pricing, CTAs |
| `/analyze` | Analysis tool — paste form, results display, paywall |
| `/out-the-door-price` | **Hero SEO page** — OTD explainer, copy-paste message template, sample breakdown table |
| `/dealer-fees` | SEO content page — common dealer fees explained |
| `/how-to-negotiate` | SEO content page — negotiation guidance |
| `/monthly-payment-trap` | SEO content page — why payment framing is risky |
| `/what-to-ask-dealer` | SEO content page — questions to ask before visiting |
| `/admin/metrics` | Private analytics dashboard (not in sitemap) |

## Out-the-Door Price — Hero SEO Page

The `/out-the-door-price` page is the **primary SEO acquisition page**, not just one of five content pages. It targets the highest-intent search query ("out the door price") and is designed to:

1. **Educate** — Explain what OTD means, what it should include, what dealers leave out, and red flags to watch for
2. **Equip** — Provide a ready-to-use copy-paste message the buyer can send to any dealer to request an itemized OTD breakdown
3. **Convert** — Soft CTA at the bottom ("Already have dealer texts or a quote?") funnels readers who already have a dealer message into the `/analyze` tool

### Page Structure

- H1: "Out-the-Door Price (OTD): What It Means & What It Should Include"
- Section 1: What an OTD price includes (5 bullet items)
- Section 2: What's often NOT included but should be (5 bullet items)
- Section 3: Why dealers avoid giving OTD prices (6 tactics)
- Section 4: Red flags to watch for (5 amber-highlighted items)
- Section 5: Copy-paste message to request an itemized OTD (with copy button)
- Section 6: Sample OTD breakdown table ($36,010 example with line items)
- Soft CTA: "Already have dealer texts or a quote?" → "Analyze My Dealer Messages" button

### What Makes It Different from Other SEO Pages

- It has a **functional interactive element** (copy-paste message with working copy button)
- It includes a **sample OTD breakdown table** (concrete, not abstract)
- It's the **longest and most comprehensive** content page — designed to rank for a competitive keyword
- Dynamic SEO title and meta description are set on page load

### Success Metrics for This Page

- Organic search traffic to `/out-the-door-price`
- Copy button clicks (measures engagement with the message template)
- CTA click-through rate (clicks on "Analyze My Dealer Messages" at the bottom)
- Downstream conversion (visitors from this page who complete a submission or payment)

## Monetization

- **Free Preview**: Verdict, score, detected pricing fields
- **Weekend Warrior Pass**: $29 one-time via Stripe — 72 hours of unlimited scans. Built for buyers hitting 2–3 dealers this weekend who're ready to decide fast.
- **Car Buyer's Pass**: $49 one-time via Stripe — 14 days of unlimited scans. The default tier; built for the typical buyer comparing 4–6 quotes over a couple of weeks.
- Both passes unlock the same paid content (red flags, missing info checklist, copy-paste dealer reply, full analysis reasoning). Differentiation is positioning, not features.
- No subscriptions, no auto-renewal, no upsells.

## Tech Stack

- **Frontend**: React 18 + TypeScript, Vite, Tailwind CSS, shadcn/ui, Wouter, TanStack React Query
- **Backend**: Express.js + TypeScript, Zod validation
- **AI**: OpenAI API (OPENAI_API_KEY env var)
- **Payments**: Stripe (user's own keys via STRIPE_SECRET_KEY, STRIPE_PRICE_ID_49)
- **Database**: PostgreSQL (Drizzle ORM) — metrics tracking, optional persistence
- **Analytics**: Custom metrics system tracking submissions, scores, payments, revenue, conversion rates, engagement funnel

## Trust & Credibility Signals

Every surface reinforces independence and safety:

- **Trust strip** (below hero CTA): "Independent · No account required · Paste only what you're comfortable sharing · Secure Stripe checkout"
- **Footer reinforcement**: "Built for U.S. car buyers. Independent. No dealer partnerships."
- **SEO page footers**: "Not affiliated with any dealership. Optimized for U.S. car purchases."
- **No account or login required** for core functionality

## Key Design Principles

- **Trust-first**: Every page reinforces independence, no dealer affiliations, no data stored, secure checkout
- **Clarity over cleverness**: Plain language, factual tone, no hype
- **Mobile-ready**: Adequate padding, comfortable max-widths, no animations
- **Stateless core**: The deal analysis itself requires no account or login
- **SEO-driven acquisition**: 5 content pages targeting high-intent car-buying search queries, each with a soft CTA back to the analyzer

## Success Metrics

| Metric | What It Measures |
|---|---|
| Submission volume | Free analyses started |
| Conversion rate | Submissions → Stripe checkout → payment completed |
| Revenue | $29 (Weekend Warrior) or $49 (Car Buyer's Pass) per completed pass purchase |
| Pass selection ratio | % of paid users selecting Car Buyer's Pass — target: majority |
| Analyses per paid session | Distribution of 1 / 2–3 / 4–5 / 6+ — usage activation health |
| Score distribution | GREEN/YELLOW/RED mix (indicates analysis quality) |
| Funnel drop-off | Landing → CTA → form → submit → checkout → payment |
| OTD page traffic | Organic search visits to `/out-the-door-price` |
| OTD copy clicks | Engagement with the copy-paste message template |
| OTD CTA click-through | Clicks on "Analyze My Dealer Messages" from OTD page |
| OTD downstream conversion | OTD visitors who complete a submission or payment |
