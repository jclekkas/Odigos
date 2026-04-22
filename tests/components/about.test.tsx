// @vitest-environment jsdom
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Router } from "wouter";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "../../client/src/components/ThemeProvider.js";
import About from "../../client/src/pages/about.js";

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

function renderAbout() {
  return render(
    <ThemeProvider>
      <HelmetProvider>
        <QueryClientProvider client={makeQueryClient()}>
          <Router>
            <About />
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

describe("About page rendering", () => {
  it("renders the main h1 heading with testid", async () => {
    renderAbout();
    const heading = await screen.findByTestId("text-about-heading");
    expect(heading).toBeInTheDocument();
    expect(heading.textContent).toContain("Odigos");
  });

  it("renders the 'What we do' section", async () => {
    renderAbout();
    const whatWeDo = await screen.findByTestId("text-about-what-we-do");
    expect(whatWeDo).toBeInTheDocument();
  });

  it("renders the 'How it works' section", async () => {
    renderAbout();
    const howItWorks = await screen.findByTestId("text-about-how-it-works");
    expect(howItWorks).toBeInTheDocument();
  });

  it("renders the CTA button to the analyzer", async () => {
    renderAbout();
    const cta = await screen.findByTestId("button-cta-about");
    expect(cta).toBeInTheDocument();
  });

  it("renders the contact email link", async () => {
    renderAbout();
    const emailLink = await screen.findByTestId("link-contact-email");
    expect(emailLink).toBeInTheDocument();
    expect(emailLink).toHaveAttribute("href");
  });
});
