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
  stateFeeData.states as unknown as Record<string, StateEntry>
).sort((a, b) => a.name.localeCompare(b.name));

function formatCapStatus(state: StateEntry): string {
  if (state.docFeeCap && state.docFeeCapAmount !== null) {
    return `Capped at $${state.docFeeCapAmount.toLocaleString()}`;
  }
  return "No cap";
}

function formatTypicalFee(state: StateEntry): string {
  if (state.docFeeCap && state.docFeeCapAmount !== null) {
    return `Up to $${state.docFeeCapAmount.toLocaleString()}`;
  }
  const [low, high] = state.docFeeTypicalRange;
  if (low === 0 && high === 0) return "Varies";
  if (low === 0) return `Up to $${high.toLocaleString()}`;
  if (low === high) return `~$${low.toLocaleString()}`;
  return `$${low.toLocaleString()}–$${high.toLocaleString()}`;
}

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
    <ArticleLayout title="Dealer Doc Fee by State: What Buyers Should Expect">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(itemListSchema({
          name: "Dealer Doc Fee by State",
          description: "Documentation fee ranges and caps by state — what dealers charge for paperwork across 30 states.",
          items: [
            { name: "Alabama dealer doc fee", url: "/dealer-doc-fee-by-state#alabama" },
            { name: "Arizona dealer doc fee", url: "/dealer-doc-fee-by-state#arizona" },
            { name: "California dealer doc fee", url: "/dealer-doc-fee-by-state#california" },
            { name: "Colorado dealer doc fee", url: "/dealer-doc-fee-by-state#colorado" },
            { name: "Connecticut dealer doc fee", url: "/dealer-doc-fee-by-state#connecticut" },
            { name: "Florida dealer doc fee", url: "/dealer-doc-fee-by-state#florida" },
            { name: "Georgia dealer doc fee", url: "/dealer-doc-fee-by-state#georgia" },
            { name: "Illinois dealer doc fee", url: "/dealer-doc-fee-by-state#illinois" },
            { name: "Indiana dealer doc fee", url: "/dealer-doc-fee-by-state#indiana" },
            { name: "Louisiana dealer doc fee", url: "/dealer-doc-fee-by-state#louisiana" },
            { name: "Maryland dealer doc fee", url: "/dealer-doc-fee-by-state#maryland" },
            { name: "Massachusetts dealer doc fee", url: "/dealer-doc-fee-by-state#massachusetts" },
            { name: "Michigan dealer doc fee", url: "/dealer-doc-fee-by-state#michigan" },
            { name: "Minnesota dealer doc fee", url: "/dealer-doc-fee-by-state#minnesota" },
            { name: "Missouri dealer doc fee", url: "/dealer-doc-fee-by-state#missouri" },
            { name: "Nevada dealer doc fee", url: "/dealer-doc-fee-by-state#nevada" },
            { name: "New Jersey dealer doc fee", url: "/dealer-doc-fee-by-state#new-jersey" },
            { name: "New York dealer doc fee", url: "/dealer-doc-fee-by-state#new-york" },
            { name: "North Carolina dealer doc fee", url: "/dealer-doc-fee-by-state#north-carolina" },
            { name: "Ohio dealer doc fee", url: "/dealer-doc-fee-by-state#ohio" },
            { name: "Oregon dealer doc fee", url: "/dealer-doc-fee-by-state#oregon" },
            { name: "Pennsylvania dealer doc fee", url: "/dealer-doc-fee-by-state#pennsylvania" },
            { name: "South Carolina dealer doc fee", url: "/dealer-doc-fee-by-state#south-carolina" },
            { name: "Tennessee dealer doc fee", url: "/dealer-doc-fee-by-state#tennessee" },
            { name: "Texas dealer doc fee", url: "/dealer-doc-fee-by-state#texas" },
            { name: "Utah dealer doc fee", url: "/dealer-doc-fee-by-state#utah" },
            { name: "Virginia dealer doc fee", url: "/dealer-doc-fee-by-state#virginia" },
            { name: "Washington dealer doc fee", url: "/dealer-doc-fee-by-state#washington" },
            { name: "Wisconsin dealer doc fee", url: "/dealer-doc-fee-by-state#wisconsin" },
            { name: "Wyoming dealer doc fee", url: "/dealer-doc-fee-by-state#wyoming" },
          ]
        }))}</script>
      </Helmet>
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
              The table below shows approximate documentation fee ranges for all 50 states and Washington D.C. Where a state caps the fee, the cap is noted. In uncapped states, the ranges reflect what buyers commonly report. Always verify current limits with your state's attorney general or motor vehicle agency.
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
                  {stateRows.map((state, idx) => (
                    <tr key={state.abbreviation} className={idx < stateRows.length - 1 ? "border-b border-border/50" : ""} data-testid={`row-doc-fee-${state.abbreviation}`}>
                      <td className="px-4 py-2">{state.name}</td>
                      <td className="px-4 py-2">{formatCapStatus(state)}</td>
                      <td className="px-4 py-2">{formatTypicalFee(state)}</td>
                    </tr>
                  ))}
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

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">State-by-state dealer fee guides</h2>

            <p className="text-lg text-muted-foreground mb-6">
              For full breakdowns of doc fees, local tax rates, and what to watch for in each state:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-8">
              {Object.values(STATE_FEES)
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((state) => (
                  <Link
                    key={state.slug}
                    href={`/car-dealer-fees-${state.slug}`}
                    className="flex items-center gap-2 px-3 py-2 rounded-md border border-border hover:bg-muted/50 transition-colors text-sm text-foreground"
                    data-testid={`link-state-guide-${state.slug}`}
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
