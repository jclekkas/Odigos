const SITE_URL = "https://odigos.replit.app";

export function productSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Odigos Deal Analysis",
    "description": "AI-powered car dealer quote analysis. Paste a dealer quote, email, or text and get an instant GO/NO-GO recommendation with hidden fee detection.",
    "brand": {
      "@type": "Brand",
      "name": "Odigos"
    },
    "offers": {
      "@type": "Offer",
      "price": "49",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
      "priceValidUntil": "2026-12-31",
      "url": `${SITE_URL}/`
    }
  };
}

export function howToSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to check your dealer quote",
    "description": "Use Odigos to analyze a car dealer quote and get an instant GO/NO-GO recommendation before visiting the dealership.",
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
        "name": "Get a GO/NO-GO verdict",
        "text": "Receive an instant Green, Yellow, or Red verdict with a deal score and confidence level based on pricing transparency and completeness."
      },
      {
        "@type": "HowToStep",
        "position": 4,
        "name": "Send a reply to the dealer",
        "text": "Unlock the full review to get a copy-paste reply you can send directly to the dealer requesting the missing information or pushing back on fees."
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
    "url": `${SITE_URL}${path}`,
    "datePublished": datePublished,
    "dateModified": dateModified,
    "author": {
      "@type": "Organization",
      "name": "Odigos Editorial Team"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Odigos",
      "url": SITE_URL
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
      "url": `${SITE_URL}${item.url}`
    }))
  };
}

interface FaqPageSchemaOptions {
  questions: { question: string; answer: string }[];
}

export function faqPageSchema({ questions }: FaqPageSchemaOptions) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
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
