import { Seo } from '@/lib/seo';
import { breadcrumbJsonLd, organizationJsonLd } from '@/lib/jsonld';
import { PageHero } from '@/components/PageHero';
import { Container, Section, SectionHeading } from '@/components/Primitives';
import { Photo } from '@/components/Photo';
import { Button } from '@/components/Button';
import { Reveal } from '@/components/Reveal';
import { CTASection } from '@/components/CTASection';
import { locations } from '@/data/locations';

const VALUES = [
  {
    t: 'Somos means “we are”',
    d: 'The name is a statement about belonging. Children, teachers and families are one community, and the classroom only works when all three are in it.',
  },
  {
    t: 'Respect, in both directions',
    d: 'Adults speak to two-year-olds the way they would like to be spoken to: slowly, honestly and without doing things for them that they can do themselves.',
  },
  {
    t: 'Two languages, many cultures',
    d: 'Spanish and English share the day, and the families in our classrooms bring far more than two cultures with them. That mix is the point, not a feature.',
  },
  {
    t: 'Childhood is not preparation',
    d: 'These years matter in themselves. We are not rushing children toward the next thing at the expense of the one they are in.',
  },
];

export default function About() {
  return (
    <>
      <Seo
        title="About Somos Early Learning | Bilingual Montessori in Maryland"
        description="The story behind Somos Early Learning — a bilingual Montessori community for children ages 2–5, now with two Maryland schools in Germantown and Ellicott City."
        path="/about"
        jsonLd={[
          organizationJsonLd(),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'About', path: '/about' },
          ]),
        ]}
      />

      <PageHero
        eyebrow="About us"
        title="A community built around children, families and two languages."
        lede="Somos began as one school and one idea: that young children are far more capable than we usually let them be. Today that idea runs two Maryland classrooms."
        photo="about-hero"
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'About', path: '/about' },
        ]}
      />

      <Section tone="white" curve>
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <Reveal>
              <SectionHeading eyebrow="Our story" title="One idea, two schools" size="lg" />
              <p className="mt-6 max-w-prose leading-relaxed text-ink-muted">
                Somos grew the way good schools usually do — not through a plan to expand,
                but because families kept asking whether there was a Somos closer to them.
              </p>
              <p className="mt-4 max-w-prose leading-relaxed text-ink-muted">
                What travels between the two schools is not a brand manual. It is a way of
                working: small groups, long stretches of concentration, real materials,
                Spanish and English side by side, and teachers who would rather watch a
                child struggle productively than solve it for them.
              </p>
              <p className="mt-4 max-w-prose leading-relaxed text-ink-muted">
                Each school has its own character, its own neighbourhood and its own
                families. What they share is what happens between nine and noon.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                {locations.map((loc) => (
                  <Button key={loc.slug} to={`/locations/${loc.slug}`} variant="secondary" size="sm">
                    {loc.city}
                  </Button>
                ))}
              </div>
            </Reveal>
            <Reveal delay={80}>
              <Photo id="about-story" ratio="4/3" className="shadow-soft" />
            </Reveal>
          </div>
        </Container>
      </Section>

      <Section tone="sun" curve>
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="What we believe"
              title="Four things we keep coming back to"
            />
          </Reveal>
          <div className="mt-12 grid gap-8 sm:grid-cols-2">
            {VALUES.map((value, i) => (
              <Reveal key={value.t} delay={i * 70}>
                <div className="h-full rounded-card bg-white p-8 shadow-soft">
                  <h3 className="font-display text-[1.35rem]">{value.t}</h3>
                  <p className="mt-3 leading-relaxed text-ink-muted">{value.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* Reserved for verified biography and professional photography. */}
      <Section tone="white" curve>
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <Reveal>
              <Photo id="about-founder" ratio="4/5" className="shadow-soft" />
            </Reveal>
            <Reveal delay={80}>
              <SectionHeading eyebrow="Leadership" title="The founder’s story" size="md" />
              <p className="mt-6 max-w-prose leading-relaxed text-ink-muted">
                Every school of this kind starts with someone who decided the existing
                options were not good enough. This section is where that story belongs —
                in their own words, with a portrait taken in the classroom rather than a
                studio.
              </p>
              <div className="mt-8 rounded-card border border-dashed border-ink/25 bg-cream-100 p-6">
                <h3 className="text-[0.78rem] font-bold uppercase tracking-[0.15em] text-ink-soft">
                  To be supplied by Somos
                </h3>
                <ul className="mt-4 space-y-2.5 text-[0.95rem] leading-relaxed text-ink-muted">
                  <li>— A short biography, verified, in the founder’s own voice</li>
                  <li>— Montessori training and professional background</li>
                  <li>— Why Somos started, and why bilingual education specifically</li>
                  <li>— A professional portrait, ideally photographed in a classroom</li>
                </ul>
                <p className="mt-4 text-[0.88rem] leading-relaxed text-ink-soft">
                  Left deliberately blank rather than filled with invented detail.
                </p>
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>

      <Section tone="grass" curve>
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            <Reveal>
              <Photo id="about-community" ratio="16/9" className="shadow-soft" />
            </Reveal>
            <Reveal delay={70}>
              <SectionHeading
                eyebrow="Families"
                title="A school is the people in it"
                size="md"
              />
              <p className="mt-5 max-w-prose leading-relaxed text-ink-muted">
                Somos families come from many places and speak many languages at home.
                That is not a diversity statement — it is a description of the room. It
                is also why children here treat difference as unremarkable.
              </p>
              <Button to="/families" variant="secondary" className="mt-8" withArrow>
                For Somos Families
              </Button>
            </Reveal>
          </div>
        </Container>
      </Section>

      <CTASection
        title="Come and meet us."
        body="The best introduction to Somos is a morning in one of our classrooms."
      />
    </>
  );
}
