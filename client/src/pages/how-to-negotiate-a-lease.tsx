import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";
import { setSeoMeta } from "@/lib/seo";
import { articleSchema } from "@/lib/jsonld";
import ArticleLayout from "@/components/ArticleLayout";
import ArticleCta from "@/components/ArticleCta";

export default function HowToNegotiateALease() {
  useEffect(() => {
    return setSeoMeta({
      title: "How to Negotiate a Car Lease: 8 Steps to a Better Deal | Odigos",
      description: "Most lease buyers negotiate the wrong number. Learn the 8 steps to negotiating a car lease, from cap cost to money factor to junk fee removal.",
      path: "/how-to-negotiate-a-lease",
    });
  }, []);

  return (
    <ArticleLayout title="How to Negotiate a Lease">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(articleSchema({ title: "How to Negotiate a Car Lease: 8 Steps to a Better Deal | Odigos", description: "Most lease buyers negotiate the wrong number. Learn the 8 steps to negotiating a car lease.", path: "/how-to-negotiate-a-lease" }))}</script>
      </Helmet>
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 leading-[1.15]" data-testid="text-negotiate-lease-headline">
        How to Negotiate a Car Lease: 8 Steps to a Better Deal
      </h1>

      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p className="text-lg text-muted-foreground mb-4">
          The biggest mistake lease buyers make is negotiating the monthly payment. Dealers love this — it lets them hide unfavorable terms behind a number that sounds affordable. A better approach: negotiate the individual components that determine your payment, then let the math work in your favor.
        </p>
        <p className="text-lg text-muted-foreground mb-10">
          Here are the 8 steps that consistently produce better lease deals.
        </p>

        <p className="text-sm text-muted-foreground mb-6">
          Already have a lease quote? <Link href="/analyze" className="underline text-foreground">Paste it here</Link> and we'll check every number.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Step 1: Negotiate the Cap Cost (Vehicle Price) First</h2>
        <p className="text-muted-foreground mb-8">
          The <Link href="/glossary/capitalized-cost" className="underline text-foreground">capitalized cost</Link> is the negotiated price of the vehicle — the lease equivalent of the sale price. It is fully negotiable, just like buying. Start by researching invoice price and recent sale prices on Edmunds, TrueCar, or CarEdge. Aim for invoice price or below on most models. Every $1,000 you reduce the cap cost saves roughly $28/month on a 36-month lease. Never let the dealer skip straight to monthly payment — insist on agreeing to a vehicle price first.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Step 2: Get the Money Factor in Writing</h2>
        <p className="text-muted-foreground mb-8">
          The <Link href="/money-factor-explained" className="underline text-foreground">money factor</Link> is the lease interest rate. Ask for it explicitly — many dealers will avoid disclosing it unless pressed. Multiply by 2,400 to convert to APR. A money factor of 0.00125 equals 3.0% APR. Compare it against the manufacturer's published "base" money factor (available on forums like Leasehackr). If the dealer's number is higher, they've marked it up for profit. You can often get the base rate by asking — or by threatening to finance through your own bank instead.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Step 3: Verify the Residual Value Independently</h2>
        <p className="text-muted-foreground mb-8">
          The <Link href="/residual-value-explained" className="underline text-foreground">residual value</Link> is set by the leasing company and is not negotiable — but you should verify it hasn't been inflated or deflated from the standard rate. Check ALG residual values or Leasehackr forums for the current residual on your specific model, trim, and lease term. An inflated residual paired with a high money factor is a red flag — it makes the monthly payment look lower while costing you more in interest.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Step 4: Compare Offers from Multiple Dealers</h2>
        <p className="text-muted-foreground mb-8">
          Email 3-5 dealers requesting a lease quote on the same vehicle. Ask each for: cap cost, money factor, residual percentage, acquisition fee, and monthly payment with $0 down. This makes offers directly comparable. Dealers compete on cap cost and money factor — having competing quotes gives you leverage to negotiate down. The best lease deals often come from high-volume dealers willing to sacrifice margin for units sold.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Step 5: Negotiate Your Trade-In Separately</h2>
        <p className="text-muted-foreground mb-8">
          If you have a trade-in, establish its value independently before discussing the lease. Get quotes from CarMax, Carvana, and Vroom as a baseline. Dealers often use trade-in value as a lever — inflating it while raising the cap cost to compensate. By separating the two negotiations, you prevent this shell game. In most states, applying a trade-in to a lease also gives you a <Link href="/glossary/trade-in-tax-credit" className="underline text-foreground">trade-in tax credit</Link>, reducing the taxable portion of your lease.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Step 6: Watch for Junk Fees</h2>
        <p className="text-muted-foreground mb-8">
          Lease deals are fertile ground for <Link href="/junk-fees-explained" className="underline text-foreground">junk fees</Link>. Common additions include: nitrogen tire fill ($50-$300), VIN etching ($100-$400), paint protection ($300-$1,500), and dealer prep ($200-$500). These are all optional and should be declined. Also watch for inflated doc fees — check your <Link href="/car-dealer-fees-by-state" className="underline text-foreground">state's cap</Link>. Every unnecessary fee rolled into the lease increases your monthly payment for the full term.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Step 7: Consider Multiple Security Deposits (MSDs)</h2>
        <p className="text-muted-foreground mb-8">
          Some manufacturers (BMW, Mercedes, Lexus, and others) allow you to make multiple security deposits to reduce your money factor. Each MSD — typically equal to one monthly payment, rounded up to the nearest $50 — lowers the money factor by approximately 0.00007. Seven MSDs can reduce the money factor by nearly 0.0005, saving significant interest over the lease term. MSDs are fully refundable at lease end, making them essentially a risk-free investment. Check if your manufacturer offers this program.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Step 8: Time Your Lease Strategically</h2>
        <p className="text-muted-foreground mb-4">
          Lease programs change monthly. The best timing strategies:
        </p>
        <ul className="space-y-2 mb-8 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span><strong>End of month/quarter</strong>: Dealers have sales targets and may offer better deals to hit their numbers</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span><strong>Model year end</strong>: When next year's model is arriving, current-year residuals and incentives often improve</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span><strong>Holiday sales events</strong>: Manufacturer incentives (bonus cash, reduced money factors) are often strongest during holiday promotions</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span><strong>Avoid January-February</strong>: Lease programs tend to be weakest early in the calendar year</span>
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">The Negotiation Checklist</h2>
        <p className="text-muted-foreground mb-4">
          Before signing any lease, make sure you have all of these in writing:
        </p>
        <ul className="space-y-2 mb-8 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span>Capitalized cost (negotiated vehicle price)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span>Money factor (and equivalent APR)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span>Residual value (dollar amount and percentage of MSRP)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span>Lease term (months) and annual mileage allowance</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span>Acquisition fee</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span>All dealer fees itemized</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span>Monthly payment with $0 due at signing (for comparison)</span>
          </li>
        </ul>

        <p className="text-muted-foreground mb-4">
          For more on the fees and terms you'll encounter, see our guides on <Link href="/car-lease-fees-explained" className="underline text-foreground">lease fees</Link>, <Link href="/money-factor-explained" className="underline text-foreground">money factor</Link>, and <Link href="/residual-value-explained" className="underline text-foreground">residual value</Link>.
        </p>
      </div>

      <ArticleCta />
    </ArticleLayout>
  );
}
