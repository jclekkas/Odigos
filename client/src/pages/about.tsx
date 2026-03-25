import { useEffect } from "react";
import { Link } from "wouter";
import { setSeoMeta } from "@/lib/seo";
import ArticleLayout from "@/components/ArticleLayout";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, Database, Mail } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function About() {
  const { t } = useTranslation();

  useEffect(() => {
    return setSeoMeta({
      title: "About Odigos — The Independent Car Deal Guide",
      description:
        "Odigos (Greek for 'guide') is an independent tool that analyzes car dealer quotes for hidden fees and overcharges. No dealership affiliations. No referral fees. Just clarity before you sign.",
      path: "/about",
    });
  }, []);

  return (
    <ArticleLayout title="About Odigos" showBreadcrumbs={false}>
      <h1
        className="text-3xl md:text-4xl font-bold tracking-tight mb-4 leading-tight"
        data-testid="text-about-heading"
      >
        {t("about.heading")}
      </h1>
      <p className="text-sm text-muted-foreground mb-10">
        {t("about.subtitle")}
      </p>

      <div className="space-y-10 text-base leading-relaxed">

        <section>
          <p className="text-muted-foreground">
            {t("about.intro")}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3" data-testid="text-about-what-we-do">
            {t("about.whatWeDoHeading")}
          </h2>
          <p className="text-muted-foreground mb-3">
            {t("about.whatWeDoPreamble")}
          </p>
          <ul className="space-y-2 text-muted-foreground list-none">
            <li className="flex items-start gap-2">
              <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
              <span>{t("about.check1")}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
              <span>{t("about.check2")}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
              <span>{t("about.check3")}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
              <span>{t("about.check4")}</span>
            </li>
          </ul>
          <p className="text-muted-foreground mt-3">
            {t("about.capStates")}
          </p>
        </section>

        <section className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 shrink-0 text-foreground mt-0.5" />
            <div>
              <h2 className="text-base font-semibold text-foreground mb-1">
                {t("about.whatWeDoNotHeading")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t("about.whatWeDoNotBody")}
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3" data-testid="text-about-how-it-works">
            {t("about.howItWorksHeading")}
          </h2>
          <p className="text-muted-foreground mb-2">
            {t("about.howItWorksFree")}
          </p>
          <p className="text-muted-foreground mb-2">
            {t("about.howItWorksPaid")}
          </p>
          <p className="text-muted-foreground">
            {t("about.howItWorksPrivacy")}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">{t("about.whyNameHeading")}</h2>
          <p className="text-muted-foreground">
            {t("about.whyNameBody")}
          </p>
        </section>

        <section className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-start gap-3">
            <Database className="h-5 w-5 shrink-0 text-foreground mt-0.5" />
            <div>
              <h2 className="text-base font-semibold text-foreground mb-1">
                {t("about.dataHeading")}
              </h2>
              <p className="text-sm text-muted-foreground mb-2">
                {t("about.dataBody1")}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("about.dataBody2")}
              </p>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 shrink-0 text-foreground mt-0.5" />
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">{t("about.contactHeading")}</h2>
              <p className="text-muted-foreground mb-1">
                {t("about.contactBody")}{" "}
                <a
                  href="mailto:jclekkas@gmail.com"
                  className="underline text-foreground"
                  data-testid="link-contact-email"
                >
                  jclekkas@gmail.com
                </a>
              </p>
              <p className="text-muted-foreground">
                {t("about.contactNote")}
              </p>
            </div>
          </div>
        </section>

        <div className="pt-4">
          <Button variant="cta" asChild size="lg" className="gap-2" data-testid="button-cta-about">
            <Link href="/analyze">
              {t("about.ctaButton")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <p className="mt-3 text-sm text-muted-foreground">{t("common.takesAMinute")}</p>
        </div>

      </div>
    </ArticleLayout>
  );
}
