import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { isKnownRoute } from "../shared/routes";

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
          return res.sendFile(prerenderedFile);
        }
      }
    }

    next();
  });

  app.use(express.static(distPath, { redirect: false }));

  app.use("*", (req, res) => {
    const pathname = req.originalUrl.split("?")[0];
    const status = isKnownRoute(pathname) ? 200 : 404;
    res.status(status).sendFile(path.resolve(distPath, "index.html"));
  });
}
