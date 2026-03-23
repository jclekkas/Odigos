const SITE_URL = import.meta.env.VITE_SITE_URL || "https://odigos.replit.app";
const OG_IMAGE = "https://odigos.replit.app/og-image.png";
const OG_IMAGE_ALT = "Odigos — Independent car deal analysis tool";

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

  const url = `${SITE_URL}${path}`;

  const descEl = upsertMeta("description", description, false);
  const ogTitle = upsertMeta("og:title", title);
  const ogDesc = upsertMeta("og:description", description);
  const ogUrl = upsertMeta("og:url", url);
  const ogType = upsertMeta("og:type", "article");
  const ogImage = upsertMeta("og:image", OG_IMAGE);
  const ogImageAlt = upsertMeta("og:image:alt", OG_IMAGE_ALT);
  const twCard = upsertMeta("twitter:card", "summary_large_image", false);
  const twTitle = upsertMeta("twitter:title", title, false);
  const twDesc = upsertMeta("twitter:description", description, false);
  const twImage = upsertMeta("twitter:image", OG_IMAGE, false);
  const canonical = upsertCanonical(url);

  return () => {
    document.title = "Free Car Deal Analyzer — Check Hidden Fees Before You Sign | Odigos";
    descEl.setAttribute("content", "Paste dealer texts or emails. Odigos flags what's missing, risky, or unclear before you go to the dealership.");
    [ogTitle, ogDesc, ogUrl, ogType, ogImage, ogImageAlt, twCard, twTitle, twDesc, twImage].forEach((el) => el.remove());
    canonical.remove();
  };
}
