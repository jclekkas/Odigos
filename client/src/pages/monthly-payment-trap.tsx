import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { setSeoMeta } from "@/lib/seo";
import ArticleHeader from "@/components/ArticleHeader";

export default function MonthlyPaymentTrap() {
  useEffect(() => {
    return setSeoMeta({
      title: "The Monthly Payment Trap in Car Buying | Odigos",
      description: "A $489/month payment could mean $29,340 or $35,208 depending on APR and term. Learn how payment-focused quotes hide the real cost and how to negotiate the out-the-door price first.",
      path: "/monthly-payment-trap",
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      
      <ArticleHeader />

      <main className="py-12 md:py-20 px-6">
        <article className="max-w-2xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 leading-tight" data-testid="text-monthly-headline">
            The Monthly Payment Trap: How Dealers Use Payment-Focused Quotes to Hide the Real Cost
          </h1>
          
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-lg text-muted-foreground mb-6">
              When a dealer asks "What monthly payment are you looking for?" instead of discussing the total price, that's a negotiation tactic, not a helpful question. Payment-focused selling shifts your attention away from the numbers that actually matter: the vehicle price, the interest rate, the loan term, and the total amount you'll pay over the life of the loan.
            </p>

            <div className="my-6 rounded-lg border border-border bg-muted/40 p-4">
              <p className="font-medium text-foreground mb-3">Only seeing a monthly payment? Find out what the full price is hiding.</p>
              <Link href="/analyze">
                <Button size="sm" data-testid="button-callout-monthly">Check My Deal</Button>
              </Link>
              <p className="text-xs text-muted-foreground mt-2">Takes 10 seconds · No signup required</p>
            </div>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">How the payment trap works</h2>

            <p className="text-lg text-muted-foreground mb-6">
              A $489/month payment sounds straightforward, but the total cost behind that number can vary dramatically depending on the APR and loan term. For example:
            </p>

            <ul className="space-y-2 mb-6 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>At 4.9% APR for 60 months, $489/month adds up to roughly $29,340 total.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>At 7.9% APR for 72 months, the same $489/month adds up to roughly $35,208 total.</span>
              </li>
            </ul>

            <p className="text-lg text-muted-foreground mb-6">
              Same monthly number. Nearly $6,000 difference in what you actually pay. The dealer can also hit a lower monthly payment simply by extending the term to 72 or 84 months. That means more total interest paid and a higher risk of being underwater on the loan — owing more than the car is worth.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">What payment-focused quotes typically hide</h2>

            <p className="text-lg text-muted-foreground mb-6">
              When a quote leads with the monthly payment and leaves out the details, there are usually specific things being obscured:
            </p>

            <ul className="space-y-2 mb-6 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span><strong className="text-foreground">APR.</strong> If the dealer says the rate "depends on credit" without giving you a range, they're leaving room to mark it up. Lenders offer a buy rate, and dealers can add margin on top — sometimes several percentage points.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span><strong className="text-foreground">Dealer add-ons.</strong> Products like paint protection, fabric coating, or window tinting are sometimes rolled into the monthly payment without being itemized. You may not realize you're financing $2,000 in add-ons you didn't ask for. <a href="https://www.edmunds.com/car-buying/what-fees-should-you-pay-at-a-car-dealership.html" target="_blank" rel="noopener" className="underline text-foreground">Edmunds</a> has a useful breakdown of which dealership fees are standard and which are negotiable.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span><strong className="text-foreground">The loan term.</strong> A 72- or 84-month loan can add thousands in interest compared to a 60-month term. But because it lowers the monthly number, it's often presented as a benefit.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span><strong className="text-foreground">The total sale price.</strong> If you never see the full out-the-door number, you can't compare it against other offers or verify that the price matches what was advertised. See the full list of <Link href="/dealer-pricing-tactics" className="underline text-foreground">dealer pricing tactics</Link> that work alongside payment-focused quotes.</span>
              </li>
            </ul>

            <div className="my-8 rounded-lg border border-border bg-muted/40 p-5">
              <p className="font-medium text-foreground mb-3">Have a payment-only quote? Check what's actually being hidden from the total price.</p>
              <Link href="/analyze">
                <Button size="sm" data-testid="button-mid-article-monthly">Check My Deal</Button>
              </Link>
              <p className="text-xs text-muted-foreground mt-2">Takes 10 seconds · No signup required</p>
            </div>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">How to avoid the trap</h2>

            <p className="text-lg text-muted-foreground mb-6">
              The most effective approach is to treat the vehicle price and the financing as two separate transactions — because they are. Negotiate the <Link href="/out-the-door-price" className="underline text-foreground">out-the-door price</Link> first: the total amount including tax, title, registration, and any dealer fees. Once you have that number agreed upon, then discuss financing terms separately. If the numbers change when you get to the finance office, that's a different problem — see <Link href="/finance-office-changed-the-numbers" className="underline text-foreground">why the finance office numbers look different</Link>.
            </p>

            <ul className="space-y-2 mb-6 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>Request the full OTD price in writing before visiting the dealership. This gives you a concrete number to compare across dealers.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>If the dealer refuses to give a total price and keeps redirecting the conversation to the monthly payment, treat that as a red flag. A straightforward deal doesn't require hiding the total.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>Get pre-approved through your own bank or credit union before shopping. This gives you a baseline rate to compare against the dealer's financing offer.</span>
              </li>
            </ul>

            <p className="text-lg text-muted-foreground mb-8">
              If you already have a payment-focused quote from a dealer, Odigos can analyze what's missing and flag anything that looks unclear or incomplete. You can also use our <Link href="/how-to-ask-for-out-the-door-price" className="underline text-foreground">copy-paste message template</Link> to request the full OTD breakdown from the dealer.
            </p>
          </div>
          
          <div className="mt-12 pt-8 border-t border-border">
            <h2 className="text-xl font-semibold mb-3 text-foreground" data-testid="text-monthly-cta-heading">
              Only got a monthly payment figure?
            </h2>
            <p className="text-muted-foreground mb-6">Odigos checks whether the full OTD breakdown is hiding behind that number — and flags anything missing or unclear.</p>
            <Link href="/analyze">
              <Button size="lg" data-testid="button-cta-monthly">
                See What's Missing
              </Button>
            </Link>
            <p className="text-xs text-muted-foreground mt-3">Takes 10 seconds · No signup required</p>
          </div>

          <p className="text-xs text-muted-foreground mt-12">
            Not affiliated with any dealership. Optimized for U.S. car purchases.
          </p>
        </article>
      </main>
    </div>
  );
}
