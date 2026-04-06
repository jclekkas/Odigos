import { getSeoMeta } from "../shared/seoMetadata";

/**
 * Replace the generic SPA shell metadata with page-specific values.
 * If no metadata is found for the route, the HTML is returned unchanged.
 */
export function injectSeoMeta(html: string, pathname: string): string {
  const meta = getSeoMeta(pathname);
  if (!meta) return html;

  let out = html;

  // Replace <title>
  out = out.replace(
    /<title>[^<]*<\/title>/,
    `<title>${escHtml(meta.title)}</title>`,
  );

  // Replace meta description
  out = out.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
    `<meta name="description" content="${escAttr(meta.description)}" />`,
  );

  // Replace og:title
  out = out.replace(
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:title" content="${escAttr(meta.title)}" />`,
  );

  // Replace og:description
  out = out.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:description" content="${escAttr(meta.description)}" />`,
  );

  // Replace twitter:title
  out = out.replace(
    /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/,
    `<meta name="twitter:title" content="${escAttr(meta.title)}" />`,
  );

  // Replace twitter:description
  out = out.replace(
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/,
    `<meta name="twitter:description" content="${escAttr(meta.description)}" />`,
  );

  // Inject/replace canonical link
  if (out.includes('rel="canonical"')) {
    out = out.replace(
      /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/,
      `<link rel="canonical" href="${escAttr(meta.canonical)}" />`,
    );
  } else {
    out = out.replace(
      "</head>",
      `  <link rel="canonical" href="${escAttr(meta.canonical)}" />\n  </head>`,
    );
  }

  // Inject/replace og:url
  if (out.includes('property="og:url"')) {
    out = out.replace(
      /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/,
      `<meta property="og:url" content="${escAttr(meta.canonical)}" />`,
    );
  } else {
    out = out.replace(
      "</head>",
      `  <meta property="og:url" content="${escAttr(meta.canonical)}" />\n  </head>`,
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
