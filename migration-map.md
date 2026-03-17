# Odigos — UI Migration Map

Generated as part of Task #28 (Pre-UI-Migration Baseline Setup).
This document is read-only reference. Do not modify during active migration.

---

## A. Pages and Routes

All routes are registered in `client/src/App.tsx` using `wouter`'s `<Switch>/<Route>`.

| Route | Page Component | Source File |
|---|---|---|
| `/` | `Landing` | `client/src/pages/landing.tsx` |
| `/analyze` | `Analyze` | `client/src/pages/home.tsx` |
| `/out-the-door-price` | `OutTheDoorPrice` | `client/src/pages/out-the-door-price.tsx` |
| `/monthly-payment-trap` | `MonthlyPaymentTrap` | `client/src/pages/monthly-payment-trap.tsx` |
| `/is-this-a-good-car-deal` | `IsThisAGoodCarDeal` | `client/src/pages/is-this-a-good-car-deal.tsx` |
| `/dealer-wont-give-otd` | `DealerWontGiveOtd` | `client/src/pages/dealer-wont-give-otd.tsx` |
| `/car-dealer-fees-explained` | `CarDealerFeesExplained` | `client/src/pages/car-dealer-fees-explained.tsx` |
| `/dealer-doc-fee` | `DealerDocFee` | `client/src/pages/dealer-doc-fee.tsx` |
| `/mandatory-dealer-add-ons` | `MandatoryDealerAddOns` | `client/src/pages/mandatory-dealer-add-ons.tsx` |
| `/out-the-door-price-calculator` | `OutTheDoorPriceCalculator` | `client/src/pages/out-the-door-price-calculator.tsx` |
| `/dealer-pricing-tactics` | `DealerPricingTactics` | `client/src/pages/dealer-pricing-tactics.tsx` |
| `/dealer-wont-give-otd-price` | `DealerWontGiveOtdPrice` | `client/src/pages/dealer-wont-give-otd-price.tsx` |
| `/are-dealer-add-ons-mandatory` | `AreDealerAddOnsMandatory` | `client/src/pages/are-dealer-add-ons-mandatory.tsx` |
| `/dealer-added-fees-after-agreement` | `DealerAddedFeesAfterAgreement` | `client/src/pages/dealer-added-fees-after-agreement.tsx` |
| `/market-adjustment-fee` | `MarketAdjustmentFee` | `client/src/pages/market-adjustment-fee.tsx` |
| `/doc-fee-too-high` | `DocFeeTooHigh` | `client/src/pages/doc-fee-too-high.tsx` |
| `/dealer-changed-price-after-deposit` | `DealerChangedPriceAfterDeposit` | `client/src/pages/dealer-changed-price-after-deposit.tsx` |
| `/finance-office-changed-the-numbers` | `FinanceOfficeChangedTheNumbers` | `client/src/pages/finance-office-changed-the-numbers.tsx` |
| `/car-dealer-fees-by-state` | `CarDealerFeesByState` | `client/src/pages/car-dealer-fees-by-state.tsx` |
| `/dealer-add-ons-list` | `DealerAddOnsList` | `client/src/pages/dealer-add-ons-list.tsx` |
| `/dealer-doc-fee-by-state` | `DealerDocFeeByState` | `client/src/pages/dealer-doc-fee-by-state.tsx` |
| `/car-dealer-fees-list` | `CarDealerFeesList` | `client/src/pages/car-dealer-fees-list.tsx` |
| `/calculate-out-the-door-price` | `CalculateOutTheDoorPrice` | `client/src/pages/calculate-out-the-door-price.tsx` |
| `/guides` | `GuidesRedirect` | `client/src/pages/guides-redirect.tsx` |
| `/admin/metrics` | `AdminMetrics` | `client/src/pages/admin-metrics.tsx` |
| `/privacy` | `Privacy` | `client/src/pages/privacy.tsx` |
| `/dealer-pricing-problems` | `DealerPricingProblems` | `client/src/pages/dealer-pricing-problems.tsx` |
| `*` (catch-all) | `NotFound` | `client/src/pages/not-found.tsx` |

**Note:** The `/analyze` route is served by `client/src/pages/home.tsx` (not `analyze.tsx`). This is the primary product page — the analyzer engine.

---

## B. Core Flows

### Analyze submission (text input)
- **Frontend entry point:** `client/src/pages/home.tsx`
  - Form built with `react-hook-form` + zod schema (`analysisRequestSchema`)
  - `analyzeMutation` — TanStack Query `useMutation` POSTs to `/api/analyze`
  - Fields: `dealerText`, `vehicle`, `condition`, `purchaseType`, `zipCode`, `apr`, `termMonths`, `downPayment`
- **Backend handler:** `server/routes.ts` → `app.post("/api/analyze", ...)`
  - Validates request body with `analysisRequestSchema`
  - Calls OpenAI chat completions with system prompt (lines 57–170 in routes.ts)
  - Runs rule engine adjustments: `applyRuleEngine()` from `server/ruleEngine.ts`
  - Stores result via `server/storage.ts`
  - Applies PII redaction via `server/piiRedact.ts`

### File upload (image / PDF)
- **Frontend entry point:** `client/src/pages/home.tsx`
  - Hidden `<input type="file">` accepts `.png`, `.jpg`, `.jpeg`, `.webp`, `.pdf`
  - `handleFileUpload` function POSTs the file as `multipart/form-data` to `/api/extract-text`
  - On success, populates the `dealerText` textarea with extracted text
- **Backend handler:** `server/routes.ts` → `app.post("/api/extract-text", ...)`
  - Uses `multer` for multipart parsing (`upload.single("file")`)
  - Validates MIME type against `ALLOWED_MIME_TYPES`
  - Calls `extractTextFromFile()` from `server/extractText.ts`

### OCR / text extraction
- **File:** `server/extractText.ts`
  - `extractTextFromFile(buffer, mimetype)` — dispatches to PDF or image handler
  - PDF: uses `pdf-parse` library
  - Images: sends to OpenAI Vision API (`gpt-4o`) with base64-encoded image

### GPT / OpenAI processing
- **Client setup:** `server/openaiClient.ts`
  - Exports `openai` — an `OpenAI` instance configured from `OPENAI_API_KEY` env var
- **Invocation:** `server/routes.ts` → `openai.chat.completions.create()`
  - Model: `gpt-4o`
  - System prompt defines the analysis framework (verdict, scoring, tactic detection)
  - Response parsed and validated against `analysisResponseSchema` (zod)

### `/api/analyze` flow (end-to-end)
1. Client POSTs dealer text + optional fields to `/api/analyze`
2. `routes.ts` validates input with zod schema
3. System prompt + user text sent to OpenAI `gpt-4o`
4. Response parsed → `analysisResponseSchema` validated
5. `applyRuleEngine()` applies deterministic rule adjustments on top of LLM result
6. Result stored via `storage.ts` (PII redaction applied via `piiRedact.ts`)
7. Final `AnalysisResponse` returned to client
8. Client renders verdict, tier-gated content, and detected issues

### Stripe checkout flow
- **Files:** `server/stripeClient.ts`, `server/routes.ts`
- **Endpoints:**
  - `GET /api/stripe-status` — checks if Stripe is configured
  - `POST /api/create-checkout-session` — creates a Stripe Checkout session for tier unlock ($49 or $79)
  - `GET /api/verify-payment` — verifies a completed Stripe session and unlocks the tier
  - `POST /api/checkout` — alternate checkout endpoint
- **Frontend:** `client/src/pages/home.tsx`
  - `checkoutMutation` — calls `/api/create-checkout-session` with `analysisId` and `tier`
  - Redirects to Stripe-hosted checkout via `window.location.href = data.url`
  - On return, checks `?session_id=` param and calls `/api/verify-payment`

---

## C. Shared UI Components

### Custom shared components (`client/src/components/`)

| Component | File | Purpose |
|---|---|---|
| `SiteHeader` | `SiteHeader.tsx` | Global sticky nav with logo + navigation links. Used on `/` and `/analyze`. |
| `ArticleLayout` | `ArticleLayout.tsx` | Shared layout wrapper for all article/guide pages. Includes breadcrumbs, prose container, and `ArticleCta` at bottom. Accepts `title` and `showBreadcrumbs` props. |
| `ArticleCta` | `ArticleCta.tsx` | Shared CTA block rendered at the bottom of article pages. Links to `/analyze`. |
| `SeoHead` | `SeoHead.tsx` | Shared `<Helmet>` wrapper for page title, meta description, canonical URL, OG tags, and Twitter card. |

### shadcn/ui component library (`client/src/components/ui/`)

Full shadcn/ui library is installed. Key components in active use:

| Component | Used in |
|---|---|
| `Button` | Landing, Analyze, all article CTAs |
| `Card`, `CardHeader`, `CardContent`, `CardTitle` | Analyze page (form cards, result tiers) |
| `Textarea` | Analyze page (dealer text input) |
| `Input` | Analyze page (optional fields) |
| `Select`, `SelectTrigger`, `SelectContent`, `SelectItem` | Analyze page (condition, purchase type) |
| `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage` | Analyze page (react-hook-form integration) |
| `Collapsible`, `CollapsibleTrigger`, `CollapsibleContent` | Analyze page (Optional Details section) |
| `Toaster`, `Toast` | App-level (success/error notifications) |
| `Skeleton` | Loading states |

---

## D. Styling System

### Framework
- **Tailwind CSS** — utility-first, configured in `tailwind.config.ts`
- **shadcn/ui** — component library built on Radix UI primitives, styled via Tailwind
- **Dark mode** — enabled via `darkMode: ["class"]` in Tailwind config; `.dark` class toggled on `<html>`

### Global stylesheet
- **File:** `client/src/index.css`
- Contains CSS custom properties (design tokens) for the color system:
  - `:root` — light mode HSL values
  - `.dark` — dark mode HSL values
- Key token categories: `--background`, `--foreground`, `--card`, `--primary`, `--secondary`, `--muted`, `--accent`, `--destructive`, `--border`, `--input`, `--ring`
- Custom utility classes: `hover-elevate`, `active-elevate-2` (subtle elevation on interaction)

### Other config files
- `tailwind.config.ts` — extends theme with shadcn tokens, sets `darkMode: ["class"]`
- `vite.config.ts` — path aliases (`@/` → `client/src/`, `@assets/` → `attached_assets/`)
- `postcss.config.js` — Tailwind + Autoprefixer

### Notable custom tokens / utilities
- All color tokens use HSL space-separated values (no `hsl()` wrapper), e.g. `--background: 0 0% 100%`
- `hover-elevate` / `active-elevate-2` — custom classes for hover/active elevation effects
- No external font imports; uses system font stack via Tailwind defaults

---

## Safe UI Replacement Zones

These sections of the landing page (`client/src/pages/landing.tsx`) are **purely presentational** — they contain no logic, no API calls, no form state, and no Stripe interaction. They are safe to replace with new UI components without affecting any product behavior.

### Landing page (`/`) — `client/src/pages/landing.tsx`

| Section | Description | Safe to replace |
|---|---|---|
| Hero section | Headline, subheadline, authority framing line, CTA buttons (Link wrappers only — no logic), reassurance text | ✅ Yes — CTA buttons use `<Link href="/analyze">`, no logic |
| "How it works" steps | Static ordered list of 3 steps | ✅ Yes — purely static |
| "What Odigos Checks For" | Static grid of 4 check items with descriptions | ✅ Yes — purely static |
| OTD explainer section | Educational paragraph about out-the-door pricing | ✅ Yes — purely static |
| "In minutes" timeline | Static 3-step visual | ✅ Yes — purely static |
| "Real example" section | Static anonymized scenario description | ✅ Yes — purely static |
| "Built for real car buyers" | Trust paragraph | ✅ Yes — purely static |
| Sample output preview | Static NO-GO verdict card with detected issues | ✅ Yes — static mock, no API |
| Pricing section | Pricing cards with CTA Link buttons | ✅ Yes — buttons are `<Link>` wrappers, no Stripe logic here |
| FAQ section | Accordion with hardcoded Q&A | ✅ Yes — local state toggle only (`openFaq` useState) |
| Final CTA section | Headline + CTA button | ✅ Yes — purely static |
| "Why Use Odigos?" list | Static bullet list | ✅ Yes — purely static |
| "What Odigos does NOT do" | Static disclaimer list | ✅ Yes — purely static |
| "Common Dealer Pricing Tactics" | Static info section | ✅ Yes — purely static |
| Footer trust line | Static brand tagline | ✅ Yes — purely static |

### Analyzer page (`/analyze`) — `client/src/pages/home.tsx`

**⚠️ This page contains live logic. Be conservative.**

| Section | Description | Safe to replace |
|---|---|---|
| Page heading + description | H1, subtitle, "How this works" link | ✅ Yes — purely presentational |
| Form card title ("Paste Dealer Communication") | Label only | ✅ Yes |
| Sample buttons ("Try a good/bad deal example") | Calls `form.setValue()` — preserve function call | ⚠️ Presentational shell safe; must keep `onClick` wired |
| Submit button label | Text only | ✅ Yes — preserve `type="submit"` and `disabled` logic |
| Data disclosure copy | Text + privacy link | ✅ Yes |
| Result display sections | Renders `result` object — DO NOT replace | ❌ No — logic-bound |
| Locked tier sections | Stripe unlock flow — DO NOT replace | ❌ No — payment logic |

### Shared components

| Component | Safe to replace |
|---|---|
| `SiteHeader` | ✅ Yes — navigation links must preserve `href` values; no logic |
| `ArticleLayout` | ⚠️ Preserve `title` and `showBreadcrumbs` props; breadcrumb logic is internal |
| `ArticleCta` | ✅ Yes — static CTA, just a link to `/analyze` |
| `SeoHead` | ✅ Yes — metadata only, no logic |

---

*Last updated: Pre-UI-migration baseline — Task #28*
