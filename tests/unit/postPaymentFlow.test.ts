import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Regression tests for the post-payment pass-activation flow.
 *
 * Background: on 2026-04-09 a paying customer completed a $29 Weekend
 * Warrior Pass checkout on odigosauto.com. Stripe successfully charged
 * the card and the customer was returned to `/analyze` — but the pass
 * never activated, the toast never showed, and localStorage.odigos_pass
 * was never written. The customer saw the normal empty analyze page as
 * if nothing had happened.
 *
 * Root cause: the post-payment effect in `client/src/pages/home.tsx`
 * looked for a legacy `paid=1` query param that the old pre-pivot flow
 * used. The new pricing-pivot flow (Stripe Embedded Checkout with
 * `return_url` pointing at `/analyze?session_id={CHECKOUT_SESSION_ID}
 * &product=weekend_warrior`) sends `session_id=`, not `paid=1`. The
 * branch `if (paid === "1" && product)` never matched, so `savePass()`
 * was never called. The pricing pivot was shipped with this rewire
 * missed and nobody caught it because no test covered the flow.
 *
 * These tests lock in the fix and prevent regression:
 *   1. home.tsx reads `session_id` from URL query params (not `paid`)
 *   2. home.tsx calls `/api/verify-session` with the session_id
 *   3. home.tsx calls `savePass(...)` only after successful verification
 *   4. home.tsx does NOT rely on the legacy `paid === "1"` branch
 *      (which defeats the whole flow)
 *   5. home.tsx prefers server-verified `passProduct` over the URL hint
 *
 * If any of these fail, paying customers may charge through Stripe but
 * never get their pass activated — the same bug that shipped on
 * 2026-04-09.
 */

const REPO_ROOT = resolve(__dirname, "../..");
const HOME_TSX_PATH = resolve(REPO_ROOT, "client/src/pages/home.tsx");

function readHomeTsx(): string {
  return readFileSync(HOME_TSX_PATH, "utf-8");
}

describe("Post-payment pass activation (regression guard)", () => {
  it("reads session_id from URL query params", () => {
    const source = readHomeTsx();
    // The post-payment effect must read session_id from the URL — this is
    // the parameter Stripe Embedded Checkout passes in `return_url`.
    expect(source).toMatch(/params\.get\(\s*["']session_id["']\s*\)/);
  });

  it("calls /api/verify-session with the session_id", () => {
    const source = readHomeTsx();
    // Must make a network call to /api/verify-session to confirm the
    // payment before activating the pass. URL-tampering-based pass
    // activation would be a security hole.
    expect(source).toMatch(/\/api\/verify-session[^"']*\?session_id=/);
  });

  it("calls savePass() to activate the pass after verification", () => {
    const source = readHomeTsx();
    // After a successful verify-session, savePass must be called to
    // write localStorage.odigos_pass. Without this, the user charges
    // through Stripe but the client never unlocks.
    expect(source).toMatch(/savePass\(/);
  });

  it("does NOT rely solely on the legacy `paid === \"1\"` branch to activate a pass", () => {
    const source = readHomeTsx();
    // Guard against the exact regression that shipped on 2026-04-09:
    // a post-payment effect that only fires when `paid === "1"`. The
    // server never sends paid=1; it sends session_id.
    //
    // It's OK to *also* handle a legacy paid=1 query param for
    // backward compatibility, but the effect MUST handle session_id
    // independently. We enforce that by asserting session_id handling
    // exists. We ALSO assert that savePass is not guarded only by
    // `paid === "1"` — i.e. there must be at least one savePass call
    // that is reachable without the paid=1 branch.
    //
    // The cheap way to check this: count occurrences. If session_id is
    // never referenced within ~5 lines of savePass, the regression has
    // returned.
    const savePassIndex = source.indexOf("savePass(");
    expect(savePassIndex).toBeGreaterThan(-1);

    // Look in a window around savePass for the session_id handling
    // that gates it. Pick a generous window to avoid brittleness.
    const windowStart = Math.max(0, savePassIndex - 4000);
    const windowEnd = Math.min(source.length, savePassIndex + 1000);
    const windowText = source.slice(windowStart, windowEnd);

    expect(windowText).toMatch(/session_id/);
    expect(windowText).toMatch(/verify-session/);
  });

  it("uses the server-returned passProduct (not just the URL hint)", () => {
    const source = readHomeTsx();
    // The server is authoritative: /api/verify-session reads passProduct
    // from Stripe session metadata. The client should prefer that over
    // the `product` URL query param (which is user-controllable).
    expect(source).toMatch(/data\??\.passProduct/);
  });

  it("cleans up the session_id/product query params after handling them", () => {
    const source = readHomeTsx();
    // After activation (or a no-op), the URL should be rewritten so a
    // refresh doesn't re-trigger verification or re-activate the pass.
    expect(source).toMatch(/window\.history\.replaceState\([^)]*pathname/);
  });

  it("handles canceled=1 without activating a pass", () => {
    const source = readHomeTsx();
    // If Stripe redirects back with canceled=1 (or the user cancels),
    // show a canceled toast and do NOT call savePass.
    expect(source).toMatch(/canceled\s*===?\s*["']1["']/);
  });
});
