import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";
import { setSeoMeta } from "@/lib/seo";
import { articleSchema, faqPageSchema } from "@/lib/jsonld";
import ArticleLayout from "@/components/ArticleLayout";
import SourceCitation from "@/components/SourceCitation";
import { ARTICLE_SOURCES } from "@/data/articleSources";

const faqItems = [
  {
    question: "Which states cap dealer documentation fees?",
    answer: "Odigos calls a ceiling a legal cap only when its source file has a citation and does not mark the amount as needing a source. California's document processing charge is $85 for a DMV private industry partner and $70 otherwise. Oregon is $250 with an integrator and $200 without one under ORS 822.043; a fee from $201 to $250 is conditional until integrator use is confirmed. New York's verified ceiling is $175 under 15 NYCRR § 78.19(c)(2). Arkansas's verified service-and-handling ceiling is $129 under 23 CAR § 410-801. Michigan's verified dollar ceiling is $280 under DIFS Bulletin 2025-03-CF; the bulletin also says 5% of the cash price if that is less, and the analyzer flags the $280 dollar ceiling. Ohio's verified 2026 ceiling is $398. Texas has no verified hard dollar cap. A fee above $225 is not automatically illegal. Georgia's fetched page says the state does not regulate the amount. Illinois's stored figure and West Virginia's stored $575 figure still need a source and are not called illegal.",
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
    answer: "Only a verified ceiling can be treated as a hard limit. In Texas, a bulletin says a fee above $225 can be charged after the dealer files a notice and a cost analysis, and it still has to be reasonable. Where this file has verified a ceiling, a higher documentation fee is the kind of problem Odigos can flag. Where the figure needs a source, a higher fee is not automatically illegal. Ask the dealer to itemize it and confirm the rule with the state.",
  },
  {
    question: "What's a normal doc fee amount in states with no cap?",
    answer: "This file does not verify a normal documentation fee. Stored reports mention wide ranges, including figures sometimes associated with Florida, Georgia, North Carolina, Colorado, and Illinois. Those ranges are not a market standard, and several of those states do not have a verified cap. Compare the itemized out-the-door price across dealers instead of treating one line as the going rate.",
  },
];

export default function DealerDocFee() {
  useEffect(() => {
    setSeoMeta({
      title: "What Is a Dealer Doc Fee? Ranges by State & How to Negotiate | Odigos",
      description: "A dealer doc fee is a paperwork charge set by the dealership, not the government. Learn what it covers, ranges by state, whether it's negotiable, and red flags to watch for.",
      path: "/dealer-doc-fee",
    });
  }, []);

  return (
    <ArticleLayout title="What Is a Dealer Doc Fee? How to Know If Yours Is Too High">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(articleSchema({ title: "What Is a Dealer Doc Fee? Ranges by State & How to Negotiate | Odigos", description: "A dealer doc fee is a paperwork charge set by the dealership, not the government. Learn what it covers, ranges by state, whether it's negotiable, and red flags to watch for.", path: "/dealer-doc-fee" }))}</script>
        <script type="application/ld+json">{JSON.stringify(faqPageSchema({ questions: faqItems.map((f) => ({ question: f.question, answer: f.answer })) }))}</script>
      </Helmet>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 leading-[1.15]" data-testid="text-doc-fee-headline">
            What Is a Dealer Doc Fee? How to Know If Yours Is Too High
          </h1>

          <div className="rounded-lg border border-border bg-muted/30 p-5 mb-8" data-testid="block-snippet-doc-fee">
            <p className="text-sm font-semibold text-foreground mb-2">Quick answer</p>
            <p className="text-sm text-muted-foreground">A dealer documentation fee is a dealer-imposed charge — not a government fee — for paperwork. California's verified ceiling is $85 only for a DMV private industry partner and $70 otherwise. Florida does not have a verified cap in this file, and reported high fees there are not a market standard. Where the fee line is fixed for every customer, you can still ask the dealer to adjust the vehicle price so the out-the-door total comes down.</p>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-lg text-muted-foreground">
              If you've ever reviewed a car deal closely, you've probably noticed a line item called a "documentation fee," "doc fee," or "dealer processing fee." It typically ranges from $100 to $1,000 or more depending on where you live. Some buyers assume it's a government charge. It's not. It's a dealer-imposed fee, and in many cases, it's negotiable.{" "}<SourceCitation sources={ARTICLE_SOURCES["dealer-doc-fee"].sources} lastVerified={ARTICLE_SOURCES["dealer-doc-fee"].lastVerified} />
            </p>
            <p className="text-lg text-muted-foreground">
              Understanding what a doc fee is, what's normal in your state, and how to push back can save you hundreds of dollars on your next car purchase.
            </p>

            <div className="rounded-lg border border-blue-600/20 bg-blue-600/5 p-5 mb-8">
              <p className="text-base font-semibold text-foreground mb-2">
                Wondering about the doc fee? Paste the quote. Odigos checks the math and any verified cap. It does not treat an unverified range as a legal limit.
              </p>
              <Button asChild variant="cta" className="font-semibold">
                <Link href="/analyze">Check My Doc Fee</Link>
              </Button>
            </div>

            <h2 className="text-2xl font-semibold text-foreground">What Is a Dealer Doc Fee?</h2>
            <p className="text-muted-foreground">
              A dealer documentation fee is a charge the dealership adds to cover the cost of preparing and processing the paperwork for your vehicle purchase. This includes title work, registration filing, contract preparation, and other administrative tasks.
            </p>
            <p className="text-muted-foreground">
              The fee is not set by the government. It's set by the dealership. That means the amount varies widely from one dealer to another, even within the same city. Some dealers charge $150. Others charge $899. The paperwork involved is essentially the same. For a full overview of typical charges, see <a href="https://www.edmunds.com/car-buying/what-fees-should-you-pay-at-a-car-dealership.html" target="_blank" rel="noopener" className="underline text-foreground">Edmunds' guide to dealership fees</a>.
            </p>
            <p className="text-muted-foreground">
              In most states, the doc fee must be disclosed on the buyer's order or purchase agreement. But many buyers don't notice it until they're sitting in the finance office, ready to sign. The work it covers typically includes:
            </p>
            <ul className="space-y-2 mb-4 text-muted-foreground">
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
            <p className="text-muted-foreground">
              Every car sale involves this work. The doc fee is the dealer's way of charging for it as a separate line item rather than folding the cost into the vehicle price. Government fees (title fee, registration fee) are set by the state — the dealer collects them and forwards the money. The doc fee, by contrast, is dealer revenue with no government formula behind it.
            </p>

            <h2 className="text-2xl font-semibold text-foreground">Are Doc Fees Mandatory?</h2>
            <p className="text-muted-foreground">
              Not exactly. Dealers are allowed to charge a doc fee, and in most states, they must charge the same doc fee to every customer (they can't waive it for one buyer and charge another). But that doesn't mean you have to accept it without question.
            </p>
            <p className="text-muted-foreground">
              Some states cap doc fees by law. Others don't. In states with no cap, dealers can charge almost anything they want. If a dealer tells you "it's required by law," that's misleading. The fee is required by their internal policy, not by statute.
            </p>
            <p className="text-muted-foreground">
              Even in states where the fee is consistent across all customers at a given dealership, you can still negotiate the vehicle price or other line items to offset it.
            </p>

            <h2 className="text-2xl font-semibold text-foreground">How Much Is Normal? (By State)</h2>
            <p className="text-muted-foreground">
              Doc fee norms vary significantly by state. Here are a few examples to illustrate how much rules vary by state (always confirm locally):
            </p>
            <ul className="space-y-2 mb-8 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
                <span><strong className="text-foreground">Verified examples:</strong> <Link href="/car-dealer-fees-california" className="underline text-foreground">California</Link> ($85 for a DMV partner, $70 otherwise), <Link href="/car-dealer-fees-new-york" className="underline text-foreground">New York</Link> ($175), Arkansas ($129), Michigan ($280 dollar ceiling), Oregon ($250 with an integrator, $200 otherwise). <Link href="/car-dealer-fees-texas" className="underline text-foreground">Texas</Link> has no verified hard dollar cap. Illinois and West Virginia still have stored figures that are not verified.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
                <span><strong className="text-foreground">Not a verified cap:</strong> <Link href="/car-dealer-fees-florida" className="underline text-foreground">Florida</Link> and Colorado do not have a verified ceiling in this file. Georgia's fetched page says the state does not regulate the amount. Reports of $700–$1,000 are not a verified market rate.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
                <span><strong className="text-foreground">Rule of thumb:</strong> Treat the doc fee as part of your total out-the-door price and compare dealers on the full itemized OTD.</span>
              </li>
            </ul>
            <p className="text-muted-foreground">
              A $999 documentation fee is not automatically legal or illegal when this file has no verified cap. Ask whether nearby dealers itemize a lower fee, and compare the full out-the-door price. Kelley Blue Book and similar guides are outside this file. They are not an Odigos market-value check.
            </p>

            <h2 className="text-2xl font-semibold text-foreground">Can You Negotiate a Doc Fee?</h2>
            <p className="text-muted-foreground">
              In most cases, the dealer won't reduce the doc fee itself — especially in states that require uniform pricing for all customers. But you can absolutely negotiate the overall deal to account for it.
            </p>
            <p className="text-muted-foreground">
              For example, if a dealer charges a $799 doc fee, you can ask for $799 more off the sale price. The net effect is the same. The doc fee stays on the paperwork, but the total out-the-door cost drops.
            </p>
            <p className="text-muted-foreground">
              What matters isn't any single line item — it's the total out-the-door price. That's why you should always ask for an itemized OTD breakdown before agreeing to anything.
            </p>

            <h2 className="text-2xl font-semibold text-foreground">Red Flags to Watch For</h2>
            <ul className="space-y-2 mb-8 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-1.5 shrink-0">•</span>
                <span>A documentation fee you cannot compare, because the quote does not itemize it or this file has no verified ceiling for the state</span>
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
            <p className="text-muted-foreground">
              If any of these sound familiar, review the <a href="https://consumer.ftc.gov/articles/buying-new-car" target="_blank" rel="noopener" className="underline text-foreground">FTC's guide for car buyers</a> to understand your rights before signing.
            </p>

            <div className="my-10 p-6 rounded-lg bg-muted/30 border border-border">
              <p className="text-sm font-semibold text-foreground mb-2">There is no verified national average in this file. A legal ceiling exists only for the states whose caps are cited.</p>
              <Link href="/analyze">
                <Button variant="cta" size="sm">
                  Check My Doc Fee
                </Button>
              </Link>
            </div>

            <h2 className="text-2xl font-semibold text-foreground">What To Say to Push Back</h2>
            <p className="text-muted-foreground">
              You don't need to argue about the doc fee directly. Instead, redirect the conversation to the total price:
            </p>
            <div className="rounded-md border border-border p-5 bg-muted/50 mb-8">
              <p className="text-sm md:text-base text-foreground leading-relaxed italic">
                "I understand the doc fee is standard at your dealership. I'm focused on the total out-the-door price. Can you bring the overall number down by [amount] so the total works for my budget?"
              </p>
            </div>
            <p className="text-muted-foreground">
              This keeps the negotiation professional and focused on what matters — the amount you're actually paying. Most dealers will work with you on the overall number even if they can't change the doc fee line item.
            </p>

            <h2 className="text-2xl font-semibold text-foreground">What Most Buyers Miss About Doc Fees</h2>
            <p className="text-muted-foreground">
              The doc fee is often the last thing buyers look at — but it's also one of the most reliable signals about a dealer's overall pricing approach. A dealer charging $899 in a state where competitors charge $399 is almost certainly making up the difference somewhere else too.
            </p>
            <p className="text-muted-foreground">
              Before visiting any dealer, ask for the full itemized OTD price by email. The doc fee will appear in that breakdown. If it's above average for your state, use it as a negotiating lever on the vehicle price. If they won't itemize at all, that itself tells you something.
            </p>
            <p className="text-muted-foreground">
              Comparing dealers isn't just about the vehicle price — it's about the total package. Two dealers can quote the same MSRP and differ by $1,000 in actual out-the-door cost based on fees alone.
            </p>

            <h2 className="text-2xl font-semibold text-foreground">Frequently Asked Questions About Doc Fees</h2>
            <div className="space-y-6 mb-8">
              {faqItems.map((faq, idx) => (
                <div key={idx}>
                  <h3 className="text-base font-semibold text-foreground mb-1" data-testid={`text-doc-faq-q-${idx}`}>{faq.question}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>


          <div className="rounded-xl border border-border bg-muted/30 p-6 mt-12">
            <h3 className="text-base font-semibold text-foreground mb-2">Your doc fee should match your state's rules — not your dealer's mood.</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Paste your quote and see how every charge stacks up.
            </p>
            <Link href="/analyze">
              <Button variant="cta" size="lg">
                Check My Quote Free
              </Button>
            </Link>
          </div>

          <p className="text-xs text-muted-foreground mt-12">
            Not affiliated with any dealership. Optimized for U.S. car purchases.
          </p>
    </ArticleLayout>
  );
}
