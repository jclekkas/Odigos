import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Copy } from "lucide-react";
import { setSeoMeta } from "@/lib/seo";
import logoImage from "@assets/odigos_logo.png";

const DOC_FEE_REQUEST_MESSAGE = `Hi — I'm comparing offers from a few dealerships. Before I come in, could you send me an itemized out-the-door price that breaks out the documentation fee as its own line? I'd also like to see taxes, title, and registration listed separately. Thanks.`;

export default function DealerDocFeeByState() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    return setSeoMeta({
      title: "Dealer Doc Fee by State: Typical Ranges and Fee Caps | Odigos",
      description: "Dealer documentation fees range from under $100 to over $1,000 depending on the state. See typical doc fee ranges, which states cap fees, and how to compare dealers fairly.",
      path: "/dealer-doc-fee-by-state",
    });
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(DOC_FEE_REQUEST_MESSAGE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = DOC_FEE_REQUEST_MESSAGE;
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
        <article className="max-w-[700px] mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 leading-tight" data-testid="text-doc-fee-by-state-headline">
            Dealer Doc Fee by State: What Buyers Should Expect
          </h1>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-lg text-muted-foreground mb-6">
              The documentation fee — commonly called the "doc fee" — is one of the most inconsistent charges in a car deal. It covers the dealer's cost of processing title work, registration, and loan paperwork. But unlike taxes or registration, the doc fee is set by the dealership, not the government. That means the same paperwork that costs $85 in California can cost $900 in Florida — and both are perfectly legal.
            </p>

            <p className="text-sm text-muted-foreground mb-6">
              Already have a dealer quote? <Link href="/analyze" className="underline text-foreground">Paste it here</Link> and see if anything is missing.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Why doc fees vary so much</h2>

            <p className="text-lg text-muted-foreground mb-6">
              The core issue is regulation — or the lack of it. Some states set a legal maximum on what dealers can charge for documentation. In those states, every dealership charges the same amount (or close to it) because there's a hard cap. Other states have no cap at all, which means the doc fee is entirely at the dealer's discretion.
            </p>

            <p className="text-lg text-muted-foreground mb-6">
              In uncapped states, dealers set their doc fee based on local competition, overhead costs, and profit strategy. A high-volume dealer in a competitive metro area might keep the fee lower to attract buyers. A dealer in a less competitive market might charge $700 or more because there's no regulatory reason not to. The actual work the fee covers — printing contracts, filing paperwork, submitting registration — is essentially the same everywhere.
            </p>

            <p className="text-lg text-muted-foreground mb-6">
              For a deeper look at what the doc fee actually covers and whether you can negotiate it, see our guide on the <Link href="/dealer-doc-fee" className="underline text-foreground">dealer documentation fee</Link>.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Doc fee ranges by state</h2>

            <p className="text-muted-foreground mb-4">
              The table below shows approximate documentation fee ranges for 30 states. Where a state caps the fee, the cap is noted. In uncapped states, the ranges reflect what buyers commonly report. Always verify current limits with your state's attorney general or motor vehicle agency.
            </p>

            <div className="overflow-x-auto mb-4">
              <table className="w-full text-sm text-left border border-border" data-testid="table-doc-fee-by-state">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="px-4 py-3 font-semibold text-foreground border-b border-border">State</th>
                    <th className="px-4 py-3 font-semibold text-foreground border-b border-border">Doc Fee Cap?</th>
                    <th className="px-4 py-3 font-semibold text-foreground border-b border-border">Typical Doc Fee</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-border/50"><td className="px-4 py-2">Alabama</td><td className="px-4 py-2">No cap</td><td className="px-4 py-2">$400–$700</td></tr>
                  <tr className="border-b border-border/50"><td className="px-4 py-2">Arizona</td><td className="px-4 py-2">No cap</td><td className="px-4 py-2">$400–$600</td></tr>
                  <tr className="border-b border-border/50"><td className="px-4 py-2">California</td><td className="px-4 py-2">Capped at $85</td><td className="px-4 py-2">~$85</td></tr>
                  <tr className="border-b border-border/50"><td className="px-4 py-2">Colorado</td><td className="px-4 py-2">No cap</td><td className="px-4 py-2">$400–$700</td></tr>
                  <tr className="border-b border-border/50"><td className="px-4 py-2">Connecticut</td><td className="px-4 py-2">No cap</td><td className="px-4 py-2">$300–$600</td></tr>
                  <tr className="border-b border-border/50"><td className="px-4 py-2">Florida</td><td className="px-4 py-2">No cap</td><td className="px-4 py-2">$500–$1,000+</td></tr>
                  <tr className="border-b border-border/50"><td className="px-4 py-2">Georgia</td><td className="px-4 py-2">No cap</td><td className="px-4 py-2">$400–$700</td></tr>
                  <tr className="border-b border-border/50"><td className="px-4 py-2">Illinois</td><td className="px-4 py-2">Capped at ~$300</td><td className="px-4 py-2">~$300</td></tr>
                  <tr className="border-b border-border/50"><td className="px-4 py-2">Indiana</td><td className="px-4 py-2">No cap</td><td className="px-4 py-2">$200–$400</td></tr>
                  <tr className="border-b border-border/50"><td className="px-4 py-2">Louisiana</td><td className="px-4 py-2">No cap</td><td className="px-4 py-2">$200–$500</td></tr>
                  <tr className="border-b border-border/50"><td className="px-4 py-2">Maryland</td><td className="px-4 py-2">Capped at ~$500</td><td className="px-4 py-2">$300–$500</td></tr>
                  <tr className="border-b border-border/50"><td className="px-4 py-2">Massachusetts</td><td className="px-4 py-2">No cap</td><td className="px-4 py-2">$300–$500</td></tr>
                  <tr className="border-b border-border/50"><td className="px-4 py-2">Michigan</td><td className="px-4 py-2">No cap</td><td className="px-4 py-2">$200–$400</td></tr>
                  <tr className="border-b border-border/50"><td className="px-4 py-2">Minnesota</td><td className="px-4 py-2">Capped at ~$125</td><td className="px-4 py-2">~$125</td></tr>
                  <tr className="border-b border-border/50"><td className="px-4 py-2">Missouri</td><td className="px-4 py-2">No cap</td><td className="px-4 py-2">$200–$500</td></tr>
                  <tr className="border-b border-border/50"><td className="px-4 py-2">Nevada</td><td className="px-4 py-2">No cap</td><td className="px-4 py-2">$400–$700</td></tr>
                  <tr className="border-b border-border/50"><td className="px-4 py-2">New Jersey</td><td className="px-4 py-2">No cap</td><td className="px-4 py-2">$300–$600</td></tr>
                  <tr className="border-b border-border/50"><td className="px-4 py-2">New York</td><td className="px-4 py-2">Capped at ~$175</td><td className="px-4 py-2">~$175</td></tr>
                  <tr className="border-b border-border/50"><td className="px-4 py-2">North Carolina</td><td className="px-4 py-2">No cap</td><td className="px-4 py-2">$500–$800</td></tr>
                  <tr className="border-b border-border/50"><td className="px-4 py-2">Ohio</td><td className="px-4 py-2">No cap</td><td className="px-4 py-2">$200–$500</td></tr>
                  <tr className="border-b border-border/50"><td className="px-4 py-2">Oregon</td><td className="px-4 py-2">Capped at ~$150</td><td className="px-4 py-2">~$150</td></tr>
                  <tr className="border-b border-border/50"><td className="px-4 py-2">Pennsylvania</td><td className="px-4 py-2">No cap</td><td className="px-4 py-2">$200–$500</td></tr>
                  <tr className="border-b border-border/50"><td className="px-4 py-2">South Carolina</td><td className="px-4 py-2">No cap</td><td className="px-4 py-2">$400–$700</td></tr>
                  <tr className="border-b border-border/50"><td className="px-4 py-2">Tennessee</td><td className="px-4 py-2">No cap</td><td className="px-4 py-2">$300–$600</td></tr>
                  <tr className="border-b border-border/50"><td className="px-4 py-2">Texas</td><td className="px-4 py-2">No cap</td><td className="px-4 py-2">$150–$300</td></tr>
                  <tr className="border-b border-border/50"><td className="px-4 py-2">Utah</td><td className="px-4 py-2">No cap</td><td className="px-4 py-2">$300–$500</td></tr>
                  <tr className="border-b border-border/50"><td className="px-4 py-2">Virginia</td><td className="px-4 py-2">No cap</td><td className="px-4 py-2">$500–$800</td></tr>
                  <tr className="border-b border-border/50"><td className="px-4 py-2">Washington</td><td className="px-4 py-2">Capped at ~$200</td><td className="px-4 py-2">~$200</td></tr>
                  <tr className="border-b border-border/50"><td className="px-4 py-2">Wisconsin</td><td className="px-4 py-2">No cap</td><td className="px-4 py-2">$200–$400</td></tr>
                  <tr><td className="px-4 py-2">Wyoming</td><td className="px-4 py-2">No cap</td><td className="px-4 py-2">$200–$400</td></tr>
                </tbody>
              </table>
            </div>

            <p className="text-sm text-muted-foreground mb-6 italic">
              These ranges are approximate and based on commonly reported dealer practices. Fee caps and regulations change over time — always verify with your state's attorney general or motor vehicle agency before relying on specific numbers.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">What if your doc fee seems too high?</h2>

            <p className="text-lg text-muted-foreground mb-6">
              If the doc fee on your quote is significantly above the typical range for your state, that's worth questioning — but it's not automatically a red flag. Some dealers charge more for doc fees and less on the vehicle price. Others do the opposite. What matters most is the total <Link href="/out-the-door-price" className="underline text-foreground">out-the-door price</Link>, not any single line item.
            </p>

            <p className="text-lg text-muted-foreground mb-6">
              That said, a doc fee well above local averages is a sign you should ask questions. In states without a cap, the dealer sets this fee entirely on their own. If they're charging $900 when nearby dealers charge $400 for the same paperwork, that's $500 in pure margin — and you should know about it before you commit.
            </p>

            <p className="text-lg text-muted-foreground mb-6">
              For specific tactics on what to say and what to watch for, see our guide on <Link href="/doc-fee-too-high" className="underline text-foreground">what to do when a doc fee is too high</Link>.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">What to say to the dealer</h2>

            <p className="text-muted-foreground mb-4">
              Before visiting or committing, send this message to get a clear breakdown. You can copy and paste it directly:
            </p>

            <Card className="relative p-5 bg-muted/50 mb-4">
              <blockquote className="text-sm md:text-base text-foreground leading-relaxed italic pr-10">
                {DOC_FEE_REQUEST_MESSAGE}
              </blockquote>
              <Button
                variant="outline"
                size="icon"
                className="absolute top-3 right-3"
                onClick={handleCopy}
                data-testid="button-copy-doc-fee-by-state-message"
                aria-label="Copy message"
              >
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </Card>

            <p className="text-muted-foreground mb-6">
              This works because it's specific without being confrontational. You're asking the dealer to itemize the doc fee so you can compare it against what's typical in your state.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">How to compare dealers on doc fees</h2>

            <p className="text-lg text-muted-foreground mb-6">
              Comparing doc fees across dealers is useful, but it only tells part of the story. A dealer with a $200 doc fee and a $500 higher vehicle price isn't actually cheaper than a dealer with a $600 doc fee and a lower base price. The right comparison is always the total out-the-door number.
            </p>

            <p className="text-lg text-muted-foreground mb-6">
              When shopping across state lines, doc fee differences become even more significant. A dealer in a capped state like California ($85) might seem cheaper on paper, but higher sales tax rates or a higher vehicle price can erase that advantage. Always compare the full OTD price — not just one fee.
            </p>

            <p className="text-lg text-muted-foreground mb-6">
              For a broader view of all the fees that show up on a car deal — not just doc fees — see our guide on <Link href="/car-dealer-fees-by-state" className="underline text-foreground">car dealer fees by state</Link>. You can also review the <a href="https://consumer.ftc.gov/articles/buying-new-car" target="_blank" rel="noopener" className="underline text-foreground">FTC's guide for car buyers</a> for details on what dealers must disclose.
            </p>

            <p className="text-lg text-muted-foreground mb-8">
              If you already have a dealer quote and want to know whether the doc fee — or anything else — looks off, Odigos can analyze the full breakdown and flag anything that doesn't add up.
            </p>
          </div>

          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-muted-foreground mb-4" data-testid="text-bottom-cta">
              Not sure if the dealer quote is complete?
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Paste the message or quote you received. Odigos checks for missing out-the-door pricing, add-ons, and unclear fees.
            </p>
            <Link href="/analyze">
              <Button size="lg" data-testid="button-cta-doc-fee-by-state">
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
