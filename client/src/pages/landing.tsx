import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, ArrowRight, Check, CheckCircle2, ChevronDown } from "lucide-react";
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
        <section className="py-28 sm:py-40 lg:py-48">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <p className="mb-8 text-xs font-medium tracking-widest uppercase text-muted-foreground" data-testid="text-authority-framing">
                Independent Quote Review
              </p>

              <h1 className="font-serif text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl" data-testid="text-hero-headline">
                Understand your dealer quote before you commit.
              </h1>

              <p className="mx-auto mt-10 max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg leading-relaxed" data-testid="text-hero-subheadline">
                Odigos reviews car dealer quotes for missing pricing details, unclear fees,
                and language that may not be in your best interest. Paste a quote and
                receive an independent assessment.
              </p>

              <div className="mt-14 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button size="lg" className="gap-2" asChild data-testid="button-cta-hero">
                  <Link href="/analyze" onClick={() => trackCtaClick("hero-analyze", "Check a Dealer Quote")}>
                    Check a Dealer Quote
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild data-testid="button-try-bad">
                  <Link href="/analyze?example=bad" onClick={() => trackCtaClick("hero-bad-example", "Try a bad deal example")}>
                    Try a bad deal example
                  </Link>
                </Button>
              </div>

              <p className="mt-10 text-sm text-muted-foreground" data-testid="text-reassurance">
                No account required. Takes about 10 seconds.
              </p>

              <div className="mt-12 flex flex-col items-center justify-center gap-3 text-xs text-muted-foreground sm:flex-row sm:gap-6" data-testid="text-trust-strip">
                <div className="flex items-center gap-2">
                  <span className="text-primary">✓</span>
                  <span>Independent analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-primary">✓</span>
                  <span>No dealership affiliations</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-primary">✓</span>
                  <span>Personal information redacted</span>
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
                "Send the copy-paste reply before you go in",
              ].map((step, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="bg-muted text-foreground font-semibold text-sm rounded-full h-6 w-6 flex items-center justify-center shrink-0 mt-0.5">{idx + 1}</span>
                  <span className="text-base text-muted-foreground">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="features" className="py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center" data-testid="text-checks-heading">
              What Odigos Checks For
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Card data-testid="card-check-otd">
                <CardContent className="pt-6 pb-6">
                  <h3 className="font-semibold mb-2 text-foreground">Missing Out-the-Door Price</h3>
                  <p className="text-sm text-muted-foreground">Many dealer quotes hide the full price. Odigos flags when tax, registration, documentation fees, or add-ons are not clearly included.</p>
                </CardContent>
              </Card>
              <Card data-testid="card-check-addons">
                <CardContent className="pt-6 pb-6">
                  <h3 className="font-semibold mb-2 text-foreground">Dealer Add-Ons</h3>
                  <p className="text-sm text-muted-foreground">Dealers often present optional add-ons like nitrogen tires or paint protection as mandatory. Odigos highlights language that suggests this.</p>
                </CardContent>
              </Card>
              <Card data-testid="card-check-fees">
                <CardContent className="pt-6 pb-6">
                  <h3 className="font-semibold mb-2 text-foreground">Unclear Fees</h3>
                  <p className="text-sm text-muted-foreground">Dealer documentation fees, prep fees, and appearance packages are sometimes buried in quotes. Odigos helps surface them.</p>
                </CardContent>
              </Card>
              <Card data-testid="card-check-language">
                <CardContent className="pt-6 pb-6">
                  <h3 className="font-semibold mb-2 text-foreground">Vague Pricing Language</h3>
                  <p className="text-sm text-muted-foreground">If a dealer message avoids committing to a full price or conditions the deal on financing or add-ons, Odigos calls it out.</p>
                </CardContent>
              </Card>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-4" data-testid="text-privacy-note">
              Pricing signals are stored anonymously to improve dealer fee benchmarks. Submitted text is PII-redacted and deleted after 90 days.{" "}
              <a href="/privacy" className="underline hover:text-foreground transition-colors">Privacy Policy</a>
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
                "Copy-paste reply to send the dealer (paid)"
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

        <section className="py-16 px-6 bg-muted/30" data-testid="section-sample-output">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center">
              What the analysis looks like
            </h2>
            <p className="text-sm text-muted-foreground text-center mb-6">
              Sample output from a real car dealer quote (anonymized)
            </p>
            <div className="border border-border/60 rounded-lg bg-background p-5 md:p-6 space-y-4">
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

        <section id="pricing" className="py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">
              Simple pricing
            </h2>
            <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <Card data-testid="card-pricing-tier1">
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">Free Preview</h3>
                  <p className="text-2xl font-bold mb-3">$0</p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
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
                      <span>Detected pricing details</span>
                    </li>
                  </ul>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full mt-4"
                    data-testid="button-cta-free-preview"
                  >
                    <Link href="/analyze">Try Free Preview</Link>
                  </Button>
                </CardContent>
              </Card>
              <Card className="border-accent/50 bg-accent/5" data-testid="card-pricing-tier2">
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">Full Deal Review</h3>
                  <p className="text-2xl font-bold mb-3">$49 <span className="text-xs font-normal text-muted-foreground">(one-time)</span></p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
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
                    asChild
                    className="w-full mt-4"
                    data-testid="button-cta-full-review"
                  >
                    <Link href="/analyze">Get Full Review — $49</Link>
                  </Button>
                </CardContent>
              </Card>
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
            <p className="text-center text-sm text-muted-foreground mt-4">
              No subscription. No upsells. One-time purchase per analysis.
            </p>
          </div>
        </section>

        <section id="faq" className="py-16 px-6 bg-muted/30">
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
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center" data-testid="text-faq-heading">
              Common questions
            </h2>
            <div className="space-y-2">
              {faqs.map((faq, idx) => (
                <div key={idx} className="border border-border rounded-lg overflow-hidden">
                  <button
                    type="button"
                    className="w-full flex items-center justify-between px-5 py-4 text-left"
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    aria-expanded={openFaq === idx}
                    aria-controls={`faq-panel-${idx}`}
                    data-testid={`button-faq-${idx}`}
                  >
                    <span className="text-sm font-medium text-foreground">{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 ml-4 transition-transform ${openFaq === idx ? "rotate-180" : ""}`} />
                  </button>
                  <div
                    id={`faq-panel-${idx}`}
                    className="px-5 pb-4"
                    hidden={openFaq !== idx}
                  >
                    <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">
              Don't walk into a $30–$60k decision blind.
            </h2>
            <Button asChild size="lg" className="text-base rounded-lg" data-testid="button-cta-final">
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
                <p className="text-sm text-muted-foreground">You can paste a dealer message and get feedback in seconds without creating an account.</p>
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
              <a href="/#features" className="transition-colors hover:text-foreground" data-testid="link-footer-features">
                What We Review
              </a>
              <a href="/#pricing" className="transition-colors hover:text-foreground" data-testid="link-footer-pricing">
                Pricing
              </a>
              <a href="/#faq" className="transition-colors hover:text-foreground" data-testid="link-footer-questions">
                Questions
              </a>
              <Link href="/privacy" className="transition-colors hover:text-foreground" data-testid="link-footer-privacy">
                Privacy
              </Link>
            </nav>
          </div>

          <div className="mt-8 pt-6 border-t border-border text-center text-xs text-muted-foreground leading-relaxed">
            <p>
              Odigos reviews pricing transparency and disclosure practices in dealer quotes.
              It does not provide legal, financial, or mechanical advice.
              Consult appropriate professionals for those assessments.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
