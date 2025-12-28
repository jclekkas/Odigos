import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import logoImage from "@assets/image_1766893961497.png";

export default function MonthlyPaymentTrap() {
  useEffect(() => {
    document.title = "The Monthly Payment Trap in Car Buying | Odigos";
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
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 leading-tight" data-testid="text-monthly-headline">
            Why monthly payment quotes hide the real cost of a car
          </h1>
          
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-lg text-muted-foreground mb-6">
              When a dealer focuses on a monthly payment instead of the total price, it's impossible to know what you're actually agreeing to.
            </p>
            
            <p className="text-lg text-muted-foreground mb-4">
              A "$589/month" quote can hide:
            </p>
            
            <ul className="space-y-2 mb-6 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>the real sale price of the vehicle</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>the APR and loan term</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>added fees and protection packages</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>extended financing that increases total cost</span>
              </li>
            </ul>
            
            <p className="text-lg text-muted-foreground mb-8">
              Before visiting a dealership, you should always ask for the full out-the-door price and financing terms in writing.
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
        </article>
      </main>
    </div>
  );
}
