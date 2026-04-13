# Odigos

**AI-powered deal analysis for car buyers.**

Odigos is a consumer protection tool that analyzes dealer quotes, texts, and emails to help car buyers identify pricing problems, hidden fees, and dealership tactics before they commit. Paste or upload a dealer message, and Odigos returns a structured analysis with a clear GO/NO-GO verdict.

## Features

- **Paste or upload dealer quotes** — supports text, email, screenshots, photos, and PDFs
- **GO / NO-GO verdict** — color-coded score (GREEN / YELLOW / RED) for every deal
- **Pricing extraction** — detects sale price, out-the-door price, APR, term, monthly payment, fees, and add-ons
- **Red flag detection** — identifies hidden fees, payment-only framing, and vague terms
- **Missing info checklist** — highlights what the dealer left out
- **Negotiation reply templates** — copy-paste responses to send back to the dealer
- **State-specific fee database** — documentation and dealer fees by state
- **Educational content** — 20+ SEO pages covering OTD pricing, dealer fees, negotiation tactics, and more

## How It Works

1. User pastes a dealer quote or uploads a screenshot/PDF
2. Odigos extracts the text and analyzes it with AI
3. A free preview shows the GO/NO-GO verdict and high-level summary
4. Paid passes unlock the full report: red flags, missing info, detailed reasoning, and a ready-to-send dealer reply

### Pricing

| Pass | Price | Window |
|------|-------|--------|
| Weekend Warrior | $29 | 72 hours unlimited scans |
| Car Buyer's Pass | $49 | 14 days unlimited scans |

Both passes unlock identical features. One-time purchase, no subscriptions.

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Wouter, TanStack React Query |
| Backend | Express.js, TypeScript, Zod |
| Database | PostgreSQL 16, Drizzle ORM |
| AI | OpenAI API |
| Payments | Stripe |
| Analytics | PostHog, Sentry |
| Testing | Vitest, Playwright |
| Deployment | Vercel |

## Project Structure

```
client/          React frontend (pages, components, hooks)
server/          Express.js backend (routes, services, rule engine, metrics)
shared/          Shared TypeScript schemas and models
migrations/      Database migrations (Drizzle)
tests/           Test suites (unit, API, component, e2e, integration)
scripts/         Build and automation scripts
docs/            Documentation
```

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 16

### Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_PRICE_ID_49` | Stripe price ID for Car Buyer's Pass |
| `SENTRY_DSN` | Sentry error tracking DSN |
| `NODE_ENV` | `development` or `production` |

### Install and Run

```bash
npm install
npm run db:push
npm run dev
```

The dev server starts on port 3000.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run check` | TypeScript type checking |
| `npm run lint` | ESLint validation |
| `npm test` | Run all tests |
| `npm run test:unit` | Unit tests only |
| `npm run test:api` | API tests only |
| `npm run test:components` | Component tests only |
| `npm run test:e2e` | Playwright end-to-end tests |
| `npm run db:push` | Apply database migrations |

## Testing

Odigos uses a layered testing strategy:

- **Unit tests** — business logic, rule engine, utilities (Vitest)
- **API tests** — endpoint behavior and validation (Vitest + Supertest)
- **Component tests** — React component rendering and interaction (Vitest + Testing Library)
- **E2E tests** — full user flows through the browser (Playwright)

```bash
npm test                  # Run all tests
npm run test:e2e          # Run end-to-end tests
npm run test:coverage     # Generate coverage report
```

## Deployment

Odigos is deployed on Vercel. Pushing to `main` triggers automatic deployment.

### CI Pipeline

Every push and pull request runs:

1. **Install** — `npm ci`
2. **Lint** — ESLint
3. **Typecheck** — TypeScript strict mode
4. **Test** — Vitest (unit, API, component)
5. **Build** — Full production bundle
6. **E2E** — Playwright tests with PostgreSQL service container

Branch protection on `main` requires all status checks to pass and one approving review.

## Security

- **PII redaction** — IP addresses and user-agents stored as SHA-256 hashes only
- **Audit logging** — all analysis attempts, payments, and admin actions are logged
- **Rate limiting** — Redis-backed per-IP rate limiting
- **CSP headers** — Content Security Policy with per-request nonces
- **Helmet** — standard security headers

See [SECURITY.md](SECURITY.md) for the full security policy.

## License

[MIT](LICENSE)
