export interface StateFeeData {
  name: string;
  abbreviation: string;
  slug: string;
  docFeeRange: string;
  hasCap: boolean;
  metaDescription: string;
  pageTitle?: string;
  h1?: string;
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
  sources: string[];
  specialNotes: string | null;
  dealerMessage: string;
  lastVerified: string;
  commonQuestions?: { q: string; a: string }[];
  competitorGapSection?: string;
  ctaTopBody?: string;
  ctaMidBody?: string;
  ctaMidLink?: string;
  ctaBottomHeadline?: string;
  ctaBottomBody?: string;
  ctaBottomButton?: string;
  buyerTip?: string;
}

const STANDARD_LINKS = [
  { href: "/out-the-door-price", label: "out-the-door price" },
  { href: "/calculate-out-the-door-price", label: "how to calculate out-the-door price" },
  { href: "/what-does-out-the-door-price-include", label: "what the out-the-door price includes" },
  { href: "/dealer-doc-fee", label: "documentation fee" },
  { href: "/car-dealer-fees-list", label: "car dealer fees list" },
  { href: "/car-dealer-fees-by-state", label: "car dealer fees by state" },
  { href: "/dealer-doc-fee-by-state", label: "dealer doc fee by state" },
];

export const STATE_FEES: Record<string, StateFeeData> = {
  alabama: {
    name: "Alabama",
    abbreviation: "AL",
    slug: "alabama",
    docFeeRange: "Reported $400–$700 (not verified)",
    hasCap: false,
    metaDescription:
      "Alabama does not have a verified documentation-fee cap on file. Reported $400–$700 (not verified). Compare the itemized out-the-door price before you sign.",
    capNote:
      "Alabama does not have a verified documentation-fee cap in this file. A stored note may say dealers set the fee, but that is not a legal finding that no cap exists. Unverified reports mention documentation fees around $400–$700. That range is not a market standard. Compare itemized out-the-door quotes instead of treating one line as legal or illegal.",
    salesTaxNote:
      "Alabama's state sales tax on automotive vehicles is 2% (the general sales-tax rate is 4%), but local county and city taxes can push the combined rate higher once local taxes are added. Those combined rates are not verified in this file. Rates vary significantly by jurisdiction — always verify the effective rate for your specific purchase location.",
    registrationNote:
      "Alabama registration includes a base state fee of approximately $23, plus county-specific fees that vary by location. Title fee is $15.",
    introAngle:
      "Alabama does not have a verified documentation-fee cap on file, meaning buyers can see fees anywhere from a few hundred dollars to $700 or more at the same dealership on different days. Local additions sit on top of the 2% automotive rate. Combined rates are not fully verified in this file, so look up the rate for the dealer's location before you estimate the out-the-door price. Understanding both the doc fee and your local rate is essential before comparing quotes.",
    snippetAnswer:
      "Alabama does not have a verified documentation-fee cap in this file. A stored note may say dealers set the fee, but that is not a legal finding that no cap exists. Unverified reports mention documentation fees around $400–$700. That range is not a market standard. The automotive sales tax on vehicles is 2%, Local additions are not verified in this file. Look them up for the dealer's county. Always compare the full out-the-door price, not just the vehicle price.",
    watchFor: [
      "High local tax rates: Alabama's local additions sit on top of the 2% automotive rate. Confirm the combined rate for your county. Verify the combined rate for your purchase location before estimating your OTD total.",
      "Doc fees without a verified cap on file: This file does not verify a limit on what dealers can charge. If the doc fee is above $600, ask whether it's the same for all customers or negotiable.",
      "Add-on packages: protection packages, paint sealant, and nitrogen tires are common in Alabama dealerships and are almost never required even when presented as standard.",
    ],
    negotiationNote:
      "Because Alabama does not have a verified doc-fee cap on file, the fee is one of the items worth questioning. Some dealers will reduce it to close a deal, especially in competitive markets. Focus on the total OTD price and get competing quotes from multiple dealers to create leverage. The vehicle price is almost always the most flexible number in the deal.",
    ctaHeading: "Have an Alabama dealer quote you want to check?",
    ctaBody:
      "Paste the quote and Odigos checks whether the charges are itemized, whether the totals reconcile, and whether a fee exceeds a verified state cap. Market value stays unverified unless you optionally enter a factory window sticker MSRP. That sticker is not a live market price, and an unverified fee range is not a legal limit.",
    internalLinks: STANDARD_LINKS,
    sources: [
      "https://caredge.com/guides/car-dealer-doc-fee-by-state",
      "https://www.revenue.alabama.gov/sales-use/state-sales-use-tax-rates/",
    ],
    specialNotes: null,
    dealerMessage:
      "Hi — I'm interested in a vehicle at your dealership and would like to confirm the full out-the-door price before visiting. Could you please send me an itemized breakdown showing the vehicle sale price, documentation fee, all additional dealer fees, Alabama sales tax (state + local), title fee, and registration costs? I'd like to understand the complete total before scheduling a visit. Thank you.",
    lastVerified: "2026-03",
    buyerTip: "Alabama's automotive sales tax on file is 2%, and local additions change the combined rate. Those combined rates are not verified in this file. Before finalizing any deal, look up the exact combined rate for your dealer's zip code on the Alabama Department of Revenue's rate lookup tool.",
  },

  alaska: {
    name: "Alaska",
    abbreviation: "AK",
    slug: "alaska",
    docFeeRange: "Reported $0–$500 (not verified)",
    hasCap: false,
    metaDescription:
      "Alaska does not have a verified documentation-fee cap on file. Reported $0–$500 (not verified). Compare the itemized out-the-door price before you sign.",
    capNote:
      "Alaska does not have a verified documentation-fee cap in this file. A stored note may say dealers set the fee, but that is not a legal finding that no cap exists. Unverified reports mention documentation fees up to $500. That range is not a market standard. Compare itemized out-the-door quotes instead of treating one line as legal or illegal.",
    salesTaxNote:
      "Alaska has no state sales tax on vehicles. However, municipalities may impose their own sales tax ranging from 0% to 9.5%. If you're buying in Anchorage or another city, verify whether a local tax applies.",
    registrationNote:
      "Alaska registration fees run approximately $100 for a two-year registration period. The title fee is $15. Actual costs vary by municipality.",
    introAngle:
      "Alaska is one of five states with no state sales tax, which simplifies the OTD picture for buyers. However, doc fees are without a verified cap on file and can vary widely — and a December 2025 enforcement action against Lithia Motors ($300K civil penalty for hidden fees) put Alaska dealers on notice that fee transparency is required. Dealers must include the doc fee in advertised prices.",
    snippetAnswer:
      "Alaska does not have a verified documentation-fee cap in this file. A stored note may say dealers set the fee, but that is not a legal finding that no cap exists. Unverified reports mention documentation fees up to $500. That range is not a market standard. Municipal taxes may apply depending on where you purchase.",
    watchFor: [
      "Municipal sales taxes: Alaska has no state tax, but some cities and boroughs have local sales taxes up to 9.5%. Confirm whether a local tax applies at your dealership's location.",
      "Hidden or add-on doc fees: the 2025 Lithia Motors case shows that Alaska dealers have sometimes obscured fees. Ask for the doc fee to be itemized clearly before you agree to any price.",
      "Doc fee variability: without a cap, fees vary widely between dealers. Compare the full OTD quotes from multiple Alaska dealers, not just the advertised vehicle price.",
    ],
    negotiationNote:
      "Alaska's remote market means fewer dealers to compare in most areas — which reduces buyer leverage. Focus your energy on the vehicle price and ask for the doc fee to be disclosed upfront. In Anchorage, where competition is higher, you have more options. Always ask for a full itemized OTD breakdown before visiting.",
    ctaHeading: "Have an Alaska dealer quote you want reviewed?",
    ctaBody:
      "Paste the quote and Odigos checks whether the charges are itemized, whether the totals reconcile, and whether a fee exceeds a verified state cap. Market value stays unverified unless you optionally enter a factory window sticker MSRP. That sticker is not a live market price, and an unverified fee range is not a legal limit.",
    internalLinks: STANDARD_LINKS,
    sources: [
      "https://law.alaska.gov/press/releases/2025/122925-LithiaMotors.html",
    ],
    specialNotes:
      "Dec 2025: Lithia Motors ordered to pay $300K civil penalty for hidden doc fees. Dealers must include doc fees in advertised price. Fee data for Alaska may vary — verify current rates with your local DMV or municipal office, as Alaska's unusual market and limited regulatory data make fee averages less reliable than in other states.",
    dealerMessage:
      "Hi — I'm interested in a vehicle at your dealership and would like to confirm the full out-the-door price before visiting. Could you please send me an itemized breakdown showing the vehicle sale price, documentation fee, all additional dealer fees, any applicable local/municipal taxes, title fee, and registration costs? (Alaska has no state sales tax, but I want to know if any local tax applies.) I'd like to see the complete total. Thank you.",
    lastVerified: "2026-03",
    buyerTip: "Following Alaska's December 2025 enforcement action against Lithia Motors — which resulted in a $300K civil penalty — Alaska dealers are now required to include documentation fees in their advertised prices. If a dealer's website price doesn't match what's on the quote, the doc fee may not be included. Ask the dealer to confirm that the advertised price and any doc fee shown together equal the pre-tax sale price.",
  },

  arizona: {
    name: "Arizona",
    abbreviation: "AZ",
    slug: "arizona",
    docFeeRange: "Reported $400–$600 (not verified)",
    hasCap: false,
    metaDescription:
      "Arizona does not have a verified documentation-fee cap on file. Reported $400–$600 (not verified). Compare the itemized out-the-door price before you sign.",
    capNote:
      "Arizona does not have a verified documentation-fee cap in this file. A stored note may say dealers set the fee, but that is not a legal finding that no cap exists. Unverified reports mention documentation fees around $400–$600. That range is not a market standard. Compare itemized out-the-door quotes instead of treating one line as legal or illegal.",
    salesTaxNote:
      "Arizona applies a Transaction Privilege Tax (TPT) on vehicle sales. The state base rate is 5.6%, and local city/county additions bring combined rates to 8.6% in Phoenix and up to 11.2% in some areas. The TPT applies to the full purchase price.",
    registrationNote:
      "Arizona registration includes a base $8 registration fee plus a Vehicle License Tax (VLT) calculated on the vehicle's assessed value. The VLT is roughly 60% of the MSRP at 1% per year, so a $40,000 vehicle in its first year carries a significant VLT. The title fee is $4.",
    introAngle:
      "Arizona does not have a verified doc-fee cap on file, and buyers often encounter fees in the $400–$600 range. The state's Transaction Privilege Tax — essentially a sales tax on the dealer's gross income — applies to vehicle sales and varies significantly by city. Phoenix area buyers pay around 8.6%, while some areas approach 11%. The Vehicle License Tax, which is value-based rather than flat, can also surprise buyers who are used to simple flat-rate registration.",
    snippetAnswer:
      "Arizona does not have a verified documentation-fee cap in this file. A stored note may say dealers set the fee, but that is not a legal finding that no cap exists. Unverified reports mention documentation fees around $400–$600. That range is not a market standard. The Transaction Privilege Tax is 5.6% base with local additions up to 11.2% in some cities. Registration includes a value-based Vehicle License Tax that scales with the vehicle's price.",
    watchFor: [
      "Local TPT rates: Phoenix's combined rate (~8.6%) differs significantly from other cities. Always verify the effective tax rate for the dealer's location — it affects your OTD total more than the doc fee in many cases.",
      "Vehicle License Tax scaling: Arizona's VLT is calculated on a percentage of the vehicle's value and decreases with age. For new or near-new vehicles, the VLT is a meaningful additional cost — budget for it when estimating your OTD.",
      "Doc fees without a verified cap on file: ask for the doc fee to be disclosed before visiting. If it exceeds $600, ask whether the vehicle price can be adjusted to offset it.",
    ],
    negotiationNote:
      "Arizona's Phoenix metro is a competitive market with many dealers, which gives buyers real comparison leverage. Get competing OTD quotes from multiple dealers and use them to negotiate both vehicle price and doc fee. The doc fee is not capped, so it is technically negotiable — some dealers will reduce it to close a deal.",
    ctaHeading: "Have an Arizona dealer quote with fees you want to check?",
    ctaBody:
      "Paste the quote and Odigos checks whether the charges are itemized, whether the totals reconcile, and whether a fee exceeds a verified state cap. Market value stays unverified unless you optionally enter a factory window sticker MSRP. That sticker is not a live market price, and an unverified fee range is not a legal limit.",
    internalLinks: STANDARD_LINKS,
    sources: [
      "https://caredge.com/guides/car-dealer-doc-fee-by-state",
      "https://azdor.gov/business/transaction-privilege-tax/tax-rate-table",
    ],
    specialNotes: null,
    dealerMessage:
      "Hi — I'm interested in a vehicle at your dealership and would like to confirm the full out-the-door price before visiting. Could you please send me an itemized breakdown showing the vehicle sale price, documentation fee, all dealer fees, Arizona Transaction Privilege Tax (state + local rate for your city), Vehicle License Tax, title fee, and registration costs? I'd like to understand the complete total before scheduling a visit. Thank you.",
    lastVerified: "2026-03",
    commonQuestions: [
      {
        q: "What is the Arizona Vehicle License Tax (VLT)?",
        a: "The VLT is an annual tax based on your vehicle's assessed value — not a flat fee. Arizona assesses new vehicles at 60% of the manufacturer's base retail price, then applies $2.80 per $100 of assessed value (for new) or $2.89 per $100 (for used). On a new $40,000 vehicle, the first-year VLT is roughly $672. It decreases about 16.25% each year as the assessed value drops. This fee surprises buyers from flat-rate registration states.",
      },
      {
        q: "Is there a cap on dealer doc fees in Arizona?",
        a: "No. Arizona does not have a verified documentation-fee cap in this file. Unverified reports mention $400–$600. That is not a market standard or a legal finding. Because no cap is verified, the fee is one place to ask for a better out-the-door price — especially in the competitive Phoenix metro market. Get the doc fee disclosed before visiting and compare across dealers.",
      },
      {
        q: "What is Arizona's Transaction Privilege Tax on vehicles?",
        a: "Arizona's TPT is essentially a sales tax on the dealer's transaction, passed to the buyer. The state base rate is 5.6%, and cities add their own rates on top. Phoenix's combined rate is about 8.6%, Scottsdale is 8.05%, and Tucson is around 8.7%. Some smaller cities exceed 10%. The tax is calculated on the full purchase price — Arizona does allow trade-in deductions.",
      },
      {
        q: "Does Arizona allow a trade-in tax credit?",
        a: "Yes. Arizona allows the trade-in value to reduce the taxable purchase price. If you're buying a $35,000 vehicle and trading in one worth $10,000, the TPT applies to $25,000. At a combined 8.6% rate (Phoenix), that saves you $860 in tax. Confirm the dealer applies this correctly before signing.",
      },
      {
        q: "Why is my Arizona registration so much higher than other states?",
        a: "Arizona's VLT is value-based, not flat. A new $50,000 vehicle can carry a first-year VLT of $840+, on top of the $8 base registration fee. Most other states charge flat registration fees of $50–$200. The VLT decreases each year as the vehicle ages, but it's a significant first-year cost that many buyers underestimate.",
      },
    ],
    competitorGapSection:
      "Most Arizona car-buying guides explain the TPT and doc fee but barely mention the Vehicle License Tax — the fee that actually surprises buyers the most. The VLT is a value-based annual charge that can easily exceed $600 in the first year on a new vehicle, and it's separate from the TPT, doc fee, and registration. Budget for it explicitly. The other gap: Arizona's city-level TPT rates vary enough that buying from a dealer in a lower-rate city (e.g., Gilbert at 7.8%) versus a higher-rate city (e.g., Tucson at 8.7%) can save several hundred dollars on the same vehicle.",
    pageTitle: "Arizona Dealer Fees (2026): Doc Fee Cap Not Verified — AZ OTD Guide",
    buyerTip: "Arizona's Vehicle License Tax (VLT) is often the biggest registration surprise for buyers from other states. On a $40,000 new vehicle, the first-year VLT is approximately $480. This decreases each year as the vehicle ages, but it's substantially higher than the flat registration fees buyers are used to in states like Texas or Georgia. Always confirm your first-year VLT before comparing OTD quotes across state lines.",
  },

  arkansas: {
    name: "Arkansas",
    abbreviation: "AR",
    slug: "arkansas",
    docFeeRange: "Reported $129 (not verified)",
    hasCap: true,
    metaDescription:
      "Arkansas documentation fee: verified ceiling $129 under 23 CAR § 410-801. Reported $129 (not verified). Compare the itemized out-the-door price before you sign.",
    capNote:
      "23 CAR § 410-801, citing Arkansas Code § 23-112-317, says a dealer service and handling fee shall be no more than $129. The fetched rule does not state an effective date. Odigos can flag a fee above that verified ceiling. Unverified reports mention documentation fees around $129. That range is not a market standard. Compare the itemized out-the-door price. A lower documentation fee with a higher vehicle price is not automatically a better deal.",
    salesTaxNote:
      "Arkansas uses a tiered sales tax rate based on vehicle price: 0% for vehicles under $4,000, 3.5% for $4,000–$10,000, and 6.5% for vehicles over $10,000. Local additions of up to 5% apply, bringing some combined rates to 11.5%. Most buyers of new vehicles fall into the 6.5% base rate bracket.",
    registrationNote:
      "Arkansas registration fees range from $17 to $30 based on vehicle weight. The title fee is $10.",
    introAngle:
      "Arkansas has a verified $129 ceiling on the dealer service and handling fee under 23 CAR § 410-801. Where buyers still need to pay attention is the sales tax structure: Arkansas uses a tiered rate based on the vehicle price, plus local additions that can push rates well above 10% in some jurisdictions. The tax varies more than the doc fee here.",
    snippetAnswer:
      "23 CAR § 410-801 says an Arkansas dealer service and handling fee shall be no more than $129. Unverified reports mention documentation fees around $129. That range is not a market standard. Sales tax is tiered by vehicle price (6.5% for vehicles over $10K) with local additions up to 11.5%.",
    watchFor: [
      "Tiered sales tax: the 6.5% base rate only applies to vehicles over $10,000, but local additions can push the combined rate significantly higher. Know your local rate before estimating your OTD total.",
      "Fees above the $129 ceiling: a service and handling fee above $129 exceeds the verified rule in 23 CAR § 410-801. Ask the dealer to itemize it.",
      "Additional dealer add-ons: with the doc fee capped low, dealers may bundle value into protection packages or accessories. These are usually optional and negotiable.",
    ],
    negotiationNote:
      "With the service and handling fee capped at a verified $129, negotiation leverage in Arkansas is focused on the vehicle price and any add-ons. The tiered tax structure means verifying your exact local rate is important before comparing OTD quotes across dealers. Get the full itemized breakdown in writing before agreeing to any price.",
    ctaHeading: "Have an Arkansas dealer quote you want to verify?",
    ctaBody:
      "Paste the quote and Odigos checks whether the charges are itemized, whether the totals reconcile, and whether a fee exceeds a verified state cap. Market value stays unverified unless you optionally enter a factory window sticker MSRP. That sticker is not a live market price, and an unverified fee range is not a legal limit.",
    internalLinks: STANDARD_LINKS,
    sources: [
      "https://caredge.com/guides/car-dealer-doc-fee-by-state",
      "https://www.dfa.arkansas.gov/office/taxes/excise-tax-administration/sales-use-tax/sales-use-tax-rates/state-sales-use-tax-rates/",
    ],
    specialNotes:
      "Called 'service and handling' fees. Tiered sales tax based on vehicle price.",
    dealerMessage:
      "Hi — I'm interested in a vehicle at your dealership and would like to confirm the full out-the-door price before visiting. Could you please send me an itemized breakdown showing the vehicle sale price, service and handling fee (Arkansas rule 23 CAR § 410-801 caps this at $129), all additional dealer fees, Arkansas sales tax (state + local rate), title fee, and registration costs? I'd like to see the complete total. Thank you.",
    lastVerified: "2026-03",
    buyerTip: "Arkansas uses a tiered sales tax system — the 6.5% rate only applies to vehicles over $10,000. If you're purchasing a vehicle between $4,000 and $10,000, the applicable rate is 3.5%. Make sure your dealer's quote uses the correct tier for your vehicle price, since applying the wrong rate could overstate your taxes by several hundred dollars.",
  },

  california: {
    name: "California",
    abbreviation: "CA",
    slug: "california",
    docFeeRange: "Reported $70–$85 (not verified)",
    hasCap: true,
    pageTitle: "California Dealer Doc Fee (2026): $70 or $85 Depending on DMV Partner Status",
    h1: "California Dealer Doc Fee (2026): $70 or $85, Depending on DMV Partner Status",
    metaDescription:
      "California's document processing charge is $85 for a DMV partner and $70 otherwise. Reported $70–$85 (not verified). Compare the itemized out-the-door price before you sign.",
    capNote:
      "California Vehicle Code § 4456.5, operative January 1, 2019, limits the document processing charge to $85 only if the dealer is a DMV private industry partner under § 1685, and to $70 otherwise. $85 is not allowed for every dealer, and the charge cannot be presented as a government fee. Ask whether the dealer has that partner agreement. A fee above $85 is above both ceilings. A fee from $70 to $85 is allowed only when the partner agreement is confirmed. Unverified reports mention documentation fees around $70–$85. That range is not a market standard. Compare the itemized out-the-door price. A lower documentation fee with a higher vehicle price is not automatically a better deal.",
    salesTaxNote:
      "California's base state sales tax is 7.25%, but local district taxes raise it further. Most buyers in major metro areas — Los Angeles, the Bay Area, San Diego — see effective rates between 9.5% and 10.75%. The tax is applied to the vehicle price after any trade-in credit.",
    registrationNote:
      "California registration fees include a base registration fee (typically $60–$70), a Vehicle License Fee (0.65% of the vehicle's value), and county fees. New vehicle registration can run $400–$600 or more depending on the vehicle's value, which surprises buyers used to flat-rate registration in other states.",
    introAngle:
      "California limits dealer documentation fees to $85 per vehicle. A dealer may charge up to $85 only with a DMV private industry partner agreement, and up to $70 without one. However, additional charges may still appear in the deal through add-ons or dealer services.",
    snippetAnswer:
      "California Vehicle Code § 4456.5, operative January 1, 2019, limits the document processing charge to $85 only if the dealer is a DMV private industry partner under § 1685, and to $70 otherwise. $85 is not allowed for every dealer, and the charge cannot be presented as a government fee. Unverified reports mention documentation fees around $70–$85. That range is not a market standard.",
    watchFor: [
      "High local sales tax: buyers in Los Angeles (10.25%), Alameda County (10.75%), and other high-tax districts pay significantly more than the 7.25% base rate. Always verify the effective rate for your zip code before estimating your OTD total.",
      "Registration fees scaled to vehicle value: California's Vehicle License Fee is a percentage of the car's value, not a flat amount. On a $45,000 vehicle, that's roughly $293 — more than buyers from flat-rate states expect.",
      "Dealer add-ons bundled into the price: California's doc fee cap means dealers have less margin on paperwork, which can push them toward add-on products. Protection packages, paint sealants, and extended warranties are common — and almost never mandatory.",
      "Dealer-installed accessories marked up heavily: some California dealerships pre-install accessories (floor mats, roof rails, protection film) and build them into the vehicle price at retail-plus margins. Ask for the base MSRP before accessories.",
    ],
    negotiationNote:
      "California's document processing charge is $85 only for a DMV private industry partner under Vehicle Code § 4456.5, and $70 otherwise. A fee above $85 is above both ceilings. If a dealer tries to charge more, cite § 4456.5 ($85 for private industry partners, $70 for other dealers). SB 791 attempted to raise this to $260 but was vetoed by Governor Newsom in October 2025, so the cap remains. Your negotiation leverage is on the vehicle price, add-ons, and financing terms. California does NOT allow trade-in tax deductions — you pay tax on the full purchase price — which makes negotiating the sale price even more critical. The state's massive dealer market (especially LA and Bay Area) means getting 3+ competing OTD quotes is realistic and effective.",
    ctaHeading: "Have a California dealer quote?",
    ctaBody:
      "Paste the quote and Odigos checks whether the charges are itemized, whether the totals reconcile, and whether a fee exceeds a verified state cap. Market value stays unverified unless you optionally enter a factory window sticker MSRP. That sticker is not a live market price, and an unverified fee range is not a legal limit.",
    ctaTopBody:
      "Got a California dealer quote? Paste it and Odigos checks the math, the line items, and the $70 / $85 DMV-partner split. It does not estimate the car's market value.",
    ctaMidBody:
      "A California document processing charge above $85 is above both ceilings. From $70 to $85, ask whether the dealer is a DMV private industry partner.",
    ctaMidLink: "Check My California Quote",
    ctaBottomHeadline: "The $70 / $85 partner split covers the document processing charge. Add-ons are still a separate question.",
    ctaBottomBody:
      "Paste your dealer quote. Odigos checks the math and the $70 / $85 partner split. It does not estimate a fair market price.",
    ctaBottomButton: "Check My CA Quote Free",
    internalLinks: STANDARD_LINKS,
    sources: [
      "https://calmatters.org/politics/2025/10/california-car-dealer-fees-veto/",
      "https://cdtfa.ca.gov/taxes-and-fees/rates.aspx",
    ],
    specialNotes:
      "$85 for DMV private industry partners, $70 for other dealers. SB 791 (raise to $260) vetoed by Governor Newsom Oct 2025.",
    dealerMessage:
      "Hi — I'm interested in a vehicle at your dealership and would like to confirm the full out-the-door price before visiting. Could you please send me an itemized breakdown showing the vehicle sale price, documentation fee (California law allows $85 only for a DMV private industry partner and $70 otherwise), all additional dealer fees, California sales tax (state + local rate for your city), title fee, and registration/VLF costs? I'd like to see the complete total. Thank you.",
    lastVerified: "2026-03",
    commonQuestions: [
      {
        q: "What is the California doc fee cap in 2026?",
        a: "California sets the document processing charge at $85 for a DMV private industry partner and $70 otherwise for most dealers ($85 for DMV private industry partners, $70 for others). A bill that would have raised this to $260 (SB 791) was vetoed by Governor Newsom in October 2025. The $70 / $85 partner split remains in effect as of 2026.",
      },
      {
        q: "Why is California's local sales tax so different from the state rate?",
        a: "California's base state sales tax is 7.25%, but local districts can add their own taxes on top. Buyers in Los Angeles pay 10.25%, Alameda County buyers pay 10.75%, and many other counties and cities fall somewhere in between. Always confirm the effective rate for your dealer's specific ZIP code, not just the city.",
      },
      {
        q: "What is the California Vehicle License Fee?",
        a: "The Vehicle License Fee (VLF) is a state charge calculated at 0.65% of the vehicle's market value, included in registration costs. On a $45,000 vehicle, that's roughly $293. It decreases as the vehicle ages. This is different from the base registration fee and appears as a separate line in California registration totals.",
      },
      {
        q: "Can a California dealer charge more than $85 for documentation?",
        a: "A fee above $85 is above both ceilings in Vehicle Code § 4456.5. A fee from $70 to $85 is allowed only for a DMV private industry partner. Ask which agreement the dealer has before you treat $85 as permitted.",
      },
      {
        q: "Are dealer add-ons negotiable in California?",
        a: "Yes. California's low doc fee cap means dealers have less margin on paperwork, which can push them toward pre-installed protection packages and accessories. These are almost never required and are negotiable. Ask for the base MSRP before any dealer-installed options are added.",
      },
    ],
    competitorGapSection:
      "Most California car-buying guides emphasize an $85 doc fee cap and skip the DMV-partner split: $85 only with that agreement, and $70 otherwise. They also skip the local tax variation. The practical gap: buyers in high-tax districts pay 10–10.75% sales tax — more than 3 percentage points above the 7.25% base. On a $40,000 vehicle, that's a $1,200+ difference in tax alone. Before comparing OTD quotes, confirm the effective sales tax rate at each dealer's specific address. Two dealers in the same city can be in different tax districts. The California CDTFA website lets you look up rates by zip code in under a minute.",
    buyerTip: "SB 791, which would have raised California's doc fee cap from $85 to $260, was vetoed by Governor Newsom in October 2025. The $70 / $85 partner split remains in effect. A documentation fee above $85 is above both California ceilings in Vehicle Code § 4456.5. From $70 to $85, the fee is allowed only if the dealer is a DMV private industry partner.",
  },

  colorado: {
    name: "Colorado",
    abbreviation: "CO",
    slug: "colorado",
    docFeeRange: "Reported $400–$700 (not verified)",
    hasCap: false,
    metaDescription:
      "Colorado does not have a verified documentation-fee cap on file. Reported $400–$700 (not verified). Compare the itemized out-the-door price before you sign.",
    capNote:
      "Colorado does not have a verified documentation-fee cap in this file. A stored note may say dealers set the fee, but that is not a legal finding that no cap exists. Unverified reports mention documentation fees around $400–$700. That range is not a market standard. Compare itemized out-the-door quotes instead of treating one line as legal or illegal.",
    salesTaxNote:
      "Colorado's base state sales tax on vehicles is 2.9%, but local county and city taxes add significantly — bringing combined rates up to 8% in some areas. The effective rate varies considerably by location, so confirm your local rate before comparing OTD quotes.",
    registrationNote:
      "Colorado registration fees vary by vehicle weight, age, and value. Costs include a state registration fee plus county-specific additions. Expect to pay several hundred dollars for first-year registration on a new vehicle.",
    introAngle:
      "Unverified reports mention Colorado documentation fees around $400–$700 with no verified cap on file — called a 'dealer handling fee' at many stores. The state sales tax rate is one of the lower base rates in the country at 2.9%, but local additions bring the effective rate to 6–8% in major areas. A lien filing fee also increased to $40 effective July 2025.",
    snippetAnswer:
      "Colorado does not have a verified documentation-fee cap in this file. A stored note may say dealers set the fee, but that is not a legal finding that no cap exists. Unverified reports mention documentation fees around $400–$700. That range is not a market standard. The state sales tax base is 2.9%, with local additions bringing combined rates to around 6–8%.",
    watchFor: [
      "Handling fee vs. doc fee: Colorado dealers often call the documentation charge a 'dealer handling fee' — it's the same charge but named differently. It's without a verified cap on file and can vary between dealers.",
      "Lien filing fee: as of July 1, 2025, Colorado charges a flat $40 lien filing fee for financed vehicles. This is a government fee, not a dealer markup.",
      "Local tax rate variation: combined rates in Denver and other cities are higher than the 2.9% state base. Confirm your effective rate before estimating your OTD total.",
    ],
    negotiationNote:
      "Colorado's competitive Front Range markets (Denver, Boulder, Fort Collins, Colorado Springs) give buyers multiple dealer options for the same vehicle. Use competing OTD quotes to create leverage on both the vehicle price and the handling fee. Since no cap is verified in this file, some dealers will reduce the fee to close a deal.",
    ctaHeading: "Have a Colorado dealer quote you want to review?",
    ctaBody:
      "Paste the quote and Odigos checks whether the charges are itemized, whether the totals reconcile, and whether a fee exceeds a verified state cap. Market value stays unverified unless you optionally enter a factory window sticker MSRP. That sticker is not a live market price, and an unverified fee range is not a legal limit.",
    internalLinks: STANDARD_LINKS,
    sources: [
      "https://tax.colorado.gov/motor-vehicle",
      "https://dmv.colorado.gov/taxes-and-fees",
    ],
    specialNotes:
      "Lien filing fee increased to $40 flat rate effective July 1, 2025.",
    dealerMessage:
      "Hi — I'm interested in a vehicle at your dealership and would like to confirm the full out-the-door price before visiting. Could you please send me an itemized breakdown showing the vehicle sale price, documentation/handling fee, all additional dealer fees, Colorado sales tax (state + local rate), any lien filing fee if applicable, title fee, and registration costs? I'd like to see the complete total. Thank you.",
    lastVerified: "2026-03",
    buyerTip: "Colorado dealers often call the doc fee a 'dealer handling fee,' which can make it harder to identify in a quote. As of July 1, 2025, a flat $40 lien filing fee was also added for financed purchases. If you're financing, confirm that this new government fee appears as a separate line item and that it hasn't been bundled into the dealer's 'handling fee' amount.",
  },

  connecticut: {
    name: "Connecticut",
    abbreviation: "CT",
    slug: "connecticut",
    docFeeRange: "Reported $300–$600 (not verified)",
    hasCap: false,
    metaDescription:
      "Connecticut does not have a verified documentation-fee cap on file. Reported $300–$600 (not verified). Compare the itemized out-the-door price before you sign.",
    capNote:
      "Connecticut does not have a verified documentation-fee cap in this file. A stored note may say dealers set the fee, but that is not a legal finding that no cap exists. Unverified reports mention documentation fees around $300–$600. That range is not a market standard. Compare itemized out-the-door quotes instead of treating one line as legal or illegal.",
    salesTaxNote:
      "Connecticut applies a 6.35% sales tax on vehicles priced under $50,000, and 7.75% on vehicles $50,000 or above. There are no local additions — the state rate is uniform. The higher rate on luxury vehicles can meaningfully increase the OTD cost.",
    registrationNote:
      "Connecticut registration runs approximately $120 for a three-year period, plus various surcharges (approximately $71 additional). The title fee is $25.",
    introAngle:
      "Connecticut does not have a verified documentation-fee cap in this file. Older notes mention bills that did not pass. Unverified reports mention fees around $300–$600. That range is not a market standard. The state's two-tier tax structure — 6.35% under $50K, 7.75% above — means buyers of higher-end vehicles should budget accordingly. No local tax additions make the math simpler than in many other states.",
    snippetAnswer:
      "Connecticut does not have a verified documentation-fee cap in this file. A stored note may say dealers set the fee, but that is not a legal finding that no cap exists. Unverified reports mention documentation fees around $300–$600. That range is not a market standard. Sales tax is 6.35% for vehicles under $50,000 and 7.75% for those at or above.",
    watchFor: [
      "Luxury vehicle tax tier: the 7.75% rate kicks in at $50,000. If your vehicle is near that threshold, even a small negotiation on the sale price can drop you to the lower 6.35% bracket.",
      "Doc fees without a verified cap on file: Connecticut has no cap, so fees vary by dealer. Ask for the doc fee to be disclosed before you visit — and compare it across multiple dealers.",
      "Pending legislative changes: cap legislation may pass in future sessions. Check current status before your purchase.",
    ],
    negotiationNote:
      "Connecticut's competitive shoreline and metro markets mean dealers are often willing to negotiate vehicle price. The doc fee is without a verified cap on file, so it's worth asking whether it's flexible. Focus the overall negotiation on the total OTD price, including any add-ons or accessories that may be bundled.",
    ctaHeading: "Have a Connecticut dealer quote you want to review?",
    ctaBody:
      "Paste the quote and Odigos checks whether the charges are itemized, whether the totals reconcile, and whether a fee exceeds a verified state cap. Market value stays unverified unless you optionally enter a factory window sticker MSRP. That sticker is not a live market price, and an unverified fee range is not a legal limit.",
    internalLinks: STANDARD_LINKS,
    sources: [
      "https://portal.ct.gov/dmv/vehicle-services/sales-tax-registrations/sales-tax-calculator",
    ],
    specialNotes:
      "Multiple bills proposed in 2025 (HB 06544, HB 06827, SB 774) to cap at 1% of vehicle price. Not enacted as of March 2026.",
    dealerMessage:
      "Hi — I'm interested in a vehicle at your dealership and would like to confirm the full out-the-door price before visiting. Could you please send me an itemized breakdown showing the vehicle sale price, documentation fee, all additional dealer fees, Connecticut sales tax (6.35% or 7.75% depending on vehicle price), title fee, and registration costs? I'd like to see the complete total. Thank you.",
    lastVerified: "2026-03",
    buyerTip: "Connecticut's two-tier sales tax creates a meaningful incentive for buyers near the $50,000 threshold. If you're purchasing a vehicle priced at $50,000 or slightly above, negotiating the sale price below $50,000 drops the tax rate from 7.75% to 6.35% — saving $700 in tax alone on a $50,001 vehicle. Connecticut's strict vehicle price boundary makes this a genuine negotiation target.",
  },

  delaware: {
    name: "Delaware",
    abbreviation: "DE",
    slug: "delaware",
    docFeeRange: "Reported $300–$600 (not verified)",
    hasCap: false,
    metaDescription:
      "Delaware does not have a verified documentation-fee cap on file. Reported $300–$600 (not verified). Compare the itemized out-the-door price before you sign.",
    capNote:
      "Delaware does not have a verified documentation-fee cap in this file. A stored note may say dealers set the fee, but that is not a legal finding that no cap exists. Unverified reports mention documentation fees around $300–$600. That range is not a market standard. Compare itemized out-the-door quotes instead of treating one line as legal or illegal.",
    salesTaxNote:
      "Delaware has no traditional sales tax on vehicle purchases. However, the state charges a 5.25% 'document fee' (essentially a transfer tax) on the vehicle's purchase price. This increased from 4.25% effective October 1, 2025. This government fee is separate from the dealer documentation fee.",
    registrationNote:
      "Delaware charges approximately $40 per year for vehicle registration. The title fee is $35.",
    introAngle:
      "Delaware is one of five states with no sales tax — but the state makes up part of that difference with a 5.25% Document Fee applied at titling, which increased from 4.25% in October 2025. This is a government fee, not to be confused with the dealer's own documentation fee. Buyers often see two 'doc fee' line items in Delaware: one from the state and one from the dealer — make sure you understand which is which.",
    snippetAnswer:
      "Delaware does not have a verified documentation-fee cap in this file. A stored note may say dealers set the fee, but that is not a legal finding that no cap exists. Unverified reports mention documentation fees around $300–$600. That range is not a market standard. Delaware has no traditional sales tax but charges a 5.25% state document fee on vehicle purchases (increased Oct 2025).",
    watchFor: [
      "Two types of 'document fees': Delaware has a state-level document fee (5.25% of purchase price) AND a dealer-level documentation fee. These are separate charges — make sure any quote itemizes both clearly.",
      "State document fee increase: the state fee increased from 4.25% to 5.25% effective October 2025. On a $35,000 vehicle, that's $1,837 in state fees — a significant jump.",
      "Dealer doc fee without a cap: HB 295 proposing a $475 cap was pending as of March 2026. Verify whether it has passed before your purchase.",
    ],
    negotiationNote:
      "The 5.25% state document fee is non-negotiable — it's a government charge. Your negotiation focus is on the vehicle price and any dealer-added doc fee or add-ons. Delaware's relatively small market means fewer competing dealers than in neighboring states.",
    ctaHeading: "Have a Delaware dealer quote you want to review?",
    ctaBody:
      "Paste the quote and Odigos checks whether the charges are itemized, whether the totals reconcile, and whether a fee exceeds a verified state cap. Market value stays unverified unless you optionally enter a factory window sticker MSRP. That sticker is not a live market price, and an unverified fee range is not a legal limit.",
    internalLinks: STANDARD_LINKS,
    sources: [
      "https://news.delaware.gov/2025/09/30/dmv-fees-increase-in-october-2025/",
      "https://delawarelive.com/bill-capping-car-dealership-processing-fees-head-to-house/",
    ],
    specialNotes:
      "No sales tax but 5.25% state 'document fee' on vehicle purchases (increased Oct 2025 from 4.25%).",
    dealerMessage:
      "Hi — I'm interested in a vehicle at your dealership and would like to confirm the full out-the-door price before visiting. Could you please send me an itemized breakdown showing the vehicle sale price, your documentation/processing fee, all additional dealer fees, Delaware state document fee (5.25%), title fee, and registration costs? I want to make sure both the state fee and any dealer fees are clearly itemized. Thank you.",
    lastVerified: "2026-03",
    buyerTip: "Delaware's state 'document fee' of 5.25% (increased from 4.25% in October 2025) is often confused with the dealer's documentation fee — they have similar names but are entirely separate charges. On a $35,000 vehicle, the state document fee alone is $1,837. Ask your dealer to label these separately on any written quote so you're not conflating a government tax with a dealer fee.",
  },

  "district-of-columbia": {
    name: "District of Columbia",
    abbreviation: "DC",
    slug: "district-of-columbia",
    docFeeRange: "Reported $300–$600 (not verified)",
    hasCap: false,
    metaDescription:
      "District of Columbia does not have a verified documentation-fee cap on file. Reported $300–$600 (not verified). Compare the itemized out-the-door price before you sign.",
    capNote:
      "District of Columbia does not have a verified documentation-fee cap in this file. A stored note may say dealers set the fee, but that is not a legal finding that no cap exists. Unverified reports mention documentation fees around $300–$600. That range is not a market standard. Compare itemized out-the-door quotes instead of treating one line as legal or illegal.",
    salesTaxNote:
      "DC charges a weight-based excise tax on vehicle purchases rather than a traditional sales tax. Rates as of 2025: under 3,500 lbs at 6% (rising to 7% Oct 2026), 3,500–4,999 lbs at 7% (rising to 8%), and 5,000+ lbs at 8% (rising to 9%). Hybrid vehicles achieving 40+ mpg may qualify for an exemption. The EV exemption was removed effective October 2024.",
    registrationNote:
      "DC registration fees are weight-based and vary significantly by vehicle type. A 2.5% credit card service fee applies to DMV transactions effective December 15, 2025.",
    introAngle:
      "The District of Columbia uses a weight-based excise tax system rather than a standard sales tax, and tax rates are increasing in two steps (October 2025 and October 2026). The EV exemption was eliminated in 2024. Buyers should verify the current rates based on their specific vehicle's weight class before estimating their OTD total.",
    snippetAnswer:
      "District of Columbia does not have a verified documentation-fee cap in this file. A stored note may say dealers set the fee, but that is not a legal finding that no cap exists. Unverified reports mention documentation fees around $300–$600. That range is not a market standard. DC does not have a verified doc-fee cap on file and charges a weight-based excise tax (6–8% depending on vehicle weight) that is increasing in future years. The EV tax exemption was removed in 2024. Budget for the excise tax based on your specific vehicle's weight class.",
    watchFor: [
      "Weight-based excise tax tiers: heavier vehicles (SUVs, trucks) fall into higher tax brackets. A 5,000-lb vehicle is taxed at 8%, rising to 9% in 2026 — a meaningful difference from lighter cars.",
      "EV exemption removed: electric vehicles no longer qualify for a DC excise tax exemption as of October 2024. Budget for the full weight-based rate.",
      "Increasing rates: excise tax rates increase again October 1, 2026. If your purchase straddles that date, confirm which rate applies.",
      "Credit card surcharge: a 2.5% surcharge applies to DMV transactions paid by credit card effective December 2025.",
    ],
    negotiationNote:
      "DC's market is limited in dealer options, which reduces competitive leverage. Focus negotiation on the vehicle price and any dealer add-ons. The excise tax is a government charge and is not negotiable — verify the correct rate for your vehicle's weight class early in the process.",
    ctaHeading: "Have a DC dealer quote you want to review?",
    ctaBody:
      "Paste the quote and Odigos checks whether the charges are itemized, whether the totals reconcile, and whether a fee exceeds a verified state cap. Market value stays unverified unless you optionally enter a factory window sticker MSRP. That sticker is not a live market price, and an unverified fee range is not a legal limit.",
    internalLinks: STANDARD_LINKS,
    sources: [
      "https://dmv.dc.gov/page/vehicle-registration-and-title-fee-estimator",
      "https://www.salestaxhandbook.com/district-of-columbia/sales-tax-vehicles",
    ],
    specialNotes:
      "Tax rates increasing Oct 1, 2025 and again Oct 1, 2026. EV exemption removed Oct 1, 2024. 2.5% credit card service fee effective Dec 15, 2025.",
    dealerMessage:
      "Hi — I'm interested in a vehicle at your dealership and would like to confirm the full out-the-door price before visiting. Could you please send me an itemized breakdown showing the vehicle sale price, documentation fee, all additional dealer fees, DC vehicle excise tax (based on vehicle weight), title fee, and registration costs? I'd like to see the complete total. Thank you.",
    lastVerified: "2026-03",
    buyerTip: "DC's vehicle excise tax uses weight classes with increasing rates, and those rates are scheduled to increase again on October 1, 2026. A vehicle weighing 5,000+ lbs currently pays 8%, rising to 9% in 2026. If you're purchasing a large SUV or truck in DC near the October 2026 date, timing your purchase before the rate change could save $350 or more on a $35,000 vehicle.",
  },

  florida: {
    name: "Florida",
    abbreviation: "FL",
    slug: "florida",
    docFeeRange: "Reported $500–$1,000 (not verified)",
    hasCap: false,
    pageTitle: "Florida Dealer Fees (2026): Cap Not Verified — Compare the Out-the-Door Price",
    metaDescription:
      "Florida does not have a verified documentation-fee cap on file. Reported $500–$1,000 (not verified). Compare the itemized out-the-door price before you sign.",
    capNote:
      "Florida does not have a verified documentation-fee cap in this file. A stored note may say dealers set the fee, but that is not a legal finding that no cap exists. Unverified reports mention documentation fees around $500–$1,000. That range is not a market standard. Compare itemized out-the-door quotes instead of treating one line as legal or illegal.",
    salesTaxNote:
      "Florida's base state sales tax on vehicles is 6%, but counties add their own discretionary surtax. The combined rate varies by county — Miami-Dade is 7%, Broward is 7%, Orange County (Orlando) is 6.5%, and some rural counties stay at 6%. The tax is applied to the full sale price of the vehicle.",
    registrationNote:
      "Florida registration fees include a base registration fee that varies by vehicle weight, plus a title fee. Registration for a standard passenger vehicle typically runs $200–$400 for the first year, depending on the vehicle and county. There's also a temporary tag fee if you take the vehicle home before permanent plates arrive.",
    introAngle:
      "Florida has some of the highest dealer documentation fees in unverified reports, and no cap is verified in the country — and buyers frequently report sticker shock when they see the doc fee at the finance desk for the first time. Unverified reports mention documentation fees of $699 or $899 at some Florida dealerships. This file does not verify a statute that either allows or caps that amount. What makes Florida's OTD prices particularly variable is the combination of high doc fees, county-level sales tax variations, and a dealer market that includes both high-volume tourist-area stores and more aggressive smaller dealers. Ask for the fee in writing before you sit down, and compare the full out-the-door price rather than treating any one number as normal.",
    snippetAnswer:
      "Florida does not have a verified documentation-fee cap in this file. A stored note may say dealers set the fee, but that is not a legal finding that no cap exists. Unverified reports mention documentation fees around $500–$1,000. That range is not a market standard. The state sales tax is 6% plus a county surtax that varies by location.",
    watchFor: [
      "High doc fees presented as fixed and non-negotiable: dealers in Florida often say the doc fee is the same for all customers and can't be changed. That may be the store's policy, but the vehicle price can usually be adjusted to offset it — the total OTD is what matters.",
      "County surtax surprises: the difference between a 6% and 7% county rate on a $40,000 vehicle is $400. If you're shopping across county lines in Florida, the tax rate difference can make one dealer's quote look better than another's before fees are factored in.",
      "Add-on packages on high-inventory vehicles: Florida's large dealer market and high transaction volume create conditions where add-ons get bundled into vehicles before they arrive. Pre-installed protection packages at $800–$1,500 are common and are almost always negotiable in price even if they can't be physically removed.",
      "Temporary tags and additional dealer fees: some Florida dealers add fees for temporary tags, dealer prep, or electronic filing that aren't always visible in an early quote. Ask for the full itemized OTD breakdown before agreeing to any price.",
    ],
    negotiationNote:
      "Florida's doc fees average $670 statewide but regularly reach $899–$999 at high-volume stores. While most dealers charge the same fee to every customer, the vehicle price is almost always negotiable. If a dealer charges $899, ask for a matching reduction in the sale price — frame it as a total OTD negotiation, not a doc fee argument. Florida's $76 title fee and $225 initial registration are also higher than most states, so factor those into your OTD estimate. Having a competing OTD quote from another Florida dealer is the most effective leverage. With Florida's dense dealer market — especially in South Florida, Tampa Bay, and Orlando — getting three quotes in an afternoon is realistic.",
    ctaHeading: "Seeing a high doc fee on a Florida quote?",
    ctaBody:
      "Paste the quote and Odigos checks whether the charges are itemized, whether the totals reconcile, and whether a fee exceeds a verified state cap. Market value stays unverified unless you optionally enter a factory window sticker MSRP. That sticker is not a live market price, and an unverified fee range is not a legal limit.",
    internalLinks: STANDARD_LINKS,
    sources: [
      "https://www.etags.com/blog/dealer-fees-in-florida-the-legit-the-bogus-the-weird/",
      "https://floridarevenue.com/taxes/taxesfees/Pages/sales_tax.aspx",
    ],
    specialNotes:
      "Florida has some of the highest doc fees in the nation. No cap exists despite multiple legislative attempts.",
    dealerMessage:
      "Hi — I'm interested in a vehicle at your dealership and would like to confirm the full out-the-door price before visiting. Could you please send me an itemized breakdown showing the vehicle sale price, documentation fee (I understand Florida has no verified cap on file), all additional dealer fees, Florida sales tax (6% state + your county's discretionary surtax), title fee ($76), initial registration ($225), and any temporary tag fees? I'd like to see the complete itemized total before scheduling a visit. Thank you.",
    lastVerified: "2026-03",
    commonQuestions: [
      {
        q: "Why are Florida dealer doc fees so high?",
        a: "Florida does not have a verified documentation-fee cap in this file. Older notes say lawmakers have not enacted one. That is not itself a legal finding. Unverified reports mention fees of $699–$999. That range is not a market standard.",
      },
      {
        q: "Can I negotiate a Florida dealer's doc fee?",
        a: "Most Florida dealers apply the same doc fee to all customers and won't reduce it directly. However, the vehicle price is almost always negotiable. Ask the dealer to reduce the sale price by the difference between their doc fee and what you consider reasonable. A competing OTD quote from another dealer is your best leverage.",
      },
      {
        q: "How does Florida's county surtax work on vehicle purchases?",
        a: "Florida's 6% state sales tax is uniform, but counties add a discretionary surtax of 0.5% to 2.5%. The surtax applies only to the first $5,000 of the purchase price — so the maximum additional county tax is $125 (2.5% of $5,000). Miami-Dade and Broward add 1%, making the effective rate 7% on that first $5,000.",
      },
      {
        q: "What is the title fee in Florida?",
        a: "Florida's title fee is $76 — higher than most states. Initial registration for a standard passenger vehicle runs $225, with annual renewals ranging from $46 to $120 depending on vehicle weight. Include these in your OTD estimate.",
      },
      {
        q: "Does Florida allow a trade-in tax credit?",
        a: "Yes. Florida allows the trade-in value to reduce the taxable purchase price. If you're buying a $40,000 vehicle and trading in a car worth $15,000, you pay sales tax on $25,000. Make sure the dealer applies this deduction before calculating your tax.",
      },
    ],
    competitorGapSection:
      "Most Florida car-buying guides correctly note the lack of a doc fee cap but overlook the county surtax structure. The key detail: the county surtax only applies to the first $5,000 of the purchase price, not the full amount. On a $40,000 vehicle in Miami-Dade (1% surtax), you pay 6% on $40,000 ($2,400) plus 1% on $5,000 ($50) — not 7% on the full price. This means the difference between buying in a 0% surtax county versus a 2.5% surtax county is at most $125. The doc fee variation between dealers ($500 vs. $999) has a far bigger impact on your total than county shopping. Focus your comparison energy on the doc fee and vehicle price, not on driving to a different county.",
    buyerTip: "Florida dealers often present doc fees in the $599–$899 range as non-negotiable because they charge every customer the same amount. While that may be the store's policy, the vehicle price is almost always adjustable. A practical approach: ask the dealer to apply a discount to the vehicle price equal to the portion of the doc fee you think is excessive. Focus the negotiation on the all-in OTD number rather than trying to reduce the doc fee line item directly.",
  },

  georgia: {
    name: "Georgia",
    abbreviation: "GA",
    slug: "georgia",
    docFeeRange: "Reported $400–$700 (not verified)",
    hasCap: false,
    metaDescription:
      "Georgia has no verified statutory cap on the documentation fee. Reported $400–$700 (not verified). Compare the itemized out-the-door price before you sign.",
    capNote:
      "A fetched Georgia page says the state does not regulate how much a dealer can charge for a document or processing fee. That is not a finding about a typical price. Unverified reports mention documentation fees around $400–$700. That range is not a market standard. Compare the itemized out-the-door price. A lower documentation fee with a higher vehicle price is not automatically a better deal.",
    salesTaxNote:
      "Georgia replaced the traditional sales tax on vehicle purchases with the Title Ad Valorem Tax (TAVT) in 2013. The TAVT is a one-time tax paid at the time of titling, calculated at 7% of the vehicle's fair market value (as defined by the state, not necessarily the purchase price). Unlike a traditional sales tax, the TAVT is a title fee — it appears in a different place on the OTD breakdown and is calculated differently than buyers from other states expect.",
    registrationNote:
      "Georgia registration fees are relatively modest — typically $20–$30 for the base annual registration, plus county fees. Because the TAVT replaces the traditional first-year registration tax, the overall registration cost is lower than buyers might expect. The first-year total for title and registration typically runs $150–$300 depending on the county and vehicle.",
    introAngle:
      "Georgia is one of a handful of states that replaced traditional sales tax on vehicles with a Title Ad Valorem Tax (TAVT), which has been in place since 2013. Buyers who are used to seeing a sales tax line on a car deal are often confused when they see a 'title tax' or 'ad valorem' line instead — it's not a mistake, it's how Georgia structures the transfer tax. The 7% TAVT is calculated on the state's assessed fair market value of the vehicle, which may differ from what you actually paid. Understanding this distinction is essential to evaluating a Georgia OTD breakdown correctly.",
    snippetAnswer:
      "A fetched Georgia page says the state does not regulate how much a dealer can charge for a document or processing fee. That is not a finding about a typical price. Unverified reports mention documentation fees around $400–$700. That range is not a market standard. Georgia replaced traditional sales tax with a Title Ad Valorem Tax (TAVT) of 7%, paid at titling. This appears differently on a Georgia OTD breakdown than a standard sales tax line. Buyers unfamiliar with the TAVT structure often find Georgia OTD quotes harder to interpret than other states.",
    watchFor: [
      "TAVT calculated on state fair market value, not sale price: Georgia's 7% title tax is applied to the state's assessed value of the vehicle, which is based on published retail value data — not necessarily what you negotiated. If you bought the car below market value, the TAVT may still be calculated on the higher published value.",
      "Doc fees in the $500–$600 range without explanation: Georgia has no cap, and some dealers charge toward the top of the typical range. If the doc fee is above $450, it's worth asking whether it's the same for all customers and whether the vehicle price can be adjusted to offset it.",
      "Add-on packages bundled on high-demand inventory: Georgia dealers frequently pre-install protection packages on popular SUVs and trucks. These are presented as part of the vehicle but are generally negotiable in price and sometimes removable.",
      "Confusion between TAVT and additional fees: buyers sometimes mistake the TAVT line for a bundled dealer fee and try to negotiate it. The TAVT is a government charge — it can't be reduced. Focus negotiation energy on the vehicle price, doc fee, and any add-ons.",
    ],
    negotiationNote:
      "Georgia's TAVT at 7% of assessed fair market value is a government charge — you cannot negotiate it. Your leverage is entirely on the pre-tax portion: the vehicle price (averaging $502 doc fee statewide), any dealer markup, and bundled add-ons. The $18 title fee is low, but the TAVT itself is substantial — 7% of a $35,000 vehicle is $2,450. If you have a trade-in at a dealer, the TAVT is calculated on the net price after the trade-in deduction, which can save hundreds. The Atlanta metro has a competitive dealer market with many options — getting 2–3 competing OTD quotes on the same vehicle is the most effective approach.",
    ctaHeading: "Not sure how Georgia's title tax affects your out-the-door price?",
    ctaBody:
      "Paste the quote and Odigos checks whether the charges are itemized, whether the totals reconcile, and whether a fee exceeds a verified state cap. Market value stays unverified unless you optionally enter a factory window sticker MSRP. That sticker is not a live market price, and an unverified fee range is not a legal limit.",
    internalLinks: STANDARD_LINKS,
    sources: [
      "https://dor.georgia.gov/title-ad-valorem-tax-tavt-faq",
      "https://consumered.georgia.gov/ask-ed/2019-10-30/what-maximum-amount-car-dealer-can-charge-doc-fees",
    ],
    specialNotes:
      "TAVT at 7.0% of fair market value is a one-time tax paid at titling. Must be included in advertised price per AG guidance.",
    dealerMessage:
      "Hi — I'm interested in a vehicle at your dealership and would like to confirm the full out-the-door price before visiting. Could you please send me an itemized breakdown showing the vehicle sale price, documentation fee, all additional dealer fees, Georgia TAVT (7% of state-assessed fair market value — please confirm the assessed value used), title fee ($18), and registration costs? If I have a trade-in, please show the TAVT calculated on the net price after deduction. I'd like to see the complete itemized total. Thank you.",
    lastVerified: "2026-03",
    commonQuestions: [
      {
        q: "What is Georgia's Title Ad Valorem Tax (TAVT)?",
        a: "Georgia replaced traditional vehicle sales tax with the TAVT in 2013. It's a one-time 7% tax paid when you title the vehicle, calculated on the state's assessed fair market value — not necessarily your negotiated price. The TAVT replaces both the sales tax and the annual ad valorem tax that other states charge.",
      },
      {
        q: "Is the TAVT calculated on the price I paid or the car's market value?",
        a: "The TAVT is calculated on the state's assessed fair market value of the vehicle, which is based on published retail value data. If you bought the car below market value, you may still owe TAVT on the higher assessed amount. If you paid above fair market value, you can appeal with documentation.",
      },
      {
        q: "Does Georgia allow a trade-in deduction on the TAVT?",
        a: "Yes, but only for dealer transactions. The TAVT is calculated on the net price after your trade-in deduction. If you're buying a $35,000 vehicle and trading in one worth $12,000, the TAVT is calculated on $23,000 — saving you $840 in tax.",
      },
      {
        q: "Why does my Georgia OTD look different from other states?",
        a: "Georgia's TAVT structure means your OTD breakdown has a 'title tax' or 'ad valorem' line instead of a 'sales tax' line. The $18 title fee is separate from the 7% TAVT. Registration is relatively modest because the TAVT replaces the annual ad valorem tax used in other states.",
      },
    ],
    competitorGapSection:
      "Most Georgia car-buying guides explain the 7% TAVT but miss a critical detail: the TAVT is calculated on the state's assessed fair market value, not the price you negotiated. This means negotiating a lower purchase price doesn't always reduce your TAVT dollar-for-dollar — the state may assess the vehicle at a higher value. Buyers should check the Georgia DOR TAVT calculator before negotiating to understand what the state considers fair market value for their specific vehicle. The doc fee ($300–$599, uncapped) and any dealer add-ons are where your negotiation has the most direct impact on the final OTD total.",
    buyerTip: "Georgia's TAVT is calculated on the state's assessed fair market value of the vehicle — not necessarily your negotiated purchase price. If you buy a vehicle for significantly below retail value (e.g., after a price match or fleet discount), the 7% TAVT may still be calculated on the higher published value. Ask the dealer upfront what assessed value they're using for the TAVT calculation, since it directly affects your OTD total.",
  },

  hawaii: {
    name: "Hawaii",
    abbreviation: "HI",
    slug: "hawaii",
    docFeeRange: "Reported $150–$350 (not verified)",
    hasCap: false,
    metaDescription:
      "Hawaii does not have a verified documentation-fee cap on file. Reported $150–$350 (not verified). Compare the itemized out-the-door price before you sign.",
    capNote:
      "Hawaii does not have a verified documentation-fee cap in this file. A stored note may say dealers set the fee, but that is not a legal finding that no cap exists. Unverified reports mention documentation fees around $150–$350. That range is not a market standard. Compare itemized out-the-door quotes instead of treating one line as legal or illegal.",
    salesTaxNote:
      "Hawaii applies a General Excise Tax (GET) of 4% on vehicle sales, plus a 0.5% county surcharge in most counties. Unlike a traditional sales tax, GET is a tax on the seller's gross income — but it is effectively passed to the buyer. Private-party purchases are generally exempt. A luxury vehicle surcharge of 50% of applicable taxes applies to higher-priced vehicles.",
    registrationNote:
      "Hawaii registration includes a $46 state fee plus a county-level weight tax that typically ranges $100–$300 depending on the county and vehicle weight. Title fee is $10.",
    introAngle:
      "Hawaii's island location creates a unique vehicle market — inventory is limited, prices tend to be higher than on the mainland, and registration costs are structured differently. The General Excise Tax on vehicle sales, while similar to a sales tax in effect, is technically a business receipts tax. A luxury vehicle surcharge adds an additional cost for higher-priced vehicles. Doc fees are without a verified cap on file but tend to be lower than many mainland states.",
    snippetAnswer:
      "Hawaii does not have a verified documentation-fee cap in this file. A stored note may say dealers set the fee, but that is not a legal finding that no cap exists. Unverified reports mention documentation fees around $150–$350. That range is not a market standard. The General Excise Tax is 4% base plus a 0.5% county surcharge. A luxury vehicle surcharge adds 50% to applicable taxes for higher-priced vehicles. Vehicle prices and registration costs tend to be higher than on the mainland.",
    watchFor: [
      "Luxury vehicle surcharge: Hawaii adds a 50% surcharge to the applicable taxes on luxury vehicles. If your vehicle qualifies, factor this into your OTD estimate.",
      "GET passed through to buyer: while the GET is technically a seller's tax, it is routinely passed to buyers as part of the purchase price. Confirm how the dealer is handling this in the quote.",
      "Limited inventory and pricing: Hawaii's island market means fewer alternatives if you don't like a dealer's terms. Compare quotes across dealers on each island before committing.",
    ],
    negotiationNote:
      "Hawaii's limited market and island geography reduce competitive pressure. However, buyers on Oahu have more dealer options than those on other islands. Focus on the vehicle price and ask for the doc fee to be disclosed upfront. The GET and county surcharges are fixed — negotiation is focused on the pre-tax components.",
    ctaHeading: "Have a Hawaii dealer quote you want to verify?",
    ctaBody:
      "Paste the quote and Odigos checks whether the charges are itemized, whether the totals reconcile, and whether a fee exceeds a verified state cap. Market value stays unverified unless you optionally enter a factory window sticker MSRP. That sticker is not a live market price, and an unverified fee range is not a legal limit.",
    internalLinks: STANDARD_LINKS,
    sources: [
      "https://tax.hawaii.gov/geninfo/get/",
      "https://caredge.com/guides/car-dealer-doc-fee-by-state",
    ],
    specialNotes:
      "Luxury vehicle surcharge: 50% of applicable taxes (new legislation).",
    dealerMessage:
      "Hi — I'm interested in a vehicle at your dealership and would like to confirm the full out-the-door price before visiting. Could you please send me an itemized breakdown showing the vehicle sale price, documentation fee, all additional dealer fees, Hawaii General Excise Tax plus county surcharge, any luxury vehicle surcharge, title fee, and registration/weight tax costs? I'd like to see the complete total. Thank you.",
    lastVerified: "2026-03",
    buyerTip: "Hawaii's luxury vehicle surcharge adds 50% to the applicable taxes on higher-priced vehicles. Because Hawaii's inventory is limited by island geography, prices for many popular models already run higher than on the mainland. These two factors compound: you're paying above-average prices and a tax premium on top. If you're considering shipping a vehicle from the mainland, get a full cost analysis including shipping, registration, and any import fees before comparing it to an in-state OTD quote.",
  },

  idaho: {
    name: "Idaho",
    abbreviation: "ID",
    slug: "idaho",
    docFeeRange: "Reported $200–$400 (not verified)",
    hasCap: false,
    metaDescription:
      "Idaho does not have a verified documentation-fee cap on file. Reported $200–$400 (not verified). Compare the itemized out-the-door price before you sign.",
    capNote:
      "Idaho does not have a verified documentation-fee cap in this file. A stored note may say dealers set the fee, but that is not a legal finding that no cap exists. Unverified reports mention documentation fees around $200–$400. That range is not a market standard. Compare itemized out-the-door quotes instead of treating one line as legal or illegal.",
    salesTaxNote:
      "Idaho charges a 6% state sales tax on vehicle purchases, with local option taxes adding up to 3% in some areas. Idaho allows trade-in deductions, meaning your trade-in value reduces the taxable purchase price per state statute IDAPA 35.01.02.044.",
    registrationNote:
      "Idaho registration fees vary by vehicle weight and value. The title fee is $14.",
    introAngle:
      "Idaho does not have a verified doc-fee cap on file, but fees tend to be in the moderate range of $200–$400. The state allows trade-in deductions, which can meaningfully reduce the taxable amount if you're trading in a vehicle. The 6% state tax with local additions is straightforward compared to many other states.",
    snippetAnswer:
      "Idaho does not have a verified documentation-fee cap in this file. A stored note may say dealers set the fee, but that is not a legal finding that no cap exists. Unverified reports mention documentation fees around $200–$400. That range is not a market standard. The state sales tax is 6% plus local additions up to 3%. Idaho allows full trade-in deductions from the taxable amount.",
    watchFor: [
      "Trade-in credit: Idaho allows trade-in value to reduce the taxable purchase price — make sure the dealer is applying this deduction before calculating your sales tax.",
      "Local tax additions: some Idaho areas have local option sales taxes that increase the effective rate above 6%. Confirm the rate for your dealer's location.",
      "Doc fees without a verified cap on file: $200–$400 appears in unverified reports. Some dealers charge more. Ask for the fee to be disclosed before visiting.",
    ],
    negotiationNote:
      "Idaho's market is less competitive than major metro areas, particularly outside Boise. Compare competing quotes across the Treasure Valley area if possible. The trade-in deduction is a meaningful benefit — make sure it's properly applied to reduce your tax bill.",
    ctaHeading: "Have an Idaho dealer quote you want to review?",
    ctaBody:
      "Paste the quote and Odigos checks whether the charges are itemized, whether the totals reconcile, and whether a fee exceeds a verified state cap. Market value stays unverified unless you optionally enter a factory window sticker MSRP. That sticker is not a live market price, and an unverified fee range is not a legal limit.",
    internalLinks: STANDARD_LINKS,
    sources: [
      "https://caredge.com/guides/car-dealer-doc-fee-by-state",
      "https://tax.idaho.gov/taxes/sales-use/online-guide/",
    ],
    specialNotes: null,
    dealerMessage:
      "Hi — I'm interested in a vehicle at your dealership and would like to confirm the full out-the-door price before visiting. Could you please send me an itemized breakdown showing the vehicle sale price, documentation fee, all additional dealer fees, Idaho sales tax (6% + local, applied after any trade-in deduction), title fee, and registration costs? I'd like to see the complete total. Thank you.",
    lastVerified: "2026-03",
    buyerTip: "Idaho's trade-in deduction under IDAPA 35.01.02.044 reduces your taxable purchase price by the full agreed trade-in value. On a $25,000 trade-in applied against a $45,000 purchase, you only pay 6% tax on $20,000 instead of $45,000 — saving $1,500. Make sure the dealer explicitly shows this deduction in the OTD breakdown before calculating tax, and verify the deduction appears on the written quote.",
  },

  illinois: {
    name: "Illinois",
    abbreviation: "IL",
    slug: "illinois",
    docFeeRange: "Reported $378 (not verified)",
    hasCap: false,
    metaDescription:
      "Illinois's stored documentation-fee figure is not a verified legal cap. Reported $378 (not verified). Compare the itemized out-the-door price before you sign.",
    capNote:
      "Illinois has a stored documentation-fee figure of $378 in this file, and that figure needs a source. It is not a verified legal cap. Odigos will not call a higher fee illegal from that number alone. Unverified reports mention documentation fees around $378. That range is not a market standard. Ask the dealer to itemize the charge, and confirm any limit with the state before you rely on it. Compare the itemized out-the-door price. A lower documentation fee with a higher vehicle price is not automatically a better deal.",
    salesTaxNote:
      "Illinois charges 6.25% in state sales tax on vehicles, with local additions of up to 4%. Chicago's combined rate is 10.25% — one of the highest in the country. Trade-in deductions are unlimited as of January 1, 2022 (Public Act 102-0353 removed the prior $10,000 cap), meaning your full trade-in value can reduce the taxable amount.",
    registrationNote:
      "Illinois registration is $151 per year for standard vehicles, with an additional $100 annual fee for electric vehicles. The title fee is $165.",
    introAngle:
      "Illinois notes in this file mention a CPI-adjusted documentation-fee figure around $378 for 2026, but that figure is not verified. A full trade-in deduction is also described. Buyers in the Chicago metro, however, should be prepared for one of the higher combined sales tax rates in the country — 10.25% — which significantly affects the OTD total on any vehicle.",
    snippetAnswer:
      "Illinois has a stored documentation-fee figure of $378 in this file, and that figure needs a source. It is not a verified legal cap. Unverified reports mention documentation fees around $378. That range is not a market standard. The state sales tax is 6.25% with local additions up to 10.25% in Chicago. Trade-in deductions are unlimited, which can significantly reduce the taxable amount.",
    watchFor: [
      "Chicago combined tax rate: at 10.25%, the Chicago combined rate means $4,100 in tax on a $40,000 vehicle. Buyers in the suburbs may see lower rates — confirm your dealer's location.",
      "Doc fee above the cap: the stored $378 figure is not a verified legal cap. A higher fee is not automatically illegal. Ask for clarification if you see a higher amount.",
      "Trade-in credit: Illinois allows the full trade-in value to reduce the taxable purchase price with no dollar cap. Make sure this deduction is applied before your tax is calculated.",
    ],
    negotiationNote:
      "With the doc fee listed with a stored figure that is not a verified cap Illinois buyers should focus negotiation on the vehicle price and any dealer add-ons. The Chicagoland market has intense dealer competition — use it. For buyers trading in a vehicle, the unlimited trade-in credit (without a verified cap on file since Public Act 102-0353 in 2022) is a powerful tool: a $25,000 trade-in at a 10.25% Chicago rate saves $2,563 in tax. Make sure the dealer applies the full deduction before calculating tax. The $165 title fee and $151/year registration are fixed government charges — not negotiable, but important to include in your OTD estimate.",
    ctaHeading: "Have an Illinois dealer quote you want to verify?",
    ctaBody:
      "Paste the quote and Odigos checks whether the charges are itemized, whether the totals reconcile, and whether a fee exceeds a verified state cap. Market value stays unverified unless you optionally enter a factory window sticker MSRP. That sticker is not a live market price, and an unverified fee range is not a legal limit.",
    internalLinks: STANDARD_LINKS,
    sources: [
      "https://www.ilsos.gov/departments/vehicles/basicfees.html",
      "https://www.cata.info/news-and-announcements/13290052",
    ],
    specialNotes:
      "Cap adjusts annually by CPI. Modern cap started at $300 effective Jan 1, 2020. For 2025: $367.70. For 2026: $377.63. Increases ~2–3%/year.",
    dealerMessage:
      "Hi — I'm interested in a vehicle at your dealership and would like to confirm the full out-the-door price before visiting. Could you please send me an itemized breakdown showing the vehicle sale price, documentation fee (Illinois law caps this at $377.63 for 2026), all additional dealer fees, Illinois sales tax (6.25% state + your local/RTA rate — please specify the combined rate), title fee ($165), and registration costs ($151/year). If I'm trading in a vehicle, please show the full trade-in deduction applied before calculating tax (Illinois has no cap on the trade-in credit). I'd like to see the complete itemized total. Thank you.",
    lastVerified: "2026-03",
    commonQuestions: [
      {
        q: "What is the Illinois doc fee cap for 2026?",
        a: "The Illinois doc fee cap for 2026 is $377.63 (commonly cited as $378). The cap started at $300 when enacted January 1, 2020, and adjusts annually by CPI — increasing roughly 2–3% per year. Any dealer charging above this amount is above a stored figure that is not verified with Illinois law.",
      },
      {
        q: "Why is the Chicago sales tax so much higher than the rest of Illinois?",
        a: "Chicago's combined vehicle sales tax reaches 10.25% because of stacked local and regional taxes (6.25% state + RTA + city + county additions). On a $40,000 vehicle, that's $4,100 in tax — roughly $1,600 more than a buyer in a county with only the 6.25% base rate. Suburban Cook County areas and collar counties have rates in between.",
      },
      {
        q: "Is there a cap on the Illinois trade-in credit?",
        a: "No — as of January 1, 2022, the trade-in credit in Illinois is unlimited. Public Act 102-0353 removed the previous $10,000 cap. If your trade-in is worth $25,000, the full amount reduces your taxable purchase price. This is one of the strongest trade-in protections in the country.",
      },
      {
        q: "How much are Illinois title and registration fees?",
        a: "Illinois charges $165 for the title fee and $151 per year for standard vehicle registration. Electric vehicles pay an additional $100 annual fee. These are fixed government charges — they don't vary by dealer.",
      },
    ],
    competitorGapSection:
      "Most Illinois car-buying guides treat a documentation-fee cap as settled. The $378 figure in this file is not verified. Two other notes are still worth checking with the state: an unlimited trade-in credit, and a claim that the figure adjusts with CPI. Since the $10,000 trade-in cap was removed in 2022, a buyer trading in a $30,000 vehicle saves $1,875 in sales tax at the 6.25% base rate — or $3,075 in a 10.25% Chicago jurisdiction. Before you negotiate the vehicle price, confirm the trade-in deduction is applied pre-tax and check whether your purchase falls in a high-tax jurisdiction. The gap between 6.25% and 10.25% on a $35,000 vehicle (after trade-in) is $1,400 — a larger swing than any doc fee negotiation could produce.",
    buyerTip: "Since January 1, 2022, Illinois removed the prior $10,000 cap on trade-in deductions — meaning your full trade-in value now reduces your taxable purchase price with no dollar ceiling. In Chicago's 10.25% combined tax environment, trading in a $30,000 vehicle saves $3,075 in sales tax compared to states where no deduction is allowed. If you have a high-value trade-in, Illinois's unlimited deduction makes the effective tax cost significantly more favorable than the headline rate suggests.",
  },

  indiana: {
    name: "Indiana",
    abbreviation: "IN",
    slug: "indiana",
    docFeeRange: "Reported $251 (not verified)",
    hasCap: true,
    metaDescription:
      "Indiana documentation fee: verified ceiling $251.05. Reported $251 (not verified). Compare the itemized out-the-door price before you sign.",
    capNote:
      "An Indiana Secretary of State memo says the office will not take enforcement action on documentation preparation fees at or below $251.05, citing IC 9-32-13-7(b). Odigos treats a higher documentation fee as above that verified ceiling. Unverified reports mention documentation fees around $251. That range is not a market standard. Compare the itemized out-the-door price. A lower documentation fee with a higher vehicle price is not automatically a better deal.",
    salesTaxNote:
      "Indiana charges a flat 7% sales tax statewide on vehicle purchases. There are no local additions — the rate is uniform across all Indiana counties, making the tax calculation predictable.",
    registrationNote:
      "Indiana base registration is $21.35 per year plus a $15 infrastructure fee. The title fee is $15.",
    introAngle:
      "Indiana offers clear, predictable fee structure for car buyers: a capped doc fee (currently $251), a flat 7% statewide tax with no local variation, and a requirement that the doc fee appear in advertised prices. This makes comparing OTD quotes across Indiana dealers more straightforward than in most other states.",
    snippetAnswer:
      "An Indiana Secretary of State memo says the office will not take enforcement action on documentation preparation fees at or below $251.05, citing IC 9-32-13-7(b). Odigos treats a higher documentation fee as above that verified ceiling. Unverified reports mention documentation fees around $251. That range is not a market standard. The state sales tax is a flat 7% with no local additions.",
    watchFor: [
      "Doc fee at or near the cap: in Indiana, fees often cluster at the maximum allowed amount. Confirm the exact figure and whether it's been disclosed in the advertised price.",
      "Add-on packages: with the doc fee and tax predictable, dealers may push more aggressively on add-on products. Protection packages and extended warranties are almost always optional.",
      "Annual CPI adjustments: the cap increases each year. Verify the current year's cap amount if you're comparing across time.",
    ],
    negotiationNote:
      "Indiana's straightforward fee structure means your negotiation is focused almost entirely on the vehicle price and any add-ons. The doc fee and tax are both effectively fixed — which makes the math simpler. Compare OTD quotes from multiple Indiana dealers on the same vehicle for the clearest comparison.",
    ctaHeading: "Have an Indiana dealer quote you want to review?",
    ctaBody:
      "Paste the quote and Odigos checks whether the charges are itemized, whether the totals reconcile, and whether a fee exceeds a verified state cap. Market value stays unverified unless you optionally enter a factory window sticker MSRP. That sticker is not a live market price, and an unverified fee range is not a legal limit.",
    internalLinks: STANDARD_LINKS,
    sources: [
      "https://www.in.gov/sos/dealer/files/Doc-Fees-in-2025.pdf",
      "https://www.in.gov/bmv/fees-taxes/vehicle-registration-fees-and-taxes/",
    ],
    specialNotes:
      "Cap adjusted annually by CPI. Must be included in advertised price and disclosed separately on bill of sale. Effective July 1, 2025: $251.05.",
    dealerMessage:
      "Hi — I'm interested in a vehicle at your dealership and would like to confirm the full out-the-door price before visiting. Could you please send me an itemized breakdown showing the vehicle sale price, documentation fee (Indiana's current cap is $251 per July 2025), all additional dealer fees, Indiana sales tax (7% flat), title fee, and registration costs? I'd like to see the complete total. Thank you.",
    lastVerified: "2026-03",
    buyerTip: "Indiana requires dealers to include the documentation fee in their advertised price, which means any price you see on a dealer's website or ad should already have the doc fee baked in. When comparing two Indiana dealers, if one shows a lower advertised price, confirm it already includes the doc fee — otherwise you may be comparing apples to oranges and the cheaper-advertised dealer may actually cost more all-in.",
  },

  iowa: {
    name: "Iowa",
    abbreviation: "IA",
    slug: "iowa",
    docFeeRange: "Reported $180 (not verified)",
    hasCap: true,
    metaDescription:
      "Iowa documentation fee: verified ceiling $180. Reported $180 (not verified). Compare the itemized out-the-door price before you sign.",
    capNote:
      "Iowa Code § 322.19A says a documentary fee may not exceed $180. Unverified reports mention documentation fees around $180. That range is not a market standard. Compare the itemized out-the-door price. A lower documentation fee with a higher vehicle price is not automatically a better deal.",
    salesTaxNote:
      "Iowa charges a 5% registration fee on vehicle purchases rather than a traditional sales tax, with an optional 1% Local Option Sales Tax in some jurisdictions. Trade-in deductions apply for same-transaction dealer sales.",
    registrationNote:
      "Iowa registration fees vary based on vehicle weight and list price. The title fee increased from $25 to $35 effective January 1, 2025. Registration costs vary widely depending on vehicle type and weight.",
    introAngle:
      "Iowa's $180 cap on documentation fees is clear, statutory, and enforced. Buyers benefit from predictable doc fees and a 5% registration rate structure. The title fee increased to $35 in January 2025 — a meaningful change to factor into your OTD estimate if you're working from older references.",
    snippetAnswer:
      "Iowa Code § 322.19A says a documentary fee may not exceed $180. Unverified reports mention documentation fees around $180. Unverified reports mention documentation fees around $180. That range is not a market standard. The purchase 'registration fee' is 5% of the price (not a traditional sales tax).",
    watchFor: [
      "Title fee change: Iowa's title fee increased from $25 to $35 effective January 1, 2025. If you're working from older OTD estimates, update this number.",
      "Registration as a 5% fee: Iowa structures its vehicle transfer tax as a registration fee rather than a sales tax — it functions similarly but may be labeled differently on your quote.",
      "Local Option Sales Tax: some jurisdictions may add 1% local option tax on top of the 5% base. Confirm whether your purchase location has this addition.",
    ],
    negotiationNote:
      "With the doc fee capped at $180, your negotiation leverage in Iowa is focused on the vehicle price and any add-ons. Iowa's market is less competitive than major metro areas, so get competing quotes from multiple dealers before committing.",
    ctaHeading: "Have an Iowa dealer quote you want to review?",
    ctaBody:
      "Paste the quote and Odigos checks whether the charges are itemized, whether the totals reconcile, and whether a fee exceeds a verified state cap. Market value stays unverified unless you optionally enter a factory window sticker MSRP. That sticker is not a live market price, and an unverified fee range is not a legal limit.",
    internalLinks: STANDARD_LINKS,
    sources: [
      "https://www.legis.iowa.gov/docs/code/322.19A.pdf",
      "https://revenue.iowa.gov/taxes/tax-guidance/sales-use-excise-tax/sales-use-tax-guide",
    ],
    specialNotes:
      "Title fee increased from $25 to $35 effective Jan 1, 2025.",
    dealerMessage:
      "Hi — I'm interested in a vehicle at your dealership and would like to confirm the full out-the-door price before visiting. Could you please send me an itemized breakdown showing the vehicle sale price, documentation fee (Iowa law caps this at $180), all additional dealer fees, Iowa registration/excise fee (5% + any local option tax), title fee ($35), and any other government fees? I'd like to see the complete total. Thank you.",
    lastVerified: "2026-03",
    buyerTip: "Iowa's 5% 'registration fee' is functionally a vehicle transfer tax, but it's labeled as registration — which can confuse buyers who expect a separate sales tax line. The $35 title fee increased from $25 in January 2025, meaning older OTD estimates are off by $10. Iowa Code §322.19A gives you the right to see the exact statutory cap reference if a dealer disputes the $180 doc fee ceiling.",
  },

  kansas: {
    name: "Kansas",
    abbreviation: "KS",
    slug: "kansas",
    docFeeRange: "Reported $200–$400 (not verified)",
    hasCap: false,
    metaDescription:
      "Kansas does not have a verified documentation-fee cap on file. Reported $200–$400 (not verified). Compare the itemized out-the-door price before you sign.",
    capNote:
      "Kansas does not have a verified documentation-fee cap in this file. A stored note may say dealers set the fee, but that is not a legal finding that no cap exists. Unverified reports mention documentation fees around $200–$400. That range is not a market standard. Compare itemized out-the-door quotes instead of treating one line as legal or illegal.",
    salesTaxNote:
      "Kansas charges 6.5% state sales tax on vehicles, with local additions of up to 4.1% in some areas. Combined rates can reach 10.6% in high-tax jurisdictions. A 120-day trade-in window (expanded as of January 1, 2025) allows full deduction of trade-in value from the taxable amount.",
    registrationNote:
      "Kansas registration fees range from approximately $42.50 to $52.25 depending on vehicle type. The title fee is $21.",
    introAngle:
      "Kansas has no cap on doc fees and a sales tax structure that varies significantly by locality. The 2025 expansion of the trade-in window to 120 days is a buyer-friendly change — if you're trading in a vehicle purchased up to 120 days ago, it can reduce your taxable amount. Combined local rates can approach 10% or more in some areas.",
    snippetAnswer:
      "Kansas does not have a verified documentation-fee cap in this file. A stored note may say dealers set the fee, but that is not a legal finding that no cap exists. Unverified reports mention documentation fees around $200–$400. That range is not a market standard. State sales tax is 6.5% plus local additions up to 10.6%. A 120-day trade-in window allows full deduction from the taxable amount.",
    watchFor: [
      "Local tax rate variation: combined rates can reach 10.6% in some Kansas jurisdictions. Verify your dealer's effective rate before estimating your OTD total.",
      "Trade-in window: the 120-day trade-in deduction window was expanded in 2025. If you recently purchased a vehicle you're trading in, confirm that the deduction is properly applied.",
      "Doc fees without a verified cap on file: ask for the documentation fee before visiting. If it exceeds $400, compare with other dealers.",
    ],
    negotiationNote:
      "Kansas markets outside Wichita and Kansas City tend to have fewer competing dealers, which limits buyer leverage. Get multiple competing quotes and focus negotiation on the vehicle price. The trade-in credit, if applicable, can meaningfully reduce your tax obligation.",
    ctaHeading: "Have a Kansas dealer quote you want to verify?",
    ctaBody:
      "Paste the quote and Odigos checks whether the charges are itemized, whether the totals reconcile, and whether a fee exceeds a verified state cap. Market value stays unverified unless you optionally enter a factory window sticker MSRP. That sticker is not a live market price, and an unverified fee range is not a legal limit.",
    internalLinks: STANDARD_LINKS,
    sources: [
      "https://caredge.com/guides/car-dealer-doc-fee-by-state",
      "https://www.ksrevenue.gov/pub1526.html",
    ],
    specialNotes: null,
    dealerMessage:
      "Hi — I'm interested in a vehicle at your dealership and would like to confirm the full out-the-door price before visiting. Could you please send me an itemized breakdown showing the vehicle sale price, documentation fee, all additional dealer fees, Kansas sales tax (6.5% + local rate for your location), title fee, and registration costs? If I have a trade-in, please show the deduction before calculating tax. I'd like to see the complete total. Thank you.",
    lastVerified: "2026-03",
    buyerTip: "Kansas expanded its trade-in deduction window to 120 days as of January 1, 2025. This means if you purchased a vehicle within the past four months and are trading it in, the full value of that recent purchase reduces your taxable amount on the new vehicle. Few buyers know about this 120-day window — confirm with the dealer that it applies and that the deduction is reflected in the quote before you sign.",
  },

  kentucky: {
    name: "Kentucky",
    abbreviation: "KY",
    slug: "kentucky",
    docFeeRange: "Reported $300–$600 (not verified)",
    hasCap: false,
    metaDescription:
      "Kentucky does not have a verified documentation-fee cap on file. Reported $300–$600 (not verified). Compare the itemized out-the-door price before you sign.",
    capNote:
      "Kentucky does not have a verified documentation-fee cap in this file. A stored note may say dealers set the fee, but that is not a legal finding that no cap exists. Unverified reports mention documentation fees around $300–$600. That range is not a market standard. Compare itemized out-the-door quotes instead of treating one line as legal or illegal.",
    salesTaxNote:
      "Kentucky charges a 6% Motor Vehicle Usage Tax on vehicle sales. The rate is flat statewide with no local additions, making the tax calculation predictable. The MVUT applies to the full vehicle price, with trade-in deductions allowed for new vehicles.",
    registrationNote:
      "Kentucky base registration is $21 per year. The title fee is $9.",
    introAngle:
      "Kentucky does not have a verified doc-fee cap on file, but its Motor Vehicle Usage Tax is simple: a flat 6% with no local variation. The lack of local additions makes the tax portion of your OTD easy to calculate — the main variable is the doc fee itself, which ranges from $300 to $600 across dealers.",
    snippetAnswer:
      "Kentucky does not have a verified documentation-fee cap in this file. A stored note may say dealers set the fee, but that is not a legal finding that no cap exists. Unverified reports mention documentation fees around $300–$600. That range is not a market standard. The Motor Vehicle Usage Tax is a flat 6% with no local additions — making the tax portion of your OTD predictable.",
    watchFor: [
      "Doc fees without a verified cap on file: $300–$600 appears in unverified reports. Some dealers charge more. Ask for the fee to be disclosed before visiting.",
      "New vs. used trade-in credit: Kentucky allows trade-in deductions for new vehicles but limits them for used vehicles. Clarify how the credit applies to your specific transaction.",
      "Dealer add-ons: protection packages and extended warranties are common in Kentucky dealerships. Always confirm what's included in the vehicle price.",
    ],
    negotiationNote:
      "Kentucky's flat 6% MVUT means the tax portion of your deal is predictable — negotiation focuses on the vehicle price, doc fee, and add-ons. Louisville and Lexington have multiple competing dealers, which improves your leverage.",
    ctaHeading: "Have a Kentucky dealer quote you want to review?",
    ctaBody:
      "Paste the quote and Odigos checks whether the charges are itemized, whether the totals reconcile, and whether a fee exceeds a verified state cap. Market value stays unverified unless you optionally enter a factory window sticker MSRP. That sticker is not a live market price, and an unverified fee range is not a legal limit.",
    internalLinks: STANDARD_LINKS,
    sources: [
      "https://revenue.ky.gov/Property/Motor-Vehicles/Pages/Motor-Vehicle-Usage-Tax.aspx",
      "https://caredge.com/guides/car-dealer-doc-fee-by-state",
    ],
    specialNotes: null,
    dealerMessage:
      "Hi — I'm interested in a vehicle at your dealership and would like to confirm the full out-the-door price before visiting. Could you please send me an itemized breakdown showing the vehicle sale price, documentation fee, all additional dealer fees, Kentucky Motor Vehicle Usage Tax (6% flat), title fee ($9), and registration costs ($21/year)? I'd like to see the complete total. Thank you.",
    lastVerified: "2026-03",
    buyerTip: "Kentucky's 6% Motor Vehicle Usage Tax is flat statewide with no local additions — one of the simpler vehicle tax structures in the country. This means if two Kentucky dealers charge the same vehicle price and the same doc fee, your OTD will be identical regardless of which county you buy in. All your negotiation energy should be on the vehicle price and any dealer add-ons, since the tax component gives you no county-level advantage to exploit.",
  },

  louisiana: {
    name: "Louisiana",
    abbreviation: "LA",
    slug: "louisiana",
    docFeeRange: "Reported $300–$425 (not verified)",
    hasCap: true,
    metaDescription:
      "Louisiana documentation fee: verified ceiling $436. Reported $300–$425 (not verified). Compare the itemized out-the-door price before you sign.",
    capNote:
      "Louisiana's 2026 bulletin sets the CPI-adjusted maximum documentary fee at $436 under La. R.S. 6:969.18. Unverified reports mention documentation fees around $300–$425. That range is not a market standard. Compare the itemized out-the-door price. A lower documentation fee with a higher vehicle price is not automatically a better deal.",
    salesTaxNote:
      "Louisiana's state sales tax on vehicles increased from 4.45% to 5% effective January 1, 2025. Local additions can bring combined rates as high as 13.5% in some jurisdictions (Monroe, Sterlington) — among the highest combined vehicle tax rates in the country. Most buyers see combined rates of 8–12% depending on location.",
    registrationNote:
      "Louisiana registration is calculated at 0.1% of the vehicle's value annually, with a minimum of $20, paid on a two-year basis. The title fee is $69.",
    introAngle:
      "Louisiana has the highest potential combined sales tax rates in the country — some jurisdictions reach 13.5%. The state rate also increased to 5% in January 2025. The $425 doc fee cap provides some protection on the dealer side, but buyers need to budget carefully for local sales taxes, which vary dramatically by parish.",
    snippetAnswer:
      "Louisiana's 2026 bulletin sets the CPI-adjusted maximum documentary fee at $436 under La. R.S. Unverified reports mention documentation fees around $300–$425. That range is not a market standard. The state sales tax increased to 5% in January 2025, and combined local rates can reach 13.5%.",
    watchFor: [
      "Extreme local tax variation: Louisiana's combined rates vary from about 5% in some areas to 13.5% in others. The local tax can add thousands of dollars to the OTD on the same vehicle depending on where you buy.",
      "Recent state tax increase: the state rate increased from 4.45% to 5% in January 2025. If you're working from older estimates, update your numbers.",
      "Doc fee near the cap: many Louisiana dealers charge at or near the $425 cap. Confirm the exact fee before visiting.",
    ],
    negotiationNote:
      "The local sales tax in Louisiana is fixed by your purchase location — it's not negotiable. Focus your negotiation energy on the vehicle price and any add-ons. The doc fee is capped at $425, so the main leverage points are above-cap fees and dealer-installed packages.",
    ctaHeading: "Have a Louisiana dealer quote you want to review?",
    ctaBody:
      "Paste the quote and Odigos checks whether the charges are itemized, whether the totals reconcile, and whether a fee exceeds a verified state cap. Market value stays unverified unless you optionally enter a factory window sticker MSRP. That sticker is not a live market price, and an unverified fee range is not a legal limit.",
    internalLinks: STANDARD_LINKS,
    sources: [
      "https://law.justia.com/codes/louisiana/revised-statutes/title-6/rs-6-969-18/",
    ],
    specialNotes:
      "Doc fee cap $425, CPI-adjusted annually starting Jan 1, 2026. State rate increased Jan 2025.",
    dealerMessage:
      "Hi — I'm interested in a vehicle at your dealership and would like to confirm the full out-the-door price before visiting. Could you please send me an itemized breakdown showing the vehicle sale price, documentation fee (Louisiana law caps this at $425), all additional dealer fees, Louisiana sales tax (5% state + your local parish rate), title fee ($69), and registration costs? I'd like to see the complete total. Thank you.",
    lastVerified: "2026-03",
    buyerTip: "Louisiana's combined sales tax rate can vary by over 8 percentage points between parishes — from roughly 5% in some areas to 13.5% in Monroe and Sterlington. On a $40,000 vehicle, the difference between 5% and 13.5% is $3,400 in tax. If you live near a parish line, it's worth checking whether buying in a neighboring lower-tax parish is an option. The Louisiana LDR website provides parish-level rates.",
  },

  maine: {
    name: "Maine",
    abbreviation: "ME",
    slug: "maine",
    docFeeRange: "Reported $300–$600 (not verified)",
    hasCap: false,
    metaDescription:
      "Maine does not have a verified documentation-fee cap on file. Reported $300–$600 (not verified). Compare the itemized out-the-door price before you sign.",
    capNote:
      "Maine does not have a verified documentation-fee cap in this file. A stored note may say dealers set the fee, but that is not a legal finding that no cap exists. Unverified reports mention documentation fees around $300–$600. That range is not a market standard. Compare itemized out-the-door quotes instead of treating one line as legal or illegal.",
    salesTaxNote:
      "Maine charges a flat 5.5% sales tax on vehicle purchases statewide. There are no local additions — the rate is uniform across all Maine counties. Trade-in deductions are allowed when both vehicles are in the same category.",
    registrationNote:
      "Maine base registration runs approximately $35 for a two-year period. The title fee is $33.",
    introAngle:
      "Maine has a simple, uniform tax structure for vehicle purchases — 5.5% flat with no local variation. Doc fees are without a verified cap on file but tend to be in a moderate range. The flat tax makes it easy to calculate the tax portion of your OTD without looking up local rates.",
    snippetAnswer:
      "Maine does not have a verified documentation-fee cap in this file. A stored note may say dealers set the fee, but that is not a legal finding that no cap exists. Unverified reports mention documentation fees around $300–$600. That range is not a market standard. The state sales tax is a flat 5.5% with no local additions, making the tax portion of your OTD predictable.",
    watchFor: [
      "Doc fees without a verified cap on file: Maine has no cap, so fees vary by dealer. Get the fee disclosed before your visit and compare across dealers.",
      "Trade-in credit: Maine allows trade-in deductions for same-category vehicles. Make sure this credit is applied before your tax is calculated.",
      "Dealer add-ons: ask for an itemized OTD breakdown to identify any add-ons included in the vehicle price.",
    ],
    negotiationNote:
      "Maine's less-populated market means fewer competing dealers, particularly outside of Portland and Bangor. Get OTD quotes from multiple dealers and focus negotiation on the vehicle price and the doc fee. With no cap, the doc fee is technically negotiable.",
    ctaHeading: "Have a Maine dealer quote you want to verify?",
    ctaBody:
      "Paste the quote and Odigos checks whether the charges are itemized, whether the totals reconcile, and whether a fee exceeds a verified state cap. Market value stays unverified unless you optionally enter a factory window sticker MSRP. That sticker is not a live market price, and an unverified fee range is not a legal limit.",
    internalLinks: STANDARD_LINKS,
    sources: [
      "https://legislature.maine.gov/statutes/29-a/title29-Asec953-A.html",
      "https://www.maine.gov/revenue/taxes/sales-use-service-provider-tax/rates-due-dates",
    ],
    specialNotes: null,
    dealerMessage:
      "Hi — I'm interested in a vehicle at your dealership and would like to confirm the full out-the-door price before visiting. Could you please send me an itemized breakdown showing the vehicle sale price, documentation fee, all additional dealer fees, Maine sales tax (5.5% flat), title fee ($33), and registration costs? I'd like to see the complete total. Thank you.",
    lastVerified: "2026-03",
    buyerTip: "Maine's 5.5% flat statewide rate with no local additions makes the tax portion of your OTD completely predictable — no need to look up ZIP codes or county rates. Maine statute §953-A governs fee disclosure, requiring dealers to disclose the doc fee separately. The predictable tax environment means the main OTD variables for Maine buyers are the vehicle price and the documentation fee (no verified cap on file), making dealer-to-dealer comparison straightforward.",
  },

  maryland: {
    name: "Maryland",
    abbreviation: "MD",
    slug: "maryland",
    docFeeRange: "Reported $300–$800 (not verified)",
    hasCap: true,
    metaDescription:
      "Maryland documentation fee: verified ceiling $800. Reported $300–$800 (not verified). Compare the itemized out-the-door price before you sign.",
    capNote:
      "Maryland's dealer processing-charge ceiling is $800 on and after July 1, 2024 (Md. Code, Transp. § 15-311.1). Unverified reports mention documentation fees around $300–$800. That range is not a market standard. Compare the itemized out-the-door price. A lower documentation fee with a higher vehicle price is not automatically a better deal.",
    salesTaxNote:
      "Maryland charges a vehicle excise tax of 6.5% on vehicle purchases, effective July 1, 2025 (increased from 6%). The rate applies statewide with no local additions for vehicles. It is applied to the purchase price.",
    registrationNote:
      "Maryland registration runs $120.50–$191.50 per year depending on vehicle weight, plus a $40 annual EMS surcharge. The title fee is $200 — one of the higher title fees in the country.",
    introAngle:
      "Maryland buyers have seen two significant changes in 2024–2025: the doc fee cap increased from approximately $500 to $800 (SB 362, July 2024), and the vehicle excise tax increased from 6% to 6.5% (July 2025). The $200 title fee is also notably high compared to most states. Budget for these updated amounts when estimating your OTD.",
    snippetAnswer:
      "Maryland's dealer processing-charge ceiling is $800 on and after July 1, 2024 (Md. Code, Transp. Unverified reports mention documentation fees around $300–$800. That range is not a market standard. The vehicle excise tax increased to 6.5% in July 2025. Both the cap and tax rate changed recently.",
    watchFor: [
      "Recent cap increase: Maryland's doc fee cap rose from ~$500 to $800 in July 2024. If you're comparing older quotes, note that higher fees are now legally permitted.",
      "Recent tax rate increase: the excise tax increased from 6% to 6.5% in July 2025. Update any older OTD estimates accordingly.",
      "High title fee: Maryland's $200 title fee is significantly higher than most states. Make sure it's included in any OTD comparison.",
      "High annual registration: at up to $191.50/year plus a $40 EMS surcharge, Maryland's ongoing registration costs are above average.",
    ],
    negotiationNote:
      "Maryland's competitive DC-metro and Baltimore markets give buyers options. With the doc fee capped at $800, your negotiation is focused on the vehicle price and any add-ons. The excise tax and title fee are government charges — not negotiable.",
    ctaHeading: "Have a Maryland dealer quote you want to review?",
    ctaBody:
      "Paste the quote and Odigos checks whether the charges are itemized, whether the totals reconcile, and whether a fee exceeds a verified state cap. Market value stays unverified unless you optionally enter a factory window sticker MSRP. That sticker is not a live market price, and an unverified fee range is not a legal limit.",
    internalLinks: STANDARD_LINKS,
    sources: [
      "https://mva.maryland.gov/businesses/Documents/bulletins/2024/Bulletin%20-%20Vehicle%20Reg%20Fees,%20Term,%20and%20Weight%20Changes_SB%20362.pdf",
    ],
    specialNotes:
      "Doc fee cap increased from ~$500 to $800 effective July 1, 2024 (SB 362). Sales tax increased from 6% to 6.5% effective July 1, 2025.",
    dealerMessage:
      "Hi — I'm interested in a vehicle at your dealership and would like to confirm the full out-the-door price before visiting. Could you please send me an itemized breakdown showing the vehicle sale price, documentation fee (Maryland's cap is $800), all additional dealer fees, Maryland excise tax (6.5%), title fee ($200), and registration costs? I'd like to see the complete total. Thank you.",
    lastVerified: "2026-03",
    buyerTip: "Maryland's $200 title fee is significantly higher than most states — nearly 10x what buyers from Virginia or Texas are used to paying. This is a government fee enacted by SB 362 alongside the doc fee cap change in July 2024. When comparing Maryland quotes to out-of-state options, don't overlook this title fee difference. On vehicles with a $15 title fee in neighboring states, Maryland buyers pay $185 more just for the title.",
  },

  massachusetts: {
    name: "Massachusetts",
    abbreviation: "MA",
    slug: "massachusetts",
    docFeeRange: "Reported $300–$500 (not verified)",
    hasCap: false,
    metaDescription:
      "Massachusetts does not have a verified documentation-fee cap on file. Reported $300–$500 (not verified). Compare the itemized out-the-door price before you sign.",
    capNote:
      "Massachusetts does not have a verified documentation-fee cap in this file. A stored note may say dealers set the fee, but that is not a legal finding that no cap exists. Unverified reports mention documentation fees around $300–$500. That range is not a market standard. Compare itemized out-the-door quotes instead of treating one line as legal or illegal.",
    salesTaxNote:
      "Massachusetts charges a flat 6.25% sales tax on vehicle purchases statewide. There are no local additions — the rate is uniform across all Massachusetts cities and counties. Trade-in deductions are allowed.",
    registrationNote:
      "Massachusetts registration runs approximately $60 for a two-year period. The title fee is $75.",
    introAngle:
      "Massachusetts buyers should note an important distinction: the state caps the 'title preparation fee' at $5, but the broader 'documentation fee' that most dealers charge is without a verified cap on file. Fees of $300–$500 are common. The state's 6.25% flat tax is uniform — no need to look up local rates.",
    snippetAnswer:
      "Massachusetts does not have a verified documentation-fee cap in this file. A stored note may say dealers set the fee, but that is not a legal finding that no cap exists. Unverified reports mention documentation fees around $300–$500. That range is not a market standard. The state sales tax is a flat 6.25% with no local additions.",
    watchFor: [
      "Title prep vs. doc fee: Massachusetts caps the 'title preparation fee' at $5, but the broader documentation fee is without a verified cap on file. These may be billed as one combined charge — ask for them to be itemized separately.",
      "Doc fees without a verified cap on file: $300–$500 appears in unverified reports. Some dealers charge more. Compare across dealers before committing.",
      "Dealer add-ons: protection packages are common. Ask for everything included in the vehicle price to be listed explicitly.",
    ],
    negotiationNote:
      "Massachusetts's competitive Boston metro market gives buyers real leverage. Compare OTD quotes from multiple dealers. The doc fee is without a verified cap on file and worth asking about — some dealers will reduce it to close a deal.",
    ctaHeading: "Have a Massachusetts dealer quote you want to verify?",
    ctaBody:
      "Paste the quote and Odigos checks whether the charges are itemized, whether the totals reconcile, and whether a fee exceeds a verified state cap. Market value stays unverified unless you optionally enter a factory window sticker MSRP. That sticker is not a live market price, and an unverified fee range is not a legal limit.",
    internalLinks: STANDARD_LINKS,
    sources: [
      "https://www.mass.gov/directive/directive-14-1-document-and-title-preparation-fees-charged-by-motor-vehicle-dealers",
      "https://www.mass.gov/guides/motor-vehicle-and-trailer-sales-and-use-tax",
    ],
    specialNotes:
      "Title prep fee only is listed with a stored figure that is not a verified cap per Directive 14-1. General doc fees are without a verified cap on file.",
    dealerMessage:
      "Hi — I'm interested in a vehicle at your dealership and would like to confirm the full out-the-door price before visiting. Could you please send me an itemized breakdown showing the vehicle sale price, documentation/processing fee (please itemize separately from any title preparation fee), all additional dealer fees, Massachusetts sales tax (6.25% flat), title fee ($75), and registration costs? I'd like to see the complete total. Thank you.",
    lastVerified: "2026-03",
    buyerTip: "Massachusetts Directive 14-1 caps the 'title preparation fee' at $5 — but this is different from the general documentation fee, which is without a verified cap on file. Dealers sometimes bundle both into a single line on the quote. Ask the dealer to split them: the title prep portion should be $5 or less, and the general doc fee is the without a verified cap on file amount. If both are combined at $400+, you have a right to see them itemized separately under state directive.",
  },

  michigan: {
    name: "Michigan",
    abbreviation: "MI",
    slug: "michigan",
    docFeeRange: "Reported $200–$280 (not verified)",
    hasCap: true,
    metaDescription:
      "Michigan documentation fee: verified $280 dollar ceiling under DIFS Bulletin 2025-03-CF. Reported $200–$280 (not verified). Compare the itemized out-the-door price before you sign.",
    capNote:
      "DIFS Bulletin 2025-03-CF, issued January 28, 2025, says Michigan's documentary preparation fee shall not exceed 5% of the cash price or $280, whichever is less. Odigos flags the verified $280 dollar ceiling. On a low-priced vehicle, confirm the 5% alternative before you treat a smaller fee as allowed. Unverified reports mention documentation fees around $200–$280. That range is not a market standard. Compare the itemized out-the-door price.",
    salesTaxNote:
      "Michigan charges a flat 6% sales tax on vehicle purchases statewide. There are no local additions — the rate is uniform. Trade-in credit is allowed up to $11,000 (2025 cap) or the actual agreed trade-in value, whichever is less.",
    registrationNote:
      "Michigan base registration is $15 per year (one-year) or $29 for two years, plus a percentage of the vehicle's original MSRP. The title fee is $15.",
    introAngle:
      "Michigan's doc fee cap has an important nuance: it's the lesser of $280 or 5% of the vehicle's cash price. For most vehicles above $5,600, the $280 flat cap applies. For cheaper vehicles, the 5% formula limits the fee more. DIFS Bulletin 2025-03-CF provides the current guidance. The trade-in credit is listed with a stored figure that is not a verified cap in 2025.",
    snippetAnswer:
      "DIFS Bulletin 2025-03-CF says Michigan's documentary preparation fee shall not exceed 5% of the cash price or $280, whichever is less. Odigos flags a fee above the verified $280 ceiling. The state tax is a flat 6%. Trade-in credit is allowed up to $11,000.",
    watchFor: [
      "5% cap for lower-priced vehicles: on a $4,000 vehicle, the max doc fee is $200, not $280. If you're buying an inexpensive used vehicle, confirm which limit applies.",
      "Trade-in credit cap: Michigan's trade-in credit is listed with a stored figure that is not a verified cap (2025). If your trade-in is worth more, the excess doesn't reduce your taxable amount.",
      "Doc fee above $280: that exceeds the verified dollar ceiling in DIFS Bulletin 2025-03-CF. On a cheaper vehicle, also check the 5% of cash price alternative.",
    ],
    negotiationNote:
      "Michigan's flat 6% tax (no local additions) and $280 doc fee cap per DIFS Bulletin 2025-03-CF make OTD math predictable. The Detroit metro's competitive dealer network gives buyers real leverage on vehicle price. The trade-in credit ceiling of $11,000 is critical to know — if your trade-in is worth $18,000, only $11,000 reduces the taxable amount, costing you $420 in additional tax on the uncredited $7,000. For used car buyers, check whether the 5% formula applies: on a $4,000 vehicle, the max doc fee is $200, not $280.",
    ctaHeading: "Have a Michigan dealer quote you want to review?",
    ctaBody:
      "Paste the quote and Odigos checks whether the charges are itemized, whether the totals reconcile, and whether a fee exceeds a verified state cap. Market value stays unverified unless you optionally enter a factory window sticker MSRP. That sticker is not a live market price, and an unverified fee range is not a legal limit.",
    internalLinks: STANDARD_LINKS,
    sources: [
      "https://www.michigan.gov/difs/-/media/Project/Websites/difs/Bulletins/2025/Bulletin_2025-03-CF.pdf",
    ],
    specialNotes:
      "Cap is $280 OR 5% of vehicle price, whichever is LESS. Adjusted biennially by CPI. Per DIFS Bulletin 2025-03-CF.",
    dealerMessage:
      "Hi — I'm interested in a vehicle at your dealership and would like to confirm the full out-the-door price before visiting. Could you please send me an itemized breakdown showing the vehicle sale price, documentation fee (Michigan caps this at $280 or 5% of the cash price, whichever is less, per DIFS Bulletin 2025-03-CF), all additional dealer fees, Michigan sales tax (6% flat statewide), title fee ($15), and registration costs (base + MSRP-based component)? If I have a trade-in, please show the credit applied (up to the $11,000 cap). I'd like to see the complete itemized total. Thank you.",
    lastVerified: "2026-03",
    commonQuestions: [
      {
        q: "How does Michigan's doc fee cap work?",
        a: "DIFS Bulletin 2025-03-CF says the documentary preparation fee shall not exceed 5% of the cash price or $280, whichever is less. Odigos flags a fee above the verified $280 dollar ceiling. On a $4,000 vehicle, 5% is $200, so confirm that alternative before you treat a fee under $280 as allowed.",
      },
      {
        q: "What is Michigan's trade-in credit cap?",
        a: "Michigan allows a trade-in credit of up to $11,000 (2025 cap) or the actual agreed trade-in value, whichever is less. If your trade-in is worth $15,000, only $11,000 reduces the taxable amount — you still pay 6% tax on the remaining $4,000 of value that exceeds the cap.",
      },
      {
        q: "Is Michigan sales tax the same everywhere?",
        a: "Yes. Michigan charges a flat 6% sales tax on vehicles statewide with no local additions. This makes the tax portion of your OTD predictable regardless of which dealer you visit in the state.",
      },
      {
        q: "How is Michigan registration calculated?",
        a: "Michigan registration includes a $15 base fee (one-year) or $29 (two-year) plus a percentage of the vehicle's original MSRP. This MSRP-based component can be substantial on newer or luxury vehicles — budget accordingly.",
      },
    ],
    competitorGapSection:
      "Most Michigan guides cite the $280 cap but miss the 5% alternative formula and the trade-in credit ceiling. The 5% rule protects used car buyers: on a $3,000 vehicle, the max doc fee is $150, not $280. The $11,000 trade-in cap is also widely overlooked. If you're trading in a vehicle worth more than $11,000, the excess doesn't reduce your taxable amount — which means you pay 6% on that gap. On a $20,000 trade-in, the uncredited $9,000 costs you $540 in additional tax. Knowing these limits before you walk into the dealership prevents surprise at the finance desk.",
    buyerTip: "Michigan's trade-in credit is listed with a stored figure that is not a verified cap — the state only allows you to reduce your taxable purchase price by up to that amount. If your trade-in is worth $20,000, you still pay 6% tax on the full purchase price minus only $11,000, not the full $20,000 trade-in value. Buyers with high-value trade-ins should factor this limitation into their tax estimate — it's a common source of OTD surprises.",
  },

  minnesota: {
    name: "Minnesota",
    abbreviation: "MN",
    slug: "minnesota",
    docFeeRange: "Reported $125–$350 (not verified)",
    hasCap: true,
    metaDescription:
      "Minnesota documentation fee: verified ceiling $350. Reported $125–$350 (not verified). Compare the itemized out-the-door price before you sign.",
    capNote:
      "Minnesota's fetched statute text says that on or after July 1, 2025, the maximum documentary fee is the lesser of $350 or ten percent of the sale or lease. This file stores the $350 ceiling. Unverified reports mention documentation fees around $125–$350. That range is not a market standard. Compare the itemized out-the-door price. A lower documentation fee with a higher vehicle price is not automatically a better deal.",
    salesTaxNote:
      "Minnesota charges 6.875% state sales tax on vehicle purchases, plus a 0.5% metro transit tax in the metro area. Trade-in deductions are allowed, reducing the taxable amount.",
    registrationNote:
      "Minnesota registration is calculated at 1.575% of the vehicle's MSRP annually, plus $11.25 in universal fees. This value-based structure makes registration costs meaningfully higher for expensive vehicles. The title fee is $34.",
    introAngle:
      "Minnesota's verified ceiling, for sales on or after July 1, 2025, is the lesser of $350 or ten percent of the sale. Older guides quoted a much lower number. A dealer charging exactly $350 is not a market finding — it is the dollar ceiling stored in this file. The registration fee, calculated as a percentage of MSRP, can also be substantial on higher-priced vehicles.",
    snippetAnswer:
      "Minnesota's fetched statute text says that on or after July 1, 2025, the maximum documentary fee is the lesser of $350 or ten percent of the sale or lease. This file stores the $350 ceiling. Unverified reports mention documentation fees around $125–$350. That range is not a market standard. State sales tax is 6.875% plus metro transit additions. Registration is value-based at 1.575% of MSRP annually.",
    watchFor: [
      "New $350 cap: buyers used to Minnesota's old ~$125 cap may be surprised by the new $350 ceiling. This change took effect July 1, 2025.",
      "Metro transit surcharge: the additional 0.5% tax applies in the Twin Cities metro area. Confirm whether your dealer's location is in the metro transit district.",
      "Value-based registration: registration scales with MSRP. On a $45,000 vehicle, annual registration runs approximately $700 in the first year — much higher than flat-rate states.",
    ],
    negotiationNote:
      "Minnesota's Twin Cities market is competitive with multiple dealers. With the doc fee capped at $350, your negotiation focuses on vehicle price and add-ons. The registration fee is a government charge based on MSRP — not negotiable.",
    ctaHeading: "Have a Minnesota dealer quote you want to verify?",
    ctaBody:
      "Paste the quote and Odigos checks whether the charges are itemized, whether the totals reconcile, and whether a fee exceeds a verified state cap. Market value stays unverified unless you optionally enter a factory window sticker MSRP. That sticker is not a live market price, and an unverified fee range is not a legal limit.",
    internalLinks: STANDARD_LINKS,
    sources: [
      "https://mada.org/doc-fee-increase/",
    ],
    specialNotes:
      "MAJOR CHANGE: Cap increased from ~$125 to $350 effective July 1, 2025. Or 10% of sale value for vehicles ≤$3,499, whichever is less.",
    dealerMessage:
      "Hi — I'm interested in a vehicle at your dealership and would like to confirm the full out-the-door price before visiting. Could you please send me an itemized breakdown showing the vehicle sale price, documentation fee (Minnesota's cap is $350 as of July 2025), all additional dealer fees, Minnesota sales tax (6.875% + 0.5% if in metro transit district), title fee ($34), and registration costs (1.575% of MSRP)? I'd like to see the complete total. Thank you.",
    lastVerified: "2026-03",
    buyerTip: "Minnesota's doc fee cap jumped from roughly $125 to $350 effective July 1, 2025. If you're comparing a current quote to an older reference or estimate, the $225 increase in the allowable doc fee may explain the difference. Buyers who purchased in Minnesota before July 2025 and are now buying again should update their baseline expectation — the new $350 cap is a significant and recent change.",
  },

  mississippi: {
    name: "Mississippi",
    abbreviation: "MS",
    slug: "mississippi",
    docFeeRange: "Reported $300–$550 (not verified)",
    hasCap: false,
    metaDescription:
      "Mississippi does not have a verified documentation-fee cap on file. Reported $300–$550 (not verified). Compare the itemized out-the-door price before you sign.",
    capNote:
      "Mississippi does not have a verified documentation-fee cap in this file. A stored note may say dealers set the fee, but that is not a legal finding that no cap exists. Unverified reports mention documentation fees around $300–$550. That range is not a market standard. Compare itemized out-the-door quotes instead of treating one line as legal or illegal.",
    salesTaxNote:
      "Mississippi charges 5% sales tax specifically for passenger vehicles (different from the 7% general sales tax rate). Local additions of up to 0.25% may apply. Trade-in deductions are allowed.",
    registrationNote:
      "Mississippi registration is approximately $14 for first-time or $12.75 for renewal, plus approximately $15 in county taxes. The title fee is $9.",
    introAngle:
      "Older notes describe a district-based documentation fee in Mississippi, including a limit tied to a local average. That rule is not verified in this file, and those averages are not a market standard. The passenger vehicle sales tax rate of 5% is lower than the general state rate.",
    snippetAnswer:
      "Mississippi does not have a verified documentation-fee cap in this file. A stored note may say dealers set the fee, but that is not a legal finding that no cap exists. Unverified reports mention documentation fees around $300–$550. That range is not a market standard. The state sales tax on passenger vehicles is 5% — lower than the 7% general rate. Registration costs are among the lowest in the country.",
    watchFor: [
      "District-based fee variation: the effective upper bound on doc fees varies by dealer district. Ask if the dealer can show you what 'district average' means for their location.",
      "Passenger vehicle vs. general tax rate: Mississippi's 5% passenger vehicle rate is lower than the 7% general sales tax. Make sure your quote uses the correct rate.",
      "Low registration cost: at approximately $14 base, Mississippi's registration is among the cheapest nationally — but don't confuse low registration with low overall fees.",
    ],
    negotiationNote:
      "Mississippi's market is spread across smaller cities, which limits competitive leverage outside the Jackson area. The district-based fee system means some dealers charge at the upper bound while others charge less — comparison shopping is worth the effort.",
    ctaHeading: "Have a Mississippi dealer quote you want to verify?",
    ctaBody:
      "Paste the quote and Odigos checks whether the charges are itemized, whether the totals reconcile, and whether a fee exceeds a verified state cap. Market value stays unverified unless you optionally enter a factory window sticker MSRP. That sticker is not a live market price, and an unverified fee range is not a legal limit.",
    internalLinks: STANDARD_LINKS,
    sources: [
      "https://www.mmvc.ms.gov/sites/mmvc/files/rules/Regulation8.pdf",
    ],
    specialNotes:
      "District-based caps: fees cannot exceed 25% above district average (~$425 typical). Not a hard state cap.",
    dealerMessage:
      "Hi — I'm interested in a vehicle at your dealership and would like to confirm the full out-the-door price before visiting. Could you please send me an itemized breakdown showing the vehicle sale price, documentation fee, all additional dealer fees, Mississippi sales tax (5% for passenger vehicles + any local addition), title fee ($9), and registration costs? I'd like to see the complete total. Thank you.",
    lastVerified: "2026-03",
    buyerTip: "Mississippi's 5% passenger vehicle sales tax is lower than the state's 7% general sales tax rate — but many quotes may default to the wrong rate if the dealer's system is not configured correctly. Confirm explicitly that your quote uses the 5% passenger vehicle rate, not the 7% general rate. On a $30,000 vehicle, this difference is $600.",
  },

  missouri: {
    name: "Missouri",
    abbreviation: "MO",
    slug: "missouri",
    docFeeRange: "Reported $300–$500 (not verified)",
    hasCap: true,
    metaDescription:
      "Missouri documentation fee: verified ceiling $620.79. Reported $300–$500 (not verified). Compare the itemized out-the-door price before you sign.",
    capNote:
      "Missouri's 2026 maximum dealer administrative fee on file is $620.79 under Mo. Rev. Stat. § 301.558. Unverified reports mention documentation fees around $300–$500. That range is not a market standard. Compare the itemized out-the-door price. A lower documentation fee with a higher vehicle price is not automatically a better deal.",
    salesTaxNote:
      "Missouri charges 4.225% state sales tax on vehicles, with local additions of up to 5.875%. Combined rates can reach 10.1% in some jurisdictions. Total vehicle sales tax is also subject to a $725 cap per transaction.",
    registrationNote:
      "Missouri registration ranges from $18.25 to $51.25 per year based on vehicle horsepower, plus a $9 processing fee. The title fee is $15.",
    introAngle:
      "Missouri has a $500 cap on doc fees (CPI-adjusted) and a horsepower-based registration structure. The low 4.225% state tax rate can be misleading — local additions push combined rates to 8–10% in many areas. The $725 total tax cap per transaction is a useful ceiling for high-value vehicles.",
    snippetAnswer:
      "Missouri's 2026 maximum dealer administrative fee on file is $620.79 under Mo. Rev. Unverified reports mention documentation fees around $300–$500. That range is not a market standard. State sales tax is 4.225% with local additions. A $725 cap on total vehicle sales tax applies per transaction.",
    watchFor: [
      "Local tax variation: Missouri's combined rates range widely. Kansas City and St. Louis buyers may see rates above 8–9%. Verify your effective rate.",
      "$725 total tax cap: on very high-value vehicle purchases, total Missouri sales tax is capped at $725. This only benefits buyers of expensive vehicles where the uncapped tax would exceed that amount.",
      "Doc fee near the cap: many Missouri dealers charge at or near $500. Confirm the amount before visiting.",
    ],
    negotiationNote:
      "Missouri's Kansas City and St. Louis markets have competitive dealer networks. With the doc fee capped at $500, your leverage is on the vehicle price and add-ons. Verify the local tax rate at your specific dealership — it can vary significantly even within the same metro area.",
    ctaHeading: "Have a Missouri dealer quote you want to review?",
    ctaBody:
      "Paste the quote and Odigos checks whether the charges are itemized, whether the totals reconcile, and whether a fee exceeds a verified state cap. Market value stays unverified unless you optionally enter a factory window sticker MSRP. That sticker is not a live market price, and an unverified fee range is not a legal limit.",
    internalLinks: STANDARD_LINKS,
    sources: [
      "https://revisor.mo.gov/main/OneSection.aspx?section=301.558",
    ],
    specialNotes:
      "Doc fee cap $500 base, increased annually by CPI. Effective Aug 17, 2025.",
    dealerMessage:
      "Hi — I'm interested in a vehicle at your dealership and would like to confirm the full out-the-door price before visiting. Could you please send me an itemized breakdown showing the vehicle sale price, documentation fee (Missouri's cap is $500), all additional dealer fees, Missouri sales tax (4.225% state + local rate), title fee ($15), and registration costs (horsepower-based)? I'd like to see the complete total. Thank you.",
    lastVerified: "2026-03",
    buyerTip: "Missouri caps total vehicle sales tax at $725 per transaction — a provision that benefits buyers of expensive vehicles. On a $200,000 vehicle where uncapped 8% tax would be $16,000, Missouri's $725 ceiling is a significant advantage. This cap is not widely publicized, so dealers may not apply it automatically. If you're purchasing a high-value vehicle, confirm the $725 total tax cap is reflected in your OTD breakdown.",
  },

  montana: {
    name: "Montana",
    abbreviation: "MT",
    slug: "montana",
    docFeeRange: "Reported $200–$400 (not verified)",
    hasCap: false,
    metaDescription:
      "Montana does not have a verified documentation-fee cap on file. Reported $200–$400 (not verified). Compare the itemized out-the-door price before you sign.",
    capNote:
      "Montana does not have a verified documentation-fee cap in this file. A stored note may say dealers set the fee, but that is not a legal finding that no cap exists. Unverified reports mention documentation fees around $200–$400. That range is not a market standard. Compare itemized out-the-door quotes instead of treating one line as legal or illegal.",
    salesTaxNote:
      "Montana has no state sales tax on vehicle purchases — one of only five states in the country (along with Alaska, Delaware, New Hampshire, and Oregon). This significantly reduces the OTD total compared to most states.",
    registrationNote:
      "Montana registration fees vary by vehicle age: $217 for vehicles 0–4 years old, $130 for 5–10 years old, with decreasing rates beyond that. A county option fee of approximately $10 may also apply. The title fee is $12.",
    introAngle:
      "Montana is one of five states with no vehicle sales tax, which gives buyers a meaningful OTD advantage over most of the country. On a $40,000 vehicle, the absence of a 6% sales tax saves $2,400. Doc fees are without a verified cap on file but tend to be in a moderate range. Registration decreases with vehicle age.",
    snippetAnswer:
      "Montana does not have a verified documentation-fee cap in this file. A stored note may say dealers set the fee, but that is not a legal finding that no cap exists. Unverified reports mention documentation fees around $200–$400. That range is not a market standard. Montana has no state sales tax on vehicles — one of only five states. Registration runs $130–$217 based on vehicle age and decreases over time.",
    watchFor: [
      "Montana buyers from other states: Montana's lack of sales tax attracts buyers from neighboring states. If you're not a Montana resident, verify whether you can legally use Montana's tax exemption for your purchase.",
      "Doc fees without a verified cap on file: $200–$400 appears in unverified reports, and there is no verified cap on file. Compare across dealers.",
      "County option fees: a small county fee may apply on top of the state registration amount.",
    ],
    negotiationNote:
      "Montana's less-populated market means fewer competing dealers, particularly outside Billings and Missoula. The absence of sales tax is a significant advantage — focus negotiation on the vehicle price and any dealer add-ons. Doc fees are without a verified cap on file and may be negotiable.",
    ctaHeading: "Have a Montana dealer quote you want to review?",
    ctaBody:
      "Paste the quote and Odigos checks whether the charges are itemized, whether the totals reconcile, and whether a fee exceeds a verified state cap. Market value stays unverified unless you optionally enter a factory window sticker MSRP. That sticker is not a live market price, and an unverified fee range is not a legal limit.",
    internalLinks: STANDARD_LINKS,
    sources: [
      "https://revenue.mt.gov/taxes/general-sales-tax",
      "https://caredge.com/guides/car-dealer-doc-fee-by-state",
    ],
    specialNotes:
      "One of five states with no sales tax on vehicles (along with AK, DE, NH, OR).",
    dealerMessage:
      "Hi — I'm interested in a vehicle at your dealership and would like to confirm the full out-the-door price before visiting. Could you please send me an itemized breakdown showing the vehicle sale price, documentation fee, all additional dealer fees, title fee ($12), and registration costs (based on vehicle age)? Montana has no state sales tax, so please confirm no sales tax is included. I'd like to see the complete total. Thank you.",
    lastVerified: "2026-03",
    buyerTip: "Montana's lack of sales tax has historically attracted out-of-state buyers who register vehicles through Montana LLCs. However, this practice has faced increased scrutiny in California and other states. If you're a Montana resident purchasing locally, you benefit directly and simply. If you're considering a Montana LLC vehicle purchase from another state, consult a tax attorney in your home state first — enforcement of use tax on out-of-state registered vehicles has increased significantly.",
  },

  nebraska: {
    name: "Nebraska",
    abbreviation: "NE",
    slug: "nebraska",
    docFeeRange: "Reported $200–$400 (not verified)",
    hasCap: false,
    metaDescription:
      "Nebraska does not have a verified documentation-fee cap on file. Reported $200–$400 (not verified). Compare the itemized out-the-door price before you sign.",
    capNote:
      "Nebraska does not have a verified documentation-fee cap in this file. A stored note may say dealers set the fee, but that is not a legal finding that no cap exists. Unverified reports mention documentation fees around $200–$400. That range is not a market standard. Compare itemized out-the-door quotes instead of treating one line as legal or illegal.",
    salesTaxNote:
      "Nebraska charges 5.5% state sales tax on vehicle purchases, with local additions of up to 2%. Trade-in deductions are allowed, reducing the taxable purchase price.",
    registrationNote:
      "Nebraska base registration is approximately $68 plus approximately $20.50 in additional statutory fees. The title fee is $18.",
    introAngle:
      "Nebraska has moderate doc fees in the $200–$400 range with no verified cap on file. The 5.5% state tax with modest local additions keeps the tax portion predictable. Buyers should verify the exact local rate for their purchase location and confirm whether a trade-in deduction applies.",
    snippetAnswer:
      "Nebraska does not have a verified documentation-fee cap in this file. A stored note may say dealers set the fee, but that is not a legal finding that no cap exists. Unverified reports mention documentation fees around $200–$400. That range is not a market standard. State sales tax is 5.5% with local additions up to 2%. Trade-in deductions are allowed.",
    watchFor: [
      "Doc fees without a verified cap on file: ask for the fee to be disclosed before visiting. If it exceeds $400, compare with other Nebraska dealers.",
      "Local tax additions: some Nebraska cities add up to 2% on top of the 5.5% base. Confirm your effective rate.",
      "Trade-in credit: Nebraska allows trade-in deductions. Make sure the credit is applied before your tax is calculated.",
    ],
    negotiationNote:
      "Omaha and Lincoln have competitive dealer markets that give buyers more leverage. Outside these areas, options are more limited. Focus negotiation on the vehicle price and the doc fee, which is without a verified cap on file.",
    ctaHeading: "Have a Nebraska dealer quote you want to review?",
    ctaBody:
      "Paste the quote and Odigos checks whether the charges are itemized, whether the totals reconcile, and whether a fee exceeds a verified state cap. Market value stays unverified unless you optionally enter a factory window sticker MSRP. That sticker is not a live market price, and an unverified fee range is not a legal limit.",
    internalLinks: STANDARD_LINKS,
    sources: [
      "https://dmv.nebraska.gov/dvr/reg/registration-fees-and-taxes",
      "https://caredge.com/guides/car-dealer-doc-fee-by-state",
    ],
    specialNotes: null,
    dealerMessage:
      "Hi — I'm interested in a vehicle at your dealership and would like to confirm the full out-the-door price before visiting. Could you please send me an itemized breakdown showing the vehicle sale price, documentation fee, all additional dealer fees, Nebraska sales tax (5.5% + local rate), title fee ($18), and registration costs? I'd like to see the complete total. Thank you.",
    lastVerified: "2026-03",
    buyerTip: "Nebraska allows trade-in deductions that reduce the taxable purchase price. With Omaha's combined tax rate near 7% and a $20,000 trade-in, this deduction saves you $1,400 in sales tax. Confirm that your quote shows the trade-in value subtracted before the tax is calculated — not applied as a down payment after tax — since those are two very different financial outcomes.",
  },

  nevada: {
    name: "Nevada",
    abbreviation: "NV",
    slug: "nevada",
    docFeeRange: "Reported $400–$700 (not verified)",
    hasCap: false,
    metaDescription:
      "Nevada does not have a verified documentation-fee cap on file. Reported $400–$700 (not verified). Compare the itemized out-the-door price before you sign.",
    capNote:
      "Nevada does not have a verified documentation-fee cap in this file. A stored note may say dealers set the fee, but that is not a legal finding that no cap exists. Unverified reports mention documentation fees around $400–$700. That range is not a market standard. Compare itemized out-the-door quotes instead of treating one line as legal or illegal.",
    salesTaxNote:
      "Nevada charges 4.6% state sales tax on vehicle purchases, with local county additions. Reno-area buyers typically see combined rates of around 8.265%. The tax applies to the full purchase price with trade-in deductions allowed.",
    registrationNote:
      "Nevada registration includes a $33 base fee plus a value-based component calculated on approximately 35% of the vehicle's MSRP. This value-based fee can be substantial on newer or more expensive vehicles. The title fee is $28.",
    introAngle:
      "Nevada's Las Vegas and Reno markets attract a high volume of vehicle purchases. Doc fees are without a verified cap on file and tend to be on the higher end at $400–$700. The value-based registration formula, calculated on 35% of MSRP, can make first-year registration significantly more expensive than buyers expect from other states.",
    snippetAnswer:
      "Nevada does not have a verified documentation-fee cap in this file. A stored note may say dealers set the fee, but that is not a legal finding that no cap exists. Unverified reports mention documentation fees around $400–$700. That range is not a market standard. The base sales tax is 4.6% with local additions. Registration includes a value-based component calculated at 35% of MSRP.",
    watchFor: [
      "Value-based registration: Nevada's registration is tied to your vehicle's MSRP. On a $45,000 vehicle, the value-based component adds several hundred dollars on top of the $33 base. Budget for this when estimating your OTD.",
      "Doc fees without a verified cap on file: $400–$700 appears in unverified reports, and there is no verified cap on file. Compare across multiple dealers.",
      "Local tax rate variation: combined rates vary by county. Verify the rate at your specific dealer location.",
    ],
    negotiationNote:
      "Las Vegas has a highly competitive dealer market — use it to your advantage by getting multiple OTD quotes. The doc fee is without a verified cap on file and potentially negotiable. The registration and sales tax are government charges and are fixed.",
    ctaHeading: "Have a Nevada dealer quote you want to review?",
    ctaBody:
      "Paste the quote and Odigos checks whether the charges are itemized, whether the totals reconcile, and whether a fee exceeds a verified state cap. Market value stays unverified unless you optionally enter a factory window sticker MSRP. That sticker is not a live market price, and an unverified fee range is not a legal limit.",
    internalLinks: STANDARD_LINKS,
    sources: [
      "https://dmv.nv.gov/regfees.htm",
      "https://caredge.com/guides/car-dealer-doc-fee-by-state",
    ],
    specialNotes: null,
    dealerMessage:
      "Hi — I'm interested in a vehicle at your dealership and would like to confirm the full out-the-door price before visiting. Could you please send me an itemized breakdown showing the vehicle sale price, documentation fee, all additional dealer fees, Nevada sales tax (state + local for your county), title fee ($28), and registration costs (including the value-based component)? I'd like to see the complete total. Thank you.",
    lastVerified: "2026-03",
    buyerTip: "Nevada's registration includes a value-based component calculated at roughly 35% of the vehicle's MSRP. On a $50,000 new vehicle, the first-year value component alone can approach $700 on top of the base $33 fee. This decreases over time but is a major first-year cost surprise for buyers coming from flat-fee states. Ask the dealer for the estimated first-year registration total — not just the base fee — before finalizing your OTD comparison.",
  },

  "new-hampshire": {
    name: "New Hampshire",
    abbreviation: "NH",
    slug: "new-hampshire",
    docFeeRange: "Reported $300–$500 (not verified)",
    hasCap: false,
    metaDescription:
      "New Hampshire does not have a verified documentation-fee cap on file. Reported $300–$500 (not verified). Compare the itemized out-the-door price before you sign.",
    capNote:
      "New Hampshire does not have a verified documentation-fee cap in this file. A stored note may say dealers set the fee, but that is not a legal finding that no cap exists. Unverified reports mention documentation fees around $300–$500. That range is not a market standard. Compare itemized out-the-door quotes instead of treating one line as legal or illegal.",
    salesTaxNote:
      "New Hampshire has no state sales tax on vehicle purchases. There are no local sales taxes on vehicles either. This is one of the most significant buyer advantages in New Hampshire — the absence of sales tax on a $40,000 vehicle saves approximately $2,000–$2,500 compared to most states.",
    registrationNote:
      "New Hampshire registration fees are calculated based on the vehicle's value: $18 per $1,000 of value in the first two years, decreasing thereafter. The title fee increased to $37 effective January 1, 2026.",
    introAngle:
      "New Hampshire has no vehicle sales tax, which provides a significant OTD advantage. However, the documentation fee structure is unusual: a $27 state fee is capped by statute, but dealers also charge a separate without a verified cap on file 'administrative fee.' Total doc-related charges average around $459. The title fee also increased in January 2026.",
    snippetAnswer:
      "New Hampshire does not have a verified documentation-fee cap in this file. A stored note may say dealers set the fee, but that is not a legal finding that no cap exists. Unverified reports mention documentation fees around $300–$500. That range is not a market standard. New Hampshire has no vehicle sales tax.",
    watchFor: [
      "Two-part documentation fee: confirm that the quote itemizes both the $27 state fee and any dealer admin fee separately, as required by law.",
      "New title fee: the title fee increased from $25 to $37 effective January 1, 2026. Update any older OTD estimates.",
      "Registration cost: NH registration is value-based, not flat — it can be meaningful on newer vehicles.",
    ],
    negotiationNote:
      "The absence of sales tax makes New Hampshire an attractive buying state for residents of neighboring high-tax states. Dealer admin fees are without a verified cap on file and may be negotiable. Focus on the total OTD, including the value-based registration.",
    ctaHeading: "Have a New Hampshire dealer quote you want to verify?",
    ctaBody:
      "Paste the quote and Odigos checks whether the charges are itemized, whether the totals reconcile, and whether a fee exceeds a verified state cap. Market value stays unverified unless you optionally enter a factory window sticker MSRP. That sticker is not a live market price, and an unverified fee range is not a legal limit.",
    internalLinks: STANDARD_LINKS,
    sources: [
      "https://www.banking.nh.gov/rsa-361-faq",
      "https://caredge.com/guides/car-dealer-doc-fee-by-state",
    ],
    specialNotes:
      "Two-part fee structure: (1) $27 state doc fee (capped by statute), (2) Dealer admin fee (without a verified cap on file, must be itemized). Total fees average $459. Title fee increased to $37 effective Jan 1, 2026.",
    dealerMessage:
      "Hi — I'm interested in a vehicle at your dealership and would like to confirm the full out-the-door price before visiting. Could you please send me an itemized breakdown showing the vehicle sale price, the $27 state documentation fee, any additional dealer administrative fee (itemized separately), all other dealer fees, title fee ($37), and registration costs (value-based)? New Hampshire has no sales tax, so please confirm no sales tax is included. I'd like to see the complete total. Thank you.",
    lastVerified: "2026-03",
    buyerTip: "New Hampshire's two-part documentation fee structure is unique: a $27 state-mandated fee capped by RSA 361-A, plus a separate dealer 'administrative fee' that is without a verified cap on file. By statute, these must be itemized separately on the quote. If a dealer shows only one bundled 'doc fee' without splitting these, ask for the statutory and dealer portions to be shown separately. This distinction matters because the $27 portion is fixed but the admin fee is negotiable.",
  },

  "new-jersey": {
    name: "New Jersey",
    abbreviation: "NJ",
    slug: "new-jersey",
    docFeeRange: "Reported $200–$900 (not verified)",
    hasCap: false,
    metaDescription:
      "New Jersey does not have a verified documentation-fee cap on file. Reported $200–$900 (not verified). Compare the itemized out-the-door price before you sign.",
    capNote:
      "New Jersey does not have a verified documentation-fee cap in this file. A stored note may say dealers set the fee, but that is not a legal finding that no cap exists. Unverified reports mention documentation fees around $200–$900. That range is not a market standard. Compare itemized out-the-door quotes instead of treating one line as legal or illegal.",
    salesTaxNote:
      "New Jersey charges 6.625% sales tax on vehicle purchases statewide, with one exception: Millville's rate is 8.625%. There are no other local additions. Trade-in deductions are allowed.",
    registrationNote:
      "New Jersey registration fees vary by vehicle type and weight. Electric vehicles are subject to a $260 ZEV fee in 2026. Title fee is $60, or $85 if you're financing (title with lien).",
    introAngle:
      "New Jersey does not have a verified doc-fee cap on file, and fees vary exceptionally widely — from $200 to $900 — across the state's dealer network. The 6.625% statewide sales tax is straightforward with minimal local variation. Buyers financing a vehicle should note the $85 title fee (lien) vs. $60 for cash purchases.",
    snippetAnswer:
      "New Jersey does not have a verified documentation-fee cap in this file. A stored note may say dealers set the fee, but that is not a legal finding that no cap exists. Unverified reports mention documentation fees around $200–$900. That range is not a market standard. State sales tax is 6.625%.",
    watchFor: [
      "Wide doc fee range: fees vary from $200 to $900 at New Jersey dealerships with no verified cap on file. Always get the doc fee disclosed before visiting and compare across dealers.",
      "Lien vs. cash title fee: if you're financing, the title fee is $85. If paying cash, it's $60. Make sure your quote reflects the correct amount.",
      "EV registration surcharge: electric vehicle buyers pay an additional $260 ZEV fee in 2026.",
    ],
    negotiationNote:
      "New Jersey's dense dealer market — particularly in North Jersey near the NYC metro — creates real competitive pressure. Use multiple competing OTD quotes as leverage. The wide doc fee range (up to $900) means there's meaningful savings potential by shopping around.",
    ctaHeading: "Have a New Jersey dealer quote you want to review?",
    ctaBody:
      "Paste the quote and Odigos checks whether the charges are itemized, whether the totals reconcile, and whether a fee exceeds a verified state cap. Market value stays unverified unless you optionally enter a factory window sticker MSRP. That sticker is not a live market price, and an unverified fee range is not a legal limit.",
    internalLinks: STANDARD_LINKS,
    sources: [
      "https://www.nj.gov/mvc/vehicles/regfees.htm",
    ],
    specialNotes:
      "Title with lien: $85.",
    dealerMessage:
      "Hi — I'm interested in a vehicle at your dealership and would like to confirm the full out-the-door price before visiting. Could you please send me an itemized breakdown showing the vehicle sale price, documentation fee, all additional dealer fees, New Jersey sales tax (6.625%), title fee ($60 cash or $85 financed), and registration costs? I'd like to see the complete total. Thank you.",
    lastVerified: "2026-03",
    commonQuestions: [
      {
        q: "Is there a cap on dealer doc fees in New Jersey?",
        a: "No. New Jersey has no verified state-imposed cap in this file on dealer documentation fees. Unverified reports mention fees from $200 to $900. That range is not a market standard. Because this file does not verify a legal limit, the doc fee is one of the most variable line items in an NJ dealer quote — always ask for it upfront and compare across dealers.",
      },
      {
        q: "What is the sales tax on a car in New Jersey?",
        a: "New Jersey charges a flat 6.625% sales tax on vehicle purchases statewide. Unlike most states, there are virtually no local additions — except in the Salem County Urban Enterprise Zone city of Millville, where the rate is 3.3125% (half the standard rate). Trade-in deductions are allowed, so you pay tax on the net price after trade-in.",
      },
      {
        q: "Does New Jersey allow a trade-in tax credit?",
        a: "Yes. New Jersey allows the trade-in value to reduce the taxable purchase price. If you're buying a $35,000 vehicle and trading in one worth $12,000, you pay the 6.625% sales tax on $23,000 — saving you roughly $795 in tax. Make sure the dealer applies this deduction before calculating your tax line.",
      },
      {
        q: "What is the title fee in New Jersey for financed vehicles?",
        a: "New Jersey charges $60 for a standard title or $85 for a title with a lien (i.e., you're financing the vehicle). If you're paying cash, the title fee is $60. This is a fixed government fee — not negotiable, but make sure the correct amount appears on your quote based on how you're paying.",
      },
      {
        q: "Do New Jersey EV buyers pay extra fees?",
        a: "Yes. As of 2026, New Jersey electric vehicle buyers pay a $260 annual Zero Emission Vehicle (ZEV) fee in addition to standard registration costs. This replaces the gas tax revenue the state loses from EV drivers. Factor this into your annual ownership cost when comparing EVs to gas vehicles in NJ.",
      },
    ],
    competitorGapSection:
      "Most NJ car-buying guides list the 6.625% tax rate and move on — but they miss the doc fee story. New Jersey's $200–$900 range is one of the widest in the country for an without a verified cap on file state. The real savings opportunity isn't the tax (which is flat statewide) — it's shopping the doc fee across North Jersey's dense dealer corridor. Two dealers 10 minutes apart can differ by $500+ on the doc fee alone. Get 3 itemized OTD quotes before committing, and use the doc fee gap as your primary negotiation lever.",
    pageTitle: "New Jersey Dealer Fees (2026): Cap Not Verified — Compare the Out-the-Door Price",
    buyerTip: "New Jersey's doc fee range ($200–$900) is one of the widest in the country for an without a verified cap on file state. That $700 spread is a real difference, and it exists between dealers in the same city. Before visiting any New Jersey dealership, call or email ahead and ask for their current documentation fee — many dealers will disclose it over the phone. Use competing fee disclosures as a direct comparison tool before you commit to visiting.",
  },

  "new-mexico": {
    name: "New Mexico",
    abbreviation: "NM",
    slug: "new-mexico",
    docFeeRange: "Reported $200–$400 (not verified)",
    hasCap: false,
    pageTitle: "New Mexico Dealer Fees (2026): Doc Fee Rules & What's Negotiable",
    metaDescription:
      "New Mexico does not have a verified documentation-fee cap on file. Reported $200–$400 (not verified). Compare the itemized out-the-door price before you sign.",
    capNote:
      "New Mexico does not have a verified documentation-fee cap in this file. A stored note may say dealers set the fee, but that is not a legal finding that no cap exists. Unverified reports mention documentation fees around $200–$400. That range is not a market standard. Compare itemized out-the-door quotes instead of treating one line as legal or illegal.",
    salesTaxNote:
      "New Mexico has a unique dual-tax structure: a 4% Motor Vehicle Excise Tax (MVET) on the vehicle purchase price, plus a Gross Receipts Tax (GRT) that functions like a sales tax on the dealer's gross receipts. The GRT base is 5.125% with local additions up to 4.315%, reaching combined rates near 9.44% in some areas. Buyers should clarify which taxes appear on their quote.",
    registrationNote:
      "New Mexico registration fees range from $27 to $62 per year based on vehicle weight and age. The title fee is $20.",
    introAngle:
      "New Mexico has an unusually complex tax structure for vehicle purchases — both a Motor Vehicle Excise Tax and a Gross Receipts Tax may apply. Understanding which charges appear on your quote and why is important to accurately evaluating your OTD total. Doc fees are without a verified cap on file and in a moderate range.",
    snippetAnswer:
      "New Mexico does not have a verified documentation-fee cap in this file. A stored note may say dealers set the fee, but that is not a legal finding that no cap exists. Unverified reports mention documentation fees around $200–$400. That range is not a market standard. The state applies both a 4% Motor Vehicle Excise Tax and a Gross Receipts Tax (GRT, up to 9.44% combined) on vehicle transactions. Confirm which taxes are itemized on your quote.",
    watchFor: [
      "Dual tax structure: New Mexico uses both MVET and GRT. Make sure your quote clearly itemizes which taxes apply and at what rates.",
      "Local GRT additions: combined GRT rates vary by location and can reach 9.44% in some areas. Know the rate for your dealer's location.",
      "Doc fees without a verified cap on file: ask for the fee before visiting and compare across dealers.",
    ],
    negotiationNote:
      "New Mexico's market is less competitive outside Albuquerque. Get multiple quotes and ask for the tax structure to be explained in detail. The dual tax structure makes comparing OTD quotes across state lines more complex than usual.",
    ctaHeading: "Have a New Mexico dealer quote?",
    ctaBody:
      "Paste the quote and Odigos checks whether the charges are itemized, whether the totals reconcile, and whether a fee exceeds a verified state cap. Market value stays unverified unless you optionally enter a factory window sticker MSRP. That sticker is not a live market price, and an unverified fee range is not a legal limit.",
    ctaTopBody:
      "Have a New Mexico dealer quote? Paste it here — Odigos checks whether the charges are itemized and whether the total reconciles. It does not score the vehicle's market value.",
    ctaMidBody:
      "Not sure if your New Mexico dealer's charges are normal?",
    ctaMidLink: "Check My NM Quote",
    ctaBottomHeadline: "Ask for an itemized out-the-door price before you sign.",
    ctaBottomBody:
      "Paste your quote and let Odigos check the math and the line items. An unverified fee figure is not treated as a legal limit.",
    ctaBottomButton: "Check My NM Quote Free",
    internalLinks: STANDARD_LINKS,
    sources: [
      "https://www.mvd.newmexico.gov/vehicles/vehicle-registration/",
    ],
    specialNotes:
      "New Mexico uses both a Motor Vehicle Excise Tax and a Gross Receipts Tax — verify which applies to your transaction.",
    dealerMessage:
      "Hi — I'm interested in a vehicle at your dealership and would like to confirm the full out-the-door price before visiting. Could you please send me an itemized breakdown showing the vehicle sale price, documentation fee, all additional dealer fees, New Mexico Motor Vehicle Excise Tax (4%), any Gross Receipts Tax (please show rate for your location), title fee ($20), and registration costs? I'd like to see the complete total and which taxes apply to my purchase. Thank you.",
    lastVerified: "2026-03",
    buyerTip: "New Mexico's dual-tax structure (4% Motor Vehicle Excise Tax plus a Gross Receipts Tax) is unusually complex and can result in two separate tax line items appearing on a vehicle quote. Confirm with the dealer exactly which taxes apply to your specific transaction and at what rates — then verify those rates against the New Mexico MVD and Tax & Revenue Department websites before signing. Misapplied rates are more common here than in states with simpler tax structures.",
  },

  "new-york": {
    name: "New York",
    abbreviation: "NY",
    slug: "new-york",
    docFeeRange: "Reported $175 (not verified)",
    hasCap: true,
    pageTitle: "New York Dealer Doc Fee (2026): Verified $175 Ceiling",
    h1: "New York Dealer Doc Fee (2026): Verified $175 Ceiling",
    metaDescription:
      "New York documentation fee: verified ceiling $175 under 15 NYCRR § 78.19(c)(2). Reported $175 (not verified). Compare the itemized out-the-door price before you sign.",
    capNote:
      "15 NYCRR § 78.19(c)(2) says the fee a New York dealer charges for assisting with registration and/or title may not exceed $175. The fetched DMV pages do not state an effective date. Odigos can flag a documentation fee above that verified ceiling. Unverified reports mention documentation fees around $175. That range is not a market standard. Compare the itemized out-the-door price.",
    salesTaxNote:
      "New York has a 4% state sales tax on vehicles, but local county and city taxes add significantly. New York City buyers pay a combined rate of 8.875% (4% state + 4.5% NYC + 0.375% MTA). Buyers in suburban counties typically see 7%–8.5% combined rates. Upstate buyers in lower-tax counties may see 6%–7%. The combined rate varies more than buyers usually expect.",
    registrationNote:
      "New York registration fees are calculated on a schedule based on the vehicle's weight. A standard passenger car typically runs $26–$140 in base registration depending on weight, plus a title fee of around $50. NYC buyers also pay an additional Metropolitan Commuter Transportation District (MCTD) surcharge. Total first-year registration and title costs often run $200–$400 depending on vehicle and location.",
    introAngle:
      "New York's verified ceiling on the dealer registration and title assistance fee is $175 under 15 NYCRR § 78.19(c)(2). The fetched DMV pages do not state an effective date. Buyers may still pay more through additional fees, add-ons, or bundled charges.",
    snippetAnswer:
      "15 NYCRR § 78.19(c)(2) says a New York dealer fee for assisting with registration and/or title may not exceed $175. Unverified reports mention documentation fees around $175. That range is not a market standard.",
    watchFor: [
      "NYC combined tax rate: buyers purchasing in New York City pay 8.875% combined — one of the highest effective vehicle sales tax rates in the country. On a $35,000 vehicle, that's $3,106 in tax. Buyers who don't account for this are often surprised at the OTD total.",
      "MCTD surcharge on registration: buyers in the Metropolitan Commuter Transportation District (which includes NYC and several surrounding counties) pay an additional surcharge on their registration.",
      "Dealer add-ons on NYC-area inventory: dealerships in the greater New York area frequently pre-install protection packages and window tinting on inventory. These are presented as standard but are generally negotiable in price.",
      "Dealer prep and reconditioning fees: some New York dealers add preparation or reconditioning fees outside the standard doc fee. These aren't government charges — ask for each fee to be named and explained individually.",
    ],
    negotiationNote:
      "New York's verified $175 ceiling under 15 NYCRR § 78.19(c)(2) is a hard limit on the registration and title assistance fee. A higher documentation fee is the kind of charge Odigos can flag. The main negotiation pressure beyond that fee is the vehicle price and add-ons. NYC buyers pay 8.875% combined tax (4% state + 4.5% NYC + 0.375% MTA), making the pre-tax negotiation especially important: every $1,000 off the sale price saves $88.75 in NYC tax. New York does allow trade-in credits, which reduce the taxable amount. The dense metro dealer market means multiple dealers within driving distance sell the same vehicle — use competing OTD quotes as leverage.",
    ctaHeading: "Have a New York dealer quote?",
    ctaBody:
      "Paste the quote and Odigos checks whether the charges are itemized, whether the totals reconcile, and whether a fee exceeds a verified state cap. Market value stays unverified unless you optionally enter a factory window sticker MSRP. That sticker is not a live market price, and an unverified fee range is not a legal limit.",
    ctaTopBody:
      "Have a New York dealer quote? Paste it here. Odigos checks the line items, the math, and the verified $175 ceiling. Market value stays unverified unless you add a factory window sticker MSRP.",
    ctaMidBody:
      "A New York documentation fee above $175 exceeds the verified ceiling in 15 NYCRR § 78.19(c)(2). Ask the dealer to itemize it.",
    ctaMidLink: "Check My NY Quote",
    ctaBottomBody:
      "Paste the quote and Odigos checks whether the charges are itemized, whether the totals reconcile, and whether a fee exceeds a verified state cap. Market value stays unverified unless you optionally enter a factory window sticker MSRP. That sticker is not a live market price, and an unverified fee range is not a legal limit.",
    ctaBottomButton: "Check My Quote Free",
    internalLinks: [
      ...STANDARD_LINKS,
      { href: "/out-the-door-price-vs-monthly-payment", label: "OTD price vs. monthly payment" },
    ],
    sources: [
      "https://dmv.ny.gov/registration/sales-tax-information",
    ],
    specialNotes:
      "15 NYCRR § 78.19(c)(2): the dealer fee for assisting with registration and/or title may not exceed $175. The fetched DMV pages do not state an effective date.",
    dealerMessage:
      "Hi — I'm interested in a vehicle at your dealership and would like to confirm the full out-the-door price before visiting. Could you please send me an itemized breakdown showing the vehicle sale price, documentation fee (New York caps this at $175), all additional dealer fees, New York sales tax (state + local rate for your county/city), title fee ($50), and registration costs? I'd like to see the complete total. Thank you.",
    lastVerified: "2026-03",
    commonQuestions: [
      {
        q: "What is the New York doc fee cap in 2026?",
        a: "15 NYCRR § 78.19(c)(2) says the dealer fee for assisting with registration and/or title may not exceed $175. The fetched DMV pages do not state an effective date. A documentation fee above $175 exceeds that verified ceiling.",
      },
      {
        q: "How much is sales tax on a car in New York City?",
        a: "New York City buyers pay a combined vehicle sales tax rate of 8.875% — 4% state, 4.5% NYC, and 0.375% MTA surcharge. On a $35,000 vehicle, that equals $3,106 in sales tax alone. Buyers in suburbs or upstate counties pay lower combined rates, often 6–7.5%.",
      },
      {
        q: "Is the doc fee the same at every New York dealership?",
        a: "Not necessarily. The verified ceiling is $175, and a dealer can charge less. A documentation fee above $175 exceeds 15 NYCRR § 78.19(c)(2). Ask for the fee as its own line.",
      },
      {
        q: "What is the MCTD surcharge on New York vehicle registration?",
        a: "The Metropolitan Commuter Transportation District surcharge is an additional registration fee for buyers in New York City and several surrounding counties (Westchester, Rockland, Nassau, Suffolk, Putnam, Orange, Dutchess). It appears as a line item on registration costs and is a government fee, not a dealer charge.",
      },
      {
        q: "Are dealer add-ons negotiable at New York dealers?",
        a: "Yes. Pre-installed protection packages, paint sealant, and window tinting appear on many New York metro dealer invoices. These are dealer-imposed charges, not required by state law, and are often negotiable in price even when presented as standard on the vehicle.",
      },
    ],
    competitorGapSection:
      "Most New York car-buying guides focus on the $175 doc fee cap without addressing the tax rate gap between NYC and upstate markets. The practical implication: a buyer in New York City purchasing a $40,000 vehicle pays roughly $3,550 in sales tax. The same buyer in a rural upstate county paying 6.5% pays $2,600 — a $950 difference. If you're buying near a county line, confirming which jurisdiction's rate applies to your dealer's location is worth a few minutes. Ask the dealer to confirm the applicable sales tax rate and county before agreeing to any price.",
    buyerTip: "New York City buyers pay an 8.875% combined sales tax (4% state + 4.5% NYC + 0.375% MTA), but dealers in nearby counties can be in dramatically different tax districts. A dealership in Westchester County might charge 7.375%, while one in a lower-tax upstate county charges 6.5%. If you can purchase in a neighboring county and still take delivery at a convenient location, the tax savings on a $40,000 vehicle can exceed $950. The New York DMV's sales tax lookup tool shows the exact rate for any dealer's address.",
  },

  "north-carolina": {
    name: "North Carolina",
    abbreviation: "NC",
    slug: "north-carolina",
    docFeeRange: "Reported $500–$800 (not verified)",
    hasCap: false,
    metaDescription:
      "North Carolina does not have a verified documentation-fee cap on file. Reported $500–$800 (not verified). Compare the itemized out-the-door price before you sign.",
    capNote:
      "North Carolina does not have a verified documentation-fee cap in this file. A stored note may say dealers set the fee, but that is not a legal finding that no cap exists. Unverified reports mention documentation fees around $500–$800. That range is not a market standard. Compare itemized out-the-door quotes instead of treating one line as legal or illegal.",
    salesTaxNote:
      "North Carolina uses a 3% Highway Use Tax (HUT) rather than traditional sales tax for vehicle purchases. This is a flat statewide rate with no local additions — making the tax portion of your OTD straightforward to calculate. The HUT applies to the vehicle purchase price with trade-in deductions allowed for dealer transactions.",
    registrationNote:
      "North Carolina registration is $46.25 per year (effective July 1, 2024). The title fee is $56.",
    introAngle:
      "North Carolina is one of a few states that uses a Highway Use Tax instead of traditional sales tax for vehicles. At 3%, it's one of the lower vehicle transfer tax rates in the country. However, doc fees are without a verified cap on file and tend to be relatively high at $500–$800 — which can offset the tax advantage for buyers who don't compare carefully.",
    snippetAnswer:
      "North Carolina does not have a verified documentation-fee cap in this file. A stored note may say dealers set the fee, but that is not a legal finding that no cap exists. Unverified reports mention documentation fees around $500–$800. That range is not a market standard. North Carolina uses a 3% Highway Use Tax (no local additions) instead of sales tax. The registration is $46.25/year.",
    watchFor: [
      "Documentation fees with no verified cap on file: $500–$800 appears in unverified reports, and there is no verified cap on file. The HUT advantage (3% vs. higher rates elsewhere) can be eroded by a high doc fee. Compare total OTD quotes.",
      "Highway Use Tax at titling: the HUT is typically collected at the DMV when you title the vehicle, not at the dealership. Clarify how your dealer is handling this in the quote.",
      "Title fee: at $56, North Carolina's title fee is higher than many states. Make sure it's included in your OTD estimate.",
    ],
    negotiationNote:
      "North Carolina's 3% Highway Use Tax is one of the lowest vehicle transfer rates nationally — saving buyers roughly $1,000+ compared to states with 6–7% rates on a $35,000 vehicle. Unverified reports mention documentation fees around $550 and up to $800. Those figures are not a market standard, and they can offset the tax advantage if they show up on your quote. Charlotte and Raleigh-Durham have competitive dealer networks — ask three dealers for OTD quotes and you'll likely see $200+ variation in doc fees alone. The fee is without a verified cap on file and potentially negotiable. The $56 title fee is on the higher side.",
    ctaHeading: "Have a North Carolina dealer quote you want to verify?",
    ctaBody:
      "Paste the quote and Odigos checks whether the charges are itemized, whether the totals reconcile, and whether a fee exceeds a verified state cap. Market value stays unverified unless you optionally enter a factory window sticker MSRP. That sticker is not a live market price, and an unverified fee range is not a legal limit.",
    internalLinks: STANDARD_LINKS,
    sources: [
      "https://www.ncdot.gov/dmv/title-registration/taxes/Pages/default.aspx",
    ],
    specialNotes:
      "NC uses Highway Use Tax instead of sales tax for vehicles. Relatively low at 3%.",
    dealerMessage:
      "Hi — I'm interested in a vehicle at your dealership and would like to confirm the full out-the-door price before visiting. Could you please send me an itemized breakdown showing the vehicle sale price, documentation fee (I understand NC has no verified cap on file), all additional dealer fees, North Carolina Highway Use Tax (3% — please show any trade-in deduction applied before calculating), title fee ($56), and registration ($46.25/year)? I'd like to see the complete itemized total. Thank you.",
    lastVerified: "2026-03",
    commonQuestions: [
      {
        q: "What is the North Carolina Highway Use Tax?",
        a: "North Carolina uses a 3% Highway Use Tax (HUT) instead of traditional sales tax for vehicle purchases. The HUT is a flat rate with no local additions — one of the lowest vehicle transfer tax rates in the country. It's typically collected at the DMV when you title the vehicle.",
      },
      {
        q: "Does North Carolina allow a trade-in credit?",
        a: "Yes, but only for dealer transactions. If you trade in a vehicle at a dealership, the trade-in value reduces the price subject to the 3% Highway Use Tax. Private-party sales do not qualify for the trade-in deduction.",
      },
      {
        q: "Why are North Carolina doc fees so high?",
        a: "North Carolina does not have a verified documentation-fee cap on file. Unverified reports mention fees of $500–$800. That range is not a market standard or a legal ceiling. Compare itemized out-the-door quotes. The low 3% HUT sometimes leads dealers to position higher doc fees as offsetting the tax savings.",
      },
      {
        q: "How much is North Carolina registration and title?",
        a: "North Carolina registration is $46.25 per year (effective July 1, 2024). The title fee is $56 — higher than most states. Together these add about $102 to your first-year ownership costs beyond the vehicle price and tax.",
      },
    ],
    competitorGapSection:
      "Most North Carolina guides highlight the favorable 3% Highway Use Tax but don't connect it to the doc fee picture. The low tax rate ($1,200 on a $40,000 vehicle vs. $2,500+ in many other states) saves buyers money — but documentation fees in unverified reports ($500–$800) can absorb some of that savings. No cap is verified. On a $40,000 vehicle, a buyer paying a $799 doc fee in NC versus a lower documentation fee elsewhere changes the comparison. New York's stored $175 figure is not a verified cap. Compare total OTD costs, not just the tax rate. Charlotte and Raleigh-Durham have enough competing dealers that shopping across 3–4 stores usually produces meaningful doc fee variation.",
    buyerTip: "North Carolina's 3% Highway Use Tax is one of the lower vehicle transfer tax rates in the country — but unverified reports mention documentation fees of $500–$800, and no cap is verified, which can offset much of that advantage. On a $40,000 vehicle, the HUT saves roughly $1,200 compared to a 6% state (like Virginia). But if the North Carolina dealer charges $750 in doc fees versus $200 elsewhere, the savings narrow considerably. Always compare total OTD including both the HUT and the doc fee to get the real picture.",
  },

  "north-dakota": {
    name: "North Dakota",
    abbreviation: "ND",
    slug: "north-dakota",
    docFeeRange: "Reported $100–$250 (not verified)",
    hasCap: false,
    metaDescription:
      "North Dakota does not have a verified documentation-fee cap on file. Reported $100–$250 (not verified). Compare the itemized out-the-door price before you sign.",
    capNote:
      "North Dakota does not have a verified documentation-fee cap in this file. A stored note may say dealers set the fee, but that is not a legal finding that no cap exists. Unverified reports mention documentation fees around $100–$250. That range is not a market standard. Compare itemized out-the-door quotes instead of treating one line as legal or illegal.",
    salesTaxNote:
      "North Dakota charges a 5% vehicle excise tax on vehicle purchases statewide. There are no local additions for vehicles — the rate is flat. Trade-in deductions are allowed.",
    registrationNote:
      "North Dakota registration fees vary by vehicle age and weight. The title fee is $5 — one of the lowest in the country.",
    introAngle:
      "North Dakota has some of the lowest documentation fees in the country for an without a verified cap on file state — typically $100–$250. Combined with a flat 5% excise tax and a $5 title fee, North Dakota offers a relatively low-cost OTD environment. The main variable is the vehicle price itself.",
    snippetAnswer:
      "North Dakota does not have a verified documentation-fee cap in this file. A stored note may say dealers set the fee, but that is not a legal finding that no cap exists. Unverified reports mention documentation fees around $100–$250. That range is not a market standard. The vehicle excise tax is a flat 5% with no local additions.",
    watchFor: [
      "Low fee environment: North Dakota's costs are lower than most states, but fees can still vary between dealers. Compare quotes.",
      "Limited dealer competition: outside Fargo and Bismarck, options are limited. Get multiple quotes before committing.",
      "Trade-in credit: confirm that any trade-in value is properly deducted from the taxable amount before the 5% excise tax is calculated.",
    ],
    negotiationNote:
      "North Dakota's market is smaller than most states, but Fargo and Bismarck offer some competitive dealer options. The fee environment is generally favorable — focus negotiation on the vehicle price.",
    ctaHeading: "Have a North Dakota dealer quote you want to review?",
    ctaBody:
      "Paste the quote and Odigos checks whether the charges are itemized, whether the totals reconcile, and whether a fee exceeds a verified state cap. Market value stays unverified unless you optionally enter a factory window sticker MSRP. That sticker is not a live market price, and an unverified fee range is not a legal limit.",
    internalLinks: STANDARD_LINKS,
    sources: [
      "https://www.dot.nd.gov/motor-vehicle",
      "https://caredge.com/guides/car-dealer-doc-fee-by-state",
    ],
    specialNotes: null,
    dealerMessage:
      "Hi — I'm interested in a vehicle at your dealership and would like to confirm the full out-the-door price before visiting. Could you please send me an itemized breakdown showing the vehicle sale price, documentation fee, all additional dealer fees, North Dakota vehicle excise tax (5%), title fee ($5), and registration costs? I'd like to see the complete total. Thank you.",
    lastVerified: "2026-03",
    buyerTip: "North Dakota's $5 title fee is one of the lowest in the country — compare that to Maryland's $200 or Wisconsin's $215. The state's doc fees ($100–$250) are also among the lowest where no cap is verified, driven largely by competitive pressure in a small market. For North Dakota buyers, the main OTD variable is the vehicle price itself, since both fees and taxes are relatively predictable and low.",
  },

  ohio: {
    name: "Ohio",
    abbreviation: "OH",
    slug: "ohio",
    docFeeRange: "Reported $200–$387 (not verified)",
    hasCap: true,
    pageTitle: "Ohio Dealer Doc Fee: Verified $398 Ceiling (2026) — Full Fee Breakdown",
    metaDescription:
      "Ohio documentation fee: verified ceiling $398. Reported $200–$387 (not verified). Compare the itemized out-the-door price before you sign.",
    capNote:
      "Ohio's verified documentary service charge ceiling is $398 for calendar year 2026 under ORC § 4517.261. The state's note also describes a 10% cash-price limit. The fetched page quoted here supports the $398 ceiling. Unverified reports mention documentation fees around $200–$387. That range is not a market standard. Compare the itemized out-the-door price. A lower documentation fee with a higher vehicle price is not automatically a better deal.",
    salesTaxNote:
      "Ohio charges 5.75% state sales tax on vehicles, with county additions up to 2.5%. Combined rates range from 5.8% to 8.25% depending on the county. Trade-in deductions are allowed for new vehicle purchases.",
    registrationNote:
      "Ohio registration fees vary by vehicle type. A service fee increase of $5 (now $8) took effect January 1, 2026. The title fee also increased by $3 effective January 1, 2026.",
    introAngle:
      "Ohio's doc fee cap has an important nuance: it's the lesser of $398 or 10% of the vehicle's cash price. For most vehicle purchases above $3,980, the $398 flat limit applies. Ohio also saw a title fee increase in January 2026. The county-level sales tax variation means buyers should verify their specific county's rate.",
    snippetAnswer:
      "Ohio's verified documentary service charge ceiling is $398 for calendar year 2026 under ORC § 4517.261. The state's note also describes a 10% cash-price limit. Unverified reports mention documentation fees around $200–$387. That range is not a market standard. State sales tax is 5.75% with county additions up to 8.25% combined.",
    watchFor: [
      "10% cap on lower-priced vehicles: for vehicles priced under $3,980, the 10% rule is more restrictive than the $398 flat cap. Used vehicle buyers should confirm which limit applies.",
      "County sales tax variation: Ohio's combined rates range from 5.8% to 8.25% by county. Verify the rate for your dealer's county before estimating your OTD.",
      "Recent title fee increase: the title fee increased $3 effective January 1, 2026. Update any older OTD estimates.",
    ],
    negotiationNote:
      "Ohio's three major metros — Columbus (7.5% combined tax), Cleveland/Cuyahoga County (8%), and Cincinnati/Hamilton County (7.8%) — have competitive dealer markets. The verified ceiling in this file is $398 for 2026. A 10% cash-price limit is also described in the state's note; confirm that part before you rely on it. Your negotiation still focuses on the vehicle price and add-ons. The trade-in credit for new vehicle purchases can meaningfully reduce your tax — on a $15,000 trade-in at 8% in Cuyahoga County, that saves $1,200.",
    ctaHeading: "Have an Ohio dealer quote you want to review?",
    ctaBody:
      "Paste the quote and Odigos checks whether the charges are itemized, whether the totals reconcile, and whether a fee exceeds a verified state cap. Market value stays unverified unless you optionally enter a factory window sticker MSRP. That sticker is not a live market price, and an unverified fee range is not a legal limit.",
    internalLinks: STANDARD_LINKS,
    sources: [
      "https://www.bmv.ohio.gov/doc-fees.aspx",
    ],
    specialNotes:
      "Cap is $398 OR 10% of cash price, whichever is LOWER. Title fee increase of $3 effective Jan 1, 2026.",
    dealerMessage:
      "Hi — I'm interested in a vehicle at your dealership and would like to confirm the full out-the-door price before visiting. Could you please send me an itemized breakdown showing the vehicle sale price, documentation fee (Ohio caps this at $398 or 10% of the cash price, whichever is lower), all additional dealer fees, Ohio sales tax (5.75% state + your county rate — please confirm the combined rate), title fee ($18 + the $3 increase effective Jan 2026), and registration costs (including the new $8 service fee)? If I'm buying new with a trade-in, please show the deduction applied. I'd like to see the complete itemized total. Thank you.",
    lastVerified: "2026-03",
    commonQuestions: [
      {
        q: "What is the Ohio doc fee cap?",
        a: "Ohio caps dealer documentation fees at $398 OR 10% of the vehicle's cash price, whichever is lower (Ohio Revised Code section 4517.261). For most vehicles above $3,980, the $398 flat cap applies. For cheaper used vehicles, the 10% formula is more restrictive.",
      },
      {
        q: "How much does Ohio sales tax vary by county?",
        a: "Ohio's state base rate is 5.75%, but county additions of up to 2.5% bring combined rates from 5.8% to 8.25%. Cuyahoga County (Cleveland) is at 8%, Franklin County (Columbus) is at 7.5%, and Hamilton County (Cincinnati) is at 7.8%. The county rate is based on the dealer's location, not your home address.",
      },
      {
        q: "Does Ohio allow a trade-in credit?",
        a: "Yes, but only for new vehicle purchases. If you're buying a new vehicle and trading in your old one, the trade-in value reduces the taxable purchase price. Used vehicle purchases do not qualify for the trade-in credit in Ohio.",
      },
      {
        q: "What changed with Ohio fees in 2026?",
        a: "Effective January 1, 2026, Ohio increased the BMV service fee by $5 (now $8) and the title fee by $3. These are small but real additions to your OTD total that older references may not reflect.",
      },
    ],
    competitorGapSection:
      "Most Ohio guides cite the $398 doc fee cap without explaining the 10% alternative formula. For used vehicle buyers, this matters: on a $3,000 used car, the max doc fee is $300 (10% of $3,000), not $398. On a $2,000 vehicle, it's $200. Used car shoppers in Ohio should calculate 10% of their purchase price to know their actual cap. Also commonly overlooked: the trade-in credit applies only to new vehicles in Ohio. If you're buying used with a trade-in, the full purchase price is taxed — a meaningful difference that changes the OTD math.",
    buyerTip: "Ohio's verified documentary service charge ceiling in this file is $398 for 2026. The state's note also describes a 10% cash-price limit. The fetched page supports the $398 ceiling. Confirm the percentage with the Dealer Board before you rely on it, especially on a low-priced used car.",
  },

  oklahoma: {
    name: "Oklahoma",
    abbreviation: "OK",
    slug: "oklahoma",
    docFeeRange: "Reported $200–$400 (not verified)",
    hasCap: false,
    metaDescription:
      "Oklahoma does not have a verified documentation-fee cap on file. Reported $200–$400 (not verified). Compare the itemized out-the-door price before you sign.",
    capNote:
      "Oklahoma does not have a verified documentation-fee cap in this file. A stored note may say dealers set the fee, but that is not a legal finding that no cap exists. Unverified reports mention documentation fees around $200–$400. That range is not a market standard. Compare itemized out-the-door quotes instead of treating one line as legal or illegal.",
    salesTaxNote:
      "Oklahoma charges a combined vehicle tax of 4.5% — consisting of a 1.25% state sales tax plus a 3.25% excise tax on new vehicles. There are no local additions for vehicle purchases, making the effective rate flat statewide.",
    registrationNote:
      "Oklahoma registration is $96 for vehicles in their first through fourth year, decreasing with vehicle age. The title fee is $11.",
    introAngle:
      "Oklahoma has a simple, flat vehicle tax structure: 4.5% combined (1.25% sales + 3.25% excise) with no local additions. Doc fees are without a verified cap on file but tend to be moderate. The predictable tax rate makes OTD estimation easier than in many other states.",
    snippetAnswer:
      "Oklahoma does not have a verified documentation-fee cap in this file. A stored note may say dealers set the fee, but that is not a legal finding that no cap exists. Unverified reports mention documentation fees around $200–$400. That range is not a market standard. The combined vehicle tax is a flat 4.5% (1.25% sales + 3.25% excise) statewide with no local additions.",
    watchFor: [
      "Combined tax components: make sure your quote shows both the sales tax (1.25%) and excise tax (3.25%) components, or their correct combined total of 4.5%.",
      "Doc fees without a verified cap on file: $200–$400 appears in unverified reports, and there is no verified cap on file. Ask for the fee before visiting.",
      "Registration by age: Oklahoma's registration decreases as the vehicle ages — used vehicles cost less to register annually.",
    ],
    negotiationNote:
      "Oklahoma City and Tulsa have competitive dealer markets. The flat 4.5% tax makes OTD comparisons straightforward. Focus negotiation on the vehicle price and the documentation fee (no verified cap on file).",
    ctaHeading: "Have an Oklahoma dealer quote you want to verify?",
    ctaBody:
      "Paste the quote and Odigos checks whether the charges are itemized, whether the totals reconcile, and whether a fee exceeds a verified state cap. Market value stays unverified unless you optionally enter a factory window sticker MSRP. That sticker is not a live market price, and an unverified fee range is not a legal limit.",
    internalLinks: STANDARD_LINKS,
    sources: [
      "https://oklahoma.gov/service/all-services/auto-vehicle/fees.html",
      "https://caredge.com/guides/car-dealer-doc-fee-by-state",
    ],
    specialNotes: null,
    dealerMessage:
      "Hi — I'm interested in a vehicle at your dealership and would like to confirm the full out-the-door price before visiting. Could you please send me an itemized breakdown showing the vehicle sale price, documentation fee, all additional dealer fees, Oklahoma vehicle tax (4.5% combined — 1.25% sales + 3.25% excise), title fee ($11), and registration costs ($96 for new vehicles)? I'd like to see the complete total. Thank you.",
    lastVerified: "2026-03",
    buyerTip: "Oklahoma's 4.5% combined vehicle tax (1.25% sales + 3.25% excise) is among the lower rates in the country and applies uniformly statewide with no local additions. For first-year registration, the $96 fee applies to vehicles in years 1–4, then decreases. One common confusion: the excise tax (3.25%) and sales tax (1.25%) may appear as separate line items on a quote rather than a single 4.5% figure — both components are correct government charges.",
  },

  oregon: {
    name: "Oregon",
    abbreviation: "OR",
    slug: "oregon",
    docFeeRange: "Reported $150–$250 (not verified)",
    hasCap: true,
    metaDescription:
      "Oregon's document processing fee is $250 with an integrator and $200 otherwise. Reported $150–$250 (not verified). Compare the itemized out-the-door price before you sign.",
    capNote:
      "ORS 822.043(4) limits the document processing fee to $250 if the dealer uses an integrator and to $200 if the dealer does not. A fee from $201 to $250 stays conditional until integrator use is confirmed. A fee above $250 is above both ceilings. Unverified reports mention documentation fees around $150–$250. That range is not a market standard. Compare the itemized out-the-door price.",
    salesTaxNote:
      "Oregon has no state sales tax on vehicle purchases. However, a 0.5% Vehicle Privilege Tax applies to new vehicle sales (applied to the dealer's gross receipts). HB 3991 proposes increasing this to 2.25% — pending voter referendum. Private-party and used vehicle sales are generally not subject to this tax.",
    registrationNote:
      "Oregon registration is $43 for two years, with a $60 increase for EVs and 40+ MPG vehicles effective January 1, 2026. The title fee is a sliding scale of $77–$192 based on the vehicle's fuel economy (MPG rating).",
    introAngle:
      "Oregon combines two major buyer advantages: no traditional sales tax and a capped doc fee ($200–$250). However, buyers should be aware of the 0.5% Vehicle Privilege Tax on new vehicles and the MPG-based sliding scale title fee — which means fuel-efficient and electric vehicles actually pay higher title fees in Oregon.",
    snippetAnswer:
      "ORS 822.043(4) limits Oregon's document processing fee to $250 with an integrator and $200 without one. A fee from $201 to $250 is conditional until integrator use is confirmed. There is no state sales tax, but a 0.5% Vehicle Privilege Tax applies to new vehicles.",
    watchFor: [
      "Vehicle Privilege Tax on new vehicles: Oregon's 0.5% tax on new vehicle sales applies to the dealer's gross, which is passed to buyers. This is not a traditional sales tax but does appear on new car deals.",
      "MPG-based title fee: Oregon's title fee ranges from $77 to $192 depending on fuel economy. Higher-MPG vehicles pay more — the opposite of what buyers might expect.",
      "EV registration surcharge: starting January 2026, EVs and 40+ MPG vehicles pay an additional $60 in registration. Budget for this if applicable.",
    ],
    negotiationNote:
      "Oregon's doc fee cap removes one area of negotiation. Focus on vehicle price and add-ons. The Portland metro offers competitive dealer options. The absence of sales tax is a meaningful advantage for buyers coming from neighboring high-tax states.",
    ctaHeading: "Have an Oregon dealer quote you want to verify?",
    ctaBody:
      "Paste the quote and Odigos checks whether the charges are itemized, whether the totals reconcile, and whether a fee exceeds a verified state cap. Market value stays unverified unless you optionally enter a factory window sticker MSRP. That sticker is not a live market price, and an unverified fee range is not a legal limit.",
    internalLinks: STANDARD_LINKS,
    sources: [
      "https://www.oregon.gov/odot/dmv/pages/fees/vehicle.aspx",
    ],
    specialNotes:
      "$250 with integrator / $200 without integrator. Title fee is sliding scale $77–$192 based on MPG.",
    dealerMessage:
      "Hi — I'm interested in a vehicle at your dealership and would like to confirm the full out-the-door price before visiting. Could you please send me an itemized breakdown showing the vehicle sale price, documentation fee (Oregon's statute sets $250 with an integrator and $200 without one. The analyzer's hard ceiling is $250 or $200 depending on your system), all additional dealer fees, Vehicle Privilege Tax if applicable (0.5% on new vehicles), title fee (MPG-based sliding scale), and registration costs? Oregon has no sales tax — please confirm none is included. I'd like to see the complete total. Thank you.",
    lastVerified: "2026-03",
    buyerTip: "Oregon's title fee scales inversely to what buyers expect: more fuel-efficient vehicles pay higher title fees, not lower. An EV or 40+ MPG hybrid will pay the maximum $192 title fee, while a less efficient vehicle pays closer to $77. Additionally, a new $60 annual surcharge applies to EVs and 40+ MPG vehicles starting January 2026. This counterintuitive structure means choosing an efficient vehicle in Oregon comes with specific upfront and ongoing registration costs worth factoring in.",
  },

  pennsylvania: {
    name: "Pennsylvania",
    abbreviation: "PA",
    slug: "pennsylvania",
    docFeeRange: "Reported $300–$490 (not verified)",
    hasCap: true,
    metaDescription:
      "Pennsylvania documentation fee: verified ceiling $490. Reported $300–$490 (not verified). Compare the itemized out-the-door price before you sign.",
    capNote:
      "Pennsylvania's 2026 notice under 63 P.S. § 818.327 sets the documentary preparation fee at no more than $490 for an electronic transaction and $409 for a non-electronic one. The analyzer's hard ceiling is the $490 electronic figure. Unverified reports mention documentation fees around $300–$490. That range is not a market standard. Compare the itemized out-the-door price. A lower documentation fee with a higher vehicle price is not automatically a better deal.",
    salesTaxNote:
      "Pennsylvania charges 6% state sales tax on vehicles, increasing to 6.5% October 1, 2025 and 7% October 1, 2026. Philadelphia applies an additional 2% local tax, bringing the Philadelphia rate to 8% currently (and higher in future years). Trade-in deductions are allowed.",
    registrationNote:
      "Pennsylvania registration ranges from $200 to $300 depending on vehicle weight. The title fee is $72.",
    introAngle:
      "Pennsylvania buyers should be aware of two significant changes: (1) the doc fee cap increased in January 2026 to $490 electronic / $409 non-electronic, and (2) the state sales tax is scheduled to increase to 6.5% in October 2025 and 7% in October 2026. If your purchase straddles either date, confirm which rate applies. Philadelphia's 8% combined rate is substantially higher than the statewide base.",
    snippetAnswer:
      "Pennsylvania's 2026 notice under 63 P.S. § 818.327 sets the documentary preparation fee at no more than $490 for an electronic transaction and $409 for a non-electronic one. Unverified reports mention documentation fees around $300–$490. That range is not a market standard. State sales tax is 6% (increasing to 6.5% Oct 2025, 7% Oct 2026).",
    watchFor: [
      "Rising state tax: Pennsylvania's sales tax increases to 6.5% in October 2025 and 7% in October 2026. Time-sensitive buyers should factor in the current applicable rate.",
      "Philadelphia 8% rate: if you're buying in Philadelphia or through a dealer in the city, the combined 8% rate applies. This is meaningfully higher than the statewide 6%.",
      "Electronic vs. non-electronic cap: confirm whether your dealer's documentation is handled electronically ($490 cap) or non-electronically ($409 cap).",
    ],
    negotiationNote:
      "Pennsylvania's Philadelphia and Pittsburgh markets have strong dealer competition. With the doc fee capped at $490 (electronic) or $409 (non-electronic), negotiation focuses on the vehicle price and add-ons. The rising sales tax — 6% now, 6.5% in October 2025, 7% in October 2026 — creates a timing consideration: buying before the next increase saves real money. On a $35,000 vehicle, 0.5% is $175. Philadelphia buyers at the 8% combined rate pay $2,800 in tax on that vehicle — ask if the dealer can offset with a lower sale price.",
    ctaHeading: "Have a Pennsylvania dealer quote you want to review?",
    ctaBody:
      "Paste the quote and Odigos checks whether the charges are itemized, whether the totals reconcile, and whether a fee exceeds a verified state cap. Market value stays unverified unless you optionally enter a factory window sticker MSRP. That sticker is not a live market price, and an unverified fee range is not a legal limit.",
    internalLinks: STANDARD_LINKS,
    sources: [
      "https://www.pacodeandbulletin.gov/Display/pabull?file=/secure/pabulletin/data/vol55/55-1/26.html",
    ],
    specialNotes:
      "Cap: $490 electronic / $409 non-electronic (effective Jan 13, 2026). Adjusted annually by CPI. Up from $477/$398 in 2025.",
    dealerMessage:
      "Hi — I'm interested in a vehicle at your dealership and would like to confirm the full out-the-door price before visiting. Could you please send me an itemized breakdown showing the vehicle sale price, documentation fee (Pennsylvania caps this at $490 electronic / $409 non-electronic per the Jan 2026 CPI update), all additional dealer fees, Pennsylvania sales tax (please confirm the current rate — I understand it may be 6%, 6.5%, or 8% in Philadelphia depending on timing and location), title fee ($72), and registration costs ($200–$300 by weight)? I'd like to see the complete itemized total. Thank you.",
    lastVerified: "2026-03",
    commonQuestions: [
      {
        q: "What is the Pennsylvania doc fee cap in 2026?",
        a: "As of January 13, 2026, Pennsylvania caps dealer documentation fees at $490 for electronic processing or $409 for non-electronic processing. These amounts increased from $477/$398 in 2025 and are adjusted annually by CPI per Pennsylvania Bulletin Vol. 55 Issue 1.",
      },
      {
        q: "Why is the Philadelphia sales tax rate higher?",
        a: "Philadelphia adds a 2% local tax on top of the state rate, currently bringing the combined rate to 8%. With the state rate increasing to 6.5% in October 2025 and 7% in October 2026, the Philadelphia combined rate will eventually reach 9%. This is the highest vehicle sales tax rate in Pennsylvania.",
      },
      {
        q: "Is Pennsylvania's sales tax increasing?",
        a: "Yes. Pennsylvania's state vehicle sales tax is increasing in two steps: from 6% to 6.5% effective October 1, 2025, and from 6.5% to 7% effective October 1, 2026. On a $35,000 vehicle, the difference between 6% and 7% is $350. If you're buying near those dates, confirm which rate applies.",
      },
      {
        q: "What is the difference between electronic and non-electronic doc fees?",
        a: "Pennsylvania sets two cap amounts depending on how the dealer processes paperwork. Dealers using electronic title and registration systems can charge up to $490. Dealers using paper-based (non-electronic) processing are limited to $409. Most modern dealerships use electronic processing.",
      },
    ],
    competitorGapSection:
      "Most Pennsylvania guides mention the doc fee cap but miss the timing dimension. With the state sales tax increasing to 6.5% in October 2025 and 7% in October 2026, the effective date of your purchase matters. On a $40,000 vehicle, buying before vs. after the October 2026 increase saves $400. Philadelphia buyers face an even steeper jump as the local 2% stacks on top. Before negotiating, check the current applicable rate and factor timing into your decision. The $72 title fee is also notably higher than most states — make sure it's included in any OTD comparison.",
    buyerTip: "Pennsylvania's sales tax is scheduled to increase twice: to 6.5% in October 2025 and to 7% in October 2026. If your purchase falls near either of those dates, confirm which rate the dealer is using and whether the correct rate is reflected in the quote. A purchase just before October 2026 at 6.5% vs. just after at 7% means a $175 difference in tax on a $35,000 vehicle.",
  },

  "rhode-island": {
    name: "Rhode Island",
    abbreviation: "RI",
    slug: "rhode-island",
    docFeeRange: "Reported $200–$400 (not verified)",
    hasCap: true,
    metaDescription:
      "Rhode Island documentation fee: verified ceiling $400. Reported $200–$400 (not verified). Compare the itemized out-the-door price before you sign.",
    capNote:
      "Rhode Island's rule (280-RICR-30-20-1.6(N)) allows a documentary preparation fee of up to $400 only on transactions over $10,000. The analyzer checks the $400 ceiling and does not by itself apply the $10,000 price floor. Unverified reports mention documentation fees around $200–$400. That range is not a market standard. Compare the itemized out-the-door price. A lower documentation fee with a higher vehicle price is not automatically a better deal.",
    salesTaxNote:
      "Rhode Island charges a flat 7% sales tax on vehicle purchases statewide. There are no local additions — the rate is uniform. Trade-in deductions are allowed. Note that Rhode Island includes documentation fees in the taxable sales amount, which slightly increases the sales tax.",
    registrationNote:
      "Rhode Island registration ranges from $30 to $50 per year depending on vehicle type. The title fee is $23.",
    introAngle:
      "Rhode Island has an unusual doc fee structure: a $400 cap for vehicles $10,000 or above, and a complete prohibition on fees for vehicles under $10,000. An additional $20 title prep fee is allowed separately. And unlike most states, Rhode Island includes the documentation fee in the taxable sales amount — meaning you'll pay 7% sales tax on the doc fee as well as the vehicle price.",
    snippetAnswer:
      "Rhode Island's rule (280-RICR-30-20-1.6(N)) allows a documentary preparation fee of up to $400 only on transactions over $10,000. The analyzer checks the $400 ceiling and does not by itself apply the $10,000 price floor. Unverified reports mention documentation fees around $200–$400. That range is not a market standard.",
    watchFor: [
      "Doc fee included in taxable amount: Rhode Island applies 7% sales tax to the documentation fee as well as the vehicle price. This adds about $28 to your tax on a $400 doc fee.",
      "Prohibition for vehicles under $10K: if you're buying a vehicle under $10,000, the dealer cannot charge a documentation fee. If you see one, ask for it to be removed.",
      "Separate title prep fee: a $20 title preparation fee is permitted in addition to the $400 documentation fee. Both may appear on your quote.",
    ],
    negotiationNote:
      "Rhode Island's small geographic area means buyers can shop across multiple dealerships relatively easily. The doc fee is capped, so focus negotiation on the vehicle price and any add-ons. The sales tax on the doc fee is a small but real additional cost to include in your OTD estimate.",
    ctaHeading: "Have a Rhode Island dealer quote you want to review?",
    ctaBody:
      "Paste the quote and Odigos checks whether the charges are itemized, whether the totals reconcile, and whether a fee exceeds a verified state cap. Market value stays unverified unless you optionally enter a factory window sticker MSRP. That sticker is not a live market price, and an unverified fee range is not a legal limit.",
    internalLinks: STANDARD_LINKS,
    sources: [
      "https://www.law.cornell.edu/regulations/rhode-island/280-RICR-30-20-1.6",
      "https://tax.ri.gov/tax-sections/sales-excise-taxes/sales-use-tax",
    ],
    specialNotes:
      "$400 cap applies to vehicles sold for $10,000+. Doc fee PROHIBITED on vehicles under $10,000. Separate $20 title prep fee also allowed. Doc fees included in taxable measure for sales tax.",
    dealerMessage:
      "Hi — I'm interested in a vehicle at your dealership and would like to confirm the full out-the-door price before visiting. Could you please send me an itemized breakdown showing the vehicle sale price, documentation fee (Rhode Island caps this at $400 for vehicles over $10K), any title preparation fee, all additional dealer fees, Rhode Island sales tax (7% flat, including on the doc fee), title fee ($23), and registration costs? I'd like to see the complete total. Thank you.",
    lastVerified: "2026-03",
    buyerTip: "Rhode Island prohibits documentation fees entirely on vehicles priced under $10,000 — one of very few states with a vehicle-price-based fee prohibition. If you're purchasing a used vehicle at or near the $10,000 price point and the dealer's doc fee makes the total exceed $10,000, be aware that the fee may push the vehicle into the $400-cap tier. The exact fee rules change based on the vehicle sale price, not the MSRP.",
  },

  "south-carolina": {
    name: "South Carolina",
    abbreviation: "SC",
    slug: "south-carolina",
    docFeeRange: "Reported $300–$600 (not verified)",
    hasCap: false,
    metaDescription:
      "South Carolina does not have a verified documentation-fee cap on file. Reported $300–$600 (not verified). Compare the itemized out-the-door price before you sign.",
    capNote:
      "South Carolina does not have a verified documentation-fee cap in this file. A stored note may say dealers set the fee, but that is not a legal finding that no cap exists. Unverified reports mention documentation fees around $300–$600. That range is not a market standard. Compare itemized out-the-door quotes instead of treating one line as legal or illegal.",
    salesTaxNote:
      "South Carolina charges 6% state sales tax on vehicle purchases, with local additions of up to 3%. Combined rates can reach 9% in some counties. Trade-in deductions are allowed.",
    registrationNote:
      "South Carolina registration ranges from $30 to $100 per year depending on vehicle type. The title fee is $19.",
    introAngle:
      "South Carolina has a soft threshold at $225 — doc fees above this amount require additional state documentation, which creates some implicit accountability without a hard cap. Fees of $300–$600 are still common. The 6% state tax with local additions makes comparison shopping across counties meaningful.",
    snippetAnswer:
      "South Carolina does not have a verified documentation-fee cap in this file. A stored note may say dealers set the fee, but that is not a legal finding that no cap exists. Unverified reports mention documentation fees around $300–$600. That range is not a market standard. State sales tax is 6% with local additions up to 9% combined.",
    watchFor: [
      "Fees above $225: any doc fee above $225 requires the dealer to file additional documentation with the state. If your fee is higher, it should be justified — ask for an explanation.",
      "Local tax variation: combined rates can reach 9% in some counties. Verify your effective rate.",
      "without a verified cap on file fees: despite the documentation requirement above $225, there's no hard ceiling. Compare quotes.",
    ],
    negotiationNote:
      "South Carolina's Columbia and Greenville-Spartanburg markets offer competitive dealer options. Ask about the documentation fee upfront and whether it's above the $225 state documentation threshold. Focus negotiation on the vehicle price and any add-ons.",
    ctaHeading: "Have a South Carolina dealer quote you want to review?",
    ctaBody:
      "Paste the quote and Odigos checks whether the charges are itemized, whether the totals reconcile, and whether a fee exceeds a verified state cap. Market value stays unverified unless you optionally enter a factory window sticker MSRP. That sticker is not a live market price, and an unverified fee range is not a legal limit.",
    internalLinks: STANDARD_LINKS,
    sources: [
      "https://consumer.sc.gov/business-resourceslaws/licensing/registered-creditors/motor-vehicle-dealers",
      "https://dor.sc.gov/sales-use-tax-index/local-sales-taxes",
    ],
    specialNotes:
      "Fees exceeding $225 require additional documentation to the state.",
    dealerMessage:
      "Hi — I'm interested in a vehicle at your dealership and would like to confirm the full out-the-door price before visiting. Could you please send me an itemized breakdown showing the vehicle sale price, documentation fee (please note if it exceeds $225 per South Carolina's documentation requirement), all additional dealer fees, South Carolina sales tax (6% + local rate for your county), title fee ($19), and registration costs? I'd like to see the complete total. Thank you.",
    lastVerified: "2026-03",
    buyerTip: "South Carolina's $225 threshold for additional state documentation is not a hard cap — it's an accountability mechanism. Dealers must justify fees above $225 with additional state paperwork, which creates implicit pressure on fee amounts but doesn't prevent higher charges. If your South Carolina dealer charges $450, ask them to show you the state documentation filed for that fee level. The requirement exists under South Carolina's dealer licensing rules.",
  },

  "south-dakota": {
    name: "South Dakota",
    abbreviation: "SD",
    slug: "south-dakota",
    docFeeRange: "Reported $75–$200 (not verified)",
    hasCap: false,
    metaDescription:
      "South Dakota does not have a verified documentation-fee cap on file. Reported $75–$200 (not verified). Compare the itemized out-the-door price before you sign.",
    capNote:
      "South Dakota does not have a verified documentation-fee cap in this file. A stored note may say dealers set the fee, but that is not a legal finding that no cap exists. Unverified reports mention documentation fees around $75–$200. That range is not a market standard. Compare itemized out-the-door quotes instead of treating one line as legal or illegal.",
    salesTaxNote:
      "South Dakota charges 4.2% state sales tax (reduced from 4.5% as of July 2023) on vehicle purchases, with local additions of up to 2%. A separate 4% excise tax is also applied to the purchase price at registration. Trade-in deductions are allowed.",
    registrationNote:
      "South Dakota registration fees vary by vehicle weight, plus the 4% excise tax component paid at registration. The title fee is $12.",
    introAngle:
      "South Dakota has some of the lowest dealer documentation fees in the country — typically $75–$200. The overall vehicle purchase cost includes both a state sales tax (4.2%) and a separate 4% excise tax at registration, so buyers should account for both when estimating their OTD.",
    snippetAnswer:
      "South Dakota does not have a verified documentation-fee cap in this file. A stored note may say dealers set the fee, but that is not a legal finding that no cap exists. Unverified reports mention documentation fees around $75–$200. That range is not a market standard. The state charges a 4.2% sales tax plus a 4% vehicle excise tax.",
    watchFor: [
      "Double tax structure: South Dakota applies both a 4.2% sales tax and a 4% excise tax. Make sure your OTD estimate includes both components.",
      "Low doc fees: while unverified reports describe low fees, no cap is verified in this file. Confirm the amount before visiting.",
      "Local sales tax additions: some South Dakota municipalities add up to 2% on top of the 4.2% base.",
    ],
    negotiationNote:
      "South Dakota's market is concentrated in Sioux Falls and Rapid City. The low fee environment means less financial pressure on the doc fee side — focus negotiation on the vehicle price. Verify both the sales tax and excise tax are correctly calculated.",
    ctaHeading: "Have a South Dakota dealer quote you want to verify?",
    ctaBody:
      "Paste the quote and Odigos checks whether the charges are itemized, whether the totals reconcile, and whether a fee exceeds a verified state cap. Market value stays unverified unless you optionally enter a factory window sticker MSRP. That sticker is not a live market price, and an unverified fee range is not a legal limit.",
    internalLinks: STANDARD_LINKS,
    sources: [
      "https://dor.sd.gov/individuals/motor-vehicle/all-vehicles-title-fees-registration/",
    ],
    specialNotes:
      "Among lowest doc fee averages in the nation.",
    dealerMessage:
      "Hi — I'm interested in a vehicle at your dealership and would like to confirm the full out-the-door price before visiting. Could you please send me an itemized breakdown showing the vehicle sale price, documentation fee, all additional dealer fees, South Dakota sales tax (4.2% + local), 4% vehicle excise tax, title fee ($12), and registration costs? I'd like to see the complete total including both the sales tax and excise tax. Thank you.",
    lastVerified: "2026-03",
    buyerTip: "South Dakota's doc fee environment is among the most buyer-friendly in without a verified cap on file states — the market pressure from a low-density buyer pool keeps fees typically under $200 without any legal mandate. The more significant OTD consideration is accounting for both the 4.2% sales tax and the separate 4% vehicle excise tax. These are two distinct charges, and buyers from other states often underestimate the total tax burden by missing the excise component.",
  },

  tennessee: {
    name: "Tennessee",
    abbreviation: "TN",
    slug: "tennessee",
    docFeeRange: "Reported $300–$600 (not verified)",
    hasCap: false,
    metaDescription:
      "Tennessee does not have a verified documentation-fee cap on file. Reported $300–$600 (not verified). Compare the itemized out-the-door price before you sign.",
    capNote:
      "Tennessee does not have a verified documentation-fee cap in this file. A stored note may say dealers set the fee, but that is not a legal finding that no cap exists. Unverified reports mention documentation fees around $300–$600. That range is not a market standard. Compare itemized out-the-door quotes instead of treating one line as legal or illegal.",
    salesTaxNote:
      "Tennessee charges 7% state sales tax on vehicle purchases, with local additions of up to 2.75%. Combined rates in the Memphis area reach 9.75% — among the highest in the country. Trade-in deductions are allowed.",
    registrationNote:
      "Tennessee base registration ranges from $14.50 to $36, plus a county wheel tax that varies from $0 to $55 depending on the county. The title fee is $14.",
    introAngle:
      "Tennessee does not have a verified doc-fee cap on file and some of the highest combined sales tax rates in the country — reaching 9.75% in the Memphis area. Buyers in high-tax counties should budget carefully for the tax impact, which can add $3,000 or more on a $35,000 vehicle in the Memphis metro. Doc fees are without a verified cap on file and vary by dealer.",
    snippetAnswer:
      "Tennessee does not have a verified documentation-fee cap in this file. A stored note may say dealers set the fee, but that is not a legal finding that no cap exists. Unverified reports mention documentation fees around $300–$600. That range is not a market standard. Combined sales tax rates reach 9.75% in the Memphis area — among the highest nationally.",
    watchFor: [
      "High combined tax rates: Memphis area buyers pay 9.75% combined. Even outside Memphis, Tennessee rates are generally high. Know your county's exact rate.",
      "County wheel tax: many Tennessee counties charge an annual wheel tax on registration ($0–$55). This is a small but real addition to your OTD.",
      "Doc fees without a verified cap on file: ask for the doc fee before visiting. If above $500, compare with other dealers in the area.",
    ],
    negotiationNote:
      "Tennessee's Nashville and Memphis metros have competitive dealer networks. The high tax rate is fixed by location — focus negotiation on the vehicle price and doc fee. Having a competing OTD quote from another Tennessee dealer is the best leverage.",
    ctaHeading: "Have a Tennessee dealer quote you want to review?",
    ctaBody:
      "Paste the quote and Odigos checks whether the charges are itemized, whether the totals reconcile, and whether a fee exceeds a verified state cap. Market value stays unverified unless you optionally enter a factory window sticker MSRP. That sticker is not a live market price, and an unverified fee range is not a legal limit.",
    internalLinks: STANDARD_LINKS,
    sources: [
      "https://www.tn.gov/revenue/title-and-registration.html",
    ],
    specialNotes:
      "Among highest combined sales tax rates in the nation.",
    dealerMessage:
      "Hi — I'm interested in a vehicle at your dealership and would like to confirm the full out-the-door price before visiting. Could you please send me an itemized breakdown showing the vehicle sale price, documentation fee, all additional dealer fees, Tennessee sales tax (7% state + your local county rate), title fee ($14), registration costs, and any county wheel tax? I'd like to see the complete total. Thank you.",
    lastVerified: "2026-03",
    buyerTip: "Tennessee's combined sales tax rate in Memphis reaches 9.75% — on a $35,000 vehicle, that's $3,413 in tax. Buyers in the Nashville area pay slightly less at around 9.25%. Tennessee's annual county wheel tax (up to $55) is a small recurring cost that's easy to overlook when comparing OTD quotes. Always confirm both the effective county sales tax rate and the county wheel tax for the dealer's location when building your OTD estimate.",
  },

  texas: {
    name: "Texas",
    abbreviation: "TX",
    slug: "texas",
    docFeeRange: "Reported $150–$225 (not verified)",
    hasCap: false,
    pageTitle: "Texas Dealer Doc Fee (2026): No Hard Dollar Cap — Compare the Full Price",
    h1: "Texas Dealer Doc Fee (2026): No Hard Dollar Cap",
    metaDescription:
      "Texas has no verified hard dollar cap on the documentary fee. A fee above $225 is not automatically illegal. Reported $150–$225 (not verified). Compare the itemized out-the-door price before you sign.",
    capNote:
      "Texas Finance Code § 348.006 does not set a hard dollar cap. The documentary fee must be a reasonable amount the parties agree to. A bulletin in this file says a fee of $225 or less needs no OCCC filing, and a higher fee can be charged only after the dealer files a notice and a cost analysis. A fee above $225 is not automatically illegal. Unverified reports mention documentation fees around $150–$225. That range is not a market standard. Compare the itemized out-the-door price. A lower documentation fee with a higher vehicle price is not automatically a better deal.",
    salesTaxNote:
      "Texas charges a flat 6.25% state motor vehicle sales tax. Local add-ons are limited, so buyers across the state generally see the same effective rate. The tax is calculated on the full purchase price of the vehicle.",
    registrationNote:
      "Texas registration fees are primarily made up of a base registration fee (around $50–$65 depending on county) plus county-specific fees. New vehicle registration is generally straightforward by national standards, though some counties add local assessments. Electric vehicles pay a $400 first-time EV fee plus $200 annually.",
    introAngle:
      "Texas Finance Code § 348.006 does not set a hard dollar cap. Dealers can charge different amounts depending on pricing practices. Because there is no verified hard dollar cap, the key question is whether the fee is reasonable compared to other deals.",
    snippetAnswer:
      "Texas Finance Code § 348.006 does not set a hard dollar cap. The documentary fee must be a reasonable amount the parties agree to. Unverified reports mention documentation fees around $150–$225. That range is not a market standard. Because there is no verified hard dollar cap, the key question is whether the fee is reasonable compared to other deals.",
    watchFor: [
      "Fees above $225: while the $225 level is 'presumed reasonable,' some dealers do file for higher amounts with the state. If you see a doc fee above $225, ask for the justification.",
      "Market adjustment markups on popular models: Texas dealerships on high-demand vehicles sometimes add a market adjustment above MSRP. This is a dealer markup, not a tax — it's negotiable.",
      "Bundled add-on packages listed as 'required': protection packages, paint sealant, and nitrogen tires are common add-on items in Texas dealerships. These are almost never required, even when presented as part of the vehicle configuration.",
      "EV registration fees: if you're buying an electric vehicle in Texas, budget for the $400 first-time fee plus $200 annually.",
    ],
    negotiationNote:
      "Texas's $225 'presumed reasonable' guideline under Texas Administrative Code section 84.205 means most dealers stay at or below this amount — but dealers who file a cost analysis with the OCCC can exceed it after that filing. Ask what the specific doc fee is before visiting. Texas's flat 6.25% sales tax (minimal local variation) and trade-in credit make OTD math straightforward. The large metro markets — Dallas, Houston, San Antonio, Austin — create real competitive pressure. Getting OTD quotes from 3+ dealers in your metro on the same vehicle is the best negotiation strategy. EV buyers should budget for the $400 first-time fee plus $200/year.",
    ctaHeading: "Got a Texas dealer quote?",
    ctaBody:
      "Paste the quote and Odigos checks whether the charges are itemized, whether the totals reconcile, and whether a fee exceeds a verified state cap. Market value stays unverified unless you optionally enter a factory window sticker MSRP. That sticker is not a live market price, and an unverified fee range is not a legal limit.",
    ctaTopBody:
      "Got a Texas dealer quote? Paste it and Odigos checks the line items, the math, and any verified cap. It does not compare the price to a typical Texas market range.",
    ctaMidBody:
      "Texas has no verified hard dollar cap. A fee above $225 is not automatically illegal. Paste the quote to check the math and the line items.",
    ctaMidLink: "Check My Texas Quote",
    ctaBottomHeadline: "Don't sign until you check.",
    ctaBottomBody:
      "Paste the quote and Odigos checks whether the charges are itemized, whether the totals reconcile, and whether a fee exceeds a verified state cap. Market value stays unverified unless you optionally enter a factory window sticker MSRP. That sticker is not a live market price, and an unverified fee range is not a legal limit.",
    ctaBottomButton: "Check My Quote Free",
    internalLinks: [
      ...STANDARD_LINKS,
      { href: "/calculate-out-the-door-price", label: "calculate your OTD price" },
    ],
    sources: [
      "https://occc.texas.gov/wp-content/uploads/2025/11/rc-docfee-adoption-fc-090524.pdf",
    ],
    specialNotes:
      "MAJOR CHANGE: $225 'presumed reasonable' guideline effective July 11, 2024. Not a hard cap — fees over $225 require OCCC notification and cost analysis. Previously ~$150.",
    dealerMessage:
      "Hi — I'm interested in a vehicle at your dealership and would like to confirm the full out-the-door price before visiting. Could you please send me an itemized breakdown showing the vehicle sale price, documentation fee, all additional dealer fees, Texas sales tax (6.25% flat), title fee ($30), and registration costs? I'd like to see the complete total. Thank you.",
    lastVerified: "2026-03",
    commonQuestions: [
      {
        q: "What is the maximum doc fee a Texas dealer can charge in 2026?",
        a: "Texas has no verified hard dollar cap on dealer doc fees. A $225 'presumed reasonable' guideline took effect July 11, 2024, but dealers can exceed it by filing a cost analysis with the OCCC. Unverified reports mention $150–$225. Higher fees are not automatically illegal.",
      },
      {
        q: "Do all Texas dealers charge the same doc fee?",
        a: "No. Many dealers charge between $150 and $225, but the specific amount varies by dealership. Some charge at the $225 guideline level while others charge less — or more. Always ask for the doc fee to be disclosed before visiting.",
      },
      {
        q: "Is Texas sales tax the same everywhere in the state?",
        a: "Mostly, yes. Texas charges a flat 6.25% state motor vehicle sales tax with very limited local additions, making the effective rate consistent across most Texas markets. This is simpler than states like California or New York where local rates vary significantly.",
      },
      {
        q: "What fees do Texas EV buyers pay?",
        a: "Texas EV buyers pay a $400 first-time registration fee plus $200 annually — charges intended to offset road-use taxes that EV owners don't pay through fuel. Budget for these when estimating your full OTD cost.",
      },
      {
        q: "Can I negotiate the doc fee at a Texas dealership?",
        a: "Directly reducing the doc fee is difficult since many Texas dealers charge the same amount to all customers. The more effective approach is negotiating the vehicle price down to offset the doc fee — request the same amount off the sale price as the doc fee represents above what you consider reasonable.",
      },
    ],
    competitorGapSection:
      "Most Texas car-buying guides quote $225 as a hard cap without explaining that it's a 'presumed reasonable' guideline, not a legal ceiling. The key detail: dealers who file a cost analysis with the OCCC can charge above $225, and the fee still has to be reasonable. Before visiting, ask the specific dealer what their current doc fee is — don't assume $225 is the maximum. If the fee exceeds $225, ask to see the justification or request that the vehicle price be reduced to offset it. Also note that market adjustment markups on high-demand vehicles are a separate line item from the doc fee and are fully negotiable.",
    buyerTip: "Texas set a $225 'presumed reasonable' guideline effective July 11, 2024 — but this is not a hard legal ceiling. Dealers can exceed $225 by filing a cost analysis with the OCCC, and some high-volume stores do. If you see a Texas dealer quoting $350 or more in documentation fees, it's worth asking directly: 'Has this store filed a cost analysis with the OCCC, and can I see it?' The guideline is not as absolute as many guides imply.",
  },

  utah: {
    name: "Utah",
    abbreviation: "UT",
    slug: "utah",
    docFeeRange: "Reported $149–$400 (not verified)",
    hasCap: false,
    metaDescription:
      "Utah does not have a verified documentation-fee cap on file. Reported $149–$400 (not verified). Compare the itemized out-the-door price before you sign.",
    capNote:
      "Utah does not have a verified documentation-fee cap in this file. A stored note may say dealers set the fee, but that is not a legal finding that no cap exists. Unverified reports mention documentation fees around $149–$400. That range is not a market standard. Compare itemized out-the-door quotes instead of treating one line as legal or illegal.",
    salesTaxNote:
      "Utah charges 4.7% state sales tax on vehicle purchases, with local additions up to 4%. Combined rates vary significantly — Carbon County at 6.35%, Park City at 9.05%. Trade-in deductions are allowed.",
    registrationNote:
      "Utah's total registration costs for new vehicles average approximately $1,541 — among the most expensive in the country. Registration is weight-based and includes multiple fee components. The title fee is included in registration.",
    introAngle:
      "Utah buyers face two significant costs to be aware of: the state's average new vehicle registration of approximately $1,541 is among the highest nationally, and the local sales tax variation is substantial (from 6.35% to 9.05% depending on location). Doc fees are without a verified cap on file in the moderate range.",
    snippetAnswer:
      "Utah does not have a verified documentation-fee cap in this file. A stored note may say dealers set the fee, but that is not a legal finding that no cap exists. Unverified reports mention documentation fees around $149–$400. That range is not a market standard. The state tax is 4.7% with local additions up to 9.05% combined. Total new vehicle registration averages ~$1,541 — one of the highest in the country.",
    watchFor: [
      "Very high registration costs: Utah's average new vehicle registration of ~$1,541 should be budgeted in your OTD estimate. This is significantly above the national average.",
      "Local tax variation: rates range from 6.35% (Carbon County) to 9.05% (Park City). Know the rate for your dealer's location.",
      "Doc fees without a verified cap on file: ask for the fee before visiting. Some Utah dealers charge at the lower end of the $149–$400 range.",
    ],
    negotiationNote:
      "The Salt Lake metro has a competitive dealer market. Focus negotiation on vehicle price and doc fees. The registration cost is a government fee based on vehicle weight — not negotiable. The local tax rate is also fixed by location.",
    ctaHeading: "Have a Utah dealer quote you want to verify?",
    ctaBody:
      "Paste the quote and Odigos checks whether the charges are itemized, whether the totals reconcile, and whether a fee exceeds a verified state cap. Market value stays unverified unless you optionally enter a factory window sticker MSRP. That sticker is not a live market price, and an unverified fee range is not a legal limit.",
    internalLinks: STANDARD_LINKS,
    sources: [
      "https://tax.utah.gov/business/sales-tax/sales/rates/",
      "https://dmv.utah.gov/register/registration-taxes-fees/",
    ],
    specialNotes:
      "Title fee included in registration. Very high total registration costs.",
    dealerMessage:
      "Hi — I'm interested in a vehicle at your dealership and would like to confirm the full out-the-door price before visiting. Could you please send me an itemized breakdown showing the vehicle sale price, documentation fee, all additional dealer fees, Utah sales tax (4.7% + local rate for your location), and total registration costs (please itemize — Utah registration includes title and can be substantial)? I'd like to see the complete total. Thank you.",
    lastVerified: "2026-03",
    buyerTip: "Utah's average new vehicle registration of approximately $1,541 is among the highest in the nation — roughly 3–5x what buyers from flat-fee states like Georgia or Tennessee are used to. This high first-year cost is often understated in dealer quotes until you get to the final paperwork. Ask specifically for the estimated first-year registration total in writing before finalizing any deal, and use the Utah DMV fee estimator to verify the amount yourself.",
  },

  vermont: {
    name: "Vermont",
    abbreviation: "VT",
    slug: "vermont",
    docFeeRange: "Reported $150–$300 (not verified)",
    hasCap: false,
    metaDescription:
      "Vermont does not have a verified documentation-fee cap on file. Reported $150–$300 (not verified). Compare the itemized out-the-door price before you sign.",
    capNote:
      "Vermont does not have a verified documentation-fee cap in this file. A stored note may say dealers set the fee, but that is not a legal finding that no cap exists. Unverified reports mention documentation fees around $150–$300. That range is not a market standard. Compare itemized out-the-door quotes instead of treating one line as legal or illegal.",
    salesTaxNote:
      "Vermont charges 6% state sales tax on vehicle purchases, with an optional 1% local tax in some municipalities (Burlington, Hartford, Middlebury effective July 1, 2025). Trade-in deductions are allowed. Vermont's DMV specifically states that documentation fees are taxable — they are included in the purchase price for sales tax calculation.",
    registrationNote:
      "Vermont registration is $76 per year or $140 for two years, plus a $2 Clean Air fee. Electric vehicle owners pay $89 additionally (or $44.50 for plug-in hybrids). The title fee is $35.",
    introAngle:
      "Vermont has a notable quirk: per the Vermont DMV, documentation fees are included in the taxable purchase price — meaning you pay 6% sales tax on the doc fee as well as the vehicle price. Fees are relatively modest at $150–$300 with no verified cap on file. Some municipalities added local 1% tax options in July 2025.",
    snippetAnswer:
      "Vermont does not have a verified documentation-fee cap in this file. A stored note may say dealers set the fee, but that is not a legal finding that no cap exists. Unverified reports mention documentation fees around $150–$300. That range is not a market standard. The state sales tax is 6%, with some municipalities adding 1%.",
    watchFor: [
      "Doc fees are taxable: Vermont includes documentation fees in the taxable purchase price. On a $250 doc fee, you'll pay $15 additional sales tax.",
      "New municipal taxes: Burlington, Hartford, and Middlebury added local 1% taxes effective July 1, 2025. Confirm your dealer's municipality's rate.",
      "EV registration surcharge: EVs pay $89 additional registration annually, PHEVs pay $44.50.",
    ],
    negotiationNote:
      "Vermont's smaller market means fewer competing dealers, particularly outside Burlington. The low doc fee environment is favorable — focus negotiation on the vehicle price. Ask for the doc fee to be itemized separately since it's included in the taxable amount.",
    ctaHeading: "Have a Vermont dealer quote you want to review?",
    ctaBody:
      "Paste the quote and Odigos checks whether the charges are itemized, whether the totals reconcile, and whether a fee exceeds a verified state cap. Market value stays unverified unless you optionally enter a factory window sticker MSRP. That sticker is not a live market price, and an unverified fee range is not a legal limit.",
    internalLinks: STANDARD_LINKS,
    sources: [
      "https://dmv.vermont.gov/faq/are-dealer-documentation-fees-taxable",
      "https://dmv.vermont.gov/registrations/fees",
    ],
    specialNotes:
      "Doc fees are taxable per Vermont DMV.",
    dealerMessage:
      "Hi — I'm interested in a vehicle at your dealership and would like to confirm the full out-the-door price before visiting. Could you please send me an itemized breakdown showing the vehicle sale price, documentation fee (note: Vermont includes this in the taxable amount), all additional dealer fees, Vermont sales tax (6% + any local addition for your municipality), title fee ($35), and registration costs? I'd like to see the complete total. Thank you.",
    lastVerified: "2026-03",
    buyerTip: "Vermont's DMV explicitly states that documentation fees are included in the taxable purchase price — meaning you pay 6% sales tax on the doc fee itself. On a $250 documentation fee, that's $15 in additional tax. Three Vermont municipalities (Burlington, Hartford, and Middlebury) added local 1% tax options effective July 1, 2025, so buyers in those areas now pay 7% instead of 6% — verify your dealer's municipality before estimating your tax.",
  },

  virginia: {
    name: "Virginia",
    abbreviation: "VA",
    slug: "virginia",
    docFeeRange: "Reported $500–$800 (not verified)",
    hasCap: false,
    metaDescription:
      "Virginia does not have a verified documentation-fee cap on file. Reported $500–$800 (not verified). Compare the itemized out-the-door price before you sign.",
    capNote:
      "Virginia does not have a verified documentation-fee cap in this file. A stored note may say dealers set the fee, but that is not a legal finding that no cap exists. Unverified reports mention documentation fees around $500–$800. That range is not a market standard. Compare itemized out-the-door quotes instead of treating one line as legal or illegal.",
    salesTaxNote:
      "Virginia charges 4.15% state sales tax on vehicles (with a minimum $75 tax), and combined with local additions, total rates range from 5.3% to 7% by locality. Critically, Virginia does NOT allow trade-in deductions — tax applies to the full vehicle price, not the net price after trade-in.",
    registrationNote:
      "Virginia registration runs $30.75 per year for vehicles 0–4,000 lbs, or $35.75 per year for 4,001–6,500 lbs. Electric vehicles pay an additional $131.88 annual fee. The title fee is $15.",
    introAngle:
      "Virginia buyers face two notable challenges: documentation fees in unverified reports ($500–$800), with no verified cap on file, and one of the few states that does not allow trade-in deductions from the taxable purchase price. If you're trading in a $20,000 vehicle in Virginia, you still pay tax on the full purchase price — not the net. This can add hundreds to your OTD compared to trade-in-credit states.",
    snippetAnswer:
      "Virginia does not have a verified documentation-fee cap in this file. A stored note may say dealers set the fee, but that is not a legal finding that no cap exists. Unverified reports mention documentation fees around $500–$800. That range is not a market standard. Virginia does NOT allow trade-in tax deductions — you pay tax on the full purchase price. Combined tax rates range from 5.3% to 7% by locality.",
    watchFor: [
      "No trade-in credit: Virginia is one of the few states that taxes the full purchase price even when you have a trade-in. Budget for the full tax on the vehicle price, not the net.",
      "Documentation fees with no verified cap on file: $500–$800 appears in unverified reports, and there is no verified cap on file. Ask for the fee before visiting and compare across dealers.",
      "Local tax rate variation: combined rates vary from 5.3% to 7% by locality. Confirm the effective rate for your dealer's location.",
      "EV annual fee: electric vehicles pay $131.88 additional per year in registration surcharge.",
    ],
    negotiationNote:
      "Virginia's Northern Virginia / DC metro area has a competitive dealer market. The high doc fees and no trade-in credit make it important to compare total OTD quotes, not just vehicle prices. The trade-in situation means if you have a trade-in, verify the dealer isn't implying a credit that the state doesn't actually allow.",
    ctaHeading: "Have a Virginia dealer quote you want to review?",
    ctaBody:
      "Paste the quote and Odigos checks whether the charges are itemized, whether the totals reconcile, and whether a fee exceeds a verified state cap. Market value stays unverified unless you optionally enter a factory window sticker MSRP. That sticker is not a live market price, and an unverified fee range is not a legal limit.",
    internalLinks: STANDARD_LINKS,
    sources: [
      "https://www.tax.virginia.gov/retail-sales-and-use-tax",
      "https://www.dmv.virginia.gov/vehicles/title",
    ],
    specialNotes:
      "One of few states that does not allow trade-in tax credit. High doc fees with no verified cap on file.",
    dealerMessage:
      "Hi — I'm interested in a vehicle at your dealership and would like to confirm the full out-the-door price before visiting. Could you please send me an itemized breakdown showing the vehicle sale price, documentation fee, all additional dealer fees, Virginia sales tax (4.15% state + your locality's additional rate — please note Virginia does not allow trade-in deductions), title fee ($15), and registration costs? I'd like to see the complete total. Thank you.",
    lastVerified: "2026-03",
    commonQuestions: [
      {
        q: "Does Virginia allow a trade-in tax credit?",
        a: "No. Virginia is one of the few states that does NOT allow the trade-in value to reduce the taxable purchase price. If you're buying a $40,000 vehicle and trading in one worth $15,000, you still pay sales tax on the full $40,000. At a 5.3% combined rate, that costs you $795 more than it would in a trade-in-credit state. This is one of the most important things Virginia buyers need to know.",
      },
      {
        q: "Is there a cap on dealer doc fees in Virginia?",
        a: "No. Virginia does not have a verified documentation-fee cap on file. unverified reports mention fees around $500–$800, placing Virginia among the higher-fee without a verified cap on file states. The doc fee is technically negotiable, but many dealers treat it as fixed. Your best lever is comparing total OTD quotes across dealers.",
      },
      {
        q: "What is the sales tax rate on cars in Virginia?",
        a: "Virginia charges a 4.15% state sales tax on vehicles (motor vehicle sales and use tax), with a minimum tax of $75. Local additions bring the total to 5.3%–7% depending on your locality. Northern Virginia and Hampton Roads localities tend toward the higher end. The tax applies to the full purchase price with no trade-in deduction.",
      },
      {
        q: "What extra fees do Virginia EV buyers pay?",
        a: "Virginia charges electric vehicle owners an additional $131.88 annual registration fee on top of standard registration costs. This fee replaces lost gas tax revenue. Plug-in hybrids may also face additional fees. Factor this into your annual ownership cost when comparing EVs to gas vehicles in Virginia.",
      },
      {
        q: "How do Virginia fees affect military buyers stationed in-state?",
        a: "Military members stationed in Virginia but domiciled in another state may be exempt from Virginia's motor vehicle sales tax under the Servicemembers Civil Relief Act (SCRA). You'd instead owe tax in your state of legal residence. This can be a significant savings if your home state has a lower rate or allows trade-in deductions. Bring your LES and home-state ID to the dealership and confirm the tax treatment before signing.",
      },
    ],
    competitorGapSection:
      "The biggest gap in Virginia car-buying guides is the no-trade-in-credit rule. Most buyers assume their trade-in reduces the taxable amount — it does in 42+ other states — but not in Virginia. On a $40,000 purchase with a $15,000 trade-in, you pay $795–$1,050 more in tax than you would in a trade-in-credit state (depending on your local rate). If you're stationed at a Virginia military base but domiciled elsewhere, check whether your home state's tax rules apply — the SCRA may save you hundreds. Northern Virginia's proximity to Maryland (which does allow trade-in credits) makes cross-border comparison shopping worth the drive for high-value purchases.",
    pageTitle: "Virginia Dealer Fees (2026): Doc Fee Cap Not Verified — VA OTD Guide",
    buyerTip: "Virginia is one of very few states that does not allow trade-in deductions from the taxable purchase price. If you're trading in a $25,000 vehicle toward a $50,000 purchase in Virginia, you pay tax on the full $50,000 — not on $25,000 as you would in most states. At Virginia's 5.3–7% combined rate, the cost of this rule on a high-value trade-in can exceed $1,500 compared to neighboring states that allow the deduction.",
  },

  washington: {
    name: "Washington",
    abbreviation: "WA",
    slug: "washington",
    docFeeRange: "Reported $150–$200 (not verified)",
    hasCap: true,
    metaDescription:
      "Washington documentation fee: verified ceiling $200. Reported $150–$200 (not verified). Compare the itemized out-the-door price before you sign.",
    capNote:
      "Washington requires dealers to disclose that a documentary service fee of up to $200 may be added (RCW 46.70.180). Dealers cannot present that fee as required by law. Unverified reports mention documentation fees around $150–$200. That range is not a market standard. Compare the itemized out-the-door price. A lower documentation fee with a higher vehicle price is not automatically a better deal.",
    salesTaxNote:
      "Washington charges 6.5% state sales tax on vehicle purchases, with local additions of up to 4.1%. Combined rates range from 7% to 10.4% depending on location. Trade-in deductions are allowed for vehicles of like kind.",
    registrationNote:
      "Washington base registration is $43.25 plus weight and location adjustments. The title fee increased to $6.50 effective January 1, 2026 (from the prior $7 — note: check current fee schedule).",
    introAngle:
      "Washington State's $200 cap on documentation fees provides buyer protection, but the significant range of local sales tax rates (7% to 10.4%) makes the effective OTD cost vary substantially by location. Seattle-area buyers face rates near the high end. The cap prohibits dealers from representing the doc fee as required by law.",
    snippetAnswer:
      "Washington requires dealers to disclose that a documentary service fee of up to $200 may be added (RCW 46.70.180). Dealers cannot present that fee as required by law. Unverified reports mention documentation fees around $150–$200. That range is not a market standard. State sales tax is 6.5% with local additions up to 10.4% combined. Trade-in credit applies for like-kind vehicles.",
    watchFor: [
      "Local sales tax variation: combined rates in Washington vary from 7% to 10.4%. Seattle buyers face some of the higher rates. Verify the rate for your dealer's location.",
      "Doc fee above the cap: any documentation fee above $200 is not permitted. Dealers also cannot call this fee 'required by law.' If you see a higher amount, it's above the cap.",
      "Title fee update: the title fee changed effective January 1, 2026. Make sure your quote reflects the current amount.",
    ],
    negotiationNote:
      "The Seattle metro has a competitive dealer market. With the doc fee capped at $200, negotiation is focused on vehicle price and add-ons. The local sales tax is fixed by the dealer's location — not negotiable.",
    ctaHeading: "Have a Washington State dealer quote you want to review?",
    ctaBody:
      "Paste the quote and Odigos checks whether the charges are itemized, whether the totals reconcile, and whether a fee exceeds a verified state cap. Market value stays unverified unless you optionally enter a factory window sticker MSRP. That sticker is not a live market price, and an unverified fee range is not a legal limit.",
    internalLinks: STANDARD_LINKS,
    sources: [
      "https://dor.wa.gov/education/industry-guides/auto-dealers/miscellaneous",
      "https://dol.wa.gov/vehicles-and-boats/vehicles/vehicle-registration/calculate-vehicle-tab-fees",
    ],
    specialNotes:
      "Cap $200 effective July 1, 2022. Dealers cannot represent fee as required by law. Title fee increased to $6.50 effective Jan 1, 2026.",
    dealerMessage:
      "Hi — I'm interested in a vehicle at your dealership and would like to confirm the full out-the-door price before visiting. Could you please send me an itemized breakdown showing the vehicle sale price, documentation fee (Washington caps this at $200), all additional dealer fees, Washington sales tax (6.5% + your local rate), title fee, and registration costs? I'd like to see the complete total. Thank you.",
    lastVerified: "2026-03",
    commonQuestions: [
      {
        q: "What is the doc fee cap in Washington State?",
        a: "Washington caps dealer documentation fees at $200, effective July 1, 2022. Dealers cannot legally charge more than this amount, and they're prohibited from representing the fee as 'required by law.' If your quote shows a doc fee above $200, the dealer is out of compliance.",
      },
      {
        q: "Why is Washington sales tax so different by city?",
        a: "Washington's base state sales tax is 6.5%, but cities and counties add their own rates on top — pushing the combined rate anywhere from 7% to 10.4%. Seattle buyers pay 10.25%, while some rural areas are closer to 7.7%. The tax is based on the dealer's location, not where you live, so the same car costs more in tax at a Seattle dealer than a dealer in a lower-rate city.",
      },
      {
        q: "Does Washington have a use tax on out-of-state vehicle purchases?",
        a: "Yes. If you buy a vehicle in Oregon (which has no sales tax) and bring it to Washington, you owe Washington use tax at your local rate — typically 7–10.4%. This is the 'use tax trap' that catches buyers who think buying across the border saves them money. The state enforces this at the time of registration.",
      },
      {
        q: "Does Washington allow a trade-in tax credit?",
        a: "Yes, but only for like-kind vehicles. If you're trading in a car toward another car purchase, the trade-in value reduces your taxable amount. If the trade-in is not like-kind (e.g., trading a boat toward a car), the deduction does not apply. Confirm with the dealer that the credit is applied correctly.",
      },
      {
        q: "What are Washington's EV registration fees?",
        a: "Washington charges an additional $225 annual fee for battery-electric vehicles and $75 for plug-in hybrids, on top of standard registration. These fees offset lost gas tax revenue. Factor them into your annual ownership cost when comparing EVs to gas vehicles in WA.",
      },
    ],
    competitorGapSection:
      "Most Washington car-buying guides mention the $200 doc fee cap and the 6.5% base tax — but they skip the use tax trap entirely. Buyers who purchase in Oregon to avoid sales tax still owe Washington use tax at their full local rate when they register the vehicle. On a $40,000 vehicle in Seattle, that's over $4,000 in use tax — exactly what you'd pay buying locally. The real savings opportunity in Washington is location arbitrage: buying from a dealer in a lower-tax city (7.7%) instead of Seattle (10.25%) can save $1,000+ on the same vehicle, legally.",
    pageTitle: "Washington Dealer Fees (2026): Verified $200 Ceiling — WA OTD Guide",
    buyerTip: "Washington State's doc fee cap prohibits dealers from representing the $200 documentation fee as 'required by law' — it is not a government charge. If a dealer tells you the $200 fee is mandatory or required, that statement itself may violate the cap rules. Washington combined local sales tax rates range from 7% to 10.4%, with Seattle-area buyers near the top of that range. Confirming your dealer's exact local rate matters more than the capped doc fee for most buyers.",
  },

  "west-virginia": {
    name: "West Virginia",
    abbreviation: "WV",
    slug: "west-virginia",
    docFeeRange: "Reported $300–$575 (not verified)",
    hasCap: false,
    metaDescription:
      "West Virginia's stored documentation-fee figure is not a verified legal cap. Reported $300–$575 (not verified). Compare the itemized out-the-door price before you sign.",
    capNote:
      "West Virginia has a stored documentation-fee figure of $575 in this file, and that figure needs a source. It is not a verified legal cap. Odigos will not call a higher fee illegal from that number alone. Unverified reports mention documentation fees around $300–$575. That range is not a market standard. Ask the dealer to itemize the charge, and confirm any limit with the state before you rely on it. Compare the itemized out-the-door price. A lower documentation fee with a higher vehicle price is not automatically a better deal.",
    salesTaxNote:
      "West Virginia charges 6% state sales tax on vehicle purchases, with local additions of up to 1%. Combined rates reach 7% in Charleston, Huntington, and Morgantown. Trade-in deductions are allowed.",
    registrationNote:
      "West Virginia registration varies by vehicle type and includes an annual wheel tax. Registration specifics vary by county.",
    introAngle:
      "West Virginia's doc fee cap increased from $499 to $575 in July 2024, with annual CPI adjustments beginning July 2025. Buyers should use the current cap amount rather than older references. The 6% state tax with modest local additions is relatively straightforward.",
    snippetAnswer:
      "West Virginia has a stored documentation-fee figure of $575 in this file, and that figure needs a source. It is not a verified legal cap. Unverified reports mention documentation fees around $300–$575. That range is not a market standard. State sales tax is 6% with local additions up to 7% combined.",
    watchFor: [
      "Updated cap: West Virginia's cap increased from $499 to $575 in July 2024. If you're using older references, update to the current cap amount.",
      "CPI adjustments: the cap adjusts annually by CPI from July 2025 onward. Verify the current year's cap before finalizing your OTD estimate.",
      "Local tax additions: cities like Charleston, Huntington, and Morgantown add 1% to the 6% base, reaching 7%.",
    ],
    negotiationNote:
      "West Virginia's market is less competitive than major metro areas. Compare quotes across the state's limited dealer network. The doc fee is capped, so focus negotiation on vehicle price and add-ons.",
    ctaHeading: "Have a West Virginia dealer quote you want to verify?",
    ctaBody:
      "Paste the quote and Odigos checks whether the charges are itemized, whether the totals reconcile, and whether a fee exceeds a verified state cap. Market value stays unverified unless you optionally enter a factory window sticker MSRP. That sticker is not a live market price, and an unverified fee range is not a legal limit.",
    internalLinks: STANDARD_LINKS,
    sources: [
      "https://code.wvlegislature.gov/17A-6A-8A/",
      "https://tax.wv.gov/Business/SalesAndUseTax/MunicipalSalesAndUseTax/Pages/MunicipalSalesAndUseTax.aspx",
    ],
    specialNotes:
      "$575 cap set by DMV Dealer Advisory Board effective July 1, 2024 (increased from $499). CPI-adjusted annually starting July 1, 2025. Per WV Code 17A-6A-8A.",
    dealerMessage:
      "Hi — I'm interested in a vehicle at your dealership and would like to confirm the full out-the-door price before visiting. Could you please send me an itemized breakdown showing the vehicle sale price, documentation fee (West Virginia's current cap is $575), all additional dealer fees, West Virginia sales tax (6% + your local rate if applicable), and registration/wheel tax costs? I'd like to see the complete total. Thank you.",
    lastVerified: "2026-03",
    buyerTip: "West Virginia's doc fee cap was raised from $175 to $575 by H.B. 5528 effective July 2025 — a 229% increase in a single legislative session. Buyers who used West Virginia as a benchmark for low fees should update their expectations: a $575 doc fee is now legally permissible. Trade-in deductions are allowed, so trading in a vehicle before the West Virginia sales tax is calculated can meaningfully reduce your tax burden on higher-value vehicles.",
  },

  wisconsin: {
    name: "Wisconsin",
    abbreviation: "WI",
    slug: "wisconsin",
    docFeeRange: "Reported $295–$500 (not verified)",
    hasCap: false,
    metaDescription:
      "Wisconsin does not have a verified documentation-fee cap on file. Reported $295–$500 (not verified). Compare the itemized out-the-door price before you sign.",
    capNote:
      "Wisconsin does not have a verified documentation-fee cap in this file. A stored note may say dealers set the fee, but that is not a legal finding that no cap exists. Unverified reports mention documentation fees around $295–$500. That range is not a market standard. Compare itemized out-the-door quotes instead of treating one line as legal or illegal.",
    salesTaxNote:
      "Wisconsin charges 5% state sales tax on vehicle purchases, with county and city additions. Milwaukee area buyers see the highest combined rate at 7.9%. Most other areas are at 5.5%, with 4 counties at 5%. Trade-in deductions are allowed.",
    registrationNote:
      "Wisconsin base registration is $85 per year, plus $175 annually for electric vehicles or $75 for hybrids. The title fee increased from $164.50 to approximately $214.50 effective October 1, 2025.",
    introAngle:
      "Wisconsin saw a significant title fee increase in October 2025 — from $164.50 to approximately $214.50. Buyers working from older OTD estimates should update this figure. Doc fees are without a verified cap on file in the moderate $295–$500 range. The 5% state rate with county additions is straightforward.",
    snippetAnswer:
      "Wisconsin does not have a verified documentation-fee cap in this file. A stored note may say dealers set the fee, but that is not a legal finding that no cap exists. Unverified reports mention documentation fees around $295–$500. That range is not a market standard. State tax is 5% with county additions up to 7.9% in Milwaukee.",
    watchFor: [
      "Title fee increase: Wisconsin's title fee jumped from ~$164 to ~$215 in October 2025. Update any older OTD estimates to reflect the new amount.",
      "EV/hybrid surcharges: EVs pay $175 additional annually, PHEVs pay $75 additional. Budget for these if you're buying an electrified vehicle.",
      "Milwaukee vs. other counties: Milwaukee's 7.9% combined rate is notably higher than the 5–5.5% elsewhere. Know your dealer's county.",
    ],
    negotiationNote:
      "Milwaukee and Madison have competitive dealer markets. The doc fee is without a verified cap on file — ask if it's flexible. The recent title fee increase adds to the OTD cost, so make sure your quote is current.",
    ctaHeading: "Have a Wisconsin dealer quote you want to review?",
    ctaBody:
      "Paste the quote and Odigos checks whether the charges are itemized, whether the totals reconcile, and whether a fee exceeds a verified state cap. Market value stays unverified unless you optionally enter a factory window sticker MSRP. That sticker is not a live market price, and an unverified fee range is not a legal limit.",
    internalLinks: STANDARD_LINKS,
    sources: [
      "https://wisconsindot.gov/Pages/dmv/vehicles/title-plates/fee-chart.aspx",
      "https://www.revenue.wi.gov/Pages/FAQS/pcs-taxrates.aspx",
    ],
    specialNotes:
      "Title fee increased from $164.50 to $214.50 effective Oct 1, 2025.",
    dealerMessage:
      "Hi — I'm interested in a vehicle at your dealership and would like to confirm the full out-the-door price before visiting. Could you please send me an itemized breakdown showing the vehicle sale price, documentation fee, all additional dealer fees, Wisconsin sales tax (5% + your county rate), title fee (~$215 as of Oct 2025), and registration costs ($85/year)? I'd like to see the complete total. Thank you.",
    lastVerified: "2026-03",
    buyerTip: "Wisconsin's title fee jumped approximately $50 in October 2025 — from $164.50 to roughly $214.50. Buyers using older OTD estimates or comparing across state lines with outdated data will underestimate this charge. Separately, EV buyers owe an additional $175/year surcharge on registration, and plug-in hybrids owe $75/year. These annual surcharges don't appear in the OTD quote but affect the total 5-year ownership cost significantly compared to non-electrified vehicles.",
  },

  wyoming: {
    name: "Wyoming",
    abbreviation: "WY",
    slug: "wyoming",
    docFeeRange: "Reported $200–$400 (not verified)",
    hasCap: false,
    metaDescription:
      "Wyoming does not have a verified documentation-fee cap on file. Reported $200–$400 (not verified). Compare the itemized out-the-door price before you sign.",
    capNote:
      "Wyoming does not have a verified documentation-fee cap in this file. A stored note may say dealers set the fee, but that is not a legal finding that no cap exists. Unverified reports mention documentation fees around $200–$400. That range is not a market standard. Compare itemized out-the-door quotes instead of treating one line as legal or illegal.",
    salesTaxNote:
      "Wyoming charges 4% state sales tax on vehicle purchases, with local additions of up to 5%. Combined rates vary from 4% in some areas to 9% in Teton Village/Alta. Jackson and Cheyenne are at 6%. Trade-in deductions are allowed.",
    registrationNote:
      "Wyoming registration consists of a $30 state fee plus a county fee calculated at 3% of the vehicle's factory price multiplied by a depreciation rate. A $10 VIN inspection fee is also required. No separate title fee exists — title is included.",
    introAngle:
      "Wyoming has no sales tax on vehicle purchases in most areas outside of tourist-heavy locations, but the 4% base with local additions means some areas (Teton Village, Jackson) reach 9% — one of the wider ranges in the country. Doc fees are without a verified cap on file but moderate. The unique VIN inspection fee is an additional small cost to include in your estimate.",
    snippetAnswer:
      "Wyoming does not have a verified documentation-fee cap in this file. A stored note may say dealers set the fee, but that is not a legal finding that no cap exists. Unverified reports mention documentation fees around $200–$400. That range is not a market standard. State sales tax is 4% with local additions up to 9% in tourist areas.",
    watchFor: [
      "High resort area tax rates: Teton Village and Alta reach 9% combined. Jackson is 6%. If you're buying near a tourist area, confirm the local rate.",
      "$10 VIN inspection fee: this is a state requirement for all vehicle purchases in Wyoming. It's a small fee but should be in your OTD.",
      "County registration formula: Wyoming registration is calculated using factory price and a depreciation schedule — not a flat fee. Confirm the exact amount for your specific vehicle.",
    ],
    negotiationNote:
      "Wyoming has a limited dealer market outside Cheyenne and Casper. The doc fee is without a verified cap on file and worth asking about. The unique county registration formula means getting the exact first-year registration cost from the dealer is important for an accurate OTD comparison.",
    ctaHeading: "Have a Wyoming dealer quote you want to verify?",
    ctaBody:
      "Paste the quote and Odigos checks whether the charges are itemized, whether the totals reconcile, and whether a fee exceeds a verified state cap. Market value stays unverified unless you optionally enter a factory window sticker MSRP. That sticker is not a live market price, and an unverified fee range is not a legal limit.",
    internalLinks: STANDARD_LINKS,
    sources: [
      "https://wyominglicenseplate.org/vehicle-registration-fees",
    ],
    specialNotes:
      "VIN inspection fee $10 additional.",
    dealerMessage:
      "Hi — I'm interested in a vehicle at your dealership and would like to confirm the full out-the-door price before visiting. Could you please send me an itemized breakdown showing the vehicle sale price, documentation fee, all additional dealer fees, Wyoming sales tax (4% + your local county rate), VIN inspection fee ($10), and registration costs (including county depreciation formula)? I'd like to see the complete total. Thank you.",
    lastVerified: "2026-03",
    buyerTip: "Wyoming's vehicle registration uses a county-by-county depreciation formula based on the manufacturer's suggested retail price (MSRP), not what you paid. In Teton County (Jackson), local tax options push the combined rate to 6%, but the registration formula is what makes Wyoming OTD costs variable — two identical vehicles in different counties will have different annual registration costs. Always ask for an itemized first-year registration estimate from the dealer and verify it against the Wyoming county treasurer's office online calculator.",
  },
};

export const STATE_SLUGS = Object.keys(STATE_FEES);
