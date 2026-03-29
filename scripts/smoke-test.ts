/**
 * Production smoke test for odigosauto.com.
 *
 * Redirect detection strategy:
 *   Each endpoint is first fetched with redirect:"manual". The script iterates
 *   through the full redirect chain (up to MAX_HOPS hops), checking that every
 *   Location header remains on-domain. Only after the chain is confirmed safe
 *   is a follow-redirect request made for HTTP status and body assertions.
 *
 * Health endpoint contract (server/routes/reference.ts):
 *   GET /api/health → 200  { status: "ok" | "degraded", uptimeSeconds, memory }
 *   "ok"       = rss memory < 1536 MB (normal operation) — smoke test requires this value
 *   "degraded" = rss memory >= 1536 MB (memory pressure) — smoke test fails on this value
 *
 * Usage:
 *   npx tsx scripts/smoke-test.ts                  # tests https://odigosauto.com
 *   BASE_URL=http://localhost:5000 npx tsx scripts/smoke-test.ts
 *
 * Exit: 0 = all passed, 1 = one or more failures.
 */

const BASE_URL = (process.env.BASE_URL ?? "https://odigosauto.com").replace(/\/$/, "");
const TIMEOUT_MS = 15_000;
const MAX_HOPS = 5;

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

const ALLOWED_HOSTS: ReadonlySet<string> = (() => {
  const hosts = new Set(["odigosauto.com", "www.odigosauto.com"]);
  try {
    hosts.add(new URL(BASE_URL).hostname);
  } catch {
  }
  return hosts;
})();

function isOnDomain(rawLocation: string, currentUrl: string): boolean {
  try {
    const resolved = new URL(rawLocation, currentUrl);
    return ALLOWED_HOSTS.has(resolved.hostname);
  } catch {
    return false;
  }
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
 * Walk the full redirect chain for `startUrl` using redirect:"manual".
 * Returns null if every hop stays on-domain, or an error string if an
 * off-domain Location is detected or the hop limit is exceeded.
 */
async function validateRedirectChain(startUrl: string): Promise<string | null> {
  let currentUrl = startUrl;
  const headers = { "User-Agent": "OdigosAutoSmokeTest/1.0" };

  for (let hop = 0; hop < MAX_HOPS; hop++) {
    let res: Response;
    try {
      res = await fetchWithTimeout(currentUrl, { redirect: "manual", headers });
    } catch (err: unknown) {
      return `Request failed at hop ${hop + 1}: ${errorMessage(err)}`;
    }

    if (res.status < 300 || res.status >= 400) {
      return null;
    }

    const location = res.headers.get("location") ?? "";
    if (!isOnDomain(location, currentUrl)) {
      return `Off-domain redirect detected at hop ${hop + 1} — Location: ${location}`;
    }
    currentUrl = location.startsWith("/") ? `${BASE_URL}${location}` : location;
  }

  return `Redirect chain exceeded ${MAX_HOPS} hops — possible redirect loop`;
}

/**
 * Check one endpoint end-to-end:
 * 1. Walk the redirect chain with redirect:"manual"; fail on any off-domain hop.
 * 2. Fetch with redirect:"follow" and assert the expected HTTP status.
 * 3. Run optional body assertion on the final response text.
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

  const chainError = await validateRedirectChain(url);
  if (chainError !== null) {
    fail(label, chainError);
    return;
  }

  let res: Response;
  try {
    res = await fetchWithTimeout(url, { redirect: "follow", headers });
  } catch (err: unknown) {
    fail(label, `Request failed: ${errorMessage(err)}`);
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
      if (status !== "ok") {
        return `Unexpected health status "${status}" (expected "ok" — service may be degraded or unhealthy)`;
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
      if (!body.includes("Free Car Deal Analyzer")) {
        return `Homepage HTML missing expected app title "Free Car Deal Analyzer"`;
      }
      return null;
    },
  });

  await checkEndpoint("/analyze", {
    bodyAssert: (body) => {
      if (!body.toLowerCase().includes("analyze") && !body.toLowerCase().includes("quote")) {
        return `"/analyze" page body missing expected keyword "analyze" or "quote"`;
      }
      return null;
    },
  });

  await checkEndpoint("/about");

  await checkEndpoint("/how-odigos-works");

  await checkEndpoint("/car-dealer-fees-by-state");

  await checkEndpoint("/example-analysis");

  await checkEndpoint("/out-the-door-price-calculator");

  // POST /api/analyze — minimal payload; any non-5xx response is acceptable.
  {
    const label = "POST /api/analyze → not 5xx";
    const url = `${BASE_URL}/api/analyze`;
    try {
      const res = await fetchWithTimeout(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "OdigosAutoSmokeTest/1.0",
        },
        redirect: "follow",
        body: JSON.stringify({ dealerText: "Monthly payment $499. APR 5.9% for 60 months." }),
      });
      if (res.status >= 500) {
        fail(label, `Expected non-5xx, got HTTP ${res.status}`);
      } else {
        pass(label);
      }
    } catch (err: unknown) {
      fail(label, `Request failed: ${errorMessage(err)}`);
    }
  }

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
