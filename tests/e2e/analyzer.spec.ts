import { test, expect, Page } from "@playwright/test";

const MOCK_ANALYSIS = {
  dealScore: "GREEN",
  confidenceLevel: "HIGH",
  verdictLabel: "GO — TERMS LOOK CLEAN",
  goNoGo: "GO",
  summary:
    "The deal looks solid. OTD price, APR, and term are clearly stated. No red flags detected.",
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
  suggestedReply: "Thank you for the detailed quote. Looking forward to finalizing.",
  reasoning: "OTD price, APR, and term are explicitly stated. No add-ons or market adjustments.",
};

const RED_ANALYSIS = {
  ...MOCK_ANALYSIS,
  dealScore: "RED",
  confidenceLevel: "LOW",
  verdictLabel: "NO-GO — REMOVE MARKET ADJUSTMENT",
  goNoGo: "NO-GO",
  summary: "Market adjustment detected. This is a red flag.",
};

async function interceptAnalyzeRoute(page: Page, response: object, statusCode = 200) {
  await page.route("**/api/analyze", (route) => {
    route.fulfill({
      status: statusCode,
      contentType: "application/json",
      body: JSON.stringify(response),
    });
  });
}

async function interceptStatsRoutes(page: Page) {
  await page.route("**/api/stripe-status", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ configured: false }),
    })
  );
  await page.route("**/api/stats**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ count: 0, type: "none" }),
    })
  );
}

// ─── Landing page ──────────────────────────────────────────────────────────────

test.describe("Landing page", () => {
  test("shows hero headline and CTA button", async ({ page }) => {
    await interceptStatsRoutes(page);
    await page.goto("/");
    const headline = page.getByTestId("text-hero-headline");
    await expect(headline).toBeVisible();
    const cta = page.getByTestId("button-cta-hero");
    await expect(cta).toBeVisible();
  });
});

// ─── Analyzer page — happy path ────────────────────────────────────────────────

test.describe("Analyzer — happy path", () => {
  test.beforeEach(async ({ page }) => {
    await interceptStatsRoutes(page);
    await interceptAnalyzeRoute(page, MOCK_ANALYSIS);
    await page.goto("/analyze");
  });

  test("renders the analyze form", async ({ page }) => {
    const textarea = page.getByTestId("input-dealer-text");
    await expect(textarea).toBeVisible();
    const btn = page.getByTestId("button-analyze");
    await expect(btn).toBeVisible();
  });

  test("user can type in the dealer text field", async ({ page }) => {
    const textarea = page.getByTestId("input-dealer-text");
    await textarea.fill("OTD $35,000 APR 4.9% for 60 months.");
    await expect(textarea).toHaveValue("OTD $35,000 APR 4.9% for 60 months.");
  });

  test("submitting text calls the analyze API and displays the deal score", async ({ page }) => {
    const textarea = page.getByTestId("input-dealer-text");
    await textarea.fill("OTD $35,000. APR 4.9% for 60 months. No add-ons.");
    const btn = page.getByTestId("button-analyze");
    await btn.click();
    await expect(page.getByText(/GO — TERMS LOOK CLEAN/i)).toBeVisible({ timeout: 10000 });
  });
});

// ─── Analyzer page — RED result ────────────────────────────────────────────────

test.describe("Analyzer — RED/NO-GO result", () => {
  test("displays NO-GO for a deal with market adjustment", async ({ page }) => {
    await interceptStatsRoutes(page);
    await interceptAnalyzeRoute(page, RED_ANALYSIS);
    await page.goto("/analyze");

    const textarea = page.getByTestId("input-dealer-text");
    await textarea.fill("$2,000 market adjustment on this hot model.");
    const btn = page.getByTestId("button-analyze");
    await btn.click();
    await expect(page.getByText(/NO-GO/i)).toBeVisible({ timeout: 10000 });
  });
});

// ─── File upload flow ──────────────────────────────────────────────────────────

test.describe("File upload", () => {
  test("upload button is present on the analyze page", async ({ page }) => {
    await interceptStatsRoutes(page);
    await page.goto("/analyze");
    const uploadBtn = page.getByTestId("button-upload-file");
    await expect(uploadBtn).toBeVisible();
  });

  test("file input accepts image and PDF types", async ({ page }) => {
    await interceptStatsRoutes(page);
    await page.goto("/analyze");
    const fileInput = page.getByTestId("input-file-upload");
    const accept = await fileInput.getAttribute("accept");
    expect(accept).toBeTruthy();
    expect(accept).toMatch(/image|pdf/i);
  });
});

// ─── No real external calls leak through ──────────────────────────────────────

test("no unintercepted network requests to openai.com are made", async ({ page }) => {
  const openaiRequests: string[] = [];
  page.on("request", (req) => {
    if (req.url().includes("openai.com")) openaiRequests.push(req.url());
  });
  await interceptStatsRoutes(page);
  await interceptAnalyzeRoute(page, MOCK_ANALYSIS);
  await page.goto("/analyze");
  const textarea = page.getByTestId("input-dealer-text");
  await textarea.fill("Test quote OTD $30,000.");
  await page.getByTestId("button-analyze").click();
  await page.waitForTimeout(2000);
  expect(openaiRequests).toHaveLength(0);
});
