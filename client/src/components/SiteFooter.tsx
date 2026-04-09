import { Link } from "wouter";

export default function SiteFooter() {
  return (
    <footer className="border-t border-border/50 mt-12">
      <div className="max-w-2xl mx-auto px-6 py-6 flex flex-col items-center gap-3 text-center">
        <p className="text-xs text-muted-foreground">
          Odigos — Independent. Not affiliated with any dealership.
        </p>
        <nav className="flex gap-4 text-xs text-muted-foreground">
          <Link href="/about" className="transition-colors hover:text-foreground" data-testid="link-footer-about">
            About
          </Link>
          <Link href="/car-dealer-fees-by-state" className="transition-colors hover:text-foreground" data-testid="link-footer-fees-by-state">
            Fees by State
          </Link>
          <Link href="/privacy" className="transition-colors hover:text-foreground" data-testid="link-footer-privacy">
            Privacy
          </Link>
          <Link href="/terms" className="transition-colors hover:text-foreground" data-testid="link-footer-terms">
            Terms
          </Link>
          <Link href="/legal" className="transition-colors hover:text-foreground" data-testid="link-footer-legal">
            Legal
          </Link>
          <Link href="/out-the-door-price-calculator" className="transition-colors hover:text-foreground" data-testid="footer-otd-calculator-link">
            OTD Calculator
          </Link>
        </nav>
      </div>
    </footer>
  );
}
