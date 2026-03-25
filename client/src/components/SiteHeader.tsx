import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { capture } from "@/lib/analytics";

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
  const scrollToHash = useScrollToHash();

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
          <button
            onClick={() => scrollToHash("pricing")}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            data-testid="link-nav-pricing"
          >
            Pricing
          </button>
          <button
            onClick={() => scrollToHash("faq")}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            data-testid="link-nav-questions"
          >
            Questions
          </button>
        </nav>

        <Button variant="cta" size="sm" asChild data-testid="button-cta-header">
          <Link href="/analyze" onClick={() => capture("landing_cta_clicked", { location: "header", cta_text: "Check a Dealer Quote" })}>Check a Dealer Quote</Link>
        </Button>
      </div>
    </header>
  );
}
