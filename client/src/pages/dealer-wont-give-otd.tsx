import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import logoImage from "@assets/odigos_logo.png";

export default function DealerWontGiveOtd() {
  useEffect(() => {
    document.title = "Why Dealers Avoid Giving Out-the-Door Prices | Odigos";
  }, []);

  return (
    <div className="min-h-screen bg-background">
      
      <header className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-3">
          <Link href="/">
            <img src={logoImage} alt="Odigos" className="h-20 w-auto cursor-pointer" data-testid="link-logo-home" />
          </Link>
        </div>
      </header>

      <main className="py-12 md:py-20 px-6">
        <article className="max-w-2xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 leading-tight" data-testid="text-dealer-otd-headline">
            Why dealers hesitate to share out-the-door prices
          </h1>
          
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-lg text-muted-foreground mb-6">
              Some dealers avoid giving out-the-door prices because it limits flexibility in pricing and add-ons.
            </p>
            
            <p className="text-lg text-muted-foreground mb-6">
              Without an OTD price, buyers can't easily compare offers or understand total cost.
            </p>
            
            <p className="text-lg text-muted-foreground mb-8">
              Requesting the full out-the-door price in writing helps ensure transparency before you step inside the showroom.
            </p>
          </div>
          
          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-muted-foreground mb-4">
              Already have a dealer quote? Find out if it's a good deal.
            </p>
            <Link href="/analyze">
              <Button size="lg" data-testid="button-cta-dealer-otd">
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
