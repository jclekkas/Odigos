// @vitest-environment jsdom
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Router } from "wouter";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "../../client/src/components/ThemeProvider.js";
import Landing from "../../client/src/pages/landing.js";

vi.stubEnv("NODE_ENV", "test");

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: 0 },
      mutations: { retry: false },
    },
  });
}

function renderLanding() {
  return render(
    <ThemeProvider>
      <HelmetProvider>
        <QueryClientProvider client={makeQueryClient()}>
          <Router>
            <Landing />
          </Router>
        </QueryClientProvider>
      </HelmetProvider>
    </ThemeProvider>
  );
}

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ configured: false }),
        text: () => Promise.resolve(JSON.stringify({ configured: false })),
      })
    )
  );
});

// ─── Rendering ────────────────────────────────────────────────────────────────
describe("Landing page rendering", () => {
  it("renders the hero headline", async () => {
    renderLanding();
    const headline = await screen.findByTestId("text-hero-headline");
    expect(headline).toBeInTheDocument();
    expect(headline.textContent?.length).toBeGreaterThan(0);
  });

  it("renders the hero CTA button", async () => {
    renderLanding();
    const cta = await screen.findByTestId("button-cta-hero");
    expect(cta).toBeInTheDocument();
  });

  it("hero CTA button is clickable (has correct role)", async () => {
    renderLanding();
    const cta = await screen.findByTestId("button-cta-hero");
    expect(cta.tagName).toMatch(/^(BUTTON|A)$/i);
  });
});
