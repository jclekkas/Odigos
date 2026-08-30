# Montana Legal Services Association — Experience Prototype

A concept prototype exploring a possible future digital experience for
**Montana Legal Services Association (MLSA)**, created as part of a response to
MLSA's 2026 RFP for brand strategy, identity and website redesign.

> **Concept prototype — created for discussion. Not an official Montana Legal
> Services Association website.**
>
> This project is not operated by, endorsed by, or affiliated with MLSA. It
> collects and transmits no information. For the real organization, visit
> [mtlsa.org](https://www.mtlsa.org/).

---

## What this is arguing

MLSA serves at least eight distinct audiences and maintains two web properties.
The experience therefore has to answer two questions fast: **who are you**, and
**what are you trying to do**. This prototype organizes around user intent
rather than MLSA's internal structure, and treats accessibility and Spanish as
architecture rather than as features added later.

It deliberately does **not** propose a new name, logo or brand system. Those
belong after stakeholder research, not before it. See `/concept` in the running
prototype for the full rationale.

## Deploying to Netlify

**Option A — drag and drop (fastest).** Unzip
`mlsa-prototype-netlify-deploy.zip` and drop the folder onto
<https://app.netlify.com/drop>. It is already built and includes the SPA
`_redirects` rule.

**Option B — from source.** Connect the repository, or drop this folder in.
Netlify reads `netlify.toml`:

| Setting | Value |
| --- | --- |
| Build command | `npm run build` |
| Publish directory | `dist` |
| Node version | 20 |

The SPA fallback (`/* → /index.html 200`) is configured in both `netlify.toml`
and `public/_redirects`, so deep links like `/get-help` resolve on refresh.

## Running locally

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build to dist/
npm run preview    # serve the production build
npm run typecheck  # tsc, no emit
```

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Homepage. Leads with "What do you need today?" — the core IA thesis. |
| `/get-help` | Turns intake into an understandable sequence. Three ways in, what happens after you apply, access needs, safety. |
| `/our-work` | Filterable practice areas, plus the distinction between individual cases and systemic advocacy. |
| `/about` | Organizational story, statewide reach, sourced impact figures, accountability, ways to give. |
| `/concept` | For RFP reviewers: the four hypotheses this prototype tests. |

## Content integrity

Organizational facts came from MLSA's public materials
([mtlsa.org](https://www.mtlsa.org/),
[montanalawhelp.org](https://www.montanalawhelp.org/)) and live in
`src/data/organization.ts`, each with a source note.

**Verified and used:** founding date (May 5, 1966); service in all 56 Montana
counties and on every Tribal Reservation; HelpLine `1-800-666-6899`, Tuesday–
Thursday 9:00 a.m.–1:00 p.m.; offices in Billings, Helena and Missoula; the
Helena address and fax; practice areas; the online application takes 10–15
minutes; the client quote (verbatim, published without an attributed name, so
none is invented).

**Deliberately omitted or labelled placeholder:** an annual "people served"
figure — MLSA publishes "thousands" without a number we could confirm, so the
prototype says exactly that; the specifics of interpretation, relay (711) and
alternative-format services, which are shown as a labelled placeholder rather
than fabricated; accountability document links.

Nothing here invents a service, statistic, testimonial, office or partnership.

## Accessibility

Built toward WCAG 2.2 AA. There is no accessibility widget, on purpose — the
accessibility work is the structure.

- Semantic HTML with one `<main>`, named landmarks, no skipped heading levels
- Skip link as the genuine first tab stop; focus is not stolen on page load
- Route *changes* move focus to the new `<h1>` so the page change is announced
- Focus trapped in the nav drawer and search overlay, Escape closes, focus
  returns to the trigger, background scroll locked — one shared `useDialog` hook
- Visible 3px focus ring everywhere, inverted on dark grounds
- Text contrast verified ≥4.5:1 (≥3:1 large) on every page in both languages
- 44px minimum interactive targets
- Status and result counts announced through polite live regions
- No information carried by color alone — filters, alerts and result types all
  carry a text label or icon
- Full `prefers-reduced-motion` support; no auto-playing animation
- Comfortable measure (~68 characters), fluid type that never drops below 16px
- Verified with no horizontal overflow from 320px up

## Spanish

Spanish is a column in the content deck (`src/i18n/copy.ts`), not a translation
layer. The `L` type requires both languages for every string, so an untranslated
string is a compile error. Switching also updates `document.documentElement.lang`
so assistive technology changes pronunciation — something a translate widget
cannot do. The site opens in Spanish for a Spanish-preferring browser.

## Stack

React 18 · TypeScript · Tailwind CSS · React Router · Lucide icons · Vite.
No backend, no database, no auth, no forms that collect anything.
~88 KB gzipped JS.

## Structure

```
src/
  components/     Header, MobileNavigation, AnnouncementBar, QuickExit,
                  LanguageToggle, Hero, ActionCard, PracticeAreaCard,
                  ImpactMetric, Testimonial, CTASection, SearchOverlay,
                  Footer, Alert, Breadcrumb, AccessibleAccordion, …
  data/           organization.ts (verified facts + provenance),
                  practiceAreas.ts, searchIndex.ts
  i18n/           copy.ts (the bilingual content deck), LanguageContext
  hooks/          useDialog (focus trap), useRouteAnnounce
  pages/          Home, GetHelp, OurWork, About, Concept, NotFound
```

`src/data/` is where a CMS would attach. Announcements, HelpLine hours and
impact figures are modelled as content records, not markup, because schedules
change and a site that needs a developer to change them will be wrong within a
year.
