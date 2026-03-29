import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { capture } from "@/lib/analytics";
import { Menu, X } from "lucide-react";

function useScrollToHash() {
  const [location, navigate] = useLocation();

  return function scrollToHash(hash: string) {
    if (location === "/") {
      document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
      history.replaceState(null, "", `/#${hash}`);
    } else {
      sessionStorage.setItem("scrollToHash", hash);
      navigate("/");
    }
  };
}

export default function SiteHeader() {
  const [location] = useLocation();
  const scrollToHash = useScrollToHash();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function handleHashLink(e: React.MouseEvent<HTMLAnchorElement>, hash: string) {
    e.preventDefault();
    setMobileMenuOpen(false);
    scrollToHash(hash);
  }

  function handleMobileNavLink() {
    setMobileMenuOpen(false);
  }

  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      data-testid="site-header"
    >
      <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6">
        <Link href="/" data-testid="link-logo-home">
          <span className="font-serif text-3xl font-semibold tracking-tight text-foreground cursor-pointer">
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
          <a
            href="/#pricing"
            onClick={(e) => handleHashLink(e, "pricing")}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            data-testid="link-nav-pricing"
          >
            Pricing
          </a>
          <a
            href="/#faq"
            onClick={(e) => handleHashLink(e, "faq")}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            data-testid="link-nav-questions"
          >
            Questions
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Button variant="cta" size="sm" asChild data-testid="button-cta-header">
            <Link href="/analyze" onClick={() => capture("landing_cta_clicked", { location: "header", cta_text: "Check a Dealer Quote" })}>
              Check a Dealer Quote
            </Link>
          </Button>

          <button
            className="flex items-center justify-center md:hidden min-h-[44px] min-w-[44px] text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            data-testid="button-mobile-menu-toggle"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div
          className="md:hidden border-t border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
          data-testid="nav-mobile-menu"
        >
          <nav className="mx-auto flex max-w-4xl flex-col px-4 py-2 sm:px-6">
            <Link
              href="/dealer-pricing-problems"
              onClick={handleMobileNavLink}
              className="flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground min-h-[44px]"
              data-testid="link-mobile-nav-dealer-tactics"
            >
              Dealer Tactics
            </Link>
            <a
              href="/#pricing"
              onClick={(e) => handleHashLink(e, "pricing")}
              className="flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground min-h-[44px]"
              data-testid="link-mobile-nav-pricing"
            >
              Pricing
            </a>
            <a
              href="/#faq"
              onClick={(e) => handleHashLink(e, "faq")}
              className="flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground min-h-[44px]"
              data-testid="link-mobile-nav-questions"
            >
              Questions
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
