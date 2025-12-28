import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import logoImage from "@assets/image_1766893961497.png";

export default function IsThisAGoodCarDeal() {
  useEffect(() => {
    document.title = "Is This a Good Car Deal? How to Tell Before You Go | Odigos";
  }, []);

  return (
    <div className="min-h-screen bg-background">
      
      <header className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-3">
          <Link href="/">
            <img src={logoImage} alt="Odigos" className="h-16 w-auto cursor-pointer" data-testid="link-logo-home" />
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
                <span>unnecessary fees</span>
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
              Seeing everything in writing before visiting the dealership protects you from surprises.
            </p>
          </div>
          
          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-muted-foreground mb-4">
              Already have a dealer quote? Find out if it's a good deal.
            </p>
            <Link href="/analyze">
              <Button size="lg" data-testid="button-cta-good-deal">
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
