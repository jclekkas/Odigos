import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";
import { buildCanonical } from "../../client/src/lib/seo";
import { INDEXABLE_ROUTES, EXCLUDED_ROUTES } from "../../client/src/lib/indexable-routes";

const ROOT = resolve(import.meta.dirname, "../..");

// ─── buildCanonical ───────────────────────────────────────────────────────────

describe("buildCanonical", () => {
  it("produces https://odigosauto.com/ for root path", () => {
    expect(buildCanonical("/")).toBe("https://odigosauto.com/");
  });

  it("produces correct canonical for a known page", () => {
    expect(buildCanonical("/car-dealer-fees-ohio")).toBe("https://odigosauto.com/car-dealer-fees-ohio");
  });

  it("strips trailing slash from non-root paths", () => {
    expect(buildCanonical("/dealer-doc-fee/")).toBe("https://odigosauto.com/dealer-doc-fee");
  });

  it("never contains odigos.replit.app", () => {
    expect(buildCanonical("/any-page")).not.toContain("odigos.replit.app");
  });

  it("always starts with https://odigosauto.com", () => {
    const url = buildCanonical("/how-much-should-you-pay-for-a-car");
    expect(url.startsWith("https://odigosauto.com")).toBe(true);
  });
});

// ─── sitemap.xml ──────────────────────────────────────────────────────────────

function getSitemapLocs(): string[] {
  const content = readFileSync(resolve(ROOT, "sitemap.xml"), "utf-8");
  const matches = [...content.matchAll(/<loc>(.*?)<\/loc>/g)];
  return matches.map((m) => m[1]);
}

describe("sitemap.xml content", () => {
  it("contains no odigos.replit.app URLs", () => {
    const locs = getSitemapLocs();
    for (const loc of locs) {
      expect(loc).not.toContain("odigos.replit.app");
    }
  });

  it("contains all indexable routes from the registry", () => {
    const locs = getSitemapLocs();
    const sitemapPaths = locs.map((loc) => loc.replace("https://odigosauto.com", "") || "/");
    for (const route of INDEXABLE_ROUTES) {
      const normalized = route === "/" ? "/" : route.replace(/\/$/, "");
      expect(sitemapPaths).toContain(normalized);
    }
  });

  it("does not contain excluded routes", () => {
    const locs = getSitemapLocs();
    const sitemapPaths = locs.map((loc) => loc.replace("https://odigosauto.com", "") || "/");
    for (const route of EXCLUDED_ROUTES) {
      expect(sitemapPaths).not.toContain(route);
    }
  });

  it("includes /calculate-out-the-door-price", () => {
    const locs = getSitemapLocs();
    expect(locs).toContain("https://odigosauto.com/calculate-out-the-door-price");
  });

  it("includes /why-dealers-wont-give-out-the-door-price", () => {
    const locs = getSitemapLocs();
    expect(locs).toContain("https://odigosauto.com/why-dealers-wont-give-out-the-door-price");
  });

  it("does not contain /admin routes", () => {
    const locs = getSitemapLocs();
    for (const loc of locs) {
      expect(loc).not.toContain("/admin");
    }
  });

  it("does not contain /guides redirect route", () => {
    const locs = getSitemapLocs();
    const guidesUrls = locs.filter((l) => l.endsWith("/guides"));
    expect(guidesUrls.length).toBe(0);
  });

  it("all locs use odigosauto.com domain", () => {
    const locs = getSitemapLocs();
    for (const loc of locs) {
      expect(loc.startsWith("https://odigosauto.com")).toBe(true);
    }
  });
});

// ─── robots.txt ───────────────────────────────────────────────────────────────

describe("robots.txt", () => {
  it("does not contain odigos.replit.app in sitemap reference (server-side check)", () => {
    const serverRoute = readFileSync(resolve(ROOT, "server/routes/reference.ts"), "utf-8");
    expect(serverRoute).not.toContain("odigos.replit.app");
    expect(serverRoute).toContain("CANONICAL_ORIGIN");
    const siteConfig = readFileSync(resolve(ROOT, "shared/siteConfig.ts"), "utf-8");
    expect(siteConfig).toContain("odigosauto.com");
  });
});

// ─── indexable-routes registry ────────────────────────────────────────────────

describe("indexable-routes registry", () => {
  it("includes known affected pages", () => {
    const affectedPages = [
      "/car-dealer-fees-ohio",
      "/car-dealer-fees-florida",
      "/car-dealer-fees-new-york",
      "/dealer-doc-fee",
      "/how-much-should-you-pay-for-a-car",
      "/calculate-out-the-door-price",
    ];
    for (const page of affectedPages) {
      expect(INDEXABLE_ROUTES).toContain(page);
    }
  });

  it("does not contain excluded routes", () => {
    for (const route of EXCLUDED_ROUTES) {
      expect(INDEXABLE_ROUTES).not.toContain(route);
    }
  });

  it("has no duplicates", () => {
    const unique = new Set(INDEXABLE_ROUTES);
    expect(unique.size).toBe(INDEXABLE_ROUTES.length);
  });
});

// ─── index.html canonical policy ─────────────────────────────────────────────
// The SPA shell must NOT contain URL-specific tags (canonical, og:url, twitter:url)
// because it serves as the fallback for all routes. If present, Google would see
// every page's canonical pointing to the homepage, blocking indexing.

describe("index.html canonical policy", () => {
  const html = readFileSync(resolve(ROOT, "client/index.html"), "utf-8");

  it("does not contain a hardcoded canonical link tag", () => {
    expect(html).not.toMatch(/<link[^>]*rel="canonical"/);
  });

  it("does not contain a hardcoded og:url meta tag", () => {
    expect(html).not.toMatch(/<meta[^>]*property="og:url"/);
  });

  it("does not contain a hardcoded twitter:url meta tag", () => {
    expect(html).not.toMatch(/<meta[^>]*name="twitter:url"/);
  });
});

// ─── JSON-LD uses buildCanonical ──────────────────────────────────────────────

describe("jsonld.ts domain usage", () => {
  it("does not contain hardcoded odigos.replit.app", () => {
    const content = readFileSync(resolve(ROOT, "client/src/lib/jsonld.ts"), "utf-8");
    expect(content).not.toContain("odigos.replit.app");
  });

  it("uses buildCanonical for article URL fields", () => {
    const content = readFileSync(resolve(ROOT, "client/src/lib/jsonld.ts"), "utf-8");
    expect(content).toContain("buildCanonical");
  });
});

// ─── faqPageSchema URL field ─────────────────────────────────────────────────

describe("faqPageSchema URL field", () => {
  it("includes url and mainEntityOfPage when url is provided", async () => {
    const { faqPageSchema } = await import("../../client/src/lib/jsonld");
    const schema = faqPageSchema({
      questions: [{ question: "Q?", answer: "A." }],
      url: "https://odigosauto.com/car-dealer-fees-florida",
    });
    expect(schema.url).toBe("https://odigosauto.com/car-dealer-fees-florida");
    expect(schema.mainEntityOfPage).toEqual({
      "@type": "WebPage",
      "@id": "https://odigosauto.com/car-dealer-fees-florida",
    });
  });

  it("omits url and mainEntityOfPage when url is not provided", async () => {
    const { faqPageSchema } = await import("../../client/src/lib/jsonld");
    const schema = faqPageSchema({
      questions: [{ question: "Q?", answer: "A." }],
    });
    expect(schema.url).toBeUndefined();
    expect(schema.mainEntityOfPage).toBeUndefined();
  });

  it("url does not contain odigos.replit.app", async () => {
    const { faqPageSchema } = await import("../../client/src/lib/jsonld");
    const { buildCanonical } = await import("../../client/src/lib/seo");
    const schema = faqPageSchema({
      questions: [{ question: "Q?", answer: "A." }],
      url: buildCanonical("/car-dealer-fees-illinois"),
    });
    expect(schema.url).not.toContain("odigos.replit.app");
    expect(schema.url).toBe("https://odigosauto.com/car-dealer-fees-illinois");
  });
});

// ─── seo.ts canonical domain ──────────────────────────────────────────────────

describe("seo.ts canonical domain", () => {
  it("does not contain odigos.replit.app", () => {
    const content = readFileSync(resolve(ROOT, "client/src/lib/seo.ts"), "utf-8");
    expect(content).not.toContain("odigos.replit.app");
  });

  it("uses odigosauto.com as canonical origin", () => {
    const content = readFileSync(resolve(ROOT, "client/src/lib/seo.ts"), "utf-8");
    expect(content).toContain("CANONICAL_ORIGIN");
    const siteConfig = readFileSync(resolve(ROOT, "shared/siteConfig.ts"), "utf-8");
    expect(siteConfig).toContain("https://odigosauto.com");
  });

  it("cleanup function does not remove canonical tag", () => {
    const content = readFileSync(resolve(ROOT, "client/src/lib/seo.ts"), "utf-8");
    const returnBlock = content.slice(content.indexOf("return () => {"));
    expect(returnBlock).not.toContain("canonical.remove()");
  });
});

// ─── ESM import extensions ──────────────────────────────────────────────────
// Node.js ESM requires explicit .js extensions on relative imports. Vercel's
// @vercel/node runtime relies on this — a missing extension crashes the
// serverless function at cold start even though local esbuild bundling hides
// the problem. This test catches that class of bug before it reaches prod.

import { readdirSync, statSync } from "fs";
import { join } from "path";

function collectTsFiles(dir: string): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== "node_modules") {
      results.push(...collectTsFiles(full));
    } else if (entry.isFile() && entry.name.endsWith(".ts") && !entry.name.endsWith(".test.ts")) {
      results.push(full);
    }
  }
  return results;
}

describe("ESM import extensions", () => {
  // Matches actual import/export statements with relative paths missing .js.
  // Skips: type-only imports (erased at compile time), .json imports, comments.
  const BAD_IMPORT = /^\s*(?:import|export)\s(?!type\b).*from\s+["'](\.\.?\/[^"']*?)(?<!\.js|\.json)["']/;

  const dirs = [resolve(ROOT, "server"), resolve(ROOT, "shared")];
  const files = dirs.flatMap((d) => (statSync(d).isDirectory() ? collectTsFiles(d) : []));

  it("all server/shared relative imports use .js extensions", () => {
    const violations: string[] = [];
    for (const file of files) {
      const lines = readFileSync(file, "utf-8").split("\n");
      for (let i = 0; i < lines.length; i++) {
        if (BAD_IMPORT.test(lines[i])) {
          const rel = file.replace(ROOT + "/", "");
          violations.push(`${rel}:${i + 1}: ${lines[i].trim()}`);
        }
      }
    }
    expect(violations, `Relative imports missing .js extension:\n${violations.join("\n")}`).toHaveLength(0);
  });
});
