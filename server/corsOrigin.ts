// CORS origin allowlist. Extracted as a pure function so it can be unit-tested
// without bootstrapping the full Express app. Regression guard for the bug
// where www.odigosauto.com was omitted and all purchases via the www subdomain
// were blocked by the cors() middleware.
export function isAllowedCorsOrigin(origin: string | undefined): boolean {
  // Same-origin / server-to-server requests have no Origin header.
  if (!origin) return true;

  if (origin === "https://odigosauto.com") return true;
  if (origin === "https://www.odigosauto.com") return true;

  if (process.env.NODE_ENV !== "production" && /^http:\/\/localhost(:\d+)?$/.test(origin)) {
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
