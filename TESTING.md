# Testing Guide

This project uses [Vitest](https://vitest.dev/) for unit, API integration, and component tests, and [Playwright](https://playwright.dev/) for end-to-end (E2E) tests.

## Running Tests

### All unit, API, and component tests

```bash
npx vitest run
```

### By project / tier

```bash
# Unit tests only (rule engine, state fee lookup, PII redaction, schema)
npx vitest run --project unit

# API integration tests only
npx vitest run --project api

# Component/UI tests only (jsdom)
npx vitest run --project components
```

### Watch mode (dev)

```bash
npx vitest
```

### E2E tests (Playwright, requires the dev server running on port 5000)

```bash
npx playwright test
```

Run E2E with a visible browser:

```bash
npx playwright test --headed
```

---

## Test Layout

```
tests/
├── unit/
│   ├── ruleEngine.test.ts       – 20 cases: scoring, CA/TX/OR doc fee caps, APR, market adj.
│   ├── stateFeeLookup.test.ts   – 14 cases: fee data, cap detection, unknown state
│   ├── piiRedact.test.ts        – 12 cases: email, phone, SSN, VIN, credit card
│   └── schema.test.ts           – 20 cases: Zod insert/select schemas
│
├── api/
│   ├── analyze.test.ts          – 9 cases: happy path, rule-engine RED override,
│   │                               400 validation, 500 OpenAI throw, 502 schema mismatch
│   ├── extractText.test.ts      – 9 cases: JPEG/PDF success, unsupported type,
│   │                               short text 422, throw 422, health, stripe-status
│   └── stateFee.test.ts         – 6 cases: CA/TX/AL data, case-insensitive, 404 unknown
│
├── components/
│   ├── home.test.tsx            – 8 cases: form rendering, tab switching, submit,
│   │                               free/paid stripe-status query
│   ├── landing.test.tsx         – 3 cases: hero headline, CTA button, button role
│   ├── about.test.tsx           – 5 cases: heading, sections, CTA, email link
│   └── privacy.test.tsx         – 4 cases: h1, data collection, retention, security
│
└── e2e/
    └── analyzer.spec.ts         – 20+ Playwright cases: landing, happy path, validation,
                                    RED result, file upload, unsupported file, free mode,
                                    API key leak guard, health & state-fee API endpoints
```

## Key Design Decisions

- **No real external calls**: All OpenAI, Stripe, and database calls are mocked via `vi.mock(...)`. No API keys are required to run tests.
- **Rule engine tested independently**: `ruleEngine.test.ts` exercises the scoring logic directly without touching the HTTP layer.
- **State fee lookup tested at two levels**: Unit tests exercise `getStateFeeData()` directly; API tests hit the `/api/state-fee/:state` endpoint end-to-end.
- **Component tests use `// @vitest-environment jsdom`** docblocks (Vitest v4) and wrap components in `HelmetProvider`, `QueryClientProvider`, and `Router`.
- **E2E tests use `page.route()`** to intercept `/api/analyze`, `/api/stripe-status`, and `/api/stats` — the real dev server runs on port 5000 and no real LLM calls are made.
- **`beforeEach` mock resets** (`vi.mocked(fn).mockReset()`) prevent `mockResolvedValueOnce` queue buildup across tests.

## Vitest Configuration

`vitest.config.ts` defines three separate Vitest projects:

| Project | Environment | Glob |
|---------|-------------|------|
| `unit` | `node` | `tests/unit/**/*.test.ts` |
| `api` | `node` | `tests/api/**/*.test.ts` |
| `components` | `jsdom` | `tests/components/**/*.test.tsx` |

The `components` project includes `@vitejs/plugin-react` for JSX transformation and the same path aliases (`@`, `@shared`, `@assets`) as the main Vite config.

## Playwright Configuration

`playwright.config.ts` runs Chromium headless against `http://localhost:5000`. The dev server must be running before executing `npx playwright test`. All external API routes are intercepted via `page.route()`.
