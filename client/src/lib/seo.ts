const SITE_URL = "https://odigos.replit.app";

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
  const twCard = upsertMeta("twitter:card", "summary", false);
  const twTitle = upsertMeta("twitter:title", title, false);
  const twDesc = upsertMeta("twitter:description", description, false);
  const canonical = upsertCanonical(url);

  return () => {
    document.title = "Is This a Good Car Deal? | Odigos";
    descEl.setAttribute("content", "Paste dealer texts or emails. Odigos flags what's missing, risky, or unclear before you go to the dealership.");
    [ogTitle, ogDesc, ogUrl, ogType, twCard, twTitle, twDesc].forEach((el) => el.remove());
    canonical.remove();
  };
}
