import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, CheckCircle2, ChevronDown } from "lucide-react";
import { trackPageView, trackCtaClick } from "@/lib/tracking";
import logoImage from "@assets/odigos_logo.png";

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
    a: "No. Messages are analyzed in real time and are not stored.",
  },
];

export default function Landing() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    trackPageView("/");
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between gap-3">
          <Link href="/">
            <img src={logoImage} alt="Odigos" className="h-24 w-auto cursor-pointer" data-testid="link-logo-home" />
          </Link>
          <div className="flex flex-col items-end gap-1">
            <Link href="/analyze">
              <Button
                size="sm"
                data-testid="button-header-cta"
                onClick={() => trackCtaClick("landing-header", "Check My Deal")}
              >
                Check My Deal
              </Button>
            </Link>
            <span className="text-xs text-muted-foreground">Takes 10 seconds · No signup required</span>
          </div>
        </div>
      </header>

      <main>
        <section className="pt-16 pb-20 md:pt-24 md:pb-28 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight text-foreground max-w-4xl mx-auto" data-testid="text-hero-headline">
              Spot dealer pricing tricks before you walk into the dealership.
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed" data-testid="text-hero-subheadline">
              Paste a dealer quote, text, or email. Odigos checks for missing out-the-door pricing, hidden fees, and common dealership tactics so you know exactly what you're agreeing to.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
              <Link href="/analyze">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto px-8 py-6 text-lg font-semibold rounded-xl" 
                  data-testid="button-cta-hero"
                  onClick={() => trackCtaClick("hero-analyze", "Check a Dealer Quote")}
                >
                  Check a Dealer Quote
                </Button>
              </Link>
              <Link href="/analyze?example=bad">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="w-full sm:w-auto text-sm rounded-lg mt-4" 
                  data-testid="button-try-bad"
                  onClick={() => trackCtaClick("hero-bad-example", "Try a bad deal example")}
                >
                  Try a bad deal example
                </Button>
              </Link>
            </div>
            <p className="mt-3 text-sm text-muted-foreground" data-testid="text-reassurance">
              Takes 10 seconds. No signup required.
            </p>
            <p className="mt-4 text-sm font-medium tracking-wide text-muted-foreground leading-relaxed" data-testid="text-trust-strip">
              Independent · No account required · We don't store your text · Secure Stripe checkout
            </p>
          </div>
        </section>

        <section className="py-12 px-6">
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

        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl md:text-2xl font-bold mb-8 text-center" data-testid="text-checks-heading">
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
              Privacy: Your messages are analyzed in real time. We don't store or share them.
            </p>
          </div>
        </section>

        <section className="py-12 px-6">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl md:text-2xl font-bold mb-4 text-center" data-testid="text-otd-explainer-heading">
              What is an out-the-door price?
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed">
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
            <p className="text-base text-muted-foreground leading-relaxed">
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
            <p className="text-base text-muted-foreground leading-relaxed">
              We don't sell cars. We don't work with dealerships. We don't take referral fees. Odigos is an independent tool that works entirely from the messages you already have. No account required. No data stored. Just clarity before you sign.
            </p>
          </div>
        </section>

        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl md:text-2xl font-bold mb-6 text-center">
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
                </CardContent>
              </Card>
            </div>
            <p className="text-center text-sm text-muted-foreground mt-4">
              No subscription. No upsells. One-time purchase per analysis.
            </p>
          </div>
        </section>

        <section className="py-16 px-6">
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
            <h2 className="text-xl md:text-2xl font-bold mb-6 text-center" data-testid="text-faq-heading">
              Common questions
            </h2>
            <div className="space-y-2">
              {faqs.map((faq, idx) => (
                <div key={idx} className="border border-border rounded-lg overflow-hidden">
                  <button
                    type="button"
                    className="w-full flex items-center justify-between px-5 py-4 text-left"
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    data-testid={`button-faq-${idx}`}
                  >
                    <span className="text-sm font-medium text-foreground">{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 ml-4 transition-transform ${openFaq === idx ? "rotate-180" : ""}`} />
                  </button>
                  {openFaq === idx && (
                    <div className="px-5 pb-4">
                      <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 px-6 bg-muted/30">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-xl md:text-2xl font-bold mb-6">
              Don't walk into a $30–$60k decision blind.
            </h2>
            <Link href="/analyze">
              <Button size="lg" className="text-base rounded-lg" data-testid="button-cta-final">
                Check This Deal
              </Button>
            </Link>
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
      </main>

      <section className="py-12 px-6">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-base font-semibold mb-2 text-foreground" data-testid="text-scope-heading">What Odigos does NOT do</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Odigos analyzes pricing transparency and financing terms. It does not evaluate vehicle condition, mechanical reliability, or accident history.
            </p>
          </div>
        </section>

      <section className="py-12 px-6">
        <div className="max-w-2xl mx-auto">
          <h3 className="text-base font-semibold mb-4 text-foreground" data-testid="text-tactics-heading">Common Dealer Pricing Tactics Buyers Ask About</h3>
          <ul className="space-y-2">
            <li><Link href="/dealer-wont-give-out-the-door-price" className="text-sm underline text-foreground" data-testid="link-tactic-otd">Dealer Won't Give Out-the-Door Price</Link></li>
            <li><Link href="/are-dealer-add-ons-mandatory" className="text-sm underline text-foreground" data-testid="link-tactic-addons">Are Dealer Add-Ons Mandatory?</Link></li>
            <li><Link href="/dealer-doc-fee" className="text-sm underline text-foreground" data-testid="link-tactic-docfee">Dealer Documentation Fee Explained</Link></li>
            <li><Link href="/market-adjustment-fee" className="text-sm underline text-foreground" data-testid="link-tactic-market">Dealer Market Adjustment Fees</Link></li>
            <li><Link href="/dealer-added-fees-after-agreement" className="text-sm underline text-foreground" data-testid="link-tactic-added-fees">Dealer Added Fees After Agreement</Link></li>
          </ul>
        </div>
      </section>

      <footer className="border-t border-border/50 py-6">
        <div className="max-w-5xl mx-auto px-6 text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            <Link href="/dealer-pricing-tactics" className="underline text-foreground" data-testid="link-guides">Guides: Dealer Pricing Tactics</Link>
          </p>
          <p className="text-xs text-muted-foreground">
            Built for U.S. car buyers. Independent. No dealer partnerships.
          </p>
          <p className="text-sm text-muted-foreground">
            Odigos provides estimates based on the information you share. Always verify details directly with the dealership.
          </p>
        </div>
      </footer>
    </div>
  );
}
