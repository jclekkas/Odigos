import { useEffect } from "react";
import { setSeoMeta } from "@/lib/seo";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export default function Terms() {
  useEffect(() => {
    setSeoMeta({
      title: "Terms of Service | Odigos",
      description: "Terms of Service for Odigos — independent dealer quote analysis. Read about acceptable use, disclaimers, and limitations of liability.",
      path: "/terms",
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="py-12 md:py-20 px-6">
        <article className="max-w-2xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 leading-tight">
            Terms of Service
          </h1>
          <p className="text-sm text-muted-foreground mb-10">Last updated: March 28, 2026</p>

          <div className="space-y-10 text-base leading-relaxed">

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">About Odigos</h2>
              <p className="text-muted-foreground">
                Odigos is an independent tool that analyzes dealer quotes for pricing transparency issues — including undisclosed fees, add-ons, and common sales tactics. Odigos is not affiliated with any dealership, manufacturer, lender, or automotive industry group.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">Not legal or financial advice</h2>
              <p className="text-muted-foreground mb-3">
                The analysis and information provided by Odigos is for informational purposes only. It does not constitute legal, financial, mechanical, or professional advice of any kind.
              </p>
              <p className="text-muted-foreground">
                Odigos is not a licensed attorney, financial advisor, or consumer protection agency. Nothing in the analysis should be treated as a legal opinion, a guarantee of your rights, or a recommendation to take or avoid any specific action. Consult a licensed attorney or financial professional before making decisions based on any information provided here.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">No guarantee of accuracy</h2>
              <p className="text-muted-foreground mb-3">
                Odigos uses automated analysis to evaluate submitted dealer quotes. This analysis may be incomplete, incorrect, or outdated. Dealer fees, regulations, and practices vary by state, dealership, and time.
              </p>
              <p className="text-muted-foreground">
                We do not guarantee that the analysis is accurate, complete, or applicable to your specific situation. Odigos is provided "as is" without warranties of any kind, express or implied.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">Limitation of liability</h2>
              <p className="text-muted-foreground mb-3">
                To the fullest extent permitted by applicable law, Odigos and its operators shall not be liable for any direct, indirect, incidental, consequential, or punitive damages arising from:
              </p>
              <ul className="space-y-2 text-muted-foreground ml-4">
                <li className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground flex-shrink-0" />
                  <span>Your use of or reliance on any analysis, information, or content provided by Odigos</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground flex-shrink-0" />
                  <span>Any errors, omissions, or inaccuracies in the analysis</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground flex-shrink-0" />
                  <span>Any decisions you make in connection with purchasing or leasing a vehicle</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground flex-shrink-0" />
                  <span>Interruptions, downtime, or unavailability of the service</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">Data license grant</h2>
              <p className="text-muted-foreground mb-3">
                By submitting any vehicle pricing information, dealer communications, or related content ("Submission") to Odigos, you grant Odigos a perpetual, irrevocable, worldwide, non-exclusive, royalty-free license to use, store, process, analyze, aggregate, and commercialize derived structured data generated from your Submission for any lawful purpose, including but not limited to analytics, benchmarking, research, and commercial products and services.
              </p>
              <p className="text-muted-foreground mb-3">
                This license applies only to derived, anonymized, and aggregated data signals, such as fee types, pricing components, deal scores, negotiation tactics, and geographic indicators (e.g., state-level data).
              </p>
              <p className="text-muted-foreground mb-3">
                For clarity, this license does not apply to:
              </p>
              <ul className="space-y-2 text-muted-foreground ml-4 mb-3">
                <li className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground flex-shrink-0" />
                  <span>Raw submitted content, including uploaded images, screenshots, or pasted dealer communications</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground flex-shrink-0" />
                  <span>Personally identifiable information (PII)</span>
                </li>
              </ul>
              <p className="text-muted-foreground">
                Odigos does not sell or share raw Submissions or personally identifiable information. All commercial use is limited to anonymized, aggregated insights that cannot reasonably be used to identify any individual user or specific transaction.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">User responsibilities</h2>
              <p className="text-muted-foreground mb-3">
                By using Odigos, you agree to the following:
              </p>
              <ul className="space-y-2 text-muted-foreground ml-4">
                <li className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground flex-shrink-0" />
                  <span>You will use Odigos only for lawful, personal purposes related to evaluating your own dealer quotes.</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground flex-shrink-0" />
                  <span>You will not submit content that includes the personal information of others without their consent.</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground flex-shrink-0" />
                  <span>You will not attempt to reverse-engineer, scrape, or abuse the service in a way that degrades its availability for others.</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground flex-shrink-0" />
                  <span>You will independently verify any analysis before acting on it, and consult professionals where appropriate.</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">Third-party services</h2>
              <p className="text-muted-foreground">
                Odigos uses third-party services including OpenAI for analysis. Use of this service is also subject to OpenAI's terms of use. We are not responsible for the availability, accuracy, or actions of third-party providers.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">Governing law</h2>
              <p className="text-muted-foreground">
                These terms are governed by the laws of the United States. Any disputes arising from use of Odigos shall be resolved in accordance with applicable federal and state law. If any provision of these terms is found to be unenforceable, the remaining provisions will continue in full force and effect.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">Changes to these terms</h2>
              <p className="text-muted-foreground">
                We may update these terms from time to time. If we make material changes, we will update the date at the top of this page. Continued use of Odigos after a change constitutes acceptance of the updated terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">Contact</h2>
              <p className="text-muted-foreground">
                Questions about these terms can be directed to{" "}
                <a href="mailto:privacy@odigos.app" className="underline text-foreground">privacy@odigos.app</a>.
              </p>
            </section>

          </div>
        </article>
      </main>

      <SiteFooter />
    </div>
  );
}
