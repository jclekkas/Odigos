import { Seo } from '@/lib/seo';
import { breadcrumbJsonLd } from '@/lib/jsonld';
import { PageHero } from '@/components/PageHero';
import { Container, Section, SectionHeading } from '@/components/Primitives';
import { Photo } from '@/components/Photo';
import { Button } from '@/components/Button';
import { Reveal } from '@/components/Reveal';
import { CTASection } from '@/components/CTASection';
import { programs, montessoriPillars } from '@/data/programs';
import { cn } from '@/lib/cn';

const SUPPORTING = [
  {
    id: 'bilingual',
    eyebrow: 'Bilingual learning',
    title: 'Spanish as part of the day, not a subject',
    photo: 'programs-bilingual',
    body: [
      'Children hear and use Spanish in the places language actually sticks: greetings, songs, mealtimes, counting, stories and the negotiations of sharing a classroom.',
      'What your child gets is comprehension, an ear for the sounds of another language, and the confidence to try words that are not their own — plus an everyday familiarity with cultures beyond their own home.',
    ],
  },
  {
    id: 'curriculum',
    eyebrow: 'Montessori curriculum',
    title: 'Materials that teach one idea at a time',
    photo: 'programs-primary',
    body: [
      'Each material on the shelf isolates a single concept and shows the child, without an adult saying so, whether they have got it right. That is what lets a four-year-old correct themselves and try again.',
      'What your child gets is the habit of persisting through something difficult — and an early academic foundation built on understanding rather than memorising.',
    ],
  },
  {
    id: 'enrichment',
    eyebrow: 'Enrichment',
    title: 'Art, movement and yoga',
    photo: 'programs-enrichment',
    body: [
      'Real paint and real clay, with no template to copy. Stretching, balancing and breathing that give children a physical way to settle themselves.',
      'What your child gets is a wider vocabulary for expressing themselves, better body awareness, and at least one activity in the week they cannot wait for.',
    ],
  },
  {
    id: 'extended-care',
    eyebrow: 'Extended care',
    title: 'Before-school and after-school care',
    photo: 'programs-extended',
    body: [
      'The hours either side of the school day keep the same calm tone: familiar adults, a settled room and something worth doing rather than a holding pattern.',
      'What your family gets is a day that fits around work without your child experiencing it as a different, louder place at 8am and 5pm.',
    ],
  },
  {
    id: 'summer',
    eyebrow: 'Seasonal',
    title: 'Summer programming',
    photo: 'programs-summer',
    body: [
      'Summer at Somos leans outdoors — water, sand, gardening, art and long stretches of unhurried play, with enough familiar routine that children still feel settled.',
      'Summer offerings vary by year and by location, so ask your school what is planned before you make holiday arrangements.',
    ],
  },
];

export default function Programs() {
  return (
    <>
      <Seo
        title="Montessori Preschool Programs | Somos Early Learning"
        description="Pre-Primary and Primary Montessori programs for children ages 2–5, plus bilingual learning, art, movement, before- and after-school care at Somos Early Learning in Maryland."
        path="/programs"
        jsonLd={[
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Programs', path: '/programs' },
          ]),
        ]}
      />

      <PageHero
        eyebrow="Programs"
        title="Learning designed for how young children grow."
        lede="A two-year-old and a five-year-old need very different things. Somos programs are built around what a child is working on right now — and what comes next."
        photo="programs-hero"
        actions={
          <>
            <Button to="/admissions" size="lg" withArrow>
              Schedule a Tour
            </Button>
            <Button to="/locations" variant="secondary" size="lg">
              See Both Schools
            </Button>
          </>
        }
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Programs', path: '/programs' },
        ]}
      />

      {/* -------------------------------------------------------- progression */}
      <Section tone="cream" spacing="tight">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="The progression"
              title="From first independence to genuine readiness"
              lede="Children usually spend one to two years in Pre-Primary and two to three in Primary. The move between them depends on readiness rather than a birthday alone."
            />
          </Reveal>
          <Reveal className="mt-12">
            <ol className="grid gap-6 md:grid-cols-3">
              {[
                { age: 'Ages 2–3', t: 'Pre-Primary', d: 'Doing things for myself. First words in two languages. Learning that school is a safe place.' },
                { age: 'Ages 3–5', t: 'Primary', d: 'Reading, writing and mathematics through materials — plus leadership inside a mixed-age classroom.' },
                { age: 'Ages 5+', t: 'On to school', d: 'Children leave able to concentrate, manage themselves and join a new classroom with confidence.' },
              ].map((step, i) => (
                <li key={step.t} className="relative rounded-card border border-ink/10 bg-white p-7">
                  <span className="text-[0.78rem] font-bold uppercase tracking-[0.15em] text-sage-700">
                    {step.age}
                  </span>
                  <h3 className="mt-2 font-display text-[1.45rem]">{step.t}</h3>
                  <p className="mt-3 text-[0.96rem] leading-relaxed text-ink-muted">{step.d}</p>
                  {i < 2 ? (
                    <span
                      aria-hidden="true"
                      className="absolute -right-3 top-1/2 hidden h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-clay-600 text-cream-50 md:flex"
                    >
                      <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 10h9M10.5 6l4 4-4 4" />
                      </svg>
                    </span>
                  ) : null}
                </li>
              ))}
            </ol>
          </Reveal>
        </Container>
      </Section>

      {/* ------------------------------------------------------- core programs */}
      {programs.slice(0, 2).map((program, index) => (
        <Section key={program.slug} id={program.slug} tone={index % 2 === 0 ? 'white' : 'sand'}>
          <Container>
            <div
              className={cn(
                'grid items-center gap-12 lg:grid-cols-2 lg:gap-20',
                index % 2 === 1 && 'lg:[&>*:first-child]:order-2'
              )}
            >
              <Reveal>
                <Photo
                  id={index === 0 ? 'programs-pre-primary' : 'programs-primary'}
                  ratio="3/2"
                  className="shadow-soft"
                />
              </Reveal>
              <Reveal delay={80}>
                <p className="eyebrow">{program.ages}</p>
                <h2 className="mt-4 text-display-md">{program.name}</h2>
                <p className="lede mt-5">{program.intro}</p>
                <dl className="mt-9 grid gap-7 sm:grid-cols-2">
                  {program.outcomes.map((outcome) => (
                    <div key={outcome.title}>
                      <dt className="font-semibold text-ink">{outcome.title}</dt>
                      <dd className="mt-2 text-[0.95rem] leading-relaxed text-ink-muted">
                        {outcome.body}
                      </dd>
                    </div>
                  ))}
                </dl>
                {program.day ? (
                  <p className="mt-8 border-l-2 border-clay-500 pl-5 text-[0.96rem] leading-relaxed text-ink-muted">
                    {program.day}
                  </p>
                ) : null}
                <Button to="/admissions" className="mt-9" withArrow>
                  Schedule a Tour
                </Button>
              </Reveal>
            </div>
          </Container>
        </Section>
      ))}

      {/* -------------------------------------------------- five learning areas */}
      <Section tone="cream">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Inside the curriculum"
              title="Five areas, one classroom"
              lede="Every Somos classroom is organised around the same five areas, so a child moving from Pre-Primary to Primary walks into somewhere familiar."
            />
          </Reveal>
          <div className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-x-6">
            {montessoriPillars.map((pillar, i) => (
              <Reveal key={pillar.name} delay={i * 70}>
                <div className="border-t-2 border-clay-200 pt-5">
                  <span className="font-display text-[0.95rem] font-semibold text-clay-600">
                    0{i + 1}
                  </span>
                  <h3 className="mt-1 text-[1.1rem] font-semibold tracking-[-0.01em]">
                    {pillar.name}
                  </h3>
                  <p className="mt-3 text-[0.94rem] leading-relaxed text-ink-muted">{pillar.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* ---------------------------------------------------------- supporting */}
      {SUPPORTING.map((block, i) => (
        <Section key={block.id} id={block.id} tone={i % 2 === 0 ? 'white' : 'sand'} spacing="tight">
          <Container>
            <div
              className={cn(
                'grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16',
                i % 2 === 1 && 'lg:[&>*:first-child]:order-2'
              )}
            >
              <Reveal>
                <Photo id={block.photo} ratio="3/2" className="shadow-soft" />
              </Reveal>
              <Reveal delay={70}>
                <p className="eyebrow">{block.eyebrow}</p>
                <h2 className="mt-4 text-display-sm">{block.title}</h2>
                {block.body.map((para) => (
                  <p key={para} className="mt-4 max-w-prose leading-relaxed text-ink-muted">
                    {para}
                  </p>
                ))}
              </Reveal>
            </div>
          </Container>
        </Section>
      ))}

      {/* -------------------------------------------------------------- notes */}
      <Section tone="cream" spacing="tight">
        <Container>
          <div className="grid gap-8 rounded-card border border-ink/10 bg-white p-8 sm:p-10 lg:grid-cols-3">
            <div>
              <h2 className="font-display text-[1.4rem]">Availability</h2>
              <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-muted">
                Programs and availability may vary by location. The school can tell you
                what is open in each classroom right now.
              </p>
            </div>
            <div>
              <h2 className="font-display text-[1.4rem]">Tuition</h2>
              <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-muted">
                Tuition varies by age, schedule, program and location. Contact your
                preferred Somos school for current tuition and availability.
              </p>
              <Button to="/admissions" variant="quiet" className="mt-3">
                Request Tuition Information
              </Button>
            </div>
            <div>
              <h2 className="font-display text-[1.4rem]">Inclusion</h2>
              <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-muted">
                Somos welcomes children with IFSP and IEP plans. Talk with the school
                about your child’s plan so we can discuss support day to day.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      <CTASection
        title="Come and watch a morning."
        body="Programs read differently on a page than they look in a room full of three-year-olds who are genuinely absorbed. Come and see."
      />
    </>
  );
}
