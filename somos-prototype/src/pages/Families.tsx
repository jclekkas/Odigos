import { Seo } from '@/lib/seo';
import { breadcrumbJsonLd } from '@/lib/jsonld';
import { PageHero } from '@/components/PageHero';
import { Container, Section, SectionHeading } from '@/components/Primitives';
import { Photo } from '@/components/Photo';
import { Reveal } from '@/components/Reveal';
import { FAQAccordion } from '@/components/FAQAccordion';
import { CTASection } from '@/components/CTASection';
import { locations } from '@/data/locations';

const DAY = [
  { time: 'Morning', t: 'Arrival and settling in', d: 'Children are greeted by name, hang up their own coats and choose where to begin. Goodbyes are short and predictable, which is what makes them easier.' },
  { time: 'Mid-morning', t: 'The work period', d: 'The long stretch at the heart of the day. Individual and small-group lessons, self-chosen work, and a teacher moving quietly between children.' },
  { time: 'Late morning', t: 'Group time and outdoors', d: 'Songs, stories and conversation in both languages, then outside to run, climb and dig whenever the weather allows.' },
  { time: 'Midday', t: 'Lunch and rest', d: 'Children serve themselves where they can, eat together, and clear their own places. Younger children rest; older ones move to quieter work.' },
  { time: 'Afternoon', t: 'Enrichment and extended care', d: 'Art, movement, Spanish and continued classroom work, flowing into after-school care for families who need it.' },
];

const FAMILY_FAQS = [
  {
    q: 'How will I know how my child’s day went?',
    a: 'Teachers share what your child chose to work on, who they spent time with and anything worth knowing. Ask for specifics — a good answer is about what your child did, not how the class behaved.',
  },
  {
    q: 'What should my child wear?',
    a: 'Clothes that can get painted on and shoes they can put on themselves. Independence is hard in buckles a three-year-old cannot manage.',
  },
  {
    q: 'What about drop-off tears?',
    a: 'Short, warm and predictable goodbyes work better than long ones. Teachers will tell you honestly how long the tears lasted after you left — usually less time than you fear.',
  },
  {
    q: 'How can we support the approach at home?',
    a: 'Let your child do slow things themselves: pouring, dressing, carrying, wiping up spills. It takes longer in the moment and saves years later.',
  },
  {
    q: 'Do you speak Spanish with parents too?',
    a: 'Yes. Our teams communicate with families in English and Spanish. Tell the school which you prefer.',
  },
];

export default function Families() {
  return (
    <>
      <Seo
        title="For Somos Families | Somos Early Learning"
        description="What a day looks like at Somos Early Learning, how we communicate with families, and practical answers for parents of children ages 2–5 in Maryland."
        path="/families"
        jsonLd={[
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Families', path: '/families' },
          ]),
        ]}
      />

      <PageHero
        eyebrow="Families"
        title="What the day actually looks like."
        lede="Practical answers for the things parents genuinely wonder about — the shape of the day, drop-off, communication and how to support the approach at home."
        photo="families-hero"
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Families', path: '/families' },
        ]}
      />

      <Section tone="white" curve>
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="A Somos day"
              title="Predictable enough to feel safe. Open enough to follow a child."
              lede="Exact times vary by school and classroom, but the rhythm is the same everywhere."
            />
          </Reveal>
          <ol className="mt-12 space-y-0 border-t border-ink/10">
            {DAY.map((item, i) => (
              <Reveal as="li" key={item.t} delay={i * 60}>
                <div className="grid gap-2 border-b border-ink/10 py-7 sm:grid-cols-[9rem_1fr] sm:gap-8">
                  <span className="text-[0.8rem] font-extrabold uppercase tracking-[0.14em] text-grass-700 sm:pt-1">
                    {item.time}
                  </span>
                  <div>
                    <h3 className="font-display text-[1.3rem]">{item.t}</h3>
                    <p className="mt-2 max-w-prose leading-relaxed text-ink-muted">{item.d}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </ol>
        </Container>
      </Section>

      <Section tone="skyBold" curve>
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <Reveal>
              <Photo id="families-day" ratio="16/9" className="shadow-soft" />
            </Reveal>
            <Reveal delay={70}>
              <SectionHeading eyebrow="Staying in touch" title="How we communicate" size="md" />
              <p className="mt-5 max-w-prose leading-relaxed text-ink-muted">
                Small schools have an advantage: the person who can answer your question
                is usually the person standing at the door. Day-to-day updates happen at
                drop-off and pick-up, with conferences through the year for the longer
                conversation about how your child is developing.
              </p>
              <p className="mt-4 max-w-prose leading-relaxed text-ink-muted">
                Families are welcome in the school — for events, for reading with
                children, and for the ordinary business of being part of a community.
              </p>
            </Reveal>
          </div>
        </Container>
      </Section>

      <Section tone="white" curve>
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
            <Reveal>
              <SectionHeading eyebrow="Good to know" title="Family questions" size="md" />
              <div className="mt-8 space-y-4">
                {locations.map((loc) => (
                  <div key={loc.slug} className="rounded-card border border-ink/10 bg-white p-5">
                    <p className="font-semibold">{loc.city}</p>
                    <a
                      href={`tel:${loc.phone.replace(/\D/g, '')}`}
                      className="mt-1 inline-flex min-h-[44px] items-center text-grass-700 underline-offset-4 hover:underline"
                    >
                      {loc.phone}
                    </a>
                  </div>
                ))}
              </div>
            </Reveal>
            <Reveal delay={70}>
              <FAQAccordion items={FAMILY_FAQS} />
            </Reveal>
          </div>
        </Container>
      </Section>

      <CTASection
        title="Still deciding?"
        body="Come and see a morning. It answers more questions than any list can."
      />
    </>
  );
}
