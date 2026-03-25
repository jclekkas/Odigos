import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export default function ArticleCta() {
  const { t } = useTranslation();

  return (
    <div
      className="rounded-xl border border-border bg-muted/30 p-6 mt-12"
      data-testid="section-article-cta"
    >
      <h3 className="text-base font-semibold text-foreground mb-2">
        {t("articleCta.heading")}
      </h3>
      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
        {t("articleCta.body")}
      </p>
      <Link href="/analyze">
        <Button variant="cta" size="lg" data-testid="button-cta-article">
          {t("articleCta.button")}
        </Button>
      </Link>
      <p className="mt-3 text-xs text-muted-foreground">
        <Link href="/example-analysis" className="underline underline-offset-2 hover:text-foreground transition-colors" data-testid="link-example-analysis-article-cta">
          {t("articleCta.exampleLink")}
        </Link>
      </p>
    </div>
  );
}
