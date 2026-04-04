import express, { type Express, type Response } from "express";
import fs from "fs";
import path from "path";
import { isKnownRoute } from "../shared/routes";

/** Inject the per-request CSP nonce into every <script tag in the HTML. */
function injectNonce(html: string, res: Response): string {
  const nonce = res.locals.cspNonce as string | undefined;
  if (!nonce) return html;
  return html.replace(/<script/g, `<script nonce="${nonce}"`);
}

const PRERENDERED_ROUTES = [
  "/dealer-pricing-tactics",
  "/dealer-wont-give-otd-price",
  "/are-dealer-add-ons-mandatory",
];

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use((req, res, next) => {
    const rawPath = req.path;

    if (rawPath === "/pricing") {
      return res.redirect(301, "/#pricing");
    }

    if (rawPath === "/dealer-tactics") {
      return res.redirect(301, "/dealer-pricing-tactics");
    }

    for (const route of PRERENDERED_ROUTES) {
      if (rawPath === `${route}/`) {
        const qs = req.originalUrl.includes("?")
          ? req.originalUrl.slice(req.originalUrl.indexOf("?"))
          : "";
        return res.redirect(301, `${route}${qs}`);
      }

      if (rawPath === route) {
        const prerenderedFile = path.join(distPath, route, "index.html");
        if (fs.existsSync(prerenderedFile)) {
          const html = fs.readFileSync(prerenderedFile, "utf-8");
          return res.type("html").send(injectNonce(html, res));
        }
      }
    }

    next();
  });

  app.use(express.static(distPath, { redirect: false }));

  app.use("*", (req, res) => {
    const pathname = req.originalUrl.split("?")[0];
    const status = isKnownRoute(pathname) ? 200 : 404;
    const html = fs.readFileSync(path.resolve(distPath, "index.html"), "utf-8");
    res.status(status).type("html").send(injectNonce(html, res));
  });
}
