import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Copy } from "lucide-react";
import { setSeoMeta } from "@/lib/seo";
import { itemListSchema } from "@/lib/jsonld";
import ArticleLayout from "@/components/ArticleLayout";
import ArticleCta from "@/components/ArticleCta";
import stateFeeData from "@/data/state_fee_reference.json";
import { STATE_FEES } from "@/data/stateFees";

interface StateEntry {
  name: string;
  abbreviation: string;
  docFeeCap: boolean;
  docFeeCapAmount: number | null;
  docFeeTypicalRange: [number, number];
}

const stateRows: StateEntry[] = Object.values(
  stateFeeData.states as Record<string, StateEntry>
).sort((a, b) => a.name.localeCompare(b.name));

function formatDocFeeRange(state: StateEntry): string {
  if (state.docFeeCap && state.docFeeCapAmount !== null) {
    return `Up to $${state.docFeeCapAmount.toLocaleString()} (capped)`;
  }
  const [low, high] = state.docFeeTypicalRange;
  if (low === 0 && high === 0) return "Varies (no cap)";
  if (low === 0) return `Up to $${high.toLocaleString()} (no cap)`;
  if (low === high) return `~$${low.toLocaleString()} (no cap)`;
  return `$${low.toLocaleString()}–$${high.toLocaleString()} (no cap)`;
}

const FEE_REQUEST_MESSAGE = `Before I visit the dealership, could you please send the full out-the-door price including vehicle price, taxes, registration, doc fee, and any dealer add-ons? I'm comparing total pricing across multiple dealers.`;

export default function CarDealerFeesByState() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    return setSeoMeta({
      title: "Car Dealer Fees by State: Doc Fees, Taxes, and What Dealers Can Charge | Odigos",
      description: "Dealer documentation fees vary widely by state. See typical dealer fees, why they differ, and how to compare out-the-door prices before visiting a dealership.",
      path: "/car-dealer-fees-by-state",
    });
  }, []);


  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(FEE_REQUEST_MESSAGE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = FEE_REQUEST_MESSAGE;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <ArticleLayout title="Car Dealer Fees by State: What Buyers Should Expect">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(itemListSchema({
          name: "Car Dealer Fees by State",
          description: "State-by-state guide to car dealer documentation fees, taxes, and what buyers should expect.",
          items: [
            { name: "Car dealer fees in California", url: "/car-dealer-fees-california" },
            { name: "Car dealer fees in Texas", url: "/car-dealer-fees-texas" },
            { name: "Car dealer fees in Florida", url: "/car-dealer-fees-florida" },
            { name: "Car dealer fees in New York", url: "/car-dealer-fees-new-york" },
            { name: "Car dealer fees in Georgia", url: "/car-dealer-fees-georgia" },
            { name: "Car dealer fees in Illinois", url: "/car-dealer-fees-illinois" },
            { name: "Car dealer fees in Pennsylvania", url: "/car-dealer-fees-pennsylvania" },
            { name: "Car dealer fees in Ohio", url: "/car-dealer-fees-ohio" },
            { name: "Car dealer fees in North Carolina", url: "/car-dealer-fees-north-carolina" },
            { name: "Car dealer fees in Arizona", url: "/car-dealer-fees-arizona" },
            { name: "Car dealer fees in Michigan", url: "/car-dealer-fees-michigan" },
            { name: "Car dealer fees in Washington", url: "/car-dealer-fees-washington" },
            { name: "Car dealer fees in Virginia", url: "/car-dealer-fees-virginia" },
            { name: "Car dealer fees in New Jersey", url: "/car-dealer-fees-new-jersey" },
            { name: "Car dealer fees in Massachusetts", url: "/car-dealer-fees-massachusetts" },
            { name: "Car dealer fees in Colorado", url: "/car-dealer-fees-colorado" },
            { name: "Car dealer fees in Minnesota", url: "/car-dealer-fees-minnesota" },
            { name: "Car dealer fees in Wisconsin", url: "/car-dealer-fees-wisconsin" },
            { name: "Car dealer fees in Nevada", url: "/car-dealer-fees-nevada" },
            { name: "Car dealer fees in Tennessee", url: "/car-dealer-fees-tennessee" },
          ]
        }))}</script>
      </Helmet>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 leading-tight" data-testid="text-fees-by-state-headline">
            Car Dealer Fees by State: What Buyers Should Expect
          </h1>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-lg text-muted-foreground mb-6">
              If you've ever compared car prices across dealerships — or across state lines — you've probably noticed that the fees tacked onto the sale price can vary dramatically. Two dealers selling the same vehicle at the same advertised price can end up with out-the-door totals that differ by hundreds or even thousands of dollars, depending on where they're located.
            </p>

            <p className="text-lg text-muted-foreground mb-6">
              The reason is straightforward: sales tax and registration fees are set by state and local governments, but the <Link href="/dealer-doc-fee" className="underline text-foreground">dealer documentation fee</Link> is set by the dealership itself. Some states cap what dealers can charge for paperwork. Others have no cap at all, which means the doc fee is whatever the dealer decides it should be.
            </p>

            <p className="text-sm text-muted-foreground mb-6">
              Already have a dealer quote? <Link href="/analyze" className="underline text-foreground">Paste it here</Link> and see if anything is missing.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Why dealer fees vary by state</h2>

            <p className="text-lg text-muted-foreground mb-6">
              There are three categories of charges that show up on a car deal, and they behave very differently depending on where you're buying.
            </p>

            <p className="text-muted-foreground mb-4">
              <strong className="text-foreground">Government fees</strong> include sales tax, title transfer, and vehicle registration. These are non-negotiable — they're set by your state, county, or city. Sales tax rates range from 0% in states like Montana and Oregon to over 10% in parts of Tennessee and Louisiana when local taxes are included. Registration fees vary too, with some states charging a flat rate and others basing the fee on the vehicle's value or weight.
            </p>

            <p className="text-muted-foreground mb-4">
              <strong className="text-foreground">Dealer documentation fees</strong> cover the cost of processing your paperwork — title work, registration filing, loan documents, and contract preparation. Unlike government fees, these are set entirely by the dealer. In states with caps, the fee might be limited to $85 or $200. In uncapped states, dealers regularly charge $500 to $900 or more for the same paperwork. For a deeper look at what this fee actually covers, see our guide on <Link href="/doc-fee-too-high" className="underline text-foreground">what to do when a dealer doc fee seems too high</Link>.
            </p>

            <p className="text-muted-foreground mb-6">
              <strong className="text-foreground">Optional dealer add-ons</strong> are products like paint protection, fabric coating, nitrogen-filled tires, VIN etching, or extended warranties. These are profit items added by the dealership and are almost always optional, even when they're presented as included or required.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Typical dealer doc fee ranges by state</h2>

            <p className="text-muted-foreground mb-4">
              The table below shows approximate documentation fee ranges for all 50 states and Washington D.C. Some states set legal caps; others allow dealers to charge whatever they choose. Where there's no cap, the ranges shown reflect what buyers commonly report.
            </p>

            <div className="overflow-x-auto mb-4">
              <table className="w-full text-sm text-left border border-border" data-testid="table-state-fees">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="px-4 py-3 font-semibold text-foreground border-b border-border">State</th>
                    <th className="px-4 py-3 font-semibold text-foreground border-b border-border">Typical Dealer Doc Fee Range</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  {stateRows.map((state, idx) => (
                    <tr key={state.abbreviation} className={idx < stateRows.length - 1 ? "border-b border-border/50" : ""} data-testid={`row-state-fee-${state.abbreviation}`}>
                      <td className="px-4 py-2">{state.name}</td>
                      <td className="px-4 py-2">{formatDocFeeRange(state)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-sm text-muted-foreground mb-6 italic">
              These ranges are approximate and based on commonly reported dealer practices. Fee limits and regulations can change — always verify with your state's attorney general or consumer protection office before relying on specific numbers.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Which fees are actually required</h2>

            <p className="text-lg text-muted-foreground mb-6">
              Every car purchase includes certain charges that are genuinely non-negotiable because they're mandated by government agencies:
            </p>

            <ul className="space-y-2 mb-6 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span><strong className="text-foreground">Sales tax</strong> — set by your state and sometimes your county or city. Applied to the purchase price (or the price minus trade-in value, depending on the state).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span><strong className="text-foreground">Title fee</strong> — a flat charge from the state to transfer the vehicle title into your name.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span><strong className="text-foreground">Registration fee</strong> — covers your license plates and annual vehicle registration. The amount varies by state and sometimes by vehicle value or weight.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span><strong className="text-foreground">Documentation fee</strong> — while this is a dealer-set charge (not a government fee), it appears on virtually every deal. Whether it's reasonable depends on your state and the dealer.</span>
              </li>
            </ul>

            <p className="text-muted-foreground mb-6">
              Beyond these, most other charges on a dealer invoice are optional. Paint protection, fabric coating, window tinting, dealer-installed accessories, and extended warranties are all products the dealer adds for profit. They're rarely required, even when the dealer presents them that way. For a full breakdown of which charges are legitimate and which you can refuse, see our guide on <Link href="/car-dealer-fees-explained" className="underline text-foreground">common car dealer fees explained</Link>.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">How to compare dealer fees correctly</h2>

            <p className="text-lg text-muted-foreground mb-6">
              Comparing individual fees line by line across dealers is useful for spotting outliers, but it's not the most efficient way to evaluate a deal. One dealer might charge a lower doc fee but make up for it with a higher vehicle price or by adding optional products. Another dealer might have a higher doc fee but a lower overall total.
            </p>

            <p className="text-lg text-muted-foreground mb-6">
              The most reliable comparison is the <Link href="/out-the-door-price" className="underline text-foreground">out-the-door price</Link> — the total amount you'll pay to leave with the keys, including every fee, tax, and add-on. When you ask each dealer for their OTD price on the same vehicle, you're comparing apples to apples regardless of how they structure their fees internally.
            </p>

            <p className="text-muted-foreground mb-6">
              This is especially important when shopping across state lines. A dealer in a state with lower sales tax but higher doc fees might still offer a better total price than a dealer in a capped-fee state with higher tax rates. The only way to know is to compare the final number.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">What to do if a dealer's fees seem high</h2>

            <p className="text-lg text-muted-foreground mb-6">
              If you're looking at a dealer's fee breakdown and something doesn't feel right, there are a few practical steps you can take before walking away or committing:
            </p>

            <ul className="space-y-2 mb-6 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span><strong className="text-foreground">Ask for the full OTD price in writing.</strong> This forces the dealer to show every charge in one place. If they resist, that's worth noting.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span><strong className="text-foreground">Compare at least two or three dealers.</strong> Get OTD quotes on the same vehicle from multiple dealerships. This gives you a baseline and makes it easy to spot a dealer who's charging significantly more.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span><strong className="text-foreground">Question any line item you don't recognize.</strong> If a fee isn't clearly sales tax, title, registration, or the doc fee, ask what it is and whether it's optional. The <a href="https://consumer.ftc.gov/articles/buying-new-car" target="_blank" rel="noopener" className="underline text-foreground">FTC's guide for new car buyers</a> outlines what dealers are required to disclose.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span><strong className="text-foreground">Negotiate the vehicle price if the doc fee is fixed.</strong> In some states and at some dealerships, the doc fee genuinely is the same for every customer. If that's the case, you can still negotiate the sale price of the vehicle down to offset a high fee.</span>
              </li>
            </ul>

            <p className="text-muted-foreground mb-4">
              Here's a message you can copy and send to any dealer before visiting. It asks for everything you need to compare deals:
            </p>

            <Card className="relative p-5 bg-muted/50 mb-4">
              <blockquote className="text-sm md:text-base text-foreground leading-relaxed italic pr-10">
                {FEE_REQUEST_MESSAGE}
              </blockquote>
              <Button
                variant="outline"
                size="icon"
                className="absolute top-3 right-3"
                onClick={handleCopy}
                data-testid="button-copy-fee-request-message"
                aria-label="Copy message"
              >
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </Card>

            <p className="text-muted-foreground mb-6">
              This works because it's specific and professional. You're asking for a clear, itemized total — which is exactly what any transparent dealer should be willing to provide.
            </p>

            <p className="text-lg text-muted-foreground mb-8">
              If you already have a dealer quote with fees that seem unusual, Odigos can analyze the full breakdown and flag anything that looks off.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">State-specific dealer fee guides</h2>

            <p className="text-lg text-muted-foreground mb-6">
              For state-by-state breakdowns covering doc fee ranges, local tax rates, cap status, and what buyers in each market should watch for:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-8">
              {Object.values(STATE_FEES)
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((state) => (
                  <Link
                    key={state.slug}
                    href={`/car-dealer-fees-${state.slug}`}
                    className="flex items-center gap-2 px-3 py-2 rounded-md border border-border hover:bg-muted/50 transition-colors text-sm text-foreground"
                    data-testid={`link-state-${state.slug}`}
                  >
                    <span className="text-muted-foreground text-xs font-mono w-6 shrink-0">{state.abbreviation}</span>
                    <span className="underline">{state.name}</span>
                    {state.hasCap && (
                      <span className="ml-auto text-xs text-green-600 dark:text-green-400 font-medium shrink-0">capped</span>
                    )}
                  </Link>
                ))}
            </div>
          </div>


          <ArticleCta />

          <p className="text-xs text-muted-foreground mt-12">
            Not affiliated with any dealership. Optimized for U.S. car purchases.
          </p>
    </ArticleLayout>
  );
}
