/**
 * Production smoke test for odigosauto.com.
 *
 * Usage:
 *   npx tsx scripts/smoke-test.ts                  # tests https://odigosauto.com
 *   BASE_URL=http://localhost:5000 npx tsx scripts/smoke-test.ts  # tests local dev server
 *
 * Exit codes: 0 = all assertions passed, 1 = one or more failures.
 */

const BASE_URL = (process.env.BASE_URL ?? "https://odigosauto.com").replace(/\/$/, "");
const TIMEOUT_MS = 15_000;

interface CheckResult {
  label: string;
  passed: boolean;
  detail?: string;
}

const results: CheckResult[] = [];

function pass(label: string): void {
  results.push({ label, passed: true });
  console.log(`  ✓  ${label}`);
}

function fail(label: string, detail: string): void {
  results.push({ label, passed: false, detail });
  console.error(`  ✗  ${label}`);
  console.error(`       ${detail}`);
}

async function fetchWithTimeout(url: string, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Fetch a URL without following redirects and assert:
 * - status === expectedStatus
 * - if a Location header is present it stays on-domain (or is relative)
 * - optionally run a body assertion
 */
async function checkEndpoint(
  path: string,
  opts: {
    expectedStatus?: number;
    bodyAssert?: (body: string) => string | null;
    followRedirects?: boolean;
  } = {}
): Promise<void> {
  const { expectedStatus = 200, bodyAssert, followRedirects = false } = opts;
  const url = `${BASE_URL}${path}`;
  const label = `${path} → ${expectedStatus}`;

  let res: Response;
  try {
    res = await fetchWithTimeout(url, {
      redirect: followRedirects ? "follow" : "manual",
      headers: { "User-Agent": "OdigosAutoSmokeTest/1.0" },
    });
  } catch (err: any) {
    fail(label, `Request failed: ${err?.message ?? err}`);
    return;
  }

  if (res.status !== expectedStatus) {
    fail(label, `Expected HTTP ${expectedStatus}, got ${res.status}`);
    return;
  }

  const location = res.headers.get("location");
  if (location) {
    const isRelative = location.startsWith("/");
    const isOnDomain =
      location.startsWith(BASE_URL) ||
      location.startsWith("https://odigosauto.com") ||
      location.startsWith("http://localhost");
    if (!isRelative && !isOnDomain) {
      fail(label, `Redirect points off-domain: Location: ${location}`);
      return;
    }
  }

  if (bodyAssert) {
    let body: string;
    try {
      body = await res.text();
    } catch (err: any) {
      fail(label, `Failed to read body: ${err?.message ?? err}`);
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
    followRedirects: true,
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
    followRedirects: true,
    bodyAssert: (body) => {
      let parsed: Record<string, unknown>;
      try {
        parsed = JSON.parse(body);
      } catch {
        return `Body is not valid JSON: ${body.slice(0, 120)}`;
      }
      if (!("count" in parsed)) {
        return `Missing "count" field in stats/count response`;
      }
      return null;
    },
  });

  await checkEndpoint("/robots.txt", {
    followRedirects: true,
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
    followRedirects: true,
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
    followRedirects: true,
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

run().catch((err) => {
  console.error("Smoke test runner crashed:", err);
  process.exit(1);
});
