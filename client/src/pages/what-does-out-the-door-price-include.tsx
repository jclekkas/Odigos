import { useEffect } from "react";
import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { setSeoMeta } from "@/lib/seo";
import { articleSchema } from "@/lib/jsonld";
import ArticleLayout from "@/components/ArticleLayout";
import ArticleCta from "@/components/ArticleCta";

export default function WhatDoesOutTheDoorPriceInclude() {
  useEffect(() => {
    return setSeoMeta({
      title: "What Does OTD Price Include? (6 Line Items) | Odigos",
      description: "OTD price has six categories: vehicle price, sales tax, title, registration, doc fee, and add-ons. Here's what each line item means — and what to check.",
      path: "/what-does-out-the-door-price-include",
    });
  }, []);

  return (
    <ArticleLayout title="What Does Out-the-Door Price Include?" breadcrumbPath="/what-does-out-the-door-price-include">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(articleSchema({ title: "What Does OTD Price Include? (6 Line Items) | Odigos", description: "OTD price has six categories: vehicle price, sales tax, title, registration, doc fee, and add-ons. Here's what each line item means — and what to check.", path: "/what-does-out-the-door-price-include" }))}</script>
      </Helmet>
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 leading-[1.15]" data-testid="text-otd-include-headline">
        What Does Out-the-Door Price Include?
      </h1>

      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p className="text-lg text-muted-foreground mb-4">
          The out-the-door price is every dollar you pay to drive the car home — not just the sticker price. Understanding what's inside that number is how you catch fees before they surprise you at signing.
        </p>
        <p className="text-muted-foreground mb-10">
          Below is a line-by-line breakdown of what should appear in a complete OTD quote.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">1. Negotiated Vehicle Price</h2>
        <p className="text-muted-foreground mb-3">
          This is the agreed sale price of the car itself — the number you negotiated down from MSRP or the dealer's asking price. It should be stated as a specific dollar amount, not a range. This is the foundation every other line item is calculated from.
        </p>
        <p className="text-muted-foreground mb-3">What to check:</p>
        <ul className="space-y-2 mb-8 text-muted-foreground">
          {[
            "Does it match the advertised or agreed price?",
            "Is any \"dealer discount\" already subtracted, or listed separately?",
            "Are rebates and incentives shown as credits reducing this number, or listed elsewhere?",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">2. Sales Tax</h2>
        <p className="text-muted-foreground mb-3">
          Sales tax is calculated as a percentage of the vehicle's sale price and is set by your state and sometimes your county or city. It is not negotiable — the rate is fixed by law — but the amount you pay depends on the sale price you negotiate.
        </p>
        <p className="text-muted-foreground mb-3">Key points:</p>
        <ul className="space-y-2 mb-8 text-muted-foreground">
          {[
            "Rates range from 0% (some states) to over 10% in high-tax jurisdictions",
            "In most states, tax is applied to the vehicle price after any trade-in credit",
            "Trade-in tax savings can meaningfully reduce this number",
            "Always verify the rate against your county's published rate — errors happen",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">3. Title Fee</h2>
        <p className="text-muted-foreground mb-3">
          The title fee transfers legal ownership of the vehicle into your name. It is paid to the state, not to the dealer. Dealers collect it and forward it to the DMV.
        </p>
        <ul className="space-y-2 mb-8 text-muted-foreground">
          {[
            "Typically $15–$200 depending on the state",
            "This is a fixed state fee — the dealer cannot add a markup",
            "If you see a \"title fee\" significantly above the state rate, ask for documentation",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">4. Registration Fee</h2>
        <p className="text-muted-foreground mb-3">
          Registration fees cover licensing your vehicle to operate on public roads. The amount is set by the state and often scales with vehicle weight, value, or age.
        </p>
        <ul className="space-y-2 mb-8 text-muted-foreground">
          {[
            "Varies widely by state: $30–$500+ is a normal range",
            "Some states charge a flat fee; others calculate it as a percentage of the vehicle's value",
            "Dealers typically collect and remit this to the DMV",
            "If paying cash, you may be able to handle registration yourself in some states",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <div className="my-10 p-6 rounded-lg bg-muted/30 border border-border">
          <p className="text-sm font-semibold text-foreground mb-2">If you're looking at a real quote…</p>
          <p className="text-sm text-muted-foreground mb-3">
            Paste it into Odigos and we'll flag any line items that look off, missing, or inflated — before you respond to the dealer.
          </p>
          <Link href="/analyze">
            <button className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors" data-testid="button-cta-mid-article">
              Check My Dealer Quote
            </button>
          </Link>
        </div>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">5. Dealer Documentation Fee</h2>
        <p className="text-muted-foreground mb-3">
          The doc fee is charged by the dealer — not the government — for processing paperwork. It is one of the few fees with significant variation across dealerships, though some states cap it.
        </p>
        <ul className="space-y-2 mb-4 text-muted-foreground">
          {[
            "Ranges from $50 to $999+ depending on the dealer and state",
            "Some states cap it by law (e.g., California caps at ~$85). States with no cap, like Florida, commonly see $500–$1,000+",
            "Many dealers treat it as non-negotiable — but you can sometimes negotiate the vehicle price to offset it",
            "It should always appear as its own line item, not buried in a catch-all \"dealer fee\"",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="text-muted-foreground mb-8">
          For a full breakdown of doc fees by state, see our guide to <Link href="/dealer-doc-fee" className="underline text-foreground">dealer documentation fees</Link>.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">6. Dealer Add-Ons and Installed Accessories</h2>
        <p className="text-muted-foreground mb-3">
          This is the most variable — and most contested — category. Add-ons are products or services the dealer installs or bundles before delivery. Common examples:
        </p>
        <ul className="space-y-2 mb-4 text-muted-foreground">
          {[
            "Paint protection or ceramic coating",
            "Fabric/leather sealant",
            "VIN etching",
            "Nitrogen-filled tires",
            "Window tinting",
            "\"Protection packages\" (bundled add-ons under one price)",
            "Dealer-installed accessories like mudguards or cargo trays",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="text-muted-foreground mb-4">
          Unlike taxes and government fees, most dealer add-ons are not mandatory — even when presented that way. For specifics on which you can refuse, see our article on <Link href="/are-dealer-add-ons-mandatory" className="underline text-foreground">whether dealer add-ons are mandatory</Link>.
        </p>
        <p className="text-muted-foreground mb-8">
          A complete OTD quote itemizes each add-on individually with its own price. If they're bundled under a single "protection package" line, ask for the breakdown.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">What Should NOT Be in the OTD Price</h2>
        <p className="text-muted-foreground mb-3">
          Some fees appear on dealer worksheets but don't belong in a legitimate OTD:
        </p>
        <ul className="space-y-2 mb-8 text-muted-foreground">
          {[
            "\"Market adjustment\" fees — a dealer-invented charge above MSRP with no fixed basis",
            "\"Dealer prep\" or \"reconditioning\" fees — preparing a car for sale is the dealer's cost of doing business, not yours",
            "\"Advertising fees\" passed to the consumer — generally not a buyer's obligation",
            "Extended warranties or GAP insurance — these are financing products, not part of the vehicle price, and are almost always optional",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="text-amber-500 mt-1.5 shrink-0">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">A Complete OTD Quote: What It Looks Like</h2>
        <p className="text-muted-foreground mb-3">A properly formatted OTD quote shows every line item separately:</p>
        <div className="rounded-md border border-border overflow-hidden mb-8" data-testid="table-otd-components">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left py-2.5 px-4 font-medium text-muted-foreground">Category</th>
                <th className="text-left py-2.5 px-4 font-medium text-muted-foreground">Notes</th>
              </tr>
            </thead>
            <tbody>
              {[
                { cat: "Negotiated vehicle price", notes: "The price you agreed on" },
                { cat: "Sales tax", notes: "State + local rate × vehicle price" },
                { cat: "Title fee", notes: "State fee, fixed by law" },
                { cat: "Registration fee", notes: "State fee, fixed by law" },
                { cat: "Dealer doc fee", notes: "Dealer charge; varies widely" },
                { cat: "Add-ons (itemized)", notes: "Each product listed separately" },
                { cat: "Total OTD Price", notes: "Sum of all above" },
              ].map((row, i) => (
                <tr key={i} className={`border-t ${row.cat === "Total OTD Price" ? "border-t-2 border-border bg-muted/30 font-semibold" : "border-border/50"}`}>
                  <td className={`py-2.5 px-4 ${row.cat === "Total OTD Price" ? "text-foreground" : "text-muted-foreground"}`}>{row.cat}</td>
                  <td className={`py-2.5 px-4 ${row.cat === "Total OTD Price" ? "text-foreground" : "text-muted-foreground"}`}>{row.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-muted-foreground mb-4">
          If any of these categories is missing, the quote is incomplete. For a broader overview of OTD pricing and why it matters, see our guide on <Link href="/out-the-door-price" className="underline text-foreground">what an out-the-door price is</Link>. See how these components play out in practice with <Link href="/car-dealer-fees-florida" className="underline text-foreground">Florida's fee structure</Link> or <Link href="/car-dealer-fees-illinois" className="underline text-foreground">Illinois's fee breakdown</Link>.
        </p>
      </div>

      <ArticleCta />

      <p className="text-xs text-muted-foreground mt-12">
        Not affiliated with any dealership. Built for U.S. car buyers.
      </p>
    </ArticleLayout>
  );
}
