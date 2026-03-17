import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function SiteHeader() {
  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      data-testid="site-header"
    >
      <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6">
        <Link href="/" data-testid="link-logo-home">
          <span className="font-serif text-2xl font-semibold tracking-tight text-foreground cursor-pointer">
            Odigos
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex" data-testid="nav-links">
          <Link
            href="/dealer-pricing-problems"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            data-testid="link-nav-dealer-tactics"
          >
            Dealer Tactics
          </Link>
          <Link
            href="/#pricing"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            data-testid="link-nav-pricing"
          >
            Pricing
          </Link>
          <Link
            href="/#faq"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            data-testid="link-nav-questions"
          >
            Questions
          </Link>
        </nav>

        <Button variant="cta" size="sm" asChild data-testid="button-cta-header">
          <Link href="/analyze">Check a Dealer Quote</Link>
        </Button>
      </div>
    </header>
  );
}
