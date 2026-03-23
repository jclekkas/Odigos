import { useEffect } from "react";
import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { setSeoMeta } from "@/lib/seo";
import { articleSchema } from "@/lib/jsonld";
import ArticleLayout from "@/components/ArticleLayout";
import ArticleCta from "@/components/ArticleCta";

export default function WhyDealersWontGiveOutTheDoorPrice() {
  useEffect(() => {
    return setSeoMeta({
      title: "Why Dealers Won't Give Out-the-Door Price | Odigos",
      description: "Dealers resist OTD pricing because it removes structural advantages. Here's the incentive structure behind the refusal and what you can do about it.",
      path: "/why-dealers-wont-give-out-the-door-price",
    });
  }, []);

  return (
    <ArticleLayout title="Why Dealers Won't Give Out-the-Door Price">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(articleSchema({ title: "Why Dealers Won't Give Out-the-Door Price | Odigos", description: "Dealers resist OTD pricing because it removes structural advantages. Here's the incentive structure behind the refusal and what you can do about it.", path: "/why-dealers-wont-give-out-the-door-price" }))}</script>
      </Helmet>
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 leading-[1.15]" data-testid="text-why-dealers-headline">
        Why Dealers Won't Give Out-the-Door Price
      </h1>

      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p className="text-lg text-muted-foreground mb-4">
          When you ask a dealer for the out-the-door price and they redirect, deflect, or say "come on in and we'll figure it out" — that's not a coincidence or a policy quirk. It's a deliberate response to a specific incentive structure.
        </p>
        <p className="text-muted-foreground mb-10">
          Understanding why dealers resist OTD pricing tells you exactly what leverage you're removing when you insist on it.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Dealer Revenue Isn't Just the Vehicle Margin</h2>
        <p className="text-muted-foreground mb-3">
          A common misconception is that dealers make money primarily on the difference between invoice and sale price. In practice, dealership revenue comes from multiple sources:
        </p>
        <ul className="space-y-2 mb-4 text-muted-foreground">
          {[
            "Vehicle gross profit (sale price minus dealer cost)",
            "Finance and insurance (F&I) products: warranties, GAP insurance, credit life, protection packages",
            "Financing reserve — the markup dealers add to the lender's buy rate",
            "Manufacturer holdback — a percentage of MSRP paid back to the dealer after the sale",
            "Service department revenue from the buyer's future maintenance",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="text-muted-foreground mb-8">
          A dealer who gives up vehicle margin can often recover it through F&I products. A complete, written OTD price makes that harder because it forces every cost into the open before you agree to anything.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Advantage 1: Showroom Control</h2>
        <p className="text-muted-foreground mb-3">
          The showroom is designed to convert. Time pressure is real: you drove there, you may have traded in your current car, a salesperson has invested hours. Every hour you spend increases your psychological commitment to completing the deal.
        </p>
        <p className="text-muted-foreground mb-3">
          A written OTD price in advance eliminates this dynamic. You can compare it against other dealers from home, before you ever step on the lot. Dealers who give OTD prices over email are effectively competing in a price-transparent market — which cuts margin.
        </p>
        <p className="text-muted-foreground mb-8">
          Getting you into the showroom is worth the loss of a few phone shoppers. Not giving OTD pricing is partly a filtering strategy: buyers who push hard for written pricing tend to be informed buyers who negotiate effectively.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Advantage 2: Payment-Based Negotiation</h2>
        <p className="text-muted-foreground mb-3">
          When the conversation centers on monthly payments rather than total cost, dealers gain flexibility across multiple variables at once: the sale price, the APR, the loan term, and which add-ons get bundled in. This is the core mechanic behind the <Link href="/monthly-payment-trap" className="underline text-foreground">monthly payment trap</Link>.
        </p>
        <p className="text-muted-foreground mb-3">
          A buyer focused on "under $500/month" may not notice:
        </p>
        <ul className="space-y-2 mb-4 text-muted-foreground">
          {[
            "The loan was extended to 84 months to hit the monthly target",
            "The APR includes a 2-point markup above the lender's offer",
            "A $1,500 protection package was rolled into the loan",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="text-muted-foreground mb-8">
          An OTD price strips payment-based maneuvering away. You negotiate a total number, then finance it on your own terms.
        </p>

        <div className="my-10 p-6 rounded-lg bg-muted/30 border border-border">
          <p className="text-sm font-semibold text-foreground mb-2">If you're looking at a real quote…</p>
          <p className="text-sm text-muted-foreground mb-3">
            Paste it into Odigos and we'll identify exactly what's missing from the breakdown — and what questions to ask before you respond.
          </p>
          <Link href="/analyze">
            <button className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors" data-testid="button-cta-mid-article">
              Analyze My Quote
            </button>
          </Link>
        </div>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Advantage 3: Late Fee Introduction</h2>
        <p className="text-muted-foreground mb-3">
          The finance office is where many deals change shape. After you've agreed on a vehicle price in the sales room, a finance manager presents the final contract — and buyers in the finance office are already committed. They've agreed on a car, possibly traded in a vehicle, and spent hours at the dealership.
        </p>
        <p className="text-muted-foreground mb-3">
          This is when fees introduced quietly are most likely to be accepted:
        </p>
        <ul className="space-y-2 mb-4 text-muted-foreground">
          {[
            "Protection packages that weren't discussed during negotiation",
            "Documentation fees listed at a higher amount than mentioned",
            "\"Market adjustment\" charges that appear on the final contract",
            "GAP insurance or extended warranties presented as requirements",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="text-muted-foreground mb-8">
          A written OTD price agreed upon before visiting prevents this because the total is already locked. Any fee that appears in the finance office above the agreed OTD number is a change to the deal — and you can refuse it.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Advantage 4: Per-Buyer Pricing Flexibility</h2>
        <p className="text-muted-foreground mb-3">
          Without a committed price, dealers retain the ability to adjust the deal based on signals you give them:
        </p>
        <ul className="space-y-2 mb-4 text-muted-foreground">
          {[
            "Buyers who mention they're paying cash may face higher vehicle prices (dealers lose financing profit)",
            "Buyers who seem eager or emotionally attached get fewer concessions",
            "Buyers who mention a competing offer may get sharper pricing than those who don't",
            "Credit profile affects financing terms, and the dealer can wait to reveal this until you're in the chair",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="text-muted-foreground mb-8">
          A committed OTD price — negotiated over email or text before you visit — eliminates this flexibility. Dealers who give OTD prices in advance are committing to a number that doesn't change based on how you present yourself in person.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">How This Differs from the Canonical Dealer Resistance Page</h2>
        <p className="text-muted-foreground mb-4">
          If you've already read about what happens when a <Link href="/dealer-wont-give-otd-price" className="underline text-foreground">dealer won't give you an OTD price and what to do about it</Link>, this page goes deeper on the why — the structural incentives, not just the tactics. Understanding the incentive structure makes the tactics predictable, and predictable tactics are easier to counter.
        </p>
        <p className="text-muted-foreground mb-8">
          For specifics on what OTD pricing should include, and how to verify a quote is complete, see our breakdown of <Link href="/what-does-out-the-door-price-include" className="underline text-foreground">what the out-the-door price includes</Link>.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">What to Say to the Dealer</h2>
        <p className="text-muted-foreground mb-3">
          When asking for OTD pricing, a direct and neutral request is most effective:
        </p>
        <div className="rounded-lg border border-border bg-muted/40 p-5 mb-4" data-testid="block-dealer-script">
          <blockquote className="text-sm md:text-base text-foreground leading-relaxed italic">
            "I'm comparing offers from a few dealers before deciding. Can you send me the full out-the-door price in writing — vehicle price, taxes, title, registration, doc fee, and any dealer add-ons itemized separately? I'll be moving quickly once I can review the complete breakdown."
          </blockquote>
        </div>
        <p className="text-muted-foreground mb-8">
          This signals you're an informed buyer with alternatives. Most dealers who can compete on price will respond. Those who refuse are usually protecting add-on or financing revenue they know won't survive scrutiny.
        </p>
      </div>

      <ArticleCta />

      <p className="text-xs text-muted-foreground mt-12">
        Not affiliated with any dealership. Built for U.S. car buyers.
      </p>
    </ArticleLayout>
  );
}
