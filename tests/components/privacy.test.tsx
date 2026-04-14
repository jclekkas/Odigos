// @vitest-environment jsdom
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Router } from "wouter";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "../../client/src/components/ThemeProvider.js";
import Privacy from "../../client/src/pages/privacy.js";

vi.stubEnv("NODE_ENV", "test");

vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({
  matches: false, media: "", onchange: null,
  addListener: vi.fn(), removeListener: vi.fn(),
  addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn(),
}));

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: 0 },
      mutations: { retry: false }
    },
  });
}

function renderPrivacy() {
  return render(
    <ThemeProvider>
      <HelmetProvider>
        <QueryClientProvider client={makeQueryClient()}>
          <Router>
            <Privacy />
          </Router>
        </QueryClientProvider>
      </HelmetProvider>
    </ThemeProvider>
  );
}

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn(() =>
    Promise.resolve({
      ok: true, status: 200,
      json: () => Promise.resolve({}),
      text: () => Promise.resolve("{}")
    })
  ));
});

describe("Privacy page rendering", () => {
  it("renders a Privacy Policy heading", () => {
    renderPrivacy();
    const headings = screen.getAllByRole("heading");
    const h1 = headings.find((h) => h.tagName === "H1");
    expect(h1).toBeTruthy();
    expect(h1?.textContent).toMatch(/Privacy Policy/i);
  });

  it("renders a section about data collection", () => {
    renderPrivacy();
    const headings = screen.getAllByRole("heading");
    const collectSection = headings.find((h) =>
      h.textContent?.toLowerCase().includes("collect")
    );
    expect(collectSection).toBeTruthy();
  });

  it("renders a section about data retention", () => {
    renderPrivacy();
    const headings = screen.getAllByRole("heading");
    const retentionSection = headings.find((h) =>
      h.textContent?.toLowerCase().includes("retention")
    );
    expect(retentionSection).toBeTruthy();
  });

  it("renders a security section", () => {
    renderPrivacy();
    const headings = screen.getAllByRole("heading");
    const securitySection = headings.find((h) =>
      h.textContent?.toLowerCase().includes("security")
    );
    expect(securitySection).toBeTruthy();
  });
});
// @vitest-environment jsdom
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Router } from "wouter";
import { HelmetProvider } from "react-helmet-async";
import Privacy from "../../client/src/pages/privacy.js";

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

function renderPrivacy() {
  return render(
    <HelmetProvider>
      <QueryClientProvider client={makeQueryClient()}>
        <Router>
          <Privacy />
        </Router>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn(() =>
    Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({}), text: () => Promise.resolve("{}") })
  ));
});

describe("Privacy page rendering", () => {
  it("renders a Privacy Policy heading", () => {
    renderPrivacy();
    const headings = screen.getAllByRole("heading");
    const h1 = headings.find((h) => h.tagName === "H1");
    expect(h1).toBeTruthy();
    expect(h1?.textContent).toMatch(/Privacy Policy/i);
  });

  it("renders a section about data collection", () => {
    renderPrivacy();
    const headings = screen.getAllByRole("heading");
    const collectSection = headings.find((h) =>
      h.textContent?.toLowerCase().includes("collect")
    );
    expect(collectSection).toBeTruthy();
  });

  it("renders a section about data retention", () => {
    renderPrivacy();
    const headings = screen.getAllByRole("heading");
    const retentionSection = headings.find((h) =>
      h.textContent?.toLowerCase().includes("retention")
    );
    expect(retentionSection).toBeTruthy();
  });

  it("renders a security section", () => {
    renderPrivacy();
    const headings = screen.getAllByRole("heading");
    const securitySection = headings.find((h) =>
      h.textContent?.toLowerCase().includes("security")
    );
    expect(securitySection).toBeTruthy();
  });
});
