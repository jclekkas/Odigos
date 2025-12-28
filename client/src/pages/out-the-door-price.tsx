import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import logoImage from "@assets/odigos_logo.png";

export default function OutTheDoorPrice() {
  useEffect(() => {
    document.title = "What Is an Out-the-Door Price? | Odigos";
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
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 leading-tight" data-testid="text-otd-headline">
            What is an out-the-door price in car buying?
          </h1>
          
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-lg text-muted-foreground mb-6">
              An out-the-door (OTD) price is the total cost of a car, including taxes, dealer fees, and any add-ons.
            </p>
            
            <p className="text-lg text-muted-foreground mb-4">
              If a dealer only shares a monthly payment, you don't actually know:
            </p>
            
            <ul className="space-y-2 mb-6 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>the real vehicle price</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>the interest rate</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>the loan term</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>what fees or packages were added</span>
              </li>
            </ul>
            
            <p className="text-lg text-muted-foreground mb-8">
              Before visiting a dealership, you should always ask for the full out-the-door price in writing.
            </p>
          </div>
          
          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-muted-foreground mb-4">
              Already have a dealer quote? Find out if it's a good deal.
            </p>
            <Link href="/analyze">
              <Button size="lg" data-testid="button-cta-otd">
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
