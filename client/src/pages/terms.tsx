import { useEffect } from "react";
import { setSeoMeta } from "@/lib/seo";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useTranslation } from "react-i18next";

export default function Terms() {
  const { t } = useTranslation();

  useEffect(() => {
    return setSeoMeta({
      title: "Terms of Service | Odigos",
      description: "Terms of Service for Odigos — independent dealer quote analysis. Read about acceptable use, disclaimers, and limitations of liability.",
      path: "/terms",
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="py-12 md:py-20 px-6">
        <article className="max-w-2xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 leading-tight">
            {t("terms.heading")}
          </h1>
          <p className="text-sm text-muted-foreground mb-10">{t("terms.lastUpdated")}</p>

          <div className="space-y-10 text-base leading-relaxed">

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">{t("terms.aboutHeading")}</h2>
              <p className="text-muted-foreground">
                {t("terms.aboutBody")}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">{t("terms.notLegalHeading")}</h2>
              <p className="text-muted-foreground mb-3">
                {t("terms.notLegal1")}
              </p>
              <p className="text-muted-foreground">
                {t("terms.notLegal2")}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">{t("terms.noGuaranteeHeading")}</h2>
              <p className="text-muted-foreground mb-3">
                {t("terms.noGuarantee1")}
              </p>
              <p className="text-muted-foreground">
                {t("terms.noGuarantee2")}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">{t("terms.liabilityHeading")}</h2>
              <p className="text-muted-foreground mb-3">
                {t("terms.liabilityPreamble")}
              </p>
              <ul className="space-y-2 text-muted-foreground ml-4">
                <li className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground flex-shrink-0" />
                  <span>{t("terms.liability1")}</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground flex-shrink-0" />
                  <span>{t("terms.liability2")}</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground flex-shrink-0" />
                  <span>{t("terms.liability3")}</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground flex-shrink-0" />
                  <span>{t("terms.liability4")}</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">{t("terms.userResponsibilitiesHeading")}</h2>
              <p className="text-muted-foreground mb-3">
                {t("terms.userResponsibilitiesPreamble")}
              </p>
              <ul className="space-y-2 text-muted-foreground ml-4">
                <li className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground flex-shrink-0" />
                  <span>{t("terms.userResp1")}</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground flex-shrink-0" />
                  <span>{t("terms.userResp2")}</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground flex-shrink-0" />
                  <span>{t("terms.userResp3")}</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground flex-shrink-0" />
                  <span>{t("terms.userResp4")}</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">{t("terms.thirdPartyHeading")}</h2>
              <p className="text-muted-foreground">
                {t("terms.thirdPartyBody")}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">{t("terms.governingLawHeading")}</h2>
              <p className="text-muted-foreground">
                {t("terms.governingLawBody")}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">{t("terms.changesHeading")}</h2>
              <p className="text-muted-foreground">
                {t("terms.changesBody")}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">{t("terms.contactHeading")}</h2>
              <p className="text-muted-foreground">
                {t("terms.contactBody")}
                <a href="mailto:privacy@odigos.app" className="underline text-foreground">privacy@odigos.app</a>.
              </p>
            </section>

          </div>
        </article>
      </main>

      <SiteFooter />
    </div>
  );
}
