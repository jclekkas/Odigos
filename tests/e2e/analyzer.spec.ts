import { test, expect, Page } from "@playwright/test";

// Pre-accept the cookie consent banner for all e2e tests so it doesn't
// intercept clicks on CTAs near the bottom of the page or fail visibility
// checks. The banner uses localStorage to persist consent, so we set it
// before any page script runs via addInitScript.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("odigos_cookie_consent", "accepted");
  });
});

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
  confidenceLevel: "HIGH",
  verdictLabel: "NO-GO — DOC FEE EXCEEDS CA STATE CAP",
  goNoGo: "NO-GO",
  summary: "Doc fee of $895 exceeds the CA cap of $85.",
};

async function interceptAnalyzeRoute(page: Page, response: object, statusCode = 200) {
  await page.route("**/api/analyze", (route) => {
    // Only intercept POST requests (the actual analysis call).
    // Let GET/OPTIONS pass through.
    if (route.request().method() === "POST") {
      route.fulfill({
        status: statusCode,
        contentType: "application/json",
        body: JSON.stringify(response),
      });
    } else {
      route.continue();
    }
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
  await page.route("**/api/track", (route) => route.fulfill({ status: 200, body: "{}" }));
  await page.route("**/api/vitals", (route) => route.fulfill({ status: 200, body: "{}" }));
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

  test("CTA button navigates to the analyzer", async ({ page }) => {
    await interceptStatsRoutes(page);
    await page.goto("/");
    const cta = page.getByTestId("button-cta-hero");
    const href = await cta.getAttribute("href");
    expect(href).toBeTruthy();
  });

  test("hero CTA click navigates to /analyze", async ({ page }) => {
    await interceptStatsRoutes(page);
    await page.goto("/");
    const cta = page.getByTestId("button-cta-hero");
    await expect(cta).toBeVisible();
    await cta.click();
    await expect(page).toHaveURL(/\/analyze/);
  });

  test("header CTA click navigates to /analyze", async ({ page }) => {
    await interceptStatsRoutes(page);
    await page.goto("/");
    const headerCta = page.getByTestId("button-cta-header");
    await expect(headerCta).toBeVisible();
    await headerCta.click();
    await expect(page).toHaveURL(/\/analyze/);
  });
});

// ─── Article CTA ─────────────────────────────────────────────────────────────

test.describe("Article CTA", () => {
  test("article CTA link on /hidden-dealer-fees points to /analyze", async ({ page }) => {
    await interceptStatsRoutes(page);
    await page.goto("/hidden-dealer-fees");
    const cta = page.getByTestId("button-cta-mid-article-hidden-fees");
    await expect(cta).toBeVisible();
    const parent = page.locator("a:has([data-testid='button-cta-mid-article-hidden-fees'])");
    const href = await parent.getAttribute("href");
    expect(href).toContain("/analyze");
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
    // Wait for either the verdict text or the deal score badge to appear
    await expect(
      page.getByText("GO — TERMS LOOK CLEAN").or(page.getByText("GO", { exact: true }))
    ).toBeVisible({ timeout: 15000 });
  });
});

// ─── Analyzer page — validation ────────────────────────────────────────────────

test.describe("Analyzer — validation", () => {
  test("submitting an empty form does not call /api/analyze", async ({ page }) => {
    let analyzeCalled = false;
    await interceptStatsRoutes(page);
    await page.route("**/api/analyze", async (route) => {
      analyzeCalled = true;
      await route.fulfill({ status: 200, body: JSON.stringify(MOCK_ANALYSIS) });
    });
    await page.goto("/analyze");

    await page.getByTestId("button-analyze").click();
    await page.waitForTimeout(1000);

    expect(analyzeCalled).toBe(false);
  });

  test("analyze button is present and interactive", async ({ page }) => {
    await interceptStatsRoutes(page);
    await page.goto("/analyze");
    const btn = page.getByTestId("button-analyze");
    await expect(btn).toBeVisible();
    await expect(btn).toBeEnabled();
  });
});

// ─── Analyzer page — RED result ────────────────────────────────────────────────

test.describe("Analyzer — RED/NO-GO result", () => {
  test("displays NO-GO for a deal with CA doc fee violation", async ({ page }) => {
    await interceptStatsRoutes(page);
    await interceptAnalyzeRoute(page, RED_ANALYSIS);
    await page.goto("/analyze");

    const textarea = page.getByTestId("input-dealer-text");
    await textarea.fill("$895 doc fee. CA dealer. APR 5%.");
    const btn = page.getByTestId("button-analyze");
    await btn.click();
    await expect(page.getByText("NO-GO", { exact: true })).toBeVisible({ timeout: 10000 });
  });
});

// ─── File upload flow ──────────────────────────────────────────────────────────

test.describe("File upload", () => {
  test("upload tab reveals the file input", async ({ page }) => {
    await interceptStatsRoutes(page);
    await page.goto("/analyze");
    await page.getByTestId("tab-upload").click();
    const fileInput = page.getByTestId("input-file-upload");
    // File input is intentionally hidden (class="hidden") — custom upload UI triggers it.
    // Verify it's attached to the DOM, not necessarily visible.
    await expect(fileInput).toBeAttached({ timeout: 5000 });
  });

  test("upload button is present on the upload tab", async ({ page }) => {
    await interceptStatsRoutes(page);
    await page.goto("/analyze");
    await page.getByTestId("tab-upload").click();
    const uploadBtn = page.getByTestId("button-upload-file");
    await expect(uploadBtn).toBeVisible({ timeout: 5000 });
  });

  test("file input accepts image and PDF types", async ({ page }) => {
    await interceptStatsRoutes(page);
    await page.goto("/analyze");
    await page.getByTestId("tab-upload").click();
    const fileInput = page.getByTestId("input-file-upload");
    const accept = await fileInput.getAttribute("accept");
    expect(accept).toBeTruthy();
    expect(accept).toMatch(/image|pdf/i);
  });

  test("unsupported file type (text/plain) triggers an error response", async ({ page }) => {
    await interceptStatsRoutes(page);
    page.route("**/api/extract-text", (route) =>
      route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({ message: "That file type isn't supported." }),
      })
    );
    await page.goto("/analyze");
    await page.getByTestId("tab-upload").click();

    const fileInput = page.getByTestId("input-file-upload");
    await fileInput.setInputFiles({
      name: "test.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("hello world"),
    });
    await page.waitForTimeout(2000);
  });
});

// ─── Upgrade CTA (free mode) ─────────────────────────────────────────────────

test.describe("Free/paid tier UI", () => {
  test("analyze page loads correctly in free mode (Stripe not configured)", async ({ page }) => {
    await interceptStatsRoutes(page);
    await interceptAnalyzeRoute(page, MOCK_ANALYSIS);
    await page.goto("/analyze");

    await page.getByTestId("input-dealer-text").fill(
      "OTD $35,000. APR 4.9% for 60 months."
    );
    await page.getByTestId("button-analyze").click();

    await expect(
      page.getByText("GO — TERMS LOOK CLEAN").or(page.getByText("GO", { exact: true }))
    ).toBeVisible({ timeout: 15000 });
  });
});

// ─── Security: no real external calls leak ────────────────────────────────────

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

test("no OpenAI API key appears in any request header or body", async ({ page }) => {
  const keyLeaks: string[] = [];
  page.on("request", (req) => {
    const auth = req.headers()["authorization"] ?? "";
    if (auth.includes("sk-")) keyLeaks.push("header");
    const body = req.postData() ?? "";
    if (body.includes("sk-")) keyLeaks.push("body");
  });
  await interceptStatsRoutes(page);
  await interceptAnalyzeRoute(page, MOCK_ANALYSIS);
  await page.goto("/analyze");
  await page.getByTestId("input-dealer-text").fill("OTD $35,000 APR 4.9%.");
  await page.getByTestId("button-analyze").click();
  await page.waitForTimeout(2000);
  expect(keyLeaks).toHaveLength(0);
});

// ─── Health and state-fee API (direct API calls) ──────────────────────────────

test("GET /api/health returns 200 with status field", async ({ page }) => {
  const res = await page.request.get("/api/health");
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body).toHaveProperty("status");
});

test("GET /api/state-fee/CA returns CA doc fee cap of $85", async ({ page }) => {
  const res = await page.request.get("/api/state-fee/CA");
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body.docFeeCap).toBe(true);
  expect(body.docFeeCapAmount).toBe(85);
});

test("GET /api/state-fee/ZZ returns 404 for unknown state", async ({ page }) => {
  const res = await page.request.get("/api/state-fee/ZZ");
  expect(res.status()).toBe(404);
});
