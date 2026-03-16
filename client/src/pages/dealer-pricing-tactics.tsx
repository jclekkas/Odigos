import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import logoImage from "@assets/odigos_logo.png";
import SeoHead from "@/components/SeoHead";

const tactics = [
  {
    title: "Dealer Won't Give an Out-the-Door Price? Here's Why",
    summary:
      "If a dealer refuses to give you a full out-the-door price in writing, it's usually strategic. Learn the most common reasons — and exactly what to say back.",
    href: "/dealer-wont-give-out-the-door-price",
  },
  {
    title: "Are Dealer Add-Ons Mandatory? What You Can Refuse",
    summary:
      "Most dealer add-ons are optional profit items — not requirements. Learn what's negotiable, what's legally required, and exactly what to say to get them removed.",
    href: "/are-dealer-add-ons-mandatory",
  },
  {
    title: "Dealer Added Fees After You Already Agreed? What to Do",
    summary:
      "New charges appearing after you've agreed on a price is more common than you'd expect. Learn why it happens and how to push back effectively.",
    href: "/dealer-added-fees-after-agreement",
  },
  {
    title: "Dealer Changed the Price After Your Deposit?",
    summary:
      "If a dealer is quoting a different price after collecting your deposit, you have options. Understand your rights and what to say to get the original deal — or your money back.",
    href: "/dealer-changed-price-after-deposit",
  },
  {
    title: "Market Adjustment Fees: Can Dealers Charge Them?",
    summary:
      "A market adjustment adds thousands above MSRP with no additional product or service. Learn whether it's negotiable and how to respond.",
    href: "/market-adjustment-fee",
  },
  {
    title: "Dealer Doc Fee Too High? What You Can Do",
    summary:
      "Doc fees vary widely by state and dealership. Learn what's normal, how to compare, and how to negotiate the total price even if the fee itself is fixed.",
    href: "/doc-fee-too-high",
  },
  {
    title: "Why the Finance Office Numbers Look Different",
    summary:
      "You agreed on a price, but the contract shows different numbers. Learn the most common reasons and what to check before you sign.",
    href: "/finance-office-changed-the-numbers",
  },
  {
    title: "The Monthly Payment Trap in Car Buying",
    summary:
      "When a dealer steers the conversation to monthly payments instead of total price, key costs get hidden. Learn how to spot it and what to focus on instead.",
    href: "/monthly-payment-trap",
  },
];

export default function DealerPricingTactics() {
  return (
    <div className="min-h-screen bg-background">
      <SeoHead
        title="Dealer Pricing Tactics: Complete Guide (2026) | Odigos"
        description="Learn how car dealers use pricing tactics to hide costs. Odigos breaks down common strategies and shows you how to defend yourself before visiting the dealership."
        path="/dealer-pricing-tactics"
      />

      <header className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-6 flex items-center gap-3">
          <Link href="/">
            <img src={logoImage} alt="Odigos" className="h-12 md:h-14 w-auto cursor-pointer" data-testid="link-logo-home" />
          </Link>
        </div>
      </header>

      <main className="py-12 md:py-20 px-6">
        <article className="max-w-[700px] mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 leading-[1.15]" data-testid="text-tactics-headline">
            Dealer Pricing Tactics: Complete Guide (2026)
          </h1>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-lg text-muted-foreground mb-4">
              Car dealers use a range of pricing tactics to keep buyers in the dark — from refusing to give <Link href="/out-the-door-price" className="underline text-foreground">out-the-door prices</Link> to bundling add-ons that inflate the final cost (see <a href="https://www.edmunds.com/car-buying/what-fees-should-you-pay-at-a-car-dealership.html" target="_blank" rel="noopener" className="underline text-foreground">Edmunds' breakdown of common fees</a> for context). Understanding these tactics is the first step to negotiating from a position of strength.
            </p>
            <p className="text-lg text-muted-foreground mb-10">
              Odigos helps you identify these tactics in real dealer quotes, emails, and texts — so you know what to ask and what to push back on before you visit the dealership. For a broader overview of your rights as a buyer, see the <a href="https://consumer.ftc.gov/articles/buying-new-car" target="_blank" rel="noopener" className="underline text-foreground">FTC's guide for car buyers</a>.
            </p>
          </div>

          <h2 className="text-2xl font-semibold mb-6 text-foreground">Tactics & Guides</h2>

          <div className="space-y-4 mb-12">
            {tactics.map((tactic) => (
              <Link key={tactic.href} href={tactic.href}>
                <Card className="cursor-pointer border-border/80 bg-card/50">
                  <CardContent className="pt-6 pb-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-2" data-testid={`text-tactic-title-${tactic.href}`}>
                          {tactic.title}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {tactic.summary}
                        </p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0 mt-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-border">
            <h2 className="text-xl font-semibold mb-2 text-foreground" data-testid="text-tactics-cta-heading">
              Not sure if the dealer quote is complete?
            </h2>
            <p className="text-muted-foreground mb-4">
              Paste the message or quote you received. Odigos checks for missing out-the-door pricing, add-ons, and unclear fees.
            </p>
            <Link href="/analyze">
              <Button size="lg" data-testid="button-cta-tactics">
                Check the Quote with Odigos
              </Button>
            </Link>
          </div>

          <p className="text-xs text-muted-foreground mt-12">
            Not affiliated with any dealership. Optimized for U.S. car purchases.
          </p>
        </article>
      </main>
    </div>
  );
}
