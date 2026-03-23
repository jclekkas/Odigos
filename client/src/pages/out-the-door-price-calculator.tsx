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

const OTD_MESSAGE = `Hi, I'm interested in [YEAR MAKE MODEL TRIM]. Before I come in, could you send me the full out-the-door price in writing? I'd like to see the sale price, taxes, title/registration, doc fee, and any dealer-installed add-ons itemized separately. Thanks!`;

const estimateBreakdown = [
  { label: "Vehicle sale price", value: "$32,500" },
  { label: "Sales tax (6.25%)", value: "$2,031" },
  { label: "Title & registration", value: "$285" },
  { label: "Doc fee", value: "$0–$800+ (varies)", isVariable: true },
  { label: "Dealer add-ons", value: "$0–$2,500+ (varies)", isVariable: true },
  { label: "Estimated OTD subtotal (before dealer fees/add-ons)", value: "$34,816+", isTotal: true },
];

export default function OutTheDoorPriceCalculator() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    return setSeoMeta({
      title: "Out-the-Door Price Calculator | Odigos",
      description: "Estimate your OTD price and see what calculators miss: doc fees, dealer add-ons, and market adjustments. Includes a message to request an itemized quote.",
      path: "/out-the-door-price-calculator",
    });
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(OTD_MESSAGE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = OTD_MESSAGE;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <ArticleLayout title="Out-the-Door Price Calculator: Estimate Your Real Cost">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(articleSchema({ title: "Out-the-Door Price Calculator | Odigos", description: "Estimate your OTD price and see what calculators miss: doc fees, dealer add-ons, and market adjustments. Includes a message to request an itemized quote.", path: "/out-the-door-price-calculator" }))}</script>
      </Helmet>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 leading-[1.15]" data-testid="text-otd-calc-headline">
            Out-the-Door Price Calculator: Estimate Your Real Cost
          </h1>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-lg text-muted-foreground mb-4">
              The out-the-door price (OTD) is the total amount you pay to drive a car off the lot — sale price, taxes, registration, dealer fees, and any add-ons combined into one number. It's the only figure that tells you what a car actually costs. The <a href="https://consumer.ftc.gov/articles/buying-new-car" target="_blank" rel="noopener" className="underline text-foreground">FTC's car buying guide</a> explains which fees are required and which are negotiable.
            </p>
            <p className="text-lg text-muted-foreground mb-10">
              Most online car price calculators estimate tax and registration but miss the fees that vary most: <Link href="/dealer-doc-fee" className="underline text-foreground">dealer documentation fees</Link>, <Link href="/mandatory-dealer-add-ons" className="underline text-foreground">mandatory add-ons</Link>, market adjustments, and F&I products. Those dealer-specific charges are often where hundreds or thousands of dollars hide.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">What an OTD Calculator Can (and Can't) Do</h2>
            <p className="text-muted-foreground mb-3">
              A calculator can give you a ballpark — but for fair market pricing, check <a href="https://www.kbb.com/car-advice/" target="_blank" rel="noopener" className="underline text-foreground">Kelley Blue Book</a> before you start. Here's what it handles well and where it falls short:
            </p>
            <p className="text-sm font-semibold text-foreground mb-2">What it can estimate:</p>
            <ul className="space-y-2 mb-6 text-muted-foreground">
              {[
                "Sales tax based on your state/county rate",
                "Title and registration fees (state-published amounts)",
                "State rules (caps vs no caps) that influence doc fee ranges",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-green-500 mt-1.5 shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-sm font-semibold text-foreground mb-2">What it can't know:</p>
            <ul className="space-y-2 mb-8 text-muted-foreground">
              {[
                "Your dealer's actual doc fee (varies by dealership, not just state)",
                "Dealer-installed add-ons (paint protection, VIN etching, nitrogen tires, etc.)",
                "Market adjustments or \"dealer markups\" above MSRP",
                "F&I products added during financing (extended warranties, GAP insurance)",
                "Rebates or incentives with conditions not disclosed upfront",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-amber-500 mt-1.5 shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">A Simple OTD Estimate (Example)</h2>
            <p className="text-sm text-muted-foreground mb-3">
              This table shows what a basic OTD estimate looks like. Items marked "varies" depend entirely on the dealer — no calculator can fill those in for you.
            </p>
            <div className="rounded-md border border-border overflow-hidden mb-4">
              <table className="w-full text-sm" data-testid="table-otd-estimate">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left py-2.5 px-4 font-medium text-muted-foreground">Line item</th>
                    <th className="text-right py-2.5 px-4 font-medium text-muted-foreground">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {estimateBreakdown.map((row) => (
                    <tr
                      key={row.label}
                      className={row.isTotal ? "border-t-2 border-border bg-muted/30 font-semibold" : "border-t border-border/50"}
                    >
                      <td className={`py-2.5 px-4 ${row.isTotal ? "text-foreground" : "text-muted-foreground"}`}>
                        {row.label}
                      </td>
                      <td className={`py-2.5 px-4 text-right ${row.isTotal ? "text-foreground" : row.isVariable ? "text-amber-500 italic" : "text-muted-foreground"}`}>
                        {row.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-muted-foreground mb-8">
              Your dealer quote is the source of truth. A calculator gives you a starting point — the itemized OTD from the dealer is what you actually sign.
            </p>

            <div className="my-10 p-6 rounded-lg bg-muted/30 border border-border">
              <p className="text-sm font-semibold text-foreground mb-2">Already have a dealer quote to compare against?</p>
              <p className="text-sm text-muted-foreground mb-3">
                Paste it into Odigos to see what's missing from your estimate — including add-ons, market adjustments, and fees that no calculator can predict.
              </p>
              <Link href="/analyze">
                <Button variant="cta" size="sm" data-testid="button-cta-mid-article-otd-calculator">
                  Analyze My Dealer Quote
                </Button>
              </Link>
            </div>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">The 3 Numbers to Ask the Dealer For</h2>
            <p className="text-muted-foreground mb-3">
              Before you visit or commit to anything, make sure you have these three numbers in writing:
            </p>
            <ol className="space-y-4 mb-8 text-muted-foreground list-none">
              <li className="flex items-start gap-3">
                <span className="bg-muted text-foreground font-semibold text-sm rounded-full h-6 w-6 flex items-center justify-center shrink-0 mt-0.5">1</span>
                <span><strong className="text-foreground">Sale price</strong> — the vehicle price before taxes and fees. This is the number you negotiate.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-muted text-foreground font-semibold text-sm rounded-full h-6 w-6 flex items-center justify-center shrink-0 mt-0.5">2</span>
                <span><strong className="text-foreground">Itemized out-the-door price (OTD)</strong> — every line item that makes up the total: tax, title, registration, doc fee, and any add-ons. In writing.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-muted text-foreground font-semibold text-sm rounded-full h-6 w-6 flex items-center justify-center shrink-0 mt-0.5">3</span>
                <span><strong className="text-foreground">APR + term</strong> — the interest rate, loan length, and which credit tier they're assuming. "Depends on credit" isn't a number.</span>
              </li>
            </ol>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Copy-Paste Message to Request an Itemized OTD</h2>
            <p className="text-muted-foreground mb-3">
              Send this to any dealer before visiting. It's polite, direct, and covers what you need:
            </p>
            <Card className="relative p-5 bg-muted/50 mb-8">
              <blockquote className="text-sm md:text-base text-foreground leading-relaxed italic pr-10">
                {OTD_MESSAGE}
              </blockquote>
              <Button
                variant="outline"
                size="icon"
                className="absolute top-3 right-3"
                onClick={handleCopy}
                data-testid="button-copy-otd-calc-message"
                aria-label="Copy message"
              >
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
              {copied && (
                <span className="absolute top-3 right-14 text-xs text-green-600 dark:text-green-400 font-medium">Copied</span>
              )}
            </Card>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">When to Use Odigos Instead of a Calculator</h2>
            <p className="text-muted-foreground mb-3">
              A calculator works when you're starting from scratch. Once you have actual dealer communication, Odigos picks up where calculators stop:
            </p>
            <ul className="space-y-2 mb-8 text-muted-foreground">
              {[
                "You have dealer texts, emails, or a written quote to analyze",
                "You're being quoted monthly payments only — with no total price",
                "Add-ons are mentioned but not individually priced",
                "APR \"depends on credit\" without a specific tier or term",
                "You want a clear summary of what's missing and what to ask",
                "You need a reply you can send the dealer before visiting",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <p className="text-muted-foreground mb-6">
              For a deeper look at what belongs in an OTD quote, see our full guide on <Link href="/out-the-door-price" className="underline text-foreground">out-the-door pricing</Link>.
            </p>

            <p className="text-muted-foreground mb-8">
              If you're seeing add-on charges in your quote that look unfamiliar, check our <Link href="/dealer-add-ons-list" className="underline text-foreground">dealer add-ons list</Link> to understand what each product costs the dealer and whether it's worth paying for.
            </p>
          </div>


          <ArticleCta />

          <p className="text-xs text-muted-foreground mt-12">
            Not affiliated with any dealership. Optimized for U.S. car purchases.
          </p>
    </ArticleLayout>
  );
}
