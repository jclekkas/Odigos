import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { setSeoMeta } from "@/lib/seo";
import ArticleLayout from "@/components/ArticleLayout";
import ArticleCta from "@/components/ArticleCta";

export default function IsThisAGoodCarDeal() {
  useEffect(() => {
    return setSeoMeta({
      title: "Is This a Good Car Deal? How to Tell Before You Go | Odigos",
      description: "Car deals can hide unnecessary fees, unfavorable financing, and inflated pricing. Learn what to look for before visiting the dealership.",
      path: "/is-this-a-good-car-deal",
    });
  }, []);

  return (
    <ArticleLayout title="Is this actually a good car deal?">
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
                <span>unnecessary fees — check <a href="https://www.kbb.com/car-advice/" target="_blank" rel="noopener" className="underline text-foreground">Kelley Blue Book</a> to research fair vehicle pricing</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>unfavorable financing</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>inflated pricing</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>vague "subject to approval" terms</span>
              </li>
            </ul>
            
            <p className="text-lg text-muted-foreground mb-8">
              Seeing everything in writing before visiting the dealership protects you from surprises. The <a href="https://consumer.ftc.gov/articles/buying-new-car" target="_blank" rel="noopener" className="underline text-foreground">FTC's car buying guide</a> offers additional tips on what to verify.
            </p>
          </div>
          

          <ArticleCta />

          <p className="text-xs text-muted-foreground mt-12">
            Not affiliated with any dealership. Optimized for U.S. car purchases.
          </p>
    </ArticleLayout>
  );
}
