import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Check, 
  AlertTriangle, 
  CheckCircle2,
  XCircle,
  MessageSquare,
  HelpCircle,
  Shield,
  Car
} from "lucide-react";

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
        <section className="py-16 md:py-24 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 leading-tight" data-testid="text-hero-headline">
              Know if your car deal is good — before you go to the dealership.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed" data-testid="text-hero-subheadline">
              Paste your dealer texts or quotes. Odigos tells you if the deal is clean, what's missing, and what to say next — in minutes.
            </p>
            <Link href="/analyze">
              <Button size="lg" className="text-lg px-8 py-6" data-testid="button-cta-hero">
                Analyze my deal
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground mt-4">
              No account required. Not affiliated with any dealership.
            </p>
          </div>
        </section>

        <section className="py-16 px-6 bg-muted/30">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
              Buying a car shouldn't feel like a guessing game.
            </h2>
            <ul className="space-y-4 mb-8">
              {[
                "Monthly payment quotes instead of real prices",
                "Fees and 'packages' added later",
                "Pressure to 'come in and talk numbers'",
                "Terms changing between text and paperwork"
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <span className="text-base md:text-lg text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-center text-base md:text-lg text-foreground font-medium">
              Most buyers don't want to "win" negotiations — they just want to avoid a bad deal.
            </p>
          </div>
        </section>

        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
              Odigos reviews your deal like an experienced buyer would.
            </h2>
            <ul className="space-y-4 mb-8">
              {[
                "A clear verdict (Green / Yellow / Red)",
                "A plain-English explanation of what the deal really means",
                "What's missing or risky",
                "Exact copy-paste messages to send the dealer",
                "A simple answer to: Should I go in or not?"
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-base md:text-lg text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-center text-base md:text-lg text-foreground font-medium">
              No math. No forums. No second-guessing.
            </p>
          </div>
        </section>

        <section className="py-16 px-6 bg-muted/30">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
              Example outcomes
            </h2>
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card className="border-green-500/30 bg-green-500/5">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-green-700 dark:text-green-400">Good Deal</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    "The core terms are clear and competitive. Proceed — confirm final paperwork."
                  </p>
                </CardContent>
              </Card>
              <Card className="border-red-500/30 bg-red-500/5">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <span className="font-semibold text-red-700 dark:text-red-400">Risky Deal</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    "Pause. This is a payment-only quote with add-ons. Ask for an itemized out-the-door price before visiting."
                  </p>
                </CardContent>
              </Card>
            </div>
            <p className="text-center text-base md:text-lg text-foreground font-medium">
              Odigos doesn't hype deals. It tells you the truth.
            </p>
          </div>
        </section>

        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">
              Odigos isn't a chatbot. It's judgment.
            </h2>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed text-center">
              Generic AI tools hedge, say "it depends," and don't enforce buyer rules. Odigos is opinionated by design: it flags common dealership tactics, refuses to guess missing numbers, and gives you a decision—not a discussion.
            </p>
          </div>
        </section>

        <section className="py-16 px-6 bg-muted/30">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
              Simple pricing
            </h2>
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-4">Deal Review — Free Preview</h3>
                  <ul className="space-y-3">
                    {["Deal score", "What we detected", "What's missing"].map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-green-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-4">Negotiation Pack — $79</h3>
                  <ul className="space-y-3">
                    {[
                      "Everything above",
                      "Copy-paste dealer reply",
                      "Full reasoning behind the verdict"
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-primary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              One-time payment. No subscriptions. No upsells.
            </p>
          </div>
        </section>

        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-base text-muted-foreground mb-2">
              Odigos is not affiliated with any dealership. It does not sell leads. It does not negotiate on your behalf.
            </p>
            <p className="text-base text-foreground font-medium">
              It helps you walk in informed — or avoid walking in at all.
            </p>
          </div>
        </section>

        <section className="py-16 md:py-24 px-6 bg-muted/30">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-8">
              Don't walk into a $30–$60k decision blind.
            </h2>
            <Link href="/analyze">
              <Button size="lg" className="text-lg px-8 py-6" data-testid="button-cta-final">
                Analyze my deal
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground mt-4">
              Most analyses take under 2 minutes.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/50 py-8">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-sm text-muted-foreground">
            Odigos provides estimates based on the information you share. Always verify details directly with the dealership.
          </p>
        </div>
      </footer>
    </div>
  );
}
