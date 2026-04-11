import { build as esbuild } from "esbuild";
import { build as viteBuild } from "vite";
import { rm, readFile, rename } from "fs/promises";
import { existsSync } from "fs";
import { execSync } from "child_process";

// server deps to bundle to reduce openat(2) syscalls
// which helps cold start times
const allowlist = [
  "@google/generative-ai",
  "axios",
  "cors",
  "date-fns",
  "drizzle-orm",
  "drizzle-zod",
  "express",
  "express-rate-limit",
  "jsonwebtoken",
  "multer",
  "nanoid",
  "nodemailer",
  "openai",
  "pg",
  "stripe",
  "uuid",
  "ws",
  "xlsx",
  "zod",
  "zod-validation-error",
];

async function buildAll() {
  await rm("dist", { recursive: true, force: true });

  console.log("building client...");
  await viteBuild();

  console.log("prerendering SEO routes (skipped if Chromium unavailable)...");
  try {
    execSync("node scripts/prerender.mjs", { stdio: "inherit" });
  } catch (err) {
    console.warn(
      "Prerender skipped (Chromium not available). Server-side meta injection will handle SEO metadata.",
    );
  }

  // Rename the SPA shell so Vercel doesn't serve it as a static directory
  // index for `/`, which would bypass server-side meta injection. The Express
  // catch-all reads from this renamed file and injects per-route meta tags.
  if (existsSync("dist/public/index.html")) {
    console.log("renaming dist/public/index.html → dist/public/_shell.html...");
    await rename("dist/public/index.html", "dist/public/_shell.html");
  }

  console.log("building server...");
  const pkg = JSON.parse(await readFile("package.json", "utf-8"));
  const allDeps = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
  ];
  const externals = allDeps.filter((dep) => !allowlist.includes(dep));

  await esbuild({
    entryPoints: ["server/index.ts"],
    platform: "node",
    bundle: true,
    format: "cjs",
    outfile: "dist/index.cjs",
    define: {
      "process.env.NODE_ENV": '"production"',
    },
    minify: true,
    external: externals,
    logLevel: "info",
  });
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
