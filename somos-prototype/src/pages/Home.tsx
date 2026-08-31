import { Link } from 'react-router-dom';
import { Seo } from '@/lib/seo';
import { organizationJsonLd, faqJsonLd } from '@/lib/jsonld';
import { Button } from '@/components/Button';
import { Container, Section, SectionHeading } from '@/components/Primitives';
import { Photo } from '@/components/Photo';
import { Reveal } from '@/components/Reveal';
import { TrustStrip } from '@/components/TrustStrip';
import { ProgramCard, LocationCard, TestimonialCard } from '@/components/Cards';
import { CTASection } from '@/components/CTASection';
import { programs, montessoriPillars } from '@/data/programs';
import { testimonials, dayMoments, generalFaqs } from '@/data/content';
import { locations } from '@/data/locations';
import { PILLAR_ACCENTS } from '@/lib/accents';
import { Squiggle, Star, Dots } from '@/components/Doodles';
import { cn } from '@/lib/cn';

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
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute -right-24 -top-40 h-[30rem] w-[30rem] rounded-full bg-sun-100" />
          <div className="absolute -left-44 top-20 h-[26rem] w-[26rem] rounded-full bg-sky-50" />
          <div className="absolute -bottom-40 left-1/3 h-[24rem] w-[24rem] rounded-full bg-grass-50" />
        </div>

        <Container className="relative pb-14 pt-8 sm:pt-12 lg:pb-20 lg:pt-14">
          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,49%)_minmax(0,51%)] lg:gap-14">
            <div className="order-2 lg:order-1">
              <p className="eyebrow">Bilingual • Montessori • Ages 2–5</p>
              <h1 className="mt-5 text-display-xl">
                Growing{' '}
                <span className="relative whitespace-nowrap text-coral-600">
                  curious
                  <Squiggle className="text-sun-400" />
                </span>
                ,{' '}
                <span className="relative whitespace-nowrap text-sky-600">
                  confident
                  <Squiggle className="text-grass-300" />
                </span>{' '}
                children — together.
              </h1>
              <p className="lede mt-6 max-w-xl">
                Somos Early Learning combines Montessori education, bilingual learning
                and a deeply caring community to help young children become
                independent, capable and excited to learn.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button to="/admissions" size="lg" withArrow>
                  Schedule a Tour
                </Button>
                <Button to="/locations" variant="sunny" size="lg">
                  Find Your School
                </Button>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-2.5">
                <span className="text-[0.92rem] font-semibold text-ink-muted">
                  Two Maryland schools:
                </span>
                {locations.map((loc, i) => (
                  <Link
                    key={loc.slug}
                    to={`/locations/${loc.slug}`}
                    className={cn(
                      'inline-flex min-h-[40px] items-center gap-2 rounded-pill px-4 text-[0.92rem] font-bold transition-transform duration-200 ease-bounce hover:-translate-y-0.5',
                      i === 0 ? 'bg-grass-100 text-grass-700' : 'bg-sky-100 text-sky-700'
                    )}
                  >
                    <span aria-hidden="true" className={cn('h-2 w-2 rounded-full', i === 0 ? 'bg-grass-400' : 'bg-sky-400')} />
                    {loc.city}
                  </Link>
                ))}
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="relative">
                <div
                  aria-hidden="true"
                  className="absolute -inset-4 rotate-[-3deg] rounded-blob bg-sky-200"
                />
                <Photo
                  id="home-hero"
                  ratio="4/3"
                  priority
                  rounded="rounded-blob"
                  className="relative shadow-lift"
                />

                <div className="absolute -bottom-10 -left-4 hidden max-w-[16rem] rounded-card border-2 border-sun-300 bg-white p-5 shadow-lift sm:block lg:-left-16">
                  <p className="font-display text-[1.1rem] font-bold leading-snug text-coral-700">
                    “¡Ayúdame a hacerlo por mí mismo!”
                  </p>
                  <p className="mt-1.5 text-[0.85rem] leading-snug text-ink-muted">
                    Help me to do it myself — the idea the whole classroom is built on.
                  </p>
                </div>

                <Star
                  className="absolute -right-3 -top-6 h-12 w-12 text-berry-300 lg:-right-6 lg:h-16 lg:w-16"
                />
                <Dots
                  className="absolute -bottom-6 right-4 hidden h-12 w-24 text-sky-300 lg:block"
                  rows={3}
                  cols={6}
                />
              </div>
            </div>
          </div>
        </Container>
      </section>

      <TrustStrip />

      {/* ------------------------------------------------------------ intro */}
      <Section tone="white" spacing="default" curve>
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
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-grass-100 text-grass-600"
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
      <Section tone="skyBold" curve>
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
              <figure className="mt-8 rounded-card bg-white/70 p-6">
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
      <Section tone="sun" curve>
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
                <div className="h-full rounded-card bg-white p-6 shadow-soft">
                  <span
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-full font-display text-[0.9rem] font-extrabold',
                      PILLAR_ACCENTS[i % PILLAR_ACCENTS.length].chip
                    )}
                  >
                    0{i + 1}
                  </span>
                  <h3 className="mt-4 font-display text-[1.15rem] font-bold tracking-[-0.01em] text-ink">
                    {pillar.name}
                  </h3>
                  <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-muted">
                    {pillar.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </ol>
        </Container>
      </Section>

      {/* ---------------------------------------------------------- programs */}
      <Section tone="white" curve>
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
                <ProgramCard program={program} accentIndex={i} />
              </Reveal>
            ))}
          </div>
          <p className="mt-8 text-[0.9rem] text-ink-soft">
            Programs and availability may vary by location.
          </p>
        </Container>
      </Section>

      {/* --------------------------------------------------------- locations */}
      <Section tone="grass" id="locations" curve>
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
                <LocationCard location={loc} accentIndex={i + 2} />
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* ------------------------------------------------------ testimonials */}
      <Section tone="berry" curve>
        <Container>
          <Reveal>
            <SectionHeading eyebrow="Families" title="Trusted by Somos families." align="center" />
          </Reveal>
          <div className="mt-12 grid gap-7 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <Reveal key={t.quote} delay={i * 90}>
                <TestimonialCard quote={t.quote} attribution={t.attribution} theme={t.theme} accentIndex={i} />
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* --------------------------------------------------- a day at somos */}
      <Section tone="white" curve>
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
      <section className="border-y border-sun-300/60 bg-sun-100">
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
            <Button to="/admissions" variant="secondary" size="lg" className="shrink-0 border-ink/20 bg-white" withArrow>
              Learn About Enrollment
            </Button>
          </div>
        </Container>
      </section>

      <CTASection />
    </>
  );
}
