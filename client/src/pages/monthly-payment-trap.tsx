import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { setSeoMeta } from "@/lib/seo";
import logoImage from "@assets/odigos_logo.png";

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
      
      <header className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-6 flex items-center gap-3">
          <Link href="/">
            <img src={logoImage} alt="Odigos" className="h-28 w-auto cursor-pointer" data-testid="link-logo-home" />
          </Link>
        </div>
      </header>

      <main className="py-12 md:py-20 px-6">
        <article className="max-w-2xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 leading-tight" data-testid="text-monthly-headline">
            The Monthly Payment Trap: How Dealers Use Payment-Focused Quotes to Hide the Real Cost
          </h1>
          
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-lg text-muted-foreground mb-6">
              When a dealer asks "What monthly payment are you looking for?" instead of discussing the total price, that's a negotiation tactic, not a helpful question. Payment-focused selling shifts your attention away from the numbers that actually matter: the vehicle price, the interest rate, the loan term, and the total amount you'll pay over the life of the loan.
            </p>

            <p className="text-sm text-muted-foreground mb-6">
              Already have a dealer quote? <Link href="/analyze" className="underline text-foreground">Paste it here</Link> and see if anything is missing.
            </p>

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
                <span><strong className="text-foreground">The total sale price.</strong> If you never see the full out-the-door number, you can't compare it against other offers or verify that the price matches what was advertised.</span>
              </li>
            </ul>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">How to avoid the trap</h2>

            <p className="text-lg text-muted-foreground mb-6">
              The most effective approach is to treat the vehicle price and the financing as two separate transactions — because they are. Negotiate the <Link href="/out-the-door-price" className="underline text-foreground">out-the-door price</Link> first: the total amount including tax, title, registration, and any dealer fees. Once you have that number agreed upon, then discuss financing terms separately.
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
              If you already have a payment-focused quote from a dealer, Odigos can analyze what's missing and flag anything that looks unclear or incomplete.
            </p>
          </div>
          
          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-muted-foreground mb-4">
              Already have a dealer quote? Find out if it's a good deal.
            </p>
            <Link href="/analyze">
              <Button size="lg" data-testid="button-cta-monthly">
                Paste your dealer message → Analyze
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
