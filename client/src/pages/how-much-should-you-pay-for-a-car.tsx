import { useEffect } from "react";
import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { setSeoMeta } from "@/lib/seo";
import { articleSchema } from "@/lib/jsonld";
import ArticleLayout from "@/components/ArticleLayout";
import ArticleCta from "@/components/ArticleCta";
import SourceCitation from "@/components/SourceCitation";
import { ARTICLE_SOURCES } from "@/data/articleSources";

export default function HowMuchShouldYouPayForACar() {
  useEffect(() => {
    setSeoMeta({
      title: "How Much Should You Pay for a Car? Fair Price, OTD & Financing | Odigos",
      description: "A fair car price isn't the sticker — it's the OTD total. Learn what MSRP, invoice, and market value actually mean, and how to evaluate the real cost including financing.",
      path: "/how-much-should-you-pay-for-a-car",
    });
  }, []);

  return (
    <ArticleLayout title="How Much Should You Pay for a Car?">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(articleSchema({ title: "How Much Should You Pay for a Car? Fair Price, OTD & Financing | Odigos", description: "A fair car price isn't the sticker — it's the OTD total. Learn what MSRP, invoice, and market value actually mean, and how to evaluate the real cost including financing.", path: "/how-much-should-you-pay-for-a-car" }))}</script>
      </Helmet>
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 leading-tight" data-testid="text-how-much-headline">
        How Much Should You Pay for a Car? It's the OTD Total, Not the Sticker
      </h1>

      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p className="text-lg text-muted-foreground">
          A fair price for a car is not the MSRP, not the invoice price, and not the monthly payment. It's the out-the-door total — every dollar you pay to leave the lot with the vehicle. Until you know that number, you don't know what the deal actually costs.{" "}<SourceCitation sources={ARTICLE_SOURCES["what-is-a-fair-price-for-a-car"].sources} lastVerified={ARTICLE_SOURCES["what-is-a-fair-price-for-a-car"].lastVerified} />
        </p>

        <p className="text-lg text-muted-foreground">
          The challenge is that most buyer conversations, and most dealer quotes, focus on prices that leave things out. Here's what each number actually means and why only one of them matters.
        </p>

        <h2 className="text-2xl font-semibold text-foreground">The four prices you'll hear — and what they actually mean</h2>

        <div className="space-y-6 mb-8">
          <div>
            <p className="font-semibold text-foreground mb-2">MSRP (Manufacturer's Suggested Retail Price)</p>
            <p className="text-muted-foreground">The sticker price. It's a starting point for negotiation, not a measure of fairness. Depending on market conditions, vehicles sell above or below MSRP. MSRP excludes taxes, registration, doc fees, and add-ons — none of which are small numbers.</p>
          </div>
          <div>
            <p className="font-semibold text-foreground mb-2">Invoice price</p>
            <p className="text-muted-foreground">What the dealer nominally paid the manufacturer. Often cited by buyers as "the real price" — but it's not the floor. Dealers receive holdbacks, rebates, and incentive payments from manufacturers that aren't reflected in the invoice. Invoice is a useful data point for negotiation, not a reliable cost baseline.</p>
          </div>
          <div>
            <p className="font-semibold text-foreground mb-2">Market value</p>
            <p className="text-muted-foreground">What comparable vehicles are actually selling for in your area. Sites like <a href="https://www.kbb.com/car-values/" target="_blank" rel="noopener" className="underline text-foreground">KBB</a>, <a href="https://www.edmunds.com/car-buying/what-fees-should-you-pay-at-a-car-dealership.html" target="_blank" rel="noopener" className="underline text-foreground">Edmunds</a>, and <a href="https://www.cargurus.com/Cars/new/nl-New-Cars-d0" target="_blank" rel="noopener" className="underline text-foreground">CarGurus</a> publish transaction data. During high-demand periods, market value can be above MSRP. During slower periods, it may be below invoice. Market value tells you whether the vehicle price is competitive — but still not the full cost.</p>
          </div>
          <div>
            <p className="font-semibold text-foreground mb-2">Out-the-door (OTD) price</p>
            <p className="text-muted-foreground">The only number that reflects what you actually pay. It includes everything: vehicle price, sales tax, title, registration, doc fee, and any dealer add-ons. This is the only number that's meaningful for comparing two deals on the same vehicle. See <Link href="/what-does-out-the-door-price-include" className="underline text-foreground">what the out-the-door price includes</Link> for a full breakdown of every line item.</p>
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-foreground">How a $32,000 MSRP becomes $37,500 OTD</h2>

        <p className="text-lg text-muted-foreground">
          Here's a realistic example of how a vehicle price translates to an out-the-door total:
        </p>

        <div className="rounded-lg border border-border bg-muted/30 p-5 mb-6 overflow-x-auto">
          <table className="w-full text-sm" data-testid="table-otd-breakdown">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-4 font-semibold text-foreground">Line item</th>
                <th className="text-right py-2 font-semibold text-foreground">Amount</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b border-border/50">
                <td className="py-2 pr-4">Vehicle price (negotiated from $32,000 MSRP)</td>
                <td className="py-2 text-right">$31,200</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-2 pr-4">Market adjustment</td>
                <td className="py-2 text-right">$1,500</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-2 pr-4">Documentation fee</td>
                <td className="py-2 text-right">$699</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-2 pr-4">Paint protection package</td>
                <td className="py-2 text-right">$995</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-2 pr-4">Sales tax (8.5% on $34,394)</td>
                <td className="py-2 text-right">$2,923</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-2 pr-4">Title and registration</td>
                <td className="py-2 text-right">$310</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-semibold text-foreground">Out-the-door total</td>
                <td className="py-2 text-right font-semibold text-foreground">$37,627</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-lg text-muted-foreground">
          The gap between MSRP and OTD is $5,627 in this example — an 18% increase. That's not unusual. Two things worth scrutinizing:
        </p>
        <ul className="space-y-2 mb-6 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span>•</span>
            <span><strong className="text-foreground">The $1,500 market adjustment</strong> is a dealer markup above MSRP. It's not a government fee — it's a business decision. In competitive markets or on common models, this is often negotiable.</span>
          </li>
          <li className="flex items-start gap-2">
            <span>•</span>
            <span><strong className="text-foreground">The $995 paint protection package</strong> is a dealer add-on. It may or may not be worth keeping — but you should make that decision knowingly. <Link href="/are-dealer-add-ons-mandatory" className="underline text-foreground">These add-ons are not mandatory</Link>, even when presented as such.</span>
          </li>
        </ul>

        <h2 className="text-2xl font-semibold text-foreground">What "fair" actually means for each line item</h2>

        <p className="text-lg text-muted-foreground">
          Fairness isn't uniform across the OTD breakdown. Some parts are fixed, some are market-driven, and some are entirely negotiable:
        </p>

        <ul className="space-y-4 mb-8 text-muted-foreground">
          <li className="flex items-start gap-3">
            <span className="shrink-0 font-semibold text-foreground">Vehicle price:</span>
            <span>Negotiable. The benchmark is market value for that specific vehicle in your area. Dealers sometimes add a <Link href="/market-adjustment-fee" className="underline text-foreground">market adjustment</Link> on top of MSRP during high-demand periods; this is a dealer markup, not a fixed cost.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="shrink-0 font-semibold text-foreground">Doc fee:</span>
            <span>Dealer-controlled but bounded by norms. Some states cap it (California: ~$85). In uncapped states, $200–$400 is typical; $700–$999 is at the high end. See <Link href="/hidden-dealer-fees" className="underline text-foreground">common hidden dealer fees</Link> for context on what's normal.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="shrink-0 font-semibold text-foreground">Taxes, title, registration:</span>
            <span>Fixed by your state and county. These aren't negotiable and don't vary between dealers — if one dealer quotes a lower tax, the math is likely wrong. The <a href="https://consumer.ftc.gov/articles/buying-new-car" target="_blank" rel="noopener" className="underline text-foreground">FTC's guide for new car buyers</a> explains which charges are required versus dealer-set.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="shrink-0 font-semibold text-foreground">Add-ons:</span>
            <span>Entirely negotiable. There's no such thing as a "fair" add-on price — these are dealer profit centers with flexible margins. The fair price for an add-on you don't want is zero.</span>
          </li>
        </ul>

        <div className="rounded-lg border border-border bg-muted/30 p-5 mb-8">
          <p className="text-sm font-medium text-foreground mb-2">Odigos checks whether your quote is in line with a fair all-in price</p>
          <p className="text-sm text-muted-foreground">
            <Link href="/analyze" className="underline text-foreground">Paste your dealer quote</Link> and Odigos flags fees that look inflated, add-ons that seem overpriced, and information that's missing from the total. No signup required.
          </p>
        </div>

        <h2 className="text-2xl font-semibold text-foreground">OTD price is the deal — financing is separate</h2>

        <p className="text-lg text-muted-foreground">
          The question most buyers ask is: what's a reasonable monthly payment? That's the wrong question. Monthly payment is a variable that dealers adjust by changing the loan term and interest rate — it can be made to look almost anything. The right questions are: what is the out-the-door price, and what is the total loan cost?
        </p>

        <p className="text-lg text-muted-foreground">
          The <Link href="/out-the-door-price" className="underline text-foreground">out-the-door price</Link> reflects the deal you're agreeing to before financing enters the picture. Two dealers quoting the same vehicle can have very different OTD prices based on fees and add-ons. If you're financing, the total loan cost — monthly payment times number of payments — is what you actually pay over the life of the loan. A deal with a lower OTD at a higher APR can cost more total than a deal with a higher OTD at a lower APR and shorter term.
        </p>

        <h2 className="text-2xl font-semibold text-foreground">The same car — two different total costs</h2>

        <div className="rounded-lg border border-border bg-muted/30 p-5 mb-6 overflow-x-auto">
          <table className="w-full text-sm" data-testid="table-loan-comparison">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-4 font-semibold text-foreground">Scenario</th>
                <th className="text-right py-2 pr-4 font-semibold text-foreground">OTD price</th>
                <th className="text-right py-2 pr-4 font-semibold text-foreground">Down</th>
                <th className="text-right py-2 pr-4 font-semibold text-foreground">APR</th>
                <th className="text-right py-2 pr-4 font-semibold text-foreground">Term</th>
                <th className="text-right py-2 pr-4 font-semibold text-foreground">Monthly</th>
                <th className="text-right py-2 font-semibold text-foreground">Total paid</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b border-border/50">
                <td className="py-2 pr-4 text-foreground font-medium">A — shorter term</td>
                <td className="py-2 pr-4 text-right">$35,000</td>
                <td className="py-2 pr-4 text-right">$3,000</td>
                <td className="py-2 pr-4 text-right">5.9%</td>
                <td className="py-2 pr-4 text-right">48 mo</td>
                <td className="py-2 pr-4 text-right">$759</td>
                <td className="py-2 text-right">$39,432</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 text-foreground font-medium">B — longer term</td>
                <td className="py-2 pr-4 text-right">$35,000</td>
                <td className="py-2 pr-4 text-right">$3,000</td>
                <td className="py-2 pr-4 text-right">7.4%</td>
                <td className="py-2 pr-4 text-right">72 mo</td>
                <td className="py-2 pr-4 text-right">$556</td>
                <td className="py-2 text-right">$43,032</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-lg text-muted-foreground">
          Scenario B has a monthly payment $203 lower than Scenario A. But over the life of the loan, Scenario B costs $3,600 more and takes two extra years. The <Link href="/monthly-payment-trap" className="underline text-foreground">monthly payment trap</Link> is one of the most documented tactics in car sales. Keep conversations on the OTD price until that number is agreed upon, then discuss financing separately.
        </p>

        <ul className="space-y-2 mb-6 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span>•</span>
            <span><strong className="text-foreground">Dealer financing is not always the best rate.</strong> Getting a pre-approval from your bank or credit union before visiting gives you a rate to compare against.</span>
          </li>
          <li className="flex items-start gap-2">
            <span>•</span>
            <span><strong className="text-foreground">0% financing offers are sometimes offset elsewhere.</strong> A manufacturer offering 0% APR may be excluding other incentives (like a cash rebate). Run both scenarios.</span>
          </li>
          <li className="flex items-start gap-2">
            <span>•</span>
            <span><strong className="text-foreground">Extended terms reduce your equity.</strong> On a 72-month loan, you're likely underwater for the first 2–3 years — meaning you owe more than it's worth.</span>
          </li>
        </ul>

        <h2 className="text-2xl font-semibold text-foreground">How to evaluate a quote correctly</h2>

        <ul className="space-y-2 mb-6 text-muted-foreground">
          <li className="flex items-start gap-2"><span>•</span><span>Start with the OTD price — not the monthly payment.</span></li>
          <li className="flex items-start gap-2"><span>•</span><span>Verify that fees are itemized and reasonable for your state. See <Link href="/are-dealer-fees-negotiable" className="underline text-foreground">which dealer fees are negotiable</Link> for context.</span></li>
          <li className="flex items-start gap-2"><span>•</span><span>Identify every add-on by name and price. Remove or negotiate the ones you don't want. See <Link href="/are-dealer-add-ons-mandatory" className="underline text-foreground">whether dealer add-ons are mandatory</Link> — most are not.</span></li>
          <li className="flex items-start gap-2"><span>•</span><span>Once OTD is agreed, compare APR offers — your bank vs the dealer — and calculate total loan cost for each.</span></li>
          <li className="flex items-start gap-2"><span>•</span><span>Compare deals OTD-to-OTD. See <Link href="/how-to-compare-car-deals" className="underline text-foreground">how to compare car deals</Link> for a side-by-side framework.</span></li>
        </ul>

        <h2 className="text-2xl font-semibold text-foreground">What to say to the dealer</h2>

        <p className="text-muted-foreground italic border-l-2 border-border pl-4">
          "Before we go further, can you send me a full out-the-door price with each line item listed separately — vehicle price, all fees, any add-ons, and estimated taxes? I'd like to compare it to another quote I have."
        </p>

        <p className="text-lg text-muted-foreground mt-4">
          Mentioning a competing quote — real or prospective — signals that you're a buyer who will comparison shop. Dealers are more likely to provide transparent numbers when they know you're evaluating alternatives.
        </p>
      </div>

      <ArticleCta />

      <p className="text-xs text-muted-foreground mt-12">
        Not affiliated with any dealership. Optimized for U.S. car purchases.
      </p>
    </ArticleLayout>
  );
}
