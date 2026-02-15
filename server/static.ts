import express, { type Express } from "express";
import fs from "fs";
import path from "path";

const PRERENDERED_ROUTES = [
  "/dealer-pricing-tactics",
  "/dealer-wont-give-otd-price",
];

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  app.use("*", (req, res) => {
    const rawPath = req.originalUrl.split("?")[0].replace(/\/+$/, "") || "/";

    if (PRERENDERED_ROUTES.includes(rawPath)) {
      const prerenderedFile = path.join(distPath, rawPath, "index.html");
      if (fs.existsSync(prerenderedFile)) {
        return res.sendFile(prerenderedFile);
      }
    }

    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
