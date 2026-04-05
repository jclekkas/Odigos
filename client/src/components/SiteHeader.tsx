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
    if (location === "/") {
      e.preventDefault();
      scrollToHash(hash);
    }
    setMobileMenuOpen(false);
  }

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
          <span className="hidden sm:inline text-xs text-muted-foreground ml-2 font-normal tracking-normal">
            Dealer Quote Analyzer
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
            <Link href="/analyze" onClick={() => capture("landing_cta_clicked", { location: "header", cta_text: "Check My Quote" })}>
              Check My Quote
            </Link>
          </Button>
          <button
            type="button"
            className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            data-testid="button-mobile-menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border/60 bg-background px-4 py-3 space-y-2" data-testid="mobile-nav">
          <Link
            href="/dealer-pricing-problems"
            className="block text-sm text-muted-foreground py-2 hover:text-foreground transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            Dealer Tactics
          </Link>
          <a
            href="/#pricing"
            onClick={(e) => handleHashLink(e, "pricing")}
            className="block text-sm text-muted-foreground py-2 hover:text-foreground transition-colors"
          >
            Pricing
          </a>
          <a
            href="/#faq"
            onClick={(e) => handleHashLink(e, "faq")}
            className="block text-sm text-muted-foreground py-2 hover:text-foreground transition-colors"
          >
            Questions
          </a>
        </div>
      )}
    </header>
  );
}
