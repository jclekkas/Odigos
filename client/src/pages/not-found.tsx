import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import SiteHeader from "@/components/SiteHeader";
import { ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="flex flex-col items-center justify-center px-4 py-32 text-center">
        <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-6" data-testid="text-404-label">
          404
        </p>
        <h1 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl mb-4" data-testid="text-404-heading">
          Page not found
        </h1>
        <p className="text-muted-foreground text-base max-w-md leading-relaxed mb-10" data-testid="text-404-description">
          The page you're looking for doesn't exist or may have moved. If you were checking a dealer quote, head to the analyzer below.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Button asChild size="lg" className="gap-2" data-testid="button-404-analyze">
            <Link href="/analyze">
              Check a Dealer Quote
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" data-testid="button-404-home">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
