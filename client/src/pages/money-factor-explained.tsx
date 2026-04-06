import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";
import { setSeoMeta } from "@/lib/seo";
import { articleSchema } from "@/lib/jsonld";
import ArticleLayout from "@/components/ArticleLayout";
import ArticleCta from "@/components/ArticleCta";

export default function MoneyFactorExplained() {
  useEffect(() => {
    setSeoMeta({
      title: "Money Factor Explained: The Hidden Interest Rate in Car Leases | Odigos",
      description: "Money factor is the lease equivalent of an interest rate. Learn how to convert it to APR, what a good money factor looks like, and how dealers mark it up without telling you.",
      path: "/money-factor-explained",
    });
  }, []);

  return (
    <ArticleLayout title="Money Factor Explained">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(articleSchema({ title: "Money Factor Explained: The Hidden Interest Rate in Car Leases | Odigos", description: "Money factor is the lease equivalent of an interest rate. Learn how to convert it to APR, what a good money factor looks like, and how dealers mark it up without telling you.", path: "/money-factor-explained" }))}</script>
      </Helmet>
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 leading-[1.15]" data-testid="text-money-factor-headline">
        Money Factor Explained: The Hidden Interest Rate in Car Leases
      </h1>

      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p className="text-lg text-muted-foreground mb-4">
          If you've ever looked at a lease worksheet and seen a tiny decimal like 0.00125, that's the <Link href="/glossary/money-factor" className="underline text-foreground">money factor</Link> — and it's one of the most important numbers in your entire lease. The money factor determines how much you pay in financing charges every month. It's the lease equivalent of an interest rate, except it's expressed in a format designed to be confusing.
        </p>
        <p className="text-lg text-muted-foreground mb-10">
          This guide explains exactly what money factor is, how to convert it to a number you can actually compare, and how dealers quietly mark it up to increase their profit.
        </p>

        <p className="text-sm text-muted-foreground mb-6">
          Already have a dealer quote? <Link href="/analyze" className="underline text-foreground">Paste it here</Link> and we'll calculate the effective interest rate for you.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">What Is Money Factor?</h2>
        <p className="text-muted-foreground mb-4">
          Money factor (sometimes called "lease factor" or "lease rate") is the financing cost component of your monthly lease payment. While a car loan expresses its cost as an annual percentage rate (APR), a lease uses money factor — a small decimal number, typically between 0.00050 and 0.00400.
        </p>
        <p className="text-muted-foreground mb-4">
          The money factor is multiplied by the sum of the vehicle's capitalized cost (the negotiated price) and the <Link href="/glossary/residual-value" className="underline text-foreground">residual value</Link> to produce the monthly finance charge — sometimes called the "rent charge." This charge is added to the depreciation portion to arrive at your total monthly payment.
        </p>
        <p className="text-muted-foreground mb-8">
          In simple terms: the higher the money factor, the more you pay each month in interest. The lower the money factor, the cheaper the lease.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">How to Convert Money Factor to APR</h2>
        <p className="text-muted-foreground mb-4">
          The conversion is straightforward: <strong className="text-foreground">multiply the money factor by 2,400</strong> to get the approximate APR.
        </p>
        <ul className="space-y-2 mb-4 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span><strong className="text-foreground">0.00100 x 2,400 = 2.4% APR</strong> — excellent, typically a manufacturer-subsidized rate</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span><strong className="text-foreground">0.00150 x 2,400 = 3.6% APR</strong> — good, competitive with typical auto loan rates</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span><strong className="text-foreground">0.00250 x 2,400 = 6.0% APR</strong> — fair, but worth shopping around or negotiating</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span><strong className="text-foreground">0.00375 x 2,400 = 9.0% APR</strong> — high, often indicates a dealer markup or subprime credit tier</span>
          </li>
        </ul>
        <p className="text-muted-foreground mb-8">
          Why 2,400? It's 24 (months in two years, since money factor is a monthly rate expressed as half the actual rate) times 100 (to convert to percentage). The math behind it is specific to lease accounting, but the takeaway is simple: multiply by 2,400.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">What's a Good Money Factor?</h2>
        <p className="text-muted-foreground mb-4">
          "Good" depends on current market rates and your credit score, but here are general benchmarks:
        </p>
        <ul className="space-y-2 mb-8 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span><strong className="text-foreground">Excellent (720+ credit):</strong> 0.00050 to 0.00150 (1.2%–3.6% APR). Manufacturer-subsidized lease deals frequently fall in this range.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span><strong className="text-foreground">Good (680–719 credit):</strong> 0.00150 to 0.00250 (3.6%–6.0% APR). Competitive, and still worth leasing for the right vehicle.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span><strong className="text-foreground">Fair (620–679 credit):</strong> 0.00250 to 0.00350 (6.0%–8.4% APR). At this level, compare carefully against financing a purchase.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span><strong className="text-foreground">Poor (below 620):</strong> 0.00350+ (8.4%+ APR). Leasing at these rates is rarely a good financial decision.</span>
          </li>
        </ul>

        <div className="my-10 p-6 rounded-lg bg-muted/30 border border-border">
          <p className="text-sm font-semibold text-foreground mb-2">Want to check your money factor?</p>
          <p className="text-sm text-muted-foreground mb-3">
            Paste your lease quote into Odigos. We'll extract the money factor, convert it to APR, and tell you if it's been marked up.
          </p>
          <Link href="/analyze">
            <Button variant="cta" size="sm" data-testid="button-cta-mid-article-money-factor">
              Analyze My Lease Quote
            </Button>
          </Link>
        </div>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Who Sets the Money Factor?</h2>
        <p className="text-muted-foreground mb-4">
          The money factor originates with the leasing company — typically the manufacturer's captive finance arm (like Toyota Financial Services, BMW Financial Services, or Ally Financial). They publish a "buy rate" money factor for each vehicle, credit tier, lease term, and mileage allowance. This is the base rate.
        </p>
        <p className="text-muted-foreground mb-8">
          Here's what most consumers don't know: <strong className="text-foreground">dealers can mark up the money factor</strong>, just like they can mark up a loan's interest rate. The difference between the buy rate and the rate you're charged is pure dealer profit. This markup is not typically disclosed on the lease worksheet — it's hidden in the monthly payment math.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">How Dealers Mark Up the Money Factor</h2>
        <p className="text-muted-foreground mb-4">
          A dealer might receive a buy rate of 0.00100 (2.4% APR) from the leasing company but quote you 0.00200 (4.8% APR). On a $40,000 vehicle with a 55% residual, that markup adds roughly $38 per month — or $1,368 over a 36-month lease — straight into the dealer's pocket.
        </p>
        <p className="text-muted-foreground mb-4">
          Common tactics dealers use:
        </p>
        <ul className="space-y-2 mb-8 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span><strong className="text-foreground">Never mentioning the money factor at all.</strong> Many lease presentations focus only on the monthly payment, keeping you away from the underlying numbers.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span><strong className="text-foreground">Claiming the money factor is "set by the bank" and non-negotiable.</strong> The buy rate is set by the bank — but the markup is the dealer's choice.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span><strong className="text-foreground">Quoting the money factor as a whole number.</strong> Some dealers say "the rate is 1.5" when they mean 0.00150. This obscures the actual APR and makes comparison harder.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span><strong className="text-foreground">Bundling a higher money factor with a lower sale price.</strong> The dealer offers a "great deal" on the car price but recovers the discount through an inflated rate. The monthly payment looks reasonable, but you're paying more in interest than you should.</span>
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">How to Negotiate the Money Factor</h2>
        <p className="text-muted-foreground mb-4">
          You have more leverage than most dealers want you to know:
        </p>
        <ul className="space-y-2 mb-4 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span><strong className="text-foreground">Research the buy rate.</strong> Forums like Leasehackr and Edmunds publish current buy rates for most vehicles. If the dealer's quote is higher, you know there's a markup.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span><strong className="text-foreground">Ask directly:</strong> "What is the money factor on this lease, and what is the buy rate from [manufacturer's finance arm]?" A transparent dealer will answer both questions.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span><strong className="text-foreground">Negotiate separately.</strong> Treat the money factor and the sale price as two independent variables. Get the best price first, then negotiate the rate.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span><strong className="text-foreground">Use multiple security deposits (MSDs).</strong> Some brands let you put down refundable security deposits to lower the money factor. Each deposit typically reduces the money factor by 0.00007 — a meaningful discount on a multi-year lease.</span>
          </li>
        </ul>
        <p className="text-muted-foreground mb-8">
          For a broader view of all the fees in a lease, see our guide to <Link href="/car-lease-fees-explained" className="underline text-foreground">car lease fees explained</Link>.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">The Bottom Line</h2>
        <p className="text-muted-foreground mb-8">
          The money factor is the single most under-scrutinized number in a car lease. Most buyers negotiate the sale price and ignore the rate entirely — which is exactly what dealers count on. Always ask for the money factor, convert it to APR, and compare it to published buy rates. Even a small markup compounds into hundreds or thousands of dollars over the lease term.
        </p>
      </div>

      <ArticleCta />

      <p className="text-xs text-muted-foreground mt-12">
        Not affiliated with any dealership. Optimized for U.S. car leases.
      </p>
    </ArticleLayout>
  );
}
