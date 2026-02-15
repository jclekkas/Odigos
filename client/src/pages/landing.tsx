import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, CheckCircle2 } from "lucide-react";
import { trackPageView, trackCtaClick } from "@/lib/tracking";

export default function Landing() {
  useEffect(() => {
    trackPageView("/");
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <main>
        <section className="pt-16 pb-20 md:pt-24 md:pb-28 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight text-foreground" data-testid="text-hero-headline">
              Know Your Real OTD Price.<br />
              Before You Sign Anything.
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed" data-testid="text-hero-subheadline">
              We expose hidden fees, APR traps, and missing OTD details before they cost you thousands.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
              <Link href="/analyze">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto px-8 py-6 text-lg font-semibold rounded-xl" 
                  data-testid="button-cta-hero"
                  onClick={() => trackCtaClick("hero-analyze", "Analyze My Dealer Quote")}
                >
                  Analyze My Dealer Quote
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
            <p className="mt-6 text-sm text-muted-foreground/80 leading-relaxed" data-testid="text-trust-strip">
              Independent · No account required · We don't store your text · Secure Stripe checkout
            </p>
          </div>
        </section>

        <section className="py-16 px-6">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="pt-6 pb-6">
                <h2 className="text-xl md:text-2xl font-bold mb-6 text-center">
                  What Odigos checks before you go in
                </h2>
                <ul className="space-y-3">
                  {[
                    "Missing out-the-door (OTD) price details",
                    "Hidden fees, add-ons, and protection packages",
                    "APR / term inconsistencies",
                    "Payment-focused tactics that hide total cost",
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-base text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
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
      </main>

      <footer className="border-t border-border/50 py-6">
        <div className="max-w-5xl mx-auto px-6 text-center space-y-2">
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
