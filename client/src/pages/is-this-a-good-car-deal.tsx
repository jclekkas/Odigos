import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";
import { setSeoMeta } from "@/lib/seo";
import { articleSchema } from "@/lib/jsonld";
import ArticleLayout from "@/components/ArticleLayout";
import ArticleCta from "@/components/ArticleCta";

export default function IsThisAGoodCarDeal() {
  useEffect(() => {
    setSeoMeta({
      title: "Is This a Good Car Deal? 4-Step Checklist & Red Flags | Odigos",
      description: "Learn how to tell if a car deal is actually good using a 4-step checklist covering OTD price, fees, add-ons, and financing. Includes verdict tiers and red flags most buyers miss.",
      path: "/is-this-a-good-car-deal",
    });
  }, []);

  return (
    <ArticleLayout title="Is This a Good Car Deal?">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(articleSchema({ title: "Is This a Good Car Deal? 4-Step Checklist & Red Flags | Odigos", description: "Learn how to tell if a car deal is actually good using a 4-step checklist covering OTD price, fees, add-ons, and financing. Includes verdict tiers and red flags most buyers miss.", path: "/is-this-a-good-car-deal" }))}</script>
      </Helmet>
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 leading-tight" data-testid="text-good-deal-headline">
        Is This a Good Car Deal? The Four-Step Checklist
      </h1>

      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p className="text-lg text-muted-foreground">
          A car deal is only evaluable if you have the right information in front of you. Most quotes — emails, texts, or printouts from the dealer — are missing at least one critical number. The fastest way to assess a deal is to check four signals. If all four are present and clean, the deal is worth considering. If one or more are missing, you have a problem.
        </p>

        <h2 className="text-2xl font-semibold text-foreground">The four signals that separate good deals from bad ones</h2>

        <ul className="space-y-4 mb-8 text-muted-foreground">
          <li className="flex items-start gap-3">
            <span className="font-bold text-foreground mt-1">1.</span>
            <div>
              <strong className="text-foreground">Out-the-door price is provided in writing.</strong>
              <span className="block mt-1">The <Link href="/out-the-door-price" className="underline text-foreground">OTD price</Link> is the total you pay to drive the car home — vehicle price, taxes, title, registration, doc fee, and any add-ons all included. If the dealer hasn't given you a single, final number, you can't evaluate the deal. Ask specifically: "Can you send me the full out-the-door price with each line item listed separately?"</span>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="font-bold text-foreground mt-1">2.</span>
            <div>
              <strong className="text-foreground">Every fee is itemized, not bundled.</strong>
              <span className="block mt-1">Doc fees, preparation fees, and dealer charges should appear as individual line items. If you see a single "dealer fees" line covering everything, something may be buried. <Link href="/hidden-dealer-fees" className="underline text-foreground">Hidden dealer fees</Link> are one of the most common sources of surprise charges at signing. A very high doc fee in a state with a cap is a red flag — see <Link href="/dealer-doc-fee" className="underline text-foreground">what a dealer doc fee is</Link> for context.</span>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="font-bold text-foreground mt-1">3.</span>
            <div>
              <strong className="text-foreground">Add-ons are listed separately with individual prices.</strong>
              <span className="block mt-1">Protection packages, paint sealant, VIN etching, and extended warranties should each appear as separate, named line items. If they're bundled together or missing from the quote but appear in the OTD total, you're paying for something you didn't see. <Link href="/are-dealer-add-ons-mandatory" className="underline text-foreground">Dealer add-ons are rarely mandatory</Link> — but they are easy to miss.</span>
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

        <h2 className="text-2xl font-semibold text-foreground">Good, borderline, and bad — what each looks like</h2>

        <div className="space-y-6 mb-8">
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-5">
            <p className="font-semibold text-emerald-700 dark:text-emerald-400 mb-2" data-testid="verdict-good">Good deal (all 4 signals present)</p>
            <p className="text-sm text-muted-foreground mb-2">Example: Quote shows $34,800 OTD with a line-item breakdown: $31,200 vehicle price, $895 doc fee, $2,200 sales tax, $305 title/registration, zero add-ons. Financing: 60 months at 6.4% APR, $525/month.</p>
            <p className="text-sm text-muted-foreground">This is evaluable. You can compare it to other quotes, verify the doc fee is reasonable for your state, and decide whether the APR is competitive. The deal may or may not be great — but you have what you need to decide.</p>
          </div>

          <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-5">
            <p className="font-semibold text-amber-700 dark:text-amber-400 mb-2" data-testid="verdict-borderline">Borderline (1–2 signals missing or unclear)</p>
            <p className="text-sm text-muted-foreground mb-2">Example: Quote shows a vehicle price and a monthly payment, but no OTD total. Fees are listed as a single "$1,850 dealer fees" line. No itemized add-ons. APR is mentioned as "depending on credit."</p>
            <p className="text-sm text-muted-foreground">The deal might be fine, but you don't have the information to know. Before proceeding, ask for the full OTD breakdown in writing and an itemized fee list.</p>
          </div>

          <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-5">
            <p className="font-semibold text-red-700 dark:text-red-400 mb-2" data-testid="verdict-bad">Red flag (3–4 signals missing)</p>
            <p className="text-sm text-muted-foreground mb-2">Example: Quote leads with "$599/month" and mentions the vehicle as "only $44,900 with all the upgrades." No OTD price, no fee breakdown, no itemized add-ons, no APR disclosed.</p>
            <p className="text-sm text-muted-foreground">This isn't a quote — it's a pitch. Do not visit the dealership without getting a full OTD price in writing first. <Link href="/dealer-pricing-tactics" className="underline text-foreground">Common dealer pricing tactics</Link> explain why quotes are structured this way.</p>
          </div>
        </div>

        <div className="rounded-lg border border-blue-600/20 bg-blue-600/5 p-6 mb-8" data-testid="cta-mid-article">
          <p className="text-base font-semibold text-foreground mb-2">The fastest way to get a verdict on your quote</p>
          <p className="text-sm text-muted-foreground">
            Paste your quote. Odigos checks all four signals, flags hidden fees, identifies forced add-ons, and gives you a GO / NO-GO verdict — no signup required.
          </p>
          <Button asChild variant="cta" className="font-semibold" data-testid="button-cta-best-way">
            <Link href="/analyze">Check my deal now</Link>
          </Button>
        </div>

        <h2 className="text-2xl font-semibold text-foreground">Step-by-step: how to evaluate any deal</h2>

        <p className="text-lg text-muted-foreground">
          Work through these in order. Each step builds on the one before it.
        </p>

        <h3 className="text-lg font-semibold text-foreground">Step 1: Get the out-the-door price in writing</h3>
        <p className="text-muted-foreground">
          If the dealer hasn't given you an OTD total, that is the first thing to request. If the dealer says OTD "depends on credit" or "we'll figure it out when you come in" — that's a tactic, not an answer. A vehicle price, tax rate, and fee total are known before financing is selected. If the dealer consistently avoids giving you a written OTD price, see <Link href="/why-dealers-wont-give-out-the-door-price" className="underline text-foreground">why dealers resist OTD pricing</Link>.
        </p>

        <h3 className="text-lg font-semibold text-foreground">Step 2: Itemize every fee</h3>
        <p className="text-muted-foreground">
          Government fees (sales tax, title, registration) are fixed and non-negotiable. Dealer fees (doc fee, prep fee, market adjustment) are set by the dealer. If any fees are bundled into a single "dealer fees" line, ask for them broken out individually. Bundling makes it easy to slip in charges that wouldn't survive individual scrutiny.
        </p>

        <h3 className="text-lg font-semibold text-foreground">Step 3: Isolate every add-on</h3>
        <p className="text-muted-foreground">
          Look for "protection package," "appearance package," or items described as "already installed." Ask for each item and its individual price. Extended warranties in the OTD price belong in a separate conversation. For a full breakdown of what each add-on is, see <Link href="/dealer-add-ons-explained" className="underline text-foreground">dealer add-ons explained</Link>.
        </p>

        <h3 className="text-lg font-semibold text-foreground">Step 4: Verify the financing terms</h3>
        <p className="text-muted-foreground">
          You need three numbers — APR, loan term, and monthly payment. Monthly payment alone tells you nothing. Multiply monthly payment by number of payments and subtract the vehicle price — the difference is what you're paying in interest and fees. The <Link href="/monthly-payment-trap" className="underline text-foreground">monthly payment trap</Link> shifts attention away from total cost. Always evaluate by OTD price and total loan cost.
        </p>

        <h2 className="text-2xl font-semibold text-foreground">Why this is hard to do manually</h2>

        <ul className="space-y-2 mb-6 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span>•</span>
            <span><strong className="text-foreground">You don't know what's normal for your state.</strong> Doc fees vary from $85 to $999 depending on where you are. A fee that's outrageous in California is standard in Florida.</span>
          </li>
          <li className="flex items-start gap-2">
            <span>•</span>
            <span><strong className="text-foreground">You might not know what add-ons look like in a quote.</strong> "Paint sealant," "Perma-Plate," "Etching," and "Protection plan" can all mean the same thing — or different things.</span>
          </li>
          <li className="flex items-start gap-2">
            <span>•</span>
            <span><strong className="text-foreground">Missing information is hard to notice.</strong> If the OTD total looks reasonable on the surface, a missing fee or undisclosed add-on doesn't announce itself.</span>
          </li>
          <li className="flex items-start gap-2">
            <span>•</span>
            <span><strong className="text-foreground">You're evaluating under time pressure.</strong> Dealers often create urgency — "this price is only good today." Manual evaluation done well takes time that the buying context works against.</span>
          </li>
        </ul>

        <h2 className="text-2xl font-semibold text-foreground">What to check before you sign</h2>

        <ul className="space-y-2 mb-6 text-muted-foreground">
          <li className="flex items-start gap-2"><span>•</span><span>OTD price received in writing with individual line items</span></li>
          <li className="flex items-start gap-2"><span>•</span><span>All dealer fees identified and individually named</span></li>
          <li className="flex items-start gap-2"><span>•</span><span>All add-ons listed by name with individual prices</span></li>
          <li className="flex items-start gap-2"><span>•</span><span>APR and loan term confirmed — not just monthly payment</span></li>
          <li className="flex items-start gap-2"><span>•</span><span>Final numbers match what was discussed — no new charges appear at signing</span></li>
        </ul>

        <p className="text-lg text-muted-foreground">
          Once you have all four data points, you can compare the deal against other quotes. The only valid comparison is <Link href="/how-to-compare-car-deals" className="underline text-foreground">OTD price to OTD price</Link> — anything else is comparing apples to incomplete information.
        </p>
      </div>

      <ArticleCta />

      <p className="text-xs text-muted-foreground mt-12">
        Not affiliated with any dealership. Optimized for U.S. car purchases.
      </p>
    </ArticleLayout>
  );
}
