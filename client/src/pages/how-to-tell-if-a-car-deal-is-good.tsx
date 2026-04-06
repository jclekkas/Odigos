import { useEffect } from "react";
import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { setSeoMeta } from "@/lib/seo";
import { articleSchema } from "@/lib/jsonld";
import ArticleLayout from "@/components/ArticleLayout";
import ArticleCta from "@/components/ArticleCta";

export default function HowToTellIfACarDealIsGood() {
  useEffect(() => {
    setSeoMeta({
      title: "How to Tell if a Car Deal Is Good: OTD, Fees, Add-Ons, Financing | Odigos",
      description: "Use this four-step checklist to evaluate any car deal, including OTD price, hidden fees, add-ons, and financing traps.",
      path: "/how-to-tell-if-a-car-deal-is-good",
    });
  }, []);

  return (
    <ArticleLayout title="How to Tell if a Car Deal Is Good">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(articleSchema({ title: "How to Tell if a Car Deal Is Good: OTD, Fees, Add-Ons, Financing | Odigos", description: "Use this four-step checklist to evaluate any car deal, including OTD price, hidden fees, add-ons, and financing traps.", path: "/how-to-tell-if-a-car-deal-is-good" }))}</script>
      </Helmet>
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 leading-tight" data-testid="text-how-to-tell-headline">
        How to Tell if a Car Deal Is Good: The Four-Step Checklist
      </h1>

      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p className="text-lg text-muted-foreground mb-6">
          A car deal is only evaluable if you have the right information in front of you. Most quotes — emails, texts, or printouts from the dealer — are missing at least one critical number. This is the process for finding out what's actually there, what's missing, and what to do about it.
        </p>

        <p className="text-lg text-muted-foreground mb-6">
          Work through these four steps in order. Don't skip ahead. Each step builds on the one before it.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Step 1: Get the out-the-door price in writing</h2>

        <p className="text-lg text-muted-foreground mb-4">
          The <Link href="/out-the-door-price" className="underline text-foreground">out-the-door price</Link> is the total you pay to drive the car home. It includes the vehicle price, all taxes, title and registration fees, doc fee, and any add-ons. It is the only number that lets you compare one deal to another.
        </p>

        <p className="text-lg text-muted-foreground mb-4">
          If the dealer hasn't given you an OTD total, that is the first thing to request — before anything else. Email or text is fine. Ask specifically: "Can you send me the full out-the-door price with each line item listed separately?"
        </p>

        <ul className="space-y-2 mb-6 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground">•</span>
            <span><strong className="text-foreground">OTD provided with line items?</strong> You can move to Step 2.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground">•</span>
            <span><strong className="text-foreground">Only a vehicle price or monthly payment?</strong> The quote is incomplete. Ask before proceeding.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground">•</span>
            <span><strong className="text-foreground">Dealer says OTD "depends on credit" or "we'll figure it out when you come in"?</strong> That's a tactic, not an answer. A vehicle price, tax rate, and fee total are known before financing is selected.</span>
          </li>
        </ul>

        <p className="text-lg text-muted-foreground mb-6">
          If the dealer consistently avoids giving you a written OTD price, see <Link href="/dealer-wont-give-otd-price" className="underline text-foreground">why dealers won't give an out-the-door price</Link> — it explains the incentive behind the refusal and how to handle it.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Step 2: Itemize every fee</h2>

        <p className="text-lg text-muted-foreground mb-4">
          Once you have an OTD breakdown, go through each fee line. There are two categories: fees you can't change (government fees) and fees the dealer controls (dealer fees).
        </p>

        <p className="text-lg text-muted-foreground mb-4">
          <strong className="text-foreground">Government fees — fixed, non-negotiable:</strong>
        </p>
        <ul className="space-y-2 mb-4 text-muted-foreground">
          <li className="flex items-start gap-2"><span>•</span><span>Sales tax (set by your state and county)</span></li>
          <li className="flex items-start gap-2"><span>•</span><span>Title fee</span></li>
          <li className="flex items-start gap-2"><span>•</span><span>Registration fee</span></li>
        </ul>

        <p className="text-lg text-muted-foreground mb-4">
          <strong className="text-foreground">Dealer fees — set by the dealer:</strong>
        </p>
        <ul className="space-y-2 mb-6 text-muted-foreground">
          <li className="flex items-start gap-2"><span>•</span><span><strong className="text-foreground">Documentation fee (doc fee)</strong> — charged for processing paperwork. Ranges from $85 in states with a cap (California) to $800+ in states without one. A very high doc fee in a no-cap state is worth pushing back on. See <Link href="/what-is-a-dealer-doc-fee" className="underline text-foreground">what a dealer doc fee is</Link> for context.</span></li>
          <li className="flex items-start gap-2"><span>•</span><span><strong className="text-foreground">Preparation fee</strong> — sometimes listed, sometimes buried. This covers detailing and inspection costs that are typically dealer overhead, not a buyer charge.</span></li>
          <li className="flex items-start gap-2"><span>•</span><span><strong className="text-foreground">Market adjustment</strong> — an additional markup above MSRP, common during high-demand periods. Not a government fee and entirely negotiable.</span></li>
        </ul>

        <p className="text-lg text-muted-foreground mb-6">
          If any fees are bundled into a single line labeled "dealer fees" or "miscellaneous fees," ask for them to be broken out individually. Bundling makes it easy to slip in charges that wouldn't survive individual scrutiny.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Step 3: Isolate every add-on</h2>

        <p className="text-lg text-muted-foreground mb-4">
          Add-ons are dealer-installed extras — paint protection, fabric coating, VIN etching, nitrogen tires, theft systems, extended warranties. They're common, often high-margin, and frequently presented in a way that makes them seem like part of the vehicle.
        </p>

        <p className="text-lg text-muted-foreground mb-4">
          What to look for on the quote:
        </p>

        <ul className="space-y-2 mb-6 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground">•</span>
            <span><strong className="text-foreground">Protection package, appearance package, dealer package</strong> — these are usually bundles of 3–5 individual add-ons. Ask for each item and its individual price. Bundles obscure per-item cost.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground">•</span>
            <span><strong className="text-foreground">Items described as "already installed" or "required on all vehicles"</strong> — this is common framing for add-ons the dealer doesn't want to remove. <Link href="/are-dealer-add-ons-mandatory" className="underline text-foreground">Dealer add-ons are not mandatory</Link> — even pre-installed ones. The price can be negotiated.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground">•</span>
            <span><strong className="text-foreground">Extended warranty or "service contract" in the OTD price</strong> — this belongs in a separate conversation after you know the vehicle price, not bundled into the deal before you've agreed to anything.</span>
          </li>
        </ul>

        <p className="text-lg text-muted-foreground mb-6">
          For a full breakdown of what each add-on is and whether it's worth keeping, see <Link href="/dealer-add-ons-explained" className="underline text-foreground">dealer add-ons explained</Link>.
        </p>

        <div className="rounded-lg border border-border bg-muted/30 p-5 mb-8">
          <p className="text-sm font-medium text-foreground mb-2">If you have a quote and want to run it through this process</p>
          <p className="text-sm text-muted-foreground">
            <Link href="/analyze" className="underline text-foreground">Paste it into Odigos</Link>. It checks the OTD price, identifies each fee, flags bundled or suspicious add-ons, and tells you what's missing. No signup required.
          </p>
        </div>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Step 4: Verify the financing terms</h2>

        <p className="text-lg text-muted-foreground mb-4">
          If you're financing the vehicle, you need three numbers — not one:
        </p>

        <ul className="space-y-2 mb-6 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground">•</span>
            <span><strong className="text-foreground">APR (annual percentage rate)</strong> — the interest rate you're paying. Dealers often have relationships with lenders and earn a margin on the financing — the rate they offer is not necessarily the best rate you qualify for.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground">•</span>
            <span><strong className="text-foreground">Loan term (months)</strong> — longer terms lower the monthly payment but increase total cost. A 72-month loan at 7% costs significantly more than a 48-month loan at 7%.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground">•</span>
            <span><strong className="text-foreground">Monthly payment</strong> — useful only once you know the APR and term. Monthly payment alone tells you nothing meaningful about the deal.</span>
          </li>
        </ul>

        <p className="text-lg text-muted-foreground mb-6">
          The <Link href="/monthly-payment-trap" className="underline text-foreground">monthly payment trap</Link> is one of the most effective dealer tactics because it shifts attention away from total cost. Always evaluate a deal by OTD price and total loan cost — not by what the payment looks like per month.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">What to check before you sign</h2>

        <ul className="space-y-2 mb-8 text-muted-foreground">
          <li className="flex items-start gap-2"><span>•</span><span>OTD price received in writing with individual line items</span></li>
          <li className="flex items-start gap-2"><span>•</span><span>All dealer fees identified and individually named</span></li>
          <li className="flex items-start gap-2"><span>•</span><span>All add-ons listed by name with individual prices</span></li>
          <li className="flex items-start gap-2"><span>•</span><span>APR and loan term confirmed — not just monthly payment</span></li>
          <li className="flex items-start gap-2"><span>•</span><span>Final numbers match what was discussed — no new charges appear at signing</span></li>
        </ul>

        <p className="text-lg text-muted-foreground mb-8">
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
