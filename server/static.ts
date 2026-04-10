import express, { type Express, type Response } from "express";
import fs from "fs";
import path from "path";
import { isKnownRoute } from "../shared/routes";
import { injectSeoMeta } from "./injectMeta";

/** Inject the per-request CSP nonce into every <script tag in the HTML. */
function injectNonce(html: string, res: Response): string {
  const nonce = res.locals.cspNonce as string | undefined;
  if (!nonce) return html;
  return html.replace(/<script/g, `<script nonce="${nonce}"`);
}

/**
 * Scan dist/public at startup to discover all prerendered routes.
 * A prerendered route is any subdirectory containing an index.html file.
 */
function discoverPrerenderedRoutes(distPath: string): Set<string> {
  const routes = new Set<string>();
  if (!fs.existsSync(distPath)) return routes;

  function scan(dir: string, prefix: string) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const childPath = path.join(dir, entry.name);
      const routePath = `${prefix}/${entry.name}`;
      if (fs.existsSync(path.join(childPath, "index.html"))) {
        routes.add(routePath);
      }
      scan(childPath, routePath);
    }
  }

  scan(distPath, "");
  return routes;
}

export function serveStatic(app: Express) {
  // On Vercel serverless, __dirname points to the function bundle directory,
  // not the build output. Use process.cwd() which maps to /var/task/ where
  // includeFiles are placed. On Replit/local, __dirname is dist/ so both work.
  const distPath = process.env.VERCEL
    ? path.resolve(process.cwd(), "dist", "public")
    : path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  const prerenderedRoutes = discoverPrerenderedRoutes(distPath);
  console.log(`Discovered ${prerenderedRoutes.size} prerendered routes`);

  app.use((req, res, next) => {
    const rawPath = req.path;

    if (rawPath === "/pricing") {
      return res.redirect(301, "/#pricing");
    }

    if (rawPath === "/dealer-tactics") {
      return res.redirect(301, "/dealer-pricing-tactics");
    }

    if (rawPath === "/out-the-door-price-calculator") {
      return res.redirect(301, "/out-the-door-price");
    }

    if (rawPath === "/what-is-a-fair-price-for-a-car") {
      return res.redirect(301, "/how-much-should-you-pay-for-a-car");
    }

    if (rawPath === "/mandatory-dealer-add-ons") {
      return res.redirect(301, "/are-dealer-add-ons-mandatory");
    }

    if (rawPath === "/how-to-tell-if-a-car-deal-is-good" || rawPath === "/best-way-to-check-if-a-car-deal-is-good") {
      return res.redirect(301, "/is-this-a-good-car-deal");
    }

    if (rawPath === "/what-is-a-dealer-doc-fee") {
      return res.redirect(301, "/dealer-doc-fee");
    }

    if (rawPath === "/dealer-wont-give-otd") {
      return res.redirect(301, "/why-dealers-wont-give-out-the-door-price");
    }

    // Normalize trailing slash
    const normalized =
      rawPath.length > 1 && rawPath.endsWith("/")
        ? rawPath.slice(0, -1)
        : rawPath;

    // Redirect trailing-slash variants of prerendered routes
    if (rawPath !== normalized && prerenderedRoutes.has(normalized)) {
      const qs = req.originalUrl.includes("?")
        ? req.originalUrl.slice(req.originalUrl.indexOf("?"))
        : "";
      return res.redirect(301, `${normalized}${qs}`);
    }

    // Serve prerendered HTML if available
    if (prerenderedRoutes.has(normalized)) {
      const prerenderedFile = path.join(distPath, normalized, "index.html");
      let html = fs.readFileSync(prerenderedFile, "utf-8");
      html = injectSeoMeta(html, normalized);
      return res.type("html").send(injectNonce(html, res));
    }

    next();
  });

  app.use(express.static(distPath, { redirect: false, index: false }));

  app.use("*", (req, res) => {
    const pathname = req.originalUrl.split("?")[0];
    const status = isKnownRoute(pathname) ? 200 : 404;
    let html = fs.readFileSync(path.resolve(distPath, "index.html"), "utf-8");
    html = injectSeoMeta(html, pathname);
    res.status(status).type("html").send(injectNonce(html, res));
  });
}
