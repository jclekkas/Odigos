import { useEffect } from "react";
import { Link } from "wouter";
import { setSeoMeta } from "@/lib/seo";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import FadeIn from "@/components/FadeIn";

export default function Legal() {
  useEffect(() => {
    return setSeoMeta({
      title: "Legal & Compliance | Odigos",
      description: "Plain-language summary of Odigos terms, privacy practices, data retention, and your rights under CCPA and GDPR.",
      path: "/legal",
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="py-12 md:py-20 px-6">
        <FadeIn>
        <article className="max-w-2xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 leading-tight">
            Legal & Compliance
          </h1>
          <p className="text-sm text-muted-foreground mb-10">Last updated: March 29, 2026</p>

          <div className="space-y-10 text-base leading-relaxed">

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">What Odigos is</h2>
              <p className="text-muted-foreground">
                Odigos is an independent tool that analyzes car dealer quotes to flag undisclosed fees, inflated add-ons, and common sales tactics. We are not affiliated with any dealership, manufacturer, or lender. Nothing we provide is legal or financial advice — always consult a professional before making major decisions.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">Terms of service (plain language)</h2>
              <p className="text-muted-foreground mb-3">
                By using Odigos, you agree to use it only for lawful, personal purposes. Our analysis may be incomplete or incorrect — we make no guarantees of accuracy. We are not liable for decisions you make based on our output.
              </p>
              <p className="text-muted-foreground mb-3">
                When you submit a quote, you grant us a license to use anonymized, aggregated signals derived from it (things like fee types and pricing patterns — not your personal details) to improve our dealer fee database and related products.
              </p>
              <p className="text-muted-foreground">
                Full details:{" "}
                <Link href="/terms" className="underline hover:text-foreground transition-colors" data-testid="link-legal-terms">
                  Terms of Service
                </Link>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">Privacy & data (plain language)</h2>
              <p className="text-muted-foreground mb-3">
                We do not collect your name, email, phone, or full ZIP code. Odigos has no user accounts. When you submit a quote:
              </p>
              <ul className="space-y-2 text-muted-foreground ml-4 mb-3">
                <li className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground flex-shrink-0" />
                  <span>Your submitted text is automatically redacted to remove personal identifiers before any storage.</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground flex-shrink-0" />
                  <span>Redacted text is deleted within 90 days.</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground flex-shrink-0" />
                  <span>Anonymized pricing signals (fee names, deal scores, state-level data) are retained for aggregate research — these cannot identify you.</span>
                </li>
              </ul>
              <p className="text-muted-foreground">
                We do not sell or share raw submissions or personal information.{" "}
                Full details:{" "}
                <Link href="/privacy" className="underline hover:text-foreground transition-colors" data-testid="link-legal-privacy">
                  Privacy Policy
                </Link>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">Data retention</h2>
              <ul className="space-y-2 text-muted-foreground ml-4">
                <li className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground flex-shrink-0" />
                  <span><strong className="text-foreground">Redacted submitted text</strong> — deleted 90 days after submission.</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground flex-shrink-0" />
                  <span><strong className="text-foreground">Anonymized pricing signals</strong> — retained indefinitely for aggregate research. These contain no personal information.</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground flex-shrink-0" />
                  <span><strong className="text-foreground">Cookie & preference data</strong> — stored only in your browser's local storage. Cleared when you clear your browser data.</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">Your data rights (CCPA & GDPR)</h2>
              <p className="text-muted-foreground mb-3">
                Whether you are in California (covered by CCPA) or the European Union (covered by GDPR), you have rights over data that can be linked to you. Because Odigos does not collect personal identifiers, most of the standard rights apply in a limited way — but we are committed to honoring them fully.
              </p>
              <p className="text-muted-foreground mb-3 font-medium text-foreground">Your rights include:</p>
              <ul className="space-y-2 text-muted-foreground ml-4 mb-3">
                <li className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground flex-shrink-0" />
                  <span><strong className="text-foreground">Right to know / access</strong> — You can request information about what data we hold that is associated with your submission.</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground flex-shrink-0" />
                  <span><strong className="text-foreground">Right to deletion</strong> — You can request that we delete your submitted data. Because submissions are not tied to accounts, please provide enough detail (approximate submission time, deal details) for us to locate the record.</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground flex-shrink-0" />
                  <span><strong className="text-foreground">Right to portability</strong> — You can request a copy of data we hold associated with your submission in a machine-readable format.</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground flex-shrink-0" />
                  <span><strong className="text-foreground">Right to opt out of sale</strong> — We do not sell personal data. Anonymized, aggregated derived signals may be used commercially, but these cannot identify you.</span>
                </li>
              </ul>
              <p className="text-muted-foreground">
                To exercise any of these rights, email us at{" "}
                <a href="mailto:privacy@odigosauto.com" className="underline hover:text-foreground transition-colors" data-testid="link-legal-privacy-email">
                  privacy@odigosauto.com
                </a>
                . We will respond within 30 days.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">Contact</h2>
              <p className="text-muted-foreground">
                For privacy requests, data deletion, or legal questions, contact{" "}
                <a href="mailto:privacy@odigosauto.com" className="underline hover:text-foreground transition-colors" data-testid="link-legal-contact-email">
                  privacy@odigosauto.com
                </a>
                .
              </p>
            </section>

          </div>
        </article>
        </FadeIn>
      </main>

      <SiteFooter />
    </div>
  );
}
