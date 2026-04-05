import { createServer } from "http";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, resolve } from "path";
import puppeteer from "puppeteer-core";

const DIST_DIR = resolve("dist/public");
const CHROMIUM_PATH = process.env.CHROMIUM_PATH || "/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium";

const ROUTES = [
  // OTD cluster
  "/out-the-door-price",
  "/out-the-door-price-calculator",
  "/calculate-out-the-door-price",
  "/what-does-out-the-door-price-include",
  "/out-the-door-price-vs-msrp",
  "/out-the-door-price-vs-monthly-payment",
  "/out-the-door-price-example",
  "/monthly-payment-trap",
  "/dealer-wont-give-otd-price",
  "/why-dealers-wont-give-out-the-door-price",

  // Good deal decision cluster
  "/is-this-a-good-car-deal",
  "/how-to-tell-if-a-car-deal-is-good",
  "/what-is-a-fair-price-for-a-car",
  "/how-much-should-you-pay-for-a-car",
  "/how-to-compare-car-deals",
  "/best-way-to-check-if-a-car-deal-is-good",

  // Dealer fees cluster
  "/car-dealer-fees-explained",
  "/car-dealer-fees-list",
  "/car-dealer-fees-by-state",
  // All 51 state/territory routes (generated programmatically)
  ...[
    "alabama", "alaska", "arizona", "arkansas", "california",
    "colorado", "connecticut", "delaware", "district-of-columbia",
    "florida", "georgia", "hawaii", "idaho", "illinois", "indiana",
    "iowa", "kansas", "kentucky", "louisiana", "maine", "maryland",
    "massachusetts", "michigan", "minnesota", "mississippi", "missouri",
    "montana", "nebraska", "nevada", "new-hampshire", "new-jersey",
    "new-mexico", "new-york", "north-carolina", "north-dakota",
    "ohio", "oklahoma", "oregon", "pennsylvania", "rhode-island",
    "south-carolina", "south-dakota", "tennessee", "texas", "utah",
    "vermont", "virginia", "washington", "west-virginia", "wisconsin",
    "wyoming",
  ].map(s => `/car-dealer-fees-${s}`),
  "/dealer-doc-fee",
  "/dealer-doc-fee-by-state",
  "/what-is-a-dealer-doc-fee",
  "/doc-fee-too-high",
  "/are-dealer-fees-negotiable",
  "/hidden-dealer-fees",
  "/market-adjustment-fee",
  "/dealer-prep-fee",
  "/dealer-reconditioning-fee",

  // Add-ons cluster
  "/are-dealer-add-ons-mandatory",
  "/are-dealer-add-ons-negotiable",
  "/are-dealer-add-ons-required-by-law",
  "/how-to-remove-dealer-add-ons",
  "/dealer-add-ons-explained",
  "/dealer-add-ons-list",

  // Dealer tactics / problems cluster
  "/dealer-pricing-tactics",
  "/dealer-pricing-problems",
  "/dealer-added-fees-after-agreement",
  "/dealer-changed-price-after-deposit",
  "/finance-office-changed-the-numbers",

  // About / product
  "/how-odigos-works",
  "/example-analysis",

  // Footer / legal
  "/about",
  "/privacy",
  "/terms",
];

const PORT = 4173;

const REQUIRED_META = [
  { selector: "title", label: "title" },
  { selector: 'meta[name="description"]', attr: "content", label: "description" },
  { selector: 'link[rel="canonical"]', attr: "href", label: "canonical" },
  { selector: 'meta[property="og:title"]', attr: "content", label: "og:title" },
  { selector: 'meta[property="og:description"]', attr: "content", label: "og:description" },
  { selector: 'meta[property="og:url"]', attr: "content", label: "og:url" },
  { selector: 'meta[name="twitter:card"]', attr: "content", label: "twitter:card" },
  { selector: 'meta[name="twitter:title"]', attr: "content", label: "twitter:title" },
  { selector: 'meta[name="twitter:description"]', attr: "content", label: "twitter:description" },
];

function createStaticServer() {
  return new Promise((resolvePromise) => {
    const server = createServer((req, res) => {
      let filePath = join(DIST_DIR, req.url === "/" ? "index.html" : req.url);

      if (!existsSync(filePath)) {
        filePath = join(DIST_DIR, "index.html");
      }

      try {
        const content = readFileSync(filePath);
        const ext = filePath.split(".").pop();
        const types = {
          html: "text/html",
          js: "application/javascript",
          css: "text/css",
          png: "image/png",
          jpg: "image/jpeg",
          svg: "image/svg+xml",
          woff: "font/woff",
          woff2: "font/woff2",
          ttf: "font/ttf",
          ico: "image/x-icon",
          json: "application/json",
        };
        res.writeHead(200, { "Content-Type": types[ext] || "application/octet-stream" });
        res.end(content);
      } catch {
        res.writeHead(404);
        res.end("Not found");
      }
    });

    server.listen(PORT, "127.0.0.1", () => {
      console.log(`Static server running on http://127.0.0.1:${PORT}`);
      resolvePromise(server);
    });
  });
}

async function prerender() {
  if (!existsSync(DIST_DIR)) {
    console.error("Build directory not found. Run `npm run build` first.");
    process.exit(1);
  }

  let chromiumPath = CHROMIUM_PATH;
  if (!existsSync(chromiumPath)) {
    const { execSync } = await import("child_process");
    try {
      chromiumPath = execSync("which chromium", { encoding: "utf-8" }).trim();
    } catch {
      console.error("Chromium not found. Install it via nix or set CHROMIUM_PATH.");
      process.exit(1);
    }
  }

  console.log(`Using Chromium at: ${chromiumPath}`);

  const server = await createStaticServer();

  const browser = await puppeteer.launch({
    executablePath: chromiumPath,
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
    ],
  });

  try {
    for (const route of ROUTES) {
      console.log(`Prerendering ${route}...`);

      const page = await browser.newPage();
      await page.goto(`http://127.0.0.1:${PORT}${route}`, {
        waitUntil: "networkidle0",
        timeout: 30000,
      });

      await page.waitForSelector("h1", { timeout: 10000 });

      try {
        await page.waitForFunction(
          () => {
            const el = document.querySelector('meta[property="og:title"]');
            return el && el.getAttribute("content") && el.getAttribute("content").length > 0;
          },
          { timeout: 10000 }
        );
        console.log(`  og:title meta tag detected in DOM`);
      } catch (err) {
        console.error(`  WARNING: Timed out waiting for og:title meta tag on ${route}. Helmet may not have rendered. Error: ${err.message}`);
      }

      await page.evaluate(() => {
        const dedup = (attr, val) => {
          const els = document.querySelectorAll(`meta[${attr}="${val}"]`);
          if (els.length > 1) {
            for (let i = 0; i < els.length - 1; i++) els[i].remove();
          }
        };

        dedup("property", "og:title");
        dedup("property", "og:description");
        dedup("property", "og:url");
        dedup("property", "og:type");
        dedup("name", "description");
        dedup("name", "twitter:card");
        dedup("name", "twitter:title");
        dedup("name", "twitter:description");
        dedup("name", "twitter:url");

        // Dedup canonical link tags (keep the last one, set by setSeoMeta)
        const canonicals = document.querySelectorAll('link[rel="canonical"]');
        if (canonicals.length > 1) {
          for (let i = 0; i < canonicals.length - 1; i++) canonicals[i].remove();
        }
      });

      const html = await page.content();

      const outDir = join(DIST_DIR, route);
      mkdirSync(outDir, { recursive: true });
      const outFile = join(outDir, "index.html");
      writeFileSync(outFile, html, "utf-8");

      console.log(`  -> Written to ${outFile}`);

      const results = await page.evaluate((checks) => {
        return checks.map(({ selector, attr, label }) => {
          const el = document.querySelector(selector);
          if (!el) return { label, value: null, ok: false };
          const value = attr ? el.getAttribute(attr) : el.textContent;
          return { label, value: value || "", ok: !!value && value.trim().length > 0 };
        });
      }, REQUIRED_META);

      let allOk = true;
      for (const r of results) {
        const status = r.ok ? "OK" : "MISSING";
        console.log(`  ${status}: ${r.label} = ${r.value ?? "(not found)"}`);
        if (!r.ok) allOk = false;
      }

      if (!allOk) {
        console.error(`  ERROR: Route ${route} is missing required meta tags!`);
      }

      await page.close();
    }

    console.log(`\nPrerender complete: wrote ${ROUTES.length} routes`);
  } finally {
    await browser.close();
    server.close();
  }
}

prerender().catch((err) => {
  console.error("Prerender failed:", err);
  process.exit(1);
});
