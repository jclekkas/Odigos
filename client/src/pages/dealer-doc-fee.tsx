import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";
import { setSeoMeta } from "@/lib/seo";
import { articleSchema, faqPageSchema } from "@/lib/jsonld";
import ArticleLayout from "@/components/ArticleLayout";
import ArticleCta from "@/components/ArticleCta";
import SourceCitation from "@/components/SourceCitation";
import { ARTICLE_SOURCES } from "@/data/articleSources";

const faqItems = [
  {
    question: "Which states cap dealer documentation fees?",
    answer: "A number of states impose a legal cap. California caps doc fees at around $85. New York's limit is $175. Texas raised its cap to $225 in July 2024. Arkansas caps 'service and handling fees' at $129. Ohio caps fees at $387 or 10% of the cash price, whichever is lower. Oregon's cap is $250 (or $200 without an integrator system). States with no cap include Florida, Georgia, Colorado, and Illinois — where dealers can charge whatever they choose.",
  },
  {
    question: "Is the doc fee required by law or government?",
    answer: "No. The documentation fee is a dealer-imposed charge, not a government fee. It is not set by the state, county, or any regulatory body. Dealers set it themselves. If a dealer says the fee is 'required by law,' that is misleading — the dealer's own policy requires it, not any statute.",
  },
  {
    question: "How do you negotiate around a dealer doc fee?",
    answer: "In many states, dealers are required to charge the same doc fee to every customer — so they won't reduce the fee itself. But you can ask them to lower the vehicle price by the same amount. If the doc fee is $799, request $799 off the sale price. The net result is identical. The key is negotiating the total out-the-door price, not individual line items.",
  },
  {
    question: "What does 'same fee for all customers' mean legally?",
    answer: "Several states require dealers to charge a uniform doc fee to every customer — they cannot waive it for one buyer and charge another. This prevents discriminatory pricing. However, it does not prevent you from negotiating other parts of the deal. The vehicle price, add-ons, and trade-in value are all separate from the doc fee and remain negotiable regardless of state policy.",
  },
  {
    question: "Can a doc fee be above the state cap?",
    answer: "Only in limited circumstances. In Texas, dealers can charge above $225 by filing a cost analysis with the state agency (OCCC). In most capped states, the cap is a hard limit — dealers cannot legally exceed it. If you see a doc fee above your state's cap, ask the dealer to explain the justification or provide their state filing.",
  },
  {
    question: "What's a normal doc fee amount in states with no cap?",
    answer: "In uncapped states, $400–$900 is common depending on the region. Florida averages $499–$999. Georgia and North Carolina see $300–$800. Colorado and Illinois typically run $400–$700. Any single fee is hard to call 'normal' because each dealership sets its own amount. The most practical approach: compare the total out-the-door price across multiple dealers rather than focusing on any single line item.",
  },
];

export default function DealerDocFee() {
  useEffect(() => {
    return setSeoMeta({
      title: "Dealer Doc Fee: $85 to $999+ by State | Odigos",
      description: "Doc fees range from $85 (CA cap) to $999+ in uncapped states like Florida. See which states cap them, whether it's negotiable, and how to push back on it.",
      path: "/dealer-doc-fee",
    });
  }, []);

  return (
    <ArticleLayout title="Dealer Doc Fee (2026): What It Is and What Dealers Can Legally Charge" breadcrumbPath="/dealer-doc-fee">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(articleSchema({ title: "Dealer Doc Fee (2026): What It Is and What Dealers Can Legally Charge", description: "Doc fees range from $85 (CA cap) to $999+ in uncapped states like Florida. See which states cap them, whether it's negotiable, and how to push back on it.", path: "/dealer-doc-fee" }))}</script>
        <script type="application/ld+json">{JSON.stringify(faqPageSchema({ questions: faqItems.map((f) => ({ question: f.question, answer: f.answer })) }))}</script>
      </Helmet>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 leading-[1.15]" data-testid="text-doc-fee-headline">
            Dealer Doc Fee (2026): What It Is and What Dealers Can Legally Charge
          </h1>

          <div className="rounded-lg border border-border bg-muted/30 p-5 mb-8" data-testid="block-snippet-doc-fee">
            <p className="text-sm font-semibold text-foreground mb-2">Quick answer</p>
            <p className="text-sm text-muted-foreground">A dealer documentation fee is a dealer-imposed charge — not a government fee — that covers paperwork processing. It ranges from $85 in capped states like California to $999 or more in uncapped states like Florida. In states with no cap, dealers set their own amount and it is often negotiable through the vehicle price, even when the fee line item itself is "fixed."</p>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-lg text-muted-foreground mb-4">
              If you've ever reviewed a car deal closely, you've probably noticed a line item called a "documentation fee," "doc fee," or "dealer processing fee." It typically ranges from $100 to $1,000 or more depending on where you live. Some buyers assume it's a government charge. It's not. It's a dealer-imposed fee, and in many cases, it's negotiable.{" "}<SourceCitation sources={ARTICLE_SOURCES["dealer-doc-fee"].sources} lastVerified={ARTICLE_SOURCES["dealer-doc-fee"].lastVerified} />
            </p>
            <p className="text-lg text-muted-foreground mb-10">
              Understanding what a doc fee is, what's normal in your state, and how to push back can save you hundreds of dollars on your next car purchase.
            </p>

            <p className="text-sm text-muted-foreground mb-6">
              Already have a dealer quote? <Link href="/analyze" className="underline text-foreground">Paste it here</Link> and see if anything is missing.
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
                <span><strong className="text-foreground">Caps (examples):</strong> <Link href="/car-dealer-fees-california" className="underline text-foreground">California</Link> ($85), <Link href="/car-dealer-fees-new-york" className="underline text-foreground">New York</Link> ($175), Washington ($200), <Link href="/car-dealer-fees-texas" className="underline text-foreground">Texas</Link> ($225 as of July 2024), Maryland ($800 as of July 2024).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
                <span><strong className="text-foreground">No caps (examples):</strong> <Link href="/car-dealer-fees-florida" className="underline text-foreground">Florida</Link>, Georgia, Colorado — dealers can charge what they want, and $700–$1,000+ isn't unusual.</span>
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

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">What Most Buyers Miss About Doc Fees</h2>
            <p className="text-muted-foreground mb-4">
              The doc fee is often the last thing buyers look at — but it's also one of the most reliable signals about a dealer's overall pricing approach. A dealer charging $899 in a state where competitors charge $399 is almost certainly making up the difference somewhere else too.
            </p>
            <p className="text-muted-foreground mb-4">
              Before visiting any dealer, ask for the full itemized OTD price by email. The doc fee will appear in that breakdown. If it's above average for your state, use it as a negotiating lever on the vehicle price. If they won't itemize at all, that itself tells you something.
            </p>
            <p className="text-muted-foreground mb-8">
              Comparing dealers isn't just about the vehicle price — it's about the total package. Two dealers can quote the same MSRP and differ by $1,000 in actual out-the-door cost based on fees alone.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Frequently Asked Questions About Doc Fees</h2>
            <div className="space-y-6 mb-8">
              {faqItems.map((faq, idx) => (
                <div key={idx}>
                  <h3 className="text-base font-semibold text-foreground mb-1" data-testid={`text-doc-faq-q-${idx}`}>{faq.question}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>


          <ArticleCta />

          <p className="text-xs text-muted-foreground mt-12">
            Not affiliated with any dealership. Optimized for U.S. car purchases.
          </p>
    </ArticleLayout>
  );
}
