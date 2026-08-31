import { Seo } from '@/lib/seo';
import { breadcrumbJsonLd, schoolJsonLd } from '@/lib/jsonld';
import { PageHero } from '@/components/PageHero';
import { Container, Section, SectionHeading } from '@/components/Primitives';
import { LocationCard } from '@/components/Cards';
import { Reveal } from '@/components/Reveal';
import { CTASection } from '@/components/CTASection';
import { Button } from '@/components/Button';
import { locations } from '@/data/locations';

export default function LocationsPage() {
  return (
    <>
      <Seo
        title="Our Schools in Germantown & Ellicott City | Somos Early Learning"
        description="Somos Early Learning has two bilingual Montessori schools in Maryland — Germantown in Montgomery County and Ellicott City in Howard County. Find the one near you."
        path="/locations"
        jsonLd={[
          ...locations.map(schoolJsonLd),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Locations', path: '/locations' },
          ]),
        ]}
      />

      <PageHero
        eyebrow="Our schools"
        title="Find a Somos near you."
        lede="Two Maryland schools sharing one approach — bilingual, Montessori-inspired and built around small groups of children who know each other well."
        photo="locations-hero"
        actions={
          <Button to="/admissions" size="lg" withArrow>
            Schedule a Tour
          </Button>
        }
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Locations', path: '/locations' },
        ]}
      />

      <Section tone="sage" curve>
        <Container>
          <h2 className="sr-only">Our schools</h2>
          <div className="grid gap-8 lg:grid-cols-2">
            {locations.map((loc, i) => (
              <Reveal key={loc.slug} delay={i * 90}>
                <LocationCard location={loc} accentIndex={i + 2} />
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      <Section tone="white" spacing="tight" curve>
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Choosing between them"
              title="Same approach, different neighbourhoods."
              lede="Both schools serve children approximately ages 2–5 across Pre-Primary and Primary classrooms, with before- and after-school care. The right one is usually the one that fits your morning."
            />
          </Reveal>
          <dl className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { t: 'Ages served', d: 'Approximately 2 through 5 at both schools.' },
              { t: 'Languages', d: 'English and Spanish woven through the whole day.' },
              { t: 'Extended care', d: 'Before- and after-school care at both locations.' },
              { t: 'Availability', d: 'Openings vary by classroom — ask the school directly.' },
            ].map((item) => (
              <div key={item.t} className="border-t-[3px] border-ochre-500 pt-5">
                <dt className="font-semibold text-ink">{item.t}</dt>
                <dd className="mt-2 text-[0.95rem] leading-relaxed text-ink-muted">{item.d}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </Section>

      <CTASection
        title="Not sure which school fits your family?"
        body="Tell us where you are and roughly when you would like to start — we will point you to the right school and find you a time to visit."
        secondaryLabel="See Our Programs"
        secondaryTo="/programs"
      />
    </>
  );
}
