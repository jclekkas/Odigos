import { useEffect } from "react";
import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AlertTriangle, ArrowRight, Check, CheckCircle2, Lock, Quote } from "lucide-react";
import { trackPageView, trackCtaClick } from "@/lib/tracking";
import { capture } from "@/lib/analytics";
import SiteHeader from "@/components/SiteHeader";
import { setSeoMeta } from "@/lib/seo";
import { productSchema } from "@/lib/jsonld";
import { Skeleton } from "@/components/ui/skeleton";

const faqsSchema = [
  {
    q: "How does the analysis work?",
    a: "Paste your dealer quote, email, or text message. Our AI evaluates it against state-specific fee regulations, junk fee detection rules, market pricing data, and patterns from thousands of analyzed quotes. You get a GREEN/YELLOW/RED verdict with specific issues identified.",
  },
  {
    q: "What's free vs. paid?",
    a: "The free preview gives you the GO/NO-GO verdict, deal score, and top issues found. The $49 full review adds: every missing detail to request, a ready-to-send reply to the dealer, and the complete analysis reasoning. One-time payment, no subscription.",
  },
  {
    q: "Is my data safe?",
    a: "Yes. Submitted text is PII-redacted and deleted within 90 days. We don't sell or share your data. We're not affiliated with any dealership.",
  },
  {
    q: "How long does it take?",
    a: "About 60 seconds. No account or signup required.",
  },
];

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
      title: "Odigos — Dealer Quote Analyzer | Detect Junk Fees & Hidden Charges",
      description: "Paste your dealer quote. Odigos detects junk fees, hidden charges, and missing details in 60 seconds. Get a GO/NO-GO verdict and a ready-to-send dealer reply. Free preview, full analysis $49.",
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

        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <section className="pt-12 pb-14 sm:pt-16 sm:pb-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="flex flex-col gap-12 lg:flex-row lg:items-center lg:gap-16">

              <div className="flex-1 text-center lg:text-left">
                <h1
                  className="text-balance text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-[3.25rem] text-foreground leading-[1.15]"
                  data-testid="text-hero-headline"
                >
                  Is your dealer quote fair?
                </h1>

                <p
                  className="mt-5 text-lg text-foreground/75 leading-relaxed max-w-lg mx-auto lg:mx-0"
                  data-testid="text-hero-subheadline"
                >
                  Paste it below. In 60 seconds we'll flag junk fees, missing details, and pricing tricks — then give you the exact words to say back.
                </p>

                <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
                  <Button
                    variant="cta"
                    size="lg"
                    className="gap-2 font-semibold shadow text-base px-8"
                    asChild
                    data-testid="button-cta-hero"
                  >
                    <Link
                      href="/analyze"
                      onClick={() => {
                        trackCtaClick("hero-analyze", "Check Your Deal");
                        capture("landing_cta_clicked", { location: "hero" });
                      }}
                    >
                      Check Your Deal
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Free instant preview &middot; No signup
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-center lg:justify-start gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Lock className="h-3 w-3" /> Your data stays private</span>
                  <span className="flex items-center gap-1"><Check className="h-3 w-3" /> No signup required</span>
                  <span className="flex items-center gap-1"><Check className="h-3 w-3" /> Not affiliated with any dealer</span>
                </div>

                {!statsError && (
                  <div className="mt-6 flex justify-center lg:justify-start" data-testid="container-deals-counter">
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
              </div>

              {/* Example result card */}
              <div className="lg:w-[340px] lg:shrink-0" data-testid="card-preview-result">
                <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 shadow-lg p-5 space-y-4">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-600/70 dark:text-amber-400/60">
                    Sample result
                  </p>

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
                      3 red flags found &mdash; don't sign yet
                    </p>
                  </div>

                  <div className="border-t border-amber-500/15 pt-3 space-y-2">
                    {[
                      { field: "No OTD price", note: "Only monthly payment quoted" },
                      { field: "Hidden fee", note: "$895 doc fee exceeds CA cap" },
                      { field: "Add-on", note: "$1,995 protection not itemized" },
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

                  <div className="border-t border-amber-500/15 pt-3">
                    <div className="rounded-lg border border-border/50 bg-background/60 p-3 space-y-1.5 relative overflow-hidden">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Lock className="w-3 h-3 text-muted-foreground/60" />
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                          Full review &mdash; $49
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

        {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
        <section className="py-12 border-t border-border bg-muted/30">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <h2 className="text-xl font-bold text-center mb-10" data-testid="text-how-it-works-heading">
              Three steps. Under a minute.
            </h2>
            <div className="grid gap-8 sm:grid-cols-3">
              {[
                { step: "1", title: "Paste", desc: "Copy the dealer's email, text, or quote" },
                { step: "2", title: "Review", desc: "See what's missing, hidden, or overpriced" },
                { step: "3", title: "Respond", desc: "Send the dealer a ready-made reply" },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-primary text-primary-foreground font-bold text-lg mb-3">
                    {item.step}
                  </span>
                  <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SOCIAL PROOF ─────────────────────────────────────────────────── */}
        <section className="py-14 sm:py-16" data-testid="section-testimonials">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl text-center mb-12">
              Buyers who checked first
            </h2>
            <div className="grid gap-6 sm:grid-cols-3">
              {[
                {
                  quote: "Saved me $2,400 in hidden dealer add-ons. The suggested reply got them to remove the nitrogen tire fee and fabric protection.",
                  name: "Sarah M.",
                  location: "Texas",
                  saved: "$2,400",
                },
                {
                  quote: "I was about to sign a deal with a $895 doc fee in California where the cap is $85. Odigos caught it instantly.",
                  name: "James K.",
                  location: "California",
                  saved: "$810",
                },
                {
                  quote: "The free preview alone told me my deal was solid. Paid $49 for the full report just for peace of mind before a $42k purchase.",
                  name: "Michelle R.",
                  location: "Florida",
                  saved: "Peace of mind",
                },
              ].map((t) => (
                <Card key={t.name} className="relative">
                  <CardContent className="pt-6">
                    <Quote className="h-5 w-5 text-muted-foreground/30 mb-3" />
                    <p className="text-sm text-foreground/80 leading-relaxed mb-4">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-muted-foreground">
                        {t.name}, {t.location}
                      </p>
                      <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                        {t.saved}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRICING ──────────────────────────────────────────────────────── */}
        <section id="pricing" className="py-14 sm:py-16 border-t border-border bg-muted/30">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Simple, one-time pricing
              </h2>
              <p className="mt-3 text-sm text-muted-foreground">
                No subscription. No upsells. Pay once per deal.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 max-w-2xl mx-auto">
              <div className="rounded-lg border border-border bg-card p-6" data-testid="card-pricing-tier1">
                <h3 className="font-medium mb-1">Free Preview</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-2xl font-semibold">$0</span>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                  {["GO / NO-GO verdict", "Deal score & confidence", "Top issues identified"].map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button asChild variant="outline" className="w-full" data-testid="button-cta-free-preview">
                  <Link href="/analyze">Try Free</Link>
                </Button>
              </div>
              <div className="rounded-lg border-2 border-primary bg-primary/5 p-6 relative" data-testid="card-pricing-tier2">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-0.5 rounded-full">
                  Most popular
                </span>
                <h3 className="font-medium mb-1">Full Deal Review</h3>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-2xl font-semibold">$49</span>
                  <span className="text-xs text-muted-foreground">(one-time)</span>
                </div>
                <p className="text-xs text-muted-foreground mb-4">Less than most dealer doc fees</p>
                <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                  {[
                    "Everything in Free",
                    "Every red flag & hidden fee",
                    "Missing info checklist",
                    "Copy-paste dealer reply",
                    "Full analysis reasoning",
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button variant="cta" asChild className="w-full" data-testid="button-cta-full-review">
                  <Link
                    href="/analyze"
                    onClick={() => {
                      trackCtaClick("pricing-full-review", "Get Full Review");
                      capture("landing_cta_clicked", { location: "pricing" });
                    }}
                  >
                    Get Full Review &mdash; $49
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────────────── */}
        <section id="faq" className="py-14 sm:py-16 border-t border-border">
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
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl mb-10" data-testid="text-faq-heading">
              Questions
            </h2>
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
          </div>
        </section>

        {/* ── FINAL CTA ───────────────────────────────────────────────────── */}
        <section className="py-14 border-t border-border bg-muted/30">
          <div className="max-w-2xl mx-auto text-center px-4">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
              Don't sign until you check.
            </h2>
            <p className="text-muted-foreground mb-8">Free. 60 seconds. No signup.</p>
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
                  trackCtaClick("final-cta", "Check Your Deal");
                  capture("landing_cta_clicked", { location: "final" });
                }}
              >
                Check Your Deal
              </Link>
            </Button>
          </div>
        </section>
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
