import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { setSeoMeta } from "@/lib/seo";
import logoImage from "@assets/odigos_logo.png";

export default function DealerChangedPriceAfterDeposit() {
  useEffect(() => {
    return setSeoMeta({
      title: "Dealer Changed the Price After Your Deposit | Odigos",
      description: "If a dealer changed the price after you put down a deposit, here's why it happens, what protects you, and what to do next to get your money back or hold them to the original deal.",
      path: "/dealer-changed-price-after-deposit",
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
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 leading-tight" data-testid="text-deposit-headline">
            Dealer Changed the Price After You Put Down a Deposit
          </h1>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-lg text-muted-foreground mb-6">
              You agreed on a price, put down a deposit, and now the dealer is telling you the numbers have changed. Maybe they say the manager didn't approve the deal, or that the rebate expired, or that financing fell through. Whatever the reason, it feels like a bait-and-switch — because in many cases, that's exactly what it is.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Why dealers do this</h2>

            <p className="text-lg text-muted-foreground mb-4">
              There are several reasons a dealer might try to change the price after collecting a deposit:
            </p>

            <ul className="space-y-2 mb-6 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span><strong className="text-foreground">The "manager override."</strong> The salesperson agrees to a price, collects your deposit, and later claims the sales manager wouldn't sign off. This is sometimes used to test whether you'll accept a higher number.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span><strong className="text-foreground">Expired incentives or rebates.</strong> If time passes between the agreement and the final paperwork, the dealer may claim that a manufacturer rebate expired — even if the timing was within their control.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span><strong className="text-foreground">Spot delivery financing changes.</strong> You drove the car home, but the dealer later says the lender didn't approve the terms. They call you back and present new financing with a higher rate or larger down payment.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span><strong className="text-foreground">Add-ons slipped into the final contract.</strong> The agreed price stays the same on paper, but new line items appear — warranties, protection packages, or fees that weren't part of the original discussion.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span><strong className="text-foreground">Demand-based repricing.</strong> If the vehicle is in high demand, some dealers will try to add a market adjustment after the deposit, hoping you're too committed to walk away.</span>
              </li>
            </ul>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">What actually protects you</h2>

            <p className="text-lg text-muted-foreground mb-6">
              In most U.S. states, a deposit on a vehicle does not create a binding purchase contract unless both parties have signed a formal agreement with all the material terms — price, trade-in value, financing, and fees. A verbal agreement or a handshake deal is difficult to enforce. However, you do have some protections:
            </p>

            <ul className="space-y-2 mb-6 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>If you paid a deposit and the dealer changes the terms, you are generally entitled to a full refund of that deposit. Many states require this by law.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>If you signed a purchase agreement with a specific price and the dealer later tries to change it, that may constitute a breach of contract or an unfair trade practice depending on your state.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>The <a href="https://www.ftc.gov/legal-library/browse/rules/motor-vehicle-dealers-trade-regulation-rule-combating-auto-retail-scams-cars-rule" target="_blank" rel="noopener" className="underline text-foreground">FTC's CARS Rule</a> requires dealers to disclose the full offering price and prohibits bait-and-switch tactics. If a dealer advertised one price and is now quoting another, this may apply.</span>
              </li>
            </ul>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">What to do right now</h2>

            <p className="text-lg text-muted-foreground mb-4">
              If a dealer has changed the price after you put down a deposit, here's a step-by-step approach:
            </p>

            <ol className="space-y-3 mb-6 text-muted-foreground list-decimal list-inside">
              <li className="pl-2">
                <strong className="text-foreground">Gather your documentation.</strong> Pull together everything you have — text messages, emails, the original quote, the deposit receipt, and any paperwork you signed. Screenshots count.
              </li>
              <li className="pl-2">
                <strong className="text-foreground">Ask for the revised numbers in writing.</strong> Don't agree to anything verbally. Request the new price breakdown on paper so you can compare it side by side with the original.
              </li>
              <li className="pl-2">
                <strong className="text-foreground">Identify exactly what changed.</strong> Is it the vehicle price? A new fee? Different financing terms? Knowing the specific change helps you decide whether to push back or walk away.
              </li>
              <li className="pl-2">
                <strong className="text-foreground">Request your deposit back.</strong> If the dealer changed the terms and you no longer want to proceed, ask for a full refund in writing. If they refuse, mention your intent to file a complaint with your state attorney general's office.
              </li>
              <li className="pl-2">
                <strong className="text-foreground">File a complaint if necessary.</strong> Your state's attorney general, the FTC, and the Better Business Bureau are all options. Dealers with multiple complaints on file face real consequences.
              </li>
            </ol>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Before you go back in</h2>

            <p className="text-lg text-muted-foreground mb-6">
              If you're considering going back to the dealership to renegotiate, make sure you know your <Link href="/out-the-door-price" className="underline text-foreground">out-the-door price</Link> — the total amount including tax, title, registration, and all dealer fees. This is the only number that tells you what you're actually paying. Comparing monthly payments or sticker prices won't give you the full picture.
            </p>

            <p className="text-lg text-muted-foreground mb-8">
              If you have the original quote and the revised numbers, Odigos can compare them side by side and flag exactly what changed — so you walk in knowing where you stand.
            </p>
          </div>

          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-muted-foreground mb-4">
              Have the original quote and the new numbers? Let us compare them.
            </p>
            <Link href="/analyze">
              <Button size="lg" data-testid="button-cta-deposit">
                Analyze What Changed
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
