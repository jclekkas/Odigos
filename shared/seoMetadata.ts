/**
 * Server-side SEO metadata for HTML injection.
 * The server uses this to replace the generic SPA shell title/meta
 * with page-specific values before sending the HTML response.
 *
 * This is the single source of truth for what Googlebot sees.
 * The client-side setSeoMeta() calls should match these values.
 */

const CANONICAL_ORIGIN = "https://odigosauto.com";

export interface PageSeoMeta {
  title: string;
  description: string;
}

// Explicit metadata for high-priority pages
const SEO_MAP: Record<string, PageSeoMeta> = {
  "/": {
    title: "Odigos — Dealer Quote Analyzer | Detect Junk Fees & Hidden Charges",
    description:
      "Paste your dealer quote. Odigos detects junk fees, hidden charges, and missing details in 60 seconds. Get a GO/NO-GO verdict and a ready-to-send dealer reply. Free preview, full analysis $49.",
  },
  "/analyze": {
    title: "Analyze Your Car Deal | Odigos",
    description:
      "Paste dealer texts, emails, or quotes into Odigos. Get an instant GO/NO-GO recommendation with hidden fee detection and suggested questions for the dealer.",
  },

  // ── Top 10 GSC pages (updated SEO copy) ──────────────────────
  "/car-dealer-fees-texas": {
    title: "Texas Dealer Fees (2026): $225 Doc Fee Cap & Charges to Refuse",
    description:
      "Texas caps dealer doc fees at $225 in 2026. See the full list of legal vs. junk fees, what you can refuse, and how to check any Texas dealer quote instantly.",
  },
  "/car-dealer-fees-new-york": {
    title: "New York Dealer Fees (2026): $175 Doc Fee Cap & What to Watch",
    description:
      "NY caps dealer doc fees at $175. Learn which fees are legal, which are junk, and check any New York dealer quote for overcharges — free with Odigos.",
  },
  "/car-dealer-fees-california": {
    title: "California Dealer Fees (2026): No Doc Fee Cap — Protect Yourself",
    description:
      "California has no cap on dealer doc fees. See average charges, which add-ons to refuse, and check any CA dealer quote for junk fees — free with Odigos.",
  },
  "/car-dealer-fees-new-mexico": {
    title: "New Mexico Dealer Fees (2026): Doc Fee Rules & What's Negotiable",
    description:
      "New Mexico dealer doc fee rules for 2026. See what's legally allowed, what you can negotiate, and check any NM dealer quote for junk fees — free with Odigos.",
  },
  "/dealer-doc-fee-by-state": {
    title: "Dealer Doc Fees by State (2026): Every Cap in One Table",
    description:
      "Complete 2026 table of dealer doc fee caps for all 50 states. See which states have no cap, which limit fees, and how to check if your dealer is overcharging.",
  },
  "/out-the-door-price": {
    title: "Out-the-Door Price Explained: Your Real Cost Before Signing",
    description:
      "Out-the-door price is the final amount you pay to drive off the lot. Learn what's included, how to calculate it, and how to spot hidden fees dealers add on.",
  },
  "/dealer-add-ons-list": {
    title: "Dealer Add-Ons List: Which Are Scams & Which You Need (2026)",
    description:
      "Full list of dealer add-ons with verdict on each: VIN etching, nitrogen tires, paint protection & more. Know what to refuse before you sign.",
  },
  "/calculate-out-the-door-price": {
    title: "OTD Price Calculator: Estimate Your True Out-the-Door Cost",
    description:
      "Calculate your real out-the-door price before visiting the dealer. Paste your quote and see taxes, fees, and hidden charges broken down line by line.",
  },
  "/dealer-wont-give-otd-price": {
    title: "Dealer Won't Give OTD Price? Here's Exactly What to Do",
    description:
      "If your dealer refuses to give an out-the-door price, here's why they do it, what to say back, and how to calculate your OTD price yourself from any quote.",
  },
  "/dealer-doc-fee": {
    title: "What Is a Dealer Doc Fee? How to Know If Yours Is Too High",
    description:
      "Dealer doc fees cover paperwork but some charge 3-4x the cap. Learn what's normal in your state and check if your dealer is overcharging.",
  },

  // ── Other content pages ──────────────────────────────────────
  "/about": {
    title: "About Odigos — The Independent Car Deal Guide",
    description:
      "Odigos (Greek for 'guide') is an independent tool that analyzes car dealer quotes for hidden fees and overcharges. No dealership affiliations. No referral fees. Just clarity before you sign.",
  },
  "/privacy": {
    title: "Privacy Policy | Odigos",
    description:
      "How Odigos handles submitted dealer quotes, what data is stored, and your rights.",
  },
  "/terms": {
    title: "Terms of Service | Odigos",
    description:
      "Terms of Service for Odigos — independent dealer quote analysis. Read about acceptable use, disclaimers, and limitations of liability.",
  },
  "/how-odigos-works": {
    title: "How Odigos Works | Dealer Quote Analysis",
    description:
      "Learn how Odigos analyzes car dealer quotes for missing out-the-door pricing, hidden fees, and common dealership tactics — and what you get from the analysis.",
  },
  "/example-analysis": {
    title: "Example Dealer Quote Analysis | Odigos",
    description:
      "See exactly what an Odigos dealer quote analysis looks like on a real example — including flagged issues, verdict, and a copy-paste reply to send back to the dealer.",
  },
  "/car-dealer-fees-explained": {
    title: "Common Car Dealer Fees Explained | Odigos",
    description:
      "When you buy a car, the sale price is only part of what you pay. Learn which dealer fees are required, which are optional, and how to protect yourself before signing.",
  },
  "/car-dealer-fees-list": {
    title: "Car Dealer Fees List: Common Dealer Charges and What They Mean | Odigos",
    description:
      "A complete list of common car dealer fees — from doc fees to market adjustments. Learn which charges are normal, which are negotiable, and how to compare dealers correctly.",
  },
  "/car-dealer-fees-by-state": {
    title: "Car Dealer Fees by State (2026): Caps, Limits, and What Dealers Can Charge You",
    description:
      "Which states cap dealer doc fees — and which let dealers charge whatever they want? See 2026 limits for all 50 states and how to compare out-the-door prices.",
  },
  "/dealer-pricing-tactics": {
    title: "Dealer Pricing Tactics: Complete Guide (2026) | Odigos",
    description:
      "Learn how car dealers use pricing tactics to keep buyers in the dark — and exactly what to say to get a fair, transparent deal.",
  },
  "/dealer-pricing-problems": {
    title: "Dealer Tactics: Pricing Tricks and Negotiation Guides | Odigos",
    description:
      "Guides on hidden dealer fees, forced add-ons, the monthly payment trap, out-the-door pricing, and common dealership tactics — written for U.S. car buyers.",
  },
  "/market-adjustment-fee": {
    title: "Market Adjustment Fee: What It Is and What to Do | Odigos",
    description:
      "Market adjustment fees add thousands above MSRP. Learn what they are, whether they're legal, how to negotiate them down, and what to watch for in quotes.",
  },
  "/dealer-wont-give-otd": {
    title: "Why Dealers Avoid Giving Out-the-Door Prices (and What to Do) | Odigos",
    description:
      "Learn why dealers avoid giving OTD prices, how it benefits them, and what it signals about the deal you're being offered.",
  },
  "/monthly-payment-trap": {
    title: "The Monthly Payment Trap in Car Buying | Odigos",
    description:
      "A $489/month payment could mean $29,340 or $35,208 depending on APR and term. Learn how payment-focused quotes hide the real cost and how to negotiate the out-the-door price first.",
  },
  "/mandatory-dealer-add-ons": {
    title: "Mandatory Dealer Add-Ons: Which Are Actually Required by the Dealer | Odigos",
    description:
      "Understand which dealer add-ons are truly required, which are optional, and why dealers pre-install extras to increase profit.",
  },
  "/are-dealer-add-ons-mandatory": {
    title: "Are Dealer Add-Ons Mandatory? What You Can Refuse | Odigos",
    description:
      "Are dealer add-ons mandatory? Learn which fees and add-ons you can refuse and how to push back without losing the deal.",
  },
  "/are-dealer-add-ons-negotiable": {
    title: "Are Dealer Add-Ons Negotiable? What Dealers Will Actually Concede | Odigos",
    description:
      "Most dealer add-ons are negotiable, but not all. Learn which extras dealers will drop, when to push, and how to anchor your ask to get real concessions.",
  },
  "/are-dealer-add-ons-required-by-law": {
    title: "Are Dealer Add-Ons Required by Law? What's Mandatory vs. Optional | Odigos",
    description:
      "Dealers sometimes present add-ons as legally required. Here's what the law actually mandates — and how to tell the difference between a government fee and a dealer upsell.",
  },
  "/how-to-remove-dealer-add-ons": {
    title: "How to Remove Dealer Add-Ons: Step-by-Step Guide | Odigos",
    description:
      "A step-by-step guide to removing dealer add-ons before you sign. What to do before the visit, in the finance office, and after an initial refusal.",
  },
  "/dealer-add-ons-explained": {
    title: "Dealer Add-Ons Explained: What Each One Actually Is | Odigos",
    description:
      "Plain-language explanations of every common dealer add-on — what it is, what the dealer says, what's actually true, and whether it's worth paying for.",
  },
  "/dealer-added-fees-after-agreement": {
    title: "Dealer Added Fees After Agreement? What to Do Next | Odigos",
    description:
      "You agreed on a price and now new charges appeared. Learn which dealer fees are legitimate, which are optional, and exactly what to say to get clarity before you sign.",
  },
  "/dealer-changed-price-after-deposit": {
    title: "Dealer Changed the Price After Your Deposit? What It Means | Odigos",
    description:
      "If a dealer changed the price after you put down a deposit, here's why it happens, what protects you, and what to do next to get your money back or hold them to the original deal.",
  },
  "/finance-office-changed-the-numbers": {
    title: "Why the Finance Office Numbers Look Different | Odigos",
    description:
      "You agreed on a price, but the finance office paperwork shows different numbers. Learn why this happens, what to check, and how to protect yourself before signing.",
  },
  "/are-dealer-fees-negotiable": {
    title: "Are Dealer Fees Negotiable? What to Push Back On | Odigos",
    description:
      "Some dealer fees are fixed by law; others are dealer profit items. Learn which are negotiable, how to push back, and the OTD strategy that works.",
  },
  "/hidden-dealer-fees": {
    title: "Hidden Dealer Fees: What to Watch for on Any Quote | Odigos",
    description:
      "Market adjustment, prep fees, VIN etching, and more — hidden dealer fees add hundreds to a car purchase. Learn what each one is and what you can do.",
  },
  "/doc-fee-too-high": {
    title: "Dealer Doc Fee Too High? What You Can Actually Do | Odigos",
    description:
      "Doc fees vary widely by state and dealer. Learn what's normal, whether you can negotiate, and what red flags to watch for when a dealer's documentation fee seems too high.",
  },
  "/what-is-a-dealer-doc-fee": {
    title: "What Is a Dealer Doc Fee? Ranges by State | Odigos",
    description:
      "A dealer doc fee is a paperwork charge set by the dealership, not the government. Learn what it covers, typical ranges by state, and what counts as normal.",
  },
  "/dealer-prep-fee": {
    title: "Dealer Prep Fee: What It Is and Should You Pay It | Odigos",
    description:
      "Dealers charge a prep fee for getting a new car ready for delivery. Learn what it supposedly covers, why it's usually unjustified, and how to push back.",
  },
  "/dealer-reconditioning-fee": {
    title: "Dealer Reconditioning Fee: What It Covers | Odigos",
    description:
      "A dealer reconditioning fee covers used car refurbishment. Learn what is legitimate, when fees are inflated, red flags to watch for, and how to negotiate.",
  },
  "/is-this-a-good-car-deal": {
    title: "Is This a Good Car Deal? 4 Signs It Is (and 3 Red Flags) | Odigos",
    description:
      "Learn how to tell if a car deal is actually good using 4 key signals and 3 red flags most buyers miss before signing.",
  },
  "/how-to-tell-if-a-car-deal-is-good": {
    title: "How to Tell if a Car Deal Is Good: OTD, Fees, Add-Ons, Financing | Odigos",
    description:
      "Use this four-step checklist to evaluate any car deal, including OTD price, hidden fees, add-ons, and financing traps.",
  },
  "/what-is-a-fair-price-for-a-car": {
    title: "How Much Should You Pay for a Car? OTD Price vs. Monthly Payment | Odigos",
    description:
      "Find out how much you should really pay for a car by comparing OTD price instead of monthly payments and avoiding common traps.",
  },
  "/how-much-should-you-pay-for-a-car": {
    title: "How Much Should You Pay for a Car? OTD Price vs. Monthly Payment | Odigos",
    description:
      "Find out how much you should really pay for a car by comparing OTD price instead of monthly payments and avoiding common traps.",
  },
  "/how-to-compare-car-deals": {
    title: "How to Compare Car Deals Side by Side (OTD to OTD) | Odigos",
    description:
      "Compare car deals the right way by focusing on OTD price, not monthly payments, so you can avoid misleading financing tactics.",
  },
  "/best-way-to-check-if-a-car-deal-is-good": {
    title: "The Fastest Way to Check a Car Deal Without Being Tricked | Odigos",
    description:
      "Quickly check if a car deal is good without spreadsheets or guesswork, and avoid common tricks dealers use to hide costs.",
  },
  "/out-the-door-price-calculator": {
    title: "Out-the-Door Price Calculator (2026) - Estimate Car Total Cost Instantly",
    description:
      "Use this out-the-door price calculator to estimate your total car cost with taxes and dealer fees. Get a real OTD estimate in seconds.",
  },
  "/what-does-out-the-door-price-include": {
    title: "What Does Out-the-Door Price Include? | Odigos",
    description:
      "An OTD price includes the vehicle sale price, all taxes, registration and title fees, the dealer documentation fee, and any add-ons.",
  },
  "/out-the-door-price-vs-msrp": {
    title: "Out-the-Door Price vs. MSRP: The Gap Buyers Miss | Odigos",
    description:
      "MSRP is a suggestion, not what you pay. Taxes, fees, and add-ons push real cost 8–15% above the sticker. Here's how to use that gap to your advantage.",
  },
  "/out-the-door-price-vs-monthly-payment": {
    title: "OTD Price vs. Monthly Payment: What Dealers Hide | Odigos",
    description:
      "Dealers leading with a monthly payment hide the sale price, APR, loan term, and rolled-in add-ons. Here's how that mechanic works and how to stop it.",
  },
  "/out-the-door-price-example": {
    title: "Out-the-Door Price Example: Real Numbers | Odigos",
    description:
      "A $33,500 car becomes $37,947 after taxes, fees, and add-ons. Three real OTD scenarios with exact dollar amounts on every line so you know what to expect.",
  },
  "/why-dealers-wont-give-out-the-door-price": {
    title: "Why Dealers Won't Give Out-the-Door Price | Odigos",
    description:
      "Dealers resist OTD pricing because it removes structural advantages. Here's the incentive structure behind the refusal and what you can do about it.",
  },
  "/glossary": {
    title: "Car Buying Glossary: Dealer Fees & Lease Terms Explained | Odigos",
    description:
      "Plain-English definitions of dealer fees, lease terms, and pricing jargon. Understand every line item on your car deal.",
  },
  "/junk-fees-explained": {
    title: "Car Dealer Junk Fees: The Complete 2026 Guide | Odigos",
    description:
      "Junk fees are hidden or surprise charges that provide little value to the buyer. Learn the 15+ most common dealer junk fees, which are legal, and how to fight back.",
  },
  "/money-factor-explained": {
    title: "Money Factor Explained: The Hidden Interest Rate in Car Leases | Odigos",
    description:
      "Money factor is the lease equivalent of an interest rate. Learn how to convert it to APR, what a good money factor looks like, and how dealers mark it up without telling you.",
  },
  "/car-lease-fees-explained": {
    title: "Car Lease Fees Explained: Every Fee on Your Lease Quote | Odigos",
    description:
      "A complete breakdown of every fee on a car lease: acquisition fee, disposition fee, excess mileage, wear-and-tear charges, early termination, and more. Know what you're paying before you sign.",
  },
  "/residual-value-explained": {
    title: "Residual Value Explained: How It Controls Your Lease Payment | Odigos",
    description:
      "Residual value is the biggest factor in your monthly lease payment. Learn what it is, who sets it, typical percentages by vehicle type, and how to use it to get a better deal.",
  },

  // ── State pages with explicit metadata ───────────────────────
  "/car-dealer-fees-florida": {
    title: "Florida Dealer Fees (2026): No State Cap — What to Watch Out For",
    description:
      "Florida has no doc fee cap — $499–$999 is common, among the highest nationwide. State tax is 6% plus county surtax. See the full FL OTD picture for 2026.",
  },
};

// State slugs for dynamic fallback (states not explicitly in SEO_MAP)
const STATE_SLUGS = new Set([
  "alabama", "alaska", "arizona", "arkansas", "colorado", "connecticut",
  "delaware", "district-of-columbia", "georgia", "hawaii", "idaho", "illinois",
  "indiana", "iowa", "kansas", "kentucky", "louisiana", "maine", "maryland",
  "massachusetts", "michigan", "minnesota", "mississippi", "missouri", "montana",
  "nebraska", "nevada", "new-hampshire", "new-jersey", "north-carolina",
  "north-dakota", "ohio", "oklahoma", "oregon", "pennsylvania", "rhode-island",
  "south-carolina", "south-dakota", "tennessee", "utah", "vermont", "virginia",
  "washington", "west-virginia", "wisconsin", "wyoming",
]);

function slugToName(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * Resolve SEO metadata for a given pathname.
 * Normalizes trailing slashes before lookup.
 * Returns null for routes that should use the default SPA shell metadata.
 */
export function getSeoMeta(
  pathname: string,
): (PageSeoMeta & { canonical: string }) | null {
  const normalized =
    pathname.endsWith("/") && pathname !== "/"
      ? pathname.slice(0, -1)
      : pathname;

  const explicit = SEO_MAP[normalized];
  if (explicit) {
    return { ...explicit, canonical: `${CANONICAL_ORIGIN}${normalized}` };
  }

  // Dynamic state page fallback
  const stateMatch = normalized.match(/^\/car-dealer-fees-(.+)$/);
  if (stateMatch && STATE_SLUGS.has(stateMatch[1])) {
    const name = slugToName(stateMatch[1]);
    return {
      title: `${name} Dealer Fees (2026): What Dealers Can Legally Charge | Odigos`,
      description: `${name} dealer doc fee rules, sales tax, and registration costs for 2026. See what's legally allowed and check any ${name} dealer quote for junk fees.`,
      canonical: `${CANONICAL_ORIGIN}${normalized}`,
    };
  }

  return null;
}
