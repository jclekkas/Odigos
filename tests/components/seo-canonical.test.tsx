// @vitest-environment jsdom
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";
import { HelmetProvider } from "react-helmet-async";
import DealerDocFee from "../../client/src/pages/dealer-doc-fee";
import HowMuchShouldYouPayForACar from "../../client/src/pages/how-much-should-you-pay-for-a-car";
import CalculateOutTheDoorPrice from "../../client/src/pages/calculate-out-the-door-price";
import CarDealerFeesState from "../../client/src/pages/car-dealer-fees-state";

vi.stubEnv("NODE_ENV", "test");

vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({
  matches: false,
  media: "",
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: 0 }, mutations: { retry: false } },
  });
}

function renderPage(Page: React.ComponentType) {
  return render(
    <HelmetProvider>
      <QueryClientProvider client={makeQueryClient()}>
        <Router>
          <Page />
        </Router>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

function renderPageAtPath(Page: React.ComponentType, path: string) {
  const { hook } = memoryLocation({ path, static: true });
  return render(
    <HelmetProvider>
      <QueryClientProvider client={makeQueryClient()}>
        <Router hook={hook}>
          <Page />
        </Router>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn(() =>
    Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({}), text: () => Promise.resolve("{}") })
  ));
  document.head.innerHTML = "";
});

afterEach(() => {
  document.head.innerHTML = "";
  vi.restoreAllMocks();
});

function getCanonicalLinks() {
  return Array.from(document.querySelectorAll('link[rel="canonical"]')) as HTMLLinkElement[];
}

function getOgUrl(): string | null {
  const el = document.querySelector('meta[property="og:url"]') as HTMLMetaElement | null;
  return el ? el.getAttribute("content") : null;
}

// ─── Architectural contract: SeoHead does NOT write a canonical tag ───────────

describe("SeoHead architectural contract", () => {
  it("SeoHead component does not contain a canonical link element", async () => {
    const { default: SeoHead } = await import("../../client/src/components/SeoHead");
    const result = render(
      <HelmetProvider>
        <Router>
          <SeoHead title="Test" description="Test desc" path="/test-path" />
        </Router>
      </HelmetProvider>
    );
    const canonicals = getCanonicalLinks();
    expect(canonicals).toHaveLength(0);
    result.unmount();
  });
});

// ─── /dealer-doc-fee ─────────────────────────────────────────────────────────

describe("/dealer-doc-fee canonical", () => {
  it("sets exactly one canonical tag", async () => {
    await act(async () => { renderPage(DealerDocFee); });
    expect(getCanonicalLinks()).toHaveLength(1);
  });

  it("canonical is self-referencing with odigosauto.com domain", async () => {
    await act(async () => { renderPage(DealerDocFee); });
    expect(getCanonicalLinks()[0].getAttribute("href")).toBe("https://odigosauto.com/dealer-doc-fee");
  });

  it("canonical does not contain odigos.replit.app", async () => {
    await act(async () => { renderPage(DealerDocFee); });
    expect(getCanonicalLinks()[0].getAttribute("href")).not.toContain("odigos.replit.app");
  });

  it("og:url matches canonical", async () => {
    await act(async () => { renderPage(DealerDocFee); });
    const canonical = getCanonicalLinks()[0].getAttribute("href");
    expect(getOgUrl()).toBe(canonical);
  });

  it("JSON-LD articleSchema url matches canonical for /dealer-doc-fee", async () => {
    const { buildCanonical } = await import("../../client/src/lib/seo");
    const { articleSchema } = await import("../../client/src/lib/jsonld");
    const path = "/dealer-doc-fee";
    const schema = articleSchema({ title: "t", description: "d", path });
    expect(schema.url).toBe(buildCanonical(path));
    expect(schema.url).toBe("https://odigosauto.com/dealer-doc-fee");
    expect(schema.url).not.toContain("odigos.replit.app");
  });
});

// ─── /how-much-should-you-pay-for-a-car ──────────────────────────────────────

describe("/how-much-should-you-pay-for-a-car canonical", () => {
  it("sets exactly one canonical tag", async () => {
    await act(async () => { renderPage(HowMuchShouldYouPayForACar); });
    expect(getCanonicalLinks()).toHaveLength(1);
  });

  it("canonical is self-referencing with odigosauto.com domain", async () => {
    await act(async () => { renderPage(HowMuchShouldYouPayForACar); });
    expect(getCanonicalLinks()[0].getAttribute("href")).toBe("https://odigosauto.com/how-much-should-you-pay-for-a-car");
  });

  it("canonical does not contain odigos.replit.app", async () => {
    await act(async () => { renderPage(HowMuchShouldYouPayForACar); });
    expect(getCanonicalLinks()[0].getAttribute("href")).not.toContain("odigos.replit.app");
  });

  it("og:url matches canonical", async () => {
    await act(async () => { renderPage(HowMuchShouldYouPayForACar); });
    const canonical = getCanonicalLinks()[0].getAttribute("href");
    expect(getOgUrl()).toBe(canonical);
  });

  it("JSON-LD articleSchema url matches canonical for /how-much-should-you-pay-for-a-car", async () => {
    const { buildCanonical } = await import("../../client/src/lib/seo");
    const { articleSchema } = await import("../../client/src/lib/jsonld");
    const path = "/how-much-should-you-pay-for-a-car";
    const schema = articleSchema({ title: "t", description: "d", path });
    expect(schema.url).toBe(buildCanonical(path));
    expect(schema.url).toBe("https://odigosauto.com/how-much-should-you-pay-for-a-car");
    expect(schema.url).not.toContain("odigos.replit.app");
  });
});

// ─── /calculate-out-the-door-price ───────────────────────────────────────────

describe("/calculate-out-the-door-price canonical", () => {
  it("sets exactly one canonical tag", async () => {
    await act(async () => { renderPage(CalculateOutTheDoorPrice); });
    expect(getCanonicalLinks()).toHaveLength(1);
  });

  it("canonical is self-referencing with odigosauto.com domain", async () => {
    await act(async () => { renderPage(CalculateOutTheDoorPrice); });
    expect(getCanonicalLinks()[0].getAttribute("href")).toBe("https://odigosauto.com/calculate-out-the-door-price");
  });

  it("canonical does not contain odigos.replit.app", async () => {
    await act(async () => { renderPage(CalculateOutTheDoorPrice); });
    expect(getCanonicalLinks()[0].getAttribute("href")).not.toContain("odigos.replit.app");
  });

  it("og:url matches canonical", async () => {
    await act(async () => { renderPage(CalculateOutTheDoorPrice); });
    const canonical = getCanonicalLinks()[0].getAttribute("href");
    expect(getOgUrl()).toBe(canonical);
  });

  it("JSON-LD articleSchema url matches canonical for /calculate-out-the-door-price", async () => {
    const { buildCanonical } = await import("../../client/src/lib/seo");
    const { articleSchema } = await import("../../client/src/lib/jsonld");
    const path = "/calculate-out-the-door-price";
    const schema = articleSchema({ title: "t", description: "d", path });
    expect(schema.url).toBe(buildCanonical(path));
    expect(schema.url).toBe("https://odigosauto.com/calculate-out-the-door-price");
    expect(schema.url).not.toContain("odigos.replit.app");
  });
});

// ─── State pages: Ohio, Florida, New York via setSeoMeta ─────────────────────
// CarDealerFeesState reads its path from useLocation(), which in test environment
// resolves to "/". We test by exercising setSeoMeta directly — mirroring exactly
// what the component does when mounted at the correct path.

describe("State page canonical — /car-dealer-fees-ohio", () => {
  it("setSeoMeta produces correct single canonical", async () => {
    const { setSeoMeta } = await import("../../client/src/lib/seo");
    document.head.innerHTML = "";
    setSeoMeta({
      title: "Car Dealer Fees in Ohio: What You'll Actually Pay | Odigos",
      description: "Ohio car dealer fees",
      path: "/car-dealer-fees-ohio",
    });
    const canonicals = Array.from(document.querySelectorAll('link[rel="canonical"]')) as HTMLLinkElement[];
    expect(canonicals).toHaveLength(1);
    expect(canonicals[0].getAttribute("href")).toBe("https://odigosauto.com/car-dealer-fees-ohio");
  });

  it("og:url matches canonical", async () => {
    const { setSeoMeta } = await import("../../client/src/lib/seo");
    document.head.innerHTML = "";
    setSeoMeta({
      title: "Car Dealer Fees in Ohio: What You'll Actually Pay | Odigos",
      description: "Ohio car dealer fees",
      path: "/car-dealer-fees-ohio",
    });
    const canonical = (document.querySelector('link[rel="canonical"]') as HTMLLinkElement).getAttribute("href");
    expect(getOgUrl()).toBe(canonical);
  });

  it("canonical does not contain odigos.replit.app", async () => {
    const { setSeoMeta } = await import("../../client/src/lib/seo");
    document.head.innerHTML = "";
    setSeoMeta({ title: "t", description: "d", path: "/car-dealer-fees-ohio" });
    expect(getCanonicalLinks()[0].getAttribute("href")).not.toContain("odigos.replit.app");
  });

  it("JSON-LD URL matches canonical when rendered via articleSchema", async () => {
    const { buildCanonical } = await import("../../client/src/lib/seo");
    const { articleSchema } = await import("../../client/src/lib/jsonld");
    const path = "/car-dealer-fees-ohio";
    const schema = articleSchema({ title: "Ohio Fees", description: "d", path });
    expect(schema.url).toBe(buildCanonical(path));
    expect(schema.url).toBe("https://odigosauto.com/car-dealer-fees-ohio");
  });
});

describe("State page canonical — /car-dealer-fees-florida", () => {
  it("setSeoMeta produces correct single canonical", async () => {
    const { setSeoMeta } = await import("../../client/src/lib/seo");
    document.head.innerHTML = "";
    setSeoMeta({ title: "t", description: "d", path: "/car-dealer-fees-florida" });
    const canonicals = Array.from(document.querySelectorAll('link[rel="canonical"]')) as HTMLLinkElement[];
    expect(canonicals).toHaveLength(1);
    expect(canonicals[0].getAttribute("href")).toBe("https://odigosauto.com/car-dealer-fees-florida");
  });

  it("og:url matches canonical", async () => {
    const { setSeoMeta } = await import("../../client/src/lib/seo");
    document.head.innerHTML = "";
    setSeoMeta({ title: "t", description: "d", path: "/car-dealer-fees-florida" });
    const canonical = (document.querySelector('link[rel="canonical"]') as HTMLLinkElement).getAttribute("href");
    expect(getOgUrl()).toBe(canonical);
  });
});

describe("State page canonical — /car-dealer-fees-new-york", () => {
  it("setSeoMeta produces correct single canonical", async () => {
    const { setSeoMeta } = await import("../../client/src/lib/seo");
    document.head.innerHTML = "";
    setSeoMeta({ title: "t", description: "d", path: "/car-dealer-fees-new-york" });
    const canonicals = Array.from(document.querySelectorAll('link[rel="canonical"]')) as HTMLLinkElement[];
    expect(canonicals).toHaveLength(1);
    expect(canonicals[0].getAttribute("href")).toBe("https://odigosauto.com/car-dealer-fees-new-york");
  });

  it("og:url matches canonical", async () => {
    const { setSeoMeta } = await import("../../client/src/lib/seo");
    document.head.innerHTML = "";
    setSeoMeta({ title: "t", description: "d", path: "/car-dealer-fees-new-york" });
    const canonical = (document.querySelector('link[rel="canonical"]') as HTMLLinkElement).getAttribute("href");
    expect(getOgUrl()).toBe(canonical);
  });
});

// ─── State pages: full render integration via memoryLocation ─────────────────
// CarDealerFeesState uses useLocation() to read its path. Using wouter's
// memoryLocation hook we can render it at the correct route path.

describe("State page full render — /car-dealer-fees-ohio", () => {
  it("renders and sets exactly one canonical pointing to odigosauto.com/car-dealer-fees-ohio", async () => {
    await act(async () => { renderPageAtPath(CarDealerFeesState, "/car-dealer-fees-ohio"); });
    const canonicals = getCanonicalLinks();
    expect(canonicals).toHaveLength(1);
    expect(canonicals[0].getAttribute("href")).toBe("https://odigosauto.com/car-dealer-fees-ohio");
  });

  it("og:url matches canonical after full render", async () => {
    await act(async () => { renderPageAtPath(CarDealerFeesState, "/car-dealer-fees-ohio"); });
    const canonical = getCanonicalLinks()[0].getAttribute("href");
    expect(getOgUrl()).toBe(canonical);
  });

  it("canonical does not contain odigos.replit.app after full render", async () => {
    await act(async () => { renderPageAtPath(CarDealerFeesState, "/car-dealer-fees-ohio"); });
    expect(getCanonicalLinks()[0].getAttribute("href")).not.toContain("odigos.replit.app");
  });
});

describe("State page full render — /car-dealer-fees-florida", () => {
  it("renders and sets exactly one canonical pointing to odigosauto.com/car-dealer-fees-florida", async () => {
    await act(async () => { renderPageAtPath(CarDealerFeesState, "/car-dealer-fees-florida"); });
    const canonicals = getCanonicalLinks();
    expect(canonicals).toHaveLength(1);
    expect(canonicals[0].getAttribute("href")).toBe("https://odigosauto.com/car-dealer-fees-florida");
  });

  it("og:url matches canonical after full render", async () => {
    await act(async () => { renderPageAtPath(CarDealerFeesState, "/car-dealer-fees-florida"); });
    const canonical = getCanonicalLinks()[0].getAttribute("href");
    expect(getOgUrl()).toBe(canonical);
  });
});

describe("State page full render — /car-dealer-fees-new-york", () => {
  it("renders and sets exactly one canonical pointing to odigosauto.com/car-dealer-fees-new-york", async () => {
    await act(async () => { renderPageAtPath(CarDealerFeesState, "/car-dealer-fees-new-york"); });
    const canonicals = getCanonicalLinks();
    expect(canonicals).toHaveLength(1);
    expect(canonicals[0].getAttribute("href")).toBe("https://odigosauto.com/car-dealer-fees-new-york");
  });

  it("og:url matches canonical after full render", async () => {
    await act(async () => { renderPageAtPath(CarDealerFeesState, "/car-dealer-fees-new-york"); });
    const canonical = getCanonicalLinks()[0].getAttribute("href");
    expect(getOgUrl()).toBe(canonical);
  });
});

// ─── State page faqPageSchema includes canonical URL ─────────────────────────

describe("State page faqPageSchema URL matches canonical", () => {
  it("faqPageSchema URL matches buildCanonical for /car-dealer-fees-florida", async () => {
    const { buildCanonical } = await import("../../client/src/lib/seo");
    const { faqPageSchema } = await import("../../client/src/lib/jsonld");
    const path = "/car-dealer-fees-florida";
    const url = buildCanonical(path);
    const schema = faqPageSchema({ questions: [{ question: "Q?", answer: "A." }], url });
    expect(schema.url).toBe("https://odigosauto.com/car-dealer-fees-florida");
    expect(schema.mainEntityOfPage?.["@id"]).toBe(url);
  });

  it("faqPageSchema URL matches buildCanonical for /car-dealer-fees-illinois", async () => {
    const { buildCanonical } = await import("../../client/src/lib/seo");
    const { faqPageSchema } = await import("../../client/src/lib/jsonld");
    const path = "/car-dealer-fees-illinois";
    const url = buildCanonical(path);
    const schema = faqPageSchema({ questions: [{ question: "Q?", answer: "A." }], url });
    expect(schema.url).toBe("https://odigosauto.com/car-dealer-fees-illinois");
    expect(schema.mainEntityOfPage?.["@id"]).toBe(url);
  });
});

// ─── SPA navigation — canonical not stale after route change ─────────────────

describe("SPA navigation canonical stability", () => {
  it("canonical updates correctly when navigating between pages", async () => {
    let unmount: () => void;

    await act(async () => {
      const result = renderPage(DealerDocFee);
      unmount = result.unmount;
    });

    expect(getCanonicalLinks()[0]?.getAttribute("href")).toBe("https://odigosauto.com/dealer-doc-fee");

    await act(async () => { unmount(); });
    await act(async () => { renderPage(HowMuchShouldYouPayForACar); });

    const afterNav = getCanonicalLinks();
    expect(afterNav).toHaveLength(1);
    expect(afterNav[0].getAttribute("href")).toBe("https://odigosauto.com/how-much-should-you-pay-for-a-car");
  });

  it("canonical is present (not missing) after page unmount followed by new render", async () => {
    let unmount: () => void;

    await act(async () => {
      const result = renderPage(DealerDocFee);
      unmount = result.unmount;
    });

    await act(async () => { unmount(); });
    await act(async () => { renderPage(CalculateOutTheDoorPrice); });

    const canonicals = getCanonicalLinks();
    expect(canonicals.length).toBeGreaterThan(0);
    expect(canonicals[0].getAttribute("href")).not.toBe("");
    expect(canonicals[0].getAttribute("href")).not.toContain("odigos.replit.app");
  });

  it("canonical does not duplicate when setSeoMeta is called twice", async () => {
    const { setSeoMeta } = await import("../../client/src/lib/seo");
    document.head.innerHTML = "";
    setSeoMeta({ title: "Page 1", description: "desc 1", path: "/dealer-doc-fee" });
    setSeoMeta({ title: "Page 2", description: "desc 2", path: "/how-much-should-you-pay-for-a-car" });
    const canonicals = Array.from(document.querySelectorAll('link[rel="canonical"]')) as HTMLLinkElement[];
    expect(canonicals).toHaveLength(1);
    expect(canonicals[0].getAttribute("href")).toBe("https://odigosauto.com/how-much-should-you-pay-for-a-car");
  });

  it("canonical is not stale: navigating from DealerDocFee to CalculateOutTheDoorPrice updates canonical", async () => {
    let unmount: () => void;

    await act(async () => {
      const result = renderPage(DealerDocFee);
      unmount = result.unmount;
    });

    const firstHref = getCanonicalLinks()[0]?.getAttribute("href");
    expect(firstHref).toBe("https://odigosauto.com/dealer-doc-fee");

    await act(async () => { unmount(); });
    await act(async () => { renderPage(CalculateOutTheDoorPrice); });

    const secondHref = getCanonicalLinks()[0]?.getAttribute("href");
    expect(secondHref).toBe("https://odigosauto.com/calculate-out-the-door-price");
    expect(secondHref).not.toBe(firstHref);
  });
});
