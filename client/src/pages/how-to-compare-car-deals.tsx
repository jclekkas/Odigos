import { useEffect } from "react";
import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { setSeoMeta } from "@/lib/seo";
import { articleSchema } from "@/lib/jsonld";
import ArticleLayout from "@/components/ArticleLayout";
import ArticleCta from "@/components/ArticleCta";

export default function HowToCompareCarDeals() {
  useEffect(() => {
    setSeoMeta({
      title: "How to Compare Car Deals Side by Side (OTD to OTD) | Odigos",
      description: "Compare car deals the right way by focusing on OTD price, not monthly payments, so you can avoid misleading financing tactics.",
      path: "/how-to-compare-car-deals",
    });
  }, []);

  return (
    <ArticleLayout title="How to Compare Car Deals">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(articleSchema({ title: "How to Compare Car Deals Side by Side (OTD to OTD) | Odigos", description: "Compare car deals the right way by focusing on OTD price, not monthly payments, so you can avoid misleading financing tactics.", path: "/how-to-compare-car-deals" }))}</script>
      </Helmet>
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 leading-tight" data-testid="text-compare-deals-headline">
        How to Compare Car Deals the Right Way: OTD Price to OTD Price
      </h1>

      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p className="text-lg text-muted-foreground">
          The only valid way to compare two car deals is out-the-door price to out-the-door price. Comparing vehicle prices alone, or monthly payments, gives you an incomplete — and often misleading — picture of which deal is actually better.
        </p>

        <p className="text-lg text-muted-foreground">
          Dealers know this. A quote with a lower vehicle price may still cost more once fees and add-ons are factored in. Here's how to set up a real comparison.
        </p>

        <h2 className="text-2xl font-semibold text-foreground">Why vehicle price comparisons fail</h2>

        <p className="text-lg text-muted-foreground">
          When you tell two dealers you're shopping around, they'll often compete on vehicle price. Dealer A drops to $30,900. Dealer B quotes $31,200. Without seeing the full OTD breakdown, Dealer A looks like the better deal.
        </p>

        <p className="text-lg text-muted-foreground">
          But vehicle price is only part of what you pay. If Dealer A has a $1,500 market adjustment, a $799 doc fee, and a $995 paint protection package bundled in, the "lower" price disappears quickly. That's the problem with comparing on vehicle price alone.
        </p>

        <h2 className="text-2xl font-semibold text-foreground">The same car — two very different deals</h2>

        <p className="text-lg text-muted-foreground">
          Here's a side-by-side comparison of two quotes for the same vehicle at the same MSRP:
        </p>

        <div className="rounded-lg border border-border bg-muted/30 p-5 mb-6 overflow-x-auto">
          <table className="w-full text-sm" data-testid="table-quote-comparison">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-4 font-semibold text-foreground">Line item</th>
                <th className="text-right py-2 pr-4 font-semibold text-foreground">Quote A</th>
                <th className="text-right py-2 font-semibold text-foreground">Quote B</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b border-border/50">
                <td className="py-2 pr-4">Vehicle price</td>
                <td className="py-2 pr-4 text-right">$31,500</td>
                <td className="py-2 text-right">$30,900</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-2 pr-4">Market adjustment</td>
                <td className="py-2 pr-4 text-right">$0</td>
                <td className="py-2 text-right">$1,500</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-2 pr-4">Documentation fee</td>
                <td className="py-2 pr-4 text-right">$299</td>
                <td className="py-2 text-right">$799</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-2 pr-4">Paint protection package</td>
                <td className="py-2 pr-4 text-right">$0</td>
                <td className="py-2 text-right">$995</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-2 pr-4">Nitrogen-filled tires</td>
                <td className="py-2 pr-4 text-right">$0</td>
                <td className="py-2 text-right">$199</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-2 pr-4">Sales tax (8%)</td>
                <td className="py-2 pr-4 text-right">$2,544</td>
                <td className="py-2 text-right">$2,751</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-2 pr-4">Title and registration</td>
                <td className="py-2 pr-4 text-right">$285</td>
                <td className="py-2 text-right">$285</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-semibold text-foreground">Out-the-door total</td>
                <td className="py-2 pr-4 text-right font-semibold text-foreground">$34,628</td>
                <td className="py-2 text-right font-semibold text-foreground">$37,429</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-lg text-muted-foreground">
          Quote B has the lower vehicle price by $600 — but costs $2,801 more out the door. The difference comes from a market adjustment, a higher doc fee, and two add-ons that weren't in Quote A. If you compared these two deals on vehicle price alone, you'd have chosen the more expensive one.
        </p>

        <p className="text-lg text-muted-foreground">
          Note also that sales tax is higher on Quote B — because tax is calculated on the subtotal, which includes the add-ons and adjustment. The <Link href="/out-the-door-price-example" className="underline text-foreground">out-the-door price example</Link> walks through this math in more detail.
        </p>

        <div className="rounded-lg border border-border bg-muted/30 p-5 mb-8">
          <p className="text-sm font-medium text-foreground mb-2">Paste both quotes into Odigos</p>
          <p className="text-sm text-muted-foreground">
            <Link href="/analyze" className="underline text-foreground">Odigos breaks down each quote</Link> — flagging hidden fees, identifying add-ons, and giving you a clear breakdown of each. Results take about a minute. No signup required.
          </p>
        </div>

        <h2 className="text-2xl font-semibold text-foreground">How to request a comparable quote from a second dealer</h2>

        <p className="text-lg text-muted-foreground">
          To get quotes you can actually compare, ask both dealers for the same format:
        </p>

        <p className="text-muted-foreground italic border-l-2 border-border pl-4">
          "Can you send me a full out-the-door price with each line item listed separately? I need vehicle price, all dealer fees, any installed accessories or add-ons listed individually, estimated taxes, and title/registration. I'm comparing it to another quote in the same format."
        </p>

        <p className="text-lg text-muted-foreground">
          If a dealer won't provide this in writing, that's a signal. A transparent dealer should be able to produce a line-item OTD quote quickly. If they resist or redirect to monthly payment, see <Link href="/dealer-wont-give-otd-price" className="underline text-foreground">why dealers avoid giving OTD prices</Link>.
        </p>

        <h2 className="text-2xl font-semibold text-foreground">What to line up when comparing quotes</h2>

        <ul className="space-y-3 mb-6 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground">•</span>
            <span><strong className="text-foreground">Vehicle price (before add-ons and fees)</strong> — this is your starting negotiation anchor. Market adjustments are dealer markups added here.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground">•</span>
            <span><strong className="text-foreground">Doc fee</strong> — should be similar for both dealers in the same state, since norms are geographic. A large discrepancy is worth questioning. See <Link href="/dealer-doc-fee" className="underline text-foreground">what a dealer doc fee is</Link>.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground">•</span>
            <span><strong className="text-foreground">Add-ons</strong> — list them out and compare. If Dealer A has none and Dealer B has three, that's a real cost difference. <Link href="/are-dealer-add-ons-mandatory" className="underline text-foreground">Add-ons are not mandatory</Link> — you can ask Dealer B to remove them or reduce the price by their cost.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground">•</span>
            <span><strong className="text-foreground">Taxes, title, registration</strong> — these should be nearly identical if both dealers are in the same county. Significant differences in tax are a red flag (the calculation may be wrong, or something is being hidden).</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground">•</span>
            <span><strong className="text-foreground">OTD total</strong> — the bottom line. This is the number you take to the better dealer and use as leverage with the worse one.</span>
          </li>
        </ul>

        <h2 className="text-2xl font-semibold text-foreground">Using the comparison as leverage</h2>

        <p className="text-lg text-muted-foreground">
          Once you have two OTD quotes for the same vehicle, you're in a legitimate negotiating position. Take the lower quote to the higher-priced dealer. You don't need to reveal exactly what the other dealer quoted — you can simply say you have a competing OTD price and ask if they can match or beat it.
        </p>

        <p className="text-lg text-muted-foreground">
          Some dealers will match. Others won't. Either outcome is useful — if the lower-OTD dealer genuinely is the better deal, you should go with them. For guidance on the full evaluation process, see <Link href="/is-this-a-good-car-deal" className="underline text-foreground">how to assess whether a car deal is actually good</Link>. If a dealer uses inflated pricing or high-pressure tactics during this process, see <Link href="/dealer-pricing-tactics" className="underline text-foreground">common dealer pricing tactics</Link> for what to watch for.
        </p>
      </div>

      <ArticleCta />

      <p className="text-xs text-muted-foreground mt-12">
        Not affiliated with any dealership. Optimized for U.S. car purchases.
      </p>
    </ArticleLayout>
  );
}
