import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, CheckCircle2, Car } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Car className="w-5 h-5 text-primary" />
          </div>
          <span className="text-xl font-bold tracking-tight">Odigos</span>
        </div>
      </header>

      <main>
        <section className="py-12 md:py-20 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 leading-tight" data-testid="text-hero-headline">
              Know your car deal before you go in.
            </h1>
            <p className="text-lg text-muted-foreground mb-8" data-testid="text-hero-subheadline">
              Paste dealer texts or quotes. Get a clear verdict, what's missing, and what to say next.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
              <Link href="/analyze">
                <Button size="lg" className="w-full sm:w-auto" data-testid="button-cta-hero">
                  Analyze my deal
                </Button>
              </Link>
              <Link href="/analyze?example=bad">
                <Button size="lg" variant="outline" className="w-full sm:w-auto" data-testid="button-try-bad">
                  Try a bad deal example
                </Button>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              No account required. Not affiliated with any dealership.
            </p>
          </div>
        </section>

        <section className="py-12 px-6 bg-muted/30">
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

        <section className="py-12 px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-xl md:text-2xl font-bold mb-4">
              Why it matters
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              Dealers often quote monthly payments, add packages later, or ask you to "come in to talk numbers." Odigos turns the messages you already have into a clear next step.
            </p>
          </div>
        </section>

        <section className="py-12 px-6 bg-muted/30">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl md:text-2xl font-bold mb-6 text-center">
              Real example (anonymized)
            </h2>
            <Card>
              <CardContent className="pt-6">
                <div className="mb-4">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Dealer message:</p>
                  <p className="text-sm italic bg-muted/50 p-3 rounded-md">
                    "All-in price is $32,245.18. Approved 1.99% for 60 months."
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Odigos output:</p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm"><span className="font-medium text-green-600 dark:text-green-400">GREEN</span> — Proceed, confirm buyer's order</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">What to verify: buyer's order reflects OTD + APR + term</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">Reply provided: asks dealer to have buyer's order ready</span>
                    </li>
                  </ul>
                </div>
                <p className="text-xs text-muted-foreground mt-4">Example edited for privacy.</p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="py-12 px-6">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl md:text-2xl font-bold mb-6 text-center">
              Simple pricing
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-3">Free Preview</h3>
                  <p className="text-sm text-muted-foreground">Verdict + what we detected</p>
                </CardContent>
              </Card>
              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-3">Negotiation Pack — $79 <span className="text-xs font-normal text-muted-foreground">(one-time)</span></h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>Copy-paste dealer reply</li>
                    <li>Full reasoning + next questions</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
            <p className="text-center text-sm text-muted-foreground mt-4">
              No subscription. No upsells.
            </p>
          </div>
        </section>

        <section className="py-12 md:py-16 px-6 bg-muted/30">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-xl md:text-2xl font-bold mb-6">
              Don't walk into a $30–$60k decision blind.
            </h2>
            <Link href="/analyze">
              <Button size="lg" data-testid="button-cta-final">
                Analyze my deal
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/50 py-6">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-sm text-muted-foreground">
            Odigos provides estimates based on the information you share. Always verify details directly with the dealership.
          </p>
        </div>
      </footer>
    </div>
  );
}
