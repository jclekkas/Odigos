import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { capture } from "@/lib/analytics";
import { useTranslation } from "react-i18next";

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

function LangToggle() {
  const { i18n: i18nInstance } = useTranslation();
  const currentLang = i18nInstance.language;

  function toggle() {
    const next = currentLang === "en" ? "es" : "en";
    i18nInstance.changeLanguage(next);
    try { localStorage.setItem("lang", next); } catch { /* ignore */ }
  }

  return (
    <button
      onClick={toggle}
      className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded border border-border/60 hover:border-border"
      data-testid="button-lang-toggle"
      aria-label={currentLang === "en" ? "Switch to Spanish" : "Cambiar a inglés"}
    >
      {currentLang === "en" ? "ES" : "EN"}
    </button>
  );
}

export default function SiteHeader() {
  const { t } = useTranslation();
  const [location] = useLocation();
  const scrollToHash = useScrollToHash();

  function handleHashLink(e: React.MouseEvent<HTMLAnchorElement>, hash: string) {
    if (location === "/") {
      e.preventDefault();
      scrollToHash(hash);
    }
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
        </Link>

        <nav className="hidden items-center gap-6 md:flex" data-testid="nav-links">
          <Link
            href="/dealer-pricing-problems"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            data-testid="link-nav-dealer-tactics"
          >
            {t("header.navDealerTactics")}
          </Link>
          <a
            href="/#pricing"
            onClick={(e) => handleHashLink(e, "pricing")}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            data-testid="link-nav-pricing"
          >
            {t("header.navPricing")}
          </a>
          <a
            href="/#faq"
            onClick={(e) => handleHashLink(e, "faq")}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            data-testid="link-nav-questions"
          >
            {t("header.navQuestions")}
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <LangToggle />
          <Button variant="cta" size="sm" asChild data-testid="button-cta-header">
            <Link href="/analyze" onClick={() => capture("landing_cta_clicked", { location: "header", cta_text: t("header.ctaButton") })}>
              {t("header.ctaButton")}
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
