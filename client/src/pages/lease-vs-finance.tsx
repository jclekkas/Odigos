import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";
import { setSeoMeta } from "@/lib/seo";
import { articleSchema } from "@/lib/jsonld";
import ArticleLayout from "@/components/ArticleLayout";
import ArticleCta from "@/components/ArticleCta";

export default function LeaseVsFinance() {
  useEffect(() => {
    return setSeoMeta({
      title: "Lease vs. Finance: Which Is Better for You? | Odigos",
      description: "A detailed comparison of leasing versus financing a car. Understand total cost, monthly payments, ownership, mileage restrictions, insurance, tax implications, and which option fits your situation.",
      path: "/lease-vs-finance",
    });
  }, []);

  return (
    <ArticleLayout title="Lease vs. Finance">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(articleSchema({ title: "Lease vs. Finance: Which Is Better for You? | Odigos", description: "A detailed comparison of leasing versus financing a car. Understand total cost, monthly payments, ownership, mileage restrictions, insurance, tax implications, and which option fits your situation.", path: "/lease-vs-finance" }))}</script>
      </Helmet>
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 leading-[1.15]" data-testid="text-lease-vs-finance-headline">
        Lease vs. Finance: Which Is Better for You?
      </h1>

      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p className="text-lg text-muted-foreground mb-4">
          "Should I lease or finance?" is one of the most common questions car shoppers ask — and one of the most misunderstood. The right answer depends entirely on how you drive, how long you keep cars, and what you prioritize: lower monthly payments or long-term ownership value.
        </p>
        <p className="text-lg text-muted-foreground mb-10">
          This guide breaks down every meaningful difference between leasing and financing so you can make the decision with real numbers, not dealer talking points.
        </p>

        <p className="text-sm text-muted-foreground mb-6">
          Already have a dealer quote? <Link href="/analyze" className="underline text-foreground">Paste it here</Link> and see if anything looks off.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Total Cost Comparison</h2>
        <p className="text-muted-foreground mb-4">
          When you finance a car, you pay interest on the full purchase price — but at the end you own an asset worth real money. When you lease, your monthly payments cover only the vehicle's depreciation (plus the <Link href="/money-factor-explained" className="underline text-foreground">money factor</Link>, the lease equivalent of interest), but you own nothing at the end.
        </p>
        <p className="text-muted-foreground mb-4">
          Here's a simplified example for a $40,000 vehicle over 36 months:
        </p>
        <ul className="space-y-2 mb-4 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span><strong className="text-foreground">Lease:</strong> ~$450/month ($16,200 total). At lease-end you return the car and walk away. Net cost: $16,200.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span><strong className="text-foreground">Finance (60-month loan):</strong> ~$750/month ($45,000 total with interest). After 36 months you've paid $27,000 but still owe $18,000. However, the car may be worth $24,000 — giving you $6,000+ in equity.</span>
          </li>
        </ul>
        <p className="text-muted-foreground mb-8">
          If you keep financed cars for 7–10 years, financing almost always wins on total cost. If you switch cars every 2–3 years regardless, leasing is usually cheaper because you avoid the steepest depreciation hit that comes with selling or trading a 3-year-old financed vehicle.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Monthly Payment Differences</h2>
        <p className="text-muted-foreground mb-8">
          Lease payments are almost always lower — often 30–40% lower — than finance payments for the same vehicle. That's because you're only paying for the depreciation during the lease term, not the entire vehicle. On a $40,000 car with a 58% <Link href="/glossary/residual-value" className="underline text-foreground">residual value</Link>, you're only financing $16,800 of depreciation plus fees, rather than the full $40,000.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Key Differences at a Glance</h2>
        <div className="overflow-x-auto mb-8">
          <table className="w-full text-sm text-muted-foreground border border-border">
            <thead>
              <tr className="bg-muted/30">
                <th className="text-left p-3 font-semibold text-foreground border-b border-border">Factor</th>
                <th className="text-left p-3 font-semibold text-foreground border-b border-border">Lease</th>
                <th className="text-left p-3 font-semibold text-foreground border-b border-border">Finance</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="p-3 font-medium text-foreground">Monthly payment</td>
                <td className="p-3">Lower (pay depreciation only)</td>
                <td className="p-3">Higher (pay full vehicle cost)</td>
              </tr>
              <tr className="border-b border-border">
                <td className="p-3 font-medium text-foreground">Ownership at end</td>
                <td className="p-3">None — return the vehicle</td>
                <td className="p-3">You own it outright</td>
              </tr>
              <tr className="border-b border-border">
                <td className="p-3 font-medium text-foreground">Mileage limits</td>
                <td className="p-3">Yes — typically 10k–15k/year</td>
                <td className="p-3">None</td>
              </tr>
              <tr className="border-b border-border">
                <td className="p-3 font-medium text-foreground">Customization</td>
                <td className="p-3">Not allowed (must return as-is)</td>
                <td className="p-3">Do whatever you want</td>
              </tr>
              <tr className="border-b border-border">
                <td className="p-3 font-medium text-foreground">Insurance cost</td>
                <td className="p-3">Higher (lender requires more coverage)</td>
                <td className="p-3">Standard (your choice after payoff)</td>
              </tr>
              <tr className="border-b border-border">
                <td className="p-3 font-medium text-foreground">End-of-term cost</td>
                <td className="p-3">Disposition fee, possible wear charges</td>
                <td className="p-3">None — you own the car</td>
              </tr>
              <tr className="border-b border-border">
                <td className="p-3 font-medium text-foreground">Early exit</td>
                <td className="p-3">Expensive (early termination penalty)</td>
                <td className="p-3">Sell or trade anytime</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-foreground">Long-term cost</td>
                <td className="p-3">Higher if you always lease</td>
                <td className="p-3">Lower if you keep cars 5+ years</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Mileage Restrictions</h2>
        <p className="text-muted-foreground mb-8">
          Every lease comes with an annual mileage cap. Exceed it and you'll pay $0.15–$0.30 per excess mile at lease-end. If you drive 20,000 miles a year and lease with a 12,000-mile allowance, that's 24,000 excess miles over 36 months — a potential $4,800–$7,200 penalty. Financing has no mileage restrictions whatsoever. If you have a long commute or take frequent road trips, this alone may rule out leasing.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Insurance Requirements</h2>
        <p className="text-muted-foreground mb-8">
          Leasing companies require higher liability limits (typically 100/300/100 versus the state minimum) and require you to carry gap insurance, which covers the difference between the car's value and what you owe if it's totaled. Some leasing companies include gap coverage in the lease; others don't. These requirements can add $200–$600/year to your insurance premiums compared to financing with minimum coverage. After a financed car is paid off, you can drop to liability-only if you choose — not an option with a lease.
        </p>

        <div className="my-10 p-6 rounded-lg bg-muted/30 border border-border">
          <p className="text-sm font-semibold text-foreground mb-2">Comparing a lease quote to a finance offer?</p>
          <p className="text-sm text-muted-foreground mb-3">
            Paste your dealer quote into Odigos. We'll break down every fee and show you the true cost of the deal — whether it's a lease or a purchase.
          </p>
          <Link href="/analyze">
            <Button variant="cta" size="sm" data-testid="button-cta-mid-article-lease-vs-finance">
              Analyze My Quote
            </Button>
          </Link>
        </div>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Tax Implications</h2>
        <p className="text-muted-foreground mb-8">
          Sales tax treatment varies by state. In states like New York, New Jersey, and Texas, you pay sales tax only on the monthly lease payments — not the full vehicle price. This can save thousands compared to financing, where tax is calculated on the entire purchase price. In other states (like Virginia and Illinois), you pay tax on the full <Link href="/glossary/capitalized-cost" className="underline text-foreground">capitalized cost</Link> upfront regardless. Check your state's rules — the tax difference alone can shift the math meaningfully.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">End-of-Term Options</h2>
        <p className="text-muted-foreground mb-4">
          With a lease, you have three choices when the contract ends:
        </p>
        <ul className="space-y-2 mb-4 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span><strong className="text-foreground">Return it</strong> and pay any disposition fees or excess charges</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span><strong className="text-foreground">Buy it</strong> for the predetermined residual value (this is a great deal if the car is worth more than the residual)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span><strong className="text-foreground">Lease a new one</strong> — starting the cycle again</span>
          </li>
        </ul>
        <p className="text-muted-foreground mb-8">
          With financing, the car is yours once it's paid off. No fees, no inspections, no decisions — you just keep driving.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">When Leasing Makes Sense</h2>
        <ul className="space-y-2 mb-8 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span>You prefer driving a new car every 2–3 years and value having the latest features and warranty coverage</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span>You drive under 15,000 miles per year</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span>You want a lower monthly payment and can commit to taking good care of the vehicle</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span>You use the vehicle for business and can deduct lease payments (consult a tax professional)</span>
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">When Financing Makes Sense</h2>
        <ul className="space-y-2 mb-8 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span>You keep cars for 5+ years and want to maximize long-term value</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span>You drive more than 15,000 miles per year</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span>You want to customize or modify your vehicle</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span>You want to build equity and eventually have no car payment</span>
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">The Bottom Line</h2>
        <p className="text-muted-foreground mb-8">
          Neither leasing nor financing is universally "better." Leasing optimizes for lower short-term cost and flexibility; financing optimizes for long-term value and ownership. The worst financial decision is leasing when your driving habits don't support it — or financing a car you'll trade in three years later and absorb the depreciation hit. Know your patterns, run the numbers on both options, and make sure you understand every fee in either scenario. For a full breakdown of lease-specific costs, see our guide to <Link href="/car-lease-fees-explained" className="underline text-foreground">car lease fees explained</Link>.
        </p>
      </div>

      <ArticleCta />

      <p className="text-xs text-muted-foreground mt-12">
        Not affiliated with any dealership. Optimized for U.S. car leases.
      </p>
    </ArticleLayout>
  );
}
