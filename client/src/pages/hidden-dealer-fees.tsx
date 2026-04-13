import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";
import { setSeoMeta } from "@/lib/seo";
import { articleSchema } from "@/lib/jsonld";
import ArticleLayout from "@/components/ArticleLayout";
import ArticleCta from "@/components/ArticleCta";
import SourceCitation from "@/components/SourceCitation";
import { ARTICLE_SOURCES } from "@/data/articleSources";

export default function HiddenDealerFees() {
  useEffect(() => {
    setSeoMeta({
      title: "Hidden & Junk Dealer Fees: Charges That Don't Belong on Your Quote | Odigos",
      description: "Market adjustments, prep fees, VIN etching, and more — hidden and junk dealer fees add hundreds to a car purchase. Spot every charge that doesn't belong and learn how to fight back.",
      path: "/hidden-dealer-fees",
    });
  }, []);

  return (
    <ArticleLayout title="Hidden & Junk Dealer Fees">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(articleSchema({ title: "Hidden & Junk Dealer Fees: Charges That Don't Belong on Your Quote | Odigos", description: "Market adjustments, prep fees, VIN etching, and more — hidden and junk dealer fees add hundreds to a car purchase. Spot every charge that doesn't belong and learn how to fight back.", path: "/hidden-dealer-fees" }))}</script>
      </Helmet>
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 leading-[1.15]" data-testid="text-hidden-fees-headline">
        Hidden & Junk Dealer Fees: Spot the Charges That Don't Belong
      </h1>

      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p className="text-lg text-muted-foreground">
          The price a dealer advertises is rarely the price you pay. Between the sticker and the signed contract, buyers routinely encounter fees that weren't mentioned upfront — charges that range from reasonable to entirely fabricated. Some are revealed in the finance office. Others are buried in the fine print of a buyer's order. Most buyers miss 2–3 of these on their first quote.{" "}<SourceCitation sources={ARTICLE_SOURCES["car-dealer-fees-explained"].sources} lastVerified={ARTICLE_SOURCES["car-dealer-fees-explained"].lastVerified} />
        </p>
        <p className="text-muted-foreground">
          Some of these fees exceed legal caps in certain states — and several are explicitly targeted by the FTC's 2024 CARS Rule. Knowing what to look for is the difference between overpaying and walking out with a fair deal.
        </p>

        <div className="rounded-lg border border-blue-600/20 bg-blue-600/5 p-5 mb-8">
          <p className="text-base font-semibold text-foreground mb-2">
            See any of these fees in your quote? Paste it here — Odigos identifies exactly how much you'd overpay and gives you the words to push back.
          </p>
          <Button asChild variant="cta" className="font-semibold">
            <Link href="/analyze">Find Out What You'd Overpay</Link>
          </Button>
        </div>

        <h2 className="text-2xl font-semibold text-foreground">What Makes a Fee a "Junk Fee"?</h2>
        <p className="text-muted-foreground">
          Not every dealer fee is a junk fee. Government-mandated charges like sales tax, title transfer, and registration fees are legitimate — they go to the state, not the dealer. The <a href="https://consumer.ftc.gov/articles/buying-new-car" target="_blank" rel="noopener" className="underline text-foreground">FTC defines junk fees</a> as "hidden or surprise fees that were not clearly disclosed." A fee becomes a junk fee when it meets one or more of these criteria:
        </p>
        <ul className="space-y-2 mb-8 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span><strong className="text-foreground">No real value delivered</strong> — the buyer receives nothing meaningful in return (e.g., nitrogen tire fill, VIN etching)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span><strong className="text-foreground">Not disclosed upfront</strong> — the fee appears only in the finance office or on the final contract, not in the original quote</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span><strong className="text-foreground">Duplicates another charge</strong> — the service is already included in the vehicle price or another line item</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span><strong className="text-foreground">Presented as mandatory when it's optional</strong> — the dealer implies you must pay for something you can legally decline</span>
          </li>
        </ul>

        <h2 className="text-2xl font-semibold text-foreground">Every Hidden & Junk Fee You'll Encounter</h2>

        <h3 className="text-xl font-semibold text-foreground">Market Adjustment Fee ($500–$10,000+)</h3>
        <p className="text-muted-foreground">
          A markup added above MSRP, typically on high-demand or low-inventory vehicles. Dealers frame it as reflecting current market conditions. It is entirely discretionary — no law requires it, and no manufacturer sets it. Always ask for it to be removed or offset in the vehicle price. See our <Link href="/market-adjustment-fee" className="underline text-foreground">market adjustment guide</Link> for how to handle it.
        </p>

        <h3 className="text-xl font-semibold text-foreground">Dealer Prep Fee ($200–$500)</h3>
        <p className="text-muted-foreground">
          Described as covering the work required to prepare a new vehicle for delivery — washing, detailing, and inspection. Preparing vehicles for sale is a normal cost of running a dealership, not a pass-through expense for the buyer. It typically appears as a line item with no itemization of what it actually covers. See our detailed guide on <Link href="/dealer-prep-fee" className="underline text-foreground">dealer prep fees</Link>.
        </p>

        <h3 className="text-xl font-semibold text-foreground">Dealer Reconditioning Fee ($200–$1,000)</h3>
        <p className="text-muted-foreground">
          Common on used car purchases, this fee is supposed to cover the cost of bringing the vehicle up to sale condition. When legitimate, it reflects real work done on the vehicle. When inflated, it becomes a profit line. Fees above $500–$800 are worth questioning, especially if the vehicle wasn't significantly refurbished. See our guide on <Link href="/dealer-reconditioning-fee" className="underline text-foreground">dealer reconditioning fees</Link>.
        </p>

        <h3 className="text-xl font-semibold text-foreground">Documentation Fee (Doc Fee) ($85–$999+)</h3>
        <p className="text-muted-foreground">
          A dealer-set charge for processing the paperwork involved in the sale. It is not a government fee. In capped states like California, New York, or Texas, it's limited by law. In no-cap states, fees vary widely: Florida commonly runs $500–$1,000+. It's usually non-negotiable on its own but can be offset by negotiating the vehicle price. Learn more in our guide on <Link href="/dealer-doc-fee" className="underline text-foreground">dealer documentation fees</Link>.
        </p>

        <h3 className="text-xl font-semibold text-foreground">VIN Etching ($100–$400)</h3>
        <p className="text-muted-foreground">
          The vehicle's identification number is etched onto the windows to deter theft. Dealers charge $200–$400 for a process that costs them $20–$30. The National Insurance Crime Bureau and many auto clubs offer free VIN etching kits. Often presented as mandatory or already installed. Skip the dealer markup.
        </p>

        <h3 className="text-xl font-semibold text-foreground">Nitrogen-Filled Tires ($50–$300)</h3>
        <p className="text-muted-foreground">
          Tires inflated with pure nitrogen instead of regular air. The performance benefit for everyday passenger vehicles is negligible — regular air is already 78% nitrogen. Many tire shops offer nitrogen top-offs for free. One of the most universally recognized junk fees in the industry.
        </p>

        <h3 className="text-xl font-semibold text-foreground">Paint Protection / Sealant ($300–$1,500)</h3>
        <p className="text-muted-foreground">
          A spray-on coating or clear film applied to the vehicle exterior before delivery. The dealer's cost is $50–$150. Professional ceramic coatings have value, but dealer-applied versions are typically low-quality spray-on products applied in minutes. If paint protection matters to you, a dedicated installer will do better work for less money.
        </p>

        <div className="my-10 p-6 rounded-lg bg-muted/30 border border-border">
          <p className="text-sm font-semibold text-foreground mb-2">Not sure which of these are on your quote?</p>
          <p className="text-sm text-muted-foreground mb-3">
            Paste your dealer quote into Odigos. We'll calculate exactly how much you'd overpay, separate government charges from dealer markups, and give you the real out-the-door total.
          </p>
          <Link href="/analyze">
            <Button variant="cta" size="sm" data-testid="button-cta-mid-article-hidden-fees">
              See What I'd Overpay
            </Button>
          </Link>
        </div>

        <h3 className="text-xl font-semibold text-foreground">Fabric or Leather Protection ($200–$600)</h3>
        <p className="text-muted-foreground">
          A spray applied to seats and carpeting to repel stains. It's a commodity product available at any auto parts store for $15–$30. Dealers charge $200–$500. A $10 can of Scotchgard provides comparable protection.
        </p>

        <h3 className="text-xl font-semibold text-foreground">Anti-Theft Package ($200–$800)</h3>
        <p className="text-muted-foreground">
          Includes items like steering wheel locks, GPS tracking devices, or alarm system upgrades. Often pre-installed on the lot so the dealer can claim it can't be removed. The value is questionable — most modern vehicles already have comprehensive factory anti-theft systems.
        </p>

        <h3 className="text-xl font-semibold text-foreground">Undercoating ($300–$1,000)</h3>
        <p className="text-muted-foreground">
          A rust-prevention coating sprayed on the underside of the vehicle. Modern vehicles already have factory-applied corrosion protection. Dealer undercoating is rarely needed and can even void manufacturer warranties if improperly applied.
        </p>

        <h3 className="text-xl font-semibold text-foreground">Pinstriping ($100–$500)</h3>
        <p className="text-muted-foreground">
          Decorative lines applied along the body of the vehicle. Often pre-applied so dealers can add it to the price without asking. Costs the dealer under $20 in materials.
        </p>

        <h3 className="text-xl font-semibold text-foreground">Window Tint ($100–$500)</h3>
        <p className="text-muted-foreground">
          Can have legitimate value (UV protection, privacy), but dealer pricing is typically 2–3x what an independent tint shop would charge. If you want window tint, get it done after purchase for a fraction of the cost.
        </p>

        <h3 className="text-xl font-semibold text-foreground">Wheel Locks ($50–$200)</h3>
        <p className="text-muted-foreground">
          Special lug nuts that require a unique key to remove, intended to deter wheel theft. Available online for $15–$30. Dealer markup makes this a low-value add-on.
        </p>

        <h3 className="text-xl font-semibold text-foreground">Protection Packages (Bundled Add-Ons) ($500–$2,500+)</h3>
        <p className="text-muted-foreground">
          Multiple optional add-ons — often paint protection, fabric coating, and VIN etching — bundled under a single line item. Bundling makes it harder to evaluate each item individually. Always ask for the package to be broken out with individual pricing. For a full explanation, see our guide on <Link href="/are-dealer-add-ons-mandatory" className="underline text-foreground">which dealer add-ons are mandatory</Link>.
        </p>

        <h3 className="text-xl font-semibold text-foreground">Advertising Fee ($200–$1,000)</h3>
        <p className="text-muted-foreground">
          Some dealers add a fee to cover regional advertising costs. This is a dealer operating expense, not a legitimate buyer charge. It may appear as a small line item, often without clear explanation.
        </p>

        <h2 className="text-2xl font-semibold text-foreground">Fees That Are NOT Junk Fees</h2>
        <p className="text-muted-foreground">
          Some dealer charges are legitimate, even if they feel expensive:
        </p>
        <ul className="space-y-2 mb-8 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span><strong className="text-foreground">Documentation fee (doc fee)</strong> — a dealer-set charge for paperwork processing. It's regulated or capped in many states. See our <Link href="/dealer-doc-fee" className="underline text-foreground">doc fee guide</Link> and <Link href="/dealer-doc-fee-by-state" className="underline text-foreground">state-by-state caps</Link>.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span><strong className="text-foreground">Sales tax</strong> — set by your state and local government, not the dealer</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span><strong className="text-foreground">Title and registration</strong> — government-mandated fees for transferring vehicle ownership</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span><strong className="text-foreground">Destination charge</strong> — the manufacturer's charge for shipping the vehicle from the factory to the dealer</span>
          </li>
        </ul>

        <h2 className="text-2xl font-semibold text-foreground">How to Fight Back</h2>
        <ol className="space-y-3 mb-8 text-muted-foreground list-decimal list-inside">
          <li><strong>Request an itemized out-the-door price</strong> before visiting the dealership. This forces every fee into the open.</li>
          <li><strong>Identify each line item</strong> and ask whether it's a government fee, a dealer fee, or an optional add-on.</li>
          <li><strong>Decline optional add-ons</strong> — you are not legally required to purchase dealer-installed accessories, protection packages, or services.</li>
          <li><strong>Know your state's doc fee cap</strong> — if the dealer's doc fee exceeds your state's legal limit, that's a violation. Check the <Link href="/car-dealer-fees-by-state" className="underline text-foreground">fees by state</Link> page.</li>
          <li><strong>Get a second opinion</strong> — <Link href="/analyze" className="underline text-foreground">paste your dealer quote into Odigos</Link> and we'll show you exactly how much you'd overpay, identify every junk fee by name, and give you the exact words to say back.</li>
        </ol>

        <h2 className="text-2xl font-semibold text-foreground">The FTC and Junk Fees in 2026</h2>
        <p className="text-muted-foreground">
          The Federal Trade Commission has made junk fees a regulatory priority. The FTC's Combating Auto Retail Scams (CARS) Rule, finalized in 2024, prohibits dealers from charging for add-ons that provide no benefit to the consumer and requires upfront disclosure of all fees. Several states have enacted their own junk fee laws with additional protections. This regulatory momentum means consumers have more leverage than ever to push back on suspicious charges.
        </p>

        <h2 className="text-2xl font-semibold text-foreground">Related Guides</h2>
        <ul className="space-y-2 mb-8 text-muted-foreground">
          <li><Link href="/car-dealer-fees-explained" className="underline text-foreground">Car Dealer Fees: What to Accept vs. What to Question</Link></li>
          <li><Link href="/car-dealer-fees-list" className="underline text-foreground">Every Dealer Fee Listed: Ranges and Verdicts</Link></li>
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
