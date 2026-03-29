import { useEffect } from "react";
import { setSeoMeta } from "@/lib/seo";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export default function Privacy() {
  useEffect(() => {
    setSeoMeta({
      title: "Privacy Policy | Odigos",
      description: "How Odigos handles submitted dealer quotes, what data is stored, and your rights.",
      path: "/privacy",
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="py-12 md:py-20 px-6">
        <article className="max-w-2xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 leading-tight">
            Privacy Policy
          </h1>
          <p className="text-sm text-muted-foreground mb-10">Last updated: March 28, 2026</p>

          <div className="space-y-10 text-base leading-relaxed">

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">What we collect</h2>
              <p className="text-muted-foreground mb-3">
                When you submit a dealer quote or message for analysis, Odigos processes that text to generate a deal evaluation. We retain two categories of data from each submission:
              </p>
              <ul className="space-y-2 text-muted-foreground ml-4">
                <li className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground flex-shrink-0" />
                  <span><strong className="text-foreground">Derived structured signals</strong> — fee names, detected prices (sale price, OTD price, monthly payment, APR, etc.), deal score, tactic flags, purchase type, and the 2-letter state code derived from your ZIP code prefix. These contain no personal information.</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground flex-shrink-0" />
                  <span><strong className="text-foreground">A PII-redacted version of your submitted text</strong> — retained temporarily for up to 90 days for data quality purposes, then permanently deleted. See "Redaction and temporary storage" below.</span>
                </li>
              </ul>
              <p className="text-muted-foreground mt-3">
                We do not collect your name, email address, phone number, full ZIP code, IP address, or any account information. Odigos has no user accounts.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">Redaction and temporary storage</h2>
              <p className="text-muted-foreground mb-3">
                Before storing any submitted text, Odigos applies automated redaction to remove common personal identifiers: email addresses, phone numbers, SSN patterns, credit card numbers, and salutation first names (e.g., "Hi John" becomes "Hi [NAME]").
              </p>
              <p className="text-muted-foreground mb-3">
                <strong className="text-foreground">Important:</strong> This redaction is best-effort and is not guaranteed to perfectly anonymize every submission. Unusual formatting or patterns not covered by our rules may remain in stored text. Redacted text is retained for up to 90 days to support data quality review, then permanently deleted. We do not use it in aggregate analysis.
              </p>
              <p className="text-muted-foreground">
                Your full ZIP code is used only to derive a 2-letter state code and is never written to our database.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">Why we collect it</h2>
              <p className="text-muted-foreground">
                Derived pricing signals are retained to build a dealer fee transparency dataset. The goal is to help future car buyers identify unfair pricing tactics, benchmark fees by region, and understand how common specific dealer practices are. Anonymized, aggregated, derived signals may be used commercially for purposes including aggregate research, benchmarking, industry analytics, and B2B data products and services. Raw submissions are not sold or shared. Personally identifiable information is not sold or shared. Only anonymized, aggregated, derived signals are used commercially. For more details on how derived data may be used, please refer to the Data license grant section in our Terms of Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">Service providers</h2>
              <p className="text-muted-foreground mb-3">
                Odigos uses the following third-party services to operate:
              </p>
              <ul className="space-y-2 text-muted-foreground ml-4">
                <li className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground flex-shrink-0" />
                  <span>
                    <strong className="text-foreground">OpenAI</strong>
                    {" — submitted text is sent to the OpenAI API for analysis. OpenAI does not use API submissions for model training by default. See "}
                    <a href="https://openai.com/enterprise-privacy" target="_blank" rel="noopener noreferrer" className="underline text-foreground">
                      OpenAI's privacy policy
                    </a>.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground flex-shrink-0" />
                  <span>
                    <strong className="text-foreground">Neon / Replit</strong>
                    {" — structured data is stored in a hosted PostgreSQL database. See "}
                    <a href="https://neon.tech/privacy-policy" target="_blank" rel="noopener noreferrer" className="underline text-foreground">
                      Neon's privacy policy
                    </a>
                    {" and "}
                    <a href="https://replit.com/privacy" target="_blank" rel="noopener noreferrer" className="underline text-foreground">
                      Replit's privacy policy
                    </a>.
                  </span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">Retention</h2>
              <ul className="space-y-2 text-muted-foreground ml-4">
                <li className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground flex-shrink-0" />
                  <span><strong className="text-foreground">Derived structured signals</strong> — retained indefinitely for aggregate research purposes.</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground flex-shrink-0" />
                  <span><strong className="text-foreground">PII-redacted submitted text</strong> — deleted 90 days after submission.</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">Deletion requests</h2>
              <p className="text-muted-foreground">
                If you submitted a dealer quote and want your data removed, contact us at{" "}
                <a href="mailto:privacy@odigos.app" className="underline text-foreground">privacy@odigos.app</a>
                {" with the approximate time and any details about your submission. We will locate and delete the record. Because submissions are not tied to accounts or identifiers, we may ask for enough detail to locate the correct row."}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">Security</h2>
              <p className="text-muted-foreground">
                Data is transmitted using TLS encryption and stored using the security controls provided by our hosting and database providers. All database writes use parameterized ORM queries — no raw SQL strings. Access to the database is not logged or shared externally.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">Your data rights (CCPA &amp; GDPR)</h2>
              <p className="text-muted-foreground mb-3">
                Whether you are in California (covered by the California Consumer Privacy Act) or the European Union (covered by GDPR), you have rights over data that can be linked to you. Because Odigos does not collect personal identifiers or require accounts, most rights apply in a limited way — but we are committed to honoring them fully.
              </p>
              <ul className="space-y-2 text-muted-foreground ml-4 mb-3">
                <li className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground flex-shrink-0" />
                  <span><strong className="text-foreground">Right to know / access</strong> — You may request information about what data we hold that is associated with a submission you made.</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground flex-shrink-0" />
                  <span><strong className="text-foreground">Right to deletion</strong> — You may request that we delete your submitted data. Because submissions are not tied to accounts, please provide enough context (approximate submission time, deal details) for us to locate the record.</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground flex-shrink-0" />
                  <span><strong className="text-foreground">Right to portability</strong> — You may request a copy of any data we hold associated with your submission in a machine-readable format.</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground flex-shrink-0" />
                  <span><strong className="text-foreground">Right to opt out of sale</strong> — We do not sell personal data. Anonymized, aggregated derived signals may be used commercially, but these cannot identify any individual.</span>
                </li>
              </ul>
              <p className="text-muted-foreground">
                To exercise any of these rights, email{" "}
                <a href="mailto:privacy@odigosauto.com" className="underline text-foreground">privacy@odigosauto.com</a>
                {". We will respond within 30 days."}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">Changes to this policy</h2>
              <p className="text-muted-foreground">
                If we make material changes to what we collect or how we use it, we will update the date at the top of this page. Continued use of Odigos after a change constitutes acceptance of the updated policy.
              </p>
            </section>

          </div>
        </article>
      </main>

      <SiteFooter />
    </div>
  );
}
