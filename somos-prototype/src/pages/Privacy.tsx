import { Seo } from '@/lib/seo';
import { Container, Section } from '@/components/Primitives';
import { site } from '@/data/site';

export default function Privacy() {
  return (
    <>
      <Seo
        title="Privacy | Somos Early Learning"
        description="How Somos Early Learning handles information submitted through this website."
        path="/privacy"
      />
      <Section tone="cream">
        <Container>
          <p className="eyebrow">Legal</p>
          <h1 className="mt-5 text-display-lg">Privacy</h1>
          <div className="mt-10 max-w-prose space-y-5 leading-relaxed text-ink-muted">
            <p>
              Somos Early Learning collects only the information families choose to give
              us — typically a name, an email address, a phone number and a few details
              about a child’s age and desired start date — and uses it to arrange visits
              and answer questions.
            </p>
            <p>
              We do not sell personal information. We do not share family details with
              third parties for marketing purposes.
            </p>
            <p>
              The tour request form on this site is a demonstration and does not transmit
              or store any information. Once the form is connected to a live system, this
              page will describe exactly where submissions go, who can see them and how
              long they are kept.
            </p>
            <p>
              To ask what information we hold about your family, or to request that it be
              deleted, email{' '}
              <a
                href={`mailto:${site.email}`}
                className="font-semibold text-clay-700 underline underline-offset-4"
              >
                {site.email}
              </a>
              .
            </p>
          </div>
        </Container>
      </Section>
    </>
  );
}
