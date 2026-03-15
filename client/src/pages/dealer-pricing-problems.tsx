import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { setSeoMeta } from "@/lib/seo";
import { trackCtaClick } from "@/lib/tracking";
import ArticleHeader from "@/components/ArticleHeader";

interface ProblemCard {
  href: string;
  title: string;
  description: string;
}

interface ProblemSection {
  heading: string;
  intro: string;
  cards: ProblemCard[];
}

const SECTIONS: ProblemSection[] = [
  {
    heading: "Price Changes",
    intro: "The quoted price changed at some point during the purchase — at arrival, after the test drive, after a deposit, or in the finance office.",
    cards: [
      {
        href: "/dealer-raised-price-when-i-arrived",
        title: "Dealer Changed the Price After You Arrived",
        description: "The number was different when you showed up than what was quoted online or over the phone.",
      },
      {
        href: "/dealer-changed-price-after-test-drive",
        title: "Dealer Changed the Price After the Test Drive",
        description: "The dealer raised the price once you showed interest by driving the car.",
      },
      {
        href: "/dealer-changed-price-after-deposit",
        title: "Dealer Changed the Price After Your Deposit",
        description: "The terms shifted after money was already put down to hold the vehicle.",
      },
      {
        href: "/dealer-added-fees-after-deposit",
        title: "Dealer Added Fees After Your Deposit",
        description: "New charges appeared in the deal after the deposit was paid.",
      },
      {
        href: "/finance-office-changed-the-numbers",
        title: "Finance Office Changed the Numbers",
        description: "The deal looked different in the finance office than it did on the sales floor.",
      },
      {
        href: "/dealer-changed-price-before-signing",
        title: "Numbers Changed Right Before Signing",
        description: "Something shifted in the paperwork right when it was time to put pen to paper.",
      },
    ],
  },
  {
    heading: "Missing Transparency",
    intro: "The dealer won't share the full price in a usable form.",
    cards: [
      {
        href: "/dealer-wont-give-out-the-door-price",
        title: "Dealer Won't Give the Out-the-Door Price",
        description: "They won't provide a full total that includes taxes, fees, and everything you'd actually pay.",
      },
      {
        href: "/dealer-wont-give-written-quote",
        title: "Dealer Won't Put the Price in Writing",
        description: "The dealer will only quote verbally and refuses to confirm anything by email or text.",
      },
      {
        href: "/dealer-refuses-itemized-price",
        title: "Dealer Won't Break Down the Charges",
        description: "The total is bundled — they won't show each fee and add-on line by line.",
      },
      {
        href: "/dealer-only-gives-monthly-payment",
        title: "Dealer Only Gave a Monthly Payment",
        description: "The full vehicle price isn't disclosed — just a monthly figure that hides the real cost.",
      },
    ],
  },
  {
    heading: "Add-On Charges",
    intro: "Items you didn't request showed up on the invoice.",
    cards: [
      {
        href: "/dealer-added-nitrogen-tires",
        title: "Nitrogen Tire Charge",
        description: "A fee for nitrogen-filled tires you didn't ask for, added during dealer prep.",
      },
      {
        href: "/dealer-added-vin-etching",
        title: "VIN Etching Fee",
        description: "A charge for etching the vehicle identification number on the windows.",
      },
      {
        href: "/dealer-added-protection-package",
        title: "Paint and Protection Package",
        description: "A bundled charge for paint sealant, fabric protection, and related products.",
      },
    ],
  },
  {
    heading: "Finance Office Tactics",
    intro: "The finance office is where add-ons, rate markups, and last-minute changes commonly appear.",
    cards: [
      {
        href: "/dealer-added-warranty-without-asking",
        title: "Extended Warranty Added Without Asking",
        description: "A warranty appeared in the contract that you never agreed to.",
      },
      {
        href: "/dealer-added-gap-insurance",
        title: "GAP Insurance Added Without Consent",
        description: "GAP coverage was included in the loan without a clear conversation or agreement.",
      },
      {
        href: "/dealer-increased-interest-rate",
        title: "Interest Rate Higher Than Quoted",
        description: "The APR in the contract is higher than the rate discussed during negotiation.",
      },
    ],
  },
];

export default function DealerPricingProblems() {
  useEffect(() => {
    return setSeoMeta({
      title: "Dealer Pricing Problems: Common Dealer Tactics and What to Do | Odigos",
      description: "See the most common dealership pricing problems — price changes, hidden fees, finance office tricks, and add-on charges — and learn what to do before signing.",
      path: "/dealer-pricing-problems",
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <ArticleHeader slug="dealer-pricing-problems" />

      <main className="py-12 md:py-20 px-6">
        <div className="max-w-2xl mx-auto">

          <h1
            className="text-3xl md:text-4xl font-bold tracking-tight mb-6 leading-tight"
            data-testid="text-dealer-pricing-problems-headline"
          >
            Common Dealer Pricing Problems (And What To Do)
          </h1>

          <p className="text-lg text-muted-foreground mb-10">
            Many dealership issues follow recognizable patterns — price changes, hidden fees, finance office tactics, and add-on pressure. The situations are common, and so are the responses. Find the scenario that matches yours below.
          </p>

          <div className="space-y-12">
            {SECTIONS.map((section) => (
              <section key={section.heading} data-testid={`section-${section.heading.toLowerCase().replace(/\s+/g, "-")}`}>
                <h2 className="text-xl font-semibold mb-1 text-foreground">{section.heading}</h2>
                <p className="text-sm text-muted-foreground mb-4">{section.intro}</p>
                <div className="space-y-2">
                  {section.cards.map((card) => (
                    <Link key={card.href} href={card.href}>
                      <div
                        className="group flex flex-col gap-0.5 rounded-lg border border-border bg-card px-4 py-3 hover:border-foreground/20 hover:bg-muted/40 transition-colors cursor-pointer"
                        data-testid={`card-${card.href.replace(/^\//, "")}`}
                      >
                        <span className="text-sm font-medium text-foreground group-hover:underline underline-offset-2">
                          {card.title}
                        </span>
                        <span className="text-xs text-muted-foreground leading-snug">
                          {card.description}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-14 pt-8 border-t border-border">
            <h2 className="text-xl font-semibold mb-3 text-foreground" data-testid="text-hub-cta-heading">
              Already Have a Dealer Quote?
            </h2>
            <p className="text-muted-foreground mb-6">
              Paste your quote and Odigos will flag pricing issues — hidden fees, missing out-the-door total, and dealer add-ons — before you sign.
            </p>
            <Link href="/analyze?src=dealer-pricing-problems">
              <Button
                size="lg"
                data-testid="button-hub-cta"
                onClick={() => trackCtaClick({ location: "article_bottom_cta", article: "dealer-pricing-problems" })}
              >
                Check My Deal
              </Button>
            </Link>
            <p className="text-xs text-muted-foreground mt-3">Takes 10 seconds &middot; No signup required</p>
          </div>

          <p className="text-xs text-muted-foreground mt-12">
            Not affiliated with any dealership. This is general guidance, not legal advice. Optimized for U.S. car purchases.
          </p>
        </div>
      </main>
    </div>
  );
}
