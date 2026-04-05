import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";
import { setSeoMeta } from "@/lib/seo";
import { articleSchema } from "@/lib/jsonld";
import ArticleLayout from "@/components/ArticleLayout";
import ArticleCta from "@/components/ArticleCta";

export default function LeaseEndOptions() {
  useEffect(() => {
    return setSeoMeta({
      title: "Lease End Options: Return, Buy, or Extend Your Lease | Odigos",
      description: "Your car lease is ending. Learn your 5 options — return, buy, extend, transfer, or early termination — and which makes the most financial sense.",
      path: "/lease-end-options",
    });
  }, []);

  return (
    <ArticleLayout title="Lease End Options">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(articleSchema({ title: "Lease End Options: Return, Buy, or Extend Your Lease | Odigos", description: "Your car lease is ending. Learn your 5 options and which makes the most financial sense.", path: "/lease-end-options" }))}</script>
      </Helmet>
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 leading-[1.15]" data-testid="text-lease-end-headline">
        Lease End Options: Return, Buy, or Extend?
      </h1>

      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p className="text-lg text-muted-foreground mb-4">
          When your car lease ends, you have more options than most people realize. The right choice depends on the vehicle's current market value relative to your residual value, your mileage situation, and your next vehicle plans.
        </p>
        <p className="text-lg text-muted-foreground mb-10">
          This guide covers every option available at lease end, including the costs and considerations for each.
        </p>

        <p className="text-sm text-muted-foreground mb-6">
          Have a lease-end quote or buyout offer? <Link href="/analyze" className="underline text-foreground">Paste it here</Link> and we'll help you evaluate it.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Option 1: Return the Vehicle</h2>
        <p className="text-muted-foreground mb-4">
          The simplest option — turn in the keys and walk away. But expect these potential costs:
        </p>
        <ul className="space-y-2 mb-4 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span><strong><Link href="/glossary/disposition-fee" className="underline text-foreground">Disposition fee</Link></strong>: $300-$500, charged by the leasing company for processing the return. Waived if you lease another vehicle from the same brand.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span><strong>Excess mileage charges</strong>: If you exceeded your annual mileage allowance, you'll pay $0.15-$0.30 per mile over the limit. On a 36-month/36,000-mile lease, every 1,000 miles over costs $150-$300.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span><strong><Link href="/glossary/excess-wear-and-tear" className="underline text-foreground">Excess wear and tear</Link></strong>: Dents, scratches, interior damage, and tire wear below minimum tread can trigger charges from $100 to several thousand dollars.</span>
          </li>
        </ul>
        <p className="text-muted-foreground mb-8">
          <strong>Pro tip</strong>: Schedule a pre-inspection 30-60 days before lease end (most manufacturers offer this free). It gives you time to fix damage independently, which is almost always cheaper than the leasing company's charges.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Option 2: Buy the Vehicle (Lease Buyout)</h2>
        <p className="text-muted-foreground mb-4">
          You can purchase the vehicle at the <Link href="/glossary/residual-value" className="underline text-foreground">residual value</Link> stated in your lease contract (plus tax, title, and any purchase option fee). This is a good deal when:
        </p>
        <ul className="space-y-2 mb-4 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span><strong>Market value exceeds residual</strong>: If your car is worth $28,000 on the open market but the residual is $24,000, you have $4,000 in positive equity. Buying and keeping (or reselling) captures that value.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span><strong>You're over on miles</strong>: Buying eliminates excess mileage charges entirely.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span><strong>You love the car</strong>: You know its full history, maintenance record, and condition.</span>
          </li>
        </ul>
        <p className="text-muted-foreground mb-8">
          <strong>Watch out</strong>: Some dealers add a "purchase option fee" ($200-$500) on top of the residual. Also compare financing rates — you don't have to finance through the dealer. A credit union or bank may offer better terms.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Option 3: Extend the Lease (Month-to-Month)</h2>
        <p className="text-muted-foreground mb-8">
          Most manufacturers allow you to extend your lease on a month-to-month basis (typically for up to 6-12 months). Your monthly payment stays the same or adjusts slightly. This is useful if you need time to find your next vehicle, are waiting for a specific model to become available, or want to avoid making a rushed decision. Contact the leasing company before your lease ends to arrange the extension — don't assume it happens automatically.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Option 4: Transfer the Lease</h2>
        <p className="text-muted-foreground mb-8">
          A <Link href="/glossary/lease-transfer" className="underline text-foreground">lease transfer</Link> (lease assumption) lets you hand off your remaining lease payments to another person. Services like Swapalease and LeaseTrader facilitate this. Transfer fees are typically $300-$500. This option is particularly useful if you want out of the lease before it ends but don't want to pay <Link href="/glossary/early-termination-fee" className="underline text-foreground">early termination penalties</Link>. Not all manufacturers allow transfers — BMW, Mercedes, Audi, and Honda typically do; Toyota/Lexus currently does not.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Option 5: Early Termination</h2>
        <p className="text-muted-foreground mb-8">
          The most expensive option. <Link href="/glossary/early-termination-fee" className="underline text-foreground">Early termination</Link> typically requires paying all remaining lease payments plus any gap between the vehicle's current value and the residual. This can easily cost several thousand dollars. Only consider this as a last resort — a lease transfer is almost always cheaper. If you must terminate early, calculate the total cost and compare it against the cost of simply continuing payments until the lease ends.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">How to Decide: The Equity Check</h2>
        <p className="text-muted-foreground mb-4">
          The key to making the right lease-end decision is comparing your vehicle's current market value against your residual (buyout price):
        </p>
        <div className="overflow-x-auto mb-8">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 font-semibold text-foreground">Scenario</th>
                <th className="text-left py-2 px-3 font-semibold text-foreground">Best Option</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b border-border/50"><td className="py-2 px-3">Market value &gt; Residual (positive equity)</td><td className="py-2 px-3">Buy and keep, or buy and sell for profit</td></tr>
              <tr className="border-b border-border/50"><td className="py-2 px-3">Market value ≈ Residual</td><td className="py-2 px-3">Buy if you love the car; return if you want something new</td></tr>
              <tr className="border-b border-border/50"><td className="py-2 px-3">Market value &lt; Residual (negative equity)</td><td className="py-2 px-3">Return the vehicle — let the leasing company absorb the loss</td></tr>
              <tr className="border-b border-border/50"><td className="py-2 px-3">Over mileage + positive equity</td><td className="py-2 px-3">Buy to avoid mileage charges, then sell privately if desired</td></tr>
              <tr className="border-b border-border/50"><td className="py-2 px-3">Need more time</td><td className="py-2 px-3">Extend month-to-month while you decide</td></tr>
            </tbody>
          </table>
        </div>

        <p className="text-muted-foreground mb-4">
          Check your vehicle's current market value on KBB, Edmunds, or get instant offers from Carvana/CarMax. Compare that number to your lease-end purchase price (residual + tax + any fees). The difference tells you which option makes financial sense.
        </p>

        <p className="text-muted-foreground mb-4">
          For more on lease costs, see our guides on <Link href="/car-lease-fees-explained" className="underline text-foreground">lease fees</Link> and <Link href="/residual-value-explained" className="underline text-foreground">residual value</Link>.
        </p>
      </div>

      <ArticleCta />
    </ArticleLayout>
  );
}
