import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { setSeoMeta } from "@/lib/seo";
import logoImage from "@assets/odigos_logo.png";

export default function FinanceOfficeChangedTheNumbers() {
  useEffect(() => {
    return setSeoMeta({
      title: "Finance Office Changed the Numbers — What to Do | Odigos",
      description: "You agreed on a price, but the finance office paperwork shows different numbers. Learn why this happens, what to check, and how to protect yourself before signing.",
      path: "/finance-office-changed-the-numbers",
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
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 leading-tight" data-testid="text-finance-office-headline">
            Finance Office Changed the Numbers — What to Do
          </h1>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-lg text-muted-foreground mb-6">
              You spent time negotiating a price with the salesperson. You shook hands, maybe even celebrated a little. Then you sit down in the finance office and the paperwork shows different numbers. The monthly payment is higher. The total doesn't match. New line items appeared. This happens more often than most buyers realize, and it's not always accidental.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Why the numbers look different</h2>

            <p className="text-lg text-muted-foreground mb-6">
              There are a few common reasons the finance office paperwork doesn't match what you agreed on with the salesperson:
            </p>

            <ul className="space-y-2 mb-6 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span><strong className="text-foreground">Add-ons were bundled in.</strong> Products like extended warranties, GAP insurance, paint protection, or tire-and-wheel packages are often pre-loaded into the contract. The finance manager may present them as included or required when they're actually optional. These can add $1,000–$4,000 to the total without being clearly called out.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span><strong className="text-foreground">The interest rate changed.</strong> The rate you were quoted on the showroom floor may not be the rate in the contract. Sometimes the finance office marks up the buy rate from the lender and pockets the difference. Other times, the initial rate was an estimate and the actual approval came back higher.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span><strong className="text-foreground">Fees were added or inflated.</strong> Documentation fees, dealer preparation fees, or "non-negotiable" admin charges sometimes appear in the final paperwork that weren't part of the agreed-upon price. Some of these may be legitimate; others may not be.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span><strong className="text-foreground">The loan term was extended.</strong> To keep the monthly payment close to what you discussed, the finance office may have quietly stretched the loan from 60 to 72 or 84 months. The monthly number looks similar, but the total cost goes up significantly due to additional interest.</span>
              </li>
            </ul>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">What to do</h2>

            <p className="text-lg text-muted-foreground mb-6">
              Before you sign anything, go through this checklist:
            </p>

            <ul className="space-y-2 mb-6 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>Compare the total sale price on the contract to the number you agreed on with the salesperson. If it's higher, ask exactly what changed and why.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>Look at every line item individually. Identify anything you didn't explicitly agree to — especially warranties, protection plans, or service packages.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>Confirm the APR and loan term. Make sure they match what you were told. If you were pre-approved through your own bank, compare the dealer's rate against your pre-approval.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>Ask the finance manager to remove any products or fees you didn't agree to. You have the right to decline optional add-ons.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>If the numbers still don't match after pushback, you can walk away. You are not obligated to sign until you're satisfied with the terms. The <a href="https://www.ftc.gov/cars" target="_blank" rel="noopener" className="underline text-foreground">FTC</a> provides guidance on your rights during auto purchases.</span>
              </li>
            </ul>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">The one thing that protects you most</h2>

            <p className="text-lg text-muted-foreground mb-6">
              The single most effective thing you can do is get the full <Link href="/out-the-door-price" className="underline text-foreground">out-the-door price</Link> in writing before you ever sit down in the finance office. That means the vehicle price, all taxes, all fees, and the total amount — not just the monthly payment. When you have that number documented, you have a clear reference point. Any deviation in the finance office becomes immediately obvious, and you have leverage to push back.
            </p>

            <p className="text-lg text-muted-foreground mb-8">
              If you already have a quote or contract and the numbers don't look right, Odigos can break it down and flag what changed.
            </p>
          </div>

          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-muted-foreground mb-4">
              Have a quote or contract that doesn't match? Let us take a look.
            </p>
            <Link href="/analyze">
              <Button size="lg" data-testid="button-cta-finance-office">
                Analyze My Quote Before I Go In
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
