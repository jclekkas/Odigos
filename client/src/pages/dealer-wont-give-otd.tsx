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

const OTD_REQUEST_MESSAGE = `Before I come in, I'd like to see the full out-the-door price in writing, including the sale price, sales tax, title and registration, doc fee, and any dealer-installed add-ons. If add-ons are included, please itemize each one with pricing. I'm ready to move forward once I can review the complete breakdown.`;

export default function DealerWontGiveOtd() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    return setSeoMeta({
      title: "Why Dealers Avoid Giving Out-the-Door Prices (and What to Do) | Odigos",
      description: "Learn why dealers avoid giving OTD prices, how it benefits them, and what it signals about the deal you're being offered.",
      path: "/dealer-wont-give-otd",
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
    <ArticleLayout title="What to Do When a Dealer Won't Give You the Out-the-Door Price">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(articleSchema({ title: "Why Dealers Avoid Giving Out-the-Door Prices (and What to Do) | Odigos", description: "Learn why dealers avoid giving OTD prices, how it benefits them, and what it signals about the deal you're being offered.", path: "/dealer-wont-give-otd" }))}</script>
      </Helmet>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 leading-tight" data-testid="text-dealer-otd-headline">
            Why Dealers Avoid Giving Out-the-Door Prices — and What to Do
          </h1>
          
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-lg text-muted-foreground mb-6">
              You've found a car, you text or email the dealer asking for the out-the-door price, and instead of a straight answer you get: "Come on in and we'll work the numbers" or just a monthly payment with no breakdown. This is common, and it's not accidental.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Why dealers avoid giving the OTD</h2>
            <p className="text-muted-foreground mb-4">
              When a dealer puts the full <Link href="/out-the-door-price" className="underline text-foreground">out-the-door price</Link> in writing, they lose several advantages at once:
            </p>
            <ul className="space-y-2 mb-4 text-muted-foreground">
              {[
                "A written OTD makes comparison shopping easy — you can send it to a competing dealer in seconds",
                "It locks them into a number they can't quietly adjust later",
                "It removes their ability to use payment-based tactics that obscure total cost",
                "Dealers prefer to negotiate in isolation, where you can't easily compare offers side by side",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-muted-foreground mb-8">
              The <a href="https://consumer.ftc.gov/articles/buying-new-car" target="_blank" rel="noopener" className="underline text-foreground">FTC's guide for car buyers</a> recommends getting all costs in writing before agreeing to a deal. Dealers who avoid this step are typically trying to preserve room to add fees later — including <Link href="/mandatory-dealer-add-ons" className="underline text-foreground">dealer add-ons</Link> and charges that appear only in the finance office.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">What to say when they dodge the question</h2>
            <p className="text-muted-foreground mb-4">
              If a dealer redirects you to "come in" or only offers a monthly payment, send them this message. You can copy and paste it directly:
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
            <p className="text-muted-foreground mb-8">
              This works because it's specific, reasonable, and signals you're an informed buyer. You're not being confrontational — you're asking for the same information any serious buyer needs to make a decision.
            </p>

            <div className="my-10 p-6 rounded-lg bg-muted/30 border border-border">
              <p className="text-sm font-semibold text-foreground mb-2">Already have a partial quote?</p>
              <p className="text-sm text-muted-foreground mb-3">
                If you've received a vague estimate, monthly payment, or quote missing line items, paste it into Odigos. We'll flag what's missing and give you the right follow-up message.
              </p>
              <Link href="/analyze">
                <Button variant="cta" size="sm" data-testid="button-cta-mid-article-wont-give-otd">
                  Analyze My Dealer Quote
                </Button>
              </Link>
            </div>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">What if they still won't?</h2>
            <p className="text-muted-foreground mb-4">
              Try other dealers. Most metro areas have multiple dealerships selling the same models, and many will compete on price over text or email. You don't owe your business to the first dealer you contacted.
            </p>
            <p className="text-muted-foreground mb-8">
              A dealer who won't be transparent before you visit is unlikely to become more transparent in the finance office. If they won't put the number in writing now, expect additional fees and pressure when you're sitting across the desk. For a full breakdown of why this happens and when it becomes a real red flag, see our guide on <Link href="/dealer-wont-give-otd-price" className="underline text-foreground">what it means when a dealer refuses to give an OTD price</Link>.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">How Odigos helps</h2>
            <p className="text-muted-foreground mb-8">
              If you've received a partial quote — a monthly payment, a vague "around $35,000," or a worksheet with missing line items — Odigos analyzes exactly what's there and what's missing. You get a clear list of gaps and a suggested follow-up message so you can go back to the dealer with the right questions.
            </p>
          </div>
          

          <ArticleCta />

          <p className="text-xs text-muted-foreground mt-12">
            Not affiliated with any dealership. Optimized for U.S. car purchases.
          </p>
    </ArticleLayout>
  );
}
