import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import logoImage from "@assets/odigos_logo.png";

export default function SiteHeader() {
  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      data-testid="site-header"
    >
      <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6">
        <Link href="/">
          <img
            src={logoImage}
            alt="Odigos"
            className="h-11 md:h-[3.25rem] w-auto cursor-pointer dark:invert"
            data-testid="link-logo-home"
          />
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

        <Button size="sm" asChild data-testid="button-cta-header">
          <Link href="/analyze">Check a Dealer Quote</Link>
        </Button>
      </div>
    </header>
  );
}
