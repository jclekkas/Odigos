import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { setSeoMeta } from "@/lib/seo";
import logoImage from "@assets/odigos_logo.png";

export default function IsThisAGoodCarDeal() {
  useEffect(() => {
    return setSeoMeta({
      title: "Is This a Good Car Deal? How to Tell Before You Go | Odigos",
      description: "Car deals can hide unnecessary fees, unfavorable financing, and inflated pricing. Learn what to look for before visiting the dealership.",
      path: "/is-this-a-good-car-deal",
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
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 leading-tight" data-testid="text-good-deal-headline">
            Is this actually a good car deal?
          </h1>
          
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-lg text-muted-foreground mb-6">
              Car deals are hard to evaluate because key details are often missing or unclear.
            </p>
            
            <p className="text-lg text-muted-foreground mb-4">
              A deal can look good on the surface while hiding:
            </p>
            
            <ul className="space-y-2 mb-6 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>unnecessary fees — including <Link href="/dealer-doc-fee" className="underline text-foreground">inflated doc fees</Link> and <Link href="/are-dealer-add-ons-mandatory" className="underline text-foreground">optional add-ons presented as mandatory</Link>. Check <a href="https://www.kbb.com/car-advice/" target="_blank" rel="noopener" className="underline text-foreground">Kelley Blue Book</a> to research fair vehicle pricing</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>unfavorable financing</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>inflated pricing — such as a <Link href="/market-adjustment-fee" className="underline text-foreground">market adjustment</Link> that adds thousands above MSRP with no added product or service</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>vague "subject to approval" terms</span>
              </li>
            </ul>

            <p className="text-lg text-muted-foreground mb-6">
              The best way to evaluate any deal is to compare the <Link href="/out-the-door-price" className="underline text-foreground">out-the-door price</Link> — the total you'll actually pay, including taxes, fees, and every line item. If you don't have that number yet, start there. For a full rundown of what to watch for, see our <Link href="/dealer-pricing-tactics" className="underline text-foreground">guide to dealer pricing tactics</Link>.
            </p>
            
            <p className="text-lg text-muted-foreground mb-8">
              Seeing everything in writing before visiting the dealership protects you from surprises. The <a href="https://consumer.ftc.gov/articles/buying-new-car" target="_blank" rel="noopener" className="underline text-foreground">FTC's car buying guide</a> offers additional tips on what to verify.
            </p>
          </div>
          
          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-muted-foreground mb-4">
              Not sure if the dealer quote is complete?
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Paste the message or quote you received. Odigos checks for missing out-the-door pricing, add-ons, and unclear fees.
            </p>
            <Link href="/analyze">
              <Button size="lg" data-testid="button-cta-good-deal">
                Check the Quote with Odigos
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
