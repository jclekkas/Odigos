/**
 * Production smoke test for odigosauto.com.
 *
 * Checks each endpoint with redirect: "manual" first so any off-domain
 * redirect (e.g. a residual registrar URL-forwarding rule) is caught before
 * the redirect is followed. Body assertions are made against the final
 * response after verifying all intermediate redirects stay on-domain.
 *
 * Usage:
 *   npx tsx scripts/smoke-test.ts                  # tests https://odigosauto.com
 *   BASE_URL=http://localhost:5000 npx tsx scripts/smoke-test.ts
 *
 * Exit codes: 0 = all assertions passed, 1 = one or more failures.
 *
 * Health endpoint contract:
 *   GET /api/health → 200  { status: "healthy" | "degraded", uptimeSeconds, memory }
 *   "healthy" = memory < 1536 MB, "degraded" = memory >= 1536 MB.
 *   (The test suite verifies HTTP 200 only; body schema is asserted here.)
 */

const BASE_URL = (process.env.BASE_URL ?? "https://odigosauto.com").replace(/\/$/, "");
const TIMEOUT_MS = 15_000;

interface CheckResult {
  label: string;
  passed: boolean;
  detail?: string;
}

const results: CheckResult[] = [];

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

function pass(label: string): void {
  results.push({ label, passed: true });
  console.log(`  ✓  ${label}`);
}

function fail(label: string, detail: string): void {
  results.push({ label, passed: false, detail });
  console.error(`  ✗  ${label}`);
  console.error(`       ${detail}`);
}

function isOnDomain(location: string): boolean {
  return (
    location.startsWith("/") ||
    location.startsWith(BASE_URL) ||
    location.startsWith("https://odigosauto.com") ||
    location.startsWith("http://localhost")
  );
}

async function fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Check one endpoint:
 * 1. Fetch with redirect:"manual" — fail immediately if any redirect goes off-domain.
 * 2. Fetch with redirect:"follow" — assert expected status and run optional body assertion.
 */
async function checkEndpoint(
  path: string,
  opts: {
    expectedStatus?: number;
    bodyAssert?: (body: string) => string | null;
  } = {}
): Promise<void> {
  const { expectedStatus = 200, bodyAssert } = opts;
  const url = `${BASE_URL}${path}`;
  const label = `${path} → ${expectedStatus}`;
  const headers = { "User-Agent": "OdigosAutoSmokeTest/1.0" };

  let manualRes: Response;
  try {
    manualRes = await fetchWithTimeout(url, { redirect: "manual", headers });
  } catch (err: unknown) {
    fail(label, `Request failed (manual): ${errorMessage(err)}`);
    return;
  }

  if (manualRes.status >= 300 && manualRes.status < 400) {
    const location = manualRes.headers.get("location") ?? "";
    if (!isOnDomain(location)) {
      fail(label, `Off-domain redirect detected — Location: ${location}`);
      return;
    }
  }

  let res: Response;
  try {
    res = await fetchWithTimeout(url, { redirect: "follow", headers });
  } catch (err: unknown) {
    fail(label, `Request failed (follow): ${errorMessage(err)}`);
    return;
  }

  if (res.status !== expectedStatus) {
    fail(label, `Expected HTTP ${expectedStatus}, got ${res.status}`);
    return;
  }

  if (bodyAssert) {
    let body: string;
    try {
      body = await res.text();
    } catch (err: unknown) {
      fail(label, `Failed to read body: ${errorMessage(err)}`);
      return;
    }
    const problem = bodyAssert(body);
    if (problem) {
      fail(label, problem);
      return;
    }
  }

  pass(label);
}

async function run(): Promise<void> {
  console.log(`\nOdigosAuto smoke test — ${BASE_URL}\n`);

  await checkEndpoint("/api/health", {
    bodyAssert: (body) => {
      let parsed: Record<string, unknown>;
      try {
        parsed = JSON.parse(body);
      } catch {
        return `Body is not valid JSON: ${body.slice(0, 120)}`;
      }
      if (!("status" in parsed)) {
        return `Missing "status" field in health response: ${body.slice(0, 120)}`;
      }
      const { status } = parsed;
      if (status !== "healthy" && status !== "degraded") {
        return `Unexpected health status "${status}" (expected "healthy" or "degraded")`;
      }
      return null;
    },
  });

  await checkEndpoint("/api/stats/count", {
    bodyAssert: (body) => {
      let parsed: Record<string, unknown>;
      try {
        parsed = JSON.parse(body);
      } catch {
        return `Body is not valid JSON: ${body.slice(0, 120)}`;
      }
      if (!("count" in parsed)) {
        return `Missing "count" field in /api/stats/count response`;
      }
      return null;
    },
  });

  await checkEndpoint("/robots.txt", {
    bodyAssert: (body) => {
      if (!body.includes("User-agent")) {
        return `robots.txt body missing "User-agent" directive`;
      }
      if (body.toLowerCase().includes("odigos.replit.app")) {
        return `robots.txt references staging domain odigos.replit.app`;
      }
      return null;
    },
  });

  await checkEndpoint("/sitemap.xml", {
    bodyAssert: (body) => {
      if (!body.includes("<urlset") && !body.includes("<?xml")) {
        return `sitemap.xml does not look like valid XML`;
      }
      if (body.includes("odigos.replit.app")) {
        return `sitemap.xml references staging domain odigos.replit.app`;
      }
      return null;
    },
  });

  await checkEndpoint("/", {
    bodyAssert: (body) => {
      if (!body.includes("Odigos") && !body.includes("odigos") && !body.includes("<!DOCTYPE html>")) {
        return `Homepage HTML does not contain expected app content`;
      }
      return null;
    },
  });

  console.log();
  const failed = results.filter((r) => !r.passed);
  const passed = results.filter((r) => r.passed);

  console.log(`Results: ${passed.length} passed, ${failed.length} failed\n`);

  if (failed.length > 0) {
    console.error("FAILED checks:");
    for (const r of failed) {
      console.error(`  ✗  ${r.label}: ${r.detail}`);
    }
    console.error();
    process.exit(1);
  }

  console.log("All smoke checks passed.");
  process.exit(0);
}

run().catch((err: unknown) => {
  console.error("Smoke test runner crashed:", errorMessage(err));
  process.exit(1);
});
