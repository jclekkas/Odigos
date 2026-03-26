import { useEffect } from "react";
import { Link } from "wouter";
import { setSeoMeta } from "@/lib/seo";
import ArticleLayout from "@/components/ArticleLayout";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowRight } from "lucide-react";

export default function ExampleAnalysis() {
  useEffect(() => {
    return setSeoMeta({
      title: "Example Dealer Quote Analysis | Odigos",
      description: "See exactly what an Odigos dealer quote analysis looks like on a real example — including flagged issues, verdict, and a copy-paste reply to send back to the dealer.",
      path: "/example-analysis",
    });
  }, []);

  return (
    <ArticleLayout title="Example Analysis" showBreadcrumbs={false}>
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 leading-tight" data-testid="text-example-analysis-heading">
        What an Odigos Analysis Looks Like
      </h1>
      <p className="text-sm text-muted-foreground mb-10">
        A real dealer quote — analyzed. No signup required to see the results.
      </p>

      <div className="space-y-10 text-base leading-relaxed">

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3" data-testid="text-dealer-message-heading">
            The Dealer's Message
          </h2>
          <div className="rounded-lg border border-border bg-muted/40 p-5 text-sm text-muted-foreground font-mono leading-relaxed whitespace-pre-wrap" data-testid="block-dealer-message">
            {`Hi! Thanks for your interest in the 2024 Honda CR-V EX-L.\n\nWe can get you into this vehicle for $489/month. We have a few in \nstock right now — this deal won't last long. We also include our \nPremier Protection Package, which covers paint sealant, fabric \nprotection, and nitrogen-filled tires.\n\nCome in this weekend and we'll work something out on the numbers. \nLet me know if you have any questions!\n\n— Mike, Westside Honda`}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3" data-testid="text-odigos-verdict-heading">
            Odigos Analysis
          </h2>

          <div className="rounded-lg border border-amber-500/30 bg-amber-50/5 p-5 mb-5" data-testid="block-verdict">
            <p className="text-sm font-semibold text-foreground uppercase tracking-wide mb-1">Verdict</p>
            <p className="text-2xl font-bold text-amber-500 mb-1" data-testid="text-verdict-label">NO-GO</p>
            <p className="text-sm text-muted-foreground">This quote has multiple missing disclosures and a bundled dealer add-on that is likely optional. Do not visit the dealership or commit to anything until you have a full out-the-door price in writing.</p>
          </div>

          <h3 className="text-base font-semibold text-foreground mb-3">Issues Found</h3>
          <ul className="space-y-4" data-testid="list-issues">
            <li className="flex items-start gap-3" data-testid="issue-no-otd">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
              <span className="text-muted-foreground">
                <strong className="text-foreground">No out-the-door price.</strong>{" The quote only shows a monthly payment of $489. Without a total price, you cannot evaluate what you are actually paying. Taxes, registration, documentation fees, and any add-ons are all hidden inside that number."}
              </span>
            </li>
            <li className="flex items-start gap-3" data-testid="issue-financing-terms">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
              <span className="text-muted-foreground">
                <strong className="text-foreground">Financing terms not disclosed.</strong>{" No APR, loan term, or down payment is mentioned. A payment of $489 could represent a 60-month loan at 4% or a 72-month loan at 9% — both look the same in this message, but carry very different total costs."}
              </span>
            </li>
            <li className="flex items-start gap-3" data-testid="issue-add-on">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
              <span className="text-muted-foreground">
                <strong className="text-foreground">Dealer add-on presented as included.</strong>{" The \"Premier Protection Package\" (paint sealant, fabric protection, nitrogen tires) is worded as a feature of the vehicle. These are typically dealer-installed add-ons that cost $500–$2,000 and are optional. You are likely being asked to pay for them whether you want them or not."}
              </span>
            </li>
            <li className="flex items-start gap-3" data-testid="issue-vague-language">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
              <span className="text-muted-foreground">
                <strong className="text-foreground">Vague pricing language.</strong>{" \"We'll work something out on the numbers\" is a common tactic that avoids committing to any price in writing. Agreeing to come in without a firm quote gives the dealer a significant information advantage."}
              </span>
            </li>
          </ul>
        </section>

        <section className="rounded-lg border border-border bg-card p-5" data-testid="block-why-this-matters">
          <h2 className="text-base font-semibold mb-2 text-foreground">Why This Matters</h2>
          <p className="text-sm text-muted-foreground">
            Monthly payment quotes are the most common way dealerships obscure the true cost of a vehicle. By anchoring the conversation to a payment you can afford, a dealer can extend the loan term, increase the interest rate, or add thousands in fees and add-ons — without changing the monthly number you agreed to. Requesting a full out-the-door price before any negotiation is the single most effective step you can take.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3" data-testid="text-reply-heading">
            What to Say Back
          </h2>
          <p className="text-sm text-muted-foreground mb-3">
            Copy and send this reply to the dealer before agreeing to anything:
          </p>
          <div className="rounded-lg border border-border bg-muted/40 p-5 text-sm text-muted-foreground font-mono leading-relaxed whitespace-pre-wrap" data-testid="block-reply-suggestion">
            {`Hi Mike,\n\nThanks for reaching out. Before I can move forward, I need a few \nthings in writing:\n\n1. The full out-the-door (OTD) price — including taxes, registration \n   fees, documentation fees, and any other charges.\n\n2. The financing terms you're offering: the APR, loan term (months), \n   and required down payment.\n\n3. An itemized breakdown of the \"Premier Protection Package\" and \n   confirmation that it is optional.\n\nI'm ready to move quickly if the numbers work, but I won't be \nable to visit the dealership until I have this information.\n\nThanks,\n[Your name]`}
          </div>
        </section>

        <div className="pt-4" data-testid="section-cta">
          <p className="text-sm text-muted-foreground mb-4">
            Ready to check your own quote?
          </p>
          <Button variant="cta" asChild size="lg" className="gap-2" data-testid="button-cta-example-analysis">
            <Link href="/analyze">
              Analyze My Dealer Quote
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <p className="mt-3 text-sm text-muted-foreground">Takes about a minute. No signup required.</p>
        </div>

      </div>
    </ArticleLayout>
  );
}
