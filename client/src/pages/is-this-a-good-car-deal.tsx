import { useEffect } from "react";
import { Link } from "wouter";
import { setSeoMeta } from "@/lib/seo";
import ArticleLayout from "@/components/ArticleLayout";
import ArticleCta from "@/components/ArticleCta";

export default function IsThisAGoodCarDeal() {
  useEffect(() => {
    return setSeoMeta({
      title: "Is This a Good Car Deal? | Odigos",
      description: "Use this four-signal framework to quickly assess whether a dealer quote is good, borderline, or a red flag — before you sign anything.",
      path: "/is-this-a-good-car-deal",
    });
  }, []);

  return (
    <ArticleLayout title="Is This a Good Car Deal?">
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 leading-tight" data-testid="text-good-deal-headline">
        Is This a Good Car Deal?
      </h1>

      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p className="text-lg text-muted-foreground mb-6">
          Most dealer quotes are missing at least one critical piece of information. That's not always intentional — but it does make a quote hard to evaluate fairly. The fastest way to assess a deal is to check four signals. If all four are present and clean, the deal is worth considering. If one or more are missing, you have a problem.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">The four signals that separate good deals from bad ones</h2>

        <p className="text-lg text-muted-foreground mb-4">
          Run through these before you go further with any dealer:
        </p>

        <ul className="space-y-4 mb-8 text-muted-foreground">
          <li className="flex items-start gap-3">
            <span className="font-bold text-foreground mt-1">1.</span>
            <div>
              <strong className="text-foreground">Out-the-door price is provided in writing.</strong>
              <span className="block mt-1">The OTD price is the total you pay to drive the car home — vehicle price, taxes, title, registration, doc fee, and any add-ons all included. If the dealer hasn't given you a single, final number, you can't evaluate the deal. A <Link href="/out-the-door-price" className="underline text-foreground">full breakdown of what the OTD price includes</Link> explains what should be on that line.</span>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="font-bold text-foreground mt-1">2.</span>
            <div>
              <strong className="text-foreground">Every fee is itemized, not bundled.</strong>
              <span className="block mt-1">Doc fees, preparation fees, and dealer charges should appear as individual line items. If you see a single "dealer fees" line covering everything, something may be buried. <Link href="/hidden-dealer-fees" className="underline text-foreground">Hidden dealer fees</Link> are one of the most common sources of surprise charges at signing.</span>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="font-bold text-foreground mt-1">3.</span>
            <div>
              <strong className="text-foreground">Add-ons are listed separately with individual prices.</strong>
              <span className="block mt-1">Protection packages, paint sealant, VIN etching, and extended warranties should each appear as separate, named line items. If they're bundled together or missing from the quote entirely but appear in the OTD total, you're paying for something you didn't see. <Link href="/are-dealer-add-ons-mandatory" className="underline text-foreground">Dealer add-ons are rarely mandatory</Link> — but they are easy to miss.</span>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="font-bold text-foreground mt-1">4.</span>
            <div>
              <strong className="text-foreground">Financing terms are disclosed: APR, loan term, and monthly payment.</strong>
              <span className="block mt-1">A quote that shows only a monthly payment tells you almost nothing about the deal. You need the interest rate and the loan length to know what you're actually agreeing to. Dealers who lead with monthly payment are often using it to obscure the <Link href="/monthly-payment-trap" className="underline text-foreground">real cost of the loan</Link>.</span>
            </div>
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Good, borderline, and bad — what each looks like</h2>

        <p className="text-lg text-muted-foreground mb-6">
          Running all four signals against a real quote gives you a verdict tier:
        </p>

        <div className="space-y-6 mb-8">
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-5">
            <p className="font-semibold text-emerald-700 dark:text-emerald-400 mb-2" data-testid="verdict-good">Good deal (all 4 signals present)</p>
            <p className="text-sm text-muted-foreground mb-2">Example: Quote shows $34,800 OTD with a line-item breakdown: $31,200 vehicle price, $895 doc fee, $2,200 sales tax, $305 title/registration, zero add-ons. Financing: 60 months at 6.4% APR, $525/month.</p>
            <p className="text-sm text-muted-foreground">This is evaluable. You can compare it to other quotes, verify the doc fee is reasonable for your state, and decide whether the APR is competitive. The deal may or may not be great — but you have what you need to decide.</p>
          </div>

          <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-5">
            <p className="font-semibold text-amber-700 dark:text-amber-400 mb-2" data-testid="verdict-borderline">Borderline (1–2 signals missing or unclear)</p>
            <p className="text-sm text-muted-foreground mb-2">Example: Quote shows a vehicle price and a monthly payment, but no OTD total. Fees are listed as a single "$1,850 dealer fees" line. No itemized add-ons. APR is mentioned as "depending on credit."</p>
            <p className="text-sm text-muted-foreground">The deal might be fine, but you don't have the information to know. Before proceeding, ask for the full OTD breakdown in writing and an itemized fee list. The dealer's response to that request is itself informative.</p>
          </div>

          <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-5">
            <p className="font-semibold text-red-700 dark:text-red-400 mb-2" data-testid="verdict-bad">Red flag (3–4 signals missing)</p>
            <p className="text-sm text-muted-foreground mb-2">Example: Quote leads with "$599/month" and mentions the vehicle as "only $44,900 with all the upgrades." No OTD price, no fee breakdown, no itemized add-ons, no APR disclosed. The "upgrades" are not listed.</p>
            <p className="text-sm text-muted-foreground">This isn't a quote — it's a pitch. Do not visit the dealership without getting a full OTD price in writing first. <Link href="/dealer-pricing-tactics" className="underline text-foreground">Common dealer pricing tactics</Link> explain why quotes are often structured this way deliberately.</p>
          </div>
        </div>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">What to check before you sign</h2>

        <ul className="space-y-2 mb-6 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground">•</span>
            <span>Is the OTD price in writing with individual line items? If not, request it before any further negotiation.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground">•</span>
            <span>Does the doc fee match what's typical for your state? Fees vary widely — a $995 doc fee in a state that caps at $85 is a red flag.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground">•</span>
            <span>Are add-ons listed with individual names and prices? If you see a bundled "protection package," ask to see each item and its price separately.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground">•</span>
            <span>Do you know the APR and loan term — not just the monthly payment? Run the numbers: multiply monthly payment × number of payments and subtract the vehicle price. The difference is what you're paying in interest and fees.</span>
          </li>
        </ul>

        <div className="rounded-lg border border-border bg-muted/30 p-5 mb-8">
          <p className="text-sm font-medium text-foreground mb-2">If you're looking at a real quote right now</p>
          <p className="text-sm text-muted-foreground">
            <Link href="/analyze" className="underline text-foreground">Paste it into Odigos</Link> and get a verdict in seconds. Odigos checks for all four signals and flags what's missing or risky — no signup required.
          </p>
        </div>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Why dealers sometimes leave signals out</h2>

        <p className="text-lg text-muted-foreground mb-6">
          A missing OTD price or bundled fee line isn't always deliberate. Dealership workflows vary, and some staff send quotes in whatever format they habitually use. But missing information — whatever the reason — puts the buyer at a disadvantage. You're being asked to make a large financial decision without the full picture.
        </p>

        <p className="text-lg text-muted-foreground mb-8">
          When you ask for a complete, itemized OTD price in writing, a cooperative dealer will provide it promptly. If a dealer resists or says the numbers "depend on financing" before you've agreed to anything, that's a signal about how the rest of the transaction will go. For a step-by-step evaluation process, see <Link href="/how-to-tell-if-a-car-deal-is-good" className="underline text-foreground">how to tell if a car deal is good</Link>.
        </p>
      </div>

      <ArticleCta />

      <p className="text-xs text-muted-foreground mt-12">
        Not affiliated with any dealership. Optimized for U.S. car purchases.
      </p>
    </ArticleLayout>
  );
}
