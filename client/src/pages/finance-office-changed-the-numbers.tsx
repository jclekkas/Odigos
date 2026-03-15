import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Copy } from "lucide-react";
import { setSeoMeta } from "@/lib/seo";
import ArticleHeader from "@/components/ArticleHeader";

const FINANCE_OFFICE_MESSAGE = `Hi — before I sign, I need a line-by-line breakdown of the final numbers compared to the price we agreed on. Please list the vehicle price, every fee, every add-on product, the interest rate, and the loan term separately. If anything changed from what we discussed, I'd like a written explanation of what's different and why.`;

export default function FinanceOfficeChangedTheNumbers() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    return setSeoMeta({
      title: "Why the Finance Office Numbers Look Different | Odigos",
      description: "You agreed on a price, but the finance office paperwork shows different numbers. Learn why this happens, what to check, and how to protect yourself before signing.",
      path: "/finance-office-changed-the-numbers",
    });
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(FINANCE_OFFICE_MESSAGE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = FINANCE_OFFICE_MESSAGE;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-background">

      <ArticleHeader />

      <main className="py-12 md:py-20 px-6">
        <article className="max-w-2xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 leading-tight" data-testid="text-finance-office-headline">
            Why the Finance Office Numbers Look Different
          </h1>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-lg text-muted-foreground mb-6">
              You spent time negotiating a price with the salesperson. You shook hands, maybe even celebrated a little. Then you sit down in the finance office and the paperwork shows different numbers. The monthly payment is higher. The total doesn't match. New line items appeared. This happens more often than most buyers realize, and it's not always accidental.
            </p>

            <div className="my-6 rounded-lg border border-border bg-muted/40 p-4">
              <p className="font-medium text-foreground mb-3">Numbers in the paperwork don't match what you agreed on? Paste the quote now.</p>
              <Link href="/analyze">
                <Button size="sm" data-testid="button-callout-finance-office">Check My Deal</Button>
              </Link>
              <p className="text-xs text-muted-foreground mt-2">Takes 10 seconds · No signup required</p>
            </div>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Why the numbers look different</h2>

            <p className="text-lg text-muted-foreground mb-6">
              There are a few common reasons the finance office paperwork doesn't match what you agreed on with the salesperson:
            </p>

            <ul className="space-y-2 mb-6 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span><strong className="text-foreground">Add-ons were bundled in.</strong> Products like extended warranties, GAP insurance, paint protection, or tire-and-wheel packages are often pre-loaded into the contract. The finance manager may present them as included or required when they're actually optional — see our guide on <Link href="/dealer-added-fees-after-agreement" className="underline text-foreground">fees added after the agreement</Link>. These can add $1,000–$4,000 to the total without being clearly called out.</span>
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
                <span><strong className="text-foreground">The loan term was extended.</strong> To keep the monthly payment close to what you discussed, the finance office may have quietly stretched the loan from 60 to 72 or 84 months. The monthly number looks similar, but the total cost goes up significantly due to additional interest. This is one of the most common versions of the <Link href="/monthly-payment-trap" className="underline text-foreground">monthly payment trap</Link> — where the focus shifts to a comfortable monthly number while the real cost climbs.</span>
              </li>
            </ul>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">What to say to the finance manager</h2>

            <p className="text-muted-foreground mb-4">
              If the numbers don't match what you agreed on, send or say this before signing. You can copy and paste it directly:
            </p>

            <Card className="relative p-5 bg-muted/50 mb-4">
              <blockquote className="text-sm md:text-base text-foreground leading-relaxed italic pr-10">
                {FINANCE_OFFICE_MESSAGE}
              </blockquote>
              <Button
                variant="outline"
                size="icon"
                className="absolute top-3 right-3"
                onClick={handleCopy}
                data-testid="button-copy-finance-message"
                aria-label="Copy message"
              >
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </Card>

            <p className="text-muted-foreground mb-6">
              This works because it's direct and professional. You're not accusing anyone — you're asking for a clear comparison between what was agreed on and what's on the contract. That clarity alone often resolves the issue.
            </p>

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
              The single most effective thing you can do is get the full <Link href="/out-the-door-price" className="underline text-foreground">out-the-door price</Link> in writing before you ever sit down in the finance office. That means the vehicle price, all taxes, all fees, and the total amount — not just the monthly payment. If a dealer <Link href="/dealer-wont-give-out-the-door-price" className="underline text-foreground">won't give you an OTD price</Link>, that's a red flag on its own. When you have that number documented, you have a clear reference point. Any deviation in the finance office becomes immediately obvious, and you have leverage to push back.
            </p>

            <p className="text-lg text-muted-foreground mb-8">
              If the price changed after you already put down a deposit, that's a related but distinct issue — read about <Link href="/dealer-changed-price-after-deposit" className="underline text-foreground">what happens when a dealer changes the price after your deposit</Link>. If you already have a quote or contract and the numbers don't look right, Odigos can break it down and flag what changed.
            </p>
          </div>

          <div className="mt-12 pt-8 border-t border-border">
            <h2 className="text-xl font-semibold mb-3 text-foreground" data-testid="text-finance-office-cta-heading">
              Numbers don't match what you agreed on?
            </h2>
            <p className="text-muted-foreground mb-6">Paste the quote — Odigos flags every discrepancy between what you agreed to and what the paperwork shows.</p>
            <Link href="/analyze">
              <Button size="lg" data-testid="button-cta-finance-office">
                Flag What Changed
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
