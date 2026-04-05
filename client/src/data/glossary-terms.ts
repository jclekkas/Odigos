export interface GlossaryTerm {
  slug: string;
  term: string;
  shortDefinition: string;
  fullDefinition: string;
  relatedPages: { label: string; path: string }[];
  seoTitle: string;
  seoDescription: string;
}

export const glossaryTerms: GlossaryTerm[] = [
  {
    slug: "junk-fee",
    term: "Junk Fee",
    shortDefinition: "A hidden or surprise charge that provides little or no real value to the buyer, was not clearly disclosed, or duplicates costs already included in the deal.",
    fullDefinition: "The FTC defines junk fees as 'hidden or surprise fees that were not clearly disclosed.' In car buying, junk fees include charges like nitrogen tire fills, VIN etching, dealer prep fees, paint protection, fabric guard, and anti-theft packages. These are typically pre-installed or added without the buyer's explicit consent, then presented as non-negotiable. Under the FTC's CARS Rule (2024), dealers are prohibited from charging for add-ons that provide no benefit to the consumer.",
    relatedPages: [
      { label: "Junk Fees Explained", path: "/junk-fees-explained" },
      { label: "Hidden Dealer Fees", path: "/hidden-dealer-fees" },
      { label: "Dealer Add-Ons Explained", path: "/dealer-add-ons-explained" },
    ],
    seoTitle: "What Is a Junk Fee? Car Dealer Junk Fees Explained | Odigos",
    seoDescription: "A junk fee is a hidden or surprise charge that provides little value. Learn how to spot and fight back against dealer junk fees.",
  },
  {
    slug: "doc-fee",
    term: "Documentation Fee (Doc Fee)",
    shortDefinition: "A dealer-set charge for processing the paperwork involved in a vehicle sale — contracts, title transfer, and registration filing. Not a government fee.",
    fullDefinition: "A documentation fee (commonly called a 'doc fee') is charged by the dealership to cover administrative costs of completing the sale. It covers preparing purchase agreements, financing contracts, filing title transfers, and maintaining records. Doc fees are regulated or capped in many states — for example, California caps them at $85, while Florida has no cap and fees can exceed $1,000. Doc fees are typically non-negotiable on their own but can be offset by negotiating the vehicle price.",
    relatedPages: [
      { label: "What Is a Dealer Doc Fee?", path: "/what-is-a-dealer-doc-fee" },
      { label: "Doc Fee by State", path: "/dealer-doc-fee-by-state" },
      { label: "Doc Fee Too High?", path: "/doc-fee-too-high" },
    ],
    seoTitle: "What Is a Doc Fee? Dealer Documentation Fee Explained | Odigos",
    seoDescription: "A doc fee is a dealer-set paperwork charge, not a government fee. Learn what it covers, state caps, and typical ranges.",
  },
  {
    slug: "out-the-door-price",
    term: "Out-the-Door Price (OTD)",
    shortDefinition: "The total amount you'll pay to drive the vehicle home — including the vehicle price, all taxes, all fees, and all add-ons. No surprises.",
    fullDefinition: "The out-the-door price (OTD) is the single most important number in any car deal. It includes the vehicle sale price, all dealer fees (doc fee, add-ons), all government fees (sales tax, title, registration), and any other charges. When a dealer quotes only a sale price or monthly payment without an OTD, critical cost components are hidden. Always request an itemized OTD breakdown before visiting the dealership.",
    relatedPages: [
      { label: "Out-the-Door Price Guide", path: "/out-the-door-price" },
      { label: "What Does OTD Include?", path: "/what-does-out-the-door-price-include" },
      { label: "OTD Calculator", path: "/out-the-door-price-calculator" },
    ],
    seoTitle: "What Is Out-the-Door Price? OTD Price Explained | Odigos",
    seoDescription: "Out-the-door price (OTD) is the total you pay including all taxes and fees. Learn what it includes and why it matters.",
  },
  {
    slug: "market-adjustment",
    term: "Market Adjustment (ADM)",
    shortDefinition: "A dealer-added markup above MSRP, typically applied to high-demand or low-inventory vehicles. Entirely discretionary — no law or manufacturer requires it.",
    fullDefinition: "A market adjustment (also called Additional Dealer Markup or ADM) is a price increase set by the dealership above the manufacturer's suggested retail price (MSRP). It is justified by dealers as reflecting supply-demand conditions but is purely a profit-margin decision. Market adjustments can range from $500 to $10,000+ on popular models. They should always be negotiated or the buyer should look elsewhere. Some manufacturers have policies against dealer markups, though enforcement varies.",
    relatedPages: [
      { label: "Market Adjustment Fee Guide", path: "/market-adjustment-fee" },
      { label: "Dealer Pricing Tactics", path: "/dealer-pricing-tactics" },
    ],
    seoTitle: "What Is a Market Adjustment? Dealer ADM Explained | Odigos",
    seoDescription: "A market adjustment is a dealer markup above MSRP. Learn what it is, why dealers charge it, and how to avoid it.",
  },
  {
    slug: "money-factor",
    term: "Money Factor (Lease)",
    shortDefinition: "The interest rate on a car lease, expressed as a small decimal. Multiply by 2,400 to convert to an equivalent APR.",
    fullDefinition: "The money factor is how leasing companies express the interest rate on a lease. It's shown as a small decimal like 0.00125. To convert to a comparable APR, multiply by 2,400 (e.g., 0.00125 x 2,400 = 3.0% APR). A lower money factor means less interest cost. Money factors are set by the leasing company (often the manufacturer's captive finance arm) and can sometimes be reduced with a higher security deposit or by qualifying for promotional rates. Always ask for the money factor — many dealers avoid disclosing it.",
    relatedPages: [],
    seoTitle: "What Is a Money Factor? Lease Interest Rate Explained | Odigos",
    seoDescription: "The money factor is the interest rate on a car lease. Multiply by 2,400 to get the APR equivalent. Learn how it works.",
  },
  {
    slug: "residual-value",
    term: "Residual Value (Lease)",
    shortDefinition: "The predicted value of a leased vehicle at the end of the lease term. It determines your monthly payment and buyout price.",
    fullDefinition: "Residual value is the estimated worth of the vehicle when your lease ends. It is set by the leasing company (not the dealer) and expressed as a percentage of MSRP (e.g., 55% residual on a $40,000 car = $22,000). A higher residual value means lower monthly payments because you're financing less depreciation. Residual value also determines your lease-end purchase option price. Residual values are typically not negotiable but vary by model, trim, and lease term.",
    relatedPages: [],
    seoTitle: "What Is Residual Value? Car Lease Residual Explained | Odigos",
    seoDescription: "Residual value is the predicted value of a leased car at lease end. Learn how it affects your monthly payment and buyout price.",
  },
  {
    slug: "acquisition-fee",
    term: "Acquisition Fee (Lease)",
    shortDefinition: "A one-time fee charged by the leasing company to initiate a lease. Typically $595–$995, sometimes rolled into the monthly payment.",
    fullDefinition: "An acquisition fee (also called a bank fee or lease inception fee) is charged by the leasing company to cover the costs of arranging the lease. It typically ranges from $595 to $995 depending on the manufacturer. Unlike dealer fees, the acquisition fee goes to the leasing company, not the dealer. It can be paid upfront or rolled into the monthly payment. The fee is generally not negotiable but should always be disclosed.",
    relatedPages: [],
    seoTitle: "What Is an Acquisition Fee? Lease Inception Fee Explained | Odigos",
    seoDescription: "An acquisition fee is a one-time lease initiation charge from the leasing company. Learn typical amounts and what to expect.",
  },
  {
    slug: "disposition-fee",
    term: "Disposition Fee (Lease)",
    shortDefinition: "A fee charged at the end of a lease if you return the vehicle instead of buying it. Typically $300–$500.",
    fullDefinition: "A disposition fee is charged by the leasing company when you return a vehicle at lease end. It covers the cost of inspecting, reconditioning, and remarketing the returned vehicle. Typical amounts are $300–$500. The fee is waived if you purchase the vehicle at lease end or lease another vehicle from the same manufacturer. It should be disclosed in the lease agreement upfront.",
    relatedPages: [],
    seoTitle: "What Is a Disposition Fee? Lease-End Fee Explained | Odigos",
    seoDescription: "A disposition fee is charged when you return a leased car. Typically $300-$500, waived if you buy or re-lease. Learn more.",
  },
  {
    slug: "dealer-prep-fee",
    term: "Dealer Prep Fee",
    shortDefinition: "A charge for washing, detailing, and inspecting a vehicle before delivery. A normal cost of business that dealers pass to the buyer.",
    fullDefinition: "A dealer prep fee (also called pre-delivery inspection fee or PDI) is a charge for preparing the vehicle for sale — washing, detailing, removing protective wrapping, and conducting a basic inspection. This work is a standard cost of operating a dealership, not an extra service for the buyer. Fees typically range from $200 to $500. Most consumer advocates consider this a junk fee since the work benefits the dealer's ability to sell the vehicle, not the buyer specifically.",
    relatedPages: [
      { label: "Dealer Prep Fee Guide", path: "/dealer-prep-fee" },
      { label: "Junk Fees Explained", path: "/junk-fees-explained" },
    ],
    seoTitle: "What Is a Dealer Prep Fee? Pre-Delivery Fee Explained | Odigos",
    seoDescription: "A dealer prep fee is a charge for cleaning and inspecting a car before delivery. Learn why it's often considered a junk fee.",
  },
  {
    slug: "gap-insurance",
    term: "GAP Insurance",
    shortDefinition: "Guaranteed Asset Protection insurance covers the difference between what you owe on a car and what it's worth if it's totaled or stolen.",
    fullDefinition: "GAP (Guaranteed Asset Protection) insurance covers the 'gap' between your auto loan or lease balance and the actual cash value of your vehicle if it's totaled in an accident or stolen. For example, if you owe $25,000 but the car is only worth $20,000, GAP covers the $5,000 difference. It's most valuable for buyers with low down payments, long loan terms, or vehicles that depreciate quickly. Dealers typically charge $400–$800 for GAP, but the same coverage is available from insurance companies for $20–$40/year. Never buy GAP from the dealer without comparing prices.",
    relatedPages: [
      { label: "Dealer Add-Ons Explained", path: "/dealer-add-ons-explained" },
    ],
    seoTitle: "What Is GAP Insurance? Guaranteed Asset Protection Explained | Odigos",
    seoDescription: "GAP insurance covers the difference between what you owe and what your car is worth. Learn when it's needed and where to buy it.",
  },
];
