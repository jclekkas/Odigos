import { Seo } from '@/lib/seo';
import { breadcrumbJsonLd, faqJsonLd } from '@/lib/jsonld';
import { PageHero } from '@/components/PageHero';
import { Container, Section, SectionHeading } from '@/components/Primitives';
import { Photo } from '@/components/Photo';
import { Button } from '@/components/Button';
import { Reveal } from '@/components/Reveal';
import { FAQAccordion } from '@/components/FAQAccordion';
import { CTASection } from '@/components/CTASection';
import { montessoriPillars } from '@/data/programs';
import { generalFaqs } from '@/data/content';
import { PILLAR_ACCENTS } from '@/lib/accents';
import { cn } from '@/lib/cn';

const PRINCIPLE_TONES = ['white', 'sage', 'white', 'blossom'] as const;

const PRINCIPLES = [
  {
    id: 'prepared',
    photo: 'approach-prepared',
    eyebrow: 'The prepared environment',
    title: 'A room a child can run without asking',
    body: [
      'Everything sits at child height: real glass, real jugs, real brushes, arranged in order on open shelves. Nothing has to be requested from an adult.',
      'What that produces is not tidiness for its own sake. It is a child who can decide what to do, get it, do it and put it back — dozens of small decisions a day that add up to genuine self-reliance.',
    ],
  },
  {
    id: 'guide',
    photo: 'approach-guide',
    eyebrow: 'The role of the teacher',
    title: 'Show once, then step back',
    body: [
      'A Somos teacher spends more time watching than talking. They demonstrate a material carefully, then leave the child to repeat it — including the parts they get wrong.',
      'Stepping in too quickly is the fastest way to teach a child that hard things need an adult. Waiting is how they learn that hard things need another try.',
    ],
  },
  {
    id: 'bilingual',
    photo: 'programs-bilingual',
    eyebrow: 'Bilingual by design',
    title: 'Two languages, one classroom',
    body: [
      'Spanish is present in the ordinary business of the day — arrival, songs, snack, counting, stories, tidying up. Children map words onto things they are already doing, which is how first languages are learned too.',
      'We are careful about what we promise. Preschool Spanish exposure builds comprehension, comfort and cultural connection. Fluency depends on what happens over many more years than these.',
    ],
  },
  {
    id: 'community',
    photo: 'approach-community',
    eyebrow: 'Mixed ages',
    title: 'Children who teach each other',
    body: [
      'In a mixed-age classroom, a five-year-old shows a three-year-old how to roll a mat. Explaining something is the surest test of understanding it, and being helped by someone only slightly older is far less intimidating than being corrected by an adult.',
      'It also builds the social vocabulary parents notice at home: waiting, offering, apologising, asking again more kindly.',
    ],
  },
];

export default function Approach() {
  return (
    <>
      <Seo
        title="Our Montessori & Bilingual Approach | Somos Early Learning"
        description="How Somos Early Learning combines Montessori practice with everyday bilingual learning — the prepared environment, the teacher's role, mixed-age classrooms and what children take from it."
        path="/approach"
        jsonLd={[
          faqJsonLd(generalFaqs),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Our Approach', path: '/approach' },
          ]),
        ]}
      />

      <PageHero
        eyebrow="Our approach"
        title="Help me to do it myself."
        lede="Montessori is often described in its own vocabulary. Here is what it actually looks like in a Somos classroom — and what it gives a child who spends three years in one."
        photo="approach-hero"
        actions={
          <Button to="/admissions" size="lg" withArrow>
            Schedule a Tour
          </Button>
        }
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Our Approach', path: '/approach' },
        ]}
      />

      <Section tone="sun" spacing="tight" curve>
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="The short version"
              title="Children learn by doing real things, at their own pace, with someone who knows them well."
              size="lg"
            />
          </Reveal>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {[
              {
                t: 'Long, uninterrupted time',
                d: 'A three-hour work period lets a child go deep instead of being moved on every twenty minutes. Concentration is a skill, and it needs room to develop.',
              },
              {
                t: 'Freedom inside clear limits',
                d: 'Children choose their work, where to sit and who to sit with. What they cannot choose is to disturb someone else’s work — the one rule that makes the rest possible.',
              },
              {
                t: 'Progress you can see',
                d: 'Because materials are self-correcting, children know when they have got something right without waiting to be told. Confidence follows competence, not praise.',
              },
            ].map((item, i) => (
              <Reveal key={item.t} delay={i * 80}>
                <div className="h-full border-t-2 border-clay-200 pt-6">
                  <h3 className="text-[1.16rem] font-semibold tracking-[-0.01em]">{item.t}</h3>
                  <p className="mt-3 text-[0.96rem] leading-relaxed text-ink-muted">{item.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {PRINCIPLES.map((block, i) => (
        <Section key={block.id} id={block.id} tone={PRINCIPLE_TONES[i % PRINCIPLE_TONES.length]} curve>
          <Container>
            <div
              className={cn(
                'grid items-center gap-12 lg:grid-cols-2 lg:gap-20',
                i % 2 === 1 && 'lg:[&>*:first-child]:order-2'
              )}
            >
              <Reveal>
                <Photo id={block.photo} ratio="4/3" className="shadow-soft" />
              </Reveal>
              <Reveal delay={70}>
                <p className="eyebrow">{block.eyebrow}</p>
                <h2 className="mt-4 text-display-md">{block.title}</h2>
                {block.body.map((para) => (
                  <p key={para} className="mt-5 max-w-prose leading-relaxed text-ink-muted">
                    {para}
                  </p>
                ))}
              </Reveal>
            </div>
          </Container>
        </Section>
      ))}

      <Section tone="sky" curve>
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="The five areas"
              title="What is on the shelves"
              lede="Every Somos classroom is organised the same way, so the room itself becomes predictable enough for a child to take risks inside it."
            />
          </Reveal>
          <div className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-x-6">
            {montessoriPillars.map((pillar, i) => (
              <Reveal key={pillar.name} delay={i * 70}>
                <div className={cn('border-t-[3px] pt-5', PILLAR_ACCENTS[i % PILLAR_ACCENTS.length].border)}>
                  <h3 className="text-[1.1rem] font-semibold text-ink">{pillar.name}</h3>
                  <p className="mt-3 text-[0.94rem] leading-relaxed text-ink-muted">
                    {pillar.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      <Section tone="white" curve>
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
            <Reveal>
              <SectionHeading eyebrow="Questions" title="What parents ask us" size="md" />
              <p className="mt-5 max-w-prose leading-relaxed text-ink-muted">
                If your question is not here, ask it on a tour — or call the school
                directly. Nobody minds a long list.
              </p>
            </Reveal>
            <Reveal delay={80}>
              <FAQAccordion items={generalFaqs} />
            </Reveal>
          </div>
        </Container>
      </Section>

      <CTASection
        title="Twenty minutes in a classroom explains more than this page can."
        body="Come and watch what children do when nobody is telling them what to do next."
      />
    </>
  );
}
