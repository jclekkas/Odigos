# Odigos - Car Deal Analyzer

## Overview

Odigos is a web application that helps users evaluate car purchase offers before visiting a dealership. Users paste dealer quotes, texts, or emails into the app, and an AI-powered backend analyzes the deal to provide a clear GO/NO-GO recommendation with a color-coded score (GREEN/YELLOW/RED), extracted pricing details, and suggested questions to ask the dealer.

## User Preferences

Preferred communication style: Simple, everyday language.
Owner email: jclekkas@gmail.com
Email notifications: Deferred (user opted to use deployment logs for now; can add Resend integration later)

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **State Management**: TanStack React Query for server state
- **Forms**: React Hook Form with Zod validation
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens defined in CSS variables
- **Build Tool**: Vite with React plugin

The frontend follows a single-page architecture with the main functionality on the home page. Components are organized with reusable UI primitives in `client/src/components/ui/` and page-level components in `client/src/pages/`.

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **HTTP Server**: Node.js HTTP server wrapping Express
- **API Design**: RESTful JSON API with Zod schema validation
- **AI Integration**: OpenAI-compatible API via Replit AI Integrations

The backend exposes a single primary endpoint `/api/analyze` that receives dealer text and optional context, sends it to an LLM for analysis, and returns structured JSON with deal scoring and extracted fields.

### Data Flow
1. User submits dealer text via form
2. Frontend validates with Zod and sends POST to `/api/analyze`
3. Backend constructs LLM prompt with system instructions for structured JSON output
4. LLM response is parsed and returned to frontend
5. Frontend renders results with visual hierarchy (score badge, summary, detected fields)

### Shared Code
- `shared/schema.ts`: Zod schemas for request/response validation shared between frontend and backend
- `shared/models/chat.ts`: Drizzle ORM table definitions for conversation persistence (optional chat feature)

### Database
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` and `shared/models/`
- **Migrations**: Managed via `drizzle-kit push`

Note: The database is used for metrics tracking and optional features. The core deal analysis is stateless.

### Metrics System
- **Table**: `metrics_events` stores all tracked events with type, timestamp, and JSON metadata
- **Event Types**: submission, submission_score, checkout_started, payment_completed, page_view
- **API Endpoint**: `GET /api/metrics` returns aggregated statistics
- **Admin Dashboard**: `/admin/metrics` displays key business metrics (private, not in sitemap)
- **Tracked Data**: Submissions, payments, revenue, conversion rate, score distribution, activity timeline

### API Endpoints (key)
- `POST /api/analyze` — main deal analysis (OpenAI + rule engine)
- `POST /api/extract-text` — OCR/PDF text extraction from uploaded file
- `GET /api/state-fee/:state` — doc fee cap and tax data for a US state abbreviation
- `GET /api/stripe-status` — whether Stripe is configured
- `GET /api/health` — server health check

### Development vs Production
- **Development**: Vite dev server with HMR, proxied through Express
- **Production**: Vite builds static assets to `dist/public`, Express serves them with `serveStatic`

## External Dependencies

### AI Services
- **OpenAI-compatible API**: Used via Replit AI Integrations
  - Environment variables: `AI_INTEGRATIONS_OPENAI_API_KEY`, `AI_INTEGRATIONS_OPENAI_BASE_URL`
  - Models used: GPT for text analysis, `gpt-image-1` for image generation (optional)

### Database
- **PostgreSQL**: Connection via `DATABASE_URL` environment variable
- **Session Store**: `connect-pg-simple` for session persistence

### Content Pages (SEO Articles)
- All article pages follow a consistent pattern: `setSeoMeta` for meta tags/canonical, logo header linking to `/`, article body with dark theme styling, internal link to `/out-the-door-price`, one external link (FTC/Edmunds/KBB), CTA linking to `/analyze`, and footer disclaimer
- **Pages**: `/out-the-door-price`, `/monthly-payment-trap`, `/is-this-a-good-car-deal`, `/dealer-wont-give-otd`, `/car-dealer-fees-explained`, `/dealer-doc-fee`, `/mandatory-dealer-add-ons`, `/out-the-door-price-calculator`, `/dealer-pricing-tactics`, `/dealer-wont-give-otd-price`, `/are-dealer-add-ons-mandatory`, `/dealer-added-fees-after-agreement`, `/market-adjustment-fee`, `/doc-fee-too-high`, `/dealer-changed-price-after-deposit`, `/finance-office-changed-the-numbers`, `/car-dealer-fees-by-state`, `/dealer-add-ons-list`, `/dealer-doc-fee-by-state`, `/car-dealer-fees-list`, `/calculate-out-the-door-price`, `/about`, `/how-odigos-works`, `/example-analysis`
- **State-Specific Pages**: `/car-dealer-fees-:state` — 51 pages (all 50 US states + DC). Data in `client/src/data/stateFees.ts` (`STATE_FEES` record keyed by slug). Each state has: `name`, `abbreviation`, `slug`, `docFeeRange`, `hasCap`, `metaDescription`, `capNote`, `salesTaxNote`, `registrationNote`, `introAngle`, `snippetAnswer`, `watchFor[]`, `negotiationNote`, `ctaHeading`, `ctaBody`, `internalLinks[]`, `sources[]`, `specialNotes`, `dealerMessage`, `lastVerified`. 18 states have capped doc fees. Valid slugs enforced in `shared/routes.ts` `VALID_STATE_SLUGS`.
- **Sitemap**: `sitemap.xml` (69 URLs total — 23 static + 46 new state pages, excludes `/guides` redirect and `/admin/metrics`)
- **robots.txt**: Served via explicit Express route in `server/routes.ts`

### Prerendering (SEO)
- **Tool**: `puppeteer-core` + system Chromium via `scripts/prerender.mjs`
- **Meta Tags**: `react-helmet-async` renders title/description/OG/Twitter/canonical at render time (not useEffect)
- **Component**: `<SeoHead>` in `client/src/components/SeoHead.tsx` wraps Helmet for consistent meta tags
- **HelmetProvider**: Wraps `<App>` in `client/src/main.tsx`
- **Prerendered Routes**: `/dealer-pricing-tactics`, `/dealer-wont-give-otd-price`, `/are-dealer-add-ons-mandatory`
- **Output**: `dist/public/<route>/index.html` (generated after `vite build` by running `node scripts/prerender.mjs`)
- **Express Serving**: `server/static.ts` checks for prerendered route HTML before SPA fallback
- **Build Flow**: `npx vite build` → `node scripts/prerender.mjs` → deploy
- **Adding New Routes**: Add route to `ROUTES` array in `scripts/prerender.mjs` and `PRERENDERED_ROUTES` in `server/static.ts`

## Testing

### Test Stack
- **Vitest 4**: Unit, API integration, and component tests (`npx vitest run`)
- **Playwright**: End-to-end browser tests (`npx playwright test`)
- **@testing-library/react**: Component test rendering (jsdom)
- **supertest**: HTTP-level API integration tests

### Running Tests
```bash
npx vitest run                    # all 110 tests (unit + api + components)
npx vitest run --project unit     # rule engine, state fee, PII redact, schema
npx vitest run --project api      # /api/analyze, /api/extract-text, /api/state-fee
npx vitest run --project components  # home, landing, about, privacy
npx playwright test               # E2E (requires dev server on port 5000)
```

### Test Layout
```
tests/
├── unit/         ruleEngine, stateFeeLookup, piiRedact, schema
├── api/          analyze, extractText, stateFee endpoint
├── components/   home, landing, about, privacy (jsdom + HelmetProvider)
└── e2e/          analyzer.spec.ts (Playwright, all routes intercepted)
```

### Key Constraints
- No real OpenAI or Stripe calls in any test — all mocked via `vi.mock()`
- Component tests use `// @vitest-environment jsdom` docblocks (Vitest v4)
- `vitest.config.ts` defines three separate projects: `unit`, `api`, `components`
- See `TESTING.md` for full documentation

### Key NPM Packages
- `openai`: OpenAI SDK for LLM calls
- `drizzle-orm` / `drizzle-kit`: Database ORM and migrations
- `zod`: Runtime schema validation
- `@tanstack/react-query`: Async state management
- `@radix-ui/*`: Accessible UI primitives
- `tailwindcss`: Utility-first CSS framework
- `react-helmet-async`: Render-time SEO meta tags for prerendered pages
- `puppeteer-core`: Headless browser for post-build prerendering
- `@sentry/node`: Backend error tracking (v10)
- `@sentry/react`: Frontend error tracking and Error Boundary (v10)

## Error Tracking (Sentry)

### Overview
Sentry is integrated for production error tracking on both frontend and backend. It is disabled in development by default and is always a safe no-op when the DSN is not set.

### Initialization Points
- **Backend**: `server/index.ts` — `Sentry.init` runs before any route registration. Uses `expressIntegration()` and `setupExpressErrorHandler()`. Captures uncaught exceptions and unhandled promise rejections.
- **Frontend**: `client/src/main.tsx` — `Sentry.init` runs before React renders. Uses `browserTracingIntegration()`.
- **React Error Boundary**: `client/src/App.tsx` — `Sentry.ErrorBoundary` wraps the entire app to capture render failures. Shows a minimal fallback UI on crash.

### Required Environment Variables (set in Replit Secrets)
| Variable | Location | Purpose |
|---|---|---|
| `SENTRY_DSN` | Backend secret | Backend Sentry project DSN |
| `VITE_SENTRY_DSN` | Frontend env var | Frontend Sentry project DSN |
| `SENTRY_ENABLED` | Optional backend | Set to `"true"` to enable in development |
| `VITE_SENTRY_ENABLED` | Optional frontend | Set to `"true"` to enable in development |

> **Note**: Frontend and backend can use different Sentry projects/DSNs. A missing DSN always results in a safe no-op (no crash, no error).

### What Is Captured
- Uncaught frontend exceptions and unhandled promise rejections
- React component render errors (via Error Boundary)
- Backend route exceptions, unhandled rejections, and uncaught exceptions
- Lightweight context tags on critical flows: `feature` and `route` on `/api/analyze`, `/api/extract-text`, `/api/checkout`, `/api/state-fee`

### What Is Intentionally Excluded (Privacy)
- Request bodies (`dealerText`, `text`, `content`, `rawBody`)
- File data or buffers
- Authentication headers (`authorization`, `cookie`)
- Any user-submitted document or dealer communication content

### Environment Behavior
- **Production** (`NODE_ENV=production`): Sentry is active when DSN is set
- **Development** (default): Sentry is silent even if DSN is set
- **Development opt-in**: Set `SENTRY_ENABLED=true` (backend) or `VITE_SENTRY_ENABLED=true` (frontend)

### Verification Steps
1. Deploy to production with `SENTRY_DSN` and `VITE_SENTRY_DSN` set in Replit Secrets
2. Trigger a test error by visiting an invalid route or submitting a bad request
3. Confirm the error appears in the Sentry dashboard within ~30 seconds

## A/B Test Infrastructure

A lightweight, self-hosted A/B testing layer for measuring conversion impact of UI changes.

### Architecture
- **Config**: `client/src/lib/experiments.ts` — central `EXPERIMENTS` array defines active experiments (id, variants, trafficSplit). Adding a new experiment requires only a new entry here.
- **Assignment**: `useExperiment(id)` hook deterministically assigns users to variants by hashing their session ID. Assignment is stored in localStorage for persistence across reloads.
- **Tracking**: `experiment_assigned` events fire on first assignment; `experiment_converted` events fire alongside `paid_conversion` and carry all active experiment assignments.
- **Backend**: Two new event types (`experiment_assigned`, `experiment_converted`) added to `server/metrics.ts`. `getExperimentStats()` queries the KV store and returns per-variant conversion rates.
- **API**: `GET /api/experiments` returns per-experiment stats. `POST /api/track` now accepts `experiment_assigned` and `experiment_converted` event types.
- **Dashboard**: `/admin/experiments` page shows per-experiment variant data including assignments, conversions, conversion rate, and a "winning" indicator.

### Active Experiments
| Experiment ID | Variants | What changes |
|---|---|---|
| `hero_headline` | control / urgency | Hero headline copy on landing page |
| `unlock_cta` | control / value | Unlock CTA button text on analyze page and pricing section |

### How to Add a New Experiment
Add one entry to the `EXPERIMENTS` array in `client/src/lib/experiments.ts`:
```ts
{ id: "my_experiment", variants: ["control", "treatment"], trafficSplit: 0.5 }
```
Then use the `useExperiment("my_experiment")` hook in the relevant component.