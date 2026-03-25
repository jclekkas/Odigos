import { useEffect } from "react";
import { Link } from "wouter";
import { setSeoMeta } from "@/lib/seo";
import ArticleLayout from "@/components/ArticleLayout";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function ExampleAnalysis() {
  const { t } = useTranslation();

  useEffect(() => {
    return setSeoMeta({
      title: "Example Dealer Quote Analysis | Odigos",
      description: "See exactly what an Odigos dealer quote analysis looks like on a real example — including flagged issues, verdict, and a copy-paste reply to send back to the dealer.",
      path: "/example-analysis",
    });
  }, []);

  return (
    <ArticleLayout title="Example Analysis" showBreadcrumbs={false}>
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 leading-tight" data-testid="text-example-analysis-heading">
        {t("exampleAnalysis.heading")}
      </h1>
      <p className="text-sm text-muted-foreground mb-10">
        {t("exampleAnalysis.subtitle")}
      </p>

      <div className="space-y-10 text-base leading-relaxed">

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3" data-testid="text-dealer-message-heading">
            {t("exampleAnalysis.dealerMessageHeading")}
          </h2>
          <div className="rounded-lg border border-border bg-muted/40 p-5 text-sm text-muted-foreground font-mono leading-relaxed whitespace-pre-wrap" data-testid="block-dealer-message">
            {t("exampleAnalysis.dealerMessage")}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3" data-testid="text-odigos-verdict-heading">
            {t("exampleAnalysis.analysisHeading")}
          </h2>

          <div className="rounded-lg border border-amber-500/30 bg-amber-50/5 p-5 mb-5" data-testid="block-verdict">
            <p className="text-sm font-semibold text-foreground uppercase tracking-wide mb-1">{t("exampleAnalysis.verdictLabel")}</p>
            <p className="text-2xl font-bold text-amber-500 mb-1" data-testid="text-verdict-label">{t("exampleAnalysis.verdictValue")}</p>
            <p className="text-sm text-muted-foreground">{t("exampleAnalysis.verdictBody")}</p>
          </div>

          <h3 className="text-base font-semibold text-foreground mb-3">{t("exampleAnalysis.issuesFoundHeading")}</h3>
          <ul className="space-y-4" data-testid="list-issues">
            <li className="flex items-start gap-3" data-testid="issue-no-otd">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
              <span className="text-muted-foreground">
                <strong className="text-foreground">{t("exampleAnalysis.issue1Title")}</strong>{t("exampleAnalysis.issue1Body")}
              </span>
            </li>
            <li className="flex items-start gap-3" data-testid="issue-financing-terms">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
              <span className="text-muted-foreground">
                <strong className="text-foreground">{t("exampleAnalysis.issue2Title")}</strong>{t("exampleAnalysis.issue2Body")}
              </span>
            </li>
            <li className="flex items-start gap-3" data-testid="issue-add-on">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
              <span className="text-muted-foreground">
                <strong className="text-foreground">{t("exampleAnalysis.issue3Title")}</strong>{t("exampleAnalysis.issue3Body")}
              </span>
            </li>
            <li className="flex items-start gap-3" data-testid="issue-vague-language">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
              <span className="text-muted-foreground">
                <strong className="text-foreground">{t("exampleAnalysis.issue4Title")}</strong>{t("exampleAnalysis.issue4Body")}
              </span>
            </li>
          </ul>
        </section>

        <section className="rounded-lg border border-border bg-card p-5" data-testid="block-why-this-matters">
          <h2 className="text-base font-semibold mb-2 text-foreground">{t("exampleAnalysis.whyMattersHeading")}</h2>
          <p className="text-sm text-muted-foreground">
            {t("exampleAnalysis.whyMattersBody")}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3" data-testid="text-reply-heading">
            {t("exampleAnalysis.whatToSayHeading")}
          </h2>
          <p className="text-sm text-muted-foreground mb-3">
            {t("exampleAnalysis.whatToSayPreamble")}
          </p>
          <div className="rounded-lg border border-border bg-muted/40 p-5 text-sm text-muted-foreground font-mono leading-relaxed whitespace-pre-wrap" data-testid="block-reply-suggestion">
            {t("exampleAnalysis.replyText")}
          </div>
        </section>

        <div className="pt-4" data-testid="section-cta">
          <p className="text-sm text-muted-foreground mb-4">
            {t("exampleAnalysis.readyCtaPreamble")}
          </p>
          <Button variant="cta" asChild size="lg" className="gap-2" data-testid="button-cta-example-analysis">
            <Link href="/analyze">
              {t("exampleAnalysis.ctaButton")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <p className="mt-3 text-sm text-muted-foreground">{t("exampleAnalysis.ctaMeta")}</p>
        </div>

      </div>
    </ArticleLayout>
  );
}
