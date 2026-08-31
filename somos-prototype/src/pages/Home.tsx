import { Link } from 'react-router-dom';
import { Seo } from '@/lib/seo';
import { organizationJsonLd, faqJsonLd } from '@/lib/jsonld';
import { Button } from '@/components/Button';
import { Container, Section, SectionHeading, Eyebrow } from '@/components/Primitives';
import { Photo } from '@/components/Photo';
import { Reveal } from '@/components/Reveal';
import { TrustStrip } from '@/components/TrustStrip';
import { ProgramCard, LocationCard, TestimonialCard } from '@/components/Cards';
import { CTASection } from '@/components/CTASection';
import { programs, montessoriPillars } from '@/data/programs';
import { testimonials, dayMoments, generalFaqs } from '@/data/content';
import { locations } from '@/data/locations';

export default function Home() {
  return (
    <>
      <Seo
        title="Bilingual Montessori Preschool | Somos Early Learning Maryland"
        description="Bilingual Montessori early learning for children ages 2–5 in Germantown and Ellicott City, Maryland. Schedule a tour of a Somos school."
        path="/"
        jsonLd={[organizationJsonLd(), faqJsonLd(generalFaqs)]}
      />

      {/* ---------------------------------------------------------------- hero */}
      <section className="relative overflow-hidden bg-cream-50">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-40 -top-52 h-[34rem] w-[34rem] rounded-full bg-ochre-100/60 blur-3xl"
        />
        <Container className="relative pb-16 pt-8 sm:pt-12 lg:pb-24 lg:pt-16">
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,47%)_minmax(0,53%)] lg:gap-16">
            <div className="order-2 lg:order-1">
              <Eyebrow>Bilingual • Montessori • Ages 2–5</Eyebrow>
              <h1 className="mt-5 text-display-xl">
                Growing curious, confident children — together.
              </h1>
              <p className="lede mt-6 max-w-xl">
                Somos Early Learning combines Montessori education, bilingual learning
                and a deeply caring community to help young children become
                independent, capable and excited to learn.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Button to="/admissions" size="lg" withArrow>
                  Schedule a Tour
                </Button>
                <Button to="/locations" variant="secondary" size="lg">
                  Find Your School
                </Button>
              </div>
              <div className="mt-9 flex flex-wrap items-center gap-x-3 gap-y-2 text-[0.92rem] text-ink-muted">
                <span
                  aria-hidden="true"
                  className="inline-flex h-2 w-2 rounded-full bg-sage-600"
                />
                <span>Two Maryland schools —</span>
                {locations.map((loc, i) => (
                  <span key={loc.slug} className="flex items-center gap-3">
                    {i > 0 ? (
                      <span aria-hidden="true" className="text-ink-soft/60">
                        •
                      </span>
                    ) : null}
                    <Link
                      to={`/locations/${loc.slug}`}
                      className="font-semibold text-ink underline decoration-ink/25 underline-offset-4 transition-colors hover:decoration-clay-600 hover:text-clay-700"
                    >
                      {loc.city}
                    </Link>
                  </span>
                ))}
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="relative">
                <Photo
                  id="home-hero"
                  ratio="16/11"
                  priority
                  className="shadow-lift lg:aspect-[1/1]"
                  imgClassName="scale-[1.01]"
                />
                <div className="absolute -bottom-6 left-5 hidden max-w-[15rem] rounded-card border border-ink/10 bg-cream-50 p-5 shadow-soft sm:block lg:-left-8">
                  <p className="font-display text-[1.06rem] leading-snug">
                    “Ayúdame a hacerlo por mí mismo.”
                  </p>
                  <p className="mt-2 text-[0.83rem] leading-snug text-ink-muted">
                    Help me to do it myself — the idea the whole classroom is built on.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <TrustStrip />

      {/* ------------------------------------------------------------ intro */}
      <Section tone="cream" spacing="default">
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <Reveal className="relative order-2 lg:order-1">
              <Photo id="home-intro" ratio="4/5" className="shadow-soft" />
              <div className="absolute -bottom-10 -right-4 hidden w-40 sm:block lg:-right-10 lg:w-52">
                <Photo id="home-intro-detail" ratio="1/1" className="border-[6px] border-cream-50 shadow-lift" />
              </div>
            </Reveal>

            <Reveal className="order-1 lg:order-2">
              <SectionHeading
                eyebrow="Why families choose Somos"
                title="More than preschool. A foundation for life."
                size="lg"
              />
              <p className="mt-6 max-w-prose leading-relaxed text-ink-muted">
                Children don’t just prepare for kindergarten here. They practise doing
                things for themselves, communicating with others, solving problems and
                discovering how capable they really are.
              </p>
              <ul className="mt-8 grid gap-x-8 gap-y-4 sm:grid-cols-2">
                {[
                  'Independence',
                  'Confidence',
                  'Curiosity',
                  'Communication',
                  'Responsibility',
                  'Respect for others',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sage-100 text-sage-700"
                    >
                      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m3.5 8.4 3 3 6-6.8" />
                      </svg>
                    </span>
                    <span className="font-medium text-ink">{item}</span>
                  </li>
                ))}
              </ul>
              <Button to="/approach" variant="secondary" className="mt-9" withArrow>
                Discover the Somos Approach
              </Button>
            </Reveal>
          </div>
        </Container>
      </Section>

      {/* -------------------------------------------------------- bilingual */}
      <Section tone="sand">
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-20">
            <Reveal>
              <div className="relative">
                <Photo id="home-bilingual" ratio="4/3" className="shadow-soft" />
                <div className="absolute -bottom-12 right-6 hidden w-44 lg:block">
                  <Photo id="home-bilingual-detail" ratio="1/1" className="border-[6px] border-cream-100 shadow-lift" />
                </div>
              </div>
            </Reveal>

            <Reveal delay={80}>
              <SectionHeading
                eyebrow="Bilingual learning"
                title="Two languages. One connected community."
                size="lg"
              />
              <p className="mt-6 max-w-prose leading-relaxed text-ink-muted">
                Spanish isn’t a subject at Somos — it is part of the ordinary day. It
                lives in greetings at the door, songs before lunch, counting on the
                stairs and the conversations children have while they work.
              </p>
              <figure className="mt-8 border-l-2 border-clay-500 pl-6">
                <blockquote className="font-display text-[1.25rem] leading-snug text-ink">
                  Young children learn language through relationships, repetition, songs,
                  conversation and everyday experiences.
                </blockquote>
              </figure>
              <p className="mt-6 max-w-prose leading-relaxed text-ink-muted">
                We don’t promise fluency. What we do build is comprehension, comfort with
                the sounds and rhythm of another language, and an easy familiarity with
                cultures beyond a child’s own — the things that make learning a language
                later feel natural rather than difficult.
              </p>
              <Button to="/approach#bilingual" variant="secondary" className="mt-9" withArrow>
                Explore Bilingual Learning
              </Button>
            </Reveal>
          </div>
        </Container>
      </Section>

      {/* ------------------------------------------------------- montessori */}
      <Section tone="cream">
        <Container>
          <Reveal>
            <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-end">
              <SectionHeading
                eyebrow="The Montessori classroom"
                title="Learning by doing."
                size="lg"
              />
              <p className="max-w-prose leading-relaxed text-ink-muted lg:pb-2">
                Children learn through hands-on materials, purposeful activity and the
                freedom to develop skills at their own pace. Five areas of the classroom
                give that freedom a shape.
              </p>
            </div>
          </Reveal>

          <Reveal className="mt-12">
            <Photo id="home-montessori" ratio="3/1" className="hidden shadow-soft md:block" />
          </Reveal>

          <ol className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:mt-14 lg:grid-cols-5 lg:gap-x-6">
            {montessoriPillars.map((pillar, i) => (
              <Reveal as="li" key={pillar.name} delay={i * 70}>
                <div className="flex items-baseline gap-3 border-t-2 border-clay-200 pt-5">
                  <span className="font-display text-[0.95rem] font-semibold text-clay-600">
                    0{i + 1}
                  </span>
                  <h3 className="text-[1.12rem] font-semibold tracking-[-0.01em] text-ink">
                    {pillar.name}
                  </h3>
                </div>
                <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-muted">
                  {pillar.body}
                </p>
              </Reveal>
            ))}
          </ol>
        </Container>
      </Section>

      {/* ---------------------------------------------------------- programs */}
      <Section tone="white">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Programs"
              title="A place to grow at every stage."
              lede="From a two-year-old’s first morning away from you to a five-year-old reading aloud to a friend."
            />
          </Reveal>
          <div className="mt-12 grid gap-7 md:grid-cols-2 lg:grid-cols-3">
            {programs.map((program, i) => (
              <Reveal key={program.slug} delay={i * 90}>
                <ProgramCard program={program} />
              </Reveal>
            ))}
          </div>
          <p className="mt-8 text-[0.9rem] text-ink-soft">
            Programs and availability may vary by location.
          </p>
        </Container>
      </Section>

      {/* --------------------------------------------------------- locations */}
      <Section tone="sage" id="locations">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Our schools"
              title="Find your Somos."
              lede="Two communities. One approach to helping children thrive."
            />
          </Reveal>
          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            {locations.map((loc, i) => (
              <Reveal key={loc.slug} delay={i * 90}>
                <LocationCard location={loc} />
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* ------------------------------------------------------ testimonials */}
      <Section tone="cream">
        <Container>
          <Reveal>
            <SectionHeading eyebrow="Families" title="Trusted by Somos families." align="center" />
          </Reveal>
          <div className="mt-12 grid gap-7 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <Reveal key={t.quote} delay={i * 90}>
                <TestimonialCard quote={t.quote} attribution={t.attribution} theme={t.theme} />
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* --------------------------------------------------- a day at somos */}
      <Section tone="white">
        <Container>
          <Reveal>
            <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-end">
              <SectionHeading
                eyebrow="A day at Somos"
                title="Childhood should still feel like childhood."
                size="lg"
              />
              <p className="max-w-prose leading-relaxed text-ink-muted lg:pb-2">
                Montessori structure and childhood are not opposites. Between lessons
                there is running, painting, singing, arguing about whose turn it is and
                sitting quietly with a book — and all of it is the learning.
              </p>
            </div>
          </Reveal>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {dayMoments.map((moment, i) => (
              <Reveal key={moment.label} delay={i * 80}>
                <figure className={i % 2 === 1 ? 'lg:mt-12' : ''}>
                  <Photo id={moment.photo} ratio="3/4" className="shadow-soft" />
                  <figcaption className="mt-5">
                    <h3 className="font-display text-[1.3rem]">{moment.label}</h3>
                    <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-muted">
                      {moment.body}
                    </p>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* ------------------------------------------------------------ pre-k */}
      <section className="border-y border-ochre-300/50 bg-ochre-100/60">
        <Container className="py-12 sm:py-14">
          <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <h2 className="text-display-sm">Ask about Pre-K opportunities.</h2>
              <p className="mt-3 leading-relaxed text-ink-muted">
                Somos participates in publicly supported early-learning programming at
                qualifying locations and programs. Availability and eligibility change,
                so contact your preferred school to find out what applies to your family.
              </p>
            </div>
            <Button to="/admissions" variant="secondary" size="lg" className="shrink-0 border-ink/25 bg-cream-50" withArrow>
              Learn About Enrollment
            </Button>
          </div>
        </Container>
      </section>

      <CTASection />
    </>
  );
}
