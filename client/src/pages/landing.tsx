import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  Check,
  CheckCircle,
  CheckCircle2,
  ChevronDown,
  ArrowRight,
  FileSearch,
  Shield,
  MessageSquareText,
} from "lucide-react";
import { trackPageView, trackCtaClick } from "@/lib/tracking";
import SiteHeader from "@/components/SiteHeader";
import SeoHead from "@/components/SeoHead";

const faqs = [
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

function TrustBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
      <CheckCircle className="w-3.5 h-3.5 text-primary/70" />
      {children}
    </span>
  );
}

export default function Landing() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    trackPageView("/");
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
      <SeoHead
        title="Odigos — Independent Dealer Quote Analysis for Car Buyers"
        description="Paste a dealer quote, text, or email. Odigos checks for missing out-the-door pricing, hidden fees, and common dealership tactics. Free preview, full analysis $49."
        path="/"
      />
      <main id="main-content">
        {/* Hero Section */}
        <section className="pt-32 pb-20 md:pt-40 md:pb-28 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-sm font-medium text-primary mb-4 tracking-wide uppercase" data-testid="text-authority-framing">
              Independent Deal Analysis
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-semibold tracking-tight leading-[1.1] text-foreground max-w-4xl mx-auto" data-testid="text-hero-headline">
              Understand your car deal before you sign
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed" data-testid="text-hero-subheadline">
              Paste a dealer quote, text, or email. We'll show you what's included, what's missing, and exactly what to ask before you visit.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto px-8 h-12 text-base font-medium rounded-full"
                data-testid="button-cta-hero"
              >
                <Link href="/analyze" onClick={() => trackCtaClick("hero-analyze", "Analyze a Dealer Quote")}>
                  Analyze a Dealer Quote
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full sm:w-auto text-sm rounded-full"
                data-testid="button-try-bad"
              >
                <Link href="/analyze?example=bad" onClick={() => trackCtaClick("hero-bad-example", "Try a bad deal example")}>
                  Try a bad deal example
                </Link>
              </Button>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              <TrustBadge>No account required</TrustBadge>
              <TrustBadge>Independent analysis</TrustBadge>
              <TrustBadge>Secure Stripe checkout</TrustBadge>
            </div>
            <p className="mt-3 text-sm text-muted-foreground" data-testid="text-reassurance">
              Takes 10 seconds. No signup required.
            </p>
          </div>
        </section>

        {/* Problem Statement */}
        <section className="py-16 md:py-24 px-6 bg-card/50">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-4">
              Dealer quotes rarely tell the full story
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl mx-auto">
              Monthly payments without APR. Sale prices without fees. Add-ons you didn't ask for.
              Small omissions can cost thousands — and you won't know until you're at the dealership.
            </p>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-16 md:py-24 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-3" data-testid="text-how-it-works-heading">
                How it works
              </h2>
              <p className="text-muted-foreground">
                Get clarity in under a minute
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 md:gap-6">
              {[
                {
                  icon: FileSearch,
                  title: "Paste your quote",
                  description: "Copy the dealer's text, email, or written quote exactly as you received it.",
                },
                {
                  icon: Shield,
                  title: "Get your analysis",
                  description: "We identify what's clearly stated, what's missing, and potential concerns.",
                },
                {
                  icon: MessageSquareText,
                  title: "Know what to ask",
                  description: "Get specific questions to send the dealer before your visit.",
                },
              ].map((step, idx) => (
                <div key={idx} className="relative">
                  <div className="flex flex-col items-center text-center md:items-start md:text-left">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <step.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium text-primary/60">0{idx + 1}</span>
                      <h3 className="font-semibold text-foreground">{step.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What We Analyze */}
        <section className="py-16 md:py-24 px-6 bg-card/50">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-3" data-testid="text-checks-heading">
                What we analyze
              </h2>
              <p className="text-muted-foreground">
                The details that matter most in any dealer quote
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl bg-background border border-border/50" data-testid="card-check-otd">
                <h3 className="font-medium text-foreground mb-1.5">Out-the-door pricing</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">Is the total cost clearly stated? Are taxes, fees, and registration included?</p>
              </div>
              <div className="p-5 rounded-xl bg-background border border-border/50" data-testid="card-check-financing">
                <h3 className="font-medium text-foreground mb-1.5">Financing terms</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">APR, loan term, down payment — the numbers that determine your real cost.</p>
              </div>
              <div className="p-5 rounded-xl bg-background border border-border/50" data-testid="card-check-fees">
                <h3 className="font-medium text-foreground mb-1.5">Dealer fees</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">Documentation fees, dealer prep, and other charges that vary widely.</p>
              </div>
              <div className="p-5 rounded-xl bg-background border border-border/50" data-testid="card-check-addons">
                <h3 className="font-medium text-foreground mb-1.5">Add-ons and packages</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">Protection plans, appearance packages, and accessories you may not need.</p>
              </div>
              <div className="p-5 rounded-xl bg-background border border-border/50" data-testid="card-check-language">
                <h3 className="font-medium text-foreground mb-1.5">Pricing language</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">Vague terms, conditional offers, and language that leaves room for changes.</p>
              </div>
              <div className="p-5 rounded-xl bg-background border border-border/50" data-testid="card-check-missing">
                <h3 className="font-medium text-foreground mb-1.5">Missing information</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">Critical details that should be in writing before you visit.</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-6" data-testid="text-privacy-note">
              Pricing signals are stored anonymously to improve dealer fee benchmarks. Submitted text is PII-redacted and deleted after 90 days.{" "}
              <a href="/privacy" className="underline hover:text-foreground transition-colors">Privacy Policy</a>
            </p>
          </div>
        </section>

        {/* OTD Explainer */}
        <section className="py-16 md:py-24 px-6">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-center" data-testid="text-otd-explainer-heading">
              What is an out-the-door price?
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              The out-the-door price (OTD) is the total amount you'll pay to leave the dealership with the keys — including sale price, tax, title, registration, doc fees, and any add-ons. It's the only number that tells you what the car actually costs. Dealers often focus on the monthly payment instead, which can hide longer loan terms, higher rates, and fees you never agreed to. Odigos analyzes the quote you already have and tells you what's missing.
            </p>
          </div>
        </section>

        {/* In Minutes Checklist */}
        <section className="py-16 md:py-24 px-6 bg-card/50">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-semibold mb-8 text-center">
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
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-base text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Why It Matters */}
        <section className="py-16 md:py-24 px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-semibold mb-4">
              Why it matters
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              Dealers often quote monthly payments, add packages later, or ask you to "come in to talk numbers." Odigos turns the messages you already have into a clear next step.
            </p>
          </div>
        </section>

        {/* Real Example */}
        <section className="py-16 md:py-24 px-6 bg-card/50">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-semibold mb-8 text-center">
              Real example (anonymized)
            </h2>
            <div className="rounded-2xl border border-border/50 bg-background p-6">
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
            </div>
          </div>
        </section>

        {/* Sample Output */}
        <section className="py-16 md:py-24 px-6" data-testid="section-sample-output">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-semibold mb-2 text-center">
              What the analysis looks like
            </h2>
            <p className="text-sm text-muted-foreground text-center mb-8">
              Sample output from a real car dealer quote (anonymized)
            </p>
            <div className="rounded-2xl border border-border/50 bg-background p-5 md:p-6 space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold tracking-wide border border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  NO-GO
                </span>
                <span className="text-xs text-muted-foreground border border-border/60 px-2 py-0.5 rounded bg-muted/40">
                  Medium confidence
                </span>
              </div>
              <p className="text-sm font-medium text-foreground">
                This quote is missing critical pricing details. Do not proceed without a complete out-the-door breakdown.
              </p>
              <div className="space-y-2 pt-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Detected issues</p>
                <ul className="space-y-1.5">
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">No out-the-door price — only monthly payment quoted</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">APR not disclosed — rate described as "competitive"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">"Protection packages" added without itemized cost</span>
                  </li>
                </ul>
              </div>
              <p className="text-xs text-muted-foreground italic pt-1 border-t border-border/40">
                Full analysis includes missing info checklist, negotiation reply, and detailed reasoning.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-16 md:py-24 px-6 bg-card/50">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-3">
                Simple, one-time pricing
              </h2>
              <p className="text-muted-foreground">
                No subscriptions. No upsells. Pay once per analysis.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <div className="p-6 rounded-2xl border border-border/50 bg-background" data-testid="card-pricing-tier1">
                <div className="mb-4">
                  <h3 className="font-semibold text-foreground mb-1">Quick Check</h3>
                  <p className="text-3xl font-semibold text-foreground">Free</p>
                </div>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>Verdict (Green / Yellow / Red)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>Confidence assessment</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>Key pricing details detected</span>
                  </li>
                </ul>
                <Button
                  asChild
                  variant="outline"
                  className="w-full mt-6 rounded-xl"
                  data-testid="button-cta-free-preview"
                >
                  <Link href="/analyze">Try Quick Check</Link>
                </Button>
              </div>
              <div className="p-6 rounded-2xl border-2 border-primary/30 bg-primary/5" data-testid="card-pricing-tier2">
                <div className="mb-4">
                  <h3 className="font-semibold text-foreground mb-1">Full Analysis</h3>
                  <p className="text-3xl font-semibold text-foreground">$49</p>
                </div>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>Everything in Quick Check</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>Complete red flag breakdown</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>Missing information checklist</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>Copy-paste dealer response</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>Full analysis reasoning</span>
                  </li>
                </ul>
                <Button
                  asChild
                  className="w-full mt-6 rounded-xl"
                  data-testid="button-cta-full-review"
                >
                  <Link href="/analyze">Get Full Analysis — $49</Link>
                </Button>
              </div>
              {/* $79 Negotiation Pack - Hidden for single-tier pricing
              <Card className="border-primary/50 bg-primary/5" data-testid="card-pricing-tier3">
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">Negotiation Pack</h3>
                  <p className="text-2xl font-bold mb-3">$79 <span className="text-xs font-normal text-muted-foreground">(one-time)</span></p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Everything in Deal Clarity</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Copy-paste dealer reply</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Full negotiation reasoning</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Strategic next questions</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              */}
            </div>
            <p className="text-center text-sm text-muted-foreground mt-6">
              No subscription. No upsells. One-time purchase per analysis.
            </p>
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-16 md:py-24 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-4" data-testid="text-built-for-heading">
              Built for car buyers, not dealerships
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl mx-auto mb-8">
              We don't sell cars. We don't work with dealerships. We don't take referral fees.
              Odigos is an independent tool that works entirely from the messages you already have. No account required. PII-redacted submitted text is deleted within 90 days. Just clarity before you sign.
            </p>
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
              <span>No dealer partnerships</span>
              <span className="hidden sm:inline">·</span>
              <span>No account required</span>
              <span className="hidden sm:inline">·</span>
              <span>No data stored</span>
              <span className="hidden sm:inline">·</span>
              <span>Secure payment via Stripe</span>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 md:py-24 px-6 bg-card/50">
          <Helmet>
            <script type="application/ld+json">{JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": faqs.map((faq) => ({
                "@type": "Question",
                "name": faq.q,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": faq.a,
                },
              })),
            })}</script>
          </Helmet>
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-8 text-center" data-testid="text-faq-heading">
              Common questions
            </h2>
            <div className="space-y-2">
              {faqs.map((faq, idx) => (
                <div key={idx} className="border border-border/50 rounded-xl overflow-hidden bg-background">
                  <button
                    type="button"
                    className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-muted/30 transition-colors"
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    aria-expanded={openFaq === idx}
                    aria-controls={`faq-panel-${idx}`}
                    data-testid={`button-faq-${idx}`}
                  >
                    <span className="text-sm font-medium text-foreground pr-4">{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 ${openFaq === idx ? "rotate-180" : ""}`} />
                  </button>
                  <div
                    id={`faq-panel-${idx}`}
                    className={`overflow-hidden transition-all duration-200 ${openFaq === idx ? "max-h-40" : "max-h-0"}`}
                  >
                    <div className="px-5 pb-4">
                      <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 md:py-24 px-6 bg-primary/5">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-4">
              Know what you're agreeing to
            </h2>
            <p className="text-muted-foreground mb-8 text-lg">
              A car is one of the biggest purchases you'll make. Get clarity before you commit.
            </p>
            <Button asChild size="lg" className="px-8 h-12 text-base font-medium rounded-full" data-testid="button-cta-final">
              <Link href="/analyze">
                Analyze Your Quote
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Why Use Odigos? */}
        <section className="py-16 md:py-24 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-semibold mb-8 text-center" data-testid="text-why-heading">
              Why Use Odigos?
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-5 rounded-xl bg-card border border-border/50" data-testid="card-why-clarity">
                <h3 className="font-semibold mb-2 text-foreground">Clarity Before You Visit</h3>
                <p className="text-sm text-muted-foreground">Dealership pricing conversations often leave out important details. Odigos helps identify what's missing before you step into the showroom.</p>
              </div>
              <div className="p-5 rounded-xl bg-card border border-border/50" data-testid="card-why-tactics">
                <h3 className="font-semibold mb-2 text-foreground">Built Around Real Dealer Tactics</h3>
                <p className="text-sm text-muted-foreground">The checks Odigos performs are based on common dealership pricing practices buyers frequently encounter.</p>
              </div>
              <div className="p-5 rounded-xl bg-card border border-border/50" data-testid="card-why-free">
                <h3 className="font-semibold mb-2 text-foreground">Free and Instant</h3>
                <p className="text-sm text-muted-foreground">You can paste a dealer message and get feedback in seconds without creating an account.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Scope Disclaimer */}
        <section className="py-12 px-6 bg-card/50">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-base font-semibold mb-2 text-foreground" data-testid="text-scope-heading">What Odigos does NOT do</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Odigos analyzes pricing transparency and financing terms. It does not evaluate vehicle condition, mechanical reliability, or accident history.
            </p>
          </div>
        </section>

        {/* Dealer Tactics Links */}
        <section className="py-12 px-6">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-base font-semibold mb-4 text-foreground" data-testid="text-tactics-heading">Common Dealer Pricing Tactics Buyers Ask About</h3>
            <ul className="space-y-2">
              <li><Link href="/dealer-wont-give-otd-price" className="text-sm underline text-foreground" data-testid="link-tactic-otd">Dealer Won't Give Out-the-Door Price</Link></li>
              <li><Link href="/are-dealer-add-ons-mandatory" className="text-sm underline text-foreground" data-testid="link-tactic-addons">Are Dealer Add-Ons Mandatory?</Link></li>
              <li><Link href="/dealer-doc-fee" className="text-sm underline text-foreground" data-testid="link-tactic-docfee">Dealer Documentation Fee Explained</Link></li>
              <li><Link href="/market-adjustment-fee" className="text-sm underline text-foreground" data-testid="link-tactic-market">Dealer Market Adjustment Fees</Link></li>
              <li><Link href="/dealer-added-fees-after-agreement" className="text-sm underline text-foreground" data-testid="link-tactic-added-fees">Dealer Added Fees After Agreement</Link></li>
            </ul>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/50 py-12 px-6">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-lg font-semibold text-foreground/70">Odigos</span>
            <Link href="/dealer-pricing-tactics" className="text-sm underline text-muted-foreground hover:text-foreground transition-colors" data-testid="link-guides">Guides</Link>
            <a href="/privacy" className="text-sm underline text-muted-foreground hover:text-foreground transition-colors">Privacy</a>
          </div>
          <div className="text-center md:text-right space-y-1">
            <p className="text-xs text-muted-foreground">
              Built for U.S. car buyers. Independent. No dealer partnerships.
            </p>
            <p className="text-xs text-muted-foreground">
              Odigos provides estimates based on the information you share. Always verify details directly with the dealership.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
