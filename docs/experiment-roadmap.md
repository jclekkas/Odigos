# Odigos — 8-Week Experiment Roadmap

*Start date: June 3, 2026 | Weekly check-ins: Fridays*

## Operating Constraints

- Moonlighting: ~10-15 hours/week available
- No additional hires or contractors
- No capital required (all experiments use existing infrastructure)
- Day job at Rocket continues; family commitments protected

---

## Week 1-2: Jun 3-15 — Foundation

### Experiment 1: SEO Recovery
**Hypothesis**: Technical SEO issues from the Replit migration are suppressing organic traffic. Fixing them will recover baseline impressions within 2-3 weeks.

**Actions**:
- Audit and fix broken redirects, orphaned URLs, canonical inconsistencies
- Resubmit sitemap to Google Search Console
- Monitor impressions/clicks daily in GSC

**Success metric**: Impressions return to 500+/day within 3 weeks of fixes (vs. prior peak of 2,000/day).

**Kill criteria**: If impressions don't recover after 3 weeks, SEO content may have been penalized (not just technical issues). Pivot to non-SEO acquisition.

---

### Experiment 2: Community Outreach (Acquisition Diversification)
**Hypothesis**: Car-buying communities (Reddit, Facebook groups, forums) contain high-intent users who will use the free analyzer if it's presented as a helpful tool, not an ad.

**Actions**:
- Identify 5 active communities (r/askcarsales, r/personalfinance, r/whatcarshouldibuy, Leasehackr, one Facebook group)
- Contribute genuinely for 1 week before sharing the tool (build credibility)
- Post 2-3 helpful responses per week that naturally reference the analyzer
- Track referral traffic via UTM parameters

**Success metric**: 20+ submissions from community referrals in 2 weeks.

**Kill criteria**: If communities actively reject the tool (removed posts, negative feedback), this channel won't scale organically. Consider paid placement with personal finance creators instead.

---

## Week 3-4: Jun 16-29 — Service Layer Definition

### Experiment 3: User Interview Sprint
**Hypothesis**: Users who completed a free analysis have unmet needs beyond the report — specifically, they don't know what to do next with the information.

**Actions**:
- Identify 10 past users (from submissions with email/contact if collected, or recruit from communities)
- Ask 5 of them for a 15-minute call or async survey
- Core questions:
  - "After you got the analysis, what did you do?"
  - "Did you send anything to the dealer? What happened?"
  - "Would you pay for someone to help you respond?"
  - "What would 'guaranteed savings' mean to you?"

**Success metric**: 5 completed interviews with clear signal on willingness to pay for negotiation help.

**Kill criteria**: If you can't find 5 people willing to talk, the product isn't generating enough engagement to support a service layer yet. Focus on volume first.

---

### Experiment 4: Guided Negotiation MVP
**Hypothesis**: A multi-step negotiation flow (analysis → draft reply → dealer counter-response coaching) increases willingness to pay vs. a one-shot analysis.

**Actions**:
- Design a 3-step flow: (1) Initial analysis + draft reply, (2) User pastes dealer's counter, (3) Odigos generates counter-counter with updated analysis
- Build as a minimal feature (could be as simple as a second analysis prompt that includes context from the first)
- Test with 10 users (recruited from communities or past submissions)

**Success metric**: 6/10 test users say they would pay $49+ for the multi-step flow (vs. current single analysis).

**Kill criteria**: If users say "I just used the first reply and that was enough," the single-analysis product is sufficient. Don't over-engineer.

---

## Week 5-6: Jun 30 - Jul 13 — B2B Exploration

### Experiment 5: Credit Union Fit Test
**Hypothesis**: Credit unions with auto loan programs would embed a quote-check tool to differentiate their lending experience and reduce member overpayment (which affects loan performance).

**Actions**:
- Map 10 DMV-area credit unions with active auto loan programs
- Draft a one-page pitch (credit union language, not startup language)
- Send cold outreach to 5 (you're a product leader at a Fortune 500 lender — use that credibility)
- Offer a free 30-day pilot: co-branded landing page linked from their auto loan approval emails

**Success metric**: 2+ credit unions agree to a call; 1 agrees to pilot.

**Kill criteria**: If 0/5 respond after follow-up, the cold outreach approach isn't working. Try warm intros via Naviya's network or Luma event connections instead.

---

### Experiment 6: Luma Events (Network Building)
**Hypothesis**: In-person founder events in the DMV will surface warm intros to potential partners, advisors, and users that cold outreach can't reach.

**Actions**:
- Attend 2 events by Jun 21
- Goals per event: (1) Find one person who recently bought a car — get 20 min of feedback. (2) Find one person in fintech/lending — sanity-check the credit union angle.
- Follow up with every meaningful conversation within 48 hours

**Success metric**: 2 meaningful follow-up conversations that lead to either a user interview, a partner intro, or an advisor connection.

**Kill criteria**: None — this is low-cost, high-optionality. Attend regardless.

---

## Week 7-8: Jul 14-27 — Measure & Decide

### Synthesis Week

**Actions**:
- Compile data across all experiments
- Prepare advisor update for Naviya (late June follow-up meeting)
- Answer the three gate questions below

### Gate Questions

**Gate 1: Is there organic demand?**
- Evidence needed: 50+ total submissions (organic + community), without paid acquisition
- If yes → continue building
- If no → the problem may not be acute enough to drive self-serve behavior; consider B2B-only

**Gate 2: Will people pay for more than analysis?**
- Evidence needed: User interviews + guided negotiation test signal willingness to pay $49+ for multi-step help
- If yes → build the service layer; this is the "tool → company" transition
- If no → current pricing model is the ceiling; focus on volume and CAC

**Gate 3: Is B2B viable?**
- Evidence needed: At least 1 credit union or fintech partner willing to pilot
- If yes → this is the distribution answer; prioritize integration work
- If no → B2B is a longer sales cycle than 8 weeks; don't abandon, but don't wait for it

---

## Weekly Check-in Template

Every Friday, answer these five questions (takes 10 minutes):

1. **What did I ship or learn this week?** (one sentence)
2. **What's the biggest risk to next week's experiment?** (one sentence)
3. **Submissions this week**: organic [N], community [N], total cumulative [N]
4. **Conversations this week**: user interviews [N], partner outreach [N], events [N]
5. **Am I on track for the Jun 3 / Jun 10 / Jun 17 / Jun 24 deadlines?** (yes/no + one sentence if no)

---

## Metrics Dashboard (track weekly)

| Metric | Baseline (Jun 3) | Week 4 Target | Week 8 Target |
|--------|------------------|---------------|---------------|
| Organic impressions/day | [measure] | 500/day | 1,000/day |
| Total submissions (cumulative) | [measure] | 100 | 500 |
| Community-sourced quotes | 0 | 100 | 300 |
| Free → paid conversion rate | [measure] | 3% | 5% |
| User interviews completed | 0 | 5 | 10 |
| B2B conversations started | 0 | 0 | 3 |
| States with 10+ submissions | [measure] | 5 | 15 |
