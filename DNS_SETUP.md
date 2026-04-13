# DNS & Domain Configuration

This document records the required DNS configuration for `odigosauto.com`.
If you ever change registrars, transfer the domain, or update DNS records,
verify these settings are correct before re-deploying.

---

## Required DNS Records

| Type | Name | Value | Notes |
|------|------|-------|-------|
| CNAME | `@` (root) | `cname.vercel-dns.com` | See Vercel dashboard → Settings → Domains |
| CNAME | `www` | `cname.vercel-dns.com` | Vercel handles www → apex redirect |

Check the Vercel project dashboard under **Settings → Domains** for the
current expected values.

---

## What Must NOT Be Set

**URL forwarding / HTTP redirect rules at the registrar must be removed.**

Many registrars (GoDaddy, Namecheap, Google Domains / Squarespace, etc.)
offer a "Redirect" or "URL Forwarding" option alongside DNS records. If one
of these rules is active on `odigosauto.com`, the registrar will issue a
`301 Moved Permanently` to whatever target URL was configured — completely
bypassing the Vercel deployment.

Symptoms of an active registrar redirect:
- The domain opens a different website (e.g. CarEdge, a parking page, etc.)
- `curl -I https://odigosauto.com` returns `HTTP/1.1 301` with a
  `Location:` pointing to an external domain
- The Vercel deployment health check passes but the live domain does not

**To fix:** log into your registrar, find the "Redirects" or "Forwarding"
section, and delete any rules for `odigosauto.com` or `www.odigosauto.com`.
Then allow up to 30 minutes for DNS changes to propagate.

---

## Verifying the Configuration

Run the production smoke test after any DNS change:

```bash
npx tsx scripts/smoke-test.ts
```

Or against a specific base URL:

```bash
BASE_URL=https://odigosauto.com npx tsx scripts/smoke-test.ts
```

The script checks:
- `/api/health` → 200, JSON body with `status: "ok"` (smoke fails on any other value, including `"degraded"`)
- `/api/stats/count` → 200, JSON body with `count` field
- `/robots.txt` → 200, valid robots file, no staging domain references
- `/sitemap.xml` → 200, valid XML, no staging domain references
- `/` → 200, HTML containing app content

Any off-domain `Location` header in a response is treated as a failure.

---

## Quick Diagnostic

```bash
# Check what the domain actually resolves to
curl -sI https://odigosauto.com | head -5

# If you see "Location: https://some-other-site.com" → registrar redirect active
# If you see "HTTP/2 200" → DNS and hosting are correct
```
