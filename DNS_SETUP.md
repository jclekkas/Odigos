# DNS & Domain Configuration (Vercel)

This document records the required DNS configuration for `odigosauto.com`,
now hosted on **Vercel**.

---

## Step 1: Add Domain in Vercel

1. Go to your Vercel project → **Settings → Domains**
2. Add `odigosauto.com`
3. Vercel will show the required DNS records (typically a `CNAME` or `A` record)

---

## Step 2: Configure DNS at Your Registrar

| Type | Name | Value | Notes |
|------|------|-------|-------|
| A | `@` (root) | `76.76.21.21` | Vercel's anycast IP (confirm in Vercel dashboard) |
| CNAME | `www` | `cname.vercel-dns.com` | Vercel's CNAME target (confirm in dashboard) |

> The exact values are shown in the Vercel Domains panel. Copy them from
> there — they may change.

---

## What Must NOT Be Set

**URL forwarding / HTTP redirect rules at the registrar must be removed.**

Many registrars (GoDaddy, Namecheap, Squarespace, etc.) offer a "Redirect"
or "URL Forwarding" option alongside DNS records. If one of these rules is
active on `odigosauto.com`, the registrar will issue a `301 Moved Permanently`
to whatever target URL was configured — completely bypassing Vercel and
potentially creating a redirect loop.

Symptoms of an active registrar redirect:
- `ERR_TOO_MANY_REDIRECTS` in the browser
- `curl -I https://odigosauto.com` returns `301` with a `Location:` pointing
  to an external domain (e.g. `odigos.replit.app`)
- The Vercel deployment works at `your-project.vercel.app` but the custom
  domain does not

**To fix:** log into your registrar, find the "Redirects" or "Forwarding"
section, and delete any rules for `odigosauto.com` or `www.odigosauto.com`.
Then allow up to 30 minutes for DNS changes to propagate.

---

## Required Vercel Environment Variables

Set these in Vercel → Project → Settings → Environment Variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `AI_INTEGRATIONS_OPENAI_API_KEY` | Yes | OpenAI API key for analysis |
| `STRIPE_SECRET_KEY` | Yes | Stripe secret key for payments |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Yes | Stripe publishable key (client) |
| `SENTRY_DSN` | No | Sentry error tracking DSN |
| `VITE_SENTRY_DSN` | No | Sentry DSN for client-side |
| `VITE_POSTHOG_KEY` | No | PostHog analytics key |
| `VITE_POSTHOG_HOST` | No | PostHog host URL |
| `REDIS_URL` | No | Redis URL for rate limiting (e.g. Upstash) |
| `CANONICAL_DOMAIN_ACTIVE` | Yes | Set to `true` once DNS is confirmed working |

---

## Verifying the Configuration

```bash
# Check what the domain resolves to
curl -sI https://odigosauto.com | head -5

# If you see "Location: https://some-other-site.com" → registrar redirect active
# If you see "HTTP/2 200" → DNS and hosting are correct
```

Run the smoke test after any DNS change:

```bash
BASE_URL=https://odigosauto.com npx tsx scripts/smoke-test.ts
```

---

## Migration Checklist

- [ ] Remove all URL forwarding rules at registrar for `odigosauto.com`
- [ ] Set DNS A record for `@` → Vercel IP (from Vercel dashboard)
- [ ] Set DNS CNAME for `www` → `cname.vercel-dns.com`
- [ ] Set all environment variables in Vercel project settings
- [ ] Deploy to Vercel (push to main or connect repo)
- [ ] Verify domain loads: `curl -sI https://odigosauto.com`
- [ ] Set `CANONICAL_DOMAIN_ACTIVE=true` in Vercel env vars
- [ ] Run smoke test to confirm everything works
