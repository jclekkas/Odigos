import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Copy } from "lucide-react";
import logoImage from "@assets/odigos_logo.png";
import { setSeoMeta } from "@/lib/seo";

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
      title: "Dealer Won't Give OTD Price? What To Do | Odigos",
      description:
        "If a dealer refuses to give an out-the-door price, here's what it means and how to respond before visiting the dealership.",
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
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-6 flex items-center gap-3">
          <Link href="/">
            <img src={logoImage} alt="Odigos" className="h-12 md:h-14 w-auto cursor-pointer" data-testid="link-logo-home" />
          </Link>
        </div>
      </header>

      <main className="py-12 md:py-20 px-6">
        <article className="max-w-2xl mx-auto">
          <p className="text-sm text-muted-foreground mb-4">
            <Link href="/dealer-pricing-tactics" className="underline text-foreground">Dealer Pricing Tactics</Link> &rsaquo; This Article
          </p>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 leading-[1.15]" data-testid="text-otd-refuse-headline">
            Dealer Won't Give OTD Price? Here's What That Means
          </h1>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-lg text-muted-foreground mb-4">
              If a dealer won't give you an out-the-door (OTD) price, that's not random.
            </p>
            <p className="text-lg text-muted-foreground mb-4">
              It's usually strategic.
            </p>
            <p className="text-muted-foreground mb-3">
              An out-the-door price includes:
            </p>
            <ul className="space-y-2 mb-4 text-muted-foreground">
              {["Vehicle price", "Taxes", "Registration", "Dealer fees", "Add-ons"].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-muted-foreground mb-4">
              In other words: the real total.
            </p>
            <p className="text-muted-foreground mb-10">
              When a dealer avoids giving it, they're keeping leverage. Here's why that happens — and what you should do next.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Why Dealers Avoid Giving OTD Prices</h2>
            <p className="text-muted-foreground mb-6">
              There are four common reasons.
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-2 text-foreground">1. They Want You In the Showroom</h3>
            <p className="text-muted-foreground mb-3">
              It's easier to negotiate in person. Once you're sitting at a desk:
            </p>
            <ul className="space-y-2 mb-4 text-muted-foreground">
              {[
                "Time pressure increases",
                "Emotional commitment rises",
                "Trade-in conversations begin",
                "Financing gets layered in",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-muted-foreground mb-8">
              Refusing to give OTD pricing forces you to come in.
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-2 text-foreground">2. They Want to Separate the Numbers</h3>
            <p className="text-muted-foreground mb-3">
              Dealers often break pricing into pieces:
            </p>
            <ul className="space-y-2 mb-4 text-muted-foreground">
              {['"Sale price"', '"Monthly payment"', '"Estimated fees"'].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
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
            <ul className="space-y-2 mb-4 text-muted-foreground">
              {[
                "Protection packages",
                "Nitrogen tires",
                "VIN etching",
                '"Market adjustments"',
                "High doc fees",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-muted-foreground mb-8">
              Without OTD pricing in writing, these get introduced later.
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-2 text-foreground">4. They Want Flexibility to Adjust Based on You</h3>
            <p className="text-muted-foreground mb-3">
              Sometimes pricing changes based on:
            </p>
            <ul className="space-y-2 mb-4 text-muted-foreground">
              {[
                "Whether you finance with them",
                "Your credit profile",
                "Whether you mention competing quotes",
                "How serious you seem",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-muted-foreground mb-8">
              OTD pricing limits that flexibility.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Is It Legal for a Dealer to Refuse?</h2>
            <p className="text-muted-foreground mb-4">
              In most states, yes. Dealers are not legally required to provide a written OTD quote by email.
            </p>
            <p className="text-muted-foreground mb-4">
              However: once a number is agreed upon in writing, changing it later can become a deceptive practice issue depending on state law.
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
            <ul className="space-y-2 mb-4 text-muted-foreground">
              {[
                "Have strict policies about in-person quotes",
                "Require a stock number first",
                'Avoid "price shopping" scenarios',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-muted-foreground mb-3">
              But it becomes concerning when:
            </p>
            <ul className="space-y-2 mb-4 text-muted-foreground">
              {[
                "They refuse after you provide VIN and ZIP code",
                "They won't itemize fees",
                'They say "we\'ll figure that out when you come in"',
                "They shift conversation to monthly payments",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-500 mt-1.5 shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-muted-foreground mb-8">
              That's when caution is warranted.
            </p>

            <div className="my-10 p-6 rounded-lg bg-muted/30 border border-border">
              <p className="text-sm font-semibold text-foreground mb-2">Have a dealer quote you're unsure about?</p>
              <p className="text-sm text-muted-foreground mb-3">
                Paste it into Odigos and we'll flag what's missing, risky, or unclear — before you visit.
              </p>
              <Link href="/">
                <Button size="sm" data-testid="button-cta-mid-article">
                  Analyze My Dealer Quote
                </Button>
              </Link>
            </div>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">What You Should Say Back (Copy This)</h2>
            <p className="text-muted-foreground mb-3">
              Keep it simple and neutral. You can reply with:
            </p>
            <Card className="relative p-5 bg-muted/50 mb-4">
              <blockquote className="text-sm md:text-base text-foreground leading-relaxed italic pr-10">
                {OTD_REQUEST}
              </blockquote>
              <Button
                variant="outline"
                size="icon"
                className="absolute top-3 right-3"
                onClick={() => handleCopy(OTD_REQUEST, 0)}
                data-testid="button-copy-otd-request"
                aria-label="Copy message"
              >
                {copiedIdx === 0 ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
              {copiedIdx === 0 && (
                <span className="absolute top-3 right-14 text-xs text-green-600 dark:text-green-400 font-medium">Copied</span>
              )}
            </Card>
            <p className="text-muted-foreground mb-3">
              If they still refuse:
            </p>
            <Card className="relative p-5 bg-muted/50 mb-8">
              <blockquote className="text-sm md:text-base text-foreground leading-relaxed italic pr-10">
                {WALKAWAY_MSG}
              </blockquote>
              <Button
                variant="outline"
                size="icon"
                className="absolute top-3 right-3"
                onClick={() => handleCopy(WALKAWAY_MSG, 1)}
                data-testid="button-copy-walkaway"
                aria-label="Copy message"
              >
                {copiedIdx === 1 ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
              {copiedIdx === 1 && (
                <span className="absolute top-3 right-14 text-xs text-green-600 dark:text-green-400 font-medium">Copied</span>
              )}
            </Card>
            <p className="text-muted-foreground mb-8">
              No hostility. Just clarity.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">How to Protect Yourself If They Won't Send It</h2>
            <p className="text-muted-foreground mb-3">
              If you decide to visit anyway:
            </p>
            <ol className="space-y-3 mb-4 text-muted-foreground list-none">
              {[
                "Bring printed competitor quotes",
                "Ask for full itemization before signing anything",
                "Refuse to discuss monthly payments first",
                "Do not let them combine trade-in and vehicle price into one number",
              ].map((step, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="bg-muted text-foreground font-semibold text-sm rounded-full h-6 w-6 flex items-center justify-center shrink-0 mt-0.5">{idx + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
            <p className="text-muted-foreground mb-8">
              And most importantly: never agree verbally without seeing the full breakdown.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Why OTD Pricing Matters More Than Monthly Payments</h2>
            <p className="text-muted-foreground mb-3">
              Dealers often redirect to: "What monthly payment are you comfortable with?"
            </p>
            <p className="text-muted-foreground mb-3">
              That hides:
            </p>
            <ul className="space-y-2 mb-4 text-muted-foreground">
              {[
                "Extended loan terms",
                "Marked-up interest rates",
                "Add-ons rolled into financing",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-muted-foreground mb-8">
              OTD pricing forces transparency. Monthly payments obscure it.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">When You Should Walk Away</h2>
            <p className="text-muted-foreground mb-3">
              Walk if:
            </p>
            <ul className="space-y-2 mb-4 text-muted-foreground">
              {[
                "They won't itemize fees",
                "They introduce new add-ons at signing",
                "They increase price after agreement",
                "They pressure you to sign quickly",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-amber-500 mt-1.5 shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
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
                  <h3 className="text-base font-semibold text-foreground mb-1">{faq.q}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>

            <p className="text-muted-foreground mb-8">
              Back to <Link href="/dealer-pricing-tactics" className="underline text-foreground">all dealer pricing tactics</Link>.
            </p>
          </div>

          <div className="mt-12 pt-8 border-t border-border">
            <h2 className="text-xl font-semibold mb-2 text-foreground" data-testid="text-otd-refuse-cta-heading">
              Analyze Your Dealer Quote Before You Go In
            </h2>
            <p className="text-muted-foreground mb-3">
              Paste your dealer's quote into Odigos and see:
            </p>
            <ul className="space-y-2 mb-4 text-muted-foreground">
              {[
                "Hidden fee flags",
                "Common pricing tactics",
                "Negotiation leverage points",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-muted-foreground mb-4">
              Know what's negotiable before you walk into the showroom.
            </p>
            <Link href="/">
              <Button size="lg" data-testid="button-cta-otd-refuse">
                Analyze My Dealer Quote
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
