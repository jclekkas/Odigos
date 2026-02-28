import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import logoImage from "@assets/odigos_logo.png";
import { setSeoMeta } from "@/lib/seo";

export default function DealerDocFee() {
  useEffect(() => {
    return setSeoMeta({
      title: "Are Dealer Documentation Fees Legit? | Odigos",
      description: "Learn what dealer doc fees are, whether they're negotiable, how much is normal by state, and how to challenge inflated documentation fees before signing.",
      path: "/dealer-doc-fee",
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-6 flex items-center gap-3">
          <Link href="/">
            <img src={logoImage} alt="Odigos" className="h-28 w-auto cursor-pointer" data-testid="link-logo-home" />
          </Link>
        </div>
      </header>

      <main className="py-12 md:py-20 px-6">
        <article className="max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 leading-[1.15]" data-testid="text-doc-fee-headline">
            Are Dealer Documentation Fees Legit?
          </h1>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-lg text-muted-foreground mb-4">
              If you've ever reviewed a car deal closely, you've probably noticed a line item called a "documentation fee," "doc fee," or "dealer processing fee." It typically ranges from $100 to $1,000 or more depending on where you live. Some buyers assume it's a government charge. It's not. It's a dealer-imposed fee, and in many cases, it's negotiable.
            </p>
            <p className="text-lg text-muted-foreground mb-10">
              Understanding what a doc fee is, what's normal in your state, and how to push back can save you hundreds of dollars on your next car purchase.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">What Is a Dealer Doc Fee?</h2>
            <p className="text-muted-foreground mb-4">
              A dealer documentation fee is a charge the dealership adds to cover the cost of preparing and processing the paperwork for your vehicle purchase. This includes title work, registration filing, contract preparation, and other administrative tasks.
            </p>
            <p className="text-muted-foreground mb-4">
              The fee is not set by the government. It's set by the dealership. That means the amount varies widely from one dealer to another, even within the same city. Some dealers charge $150. Others charge $899. The paperwork involved is essentially the same. For a full overview of typical charges, see <a href="https://www.edmunds.com/car-buying/what-fees-should-you-pay-at-a-car-dealership.html" target="_blank" rel="noopener" className="underline text-foreground">Edmunds' guide to dealership fees</a>.
            </p>
            <p className="text-muted-foreground mb-8">
              In most states, the doc fee must be disclosed on the buyer's order or purchase agreement. But many buyers don't notice it until they're sitting in the finance office, ready to sign.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Are Doc Fees Mandatory?</h2>
            <p className="text-muted-foreground mb-4">
              Not exactly. Dealers are allowed to charge a doc fee, and in most states, they must charge the same doc fee to every customer (they can't waive it for one buyer and charge another). But that doesn't mean you have to accept it without question.
            </p>
            <p className="text-muted-foreground mb-4">
              Some states cap doc fees by law. Others don't. In states with no cap, dealers can charge almost anything they want. If a dealer tells you "it's required by law," that's misleading. The fee is required by their internal policy, not by statute.
            </p>
            <p className="text-muted-foreground mb-8">
              Even in states where the fee is consistent across all customers at a given dealership, you can still negotiate the vehicle price or other line items to offset it.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">How Much Is Normal? (By State)</h2>
            <p className="text-muted-foreground mb-4">
              Doc fee norms vary significantly by state. Here are a few examples to illustrate how much rules vary by state (always confirm locally):
            </p>
            <ul className="space-y-2 mb-8 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
                <span><strong className="text-foreground">Caps (examples):</strong> California ($85), New York ($175), Washington ($200), Maryland ($800 cap as of July 1, 2024).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
                <span><strong className="text-foreground">No caps (examples):</strong> Florida, Texas, Georgia, Colorado — dealers can charge what they want, and $700–$1,000+ isn't unusual.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
                <span><strong className="text-foreground">Rule of thumb:</strong> Treat the doc fee as part of your total out-the-door price and compare dealers on the full itemized OTD.</span>
              </li>
            </ul>
            <p className="text-muted-foreground mb-8">
              If a dealer in a no-cap state is charging $999, it's technically legal — but it's worth asking whether competitors nearby charge less. You can also check <a href="https://www.kbb.com/car-advice/" target="_blank" rel="noopener" className="underline text-foreground">Kelley Blue Book</a> for regional pricing benchmarks. The fee should be part of your total deal comparison, not treated as a fixed cost.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Can You Negotiate a Doc Fee?</h2>
            <p className="text-muted-foreground mb-4">
              In most cases, the dealer won't reduce the doc fee itself — especially in states that require uniform pricing for all customers. But you can absolutely negotiate the overall deal to account for it.
            </p>
            <p className="text-muted-foreground mb-4">
              For example, if a dealer charges a $799 doc fee, you can ask for $799 more off the sale price. The net effect is the same. The doc fee stays on the paperwork, but the total out-the-door cost drops.
            </p>
            <p className="text-muted-foreground mb-8">
              What matters isn't any single line item — it's the total out-the-door price. That's why you should always ask for an itemized OTD breakdown before agreeing to anything.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Red Flags to Watch For</h2>
            <ul className="space-y-2 mb-8 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-1.5 shrink-0">•</span>
                <span>A doc fee significantly higher than the state average without explanation</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-1.5 shrink-0">•</span>
                <span>The dealer claims the fee is "government-mandated" or "legally required"</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-1.5 shrink-0">•</span>
                <span>Multiple vague fees that look like duplicates (e.g., "processing fee" plus "doc fee" plus "admin fee")</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-1.5 shrink-0">•</span>
                <span>The doc fee isn't shown on the initial quote — only revealed during F&I</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-1.5 shrink-0">•</span>
                <span>Dealer refuses to provide a written out-the-door price that includes the doc fee</span>
              </li>
            </ul>
            <p className="text-muted-foreground mb-8">
              If any of these sound familiar, review the <a href="https://consumer.ftc.gov/articles/buying-new-car" target="_blank" rel="noopener" className="underline text-foreground">FTC's guide for car buyers</a> to understand your rights before signing.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">What To Say to Push Back</h2>
            <p className="text-muted-foreground mb-3">
              You don't need to argue about the doc fee directly. Instead, redirect the conversation to the total price:
            </p>
            <div className="rounded-md border border-border p-5 bg-muted/50 mb-8">
              <p className="text-sm md:text-base text-foreground leading-relaxed italic">
                "I understand the doc fee is standard at your dealership. I'm focused on the total out-the-door price. Can you bring the overall number down by [amount] so the total works for my budget?"
              </p>
            </div>
            <p className="text-muted-foreground mb-8">
              This keeps the negotiation professional and focused on what matters — the amount you're actually paying. Most dealers will work with you on the overall number even if they can't change the doc fee line item.
            </p>
          </div>

          <div className="mt-12 pt-8 border-t border-border">
            <h2 className="text-xl font-semibold mb-2 text-foreground" data-testid="text-doc-fee-cta-heading">
              Have a dealer quote already?
            </h2>
            <p className="text-muted-foreground mb-4">
              Paste it into Odigos and we'll flag hidden fees, missing details, and anything that doesn't add up — so you know what to ask before you sign.
            </p>
            <Link href="/">
              <Button size="lg" data-testid="button-cta-doc-fee">
                Analyze My Dealer Quote
              </Button>
            </Link>
          </div>

          <p className="text-xs text-muted-foreground mt-12">
            Not affiliated with any dealership. Optimized for U.S. car purchases.
          </p>
        </article>
      </main>
    </div>
  );
}
