const SITE_URL = import.meta.env.VITE_SITE_URL || "https://odigos.replit.app";

const PUBLISHER = { "@type": "Organization", name: "Odigos", url: SITE_URL };
const AUTHOR = { "@type": "Organization", name: "Odigos Editorial Team" };

export function articleSchema(headline: string, datePublished = "2024-06-01", dateModified = "2025-03-01") {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    author: AUTHOR,
    publisher: PUBLISHER,
    datePublished,
    dateModified,
  };
}

export function productSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Odigos Deal Analysis",
    description:
      "Expert review of your car dealer quote — flags hidden fees, missing out-the-door pricing, and common dealership tactics.",
    brand: { "@type": "Brand", name: "Odigos" },
    offers: {
      "@type": "Offer",
      price: "49",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: `${SITE_URL}/analyze`,
    },
  };
}

export function howToSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to check your car dealer quote",
    description:
      "Use Odigos to review a dealer quote for hidden fees, missing out-the-door pricing, and common dealership tactics.",
    step: [
      {
        "@type": "HowToStep",
        name: "Paste your dealer quote",
        text: "Copy the full dealer quote, email, or text message and paste it into the Odigos analyzer.",
      },
      {
        "@type": "HowToStep",
        name: "Review the extracted fees",
        text: "Odigos identifies every line item — vehicle price, doc fee, taxes, registration, and any dealer add-ons — and checks each against expected ranges.",
      },
      {
        "@type": "HowToStep",
        name: "Check your GO/NO-GO rating",
        text: "Odigos rates the deal and flags any fees that are missing, unclear, or above typical ranges for your state.",
      },
      {
        "@type": "HowToStep",
        name: "Use the suggested dealer reply",
        text: "Odigos generates a ready-to-send message asking for the missing information or a better all-in price.",
      },
    ],
  };
}

export function itemListSchema(
  name: string,
  url: string,
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    url,
    numberOfItems: items.length,
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      url: item.url,
    })),
  };
}

export function faqPageSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}

export function injectJsonLd(schema: object): () => void {
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
  return () => script.remove();
}
