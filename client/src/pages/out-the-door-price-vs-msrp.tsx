import { useEffect } from "react";
import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { setSeoMeta } from "@/lib/seo";
import { articleSchema } from "@/lib/jsonld";
import ArticleLayout from "@/components/ArticleLayout";
import ArticleCta from "@/components/ArticleCta";

export default function OutTheDoorPriceVsMsrp() {
  useEffect(() => {
    setSeoMeta({
      title: "Out-the-Door Price vs. MSRP: The Gap Buyers Miss | Odigos",
      description: "MSRP is a suggestion, not what you pay. Taxes, fees, and add-ons push real cost 8–15% above the sticker. Here's how to use that gap to your advantage.",
      path: "/out-the-door-price-vs-msrp",
    });
  }, []);

  return (
    <ArticleLayout title="Out-the-Door Price vs. MSRP: The Gap Buyers Miss">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(articleSchema({ title: "Out-the-Door Price vs. MSRP: The Gap Buyers Miss | Odigos", description: "MSRP is a suggestion, not what you pay. Taxes, fees, and add-ons push real cost 8–15% above the sticker. Here's how to use that gap to your advantage.", path: "/out-the-door-price-vs-msrp" }))}</script>
      </Helmet>
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 leading-[1.15]" data-testid="text-otd-msrp-headline">
        Out-the-Door Price vs. MSRP: The Gap Buyers Miss
      </h1>

      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p className="text-lg text-muted-foreground mb-4">
          MSRP is the number on the window sticker. The out-the-door price is what you actually pay when you leave. These two numbers are rarely the same — and the gap between them is where most car buyers get surprised.
        </p>
        <p className="text-muted-foreground mb-10">
          Understanding the difference before you negotiate protects you from anchoring to a number that was never the real price.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">What MSRP Actually Is</h2>
        <p className="text-muted-foreground mb-3">
          MSRP stands for Manufacturer's Suggested Retail Price. It is set by the manufacturer — not the dealer — and it covers one thing only: the vehicle itself, including any factory-installed options and packages.
        </p>
        <p className="text-muted-foreground mb-3">What MSRP does not include:</p>
        <ul className="space-y-2 mb-4 text-muted-foreground">
          {[
            "State and local sales tax",
            "Title and registration fees",
            "Dealer documentation fees",
            "Dealer-installed accessories or protection packages",
            "Market adjustment charges",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="text-muted-foreground mb-8">
          The word "suggested" is accurate: dealers can sell above or below MSRP, and often do. MSRP is a manufacturer's signal to the market — it is not a price you pay.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">MSRP as a Negotiation Starting Point</h2>
        <p className="text-muted-foreground mb-3">
          Many buyers treat MSRP as the real price. Dealers know this and use it to their advantage. When you anchor to MSRP in a negotiation, the dealer controls the conversation around discounts — "we're giving you $1,500 off MSRP" sounds generous, even if the deal still includes $2,000 in add-ons you didn't ask for.
        </p>
        <p className="text-muted-foreground mb-3">The better anchor is the out-the-door price because:</p>
        <ul className="space-y-2 mb-8 text-muted-foreground">
          {[
            "It includes every cost, so there's no room for fees to appear later",
            "It's the number you can compare across multiple dealers",
            "It can't be manipulated by adjusting loan terms or payment structure",
            "Dealers who won't commit to an OTD number are protecting room to add fees",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">How Wide Is the Gap?</h2>
        <p className="text-muted-foreground mb-3">
          For most buyers in most states, the out-the-door price runs 8–15% above MSRP before dealer add-ons. Here's a typical breakdown on a $35,000 vehicle:
        </p>
        <div className="rounded-md border border-border overflow-hidden mb-4" data-testid="table-msrp-vs-otd">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left py-2.5 px-4 font-medium text-muted-foreground">Component</th>
                <th className="text-right py-2.5 px-4 font-medium text-muted-foreground">Estimated Amount</th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: "MSRP (window sticker)", value: "$35,000" },
                { label: "Negotiated sale price (below MSRP)", value: "$33,500" },
                { label: "Sales tax (7%)", value: "$2,345" },
                { label: "Title fee", value: "$150" },
                { label: "Registration fee", value: "$350" },
                { label: "Dealer doc fee", value: "$499" },
                { label: "Paint protection package (optional)", value: "$895" },
                { label: "Total Out-the-Door Price", value: "$37,739", isTotal: true },
              ].map((row) => (
                <tr
                  key={row.label}
                  className={row.isTotal ? "border-t-2 border-border bg-muted/30 font-semibold" : "border-t border-border/50"}
                >
                  <td className={`py-2.5 px-4 ${row.isTotal ? "text-foreground" : "text-muted-foreground"}`}>{row.label}</td>
                  <td className={`py-2.5 px-4 text-right ${row.isTotal ? "text-foreground" : "text-muted-foreground"}`}>{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-muted-foreground mb-8">
          Even after negotiating $1,500 below MSRP, the OTD price is $2,739 above the sticker — and that's without add-ons. With the protection package included, the buyer pays $4,239 more than the MSRP they anchored to.
        </p>

        <div className="my-10 p-6 rounded-lg bg-muted/30 border border-border">
          <p className="text-sm font-semibold text-foreground mb-2">If you're looking at a real quote…</p>
          <p className="text-sm text-muted-foreground mb-3">
            Paste it into Odigos and see how your OTD price compares to what the dealer is presenting as the vehicle price. Results usually take about a minute.
          </p>
          <Link href="/analyze">
            <button className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors" data-testid="button-cta-mid-article">
              Analyze My Dealer Quote
            </button>
          </Link>
        </div>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">When Dealers Sell Above MSRP</h2>
        <p className="text-muted-foreground mb-3">
          During periods of limited supply — a new model launch, production delays, or high-demand vehicles — dealers sometimes add a "market adjustment" on top of MSRP. This is an invented charge that has no relationship to the vehicle's value or cost.
        </p>
        <ul className="space-y-2 mb-4 text-muted-foreground">
          {[
            "Market adjustments can add $2,000–$10,000+ above MSRP on popular vehicles",
            "They are not regulated in most states and dealers can charge whatever the market will bear",
            "The OTD price will include the market adjustment — so you'll see it if you ask for full itemization",
            "If a market adjustment appears in your quote, it's negotiable — especially if you have competing offers",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="text-muted-foreground mb-8">
          For more on market adjustments, see our guide to <Link href="/market-adjustment-fee" className="underline text-foreground">market adjustment fees</Link>.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">When Dealers Sell Below MSRP</h2>
        <p className="text-muted-foreground mb-3">
          On slower-moving vehicles or at end of model year, dealers sometimes price below MSRP to move inventory. This looks like a discount — but watch for add-ons that close the gap. A vehicle sold $2,000 below MSRP with $2,500 in mandatory add-ons is not a discount.
        </p>
        <p className="text-muted-foreground mb-8">
          The only number that reveals the real cost is the full, itemized out-the-door price. For a complete explanation of what that includes, see <Link href="/what-does-out-the-door-price-include" className="underline text-foreground">what the out-the-door price includes</Link>.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">How to Use This in Negotiation</h2>
        <p className="text-muted-foreground mb-3">
          When you contact a dealer, skip the MSRP conversation entirely. Ask for the full out-the-door price. This reframes the discussion:
        </p>
        <ul className="space-y-2 mb-4 text-muted-foreground">
          {[
            "You're no longer negotiating against a sticker — you're comparing total costs",
            "Dealers who give you an OTD number upfront are easier to work with and compare",
            "Dealers who deflect to MSRP or monthly payments are protecting room to add fees",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="text-muted-foreground mb-8">
          If a dealer won't commit to an out-the-door number before you come in, read our guide on <Link href="/dealer-wont-give-otd-price" className="underline text-foreground">what to do when a dealer won't give the OTD price</Link>.
        </p>
      </div>

      <ArticleCta />

      <p className="text-xs text-muted-foreground mt-12">
        Not affiliated with any dealership. Built for U.S. car buyers.
      </p>
    </ArticleLayout>
  );
}
