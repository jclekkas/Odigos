import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Regression tests for the Stripe client SDK integration.
 *
 * Background: on 2026-04-09 the prod deploy of the pricing pivot failed
 * silently because `@stripe/stripe-js` and `@stripe/react-stripe-js` were
 * referenced in `client/src/pages/home.tsx` via a
 * `new Function("mod", "return import(mod)")` dynamic import trick that
 * bypassed Vite's static analysis. The packages were never added to
 * `package.json`, Vite couldn't bundle them (the `new Function` pattern
 * defeats Rollup's tree-shaking), and at runtime the browser tried to
 * resolve `@stripe/stripe-js` as a bare specifier, which fails in
 * production builds. Stripe checkout failed with a generic "Checkout
 * Error" toast and no console output because the failure was caught by
 * the try/catch in `handleUnlockPass` and the real error was hidden.
 *
 * These tests lock in the fix and prevent regression:
 *   1. Both @stripe packages are in package.json dependencies
 *   2. Both packages are actually installable (importable at test time)
 *   3. home.tsx uses STATIC imports, not runtime `new Function` tricks
 *
 * If any of these fail, the Stripe Embedded Checkout flow is broken.
 */

const REPO_ROOT = resolve(__dirname, "../..");
const HOME_TSX_PATH = resolve(REPO_ROOT, "client/src/pages/home.tsx");
const PACKAGE_JSON_PATH = resolve(REPO_ROOT, "package.json");

describe("Stripe client SDK integration (regression guard)", () => {
  it("@stripe/stripe-js is in package.json dependencies", () => {
    const pkg = JSON.parse(readFileSync(PACKAGE_JSON_PATH, "utf-8"));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    expect(deps["@stripe/stripe-js"]).toBeDefined();
    expect(typeof deps["@stripe/stripe-js"]).toBe("string");
  });

  it("@stripe/react-stripe-js is in package.json dependencies", () => {
    const pkg = JSON.parse(readFileSync(PACKAGE_JSON_PATH, "utf-8"));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    expect(deps["@stripe/react-stripe-js"]).toBeDefined();
    expect(typeof deps["@stripe/react-stripe-js"]).toBe("string");
  });

  it("@stripe/stripe-js is installed and exports loadStripe", async () => {
    const mod = await import("@stripe/stripe-js");
    expect(typeof mod.loadStripe).toBe("function");
  });

  it("@stripe/react-stripe-js is installed and exports EmbeddedCheckoutProvider + EmbeddedCheckout", async () => {
    const mod = await import("@stripe/react-stripe-js");
    expect(mod.EmbeddedCheckoutProvider).toBeDefined();
    expect(mod.EmbeddedCheckout).toBeDefined();
  });

  it("home.tsx imports loadStripe STATICALLY from @stripe/stripe-js", () => {
    const source = readFileSync(HOME_TSX_PATH, "utf-8");
    // Static import with loadStripe in the named imports
    expect(source).toMatch(
      /import\s*\{[^}]*\bloadStripe\b[^}]*\}\s*from\s*["']@stripe\/stripe-js["']/,
    );
  });

  it("home.tsx imports EmbeddedCheckoutProvider + EmbeddedCheckout STATICALLY from @stripe/react-stripe-js", () => {
    const source = readFileSync(HOME_TSX_PATH, "utf-8");
    expect(source).toMatch(
      /import\s*\{[^}]*\bEmbeddedCheckoutProvider\b[^}]*\}\s*from\s*["']@stripe\/react-stripe-js["']/,
    );
    expect(source).toMatch(
      /import\s*\{[^}]*\bEmbeddedCheckout\b[^}]*\}\s*from\s*["']@stripe\/react-stripe-js["']/,
    );
  });

  it("home.tsx does NOT use `new Function(...import(mod)...)` pattern to load Stripe", () => {
    const source = readFileSync(HOME_TSX_PATH, "utf-8");
    // This pattern bypasses Vite's static analysis and breaks production builds.
    // If any code uses it, Vite won't bundle the target module and the
    // browser will fail to resolve the bare specifier at runtime.
    expect(source).not.toMatch(/new\s+Function\([^)]*import\(mod\)/);
    // Also guard against the pattern being wrapped or renamed
    expect(source).not.toMatch(/new\s+Function\([^)]*["']return\s+import/);
  });

  it("home.tsx does NOT import Stripe via STRIPE_JS_MODULE string constant trick", () => {
    const source = readFileSync(HOME_TSX_PATH, "utf-8");
    // Guard against the old pattern that stored module names as string
    // constants (STRIPE_JS_MODULE, STRIPE_REACT_MODULE) and imported them
    // dynamically to bypass TypeScript module resolution at compile time.
    expect(source).not.toMatch(/STRIPE_JS_MODULE/);
    expect(source).not.toMatch(/STRIPE_REACT_MODULE/);
  });

  it("VITE_STRIPE_PUBLISHABLE_KEY is referenced via import.meta.env (build-time inlining)", () => {
    const source = readFileSync(HOME_TSX_PATH, "utf-8");
    expect(source).toMatch(/import\.meta\.env\.VITE_STRIPE_PUBLISHABLE_KEY/);
  });
});
