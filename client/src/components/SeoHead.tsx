import { Helmet } from "react-helmet-async";

const SITE_URL = "https://odigos.replit.app";

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
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  );
}
