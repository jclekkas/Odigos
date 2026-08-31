import { createContext, useContext, useEffect } from 'react';
import { site } from '@/data/site';

export type SeoInput = {
  title: string;
  description: string;
  path: string;
  jsonLd?: Record<string, unknown>[];
  ogType?: 'website' | 'article';
};

export type SeoStore = { current: SeoInput | null };

export const SeoContext = createContext<SeoStore | null>(null);

function upsertMeta(selector: string, attrs: Record<string, string>) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    document.head.appendChild(el);
  }
  Object.entries(attrs).forEach(([k, v]) => el!.setAttribute(k, v));
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
}

/**
 * Declares the page's metadata. During prerendering the values are collected
 * and written into the static HTML; in the browser they are applied on route
 * change so shared links and back/forward navigation stay correct.
 */
export function Seo(props: SeoInput) {
  const store = useContext(SeoContext);
  if (store) store.current = props;

  const { title, description, path, jsonLd, ogType = 'website' } = props;
  const canonical = `${site.origin}${path === '/' ? '/' : path}`;
  const serialized = JSON.stringify(jsonLd ?? []);

  useEffect(() => {
    document.title = title;
    upsertMeta('meta[name="description"]', { name: 'description', content: description });
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: title });
    upsertMeta('meta[property="og:description"]', {
      property: 'og:description',
      content: description,
    });
    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: ogType });
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: canonical });
    upsertMeta('meta[property="og:site_name"]', { property: 'og:site_name', content: site.name });
    upsertMeta('meta[name="twitter:card"]', {
      name: 'twitter:card',
      content: 'summary_large_image',
    });
    upsertLink('canonical', canonical);

    document
      .querySelectorAll('script[data-seo-jsonld]')
      .forEach((node) => node.remove());
    const blocks = JSON.parse(serialized) as Record<string, unknown>[];
    blocks.forEach((block) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.dataset.seoJsonld = 'true';
      script.textContent = JSON.stringify(block);
      document.head.appendChild(script);
    });
  }, [title, description, canonical, ogType, serialized]);

  return null;
}
