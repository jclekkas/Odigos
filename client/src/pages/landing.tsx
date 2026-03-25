import { useEffect } from "react";
import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AlertTriangle, ArrowRight, Check, CheckCircle2, Lock, XCircle } from "lucide-react";
import { trackPageView, trackCtaClick } from "@/lib/tracking";
import { capture } from "@/lib/analytics";
import { useExperiment } from "@/lib/experiments";
import SiteHeader from "@/components/SiteHeader";
import SeoHead from "@/components/SeoHead";
import { productSchema } from "@/lib/jsonld";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation, Trans } from "react-i18next";

function scrollToHash(hash: string) {
  if (window.location.pathname === "/") {
    document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
    history.replaceState(null, "", `/#${hash}`);
  } else {
    window.location.href = `/#${hash}`;
  }
}

const faqsSchema = [
  {
    q: "What is an out-the-door price?",
    a: "The total cost to purchase a vehicle — sale price, sales tax, title, registration, doc fees, and any add-ons. It's the check you'd write to leave with the car today.",
  },
  {
    q: "Why won't the dealer give me an OTD price?",
    a: "Some dealers prefer to negotiate around monthly payments because it gives them more flexibility to adjust terms and fees. Requesting the OTD in writing forces transparency.",
  },
  {
    q: "Is Odigos free?",
    a: "The preview is free and gives you a Green/Yellow/Red verdict with a deal score. The full analysis with red flags, missing info checklist, and a copy-paste dealer reply is $49 one-time. No subscriptions.",
  },
  {
    q: "Do you store my messages?",
    a: "Submitted text is PII-redacted and stored for up to 90 days for service quality purposes, then deleted. We do not sell or share your data.",
  },
];

export default function Landing() {
  const { t } = useTranslation();
  const { data: statsData, isLoading: statsLoading, isError: statsError } = useQuery<{ count: number; type: string }>({
    queryKey: ["/api/stats/count"],
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const heroHeadlineVariant = useExperiment("hero_headline");
  const unlockCtaVariant = useExperiment("unlock_cta");

  const heroHeadline = t(`landing.heroHeadline_${heroHeadlineVariant || "control"}`);
  const pricingCtaText = t(`landing.paidTierCta_${unlockCtaVariant || "control"}`);

  const faqs = [
    { q: t("landing.faq1Q"), a: t("landing.faq1A") },
    { q: t("landing.faq2Q"), a: t("landing.faq2A") },
    { q: t("landing.faq3Q"), a: t("landing.faq3A") },
    { q: t("landing.faq4Q"), a: t("landing.faq4A") },
  ];

  useEffect(() => {
    trackPageView("/");
  }, []);

  useEffect(() => {
    const hashFromStorage = sessionStorage.getItem("scrollToHash");
    const hashFromUrl = window.location.hash.slice(1);
    const hash = hashFromStorage || hashFromUrl;
    if (!hash) return;
    if (hashFromStorage) sessionStorage.removeItem("scrollToHash");
    let attempts = 0;
    const maxAttempts = 20;
    function tryScroll() {
      const el = document.getElementById(hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      } else if (attempts < maxAttempts) {
        attempts++;
        requestAnimationFrame(tryScroll);
      }
    }
    requestAnimationFrame(tryScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-2 focus:left-2 focus:bg-background focus:text-foreground focus:px-4 focus:py-2 focus:rounded-md focus:border focus:border-border"
        data-testid="link-skip-to-content"
      >
        {t("landing.skipToContent")}
      </a>
      <SiteHeader />
      <SeoHead
        title="Odigos — Independent Dealer Quote Analysis for Car Buyers"
        description="Paste a dealer quote, text, or email. Odigos checks for missing out-the-door pricing, hidden fees, and common dealership tactics. Free preview, full analysis $49."
        path="/"
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(productSchema())}</script>
      </Helmet>
      <main id="main-content">
        <section className="py-20 sm:py-28 lg:py-32">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:gap-14">

              {/* Hero text column */}
              <div className="flex-1 text-center lg:text-left">
                <p className="mb-4 text-xs font-semibold tracking-widest uppercase text-muted-foreground" data-testid="text-authority-framing">
                  {t("landing.authorityFraming")}
                </p>

                <h1 className="font-serif text-balance text-4xl font-bold tracking-tight sm:text-5xl text-foreground" data-testid="text-hero-headline">
                  {heroHeadline}
                </h1>

                <p className="mt-5 text-base text-foreground/80 sm:text-lg leading-relaxed" data-testid="text-hero-subheadline">
                  {t("landing.heroSubheadline")}
                </p>

                <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
                  <Button variant="cta" size="lg" className="gap-2 font-semibold shadow" asChild data-testid="button-cta-hero">
                    <Link href="/analyze" onClick={() => { trackCtaClick("hero-analyze", t("landing.ctaHero")); capture("landing_cta_clicked", { location: "hero", cta_text: t("landing.ctaHero") }); }}>
                      {t("landing.ctaHero")}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" className="text-muted-foreground" asChild data-testid="button-try-bad">
                    <Link href="/analyze?example=bad" onClick={() => { trackCtaClick("hero-bad-example", t("landing.ctaTryBad")); capture("landing_cta_clicked", { location: "hero", cta_text: t("landing.ctaTryBad") }); }}>
                      {t("landing.ctaTryBad")}
                    </Link>
                  </Button>
                </div>

                <p className="mt-4 text-sm text-muted-foreground" data-testid="text-reassurance">
                  {t("landing.reassurance")}{" "}
                  <Link href="/example-analysis" className="underline underline-offset-4 hover:text-foreground/70 transition-colors" data-testid="link-example-analysis-hero">
                    {t("landing.seeExample")}
                  </Link>
                </p>

                {!statsError && (
                  <div className="mt-5 flex justify-center lg:justify-start" data-testid="container-deals-counter">
                    {statsLoading ? (
                      <Skeleton className="h-6 w-48 rounded-full" data-testid="skeleton-deals-counter" />
                    ) : statsData && statsData.count >= 100 && statsData.type !== "none" ? (
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/50 px-3 py-1 text-xs text-muted-foreground"
                        data-testid="text-deals-counter"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                        {statsData.count.toLocaleString()}{" "}
                        {statsData.type === "real_deals"
                          ? t("landing.realDealsAnalyzed")
                          : t("landing.publicRecordsAnalyzed")}
                      </span>
                    ) : null}
                  </div>
                )}
              </div>

              {/* Static output preview card */}
              <div className="lg:w-80 lg:shrink-0" data-testid="card-preview-result">
                <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 shadow-md p-5 space-y-4">

                  {/* Header */}
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-600/70 dark:text-amber-400/60">
                    {t("landing.sampleResult")}
                  </p>

                  {/* Verdict chips + heading */}
                  <div>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold tracking-wide border bg-amber-500/15 border-amber-500/30 text-amber-700 dark:text-amber-400">
                        NO-GO
                      </span>
                      <span className="text-xs text-muted-foreground border border-border/60 px-2 py-0.5 rounded bg-muted/40">
                        {t("landing.highConfidence")}
                      </span>
                    </div>
                    <p className="text-sm font-semibold leading-snug text-amber-700 dark:text-amber-400">
                      {t("landing.sampleVerdict")}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                      {t("landing.sampleBody")}
                    </p>
                  </div>

                  {/* Issues */}
                  <div className="border-t border-amber-500/15 pt-3 space-y-2">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                      {t("landing.keyIssuesFound")}
                    </p>
                    {[
                      { field: t("landing.otdPrice"), note: t("landing.otdNote") },
                      { field: t("landing.addOnFees"), note: t("landing.addOnNote") },
                      { field: t("landing.financingTerms"), note: t("landing.financingNote") },
                    ].map((item) => (
                      <div key={item.field} className="flex items-start gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                        <p className="text-xs leading-snug">
                          <span className="font-medium text-foreground">{item.field}:</span>{" "}
                          <span className="text-muted-foreground">{item.note}</span>
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Locked full review preview */}
                  <div className="border-t border-amber-500/15 pt-3">
                    <div className="rounded-lg border border-border/50 bg-background/60 p-3 space-y-2 relative overflow-hidden">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Lock className="w-3 h-3 text-muted-foreground/60" />
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                          {t("landing.fullReview")}
                        </p>
                      </div>
                      {[t("landing.missingInfoChecklist"), t("landing.copyPasteDealerReply"), t("landing.negotiationGuidance")].map((line) => (
                        <div key={line} className="flex items-center gap-2 opacity-40 select-none">
                          <Check className="w-3 h-3 text-muted-foreground shrink-0" />
                          <p className="text-xs text-muted-foreground">{line}</p>
                        </div>
                      ))}
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent pointer-events-none" />
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </section>

        <section className="py-12 px-6 bg-muted/30">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl md:text-2xl font-bold mb-6 text-center" data-testid="text-how-it-works-heading">{t("landing.howItWorksHeading")}</h2>
            <ol className="space-y-4">
              {[t("landing.step1"), t("landing.step2"), t("landing.step3")].map((step, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="bg-muted text-foreground font-semibold text-sm rounded-full h-6 w-6 flex items-center justify-center shrink-0 mt-0.5">{idx + 1}</span>
                  <span className="text-base text-muted-foreground">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="features" className="border-t border-border bg-secondary/30 py-24 sm:py-32">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <h2 className="font-serif text-2xl font-semibold tracking-tight sm:text-3xl" data-testid="text-checks-heading">
                {t("landing.checksHeading")}
              </h2>
              <p className="mt-4 text-muted-foreground text-sm">
                {t("landing.checksSubheading")}
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-card p-5" data-testid="card-check-otd">
                <h3 className="font-medium">{t("landing.checkOtdTitle")}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{t("landing.checkOtdBody")}</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-5" data-testid="card-check-addons">
                <h3 className="font-medium">{t("landing.checkAddOnsTitle")}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{t("landing.checkAddOnsBody")}</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-5" data-testid="card-check-fees">
                <h3 className="font-medium">{t("landing.checkFeesTitle")}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{t("landing.checkFeesBody")}</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-5" data-testid="card-check-language">
                <h3 className="font-medium">{t("landing.checkLanguageTitle")}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{t("landing.checkLanguageBody")}</p>
              </div>
            </div>
            <p className="mx-auto mt-16 max-w-2xl text-center text-xs text-muted-foreground" data-testid="text-privacy-note">
              {t("landing.privacyNote")}{" "}
              <Link href="/privacy" className="underline hover:text-foreground">{t("header.privacy")}</Link>
            </p>
          </div>
        </section>

        <section className="py-12 px-6">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl md:text-2xl font-bold mb-4 text-center" data-testid="text-otd-explainer-heading">
              {t("landing.otdExplainerHeading")}
            </h2>
            <p className="text-base text-foreground/75 leading-relaxed">
              {t("landing.otdExplainerBody")}
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              <Trans i18nKey="landing.otdExplainerLinkContext">
                Doc fees and other dealer charges vary significantly from state to state — see our{" "}
                <Link href="/car-dealer-fees-by-state" className="underline underline-offset-4 hover:text-foreground transition-colors" data-testid="link-fees-by-state-otd">
                  car dealer fees by state
                </Link>
                {" "}breakdown to know what's typical where you live.
              </Trans>
            </p>
          </div>
        </section>

        <section className="py-16 px-6 bg-muted/30">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl md:text-2xl font-bold mb-6 text-center">
              {t("landing.inMinutesHeading")}
            </h2>
            <ul className="space-y-3">
              {[t("landing.verdictBullet"), t("landing.missingBullet"), t("landing.redFlagsBullet"), t("landing.copyPasteBullet")].map((item, idx) => (
                <li key={idx} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-base text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="py-16 px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-xl md:text-2xl font-bold mb-4">
              {t("landing.whyItMattersHeading")}
            </h2>
            <p className="text-base text-foreground/75 leading-relaxed">
              {t("landing.whyItMattersBody")}
            </p>
          </div>
        </section>

        <section className="py-16 px-6 bg-muted/30">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl md:text-2xl font-bold mb-6 text-center">
              {t("landing.realExampleHeading")}
            </h2>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-3">
                  <Trans i18nKey="landing.realExampleQuote">
                    Dealer quoted <span className="font-medium text-foreground">$589/month</span> for a 2025 SUV.
                  </Trans>
                </p>
                <p className="text-sm font-medium text-muted-foreground mb-2">{t("landing.odiogosFlagged")}</p>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{t("landing.flagNoOtd")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{t("landing.flagNoApr")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{t("landing.flagProtection")}</span>
                  </li>
                </ul>
                <p className="text-sm text-muted-foreground italic">
                  {t("landing.smallGaps")}
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="py-12 px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-xl md:text-2xl font-bold mb-4" data-testid="text-built-for-heading">
              {t("landing.builtForHeading")}
            </h2>
            <p className="text-base text-foreground/75 leading-relaxed">
              {t("landing.builtForBody")}
            </p>
          </div>
        </section>

        <section className="border-t border-border py-24 sm:py-32" data-testid="section-sample-output">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <h2 className="font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
              {t("landing.sampleOutputHeading")}
            </h2>
            <p className="mt-4 text-sm text-muted-foreground">
              {t("landing.sampleOutputSubheading")}
            </p>

            <div className="mt-12 rounded-lg border border-border bg-card overflow-hidden">
              <div className="p-5 border-b border-border bg-secondary/30">
                <div className="flex items-center gap-3">
                  <XCircle className="h-5 w-5 text-destructive shrink-0" />
                  <div>
                    <span className="font-medium">{t("landing.verdictNogo")}</span>
                    <span className="text-sm text-muted-foreground ml-2">{t("landing.highConfidence")}</span>
                    <span className="text-sm text-muted-foreground ml-2">· Deal Score: 38/100</span>
                  </div>
                </div>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  {t("landing.sampleOutputBody")}
                </p>
              </div>

              <div className="p-5">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-4">{t("landing.detectedIssues")}</p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
                    <span className="text-sm">{t("landing.issue1")}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
                    <span className="text-sm">{t("landing.issue2")}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
                    <span className="text-sm">{t("landing.issue3")}</span>
                  </li>
                </ul>
              </div>

              <div className="px-5 pb-5">
                <div className="rounded border border-border bg-secondary/20 p-4">
                  <p className="text-xs text-muted-foreground">
                    {t("landing.fullAnalysisNote")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="border-t border-border py-24 sm:py-32">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <h2 className="font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
                {t("landing.pricingHeading")}
              </h2>
              <p className="mt-4 text-muted-foreground text-sm">
                {t("landing.pricingSubheading")}
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 max-w-2xl mx-auto">
              <div className="rounded-lg border border-border bg-card p-6" data-testid="card-pricing-tier1">
                <div className="mb-5">
                  <h3 className="font-medium">{t("landing.freeTierName")}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-2xl font-semibold">$0</span>
                  </div>
                </div>
                <ul className="mb-6 space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{t("landing.freeFeature1")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{t("landing.freeFeature2")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{t("landing.freeFeature3")}</span>
                  </li>
                </ul>
                <Button
                  asChild
                  variant="outline"
                  className="w-full"
                  data-testid="button-cta-free-preview"
                >
                  <Link href="/analyze">{t("landing.freeTierName")}</Link>
                </Button>
              </div>
              <div className="rounded-lg border border-primary bg-primary/5 p-6" data-testid="card-pricing-tier2">
                <div className="mb-5">
                  <h3 className="font-medium">{t("landing.paidTierName")}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-2xl font-semibold">$49</span>
                    <span className="text-xs font-normal text-muted-foreground">(one-time)</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{t("landing.paidTierBadge")}</p>
                </div>
                <ul className="mb-6 space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{t("landing.paidFeature1")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{t("landing.paidFeature2")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{t("landing.paidFeature3")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{t("landing.paidFeature4")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{t("landing.paidFeature5")}</span>
                  </li>
                </ul>
                <Button
                  variant="cta"
                  asChild
                  className="w-full"
                  data-testid="button-cta-full-review"
                >
                  <Link href="/analyze">{pricingCtaText}</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section id="faq" className="border-t border-border py-24 sm:py-32">
          <Helmet>
            <script type="application/ld+json">{JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": faqsSchema.map((faq) => ({
                "@type": "Question",
                "name": faq.q,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": faq.a,
                },
              })),
            })}</script>
          </Helmet>
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <h2 className="font-serif text-2xl font-semibold tracking-tight sm:text-3xl mb-12" data-testid="text-faq-heading">
              {t("landing.faqHeading")}
            </h2>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, idx) => (
                <AccordionItem key={idx} value={`item-${idx}`}>
                  <AccordionTrigger
                    className="text-left text-sm font-medium"
                    data-testid={`button-faq-${idx}`}
                  >
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        <section className="py-16 px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">
              {t("landing.finalCtaHeading")}
            </h2>
            <Button variant="cta" asChild size="lg" className="text-base rounded-lg" data-testid="button-cta-final">
              <Link href="/analyze">{t("landing.finalCtaButton")}</Link>
            </Button>
          </div>
        </section>

        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl md:text-2xl font-bold mb-8 text-center" data-testid="text-why-heading">
              {t("landing.whyHeading")}
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div data-testid="card-why-clarity">
                <h3 className="font-semibold mb-2 text-foreground">{t("landing.whyClarityTitle")}</h3>
                <p className="text-sm text-muted-foreground">{t("landing.whyClarityBody")}</p>
              </div>
              <div data-testid="card-why-tactics">
                <h3 className="font-semibold mb-2 text-foreground">{t("landing.whyTacticsTitle")}</h3>
                <p className="text-sm text-muted-foreground">{t("landing.whyTacticsBody")}</p>
              </div>
              <div data-testid="card-why-free">
                <h3 className="font-semibold mb-2 text-foreground">{t("landing.whyFreeTitle")}</h3>
                <p className="text-sm text-muted-foreground">{t("landing.whyFreeBody")}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 px-6">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-base font-semibold mb-2 text-foreground" data-testid="text-scope-heading">{t("landing.scopeHeading")}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("landing.scopeBody")}
            </p>
          </div>
        </section>

        <section className="py-12 px-6 bg-muted/30">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-base font-semibold mb-4 text-foreground" data-testid="text-tactics-heading">{t("landing.tacticsHeading")}</h3>
            <ul className="space-y-2">
              <li><Link href="/dealer-wont-give-otd-price" className="text-sm underline text-foreground" data-testid="link-tactic-otd">{t("landing.tacticOtd")}</Link></li>
              <li><Link href="/are-dealer-add-ons-mandatory" className="text-sm underline text-foreground" data-testid="link-tactic-addons">{t("landing.tacticAddons")}</Link></li>
              <li><Link href="/dealer-doc-fee" className="text-sm underline text-foreground" data-testid="link-tactic-docfee">{t("landing.tacticDocFee")}</Link></li>
              <li><Link href="/market-adjustment-fee" className="text-sm underline text-foreground" data-testid="link-tactic-market">{t("landing.tacticMarket")}</Link></li>
              <li><Link href="/dealer-added-fees-after-agreement" className="text-sm underline text-foreground" data-testid="link-tactic-added-fees">{t("landing.tacticAddedFees")}</Link></li>
              <li><Link href="/car-dealer-fees-by-state" className="text-sm underline text-foreground" data-testid="link-tactic-fees-by-state">{t("landing.tacticFeesByState")}</Link></li>
            </ul>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div>
              <span className="font-serif font-semibold">Odigos</span>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("landing.footerTagline")}
              </p>
            </div>

            <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <button onClick={() => scrollToHash("features")} className="transition-colors hover:text-foreground" data-testid="link-footer-features">
                {t("landing.footerWhatWeReview")}
              </button>
              <button onClick={() => scrollToHash("pricing")} className="transition-colors hover:text-foreground" data-testid="link-footer-pricing">
                {t("landing.footerPricing")}
              </button>
              <button onClick={() => scrollToHash("faq")} className="transition-colors hover:text-foreground" data-testid="link-footer-questions">
                {t("landing.footerQuestions")}
              </button>
              <Link href="/privacy" className="transition-colors hover:text-foreground" data-testid="link-footer-privacy">
                {t("landing.footerPrivacy")}
              </Link>
              <Link href="/terms" className="transition-colors hover:text-foreground" data-testid="link-footer-terms">
                {t("landing.footerTerms")}
              </Link>
              <Link href="/car-dealer-fees-by-state" className="transition-colors hover:text-foreground" data-testid="link-footer-fees-by-state">
                {t("landing.footerFeesByState")}
              </Link>
            </nav>
          </div>

          <div className="mt-8 pt-6 border-t border-border text-center text-xs text-muted-foreground leading-relaxed">
            <p>
              {t("landing.footerDisclaimer")}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
