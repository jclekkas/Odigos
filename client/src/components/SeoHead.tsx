import { Helmet } from "react-helmet-async";

const SITE_URL = "https://odigos.replit.app";
const OG_IMAGE = "https://odigos.replit.app/og-image.png";
const OG_IMAGE_ALT = "Odigos — Independent car deal analysis tool";

interface SeoHeadProps {
  title: string;
  description: string;
  path: string;
}

export default function SeoHead({ title, description, path }: SeoHeadProps) {
  const url = `${SITE_URL}${path}`;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
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
