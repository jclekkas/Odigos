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

const OTD_CALC_MESSAGE = `Hi — before I come in, can you send me the full out-the-door price with every line item broken out? I'd like to see the vehicle price, sales tax, title and registration, doc fee, and any dealer-added packages or fees listed separately. I want to compare the total against my own estimate before we finalize anything. Thanks.`;

const exampleCalc = [
  { label: "Negotiated vehicle price", value: "$28,500" },
  { label: "Sales tax (7%)", value: "$1,995" },
  { label: "Title fee", value: "$75" },
  { label: "Registration fee", value: "$210" },
  { label: "Dealer documentation fee", value: "$399" },
  { label: "Dealer-added paint protection", value: "$595" },
  { label: "Total Out-the-Door Price", value: "$31,774", isTotal: true },
];

export default function CalculateOutTheDoorPrice() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    return setSeoMeta({
      title: "How to Calculate Out-the-Door Price on a Car | Odigos",
      description: "OTD formula step-by-step: vehicle price + tax + title + doc fee + add-ons. Worked example, what dealers omit, and a message to get the full itemized price.",
      path: "/calculate-out-the-door-price",
    });
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(OTD_CALC_MESSAGE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = OTD_CALC_MESSAGE;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <ArticleLayout title="How to Calculate Out-the-Door Price on a Car">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(articleSchema({ title: "How to Calculate Out-the-Door Price on a Car | Odigos", description: "OTD formula step-by-step: vehicle price + tax + title + doc fee + add-ons. Worked example, what dealers omit, and a message to get the full itemized price.", path: "/calculate-out-the-door-price" }))}</script>
      </Helmet>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 leading-tight" data-testid="text-calc-otd-headline">
            How to Calculate Out-the-Door Price on a Car
          </h1>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-lg text-muted-foreground mb-6">
              The out-the-door price (OTD) is the total amount you'll actually pay to drive a car off the lot — not just the sticker price or the number the salesperson quotes first. Calculating it yourself before you walk into a dealership gives you the clearest possible picture of the real cost and makes it much harder for hidden fees to slip through.{" "}<SourceCitation sources={ARTICLE_SOURCES["calculate-out-the-door-price"].sources} lastVerified={ARTICLE_SOURCES["calculate-out-the-door-price"].lastVerified} />
            </p>

            <p className="text-sm text-muted-foreground mb-6">
              Already have a dealer quote? <Link href="/analyze" className="underline text-foreground">Paste it here</Link> and see if anything is missing.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">The OTD Formula</h2>

            <p className="text-lg text-muted-foreground mb-4">
              At its simplest, the out-the-door price is built from five components:
            </p>

            <Card className="p-5 bg-muted/50 mb-6">
              <p className="text-base md:text-lg font-medium text-foreground leading-relaxed">
                OTD = Vehicle Price + Sales Tax + Title &amp; Registration + Doc Fee + Dealer Add-Ons
              </p>
            </Card>

            <p className="text-muted-foreground mb-8">
              If any of these pieces are missing from a dealer's quote, the number they gave you is incomplete. For a full explanation of what the <Link href="/out-the-door-price" className="underline text-foreground">out-the-door price</Link> includes and why it matters, see our detailed guide.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Step-by-Step Calculation</h2>

            <p className="text-muted-foreground mb-4">
              Here's how to estimate your own OTD before contacting a dealer:
            </p>

            <ul className="space-y-4 mb-8 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="font-semibold text-foreground shrink-0">1.</span>
                <span><strong className="text-foreground">Start with the negotiated vehicle price.</strong> This is the sale price you and the dealer agree on — not the MSRP or the sticker price. If you haven't negotiated yet, use the listing price as a starting point.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-foreground shrink-0">2.</span>
                <span><strong className="text-foreground">Add your local sales tax.</strong> Sales tax rates vary by state and sometimes by county or city. Multiply the vehicle price by your local rate. For example, 7% tax on a $28,500 car is $1,995.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-foreground shrink-0">3.</span>
                <span><strong className="text-foreground">Add title and registration fees.</strong> These are set by your state's DMV, not the dealer. They typically range from $100 to $500 depending on the state and vehicle value.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-foreground shrink-0">4.</span>
                <span><strong className="text-foreground">Add the dealer documentation fee.</strong> The doc fee covers the dealer's paperwork processing. It ranges from under $100 in capped states to $700+ in uncapped states. Check what's typical in your area.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-foreground shrink-0">5.</span>
                <span><strong className="text-foreground">Add any dealer-installed add-ons or packages.</strong> Paint protection, VIN etching, nitrogen tires, fabric protection — these are frequently bundled in without being clearly disclosed. Ask the dealer to list them separately.</span>
              </li>
            </ul>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">What Usually Gets Left Out</h2>

            <p className="text-muted-foreground mb-4">
              The most common reason a dealer's quoted price doesn't match your own calculation is that certain charges aren't disclosed until later — often in the finance office. Watch for:
            </p>

            <ul className="space-y-2 mb-8 text-muted-foreground">
              {[
                "Dealer-added accessories or \"protection packages\" already installed on the car",
                "Market adjustment or additional dealer markup (ADM) fees",
                "Documentation fees significantly higher than the local average",
                "\"Reconditioning\" or \"dealer prep\" fees with vague descriptions",
                "GAP insurance or extended warranties folded into the monthly payment",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <p className="text-muted-foreground mb-8">
              Many of these charges are optional — even when the dealer presents them as required. For more detail, see our guide on <Link href="/car-dealer-fees-explained" className="underline text-foreground">car dealer fees explained</Link> and learn what you can push back on.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Example: Calculating OTD on a $28,500 Car</h2>

            <p className="text-muted-foreground mb-4">
              Here's a realistic example showing what a full OTD calculation looks like when every fee is included:
            </p>

            <div className="rounded-md border border-border overflow-x-auto mb-4">
              <table className="w-full text-sm" data-testid="table-calc-otd-breakdown">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left py-2.5 px-4 font-medium text-muted-foreground">Line Item</th>
                    <th className="text-right py-2.5 px-4 font-medium text-muted-foreground">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {exampleCalc.map((row) => (
                    <tr
                      key={row.label}
                      className={row.isTotal ? "border-t-2 border-border bg-muted/30 font-semibold" : "border-t border-border/50"}
                    >
                      <td className={`py-2.5 px-4 ${row.isTotal ? "text-foreground" : "text-muted-foreground"}`}>
                        {row.label}
                      </td>
                      <td className={`py-2.5 px-4 text-right ${row.isTotal ? "text-foreground" : "text-muted-foreground"}`}>
                        {row.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-muted-foreground mb-2">
              In this example, the car's listed price is $28,500 — but the real cost to drive it home is $31,774. That's over $3,200 in fees and taxes on top of the sale price.
            </p>

            <p className="text-muted-foreground mb-8">
              If the dealer had only quoted "$28,500 plus tax and fees," you wouldn't know about the $595 paint protection package until the finance office. The <a href="https://consumer.ftc.gov/articles/buying-new-car" target="_blank" rel="noopener" className="underline text-foreground">FTC recommends</a> getting the full price in writing before committing to any deal.
            </p>

            <div className="my-10 p-6 rounded-lg bg-muted/30 border border-border">
              <p className="text-sm font-semibold text-foreground mb-2">Have a quote that doesn't match your estimate?</p>
              <p className="text-sm text-muted-foreground mb-3">
                Paste it into Odigos. We'll show you exactly which line items are missing or higher than expected — so you can go back to the dealer with the right questions.
              </p>
              <Link href="/analyze">
                <Button variant="cta" size="sm" data-testid="button-cta-mid-article-calculate-otd">
                  Analyze My Dealer Quote
                </Button>
              </Link>
            </div>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Copy-Paste Message to Get the Full OTD Breakdown</h2>

            <p className="text-muted-foreground mb-4">
              Send this to the dealer before you visit. It asks for every component you need to verify your own calculation:
            </p>

            <Card className="relative p-5 bg-muted/50 mb-4">
              <blockquote className="text-sm md:text-base text-foreground leading-relaxed italic pr-10">
                {OTD_CALC_MESSAGE}
              </blockquote>
              <Button
                variant="outline"
                size="icon"
                className="absolute top-3 right-3"
                onClick={handleCopy}
                data-testid="button-copy-calc-otd-message"
                aria-label="Copy message"
              >
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
              {copied && (
                <span className="absolute top-3 right-14 text-xs text-green-600 dark:text-green-400 font-medium">Copied</span>
              )}
            </Card>

            <p className="text-muted-foreground mb-8">
              If they won't itemize the price, that tells you something. A dealer who is confident in their pricing will have no problem breaking it down. If they push back, you can read more about why in our guide on <Link href="/dealer-wont-give-otd-price" className="underline text-foreground">dealers who won't give an OTD price</Link>.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Why Odigos Helps</h2>

            <p className="text-muted-foreground mb-4">
              Running the numbers yourself is a strong first step — but it only works if you know every fee the dealer plans to charge. Odigos analyzes the actual quote or text messages you receive from a dealer and flags anything that's missing, vague, or higher than expected.
            </p>

            <p className="text-muted-foreground mb-6">
              Instead of guessing whether a fee is normal, paste the dealer's message and get a clear breakdown of what's included, what's missing, and what deserves a closer look.
            </p>

            <p className="text-muted-foreground mb-8">
              If dealer add-ons are part of what's inflating your estimate, see our <Link href="/are-dealer-add-ons-mandatory" className="underline text-foreground">guide on mandatory dealer add-ons</Link> to learn which charges you can push back on and how to phrase it professionally.
            </p>
          </div>


          <ArticleCta />

          <p className="text-xs text-muted-foreground mt-12">
            Not affiliated with any dealership. Optimized for U.S. car purchases.
          </p>
    </ArticleLayout>
  );
}
