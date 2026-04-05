import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";
import { setSeoMeta } from "@/lib/seo";
import { articleSchema } from "@/lib/jsonld";
import ArticleLayout from "@/components/ArticleLayout";
import ArticleCta from "@/components/ArticleCta";

export default function AreDealerFeesNegotiable() {
  useEffect(() => {
    return setSeoMeta({
      title: "Are Dealer Fees Negotiable? What to Push Back On | Odigos",
      description: "Some dealer fees are fixed by law; others are dealer profit items. Learn which are negotiable, how to push back, and the OTD strategy that works.",
      path: "/are-dealer-fees-negotiable",
    });
  }, []);

  return (
    <ArticleLayout title="Are Dealer Fees Negotiable?" breadcrumbPath="/are-dealer-fees-negotiable">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(articleSchema({ title: "Are Dealer Fees Negotiable? What to Push Back On | Odigos", description: "Some dealer fees are fixed by law; others are dealer profit items. Learn which are negotiable, how to push back, and the OTD strategy that works.", path: "/are-dealer-fees-negotiable" }))}</script>
      </Helmet>
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 leading-[1.15]" data-testid="text-fees-negotiable-headline">
        Are Dealer Fees Negotiable? What You Can Push Back On
      </h1>

      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p className="text-lg text-muted-foreground mb-4">
          When a car quote comes back with a long list of fees, it's tempting to assume they're all fixed. Some are — set by the government with no room to negotiate. Others are entirely dealer-controlled, and you have every right to push back on them or negotiate around them.
        </p>
        <p className="text-lg text-muted-foreground mb-10">
          The key is knowing which category each fee falls into. Treating a government fee as negotiable wastes time. Treating a dealer profit item as non-negotiable costs you money.
        </p>

        <p className="text-sm text-muted-foreground mb-6">
          Already have a dealer quote? <Link href="/analyze" className="underline text-foreground">Paste it here</Link> and see what's negotiable.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Fees That Are Fixed — Not Negotiable</h2>
        <p className="text-muted-foreground mb-4">
          These fees are set by your state or local government. The dealer collects them and forwards the money to the appropriate agency. They do not control the amount, and they cannot waive or reduce it.
        </p>
        <ul className="space-y-2 mb-8 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span><strong className="text-foreground">Sales tax</strong> — calculated as a percentage of the vehicle price based on your state and county. You can reduce the total by negotiating a lower vehicle price, but the rate itself is fixed.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span><strong className="text-foreground">Title fee</strong> — a state fee for transferring legal ownership into your name. Typically $15–$200 depending on your state.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span><strong className="text-foreground">Registration fee</strong> — a state fee for licensing the vehicle to operate on public roads. Varies by state and often by vehicle weight or value.</span>
          </li>
        </ul>
        <p className="text-muted-foreground mb-8">
          If a dealer quotes a title or registration fee that seems high, you can ask for documentation — but the fee itself isn't negotiable. What matters is that it matches the actual state rate. For a breakdown of what all of these fees look like in a complete quote, see our guide on <Link href="/what-does-out-the-door-price-include" className="underline text-foreground">what the out-the-door price includes</Link>.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Fees That Are Dealer-Controlled</h2>
        <p className="text-muted-foreground mb-4">
          These fees are set by the dealership. Dealers have discretion over whether to charge them and how much to charge. This is where negotiation is possible.
        </p>
        <ul className="space-y-2 mb-8 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span><strong className="text-foreground">Documentation fee</strong> — a dealer-set charge for processing paperwork. Many states require dealers to charge the same fee to all customers, but the fee itself is the dealer's choice. In states with no cap, it can reach $800–$1,000+. See our guide on <Link href="/dealer-doc-fee" className="underline text-foreground">dealer doc fees</Link> for details.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span><strong className="text-foreground">Dealer prep fee</strong> — often described as covering washing, detailing, and prepping the vehicle for delivery. This is not a legitimate cost passed to the buyer — it's part of running the dealership.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span><strong className="text-foreground">Market adjustment fee</strong> — a markup added above MSRP, often on high-demand vehicles. Entirely dealer-discretionary.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
            <span><strong className="text-foreground">Add-on products</strong> — paint protection, VIN etching, nitrogen tires, fabric coating, and similar items are optional in virtually all cases, regardless of how they're presented.</span>
          </li>
        </ul>

        <div className="my-10 p-6 rounded-lg bg-muted/30 border border-border">
          <p className="text-sm font-semibold text-foreground mb-2">See what's in your quote before you respond</p>
          <p className="text-sm text-muted-foreground mb-3">
            Paste your dealer quote into Odigos and we'll identify which fees are government charges vs. dealer profit items — and flag anything that looks inflated.
          </p>
          <Link href="/analyze">
            <Button variant="cta" size="sm" data-testid="button-cta-mid-article-fees-negotiable">
              Analyze My Dealer Quote
            </Button>
          </Link>
        </div>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">The OTD Strategy: Negotiate the Total, Not the Line Items</h2>
        <p className="text-muted-foreground mb-4">
          The most effective approach to dealer fees isn't to argue about each line item individually — it's to negotiate the total <Link href="/out-the-door-price" className="underline text-foreground">out-the-door price</Link>. Here's why this works:
        </p>
        <p className="text-muted-foreground mb-4">
          Many dealers won't reduce the doc fee directly, especially if state rules require uniform pricing. But they can adjust the vehicle price. If the doc fee is $699 and you consider that inflated, you can ask for the vehicle price to be reduced by $699. The line item stays on the paper; the total cost to you decreases.
        </p>
        <p className="text-muted-foreground mb-4">
          The same logic applies to dealer add-ons that have been pre-installed. If the dealer says they can't remove a $500 paint protection package, you can ask for the vehicle price to reflect that adjustment. The add-on stays; the total price drops.
        </p>
        <p className="text-muted-foreground mb-8">
          Always work from the total number, not individual fees. A dealer who won't budge on a specific line item will often work with you on the overall figure.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">When Dealers Say Fees Are "Mandatory"</h2>
        <p className="text-muted-foreground mb-4">
          A common tactic is describing dealer-set fees as required, standard, or legally mandated. This is usually misleading. The doc fee may be standard at that dealership, but "standard" is not the same as "required by law."
        </p>
        <p className="text-muted-foreground mb-4">
          If a dealer says a fee is mandatory, ask them to identify the specific statute that requires it. If they can't — and in most cases they can't — that's useful information. It tells you the fee is a business policy, not a legal requirement.
        </p>
        <p className="text-muted-foreground mb-8">
          If you're encountering pushback when asking for an out-the-door price, our guide on <Link href="/dealer-wont-give-otd-price" className="underline text-foreground">what to do when a dealer won't give an OTD price</Link> explains the most effective approaches.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">What to Say to the Dealer</h2>
        <p className="text-muted-foreground mb-3">
          Rather than challenging specific fees, redirect the conversation to the bottom line:
        </p>
        <div className="rounded-md border border-border p-5 bg-muted/50 mb-8">
          <p className="text-sm md:text-base text-foreground leading-relaxed italic">
            "I understand the doc fee and other charges are part of your standard deal. I'm focused on the total out-the-door price. Can we get that total to [number]? I'm ready to move forward if the OTD works."
          </p>
        </div>
        <p className="text-muted-foreground mb-8">
          This framing works because it doesn't argue about which fees are legitimate — it keeps everything focused on the number you'll actually pay. Most dealers will engage with this approach even if they resist discussing individual line items.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Related Guides</h2>
        <ul className="space-y-2 mb-8 text-muted-foreground">
          <li><Link href="/dealer-doc-fee" className="underline text-foreground">Are Dealer Documentation Fees Legit?</Link></li>
          <li><Link href="/out-the-door-price" className="underline text-foreground">What Is an Out-the-Door Price?</Link></li>
          <li><Link href="/what-does-out-the-door-price-include" className="underline text-foreground">What Does the Out-the-Door Price Include?</Link></li>
          <li><Link href="/dealer-wont-give-otd-price" className="underline text-foreground">Dealer Won't Give an Out-the-Door Price? Here's Why</Link></li>
        </ul>
      </div>

      <ArticleCta />

      <p className="text-xs text-muted-foreground mt-12">
        Not affiliated with any dealership. Optimized for U.S. car purchases.
      </p>
    </ArticleLayout>
  );
}
