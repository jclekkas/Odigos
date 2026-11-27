import { useEffect } from "react";
import { Link } from "wouter";
import { setSeoMeta } from "@/lib/seo";
import ArticleLayout from "@/components/ArticleLayout";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, Database, Mail } from "lucide-react";

export default function About() {
  useEffect(() => {
    setSeoMeta({
      title: "About Odigos — Independent Dealer Quote Analyzer",
      description:
        "Odigos is an independent dealer-quote auditor. It checks disclosure, math, and verified state fee caps. Factory MSRP comparison and independent market valuation are different. Entering a factory window sticker MSRP does not verify market value.",
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
        Independent dealer quote analyzer — no dealership affiliations, no referral fees
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
            You paste a dealer quote — an email, a text message, a photo of a worksheet — and Odigos audits that quote. It does not guess a fair vehicle price. The analysis checks for:
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
            Where a documentation-fee cap is backed by a recorded official citation, Odigos flags a charge above that cap. California's document processing charge is conditional: $85 only for a DMV private industry partner under Vehicle Code § 4456.5, and $70 otherwise. A cap that is not verified is not called a legal violation.
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
            The analysis is free. You get one of four verdicts — GO, PROCEED WITH CAUTION, INSUFFICIENT INFORMATION, or NO-GO — plus the math worksheet, any verified fee-cap finding, and a reply that stays inside those findings. Factory MSRP comparison and independent market valuation are different. You can optionally enter a factory window sticker MSRP to compare the selling price with that sticker. That comparison does not verify market value, and the sticker is not a live market transaction price. Independent market valuation stays unverified unless a separate third-party source is configured.
          </p>
          <p className="text-muted-foreground mb-2">
            No pass, payment, or subscription is required.
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
                State doc-fee caps and tax rates used by the analyzer come from a published rule file covering all 50 states and Washington, D.C. Each state is marked verified, partial, or still needing a source. Where a citation is missing, treat the figure as unverified and confirm it with your state before you rely on it.
              </p>
              <p className="text-sm text-muted-foreground">
                The analyzer does not invent a state's doc-fee cap from model memory. It reads the published rule file. Long-form state guides are written separately and can lag that file.
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
              Check a Quote
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <p className="mt-3 text-sm text-muted-foreground">Takes about a minute. No signup required.</p>
        </div>

      </div>
    </ArticleLayout>
  );
}
