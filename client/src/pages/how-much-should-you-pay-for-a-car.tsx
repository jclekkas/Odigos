import { useEffect } from "react";
import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { setSeoMeta } from "@/lib/seo";
import { articleSchema } from "@/lib/jsonld";
import ArticleLayout from "@/components/ArticleLayout";
import ArticleCta from "@/components/ArticleCta";

export default function HowMuchShouldYouPayForACar() {
  useEffect(() => {
    return setSeoMeta({
      title: "How Much Should You Pay for a Car? OTD Price vs. Monthly Payment | Odigos",
      description: "Find out how much you should really pay for a car by comparing OTD price instead of monthly payments and avoiding common traps.",
      path: "/how-much-should-you-pay-for-a-car",
    });
  }, []);

  return (
    <ArticleLayout title="How Much Should You Pay for a Car?">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(articleSchema({ title: "How Much Should You Pay for a Car? OTD Price vs. Monthly Payment | Odigos", description: "Find out how much you should really pay for a car by comparing OTD price instead of monthly payments and avoiding common traps.", path: "/how-much-should-you-pay-for-a-car" }))}</script>
      </Helmet>
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 leading-tight" data-testid="text-how-much-headline">
        How Much Should You Pay for a Car? Compare OTD, Not Monthly Payment
      </h1>

      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p className="text-lg text-muted-foreground mb-6">
          The question most buyers ask is: what's a reasonable monthly payment? That's the wrong question. Monthly payment is a variable that dealers adjust by changing the loan term and interest rate — it can be made to look almost anything. The right questions are: what is the out-the-door price, and what is the total loan cost?
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">The two numbers that actually matter</h2>

        <p className="text-lg text-muted-foreground mb-4">
          <strong className="text-foreground">1. Out-the-door (OTD) price</strong>
        </p>
        <p className="text-lg text-muted-foreground mb-6">
          The <Link href="/out-the-door-price" className="underline text-foreground">out-the-door price</Link> is what you pay for the vehicle, all-in: vehicle price, taxes, title, registration, doc fee, and any add-ons. This is the number that reflects the deal you're agreeing to, before financing enters the picture. Two dealers quoting the same vehicle can have very different OTD prices based on fees and add-ons — and the one with the lower vehicle price isn't always the better deal.
        </p>

        <p className="text-lg text-muted-foreground mb-4">
          <strong className="text-foreground">2. Total loan cost</strong>
        </p>
        <p className="text-lg text-muted-foreground mb-6">
          If you're financing, the total loan cost is what you actually pay over the life of the loan: (monthly payment × number of payments). This is the real cost of the vehicle, including the interest you're paying. A deal with a lower OTD price at a higher APR can cost more total than a deal with a higher OTD at a lower APR and shorter term.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Why monthly payment is the wrong anchor</h2>

        <p className="text-lg text-muted-foreground mb-4">
          Dealers know that buyers focus on monthly payment. When a buyer says "I want to be around $550 a month," the dealer now has four variables to work with: vehicle price, down payment, APR, and loan term. They can extend the term, raise the APR slightly, or bundle add-ons and still hit the monthly target — while you pay thousands more over the life of the loan.
        </p>

        <p className="text-lg text-muted-foreground mb-6">
          The <Link href="/monthly-payment-trap" className="underline text-foreground">monthly payment trap</Link> is one of the most documented tactics in car sales. Once you name a payment, you've given up your negotiating anchor. Keep conversations on the OTD price until that number is agreed upon, then discuss financing separately.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">The same car — two different total costs</h2>

        <p className="text-lg text-muted-foreground mb-4">
          Here's a concrete example of how two financing scenarios on the same vehicle lead to very different outcomes:
        </p>

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

        <p className="text-lg text-muted-foreground mb-6">
          Scenario B has a monthly payment $203 lower than Scenario A. But over the life of the loan, Scenario B costs $3,600 more and takes two extra years. If the dealer presents Scenario B as "more affordable," they're technically right about the monthly number — and completely wrong about the cost of the deal.
        </p>

        <div className="rounded-lg border border-border bg-muted/30 p-5 mb-8">
          <p className="text-sm font-medium text-foreground mb-2">If you have a quote, Odigos breaks down the full cost</p>
          <p className="text-sm text-muted-foreground">
            <Link href="/analyze" className="underline text-foreground">Paste your dealer quote</Link> and Odigos checks the OTD price, flags missing fees, and identifies add-ons you're paying for — so you're comparing the right numbers. No signup required.
          </p>
        </div>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">OTD price is the deal — financing is separate</h2>

        <p className="text-lg text-muted-foreground mb-4">
          Treating financing as part of the deal is one of the most common mistakes buyers make. Once you agree to an OTD price, the financing structure is a separate negotiation. Some things to know:
        </p>

        <ul className="space-y-2 mb-6 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span>•</span>
            <span><strong className="text-foreground">Dealer financing is not always the best rate.</strong> Dealers arrange loans through lenders and earn a margin. Getting a pre-approval from your bank or credit union before visiting gives you a rate to compare against.</span>
          </li>
          <li className="flex items-start gap-2">
            <span>•</span>
            <span><strong className="text-foreground">0% financing offers are sometimes offset elsewhere.</strong> A manufacturer offering 0% APR may be excluding other incentives (like a cash rebate). The rebate in cash may be worth more than the interest savings. Run both scenarios.</span>
          </li>
          <li className="flex items-start gap-2">
            <span>•</span>
            <span><strong className="text-foreground">Extended terms reduce your equity.</strong> On a 72-month loan, you're likely underwater on the car for the first 2–3 years — meaning you owe more than it's worth. If you sell or trade in early, you may owe the difference out of pocket.</span>
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">How to evaluate a quote correctly</h2>

        <ul className="space-y-2 mb-8 text-muted-foreground">
          <li className="flex items-start gap-2"><span>•</span><span>Start with the OTD price — not the monthly payment.</span></li>
          <li className="flex items-start gap-2"><span>•</span><span>Verify that fees are itemized and reasonable for your state. See <Link href="/are-dealer-fees-negotiable" className="underline text-foreground">which dealer fees are negotiable</Link> for context.</span></li>
          <li className="flex items-start gap-2"><span>•</span><span>Identify every add-on by name and price. Remove or negotiate the ones you don't want. See <Link href="/are-dealer-add-ons-mandatory" className="underline text-foreground">whether dealer add-ons are mandatory</Link> — most are not.</span></li>
          <li className="flex items-start gap-2"><span>•</span><span>Once OTD is agreed, compare APR offers — your bank vs the dealer — and calculate total loan cost for each.</span></li>
          <li className="flex items-start gap-2"><span>•</span><span>Compare deals OTD-to-OTD. See <Link href="/how-to-compare-car-deals" className="underline text-foreground">how to compare car deals</Link> for a side-by-side framework.</span></li>
        </ul>
      </div>

      <ArticleCta />

      <p className="text-xs text-muted-foreground mt-12">
        Not affiliated with any dealership. Optimized for U.S. car purchases.
      </p>
    </ArticleLayout>
  );
}
