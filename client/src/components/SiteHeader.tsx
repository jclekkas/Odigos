import { Link } from "wouter";
import logoImage from "@assets/odigos_logo.png";

export default function SiteHeader() {
  return (
    <header
      className="w-full border-b border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50"
      data-testid="site-header"
    >
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/">
          <img
            src={logoImage}
            alt="Odigos"
            className="h-11 md:h-[3.25rem] w-auto cursor-pointer dark:invert"
            data-testid="link-logo-home"
          />
        </Link>
        <nav className="flex items-center gap-3 sm:gap-5" data-testid="nav-links">
          <Link
            href="/dealer-pricing-problems"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
            data-testid="link-nav-scenario-hub"
          >
            Scenario Hub
          </Link>
          <a
            href="/#how-it-works"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
            data-testid="link-nav-how-it-works"
          >
            How It Works
          </a>
        </nav>
      </div>
    </header>
  );
}
