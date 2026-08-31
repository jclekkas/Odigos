/**
 * Renders every known route to a static HTML file so the prototype ships real
 * markup and real metadata rather than an empty SPA shell, and writes a
 * sitemap and robots.txt from the same route list.
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const distDir = join(root, 'dist');
const ssrEntry = join(root, 'dist-ssr', 'entry-server.js');

if (!existsSync(ssrEntry)) {
  throw new Error('SSR bundle missing — run the client and SSR builds before prerendering.');
}

const { render, staticRoutes: routes, site } = await import(pathToFileURL(ssrEntry).href);

const template = readFileSync(join(distDir, 'index.html'), 'utf8');

const esc = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const ORIGIN = site.origin;

function head(seo, route) {
  if (!seo) return '';
  const canonical = `${ORIGIN}${route === '/' ? '/' : route}`;
  const tags = [
    `<title>${esc(seo.title)}</title>`,
    `<meta name="description" content="${esc(seo.description)}" />`,
    `<link rel="canonical" href="${esc(canonical)}" />`,
    `<meta property="og:site_name" content="Somos Early Learning" />`,
    `<meta property="og:type" content="${esc(seo.ogType ?? 'website')}" />`,
    `<meta property="og:title" content="${esc(seo.title)}" />`,
    `<meta property="og:description" content="${esc(seo.description)}" />`,
    `<meta property="og:url" content="${esc(canonical)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
  ];
  for (const block of seo.jsonLd ?? []) {
    tags.push(
      `<script type="application/ld+json" data-seo-jsonld="true">${JSON.stringify(block).replace(/</g, '\\u003c')}</script>`
    );
  }
  return tags.join('\n    ');
}

let count = 0;
for (const route of routes) {
  const { html, seo } = render(route);
  const page = template
    .replace(/<title>[\s\S]*?<\/title>\s*/, '')
    .replace(/<meta\s+name="description"[\s\S]*?\/>\s*/, '')
    .replace('<!--app-head-->', head(seo, route))
    .replace('<!--app-html-->', html);

  if (route === '/') {
    writeFileSync(join(distDir, 'index.html'), page);
  } else {
    // Both shapes, so the output works on hosts that resolve directory
    // indexes (Netlify) and on those that only serve exact files.
    const dirPath = join(distDir, route, 'index.html');
    mkdirSync(dirname(dirPath), { recursive: true });
    writeFileSync(dirPath, page);
    const flatPath = join(distDir, `${route}.html`);
    mkdirSync(dirname(flatPath), { recursive: true });
    writeFileSync(flatPath, page);
  }
  count += 1;
}

// 404 page for Netlify.
{
  const { html, seo } = render('/this-route-does-not-exist');
  const page = template
    .replace(/<title>[\s\S]*?<\/title>\s*/, '')
    .replace(/<meta\s+name="description"[\s\S]*?\/>\s*/, '')
    .replace('<!--app-head-->', head(seo, '/404'))
    .replace('<!--app-html-->', html);
  writeFileSync(join(distDir, '404.html'), page);
}

const today = new Date().toISOString().slice(0, 10);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (route) => `  <url>
    <loc>${ORIGIN}${route === '/' ? '/' : route}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${route === '/' ? '1.0' : route.startsWith('/locations') ? '0.9' : '0.7'}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;
writeFileSync(join(distDir, 'sitemap.xml'), sitemap);

writeFileSync(
  join(distDir, 'robots.txt'),
  `User-agent: *\nAllow: /\n\nSitemap: ${ORIGIN}/sitemap.xml\n`
);

rmSync(join(root, 'dist-ssr'), { recursive: true, force: true });

console.log(`prerendered ${count} routes + 404.html, sitemap.xml, robots.txt`);
