import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import ArticleHeader from "@/components/ArticleHeader";
import SeoHead from "@/components/SeoHead";
import { trackCtaClick } from "@/lib/tracking";
import DirectAnswerBlock from "@/components/DirectAnswerBlock";

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

      <ArticleHeader slug="dealer-pricing-tactics" />

      <main className="py-12 md:py-20 px-6">
        <article className="max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 leading-[1.15]" data-testid="text-tactics-headline">
            Dealer Pricing Tactics: Complete Guide (2026)
          </h1>

          <DirectAnswerBlock
            question="What pricing tactics do car dealers use?"
            answer="Common dealer pricing tactics include quoting monthly payments instead of the total price, bundling optional add-ons without itemizing them, charging market adjustment fees on high-demand vehicles, and delaying disclosure of the full out-the-door price. Knowing these tactics before you negotiate helps you keep the conversation focused on the total cost."
          />

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-lg text-muted-foreground mb-4">
              Car dealers use a range of pricing tactics to keep buyers in the dark — from refusing to give <Link href="/out-the-door-price" className="underline text-foreground">out-the-door prices</Link> to bundling add-ons that inflate the final cost (see <a href="https://www.edmunds.com/car-buying/what-fees-should-you-pay-at-a-car-dealership.html" target="_blank" rel="noopener" className="underline text-foreground">Edmunds' breakdown of common fees</a> for context). Understanding these tactics is the first step to negotiating from a position of strength.
            </p>
            <p className="text-lg text-muted-foreground mb-6">
              Odigos helps you identify these tactics in real dealer quotes, emails, and texts — so you know what to ask and what to push back on before you visit the dealership. For a broader overview of your rights as a buyer, see the <a href="https://consumer.ftc.gov/articles/buying-new-car" target="_blank" rel="noopener" className="underline text-foreground">FTC's guide for car buyers</a>.
            </p>

            <div className="my-6 rounded-lg border border-border bg-muted/40 p-4">
              <p className="font-medium text-foreground mb-3">Already have a dealer quote? Check it for these tactics before you go in.</p>
              <Link href="/analyze?src=dealer-pricing-tactics">
                <Button size="sm" data-testid="button-callout-tactics" onClick={() => trackCtaClick({ location: "article_top_callout", article: "dealer-pricing-tactics" })}>Check My Deal</Button>
              </Link>
              <p className="text-xs text-muted-foreground mt-2">Takes 10 seconds · No signup required</p>
            </div>
          </div>

          <div className="my-8 rounded-lg border border-border bg-muted/40 p-5">
            <p className="font-medium text-foreground mb-3">Have a quote? Paste it and Odigos flags which tactics are being used on you right now.</p>
            <Link href="/analyze?src=dealer-pricing-tactics">
              <Button size="sm" data-testid="button-mid-article-tactics" onClick={() => trackCtaClick({ location: "article_mid_cta", article: "dealer-pricing-tactics" })}>Check My Deal</Button>
            </Link>
            <p className="text-xs text-muted-foreground mt-2">Takes 10 seconds · No signup required</p>
          </div>

          <h2 className="text-2xl font-semibold mb-6 text-foreground">Tactics & Guides</h2>

          <div className="space-y-4 mb-12">
            {tactics.map((tactic) => (
              <Link key={tactic.href} href={tactic.href}>
                <Card className="cursor-pointer">
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
            <h2 className="text-xl font-semibold mb-3 text-foreground" data-testid="text-tactics-cta-heading">
              Spot a tactic in your dealer quote?
            </h2>
            <p className="text-muted-foreground mb-6">Paste it and Odigos identifies exactly which tactics are at play and what you can do about them.</p>
            <Link href="/analyze?src=dealer-pricing-tactics">
              <Button size="lg" data-testid="button-cta-tactics" onClick={() => trackCtaClick({ location: "article_bottom_cta", article: "dealer-pricing-tactics" })}>
                Check My Quote
              </Button>
            </Link>
            <p className="text-xs text-muted-foreground mt-3">Takes 10 seconds · No signup required</p>
          </div>

          <p className="text-xs text-muted-foreground mt-12">
            Not affiliated with any dealership. Optimized for U.S. car purchases.
          </p>
        </article>
      </main>
    </div>
  );
}
