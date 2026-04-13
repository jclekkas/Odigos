// CORS origin allowlist. Extracted as a pure function so it can be unit-tested
// without bootstrapping the full Express app. Regression guard for the bug
// where www.odigosauto.com was omitted and all purchases via the www subdomain
// were blocked by the cors() middleware.
export function isAllowedCorsOrigin(origin: string | undefined): boolean {
  // Same-origin / server-to-server requests have no Origin header.
  if (!origin) return true;

  if (origin === "https://odigosauto.com") return true;
  if (origin === "https://www.odigosauto.com") return true;

  if (/^http:\/\/localhost(:\d+)?$/.test(origin)) return true;

  // Vercel preview deployments.
  if (/\.vercel\.app$/.test(origin)) return true;

  return false;
}
