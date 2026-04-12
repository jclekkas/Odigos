import { useEffect } from "react";
import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { setSeoMeta } from "@/lib/seo";
import { articleSchema } from "@/lib/jsonld";
import ArticleLayout from "@/components/ArticleLayout";

const sections = [
  {
    heading: "Fees",
    items: [
      {
        href: "/dealer-doc-fee",
        title: "Are Dealer Documentation Fees Legit?",
        description: "What a doc fee is, whether it's negotiable, and what's normal in your state.",
      },
      {
        href: "/dealer-doc-fee-by-state",
        title: "Dealer Doc Fee by State",
        description: "State-by-state breakdown of documentation fee caps and typical ranges.",
      },
      {
        href: "/car-dealer-fees-explained",
        title: "Car Dealer Fees Explained",
        description: "A plain-English guide to every fee that can appear on a dealer purchase order.",
      },
      {
        href: "/car-dealer-fees-list",
        title: "Car Dealer Fees List",
        description: "Comprehensive list of fees dealers charge — which are required and which aren't.",
      },
      {
        href: "/doc-fee-too-high",
        title: "Is the Doc Fee Too High?",
        description: "How to tell when a documentation fee is inflated and how to push back.",
      },
      {
        href: "/market-adjustment-fee",
        title: "Market Adjustment Fees Explained",
        description: "What ADM markups are, whether they're legal, and how to negotiate them.",
      },
      {
        href: "/car-dealer-fees-by-state",
        title: "Car Dealer Fees by State",
        description: "State-level overview of required fees, tax rates, and registration costs.",
      },
    ],
  },
  {
    heading: "Dealer Tactics",
    items: [
      {
        href: "/monthly-payment-trap",
        title: "The Monthly Payment Trap",
        description: "Why dealers focus on payments instead of price, and how to protect yourself.",
      },
      {
        href: "/dealer-pricing-tactics",
        title: "Dealer Pricing Tactics Buyers Should Know",
        description: "The most common tactics used at dealerships and how to recognize them.",
      },
      {
        href: "/are-dealer-add-ons-mandatory",
        title: "Mandatory Dealer Add-Ons Explained",
        description: "What's actually required vs. what dealers present as mandatory.",
      },
      {
        href: "/are-dealer-add-ons-mandatory",
        title: "Are Dealer Add-Ons Mandatory?",
        description: "Most add-ons are optional. Here's how to tell the difference and what to decline.",
      },
      {
        href: "/dealer-add-ons-list",
        title: "Dealer Add-Ons List",
        description: "Common dealer-installed products, what they cost, and which ones to skip.",
      },
      {
        href: "/finance-office-changed-the-numbers",
        title: "Why the Finance Office Numbers Look Different",
        description: "How to spot and handle discrepancies between the sales desk and the finance office.",
      },
    ],
  },
  {
    heading: "Negotiation & Out-the-Door Pricing",
    items: [
      {
        href: "/out-the-door-price",
        title: "What Is an Out-the-Door Price?",
        description: "The total cost to drive away — and why it's the only number that matters.",
      },
      {
        href: "/out-the-door-price",
        title: "Out-the-Door Price Calculator",
        description: "Estimate your full purchase cost including tax, title, registration, and fees.",
      },
      {
        href: "/calculate-out-the-door-price",
        title: "How to Calculate Your Out-the-Door Price",
        description: "Step-by-step guide to building your own OTD estimate before you visit.",
      },
      {
        href: "/is-this-a-good-car-deal",
        title: "Is This a Good Car Deal?",
        description: "What to look for in a dealer quote before deciding to move forward.",
      },
      {
        href: "/dealer-added-fees-after-agreement",
        title: "Dealer Added Fees After We Agreed on a Price",
        description: "What to do when new charges appear after you've shaken hands.",
      },
      {
        href: "/dealer-changed-price-after-deposit",
        title: "Dealer Changed the Price After My Deposit",
        description: "Your rights and options when a dealer raises the price after you've committed.",
      },
    ],
  },
];

export default function DealerPricingProblems() {
  useEffect(() => {
    setSeoMeta({
      title: "Dealer Tactics: Pricing Tricks and Negotiation Guides | Odigos",
      description: "Guides on hidden dealer fees, forced add-ons, the monthly payment trap, out-the-door pricing, and common dealership tactics — written for U.S. car buyers.",
      path: "/dealer-pricing-problems",
    });
  }, []);

  return (
    <ArticleLayout title="Dealer Tactics" showBreadcrumbs={false}>
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(articleSchema({ title: "Dealer Tactics: Pricing Tricks and Negotiation Guides | Odigos", description: "Guides on hidden dealer fees, forced add-ons, the monthly payment trap, out-the-door pricing, and common dealership tactics — written for U.S. car buyers.", path: "/dealer-pricing-problems" }))}</script>
      </Helmet>
      <h1
        className="text-3xl md:text-4xl font-bold tracking-tight mb-4 leading-tight"
        data-testid="text-hub-headline"
      >
        Dealer Tactics
      </h1>
      <p className="text-lg text-muted-foreground mb-10 leading-relaxed" data-testid="text-hub-intro">
        Common pricing tricks, hidden fees, and negotiation traps — explained for U.S. car buyers.
      </p>

      <div className="space-y-12" data-testid="section-hub-articles">
        {sections.map((section) => (
          <section key={section.heading}>
            <h2
              className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-border"
              data-testid={`text-hub-section-${section.heading.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {section.heading}
            </h2>
            <ul className="space-y-4">
              {section.items.map((item) => (
                <li key={item.href} data-testid={`link-hub-${item.href.replace('/', '')}`}>
                  <Link href={item.href}>
                    <div className="group cursor-pointer">
                      <p className="text-base font-medium text-foreground group-hover:underline underline-offset-2 leading-snug">
                        {item.title}
                      </p>
                      <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-muted/30 p-6 mt-14" data-testid="section-hub-cta">
        <h3 className="text-base font-semibold text-foreground mb-2">
          Have a dealer quote you want checked?
        </h3>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          Paste it into Odigos and get a GO/NO-GO verdict with hidden fee detection — results usually take about a minute. No signup required.
        </p>
        <Link href="/analyze">
          <button
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            data-testid="button-hub-cta"
          >
            Check This Quote
          </button>
        </Link>
      </div>

      <p className="text-xs text-muted-foreground mt-12">
        Not affiliated with any dealership. Built for U.S. car buyers.
      </p>
    </ArticleLayout>
  );
}
