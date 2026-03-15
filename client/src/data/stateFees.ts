export interface RelatedLink {
  href: string;
  label: string;
}

export interface StateFeeData {
  state: string;
  abbr: string;
  slug: string;
  docFeeRange: string;
  docFeeCap: string | null;
  hasDocFeeCap: boolean;
  salesTaxRate: string;
  salesTaxNote: string;
  registrationNote: string;
  snippetAnswer: string;
  introAngle: string;
  whatToBuyersNeed: string;
  docFeeSection: string;
  taxSection: string;
  watchForItems: Array<{ flag: string; detail: string }>;
  typicalVsQuestionable: {
    heading: string;
    typical: string[];
    questionable: string[];
  };
  negotiationNote: string;
  ctaHeading: string;
  ctaBody: string;
  relatedLinks: RelatedLink[];
}

export const STATE_FEES: Record<string, StateFeeData> = {
  california: {
    state: "California",
    abbr: "CA",
    slug: "california",
    docFeeRange: "Typically $85 or under",
    docFeeCap: "~$85 (state-regulated cap)",
    hasDocFeeCap: true,
    salesTaxRate: "7.25%–10.75%",
    salesTaxNote:
      "California's base sales tax is 7.25%, but local district taxes push the effective rate higher in most counties. Buyers in Los Angeles, the Bay Area, and parts of San Diego often see combined rates near 10% or above.",
    registrationNote:
      "California registration fees are calculated by the DMV based on vehicle purchase price and decline over time. On a new $35,000 vehicle, buyers typically see initial registration and license fees in the $400–$600 range.",
    snippetAnswer:
      "California caps dealer documentation fees at around $85 by law — lower than nearly any other state. Sales tax ranges from 7.25% to over 10% depending on your county. On top of that, registration fees are calculated by the DMV based on the vehicle's purchase price, often adding several hundred dollars to the OTD total.",
    introAngle:
      "California is the one state where the documentation fee is actually controlled. While dealers in Florida or Texas can charge $500 or more just to process paperwork, California law limits that charge to around $85 — which is one reason California buyers sometimes get a cleaner OTD breakdown than buyers elsewhere. That doesn't mean you're protected on everything else. Sales tax rates vary significantly by county, and registration fees — calculated by the DMV based on your purchase price — can add hundreds to the total that many buyers don't anticipate.",
    whatToBuyersNeed:
      "California buyers have one meaningful regulatory advantage on the doc fee, but the real complexity is in local sales tax rates and DMV registration fees. Knowing what's typical in your county before you receive a quote puts you in a much better position to evaluate whether the OTD total you're seeing is reasonable.",
    docFeeSection:
      "California's documentation fee — the charge dealers add for processing your purchase paperwork — is regulated by state law. Most California dealers charge somewhere at or below that cap, and a doc fee significantly above it should prompt a question. That said, the cap only applies to the documentation fee itself. It doesn't limit what dealers can charge for optional add-ons like paint protection, extended warranties, or nitrogen tires — those are separate and negotiable.",
    taxSection:
      "California's base state sales tax is 7.25%, but the effective rate most buyers pay is higher once local district taxes are added in. Buyers in Los Angeles County typically see rates around 10.25%. Parts of the Bay Area can reach 10.75%. The tax is calculated on the vehicle's sale price after any manufacturer rebates, but before dealer add-ons unless those are priced into the vehicle. Registration fees are a separate charge calculated by the California DMV based on the vehicle's purchase price — on a typical new vehicle, this adds several hundred dollars to the out-of-pocket total.",
    watchForItems: [
      {
        flag: "Doc fee above $100",
        detail:
          "California law limits the documentation fee to around $85. A fee meaningfully above that is worth questioning, though dealers may present it as a standard processing charge.",
      },
      {
        flag: "Add-ons bundled as mandatory",
        detail:
          "Paint sealant, fabric protection, and similar packages are common in California dealerships and are often presented as pre-installed or required. They're almost always optional and negotiable.",
      },
      {
        flag: "Sales tax quoted at the wrong rate",
        detail:
          "Sales tax varies by county in California. If the dealer quotes a rate that doesn't match your county's combined rate, the OTD total may not be accurate.",
      },
      {
        flag: "Registration estimated too low",
        detail:
          "California registration fees can be significant on a higher-priced vehicle. A quote that shows a low or round-number registration estimate may not reflect the actual DMV calculation.",
      },
    ],
    typicalVsQuestionable: {
      heading: "What's typical in California vs. what should make you ask questions",
      typical: [
        "Documentation fee at or below $85",
        "Sales tax between 7.25% and 10.75% depending on your county",
        "Registration fees calculated by the California DMV based on vehicle purchase price",
        "Destination charge passed through from the manufacturer at a set rate",
      ],
      questionable: [
        "Doc fee significantly above $85 — worth asking the dealer to explain",
        "Optional packages like paint protection or fabric coating listed as required or pre-installed",
        "A sales tax rate that doesn't match your county's combined rate",
        "Registration shown as a flat or unusually low estimate rather than a DMV-calculated figure",
      ],
    },
    negotiationNote:
      "Because California caps the doc fee, the items most worth negotiating are the vehicle's sale price itself, any dealer add-on packages, and any market adjustment fees if the vehicle is in high demand. Ask for an itemized out-of-the-door breakdown in writing before you visit, and confirm the sales tax rate matches your county. A dealer who is reluctant to provide a written OTD figure is often managing a number they'd rather you not calculate on your own.",
    ctaHeading: "Have a California dealer quote with fees you want to check?",
    ctaBody:
      "Odigos reviews your quote against what's typical in California — including the doc fee cap and local tax rates — and flags anything that looks off.",
    relatedLinks: [
      { href: "/out-the-door-price", label: "What is an out-the-door price?" },
      { href: "/dealer-doc-fee", label: "What is a dealer documentation fee?" },
      { href: "/dealer-doc-fee-by-state", label: "Doc fee ranges by state" },
      { href: "/car-dealer-fees-explained", label: "Common car dealer fees explained" },
      { href: "/are-dealer-add-ons-mandatory", label: "Are dealer add-ons mandatory?" },
      { href: "/how-to-ask-for-out-the-door-price", label: "How to ask for the out-the-door price" },
    ],
  },

  texas: {
    state: "Texas",
    abbr: "TX",
    slug: "texas",
    docFeeRange: "Typically $150–$300, though higher is common",
    docFeeCap: null,
    hasDocFeeCap: false,
    salesTaxRate: "6.25%–8.25%",
    salesTaxNote:
      "Texas has a 6.25% state sales tax on vehicle purchases, with local jurisdictions allowed to add up to 2% more. Most Texas metro areas land at the 8.25% combined rate.",
    registrationNote:
      "Texas registration fees are set by the state and vary by vehicle weight. For most passenger vehicles, buyers can expect base registration of around $50–$80 per year, plus any local county fees.",
    snippetAnswer:
      "Texas has no cap on dealer documentation fees — buyers typically see $150 to $300, though some dealers charge more. Sales tax is 6.25% statewide with local additions up to 8.25%. Registration fees are generally lower than many other states, but the absence of any doc fee limit means the paperwork charge alone can vary widely between dealerships.",
    introAngle:
      "Texas is one of the most competitive car-buying markets in the country — Houston, Dallas-Fort Worth, San Antonio, and Austin all have large dealer networks with real price competition. But competition doesn't protect you from the fee side of the deal. Texas has no limit on what dealers can charge for documentation, and in a state where every dollar seems negotiable on the vehicle price, the fees section of the contract often gets less scrutiny than it deserves. Understanding what's typical before you sit down gives you one more piece of leverage.",
    whatToBuyersNeed:
      "Texas buyers are generally in a strong negotiating position on price, but the lack of any documentation fee limit means that line can vary by hundreds of dollars between dealers selling the same vehicle. Comparing OTD quotes from multiple dealers — including the fee breakdown — is the most effective way to find the actual best deal in a Texas market.",
    docFeeSection:
      "Texas imposes no cap on documentation fees, which means dealers set their own rates. Buyers in Texas commonly see doc fees ranging from around $150 to $300, but some dealers charge significantly more — occasionally near or above $500. The fee is generally presented as non-negotiable, but in a competitive market with multiple dealers selling the same vehicle, it's worth asking whether any part of the fee can be applied to the vehicle price. More practically, getting OTD quotes from several dealers lets you see how their fee structures actually compare.",
    taxSection:
      "Texas charges a 6.25% sales tax on vehicle purchases at the state level. Local jurisdictions can add up to 2%, bringing the combined rate in most Texas metro areas to 8.25%. The tax is calculated on the sale price of the vehicle — after any trade-in credit, which reduces your taxable amount in Texas. Registration fees are relatively straightforward: most passenger vehicles run around $50–$80 per year in base state registration plus county fees, which is generally lower than states like California or New York.",
    watchForItems: [
      {
        flag: "High documentation fee with no explanation",
        detail:
          "Texas has no doc fee cap. A fee above $400–$500 is on the higher end and worth asking about, particularly if you're comparing quotes from multiple dealers in the same market.",
      },
      {
        flag: "Market adjustment fee on popular models",
        detail:
          "Texas dealers in high-demand markets sometimes add market adjustment fees above MSRP on trucks and SUVs. These are legal but entirely negotiable.",
      },
      {
        flag: "Trade-in credit not applied before tax",
        detail:
          "Texas allows the trade-in credit to reduce the taxable sale price. If a dealer calculates tax on the full vehicle price without crediting your trade, your OTD total will be higher than it should be.",
      },
      {
        flag: "Optional add-ons listed without prices",
        detail:
          "Texas dealers sometimes present protection packages and dealer add-ons without itemizing the individual cost of each. Ask for every add-on to be priced separately before you evaluate the deal.",
      },
    ],
    typicalVsQuestionable: {
      heading: "What's typical in Texas vs. what should make you ask questions",
      typical: [
        "Documentation fee in the $150–$300 range",
        "Sales tax at 8.25% in most Texas metros (6.25% state + local)",
        "Trade-in credit reducing the taxable amount",
        "Registration fees of approximately $50–$80 plus county charges",
      ],
      questionable: [
        "Documentation fee above $400–$500 without explanation",
        "A market adjustment fee added to MSRP on trucks or popular SUVs",
        "Tax calculated on full vehicle price without applying the trade-in credit",
        "Add-ons bundled without individual pricing, making it hard to evaluate what you're paying for",
      ],
    },
    negotiationNote:
      "Texas's competitive dealer market is your biggest asset. Getting written OTD quotes from two or three dealers on the same vehicle — or the same trim — gives you real leverage to negotiate not just the vehicle price but also which add-ons are included and whether the doc fee can be offset elsewhere. Dealers in major Texas metros are generally accustomed to competitive shoppers. Ask for everything in writing, compare the OTD totals line by line, and use any meaningful gap as a starting point for negotiation.",
    ctaHeading: "Have a Texas dealer quote with extra fees?",
    ctaBody:
      "Texas has no doc fee cap. Odigos reviews your full quote and flags what's typical, what's optional, and what you can push back on.",
    relatedLinks: [
      { href: "/out-the-door-price", label: "What is an out-the-door price?" },
      { href: "/dealer-doc-fee", label: "What is a dealer documentation fee?" },
      { href: "/dealer-doc-fee-by-state", label: "Doc fee ranges by state" },
      { href: "/doc-fee-too-high", label: "Is the doc fee too high?" },
      { href: "/are-dealer-add-ons-mandatory", label: "Are dealer add-ons mandatory?" },
      { href: "/how-to-ask-for-out-the-door-price", label: "How to ask for the out-the-door price" },
    ],
  },

  florida: {
    state: "Florida",
    abbr: "FL",
    slug: "florida",
    docFeeRange: "Commonly $499–$999",
    docFeeCap: null,
    hasDocFeeCap: false,
    salesTaxRate: "6%–7.5%",
    salesTaxNote:
      "Florida's state sales tax on vehicles is 6%, with a county-level discretionary surtax that varies. Most Florida counties add between 0.5% and 1.5%, bringing the effective rate in many areas to 6.5%–7.5%.",
    registrationNote:
      "Florida registration fees vary by vehicle weight. Most passenger vehicles run $27.60–$45.60 in base registration fees annually, though initial registration on a new vehicle includes additional title fees.",
    snippetAnswer:
      "Florida has no cap on dealer documentation fees, and buyers commonly see doc fees of $499 to $999 — among the highest in the country. Sales tax is 6% statewide with county surtaxes typically bringing the combined rate to 6.5%–7.5%. Florida buyers should request an itemized out-the-door price in writing before visiting, since the doc fee alone can significantly change the total cost of the deal.",
    introAngle:
      "Florida has a well-earned reputation among car buyers for high documentation fees. With no state cap on what dealers can charge for paperwork, doc fees at Florida dealerships often land between $500 and $999 — and in some cases higher. That's not a small rounding error; on a $35,000 vehicle, a $999 doc fee adds nearly 3% to the effective cost before taxes even enter the picture. Understanding this before you walk in — and knowing how to ask for an itemized breakdown — is especially important in Florida, where the gap between the advertised price and the actual out-the-door total tends to be larger than buyers expect.",
    whatToBuyersNeed:
      "Florida buyers face more fee exposure than buyers in most other states simply because of the uncapped documentation fee. The most effective protection is requesting a written out-the-door price — itemized by line — before visiting any dealership. Comparing OTD quotes from multiple Florida dealers on the same vehicle often reveals fee differences of several hundred dollars on the same car.",
    docFeeSection:
      "Florida dealers are permitted to charge any documentation fee they choose, and many charge at the upper end of what the market will bear. Fees of $499, $599, $699, and $999 are all common at Florida dealerships. While this fee is typically presented as non-negotiable and uniform across all customers, the amount varies significantly from one dealer to the next. Two dealers in the same city selling the same vehicle may differ by $400 on documentation alone. This makes comparing OTD quotes — not just advertised prices — particularly important in Florida.",
    taxSection:
      "Florida's base vehicle sales tax rate is 6%, applied to the full purchase price of the vehicle. Counties assess an additional discretionary surtax — most Florida counties add between 0.5% and 1.5%, bringing the total rate for most buyers to somewhere between 6.5% and 7.5%. Unlike some states, Florida does not allow a trade-in credit to reduce the taxable sale price on the vehicle, which means buyers who are trading in a car still pay tax on the full purchase price of the new vehicle. Registration fees themselves are relatively modest — most passenger vehicles are in the $27–$46 annual range — but initial title fees apply when registering a newly purchased vehicle.",
    watchForItems: [
      {
        flag: "Documentation fee near or above $999",
        detail:
          "While common, a doc fee at the high end of the Florida range — particularly $799 or above — is worth asking about, especially if you're comparing multiple dealers. The fee varies significantly between dealerships.",
      },
      {
        flag: "Trade-in value quoted before discussing purchase price",
        detail:
          "Florida dealers sometimes prefer to discuss trade-in value and purchase price together, which can obscure how each is being calculated. Getting the purchase price and trade-in offer evaluated separately makes it easier to assess both.",
      },
      {
        flag: "No sales tax credit on trade-in",
        detail:
          "Unlike many states, Florida does not offer a sales tax credit for trade-ins. If you're trading in a vehicle, your sales tax is still calculated on the full price of the new car. Make sure your OTD quote reflects this correctly.",
      },
      {
        flag: "Pre-installed add-ons with no removal option",
        detail:
          "Florida dealers frequently pre-install paint protection or tint packages and present them as non-removable. Whether pre-installed or not, the cost of these items is generally still negotiable as a credit against the vehicle price.",
      },
    ],
    typicalVsQuestionable: {
      heading: "What's typical in Florida vs. what should make you ask questions",
      typical: [
        "Documentation fee between $499 and $799 (high by national standards, but common in FL)",
        "Sales tax between 6% and 7.5% depending on your county",
        "Sales tax calculated on the full vehicle purchase price (no trade-in credit in FL)",
        "Modest annual registration fees, plus title fees on a new vehicle",
      ],
      questionable: [
        "Documentation fee above $999 — while possible, this is at the top of the FL range and worth questioning",
        "Trade-in credit applied to reduce taxable price (FL doesn't allow this — if it appears, verify it's correctly calculated)",
        "Pre-installed protection packages presented as mandatory or non-negotiable in cost",
        "A quote that doesn't itemize the doc fee, taxes, and add-ons separately",
      ],
    },
    negotiationNote:
      "In Florida, the most important step is getting a written OTD quote before you go in — and getting the same quote from at least one other dealer. Because the documentation fee varies so much between Florida dealerships, the vehicle with the lower advertised price isn't always the better deal once you add the fee in. Ask for itemized OTD pricing by email or text, compare the total — not the vehicle price — across dealers, and use any gap to negotiate. Add-ons presented as pre-installed can sometimes be credited back against the vehicle price even if the dealer says they can't be removed physically.",
    ctaHeading: "Seeing a high doc fee on a Florida quote?",
    ctaBody:
      "Florida has no doc fee cap, and fees above $699 are common. Odigos checks your quote against what's typical in Florida and flags anything that stands out.",
    relatedLinks: [
      { href: "/out-the-door-price", label: "What is an out-the-door price?" },
      { href: "/dealer-doc-fee", label: "What is a dealer documentation fee?" },
      { href: "/dealer-doc-fee-by-state", label: "Doc fee ranges by state" },
      { href: "/doc-fee-too-high", label: "Is the doc fee too high?" },
      { href: "/are-dealer-add-ons-mandatory", label: "Are dealer add-ons mandatory?" },
      { href: "/car-dealer-fees-explained", label: "Common car dealer fees explained" },
    ],
  },

  "new-york": {
    state: "New York",
    abbr: "NY",
    slug: "new-york",
    docFeeRange: "Typically $75–$175",
    docFeeCap: null,
    hasDocFeeCap: false,
    salesTaxRate: "4%–8.875%",
    salesTaxNote:
      "New York's state sales tax on vehicles is 4%, but local and county taxes add significantly. In New York City the combined rate is 8.875%. Upstate counties generally land between 7% and 8%. The rate you pay depends on where you register the vehicle, not necessarily where you buy it.",
    registrationNote:
      "New York registration fees depend on vehicle weight and county. Most passenger vehicles run between $26 and $140 in base fees, with additional county-level surcharges in some areas.",
    snippetAnswer:
      "New York doesn't cap documentation fees, but dealers typically charge less than in states like Florida — buyers commonly see $75 to $175. The bigger complexity is taxes: New York City buyers pay a combined sales tax rate of 8.875%, while upstate buyers generally see 7%–8%. Because the tax applies based on where you register the vehicle, buyers near city limits should confirm which rate applies to their purchase.",
    introAngle:
      "New York's car-buying picture splits sharply along geographic lines. Buyers in New York City and surrounding metro areas face some of the highest effective tax rates in the country — 8.875% in the five boroughs — which means the gap between MSRP and the real out-the-door total can be significant even before dealer fees enter the picture. Buyers upstate or in lower-tax counties get a different experience. Understanding which rate applies to your registration, not just your purchase location, is one of the first things to clarify before you evaluate any dealer quote in New York.",
    whatToBuyersNeed:
      "New York buyers, particularly in the NYC metro area, often underestimate the tax side of their OTD total because the advertised price looks reasonable before state and local taxes are factored in. The documentation fee in New York is typically modest relative to states like Florida or Georgia, but the tax calculation — especially for buyers near county or city lines — can meaningfully change which deal is actually better.",
    docFeeSection:
      "New York has no hard cap on documentation fees, but market rates at most dealers tend to be lower than in states with no regulatory pressure at all. Buyers commonly see doc fees between $75 and $175 at New York dealerships. Fees significantly above that range — particularly above $300 — are worth questioning, since they're higher than what most dealers in the state charge for comparable paperwork processing. As with any state, the doc fee is typically presented as non-negotiable, but the amount varies between dealers and it's worth comparing OTD totals across multiple quotes.",
    taxSection:
      "New York charges a 4% state sales tax on vehicle purchases, with county and local taxes layered on top. The combined rate depends on where you register the vehicle — not simply where you purchase it. Buyers who live in New York City pay 8.875% on the purchase price. Buyers in suburban counties like Westchester, Nassau, or Suffolk see rates typically around 7%–8.625%. Upstate counties generally land between 7% and 8%. If you're buying a vehicle near a county line, confirming your actual registration county before evaluating any quote is worth doing — the difference can be meaningful on a $40,000 purchase.",
    watchForItems: [
      {
        flag: "Tax rate quoted for the wrong county",
        detail:
          "Because New York's combined sales tax varies significantly by county and municipality, a quote that uses the wrong rate — even innocently — can make the OTD total look better or worse than it actually is.",
      },
      {
        flag: "Doc fee above $250",
        detail:
          "While not illegal, a doc fee above $200–$250 is above the typical range for New York dealers and worth asking about before accepting it.",
      },
      {
        flag: "NYC buyers purchasing outside the city",
        detail:
          "Some buyers near NYC are aware that vehicle prices can differ between dealers — but the sales tax still applies based on registration address, so buying in a lower-tax county doesn't necessarily reduce your tax if you live in the city.",
      },
      {
        flag: "Dealer add-ons on pre-owned certified vehicles",
        detail:
          "Certified pre-owned vehicles in New York sometimes come with a set of dealer-applied protections that are bundled into the CPO price but presented as optional upgrades. Clarify what's included at the manufacturer level versus what the dealer added.",
      },
    ],
    typicalVsQuestionable: {
      heading: "What's typical in New York vs. what should make you ask questions",
      typical: [
        "Documentation fee between $75 and $175",
        "Sales tax of 7%–8.875% depending on your registration county or municipality",
        "Registration fees varying by vehicle weight and county",
        "Destination charge passed through from the manufacturer at a set rate",
      ],
      questionable: [
        "Documentation fee above $250 — higher than typical for New York dealers",
        "Sales tax quoted for the dealership's county rather than your registration address",
        "A flat or estimated tax figure rather than a rate-based calculation",
        "Add-ons bundled into a CPO price without itemizing what the manufacturer includes vs. what the dealer added",
      ],
    },
    negotiationNote:
      "In the New York market — particularly downstate — the vehicle price itself is often the most negotiable element. The doc fee is lower here than in many states, but verifying that the sales tax is calculated at the correct rate for your registration address is worth doing before you accept any quote. For NYC buyers, a $40,000 vehicle at 8.875% means over $3,500 in sales tax alone — getting that calculation right matters. Ask for a written OTD breakdown by email before visiting, confirm the tax rate used, and compare totals across at least two dealers.",
    ctaHeading: "Have a New York dealer quote with fees you want to verify?",
    ctaBody:
      "Between state and local taxes, New York OTD prices can catch buyers off guard. Odigos breaks down your quote and checks whether the numbers add up.",
    relatedLinks: [
      { href: "/out-the-door-price", label: "What is an out-the-door price?" },
      { href: "/dealer-doc-fee", label: "What is a dealer documentation fee?" },
      { href: "/dealer-doc-fee-by-state", label: "Doc fee ranges by state" },
      { href: "/car-dealer-fees-explained", label: "Common car dealer fees explained" },
      { href: "/are-dealer-add-ons-mandatory", label: "Are dealer add-ons mandatory?" },
      { href: "/how-to-ask-for-out-the-door-price", label: "How to ask for the out-the-door price" },
    ],
  },

  georgia: {
    state: "Georgia",
    abbr: "GA",
    slug: "georgia",
    docFeeRange: "Typically $300–$599",
    docFeeCap: null,
    hasDocFeeCap: false,
    salesTaxRate: "No traditional sales tax — TAVT applies",
    salesTaxNote:
      "Georgia replaced its traditional sales tax on vehicle purchases with a Title Ad Valorem Tax (TAVT) in 2013. The TAVT is a one-time fee calculated as a percentage of the vehicle's fair market value — currently 7% — paid at the time of registration. Buyers who move to Georgia with a vehicle purchased elsewhere also pay TAVT on registration.",
    registrationNote:
      "Georgia annual registration fees are relatively modest — typically around $20 per year for most passenger vehicles — because the TAVT replaces the heavier upfront tax. However, buyers often underestimate the TAVT itself, which can add $2,000–$3,000 or more on a $35,000–$45,000 vehicle.",
    snippetAnswer:
      "Georgia replaced traditional sales tax on vehicle purchases with a one-time Title Ad Valorem Tax (TAVT) of 7%, calculated on the vehicle's fair market value. Buyers often expect a sales tax line and are surprised when it doesn't appear — the TAVT is paid separately at registration. Documentation fees are uncapped in Georgia and commonly run $300–$599. Understanding how TAVT works is key to calculating your real out-the-door cost.",
    introAngle:
      "Georgia's vehicle purchase tax structure is unlike most other states, and it's the source of more buyer confusion than almost any other line item in a Georgia car deal. Since 2013, Georgia has collected a Title Ad Valorem Tax — TAVT — instead of a traditional sales tax at the point of purchase. The TAVT is a one-time, flat-rate tax calculated on the vehicle's fair market value, currently set at 7%. It's paid at registration, not at the dealership. That timing creates a real planning problem: buyers who are used to seeing sales tax rolled into the dealer's OTD quote may not realize the TAVT is coming until they're at the tag office. Knowing how the TAVT works before you finalize any deal is one of the most important things a Georgia car buyer can do.",
    whatToBuyersNeed:
      "Georgia buyers need to understand two things that most out-of-state guides miss. First, the TAVT isn't typically included in the dealer's OTD quote — it's collected separately at registration, which means the real cost of buying a car in Georgia is higher than the dealer's number. Second, documentation fees in Georgia are uncapped and typically run $300–$599, which is meaningfully higher than states where market rates are lower. Factoring in both is essential to understanding what you'll actually pay.",
    docFeeSection:
      "Georgia has no cap on dealer documentation fees, and the market rate at most Georgia dealerships tends to run higher than in states where competitive pressure or informal conventions keep fees lower. Buyers commonly see doc fees between $300 and $599 in Georgia. Because the TAVT is handled separately, some buyers focus primarily on the dealer's number and don't scrutinize the doc fee as closely — which makes it worth paying particular attention to. As in most states, the fee is presented as non-negotiable, but comparing OTD quotes from multiple dealers on the same vehicle often reveals meaningful differences in the fee.",
    taxSection:
      "Georgia's Title Ad Valorem Tax (TAVT) replaced traditional sales tax on new and used vehicle purchases in 2013. Rather than paying sales tax at the dealership, Georgia buyers pay a 7% title tax calculated on the vehicle's fair market value at the time of registration. The fair market value is set by the Georgia Department of Revenue and is based on the model year and vehicle type — not necessarily the price you negotiated. On a vehicle with a fair market value of $35,000, the TAVT alone would be approximately $2,450. This is paid separately from the dealer transaction, typically at the county tag office, and is not included in most dealers' OTD quotes. Annual registration fees after the initial TAVT payment are modest, typically around $20.",
    watchForItems: [
      {
        flag: "TAVT not included in the dealer's OTD quote",
        detail:
          "Most Georgia dealers do not include the TAVT in their out-the-door figures because it's collected at registration, not at the dealership. Buyers should calculate the TAVT separately and add it to the dealer's quote to understand total cost.",
      },
      {
        flag: "Documentation fee above $600",
        detail:
          "Georgia doc fees of $300–$599 are common, but a fee above $600 is at the high end of the range and worth asking about, particularly if you're comparing quotes from multiple dealers.",
      },
      {
        flag: "TAVT calculated on a higher-than-negotiated value",
        detail:
          "The TAVT is based on the Georgia Department of Revenue's assessed fair market value for the vehicle, not the sale price you agreed to. If you negotiated below fair market value, your TAVT may be calculated on the higher figure.",
      },
      {
        flag: "Sales tax line in the dealer quote",
        detail:
          "Georgia doesn't use traditional sales tax on vehicle purchases. If a dealer's quote shows a sales tax line, verify what it represents — it may be a legitimate fee description error, or it may indicate a different charge needs clarification.",
      },
    ],
    typicalVsQuestionable: {
      heading: "What's typical in Georgia vs. what should make you ask questions",
      typical: [
        "Documentation fee between $300 and $599",
        "No sales tax line in the dealer's OTD quote (TAVT is collected separately at registration)",
        "TAVT of approximately 7% of the vehicle's fair market value paid at the tag office",
        "Annual registration fees of approximately $20 after TAVT is paid",
      ],
      questionable: [
        "Documentation fee above $600 without explanation",
        "A sales tax line in the dealer's quote — verify what this represents",
        "TAVT claimed to be included in the dealer's OTD price (unusual — confirm how it's being handled)",
        "Add-ons presented as mandatory or pre-installed without individual pricing",
      ],
    },
    negotiationNote:
      "Georgia's most important buyer move is to calculate your TAVT before finalizing any deal and add it to the dealer's OTD figure. The Georgia Department of Revenue publishes fair market values by vehicle, and you can estimate the TAVT before you negotiate. On the dealer side, the doc fee and any add-on packages are the primary negotiating levers. Because TAVT is outside the dealer's control, negotiations at the dealership should focus on the vehicle price, the doc fee relative to other dealers' quotes, and any optional packages that were added to the deal.",
    ctaHeading: "Not sure how Georgia's title tax affects your out-the-door price?",
    ctaBody:
      "Georgia's TAVT works differently from sales tax in other states. Odigos breaks down your dealer quote and flags any fees that look off.",
    relatedLinks: [
      { href: "/out-the-door-price", label: "What is an out-the-door price?" },
      { href: "/dealer-doc-fee", label: "What is a dealer documentation fee?" },
      { href: "/dealer-doc-fee-by-state", label: "Doc fee ranges by state" },
      { href: "/doc-fee-too-high", label: "Is the doc fee too high?" },
      { href: "/car-dealer-fees-explained", label: "Common car dealer fees explained" },
      { href: "/how-to-ask-for-out-the-door-price", label: "How to ask for the out-the-door price" },
    ],
  },
};

export function getStateFee(slug: string): StateFeeData | null {
  return STATE_FEES[slug] ?? null;
}

export const ALL_STATE_SLUGS = Object.keys(STATE_FEES);
