import { Link } from "wouter";
import { useTranslation } from "react-i18next";

export default function SiteFooter() {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-border/50 mt-12">
      <div className="max-w-2xl mx-auto px-6 py-6 flex flex-col items-center gap-3 text-center">
        <p className="text-xs text-muted-foreground">
          {t("footer.tagline")}
        </p>
        <nav className="flex gap-4 text-xs text-muted-foreground">
          <Link href="/about" className="transition-colors hover:text-foreground" data-testid="link-footer-about">
            {t("footer.about")}
          </Link>
          <Link href="/car-dealer-fees-by-state" className="transition-colors hover:text-foreground" data-testid="link-footer-fees-by-state">
            {t("footer.feesByState")}
          </Link>
          <Link href="/privacy" className="transition-colors hover:text-foreground" data-testid="link-footer-privacy">
            {t("footer.privacy")}
          </Link>
          <Link href="/terms" className="transition-colors hover:text-foreground" data-testid="link-footer-terms">
            {t("footer.terms")}
          </Link>
          <Link href="/car-dealer-fees-by-state" className="transition-colors hover:text-foreground" data-testid="link-footer-fees-by-state-2">
            {t("footer.dealerFeesByState")}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
