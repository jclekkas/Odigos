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
    expect(serverRoute).toContain("odigosauto.com");
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

// ─── seo.ts canonical domain ──────────────────────────────────────────────────

describe("seo.ts canonical domain", () => {
  it("does not contain odigos.replit.app", () => {
    const content = readFileSync(resolve(ROOT, "client/src/lib/seo.ts"), "utf-8");
    expect(content).not.toContain("odigos.replit.app");
  });

  it("uses odigosauto.com as canonical origin", () => {
    const content = readFileSync(resolve(ROOT, "client/src/lib/seo.ts"), "utf-8");
    expect(content).toContain("https://odigosauto.com");
  });

  it("cleanup function does not remove canonical tag", () => {
    const content = readFileSync(resolve(ROOT, "client/src/lib/seo.ts"), "utf-8");
    const returnBlock = content.slice(content.indexOf("return () => {"));
    expect(returnBlock).not.toContain("canonical.remove()");
  });
});
