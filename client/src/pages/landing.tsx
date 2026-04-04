import { useEffect } from "react";
import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AlertTriangle, ArrowRight, Check, CheckCircle2, Lock, Quote, XCircle } from "lucide-react";
import { trackPageView, trackCtaClick } from "@/lib/tracking";
import { capture } from "@/lib/analytics";
import { useExperiment } from "@/lib/experiments";
import SiteHeader from "@/components/SiteHeader";
import { setSeoMeta } from "@/lib/seo";
import { productSchema } from "@/lib/jsonld";
import { Skeleton } from "@/components/ui/skeleton";

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

const HERO_HEADLINES: Record<string, string> = {
  control: "Spot dealer pricing tricks before you agree to anything.",
  urgency: "Don't sign until you know what the dealer isn't telling you.",
};

const PRICING_CTA_LABELS: Record<string, string> = {
  control: "Get Full Review — $49",
  value: "Get Full Review — $49 (Less Than Most Doc Fees)",
};

export default function Landing() {
  const { data: statsData, isLoading: statsLoading, isError: statsError } = useQuery<{ count: number; type: string }>({
    queryKey: ["/api/stats/count"],
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const heroHeadlineVariant = useExperiment("hero_headline");
  const unlockCtaVariant = useExperiment("unlock_cta");

  const heroHeadline = HERO_HEADLINES[heroHeadlineVariant || "control"] ?? HERO_HEADLINES.control;
  const pricingCtaText = PRICING_CTA_LABELS[unlockCtaVariant || "control"] ?? PRICING_CTA_LABELS.control;

  const faqs = [
    { q: "What is an out-the-door price?", a: "The total cost to purchase a vehicle — sale price, sales tax, title, registration, doc fees, and any add-ons. It's the check you'd write to leave with the car today." },
    { q: "Why won't the dealer give me an OTD price?", a: "Some dealers prefer to negotiate around monthly payments because it gives them more flexibility to adjust terms and fees. Requesting the OTD in writing forces transparency." },
    { q: "Is Odigos free?", a: "The preview is free and gives you a Green/Yellow/Red verdict with a deal score. The full analysis with red flags, missing info checklist, and a copy-paste dealer reply is $49 one-time. No subscriptions." },
    { q: "Do you store my messages?", a: "Submitted text is PII-redacted and stored for up to 90 days for service quality purposes, then deleted. We do not sell or share your data." },
  ];

  useEffect(() => {
    trackPageView("/");
  }, []);

  useEffect(() => {
    return setSeoMeta({
      title: "Odigos — Independent Dealer Quote Analysis for Car Buyers",
      description: "Paste a dealer quote, text, or email. Odigos checks for missing out-the-door pricing, hidden fees, and common dealership tactics. Free preview, full analysis $49.",
      path: "/",
    });
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
        Skip to main content
      </a>
      <SiteHeader />
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
                  Independent Quote Review
                </p>

                <h1 className="font-serif text-balance text-4xl font-bold tracking-tight sm:text-5xl text-foreground" data-testid="text-hero-headline">
                  {heroHeadline}
                </h1>

                <p className="mt-5 text-base text-foreground/80 sm:text-lg leading-relaxed" data-testid="text-hero-subheadline">
                  Paste a dealer quote, email, or text. Odigos flags missing out-the-door pricing, hidden fees, and common dealership tactics.
                </p>

                <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
                  <Button variant="cta" size="lg" className="gap-2 font-semibold shadow" asChild data-testid="button-cta-hero">
                    <Link href="/analyze" onClick={() => { trackCtaClick("hero-analyze", "Check a Dealer Quote"); capture("landing_cta_clicked", { location: "hero", cta_text: "Check a Dealer Quote" }); }}>
                      Check a Dealer Quote
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" className="text-muted-foreground" asChild data-testid="button-try-bad">
                    <Link href="/analyze?example=bad" onClick={() => { trackCtaClick("hero-bad-example", "Try a bad deal example"); capture("landing_cta_clicked", { location: "hero", cta_text: "Try a bad deal example" }); }}>
                      Try a bad deal example
                    </Link>
                  </Button>
                </div>

                <p className="mt-3 text-sm text-center lg:text-left">
                  <Link
                    href="/out-the-door-price-calculator"
                    className="text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors"
                    data-testid="hero-otd-calculator-link"
                  >
                    Not ready to share a quote? Estimate your out-the-door price →
                  </Link>
                </p>

                <p className="mt-4 text-sm text-muted-foreground" data-testid="text-reassurance">
                  Takes about a minute. No signup required.{" "}
                  <Link href="/example-analysis" className="underline underline-offset-4 hover:text-foreground/70 transition-colors" data-testid="link-example-analysis-hero">
                    See an example.
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
                          ? "real deals analyzed"
                          : "public auto-finance records analyzed"}
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
                    Sample result
                  </p>

                  {/* Verdict chips + heading */}
                  <div>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold tracking-wide border bg-amber-500/15 border-amber-500/30 text-amber-700 dark:text-amber-400">
                        NO-GO
                      </span>
                      <span className="text-xs text-muted-foreground border border-border/60 px-2 py-0.5 rounded bg-muted/40">
                        High confidence
                      </span>
                    </div>
                    <p className="text-sm font-semibold leading-snug text-amber-700 dark:text-amber-400">
                      Significant red flags — key pricing information is missing
                    </p>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                      This quote has enough gaps that visiting the dealership without resolving them first is high-risk.
                    </p>
                  </div>

                  {/* Issues */}
                  <div className="border-t border-amber-500/15 pt-3 space-y-2">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Key issues found
                    </p>
                    {[
                      { field: "OTD price", note: "No out-the-door total was provided" },
                      { field: "Add-on fees", note: "$1,995 protection package not itemized" },
                      { field: "Financing terms", note: "Monthly payment shown without APR or term" },
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
                          Full review
                        </p>
                      </div>
                      {["Missing info checklist", "Copy-paste dealer reply", "Negotiation guidance"].map((line) => (
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
            <h2 className="text-xl md:text-2xl font-bold mb-6 text-center" data-testid="text-how-it-works-heading">How it works</h2>
            <ol className="space-y-4">
              {[
                "Paste the dealer text or quote",
                "Odigos flags what's missing or risky",
                "Get a copy-paste reply to send the dealer (Full Review)",
              ].map((step, idx) => (
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
                What Odigos Checks For
              </h2>
              <p className="mt-4 text-muted-foreground text-sm">
                The review focuses on pricing transparency and disclosure practices.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-card p-5" data-testid="card-check-otd">
                <h3 className="font-medium">Missing Out-the-Door Price</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">Many dealer quotes hide the full price. Odigos flags when tax, registration, documentation fees, or add-ons are not clearly included.</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-5" data-testid="card-check-addons">
                <h3 className="font-medium">Dealer Add-Ons</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">Dealers often present optional add-ons like nitrogen tires or paint protection as mandatory. Odigos highlights language that suggests this.</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-5" data-testid="card-check-fees">
                <h3 className="font-medium">Unclear Fees</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">Dealer documentation fees, prep fees, and appearance packages are sometimes buried in quotes. Odigos helps surface them.</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-5" data-testid="card-check-language">
                <h3 className="font-medium">Vague Pricing Language</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">If a dealer message avoids committing to a full price or conditions the deal on financing or add-ons, Odigos calls it out.</p>
              </div>
            </div>
            <p className="mx-auto mt-16 max-w-2xl text-center text-xs text-muted-foreground" data-testid="text-privacy-note">
              Pricing signals are stored anonymously to improve dealer fee benchmarks. Submitted text is PII-redacted and deleted after 90 days.{" "}
              <Link href="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>
            </p>
          </div>
        </section>

        <section className="py-12 px-6">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl md:text-2xl font-bold mb-4 text-center" data-testid="text-otd-explainer-heading">
              What is an out-the-door price?
            </h2>
            <p className="text-base text-foreground/75 leading-relaxed">
              The out-the-door price (OTD) is the total amount you'll pay to leave the dealership with the keys — including sale price, tax, title, registration, doc fees, and any add-ons. It's the only number that tells you what the car actually costs. Dealers often focus on the monthly payment instead, which can hide longer loan terms, higher rates, and fees you never agreed to. Odigos analyzes the quote you already have and tells you what's missing.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              Doc fees and other dealer charges vary significantly from state to state — see our{" "}
              <Link href="/car-dealer-fees-by-state" className="underline underline-offset-4 hover:text-foreground transition-colors" data-testid="link-fees-by-state-otd">
                car dealer fees by state
              </Link>
              {" "}breakdown to know what's typical where you live.
            </p>
          </div>
        </section>

        <section className="py-16 px-6 bg-muted/30">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl md:text-2xl font-bold mb-6 text-center">
              In minutes, you'll know:
            </h2>
            <ul className="space-y-3">
              {[
                "Green / Yellow / Red verdict",
                "What's missing (OTD, APR, fees, term)",
                "Red flags & dealer add-ons",
                "Copy-paste reply to send the dealer (paid)",
              ].map((item, idx) => (
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
              Why it matters
            </h2>
            <p className="text-base text-foreground/75 leading-relaxed">
              Dealers often quote monthly payments, add packages later, or ask you to "come in to talk numbers." Odigos turns the messages you already have into a clear next step.
            </p>
          </div>
        </section>

        <section className="py-16 px-6 bg-muted/30">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl md:text-2xl font-bold mb-6 text-center">
              Real example (anonymized)
            </h2>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-3">
                  Dealer quoted <span className="font-medium text-foreground">$589/month</span> for a 2025 SUV.
                </p>
                <p className="text-sm font-medium text-muted-foreground mb-2">Odigos flagged:</p>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">No out-the-door price provided</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">APR not specified</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">Protection package added without cost</span>
                  </li>
                </ul>
                <p className="text-sm text-muted-foreground italic">
                  Small gaps like these can cost thousands.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="py-12 px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-xl md:text-2xl font-bold mb-4" data-testid="text-built-for-heading">
              Built for real car buyers
            </h2>
            <p className="text-base text-foreground/75 leading-relaxed">
              We don't sell cars. We don't work with dealerships. We don't take referral fees. Odigos is an independent tool that works entirely from the messages you already have. No account required. PII-redacted submitted text is deleted within 90 days. Just clarity before you sign.
            </p>
          </div>
        </section>

        <section className="border-t border-border py-24 sm:py-32" data-testid="section-sample-output">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <h2 className="font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
              What the analysis looks like
            </h2>
            <p className="mt-4 text-sm text-muted-foreground">
              Sample output from a real car dealer quote (anonymized)
            </p>

            <div className="mt-12 rounded-lg border border-border bg-card overflow-hidden">
              <div className="p-5 border-b border-border bg-secondary/30">
                <div className="flex items-center gap-3">
                  <XCircle className="h-5 w-5 text-destructive shrink-0" />
                  <div>
                    <span className="font-medium">Verdict: NO-GO</span>
                    <span className="text-sm text-muted-foreground ml-2">High confidence</span>
                    <span className="text-sm text-muted-foreground ml-2">· Deal Score: 38/100</span>
                  </div>
                </div>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  This quote is missing critical pricing details. Do not proceed without a complete out-the-door breakdown.
                </p>
              </div>

              <div className="p-5">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-4">Detected issues</p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
                    <span className="text-sm">No out-the-door price — only monthly payment quoted</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
                    <span className="text-sm">APR not disclosed — rate described as "competitive"</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
                    <span className="text-sm">$895 'protection package' added without a disclosed price</span>
                  </li>
                </ul>
              </div>

              <div className="px-5 pb-5">
                <div className="rounded border border-border bg-secondary/20 p-4">
                  <p className="text-xs text-muted-foreground">
                    Full analysis includes: the specific questions to request before signing, a copy-paste reply to send the dealer, and a line-by-line explanation of each flag detected.
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
                Simple pricing
              </h2>
              <p className="mt-4 text-muted-foreground text-sm">
                No subscription. No upsells. One-time purchase per analysis.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 max-w-2xl mx-auto">
              <div className="rounded-lg border border-border bg-card p-6" data-testid="card-pricing-tier1">
                <div className="mb-5">
                  <h3 className="font-medium">Free Preview</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-2xl font-semibold">$0</span>
                  </div>
                </div>
                <ul className="mb-6 space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Verdict (Green/Yellow/Red)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Deal score & confidence</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Pricing terms found in the quote</span>
                  </li>
                </ul>
                <Button
                  asChild
                  variant="outline"
                  className="w-full"
                  data-testid="button-cta-free-preview"
                >
                  <Link href="/analyze">Free Preview</Link>
                </Button>
              </div>
              <div className="rounded-lg border border-primary bg-primary/5 p-6" data-testid="card-pricing-tier2">
                <div className="mb-5">
                  <h3 className="font-medium">Full Deal Review</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-2xl font-semibold">$49</span>
                    <span className="text-xs font-normal text-muted-foreground">(one-time)</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">Less than most dealer doc fees</p>
                </div>
                <ul className="mb-6 space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Everything in Free</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Red flags & hidden fees</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Missing info checklist</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Copy-paste dealer reply</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Full analysis reasoning</span>
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

        <section className="border-t border-border py-24 sm:py-32" data-testid="section-methodology">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <h2 className="font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
                How We Score Your Deal
              </h2>
              <p className="mt-4 text-muted-foreground text-sm">
                Every quote is evaluated and assigned a color-coded verdict so you know where you stand at a glance.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-3">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                    <h3 className="font-medium text-green-700 dark:text-green-400">GREEN / GO</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    All key terms present, no red flags, reasonable pricing. You're in good shape to move forward.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
                    <h3 className="font-medium text-amber-700 dark:text-amber-400">YELLOW / NEED-MORE-INFO</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Missing critical details. Proceed with caution and request the missing information before signing.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <XCircle className="h-5 w-5 text-destructive shrink-0" />
                    <h3 className="font-medium text-red-700 dark:text-red-400">RED / NO-GO</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Significant red flags detected. Do not proceed without resolving the issues identified in the analysis.
                  </p>
                </CardContent>
              </Card>
            </div>
            <p className="mx-auto mt-12 max-w-2xl text-center text-sm text-muted-foreground leading-relaxed">
              Our analysis combines AI evaluation with state-specific dealer fee regulations, market pricing data, and pattern detection from thousands of analyzed quotes.
            </p>
          </div>
        </section>

        <section className="border-t border-border bg-muted/30 py-24 sm:py-32" data-testid="section-testimonials">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <h2 className="font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
                What Buyers Are Saying
              </h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-3">
              {[
                {
                  quote: "Saved me $2,400 in hidden dealer add-ons. The suggested reply got them to remove the nitrogen tire fee and fabric protection.",
                  name: "Sarah M.",
                  location: "Texas",
                },
                {
                  quote: "I was about to sign a deal with a $895 doc fee in California where the cap is $85. Odigos caught it instantly.",
                  name: "James K.",
                  location: "California",
                },
                {
                  quote: "The free preview alone told me my deal was solid. Paid $49 for the full report just for peace of mind before a $42k purchase.",
                  name: "Michelle R.",
                  location: "Florida",
                },
              ].map((testimonial) => (
                <Card key={testimonial.name}>
                  <CardContent className="pt-6">
                    <Quote className="h-5 w-5 text-muted-foreground/40 mb-3" />
                    <p className="text-sm text-foreground/80 leading-relaxed mb-4">
                      {testimonial.quote}
                    </p>
                    <p className="text-sm font-medium text-muted-foreground">
                      — {testimonial.name}, {testimonial.location}
                    </p>
                  </CardContent>
                </Card>
              ))}
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
              Common questions
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
              Don't walk into a $30–$60k decision blind.
            </h2>
            <Button variant="cta" asChild size="lg" className="text-base rounded-lg" data-testid="button-cta-final">
              <Link href="/analyze">Check This Deal</Link>
            </Button>
          </div>
        </section>

        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl md:text-2xl font-bold mb-8 text-center" data-testid="text-why-heading">
              Why Use Odigos?
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div data-testid="card-why-clarity">
                <h3 className="font-semibold mb-2 text-foreground">Clarity Before You Visit</h3>
                <p className="text-sm text-muted-foreground">Dealership pricing conversations often leave out important details. Odigos helps identify what's missing before you step into the showroom.</p>
              </div>
              <div data-testid="card-why-tactics">
                <h3 className="font-semibold mb-2 text-foreground">Built Around Real Dealer Tactics</h3>
                <p className="text-sm text-muted-foreground">The checks Odigos performs are based on common dealership pricing practices buyers frequently encounter.</p>
              </div>
              <div data-testid="card-why-free">
                <h3 className="font-semibold mb-2 text-foreground">Free and Instant</h3>
                <p className="text-sm text-muted-foreground">You can paste a dealer message and get a full analysis without creating an account.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 px-6">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-base font-semibold mb-2 text-foreground" data-testid="text-scope-heading">What Odigos does NOT do</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Odigos analyzes pricing transparency and financing terms. It does not evaluate vehicle condition, mechanical reliability, or accident history.
            </p>
          </div>
        </section>

        <section className="py-12 px-6 bg-muted/30">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-base font-semibold mb-4 text-foreground" data-testid="text-tactics-heading">Common Dealer Pricing Tactics Buyers Ask About</h3>
            <ul className="space-y-2">
              <li><Link href="/dealer-wont-give-otd-price" className="text-sm underline text-foreground" data-testid="link-tactic-otd">Dealer Won't Give Out-the-Door Price</Link></li>
              <li><Link href="/are-dealer-add-ons-mandatory" className="text-sm underline text-foreground" data-testid="link-tactic-addons">Are Dealer Add-Ons Mandatory?</Link></li>
              <li><Link href="/dealer-doc-fee" className="text-sm underline text-foreground" data-testid="link-tactic-docfee">Dealer Documentation Fee Explained</Link></li>
              <li><Link href="/market-adjustment-fee" className="text-sm underline text-foreground" data-testid="link-tactic-market">Dealer Market Adjustment Fees</Link></li>
              <li><Link href="/dealer-added-fees-after-agreement" className="text-sm underline text-foreground" data-testid="link-tactic-added-fees">Dealer Added Fees After Agreement</Link></li>
              <li><Link href="/car-dealer-fees-by-state" className="text-sm underline text-foreground" data-testid="link-tactic-fees-by-state">Car Dealer Fees by State</Link></li>
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
                Independent dealer quote review
              </p>
            </div>

            <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <button onClick={() => scrollToHash("features")} className="transition-colors hover:text-foreground" data-testid="link-footer-features">
                What We Review
              </button>
              <button onClick={() => scrollToHash("pricing")} className="transition-colors hover:text-foreground" data-testid="link-footer-pricing">
                Pricing
              </button>
              <button onClick={() => scrollToHash("faq")} className="transition-colors hover:text-foreground" data-testid="link-footer-questions">
                Questions
              </button>
              <Link href="/privacy" className="transition-colors hover:text-foreground" data-testid="link-footer-privacy">
                Privacy
              </Link>
              <Link href="/terms" className="transition-colors hover:text-foreground" data-testid="link-footer-terms">
                Terms
              </Link>
              <Link href="/car-dealer-fees-by-state" className="transition-colors hover:text-foreground" data-testid="link-footer-fees-by-state">
                Dealer Fees by State
              </Link>
            </nav>
          </div>

          <div className="mt-8 pt-6 border-t border-border text-center text-xs text-muted-foreground leading-relaxed">
            <p>
              Odigos reviews pricing transparency and disclosure practices in dealer quotes. It does not provide legal, financial, or mechanical advice. Consult appropriate professionals for those assessments.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
