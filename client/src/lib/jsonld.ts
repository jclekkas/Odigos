import { buildCanonical } from "./seo";
import { CANONICAL_ORIGIN } from "@shared/siteConfig";

export function productSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Odigos Dealer Quote Analyzer",
    "description": "Paste your dealer quote. Odigos shows what's overpriced, what's illegal, and what to say back — with a GO/NO-GO verdict in 60 seconds.",
    "image": `${CANONICAL_ORIGIN}/og-image.png`,
    "brand": {
      "@type": "Brand",
      "name": "Odigos"
    },
    "offers": [
      {
        "@type": "Offer",
        "name": "Weekend Warrior Pass",
        "description": "72 hours of unlimited dealer quote analyses.",
        "price": "29",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock",
        "priceValidUntil": "2026-12-31",
        "url": buildCanonical("/?pass=weekend_warrior"),
        "hasMerchantReturnPolicy": {
          "@type": "MerchantReturnPolicy",
          "applicableCountry": "US",
          "returnPolicyCategory": "https://schema.org/MerchantReturnNotPermitted"
        },
        "shippingDetails": {
          "@type": "OfferShippingDetails",
          "shippingRate": { "@type": "MonetaryAmount", "value": "0", "currency": "USD" },
          "deliveryTime": {
            "@type": "ShippingDeliveryTime",
            "handlingTime": { "@type": "QuantitativeValue", "minValue": 0, "maxValue": 0, "unitCode": "DAY" },
            "transitTime": { "@type": "QuantitativeValue", "minValue": 0, "maxValue": 0, "unitCode": "DAY" }
          },
          "shippingDestination": { "@type": "DefinedRegion", "addressCountry": "US" }
        }
      },
      {
        "@type": "Offer",
        "name": "Car Buyer's Pass",
        "description": "14 days of unlimited dealer quote analyses. The default choice for buyers comparing multiple dealers.",
        "price": "49",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock",
        "priceValidUntil": "2026-12-31",
        "url": buildCanonical("/?pass=car_buyers_pass"),
        "hasMerchantReturnPolicy": {
          "@type": "MerchantReturnPolicy",
          "applicableCountry": "US",
          "returnPolicyCategory": "https://schema.org/MerchantReturnNotPermitted"
        },
        "shippingDetails": {
          "@type": "OfferShippingDetails",
          "shippingRate": { "@type": "MonetaryAmount", "value": "0", "currency": "USD" },
          "deliveryTime": {
            "@type": "ShippingDeliveryTime",
            "handlingTime": { "@type": "QuantitativeValue", "minValue": 0, "maxValue": 0, "unitCode": "DAY" },
            "transitTime": { "@type": "QuantitativeValue", "minValue": 0, "maxValue": 0, "unitCode": "DAY" }
          },
          "shippingDestination": { "@type": "DefinedRegion", "addressCountry": "US" }
        }
      }
    ],
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
        "reviewBody": "Caught two fees I had no idea were optional — a $399 protection package and an inflated doc fee. The copy-paste reply I sent the dealer got both removed. Paid for itself in about 60 seconds.",
        "datePublished": "2026-02-14"
      },
      {
        "@type": "Review",
        "author": { "@type": "Person", "name": "Diane R." },
        "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" },
        "reviewBody": "The dealer was only quoting monthly payment and wouldn't give me a total price. Odigos flagged it immediately and gave me the exact questions to ask. Ended up saving over $1,200 on the final deal.",
        "datePublished": "2026-01-29"
      },
      {
        "@type": "Review",
        "author": { "@type": "Person", "name": "Kevin S." },
        "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" },
        "reviewBody": "I've bought cars before but never knew how many fees were negotiable. The analysis was clear and the GO/NO-GO verdict helped me decide whether to keep negotiating or walk. Worth every dollar.",
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
    "description": "Use Odigos to check a car dealer quote for overpriced fees, illegal charges, and missing details — and get the exact response to send back.",
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
        "text": "Unlock the full review with a pass (Weekend Warrior or Car Buyer's Pass) to get a copy-paste reply you can send directly to the dealer requesting the missing information or pushing back on fees."
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
