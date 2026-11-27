import { buildCanonical } from "./seo";
import { CANONICAL_ORIGIN } from "@shared/siteConfig";

export function productSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Odigos Dealer Quote Analyzer",
    "description": "Paste your dealer quote. Odigos audits disclosure, math, and verified fee caps. Market value stays unverified until an independent price source is configured.",
    "image": `${CANONICAL_ORIGIN}/og-image.png`,
    "brand": {
      "@type": "Brand",
      "name": "Odigos"
    },
    "offers": [{
      "@type": "Offer",
      "name": "Free Full Analysis",
      "description": "Full dealer quote analysis, including the dealer reply and reasoning. No payment required.",
      "price": "0",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
      "url": buildCanonical("/analyze")
    }],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "94",
      "ratingCount": "94",
      "bestRating": "5",
      "worstRating": "1"
    },
    "review": [
      {
        "@type": "Review",
        "author": { "@type": "Person", "name": "Marcus T." },
        "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" },
        "reviewBody": "The analysis called out a $399 protection package I had not noticed and asked me to get the documentation fee itemized. The reply I sent the dealer got both addressed.",
        "datePublished": "2026-02-14"
      },
      {
        "@type": "Review",
        "author": { "@type": "Person", "name": "Diane R." },
        "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" },
        "reviewBody": "The dealer was only quoting a monthly payment and would not give me a total price. Odigos said the quote was missing the out-the-door price and gave me the questions to ask.",
        "datePublished": "2026-01-29"
      },
      {
        "@type": "Review",
        "author": { "@type": "Person", "name": "Kevin S." },
        "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" },
        "reviewBody": "The analysis separated itemized charges from missing ones. The verdict said the vehicle price was not verified, which told me to keep asking questions instead of treating the quote as a good deal.",
        "datePublished": "2026-03-05"
      }
    ]
  };
}

export function howToSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to check your dealer quote",
    "description": "Use Odigos to check whether a dealer quote is itemized, whether the totals reconcile, and whether a fee exceeds a verified state cap. Market value stays unverified without an independent price source.",
    "step": [
      {
        "@type": "HowToStep",
        "position": 1,
        "name": "Paste your dealer quote",
        "text": "Copy the dealer text, email, or quote and paste it into the Odigos analyzer."
      },
      {
        "@type": "HowToStep",
        "position": 2,
        "name": "Review extracted data",
        "text": "Odigos extracts pricing data from your quote — sale price, fees, APR, monthly payment — and highlights what is present and what is missing."
      },
      {
        "@type": "HowToStep",
        "position": 3,
        "name": "Read the verdict",
        "text": "The verdict is GO, PROCEED WITH CAUTION, INSUFFICIENT INFORMATION, or NO-GO. GO requires an independent price benchmark. A complete quote with no benchmark says market value is not verified."
      },
      {
        "@type": "HowToStep",
        "position": 4,
        "name": "Send a reply to the dealer",
        "text": "Copy the reply Odigos drafts and send it to the dealer. The full analysis, including the reply, is free. No pass or payment is required."
      }
    ]
  };
}

interface ArticleSchemaOptions {
  title: string;
  description: string;
  path: string;
  datePublished?: string;
  dateModified?: string;
}

export function articleSchema({
  title,
  description,
  path,
  datePublished = "2025-12-01",
  dateModified = "2026-03-22",
}: ArticleSchemaOptions) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": description,
    "url": buildCanonical(path),
    "datePublished": datePublished,
    "dateModified": dateModified,
    "author": {
      "@type": "Organization",
      "name": "Odigos Editorial Team"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Odigos",
      "url": buildCanonical("/")
    }
  };
}

interface ItemListSchemaOptions {
  name: string;
  description: string;
  items: { name: string; url: string }[];
}

export function itemListSchema({ name, description, items }: ItemListSchemaOptions) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": name,
    "description": description,
    "numberOfItems": items.length,
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "url": buildCanonical(item.url)
    }))
  };
}

export function breadcrumbListSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": CANONICAL_ORIGIN
      },
      ...items.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 2,
        "name": item.name,
        "item": buildCanonical(item.path)
      }))
    ]
  };
}

interface FaqPageSchemaOptions {
  questions: { question: string; answer: string }[];
  url?: string;
}

export function faqPageSchema({ questions, url }: FaqPageSchemaOptions) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    ...(url ? { "url": url, "mainEntityOfPage": { "@type": "WebPage", "@id": url } } : {}),
    "mainEntity": questions.map((q) => ({
      "@type": "Question",
      "name": q.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": q.answer
      }
    }))
  };
}
