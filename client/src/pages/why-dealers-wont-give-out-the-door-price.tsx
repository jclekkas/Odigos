import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Copy } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { setSeoMeta } from "@/lib/seo";
import { articleSchema } from "@/lib/jsonld";
import ArticleLayout from "@/components/ArticleLayout";
import ArticleCta from "@/components/ArticleCta";
import SourceCitation from "@/components/SourceCitation";
import { ARTICLE_SOURCES } from "@/data/articleSources";

const OTD_REQUEST_MESSAGE = `Before I come in, I'd like to see the full out-the-door price in writing, including the sale price, sales tax, title and registration, doc fee, and any dealer-installed add-ons. If add-ons are included, please itemize each one with pricing. I'm ready to move forward once I can review the complete breakdown.`;

export default function WhyDealersWontGiveOutTheDoorPrice() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setSeoMeta({
      title: "Why Dealers Won't Give Out-the-Door Price (and What to Do) | Odigos",
      description: "Dealers resist OTD pricing because it removes structural advantages. Here's the incentive structure behind the refusal, what to say, and what to do when they dodge.",
      path: "/why-dealers-wont-give-out-the-door-price",
    });
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(OTD_REQUEST_MESSAGE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = OTD_REQUEST_MESSAGE;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <ArticleLayout title="Why Dealers Won't Give Out-the-Door Price">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(articleSchema({ title: "Why Dealers Won't Give Out-the-Door Price (and What to Do) | Odigos", description: "Dealers resist OTD pricing because it removes structural advantages. Here's the incentive structure behind the refusal, what to say, and what to do when they dodge.", path: "/why-dealers-wont-give-out-the-door-price" }))}</script>
      </Helmet>
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 leading-[1.15]" data-testid="text-why-dealers-headline">
        Why Dealers Won't Give Out-the-Door Price
      </h1>

      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p className="text-lg text-muted-foreground">
          When you ask a dealer for the out-the-door price and they redirect, deflect, or say "come on in and we'll figure it out" — that's not a coincidence or a policy quirk. It's a deliberate response to a specific incentive structure.{" "}<SourceCitation sources={ARTICLE_SOURCES["dealer-wont-give-otd-price"].sources} lastVerified={ARTICLE_SOURCES["dealer-wont-give-otd-price"].lastVerified} />
        </p>
        <p className="text-muted-foreground">
          Understanding why dealers resist OTD pricing tells you exactly what leverage you're removing when you insist on it.
        </p>

        <h2 className="text-2xl font-semibold text-foreground">Dealer Revenue Isn't Just the Vehicle Margin</h2>
        <p className="text-muted-foreground">
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
        <p className="text-muted-foreground">
          A dealer who gives up vehicle margin can often recover it through F&I products. A complete, written OTD price makes that harder because it forces every cost into the open before you agree to anything.
        </p>

        <h2 className="text-2xl font-semibold text-foreground">Advantage 1: Showroom Control</h2>
        <p className="text-muted-foreground">
          The showroom is designed to convert. Time pressure is real: you drove there, you may have traded in your current car, a salesperson has invested hours. Every hour you spend increases your psychological commitment to completing the deal.
        </p>
        <p className="text-muted-foreground">
          A written OTD price in advance eliminates this dynamic. You can compare it against other dealers from home, before you ever step on the lot. Dealers who give OTD prices over email are effectively competing in a price-transparent market — which cuts margin.
        </p>
        <p className="text-muted-foreground">
          Getting you into the showroom is worth the loss of a few phone shoppers. Not giving OTD pricing is partly a filtering strategy: buyers who push hard for written pricing tend to be informed buyers who negotiate effectively.
        </p>

        <h2 className="text-2xl font-semibold text-foreground">Advantage 2: Payment-Based Negotiation</h2>
        <p className="text-muted-foreground">
          When the conversation centers on monthly payments rather than total cost, dealers gain flexibility across multiple variables at once: the sale price, the APR, the loan term, and which add-ons get bundled in. This is the core mechanic behind the <Link href="/monthly-payment-trap" className="underline text-foreground">monthly payment trap</Link>.
        </p>
        <p className="text-muted-foreground">
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
        <p className="text-muted-foreground">
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

        <h2 className="text-2xl font-semibold text-foreground">Advantage 3: Late Fee Introduction</h2>
        <p className="text-muted-foreground">
          The finance office is where many deals change shape. After you've agreed on a vehicle price in the sales room, a finance manager presents the final contract — and buyers in the finance office are already committed. They've agreed on a car, possibly traded in a vehicle, and spent hours at the dealership.
        </p>
        <p className="text-muted-foreground">
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
        <p className="text-muted-foreground">
          A written OTD price agreed upon before visiting prevents this because the total is already locked. Any fee that appears in the finance office above the agreed OTD number is a change to the deal — and you can refuse it.
        </p>

        <h2 className="text-2xl font-semibold text-foreground">Advantage 4: Per-Buyer Pricing Flexibility</h2>
        <p className="text-muted-foreground">
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
        <p className="text-muted-foreground">
          A committed OTD price — negotiated over email or text before you visit — eliminates this flexibility. Dealers who give OTD prices in advance are committing to a number that doesn't change based on how you present yourself in person.
        </p>

        <h2 className="text-2xl font-semibold text-foreground">What to say when they dodge the question</h2>
        <p className="text-muted-foreground">
          If a dealer redirects you to "come in" or only offers a monthly payment, send this message. You can copy and paste it directly:
        </p>
        <Card className="relative p-5 bg-muted/50 mb-4">
          <blockquote className="text-sm md:text-base text-foreground leading-relaxed italic pr-10">
            {OTD_REQUEST_MESSAGE}
          </blockquote>
          <Button
            variant="outline"
            size="icon"
            className="absolute top-3 right-3"
            onClick={handleCopy}
            data-testid="button-copy-otd-message"
            aria-label="Copy message"
          >
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          </Button>
          {copied && (
            <span className="absolute top-3 right-14 text-xs text-green-600 dark:text-green-400 font-medium">Copied</span>
          )}
        </Card>
        <p className="text-muted-foreground">
          This signals you're an informed buyer with alternatives. Most dealers who can compete on price will respond. Those who refuse are usually protecting add-on or financing revenue they know won't survive scrutiny.
        </p>

        <h2 className="text-2xl font-semibold text-foreground">What if they still won't?</h2>
        <p className="text-muted-foreground">
          Try other dealers. Most metro areas have multiple dealerships selling the same models, and many will compete on price over text or email. You don't owe your business to the first dealer you contacted.
        </p>
        <p className="text-muted-foreground">
          A dealer who won't be transparent before you visit is unlikely to become more transparent in the finance office. If they won't put the number in writing now, expect additional fees and pressure when you're sitting across the desk. For specifics on what OTD pricing should include, see our breakdown of <Link href="/what-does-out-the-door-price-include" className="underline text-foreground">what the out-the-door price includes</Link>.
        </p>
      </div>

      <ArticleCta />

      <p className="text-xs text-muted-foreground mt-12">
        Not affiliated with any dealership. Built for U.S. car buyers.
      </p>
    </ArticleLayout>
  );
}
