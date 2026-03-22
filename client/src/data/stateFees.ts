export interface StateFeeData {
  name: string;
  abbreviation: string;
  slug: string;
  docFeeRange: string;
  hasCap: boolean;
  metaDescription: string;
  capNote: string;
  salesTaxNote: string;
  registrationNote: string;
  introAngle: string;
  snippetAnswer: string;
  watchFor: string[];
  negotiationNote: string;
  ctaHeading: string;
  ctaBody: string;
  internalLinks: { href: string; label: string }[];
}

export const STATE_FEES: Record<string, StateFeeData> = {
  california: {
    name: "California",
    abbreviation: "CA",
    slug: "california",
    docFeeRange: "Typically $85 or under",
    hasCap: true,
    metaDescription:
      "California caps dealer doc fees at ~$85 — one of the few states with a hard limit. Local tax rates reach 10.75%. See the full CA out-the-door breakdown.",
    capNote:
      "California law limits the documentation fee dealers can charge. Most buyers see a doc fee at or near $85 — dealers cannot legally charge more. This cap is one of the strongest consumer protections in the country for car buyers.",
    salesTaxNote:
      "California's base state sales tax is 7.25%, but local district taxes raise it further. Most buyers in major metro areas — Los Angeles, the Bay Area, San Diego — see effective rates between 9.5% and 10.75%. The tax is applied to the vehicle price after any trade-in credit.",
    registrationNote:
      "California registration fees include a base registration fee (typically $60–$70), a Vehicle License Fee (0.65% of the vehicle's value), and county fees. New vehicle registration can run $400–$600 or more depending on the vehicle's value, which surprises buyers used to flat-rate registration in other states.",
    introAngle:
      "California is one of the only major states in the country with a hard cap on the dealer documentation fee. That means buyers in California are protected in ways that buyers in Florida, Texas, or Georgia simply aren't — the doc fee is fixed near $85, and a dealer who charges more is out of compliance. The real variation in California OTD pricing comes from the state's wide range of local sales tax rates, which can push the total above what buyers expect based on the sticker price alone.",
    snippetAnswer:
      "California caps dealer documentation fees at around $85 — one of the lowest in the country. State sales tax ranges from 7.25% to 10.75% depending on your location. Registration fees vary by vehicle value. The biggest OTD variable for California buyers is usually the local sales tax rate, not the doc fee.",
    watchFor: [
      "High local sales tax: buyers in Los Angeles (10.25%), Alameda County (10.75%), and other high-tax districts pay significantly more than the 7.25% base rate. Always verify the effective rate for your zip code before estimating your OTD total.",
      "Registration fees scaled to vehicle value: California's Vehicle License Fee is a percentage of the car's value, not a flat amount. On a $45,000 vehicle, that's roughly $293 — more than buyers from flat-rate states expect.",
      "Dealer add-ons bundled into the price: California's doc fee cap means dealers have less margin on paperwork, which can push them toward add-on products. Protection packages, paint sealants, and extended warranties are common — and almost never mandatory.",
      "Dealer-installed accessories marked up heavily: some California dealerships pre-install accessories (floor mats, roof rails, protection film) and build them into the vehicle price at retail-plus margins. Ask for the base MSRP before accessories.",
    ],
    negotiationNote:
      "In California, the doc fee is fixed — you won't get it reduced. Your leverage is on the vehicle price, any add-ons, and financing terms. The state's large, competitive dealer market (particularly in the LA and Bay Area metros) means dealers are often willing to negotiate vehicle price to close a deal. Getting quotes from multiple dealers in the same region and using them against each other is particularly effective in California's high-volume markets.",
    ctaHeading: "Have a California dealer quote with fees you don't recognize?",
    ctaBody:
      "Odigos checks your quote against what's typical in California and flags anything outside the normal range.",
    internalLinks: [
      { href: "/out-the-door-price", label: "out-the-door price" },
      { href: "/dealer-doc-fee", label: "documentation fee" },
      { href: "/car-dealer-fees-by-state", label: "fees across all states" },
      { href: "/car-dealer-fees-explained", label: "car dealer fees explained" },
      { href: "/are-dealer-add-ons-mandatory", label: "dealer add-ons" },
    ],
  },

  texas: {
    name: "Texas",
    abbreviation: "TX",
    slug: "texas",
    docFeeRange: "Typically $150–$300",
    hasCap: false,
    metaDescription:
      "Texas has no cap on dealer doc fees — most charge $150–$300. The state tax is a flat 6.25%. See what buyers in Houston, Dallas, and San Antonio pay OTD.",
    capNote:
      "Texas has no legal cap on dealer documentation fees. Dealers set the doc fee themselves, and it can vary significantly from one dealership to another. In practice, most Texas dealers charge between $150 and $300 for the doc fee — lower than many uncapped states — but there's nothing preventing a dealer from charging more.",
    salesTaxNote:
      "Texas charges a flat 6.25% state motor vehicle sales tax. Local add-ons are limited, so buyers across the state generally see the same effective rate. The tax is calculated on the full purchase price of the vehicle.",
    registrationNote:
      "Texas registration fees are primarily made up of a base registration fee (around $50–$65 depending on county) plus county-specific fees. New vehicle registration is generally straightforward by national standards, though some counties add local assessments.",
    introAngle:
      "Texas is one of the largest vehicle markets in the country, with major dealer clusters in Houston, Dallas-Fort Worth, San Antonio, and Austin. The state has no cap on the documentation fee, but competitive pressure in these large metro markets tends to keep fees lower than in less competitive states. The 6.25% state sales tax is a flat, uniform rate — simpler than the multi-layered local rates buyers deal with in California or New York. What Texas buyers often miss is the risk from dealer add-ons, which can quietly add $1,000–$3,000 to a deal that looked clean on vehicle price alone.",
    snippetAnswer:
      "Texas has no cap on dealer documentation fees. Most dealers charge $150–$300, though fees can be higher. The state sales tax is a flat 6.25% with minimal local variation. Texas OTD prices are primarily driven by the vehicle price and doc fee — the state's uniform tax structure keeps the math relatively simple for buyers.",
    watchFor: [
      "Doc fees above $300: while most Texas dealers stay in the $150–$300 range, some charge $400–$500 or more. There's no state protection — if the doc fee looks high, ask if it's negotiable or compare it against competing dealers.",
      "Market adjustment markups on popular models: Texas dealerships on high-demand vehicles (trucks, SUVs) sometimes add a market adjustment above MSRP. This is a dealer markup, not a tax — it's negotiable and disappears when demand softens.",
      "Bundled add-on packages listed as 'required': protection packages, paint sealant, and nitrogen tires are common add-on items in Texas dealerships. These are almost never required, even when presented as part of the vehicle configuration.",
      "Trade-in and purchase separated at signing: some Texas dealers present trade-in value as a separate transaction that doesn't reduce the taxable sale price. Verify whether your trade-in credit is being applied before tax is calculated.",
    ],
    negotiationNote:
      "Texas's large metro dealer markets create real competitive pressure. Getting quotes from multiple dealers in Dallas, Houston, or San Antonio on the same vehicle gives you comparison leverage. Dealers in high-volume markets are generally more willing to negotiate vehicle price and drop or reduce add-ons than dealers in smaller markets where alternatives are fewer. Because there's no doc fee cap, it's also worth asking directly whether the doc fee is negotiable — some dealers will reduce it to close a deal.",
    ctaHeading: "Have a Texas dealer quote with extra fees?",
    ctaBody:
      "Texas has no doc fee cap. Odigos reviews your full quote and tells you what's typical, what's optional, and what you can push back on.",
    internalLinks: [
      { href: "/out-the-door-price", label: "out-the-door price" },
      { href: "/dealer-doc-fee", label: "documentation fee" },
      { href: "/doc-fee-too-high", label: "doc fee too high" },
      { href: "/car-dealer-fees-by-state", label: "fees across all states" },
      { href: "/car-dealer-fees-explained", label: "car dealer fees explained" },
      { href: "/are-dealer-add-ons-mandatory", label: "dealer add-ons" },
    ],
  },

  florida: {
    name: "Florida",
    abbreviation: "FL",
    slug: "florida",
    docFeeRange: "Commonly $499–$999",
    hasCap: false,
    metaDescription:
      "Florida has no cap on dealer doc fees — $499–$999 is common, among the highest in the country. State tax is 6% plus county surtax. See the full FL picture.",
    capNote:
      "Florida has no cap on dealer documentation fees. Florida routinely has some of the highest doc fees in the country. Fees of $500–$999 are common, and some dealers charge even more. Because there's no state limit, the doc fee is whatever the dealership decides — and it's often the first major surprise buyers see at the finance desk.",
    salesTaxNote:
      "Florida's base state sales tax on vehicles is 6%, but counties add their own discretionary surtax. The combined rate varies by county — Miami-Dade is 7%, Broward is 7%, Orange County (Orlando) is 6.5%, and some rural counties stay at 6%. The tax is applied to the full sale price of the vehicle.",
    registrationNote:
      "Florida registration fees include a base registration fee that varies by vehicle weight, plus a title fee. Registration for a standard passenger vehicle typically runs $200–$400 for the first year, depending on the vehicle and county. There's also a temporary tag fee if you take the vehicle home before permanent plates arrive.",
    introAngle:
      "Florida has some of the highest uncapped dealer documentation fees in the country — and buyers frequently report sticker shock when they see the doc fee at the finance desk for the first time. A $699 or $899 doc fee is routine at many Florida dealerships. There's no state law preventing it. What makes Florida's OTD prices particularly variable is the combination of high doc fees, county-level sales tax variations, and a dealer market that includes both high-volume tourist-area stores and more aggressive smaller dealers. Knowing what's typical before you sit down saves you from being anchored to a number that isn't normal.",
    snippetAnswer:
      "Florida has no cap on dealer documentation fees, and fees of $499–$999 are common — among the highest in the country. The state sales tax is 6% plus a county surtax that varies by location. Florida buyers should expect a higher doc fee than in most other states and should factor it into any OTD comparison.",
    watchFor: [
      "High doc fees presented as fixed and non-negotiable: dealers in Florida often say the doc fee is the same for all customers and can't be changed. That may be the store's policy, but the vehicle price can usually be adjusted to offset it — the total OTD is what matters.",
      "County surtax surprises: the difference between a 6% and 7% county rate on a $40,000 vehicle is $400. If you're shopping across county lines in Florida, the tax rate difference can make one dealer's quote look better than another's before fees are factored in.",
      "Add-on packages on high-inventory vehicles: Florida's large dealer market and high transaction volume create conditions where add-ons get bundled into vehicles before they arrive. Pre-installed protection packages at $800–$1,500 are common and are almost always negotiable in price even if they can't be physically removed.",
      "Temporary tags and additional dealer fees: some Florida dealers add fees for temporary tags, dealer prep, or electronic filing that aren't always visible in an early quote. Ask for the full itemized OTD breakdown before agreeing to any price.",
    ],
    negotiationNote:
      "Florida's high doc fees are the biggest pressure point for buyers. While many dealers genuinely charge the same doc fee to every customer, the vehicle price is almost always negotiable. If a dealer won't reduce the doc fee, focus the negotiation on the vehicle price — ask for the price to be reduced by the amount of the doc fee above what you'd consider reasonable. Having a competing OTD quote from another Florida dealer is the most effective negotiating tool, since it puts the full all-in comparison on the table.",
    ctaHeading: "Seeing a high doc fee on a Florida quote?",
    ctaBody:
      "Florida has no doc fee cap — Odigos checks whether what you're seeing is within the typical range and flags anything that stands out.",
    internalLinks: [
      { href: "/out-the-door-price", label: "out-the-door price" },
      { href: "/dealer-doc-fee", label: "documentation fee" },
      { href: "/doc-fee-too-high", label: "doc fee too high" },
      { href: "/car-dealer-fees-by-state", label: "fees across all states" },
      { href: "/car-dealer-fees-explained", label: "car dealer fees explained" },
      { href: "/are-dealer-add-ons-mandatory", label: "dealer add-ons" },
    ],
  },

  "new-york": {
    name: "New York",
    abbreviation: "NY",
    slug: "new-york",
    docFeeRange: "Typically $75–$175",
    hasCap: false,
    metaDescription:
      "New York dealer doc fees typically run $75–$175. NYC buyers pay 8.875% in combined sales tax. Upstate buyers pay less. See the full NY OTD picture.",
    capNote:
      "New York does not have a statutory cap on dealer documentation fees, but market norms and competitive pressure generally keep fees lower than in uncapped states like Florida. Most New York dealers charge between $75 and $175 for the doc fee — significantly lower than the national average for uncapped states. Some dealers charge more, particularly in lower-competition areas.",
    salesTaxNote:
      "New York has a 4% state sales tax on vehicles, but local county and city taxes add significantly to that. New York City buyers pay a combined rate of 8.875% (4% state + 4.5% NYC + 0.375% MTA). Buyers in suburban counties typically see 7%–8.5% combined rates. Upstate buyers in lower-tax counties may see 6%–7%. The combined rate varies more than buyers usually expect.",
    registrationNote:
      "New York registration fees are calculated on a schedule based on the vehicle's weight. A standard passenger car typically runs $26–$140 in base registration depending on weight, plus a title fee of around $50. NYC buyers also pay an additional Metropolitan Commuter Transportation District (MCTD) surcharge. Total first-year registration and title costs often run $200–$400 depending on vehicle and location.",
    introAngle:
      "New York's OTD pricing has a particular split that surprises buyers: the doc fee is relatively modest by national standards, but the combined sales tax rate in New York City and its suburbs can push OTD totals well above what buyers from other regions expect. A buyer purchasing a $38,000 vehicle in NYC at 8.875% pays $3,373 in sales tax alone. The same vehicle in a rural upstate county at 6.5% would cost $2,470 in tax — nearly $900 less, before any other fees. For buyers in the metro area, the tax is the largest OTD variable, not the doc fee.",
    snippetAnswer:
      "New York dealers typically charge $75–$175 in documentation fees — relatively low compared to uncapped states. The bigger OTD variable is the local sales tax rate: NYC buyers pay 8.875% combined, while upstate buyers may pay 6–7%. The gap between metro and upstate OTD totals on the same vehicle can exceed $1,000.",
    watchFor: [
      "NYC combined tax rate: buyers purchasing in New York City pay 8.875% combined — one of the highest effective vehicle sales tax rates in the country. On a $35,000 vehicle, that's $3,106 in tax. Buyers who don't account for this are often surprised at the OTD total.",
      "MCTD surcharge on registration: buyers in the Metropolitan Commuter Transportation District (which includes NYC and several surrounding counties) pay an additional surcharge on their registration. It's a smaller amount but adds to the first-year cost.",
      "Dealer add-ons on NYC-area inventory: dealerships in the greater New York area frequently pre-install protection packages and window tinting on inventory. These are presented as standard but are generally negotiable in price, even if not removable.",
      "Dealer prep and reconditioning fees: some New York dealers add preparation or reconditioning fees outside the standard doc fee. These aren't government charges — ask for each fee to be named and explained individually.",
    ],
    negotiationNote:
      "New York's doc fees are generally modest, so the main negotiation pressure is on vehicle price and add-ons. The competitive metro New York market means there are usually multiple dealers within driving distance selling the same vehicle — which gives buyers more leverage than in rural markets. For buyers in NYC and suburbs, the tax rate is fixed by location, so all OTD negotiation should focus on the pre-tax total.",
    ctaHeading: "Have a New York dealer quote with fees you want to check?",
    ctaBody:
      "Between state tax, local surcharges, and dealer fees, New York OTD prices can surprise buyers. Odigos breaks down every line.",
    internalLinks: [
      { href: "/out-the-door-price", label: "out-the-door price" },
      { href: "/dealer-doc-fee", label: "documentation fee" },
      { href: "/car-dealer-fees-by-state", label: "fees across all states" },
      { href: "/car-dealer-fees-explained", label: "car dealer fees explained" },
      { href: "/are-dealer-add-ons-mandatory", label: "dealer add-ons" },
    ],
  },

  georgia: {
    name: "Georgia",
    abbreviation: "GA",
    slug: "georgia",
    docFeeRange: "Typically $300–$599",
    hasCap: false,
    metaDescription:
      "Georgia uses a 7% Title Ad Valorem Tax instead of traditional sales tax — a common point of confusion for buyers. Doc fees run $300–$599 with no state cap.",
    capNote:
      "Georgia has no cap on the dealer documentation fee. Most Georgia dealerships charge between $300 and $599 for the doc fee, though some dealers charge more. Because there's no state limit, the amount varies by dealership and is often non-negotiable at individual stores, though the vehicle price can be adjusted.",
    salesTaxNote:
      "Georgia replaced the traditional sales tax on vehicle purchases with the Title Ad Valorem Tax (TAVT) in 2013. The TAVT is a one-time tax paid at the time of titling, calculated at 7% of the vehicle's fair market value (as defined by the state, not necessarily the purchase price). Unlike a traditional sales tax, the TAVT is a title fee — it appears in a different place on the OTD breakdown and is calculated differently than buyers from other states expect.",
    registrationNote:
      "Georgia registration fees are relatively modest — typically $20–$30 for the base annual registration, plus county fees. Because the TAVT replaces the traditional first-year registration tax, the overall registration cost is lower than buyers might expect. The first-year total for title and registration typically runs $150–$300 depending on the county and vehicle.",
    introAngle:
      "Georgia is one of a handful of states that replaced traditional sales tax on vehicles with a Title Ad Valorem Tax (TAVT), which has been in place since 2013. Buyers who are used to seeing a sales tax line on a car deal are often confused when they see a 'title tax' or 'ad valorem' line instead — it's not a mistake, it's how Georgia structures the transfer tax. The 7% TAVT is calculated on the state's assessed fair market value of the vehicle, which may differ from what you actually paid. Understanding this distinction is essential to evaluating a Georgia OTD breakdown correctly.",
    snippetAnswer:
      "Georgia replaced traditional sales tax with a Title Ad Valorem Tax (TAVT) of 7%, paid at titling. This appears differently on a Georgia OTD breakdown than a standard sales tax line. Doc fees typically run $300–$599 with no state cap. Buyers unfamiliar with the TAVT structure often find Georgia OTD quotes harder to interpret than other states.",
    watchFor: [
      "TAVT calculated on state fair market value, not sale price: Georgia's 7% title tax is applied to the state's assessed value of the vehicle, which is based on published retail value data — not necessarily what you negotiated. If you bought the car below market value, the TAVT may still be calculated on the higher published value.",
      "Doc fees in the $500–$600 range without explanation: Georgia has no cap, and some dealers charge toward the top of the typical range. If the doc fee is above $450, it's worth asking whether it's the same for all customers and whether the vehicle price can be adjusted to offset it.",
      "Add-on packages bundled on high-demand inventory: Georgia dealers frequently pre-install protection packages on popular SUVs and trucks. These are presented as part of the vehicle but are generally negotiable in price and sometimes removable.",
      "Confusion between TAVT and additional fees: buyers sometimes mistake the TAVT line for a bundled dealer fee and try to negotiate it. The TAVT is a government charge — it can't be reduced. Focus negotiation energy on the vehicle price, doc fee, and any add-ons.",
    ],
    negotiationNote:
      "Georgia's main pressure points are the doc fee and any bundled add-ons. Since the TAVT is fixed at 7% of assessed value and can't be negotiated, your leverage is entirely on the pre-tax portion of the deal: vehicle price, dealer markup, and add-ons. The Atlanta metro has a competitive dealer market, which gives buyers more options than smaller Georgia markets. Getting a competing OTD quote from another Atlanta-area dealer on the same vehicle is the most effective negotiating tool.",
    ctaHeading: "Not sure how Georgia's title tax affects your out-the-door price?",
    ctaBody:
      "Georgia's Ad Valorem Title Tax works differently from sales tax. Odigos breaks down your full OTD cost and flags any fees that look off.",
    internalLinks: [
      { href: "/out-the-door-price", label: "out-the-door price" },
      { href: "/dealer-doc-fee", label: "documentation fee" },
      { href: "/doc-fee-too-high", label: "doc fee too high" },
      { href: "/car-dealer-fees-by-state", label: "fees across all states" },
      { href: "/car-dealer-fees-explained", label: "car dealer fees explained" },
      { href: "/are-dealer-add-ons-mandatory", label: "dealer add-ons" },
    ],
  },
};

export const STATE_SLUGS = Object.keys(STATE_FEES);
