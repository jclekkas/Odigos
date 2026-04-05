import { useEffect } from "react";
import { Link } from "wouter";
import { setSeoMeta } from "@/lib/seo";
import ArticleLayout from "@/components/ArticleLayout";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, Database, Mail } from "lucide-react";

export default function About() {
  useEffect(() => {
    return setSeoMeta({
      title: "About Odigos — The Independent Car Deal Guide",
      description:
        "Odigos (Greek for 'guide') is an independent tool that analyzes car dealer quotes for hidden fees and overcharges. No dealership affiliations. No referral fees. Just clarity before you sign.",
      path: "/about",
    });
  }, []);

  return (
    <ArticleLayout title="About Odigos" showBreadcrumbs={false}>
      <h1
        className="text-3xl md:text-4xl font-bold tracking-tight mb-4 leading-tight"
        data-testid="text-about-heading"
      >
        About Odigos
      </h1>
      <p className="text-sm text-muted-foreground mb-10">
        Independent car deal analysis — no dealership affiliations, no referral fees
      </p>

      <div className="space-y-10 text-base leading-relaxed">

        <section>
          <p className="text-muted-foreground">
            Odigos (oh-dee-GOHS) is Greek for "guide." We built it because car buyers deserve to know what they're actually paying before they sign.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3" data-testid="text-about-what-we-do">
            What Odigos does
          </h2>
          <p className="text-muted-foreground mb-3">
            You paste a dealer quote — an email, a text message, a photo of a worksheet — and Odigos tells you what's in it, what's missing, and whether you should proceed. The analysis checks for:
          </p>
          <ul className="space-y-2 text-muted-foreground list-none">
            <li className="flex items-start gap-2">
              <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
              <span>Missing out-the-door pricing</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
              <span>Inflated documentation fees</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
              <span>Optional add-ons presented as mandatory</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-muted-foreground mt-1.5 shrink-0">•</span>
              <span>Vague financing terms</span>
            </li>
          </ul>
          <p className="text-muted-foreground mt-3">
            For the 18 U.S. states that cap dealer doc fees by law, Odigos flags any fee that exceeds the legal limit — with the specific dollar overage and the statute behind it.
          </p>
        </section>

        <section className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 shrink-0 text-foreground mt-0.5" />
            <div>
              <h2 className="text-base font-semibold text-foreground mb-1">
                What Odigos doesn't do
              </h2>
              <p className="text-sm text-muted-foreground">
                We don't sell cars. We don't work with dealerships. We don't take referral fees from dealers or lenders. Odigos works entirely from the messages you already have. The analysis is independent.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3" data-testid="text-about-how-it-works">
            How it works
          </h2>
          <p className="text-muted-foreground mb-2">
            The free preview gives you a GO / NO-GO verdict, a deal score, and the pricing terms found in the quote.
          </p>
          <p className="text-muted-foreground mb-2">
            The full review ($49, one-time) adds a complete breakdown of red flags, a checklist of missing information, and a copy-paste reply you can send directly to the dealer.
          </p>
          <p className="text-muted-foreground">
            Your submission is not shared with any dealership. PII-redacted text is deleted within 90 days.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">Why the name</h2>
          <p className="text-muted-foreground">
            Odigos (Οδηγός) means "guide" in Greek. A car purchase is one of the largest financial decisions most people make, and the process is designed to favor the dealer. Odigos exists to guide the buyer through that process with accurate, specific information — not general advice.
          </p>
        </section>

        <section className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-start gap-3">
            <Database className="h-5 w-5 shrink-0 text-foreground mt-0.5" />
            <div>
              <h2 className="text-base font-semibold text-foreground mb-1">
                The data behind the tool
              </h2>
              <p className="text-sm text-muted-foreground mb-2">
                Every state-specific claim on this site — doc fee caps, sales tax rates, trade-in credit rules — comes from a verified reference dataset covering all 50 states and Washington D.C. The data is sourced from state DMVs, departments of revenue, legislative records, and consumer protection offices. It's reviewed quarterly and cross-referenced against multiple sources.
              </p>
              <p className="text-sm text-muted-foreground">
                We don't use LLM training data for state-specific fee claims. The analyzer and the content pages pull from the same verified dataset.
              </p>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 shrink-0 text-foreground mt-0.5" />
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">Contact</h2>
              <p className="text-muted-foreground mb-1">
                Questions, corrections, or feedback:{" "}
                <a
                  href="mailto:jclekkas@gmail.com"
                  className="underline text-foreground"
                  data-testid="link-contact-email"
                >
                  jclekkas@gmail.com
                </a>
              </p>
              <p className="text-muted-foreground">
                If you find an error in our state fee data, we want to know. The data gets better when buyers help verify it.
              </p>
            </div>
          </div>
        </section>

        <div className="pt-4">
          <Button variant="cta" asChild size="lg" className="gap-2" data-testid="button-cta-about">
            <Link href="/analyze">
              Check My Quote
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <p className="mt-3 text-sm text-muted-foreground">Takes about a minute. No signup required.</p>
        </div>

      </div>
    </ArticleLayout>
  );
}
