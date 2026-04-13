import { GLOSSARY_SEO_BY_SLUG } from "@shared/glossaryTermSeo";

export interface GlossaryTerm {
  slug: string;
  term: string;
  shortDefinition: string;
  fullDefinition: string;
  relatedPages: { label: string; path: string }[];
  seoTitle: string;
  seoDescription: string;
}

function seo(slug: string): { seoTitle: string; seoDescription: string } {
  const entry = GLOSSARY_SEO_BY_SLUG.get(slug);
  if (!entry) throw new Error(`Missing shared SEO data for glossary slug: ${slug}`);
  return { seoTitle: entry.seoTitle, seoDescription: entry.seoDescription };
}

export const glossaryTerms: GlossaryTerm[] = [
  {
    slug: "junk-fee",
    term: "Junk Fee",
    shortDefinition: "A hidden or surprise charge that provides little or no real value to the buyer, was not clearly disclosed, or duplicates costs already included in the deal.",
    fullDefinition: "The FTC defines junk fees as 'hidden or surprise fees that were not clearly disclosed.' In car buying, junk fees include charges like nitrogen tire fills, VIN etching, dealer prep fees, paint protection, fabric guard, and anti-theft packages. These are typically pre-installed or added without the buyer's explicit consent, then presented as non-negotiable. Under the FTC's CARS Rule (2024), dealers are prohibited from charging for add-ons that provide no benefit to the consumer.",
    relatedPages: [
      { label: "Hidden & Junk Dealer Fees", path: "/hidden-dealer-fees" },
      { label: "Hidden Dealer Fees", path: "/hidden-dealer-fees" },
      { label: "Dealer Add-Ons Explained", path: "/dealer-add-ons-explained" },
    ],
    ...seo("junk-fee"),
  },
  {
    slug: "doc-fee",
    term: "Documentation Fee (Doc Fee)",
    shortDefinition: "A dealer-set charge for processing the paperwork involved in a vehicle sale — contracts, title transfer, and registration filing. Not a government fee.",
    fullDefinition: "A documentation fee (commonly called a 'doc fee') is charged by the dealership to cover administrative costs of completing the sale. It covers preparing purchase agreements, financing contracts, filing title transfers, and maintaining records. Doc fees are regulated or capped in many states — for example, California caps them at $85, while Florida has no cap and fees can exceed $1,000. Doc fees are typically non-negotiable on their own but can be offset by negotiating the vehicle price.",
    relatedPages: [
      { label: "What Is a Dealer Doc Fee?", path: "/dealer-doc-fee" },
      { label: "Doc Fee by State", path: "/dealer-doc-fee-by-state" },
      { label: "Doc Fee Too High?", path: "/doc-fee-too-high" },
    ],
    ...seo("doc-fee"),
  },
  {
    slug: "out-the-door-price",
    term: "Out-the-Door Price (OTD)",
    shortDefinition: "The total amount you'll pay to drive the vehicle home — including the vehicle price, all taxes, all fees, and all add-ons. No surprises.",
    fullDefinition: "The out-the-door price (OTD) is the single most important number in any car deal. It includes the vehicle sale price, all dealer fees (doc fee, add-ons), all government fees (sales tax, title, registration), and any other charges. When a dealer quotes only a sale price or monthly payment without an OTD, critical cost components are hidden. Always request an itemized OTD breakdown before visiting the dealership.",
    relatedPages: [
      { label: "Out-the-Door Price Guide", path: "/out-the-door-price" },
      { label: "What Does OTD Include?", path: "/what-does-out-the-door-price-include" },
      { label: "OTD Calculator", path: "/out-the-door-price" },
    ],
    ...seo("out-the-door-price"),
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
    ...seo("market-adjustment"),
  },
  {
    slug: "money-factor",
    term: "Money Factor (Lease)",
    shortDefinition: "The interest rate on a car lease, expressed as a small decimal. Multiply by 2,400 to convert to an equivalent APR.",
    fullDefinition: "The money factor is how leasing companies express the interest rate on a lease. It's shown as a small decimal like 0.00125. To convert to a comparable APR, multiply by 2,400 (e.g., 0.00125 x 2,400 = 3.0% APR). A lower money factor means less interest cost. Money factors are set by the leasing company (often the manufacturer's captive finance arm) and can sometimes be reduced with a higher security deposit or by qualifying for promotional rates. Always ask for the money factor — many dealers avoid disclosing it.",
    relatedPages: [],
    ...seo("money-factor"),
  },
  {
    slug: "residual-value",
    term: "Residual Value (Lease)",
    shortDefinition: "The predicted value of a leased vehicle at the end of the lease term. It determines your monthly payment and buyout price.",
    fullDefinition: "Residual value is the estimated worth of the vehicle when your lease ends. It is set by the leasing company (not the dealer) and expressed as a percentage of MSRP (e.g., 55% residual on a $40,000 car = $22,000). A higher residual value means lower monthly payments because you're financing less depreciation. Residual value also determines your lease-end purchase option price. Residual values are typically not negotiable but vary by model, trim, and lease term.",
    relatedPages: [],
    ...seo("residual-value"),
  },
  {
    slug: "acquisition-fee",
    term: "Acquisition Fee (Lease)",
    shortDefinition: "A one-time fee charged by the leasing company to initiate a lease. Typically $595–$995, sometimes rolled into the monthly payment.",
    fullDefinition: "An acquisition fee (also called a bank fee or lease inception fee) is charged by the leasing company to cover the costs of arranging the lease. It typically ranges from $595 to $995 depending on the manufacturer. Unlike dealer fees, the acquisition fee goes to the leasing company, not the dealer. It can be paid upfront or rolled into the monthly payment. The fee is generally not negotiable but should always be disclosed.",
    relatedPages: [],
    ...seo("acquisition-fee"),
  },
  {
    slug: "disposition-fee",
    term: "Disposition Fee (Lease)",
    shortDefinition: "A fee charged at the end of a lease if you return the vehicle instead of buying it. Typically $300–$500.",
    fullDefinition: "A disposition fee is charged by the leasing company when you return a vehicle at lease end. It covers the cost of inspecting, reconditioning, and remarketing the returned vehicle. Typical amounts are $300–$500. The fee is waived if you purchase the vehicle at lease end or lease another vehicle from the same manufacturer. It should be disclosed in the lease agreement upfront.",
    relatedPages: [],
    ...seo("disposition-fee"),
  },
  {
    slug: "dealer-prep-fee",
    term: "Dealer Prep Fee",
    shortDefinition: "A charge for washing, detailing, and inspecting a vehicle before delivery. A normal cost of business that dealers pass to the buyer.",
    fullDefinition: "A dealer prep fee (also called pre-delivery inspection fee or PDI) is a charge for preparing the vehicle for sale — washing, detailing, removing protective wrapping, and conducting a basic inspection. This work is a standard cost of operating a dealership, not an extra service for the buyer. Fees typically range from $200 to $500. Most consumer advocates consider this a junk fee since the work benefits the dealer's ability to sell the vehicle, not the buyer specifically.",
    relatedPages: [
      { label: "Dealer Prep Fee Guide", path: "/dealer-prep-fee" },
      { label: "Hidden & Junk Dealer Fees", path: "/hidden-dealer-fees" },
    ],
    ...seo("dealer-prep-fee"),
  },
  {
    slug: "gap-insurance",
    term: "GAP Insurance",
    shortDefinition: "Guaranteed Asset Protection insurance covers the difference between what you owe on a car and what it's worth if it's totaled or stolen.",
    fullDefinition: "GAP (Guaranteed Asset Protection) insurance covers the 'gap' between your auto loan or lease balance and the actual cash value of your vehicle if it's totaled in an accident or stolen. For example, if you owe $25,000 but the car is only worth $20,000, GAP covers the $5,000 difference. It's most valuable for buyers with low down payments, long loan terms, or vehicles that depreciate quickly. Dealers typically charge $400–$800 for GAP, but the same coverage is available from insurance companies for $20–$40/year. Never buy GAP from the dealer without comparing prices.",
    relatedPages: [
      { label: "Dealer Add-Ons Explained", path: "/dealer-add-ons-explained" },
    ],
    ...seo("gap-insurance"),
  },
  {
    slug: "msrp",
    term: "MSRP (Manufacturer's Suggested Retail Price)",
    shortDefinition: "The price the manufacturer recommends the dealer sell the vehicle for. Also called the 'sticker price.' Dealers can sell above or below MSRP.",
    fullDefinition: "MSRP stands for Manufacturer's Suggested Retail Price — the price set by the automaker as a baseline for dealers. It appears on the window sticker (Monroney sticker) of every new car. MSRP is not a binding price — dealers can charge above MSRP (a 'market adjustment') when demand is high, or sell below MSRP through discounts and incentives. The gap between MSRP and the actual sale price is one of the most important factors in evaluating whether a deal is fair.",
    relatedPages: [
      { label: "OTD vs MSRP", path: "/out-the-door-price-vs-msrp" },
      { label: "Market Adjustment Fee", path: "/market-adjustment-fee" },
    ],
    ...seo("msrp"),
  },
  {
    slug: "invoice-price",
    term: "Invoice Price (Dealer Cost)",
    shortDefinition: "The price the dealer pays the manufacturer for the vehicle. Knowing invoice price helps you estimate the dealer's profit margin on a deal.",
    fullDefinition: "Invoice price is what the manufacturer charges the dealer for the vehicle. It is typically 2-5% below MSRP for most models. Dealers also receive holdback payments (1-3% of MSRP) from the manufacturer, making their true cost even lower than invoice. Knowing the invoice price gives you a reference point for negotiation — paying invoice price or slightly below is generally considered a good deal. Online tools like Edmunds and KBB publish estimated invoice prices.",
    relatedPages: [
      { label: "What Is a Fair Price?", path: "/how-much-should-you-pay-for-a-car" },
    ],
    ...seo("invoice-price"),
  },
  {
    slug: "destination-charge",
    term: "Destination Charge",
    shortDefinition: "A manufacturer-set fee for shipping the vehicle from the factory to the dealer. Non-negotiable and consistent across all dealers for the same model.",
    fullDefinition: "The destination charge (also called destination and delivery or D&D) covers the cost of transporting a new vehicle from the assembly plant to the dealership. It is set by the manufacturer, not the dealer, and is the same for all dealers selling that model regardless of their distance from the factory. Destination charges typically range from $1,000 to $2,000. This is a legitimate fee — unlike a 'delivery fee' added by the dealer, which is a separate, negotiable charge.",
    relatedPages: [
      { label: "Car Dealer Fees Explained", path: "/car-dealer-fees-explained" },
    ],
    ...seo("destination-charge"),
  },
  {
    slug: "trade-in-tax-credit",
    term: "Trade-In Tax Credit",
    shortDefinition: "A tax benefit in most states where sales tax is only charged on the difference between the new car price and your trade-in value, reducing your tax bill.",
    fullDefinition: "In most U.S. states, when you trade in a vehicle as part of a new purchase, you only pay sales tax on the difference between the new vehicle price and your trade-in value. For example, if you buy a $40,000 car and trade in a vehicle worth $15,000, you pay sales tax on $25,000 instead of $40,000. This can save hundreds or thousands of dollars. However, a few states (California, Hawaii, Virginia) do not offer this credit — you pay tax on the full purchase price regardless of trade-in value.",
    relatedPages: [
      { label: "Car Dealer Fees by State", path: "/car-dealer-fees-by-state" },
    ],
    ...seo("trade-in-tax-credit"),
  },
  {
    slug: "nitrogen-tire-fill",
    term: "Nitrogen Tire Fill",
    shortDefinition: "A dealer add-on that fills tires with nitrogen instead of air. Costs $50-$300 at dealers but provides negligible benefit for passenger vehicles.",
    fullDefinition: "Nitrogen tire fill replaces regular air in tires with nitrogen gas. Dealers claim it maintains tire pressure longer and improves fuel economy. While nitrogen does lose pressure slightly slower than air, the real-world benefit for passenger vehicles is negligible — checking tire pressure monthly with regular air achieves the same result. Nitrogen is available free at many tire shops. At $50-$300, this is one of the most universally recognized junk fees in the car industry.",
    relatedPages: [
      { label: "Hidden & Junk Dealer Fees", path: "/hidden-dealer-fees" },
      { label: "Dealer Add-Ons List", path: "/dealer-add-ons-list" },
    ],
    ...seo("nitrogen-tire-fill"),
  },
  {
    slug: "vin-etching",
    term: "VIN Etching",
    shortDefinition: "A dealer add-on where the vehicle identification number is etched onto windows as a theft deterrent. DIY kits cost $20-$30; dealers charge $100-$400.",
    fullDefinition: "VIN etching involves permanently marking the Vehicle Identification Number onto a car's windows. It serves as a theft deterrent because it makes it harder to sell stolen windows or disguise a stolen vehicle. While the concept has some merit, the dealer markup is extreme — professional DIY kits cost $20-$30, while dealers charge $100-$400. Dealers often present VIN etching as already installed or mandatory, making it difficult to decline. It is always optional.",
    relatedPages: [
      { label: "Hidden & Junk Dealer Fees", path: "/hidden-dealer-fees" },
      { label: "Hidden Dealer Fees", path: "/hidden-dealer-fees" },
    ],
    ...seo("vin-etching"),
  },
  {
    slug: "paint-protection",
    term: "Paint Protection / Ceramic Coating",
    shortDefinition: "A sealant or coating applied to the vehicle's exterior. Dealer versions are typically low-quality spray-ons marked up significantly over independent shops.",
    fullDefinition: "Paint protection products range from simple spray-on sealants ($200-$500 at dealers) to professional ceramic coatings ($300-$1,500+). Dealer-applied versions are almost always low-quality, quick-apply products that provide minimal lasting protection compared to professional ceramic coatings applied by detailing specialists. If you want paint protection, get it done independently after purchase — you'll get better quality at a lower price. Dealers often bundle paint protection into 'appearance packages' to make the markup less obvious.",
    relatedPages: [
      { label: "Hidden & Junk Dealer Fees", path: "/hidden-dealer-fees" },
      { label: "Are Dealer Add-Ons Mandatory?", path: "/are-dealer-add-ons-mandatory" },
    ],
    ...seo("paint-protection"),
  },
  {
    slug: "extended-warranty",
    term: "Extended Warranty (Vehicle Service Contract)",
    shortDefinition: "A service contract that covers repair costs beyond the manufacturer's warranty period. Often aggressively upsold in the finance office at inflated prices.",
    fullDefinition: "An extended warranty (technically a 'vehicle service contract') covers certain repair costs after the manufacturer's factory warranty expires. They can provide value for buyers planning to keep a vehicle long-term, especially for brands with higher repair costs. However, dealer pricing is typically 2-3x what you'd pay buying the same coverage directly from a third-party provider. You are never required to buy an extended warranty at the time of purchase — you can add one anytime before your factory warranty expires. Always compare prices from independent providers before buying from the dealer.",
    relatedPages: [
      { label: "Dealer Add-Ons Explained", path: "/dealer-add-ons-explained" },
      { label: "Are Dealer Add-Ons Negotiable?", path: "/are-dealer-add-ons-negotiable" },
    ],
    ...seo("extended-warranty"),
  },
  {
    slug: "capitalized-cost",
    term: "Capitalized Cost (Lease)",
    shortDefinition: "The negotiated price of the vehicle in a lease — equivalent to the sale price in a purchase. A lower cap cost means lower monthly payments.",
    fullDefinition: "The capitalized cost (or 'cap cost') is the price of the vehicle that the lease is based on. It is negotiable, just like the sale price on a purchase. The cap cost minus the residual value equals the depreciation you pay for during the lease. Reducing the cap cost by negotiating the vehicle price, applying rebates, or making a cap cost reduction (down payment) directly lowers your monthly lease payment. Always negotiate the cap cost before discussing monthly payments — dealers prefer to negotiate on payment because it obscures the actual vehicle price.",
    relatedPages: [
      { label: "Money Factor Explained", path: "/money-factor-explained" },
      { label: "Car Lease Fees Explained", path: "/car-lease-fees-explained" },
    ],
    ...seo("capitalized-cost"),
  },
  {
    slug: "early-termination-fee",
    term: "Early Termination Fee (Lease)",
    shortDefinition: "A penalty charged for ending a lease before the contract term expires. Can cost thousands of dollars — typically the remaining payments plus fees.",
    fullDefinition: "An early termination fee is charged when a lessee returns a vehicle before the lease contract ends. The penalty typically includes all remaining lease payments, any difference between the vehicle's current market value and the residual value, and an early termination processing fee ($200-$500). This can amount to thousands of dollars. Before signing a lease, understand the early termination provisions. If your circumstances change, options like lease transfers (through services like Swapalease) may be cheaper than early termination.",
    relatedPages: [
      { label: "Car Lease Fees Explained", path: "/car-lease-fees-explained" },
    ],
    ...seo("early-termination-fee"),
  },
  {
    slug: "reconditioning-fee",
    term: "Reconditioning Fee",
    shortDefinition: "A dealer charge on used cars for cleaning, minor repairs, and inspection before sale. Legitimate work, but fees above $500-$800 warrant questioning.",
    fullDefinition: "A reconditioning fee covers the work a dealer does to prepare a used vehicle for retail sale — detailing, minor mechanical repairs, replacing worn parts, and safety inspection. When backed by real work (new tires, brake pads, paint touch-up), it can be legitimate. However, many dealers inflate reconditioning fees as a profit line, especially when the vehicle required minimal work. Fees above $500-$800 should be questioned — ask for an itemized list of what was done. If the dealer can't provide specifics, it may be a junk fee disguised as legitimate service.",
    relatedPages: [
      { label: "Dealer Reconditioning Fee Guide", path: "/dealer-reconditioning-fee" },
      { label: "Hidden & Junk Dealer Fees", path: "/hidden-dealer-fees" },
    ],
    ...seo("reconditioning-fee"),
  },
];
