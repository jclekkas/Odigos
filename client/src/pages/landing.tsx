import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowRight, Check, CheckCircle2, Lock, AlertTriangle, DollarSign, Scale, RefreshCw, Database, BookOpen } from "lucide-react";
import { trackPageView, trackCtaClick } from "@/lib/tracking";
import { capture } from "@/lib/analytics";
import SiteHeader from "@/components/SiteHeader";
import FadeIn from "@/components/FadeIn";
import { setSeoMeta } from "@/lib/seo";
import { productSchema } from "@/lib/jsonld";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

/* ── Constants ─────────────────────────────────────────────────────────────── */

const PLACEHOLDER_EXAMPLES = [
  "$499 doc fee, $1,495 protection package\u2026",
  "OTD $32,800 \u2014 breakdown attached",
  "$399/mo with $3k down\u2026",
  "Paint protection and nitrogen included \u2014 $1,995",
  "Doc fee is $895. That\u2019s standard for every deal we do.",
];

const HOW_IT_WORKS_STEPS = [
  { step: "1", title: "Paste", desc: "your dealer's message" },
  { step: "2", title: "Review", desc: "math, fees, and gaps" },
  { step: "3", title: "Respond", desc: "with a ready-made reply" },
];

const faqsSchema = [
  {
    q: "How does the analysis work?",
    a: "Paste your dealer quote, email, or text message. Odigos checks whether the charges are itemized, whether the totals reconcile, and whether a fee exceeds a verified state cap. Factory MSRP comparison and independent market valuation are different. An optional factory window sticker MSRP compares the selling price with that sticker and does not verify market value. That figure is not a live market transaction price. Independent market valuation stays unverified unless a separate third-party source is configured. The verdict is GO, PROCEED WITH CAUTION, INSUFFICIENT INFORMATION, or NO-GO.",
  },
  {
    q: "Is Odigos free?",
    a: "Yes. The full analysis is free: your verdict, deal score, every detected red flag, missing-info checklist, copy-paste dealer reply, and analysis reasoning. No pass, payment, or subscription is required.",
  },
  {
    q: "Can I compare multiple dealer quotes?",
    a: "Yes. Run each quote through Odigos to compare the fees, terms, and questions to ask. No paid pass is needed. Standard usage limits help keep the service available to everyone.",
  },
  {
    q: "Is my data safe?",
    a: "Yes. Submitted text is PII-redacted and deleted within 90 days. We don\u2019t sell or share your data. We\u2019re not affiliated with any dealership.",
  },
  {
    q: "How long does it take?",
    a: "About 60 seconds. No account or signup required.",
  },
];

/* ── Hero Section ──────────────────────────────────────────────────────────── */

function HeroSection({
  statsData,
  statsLoading,
  statsError,
}: {
  statsData: { count: number; type: string } | undefined;
  statsLoading: boolean;
  statsError: boolean;
}) {
  const [, navigate] = useLocation();
  const [heroText, setHeroText] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [placeholderFading, setPlaceholderFading] = useState(false);
  const [userEngaged, setUserEngaged] = useState(false);
  const focusTrackedRef = useRef(false);

  // Cycle placeholder every 4 seconds until user engages
  useEffect(() => {
    if (userEngaged) return;
    const id = setInterval(() => {
      setPlaceholderFading(true);
      setTimeout(() => {
        setPlaceholderIndex((i) => (i + 1) % PLACEHOLDER_EXAMPLES.length);
        setPlaceholderFading(false);
      }, 150);
    }, 4000);
    return () => clearInterval(id);
  }, [userEngaged]);

  const handleFocus = useCallback(() => {
    if (!focusTrackedRef.current) {
      focusTrackedRef.current = true;
      capture("hero_textarea_focused");
      capture("hero_placeholder_visible", { index: placeholderIndex });
    }
    setUserEngaged(true);
  }, [placeholderIndex]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setHeroText(e.target.value);
    if (!userEngaged) setUserEngaged(true);
  }, [userEngaged]);

  const handleAnalyze = useCallback(() => {
    trackCtaClick("hero-analyze", "Check This Quote");
    capture("hero_textarea_submitted", { text_length: heroText.length });
    if (heroText.trim()) {
      sessionStorage.setItem("odigos_hero_text", heroText);
    }
    navigate("/analyze");
  }, [heroText, navigate]);

  return (
    <section className="relative pt-16 pb-12 sm:pt-20 sm:pb-16">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] to-transparent pointer-events-none" />
      <div className="relative mx-auto max-w-2xl px-4 sm:px-6 text-center">
        <h1
          className="text-balance text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-foreground leading-[1.1]"
          data-testid="text-hero-headline"
        >
          Is your dealer quote hiding extra fees?
        </h1>

        <p
          className="mt-5 text-lg sm:text-xl text-foreground/75 leading-relaxed"
          data-testid="text-hero-subheadline"
        >
          Paste your quote. We'll check the math, the disclosed fees, and any verified state cap, then tell you what is still unverified.
        </p>

        {/* Textarea card */}
        <div className="mt-8 rounded-xl border border-border bg-card shadow-lg sm:shadow-xl p-4 text-left">
          <Textarea
            value={heroText}
            onChange={handleChange}
            onFocus={handleFocus}
            placeholder={PLACEHOLDER_EXAMPLES[placeholderIndex]}
            className="min-h-40 text-base resize-none border-0 shadow-none focus-visible:ring-0 bg-transparent"
            style={{
              transition: "opacity 150ms ease",
              opacity: !userEngaged && placeholderFading ? 0.3 : 1,
            }}
            data-testid="input-hero-textarea"
          />
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-3 pt-3 border-t border-border/50">
            <span className="text-xs text-muted-foreground">
              Free instant analysis &middot; No signup
            </span>
            <Button
              variant="cta"
              size="lg"
              className="gap-2 font-semibold shadow text-base w-full sm:w-auto"
              onClick={handleAnalyze}
              data-testid="button-cta-hero"
            >
              Check This Quote
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Trust signals */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Lock className="h-3 w-3" /> Your data stays private</span>
          <span className="flex items-center gap-1"><Check className="h-3 w-3" /> No signup required</span>
          <span className="flex items-center gap-1"><Check className="h-3 w-3" /> Not affiliated with any dealer</span>
        </div>

        {/* Deals counter */}
        {!statsError && (
          <div className="mt-6 flex justify-center" data-testid="container-deals-counter">
            {statsLoading ? (
              <Skeleton className="h-5 w-40 rounded-full" data-testid="skeleton-deals-counter" />
            ) : statsData && statsData.count >= 100 && statsData.type !== "none" ? (
              <span
                className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/50 px-3 py-1 text-xs text-muted-foreground"
                data-testid="text-deals-counter"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                {statsData.count.toLocaleString()} deals analyzed
              </span>
            ) : null}
          </div>
        )}

        {/* How it works strip */}
        <div className="mt-10 flex items-center justify-center gap-2 sm:gap-3" data-testid="container-how-it-works">
          {HOW_IT_WORKS_STEPS.map((item, idx) => (
            <div key={item.step} className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-primary text-primary-foreground font-bold text-xs shrink-0">
                  {item.step}
                </span>
                <div className="text-left">
                  <p className="text-xs font-semibold text-foreground leading-none">{item.title}</p>
                  <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">{item.desc}</p>
                </div>
              </div>
              {idx < HOW_IT_WORKS_STEPS.length - 1 && (
                <div className="h-px w-4 sm:w-6 bg-border shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Example Output Section ────────────────────────────────────────────────── */

function ExampleOutputSection() {
  return (
    <section className="py-16 sm:py-20 border-t border-border">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <FadeIn>
          <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl mb-3" data-testid="text-example-output-heading">
            What you'll see
          </h2>
          <p className="text-center text-sm text-muted-foreground mb-10">
            Real results from real quotes — not feature descriptions.
          </p>
        </FadeIn>
        <div className="grid gap-4 sm:grid-cols-3">
          <FadeIn delay={0}>
            <div className="rounded-xl border-2 border-red-500/30 bg-red-500/5 p-5 space-y-2 h-full" data-testid="card-example-overpayment">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-red-600 dark:text-red-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-red-700 dark:text-red-400">Price not verified</span>
              </div>
              <p className="text-lg font-bold text-red-700 dark:text-red-300 leading-snug">
                Market value not verified — no savings range
              </p>
            </div>
          </FadeIn>
          <FadeIn delay={0.08}>
            <div className="rounded-xl border-2 border-amber-500/30 bg-amber-500/5 p-5 space-y-2 h-full" data-testid="card-example-cap">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">State cap exceeded</span>
              </div>
              <p className="text-lg font-bold text-amber-700 dark:text-amber-300 leading-snug">
                $499 is above both California ceilings: $85 for a DMV partner, $70 otherwise
              </p>
            </div>
          </FadeIn>
          <FadeIn delay={0.16}>
            <div className="rounded-xl border-2 border-emerald-500/30 bg-emerald-500/5 p-5 space-y-2 h-full" data-testid="card-example-removable">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Negotiable</span>
              </div>
              <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300 leading-snug">
                Protection package ($1,495) &mdash; typically removable
              </p>
            </div>
          </FadeIn>
        </div>
        <FadeIn>
          <p className="text-center mt-6">
            <Link href="/example-analysis" className="text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors" data-testid="link-example-analysis-landing">
              See a full example analysis &rarr;
            </Link>
          </p>
        </FadeIn>
      </div>
    </section>
  );
}

/* ── How We Know Section ───────────────────────────────────────────────────── */

function HowWeKnowSection() {
  return (
    <section className="py-16 sm:py-20 border-t border-border bg-muted/30">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <FadeIn>
          <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl mb-10" data-testid="text-how-we-know-heading">
            How we know
          </h2>
        </FadeIn>
        <div className="grid gap-6 sm:grid-cols-3 text-center">
          <FadeIn delay={0}>
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center justify-center h-14 w-14 rounded-full bg-primary/10">
                <Database className="w-5 h-5 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground">The audit uses the numbers in the quote you submit</p>
            </div>
          </FadeIn>
          <FadeIn delay={0.08}>
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center justify-center h-14 w-14 rounded-full bg-primary/10">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground">Fee caps are applied only when a citation is on file</p>
            </div>
          </FadeIn>
          <FadeIn delay={0.16}>
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center justify-center h-14 w-14 rounded-full bg-primary/10">
                <RefreshCw className="w-5 h-5 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground">Vehicle price is not estimated without an independent source</p>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

/* ── Pricing Section ───────────────────────────────────────────────────────── */

function PricingSection() {
  return (
    <section id="pricing" className="py-16 sm:py-20 border-t border-border bg-muted/30">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 text-center">
        <FadeIn>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">The full review. Free.</h2>
          <p className="mt-3 text-muted-foreground">Compare dealer quotes with every analysis feature included. No pass or payment required.</p>
          <div className="mt-8 rounded-lg border border-border bg-card p-6" data-testid="card-pricing-free">
            <h3 className="font-medium">Full Dealer Quote Analysis</h3>
            <p className="my-4 text-3xl font-semibold">$0</p>
            <ul className="space-y-2 text-sm text-muted-foreground text-left mb-6">
              {["GO, caution, insufficient information, or NO-GO", "Math worksheet and verified fee-cap checks", "Missing-info checklist", "Dealer reply limited to those findings", "Market value left unverified until a price source is configured"].map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Button variant="cta" asChild className="w-full">
              <Link href="/analyze">Analyze My Quote — Free</Link>
            </Button>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ── FAQ Section ───────────────────────────────────────────────────────────── */

function FaqSection() {
  return (
    <section id="faq" className="py-16 sm:py-20 border-t border-border">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": faqsSchema.map((faq) => ({
            "@type": "Question",
            "name": faq.q,
            "acceptedAnswer": { "@type": "Answer", "text": faq.a },
          })),
        })}</script>
      </Helmet>
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <FadeIn>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl mb-10" data-testid="text-faq-heading">
            Questions
          </h2>
        </FadeIn>
        <FadeIn delay={0.08}>
          <Accordion type="single" collapsible className="w-full">
            {faqsSchema.map((faq, idx) => (
              <AccordionItem key={idx} value={`item-${idx}`}>
                <AccordionTrigger className="text-left text-sm font-medium" data-testid={`button-faq-${idx}`}>
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </FadeIn>
      </div>
    </section>
  );
}

/* ── Final CTA Section ─────────────────────────────────────────────────────── */

function FinalCtaSection() {
  return (
    <section className="py-16 sm:py-20 border-t border-border bg-gradient-to-b from-muted/50 to-muted/20">
      <div className="max-w-2xl mx-auto text-center px-4">
        <FadeIn>
          <h2 className="text-3xl sm:text-4xl font-bold mb-3 tracking-tight">
            Don't sign until you check this quote.
          </h2>
          <p className="text-muted-foreground text-lg mb-8">Free. 60 seconds. No signup.</p>
          <Button
            variant="cta"
            asChild
            size="lg"
            className="text-base px-10"
            data-testid="button-cta-final"
          >
            <Link
              href="/analyze"
              onClick={() => {
                trackCtaClick("final-cta", "Check This Quote");
                capture("landing_cta_clicked", { location: "final" });
              }}
            >
              Check This Quote
            </Link>
          </Button>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Lock className="h-3 w-3" /> Your data stays private</span>
            <span className="flex items-center gap-1"><Check className="h-3 w-3" /> No signup required</span>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ── Main Landing Component ────────────────────────────────────────────────── */

export default function Landing() {
  const { data: statsData, isLoading: statsLoading, isError: statsError } = useQuery<{ count: number; type: string }>({
    queryKey: ["/api/stats/count"],
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    trackPageView("/");
  }, []);

  useEffect(() => {
    setSeoMeta({
      title: "Odigos \u2014 Dealer Quote Analyzer | Find What\u2019s Wrong With Your Quote",
      description: "Paste your dealer quote. Odigos audits disclosure, math, and verified fee caps. A factory window sticker MSRP does not verify market value. Independent market valuation stays unverified. Full analysis is free.",
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
    function tryScroll() {
      const el = document.getElementById(hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      } else if (attempts < 20) {
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
        <HeroSection statsData={statsData} statsLoading={statsLoading} statsError={statsError} />
        <ExampleOutputSection />
        <HowWeKnowSection />
        <PricingSection />
        <FaqSection />
        <FinalCtaSection />
      </main>

      {/* ── FOOTER ─────────────────────────────────────────────────────── */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div>
              <span className="font-serif font-semibold">Odigos</span>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Independent. Not affiliated with any dealership.
              </p>
            </div>
            <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
              <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
              <Link href="/car-dealer-fees-by-state" className="hover:text-foreground transition-colors">Fees by State</Link>
              <Link href="/privacy" className="hover:text-foreground transition-colors" data-testid="link-footer-privacy">Privacy</Link>
              <Link href="/terms" className="hover:text-foreground transition-colors" data-testid="link-footer-terms">Terms</Link>
            </nav>
          </div>
          <p className="mt-6 text-center text-[11px] text-muted-foreground/70">
            Odigos reviews pricing transparency in dealer quotes. It does not provide legal, financial, or mechanical advice.
          </p>
        </div>
      </footer>
    </div>
  );
}
