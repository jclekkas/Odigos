import { createServer } from "http";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, resolve } from "path";
import puppeteer from "puppeteer-core";

const DIST_DIR = resolve("dist/public");
const CHROMIUM_PATH = process.env.CHROMIUM_PATH || "/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium";

const ROUTES = [
  "/dealer-pricing-tactics",
  "/dealer-wont-give-otd-price",
  "/are-dealer-add-ons-mandatory",
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
