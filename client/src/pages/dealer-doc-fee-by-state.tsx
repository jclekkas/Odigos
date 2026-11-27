import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Copy } from "lucide-react";
import { setSeoMeta } from "@/lib/seo";
import { itemListSchema } from "@/lib/jsonld";
import ArticleLayout from "@/components/ArticleLayout";
import SourceCitation from "@/components/SourceCitation";
import stateFeeData from "@dataset/state_fees.json";
import { STATE_FEES } from "@/data/stateFees";
import { publicDocFeeClaim, type FeeStateRecord } from "@shared/docFeePublicCopy";

const stateRows: FeeStateRecord[] = Object.values(
  stateFeeData.states as unknown as Record<string, FeeStateRecord>
).sort((a, b) => a.name.localeCompare(b.name));

const DOC_FEE_REQUEST_MESSAGE = `Hi — I'm comparing offers from a few dealerships. Before I come in, could you send me an itemized out-the-door price that breaks out the documentation fee as its own line? I'd also like to see taxes, title, and registration listed separately. Thanks.`;

export default function DealerDocFeeByState() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setSeoMeta({
      title: "Dealer Doc Fee by State (2026): Verified Caps and Unverified Ranges",
      description: "See which documentation-fee caps Odigos has verified, including California's $70 / $85 DMV-partner split. Reported ranges are not a market standard.",
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
    <ArticleLayout title="Dealer Doc Fee by State (2026): Verified Caps and Unverified Ranges">
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
            Dealer Doc Fee by State (2026): Verified Caps and Unverified Ranges
          </h1>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-lg text-muted-foreground">
              Dealer documentation fees vary by state. Some states have a citation in Odigos's source file for a legal maximum. Others do not. A stored range is not a market standard, and a figure marked as needing a source is not a legal cap.
            </p>
            <p className="text-lg text-muted-foreground">
              Understanding whether your state has a cap is the first step in evaluating your deal.
            </p>

            <div className="rounded-lg border border-blue-600/20 bg-blue-600/5 p-5 mb-8">
              <p className="text-base font-semibold text-foreground mb-2">
                Looking up your state? Paste the quote and Odigos checks the math, the line items, and any verified cap. It does not treat an unverified range as a violation.
              </p>
              <Button asChild variant="cta" className="font-semibold">
                <Link href="/analyze">Check This Quote</Link>
              </Button>
            </div>

            <h2 className="text-2xl font-semibold text-foreground">Why doc fees vary so much</h2>

            <p className="text-lg text-muted-foreground">
              Some states publish a documentation-fee ceiling that Odigos has checked against a statute or agency page. In those states the ceiling is a real limit, and California's is a split: $85 only for a DMV private industry partner, and $70 otherwise. Where the source file has no verified cap, the dealer still sets a number, but this guide will not call that number legal or illegal.
            </p>

            <p className="text-lg text-muted-foreground">
              Where no cap is verified, dealers still choose the fee. A high-volume store in a competitive area may keep it lower. Another store may charge more. The paperwork — contracts, title, registration — is similar either way. Compare the full out-the-door price, not one line that this file has not verified.
            </p>

            <p className="text-lg text-muted-foreground">
              For a deeper look at what the doc fee actually covers and whether you can negotiate it, see our guide on the <Link href="/dealer-doc-fee" className="underline text-foreground">dealer documentation fee</Link>. The doc fee is just one component of many — for the full picture of what goes into a dealer quote, see <Link href="/what-does-out-the-door-price-include" className="underline text-foreground">what OTD includes</Link>.
            </p>

            <h2 className="text-2xl font-semibold text-foreground">Doc fee ranges by state</h2>

            <p className="text-muted-foreground">
              The table covers all 50 states and Washington, D.C. A ceiling is labeled verified only when the source file has a citation and does not mark the amount as needing a source. Reported ranges are not verified market averages. Confirm a figure with your state before you rely on it.
            </p>

            <div className="overflow-x-auto mb-4">
              <table className="w-full text-sm text-left border border-border" data-testid="table-doc-fee-by-state">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="px-4 py-3 font-semibold text-foreground border-b border-border">State</th>
                    <th className="px-4 py-3 font-semibold text-foreground border-b border-border">Cap on file</th>
                    <th className="px-4 py-3 font-semibold text-foreground border-b border-border">Reported range</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  {stateRows.map((state, idx) => {
                    const claim = publicDocFeeClaim(state);
                    return (
                    <tr key={state.abbreviation} className={idx < stateRows.length - 1 ? "border-b border-border/50" : ""} data-testid={`row-doc-fee-${state.abbreviation}`}>
                      <td className="px-4 py-2">{state.name}</td>
                      <td className="px-4 py-2">{claim.capCell}</td>
                      <td className="px-4 py-2">{claim.rangeCell}</td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <p className="text-sm text-muted-foreground mb-6 italic">
              Reported ranges are not verified market averages. A stored cap is a legal limit only when this table says it is verified. Caps change — confirm them with your state before you rely on a number.{" "}
              <SourceCitation
                sources={[
                  "https://consumer.ftc.gov/articles/buying-new-car",
                  "https://caredge.com/guides/car-dealer-doc-fee-by-state",
                ]}
                lastVerified="2026-03"
              />
            </p>

            <div className="my-10 p-6 rounded-lg bg-muted/30 border border-border">
              <p className="text-sm font-semibold text-foreground mb-2">Only some states have a documentation-fee cap this file has verified. Everywhere else, compare itemized out-the-door quotes instead of treating a reported range as the going rate.</p>
              <Link href="/analyze">
                <Button variant="cta" size="sm">
                  Check the quote math
                </Button>
              </Link>
            </div>

            <h2 className="text-2xl font-semibold text-foreground">What if your doc fee seems too high?</h2>

            <p className="text-lg text-muted-foreground">
              A documentation fee above a reported range is worth a question. It is not automatically illegal, and the range itself is not verified. Some dealers charge more for the fee and less for the vehicle. What matters is the total <Link href="/out-the-door-price" className="underline text-foreground">out-the-door price</Link>, plus whether a verified cap was exceeded.
            </p>

            <p className="text-lg text-muted-foreground">
              Ask the dealer to itemize the fee. If two nearby quotes for the same paperwork differ by hundreds of dollars, that difference belongs in the out-the-door comparison. This file does not turn that gap into a verified market average.
            </p>

            <p className="text-lg text-muted-foreground">
              For specific tactics on what to say and what to watch for, see our guide on <Link href="/doc-fee-too-high" className="underline text-foreground">what to do when a doc fee is too high</Link>.
            </p>

            <h2 className="text-2xl font-semibold text-foreground">What to say to the dealer</h2>

            <p className="text-muted-foreground">
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

            <p className="text-muted-foreground">
              This works because it's specific without being confrontational. You're asking the dealer to itemize the doc fee so you can compare it against what's typical in your state.
            </p>

            <h2 className="text-2xl font-semibold text-foreground">How to compare dealers on doc fees</h2>

            <p className="text-lg text-muted-foreground">
              Comparing doc fees across dealers is useful, but it only tells part of the story. A dealer with a $200 doc fee and a $500 higher vehicle price isn't actually cheaper than a dealer with a $600 doc fee and a lower base price. The right comparison is always the total out-the-door number.
            </p>

            <p className="text-lg text-muted-foreground">
              When shopping across state lines, the documentation fee is only one line. California allows $85 only for a DMV private industry partner and $70 otherwise. A lower fee can still lose to a higher vehicle price or a higher tax. Compare the full out-the-door price.
            </p>

            <p className="text-lg text-muted-foreground">
              For a broader view of all the fees that show up on a car deal — not just doc fees — see our guide on <Link href="/car-dealer-fees-by-state" className="underline text-foreground">car dealer fees by state</Link>. You can also review the <a href="https://consumer.ftc.gov/articles/buying-new-car" target="_blank" rel="noopener" className="underline text-foreground">FTC's guide for car buyers</a> for details on what dealers must disclose.
            </p>

            <p className="text-lg text-muted-foreground">
              If you already have a dealer quote, Odigos checks whether the documentation fee is itemized, whether the total reconciles, and whether it exceeds a verified cap. An unverified range is not a violation.
            </p>

            <h2 className="text-2xl font-semibold text-foreground">State-by-state dealer fee guides</h2>

            <p className="text-lg text-muted-foreground">
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
                      <span className="ml-auto text-xs text-green-600 dark:text-green-400 font-medium shrink-0">verified cap</span>
                    )}
                  </Link>
                ))}
            </div>
          </div>


          <div className="rounded-xl border border-border bg-muted/30 p-6 mt-12">
            <p className="text-sm text-muted-foreground leading-relaxed">
              A verified cap is one check. Paste the quote and Odigos also checks whether the charges are itemized and whether the total reconciles. It does not estimate a fair vehicle price, and it does not treat an unverified fee as a legal limit.
            </p>
            <Link href="/analyze">
              <Button variant="cta" size="lg">
                Check This Quote
              </Button>
            </Link>
          </div>

          <p className="text-xs text-muted-foreground mt-12">
            Not affiliated with any dealership. Optimized for U.S. car purchases.
          </p>
    </ArticleLayout>
  );
}
