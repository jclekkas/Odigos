import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";
import { setSeoMeta } from "@/lib/seo";
import { articleSchema } from "@/lib/jsonld";
import ArticleLayout from "@/components/ArticleLayout";
import ArticleCta from "@/components/ArticleCta";

export default function ResidualValueExplained() {
  useEffect(() => {
    setSeoMeta({
      title: "Residual Value Explained: How It Controls Your Lease Payment | Odigos",
      description: "Residual value is the biggest factor in your monthly lease payment. Learn what it is, who sets it, typical percentages by vehicle type, and how to use it to get a better deal.",
      path: "/residual-value-explained",
    });
  }, []);

  return (
    <ArticleLayout title="Residual Value Explained">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(articleSchema({ title: "Residual Value Explained: How It Controls Your Lease Payment | Odigos", description: "Residual value is the biggest factor in your monthly lease payment. Learn what it is, who sets it, typical percentages by vehicle type, and how to use it to get a better deal.", path: "/residual-value-explained" }))}</script>
      </Helmet>
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 leading-[1.15]" data-testid="text-residual-value-headline">
        Residual Value Explained: How It Controls Your Lease Payment
      </h1>

      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p className="text-lg text-muted-foreground mb-4">
          If you want to understand why one car leases for $350/month and a similarly priced car leases for $500/month, the answer is almost always <Link href="/glossary/residual-value" className="underline text-foreground">residual value</Link>. Residual value is the projected worth of the vehicle at the end of the lease term, and it has a larger impact on your monthly payment than any other single factor — including the sale price.
        </p>
        <p className="text-lg text-muted-foreground mb-10">
          This guide explains what residual value is, why it matters so much, and how to use it to your advantage when evaluating a lease.
        </p>

        <p className="text-sm text-muted-foreground mb-6">
          Already have a dealer quote? <Link href="/analyze" className="underline text-foreground">Paste it here</Link> and we'll show you the residual percentage and what it means for your deal.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">What Is Residual Value?</h2>
        <p className="text-muted-foreground mb-4">
          Residual value is the leasing company's estimate of what your vehicle will be worth when your lease ends. It's expressed as a percentage of the vehicle's MSRP (manufacturer's suggested retail price) — not the negotiated sale price.
        </p>
        <p className="text-muted-foreground mb-4">
          For example, a $45,000 vehicle with a 58% residual value on a 36-month lease has a projected end-of-lease value of $26,100. That means the leasing company expects the car to depreciate by $18,900 over three years — and that depreciation is what you pay for.
        </p>
        <p className="text-muted-foreground mb-8">
          Your monthly lease payment is, at its core, the cost of depreciation (plus financing charges via the <Link href="/glossary/money-factor" className="underline text-foreground">money factor</Link>) spread over the lease term. The higher the residual, the less depreciation you're responsible for, and the lower your monthly payment.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">How Residual Value Affects Your Monthly Payment</h2>
        <p className="text-muted-foreground mb-4">
          Here's a concrete example showing why residual value matters more than price negotiation:
        </p>
        <ul className="space-y-2 mb-4 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span><strong className="text-foreground">Car A:</strong> $40,000 MSRP, 62% residual = $24,800 residual value. Depreciation you pay: $15,200. That's about $422/month in depreciation alone over 36 months.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span><strong className="text-foreground">Car B:</strong> $40,000 MSRP, 48% residual = $19,200 residual value. Depreciation you pay: $20,800. That's about $578/month in depreciation alone over 36 months.</span>
          </li>
        </ul>
        <p className="text-muted-foreground mb-8">
          Same sticker price, but a 14-point difference in residual value creates a $156/month gap — that's $5,616 over the life of the lease. No amount of haggling on the sale price can close a gap that large. This is why experienced lease shoppers start by looking at which vehicles have the highest residual values.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Who Sets the Residual Value?</h2>
        <p className="text-muted-foreground mb-4">
          This is one of the most misunderstood aspects of leasing: <strong className="text-foreground">the dealer does not set the residual value</strong>. It is set by the leasing company — typically the manufacturer's captive finance arm (like Honda Financial Services, Ford Motor Credit, or Chrysler Capital).
        </p>
        <p className="text-muted-foreground mb-4">
          Leasing companies use data from third-party residual forecasting firms (ALG, now part of J.D. Power, is the most prominent) combined with their own historical resale data to project future vehicle values. The residual is published monthly for each model, trim, lease term, and mileage allowance.
        </p>
        <p className="text-muted-foreground mb-8">
          Because the dealer cannot change the residual, it's effectively non-negotiable. However, you can influence the residual indirectly by choosing a different lease term or mileage tier — a 24-month lease will have a higher residual percentage than a 48-month lease, and a 10,000-mile/year lease will have a higher residual than a 15,000-mile/year lease.
        </p>

        <div className="my-10 p-6 rounded-lg bg-muted/30 border border-border">
          <p className="text-sm font-semibold text-foreground mb-2">Wondering if your residual is fair?</p>
          <p className="text-sm text-muted-foreground mb-3">
            Paste your lease quote into Odigos. We'll check the residual percentage against current data and flag anything unusual.
          </p>
          <Link href="/analyze">
            <Button variant="cta" size="sm" data-testid="button-cta-mid-article-residual-value">
              Analyze My Lease Quote
            </Button>
          </Link>
        </div>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Typical Residual Value Percentages</h2>
        <p className="text-muted-foreground mb-4">
          Residual values vary widely by brand, model, and market conditions. Here are general ranges for 36-month leases with 12,000 miles/year:
        </p>
        <ul className="space-y-2 mb-4 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span><strong className="text-foreground">High residual (58%–65%):</strong> Trucks and SUVs with strong resale demand (Toyota Tacoma, Porsche Cayenne, Honda CR-V). These vehicles lease well because monthly payments are low relative to their MSRP.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span><strong className="text-foreground">Average residual (50%–57%):</strong> Most mainstream sedans and popular crossovers (Honda Accord, Toyota Camry, Mazda CX-5). Solid lease candidates.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span><strong className="text-foreground">Low residual (40%–49%):</strong> Luxury sedans, some EVs with rapidly evolving technology, and vehicles with historically poor resale (certain Jaguar, Maserati, and Alfa Romeo models). These vehicles cost significantly more to lease per month.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span><strong className="text-foreground">Very low residual (below 40%):</strong> Rare, but it happens — typically on slow-selling models the manufacturer is trying to move. Monthly lease payments will be high unless offset by heavy manufacturer incentives.</span>
          </li>
        </ul>
        <p className="text-muted-foreground mb-8">
          Keep in mind that manufacturers sometimes inflate residual values artificially to make lease payments more attractive. This is called a "supported" or "subvented" residual. It benefits you as the lessee (lower monthly payment), but it also means the lease-end purchase price may be higher than the vehicle's actual market value.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">How to Check If Your Residual Is Fair</h2>
        <ul className="space-y-2 mb-8 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span><strong className="text-foreground">Check Edmunds.</strong> Edmunds publishes residual values for most vehicles when you build a lease quote on their site. This is the most accessible free source.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span><strong className="text-foreground">Ask the dealer directly.</strong> Request the residual percentage and confirm it matches the manufacturer's published program. If it's lower than what you find on Edmunds, ask why.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span><strong className="text-foreground">Compare across trims.</strong> Higher trims sometimes have lower residual percentages than base models because they depreciate faster. The base model of a vehicle can actually be the best lease deal.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span><strong className="text-foreground">Watch for mileage impact.</strong> Moving from 10,000 to 15,000 miles/year typically drops the residual by 2–4 percentage points. That difference is real money.</span>
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">The Lease-End Purchase Option</h2>
        <p className="text-muted-foreground mb-4">
          At the end of your lease, you have the option to buy the vehicle for its residual value (plus any applicable fees and taxes). This creates an interesting opportunity:
        </p>
        <ul className="space-y-2 mb-4 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span><strong className="text-foreground">If the car is worth more than the residual:</strong> You can buy it at a below-market price and either keep it or sell it for a profit. This happens when the manufacturer set the residual conservatively or when used car prices have risen.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span><strong className="text-foreground">If the car is worth less than the residual:</strong> You simply return it. You're not obligated to buy. The leasing company absorbs the loss. This is one of the key financial protections of leasing versus buying.</span>
          </li>
        </ul>
        <p className="text-muted-foreground mb-8">
          During 2021–2022, used car prices surged and many lease returns had significant equity — lessees could buy their vehicles for thousands below market value. In more normal markets, the residual and market value tend to align more closely, but checking is always worthwhile.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Practical Takeaway</h2>
        <p className="text-muted-foreground mb-8">
          When evaluating a lease, look at the residual value before anything else. A strong residual (55%+) on a 36-month lease means the leasing company expects the vehicle to hold its value well — which directly translates to a lower monthly payment for you. Combine a high residual with a low <Link href="/glossary/money-factor" className="underline text-foreground">money factor</Link> and a competitive sale price, and you have the ingredients for a genuinely good lease. For a complete breakdown of every other fee you'll encounter, see our guide to <Link href="/car-lease-fees-explained" className="underline text-foreground">car lease fees explained</Link>.
        </p>
      </div>

      <ArticleCta />

      <p className="text-xs text-muted-foreground mt-12">
        Not affiliated with any dealership. Optimized for U.S. car leases.
      </p>
    </ArticleLayout>
  );
}
