import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import { setSeoMeta } from "@/lib/seo";
import ArticleLayout from "@/components/ArticleLayout";
import ArticleCta from "@/components/ArticleCta";

const OTD_REQUEST = `I'm ready to move forward if the numbers make sense. Can you please send the full out-the-door price including all fees, taxes, and add-ons so I can review before coming in?`;

const WALKAWAY_MSG = `I'm comparing multiple dealerships. I'll prioritize the one that provides full pricing transparency.`;

const faqs = [
  {
    q: "Is a dealer legally required to give an out-the-door price?",
    a: "In most states, no. Dealers are not legally obligated to provide a written OTD quote by email. However, once a price is agreed upon in writing, changing it later can become a deceptive practice issue depending on state law.",
  },
  {
    q: "Is it a red flag if a dealer won't give OTD pricing?",
    a: "Not always — some dealerships have policies against emailing quotes. But it becomes a concern if they refuse after you provide VIN and ZIP, won't itemize fees, or redirect the conversation to monthly payments only.",
  },
  {
    q: "What should I say if a dealer refuses to give OTD pricing?",
    a: "Keep it simple and neutral: ask for the full out-the-door price including all fees, taxes, and add-ons in writing. If they still refuse, let them know you'll prioritize dealerships that provide full pricing transparency.",
  },
  {
    q: "Why do dealers focus on monthly payments instead of total price?",
    a: "Monthly payments hide extended loan terms, marked-up interest rates, and add-ons rolled into financing. OTD pricing forces transparency by showing every dollar you'll actually pay.",
  },
];

export default function DealerWontGiveOtdPrice() {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  useEffect(() => {
    return setSeoMeta({
      title: "Dealer Won't Give OTD Price? Here's What It Means | Odigos",
      description: "If a dealer won't give an out-the-door price, there's a reason. Learn the tactics they use, what to say back, and how to protect yourself before visiting.",
      path: "/dealer-wont-give-otd-price",
    });
  }, []);

  const handleCopy = async (text: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2500);
  };

  return (
    <ArticleLayout title="Dealer Won't Give OTD Price? Here's What That Means">
          <p className="text-sm text-muted-foreground mb-4">
            <Link href="/dealer-pricing-tactics" className="underline text-foreground" data-testid="link-breadcrumb-hub">Dealer Pricing Tactics</Link> &rsaquo; This Article
          </p>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3 leading-[1.15]" data-testid="text-otd-refuse-headline">
            Dealer Won't Give OTD Price? Here's What That Means
          </h1>

          <p className="text-sm text-muted-foreground mb-8" data-testid="text-last-updated">Last updated: Feb 2026</p>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-lg text-muted-foreground mb-4">
              If a dealer won't give you an out-the-door (OTD) price, that's not random. It's usually one of several <Link href="/dealer-pricing-tactics" className="underline text-foreground" data-testid="link-inline-hub">common dealer pricing tactics</Link>.
            </p>
            <p className="text-muted-foreground mb-3">
              An out-the-door price includes:
            </p>
            <ul className="list-disc pl-6 space-y-1 mb-4 text-muted-foreground">
              <li>Vehicle price</li>
              <li>Taxes</li>
              <li>Registration</li>
              <li>Dealer fees</li>
              <li>Add-ons</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              In other words: the real total.
            </p>
            <p className="text-muted-foreground mb-4">
              When a dealer avoids giving it, they're keeping leverage. You can <Link href="/analyze" className="underline text-foreground" data-testid="link-inline-analyze">paste any dealer quote into Odigos</Link> to see exactly what's missing — before you respond.
            </p>
            <p className="text-muted-foreground mb-10">
              Here's why dealers avoid OTD pricing — and what you should do next.
            </p>

            <p className="text-sm text-muted-foreground mb-6">
              Already have a dealer quote? <Link href="/analyze" className="underline text-foreground">Paste it here</Link> and see if anything is missing.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Why Dealers Avoid Giving OTD Prices</h2>
            <p className="text-muted-foreground mb-6">
              There are four common reasons.
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-2 text-foreground">1. They Want You In the Showroom</h3>
            <p className="text-muted-foreground mb-3">
              It's easier to negotiate in person. Once you're sitting at a desk:
            </p>
            <ul className="list-disc pl-6 space-y-1 mb-4 text-muted-foreground">
              <li>Time pressure increases</li>
              <li>Emotional commitment rises</li>
              <li>Trade-in conversations begin</li>
              <li>Financing gets layered in</li>
            </ul>
            <p className="text-muted-foreground mb-8">
              Refusing to give OTD pricing forces you to come in.
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-2 text-foreground">2. They Want to Separate the Numbers</h3>
            <p className="text-muted-foreground mb-3">
              Dealers often break pricing into pieces:
            </p>
            <ul className="list-disc pl-6 space-y-1 mb-4 text-muted-foreground">
              <li>"Sale price"</li>
              <li>"Monthly payment"</li>
              <li>"Estimated fees"</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              If you only see parts, you can't compare deals properly.
            </p>
            <p className="text-muted-foreground mb-8">
              OTD pricing removes ambiguity. That's why some avoid it.
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-2 text-foreground">3. They Plan to Add Fees Later</h3>
            <p className="text-muted-foreground mb-3">
              Common surprise fees include:
            </p>
            <ul className="list-disc pl-6 space-y-1 mb-4 text-muted-foreground">
              <li>Protection packages</li>
              <li>Nitrogen tires</li>
              <li>VIN etching</li>
              <li>"Market adjustments"</li>
              <li>High doc fees</li>
            </ul>
            <p className="text-muted-foreground mb-8">
              Without OTD pricing in writing, these get introduced later. Understanding the full <Link href="/dealer-add-ons-list" className="underline text-foreground">dealer add-ons list</Link> before you visit gives you a clear benchmark for what's been pre-installed and what it should actually cost.
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-2 text-foreground">4. They Want Flexibility to Adjust Based on You</h3>
            <p className="text-muted-foreground mb-3">
              Sometimes pricing changes based on:
            </p>
            <ul className="list-disc pl-6 space-y-1 mb-4 text-muted-foreground">
              <li>Whether you finance with them</li>
              <li>Your credit profile</li>
              <li>Whether you mention competing quotes</li>
              <li>How serious you seem</li>
            </ul>
            <p className="text-muted-foreground mb-8">
              OTD pricing limits that flexibility.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Is It Legal for a Dealer to Refuse?</h2>
            <p className="text-muted-foreground mb-4">
              In most states, yes. Dealers are not legally required to provide a written OTD quote by email.
            </p>
            <p className="text-muted-foreground mb-4">
              However: once a number is agreed upon in writing, changing it later can become a deceptive practice issue depending on state law. The <a href="https://consumer.ftc.gov/articles/buying-new-car" target="_blank" rel="noopener" className="underline text-foreground">FTC's car buying guide</a> outlines key consumer rights worth reviewing before any negotiation.
            </p>
            <p className="text-muted-foreground mb-4">
              The bigger issue isn't legality. It's transparency.
            </p>
            <p className="text-muted-foreground mb-8">
              If a dealer refuses to give full pricing in writing, you lose negotiation clarity.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Is This a Red Flag?</h2>
            <p className="text-muted-foreground mb-3">
              Not always. Some dealerships:
            </p>
            <ul className="list-disc pl-6 space-y-1 mb-4 text-muted-foreground">
              <li>Have strict policies about in-person quotes</li>
              <li>Require a stock number first</li>
              <li>Avoid "price shopping" scenarios</li>
            </ul>
            <p className="text-muted-foreground mb-3">
              But it becomes concerning when:
            </p>
            <ul className="list-disc pl-6 space-y-1 mb-4 text-muted-foreground marker:text-amber-500">
              <li>They refuse after you provide VIN and ZIP code</li>
              <li>They won't itemize fees</li>
              <li>They say "we'll figure that out when you come in"</li>
              <li>They shift conversation to monthly payments</li>
            </ul>
            <p className="text-muted-foreground mb-8">
              That's when caution is warranted.
            </p>

            <div className="my-10 p-6 rounded-lg bg-muted/30 border border-border">
              <p className="text-sm font-semibold text-foreground mb-2">Have a dealer quote you're unsure about?</p>
              <p className="text-sm text-muted-foreground mb-3">
                Paste it into Odigos and we'll flag what's missing, risky, or unclear — before you visit.
              </p>
              <Link href="/analyze">
                <Button variant="cta" size="sm" data-testid="button-cta-mid-article">
                  Analyze My Dealer Quote
                </Button>
              </Link>
            </div>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">What You Should Say Back (Copy This)</h2>
            <p className="text-muted-foreground mb-3">
              Keep it simple and neutral. You can reply with:
            </p>
            <div className="relative my-4 rounded-lg border border-border bg-muted/40 p-5 pr-14" data-testid="block-otd-request">
              <blockquote className="text-sm md:text-base text-foreground leading-relaxed italic">
                {OTD_REQUEST}
              </blockquote>
              <button
                type="button"
                className="absolute top-3 right-3 inline-flex items-center justify-center rounded-md border border-border bg-background p-2"
                onClick={() => handleCopy(OTD_REQUEST, 0)}
                data-testid="button-copy-otd-request"
                aria-label="Copy message"
              >
                {copiedIdx === 0 ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </button>
              {copiedIdx === 0 && (
                <span className="absolute top-3 right-14 text-xs text-green-600 dark:text-green-400 font-medium">Copied</span>
              )}
            </div>
            <p className="text-muted-foreground mb-3">
              If they still refuse:
            </p>
            <div className="relative my-4 rounded-lg border border-border bg-muted/40 p-5 pr-14" data-testid="block-walkaway">
              <blockquote className="text-sm md:text-base text-foreground leading-relaxed italic">
                {WALKAWAY_MSG}
              </blockquote>
              <button
                type="button"
                className="absolute top-3 right-3 inline-flex items-center justify-center rounded-md border border-border bg-background p-2"
                onClick={() => handleCopy(WALKAWAY_MSG, 1)}
                data-testid="button-copy-walkaway"
                aria-label="Copy message"
              >
                {copiedIdx === 1 ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </button>
              {copiedIdx === 1 && (
                <span className="absolute top-3 right-14 text-xs text-green-600 dark:text-green-400 font-medium">Copied</span>
              )}
            </div>
            <p className="text-muted-foreground mb-8">
              No hostility. Just clarity.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">How to Protect Yourself If They Won't Send It</h2>
            <p className="text-muted-foreground mb-3">
              If you decide to visit anyway:
            </p>
            <ol className="list-decimal pl-6 space-y-2 mb-4 text-muted-foreground">
              <li>Bring printed competitor quotes</li>
              <li>Ask for full itemization before signing anything</li>
              <li>Refuse to discuss monthly payments first</li>
              <li>Do not let them combine trade-in and vehicle price into one number</li>
            </ol>
            <p className="text-muted-foreground mb-8">
              And most importantly: never agree verbally without seeing the full breakdown. Review <a href="https://www.edmunds.com/car-buying/what-fees-should-you-pay-at-a-car-dealership.html" target="_blank" rel="noopener" className="underline text-foreground">Edmunds</a> to understand common fee structures before your visit.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Why OTD Pricing Matters More Than Monthly Payments</h2>
            <p className="text-muted-foreground mb-3">
              Dealers often redirect to: "What monthly payment are you comfortable with?"
            </p>
            <p className="text-muted-foreground mb-3">
              That hides:
            </p>
            <ul className="list-disc pl-6 space-y-1 mb-4 text-muted-foreground">
              <li>Extended loan terms</li>
              <li>Marked-up interest rates</li>
              <li>Add-ons rolled into financing</li>
            </ul>
            <p className="text-muted-foreground mb-8">
              OTD pricing forces transparency. Monthly payments obscure it. Use resources like <a href="https://www.kbb.com/car-advice/" target="_blank" rel="noopener" className="underline text-foreground">Kelley Blue Book</a> to compare total costs across vehicles before committing.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">When You Should Walk Away</h2>
            <p className="text-muted-foreground mb-3">
              Walk if:
            </p>
            <ul className="list-disc pl-6 space-y-1 mb-4 text-muted-foreground marker:text-amber-500">
              <li>They won't itemize fees</li>
              <li>They introduce new add-ons at signing</li>
              <li>They increase price after agreement</li>
              <li>They pressure you to sign quickly</li>
            </ul>
            <p className="text-muted-foreground mb-8">
              There are always other dealerships. Leverage is your biggest asset as a buyer.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">The Bottom Line</h2>
            <p className="text-muted-foreground mb-4">
              If a dealer won't give you an OTD price, it's usually about control.
            </p>
            <p className="text-muted-foreground mb-4">
              It doesn't automatically mean fraud.
            </p>
            <p className="text-muted-foreground mb-8">
              But it does mean: you're negotiating in the dark. Before responding — or before visiting — run the numbers through a structured review.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Frequently Asked Questions</h2>
            <div className="space-y-6 mb-8">
              {faqs.map((faq, idx) => (
                <div key={idx}>
                  <h3 className="text-base font-semibold text-foreground mb-1" data-testid={`text-faq-q-${idx}`}>{faq.q}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>

            <p className="text-muted-foreground mb-8">
              Back to <Link href="/dealer-pricing-tactics" className="underline text-foreground" data-testid="link-back-hub">all dealer pricing tactics</Link>.
            </p>
          </div>


          <ArticleCta />

          <p className="text-xs text-muted-foreground mt-12">
            Not affiliated with any dealership. Optimized for U.S. car purchases.
          </p>
    </ArticleLayout>
  );
}
