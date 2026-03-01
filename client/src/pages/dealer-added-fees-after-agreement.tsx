import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { setSeoMeta } from "@/lib/seo";
import logoImage from "@assets/odigos_logo.png";

export default function DealerAddedFeesAfterAgreement() {
  useEffect(() => {
    return setSeoMeta({
      title: "Dealer Added Fees After You Agreed on a Price | Odigos",
      description: "Discover why dealers add fees after you've agreed on a price, which charges you can refuse, and what to say in the finance office to protect yourself.",
      path: "/dealer-added-fees-after-agreement",
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
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 leading-tight" data-testid="text-dealer-added-fees-headline">
            Dealer Added Fees After You Agreed on a Price
          </h1>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-lg text-muted-foreground mb-6">
              You negotiated a price, shook hands, and felt good about the deal. Then you sat down in the finance office and the final number was hundreds — or thousands — higher than what you agreed to. This happens more often than most buyers expect, and it's not always accidental.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Why this happens</h2>

            <p className="text-lg text-muted-foreground mb-6">
              The price you negotiate with the salesperson is usually just the vehicle price. The finance office is a separate step where additional charges can appear — some legitimate, some negotiable, and some that shouldn't be there at all. Dealers know that by the time you're in the finance office, you've already committed emotionally and are less likely to walk away. That creates leverage for adding fees you didn't discuss earlier.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Common charges that appear after the agreement</h2>

            <ul className="space-y-2 mb-6 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span><strong className="text-foreground">Documentation fee (doc fee).</strong> A charge for processing paperwork. This varies by state and dealer — anywhere from $75 to $900 or more.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span><strong className="text-foreground">Dealer preparation fee.</strong> A charge for "preparing" the vehicle for sale. This is often pure profit and rarely reflects any actual work beyond what the dealer would do anyway.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span><strong className="text-foreground">Paint protection or fabric coating.</strong> Pre-applied products that may cost the dealer very little but are billed at $500–$1,500.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span><strong className="text-foreground">Nitrogen-filled tires.</strong> Sometimes presented as a safety feature, but the actual cost difference is minimal.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span><strong className="text-foreground">VIN etching.</strong> Etching the vehicle identification number onto the windows. Often marked up significantly from the actual cost.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span><strong className="text-foreground">Extended warranties and GAP insurance.</strong> These may have value, but they're often presented as required when they're optional.</span>
              </li>
            </ul>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">Which fees you can refuse</h2>

            <p className="text-lg text-muted-foreground mb-6">
              Taxes, title, and state registration fees are non-negotiable — those are set by your state. But most dealer-added charges are negotiable or entirely optional. If a fee wasn't part of the price you agreed to, you have every right to question it. The <a href="https://www.ftc.gov/news-events/topics/consumer-finance/auto-loans" target="_blank" rel="noopener" className="underline text-foreground">Federal Trade Commission</a> has guidelines about unfair and deceptive practices in auto sales, including add-on charges that weren't clearly disclosed.
            </p>

            <p className="text-lg text-muted-foreground mb-6">
              As a general rule: if the fee wasn't listed in the written quote you received before entering the finance office, you should ask why it's appearing now and whether it can be removed.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">What to say in the finance office</h2>

            <p className="text-lg text-muted-foreground mb-6">
              Keep it simple and direct. You don't need to be confrontational — just clear.
            </p>

            <ul className="space-y-2 mb-6 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>"We agreed on [amount]. I'd like to see a breakdown of every charge above that number."</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>"Which of these fees are required by the state, and which are from the dealership?"</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>"I didn't agree to [specific add-on]. Please remove it."</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>"I'd like to see the final <Link href="/out-the-door-price" className="underline text-foreground">out-the-door price</Link> with only the charges we discussed."</span>
              </li>
            </ul>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">If you already have the paperwork</h2>

            <p className="text-lg text-muted-foreground mb-6">
              If you've already signed and are now noticing charges you didn't expect, your options depend on your state's laws and the specific terms of your contract. Some states have a short rescission period for auto purchases, but many do not. Review the contract line by line and compare it against any written quotes you received. If charges were added without your knowledge, you may want to contact your state's attorney general office or file a complaint with the FTC.
            </p>

            <p className="text-lg text-muted-foreground mb-8">
              If you're still in the negotiation phase and want to make sure nothing unexpected shows up, Odigos can help you analyze what's in your dealer's quote before you sit down in the finance office.
            </p>
          </div>

          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-muted-foreground mb-4">
              Have a dealer quote or paperwork you want checked?
            </p>
            <Link href="/analyze">
              <Button size="lg" data-testid="button-cta-dealer-added-fees">
                Analyze My Paperwork
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