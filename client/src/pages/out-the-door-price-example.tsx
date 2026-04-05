import { useEffect } from "react";
import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { setSeoMeta } from "@/lib/seo";
import { articleSchema } from "@/lib/jsonld";
import ArticleLayout from "@/components/ArticleLayout";
import ArticleCta from "@/components/ArticleCta";

export default function OutTheDoorPriceExample() {
  useEffect(() => {
    return setSeoMeta({
      title: "OTD Price Example: 3 Real Scenarios Compared | Odigos",
      description: "A $33,500 car becomes $37,947 after taxes, fees, and add-ons. Three real OTD scenarios with exact dollar amounts on every line so you know what to expect.",
      path: "/out-the-door-price-example",
    });
  }, []);

  const scenario1 = [
    { label: "Vehicle sale price (negotiated below MSRP of $35,200)", value: "$33,500" },
    { label: "Sales tax — 7.25% on $33,500", value: "$2,429" },
    { label: "Title fee (Texas)", value: "$33" },
    { label: "Registration fee (Texas, based on vehicle value)", value: "$356" },
    { label: "Dealer documentation fee", value: "$299" },
    { label: "Paint protection package", value: "$895" },
    { label: "Nitrogen-filled tires", value: "$199" },
    { label: "VIN etching", value: "$236" },
    { label: "Total Out-the-Door Price", value: "$37,947", isTotal: true },
  ];

  const scenario2 = [
    { label: "Vehicle sale price", value: "$33,500" },
    { label: "Sales tax — 7.25% on $33,500", value: "$2,429" },
    { label: "Title fee (Texas)", value: "$33" },
    { label: "Registration fee (Texas)", value: "$356" },
    { label: "Dealer documentation fee", value: "$299" },
    { label: "Total Out-the-Door Price (no add-ons)", value: "$36,617", isTotal: true },
  ];

  const scenario3 = [
    { label: "MSRP", value: "$35,200" },
    { label: "Market adjustment", value: "+$3,000" },
    { label: "Adjusted sale price", value: "$38,200" },
    { label: "Sales tax — 7.25% on $38,200", value: "$2,770" },
    { label: "Title fee", value: "$33" },
    { label: "Registration fee", value: "$356" },
    { label: "Dealer documentation fee", value: "$599" },
    { label: "Protection package (bundled)", value: "$1,295" },
    { label: "Total Out-the-Door Price", value: "$43,253", isTotal: true },
  ];

  return (
    <ArticleLayout title="Out-the-Door Price Example: Real Numbers, Line by Line" breadcrumbPath="/out-the-door-price-example">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(articleSchema({ title: "OTD Price Example: 3 Real Scenarios Compared | Odigos", description: "A $33,500 car becomes $37,947 after taxes, fees, and add-ons. Three real OTD scenarios with exact dollar amounts on every line so you know what to expect.", path: "/out-the-door-price-example" }))}</script>
      </Helmet>
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 leading-[1.15]" data-testid="text-otd-example-headline">
        Out-the-Door Price Example: Real Numbers, Line by Line
      </h1>

      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p className="text-lg text-muted-foreground mb-4">
          Abstract explanations of OTD pricing only go so far. Below are three real scenarios — a clean deal, the same deal with add-ons, and a high-pressure scenario with a market adjustment — with exact dollar amounts on every line.
        </p>
        <p className="text-muted-foreground mb-10">
          The vehicle: a 2025 midsize SUV in Texas with an MSRP of $35,200. The buyer negotiated the sale price down to $33,500.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Scenario A: Clean Deal with Common Add-Ons</h2>
        <p className="text-muted-foreground mb-3">
          This is what a typical dealer quote looks like with fees and three common add-ons included.
        </p>
        <div className="rounded-md border border-border overflow-hidden mb-4" data-testid="table-scenario-a">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left py-2.5 px-4 font-medium text-muted-foreground">Line Item</th>
                <th className="text-right py-2.5 px-4 font-medium text-muted-foreground">Amount</th>
              </tr>
            </thead>
            <tbody>
              {scenario1.map((row) => (
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
        <p className="text-muted-foreground mb-4">
          The add-ons — paint protection, nitrogen tires, VIN etching — add $1,330 above the fees-only price. None of these are required by law. For guidance on which add-ons you can decline, see <Link href="/are-dealer-add-ons-mandatory" className="underline text-foreground">whether dealer add-ons are mandatory</Link>.
        </p>
        <p className="text-muted-foreground mb-8">
          The buyer paid $4,447 above the negotiated sale price. That's 13.3% above the number they thought they were locking in.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Scenario B: Same Deal, No Add-Ons</h2>
        <p className="text-muted-foreground mb-3">
          The buyer declines all three add-ons. Everything else is identical.
        </p>
        <div className="rounded-md border border-border overflow-hidden mb-4" data-testid="table-scenario-b">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left py-2.5 px-4 font-medium text-muted-foreground">Line Item</th>
                <th className="text-right py-2.5 px-4 font-medium text-muted-foreground">Amount</th>
              </tr>
            </thead>
            <tbody>
              {scenario2.map((row) => (
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
          Declining the three add-ons saves $1,330. Scenario A's OTD was $37,947; Scenario B is $36,617. The $1,330 difference is entirely add-on cost.
        </p>

        <div className="my-10 p-6 rounded-lg bg-muted/30 border border-border">
          <p className="text-sm font-semibold text-foreground mb-2">If you're looking at a real quote…</p>
          <p className="text-sm text-muted-foreground mb-3">
            Paste your dealer's numbers into Odigos and see immediately whether the total adds up, what's missing, and whether any line items look inflated.
          </p>
          <Link href="/analyze">
            <button className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors" data-testid="button-cta-mid-article">
              Check My OTD Numbers
            </button>
          </Link>
        </div>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Scenario C: Market Adjustment and High Doc Fee</h2>
        <p className="text-muted-foreground mb-3">
          Same vehicle. The dealer adds a $3,000 market adjustment above MSRP, charges a higher doc fee, and bundles add-ons into a "protection package."
        </p>
        <div className="rounded-md border border-border overflow-hidden mb-4" data-testid="table-scenario-c">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left py-2.5 px-4 font-medium text-muted-foreground">Line Item</th>
                <th className="text-right py-2.5 px-4 font-medium text-muted-foreground">Amount</th>
              </tr>
            </thead>
            <tbody>
              {scenario3.map((row) => (
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
        <p className="text-muted-foreground mb-4">
          Scenario C costs $43,253 — $6,636 more than Scenario B for the same vehicle. The gap comes from:
        </p>
        <ul className="space-y-2 mb-8 text-muted-foreground">
          {[
            "$3,000 market adjustment (negotiable or avoidable at another dealer)",
            "$300 higher doc fee (dealer-set, varies widely)",
            "$1,295 protection package (typically optional)",
            "Higher tax base because the market adjustment inflates the taxable sale price",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="text-amber-500 mt-1.5 shrink-0">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">What the Numbers Show</h2>
        <div className="rounded-md border border-border overflow-hidden mb-4" data-testid="table-scenario-summary">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left py-2.5 px-4 font-medium text-muted-foreground">Scenario</th>
                <th className="text-right py-2.5 px-4 font-medium text-muted-foreground">OTD Price</th>
                <th className="text-right py-2.5 px-4 font-medium text-muted-foreground">Above MSRP</th>
              </tr>
            </thead>
            <tbody>
              {[
                { scenario: "A — Sale price + add-ons", otd: "$37,947", above: "+$2,747" },
                { scenario: "B — Sale price, no add-ons", otd: "$36,617", above: "+$1,417" },
                { scenario: "C — Market adj + add-ons", otd: "$43,253", above: "+$8,053" },
              ].map((row) => (
                <tr key={row.scenario} className="border-t border-border/50">
                  <td className="py-2.5 px-4 text-muted-foreground">{row.scenario}</td>
                  <td className="py-2.5 px-4 text-right text-muted-foreground">{row.otd}</td>
                  <td className="py-2.5 px-4 text-right text-muted-foreground">{row.above}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-muted-foreground mb-8">
          The same vehicle, from different dealers, can have a real-world OTD price spread of over $6,600. This is why asking for a complete, itemized OTD quote from multiple dealers is the single most effective thing a buyer can do. For a full explanation of every category, see our page on <Link href="/what-does-out-the-door-price-include" className="underline text-foreground">what the OTD price includes</Link>. For real-world examples, see <Link href="/car-dealer-fees-florida" className="underline text-foreground">Florida — where doc fees alone can hit $999</Link> — or compare with <Link href="/car-dealer-fees-illinois" className="underline text-foreground">Illinois, where doc fees are capped at $378</Link>.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">What to Say to Get These Numbers</h2>
        <p className="text-muted-foreground mb-3">
          Request the complete OTD breakdown before you visit any dealership:
        </p>
        <div className="rounded-lg border border-border bg-muted/40 p-5 mb-4" data-testid="block-dealer-script">
          <blockquote className="text-sm md:text-base text-foreground leading-relaxed italic">
            "Can you send me the full out-the-door price in writing? I need the sale price, taxes, title, registration, doc fee, and any dealer add-ons listed separately with individual pricing."
          </blockquote>
        </div>
        <p className="text-muted-foreground mb-4">
          Dealers who provide this upfront are the ones worth visiting. Dealers who deflect to monthly payments or "come in and we'll figure it out" are protecting the flexibility you saw in Scenario C.
        </p>
        <p className="text-muted-foreground mb-8">
          If you already have a quote and want to understand whether the numbers add up, see our overview of the <Link href="/out-the-door-price" className="underline text-foreground">out-the-door price</Link> to verify every line.
        </p>
      </div>

      <ArticleCta />

      <p className="text-xs text-muted-foreground mt-12">
        Not affiliated with any dealership. Built for U.S. car buyers.
      </p>
    </ArticleLayout>
  );
}
