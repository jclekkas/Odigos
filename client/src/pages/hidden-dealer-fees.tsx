import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";
import { setSeoMeta } from "@/lib/seo";
import { articleSchema } from "@/lib/jsonld";
import ArticleLayout from "@/components/ArticleLayout";
import ArticleCta from "@/components/ArticleCta";

export default function HiddenDealerFees() {
  useEffect(() => {
    setSeoMeta({
      title: "Hidden Dealer Fees: What to Watch for on Any Quote | Odigos",
      description: "Market adjustment, prep fees, VIN etching, and more — hidden dealer fees add hundreds to a car purchase. Learn what each one is and what you can do.",
      path: "/hidden-dealer-fees",
    });
  }, []);

  return (
    <ArticleLayout title="Hidden Dealer Fees">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(articleSchema({ title: "Hidden Dealer Fees: What to Watch for on Any Quote | Odigos", description: "Market adjustment, prep fees, VIN etching, and more — hidden dealer fees add hundreds to a car purchase. Learn what each one is and what you can do.", path: "/hidden-dealer-fees" }))}</script>
      </Helmet>
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 leading-[1.15]" data-testid="text-hidden-fees-headline">
        Hidden Dealer Fees: What to Watch for on Any Quote
      </h1>

      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p className="text-lg text-muted-foreground">
          The price a dealer advertises is rarely the price you pay. Between the sticker and the signed contract, buyers routinely encounter fees that weren't mentioned upfront — charges that range from reasonable to entirely fabricated. Some are revealed in the finance office. Others are buried in the fine print of a buyer's order.
        </p>
        <p className="text-lg text-muted-foreground">
          This guide covers the most common hidden fees you'll encounter when buying a car, what each one is, and whether it belongs in your deal.
        </p>

        <p className="text-sm text-muted-foreground">
          Already have a dealer quote? <Link href="/analyze" className="underline text-foreground">Paste it here</Link> and see what's actually in it.
        </p>

        <h2 className="text-2xl font-semibold text-foreground">Market Adjustment Fee</h2>
        <p className="text-muted-foreground">
          A markup added above MSRP, typically on high-demand or low-inventory vehicles. Dealers frame it as reflecting current market conditions. It is entirely discretionary — no law requires it, and no manufacturer sets it. It can range from a few hundred dollars to several thousand. Always ask for it to be removed or offset in the vehicle price before agreeing to any deal.
        </p>

        <h2 className="text-2xl font-semibold text-foreground">Dealer Prep Fee</h2>
        <p className="text-muted-foreground">
          Described as covering the work required to prepare a new vehicle for delivery — washing, detailing, and inspection. Preparing vehicles for sale is a normal cost of running a dealership, not a pass-through expense for the buyer. It typically appears as a $200–$500 line item with no itemization of what it actually covers. See our detailed guide on <Link href="/dealer-prep-fee" className="underline text-foreground">dealer prep fees</Link> for what to do when this shows up.
        </p>

        <h2 className="text-2xl font-semibold text-foreground">Dealer Reconditioning Fee</h2>
        <p className="text-muted-foreground">
          Common on used car purchases, this fee is supposed to cover the cost of bringing the vehicle up to sale condition — cleaning, minor repairs, and inspection. When legitimate, it reflects real work done on the vehicle. When inflated, it becomes a profit line. Fees above $500–$800 are worth questioning, especially if the vehicle wasn't significantly refurbished. For more detail, see our guide on <Link href="/dealer-reconditioning-fee" className="underline text-foreground">dealer reconditioning fees</Link>.
        </p>

        <h2 className="text-2xl font-semibold text-foreground">Documentation Fee (Doc Fee)</h2>
        <p className="text-muted-foreground">
          A dealer-set charge for processing the paperwork involved in the sale — contracts, title transfer, and registration filing. It is not a government fee. In capped states like California, New York, or Texas ($225 cap as of July 2024), it's limited by law. In no-cap states, fees vary by market: Florida commonly runs $500–$1,000+, while Georgia typically runs $400–$700. It's usually non-negotiable on its own but can be offset by negotiating the vehicle price. Learn more in our guide on <Link href="/dealer-doc-fee" className="underline text-foreground">dealer documentation fees</Link>.
        </p>

        <h2 className="text-2xl font-semibold text-foreground">VIN Etching</h2>
        <p className="text-muted-foreground">
          The vehicle's identification number is etched onto the windows to deter theft. Dealers charge $200–$400 for a process that costs them $20–$30. The National Insurance Crime Bureau and many auto clubs offer free VIN etching kits. Skip the dealer markup.
        </p>

        <h2 className="text-2xl font-semibold text-foreground">Nitrogen-Filled Tires</h2>
        <p className="text-muted-foreground">
          Tires inflated with pure nitrogen instead of regular air. The performance benefit for everyday passenger vehicles is negligible — regular air is already 78% nitrogen. Many tire shops offer nitrogen top-offs for free. There is no justification for paying a dealer $100–$200 for this service.
        </p>

        <h2 className="text-2xl font-semibold text-foreground">Paint Protection / Sealant</h2>
        <p className="text-muted-foreground">
          A spray-on coating or clear film applied to the vehicle exterior before delivery. The dealer's cost is $50–$150. The charge to the buyer is often $500–$1,500. If paint protection matters to you, a dedicated installer will do better work for less money. This is an optional add-on — not a required charge.
        </p>

        <div className="my-10 p-6 rounded-lg bg-muted/30 border border-border">
          <p className="text-sm font-semibold text-foreground mb-2">Seeing unfamiliar charges in your quote?</p>
          <p className="text-sm text-muted-foreground mb-3">
            Paste your dealer quote into Odigos. We'll flag every fee, identify which are government charges vs. dealer add-ons, and show you the real out-the-door total.
          </p>
          <Link href="/analyze">
            <Button variant="cta" size="sm" data-testid="button-cta-mid-article-hidden-fees">
              Check This Quote
            </Button>
          </Link>
        </div>

        <h2 className="text-2xl font-semibold text-foreground">Fabric or Leather Protection</h2>
        <p className="text-muted-foreground">
          A spray applied to seats and carpeting to repel stains. It's a commodity product available at any auto parts store for $15–$30. Dealers charge $200–$500. Optional, and easily skipped.
        </p>

        <h2 className="text-2xl font-semibold text-foreground">Protection Packages (Bundled Add-Ons)</h2>
        <p className="text-muted-foreground">
          Multiple optional add-ons — often paint protection, fabric coating, and VIN etching — bundled under a single line item. Bundling makes it harder to evaluate the value of each item individually. Always ask for the package to be broken out with individual pricing. For a full explanation of what's in common add-on packages, see our guide on <Link href="/are-dealer-add-ons-mandatory" className="underline text-foreground">which dealer add-ons are mandatory</Link>.
        </p>

        <h2 className="text-2xl font-semibold text-foreground">Advertising Fee</h2>
        <p className="text-muted-foreground">
          Some dealers add a fee to cover regional advertising costs. This is a dealer operating expense, not a legitimate buyer charge. It may appear as a small line item ($100–$500), often without clear explanation.
        </p>

        <h2 className="text-2xl font-semibold text-foreground">What to Do When You See an Unexpected Fee</h2>
        <ul className="space-y-2 mb-4 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span>Ask the dealer to explain exactly what the fee covers and whether it is required by state law or by their internal policy</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span>Request a fully itemized out-the-door quote before agreeing to anything — every line item visible, with individual pricing</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span>Negotiate the vehicle price down to offset dealer-added fees you can't remove — the total is what matters</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span>Compare total out-the-door prices across multiple dealers — not just the advertised price</span>
          </li>
        </ul>
        <p className="text-muted-foreground">
          For a complete breakdown of which fees are negotiable and how to approach the conversation, see our guide on <Link href="/are-dealer-fees-negotiable" className="underline text-foreground">whether dealer fees are negotiable</Link>. For more on what belongs in a complete car purchase quote, see our guide to the <Link href="/out-the-door-price" className="underline text-foreground">out-the-door price</Link>.
        </p>

        <h2 className="text-2xl font-semibold text-foreground">What to Say to the Dealer</h2>
        <p className="text-muted-foreground">
          When fees appear that weren't disclosed upfront, redirect the conversation to the total:
        </p>
        <div className="rounded-md border border-border p-5 bg-muted/50 mb-8">
          <p className="text-sm md:text-base text-foreground leading-relaxed italic">
            "I'd like to review each line item before we move forward. Can you send me a written, itemized out-the-door price that breaks out every fee individually? I want to confirm what's a government charge versus a dealer charge before I sign anything."
          </p>
        </div>
        <p className="text-muted-foreground">
          Dealers who are transparent will provide this without hesitation. Dealers who resist are worth scrutinizing more carefully.
        </p>

        <h2 className="text-2xl font-semibold text-foreground">Related Guides</h2>
        <ul className="space-y-2 mb-8 text-muted-foreground">
          <li><Link href="/dealer-prep-fee" className="underline text-foreground">What Is a Dealer Prep Fee — and Do You Have to Pay It?</Link></li>
          <li><Link href="/dealer-reconditioning-fee" className="underline text-foreground">Dealer Reconditioning Fee: What It Covers and When to Push Back</Link></li>
          <li><Link href="/are-dealer-add-ons-mandatory" className="underline text-foreground">Are Dealer Add-Ons Mandatory? What You Can Refuse</Link></li>
          <li><Link href="/dealer-add-ons-explained" className="underline text-foreground">Dealer Add-Ons Explained: What Each One Actually Is</Link></li>
        </ul>
      </div>

      <ArticleCta />

      <p className="text-xs text-muted-foreground mt-12">
        Not affiliated with any dealership. Optimized for U.S. car purchases.
      </p>
    </ArticleLayout>
  );
}
