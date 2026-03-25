import { useEffect } from "react";
import { Link } from "wouter";
import { setSeoMeta } from "@/lib/seo";
import ArticleLayout from "@/components/ArticleLayout";
import { Button } from "@/components/ui/button";
import { ArrowRight, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useTranslation, Trans } from "react-i18next";

export default function HowOdigosWorks() {
  const { t } = useTranslation();

  useEffect(() => {
    return setSeoMeta({
      title: "How Odigos Works | Dealer Quote Analysis",
      description: "Learn how Odigos analyzes car dealer quotes for missing out-the-door pricing, hidden fees, and common dealership tactics — and what you get from the analysis.",
      path: "/how-odigos-works",
    });
  }, []);

  return (
    <ArticleLayout title="How Odigos Works" showBreadcrumbs={false}>
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 leading-tight" data-testid="text-how-it-works-heading">
        {t("howItWorks.heading")}
      </h1>
      <p className="text-sm text-muted-foreground mb-10">
        {t("howItWorks.subtitle")}
      </p>

      <div className="space-y-10 text-base leading-relaxed">

        <section>
          <div className="flex items-start gap-3 mb-3">
            <span className="bg-muted text-foreground font-semibold text-sm rounded-full h-7 w-7 flex items-center justify-center shrink-0 mt-0.5">1</span>
            <h2 className="text-xl font-semibold text-foreground">{t("howItWorks.step1Heading")}</h2>
          </div>
          <p className="text-muted-foreground ml-10">
            {t("howItWorks.step1Body1")}
          </p>
          <p className="text-muted-foreground ml-10 mt-2">
            {t("howItWorks.step1Body2")}
          </p>
        </section>

        <section>
          <div className="flex items-start gap-3 mb-3">
            <span className="bg-muted text-foreground font-semibold text-sm rounded-full h-7 w-7 flex items-center justify-center shrink-0 mt-0.5">2</span>
            <h2 className="text-xl font-semibold text-foreground">{t("howItWorks.step2Heading")}</h2>
          </div>
          <p className="text-muted-foreground ml-10 mb-4">
            {t("howItWorks.step2Preamble")}
          </p>
          <ul className="space-y-3 ml-10">
            <li className="flex items-start gap-3">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
              <span className="text-muted-foreground"><strong className="text-foreground">{t("howItWorks.issue1Title")}</strong> — {t("howItWorks.issue1Body")}</span>
            </li>
            <li className="flex items-start gap-3">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
              <span className="text-muted-foreground"><strong className="text-foreground">{t("howItWorks.issue2Title")}</strong> — {t("howItWorks.issue2Body")}</span>
            </li>
            <li className="flex items-start gap-3">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
              <span className="text-muted-foreground"><strong className="text-foreground">{t("howItWorks.issue3Title")}</strong> — {t("howItWorks.issue3Body")}</span>
            </li>
            <li className="flex items-start gap-3">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
              <span className="text-muted-foreground"><strong className="text-foreground">{t("howItWorks.issue4Title")}</strong> — {t("howItWorks.issue4Body")}</span>
            </li>
            <li className="flex items-start gap-3">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
              <span className="text-muted-foreground"><strong className="text-foreground">{t("howItWorks.issue5Title")}</strong> — {t("howItWorks.issue5Body")}</span>
            </li>
          </ul>
        </section>

        <section>
          <div className="flex items-start gap-3 mb-3">
            <span className="bg-muted text-foreground font-semibold text-sm rounded-full h-7 w-7 flex items-center justify-center shrink-0 mt-0.5">3</span>
            <h2 className="text-xl font-semibold text-foreground">{t("howItWorks.step3Heading")}</h2>
          </div>
          <p className="text-muted-foreground ml-10 mb-4">
            {t("howItWorks.step3FreePreamble")}
          </p>
          <ul className="space-y-2 ml-10 mb-4">
            <li className="flex items-center gap-3">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
              <span className="text-muted-foreground">
                <Trans i18nKey="howItWorks.step3Free1">
                  A <strong className="text-foreground">GO / NO-GO verdict</strong> with a deal score and confidence level
                </Trans>
              </span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
              <span className="text-muted-foreground">
                <Trans i18nKey="howItWorks.step3Free2">
                  The <strong className="text-foreground">pricing details detected</strong> in the quote
                </Trans>
              </span>
            </li>
          </ul>
          <p className="text-muted-foreground ml-10 mb-2">
            {t("howItWorks.step3PaidPreamble")}
          </p>
          <ul className="space-y-2 ml-10">
            <li className="flex items-center gap-3">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
              <span className="text-muted-foreground">{t("howItWorks.step3Paid1")}</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
              <span className="text-muted-foreground">{t("howItWorks.step3Paid2")}</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
              <span className="text-muted-foreground">{t("howItWorks.step3Paid3")}</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
              <span className="text-muted-foreground">{t("howItWorks.step3Paid4")}</span>
            </li>
          </ul>
        </section>

        <section className="rounded-lg border border-border bg-card p-5">
          <h2 className="text-base font-semibold mb-2 text-foreground">{t("howItWorks.notDoHeading")}</h2>
          <p className="text-sm text-muted-foreground">
            {t("howItWorks.notDoBody")}
          </p>
        </section>

        <section className="rounded-lg border border-border bg-card p-5">
          <h2 className="text-base font-semibold mb-2 text-foreground">{t("howItWorks.independenceHeading")}</h2>
          <p className="text-sm text-muted-foreground">
            {t("howItWorks.independenceBody")}
          </p>
        </section>

        <div className="pt-4">
          <Button variant="cta" asChild size="lg" className="gap-2" data-testid="button-cta-how-it-works">
            <Link href="/analyze">
              {t("howItWorks.ctaButton")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <p className="mt-3 text-sm text-muted-foreground">{t("common.takesAMinute")}</p>
        </div>

      </div>
    </ArticleLayout>
  );
}
