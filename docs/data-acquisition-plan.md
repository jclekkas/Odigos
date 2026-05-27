# Odigos — Data Acquisition & Verification Plan

*Draft for advisor review — June 3, 2026*

## Current State

Odigos already has data infrastructure in place:
- **Warehouse pipeline**: Every submission flows through async ingestion into structured tables (dealer_submissions, core.listings, core.dealers)
- **Content deduplication**: SHA-256 hash on normalized quote text; duplicates flagged but not rejected
- **Financial sanity checks**: Bounds validation on price ($500-$500K), doc fee ($0-$10K), add-ons ($0-$100K); out-of-range values flagged
- **PII protection**: Regex redaction before storage, 90-day expiry on raw text, ZIP never stored (only derived state code), IP/UA hashed
- **Market aggregation**: State-level and dealer-level stats (avg doc fee, deal score, add-on prevalence) with confidence tiers based on sample size
- **Seeded baseline**: Forum-derived quotes bootstrap state stats; excluded from dealer-level metrics

What's missing: **volume**, **diversity of sources**, and **verification beyond dedup**.

---

## Acquisition Strategy: Three Channels

### Channel 1: Organic (current — fix and grow)

**What it is**: Users arrive via SEO or direct traffic and submit quotes through the analyzer.

**Current volume**: Low (SEO traffic collapsed post-migration).

**Actions**:
- Fix technical SEO issues from Replit-to-Vercel migration (see separate SEO plan)
- Diversify beyond SEO: targeted Reddit/forum communities (r/askcarsales, r/personalfinance), car-buying Facebook groups, personal finance creators
- Every free analysis = one data point, regardless of conversion to paid

**Verification**: Organic submissions are highest-trust — a real person with a real quote seeking real help. Content validator already screens for relevance (keyword heuristic + LLM fallback). Dedup catches re-submissions.

**Target**: 50-100 organic submissions/month within 3 months of SEO stabilization.

---

### Channel 2: Community Sourcing (new — low cost)

**What it is**: Proactively collect dealer quotes from public forums, social media, and community posts where buyers share their deals.

**Sources**:
- Reddit threads (r/askcarsales "Is this a good deal?" posts)
- Leasehackr forum deal checks
- Facebook Marketplace / car-buying groups
- Markups.org (dealer markup reports)

**How it works**:
1. Manual or semi-automated scraping of publicly posted quotes
2. Run through the same analysis pipeline as user submissions
3. Tag as `ingestionSource: 'community'` and `isSeeded: true`
4. Contribute to state-level stats; excluded from dealer-specific metrics until volume justifies inclusion

**Verification**:
- Public posts have natural context (replies, upvotes, follow-up questions) that signal authenticity
- Cross-reference dealer names against known dealership databases
- Financial sanity checks catch fabricated numbers
- Dedup prevents the same post from being ingested twice

**Anti-fraud**: Low risk — we're sourcing from public posts, not incentivizing submissions.

**Target**: 200-500 community-sourced quotes in first 8 weeks (manual curation, 1-2 hours/week).

---

### Channel 3: Incentivized Submission (future — requires verification pipeline)

**What it is**: Pay users to submit dealer quotes they receive during their car-buying process.

**Why it's risky**: As the advisor flagged, "$5 for every quote" invites fraud — fabricated quotes, recycled screenshots, or gamed submissions.

**Prerequisites before launching**:
- [ ] Content hash dedup operational (already done)
- [ ] Image metadata validation (EXIF timestamps, device info — confirms photo was taken recently on a real device)
- [ ] Cross-source validation (does this dealer exist? does this pricing align with known patterns for that dealer/state?)
- [ ] User reputation scoring (submission history, feedback accuracy, fraud flags)
- [ ] Manual audit sampling (random 10% review of incentivized submissions)

**Proposed structure** (not yet implemented):
- Tiered payouts: $2 for text paste, $5 for photo/PDF with metadata, $10 for complete quote + follow-up outcome
- Payout only after verification passes (24-48 hour review window)
- Account-level fraud detection: flag accounts with >3 failed verifications
- Outcome data (what the buyer actually paid) is the highest-value signal and hardest to fake

**Target**: Do NOT launch until Channel 1 + Channel 2 produce 500+ verified submissions. Use those as the baseline for anomaly detection.

---

## Verification Pipeline

### Existing (operational today)

| Check | How | Location |
|-------|-----|----------|
| Content relevance | Keyword heuristic + gpt-4o-mini fallback | server/services/contentValidator.ts |
| Deduplication | SHA-256 content hash | server/warehouse/warehouseUtils.ts |
| Financial bounds | Price/fee range validation | server/warehouse/warehouseUtils.ts |
| PII scrubbing | Regex redaction (email, phone, SSN, card) | server/piiRedact.ts |

### Planned (build in weeks 3-6)

| Check | How | Priority |
|-------|-----|----------|
| Dealer existence | Cross-reference extracted dealer name against public dealer databases (NHTSA, state DMV records) | High |
| Geographic consistency | Does the state derived from ZIP match the dealer's known location? | High |
| Image metadata | EXIF timestamp/device validation for photo uploads | Medium |
| Price plausibility | Compare submitted prices against NADA/KBB ranges for vehicle year/make/model (API integration) | Medium |
| User reputation | Submission history scoring (accuracy of prior submissions, feedback agreement rate) | Low (needs volume) |
| Anomaly detection | Statistical outlier flagging across submissions by state/dealer/vehicle type | Low (needs volume) |

---

## Data Moat Thesis

The moat isn't any single submission — it's the **aggregate intelligence** that emerges from thousands of verified submissions:

1. **Dealer transparency scores** — How often does Dealer X omit OTD pricing? What's their average doc fee vs. state average? How many add-ons do they bundle? This is data no one else is collecting at the quote level.

2. **State-level fee benchmarks** — Real doc fee distributions by state (not statutory caps, but actual charged amounts). P25/P75 ranges. Add-on prevalence rates.

3. **Tactic pattern library** — Which dealers use payment-only quoting? Which states have the highest rate of missing OTD prices? Seasonal patterns in markup frequency.

4. **Outcome data** (future) — What buyers actually paid vs. the initial quote. Negotiation success rates by tactic type. This is the hardest data to acquire and the most defensible.

None of this exists in a structured, queryable form anywhere today. Edmunds and KBB have *listing* data (what dealers advertise). Odigos would have *quote* data (what dealers actually send to buyers in private). That's the gap.

---

## 8-Week Data Acquisition Milestones

| Week | Channel 1 (Organic) | Channel 2 (Community) | Channel 3 (Incentivized) | Verification |
|------|---------------------|----------------------|--------------------------|--------------|
| 1-2 | Fix SEO, launch community outreach | Curate first 50 forum quotes | Research only | Audit existing pipeline |
| 3-4 | Monitor traffic recovery | Curate 100 more quotes | Design verification pipeline | Build dealer existence check |
| 5-6 | First diversified traffic (Reddit, groups) | Curate 100 more quotes | Build image metadata validation | Build geographic consistency check |
| 7-8 | Measure organic volume trend | Total: 250-500 community quotes | Decision: launch pilot or defer | Baseline anomaly detection |

**Success metric**: 500+ total verified submissions (across all channels) by end of week 8, with state coverage in 15+ states.

---

## Open Questions for Advisor

1. Should we prioritize dealer transparency scoring (public-facing rankings) or keep aggregated data internal as a product feature?
2. At what data volume does the B2B pitch become credible? ("We've analyzed X quotes across Y states" — what's the minimum X?)
3. Are there existing dealer databases or APIs we should integrate for verification that you're aware of?
4. Should outcome data collection (what the buyer actually paid) be part of the free tier experience or a paid feature?
