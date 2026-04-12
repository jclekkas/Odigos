const CANONICAL_ORIGIN = "https://odigosauto.com";
const OG_IMAGE = "https://odigosauto.com/og-image.png";
const OG_IMAGE_ALT = "Odigos — Independent dealer quote analyzer";

export function buildCanonical(path: string): string {
  const normalized = path.endsWith("/") && path !== "/" ? path.slice(0, -1) : path;
  return `${CANONICAL_ORIGIN}${normalized}`;
}

interface SeoMeta {
  title: string;
  description: string;
  path: string;
}

function upsertMeta(property: string, content: string, isOg = true): HTMLMetaElement {
  const attr = isOg ? "property" : "name";
  let el = document.querySelector(`meta[${attr}="${property}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, property);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
  return el;
}

function upsertCanonical(href: string): HTMLLinkElement {
  let el = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
  return el;
}

export function setSeoMeta({ title, description, path }: SeoMeta) {
  document.title = title;

  const url = buildCanonical(path);

  upsertMeta("description", description, false);
  upsertMeta("og:title", title);
  upsertMeta("og:description", description);
  upsertMeta("og:url", url);
  upsertMeta("og:type", "article");
  upsertMeta("og:image", OG_IMAGE);
  upsertMeta("og:image:alt", OG_IMAGE_ALT);
  upsertMeta("twitter:card", "summary_large_image", false);
  upsertMeta("twitter:title", title, false);
  upsertMeta("twitter:description", description, false);
  upsertMeta("twitter:image", OG_IMAGE, false);
  upsertCanonical(url);
}
