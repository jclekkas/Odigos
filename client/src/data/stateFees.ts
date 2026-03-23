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
  sources: string[];
  specialNotes: string | null;
  dealerMessage: string;
  lastVerified: string;
}

const STANDARD_LINKS = [
  { href: "/out-the-door-price", label: "out-the-door price" },
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
    docFeeRange: "Typically $400–$700",
    hasCap: false,
    metaDescription:
      "Alabama has no cap on dealer doc fees — $400–$700 is common. The state tax is 4% with local additions up to 11%. See what Alabama car buyers actually pay.",
    capNote:
      "Alabama has no state law capping the documentation fee. Dealers set their own amounts, and fees of $400–$700 are commonly reported. There is no legal ceiling, so it pays to compare quotes across dealers.",
    salesTaxNote:
      "Alabama's state sales tax on vehicles is 4%, but local county and city taxes can push the combined rate as high as 11%. Rates vary significantly by jurisdiction — always verify the effective rate for your specific purchase location.",
    registrationNote:
      "Alabama registration includes a base state fee of approximately $23, plus county-specific fees that vary by location. Title fee is $15.",
    introAngle:
      "Alabama has no cap on dealer documentation fees, meaning buyers can see fees anywhere from a few hundred dollars to $700 or more at the same dealership on different days. The wide local tax variation — from 4% in some areas to over 10% in others — makes the OTD price harder to estimate without knowing your exact county. Understanding both the doc fee and your local rate is essential before comparing quotes.",
    snippetAnswer:
      "Alabama dealers typically charge $400–$700 in documentation fees with no state cap. The state sales tax is 4%, but combined local rates can reach 11% depending on your county. Always compare the full out-the-door price, not just the vehicle price.",
    watchFor: [
      "High local tax rates: Alabama's local additions can more than double the 4% base rate in some counties. Verify the combined rate for your purchase location before estimating your OTD total.",
      "Uncapped doc fees: Alabama has no limit on what dealers can charge. If the doc fee is above $600, ask whether it's the same for all customers or negotiable.",
      "Add-on packages: protection packages, paint sealant, and nitrogen tires are common in Alabama dealerships and are almost never required even when presented as standard.",
    ],
    negotiationNote:
      "Because Alabama has no doc fee cap, the fee is one of the items worth questioning. Some dealers will reduce it to close a deal, especially in competitive markets. Focus on the total OTD price and get competing quotes from multiple dealers to create leverage. The vehicle price is almost always the most flexible number in the deal.",
    ctaHeading: "Have an Alabama dealer quote you want to check?",
    ctaBody:
      "Not sure if your dealer quote is complete? Paste the message or quote you received and Odigos will flag anything unusual.",
    internalLinks: STANDARD_LINKS,
    sources: [
      "https://caredge.com/guides/car-dealer-doc-fee-by-state",
      "https://www.revenue.alabama.gov/sales-use/state-sales-use-tax-rates/",
    ],
    specialNotes: null,
    dealerMessage:
      "Hi — I'm interested in a vehicle at your dealership and would like to confirm the full out-the-door price before visiting. Could you please send me an itemized breakdown showing the vehicle sale price, documentation fee, all additional dealer fees, Alabama sales tax (state + local), title fee, and registration costs? I'd like to understand the complete total before scheduling a visit. Thank you.",
    lastVerified: "2026-03",
  },

  alaska: {
    name: "Alaska",
    abbreviation: "AK",
    slug: "alaska",
    docFeeRange: "Typically $0–$500",
    hasCap: false,
    metaDescription:
      "Alaska has no state sales tax — but doc fees are uncapped and municipal taxes may apply. A major 2025 enforcement action reshaped how dealers disclose fees.",
    capNote:
      "Alaska has no state cap on dealer documentation fees. A 2025 enforcement action against Lithia Motors resulted in a $300K civil penalty for hidden doc fees — dealers must now include the doc fee in their advertised price.",
    salesTaxNote:
      "Alaska has no state sales tax on vehicles. However, municipalities may impose their own sales tax ranging from 0% to 9.5%. If you're buying in Anchorage or another city, verify whether a local tax applies.",
    registrationNote:
      "Alaska registration fees run approximately $100 for a two-year registration period. The title fee is $15. Actual costs vary by municipality.",
    introAngle:
      "Alaska is one of five states with no state sales tax, which simplifies the OTD picture for buyers. However, doc fees are uncapped and can vary widely — and a December 2025 enforcement action against Lithia Motors ($300K civil penalty for hidden fees) put Alaska dealers on notice that fee transparency is required. Dealers must include the doc fee in advertised prices.",
    snippetAnswer:
      "Alaska has no state sales tax, but doc fees are uncapped and can range from nothing to $500. Municipal taxes may apply depending on where you purchase. A 2025 enforcement action established that doc fees must be included in advertised vehicle prices.",
    watchFor: [
      "Municipal sales taxes: Alaska has no state tax, but some cities and boroughs have local sales taxes up to 9.5%. Confirm whether a local tax applies at your dealership's location.",
      "Hidden or add-on doc fees: the 2025 Lithia Motors case shows that Alaska dealers have sometimes obscured fees. Ask for the doc fee to be itemized clearly before you agree to any price.",
      "Doc fee variability: without a cap, fees vary widely between dealers. Compare the full OTD quotes from multiple Alaska dealers, not just the advertised vehicle price.",
    ],
    negotiationNote:
      "Alaska's remote market means fewer dealers to compare in most areas — which reduces buyer leverage. Focus your energy on the vehicle price and ask for the doc fee to be disclosed upfront. In Anchorage, where competition is higher, you have more options. Always ask for a full itemized OTD breakdown before visiting.",
    ctaHeading: "Have an Alaska dealer quote you want reviewed?",
    ctaBody:
      "Not sure if your dealer quote is complete? Paste the message or quote you received and Odigos will flag anything unusual.",
    internalLinks: STANDARD_LINKS,
    sources: [
      "https://law.alaska.gov/press/releases/2025/122925-LithiaMotors.html",
    ],
    specialNotes:
      "Dec 2025: Lithia Motors ordered to pay $300K civil penalty for hidden doc fees. Dealers must include doc fees in advertised price.",
    dealerMessage:
      "Hi — I'm interested in a vehicle at your dealership and would like to confirm the full out-the-door price before visiting. Could you please send me an itemized breakdown showing the vehicle sale price, documentation fee, all additional dealer fees, any applicable local/municipal taxes, title fee, and registration costs? (Alaska has no state sales tax, but I want to know if any local tax applies.) I'd like to see the complete total. Thank you.",
    lastVerified: "2026-03",
  },

  arizona: {
    name: "Arizona",
    abbreviation: "AZ",
    slug: "arizona",
    docFeeRange: "Typically $400–$600",
    hasCap: false,
    metaDescription:
      "Arizona has no cap on dealer doc fees — $400–$600 is typical. The Transaction Privilege Tax adds 5.6% base, with local rates up to 11.2%. See the AZ OTD breakdown.",
    capNote:
      "Arizona has no state cap on dealer documentation fees. Dealers typically charge $400–$600, though some charge more. Because there's no legal limit, it's worth comparing fee disclosures across multiple dealers before committing.",
    salesTaxNote:
      "Arizona applies a Transaction Privilege Tax (TPT) on vehicle sales. The state base rate is 5.6%, and local city/county additions bring combined rates to 8.6% in Phoenix and up to 11.2% in some areas. The TPT applies to the full purchase price.",
    registrationNote:
      "Arizona registration includes a base $8 registration fee plus a Vehicle License Tax (VLT) calculated on the vehicle's assessed value. The VLT is roughly 60% of the MSRP at 1% per year, so a $40,000 vehicle in its first year carries a significant VLT. The title fee is $4.",
    introAngle:
      "Arizona has no cap on dealer doc fees, and buyers often encounter fees in the $400–$600 range. The state's Transaction Privilege Tax — essentially a sales tax on the dealer's gross income — applies to vehicle sales and varies significantly by city. Phoenix area buyers pay around 8.6%, while some areas approach 11%. The Vehicle License Tax, which is value-based rather than flat, can also surprise buyers who are used to simple flat-rate registration.",
    snippetAnswer:
      "Arizona dealers typically charge $400–$600 in documentation fees with no state cap. The Transaction Privilege Tax is 5.6% base with local additions up to 11.2% in some cities. Registration includes a value-based Vehicle License Tax that scales with the vehicle's price.",
    watchFor: [
      "Local TPT rates: Phoenix's combined rate (~8.6%) differs significantly from other cities. Always verify the effective tax rate for the dealer's location — it affects your OTD total more than the doc fee in many cases.",
      "Vehicle License Tax scaling: Arizona's VLT is calculated on a percentage of the vehicle's value and decreases with age. For new or near-new vehicles, the VLT is a meaningful additional cost — budget for it when estimating your OTD.",
      "Uncapped doc fees: ask for the doc fee to be disclosed before visiting. If it exceeds $600, ask whether the vehicle price can be adjusted to offset it.",
    ],
    negotiationNote:
      "Arizona's Phoenix metro is a competitive market with many dealers, which gives buyers real comparison leverage. Get competing OTD quotes from multiple dealers and use them to negotiate both vehicle price and doc fee. The doc fee is not capped, so it is technically negotiable — some dealers will reduce it to close a deal.",
    ctaHeading: "Have an Arizona dealer quote with fees you want to check?",
    ctaBody:
      "Not sure if your dealer quote is complete? Paste the message or quote you received and Odigos will flag anything unusual.",
    internalLinks: STANDARD_LINKS,
    sources: [
      "https://caredge.com/guides/car-dealer-doc-fee-by-state",
      "https://azdor.gov/business/transaction-privilege-tax/tax-rate-table",
    ],
    specialNotes: null,
    dealerMessage:
      "Hi — I'm interested in a vehicle at your dealership and would like to confirm the full out-the-door price before visiting. Could you please send me an itemized breakdown showing the vehicle sale price, documentation fee, all dealer fees, Arizona Transaction Privilege Tax (state + local rate for your city), Vehicle License Tax, title fee, and registration costs? I'd like to understand the complete total before scheduling a visit. Thank you.",
    lastVerified: "2026-03",
  },

  arkansas: {
    name: "Arkansas",
    abbreviation: "AR",
    slug: "arkansas",
    docFeeRange: "Capped at $129",
    hasCap: true,
    metaDescription:
      "Arkansas caps dealer 'service and handling' fees at $129 — one of the lowest caps in the country. The state uses a tiered sales tax based on vehicle price.",
    capNote:
      "Arkansas caps what dealers can charge for documentation (called 'service and handling fees') at $129. This is one of the lowest caps in the country. Dealers cannot legally exceed this amount. If you're seeing a higher fee, ask for clarification.",
    salesTaxNote:
      "Arkansas uses a tiered sales tax rate based on vehicle price: 0% for vehicles under $4,000, 3.5% for $4,000–$10,000, and 6.5% for vehicles over $10,000. Local additions of up to 5% apply, bringing some combined rates to 11.5%. Most buyers of new vehicles fall into the 6.5% base rate bracket.",
    registrationNote:
      "Arkansas registration fees range from $17 to $30 based on vehicle weight. The title fee is $10.",
    introAngle:
      "Arkansas offers one of the strongest buyer protections in the country on documentation fees — a hard $129 cap on 'service and handling fees.' Where buyers need to pay attention is the sales tax structure: Arkansas uses a tiered rate based on the vehicle price, plus local additions that can push rates well above 10% in some jurisdictions. The tax varies more than the doc fee here.",
    snippetAnswer:
      "Arkansas caps dealer 'service and handling' fees at $129 — one of the lowest caps nationally. Sales tax is tiered by vehicle price (6.5% for vehicles over $10K) with local additions up to 11.5%. The low doc fee cap means the main OTD variable is the vehicle price and local tax rate.",
    watchFor: [
      "Tiered sales tax: the 6.5% base rate only applies to vehicles over $10,000, but local additions can push the combined rate significantly higher. Know your local rate before estimating your OTD total.",
      "Fees above the $129 cap: any documentation or service fee above $129 is not permitted by Arkansas law. If you see a higher amount, ask the dealer to itemize and justify it.",
      "Additional dealer add-ons: with the doc fee capped low, dealers may bundle value into protection packages or accessories. These are usually optional and negotiable.",
    ],
    negotiationNote:
      "With the doc fee capped at $129, your negotiation leverage in Arkansas is focused on the vehicle price and any add-ons. The tiered tax structure means verifying your exact local rate is important before comparing OTD quotes across dealers. Get the full itemized breakdown in writing before agreeing to any price.",
    ctaHeading: "Have an Arkansas dealer quote you want to verify?",
    ctaBody:
      "Not sure if your dealer quote is complete? Paste the message or quote you received and Odigos will flag anything unusual.",
    internalLinks: STANDARD_LINKS,
    sources: [
      "https://caredge.com/guides/car-dealer-doc-fee-by-state",
      "https://www.dfa.arkansas.gov/office/taxes/excise-tax-administration/sales-use-tax/sales-use-tax-rates/state-sales-use-tax-rates/",
    ],
    specialNotes:
      "Called 'service and handling' fees. Tiered sales tax based on vehicle price.",
    dealerMessage:
      "Hi — I'm interested in a vehicle at your dealership and would like to confirm the full out-the-door price before visiting. Could you please send me an itemized breakdown showing the vehicle sale price, service and handling fee (capped at $129 in Arkansas), all additional dealer fees, Arkansas sales tax (state + local rate), title fee, and registration costs? I'd like to see the complete total. Thank you.",
    lastVerified: "2026-03",
  },

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
      "Not sure if your dealer quote is complete? Paste the message or quote you received and Odigos will flag anything unusual.",
    internalLinks: STANDARD_LINKS,
    sources: [
      "https://calmatters.org/politics/2025/10/california-car-dealer-fees-veto/",
      "https://cdtfa.ca.gov/taxes-and-fees/rates.aspx",
    ],
    specialNotes:
      "$85 for DMV private industry partners, $70 for other dealers. SB 791 (raise to $260) vetoed by Governor Newsom Oct 2025.",
    dealerMessage:
      "Hi — I'm interested in a vehicle at your dealership and would like to confirm the full out-the-door price before visiting. Could you please send me an itemized breakdown showing the vehicle sale price, documentation fee (California law caps this at ~$85), all additional dealer fees, California sales tax (state + local rate for your city), title fee, and registration/VLF costs? I'd like to see the complete total. Thank you.",
    lastVerified: "2026-03",
  },

  colorado: {
    name: "Colorado",
    abbreviation: "CO",
    slug: "colorado",
    docFeeRange: "Typically $400–$700",
    hasCap: false,
    metaDescription:
      "Colorado has no cap on dealer 'handling fees' — $400–$700 is common. The state tax is 2.9% plus local additions up to 8%. See the CO OTD picture.",
    capNote:
      "Colorado has no state cap on the dealer documentation fee (often called a 'dealer handling fee'). Fees of $400–$700 are common, with some dealers charging more. There is no legal ceiling, so comparison shopping across dealers is important.",
    salesTaxNote:
      "Colorado's base state sales tax on vehicles is 2.9%, but local county and city taxes add significantly — bringing combined rates up to 8% in some areas. The effective rate varies considerably by location, so confirm your local rate before comparing OTD quotes.",
    registrationNote:
      "Colorado registration fees vary by vehicle weight, age, and value. Costs include a state registration fee plus county-specific additions. Expect to pay several hundred dollars for first-year registration on a new vehicle.",
    introAngle:
      "Colorado's doc fee is typically in the $400–$700 range with no state cap — called a 'dealer handling fee' at many stores. The state sales tax rate is one of the lower base rates in the country at 2.9%, but local additions bring the effective rate to 6–8% in major areas. A lien filing fee also increased to $40 effective July 2025.",
    snippetAnswer:
      "Colorado dealers typically charge $400–$700 in documentation/handling fees with no state cap. The state sales tax base is 2.9%, with local additions bringing combined rates to around 6–8%. A lien filing fee of $40 applies if you're financing.",
    watchFor: [
      "Handling fee vs. doc fee: Colorado dealers often call the documentation charge a 'dealer handling fee' — it's the same charge but named differently. It's uncapped and can vary between dealers.",
      "Lien filing fee: as of July 1, 2025, Colorado charges a flat $40 lien filing fee for financed vehicles. This is a government fee, not a dealer markup.",
      "Local tax rate variation: combined rates in Denver and other cities are higher than the 2.9% state base. Confirm your effective rate before estimating your OTD total.",
    ],
    negotiationNote:
      "Colorado's competitive Front Range markets (Denver, Boulder, Fort Collins, Colorado Springs) give buyers multiple dealer options for the same vehicle. Use competing OTD quotes to create leverage on both the vehicle price and the handling fee. Since there's no cap, some dealers will reduce the fee to close a deal.",
    ctaHeading: "Have a Colorado dealer quote you want to review?",
    ctaBody:
      "Not sure if your dealer quote is complete? Paste the message or quote you received and Odigos will flag anything unusual.",
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
  },

  connecticut: {
    name: "Connecticut",
    abbreviation: "CT",
    slug: "connecticut",
    docFeeRange: "Typically $300–$600",
    hasCap: false,
    metaDescription:
      "Connecticut has no cap on dealer doc fees — $300–$600 is typical. Sales tax is 6.35% for vehicles under $50K and 7.75% above. See the CT OTD picture.",
    capNote:
      "Connecticut has no cap on dealer documentation fees. Several bills (HB 06544, HB 06827, SB 774) were proposed in 2025 to cap fees at 1% of the vehicle price, but none were enacted as of March 2026. Fees of $300–$600 are common.",
    salesTaxNote:
      "Connecticut applies a 6.35% sales tax on vehicles priced under $50,000, and 7.75% on vehicles $50,000 or above. There are no local additions — the state rate is uniform. The higher rate on luxury vehicles can meaningfully increase the OTD cost.",
    registrationNote:
      "Connecticut registration runs approximately $120 for a three-year period, plus various surcharges (approximately $71 additional). The title fee is $25.",
    introAngle:
      "Connecticut buyers face no doc fee cap despite several recent legislative attempts to install one. Fees in the $300–$600 range are typical. The state's two-tier tax structure — 6.35% under $50K, 7.75% above — means buyers of higher-end vehicles should budget accordingly. No local tax additions make the math simpler than in many other states.",
    snippetAnswer:
      "Connecticut dealers typically charge $300–$600 in documentation fees with no state cap. Sales tax is 6.35% for vehicles under $50,000 and 7.75% for those at or above. No local additions apply. Multiple bills to cap fees have failed to pass as of 2026.",
    watchFor: [
      "Luxury vehicle tax tier: the 7.75% rate kicks in at $50,000. If your vehicle is near that threshold, even a small negotiation on the sale price can drop you to the lower 6.35% bracket.",
      "Uncapped doc fees: Connecticut has no cap, so fees vary by dealer. Ask for the doc fee to be disclosed before you visit — and compare it across multiple dealers.",
      "Pending legislative changes: cap legislation may pass in future sessions. Check current status before your purchase.",
    ],
    negotiationNote:
      "Connecticut's competitive shoreline and metro markets mean dealers are often willing to negotiate vehicle price. The doc fee is uncapped, so it's worth asking whether it's flexible. Focus the overall negotiation on the total OTD price, including any add-ons or accessories that may be bundled.",
    ctaHeading: "Have a Connecticut dealer quote you want to review?",
    ctaBody:
      "Not sure if your dealer quote is complete? Paste the message or quote you received and Odigos will flag anything unusual.",
    internalLinks: STANDARD_LINKS,
    sources: [
      "https://portal.ct.gov/dmv/vehicle-services/sales-tax-registrations/sales-tax-calculator",
    ],
    specialNotes:
      "Multiple bills proposed in 2025 (HB 06544, HB 06827, SB 774) to cap at 1% of vehicle price. Not enacted as of March 2026.",
    dealerMessage:
      "Hi — I'm interested in a vehicle at your dealership and would like to confirm the full out-the-door price before visiting. Could you please send me an itemized breakdown showing the vehicle sale price, documentation fee, all additional dealer fees, Connecticut sales tax (6.35% or 7.75% depending on vehicle price), title fee, and registration costs? I'd like to see the complete total. Thank you.",
    lastVerified: "2026-03",
  },

  delaware: {
    name: "Delaware",
    abbreviation: "DE",
    slug: "delaware",
    docFeeRange: "Typically $300–$600",
    hasCap: false,
    metaDescription:
      "Delaware has no sales tax but charges a 5.25% state document fee on vehicle purchases. Dealer doc fees are uncapped. See what DE buyers actually pay.",
    capNote:
      "Delaware has no state cap on the dealer documentation fee. Doc fees of $300–$600 are common. A separate bill (HB 295) proposing a $475 cap on dealer processing fees was pending as of March 2026 but had not been enacted.",
    salesTaxNote:
      "Delaware has no traditional sales tax on vehicle purchases. However, the state charges a 5.25% 'document fee' (essentially a transfer tax) on the vehicle's purchase price. This increased from 4.25% effective October 1, 2025. This government fee is separate from the dealer documentation fee.",
    registrationNote:
      "Delaware charges approximately $40 per year for vehicle registration. The title fee is $35.",
    introAngle:
      "Delaware is one of five states with no sales tax — but the state makes up part of that difference with a 5.25% Document Fee applied at titling, which increased from 4.25% in October 2025. This is a government fee, not to be confused with the dealer's own documentation fee. Buyers often see two 'doc fee' line items in Delaware: one from the state and one from the dealer — make sure you understand which is which.",
    snippetAnswer:
      "Delaware has no traditional sales tax but charges a 5.25% state document fee on vehicle purchases (increased Oct 2025). Dealer documentation fees are separate and uncapped. Buyers should distinguish between the state document fee and any dealer-imposed documentation charge.",
    watchFor: [
      "Two types of 'document fees': Delaware has a state-level document fee (5.25% of purchase price) AND a dealer-level documentation fee. These are separate charges — make sure any quote itemizes both clearly.",
      "State document fee increase: the state fee increased from 4.25% to 5.25% effective October 2025. On a $35,000 vehicle, that's $1,837 in state fees — a significant jump.",
      "Dealer doc fee without a cap: HB 295 proposing a $475 cap was pending as of March 2026. Verify whether it has passed before your purchase.",
    ],
    negotiationNote:
      "The 5.25% state document fee is non-negotiable — it's a government charge. Your negotiation focus is on the vehicle price and any dealer-added doc fee or add-ons. Delaware's relatively small market means fewer competing dealers than in neighboring states.",
    ctaHeading: "Have a Delaware dealer quote you want to review?",
    ctaBody:
      "Not sure if your dealer quote is complete? Paste the message or quote you received and Odigos will flag anything unusual.",
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
  },

  "district-of-columbia": {
    name: "District of Columbia",
    abbreviation: "DC",
    slug: "district-of-columbia",
    docFeeRange: "Typically $300–$600",
    hasCap: false,
    metaDescription:
      "DC has no cap on dealer doc fees. Vehicle excise tax rates are weight-based and increasing. EV exemptions were removed in 2024. See the DC OTD breakdown.",
    capNote:
      "The District of Columbia has no cap on dealer documentation fees. Fees of $300–$600 are typical. There is no legal ceiling, so comparing quotes across multiple dealers is important.",
    salesTaxNote:
      "DC charges a weight-based excise tax on vehicle purchases rather than a traditional sales tax. Rates as of 2025: under 3,500 lbs at 6% (rising to 7% Oct 2026), 3,500–4,999 lbs at 7% (rising to 8%), and 5,000+ lbs at 8% (rising to 9%). Hybrid vehicles achieving 40+ mpg may qualify for an exemption. The EV exemption was removed effective October 2024.",
    registrationNote:
      "DC registration fees are weight-based and vary significantly by vehicle type. A 2.5% credit card service fee applies to DMV transactions effective December 15, 2025.",
    introAngle:
      "The District of Columbia uses a weight-based excise tax system rather than a standard sales tax, and tax rates are increasing in two steps (October 2025 and October 2026). The EV exemption was eliminated in 2024. Buyers should verify the current rates based on their specific vehicle's weight class before estimating their OTD total.",
    snippetAnswer:
      "DC has no doc fee cap and charges a weight-based excise tax (6–8% depending on vehicle weight) that is increasing in future years. The EV tax exemption was removed in 2024. Budget for the excise tax based on your specific vehicle's weight class.",
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
      "Not sure if your dealer quote is complete? Paste the message or quote you received and Odigos will flag anything unusual.",
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
      "Not sure if your dealer quote is complete? Paste the message or quote you received and Odigos will flag anything unusual.",
    internalLinks: STANDARD_LINKS,
    sources: [
      "https://www.etags.com/blog/dealer-fees-in-florida-the-legit-the-bogus-the-weird/",
      "https://floridarevenue.com/taxes/taxesfees/Pages/sales_tax.aspx",
    ],
    specialNotes:
      "Florida has some of the highest doc fees in the nation. No cap exists despite multiple legislative attempts.",
    dealerMessage:
      "Hi — I'm interested in a vehicle at your dealership and would like to confirm the full out-the-door price before visiting. Could you please send me an itemized breakdown showing the vehicle sale price, documentation fee, all additional dealer fees, Florida sales tax (state + county surtax for your location), title fee, and registration costs? I'd like to see the complete total, including any temporary tag or other fees. Thank you.",
    lastVerified: "2026-03",
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
      "Not sure if your dealer quote is complete? Paste the message or quote you received and Odigos will flag anything unusual.",
    internalLinks: STANDARD_LINKS,
    sources: [
      "https://dor.georgia.gov/title-ad-valorem-tax-tavt-faq",
      "https://consumered.georgia.gov/ask-ed/2019-10-30/what-maximum-amount-car-dealer-can-charge-doc-fees",
    ],
    specialNotes:
      "TAVT at 7.0% of fair market value is a one-time tax paid at titling. Must be included in advertised price per AG guidance.",
    dealerMessage:
      "Hi — I'm interested in a vehicle at your dealership and would like to confirm the full out-the-door price before visiting. Could you please send me an itemized breakdown showing the vehicle sale price, documentation fee, all additional dealer fees, Georgia Title Ad Valorem Tax (TAVT at 7% of state-assessed value), title fee, and registration costs? I'd like to see the complete total. Thank you.",
    lastVerified: "2026-03",
  },

  hawaii: {
    name: "Hawaii",
    abbreviation: "HI",
    slug: "hawaii",
    docFeeRange: "Typically $150–$350",
    hasCap: false,
    metaDescription:
      "Hawaii has no cap on dealer doc fees — $150–$350 is typical. The General Excise Tax is 4% with a 0.5% county surcharge. A luxury vehicle surcharge also applies.",
    capNote:
      "Hawaii has no state cap on dealer documentation fees. Fees in the $150–$350 range are commonly reported — lower than many mainland states, but still uncapped.",
    salesTaxNote:
      "Hawaii applies a General Excise Tax (GET) of 4% on vehicle sales, plus a 0.5% county surcharge in most counties. Unlike a traditional sales tax, GET is a tax on the seller's gross income — but it is effectively passed to the buyer. Private-party purchases are generally exempt. A luxury vehicle surcharge of 50% of applicable taxes applies to higher-priced vehicles.",
    registrationNote:
      "Hawaii registration includes a $46 state fee plus a county-level weight tax that typically ranges $100–$300 depending on the county and vehicle weight. Title fee is $10.",
    introAngle:
      "Hawaii's island location creates a unique vehicle market — inventory is limited, prices tend to be higher than on the mainland, and registration costs are structured differently. The General Excise Tax on vehicle sales, while similar to a sales tax in effect, is technically a business receipts tax. A luxury vehicle surcharge adds an additional cost for higher-priced vehicles. Doc fees are uncapped but tend to be lower than many mainland states.",
    snippetAnswer:
      "Hawaii dealers typically charge $150–$350 in documentation fees with no state cap. The General Excise Tax is 4% base plus a 0.5% county surcharge. A luxury vehicle surcharge adds 50% to applicable taxes for higher-priced vehicles. Vehicle prices and registration costs tend to be higher than on the mainland.",
    watchFor: [
      "Luxury vehicle surcharge: Hawaii adds a 50% surcharge to the applicable taxes on luxury vehicles. If your vehicle qualifies, factor this into your OTD estimate.",
      "GET passed through to buyer: while the GET is technically a seller's tax, it is routinely passed to buyers as part of the purchase price. Confirm how the dealer is handling this in the quote.",
      "Limited inventory and pricing: Hawaii's island market means fewer alternatives if you don't like a dealer's terms. Compare quotes across dealers on each island before committing.",
    ],
    negotiationNote:
      "Hawaii's limited market and island geography reduce competitive pressure. However, buyers on Oahu have more dealer options than those on other islands. Focus on the vehicle price and ask for the doc fee to be disclosed upfront. The GET and county surcharges are fixed — negotiation is focused on the pre-tax components.",
    ctaHeading: "Have a Hawaii dealer quote you want to verify?",
    ctaBody:
      "Not sure if your dealer quote is complete? Paste the message or quote you received and Odigos will flag anything unusual.",
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
  },

  idaho: {
    name: "Idaho",
    abbreviation: "ID",
    slug: "idaho",
    docFeeRange: "Typically $200–$400",
    hasCap: false,
    metaDescription:
      "Idaho has no cap on dealer doc fees — $200–$400 is typical. Sales tax is 6% with local additions up to 3%. Trade-in deductions are allowed. See the ID OTD picture.",
    capNote:
      "Idaho has no state cap on dealer documentation fees. Fees of $200–$400 are commonly reported — in the moderate range for uncapped states. There is no legal ceiling.",
    salesTaxNote:
      "Idaho charges a 6% state sales tax on vehicle purchases, with local option taxes adding up to 3% in some areas. Idaho allows trade-in deductions, meaning your trade-in value reduces the taxable purchase price per state statute IDAPA 35.01.02.044.",
    registrationNote:
      "Idaho registration fees vary by vehicle weight and value. The title fee is $14.",
    introAngle:
      "Idaho has no doc fee cap, but fees tend to be in the moderate range of $200–$400. The state allows trade-in deductions, which can meaningfully reduce the taxable amount if you're trading in a vehicle. The 6% state tax with local additions is straightforward compared to many other states.",
    snippetAnswer:
      "Idaho dealers typically charge $200–$400 in documentation fees with no state cap. The state sales tax is 6% plus local additions up to 3%. Idaho allows full trade-in deductions from the taxable amount.",
    watchFor: [
      "Trade-in credit: Idaho allows trade-in value to reduce the taxable purchase price — make sure the dealer is applying this deduction before calculating your sales tax.",
      "Local tax additions: some Idaho areas have local option sales taxes that increase the effective rate above 6%. Confirm the rate for your dealer's location.",
      "Uncapped doc fees: $200–$400 is typical, but some dealers charge more. Ask for the fee to be disclosed before visiting.",
    ],
    negotiationNote:
      "Idaho's market is less competitive than major metro areas, particularly outside Boise. Compare competing quotes across the Treasure Valley area if possible. The trade-in deduction is a meaningful benefit — make sure it's properly applied to reduce your tax bill.",
    ctaHeading: "Have an Idaho dealer quote you want to review?",
    ctaBody:
      "Not sure if your dealer quote is complete? Paste the message or quote you received and Odigos will flag anything unusual.",
    internalLinks: STANDARD_LINKS,
    sources: [
      "https://caredge.com/guides/car-dealer-doc-fee-by-state",
      "https://tax.idaho.gov/taxes/sales-use/online-guide/",
    ],
    specialNotes: null,
    dealerMessage:
      "Hi — I'm interested in a vehicle at your dealership and would like to confirm the full out-the-door price before visiting. Could you please send me an itemized breakdown showing the vehicle sale price, documentation fee, all additional dealer fees, Idaho sales tax (6% + local, applied after any trade-in deduction), title fee, and registration costs? I'd like to see the complete total. Thank you.",
    lastVerified: "2026-03",
  },

  illinois: {
    name: "Illinois",
    abbreviation: "IL",
    slug: "illinois",
    docFeeRange: "Capped at $378 (2026)",
    hasCap: true,
    metaDescription:
      "Illinois caps dealer doc fees at $378 for 2026 — adjusted annually by CPI. Trade-in credit is unlimited. Chicago area combined tax reaches 10.25%. See the IL OTD picture.",
    capNote:
      "Illinois caps dealer documentation fees by statute, with the amount adjusted annually by CPI. For 2026, the cap is $377.63 (commonly cited as $378). The cap started at $300 when enacted in 2020 and has increased roughly 2–3% per year. Dealers cannot legally exceed this amount.",
    salesTaxNote:
      "Illinois charges 6.25% in state sales tax on vehicles, with local additions of up to 4%. Chicago's combined rate is 10.25% — one of the highest in the country. Trade-in deductions are unlimited as of January 1, 2022 (Public Act 102-0353 removed the prior $10,000 cap), meaning your full trade-in value can reduce the taxable amount.",
    registrationNote:
      "Illinois registration is $151 per year for standard vehicles, with an additional $100 annual fee for electric vehicles. The title fee is $165.",
    introAngle:
      "Illinois has one of the more robust consumer protection frameworks for car buyers: a CPI-adjusted cap on doc fees and an unlimited trade-in deduction as of 2022. The cap for 2026 is approximately $378. Buyers in the Chicago metro, however, should be prepared for one of the higher combined sales tax rates in the country — 10.25% — which significantly affects the OTD total on any vehicle.",
    snippetAnswer:
      "Illinois caps dealer doc fees at approximately $378 for 2026 (adjusted annually). The state sales tax is 6.25% with local additions up to 10.25% in Chicago. Trade-in deductions are unlimited, which can significantly reduce the taxable amount.",
    watchFor: [
      "Chicago combined tax rate: at 10.25%, the Chicago combined rate means $4,100 in tax on a $40,000 vehicle. Buyers in the suburbs may see lower rates — confirm your dealer's location.",
      "Doc fee above the cap: any documentation fee above $378 in 2026 is above the legal limit. Ask for clarification if you see a higher amount.",
      "Trade-in credit: Illinois allows the full trade-in value to reduce the taxable purchase price with no dollar cap. Make sure this deduction is applied before your tax is calculated.",
    ],
    negotiationNote:
      "Illinois's competitive Chicagoland market gives buyers real leverage when comparing dealers. With the doc fee capped, your main negotiation points are the vehicle price and any dealer add-ons. For buyers trading in a vehicle, ensuring the unlimited trade-in deduction is properly applied can save hundreds in sales tax.",
    ctaHeading: "Have an Illinois dealer quote you want to verify?",
    ctaBody:
      "Not sure if your dealer quote is complete? Paste the message or quote you received and Odigos will flag anything unusual.",
    internalLinks: STANDARD_LINKS,
    sources: [
      "https://www.ilsos.gov/departments/vehicles/basicfees.html",
      "https://www.cata.info/news-and-announcements/13290052",
    ],
    specialNotes:
      "Cap adjusts annually by CPI. Modern cap started at $300 effective Jan 1, 2020. For 2025: $367.70. For 2026: $377.63. Increases ~2–3%/year.",
    dealerMessage:
      "Hi — I'm interested in a vehicle at your dealership and would like to confirm the full out-the-door price before visiting. Could you please send me an itemized breakdown showing the vehicle sale price, documentation fee (capped by Illinois law — $378 for 2026), all additional dealer fees, Illinois sales tax (6.25% + local rate), title fee, and registration costs? If I'm trading in a vehicle, please show the trade-in deduction before calculating tax. I'd like to see the complete total. Thank you.",
    lastVerified: "2026-03",
  },

  indiana: {
    name: "Indiana",
    abbreviation: "IN",
    slug: "indiana",
    docFeeRange: "Capped at $251",
    hasCap: true,
    metaDescription:
      "Indiana caps dealer doc fees at $251 (as of July 2025, CPI-adjusted). The state tax is a flat 7% with no local additions. See what Indiana car buyers actually pay.",
    capNote:
      "Indiana caps dealer documentation fees with annual CPI adjustments. The cap effective July 1, 2025 is $251.05. Dealers must include the doc fee in their advertised price and disclose it separately on the bill of sale. Any fee above $251 is not permitted.",
    salesTaxNote:
      "Indiana charges a flat 7% sales tax statewide on vehicle purchases. There are no local additions — the rate is uniform across all Indiana counties, making the tax calculation predictable.",
    registrationNote:
      "Indiana base registration is $21.35 per year plus a $15 infrastructure fee. The title fee is $15.",
    introAngle:
      "Indiana offers clear, predictable fee structure for car buyers: a capped doc fee (currently $251), a flat 7% statewide tax with no local variation, and a requirement that the doc fee appear in advertised prices. This makes comparing OTD quotes across Indiana dealers more straightforward than in most other states.",
    snippetAnswer:
      "Indiana caps dealer documentation fees at $251 (as of July 2025, CPI-adjusted annually). The state sales tax is a flat 7% with no local additions. Dealers must include the doc fee in advertised prices.",
    watchFor: [
      "Doc fee at or near the cap: in Indiana, fees often cluster at the maximum allowed amount. Confirm the exact figure and whether it's been disclosed in the advertised price.",
      "Add-on packages: with the doc fee and tax predictable, dealers may push more aggressively on add-on products. Protection packages and extended warranties are almost always optional.",
      "Annual CPI adjustments: the cap increases each year. Verify the current year's cap amount if you're comparing across time.",
    ],
    negotiationNote:
      "Indiana's straightforward fee structure means your negotiation is focused almost entirely on the vehicle price and any add-ons. The doc fee and tax are both effectively fixed — which makes the math simpler. Compare OTD quotes from multiple Indiana dealers on the same vehicle for the clearest comparison.",
    ctaHeading: "Have an Indiana dealer quote you want to review?",
    ctaBody:
      "Not sure if your dealer quote is complete? Paste the message or quote you received and Odigos will flag anything unusual.",
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
  },

  iowa: {
    name: "Iowa",
    abbreviation: "IA",
    slug: "iowa",
    docFeeRange: "Capped at $180",
    hasCap: true,
    metaDescription:
      "Iowa caps dealer doc fees at $180 by statute. The registration fee is 5% of purchase price. Title fee increased to $35 in January 2025. See the IA OTD picture.",
    capNote:
      "Iowa caps dealer documentation fees at $180 under Iowa Code §322.19A. Dealers cannot legally charge more. The cap is a hard statutory limit — not a recommendation.",
    salesTaxNote:
      "Iowa charges a 5% registration fee on vehicle purchases rather than a traditional sales tax, with an optional 1% Local Option Sales Tax in some jurisdictions. Trade-in deductions apply for same-transaction dealer sales.",
    registrationNote:
      "Iowa registration fees vary based on vehicle weight and list price. The title fee increased from $25 to $35 effective January 1, 2025. Registration costs vary widely depending on vehicle type and weight.",
    introAngle:
      "Iowa's $180 cap on documentation fees is clear, statutory, and enforced. Buyers benefit from predictable doc fees and a 5% registration rate structure. The title fee increased to $35 in January 2025 — a meaningful change to factor into your OTD estimate if you're working from older references.",
    snippetAnswer:
      "Iowa caps dealer documentation fees at $180 per state statute. The purchase 'registration fee' is 5% of the price (not a traditional sales tax). Title fee increased to $35 as of January 2025.",
    watchFor: [
      "Title fee change: Iowa's title fee increased from $25 to $35 effective January 1, 2025. If you're working from older OTD estimates, update this number.",
      "Registration as a 5% fee: Iowa structures its vehicle transfer tax as a registration fee rather than a sales tax — it functions similarly but may be labeled differently on your quote.",
      "Local Option Sales Tax: some jurisdictions may add 1% local option tax on top of the 5% base. Confirm whether your purchase location has this addition.",
    ],
    negotiationNote:
      "With the doc fee capped at $180, your negotiation leverage in Iowa is focused on the vehicle price and any add-ons. Iowa's market is less competitive than major metro areas, so get competing quotes from multiple dealers before committing.",
    ctaHeading: "Have an Iowa dealer quote you want to review?",
    ctaBody:
      "Not sure if your dealer quote is complete? Paste the message or quote you received and Odigos will flag anything unusual.",
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
  },

  kansas: {
    name: "Kansas",
    abbreviation: "KS",
    slug: "kansas",
    docFeeRange: "Typically $200–$400",
    hasCap: false,
    metaDescription:
      "Kansas has no cap on dealer doc fees — $200–$400 is typical. Sales tax is 6.5% plus local additions up to 10.6%. Trade-in window expanded to 120 days in 2025.",
    capNote:
      "Kansas has no state cap on dealer documentation fees. Fees of $200–$400 are commonly reported. There is no legal ceiling, so comparison shopping is important.",
    salesTaxNote:
      "Kansas charges 6.5% state sales tax on vehicles, with local additions of up to 4.1% in some areas. Combined rates can reach 10.6% in high-tax jurisdictions. A 120-day trade-in window (expanded as of January 1, 2025) allows full deduction of trade-in value from the taxable amount.",
    registrationNote:
      "Kansas registration fees range from approximately $42.50 to $52.25 depending on vehicle type. The title fee is $21.",
    introAngle:
      "Kansas has no cap on doc fees and a sales tax structure that varies significantly by locality. The 2025 expansion of the trade-in window to 120 days is a buyer-friendly change — if you're trading in a vehicle purchased up to 120 days ago, it can reduce your taxable amount. Combined local rates can approach 10% or more in some areas.",
    snippetAnswer:
      "Kansas dealers typically charge $200–$400 in documentation fees with no state cap. State sales tax is 6.5% plus local additions up to 10.6%. A 120-day trade-in window allows full deduction from the taxable amount.",
    watchFor: [
      "Local tax rate variation: combined rates can reach 10.6% in some Kansas jurisdictions. Verify your dealer's effective rate before estimating your OTD total.",
      "Trade-in window: the 120-day trade-in deduction window was expanded in 2025. If you recently purchased a vehicle you're trading in, confirm that the deduction is properly applied.",
      "Uncapped doc fees: ask for the documentation fee before visiting. If it exceeds $400, compare with other dealers.",
    ],
    negotiationNote:
      "Kansas markets outside Wichita and Kansas City tend to have fewer competing dealers, which limits buyer leverage. Get multiple competing quotes and focus negotiation on the vehicle price. The trade-in credit, if applicable, can meaningfully reduce your tax obligation.",
    ctaHeading: "Have a Kansas dealer quote you want to verify?",
    ctaBody:
      "Not sure if your dealer quote is complete? Paste the message or quote you received and Odigos will flag anything unusual.",
    internalLinks: STANDARD_LINKS,
    sources: [
      "https://caredge.com/guides/car-dealer-doc-fee-by-state",
      "https://www.ksrevenue.gov/pub1526.html",
    ],
    specialNotes: null,
    dealerMessage:
      "Hi — I'm interested in a vehicle at your dealership and would like to confirm the full out-the-door price before visiting. Could you please send me an itemized breakdown showing the vehicle sale price, documentation fee, all additional dealer fees, Kansas sales tax (6.5% + local rate for your location), title fee, and registration costs? If I have a trade-in, please show the deduction before calculating tax. I'd like to see the complete total. Thank you.",
    lastVerified: "2026-03",
  },

  kentucky: {
    name: "Kentucky",
    abbreviation: "KY",
    slug: "kentucky",
    docFeeRange: "Typically $300–$600",
    hasCap: false,
    metaDescription:
      "Kentucky has no cap on dealer doc fees — $300–$600 is typical. The Motor Vehicle Usage Tax is a flat 6% statewide with no local additions. See the KY OTD picture.",
    capNote:
      "Kentucky has no state cap on dealer documentation fees. Fees of $300–$600 are commonly reported. There is no legal ceiling, making comparison shopping important.",
    salesTaxNote:
      "Kentucky charges a 6% Motor Vehicle Usage Tax on vehicle sales. The rate is flat statewide with no local additions, making the tax calculation predictable. The MVUT applies to the full vehicle price, with trade-in deductions allowed for new vehicles.",
    registrationNote:
      "Kentucky base registration is $21 per year. The title fee is $9.",
    introAngle:
      "Kentucky has no doc fee cap, but its Motor Vehicle Usage Tax is simple: a flat 6% with no local variation. The lack of local additions makes the tax portion of your OTD easy to calculate — the main variable is the doc fee itself, which ranges from $300 to $600 across dealers.",
    snippetAnswer:
      "Kentucky dealers typically charge $300–$600 in documentation fees with no state cap. The Motor Vehicle Usage Tax is a flat 6% with no local additions — making the tax portion of your OTD predictable.",
    watchFor: [
      "Uncapped doc fees: $300–$600 is typical, but some dealers charge more. Ask for the fee to be disclosed before visiting.",
      "New vs. used trade-in credit: Kentucky allows trade-in deductions for new vehicles but limits them for used vehicles. Clarify how the credit applies to your specific transaction.",
      "Dealer add-ons: protection packages and extended warranties are common in Kentucky dealerships. Always confirm what's included in the vehicle price.",
    ],
    negotiationNote:
      "Kentucky's flat 6% MVUT means the tax portion of your deal is predictable — negotiation focuses on the vehicle price, doc fee, and add-ons. Louisville and Lexington have multiple competing dealers, which improves your leverage.",
    ctaHeading: "Have a Kentucky dealer quote you want to review?",
    ctaBody:
      "Not sure if your dealer quote is complete? Paste the message or quote you received and Odigos will flag anything unusual.",
    internalLinks: STANDARD_LINKS,
    sources: [
      "https://revenue.ky.gov/Property/Motor-Vehicles/Pages/Motor-Vehicle-Usage-Tax.aspx",
      "https://caredge.com/guides/car-dealer-doc-fee-by-state",
    ],
    specialNotes: null,
    dealerMessage:
      "Hi — I'm interested in a vehicle at your dealership and would like to confirm the full out-the-door price before visiting. Could you please send me an itemized breakdown showing the vehicle sale price, documentation fee, all additional dealer fees, Kentucky Motor Vehicle Usage Tax (6% flat), title fee ($9), and registration costs ($21/year)? I'd like to see the complete total. Thank you.",
    lastVerified: "2026-03",
  },

  louisiana: {
    name: "Louisiana",
    abbreviation: "LA",
    slug: "louisiana",
    docFeeRange: "Capped at $425 (CPI-adjusted)",
    hasCap: true,
    metaDescription:
      "Louisiana caps dealer doc fees at $425, CPI-adjusted starting 2026. State sales tax is 5% (raised Jan 2025). Local additions can bring combined rates to 13.5% — among the highest in the US.",
    capNote:
      "Louisiana caps dealer documentation fees at $425, with CPI adjustments beginning January 1, 2026. This cap is set by statute (LA RS 6:969.18). Dealers cannot legally exceed this amount.",
    salesTaxNote:
      "Louisiana's state sales tax on vehicles increased from 4.45% to 5% effective January 1, 2025. Local additions can bring combined rates as high as 13.5% in some jurisdictions (Monroe, Sterlington) — among the highest combined vehicle tax rates in the country. Most buyers see combined rates of 8–12% depending on location.",
    registrationNote:
      "Louisiana registration is calculated at 0.1% of the vehicle's value annually, with a minimum of $20, paid on a two-year basis. The title fee is $69.",
    introAngle:
      "Louisiana has the highest potential combined sales tax rates in the country — some jurisdictions reach 13.5%. The state rate also increased to 5% in January 2025. The $425 doc fee cap provides some protection on the dealer side, but buyers need to budget carefully for local sales taxes, which vary dramatically by parish.",
    snippetAnswer:
      "Louisiana caps dealer documentation fees at $425 (CPI-adjusted starting 2026). The state sales tax increased to 5% in January 2025, and combined local rates can reach 13.5% — the highest in the US. Verify your local rate before estimating your OTD total.",
    watchFor: [
      "Extreme local tax variation: Louisiana's combined rates vary from about 5% in some areas to 13.5% in others. The local tax can add thousands of dollars to the OTD on the same vehicle depending on where you buy.",
      "Recent state tax increase: the state rate increased from 4.45% to 5% in January 2025. If you're working from older estimates, update your numbers.",
      "Doc fee near the cap: many Louisiana dealers charge at or near the $425 cap. Confirm the exact fee before visiting.",
    ],
    negotiationNote:
      "The local sales tax in Louisiana is fixed by your purchase location — it's not negotiable. Focus your negotiation energy on the vehicle price and any add-ons. The doc fee is capped at $425, so the main leverage points are above-cap fees and dealer-installed packages.",
    ctaHeading: "Have a Louisiana dealer quote you want to review?",
    ctaBody:
      "Not sure if your dealer quote is complete? Paste the message or quote you received and Odigos will flag anything unusual.",
    internalLinks: STANDARD_LINKS,
    sources: [
      "https://law.justia.com/codes/louisiana/revised-statutes/title-6/rs-6-969-18/",
    ],
    specialNotes:
      "Doc fee cap $425, CPI-adjusted annually starting Jan 1, 2026. State rate increased Jan 2025.",
    dealerMessage:
      "Hi — I'm interested in a vehicle at your dealership and would like to confirm the full out-the-door price before visiting. Could you please send me an itemized breakdown showing the vehicle sale price, documentation fee (Louisiana law caps this at $425), all additional dealer fees, Louisiana sales tax (5% state + your local parish rate), title fee ($69), and registration costs? I'd like to see the complete total. Thank you.",
    lastVerified: "2026-03",
  },

  maine: {
    name: "Maine",
    abbreviation: "ME",
    slug: "maine",
    docFeeRange: "Typically $300–$600",
    hasCap: false,
    metaDescription:
      "Maine has no cap on dealer doc fees — $300–$600 is typical. The state tax is a flat 5.5% with no local additions. See what Maine car buyers actually pay.",
    capNote:
      "Maine has no state cap on dealer documentation fees. Fees of $300–$600 are commonly reported. There is no legal ceiling. Maine statute §953-A governs fee disclosure requirements.",
    salesTaxNote:
      "Maine charges a flat 5.5% sales tax on vehicle purchases statewide. There are no local additions — the rate is uniform across all Maine counties. Trade-in deductions are allowed when both vehicles are in the same category.",
    registrationNote:
      "Maine base registration runs approximately $35 for a two-year period. The title fee is $33.",
    introAngle:
      "Maine has a simple, uniform tax structure for vehicle purchases — 5.5% flat with no local variation. Doc fees are uncapped but tend to be in a moderate range. The flat tax makes it easy to calculate the tax portion of your OTD without looking up local rates.",
    snippetAnswer:
      "Maine dealers typically charge $300–$600 in documentation fees with no state cap. The state sales tax is a flat 5.5% with no local additions, making the tax portion of your OTD predictable.",
    watchFor: [
      "Uncapped doc fees: Maine has no cap, so fees vary by dealer. Get the fee disclosed before your visit and compare across dealers.",
      "Trade-in credit: Maine allows trade-in deductions for same-category vehicles. Make sure this credit is applied before your tax is calculated.",
      "Dealer add-ons: ask for an itemized OTD breakdown to identify any add-ons included in the vehicle price.",
    ],
    negotiationNote:
      "Maine's less-populated market means fewer competing dealers, particularly outside of Portland and Bangor. Get OTD quotes from multiple dealers and focus negotiation on the vehicle price and the doc fee. With no cap, the doc fee is technically negotiable.",
    ctaHeading: "Have a Maine dealer quote you want to verify?",
    ctaBody:
      "Not sure if your dealer quote is complete? Paste the message or quote you received and Odigos will flag anything unusual.",
    internalLinks: STANDARD_LINKS,
    sources: [
      "https://legislature.maine.gov/statutes/29-a/title29-Asec953-A.html",
      "https://www.maine.gov/revenue/taxes/sales-use-service-provider-tax/rates-due-dates",
    ],
    specialNotes: null,
    dealerMessage:
      "Hi — I'm interested in a vehicle at your dealership and would like to confirm the full out-the-door price before visiting. Could you please send me an itemized breakdown showing the vehicle sale price, documentation fee, all additional dealer fees, Maine sales tax (5.5% flat), title fee ($33), and registration costs? I'd like to see the complete total. Thank you.",
    lastVerified: "2026-03",
  },

  maryland: {
    name: "Maryland",
    abbreviation: "MD",
    slug: "maryland",
    docFeeRange: "Capped at $800",
    hasCap: true,
    metaDescription:
      "Maryland caps dealer doc fees at $800 (increased from ~$500 via SB 362, July 2024). The vehicle excise tax increased to 6.5% in July 2025. See the MD OTD picture.",
    capNote:
      "Maryland caps dealer documentation fees at $800, effective July 1, 2024 (SB 362). This increased from a prior cap of approximately $500. No dealer can legally charge more than $800 for documentation.",
    salesTaxNote:
      "Maryland charges a vehicle excise tax of 6.5% on vehicle purchases, effective July 1, 2025 (increased from 6%). The rate applies statewide with no local additions for vehicles. It is applied to the purchase price.",
    registrationNote:
      "Maryland registration runs $120.50–$191.50 per year depending on vehicle weight, plus a $40 annual EMS surcharge. The title fee is $200 — one of the higher title fees in the country.",
    introAngle:
      "Maryland buyers have seen two significant changes in 2024–2025: the doc fee cap increased from approximately $500 to $800 (SB 362, July 2024), and the vehicle excise tax increased from 6% to 6.5% (July 2025). The $200 title fee is also notably high compared to most states. Budget for these updated amounts when estimating your OTD.",
    snippetAnswer:
      "Maryland caps dealer documentation fees at $800 (increased July 2024). The vehicle excise tax increased to 6.5% in July 2025. The title fee is $200 — higher than most states. Both the cap and tax rate changed recently.",
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
      "Not sure if your dealer quote is complete? Paste the message or quote you received and Odigos will flag anything unusual.",
    internalLinks: STANDARD_LINKS,
    sources: [
      "https://mva.maryland.gov/businesses/Documents/bulletins/2024/Bulletin%20-%20Vehicle%20Reg%20Fees,%20Term,%20and%20Weight%20Changes_SB%20362.pdf",
    ],
    specialNotes:
      "Doc fee cap increased from ~$500 to $800 effective July 1, 2024 (SB 362). Sales tax increased from 6% to 6.5% effective July 1, 2025.",
    dealerMessage:
      "Hi — I'm interested in a vehicle at your dealership and would like to confirm the full out-the-door price before visiting. Could you please send me an itemized breakdown showing the vehicle sale price, documentation fee (Maryland's cap is $800), all additional dealer fees, Maryland excise tax (6.5%), title fee ($200), and registration costs? I'd like to see the complete total. Thank you.",
    lastVerified: "2026-03",
  },

  massachusetts: {
    name: "Massachusetts",
    abbreviation: "MA",
    slug: "massachusetts",
    docFeeRange: "Typically $300–$500",
    hasCap: false,
    metaDescription:
      "Massachusetts has no cap on general dealer doc fees. The state tax is a flat 6.25%. A $5 title preparation fee cap exists separately. See the MA OTD breakdown.",
    capNote:
      "Massachusetts caps the 'title preparation fee' at $5 per Directive 14-1, but general dealer documentation fees are uncapped. Fees of $300–$500 are common. There is no hard limit on the overall doc fee.",
    salesTaxNote:
      "Massachusetts charges a flat 6.25% sales tax on vehicle purchases statewide. There are no local additions — the rate is uniform across all Massachusetts cities and counties. Trade-in deductions are allowed.",
    registrationNote:
      "Massachusetts registration runs approximately $60 for a two-year period. The title fee is $75.",
    introAngle:
      "Massachusetts buyers should note an important distinction: the state caps the 'title preparation fee' at $5, but the broader 'documentation fee' that most dealers charge is uncapped. Fees of $300–$500 are common. The state's 6.25% flat tax is uniform — no need to look up local rates.",
    snippetAnswer:
      "Massachusetts caps the title preparation fee at $5 but general documentation fees are uncapped at $300–$500. The state sales tax is a flat 6.25% with no local additions.",
    watchFor: [
      "Title prep vs. doc fee: Massachusetts caps the 'title preparation fee' at $5, but the broader documentation fee is uncapped. These may be billed as one combined charge — ask for them to be itemized separately.",
      "Uncapped doc fees: $300–$500 is typical, but some dealers charge more. Compare across dealers before committing.",
      "Dealer add-ons: protection packages are common. Ask for everything included in the vehicle price to be listed explicitly.",
    ],
    negotiationNote:
      "Massachusetts's competitive Boston metro market gives buyers real leverage. Compare OTD quotes from multiple dealers. The doc fee is uncapped and worth asking about — some dealers will reduce it to close a deal.",
    ctaHeading: "Have a Massachusetts dealer quote you want to verify?",
    ctaBody:
      "Not sure if your dealer quote is complete? Paste the message or quote you received and Odigos will flag anything unusual.",
    internalLinks: STANDARD_LINKS,
    sources: [
      "https://www.mass.gov/directive/directive-14-1-document-and-title-preparation-fees-charged-by-motor-vehicle-dealers",
      "https://www.mass.gov/guides/motor-vehicle-and-trailer-sales-and-use-tax",
    ],
    specialNotes:
      "Title prep fee only is capped at $5 per Directive 14-1. General doc fees are uncapped.",
    dealerMessage:
      "Hi — I'm interested in a vehicle at your dealership and would like to confirm the full out-the-door price before visiting. Could you please send me an itemized breakdown showing the vehicle sale price, documentation/processing fee (please itemize separately from any title preparation fee), all additional dealer fees, Massachusetts sales tax (6.25% flat), title fee ($75), and registration costs? I'd like to see the complete total. Thank you.",
    lastVerified: "2026-03",
  },

  michigan: {
    name: "Michigan",
    abbreviation: "MI",
    slug: "michigan",
    docFeeRange: "Capped at $280 or 5% of price (whichever is less)",
    hasCap: true,
    metaDescription:
      "Michigan caps dealer doc fees at $280 or 5% of the vehicle price, whichever is less. Per DIFS Bulletin 2025-03-CF. The state tax is a flat 6%. See the MI OTD picture.",
    capNote:
      "Michigan caps dealer documentation fees at $280 OR 5% of the vehicle price, whichever is less. This means on a $4,000 vehicle, the cap is $200 (5% of $4,000), not the full $280. Per DIFS Bulletin 2025-03-CF. The cap is adjusted biennially by CPI.",
    salesTaxNote:
      "Michigan charges a flat 6% sales tax on vehicle purchases statewide. There are no local additions — the rate is uniform. Trade-in credit is allowed up to $11,000 (2025 cap) or the actual agreed trade-in value, whichever is less.",
    registrationNote:
      "Michigan base registration is $15 per year (one-year) or $29 for two years, plus a percentage of the vehicle's original MSRP. The title fee is $15.",
    introAngle:
      "Michigan's doc fee cap has an important nuance: it's the lesser of $280 or 5% of the vehicle's cash price. For most vehicles above $5,600, the $280 flat cap applies. For cheaper vehicles, the 5% formula limits the fee more. DIFS Bulletin 2025-03-CF provides the current guidance. The trade-in credit is capped at $11,000 in 2025.",
    snippetAnswer:
      "Michigan caps dealer documentation fees at $280 or 5% of the vehicle price, whichever is lower. The state tax is a flat 6%. Trade-in credit is allowed up to $11,000. The cap is adjusted biennially by CPI per DIFS Bulletin 2025-03-CF.",
    watchFor: [
      "5% cap for lower-priced vehicles: on a $4,000 vehicle, the max doc fee is $200, not $280. If you're buying an inexpensive used vehicle, confirm which limit applies.",
      "Trade-in credit cap: Michigan's trade-in credit is capped at $11,000 (2025). If your trade-in is worth more, the excess doesn't reduce your taxable amount.",
      "Doc fee above the cap: any fee above the applicable limit (lesser of $280 or 5%) is not permitted. Ask for the fee to be itemized if it seems high.",
    ],
    negotiationNote:
      "Michigan's competitive Detroit area and statewide dealer network give buyers options. With the doc fee capped, negotiation focuses on the vehicle price and add-ons. The trade-in credit ceiling is important to know — if your trade-in exceeds $11,000, the excess doesn't reduce your tax.",
    ctaHeading: "Have a Michigan dealer quote you want to review?",
    ctaBody:
      "Not sure if your dealer quote is complete? Paste the message or quote you received and Odigos will flag anything unusual.",
    internalLinks: STANDARD_LINKS,
    sources: [
      "https://www.michigan.gov/difs/-/media/Project/Websites/difs/Bulletins/2025/Bulletin_2025-03-CF.pdf",
    ],
    specialNotes:
      "Cap is $280 OR 5% of vehicle price, whichever is LESS. Adjusted biennially by CPI. Per DIFS Bulletin 2025-03-CF.",
    dealerMessage:
      "Hi — I'm interested in a vehicle at your dealership and would like to confirm the full out-the-door price before visiting. Could you please send me an itemized breakdown showing the vehicle sale price, documentation fee (Michigan's cap is $280 or 5% of sale price, whichever is less), all additional dealer fees, Michigan sales tax (6% flat), title fee ($15), and registration costs? If I have a trade-in, please show the credit (up to the $11,000 cap). I'd like to see the complete total. Thank you.",
    lastVerified: "2026-03",
  },

  minnesota: {
    name: "Minnesota",
    abbreviation: "MN",
    slug: "minnesota",
    docFeeRange: "Capped at $350 (increased July 2025)",
    hasCap: true,
    metaDescription:
      "Minnesota raised its dealer doc fee cap from ~$125 to $350 effective July 2025. State tax is 6.875% plus metro transit additions. See the MN OTD picture.",
    capNote:
      "Minnesota caps dealer documentation fees at $350 effective July 1, 2025 — a major increase from the prior cap of approximately $125. The cap was raised by MADA and the state legislature. For vehicles priced at $3,499 or less, the cap is 10% of the sale value, whichever is less.",
    salesTaxNote:
      "Minnesota charges 6.875% state sales tax on vehicle purchases, plus a 0.5% metro transit tax in the metro area. Trade-in deductions are allowed, reducing the taxable amount.",
    registrationNote:
      "Minnesota registration is calculated at 1.575% of the vehicle's MSRP annually, plus $11.25 in universal fees. This value-based structure makes registration costs meaningfully higher for expensive vehicles. The title fee is $34.",
    introAngle:
      "Minnesota buyers saw a major change in July 2025: the doc fee cap jumped from approximately $125 to $350. This was a significant expansion of what dealers can legally charge. If you're buying in 2025 or 2026, expect doc fees closer to $350 than the $125 buyers were used to in prior years. The registration fee, calculated as a percentage of MSRP, can also be substantial on higher-priced vehicles.",
    snippetAnswer:
      "Minnesota raised its dealer documentation fee cap to $350 effective July 1, 2025 (from ~$125). State sales tax is 6.875% plus metro transit additions. Registration is value-based at 1.575% of MSRP annually.",
    watchFor: [
      "New $350 cap: buyers used to Minnesota's old ~$125 cap may be surprised by the new $350 ceiling. This change took effect July 1, 2025.",
      "Metro transit surcharge: the additional 0.5% tax applies in the Twin Cities metro area. Confirm whether your dealer's location is in the metro transit district.",
      "Value-based registration: registration scales with MSRP. On a $45,000 vehicle, annual registration runs approximately $700 in the first year — much higher than flat-rate states.",
    ],
    negotiationNote:
      "Minnesota's Twin Cities market is competitive with multiple dealers. With the doc fee capped at $350, your negotiation focuses on vehicle price and add-ons. The registration fee is a government charge based on MSRP — not negotiable.",
    ctaHeading: "Have a Minnesota dealer quote you want to verify?",
    ctaBody:
      "Not sure if your dealer quote is complete? Paste the message or quote you received and Odigos will flag anything unusual.",
    internalLinks: STANDARD_LINKS,
    sources: [
      "https://mada.org/doc-fee-increase/",
    ],
    specialNotes:
      "MAJOR CHANGE: Cap increased from ~$125 to $350 effective July 1, 2025. Or 10% of sale value for vehicles ≤$3,499, whichever is less.",
    dealerMessage:
      "Hi — I'm interested in a vehicle at your dealership and would like to confirm the full out-the-door price before visiting. Could you please send me an itemized breakdown showing the vehicle sale price, documentation fee (Minnesota's cap is $350 as of July 2025), all additional dealer fees, Minnesota sales tax (6.875% + 0.5% if in metro transit district), title fee ($34), and registration costs (1.575% of MSRP)? I'd like to see the complete total. Thank you.",
    lastVerified: "2026-03",
  },

  mississippi: {
    name: "Mississippi",
    abbreviation: "MS",
    slug: "mississippi",
    docFeeRange: "Typically $300–$550",
    hasCap: false,
    metaDescription:
      "Mississippi has a district-based doc fee system — fees can't exceed 25% above the district average (~$425 typical). State sales tax on vehicles is 5%. See the MS OTD picture.",
    capNote:
      "Mississippi does not have a hard state cap on documentation fees, but dealers are limited to charges that don't exceed 25% above the district average under MMVC Regulation 8. This is not a fixed ceiling but a market-relative limit — with the typical average around $425, the practical upper bound is approximately $531.",
    salesTaxNote:
      "Mississippi charges 5% sales tax specifically for passenger vehicles (different from the 7% general sales tax rate). Local additions of up to 0.25% may apply. Trade-in deductions are allowed.",
    registrationNote:
      "Mississippi registration is approximately $14 for first-time or $12.75 for renewal, plus approximately $15 in county taxes. The title fee is $9.",
    introAngle:
      "Mississippi uses an unusual district-based fee system — rather than a fixed state cap, dealers cannot charge more than 25% above the average doc fee in their district. With the typical average around $425, this creates an effective ceiling near $531, though it varies by district. The passenger vehicle sales tax rate of 5% is lower than the general state rate.",
    snippetAnswer:
      "Mississippi dealers are limited to fees within 25% of their district average (~$425 typical). The state sales tax on passenger vehicles is 5% — lower than the 7% general rate. Registration costs are among the lowest in the country.",
    watchFor: [
      "District-based fee variation: the effective upper bound on doc fees varies by dealer district. Ask if the dealer can show you what 'district average' means for their location.",
      "Passenger vehicle vs. general tax rate: Mississippi's 5% passenger vehicle rate is lower than the 7% general sales tax. Make sure your quote uses the correct rate.",
      "Low registration cost: at approximately $14 base, Mississippi's registration is among the cheapest nationally — but don't confuse low registration with low overall fees.",
    ],
    negotiationNote:
      "Mississippi's market is spread across smaller cities, which limits competitive leverage outside the Jackson area. The district-based fee system means some dealers charge at the upper bound while others charge less — comparison shopping is worth the effort.",
    ctaHeading: "Have a Mississippi dealer quote you want to verify?",
    ctaBody:
      "Not sure if your dealer quote is complete? Paste the message or quote you received and Odigos will flag anything unusual.",
    internalLinks: STANDARD_LINKS,
    sources: [
      "https://www.mmvc.ms.gov/sites/mmvc/files/rules/Regulation8.pdf",
    ],
    specialNotes:
      "District-based caps: fees cannot exceed 25% above district average (~$425 typical). Not a hard state cap.",
    dealerMessage:
      "Hi — I'm interested in a vehicle at your dealership and would like to confirm the full out-the-door price before visiting. Could you please send me an itemized breakdown showing the vehicle sale price, documentation fee, all additional dealer fees, Mississippi sales tax (5% for passenger vehicles + any local addition), title fee ($9), and registration costs? I'd like to see the complete total. Thank you.",
    lastVerified: "2026-03",
  },

  missouri: {
    name: "Missouri",
    abbreviation: "MO",
    slug: "missouri",
    docFeeRange: "Capped at $500 (CPI-adjusted)",
    hasCap: true,
    metaDescription:
      "Missouri caps dealer doc fees at $500 (CPI-adjusted, effective Aug 2025). State tax is 4.225% with local additions. Combined rates can approach 10%. See the MO OTD picture.",
    capNote:
      "Missouri caps dealer documentation fees at $500, with annual CPI adjustments. The current cap is effective August 17, 2025 per RSMo §301.558. Dealers cannot legally exceed this amount.",
    salesTaxNote:
      "Missouri charges 4.225% state sales tax on vehicles, with local additions of up to 5.875%. Combined rates can reach 10.1% in some jurisdictions. Total vehicle sales tax is also subject to a $725 cap per transaction.",
    registrationNote:
      "Missouri registration ranges from $18.25 to $51.25 per year based on vehicle horsepower, plus a $9 processing fee. The title fee is $15.",
    introAngle:
      "Missouri has a $500 cap on doc fees (CPI-adjusted) and a horsepower-based registration structure. The low 4.225% state tax rate can be misleading — local additions push combined rates to 8–10% in many areas. The $725 total tax cap per transaction is a useful ceiling for high-value vehicles.",
    snippetAnswer:
      "Missouri caps dealer documentation fees at $500 (CPI-adjusted, effective August 2025). State sales tax is 4.225% with local additions; combined rates reach 10%. A $725 cap on total vehicle sales tax applies per transaction.",
    watchFor: [
      "Local tax variation: Missouri's combined rates range widely. Kansas City and St. Louis buyers may see rates above 8–9%. Verify your effective rate.",
      "$725 total tax cap: on very high-value vehicle purchases, total Missouri sales tax is capped at $725. This only benefits buyers of expensive vehicles where the uncapped tax would exceed that amount.",
      "Doc fee near the cap: many Missouri dealers charge at or near $500. Confirm the amount before visiting.",
    ],
    negotiationNote:
      "Missouri's Kansas City and St. Louis markets have competitive dealer networks. With the doc fee capped at $500, your leverage is on the vehicle price and add-ons. Verify the local tax rate at your specific dealership — it can vary significantly even within the same metro area.",
    ctaHeading: "Have a Missouri dealer quote you want to review?",
    ctaBody:
      "Not sure if your dealer quote is complete? Paste the message or quote you received and Odigos will flag anything unusual.",
    internalLinks: STANDARD_LINKS,
    sources: [
      "https://revisor.mo.gov/main/OneSection.aspx?section=301.558",
    ],
    specialNotes:
      "Doc fee cap $500 base, increased annually by CPI. Effective Aug 17, 2025.",
    dealerMessage:
      "Hi — I'm interested in a vehicle at your dealership and would like to confirm the full out-the-door price before visiting. Could you please send me an itemized breakdown showing the vehicle sale price, documentation fee (Missouri's cap is $500), all additional dealer fees, Missouri sales tax (4.225% state + local rate), title fee ($15), and registration costs (horsepower-based)? I'd like to see the complete total. Thank you.",
    lastVerified: "2026-03",
  },

  montana: {
    name: "Montana",
    abbreviation: "MT",
    slug: "montana",
    docFeeRange: "Typically $200–$400",
    hasCap: false,
    metaDescription:
      "Montana has no sales tax on vehicles — one of five such states. Dealer doc fees are uncapped at $200–$400. Registration varies by vehicle age. See the MT OTD picture.",
    capNote:
      "Montana has no state cap on dealer documentation fees. Fees of $200–$400 are commonly reported. There is no legal ceiling.",
    salesTaxNote:
      "Montana has no state sales tax on vehicle purchases — one of only five states in the country (along with Alaska, Delaware, New Hampshire, and Oregon). This significantly reduces the OTD total compared to most states.",
    registrationNote:
      "Montana registration fees vary by vehicle age: $217 for vehicles 0–4 years old, $130 for 5–10 years old, with decreasing rates beyond that. A county option fee of approximately $10 may also apply. The title fee is $12.",
    introAngle:
      "Montana is one of five states with no vehicle sales tax, which gives buyers a meaningful OTD advantage over most of the country. On a $40,000 vehicle, the absence of a 6% sales tax saves $2,400. Doc fees are uncapped but tend to be in a moderate range. Registration decreases with vehicle age.",
    snippetAnswer:
      "Montana has no state sales tax on vehicles — one of only five states. Dealer doc fees are uncapped at $200–$400. Registration runs $130–$217 based on vehicle age and decreases over time.",
    watchFor: [
      "Montana buyers from other states: Montana's lack of sales tax attracts buyers from neighboring states. If you're not a Montana resident, verify whether you can legally use Montana's tax exemption for your purchase.",
      "Uncapped doc fees: $200–$400 is typical, but there's no cap. Compare across dealers.",
      "County option fees: a small county fee may apply on top of the state registration amount.",
    ],
    negotiationNote:
      "Montana's less-populated market means fewer competing dealers, particularly outside Billings and Missoula. The absence of sales tax is a significant advantage — focus negotiation on the vehicle price and any dealer add-ons. Doc fees are uncapped and may be negotiable.",
    ctaHeading: "Have a Montana dealer quote you want to review?",
    ctaBody:
      "Not sure if your dealer quote is complete? Paste the message or quote you received and Odigos will flag anything unusual.",
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
  },

  nebraska: {
    name: "Nebraska",
    abbreviation: "NE",
    slug: "nebraska",
    docFeeRange: "Typically $200–$400",
    hasCap: false,
    metaDescription:
      "Nebraska has no cap on dealer doc fees — $200–$400 is typical. State sales tax is 5.5% plus local additions up to 2%. See what Nebraska car buyers pay.",
    capNote:
      "Nebraska has no state cap on dealer documentation fees. Fees of $200–$400 are commonly reported. There is no legal ceiling.",
    salesTaxNote:
      "Nebraska charges 5.5% state sales tax on vehicle purchases, with local additions of up to 2%. Trade-in deductions are allowed, reducing the taxable purchase price.",
    registrationNote:
      "Nebraska base registration is approximately $68 plus approximately $20.50 in additional statutory fees. The title fee is $18.",
    introAngle:
      "Nebraska has moderate doc fees in the $200–$400 range with no state cap. The 5.5% state tax with modest local additions keeps the tax portion predictable. Buyers should verify the exact local rate for their purchase location and confirm whether a trade-in deduction applies.",
    snippetAnswer:
      "Nebraska dealers typically charge $200–$400 in documentation fees with no state cap. State sales tax is 5.5% with local additions up to 2%. Trade-in deductions are allowed.",
    watchFor: [
      "Uncapped doc fees: ask for the fee to be disclosed before visiting. If it exceeds $400, compare with other Nebraska dealers.",
      "Local tax additions: some Nebraska cities add up to 2% on top of the 5.5% base. Confirm your effective rate.",
      "Trade-in credit: Nebraska allows trade-in deductions. Make sure the credit is applied before your tax is calculated.",
    ],
    negotiationNote:
      "Omaha and Lincoln have competitive dealer markets that give buyers more leverage. Outside these areas, options are more limited. Focus negotiation on the vehicle price and the doc fee, which is uncapped.",
    ctaHeading: "Have a Nebraska dealer quote you want to review?",
    ctaBody:
      "Not sure if your dealer quote is complete? Paste the message or quote you received and Odigos will flag anything unusual.",
    internalLinks: STANDARD_LINKS,
    sources: [
      "https://dmv.nebraska.gov/dvr/reg/registration-fees-and-taxes",
      "https://caredge.com/guides/car-dealer-doc-fee-by-state",
    ],
    specialNotes: null,
    dealerMessage:
      "Hi — I'm interested in a vehicle at your dealership and would like to confirm the full out-the-door price before visiting. Could you please send me an itemized breakdown showing the vehicle sale price, documentation fee, all additional dealer fees, Nebraska sales tax (5.5% + local rate), title fee ($18), and registration costs? I'd like to see the complete total. Thank you.",
    lastVerified: "2026-03",
  },

  nevada: {
    name: "Nevada",
    abbreviation: "NV",
    slug: "nevada",
    docFeeRange: "Typically $400–$700",
    hasCap: false,
    metaDescription:
      "Nevada has no cap on dealer doc fees — $400–$700 is typical. State sales tax is 4.6% plus local additions. Registration is value-based using an MSRP formula.",
    capNote:
      "Nevada has no state cap on dealer documentation fees. Fees of $400–$700 are commonly reported. There is no legal ceiling.",
    salesTaxNote:
      "Nevada charges 4.6% state sales tax on vehicle purchases, with local county additions. Reno-area buyers typically see combined rates of around 8.265%. The tax applies to the full purchase price with trade-in deductions allowed.",
    registrationNote:
      "Nevada registration includes a $33 base fee plus a value-based component calculated on approximately 35% of the vehicle's MSRP. This value-based fee can be substantial on newer or more expensive vehicles. The title fee is $28.",
    introAngle:
      "Nevada's Las Vegas and Reno markets attract a high volume of vehicle purchases. Doc fees are uncapped and tend to be on the higher end at $400–$700. The value-based registration formula, calculated on 35% of MSRP, can make first-year registration significantly more expensive than buyers expect from other states.",
    snippetAnswer:
      "Nevada dealers typically charge $400–$700 in documentation fees with no state cap. The base sales tax is 4.6% with local additions. Registration includes a value-based component calculated at 35% of MSRP.",
    watchFor: [
      "Value-based registration: Nevada's registration is tied to your vehicle's MSRP. On a $45,000 vehicle, the value-based component adds several hundred dollars on top of the $33 base. Budget for this when estimating your OTD.",
      "Uncapped doc fees: $400–$700 is typical, but there's no cap. Compare across multiple dealers.",
      "Local tax rate variation: combined rates vary by county. Verify the rate at your specific dealer location.",
    ],
    negotiationNote:
      "Las Vegas has a highly competitive dealer market — use it to your advantage by getting multiple OTD quotes. The doc fee is uncapped and potentially negotiable. The registration and sales tax are government charges and are fixed.",
    ctaHeading: "Have a Nevada dealer quote you want to review?",
    ctaBody:
      "Not sure if your dealer quote is complete? Paste the message or quote you received and Odigos will flag anything unusual.",
    internalLinks: STANDARD_LINKS,
    sources: [
      "https://dmv.nv.gov/regfees.htm",
      "https://caredge.com/guides/car-dealer-doc-fee-by-state",
    ],
    specialNotes: null,
    dealerMessage:
      "Hi — I'm interested in a vehicle at your dealership and would like to confirm the full out-the-door price before visiting. Could you please send me an itemized breakdown showing the vehicle sale price, documentation fee, all additional dealer fees, Nevada sales tax (state + local for your county), title fee ($28), and registration costs (including the value-based component)? I'd like to see the complete total. Thank you.",
    lastVerified: "2026-03",
  },

  "new-hampshire": {
    name: "New Hampshire",
    abbreviation: "NH",
    slug: "new-hampshire",
    docFeeRange: "Typically $300–$500 (two-part structure)",
    hasCap: false,
    metaDescription:
      "New Hampshire has no sales tax and a unique two-part doc fee structure: a $27 state fee plus an uncapped dealer admin fee. Total fees average ~$459. See the NH OTD picture.",
    capNote:
      "New Hampshire has a unique two-part fee structure: (1) a $27 state documentation fee capped by statute (RSA 361-A:1, IV), and (2) a separate dealer 'administrative fee' that is uncapped and must be itemized. Most dealers charge total documentation-related fees of $300–$500. The title fee increased to $37 effective January 1, 2026.",
    salesTaxNote:
      "New Hampshire has no state sales tax on vehicle purchases. There are no local sales taxes on vehicles either. This is one of the most significant buyer advantages in New Hampshire — the absence of sales tax on a $40,000 vehicle saves approximately $2,000–$2,500 compared to most states.",
    registrationNote:
      "New Hampshire registration fees are calculated based on the vehicle's value: $18 per $1,000 of value in the first two years, decreasing thereafter. The title fee increased to $37 effective January 1, 2026.",
    introAngle:
      "New Hampshire has no vehicle sales tax, which provides a significant OTD advantage. However, the documentation fee structure is unusual: a $27 state fee is capped by statute, but dealers also charge a separate uncapped 'administrative fee.' Total doc-related charges average around $459. The title fee also increased in January 2026.",
    snippetAnswer:
      "New Hampshire has no vehicle sales tax. The documentation fee has two parts: a $27 state fee (capped) plus an uncapped dealer admin fee — averaging $459 total. The title fee increased to $37 in January 2026.",
    watchFor: [
      "Two-part documentation fee: confirm that the quote itemizes both the $27 state fee and any dealer admin fee separately, as required by law.",
      "New title fee: the title fee increased from $25 to $37 effective January 1, 2026. Update any older OTD estimates.",
      "Registration cost: NH registration is value-based, not flat — it can be meaningful on newer vehicles.",
    ],
    negotiationNote:
      "The absence of sales tax makes New Hampshire an attractive buying state for residents of neighboring high-tax states. Dealer admin fees are uncapped and may be negotiable. Focus on the total OTD, including the value-based registration.",
    ctaHeading: "Have a New Hampshire dealer quote you want to verify?",
    ctaBody:
      "Not sure if your dealer quote is complete? Paste the message or quote you received and Odigos will flag anything unusual.",
    internalLinks: STANDARD_LINKS,
    sources: [
      "https://www.banking.nh.gov/rsa-361-faq",
      "https://caredge.com/guides/car-dealer-doc-fee-by-state",
    ],
    specialNotes:
      "Two-part fee structure: (1) $27 state doc fee (capped by statute), (2) Dealer admin fee (uncapped, must be itemized). Total fees average $459. Title fee increased to $37 effective Jan 1, 2026.",
    dealerMessage:
      "Hi — I'm interested in a vehicle at your dealership and would like to confirm the full out-the-door price before visiting. Could you please send me an itemized breakdown showing the vehicle sale price, the $27 state documentation fee, any additional dealer administrative fee (itemized separately), all other dealer fees, title fee ($37), and registration costs (value-based)? New Hampshire has no sales tax, so please confirm no sales tax is included. I'd like to see the complete total. Thank you.",
    lastVerified: "2026-03",
  },

  "new-jersey": {
    name: "New Jersey",
    abbreviation: "NJ",
    slug: "new-jersey",
    docFeeRange: "Typically $200–$900",
    hasCap: false,
    metaDescription:
      "New Jersey has no cap on dealer doc fees — fees range widely from $200 to $900. The state tax is 6.625%. Title fee is $60 (or $85 with a lien). See the NJ OTD picture.",
    capNote:
      "New Jersey has no state cap on dealer documentation fees. Fees vary widely — anywhere from $200 to $900 — depending on the dealer. There is no legal ceiling, making comparison shopping important.",
    salesTaxNote:
      "New Jersey charges 6.625% sales tax on vehicle purchases statewide, with one exception: Millville's rate is 8.625%. There are no other local additions. Trade-in deductions are allowed.",
    registrationNote:
      "New Jersey registration fees vary by vehicle type and weight. Electric vehicles are subject to a $260 ZEV fee in 2026. Title fee is $60, or $85 if you're financing (title with lien).",
    introAngle:
      "New Jersey has no doc fee cap, and fees vary exceptionally widely — from $200 to $900 — across the state's dealer network. The 6.625% statewide sales tax is straightforward with minimal local variation. Buyers financing a vehicle should note the $85 title fee (lien) vs. $60 for cash purchases.",
    snippetAnswer:
      "New Jersey dealer documentation fees vary widely from $200 to $900 with no state cap. State sales tax is 6.625%. Title fee is $60 (cash) or $85 (financed). No local additions apply except in Millville.",
    watchFor: [
      "Wide doc fee range: fees vary from $200 to $900 at New Jersey dealerships with no cap. Always get the doc fee disclosed before visiting and compare across dealers.",
      "Lien vs. cash title fee: if you're financing, the title fee is $85. If paying cash, it's $60. Make sure your quote reflects the correct amount.",
      "EV registration surcharge: electric vehicle buyers pay an additional $260 ZEV fee in 2026.",
    ],
    negotiationNote:
      "New Jersey's dense dealer market — particularly in North Jersey near the NYC metro — creates real competitive pressure. Use multiple competing OTD quotes as leverage. The wide doc fee range (up to $900) means there's meaningful savings potential by shopping around.",
    ctaHeading: "Have a New Jersey dealer quote you want to review?",
    ctaBody:
      "Not sure if your dealer quote is complete? Paste the message or quote you received and Odigos will flag anything unusual.",
    internalLinks: STANDARD_LINKS,
    sources: [
      "https://www.nj.gov/mvc/vehicles/regfees.htm",
    ],
    specialNotes:
      "Title with lien: $85.",
    dealerMessage:
      "Hi — I'm interested in a vehicle at your dealership and would like to confirm the full out-the-door price before visiting. Could you please send me an itemized breakdown showing the vehicle sale price, documentation fee, all additional dealer fees, New Jersey sales tax (6.625%), title fee ($60 cash or $85 financed), and registration costs? I'd like to see the complete total. Thank you.",
    lastVerified: "2026-03",
  },

  "new-mexico": {
    name: "New Mexico",
    abbreviation: "NM",
    slug: "new-mexico",
    docFeeRange: "Typically $200–$400",
    hasCap: false,
    metaDescription:
      "New Mexico has no cap on dealer doc fees. The state uses both a Motor Vehicle Excise Tax and a Gross Receipts Tax on vehicle sales — understand which applies. See the NM OTD picture.",
    capNote:
      "New Mexico has no state cap on dealer documentation fees. Fees of $200–$400 are commonly reported. There is no legal ceiling.",
    salesTaxNote:
      "New Mexico has a unique dual-tax structure: a 4% Motor Vehicle Excise Tax (MVET) on the vehicle purchase price, plus a Gross Receipts Tax (GRT) that functions like a sales tax on the dealer's gross receipts. The GRT base is 5.125% with local additions up to 4.315%, reaching combined rates near 9.44% in some areas. Buyers should clarify which taxes appear on their quote.",
    registrationNote:
      "New Mexico registration fees range from $27 to $62 per year based on vehicle weight and age. The title fee is $20.",
    introAngle:
      "New Mexico has an unusually complex tax structure for vehicle purchases — both a Motor Vehicle Excise Tax and a Gross Receipts Tax may apply. Understanding which charges appear on your quote and why is important to accurately evaluating your OTD total. Doc fees are uncapped and in a moderate range.",
    snippetAnswer:
      "New Mexico has no doc fee cap. The state applies both a 4% Motor Vehicle Excise Tax and a Gross Receipts Tax (GRT, up to 9.44% combined) on vehicle transactions. Confirm which taxes are itemized on your quote.",
    watchFor: [
      "Dual tax structure: New Mexico uses both MVET and GRT. Make sure your quote clearly itemizes which taxes apply and at what rates.",
      "Local GRT additions: combined GRT rates vary by location and can reach 9.44% in some areas. Know the rate for your dealer's location.",
      "Uncapped doc fees: ask for the fee before visiting and compare across dealers.",
    ],
    negotiationNote:
      "New Mexico's market is less competitive outside Albuquerque. Get multiple quotes and ask for the tax structure to be explained in detail. The dual tax structure makes comparing OTD quotes across state lines more complex than usual.",
    ctaHeading: "Have a New Mexico dealer quote you want to review?",
    ctaBody:
      "Not sure if your dealer quote is complete? Paste the message or quote you received and Odigos will flag anything unusual.",
    internalLinks: STANDARD_LINKS,
    sources: [
      "https://www.mvd.newmexico.gov/vehicles/vehicle-registration/",
    ],
    specialNotes:
      "New Mexico uses both a Motor Vehicle Excise Tax and a Gross Receipts Tax — verify which applies to your transaction.",
    dealerMessage:
      "Hi — I'm interested in a vehicle at your dealership and would like to confirm the full out-the-door price before visiting. Could you please send me an itemized breakdown showing the vehicle sale price, documentation fee, all additional dealer fees, New Mexico Motor Vehicle Excise Tax (4%), any Gross Receipts Tax (please show rate for your location), title fee ($20), and registration costs? I'd like to see the complete total and which taxes apply to my purchase. Thank you.",
    lastVerified: "2026-03",
  },

  "new-york": {
    name: "New York",
    abbreviation: "NY",
    slug: "new-york",
    docFeeRange: "Capped at $175",
    hasCap: true,
    metaDescription:
      "New York caps dealer doc fees at $175 (set Aug 2021, current as of March 2026). NYC buyers pay 8.875% combined sales tax. Upstate buyers pay less. See the full NY OTD picture.",
    capNote:
      "New York caps dealer documentation fees at $175 per 15 NYCRR §78.19, set August 18, 2021 and still current as of March 2026. Dealers cannot legally charge more than $175 for documentation.",
    salesTaxNote:
      "New York has a 4% state sales tax on vehicles, but local county and city taxes add significantly. New York City buyers pay a combined rate of 8.875% (4% state + 4.5% NYC + 0.375% MTA). Buyers in suburban counties typically see 7%–8.5% combined rates. Upstate buyers in lower-tax counties may see 6%–7%. The combined rate varies more than buyers usually expect.",
    registrationNote:
      "New York registration fees are calculated on a schedule based on the vehicle's weight. A standard passenger car typically runs $26–$140 in base registration depending on weight, plus a title fee of around $50. NYC buyers also pay an additional Metropolitan Commuter Transportation District (MCTD) surcharge. Total first-year registration and title costs often run $200–$400 depending on vehicle and location.",
    introAngle:
      "New York's OTD pricing has a particular split that surprises buyers: the doc fee is relatively modest by national standards ($175 cap), but the combined sales tax rate in New York City and its suburbs can push OTD totals well above what buyers from other regions expect. A buyer purchasing a $38,000 vehicle in NYC at 8.875% pays $3,373 in sales tax alone. The same vehicle in a rural upstate county at 6.5% would cost $2,470 in tax — nearly $900 less, before any other fees.",
    snippetAnswer:
      "New York caps dealer documentation fees at $175. The bigger OTD variable is the local sales tax rate: NYC buyers pay 8.875% combined, while upstate buyers may pay 6–7%. The gap between metro and upstate OTD totals on the same vehicle can exceed $1,000.",
    watchFor: [
      "NYC combined tax rate: buyers purchasing in New York City pay 8.875% combined — one of the highest effective vehicle sales tax rates in the country. On a $35,000 vehicle, that's $3,106 in tax. Buyers who don't account for this are often surprised at the OTD total.",
      "MCTD surcharge on registration: buyers in the Metropolitan Commuter Transportation District (which includes NYC and several surrounding counties) pay an additional surcharge on their registration.",
      "Dealer add-ons on NYC-area inventory: dealerships in the greater New York area frequently pre-install protection packages and window tinting on inventory. These are presented as standard but are generally negotiable in price.",
      "Dealer prep and reconditioning fees: some New York dealers add preparation or reconditioning fees outside the standard doc fee. These aren't government charges — ask for each fee to be named and explained individually.",
    ],
    negotiationNote:
      "New York's doc fees are capped, so the main negotiation pressure is on vehicle price and add-ons. The competitive metro New York market means there are usually multiple dealers within driving distance selling the same vehicle — which gives buyers more leverage than in rural markets. For buyers in NYC and suburbs, the tax rate is fixed by location, so all OTD negotiation should focus on the pre-tax total.",
    ctaHeading: "Have a New York dealer quote with fees you want to check?",
    ctaBody:
      "Not sure if your dealer quote is complete? Paste the message or quote you received and Odigos will flag anything unusual.",
    internalLinks: STANDARD_LINKS,
    sources: [
      "https://dmv.ny.gov/registration/sales-tax-information",
    ],
    specialNotes:
      "Cap set Aug 18, 2021. Still current as of March 2026.",
    dealerMessage:
      "Hi — I'm interested in a vehicle at your dealership and would like to confirm the full out-the-door price before visiting. Could you please send me an itemized breakdown showing the vehicle sale price, documentation fee (New York caps this at $175), all additional dealer fees, New York sales tax (state + local rate for your county/city), title fee ($50), and registration costs? I'd like to see the complete total. Thank you.",
    lastVerified: "2026-03",
  },

  "north-carolina": {
    name: "North Carolina",
    abbreviation: "NC",
    slug: "north-carolina",
    docFeeRange: "Typically $500–$800",
    hasCap: false,
    metaDescription:
      "North Carolina has no cap on dealer doc fees — $500–$800 is typical. The state uses a 3% Highway Use Tax instead of traditional sales tax. See the NC OTD breakdown.",
    capNote:
      "North Carolina has no state cap on dealer documentation fees. Fees of $500–$800 are commonly reported — on the higher end of uncapped states. There is no legal ceiling.",
    salesTaxNote:
      "North Carolina uses a 3% Highway Use Tax (HUT) rather than traditional sales tax for vehicle purchases. This is a flat statewide rate with no local additions — making the tax portion of your OTD straightforward to calculate. The HUT applies to the vehicle purchase price with trade-in deductions allowed for dealer transactions.",
    registrationNote:
      "North Carolina registration is $46.25 per year (effective July 1, 2024). The title fee is $56.",
    introAngle:
      "North Carolina is one of a few states that uses a Highway Use Tax instead of traditional sales tax for vehicles. At 3%, it's one of the lower vehicle transfer tax rates in the country. However, doc fees are uncapped and tend to be relatively high at $500–$800 — which can offset the tax advantage for buyers who don't compare carefully.",
    snippetAnswer:
      "North Carolina uses a 3% Highway Use Tax (no local additions) instead of sales tax. Dealer documentation fees are uncapped and typically $500–$800 — on the higher end. The registration is $46.25/year.",
    watchFor: [
      "High uncapped doc fees: $500–$800 is typical with no cap. The HUT advantage (3% vs. higher rates elsewhere) can be eroded by a high doc fee. Compare total OTD quotes.",
      "Highway Use Tax at titling: the HUT is typically collected at the DMV when you title the vehicle, not at the dealership. Clarify how your dealer is handling this in the quote.",
      "Title fee: at $56, North Carolina's title fee is higher than many states. Make sure it's included in your OTD estimate.",
    ],
    negotiationNote:
      "North Carolina's Charlotte and Raleigh-Durham markets have competitive dealer networks. The doc fee is uncapped — ask if it's flexible. Focus negotiation on the total OTD including the fee, HUT, title, and registration.",
    ctaHeading: "Have a North Carolina dealer quote you want to verify?",
    ctaBody:
      "Not sure if your dealer quote is complete? Paste the message or quote you received and Odigos will flag anything unusual.",
    internalLinks: STANDARD_LINKS,
    sources: [
      "https://www.ncdot.gov/dmv/title-registration/taxes/Pages/default.aspx",
    ],
    specialNotes:
      "NC uses Highway Use Tax instead of sales tax for vehicles. Relatively low at 3%.",
    dealerMessage:
      "Hi — I'm interested in a vehicle at your dealership and would like to confirm the full out-the-door price before visiting. Could you please send me an itemized breakdown showing the vehicle sale price, documentation fee, all additional dealer fees, North Carolina Highway Use Tax (3%, including any trade-in deduction), title fee ($56), and registration costs ($46.25/year)? I'd like to see the complete total. Thank you.",
    lastVerified: "2026-03",
  },

  "north-dakota": {
    name: "North Dakota",
    abbreviation: "ND",
    slug: "north-dakota",
    docFeeRange: "Typically $100–$250",
    hasCap: false,
    metaDescription:
      "North Dakota has no cap on dealer doc fees — $100–$250 is typical, among the lowest in uncapped states. The vehicle excise tax is a flat 5%. See the ND OTD picture.",
    capNote:
      "North Dakota has no state cap on dealer documentation fees. Fees of $100–$250 are commonly reported — among the lowest in the country for uncapped states. There is no legal ceiling.",
    salesTaxNote:
      "North Dakota charges a 5% vehicle excise tax on vehicle purchases statewide. There are no local additions for vehicles — the rate is flat. Trade-in deductions are allowed.",
    registrationNote:
      "North Dakota registration fees vary by vehicle age and weight. The title fee is $5 — one of the lowest in the country.",
    introAngle:
      "North Dakota has some of the lowest documentation fees in the country for an uncapped state — typically $100–$250. Combined with a flat 5% excise tax and a $5 title fee, North Dakota offers a relatively low-cost OTD environment. The main variable is the vehicle price itself.",
    snippetAnswer:
      "North Dakota dealers typically charge $100–$250 in documentation fees — among the lowest in the country. The vehicle excise tax is a flat 5% with no local additions. Title fee is $5.",
    watchFor: [
      "Low fee environment: North Dakota's costs are lower than most states, but fees can still vary between dealers. Compare quotes.",
      "Limited dealer competition: outside Fargo and Bismarck, options are limited. Get multiple quotes before committing.",
      "Trade-in credit: confirm that any trade-in value is properly deducted from the taxable amount before the 5% excise tax is calculated.",
    ],
    negotiationNote:
      "North Dakota's market is smaller than most states, but Fargo and Bismarck offer some competitive dealer options. The fee environment is generally favorable — focus negotiation on the vehicle price.",
    ctaHeading: "Have a North Dakota dealer quote you want to review?",
    ctaBody:
      "Not sure if your dealer quote is complete? Paste the message or quote you received and Odigos will flag anything unusual.",
    internalLinks: STANDARD_LINKS,
    sources: [
      "https://www.dot.nd.gov/motor-vehicle",
      "https://caredge.com/guides/car-dealer-doc-fee-by-state",
    ],
    specialNotes: null,
    dealerMessage:
      "Hi — I'm interested in a vehicle at your dealership and would like to confirm the full out-the-door price before visiting. Could you please send me an itemized breakdown showing the vehicle sale price, documentation fee, all additional dealer fees, North Dakota vehicle excise tax (5%), title fee ($5), and registration costs? I'd like to see the complete total. Thank you.",
    lastVerified: "2026-03",
  },

  ohio: {
    name: "Ohio",
    abbreviation: "OH",
    slug: "ohio",
    docFeeRange: "Capped at $387 or 10% of cash price (whichever is lower)",
    hasCap: true,
    metaDescription:
      "Ohio caps dealer doc fees at $387 or 10% of the cash price — whichever is lower. State tax is 5.75% plus county additions. See the OH OTD breakdown.",
    capNote:
      "Ohio caps dealer documentation fees at $387 OR 10% of the vehicle's cash price, whichever is lower (per Ohio Revised Code §4517.261). For most vehicles above about $3,870, the $387 flat limit applies. For cheaper vehicles, the 10% cap limits the fee further. A title fee increase of $3 took effect January 1, 2026.",
    salesTaxNote:
      "Ohio charges 5.75% state sales tax on vehicles, with county additions up to 2.5%. Combined rates range from 5.8% to 8.25% depending on the county. Trade-in deductions are allowed for new vehicle purchases.",
    registrationNote:
      "Ohio registration fees vary by vehicle type. A service fee increase of $5 (now $8) took effect January 1, 2026. The title fee also increased by $3 effective January 1, 2026.",
    introAngle:
      "Ohio's doc fee cap has an important nuance: it's the lesser of $387 or 10% of the vehicle's cash price. For most vehicle purchases above $3,870, the $387 flat limit applies. Ohio also saw a title fee increase in January 2026. The county-level sales tax variation means buyers should verify their specific county's rate.",
    snippetAnswer:
      "Ohio caps dealer documentation fees at $387 or 10% of the cash price, whichever is lower. State sales tax is 5.75% with county additions up to 8.25% combined. Title fee increased in January 2026.",
    watchFor: [
      "10% cap on lower-priced vehicles: for vehicles priced under $3,870, the 10% rule is more restrictive than the $387 flat cap. Used vehicle buyers should confirm which limit applies.",
      "County sales tax variation: Ohio's combined rates range from 5.8% to 8.25% by county. Verify the rate for your dealer's county before estimating your OTD.",
      "Recent title fee increase: the title fee increased $3 effective January 1, 2026. Update any older OTD estimates.",
    ],
    negotiationNote:
      "Ohio's major metros — Columbus, Cleveland, Cincinnati — have competitive dealer markets. With the doc fee capped, your negotiation focuses on vehicle price and add-ons. The trade-in credit for new vehicles can also meaningfully reduce your tax.",
    ctaHeading: "Have an Ohio dealer quote you want to review?",
    ctaBody:
      "Not sure if your dealer quote is complete? Paste the message or quote you received and Odigos will flag anything unusual.",
    internalLinks: STANDARD_LINKS,
    sources: [
      "https://www.bmv.ohio.gov/doc-fees.aspx",
    ],
    specialNotes:
      "Cap is $387 OR 10% of cash price, whichever is LOWER. Title fee increase of $3 effective Jan 1, 2026.",
    dealerMessage:
      "Hi — I'm interested in a vehicle at your dealership and would like to confirm the full out-the-door price before visiting. Could you please send me an itemized breakdown showing the vehicle sale price, documentation fee (Ohio's cap is $387 or 10% of sale price, whichever is lower), all additional dealer fees, Ohio sales tax (5.75% + your county rate), title fee, and registration costs? I'd like to see the complete total. Thank you.",
    lastVerified: "2026-03",
  },

  oklahoma: {
    name: "Oklahoma",
    abbreviation: "OK",
    slug: "oklahoma",
    docFeeRange: "Typically $200–$400",
    hasCap: false,
    metaDescription:
      "Oklahoma has no cap on dealer doc fees — $200–$400 is typical. The combined vehicle tax is 4.5% (1.25% sales + 3.25% excise). No local additions for vehicles. See the OK OTD picture.",
    capNote:
      "Oklahoma has no state cap on dealer documentation fees. Fees of $200–$400 are commonly reported. There is no legal ceiling.",
    salesTaxNote:
      "Oklahoma charges a combined vehicle tax of 4.5% — consisting of a 1.25% state sales tax plus a 3.25% excise tax on new vehicles. There are no local additions for vehicle purchases, making the effective rate flat statewide.",
    registrationNote:
      "Oklahoma registration is $96 for vehicles in their first through fourth year, decreasing with vehicle age. The title fee is $11.",
    introAngle:
      "Oklahoma has a simple, flat vehicle tax structure: 4.5% combined (1.25% sales + 3.25% excise) with no local additions. Doc fees are uncapped but tend to be moderate. The predictable tax rate makes OTD estimation easier than in many other states.",
    snippetAnswer:
      "Oklahoma dealers typically charge $200–$400 in documentation fees with no state cap. The combined vehicle tax is a flat 4.5% (1.25% sales + 3.25% excise) statewide with no local additions.",
    watchFor: [
      "Combined tax components: make sure your quote shows both the sales tax (1.25%) and excise tax (3.25%) components, or their correct combined total of 4.5%.",
      "Uncapped doc fees: $200–$400 is typical, but there's no cap. Ask for the fee before visiting.",
      "Registration by age: Oklahoma's registration decreases as the vehicle ages — used vehicles cost less to register annually.",
    ],
    negotiationNote:
      "Oklahoma City and Tulsa have competitive dealer markets. The flat 4.5% tax makes OTD comparisons straightforward. Focus negotiation on the vehicle price and uncapped doc fee.",
    ctaHeading: "Have an Oklahoma dealer quote you want to verify?",
    ctaBody:
      "Not sure if your dealer quote is complete? Paste the message or quote you received and Odigos will flag anything unusual.",
    internalLinks: STANDARD_LINKS,
    sources: [
      "https://oklahoma.gov/service/all-services/auto-vehicle/fees.html",
      "https://caredge.com/guides/car-dealer-doc-fee-by-state",
    ],
    specialNotes: null,
    dealerMessage:
      "Hi — I'm interested in a vehicle at your dealership and would like to confirm the full out-the-door price before visiting. Could you please send me an itemized breakdown showing the vehicle sale price, documentation fee, all additional dealer fees, Oklahoma vehicle tax (4.5% combined — 1.25% sales + 3.25% excise), title fee ($11), and registration costs ($96 for new vehicles)? I'd like to see the complete total. Thank you.",
    lastVerified: "2026-03",
  },

  oregon: {
    name: "Oregon",
    abbreviation: "OR",
    slug: "oregon",
    docFeeRange: "Capped at $250 (with integrator) / $200 (without)",
    hasCap: true,
    metaDescription:
      "Oregon caps dealer doc fees at $250 (with integrator) or $200 (without). No sales tax. A 0.5% Vehicle Privilege Tax applies to new vehicles. See the OR OTD picture.",
    capNote:
      "Oregon caps dealer documentation fees at $250 for dealers using an integrator system, or $200 for dealers without an integrator, per ORS §822.043. This is a hard statutory cap. Oregon is also one of five states with no traditional sales tax.",
    salesTaxNote:
      "Oregon has no state sales tax on vehicle purchases. However, a 0.5% Vehicle Privilege Tax applies to new vehicle sales (applied to the dealer's gross receipts). HB 3991 proposes increasing this to 2.25% — pending voter referendum. Private-party and used vehicle sales are generally not subject to this tax.",
    registrationNote:
      "Oregon registration is $43 for two years, with a $60 increase for EVs and 40+ MPG vehicles effective January 1, 2026. The title fee is a sliding scale of $77–$192 based on the vehicle's fuel economy (MPG rating).",
    introAngle:
      "Oregon combines two major buyer advantages: no traditional sales tax and a capped doc fee ($200–$250). However, buyers should be aware of the 0.5% Vehicle Privilege Tax on new vehicles and the MPG-based sliding scale title fee — which means fuel-efficient and electric vehicles actually pay higher title fees in Oregon.",
    snippetAnswer:
      "Oregon caps dealer doc fees at $250 (with integrator) or $200 (without). No state sales tax, but a 0.5% Vehicle Privilege Tax applies to new vehicles. The title fee scales by MPG — fuel-efficient vehicles pay more.",
    watchFor: [
      "Vehicle Privilege Tax on new vehicles: Oregon's 0.5% tax on new vehicle sales applies to the dealer's gross, which is passed to buyers. This is not a traditional sales tax but does appear on new car deals.",
      "MPG-based title fee: Oregon's title fee ranges from $77 to $192 depending on fuel economy. Higher-MPG vehicles pay more — the opposite of what buyers might expect.",
      "EV registration surcharge: starting January 2026, EVs and 40+ MPG vehicles pay an additional $60 in registration. Budget for this if applicable.",
    ],
    negotiationNote:
      "Oregon's doc fee cap removes one area of negotiation. Focus on vehicle price and add-ons. The Portland metro offers competitive dealer options. The absence of sales tax is a meaningful advantage for buyers coming from neighboring high-tax states.",
    ctaHeading: "Have an Oregon dealer quote you want to verify?",
    ctaBody:
      "Not sure if your dealer quote is complete? Paste the message or quote you received and Odigos will flag anything unusual.",
    internalLinks: STANDARD_LINKS,
    sources: [
      "https://www.oregon.gov/odot/dmv/pages/fees/vehicle.aspx",
    ],
    specialNotes:
      "$250 with integrator / $200 without integrator. Title fee is sliding scale $77–$192 based on MPG.",
    dealerMessage:
      "Hi — I'm interested in a vehicle at your dealership and would like to confirm the full out-the-door price before visiting. Could you please send me an itemized breakdown showing the vehicle sale price, documentation fee (Oregon's cap is $250 or $200 depending on your system), all additional dealer fees, Vehicle Privilege Tax if applicable (0.5% on new vehicles), title fee (MPG-based sliding scale), and registration costs? Oregon has no sales tax — please confirm none is included. I'd like to see the complete total. Thank you.",
    lastVerified: "2026-03",
  },

  pennsylvania: {
    name: "Pennsylvania",
    abbreviation: "PA",
    slug: "pennsylvania",
    docFeeRange: "Capped at $490 (electronic) / $409 (non-electronic)",
    hasCap: true,
    metaDescription:
      "Pennsylvania caps dealer doc fees at $490 (electronic) or $409 (non-electronic) per Jan 2026 CPI update. State tax is 6%. Philadelphia is 8%. See the PA OTD picture.",
    capNote:
      "Pennsylvania caps dealer documentation fees at $490 for electronic processing or $409 for non-electronic, effective January 13, 2026 (up from $477/$398 in 2025). These are adjusted annually by CPI per Pennsylvania Bulletin Vol. 55 Issue 1.",
    salesTaxNote:
      "Pennsylvania charges 6% state sales tax on vehicles, increasing to 6.5% October 1, 2025 and 7% October 1, 2026. Philadelphia applies an additional 2% local tax, bringing the Philadelphia rate to 8% currently (and higher in future years). Trade-in deductions are allowed.",
    registrationNote:
      "Pennsylvania registration ranges from $200 to $300 depending on vehicle weight. The title fee is $72.",
    introAngle:
      "Pennsylvania buyers should be aware of two significant changes: (1) the doc fee cap increased in January 2026 to $490 electronic / $409 non-electronic, and (2) the state sales tax is scheduled to increase to 6.5% in October 2025 and 7% in October 2026. If your purchase straddles either date, confirm which rate applies. Philadelphia's 8% combined rate is substantially higher than the statewide base.",
    snippetAnswer:
      "Pennsylvania caps dealer doc fees at $490 (electronic) or $409 (non-electronic) as of January 2026. State sales tax is 6% (increasing to 6.5% Oct 2025, 7% Oct 2026). Philadelphia buyers pay 8% combined.",
    watchFor: [
      "Rising state tax: Pennsylvania's sales tax increases to 6.5% in October 2025 and 7% in October 2026. Time-sensitive buyers should factor in the current applicable rate.",
      "Philadelphia 8% rate: if you're buying in Philadelphia or through a dealer in the city, the combined 8% rate applies. This is meaningfully higher than the statewide 6%.",
      "Electronic vs. non-electronic cap: confirm whether your dealer's documentation is handled electronically ($490 cap) or non-electronically ($409 cap).",
    ],
    negotiationNote:
      "Pennsylvania's Philadelphia and Pittsburgh markets have strong dealer competition. With the cap set, negotiation focuses on vehicle price and add-ons. The rising sales tax rates create timing considerations for buyers.",
    ctaHeading: "Have a Pennsylvania dealer quote you want to review?",
    ctaBody:
      "Not sure if your dealer quote is complete? Paste the message or quote you received and Odigos will flag anything unusual.",
    internalLinks: STANDARD_LINKS,
    sources: [
      "https://www.pacodeandbulletin.gov/Display/pabull?file=/secure/pabulletin/data/vol55/55-1/26.html",
    ],
    specialNotes:
      "Cap: $490 electronic / $409 non-electronic (effective Jan 13, 2026). Adjusted annually by CPI. Up from $477/$398 in 2025.",
    dealerMessage:
      "Hi — I'm interested in a vehicle at your dealership and would like to confirm the full out-the-door price before visiting. Could you please send me an itemized breakdown showing the vehicle sale price, documentation fee (Pennsylvania's cap is $490 electronic or $409 non-electronic as of Jan 2026), all additional dealer fees, Pennsylvania sales tax (please confirm current rate for your location — 6% statewide, 8% in Philadelphia), title fee ($72), and registration costs? I'd like to see the complete total. Thank you.",
    lastVerified: "2026-03",
  },

  "rhode-island": {
    name: "Rhode Island",
    abbreviation: "RI",
    slug: "rhode-island",
    docFeeRange: "Capped at $400 (for vehicles $10,000+)",
    hasCap: true,
    metaDescription:
      "Rhode Island caps dealer doc fees at $400 for vehicles over $10,000 — and prohibits them entirely on vehicles under $10,000. Sales tax is a flat 7%. See the RI OTD picture.",
    capNote:
      "Rhode Island caps dealer documentation fees at $400 for vehicles priced at $10,000 or more (280-RICR-30-20-1.6). Documentation fees are completely prohibited on vehicles under $10,000. A separate $20 title preparation fee is also allowed. Doc fees are included in the taxable measure for sales tax purposes.",
    salesTaxNote:
      "Rhode Island charges a flat 7% sales tax on vehicle purchases statewide. There are no local additions — the rate is uniform. Trade-in deductions are allowed. Note that Rhode Island includes documentation fees in the taxable sales amount, which slightly increases the sales tax.",
    registrationNote:
      "Rhode Island registration ranges from $30 to $50 per year depending on vehicle type. The title fee is $23.",
    introAngle:
      "Rhode Island has an unusual doc fee structure: a $400 cap for vehicles $10,000 or above, and a complete prohibition on fees for vehicles under $10,000. An additional $20 title prep fee is allowed separately. And unlike most states, Rhode Island includes the documentation fee in the taxable sales amount — meaning you'll pay 7% sales tax on the doc fee as well as the vehicle price.",
    snippetAnswer:
      "Rhode Island caps dealer doc fees at $400 for vehicles $10,000+, and prohibits them entirely for vehicles under $10,000. The 7% state sales tax applies even to the documentation fee. A separate $20 title prep fee is allowed.",
    watchFor: [
      "Doc fee included in taxable amount: Rhode Island applies 7% sales tax to the documentation fee as well as the vehicle price. This adds about $28 to your tax on a $400 doc fee.",
      "Prohibition for vehicles under $10K: if you're buying a vehicle under $10,000, the dealer cannot charge a documentation fee. If you see one, ask for it to be removed.",
      "Separate title prep fee: a $20 title preparation fee is permitted in addition to the $400 documentation fee. Both may appear on your quote.",
    ],
    negotiationNote:
      "Rhode Island's small geographic area means buyers can shop across multiple dealerships relatively easily. The doc fee is capped, so focus negotiation on the vehicle price and any add-ons. The sales tax on the doc fee is a small but real additional cost to include in your OTD estimate.",
    ctaHeading: "Have a Rhode Island dealer quote you want to review?",
    ctaBody:
      "Not sure if your dealer quote is complete? Paste the message or quote you received and Odigos will flag anything unusual.",
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
  },

  "south-carolina": {
    name: "South Carolina",
    abbreviation: "SC",
    slug: "south-carolina",
    docFeeRange: "Typically $300–$600",
    hasCap: false,
    metaDescription:
      "South Carolina has no hard cap on dealer doc fees, but fees over $225 require additional documentation to the state. Sales tax is 6% plus local additions up to 9%.",
    capNote:
      "South Carolina does not have a hard statutory cap on documentation fees, but dealers must provide additional documentation to the state for fees exceeding $225. Fees of $300–$600 are commonly reported. There is no legal maximum amount.",
    salesTaxNote:
      "South Carolina charges 6% state sales tax on vehicle purchases, with local additions of up to 3%. Combined rates can reach 9% in some counties. Trade-in deductions are allowed.",
    registrationNote:
      "South Carolina registration ranges from $30 to $100 per year depending on vehicle type. The title fee is $19.",
    introAngle:
      "South Carolina has a soft threshold at $225 — doc fees above this amount require additional state documentation, which creates some implicit accountability without a hard cap. Fees of $300–$600 are still common. The 6% state tax with local additions makes comparison shopping across counties meaningful.",
    snippetAnswer:
      "South Carolina requires additional state documentation for doc fees over $225, but has no hard cap — fees of $300–$600 are common. State sales tax is 6% with local additions up to 9% combined.",
    watchFor: [
      "Fees above $225: any doc fee above $225 requires the dealer to file additional documentation with the state. If your fee is higher, it should be justified — ask for an explanation.",
      "Local tax variation: combined rates can reach 9% in some counties. Verify your effective rate.",
      "Uncapped fees: despite the documentation requirement above $225, there's no hard ceiling. Compare quotes.",
    ],
    negotiationNote:
      "South Carolina's Columbia and Greenville-Spartanburg markets offer competitive dealer options. Ask about the documentation fee upfront and whether it's above the $225 state documentation threshold. Focus negotiation on the vehicle price and any add-ons.",
    ctaHeading: "Have a South Carolina dealer quote you want to review?",
    ctaBody:
      "Not sure if your dealer quote is complete? Paste the message or quote you received and Odigos will flag anything unusual.",
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
  },

  "south-dakota": {
    name: "South Dakota",
    abbreviation: "SD",
    slug: "south-dakota",
    docFeeRange: "Typically $75–$200",
    hasCap: false,
    metaDescription:
      "South Dakota has no cap on dealer doc fees, but they average among the lowest in the country at $75–$200. The state charges a 4.2% excise tax plus a 4% vehicle excise at registration.",
    capNote:
      "South Dakota has no state cap on dealer documentation fees. However, fees average among the lowest in the country at $75–$200. There is no legal ceiling, but competitive pressure keeps fees modest.",
    salesTaxNote:
      "South Dakota charges 4.2% state sales tax (reduced from 4.5% as of July 2023) on vehicle purchases, with local additions of up to 2%. A separate 4% excise tax is also applied to the purchase price at registration. Trade-in deductions are allowed.",
    registrationNote:
      "South Dakota registration fees vary by vehicle weight, plus the 4% excise tax component paid at registration. The title fee is $12.",
    introAngle:
      "South Dakota has some of the lowest dealer documentation fees in the country — typically $75–$200. The overall vehicle purchase cost includes both a state sales tax (4.2%) and a separate 4% excise tax at registration, so buyers should account for both when estimating their OTD.",
    snippetAnswer:
      "South Dakota has no doc fee cap, but fees average among the lowest nationally at $75–$200. The state charges a 4.2% sales tax plus a 4% vehicle excise tax. Account for both when estimating your OTD.",
    watchFor: [
      "Double tax structure: South Dakota applies both a 4.2% sales tax and a 4% excise tax. Make sure your OTD estimate includes both components.",
      "Low doc fees: while fees are typically low, there's no cap. Confirm the amount before visiting.",
      "Local sales tax additions: some South Dakota municipalities add up to 2% on top of the 4.2% base.",
    ],
    negotiationNote:
      "South Dakota's market is concentrated in Sioux Falls and Rapid City. The low fee environment means less financial pressure on the doc fee side — focus negotiation on the vehicle price. Verify both the sales tax and excise tax are correctly calculated.",
    ctaHeading: "Have a South Dakota dealer quote you want to verify?",
    ctaBody:
      "Not sure if your dealer quote is complete? Paste the message or quote you received and Odigos will flag anything unusual.",
    internalLinks: STANDARD_LINKS,
    sources: [
      "https://dor.sd.gov/individuals/motor-vehicle/all-vehicles-title-fees-registration/",
    ],
    specialNotes:
      "Among lowest doc fee averages in the nation.",
    dealerMessage:
      "Hi — I'm interested in a vehicle at your dealership and would like to confirm the full out-the-door price before visiting. Could you please send me an itemized breakdown showing the vehicle sale price, documentation fee, all additional dealer fees, South Dakota sales tax (4.2% + local), 4% vehicle excise tax, title fee ($12), and registration costs? I'd like to see the complete total including both the sales tax and excise tax. Thank you.",
    lastVerified: "2026-03",
  },

  tennessee: {
    name: "Tennessee",
    abbreviation: "TN",
    slug: "tennessee",
    docFeeRange: "Typically $300–$600",
    hasCap: false,
    metaDescription:
      "Tennessee has no cap on dealer doc fees — $300–$600 is typical. Combined sales tax rates can reach 9.75% — among the highest in the US. See the TN OTD picture.",
    capNote:
      "Tennessee has no state cap on dealer documentation fees. Fees of $300–$600 are commonly reported. There is no legal ceiling.",
    salesTaxNote:
      "Tennessee charges 7% state sales tax on vehicle purchases, with local additions of up to 2.75%. Combined rates in the Memphis area reach 9.75% — among the highest in the country. Trade-in deductions are allowed.",
    registrationNote:
      "Tennessee base registration ranges from $14.50 to $36, plus a county wheel tax that varies from $0 to $55 depending on the county. The title fee is $14.",
    introAngle:
      "Tennessee has no doc fee cap and some of the highest combined sales tax rates in the country — reaching 9.75% in the Memphis area. Buyers in high-tax counties should budget carefully for the tax impact, which can add $3,000 or more on a $35,000 vehicle in the Memphis metro. Doc fees are uncapped and vary by dealer.",
    snippetAnswer:
      "Tennessee dealers typically charge $300–$600 in documentation fees with no state cap. Combined sales tax rates reach 9.75% in the Memphis area — among the highest nationally. Verify your county's combined rate before estimating your OTD.",
    watchFor: [
      "High combined tax rates: Memphis area buyers pay 9.75% combined. Even outside Memphis, Tennessee rates are generally high. Know your county's exact rate.",
      "County wheel tax: many Tennessee counties charge an annual wheel tax on registration ($0–$55). This is a small but real addition to your OTD.",
      "Uncapped doc fees: ask for the doc fee before visiting. If above $500, compare with other dealers in the area.",
    ],
    negotiationNote:
      "Tennessee's Nashville and Memphis metros have competitive dealer networks. The high tax rate is fixed by location — focus negotiation on the vehicle price and doc fee. Having a competing OTD quote from another Tennessee dealer is the best leverage.",
    ctaHeading: "Have a Tennessee dealer quote you want to review?",
    ctaBody:
      "Not sure if your dealer quote is complete? Paste the message or quote you received and Odigos will flag anything unusual.",
    internalLinks: STANDARD_LINKS,
    sources: [
      "https://www.tn.gov/revenue/title-and-registration.html",
    ],
    specialNotes:
      "Among highest combined sales tax rates in the nation.",
    dealerMessage:
      "Hi — I'm interested in a vehicle at your dealership and would like to confirm the full out-the-door price before visiting. Could you please send me an itemized breakdown showing the vehicle sale price, documentation fee, all additional dealer fees, Tennessee sales tax (7% state + your local county rate), title fee ($14), registration costs, and any county wheel tax? I'd like to see the complete total. Thank you.",
    lastVerified: "2026-03",
  },

  texas: {
    name: "Texas",
    abbreviation: "TX",
    slug: "texas",
    docFeeRange: "Typically $150–$225 (capped at $225)",
    hasCap: true,
    metaDescription:
      "Texas caps dealer doc fees at $225 (effective July 2024, raised from ~$150). The state tax is a flat 6.25%. See what buyers in Houston, Dallas, and San Antonio pay OTD.",
    capNote:
      "Texas caps dealer documentation fees at $225 — a 'presumed reasonable' limit effective July 11, 2024 (raised from approximately $150 previously). Dealers can charge above $225 only by filing a cost analysis with the OCCC (Texas Administrative Code §84.205). Most Texas dealers charge $150–$225.",
    salesTaxNote:
      "Texas charges a flat 6.25% state motor vehicle sales tax. Local add-ons are limited, so buyers across the state generally see the same effective rate. The tax is calculated on the full purchase price of the vehicle.",
    registrationNote:
      "Texas registration fees are primarily made up of a base registration fee (around $50–$65 depending on county) plus county-specific fees. New vehicle registration is generally straightforward by national standards, though some counties add local assessments. Electric vehicles pay a $400 first-time EV fee plus $200 annually.",
    introAngle:
      "Texas raised its documentation fee cap from approximately $150 to $225 effective July 11, 2024. Dealers can still charge above $225 by filing a cost analysis with the state, but most Texas dealers operate at or below the cap. The 6.25% state sales tax is a flat, uniform rate — simpler than the multi-layered local rates buyers deal with in California or New York.",
    snippetAnswer:
      "Texas caps dealer documentation fees at $225 as of July 2024. Dealers can exceed this only by filing a cost justification with the state. The state sales tax is a flat 6.25% with minimal local variation.",
    watchFor: [
      "Fees above $225: while the $225 level is 'presumed reasonable,' some dealers do file for higher amounts with the state. If you see a doc fee above $225, ask for the justification.",
      "Market adjustment markups on popular models: Texas dealerships on high-demand vehicles sometimes add a market adjustment above MSRP. This is a dealer markup, not a tax — it's negotiable.",
      "Bundled add-on packages listed as 'required': protection packages, paint sealant, and nitrogen tires are common add-on items in Texas dealerships. These are almost never required, even when presented as part of the vehicle configuration.",
      "EV registration fees: if you're buying an electric vehicle in Texas, budget for the $400 first-time fee plus $200 annually.",
    ],
    negotiationNote:
      "Texas's large metro dealer markets create real competitive pressure. Getting quotes from multiple dealers in Dallas, Houston, or San Antonio on the same vehicle gives you comparison leverage. Because the doc fee cap applies to most dealers, OTD negotiation is primarily focused on vehicle price and add-ons.",
    ctaHeading: "Have a Texas dealer quote with extra fees?",
    ctaBody:
      "Not sure if your dealer quote is complete? Paste the message or quote you received and Odigos will flag anything unusual.",
    internalLinks: STANDARD_LINKS,
    sources: [
      "https://occc.texas.gov/wp-content/uploads/2025/11/rc-docfee-adoption-fc-090524.pdf",
    ],
    specialNotes:
      "MAJOR CHANGE: Cap raised to $225 (presumed reasonable) effective July 11, 2024. Fees over $225 require OCCC notification and cost analysis. Previously ~$150.",
    dealerMessage:
      "Hi — I'm interested in a vehicle at your dealership and would like to confirm the full out-the-door price before visiting. Could you please send me an itemized breakdown showing the vehicle sale price, documentation fee (Texas's cap is $225 as of July 2024), all additional dealer fees, Texas sales tax (6.25% flat), title fee ($30), and registration costs? I'd like to see the complete total. Thank you.",
    lastVerified: "2026-03",
  },

  utah: {
    name: "Utah",
    abbreviation: "UT",
    slug: "utah",
    docFeeRange: "Typically $149–$400",
    hasCap: false,
    metaDescription:
      "Utah has no cap on dealer doc fees. State sales tax is 4.7% plus local additions. Registration is among the most expensive in the US at ~$1,541 average for new vehicles.",
    capNote:
      "Utah has no state cap on dealer documentation fees. Fees of $149–$400 are commonly reported. There is no legal ceiling.",
    salesTaxNote:
      "Utah charges 4.7% state sales tax on vehicle purchases, with local additions up to 4%. Combined rates vary significantly — Carbon County at 6.35%, Park City at 9.05%. Trade-in deductions are allowed.",
    registrationNote:
      "Utah's total registration costs for new vehicles average approximately $1,541 — among the most expensive in the country. Registration is weight-based and includes multiple fee components. The title fee is included in registration.",
    introAngle:
      "Utah buyers face two significant costs to be aware of: the state's average new vehicle registration of approximately $1,541 is among the highest nationally, and the local sales tax variation is substantial (from 6.35% to 9.05% depending on location). Doc fees are uncapped in the moderate range.",
    snippetAnswer:
      "Utah has no doc fee cap. The state tax is 4.7% with local additions up to 9.05% combined. Total new vehicle registration averages ~$1,541 — one of the highest in the country.",
    watchFor: [
      "Very high registration costs: Utah's average new vehicle registration of ~$1,541 should be budgeted in your OTD estimate. This is significantly above the national average.",
      "Local tax variation: rates range from 6.35% (Carbon County) to 9.05% (Park City). Know the rate for your dealer's location.",
      "Uncapped doc fees: ask for the fee before visiting. Some Utah dealers charge at the lower end of the $149–$400 range.",
    ],
    negotiationNote:
      "The Salt Lake metro has a competitive dealer market. Focus negotiation on vehicle price and doc fees. The registration cost is a government fee based on vehicle weight — not negotiable. The local tax rate is also fixed by location.",
    ctaHeading: "Have a Utah dealer quote you want to verify?",
    ctaBody:
      "Not sure if your dealer quote is complete? Paste the message or quote you received and Odigos will flag anything unusual.",
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
  },

  vermont: {
    name: "Vermont",
    abbreviation: "VT",
    slug: "vermont",
    docFeeRange: "Typically $150–$300",
    hasCap: false,
    metaDescription:
      "Vermont has no cap on dealer doc fees — $150–$300 is typical. The state tax is 6% (some localities add 1%). Uniquely, Vermont taxes doc fees as part of the purchase price.",
    capNote:
      "Vermont has no state cap on dealer documentation fees. Fees of $150–$300 are commonly reported — lower than most uncapped states. There is no legal ceiling.",
    salesTaxNote:
      "Vermont charges 6% state sales tax on vehicle purchases, with an optional 1% local tax in some municipalities (Burlington, Hartford, Middlebury effective July 1, 2025). Trade-in deductions are allowed. Vermont's DMV specifically states that documentation fees are taxable — they are included in the purchase price for sales tax calculation.",
    registrationNote:
      "Vermont registration is $76 per year or $140 for two years, plus a $2 Clean Air fee. Electric vehicle owners pay $89 additionally (or $44.50 for plug-in hybrids). The title fee is $35.",
    introAngle:
      "Vermont has a notable quirk: per the Vermont DMV, documentation fees are included in the taxable purchase price — meaning you pay 6% sales tax on the doc fee as well as the vehicle price. Fees are relatively modest at $150–$300 with no cap. Some municipalities added local 1% tax options in July 2025.",
    snippetAnswer:
      "Vermont dealers typically charge $150–$300 in documentation fees — lower than most states. Vermont taxes documentation fees as part of the purchase price. The state sales tax is 6%, with some municipalities adding 1%.",
    watchFor: [
      "Doc fees are taxable: Vermont includes documentation fees in the taxable purchase price. On a $250 doc fee, you'll pay $15 additional sales tax.",
      "New municipal taxes: Burlington, Hartford, and Middlebury added local 1% taxes effective July 1, 2025. Confirm your dealer's municipality's rate.",
      "EV registration surcharge: EVs pay $89 additional registration annually, PHEVs pay $44.50.",
    ],
    negotiationNote:
      "Vermont's smaller market means fewer competing dealers, particularly outside Burlington. The low doc fee environment is favorable — focus negotiation on the vehicle price. Ask for the doc fee to be itemized separately since it's included in the taxable amount.",
    ctaHeading: "Have a Vermont dealer quote you want to review?",
    ctaBody:
      "Not sure if your dealer quote is complete? Paste the message or quote you received and Odigos will flag anything unusual.",
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
  },

  virginia: {
    name: "Virginia",
    abbreviation: "VA",
    slug: "virginia",
    docFeeRange: "Typically $500–$800",
    hasCap: false,
    metaDescription:
      "Virginia has no cap on dealer doc fees — $500–$800 is typical. Virginia does NOT allow trade-in deductions. Total tax is 5.3%–7% by locality. See the VA OTD picture.",
    capNote:
      "Virginia has no state cap on dealer documentation fees. Fees of $500–$800 are commonly reported — on the higher end of uncapped states. There is no legal ceiling.",
    salesTaxNote:
      "Virginia charges 4.15% state sales tax on vehicles (with a minimum $75 tax), and combined with local additions, total rates range from 5.3% to 7% by locality. Critically, Virginia does NOT allow trade-in deductions — tax applies to the full vehicle price, not the net price after trade-in.",
    registrationNote:
      "Virginia registration runs $30.75 per year for vehicles 0–4,000 lbs, or $35.75 per year for 4,001–6,500 lbs. Electric vehicles pay an additional $131.88 annual fee. The title fee is $15.",
    introAngle:
      "Virginia buyers face two notable challenges: high uncapped doc fees ($500–$800) and one of the few states that does not allow trade-in deductions from the taxable purchase price. If you're trading in a $20,000 vehicle in Virginia, you still pay tax on the full purchase price — not the net. This can add hundreds to your OTD compared to trade-in-credit states.",
    snippetAnswer:
      "Virginia dealers typically charge $500–$800 in documentation fees with no state cap. Virginia does NOT allow trade-in tax deductions — you pay tax on the full purchase price. Combined tax rates range from 5.3% to 7% by locality.",
    watchFor: [
      "No trade-in credit: Virginia is one of the few states that taxes the full purchase price even when you have a trade-in. Budget for the full tax on the vehicle price, not the net.",
      "High uncapped doc fees: $500–$800 is typical with no cap. Ask for the fee before visiting and compare across dealers.",
      "Local tax rate variation: combined rates vary from 5.3% to 7% by locality. Confirm the effective rate for your dealer's location.",
      "EV annual fee: electric vehicles pay $131.88 additional per year in registration surcharge.",
    ],
    negotiationNote:
      "Virginia's Northern Virginia / DC metro area has a competitive dealer market. The high doc fees and no trade-in credit make it important to compare total OTD quotes, not just vehicle prices. The trade-in situation means if you have a trade-in, verify the dealer isn't implying a credit that the state doesn't actually allow.",
    ctaHeading: "Have a Virginia dealer quote you want to review?",
    ctaBody:
      "Not sure if your dealer quote is complete? Paste the message or quote you received and Odigos will flag anything unusual.",
    internalLinks: STANDARD_LINKS,
    sources: [
      "https://www.tax.virginia.gov/retail-sales-and-use-tax",
      "https://www.dmv.virginia.gov/vehicles/title",
    ],
    specialNotes:
      "One of few states that does not allow trade-in tax credit. High doc fees with no cap.",
    dealerMessage:
      "Hi — I'm interested in a vehicle at your dealership and would like to confirm the full out-the-door price before visiting. Could you please send me an itemized breakdown showing the vehicle sale price, documentation fee, all additional dealer fees, Virginia sales tax (4.15% state + your locality's additional rate — please note Virginia does not allow trade-in deductions), title fee ($15), and registration costs? I'd like to see the complete total. Thank you.",
    lastVerified: "2026-03",
  },

  washington: {
    name: "Washington",
    abbreviation: "WA",
    slug: "washington",
    docFeeRange: "Capped at $200 (effective July 2022)",
    hasCap: true,
    metaDescription:
      "Washington State caps dealer doc fees at $200 (effective July 2022). State sales tax is 6.5% with local additions. Title fee increased to $6.50 in 2026. See the WA OTD picture.",
    capNote:
      "Washington State caps dealer documentation fees at $200, effective July 1, 2022. Dealers cannot represent this fee as required by law. The title fee increased to $6.50 effective January 1, 2026.",
    salesTaxNote:
      "Washington charges 6.5% state sales tax on vehicle purchases, with local additions of up to 4.1%. Combined rates range from 7% to 10.4% depending on location. Trade-in deductions are allowed for vehicles of like kind.",
    registrationNote:
      "Washington base registration is $43.25 plus weight and location adjustments. The title fee increased to $6.50 effective January 1, 2026 (from the prior $7 — note: check current fee schedule).",
    introAngle:
      "Washington State's $200 cap on documentation fees provides buyer protection, but the significant range of local sales tax rates (7% to 10.4%) makes the effective OTD cost vary substantially by location. Seattle-area buyers face rates near the high end. The cap prohibits dealers from representing the doc fee as required by law.",
    snippetAnswer:
      "Washington State caps dealer documentation fees at $200. State sales tax is 6.5% with local additions up to 10.4% combined. Trade-in credit applies for like-kind vehicles.",
    watchFor: [
      "Local sales tax variation: combined rates in Washington vary from 7% to 10.4%. Seattle buyers face some of the higher rates. Verify the rate for your dealer's location.",
      "Doc fee above the cap: any documentation fee above $200 is not permitted. Dealers also cannot call this fee 'required by law.' If you see a higher amount, it's above the cap.",
      "Title fee update: the title fee changed effective January 1, 2026. Make sure your quote reflects the current amount.",
    ],
    negotiationNote:
      "The Seattle metro has a competitive dealer market. With the doc fee capped at $200, negotiation is focused on vehicle price and add-ons. The local sales tax is fixed by the dealer's location — not negotiable.",
    ctaHeading: "Have a Washington State dealer quote you want to review?",
    ctaBody:
      "Not sure if your dealer quote is complete? Paste the message or quote you received and Odigos will flag anything unusual.",
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
  },

  "west-virginia": {
    name: "West Virginia",
    abbreviation: "WV",
    slug: "west-virginia",
    docFeeRange: "Capped at $575 (CPI-adjusted from July 2025)",
    hasCap: true,
    metaDescription:
      "West Virginia caps dealer doc fees at $575, raised from $499 effective July 2024 and CPI-adjusted annually from July 2025. State tax is 6% plus local additions up to 7%.",
    capNote:
      "West Virginia caps dealer documentation fees at $575, effective July 1, 2024 (increased from $499). CPI adjustments apply annually starting July 1, 2025 per WV Code 17A-6A-8A. Dealers cannot legally exceed this amount.",
    salesTaxNote:
      "West Virginia charges 6% state sales tax on vehicle purchases, with local additions of up to 1%. Combined rates reach 7% in Charleston, Huntington, and Morgantown. Trade-in deductions are allowed.",
    registrationNote:
      "West Virginia registration varies by vehicle type and includes an annual wheel tax. Registration specifics vary by county.",
    introAngle:
      "West Virginia's doc fee cap increased from $499 to $575 in July 2024, with annual CPI adjustments beginning July 2025. Buyers should use the current cap amount rather than older references. The 6% state tax with modest local additions is relatively straightforward.",
    snippetAnswer:
      "West Virginia caps dealer doc fees at $575 (increased July 2024, CPI-adjusted annually from July 2025). State sales tax is 6% with local additions up to 7% combined. Cap set by WV Code 17A-6A-8A.",
    watchFor: [
      "Updated cap: West Virginia's cap increased from $499 to $575 in July 2024. If you're using older references, update to the current cap amount.",
      "CPI adjustments: the cap adjusts annually by CPI from July 2025 onward. Verify the current year's cap before finalizing your OTD estimate.",
      "Local tax additions: cities like Charleston, Huntington, and Morgantown add 1% to the 6% base, reaching 7%.",
    ],
    negotiationNote:
      "West Virginia's market is less competitive than major metro areas. Compare quotes across the state's limited dealer network. The doc fee is capped, so focus negotiation on vehicle price and add-ons.",
    ctaHeading: "Have a West Virginia dealer quote you want to verify?",
    ctaBody:
      "Not sure if your dealer quote is complete? Paste the message or quote you received and Odigos will flag anything unusual.",
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
  },

  wisconsin: {
    name: "Wisconsin",
    abbreviation: "WI",
    slug: "wisconsin",
    docFeeRange: "Typically $295–$500",
    hasCap: false,
    metaDescription:
      "Wisconsin has no cap on dealer doc fees — $295–$500 is typical. Title fee increased to ~$215 in October 2025. State tax is 5% plus county additions. See the WI OTD picture.",
    capNote:
      "Wisconsin has no state cap on dealer documentation fees. Fees of $295–$500 are commonly reported. There is no legal ceiling.",
    salesTaxNote:
      "Wisconsin charges 5% state sales tax on vehicle purchases, with county and city additions. Milwaukee area buyers see the highest combined rate at 7.9%. Most other areas are at 5.5%, with 4 counties at 5%. Trade-in deductions are allowed.",
    registrationNote:
      "Wisconsin base registration is $85 per year, plus $175 annually for electric vehicles or $75 for hybrids. The title fee increased from $164.50 to approximately $214.50 effective October 1, 2025.",
    introAngle:
      "Wisconsin saw a significant title fee increase in October 2025 — from $164.50 to approximately $214.50. Buyers working from older OTD estimates should update this figure. Doc fees are uncapped in the moderate $295–$500 range. The 5% state rate with county additions is straightforward.",
    snippetAnswer:
      "Wisconsin dealers typically charge $295–$500 in documentation fees with no state cap. The title fee increased to ~$215 effective October 2025. State tax is 5% with county additions up to 7.9% in Milwaukee.",
    watchFor: [
      "Title fee increase: Wisconsin's title fee jumped from ~$164 to ~$215 in October 2025. Update any older OTD estimates to reflect the new amount.",
      "EV/hybrid surcharges: EVs pay $175 additional annually, PHEVs pay $75 additional. Budget for these if you're buying an electrified vehicle.",
      "Milwaukee vs. other counties: Milwaukee's 7.9% combined rate is notably higher than the 5–5.5% elsewhere. Know your dealer's county.",
    ],
    negotiationNote:
      "Milwaukee and Madison have competitive dealer markets. The doc fee is uncapped — ask if it's flexible. The recent title fee increase adds to the OTD cost, so make sure your quote is current.",
    ctaHeading: "Have a Wisconsin dealer quote you want to review?",
    ctaBody:
      "Not sure if your dealer quote is complete? Paste the message or quote you received and Odigos will flag anything unusual.",
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
  },

  wyoming: {
    name: "Wyoming",
    abbreviation: "WY",
    slug: "wyoming",
    docFeeRange: "Typically $200–$400",
    hasCap: false,
    metaDescription:
      "Wyoming has no cap on dealer doc fees — $200–$400 is typical. Sales tax is 4% plus local additions up to 9%. A VIN inspection fee of $10 is also required. See the WY OTD picture.",
    capNote:
      "Wyoming has no state cap on dealer documentation fees. Fees of $200–$400 are commonly reported. There is no legal ceiling.",
    salesTaxNote:
      "Wyoming charges 4% state sales tax on vehicle purchases, with local additions of up to 5%. Combined rates vary from 4% in some areas to 9% in Teton Village/Alta. Jackson and Cheyenne are at 6%. Trade-in deductions are allowed.",
    registrationNote:
      "Wyoming registration consists of a $30 state fee plus a county fee calculated at 3% of the vehicle's factory price multiplied by a depreciation rate. A $10 VIN inspection fee is also required. No separate title fee exists — title is included.",
    introAngle:
      "Wyoming has no sales tax on vehicle purchases in most areas outside of tourist-heavy locations, but the 4% base with local additions means some areas (Teton Village, Jackson) reach 9% — one of the wider ranges in the country. Doc fees are uncapped but moderate. The unique VIN inspection fee is an additional small cost to include in your estimate.",
    snippetAnswer:
      "Wyoming dealers typically charge $200–$400 in documentation fees with no state cap. State sales tax is 4% with local additions up to 9% in tourist areas. A $10 VIN inspection fee applies to all purchases.",
    watchFor: [
      "High resort area tax rates: Teton Village and Alta reach 9% combined. Jackson is 6%. If you're buying near a tourist area, confirm the local rate.",
      "$10 VIN inspection fee: this is a state requirement for all vehicle purchases in Wyoming. It's a small fee but should be in your OTD.",
      "County registration formula: Wyoming registration is calculated using factory price and a depreciation schedule — not a flat fee. Confirm the exact amount for your specific vehicle.",
    ],
    negotiationNote:
      "Wyoming has a limited dealer market outside Cheyenne and Casper. The doc fee is uncapped and worth asking about. The unique county registration formula means getting the exact first-year registration cost from the dealer is important for an accurate OTD comparison.",
    ctaHeading: "Have a Wyoming dealer quote you want to verify?",
    ctaBody:
      "Not sure if your dealer quote is complete? Paste the message or quote you received and Odigos will flag anything unusual.",
    internalLinks: STANDARD_LINKS,
    sources: [
      "https://wyominglicenseplate.org/vehicle-registration-fees",
    ],
    specialNotes:
      "VIN inspection fee $10 additional.",
    dealerMessage:
      "Hi — I'm interested in a vehicle at your dealership and would like to confirm the full out-the-door price before visiting. Could you please send me an itemized breakdown showing the vehicle sale price, documentation fee, all additional dealer fees, Wyoming sales tax (4% + your local county rate), VIN inspection fee ($10), and registration costs (including county depreciation formula)? I'd like to see the complete total. Thank you.",
    lastVerified: "2026-03",
  },
};

export const STATE_SLUGS = Object.keys(STATE_FEES);
