import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";
import { setSeoMeta } from "@/lib/seo";
import { articleSchema } from "@/lib/jsonld";
import ArticleLayout from "@/components/ArticleLayout";
import ArticleCta from "@/components/ArticleCta";

export default function DealerPrepFee() {
  useEffect(() => {
    setSeoMeta({
      title: "Dealer Prep Fee: What It Is and Should You Pay It | Odigos",
      description: "Dealers charge a prep fee for getting a new car ready for delivery. Learn what it supposedly covers, why it's usually unjustified, and how to push back.",
      path: "/dealer-prep-fee",
    });
  }, []);

  return (
    <ArticleLayout title="Dealer Prep Fee">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(articleSchema({ title: "Dealer Prep Fee: What It Is and Should You Pay It | Odigos", description: "Dealers charge a prep fee for getting a new car ready for delivery. Learn what it supposedly covers, why it's usually unjustified, and how to push back.", path: "/dealer-prep-fee" }))}</script>
      </Helmet>
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 leading-[1.15]" data-testid="text-dealer-prep-fee-headline">
        Dealer Prep Fee: What It Is and Do You Have to Pay It?
      </h1>

      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p className="text-lg text-muted-foreground">
          A dealer prep fee is a charge added to the purchase price of a new vehicle, supposedly covering the work the dealership does to prepare the car for delivery. You'll see it listed on buyer's orders under various names: "dealer preparation," "vehicle preparation fee," "pre-delivery inspection," or "PDI fee."
        </p>
        <p className="text-lg text-muted-foreground">
          The core issue with this fee is that what it supposedly covers — washing, detailing, removing shipping materials, and a basic inspection — is part of operating a car dealership, not an itemizable cost to pass on to buyers. Understanding what the fee is and why it's generally unjustified gives you the basis to push back on it.
        </p>

        <p className="text-sm text-muted-foreground">
          Have a dealer quote with a prep fee on it? <Link href="/analyze" className="underline text-foreground">Paste it here</Link> and we'll flag it.
        </p>

        <h2 className="text-2xl font-semibold text-foreground">What Dealers Say the Prep Fee Covers</h2>
        <p className="text-muted-foreground">
          Dealers typically describe the prep fee as covering some combination of the following:
        </p>
        <ul className="space-y-2 mb-8 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span>Removing protective shipping film, wraps, or packaging materials from the vehicle</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span>Washing, detailing, and cleaning the interior and exterior before delivery</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span>A pre-delivery inspection (PDI) to check fluid levels, tire pressure, and basic systems</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span>Installing optional accessories ordered with the vehicle, such as floor mats or cargo nets</span>
          </li>
        </ul>

        <h2 className="text-2xl font-semibold text-foreground">What the Prep Fee Actually Is</h2>
        <p className="text-muted-foreground">
          The work described above is routine. Every new car that arrives at a dealership goes through this process. It is the baseline cost of operating a retail car lot, similar to stocking shelves at a grocery store. No one pays a grocery store a "shelf preparation fee" because the store arranged the products.
        </p>
        <p className="text-muted-foreground">
          Manufacturers account for delivery and prep costs in the margin built into vehicle pricing. The pre-delivery inspection, in particular, is often covered under the manufacturer's dealer holdback — money paid to the dealer by the automaker for each vehicle sold. Charging the buyer separately for PDI work is, in most cases, double-dipping.
        </p>
        <p className="text-muted-foreground">
          The prep fee is a profit line. The actual labor cost for washing and prepping a car is $50–$150. Dealers commonly charge $200–$500, with some higher-volume operations charging more.
        </p>

        <h2 className="text-2xl font-semibold text-foreground">Is the Dealer Prep Fee Required?</h2>
        <p className="text-muted-foreground">
          In most cases, no. Some dealers treat it as a fixed part of their pricing structure — much like the doc fee — and won't remove it as a standalone line item. But that doesn't mean you have to absorb it without negotiation.
        </p>
        <p className="text-muted-foreground">
          Unlike government fees (sales tax, title, registration), which are fixed by law, the prep fee is entirely dealer-controlled. There is no statute requiring dealers to charge it. A dealer who claims it's "mandatory" or "required by the manufacturer" is not being accurate — manufacturers do not set dealer prep fees for the buyer.
        </p>
        <p className="text-muted-foreground">
          The most practical approach is to treat it as part of the total out-the-door price and negotiate accordingly. If the dealer won't remove the $350 prep fee, ask for the vehicle price to be reduced by $350. The total you pay is what matters. For a broader look at which dealer fees you can push back on, see our guide on <Link href="/are-dealer-fees-negotiable" className="underline text-foreground">which dealer fees are negotiable</Link>.
        </p>

        <div className="my-10 p-6 rounded-lg bg-muted/30 border border-border">
          <p className="text-sm font-semibold text-foreground mb-2">See every fee in your quote before you respond</p>
          <p className="text-sm text-muted-foreground mb-3">
            Paste your dealer quote into Odigos. We'll flag the prep fee, identify what's negotiable, and show you the full out-the-door breakdown.
          </p>
          <Link href="/analyze">
            <Button variant="cta" size="sm" data-testid="button-cta-mid-article-dealer-prep-fee">
              Analyze My Dealer Quote
            </Button>
          </Link>
        </div>

        <h2 className="text-2xl font-semibold text-foreground">Red Flags Around Prep Fees</h2>
        <ul className="space-y-2 mb-8 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-1.5 shrink-0">•</span>
            <span>The fee is listed without any explanation of what it covers — just a dollar amount</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-1.5 shrink-0">•</span>
            <span>The dealer claims it's required by the manufacturer or by law — it isn't</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-1.5 shrink-0">•</span>
            <span>There is a prep fee alongside a doc fee, with no clear distinction between what each covers</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-1.5 shrink-0">•</span>
            <span>The fee appears on the buyer's order but wasn't mentioned in any earlier communication or advertisement</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-1.5 shrink-0">•</span>
            <span>The dealer refuses to describe specifically what work was done under the prep fee</span>
          </li>
        </ul>
        <p className="text-muted-foreground">
          For a broader overview of charges that commonly appear without prior disclosure, see our guide on <Link href="/hidden-dealer-fees" className="underline text-foreground">hidden dealer fees</Link>.
        </p>

        <h2 className="text-2xl font-semibold text-foreground">How It Differs from a Reconditioning Fee</h2>
        <p className="text-muted-foreground">
          The dealer prep fee applies to new vehicles — the preparation done before a car is delivered to its first owner. This is distinct from a reconditioning fee, which applies to used vehicles and covers the work involved in bringing a previously owned car up to resale condition.
        </p>
        <p className="text-muted-foreground">
          The two fees reflect different types of work and should never appear on the same deal. If you're buying a used car and see a "prep fee," ask whether the dealer means reconditioning. If both appear on the same contract, that's a red flag worth examining. For more on the reconditioning fee specifically, see our guide on <Link href="/dealer-reconditioning-fee" className="underline text-foreground">dealer reconditioning fees</Link>.
        </p>

        <h2 className="text-2xl font-semibold text-foreground">What to Say to the Dealer</h2>
        <p className="text-muted-foreground">
          If the prep fee appears on your quote and you want to address it:
        </p>
        <div className="rounded-md border border-border p-5 bg-muted/50 mb-8">
          <p className="text-sm md:text-base text-foreground leading-relaxed italic">
            "I'd like to understand what's included in the prep fee. If it covers work the dealership does for every vehicle, I'd ask that it be removed or reflected in a lower vehicle price. I'm comparing total out-the-door prices across a few dealers, so the overall number matters more than any individual line item."
          </p>
        </div>
        <p className="text-muted-foreground">
          This keeps the tone professional, signals that you're comparison shopping, and redirects the conversation to the total cost — which is where you have the most leverage. For more on how to get a complete price in writing, see our guide on the <Link href="/out-the-door-price" className="underline text-foreground">out-the-door price</Link> and what it includes in our guide on <Link href="/are-dealer-add-ons-mandatory" className="underline text-foreground">which dealer add-ons are mandatory</Link>.
        </p>
      </div>

      <ArticleCta />

      <p className="text-xs text-muted-foreground mt-12">
        Not affiliated with any dealership. Optimized for U.S. car purchases.
      </p>
    </ArticleLayout>
  );
}
