/**
 * CANONICAL POLICY (DO NOT VIOLATE):
 *
 * `setSeoMeta()` from `client/src/lib/seo.ts` is the SOLE mechanism for writing
 * canonical tags, og:url, and page-level meta. Every page component must use
 * `setSeoMeta()` inside a `useEffect` — never `SeoHead` for canonical.
 *
 * `SeoHead` intentionally does NOT write a canonical tag so that the imperative
 * DOM mechanism in `setSeoMeta` remains the single source of truth, preventing
 * duplicate or conflicting canonical tags during SPA navigation.
 *
 * This component is kept only for backward-compatibility. Prefer `setSeoMeta`
 * for all new pages.
 */
import { Helmet } from "react-helmet-async";
import { buildCanonical } from "@/lib/seo";

const OG_IMAGE = "https://odigosauto.com/og-image.png";
const OG_IMAGE_ALT = "Odigos — Independent car deal analysis tool";

interface SeoHeadProps {
  title: string;
  description: string;
  path: string;
}

export default function SeoHead({ title, description, path }: SeoHeadProps) {
  const url = buildCanonical(path);

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="article" />
      <meta property="og:image" content={OG_IMAGE} />
      <meta property="og:image:alt" content={OG_IMAGE_ALT} />
      <meta property="og:site_name" content="Odigos" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={OG_IMAGE} />
    </Helmet>
  );
}
