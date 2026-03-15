import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { ChevronDown, Shield, FileSearch, MessageSquareText, CheckCircle, ArrowRight } from "lucide-react";
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
    a: "The initial analysis is free and gives you a verdict with key findings. The full report with detailed breakdown and suggested dealer response is $49 one-time.",
  },
  {
    q: "Do you store my messages?",
    a: "No. Your dealer communications are analyzed in real time and are not stored on our servers.",
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
      <Helmet>
        <title>Odigos - Understand Your Car Deal Before You Sign</title>
        <meta name="description" content="Paste a dealer quote and get clarity on what's included, what's missing, and what to ask. Independent analysis for car buyers." />
      </Helmet>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src={logoImage} alt="Odigos" className="h-7 w-auto" />
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/out-the-door-price" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Guides
            </Link>
            <Link href="/dealer-pricing-tactics" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Dealer Tactics
            </Link>
          </nav>
          <Link href="/analyze">
            <Button size="sm" className="rounded-full px-5">
              Analyze Quote
            </Button>
          </Link>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="pt-32 pb-20 md:pt-40 md:pb-28 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-sm font-medium text-primary mb-4 tracking-wide uppercase">
              Independent Deal Analysis
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-semibold tracking-tight leading-[1.1] text-foreground text-balance">
              Understand your car deal before you sign
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed text-pretty">
              Paste a dealer quote, text, or email. We'll show you what's included, what's missing, and exactly what to ask before you visit.
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/analyze">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto px-8 h-12 text-base font-medium rounded-full"
                  onClick={() => trackCtaClick("hero-analyze", "Analyze a Dealer Quote")}
                >
                  Analyze a Dealer Quote
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
            
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              <TrustBadge>No account required</TrustBadge>
              <TrustBadge>Independent analysis</TrustBadge>
              <TrustBadge>Data not stored</TrustBadge>
            </div>
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
        <section className="py-16 md:py-24 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-3">
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
                  description: "Copy the dealer's text, email, or written quote exactly as you received it."
                },
                {
                  icon: Shield,
                  title: "Get your analysis",
                  description: "We identify what's clearly stated, what's missing, and potential concerns."
                },
                {
                  icon: MessageSquareText,
                  title: "Know what to ask",
                  description: "Get specific questions to send the dealer before your visit."
                }
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

        {/* What We Check */}
        <section className="py-16 md:py-24 px-6 bg-card/50">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-3">
                What we analyze
              </h2>
              <p className="text-muted-foreground">
                The details that matter most in any dealer quote
              </p>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                {
                  title: "Out-the-door pricing",
                  description: "Is the total cost clearly stated? Are taxes, fees, and registration included?"
                },
                {
                  title: "Financing terms",
                  description: "APR, loan term, down payment — the numbers that determine your real cost."
                },
                {
                  title: "Dealer fees",
                  description: "Documentation fees, dealer prep, and other charges that vary widely."
                },
                {
                  title: "Add-ons and packages",
                  description: "Protection plans, appearance packages, and accessories you may not need."
                },
                {
                  title: "Pricing language",
                  description: "Vague terms, conditional offers, and language that leaves room for changes."
                },
                {
                  title: "Missing information",
                  description: "Critical details that should be in writing before you visit."
                }
              ].map((item, idx) => (
                <div key={idx} className="p-5 rounded-xl bg-background border border-border/50">
                  <h3 className="font-medium text-foreground mb-1.5">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-16 md:py-24 px-6">
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
              <div className="p-6 rounded-2xl border border-border/50 bg-background">
                <div className="mb-4">
                  <h3 className="font-semibold text-foreground mb-1">Quick Check</h3>
                  <p className="text-3xl font-semibold text-foreground">Free</p>
                </div>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Verdict (Green / Yellow / Red)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Confidence assessment</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Key pricing details detected</span>
                  </li>
                </ul>
              </div>
              
              <div className="p-6 rounded-2xl border-2 border-primary/30 bg-primary/5">
                <div className="mb-4">
                  <h3 className="font-semibold text-foreground mb-1">Full Analysis</h3>
                  <p className="text-3xl font-semibold text-foreground">$49</p>
                </div>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Everything in Quick Check</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Complete red flag breakdown</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Missing information checklist</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Copy-paste dealer response</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Full analysis reasoning</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-16 md:py-24 px-6 bg-card/50">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-4">
              Built for car buyers, not dealerships
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl mx-auto mb-8">
              We don't sell cars. We don't work with dealerships. We don't take referral fees. 
              Odigos is an independent tool that works entirely from the messages you already have.
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
        <section className="py-16 md:py-24 px-6">
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
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-8 text-center">
              Common questions
            </h2>
            <div className="space-y-2">
              {faqs.map((faq, idx) => (
                <div key={idx} className="border border-border/50 rounded-xl overflow-hidden bg-background">
                  <button
                    type="button"
                    className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-muted/30 transition-colors"
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  >
                    <span className="text-sm font-medium text-foreground pr-4">{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 ${openFaq === idx ? "rotate-180" : ""}`} />
                  </button>
                  <div className={`overflow-hidden transition-all duration-200 ${openFaq === idx ? "max-h-40" : "max-h-0"}`}>
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
            <Link href="/analyze">
              <Button 
                size="lg" 
                className="px-8 h-12 text-base font-medium rounded-full"
                onClick={() => trackCtaClick("final-cta", "Analyze Your Quote")}
              >
                Analyze Your Quote
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Resources Section */}
        <section className="py-16 px-6 border-t border-border/50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-lg font-semibold text-foreground mb-6 text-center">
              Learn more about dealer pricing
            </h2>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { label: "Out-the-Door Price Guide", href: "/out-the-door-price" },
                { label: "Dealer Fee Explained", href: "/car-dealer-fees-explained" },
                { label: "Monthly Payment Trap", href: "/monthly-payment-trap" },
                { label: "Common Dealer Tactics", href: "/dealer-pricing-tactics" },
              ].map((link) => (
                <Link key={link.href} href={link.href}>
                  <span className="inline-block px-4 py-2 text-sm text-muted-foreground hover:text-foreground bg-muted/30 hover:bg-muted/50 rounded-full transition-colors">
                    {link.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border/50">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={logoImage} alt="Odigos" className="h-5 w-auto opacity-70" />
          </div>
          <p className="text-xs text-muted-foreground text-center md:text-right">
            Independent car deal analysis. Not affiliated with any dealership.
          </p>
        </div>
      </footer>
    </div>
  );
}
