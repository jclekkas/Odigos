import { describe, it, expect } from "vitest";
import { glossaryTerms } from "../../client/src/data/glossary-terms.js";

describe("glossaryTerms data integrity", () => {
  it("has at least 10 terms", () => {
    expect(glossaryTerms.length).toBeGreaterThanOrEqual(10);
  });

  it("all slugs are unique", () => {
    const slugs = glossaryTerms.map((t) => t.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("all slugs are kebab-case (no spaces, no uppercase)", () => {
    for (const term of glossaryTerms) {
      expect(term.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });

  it("all terms have required fields", () => {
    for (const term of glossaryTerms) {
      expect(term.term.length).toBeGreaterThan(0);
      expect(term.shortDefinition.length).toBeGreaterThan(10);
      expect(term.fullDefinition.length).toBeGreaterThan(50);
      expect(term.seoTitle.length).toBeGreaterThan(0);
      expect(term.seoDescription.length).toBeGreaterThan(0);
      expect(Array.isArray(term.relatedPages)).toBe(true);
    }
  });

  it("seoTitle ends with | Odigos", () => {
    for (const term of glossaryTerms) {
      expect(term.seoTitle).toMatch(/\| Odigos$/);
    }
  });

  it("relatedPages have valid path format", () => {
    for (const term of glossaryTerms) {
      for (const page of term.relatedPages) {
        expect(page.path).toMatch(/^\//);
        expect(page.label.length).toBeGreaterThan(0);
      }
    }
  });

  it("includes core competitive terms (junk-fee, money-factor, residual-value)", () => {
    const slugs = new Set(glossaryTerms.map((t) => t.slug));
    expect(slugs.has("junk-fee")).toBe(true);
    expect(slugs.has("money-factor")).toBe(true);
    expect(slugs.has("residual-value")).toBe(true);
  });
});
