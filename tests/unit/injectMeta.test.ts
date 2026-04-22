import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";
import { injectSeoMeta } from "../../server/injectMeta.js";
import { getSeoMeta } from "../../shared/seoMetadata.js";

const SHELL_HTML = readFileSync(
  resolve(import.meta.dirname, "../../client/index.html"),
  "utf-8",
);

// These are the 5 glossary URLs flagged by Google Search Console as
// "Duplicate without user-selected canonical". The server must inject a
// self-referencing canonical for each, or Google cannot index them.
const AFFECTED_GLOSSARY_PATHS = [
  "/glossary/reconditioning-fee",
  "/glossary/residual-value",
  "/glossary/doc-fee",
  "/glossary/vin-etching",
  "/glossary/trade-in-tax-credit",
];

describe("getSeoMeta for affected glossary URLs", () => {
  for (const path of AFFECTED_GLOSSARY_PATHS) {
    it(`returns canonical metadata for ${path}`, () => {
      const meta = getSeoMeta(path);
      expect(meta).not.toBeNull();
      expect(meta!.canonical).toBe(`https://odigosauto.com${path}`);
      expect(meta!.title.length).toBeGreaterThan(10);
      expect(meta!.description.length).toBeGreaterThan(10);
    });
  }
});

describe("injectSeoMeta for affected glossary URLs", () => {
  for (const path of AFFECTED_GLOSSARY_PATHS) {
    it(`injects self-referencing canonical for ${path}`, () => {
      const out = injectSeoMeta(SHELL_HTML, path);
      const expected = `https://odigosauto.com${path}`;
      expect(out).toContain(
        `<link rel="canonical" href="${expected}" />`,
      );
    });

    it(`injects matching og:url for ${path}`, () => {
      const out = injectSeoMeta(SHELL_HTML, path);
      const expected = `https://odigosauto.com${path}`;
      expect(out).toContain(
        `<meta property="og:url" content="${expected}" />`,
      );
    });

    it(`produces exactly one canonical tag for ${path}`, () => {
      const out = injectSeoMeta(SHELL_HTML, path);
      const matches = out.match(/<link[^>]*rel="canonical"/g) || [];
      expect(matches).toHaveLength(1);
    });

    it(`replaces the generic shell title for ${path}`, () => {
      const out = injectSeoMeta(SHELL_HTML, path);
      expect(out).not.toContain(
        "Free Car Deal Analyzer — Check Hidden Fees Before You Sign | Odigos",
      );
    });
  }
});

describe("injectSeoMeta canonical regex robustness", () => {
  it("replaces an existing canonical even when other link attributes are present", () => {
    const input = `<html><head><link rel="canonical" href="https://old.example/old" /></head></html>`;
    const out = injectSeoMeta(input, "/glossary/doc-fee");
    expect(out).toContain(
      `<link rel="canonical" href="https://odigosauto.com/glossary/doc-fee" />`,
    );
    expect(out).not.toContain("https://old.example/old");
  });

  it("does not produce duplicate canonicals when shell already has one", () => {
    const input = `<html><head><link rel="canonical" href="https://odigosauto.com/" /></head></html>`;
    const out = injectSeoMeta(input, "/glossary/doc-fee");
    const matches = out.match(/<link[^>]*rel="canonical"/g) || [];
    expect(matches).toHaveLength(1);
  });
});

// Routes without an entry in seoMetadata (admin, unknown paths, typos)
// must still emit a self-referencing canonical — otherwise Google is free
// to pick a different URL as canonical and collapse them into duplicates
// of the homepage.
describe("injectSeoMeta fallback canonical for routes with no seoMetadata", () => {
  const UNMAPPED_PATHS = ["/admin", "/admin/metrics", "/admin/seo"];

  for (const path of UNMAPPED_PATHS) {
    it(`injects self-referencing canonical for ${path}`, () => {
      const out = injectSeoMeta(SHELL_HTML, path);
      const expected = `https://odigosauto.com${path}`;
      expect(out).toContain(
        `<link rel="canonical" href="${expected}" />`,
      );
    });

    it(`injects matching og:url for ${path}`, () => {
      const out = injectSeoMeta(SHELL_HTML, path);
      const expected = `https://odigosauto.com${path}`;
      expect(out).toContain(
        `<meta property="og:url" content="${expected}" />`,
      );
    });

    it(`produces exactly one canonical tag for ${path}`, () => {
      const out = injectSeoMeta(SHELL_HTML, path);
      const matches = out.match(/<link[^>]*rel="canonical"/g) || [];
      expect(matches).toHaveLength(1);
    });
  }

  it("strips trailing slash when building the fallback canonical", () => {
    const out = injectSeoMeta(SHELL_HTML, "/admin/metrics/");
    expect(out).toContain(
      `<link rel="canonical" href="https://odigosauto.com/admin/metrics" />`,
    );
  });

  it("keeps the root path as /", () => {
    const bare = `<html><head><title>x</title></head></html>`;
    const out = injectSeoMeta(bare, "/unknown-route-not-in-map");
    expect(out).toContain(
      `<link rel="canonical" href="https://odigosauto.com/unknown-route-not-in-map" />`,
    );
  });
});
