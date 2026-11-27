/**
 * Educational copy must not present unverified fee figures as settled fact,
 * and must not claim Odigos prices a car or applies an unverified cap.
 */
import { readFileSync, readdirSync, statSync } from "fs";
import { resolve } from "path";
import { describe, expect, it } from "vitest";
import { STATE_FEES } from "../../client/src/data/stateFees.js";
import stateFeeData from "../../data/state_fees.json" with { type: "json" };
import {
  isDocFeeCapVerified,
  publicDocFeeClaim,
  type FeeStateRecord,
} from "../../shared/docFeePublicCopy.js";

const ROOT = resolve(import.meta.dirname, "../..");
const states = stateFeeData.states as unknown as Record<string, FeeStateRecord>;

function stringsIn(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(stringsIn);
  if (value && typeof value === "object") return Object.values(value).flatMap(stringsIn);
  return [];
}

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = resolve(dir, name);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (/\.(ts|tsx|md)$/.test(name)) out.push(full);
  }
  return out;
}

const PRODUCT_FILES = [
  ...walk(resolve(ROOT, "client/src/pages")),
  ...walk(resolve(ROOT, "client/src/components")),
  ...walk(resolve(ROOT, "client/src/data")),
  ...walk(resolve(ROOT, "client/src/lib")),
  resolve(ROOT, "shared/seoMetadata.ts"),
  resolve(ROOT, "shared/glossaryTermSeo.ts"),
].filter((file) => !file.endsWith(`${resolve(ROOT, "client/src/pages/home.tsx")}`));

const BANNED_PRODUCT_CLAIMS = [
  "overpriced fees, illegal charges",
  "market pricing data",
  "GREEN/YELLOW/RED verdict",
  "checks it against your state's cap instantly",
  "Check My Quote Against Market Data",
  "flags every fee over the $175",
  "against typical Texas pricing",
  "beats generic",
  "market data continuously",
  "flag every junk fee automatically",
  "highest markup",
  "You may be overpaying by $",
  "against current data",
];

describe("state guide fee claims", () => {
  it("covers every state in the fee file", () => {
    const abbreviations = new Set(Object.values(STATE_FEES).map((state) => state.abbreviation));
    expect(abbreviations.size).toBe(51);
    for (const code of Object.keys(states)) {
      expect(abbreviations.has(code), code).toBe(true);
    }
  });

  it("does not present an unverified range or cap as settled fact", () => {
    for (const guide of Object.values(STATE_FEES)) {
      const record = states[guide.abbreviation];
      const claim = publicDocFeeClaim(record);
      const text = stringsIn(guide).join("\n");
      const rangeUnverified = (record.unverified_fields ?? []).includes("docFeeTypicalRange");

      if (rangeUnverified) {
        expect(guide.docFeeRange, guide.abbreviation).toContain("not verified");
        expect(text, guide.abbreviation).not.toMatch(/typically charge \$/i);
        expect(text, guide.abbreviation).not.toMatch(/dealers typically charge/i);
      }

      if (!isDocFeeCapVerified(record)) {
        expect(text, guide.abbreviation).not.toMatch(/cannot legally/i);
        expect(text, guide.abbreviation).not.toMatch(/above the legal limit/i);
        expect(text, guide.abbreviation).not.toMatch(/not permitted by/i);
        expect(text, guide.abbreviation).not.toMatch(/out of compliance/i);
        expect(guide.hasCap, guide.abbreviation).toBe(false);
      } else {
        expect(guide.hasCap, guide.abbreviation).toBe(true);
        expect(guide.capNote.length, guide.abbreviation).toBeGreaterThan(40);
      }

      if (claim.posture === "unverified" || claim.posture === "unverified_stored_cap") {
        expect(guide.capNote, guide.abbreviation).toMatch(/not verified|not a legal finding|needs a source/);
      }
    }
  });

  it("states California's $70 and $85 partner split", () => {
    const guide = STATE_FEES.california;
    const text = stringsIn(guide).join("\n");
    expect(text).toContain("$70");
    expect(text).toContain("$85");
    expect(text.toLowerCase()).toContain("partner");
    expect(text).not.toMatch(/California caps dealer doc fees at \$85(?! for)/);
    expect(guide.pageTitle).toMatch(/\$70 or \$85/);
    expect(guide.h1).toMatch(/\$70 or \$85/);
  });

  it("does not call New York's stored $175 figure a legal cap", () => {
    const guide = STATE_FEES["new-york"];
    const text = stringsIn(guide).join("\n");
    expect(guide.hasCap).toBe(false);
    expect(text).toMatch(/not verified/);
    expect(text).not.toMatch(/flags every fee over the \$175/);
    expect(text).not.toMatch(/cannot legally/);
    expect(text).not.toMatch(/Maximum Allowed by Law/);
  });

  it("mentions Oregon's integrator split instead of a single $250 ceiling", () => {
    const text = stringsIn(STATE_FEES.oregon).join("\n");
    expect(text).toContain("$250");
    expect(text).toContain("$200");
    expect(text.toLowerCase()).toContain("integrator");
  });
});

describe("product claims in educational copy", () => {
  it("does not say Odigos prices cars, beats generic AI, or enforces unverified caps", () => {
    const hits: string[] = [];
    for (const file of PRODUCT_FILES) {
      const text = readFileSync(file, "utf8");
      for (const phrase of BANNED_PRODUCT_CLAIMS) {
        if (text.includes(phrase)) hits.push(`${file.replace(ROOT + "/", "")}: ${phrase}`);
      }
    }
    expect(hits).toEqual([]);
  });

  it("keeps the comparison tables on the verified-cap language", () => {
    const byState = readFileSync(resolve(ROOT, "client/src/pages/dealer-doc-fee-by-state.tsx"), "utf8");
    const feesByState = readFileSync(resolve(ROOT, "client/src/pages/car-dealer-fees-by-state.tsx"), "utf8");
    expect(byState).toContain("publicDocFeeClaim");
    expect(feesByState).toContain("publicDocFeeClaim");
    expect(byState).not.toContain("Capped at $");
    expect(byState).not.toContain("Check My Quote Against Market Data");
    expect(feesByState).not.toContain("(no cap)");
  });
});
