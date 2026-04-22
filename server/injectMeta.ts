import { getSeoMeta } from "../shared/seoMetadata.js";
import { CANONICAL_ORIGIN } from "../shared/siteConfig.js";

/**
 * Replace the generic SPA shell metadata with page-specific values.
 * Always emits a canonical + og:url — falls back to a self-referencing
 * canonical built from the pathname when no explicit metadata exists,
 * so every response has one instead of letting Google pick its own.
 */
export function injectSeoMeta(html: string, pathname: string): string {
  const meta = getSeoMeta(pathname);
  const normalizedPath =
    pathname === "/" ? "/" : pathname.replace(/\/$/, "");
  const canonical = meta?.canonical ?? `${CANONICAL_ORIGIN}${normalizedPath}`;

  let out = html;

  if (meta) {
    out = out.replace(
      /<title>[^<]*<\/title>/,
      `<title>${escHtml(meta.title)}</title>`,
    );

    out = out.replace(
      /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
      `<meta name="description" content="${escAttr(meta.description)}" />`,
    );

    out = out.replace(
      /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/,
      `<meta property="og:title" content="${escAttr(meta.title)}" />`,
    );

    out = out.replace(
      /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/,
      `<meta property="og:description" content="${escAttr(meta.description)}" />`,
    );

    out = out.replace(
      /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/,
      `<meta name="twitter:title" content="${escAttr(meta.title)}" />`,
    );

    out = out.replace(
      /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/,
      `<meta name="twitter:description" content="${escAttr(meta.description)}" />`,
    );
  }

  if (out.includes('rel="canonical"')) {
    out = out.replace(
      /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/,
      `<link rel="canonical" href="${escAttr(canonical)}" />`,
    );
  } else {
    out = out.replace(
      "</head>",
      `  <link rel="canonical" href="${escAttr(canonical)}" />\n  </head>`,
    );
  }

  if (out.includes('property="og:url"')) {
    out = out.replace(
      /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/,
      `<meta property="og:url" content="${escAttr(canonical)}" />`,
    );
  } else {
    out = out.replace(
      "</head>",
      `  <meta property="og:url" content="${escAttr(canonical)}" />\n  </head>`,
    );
  }

  return out;
}

function escHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escAttr(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
