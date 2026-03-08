import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Copy } from "lucide-react";
import { setSeoMeta } from "@/lib/seo";
import logoImage from "@assets/odigos_logo.png";

const OTD_REQUEST_MESSAGE = `Before I come in, I'd like to see the full out-the-door price in writing, including the sale price, sales tax, title and registration, doc fee, and any dealer-installed add-ons. If add-ons are included, please itemize each one with pricing. I'm ready to move forward once I can review the complete breakdown.`;

export default function DealerWontGiveOtd() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    return setSeoMeta({
      title: "Why Dealers Avoid Giving Out-the-Door Prices | Odigos",
      description: "When a dealer dodges your OTD question, it's not accidental. Learn why dealers avoid written out-the-door pricing, what to say back, and how to get the numbers you need.",
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
    <div className="min-h-screen bg-background">
      
      <header className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-6 flex items-center gap-3">
          <Link href="/">
            <img src={logoImage} alt="Odigos" className="h-28 w-auto cursor-pointer" data-testid="link-logo-home" />
          </Link>
        </div>
      </header>

      <main className="py-12 md:py-20 px-6">
        <article className="max-w-2xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 leading-tight" data-testid="text-dealer-otd-headline">
            What to Do When a Dealer Won't Give You the Out-the-Door Price
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
              The <a href="https://consumer.ftc.gov/articles/buying-new-car" target="_blank" rel="noopener" className="underline text-foreground">FTC's guide for car buyers</a> recommends getting all costs in writing before agreeing to a deal. Dealers who avoid this step are typically trying to preserve room to add fees later.
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

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">What if they still won't?</h2>
            <p className="text-muted-foreground mb-4">
              Try other dealers. Most metro areas have multiple dealerships selling the same models, and many will compete on price over text or email. You don't owe your business to the first dealer you contacted.
            </p>
            <p className="text-muted-foreground mb-8">
              A dealer who won't be transparent before you visit is unlikely to become more transparent in the finance office. If they won't put the number in writing now, expect additional fees and pressure when you're sitting across the desk.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">How Odigos helps</h2>
            <p className="text-muted-foreground mb-8">
              If you've received a partial quote — a monthly payment, a vague "around $35,000," or a worksheet with missing line items — Odigos analyzes exactly what's there and what's missing. You get a clear list of gaps and a suggested follow-up message so you can go back to the dealer with the right questions.
            </p>
          </div>
          
          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-muted-foreground mb-4">
              Not sure if the dealer quote is complete?
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Paste the message or quote you received. Odigos checks for missing out-the-door pricing, add-ons, and unclear fees.
            </p>
            <Link href="/analyze">
              <Button size="lg" data-testid="button-cta-dealer-otd">
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
