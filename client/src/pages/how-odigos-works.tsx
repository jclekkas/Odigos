import { useEffect } from "react";
import { Link } from "wouter";
import { setSeoMeta } from "@/lib/seo";
import ArticleLayout from "@/components/ArticleLayout";
import { Button } from "@/components/ui/button";
import { ArrowRight, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function HowOdigosWorks() {
  useEffect(() => {
    return setSeoMeta({
      title: "How Odigos Works | Dealer Quote Analysis",
      description: "Learn how Odigos analyzes car dealer quotes for missing out-the-door pricing, hidden fees, and common dealership tactics — and what you get from the analysis.",
      path: "/how-odigos-works",
    });
  }, []);

  return (
    <ArticleLayout title="How Odigos Works" showBreadcrumbs={false}>
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 leading-tight" data-testid="text-how-it-works-heading">
        How Odigos Works
      </h1>
      <p className="text-sm text-muted-foreground mb-10">
        Independent dealer quote analysis — no account required
      </p>

      <div className="space-y-10 text-base leading-relaxed">

        <section>
          <div className="flex items-start gap-3 mb-3">
            <span className="bg-muted text-foreground font-semibold text-sm rounded-full h-7 w-7 flex items-center justify-center shrink-0 mt-0.5">1</span>
            <h2 className="text-xl font-semibold text-foreground">Paste or upload the dealer communication</h2>
          </div>
          <p className="text-muted-foreground ml-10">
            Copy the dealer's email, text message, or quote directly into the analyzer — or upload a screenshot or PDF. Any format works. You don't need to clean it up or reformat it.
          </p>
          <p className="text-muted-foreground ml-10 mt-2">
            Common things people paste: dealer email threads, SMS screenshots uploaded as images, written quotes from the showroom, or online configurator summaries.
          </p>
        </section>

        <section>
          <div className="flex items-start gap-3 mb-3">
            <span className="bg-muted text-foreground font-semibold text-sm rounded-full h-7 w-7 flex items-center justify-center shrink-0 mt-0.5">2</span>
            <h2 className="text-xl font-semibold text-foreground">Odigos checks for what's missing or risky</h2>
          </div>
          <p className="text-muted-foreground ml-10 mb-4">
            The analysis looks for a specific set of issues that commonly appear in dealer quotes and lead to buyers paying more than expected:
          </p>
          <ul className="space-y-3 ml-10">
            <li className="flex items-start gap-3">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
              <span className="text-muted-foreground"><strong className="text-foreground">Missing out-the-door price</strong> — When only a monthly payment or vehicle price is quoted, the total cost (taxes, registration, doc fees, add-ons) is hidden.</span>
            </li>
            <li className="flex items-start gap-3">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
              <span className="text-muted-foreground"><strong className="text-foreground">Hidden or vague fees</strong> — Documentation fees, prep fees, market adjustments, and appearance packages that aren't itemized.</span>
            </li>
            <li className="flex items-start gap-3">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
              <span className="text-muted-foreground"><strong className="text-foreground">Dealer add-ons presented as mandatory</strong> — Protection packages, nitrogen tires, window tint, and similar options that are optional but worded as included.</span>
            </li>
            <li className="flex items-start gap-3">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
              <span className="text-muted-foreground"><strong className="text-foreground">Undisclosed financing terms</strong> — Quotes that mention a payment but omit APR, loan term, or down payment make it impossible to evaluate the actual cost of financing.</span>
            </li>
            <li className="flex items-start gap-3">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
              <span className="text-muted-foreground"><strong className="text-foreground">Vague pricing language</strong> — Phrases like "competitive rate," "we'll work something out," or "come in to talk numbers" that avoid committing to actual figures.</span>
            </li>
          </ul>
        </section>

        <section>
          <div className="flex items-start gap-3 mb-3">
            <span className="bg-muted text-foreground font-semibold text-sm rounded-full h-7 w-7 flex items-center justify-center shrink-0 mt-0.5">3</span>
            <h2 className="text-xl font-semibold text-foreground">You receive a verdict and guidance</h2>
          </div>
          <p className="text-muted-foreground ml-10 mb-4">
            The free preview gives you:
          </p>
          <ul className="space-y-2 ml-10 mb-4">
            <li className="flex items-center gap-3">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
              <span className="text-muted-foreground">
                A <strong className="text-foreground">GO / NO-GO verdict</strong> with a deal score and confidence level
              </span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
              <span className="text-muted-foreground">
                The <strong className="text-foreground">pricing details detected</strong> in the quote
              </span>
            </li>
          </ul>
          <p className="text-muted-foreground ml-10 mb-2">
            The Full Deal Review ($49 one-time) adds:
          </p>
          <ul className="space-y-2 ml-10">
            <li className="flex items-center gap-3">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
              <span className="text-muted-foreground">Every red flag and hidden fee detected</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
              <span className="text-muted-foreground">The specific questions to ask before you sign</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
              <span className="text-muted-foreground">A copy-paste reply to send back to the dealer</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
              <span className="text-muted-foreground">A line-by-line explanation of the analysis</span>
            </li>
          </ul>
        </section>

        <section className="rounded-lg border border-border bg-card p-5">
          <h2 className="text-base font-semibold mb-2 text-foreground">What Odigos does not do</h2>
          <p className="text-sm text-muted-foreground">
            Odigos reviews pricing transparency and financing terms only. It does not evaluate vehicle condition, mechanical reliability, accident history, or market value. It is not a substitute for a pre-purchase inspection or independent appraisal.
          </p>
        </section>

        <section className="rounded-lg border border-border bg-card p-5">
          <h2 className="text-base font-semibold mb-2 text-foreground">Independence</h2>
          <p className="text-sm text-muted-foreground">
            Odigos is not affiliated with any dealership, manufacturer, or financing company. It does not receive referral fees. It analyzes only the text you submit.
          </p>
        </section>

        <div className="pt-4">
          <Button variant="cta" asChild size="lg" className="gap-2" data-testid="button-cta-how-it-works">
            <Link href="/analyze">
              Check a Dealer Quote
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <p className="mt-3 text-sm text-muted-foreground">Takes about a minute. No signup required.</p>
        </div>

      </div>
    </ArticleLayout>
  );
}
