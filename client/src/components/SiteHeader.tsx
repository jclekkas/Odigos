import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import logoImage from "@assets/odigos_logo.png";

export default function SiteHeader() {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50"
      data-testid="site-header"
    >
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/">
          <img
            src={logoImage}
            alt="Odigos"
            className="h-11 md:h-[3.25rem] w-auto cursor-pointer dark:invert"
            data-testid="link-logo-home"
          />
        </Link>
        <nav className="flex items-center gap-3 sm:gap-5" data-testid="nav-links">
          <a
            href="/#how-it-works"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1 hidden md:inline"
            data-testid="link-nav-how-it-works"
          >
            How It Works
          </a>
          <a
            href="/#pricing"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1 hidden md:inline"
            data-testid="link-nav-pricing"
          >
            Pricing
          </a>
          <Link
            href="/dealer-pricing-problems"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1 hidden md:inline"
            data-testid="link-nav-dealer-tactics"
          >
            Dealer Tactics
          </Link>
          <Link href="/analyze">
            <Button size="sm" className="rounded-full px-5" data-testid="button-nav-analyze">
              Analyze Quote
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
