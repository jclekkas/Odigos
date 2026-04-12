import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";
import { setSeoMeta } from "@/lib/seo";
import { articleSchema } from "@/lib/jsonld";
import ArticleLayout from "@/components/ArticleLayout";
import ArticleCta from "@/components/ArticleCta";

export default function DealerReconditioningFee() {
  useEffect(() => {
    setSeoMeta({
      title: "Dealer Reconditioning Fee: What It Covers | Odigos",
      description: "A dealer reconditioning fee covers used car refurbishment. Learn what is legitimate, when fees are inflated, red flags to watch for, and how to negotiate.",
      path: "/dealer-reconditioning-fee",
    });
  }, []);

  return (
    <ArticleLayout title="Dealer Reconditioning Fee">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(articleSchema({ title: "Dealer Reconditioning Fee: What It Covers | Odigos", description: "A dealer reconditioning fee covers used car refurbishment. Learn what is legitimate, when fees are inflated, red flags to watch for, and how to negotiate.", path: "/dealer-reconditioning-fee" }))}</script>
      </Helmet>
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 leading-[1.15]" data-testid="text-dealer-reconditioning-fee-headline">
        Dealer Reconditioning Fee: What It Covers and When to Push Back
      </h1>

      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p className="text-lg text-muted-foreground">
          When you buy a used car, you may see a line item on the buyer's order labeled "reconditioning fee," "recon fee," or "vehicle reconditioning." Unlike many dealer fees that are simply profit lines with official-sounding names, a reconditioning fee can reflect real work. The question is whether the amount charged is proportionate to what was actually done — and whether it should be your responsibility at all.
        </p>
        <p className="text-lg text-muted-foreground">
          Understanding what reconditioning means, when the fee is justified, and when it isn't gives you the information you need before you sign.
        </p>

        <p className="text-sm text-muted-foreground">
          Already reviewing a used car quote? <Link href="/analyze" className="underline text-foreground">Paste it here</Link> and we'll flag every fee.
        </p>

        <h2 className="text-2xl font-semibold text-foreground">What a Reconditioning Fee Is Supposed to Cover</h2>
        <p className="text-muted-foreground">
          When a dealership acquires a used vehicle — through trade-in, auction, or other channels — it goes through an inspection and refurbishment process before being offered for sale. This is called reconditioning. Legitimate reconditioning work can include:
        </p>
        <ul className="space-y-2 mb-8 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span>Mechanical inspection and repair — addressing safety issues, worn components, or items that would prevent a clean certification</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span>Fluid changes — oil, coolant, brake fluid, and transmission fluid to bring the vehicle to current service standards</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span>Detailing — cleaning the interior and exterior to a retail standard</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span>Cosmetic repairs — buffing out minor scratches, repairing small dents, or addressing interior wear</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span>Certification work — the inspections required for the vehicle to qualify as a certified pre-owned (CPO) unit</span>
          </li>
        </ul>
        <p className="text-muted-foreground">
          When a dealer does meaningful refurbishment work on a used vehicle, those costs are real. The controversy is not whether reconditioning happens — it usually does — but whether it should appear as a separate line item in the buyer's price, or whether it should already be accounted for in the asking price of the vehicle.
        </p>

        <h2 className="text-2xl font-semibold text-foreground">The Core Problem with the Fee</h2>
        <p className="text-muted-foreground">
          In standard retail practice, the cost of preparing a product for sale is built into the selling price. A furniture store doesn't add an "assembly fee" to a sofa because their staff assembled it in the warehouse. The preparation cost is baked into the margin.
        </p>
        <p className="text-muted-foreground">
          When dealers add a reconditioning fee as a separate buyer line item, they are often doing two things at once: advertising a lower vehicle price that attracts buyers online, and then adding the reconditioning cost back in at the point of sale. The total cost to the buyer ends up the same — or higher — while the advertised price looked more competitive.
        </p>
        <p className="text-muted-foreground">
          This is why the <Link href="/out-the-door-price" className="underline text-foreground">out-the-door price</Link> is the only valid number to compare across dealers. A used car advertised at $18,500 with a $799 reconditioning fee is not cheaper than one advertised at $19,200 with no fee — the opposite may be true.
        </p>

        <h2 className="text-2xl font-semibold text-foreground">When Is the Fee Legitimate?</h2>
        <p className="text-muted-foreground">
          A reconditioning fee is more defensible when:
        </p>
        <ul className="space-y-2 mb-4 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span>The dealer can provide an itemized list of the specific work done on the vehicle — not a generic description</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span>The vehicle has a verifiable service history or inspection report showing what was repaired or replaced</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span>The asking price is genuinely below comparable vehicles that did not require significant work</span>
          </li>
        </ul>
        <p className="text-muted-foreground">
          Even when the work was real, a fee above $500–$800 for routine refurbishment deserves scrutiny. Substantial repair work on a used vehicle — replacing brakes, tires, or major components — is typically reflected in either the vehicle price or a separate inspection report, not lumped into a "recon fee" line item.
        </p>

        <div className="my-10 p-6 rounded-lg bg-muted/30 border border-border">
          <p className="text-sm font-semibold text-foreground mb-2">Not sure what's in your used car quote?</p>
          <p className="text-sm text-muted-foreground mb-3">
            Paste your dealer quote into Odigos. We'll identify the reconditioning fee, flag other charges, and show you the complete out-the-door total.
          </p>
          <Link href="/analyze">
            <Button variant="cta" size="sm" data-testid="button-cta-mid-article-recon-fee">
              Check This Quote
            </Button>
          </Link>
        </div>

        <h2 className="text-2xl font-semibold text-foreground">Red Flags That the Fee Is Inflated</h2>
        <ul className="space-y-2 mb-8 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-1.5 shrink-0">•</span>
            <span>The dealer cannot or will not describe specifically what work was done under the reconditioning fee</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-1.5 shrink-0">•</span>
            <span>The fee exceeds $800–$1,000 without a detailed inspection report or parts list</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-1.5 shrink-0">•</span>
            <span>The vehicle was recently acquired and sold without significant time or visible work done</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-1.5 shrink-0">•</span>
            <span>The fee appears alongside other vague charges like a "dealer services fee" with no explanation</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-1.5 shrink-0">•</span>
            <span>The fee was not disclosed until you were in the finance office, after you'd already negotiated the price</span>
          </li>
        </ul>

        <h2 className="text-2xl font-semibold text-foreground">How It Differs from a Dealer Prep Fee</h2>
        <p className="text-muted-foreground">
          Reconditioning fees apply to used vehicles and reflect work done after the dealer acquired the car to bring it to resale condition. This is different in scope and nature from a dealer prep fee, which applies to new vehicles and covers the routine tasks of removing shipping materials, washing the car, and performing a pre-delivery inspection.
        </p>
        <p className="text-muted-foreground">
          A reconditioning fee on a new car makes no sense — the vehicle hasn't been owned before and doesn't require refurbishment. If you see this on a new car deal, treat it as a red flag. For more on prep fees specifically, see our guide on <Link href="/dealer-prep-fee" className="underline text-foreground">dealer prep fees</Link>.
        </p>

        <h2 className="text-2xl font-semibold text-foreground">What to Say to the Dealer</h2>
        <p className="text-muted-foreground">
          When the reconditioning fee appears on your buyer's order, ask for specifics before accepting it:
        </p>
        <div className="rounded-md border border-border p-5 bg-muted/50 mb-8">
          <p className="text-sm md:text-base text-foreground leading-relaxed italic">
            "Can you provide an itemized list of the work done under the reconditioning fee? I'd like to understand what was repaired or replaced before I agree to that charge. If the work is already reflected in the vehicle price, I'd ask that the fee be removed."
          </p>
        </div>
        <p className="text-muted-foreground">
          If the dealer can't or won't itemize the work, that's useful information. You can then negotiate the vehicle price down to offset the fee, or use it as leverage to walk away if the total out-the-door number doesn't work. For more on fees that commonly appear without prior disclosure, see our guide on <Link href="/hidden-dealer-fees" className="underline text-foreground">hidden dealer fees</Link> and our guide on <Link href="/are-dealer-add-ons-mandatory" className="underline text-foreground">which dealer charges are actually mandatory</Link>.
        </p>

        <h2 className="text-2xl font-semibold text-foreground">Related Guides</h2>
        <ul className="space-y-2 mb-8 text-muted-foreground">
          <li><Link href="/dealer-prep-fee" className="underline text-foreground">Dealer Prep Fee: What It Is and Do You Have to Pay It?</Link></li>
          <li><Link href="/hidden-dealer-fees" className="underline text-foreground">Hidden Dealer Fees: What to Watch for on Any Quote</Link></li>
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
