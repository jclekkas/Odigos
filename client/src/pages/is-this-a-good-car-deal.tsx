import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { setSeoMeta } from "@/lib/seo";
import ArticleHeader from "@/components/ArticleHeader";
import { trackCtaClick } from "@/lib/tracking";
import DirectAnswerBlock from "@/components/DirectAnswerBlock";

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
      <ArticleHeader slug="is-this-a-good-car-deal" />

      <main className="py-12 md:py-20 px-6">
        <article className="max-w-2xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 leading-tight" data-testid="text-good-deal-headline">
            Is this actually a good car deal?
          </h1>

          <DirectAnswerBlock
            question="How do you know if a car deal is actually good?"
            answer="A good deal has a clear out-the-door price, a sale price near fair market value, no forced add-ons, and transparent financing terms — APR, loan term, and monthly payment all itemized. Compare the OTD total to market data, verify all fees are disclosed upfront, and confirm no optional packages were added without your consent."
          />
          
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
            
            <p className="text-lg text-muted-foreground mb-6">
              Seeing everything in writing before visiting the dealership protects you from surprises. The <a href="https://consumer.ftc.gov/articles/buying-new-car" target="_blank" rel="noopener" className="underline text-foreground">FTC's car buying guide</a> offers additional tips on what to verify.
            </p>

            <div className="my-6 rounded-lg border border-border bg-muted/40 p-4">
              <p className="font-medium text-foreground mb-3">Have a quote you're not sure about? Get a quick read before you decide.</p>
              <Link href="/analyze?src=is-this-a-good-car-deal">
                <Button size="sm" data-testid="button-callout-good-deal" onClick={() => trackCtaClick({ location: "article_top_callout", article: "is-this-a-good-car-deal" })}>Check My Deal</Button>
              </Link>
              <p className="text-xs text-muted-foreground mt-2">Takes 10 seconds · No signup required</p>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-border">
            <h2 className="text-xl font-semibold mb-3 text-foreground" data-testid="text-good-deal-cta-heading">
              Not sure if your deal is actually good?
            </h2>
            <p className="text-muted-foreground mb-6">Paste the quote and get a GO or NO-GO — with a clear breakdown of what's fair, what's padded, and what to ask next.</p>
            <Link href="/analyze?src=is-this-a-good-car-deal">
              <Button size="lg" data-testid="button-cta-good-deal" onClick={() => trackCtaClick({ location: "article_bottom_cta", article: "is-this-a-good-car-deal" })}>
                Check My Deal
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
