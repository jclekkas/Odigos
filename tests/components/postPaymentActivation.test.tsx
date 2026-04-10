// @vitest-environment jsdom
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, waitFor, cleanup } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Router } from "wouter";
import { HelmetProvider } from "react-helmet-async";
import React from "react";
import Home from "../../client/src/pages/home";
import { getQueryFn } from "../../client/src/lib/queryClient";

vi.stubEnv("NODE_ENV", "test");

/**
 * Post-payment activation tests for the client-side flow.
 *
 * When Stripe Embedded Checkout redirects back to /analyze?session_id=X&product=Y,
 * the useEffect in home.tsx must:
 *   1. Call /api/verify-session?session_id=X
 *   2. On { paid: true }, call savePass(passProduct) to write localStorage
 *   3. Clean the URL via history.replaceState
 */

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        queryFn: getQueryFn({ on401: "returnNull" }),
        retry: false,
        staleTime: 0,
      },
      mutations: { retry: false },
    },
  });
}

const PASS_STORAGE_KEY = "odigos_pass";

function setupFetchMock(verifyResponse: object) {
  vi.stubGlobal(
    "fetch",
    vi.fn((url: string) => {
      if (url.includes("verify-session")) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(verifyResponse),
          text: () => Promise.resolve(JSON.stringify(verifyResponse)),
        });
      }
      if (url.includes("stripe-status")) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ configured: false }),
          text: () => Promise.resolve(JSON.stringify({ configured: false })),
        });
      }
      if (url.includes("stats")) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ count: 0, type: "none" }),
          text: () => Promise.resolve(JSON.stringify({ count: 0, type: "none" })),
        });
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
        text: () => Promise.resolve("{}"),
      });
    }),
  );
}

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem("odigos_upload_consent", "accepted");
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  localStorage.clear();
});

function setUrl(search: string) {
  // In jsdom, the proper way to change the URL is to replace window.location
  // entirely via a delete + re-assign or through history.replaceState.
  // history.replaceState doesn't change the search string accessible to
  // URLSearchParams(window.location.search). Instead, use delete + assign.
  const url = `http://localhost:5000/analyze${search}`;
  // @ts-expect-error jsdom allows deleting location for reassignment
  delete (window as { location?: Location }).location;
  window.location = new URL(url) as unknown as Location;
}

function renderHomeAtUrl(search: string) {
  setUrl(search);
  return render(
    <HelmetProvider>
      <QueryClientProvider client={makeQueryClient()}>
        <Router>
          <Home />
        </Router>
      </QueryClientProvider>
    </HelmetProvider>,
  );
}

describe("Post-payment pass activation (client-side)", () => {
  it("weekend_warrior: verify-session → savePass → localStorage.odigos_pass", async () => {
    setupFetchMock({
      paid: true,
      tier: "29",
      passProduct: "weekend_warrior",
      durationHours: 72,
    });

    renderHomeAtUrl("?session_id=cs_test_ww&product=weekend_warrior");

    await waitFor(
      () => {
        const raw = localStorage.getItem(PASS_STORAGE_KEY);
        expect(raw).not.toBeNull();
      },
      { timeout: 5000 },
    );

    const pass = JSON.parse(localStorage.getItem(PASS_STORAGE_KEY)!);
    expect(pass.productKey).toBe("weekend_warrior");
    expect(pass.source).toBe("purchase");
    const durationMs = pass.expiresAt - pass.purchasedAt;
    expect(durationMs).toBe(72 * 60 * 60 * 1000);

    // verify-session was called with the session_id
    const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>;
    const verifyCall = fetchMock.mock.calls.find(
      ([url]: [string]) => url.includes("verify-session"),
    );
    expect(verifyCall).toBeTruthy();
    expect(verifyCall![0]).toContain("session_id=cs_test_ww");
  });

  it("car_buyers_pass: verify-session → savePass → localStorage.odigos_pass", async () => {
    setupFetchMock({
      paid: true,
      tier: "49",
      passProduct: "car_buyers_pass",
      durationHours: 336,
    });

    renderHomeAtUrl("?session_id=cs_test_cbp&product=car_buyers_pass");

    await waitFor(
      () => {
        const raw = localStorage.getItem(PASS_STORAGE_KEY);
        expect(raw).not.toBeNull();
      },
      { timeout: 5000 },
    );

    const pass = JSON.parse(localStorage.getItem(PASS_STORAGE_KEY)!);
    expect(pass.productKey).toBe("car_buyers_pass");
    const durationMs = pass.expiresAt - pass.purchasedAt;
    expect(durationMs).toBe(14 * 24 * 60 * 60 * 1000);
  });

  it("does NOT activate pass when verify-session returns paid: false", async () => {
    setupFetchMock({ paid: false, tier: null, passProduct: null, durationHours: null });

    renderHomeAtUrl("?session_id=cs_test_unpaid&product=weekend_warrior");

    await new Promise((r) => setTimeout(r, 500));

    expect(localStorage.getItem(PASS_STORAGE_KEY)).toBeNull();
  });

  it("does NOT activate pass on canceled=1 (Stripe cancel)", async () => {
    setupFetchMock({ paid: true, tier: "29", passProduct: "weekend_warrior", durationHours: 72 });

    renderHomeAtUrl("?canceled=1");

    await new Promise((r) => setTimeout(r, 500));

    expect(localStorage.getItem(PASS_STORAGE_KEY)).toBeNull();
    // verify-session should NOT be called when canceled=1
    const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>;
    const verifyCall = fetchMock.mock.calls.find(
      ([url]: [string]) => url.includes("verify-session"),
    );
    expect(verifyCall).toBeUndefined();
  });
});
