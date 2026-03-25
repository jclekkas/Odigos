import { useEffect } from "react";
import { setSeoMeta } from "@/lib/seo";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useTranslation } from "react-i18next";

export default function Privacy() {
  const { t } = useTranslation();

  useEffect(() => {
    return setSeoMeta({
      title: "Privacy Policy | Odigos",
      description: "How Odigos handles submitted dealer quotes, what data is stored, and your rights.",
      path: "/privacy",
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="py-12 md:py-20 px-6">
        <article className="max-w-2xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 leading-tight">
            {t("privacy.heading")}
          </h1>
          <p className="text-sm text-muted-foreground mb-10">{t("privacy.lastUpdated")}</p>

          <div className="space-y-10 text-base leading-relaxed">

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">{t("privacy.whatWeCollectHeading")}</h2>
              <p className="text-muted-foreground mb-3">
                {t("privacy.whatWeCollectPreamble")}
              </p>
              <ul className="space-y-2 text-muted-foreground ml-4">
                <li className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground flex-shrink-0" />
                  <span><strong className="text-foreground">{t("privacy.signal1Title")}</strong>{t("privacy.signal1Body")}</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground flex-shrink-0" />
                  <span><strong className="text-foreground">{t("privacy.signal2Title")}</strong>{t("privacy.signal2Body")}</span>
                </li>
              </ul>
              <p className="text-muted-foreground mt-3">
                {t("privacy.whatWeCollectNote")}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">{t("privacy.redactionHeading")}</h2>
              <p className="text-muted-foreground mb-3">
                {t("privacy.redaction1")}
              </p>
              <p className="text-muted-foreground mb-3">
                <strong className="text-foreground">{t("privacy.redactionImportant")}</strong>{t("privacy.redaction2")}
              </p>
              <p className="text-muted-foreground">
                {t("privacy.redaction3")}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">{t("privacy.whyWeCollectHeading")}</h2>
              <p className="text-muted-foreground">
                {t("privacy.whyWeCollectBody")}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">{t("privacy.serviceProvidersHeading")}</h2>
              <p className="text-muted-foreground mb-3">
                {t("privacy.serviceProvidersPreamble")}
              </p>
              <ul className="space-y-2 text-muted-foreground ml-4">
                <li className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground flex-shrink-0" />
                  <span>
                    <strong className="text-foreground">{t("privacy.provider1Title")}</strong>
                    {t("privacy.provider1Body")}
                    <a href="https://openai.com/enterprise-privacy" target="_blank" rel="noopener noreferrer" className="underline text-foreground">
                      {t("privacy.provider1Link")}
                    </a>.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground flex-shrink-0" />
                  <span>
                    <strong className="text-foreground">{t("privacy.provider2Title")}</strong>
                    {t("privacy.provider2Body")}
                    <a href="https://neon.tech/privacy-policy" target="_blank" rel="noopener noreferrer" className="underline text-foreground">
                      {t("privacy.provider2Link1")}
                    </a>
                    {t("privacy.provider2And")}
                    <a href="https://replit.com/privacy" target="_blank" rel="noopener noreferrer" className="underline text-foreground">
                      {t("privacy.provider2Link2")}
                    </a>.
                  </span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">{t("privacy.retentionHeading")}</h2>
              <ul className="space-y-2 text-muted-foreground ml-4">
                <li className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground flex-shrink-0" />
                  <span><strong className="text-foreground">{t("privacy.retention1Title")}</strong>{t("privacy.retention1Body")}</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground flex-shrink-0" />
                  <span><strong className="text-foreground">{t("privacy.retention2Title")}</strong>{t("privacy.retention2Body")}</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">{t("privacy.deletionHeading")}</h2>
              <p className="text-muted-foreground">
                {t("privacy.deletionBody")}
                <a href="mailto:privacy@odigos.app" className="underline text-foreground">privacy@odigos.app</a>
                {t("privacy.deletionBodyEnd")}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">{t("privacy.securityHeading")}</h2>
              <p className="text-muted-foreground">
                {t("privacy.securityBody")}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">{t("privacy.changesHeading")}</h2>
              <p className="text-muted-foreground">
                {t("privacy.changesBody")}
              </p>
            </section>

          </div>
        </article>
      </main>

      <SiteFooter />
    </div>
  );
}
