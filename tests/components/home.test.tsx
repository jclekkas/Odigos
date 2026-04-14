// @vitest-environment jsdom
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Router } from "wouter";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "../../client/src/components/ThemeProvider.js";
import Home from "../../client/src/pages/home.js";
import { getQueryFn } from "../../client/src/lib/queryClient.js";

vi.stubEnv("NODE_ENV", "test");

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

function renderHome(queryClient = makeQueryClient()) {
  return render(
    <ThemeProvider>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <Router>
            <Home />
          </Router>
        </QueryClientProvider>
      </HelmetProvider>
    </ThemeProvider>
  );
}

const mockStripeStatus = { configured: false };
const mockStatsCount = { count: 42, type: "none" };

const VALID_ANALYSIS = {
  dealScore: "GREEN",
  confidenceLevel: "HIGH",
  verdictLabel: "GO — TERMS LOOK CLEAN",
  goNoGo: "GO",
  summary: "The deal looks solid with clear OTD pricing and favorable APR.",
  detectedFields: {
    salePrice: 30000,
    msrp: 32000,
    rebates: null,
    fees: [{ name: "Doc Fee", amount: 199 }],
    outTheDoorPrice: 35000,
    monthlyPayment: 499,
    tradeInValue: null,
    apr: 4.9,
    termMonths: 60,
    downPayment: 3000,
  },
  missingInfo: [],
  suggestedReply: "Thank you, looking forward to finalizing the deal.",
  reasoning: "OTD price, APR, and term are clearly stated.",
  docFeeCapCheck: null,
};

function setupFetchMock(analyzeResponse: object = VALID_ANALYSIS, status = 200) {
  vi.stubGlobal(
    "fetch",
    vi.fn((url: string) => {
      if (url.includes("stripe-status")) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockStripeStatus),
          text: () => Promise.resolve(JSON.stringify(mockStripeStatus)),
        });
      }
      if (url.includes("stats")) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockStatsCount),
          text: () => Promise.resolve(JSON.stringify(mockStatsCount)),
        });
      }
      if (url.includes("/api/analyze")) {
        return Promise.resolve({
          ok: status < 400,
          status,
          json: () => Promise.resolve(analyzeResponse),
          text: () => Promise.resolve(JSON.stringify(analyzeResponse)),
        });
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
        text: () => Promise.resolve("{}"),
      });
    })
  );
}

beforeEach(() => {
  setupFetchMock();
  localStorage.setItem("odigos_upload_consent", "accepted");
});

// ─── Rendering ────────────────────────────────────────────────────────────────

describe("Home page rendering", () => {
  it("renders the dealer text input", async () => {
    renderHome();
    const textarea = await screen.findByTestId("input-dealer-text");
    expect(textarea).toBeInTheDocument();
  });

  it("renders the analyze button", async () => {
    renderHome();
    const btn = await screen.findByTestId("button-analyze");
    expect(btn).toBeInTheDocument();
  });

  it("renders the upload tab trigger", async () => {
    renderHome();
    const uploadTab = await screen.findByTestId("tab-upload");
    expect(uploadTab).toBeInTheDocument();
  });

  it("renders the paste tab trigger as the default active tab", async () => {
    renderHome();
    const pasteTab = await screen.findByTestId("tab-paste-text");
    expect(pasteTab).toBeInTheDocument();
  });

  it("switching to upload tab reveals the file input", async () => {
    const user = userEvent.setup();
    renderHome();
    const uploadTab = await screen.findByTestId("tab-upload");
    await user.click(uploadTab);
    const fileInput = await screen.findByTestId("input-file-upload");
    expect(fileInput).toBeInTheDocument();
    expect(fileInput).toHaveAttribute("type", "file");
  });
});

// ─── Form interaction ─────────────────────────────────────────────────────────

describe("Home page form interaction", () => {
  it("user can type in the dealer text textarea", async () => {
    const user = userEvent.setup();
    renderHome();
    const textarea = await screen.findByTestId("input-dealer-text");
    await user.type(textarea, "OTD $35,000");
    expect(textarea).toHaveValue("OTD $35,000");
  });

  it("submit calls the analyze API with POST method", async () => {
    const user = userEvent.setup();
    renderHome();

    const textarea = await screen.findByTestId("input-dealer-text");
    await user.type(textarea, "OTD price is $35,000 with APR 4.9% for 60 months.");

    const btn = await screen.findByTestId("button-analyze");
    await user.click(btn);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/analyze"),
        expect.objectContaining({ method: "POST" })
      );
    });
  });
});

// ─── Free / paid boundary ─────────────────────────────────────────────────────

describe("Free/paid tier boundary", () => {
  it("stripe-status API is queried on mount (drives free/paid UI)", async () => {
    renderHome();
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("stripe-status"),
        expect.anything()
      );
    });
  });
});

// ─── Statutory cap callout ───────────────────────────────────────────────────

describe("Statutory cap callout", () => {
  it("renders the callout banner when doc fee cap is violated", async () => {
    const user = userEvent.setup();
    const violationAnalysis = {
      ...VALID_ANALYSIS,
      dealScore: "RED",
      goNoGo: "NO-GO",
      verdictLabel: "NO-GO — DOC FEE EXCEEDS STATE CAP",
      docFeeCapCheck: {
        violated: true,
        capAmount: 85,
        chargedAmount: 499,
        overage: 414,
        stateName: "California",
        stateAbbreviation: "CA",
        statuteCitation: "CA Vehicle Code § 11713.1(i)",
      },
    };
    setupFetchMock(violationAnalysis);
    renderHome();

    const textarea = await screen.findByTestId("input-dealer-text");
    await user.type(textarea, "Doc fee $499 in California");
    const btn = await screen.findByTestId("button-analyze");
    await user.click(btn);

    const callout = await screen.findByTestId("statutory-cap-callout");
    expect(callout).toBeInTheDocument();
    expect(callout).toHaveTextContent("$499");
    expect(callout).toHaveTextContent("$85");
    expect(callout).toHaveTextContent("California");
    expect(callout).toHaveTextContent("CA Vehicle Code § 11713.1(i)");
  });

  it("does not render the callout when no cap violation", async () => {
    const user = userEvent.setup();
    setupFetchMock(VALID_ANALYSIS);
    renderHome();

    const textarea = await screen.findByTestId("input-dealer-text");
    await user.type(textarea, "OTD $35,000 with doc fee $199");
    const btn = await screen.findByTestId("button-analyze");
    await user.click(btn);

    await screen.findByTestId("text-market-context-disclosure");
    expect(screen.queryByTestId("statutory-cap-callout")).not.toBeInTheDocument();
  });
});
