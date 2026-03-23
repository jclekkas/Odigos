import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";
import { setSeoMeta } from "@/lib/seo";
import { articleSchema } from "@/lib/jsonld";
import ArticleLayout from "@/components/ArticleLayout";
import ArticleCta from "@/components/ArticleCta";

export default function WhatIsADealerDocFee() {
  useEffect(() => {
    return setSeoMeta({
      title: "What Is a Dealer Doc Fee? Ranges by State | Odigos",
      description: "A dealer doc fee is a paperwork charge set by the dealership, not the government. Learn what it covers, typical ranges by state, and what counts as normal.",
      path: "/what-is-a-dealer-doc-fee",
    });
  }, []);

  return (
    <ArticleLayout title="What Is a Dealer Doc Fee?">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(articleSchema({ title: "What Is a Dealer Doc Fee? Ranges by State | Odigos", description: "A dealer doc fee is a paperwork charge set by the dealership, not the government. Learn what it covers, typical ranges by state, and what counts as normal.", path: "/what-is-a-dealer-doc-fee" }))}</script>
      </Helmet>
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 leading-[1.15]" data-testid="text-what-is-doc-fee-headline">
        What Is a Dealer Doc Fee?
      </h1>

      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p className="text-lg text-muted-foreground mb-4">
          A dealer documentation fee — often called a "doc fee," "dealer processing fee," or "dealer administrative fee" — is a charge added to a car purchase to cover the administrative work involved in completing the sale. It is not a government fee. It is set by the dealership.
        </p>
        <p className="text-lg text-muted-foreground mb-10">
          Doc fees typically range from $85 to $800 or more depending on the state and the individual dealer. Understanding what the fee covers, how much is normal in your state, and why amounts vary so widely is the foundation for evaluating any car deal.
        </p>

        <p className="text-sm text-muted-foreground mb-6">
          Already have a dealer quote? <Link href="/analyze" className="underline text-foreground">Paste it here</Link> and see if anything looks off.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">What Does a Doc Fee Actually Cover?</h2>
        <p className="text-muted-foreground mb-4">
          The doc fee is the dealership's charge for processing the paperwork that accompanies a vehicle purchase. The work it covers typically includes:
        </p>
        <ul className="space-y-2 mb-8 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span>Preparing the purchase agreement, financing contracts, and disclosure documents</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span>Filing the title transfer with the state DMV on the buyer's behalf</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span>Processing vehicle registration documents</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span>Maintaining transaction records as required by state dealer licensing laws</span>
          </li>
        </ul>
        <p className="text-muted-foreground mb-8">
          Every car sale involves this work. The doc fee is the dealer's way of charging for it as a separate line item rather than folding the cost into the vehicle price. For a full overview of what's typically included in a car purchase, see our guide to the <Link href="/out-the-door-price" className="underline text-foreground">out-the-door price</Link>.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Is the Doc Fee a Government Charge?</h2>
        <p className="text-muted-foreground mb-4">
          No. This is one of the most common misconceptions buyers have. Many people assume the doc fee is a government-required pass-through cost, similar to the title fee or registration fee. It is not.
        </p>
        <p className="text-muted-foreground mb-4">
          Government fees involved in a car purchase — the title fee and registration fee — are set by the state. The dealer collects them and forwards the money to the appropriate state agency. The doc fee, by contrast, is dealer revenue. The dealer sets the amount, and there is no government formula behind the specific dollar figure.
        </p>
        <p className="text-muted-foreground mb-8">
          The distinction matters because government fees are truly non-negotiable (they are what they are by law), while the doc fee is a dealer-set charge — even if individual dealers treat it as fixed for their business.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">How Doc Fees Vary by State</h2>
        <p className="text-muted-foreground mb-4">
          The amount of a doc fee depends heavily on where you are buying. Some states cap the fee by law; others allow dealers to charge whatever they choose. This creates a wide range across the country.
        </p>
        <ul className="space-y-2 mb-4 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span><strong className="text-foreground">Low-cap states:</strong> California caps doc fees near $85. Buyers in California will rarely see a doc fee above this amount regardless of which dealer they work with.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span><strong className="text-foreground">Moderate-cap states:</strong> New York caps doc fees near $175. Washington and Oregon are capped in the $150–$200 range. Fees in these states are predictable and relatively low.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span><strong className="text-foreground">No-cap states:</strong> Florida, Georgia, Colorado, and many others have no statutory cap. Florida commonly sees $500–$1,000+, while Georgia and Colorado typically fall in the $400–$700 range. Texas also has no formal cap, though competitive market pressure keeps most Texas dealers in the $150–$225 range.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span><strong className="text-foreground">Mid-range states:</strong> Many states fall in the $300–$600 range without a formal cap, with regional norms varying by market.</span>
          </li>
        </ul>
        <p className="text-muted-foreground mb-8">
          For a full state-by-state breakdown, see our guide to <Link href="/car-dealer-fees-by-state" className="underline text-foreground">car dealer fees by state</Link>.
        </p>

        <div className="my-10 p-6 rounded-lg bg-muted/30 border border-border">
          <p className="text-sm font-semibold text-foreground mb-2">Not sure what's in your quote?</p>
          <p className="text-sm text-muted-foreground mb-3">
            Paste your dealer quote into Odigos. We'll flag the doc fee, identify other charges, and show you the real out-the-door price.
          </p>
          <Link href="/analyze">
            <Button variant="cta" size="sm" data-testid="button-cta-mid-article-what-is-doc-fee">
              Analyze My Dealer Quote
            </Button>
          </Link>
        </div>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Why the Same Work Costs Different Amounts</h2>
        <p className="text-muted-foreground mb-4">
          Two dealers in the same city, selling the same vehicle, can charge dramatically different doc fees — $199 at one, $799 at another. The paperwork involved is identical. The difference is how each dealer has priced this revenue line.
        </p>
        <p className="text-muted-foreground mb-4">
          In states without caps, dealers can price the fee anywhere the market allows. Some dealers deliberately advertise lower vehicle prices and recover margin through a higher doc fee. Others charge a modest fee and price vehicles at or near market. Because the fee varies so much, comparing dealers only on advertised vehicle price misses a significant cost variable.
        </p>
        <p className="text-muted-foreground mb-8">
          This is why the total <Link href="/out-the-door-price" className="underline text-foreground">out-the-door price</Link> — not the sticker price — is the only valid number to compare across dealers.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Does the Doc Fee Apply to Every Customer?</h2>
        <p className="text-muted-foreground mb-4">
          In most states, dealers are required to charge the same doc fee to every customer if they charge one at all. This prevents selective pricing that could be used for discriminatory purposes. In practice, it means a dealer generally cannot waive the fee for one buyer and charge another.
        </p>
        <p className="text-muted-foreground mb-8">
          This requirement is about consistency, not a mandate to charge the fee at all. Dealers in most states set their own doc fee amount. The rule simply says: once set, apply it equally. Some buyers mistake this requirement as proof the fee is non-negotiable — it is not. It is a rule about consistency, not immutability. For guidance on how to approach the doc fee in a negotiation, see our guide on <Link href="/dealer-doc-fee" className="underline text-foreground">dealer documentation fees</Link>.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">How to Evaluate Whether a Doc Fee Is Normal</h2>
        <p className="text-muted-foreground mb-4">
          The simplest frame: compare the fee to the typical range in your state.
        </p>
        <ul className="space-y-2 mb-8 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span>If you are in a cap state and the fee is near or at the cap, it is consistent with what any dealer in your state can legally charge</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span>If you are in a no-cap state and the fee is $700–$999, it may be high relative to other dealers in the area, but it is within the range that exists in those markets</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span>Regardless of the amount, the doc fee should appear as its own visible line item on any quote — not buried in a catch-all "dealer fee" category</span>
          </li>
        </ul>
        <p className="text-muted-foreground mb-8">
          For more on what to do when a doc fee seems excessive or suspicious, see our guide on <Link href="/hidden-dealer-fees" className="underline text-foreground">hidden dealer fees</Link> and the full negotiation breakdown on the existing <Link href="/dealer-doc-fee" className="underline text-foreground">dealer doc fee</Link> page.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">What to Say to the Dealer</h2>
        <p className="text-muted-foreground mb-3">
          If you want to understand the doc fee before committing to a deal, keep it factual:
        </p>
        <div className="rounded-md border border-border p-5 bg-muted/50 mb-8">
          <p className="text-sm md:text-base text-foreground leading-relaxed italic">
            "Can you confirm the documentation fee and clarify whether it's a fixed amount you charge all customers? I'm putting together an apples-to-apples OTD comparison across dealers, so I want to make sure I have the complete breakdown."
          </p>
        </div>
        <p className="text-muted-foreground mb-8">
          This is a neutral, information-gathering question. It signals that you understand how dealer fees work and that you're comparing total costs, not just vehicle prices.
        </p>
      </div>

      <ArticleCta />

      <p className="text-xs text-muted-foreground mt-12">
        Not affiliated with any dealership. Optimized for U.S. car purchases.
      </p>
    </ArticleLayout>
  );
}
