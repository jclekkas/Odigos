# Odigos — guidance for Claude Code

## Deployment target: Vercel

Production target is **Vercel**. The Replit-era config has been removed from the repo. A few migration-window remnants remain in code — treat them as historical:

- `process.env.VERCEL` branches in `server/static.ts` — dual-mode code from the migration window

If you find yourself diagnosing a Replit-specific problem, stop and ask — it's likely irrelevant.

## Production entry point

`api/index.ts` → imports `server/index.ts` (Express). `vercel.json` rewrites `/(.*)` to `/api`, so every request flows through the function unless intercepted by Vercel's CDN for static assets.

## Build

`npm run build` → `tsx script/build.ts`:
1. `vite build` emits `dist/public/`
2. Optional Chromium prerender (`scripts/prerender.mjs`) — skipped if Chromium unavailable; server-side meta injection is the fallback
3. `dist/public/index.html` is renamed to `_shell.html` so Vercel can't serve the raw shell from CDN without server-side meta injection
4. esbuild bundles server code to `dist/index.cjs` (used for local `npm start`; Vercel bundles `api/index.ts` + traced imports itself)

## Vercel serverless gotchas

- `process.cwd()` at runtime is `/var/task/`. Files at the repo root are **not** accessible unless listed in `includeFiles` in `vercel.json` or reachable via static import analysis from `api/index.ts`.
- **Static assets belong in `client/public/`**. Vite copies them to `dist/public/` and Vercel serves them from the CDN directly, bypassing the function. Putting a file at the repo root will **not** make it available at runtime.
- Cold starts are real. `api/index.ts` awaits an `initialize()` promise; `/api/health` is registered synchronously before init so it stays reachable if init fails.
- `req.hostname` on Vercel is the real request host — never `*.replit.app`.

## SEO

- Canonical origin: `https://odigosauto.com` (apex only, non-www). Source of truth: `shared/siteConfig.ts`.
- Per-route title / description / canonical / og metadata is injected server-side by `server/injectMeta.ts`. The metadata map is `shared/seoMetadata.ts` (explicit entries + state fallback + glossary fallback).
- `sitemap.xml` must be served as `application/xml` with correct content.
- `robots.txt` is generated dynamically by `server/routes/reference.ts`.
- Known static routes: `shared/routes.ts` (`STATIC_ROUTES`). Prerender candidates: `scripts/prerender.mjs`.

## Commands

- `npm run dev` — local dev
- `npm run build` — production build
- `npm run check` — typecheck
- `npm run lint` — eslint
- `npm test` — vitest (unit + api + components)
- `npm run test:e2e` — playwright
- `npx tsx scripts/smoke-test.ts` — production smoke test; runs on a 6-hour cron in `.github/workflows/smoke.yml`
