import { useEffect } from "react";
import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { setSeoMeta } from "@/lib/seo";
import { articleSchema } from "@/lib/jsonld";
import ArticleLayout from "@/components/ArticleLayout";
import ArticleCta from "@/components/ArticleCta";

export default function OutTheDoorPriceVsMonthlyPayment() {
  useEffect(() => {
    setSeoMeta({
      title: "OTD Price vs. Monthly Payment: What Dealers Hide | Odigos",
      description: "Dealers leading with a monthly payment hide the sale price, APR, loan term, and rolled-in add-ons. Here's how that mechanic works and how to stop it.",
      path: "/out-the-door-price-vs-monthly-payment",
    });
  }, []);

  return (
    <ArticleLayout title="Out-the-Door Price vs. Monthly Payment: What Dealers Hide">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(articleSchema({ title: "OTD Price vs. Monthly Payment: What Dealers Hide | Odigos", description: "Dealers leading with a monthly payment hide the sale price, APR, loan term, and rolled-in add-ons. Here's how that mechanic works and how to stop it.", path: "/out-the-door-price-vs-monthly-payment" }))}</script>
      </Helmet>
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 leading-[1.15]" data-testid="text-otd-payment-headline">
        Out-the-Door Price vs. Monthly Payment: What Dealers Hide
      </h1>

      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p className="text-lg text-muted-foreground mb-4">
          A monthly payment sounds like a simple number. It isn't. It's the output of four hidden variables — vehicle price, APR, loan term, and add-ons — and dealers can adjust any of them to hit whatever monthly number you say you want.
        </p>
        <p className="text-muted-foreground mb-10">
          That's the trap. The out-the-door price is the only number that can't be obscured this way.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">The Monthly Payment Is a Compression</h2>
        <p className="text-muted-foreground mb-3">
          When a dealer asks "what monthly payment are you looking for?", they're getting you to commit to a budget before you know any of the underlying numbers. Once you say $450/month, the conversation shifts: they work backwards from that payment to whatever deal structure achieves it.
        </p>
        <p className="text-muted-foreground mb-3">Four variables feed the monthly payment number:</p>
        <ul className="space-y-2 mb-4 text-muted-foreground">
          {[
            "The vehicle sale price",
            "The APR (interest rate on the loan)",
            "The loan term (36, 48, 60, 72, or 84 months)",
            "Any add-ons or products rolled into the financed amount",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="text-muted-foreground mb-8">
          Dealers can hit a $450/month target by lowering the sale price — or by keeping the sale price high and extending the loan to 84 months at a marked-up APR. The monthly number is the same. What you actually pay is not.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">How Extending the Term Inflates Total Cost</h2>
        <p className="text-muted-foreground mb-3">
          Consider $32,000 financed at 7.9% APR:
        </p>
        <div className="rounded-md border border-border overflow-hidden mb-4" data-testid="table-term-comparison">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left py-2.5 px-4 font-medium text-muted-foreground">Loan Term</th>
                <th className="text-right py-2.5 px-4 font-medium text-muted-foreground">Monthly Payment</th>
                <th className="text-right py-2.5 px-4 font-medium text-muted-foreground">Total Paid</th>
                <th className="text-right py-2.5 px-4 font-medium text-muted-foreground">Extra Interest</th>
              </tr>
            </thead>
            <tbody>
              {[
                { term: "60 months", monthly: "$646", total: "$38,760", extra: "—" },
                { term: "72 months", monthly: "$558", total: "$40,176", extra: "+$1,416" },
                { term: "84 months", monthly: "$497", total: "$41,748", extra: "+$2,988" },
              ].map((row) => (
                <tr key={row.term} className="border-t border-border/50">
                  <td className="py-2.5 px-4 text-muted-foreground">{row.term}</td>
                  <td className="py-2.5 px-4 text-right text-muted-foreground">{row.monthly}</td>
                  <td className="py-2.5 px-4 text-right text-muted-foreground">{row.total}</td>
                  <td className="py-2.5 px-4 text-right text-muted-foreground">{row.extra}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-muted-foreground mb-8">
          The 84-month payment is $149 less per month than the 60-month. Dealers present that as a "more affordable option." The buyer pays nearly $3,000 more in interest — and risks being underwater on the loan for most of its life.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">The APR Markup You Can't See</h2>
        <p className="text-muted-foreground mb-3">
          When a dealer arranges financing, lenders offer a base rate — called the buy rate — and dealers can legally add margin on top. That markup is their profit on the financing, and it's invisible in the monthly payment.
        </p>
        <ul className="space-y-2 mb-4 text-muted-foreground">
          {[
            "On a $30,000 loan, a 2% APR markup over 72 months adds roughly $1,800–$2,200 in extra interest",
            "Dealers are not required to disclose the buy rate or how much margin they added",
            "The monthly payment changes only slightly, so the markup goes unnoticed",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="text-muted-foreground mb-8">
          Getting pre-approved through your own bank or credit union before you shop gives you a benchmark rate. When the dealer quotes financing, you can compare it directly.
        </p>

        <div className="my-10 p-6 rounded-lg bg-muted/30 border border-border">
          <p className="text-sm font-semibold text-foreground mb-2">If you're looking at a real quote…</p>
          <p className="text-sm text-muted-foreground mb-3">
            Paste it into Odigos and we'll flag whether the quote is showing you a monthly payment without the underlying OTD breakdown — and what's missing.
          </p>
          <Link href="/analyze">
            <button className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors" data-testid="button-cta-mid-article">
              Analyze My Deal
            </button>
          </Link>
        </div>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Add-Ons Rolled Into the Payment</h2>
        <p className="text-muted-foreground mb-3">
          This is one of the most effective techniques in the finance office: rolling add-ons into the loan so they disappear into the monthly payment. A $1,200 paint protection package financed at 7.9% over 72 months adds about $20/month. Buyers rarely notice $20.
        </p>
        <ul className="space-y-2 mb-4 text-muted-foreground">
          {[
            "Extended warranties, GAP insurance, and protection packages are commonly rolled in",
            "You're financing these products — so you also pay interest on them",
            "On a 72-month loan, a $1,500 add-on costs roughly $1,800–$1,900 by the time interest is included",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="text-muted-foreground mb-8">
          For a deeper look at how this works and what questions to ask, see our page on the <Link href="/monthly-payment-trap" className="underline text-foreground">monthly payment trap in car buying</Link>.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">How to Keep OTD Price and Financing Separate</h2>
        <p className="text-muted-foreground mb-3">
          Treat the vehicle purchase and the financing as two separate transactions. Negotiate the out-the-door price first. Once you have a number agreed to in writing, then discuss loan terms.
        </p>
        <p className="text-muted-foreground mb-3">In practice:</p>
        <ol className="space-y-2 mb-4 text-muted-foreground list-decimal pl-6">
          <li>Request the full OTD price in writing before discussing monthly payments</li>
          <li>Get pre-approved with your bank or credit union before visiting</li>
          <li>When the dealer quotes financing, ask for the APR, term, and total cost of the loan separately</li>
          <li>Verify that no add-ons have been added to the financed amount without your explicit agreement</li>
        </ol>
        <p className="text-muted-foreground mb-8">
          If you already have a quote, <Link href="/out-the-door-price" className="underline text-foreground">understanding what a complete OTD price should look like</Link> makes it easy to identify what's missing.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">The Signal: When to Walk Away</h2>
        <p className="text-muted-foreground mb-3">
          If a dealer keeps redirecting the conversation to monthly payments after you've asked for an OTD price, that's not a preference — it's a strategy. A straightforward deal does not require hiding the total.
        </p>
        <ul className="space-y-2 mb-8 text-muted-foreground">
          {[
            "Ask once for the full OTD breakdown in writing",
            "If they redirect to payments again, repeat the request",
            "If they still won't provide it, treat the refusal as data about how they do business",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <ArticleCta />

      <p className="text-xs text-muted-foreground mt-12">
        Not affiliated with any dealership. Built for U.S. car buyers.
      </p>
    </ArticleLayout>
  );
}
