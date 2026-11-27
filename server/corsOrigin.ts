// CORS origin allowlist. Extracted as a pure function so it can be unit-tested
// without bootstrapping the full Express app. Regression guard for the bug
// where www.odigosauto.com was omitted and all purchases via the www subdomain
// were blocked by the cors() middleware.
export function isAllowedCorsOrigin(origin: string | undefined): boolean {
  // Same-origin / server-to-server requests have no Origin header.
  if (!origin) return true;

  if (origin === "https://odigosauto.com") return true;
  if (origin === "https://www.odigosauto.com") return true;

  // Localhost is the dev server, the CI production server, and the documented
  // self-host URL (docker compose publishes port 5000). The hosted production
  // API must not trust it: with credentials enabled, a page on the visitor's
  // own machine would otherwise be an allowed origin. Vercel sets VERCEL=1;
  // a self-hosted process and the CI server do not.
  const localhost = /^http:\/\/localhost(:\d+)?$/.test(origin);
  if (localhost && (process.env.NODE_ENV !== "production" || !process.env.VERCEL)) {
    return true;
  }

  if (process.env.NODE_ENV !== "production" && /\.replit\.dev$/.test(origin)) {
    return true;
  }

  // Vercel preview deployments for THIS project only.
  //
  // The previous rule was /\.vercel\.app$/, which matched every deployment on
  // Vercel's shared preview domain — anyone can create a free account and get
  // an origin under it. Combined with `credentials: true` on the cors()
  // middleware that made the allowlist meaningless. Preview URLs are always
  // `<project>-<something>.vercel.app`, so anchor on the project prefix.
  const previewPrefix = process.env.VERCEL_PREVIEW_PREFIX || "odigos";
  const previewPattern = new RegExp(
    `^https://${previewPrefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}-[a-z0-9-]+\\.vercel\\.app$`,
  );
  if (previewPattern.test(origin)) return true;

  return false;
}
