import { Link } from "wouter";
import logoImage from "@assets/odigos_logo.png";

export default function SiteHeader() {
  return (
    <header
      className="w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50"
      data-testid="site-header"
    >
      <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link href="/">
          <img
            src={logoImage}
            alt="Odigos"
            className="h-8 md:h-9 w-auto cursor-pointer"
            data-testid="link-logo-home"
          />
        </Link>
        <nav className="flex items-center gap-5" data-testid="nav-links">
          <Link
            href="/dealer-pricing-problems"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            data-testid="link-nav-scenario-hub"
          >
            Scenario Hub
          </Link>
          <a
            href="/#how-it-works"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            data-testid="link-nav-how-it-works"
          >
            How It Works
          </a>
        </nav>
      </div>
    </header>
  );
}
