/**
 * Shared glossary term SEO data.
 * Consumed by the server (getSeoMeta / injectMeta) and optionally by the
 * client (glossary-terms.ts) so that both sides agree on titles & descriptions.
 *
 * IMPORTANT: this module must not import from client/ or server/ to avoid
 * circular dependencies.
 */

export interface GlossaryTermSeo {
  slug: string;
  seoTitle: string;
  seoDescription: string;
}

export const GLOSSARY_TERMS_SEO: GlossaryTermSeo[] = [
  {
    slug: "junk-fee",
    seoTitle: "What Is a Junk Fee? Car Dealer Junk Fees Explained | Odigos",
    seoDescription:
      "A junk fee is a hidden or surprise charge that provides little value. Learn how to spot and fight back against dealer junk fees.",
  },
  {
    slug: "doc-fee",
    seoTitle: "What Is a Doc Fee? Dealer Documentation Fee Explained | Odigos",
    seoDescription:
      "A doc fee is a dealer-set paperwork charge, not a government fee. Learn what it covers, state caps, and typical ranges.",
  },
  {
    slug: "out-the-door-price",
    seoTitle: "What Is Out-the-Door Price? OTD Price Explained | Odigos",
    seoDescription:
      "Out-the-door price (OTD) is the total you pay including all taxes and fees. Learn what it includes and why it matters.",
  },
  {
    slug: "market-adjustment",
    seoTitle: "What Is a Market Adjustment? Dealer ADM Explained | Odigos",
    seoDescription:
      "A market adjustment is a dealer markup above MSRP. Learn what it is, why dealers charge it, and how to avoid it.",
  },
  {
    slug: "money-factor",
    seoTitle: "What Is a Money Factor? Lease Interest Rate Explained | Odigos",
    seoDescription:
      "The money factor is the interest rate on a car lease. Multiply by 2,400 to get the APR equivalent. Learn how it works.",
  },
  {
    slug: "residual-value",
    seoTitle:
      "What Is Residual Value? Car Lease Residual Explained | Odigos",
    seoDescription:
      "Residual value is the predicted value of a leased car at lease end. Learn how it affects your monthly payment and buyout price.",
  },
  {
    slug: "acquisition-fee",
    seoTitle:
      "What Is an Acquisition Fee? Lease Inception Fee Explained | Odigos",
    seoDescription:
      "An acquisition fee is a one-time lease initiation charge from the leasing company. Learn typical amounts and what to expect.",
  },
  {
    slug: "disposition-fee",
    seoTitle: "What Is a Disposition Fee? Lease-End Fee Explained | Odigos",
    seoDescription:
      "A disposition fee is charged when you return a leased car. Typically $300-$500, waived if you buy or re-lease. Learn more.",
  },
  {
    slug: "dealer-prep-fee",
    seoTitle:
      "What Is a Dealer Prep Fee? Pre-Delivery Fee Explained | Odigos",
    seoDescription:
      "A dealer prep fee is a charge for cleaning and inspecting a car before delivery. Learn why it's often considered a junk fee.",
  },
  {
    slug: "gap-insurance",
    seoTitle:
      "What Is GAP Insurance? Guaranteed Asset Protection Explained | Odigos",
    seoDescription:
      "GAP insurance covers the difference between what you owe and what your car is worth. Learn when it's needed and where to buy it.",
  },
  {
    slug: "msrp",
    seoTitle:
      "What Is MSRP? Manufacturer's Suggested Retail Price Explained | Odigos",
    seoDescription:
      "MSRP is the manufacturer's suggested retail price — the sticker price on a new car. Learn how it differs from what you actually pay.",
  },
  {
    slug: "invoice-price",
    seoTitle: "What Is Invoice Price? Dealer Cost Explained | Odigos",
    seoDescription:
      "Invoice price is what the dealer pays the manufacturer for a car. Learn how to use it to negotiate a better deal.",
  },
  {
    slug: "destination-charge",
    seoTitle:
      "What Is a Destination Charge? Car Delivery Fee Explained | Odigos",
    seoDescription:
      "A destination charge is a manufacturer-set shipping fee, typically $1,000-$2,000. Learn why it's non-negotiable and how it differs from dealer fees.",
  },
  {
    slug: "trade-in-tax-credit",
    seoTitle:
      "What Is a Trade-In Tax Credit? Sales Tax Savings Explained | Odigos",
    seoDescription:
      "Most states let you pay sales tax only on the difference after a trade-in. Learn which states offer this credit and how much you can save.",
  },
  {
    slug: "nitrogen-tire-fill",
    seoTitle:
      "Is Nitrogen Tire Fill Worth It? Dealer Add-On Explained | Odigos",
    seoDescription:
      "Nitrogen tire fill costs $50-$300 at dealers but provides negligible benefit. Learn why it's a common junk fee and how to decline it.",
  },
  {
    slug: "vin-etching",
    seoTitle: "Is VIN Etching Worth It? Dealer Add-On Explained | Odigos",
    seoDescription:
      "VIN etching costs $100-$400 at dealers but DIY kits are $20-$30. Learn why it's a junk fee and how to decline it.",
  },
  {
    slug: "paint-protection",
    seoTitle:
      "Is Dealer Paint Protection Worth It? Ceramic Coating Explained | Odigos",
    seoDescription:
      "Dealer paint protection is typically a low-quality spray-on marked up significantly. Learn when ceramic coating is worth it and where to get it.",
  },
  {
    slug: "extended-warranty",
    seoTitle:
      "Is a Dealer Extended Warranty Worth It? Service Contract Explained | Odigos",
    seoDescription:
      "Extended warranties are often overpriced at dealers. Learn what they cover, when they're worth it, and how to get a better price.",
  },
  {
    slug: "capitalized-cost",
    seoTitle:
      "What Is Capitalized Cost? Lease Cap Cost Explained | Odigos",
    seoDescription:
      "Capitalized cost is the negotiated vehicle price in a lease. Learn how it affects your payment and how to negotiate it down.",
  },
  {
    slug: "early-termination-fee",
    seoTitle:
      "What Is a Lease Early Termination Fee? Penalties Explained | Odigos",
    seoDescription:
      "Ending a lease early can cost thousands. Learn what early termination fees include and cheaper alternatives like lease transfers.",
  },
  {
    slug: "reconditioning-fee",
    seoTitle:
      "What Is a Reconditioning Fee? Used Car Dealer Fee Explained | Odigos",
    seoDescription:
      "A reconditioning fee covers prep work on used cars. Learn when it's legitimate, when it's inflated, and how to push back.",
  },
];

/** Set of valid glossary slugs — used by isKnownRoute() for route validation. */
export const GLOSSARY_SLUGS = new Set<string>(
  GLOSSARY_TERMS_SEO.map((t) => t.slug),
);

/** Map for O(1) SEO metadata lookup by slug — used by getSeoMeta(). */
export const GLOSSARY_SEO_BY_SLUG = new Map<string, GlossaryTermSeo>(
  GLOSSARY_TERMS_SEO.map((t) => [t.slug, t]),
);
