import { Seo } from '@/lib/seo';
import { breadcrumbJsonLd } from '@/lib/jsonld';
import { PageHero } from '@/components/PageHero';
import { Container, Section, SectionHeading } from '@/components/Primitives';
import { Photo } from '@/components/Photo';
import { Button } from '@/components/Button';
import { Reveal } from '@/components/Reveal';
import { locations } from '@/data/locations';
import { site } from '@/data/site';

export default function Careers() {
  return (
    <>
      <Seo
        title="Careers at Somos Early Learning | Montessori Teaching Jobs in Maryland"
        description="Work at Somos Early Learning — a bilingual Montessori early-learning community with schools in Germantown and Ellicott City, Maryland."
        path="/careers"
        jsonLd={[
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Careers', path: '/careers' },
          ]),
        ]}
      />

      <PageHero
        eyebrow="Careers"
        title="Help children discover what they’re capable of."
        lede="Somos is a small organisation with two schools, which means the people who work here shape it. If that sounds like the job you want, we would like to hear from you."
        photo="careers-hero"
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Careers', path: '/careers' },
        ]}
      />

      <Section tone="white" curve>
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <Reveal>
              <SectionHeading eyebrow="Working here" title="What the job is actually like" size="lg" />
              <p className="mt-6 max-w-prose leading-relaxed text-ink-muted">
                Teaching in a Montessori classroom asks something unusual of an adult: the
                discipline to observe rather than intervene, and the patience to let a
                child take four minutes over something you could do in ten seconds.
              </p>
              <p className="mt-4 max-w-prose leading-relaxed text-ink-muted">
                In return you get small groups, colleagues who take early childhood
                seriously, and the chance to watch the same children grow over several
                years rather than one term.
              </p>
              <ul className="mt-8 grid gap-4 sm:grid-cols-2">
                {[
                  'Small-group classrooms',
                  'Bilingual, multicultural teams',
                  'Two Maryland schools',
                  'Work that compounds over years',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-[0.96rem] text-ink-muted">
                    <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-clay-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={80}>
              <Photo id="careers-team" ratio="4/3" className="shadow-soft" />
            </Reveal>
          </div>
        </Container>
      </Section>

      <Section tone="sun" spacing="tight" curve>
        <Container>
          <div className="rounded-card border border-ink/10 bg-white p-8 sm:p-12">
            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
              <div>
                <h2 className="text-display-sm">Current opportunities</h2>
                <p className="mt-4 max-w-prose leading-relaxed text-ink-muted">
                  Open roles are posted here as they become available at each school. If
                  nothing is listed and you think you belong at Somos, write to us anyway
                  — teams like this are usually built from people who got in touch first.
                </p>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <Button href={`mailto:${site.email}?subject=Careers%20at%20Somos`} withArrow>
                    View Opportunities
                  </Button>
                  <Button href={`mailto:${site.email}`} variant="secondary">
                    Send an introduction
                  </Button>
                </div>
              </div>
              <div className="rounded-card bg-cream-100 p-6">
                <h3 className="text-[0.78rem] font-bold uppercase tracking-[0.15em] text-ink-soft">
                  Hiring at
                </h3>
                <ul className="mt-4 space-y-4">
                  {locations.map((loc) => (
                    <li key={loc.slug}>
                      <p className="font-semibold">{loc.city}</p>
                      <a
                        href={`tel:${loc.phone.replace(/\D/g, '')}`}
                        className="inline-flex min-h-[40px] items-center text-[0.95rem] text-clay-700 underline-offset-4 hover:underline"
                      >
                        {loc.phone}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
