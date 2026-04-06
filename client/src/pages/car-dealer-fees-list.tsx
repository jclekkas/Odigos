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

const FEES_MESSAGE = `Hi — before I come in, can you send me the full out-the-door price with every fee listed on its own line? I'd like to see the vehicle price, doc fee, any dealer-installed accessories, taxes, title, registration, and any other charges — all itemized. That way I can compare apples to apples. Thanks.`;

export default function CarDealerFeesList() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setSeoMeta({
      title: "Car Dealer Fees List: Common Dealer Charges and What They Mean | Odigos",
      description: "A complete list of common car dealer fees — from doc fees to market adjustments. Learn which charges are normal, which are negotiable, and how to compare dealers correctly.",
      path: "/car-dealer-fees-list",
    });
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(FEES_MESSAGE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = FEES_MESSAGE;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <ArticleLayout title="Car Dealer Fees List: Common Charges Explained">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(articleSchema({ title: "Car Dealer Fees List: Common Dealer Charges and What They Mean | Odigos", description: "A complete list of common car dealer fees — from doc fees to market adjustments. Learn which charges are normal, which are negotiable, and how to compare dealers correctly.", path: "/car-dealer-fees-list" }))}</script>
      </Helmet>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 leading-tight" data-testid="text-fees-list-headline">
            Car Dealer Fees List: Common Charges Explained
          </h1>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-lg text-muted-foreground">
              Walk into any dealership and the sticker price is just the starting point. By the time you reach the finance office, a stack of fees — some required, some invented — can add hundreds or thousands to the total. This page lists the most common dealer fees you'll encounter, explains what each one actually covers, and tells you which ones deserve a closer look.{" "}<SourceCitation sources={ARTICLE_SOURCES["car-dealer-fees-list"].sources} lastVerified={ARTICLE_SOURCES["car-dealer-fees-list"].lastVerified} />
            </p>

            <p className="text-sm text-muted-foreground">
              Already have a dealer quote? <Link href="/analyze" className="underline text-foreground">Paste it here</Link> and see if anything is missing.
            </p>

            <h2 className="text-2xl font-semibold text-foreground">Common dealer fees at a glance</h2>

            <p className="text-muted-foreground">
              The table below covers roughly 14 fees you may see on a buyer's order or worksheet. Some are government-mandated, some are standard industry practice, and some are pure dealer profit. For a deeper explanation of the most common ones, see our guide on <Link href="/car-dealer-fees-explained" className="underline text-foreground">car dealer fees explained</Link>.
            </p>

            <div className="overflow-x-auto mb-8">
              <table className="w-full text-sm border-collapse" data-testid="table-fees-list">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 pr-4 font-semibold text-foreground">Fee</th>
                    <th className="text-left py-3 pr-4 font-semibold text-foreground">Typical Range</th>
                    <th className="text-left py-3 font-semibold text-foreground">Notes</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-border/50">
                    <td className="py-3 pr-4 font-medium text-foreground">Documentation (doc) fee</td>
                    <td className="py-3 pr-4">$85 – $999+</td>
                    <td className="py-3">Covers paperwork processing. Capped in some states. Often negotiable.</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-3 pr-4 font-medium text-foreground">Sales tax</td>
                    <td className="py-3 pr-4">0% – 10%+</td>
                    <td className="py-3">Set by state/local government. Based on buyer's address, not dealer location.</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-3 pr-4 font-medium text-foreground">Title fee</td>
                    <td className="py-3 pr-4">$15 – $150</td>
                    <td className="py-3">Government fee to transfer or issue the vehicle title.</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-3 pr-4 font-medium text-foreground">Registration fee</td>
                    <td className="py-3 pr-4">$50 – $500</td>
                    <td className="py-3">State/county charge for plates and registration. Varies widely.</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-3 pr-4 font-medium text-foreground">Destination / freight charge</td>
                    <td className="py-3 pr-4">$900 – $1,800</td>
                    <td className="py-3">Manufacturer charge for shipping to the dealer. Usually non-negotiable.</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-3 pr-4 font-medium text-foreground">Market adjustment (ADM)</td>
                    <td className="py-3 pr-4">$500 – $10,000+</td>
                    <td className="py-3">Pure dealer markup above MSRP. Always negotiable.</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-3 pr-4 font-medium text-foreground">Dealer prep / reconditioning</td>
                    <td className="py-3 pr-4">$100 – $1,000</td>
                    <td className="py-3">Cleaning and inspection — often already included in MSRP.</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-3 pr-4 font-medium text-foreground">Paint / fabric protection</td>
                    <td className="py-3 pr-4">$300 – $1,500</td>
                    <td className="py-3">Dealer cost ~$50–$100. Aftermarket alternatives cost far less.</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-3 pr-4 font-medium text-foreground">VIN etching</td>
                    <td className="py-3 pr-4">$150 – $400</td>
                    <td className="py-3">DIY kits cost $20–$30. Rarely worth the dealer markup.</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-3 pr-4 font-medium text-foreground">Nitrogen tire fill</td>
                    <td className="py-3 pr-4">$50 – $300</td>
                    <td className="py-3">Negligible benefit for daily driving. Often free at tire shops.</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-3 pr-4 font-medium text-foreground">Extended warranty</td>
                    <td className="py-3 pr-4">$1,000 – $3,500</td>
                    <td className="py-3">Can usually be purchased later from third parties for less.</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-3 pr-4 font-medium text-foreground">GAP insurance</td>
                    <td className="py-3 pr-4">$400 – $900</td>
                    <td className="py-3">Covers loan-to-value gap. Available from credit unions for ~$200.</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-3 pr-4 font-medium text-foreground">Advertising fee</td>
                    <td className="py-3 pr-4">$200 – $1,000</td>
                    <td className="py-3">Regional ad association charge. Sometimes negotiable.</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-3 pr-4 font-medium text-foreground">Electronic filing fee</td>
                    <td className="py-3 pr-4">$50 – $200</td>
                    <td className="py-3">Covers e-filing of title/registration. Some states include this in doc fee.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 className="text-2xl font-semibold text-foreground">Which fees are normal?</h2>

            <p className="text-lg text-muted-foreground">
              Government-mandated fees — sales tax, title, and registration — are non-negotiable and go directly to state or county agencies. The <Link href="/dealer-doc-fee" className="underline text-foreground">dealer doc fee</Link> is also standard, though the amount varies by state and dealership. The destination charge is set by the manufacturer and printed on the window sticker. These are the fees you should expect on every deal.
            </p>

            <h2 className="text-2xl font-semibold text-foreground">Which fees deserve questions?</h2>

            <p className="text-lg text-muted-foreground">
              Anything beyond the fees above is worth asking about. A <Link href="/market-adjustment-fee" className="underline text-foreground">market adjustment</Link> is pure profit — it's the dealer deciding the car is worth more than MSRP. Dealer prep charges duplicate work that's already factored into the manufacturer's price. Paint protection, VIN etching, and nitrogen fills are high-margin add-ons with low actual value.
            </p>

            <p className="text-lg text-muted-foreground">
              The <a href="https://consumer.ftc.gov/articles/buying-new-car" target="_blank" rel="noopener" className="underline text-foreground">FTC's guide for new car buyers</a> recommends asking for itemized pricing and comparing across dealers — which is exactly why seeing the full fee list matters.
            </p>

            <h2 className="text-2xl font-semibold text-foreground">How to compare dealers correctly</h2>

            <p className="text-lg text-muted-foreground">
              The only number that matters for comparison is the <Link href="/out-the-door-price" className="underline text-foreground">out-the-door price</Link> — the total you'll pay to drive the car home. Two dealers can quote the same vehicle price but end up thousands apart once fees are added. Always request an itemized OTD breakdown from each dealer so you can see exactly where the money goes.
            </p>

            <p className="text-lg text-muted-foreground">
              When you have the full list side by side, it's easy to spot which dealer is padding the deal with unnecessary charges and which one is giving you a clean number.
            </p>

            <h2 className="text-2xl font-semibold text-foreground">What to send the dealer</h2>

            <p className="text-muted-foreground">
              Use this message to request a complete fee breakdown before you visit. Copy and paste it directly:
            </p>

            <Card className="relative p-5 bg-muted/50 mb-4">
              <blockquote className="text-sm md:text-base text-foreground leading-relaxed italic pr-10">
                {FEES_MESSAGE}
              </blockquote>
              <Button
                variant="outline"
                size="icon"
                className="absolute top-3 right-3"
                onClick={handleCopy}
                data-testid="button-copy-fees-list-message"
                aria-label="Copy message"
              >
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </Card>

            <p className="text-muted-foreground">
              This works because it sets the expectation that you want full transparency — before you're sitting in the finance office where pressure tactics are common.
            </p>
          </div>


          <ArticleCta />

          <p className="text-xs text-muted-foreground mt-12">
            Not affiliated with any dealership. Optimized for U.S. car purchases.
          </p>
    </ArticleLayout>
  );
}
