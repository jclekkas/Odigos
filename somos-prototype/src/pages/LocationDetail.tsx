import { Navigate, useParams } from 'react-router-dom';
import { Seo } from '@/lib/seo';
import { breadcrumbJsonLd, faqJsonLd, schoolJsonLd } from '@/lib/jsonld';
import { Container, Section, SectionHeading } from '@/components/Primitives';
import { Photo } from '@/components/Photo';
import { Button } from '@/components/Button';
import { Reveal } from '@/components/Reveal';
import { FAQAccordion } from '@/components/FAQAccordion';
import { TestimonialCard } from '@/components/Cards';
import { MapPlaceholder, ReviewsPlaceholder } from '@/components/Placeholders';
import { CTASection } from '@/components/CTASection';
import { locationBySlug } from '@/data/locations';
import { programs } from '@/data/programs';
import { montessoriPillars } from '@/data/programs';

export default function LocationDetail() {
  const { slug = '' } = useParams();
  const location = locationBySlug(slug);

  if (!location) return <Navigate to="/locations" replace />;

  const tel = location.phone.replace(/\D/g, '');
  const offered = programs.filter((p) => location.programSlugs.includes(p.slug));

  return (
    <>
      <Seo
        title={location.metaTitle}
        description={location.metaDescription}
        path={`/locations/${location.slug}`}
        jsonLd={[
          schoolJsonLd(location),
          faqJsonLd(location.faqs),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Locations', path: '/locations' },
            { name: location.city, path: `/locations/${location.slug}` },
          ]),
        ]}
      />

      {/* ---------------------------------------------------------------- hero */}
      <section className="bg-cream-50">
        <Container className="pt-8 sm:pt-12">
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex flex-wrap items-center gap-2 text-[0.85rem] text-ink-soft">
              <li>
                <a href="/locations" className="underline-offset-4 hover:text-ink hover:underline">
                  Locations
                </a>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-ink-muted">
                {location.city}
              </li>
            </ol>
          </nav>
          <p className="eyebrow">{location.region}, Maryland</p>
          <h1 className="mt-5 max-w-4xl text-display-lg">{location.name}</h1>
          <p className="lede mt-6 max-w-2xl">{location.heroLede}</p>
        </Container>

        <Container className="mt-10 sm:mt-12">
          <Photo id={location.photos.hero} ratio="21/9" priority className="shadow-soft" />
        </Container>

        <Container className="mt-8">
          <div className="grid gap-6 rounded-card border border-ink/10 bg-white p-7 sm:p-8 lg:grid-cols-[1fr_1fr_auto] lg:items-center lg:gap-10">
            <div>
              <h2 className="text-[0.78rem] font-bold uppercase tracking-[0.15em] text-ink-soft">
                Visit us
              </h2>
              <address className="mt-3 not-italic leading-relaxed text-ink">
                {location.street}
                <br />
                {location.cityStateZip}
              </address>
              <a
                href={`tel:${tel}`}
                className="mt-2 inline-flex min-h-[44px] items-center font-semibold text-coral-700 underline-offset-4 hover:underline"
              >
                {location.phone}
              </a>
            </div>
            <div>
              <h2 className="text-[0.78rem] font-bold uppercase tracking-[0.15em] text-ink-soft">
                Hours &amp; schedules
              </h2>
              <p className="mt-3 max-w-sm text-[0.95rem] leading-relaxed text-ink-muted">
                {location.scheduleNote}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Button to={`/admissions?location=${location.slug}`} withArrow>
                Schedule a Tour
              </Button>
              <Button href={`tel:${tel}`} variant="secondary">
                Call the school
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* ------------------------------------------------------------ welcome */}
      <Section tone="white" curve>
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <Reveal>
              <SectionHeading
                eyebrow={`Welcome to ${location.city}`}
                title={location.welcomeHeading}
                size="lg"
              />
              {location.welcome.map((para) => (
                <p key={para} className="mt-6 max-w-prose leading-relaxed text-ink-muted">
                  {para}
                </p>
              ))}
            </Reveal>
            <Reveal delay={80}>
              <Photo id={location.photos.welcome} ratio="4/3" className="shadow-soft" />
            </Reveal>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {location.highlights.map((item, i) => (
              <Reveal key={item.title} delay={i * 80}>
                <div className="h-full border-t-2 border-coral-200 pt-6">
                  <h3 className="text-[1.16rem] font-semibold tracking-[-0.01em]">{item.title}</h3>
                  <p className="mt-3 text-[0.96rem] leading-relaxed text-ink-muted">{item.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* ----------------------------------------------------------- programs */}
      <Section tone="sunBold" curve>
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Programs at this school"
              title={`What ${location.city} offers`}
              lede="Availability changes through the year. The school can tell you what is open in each classroom right now."
            />
          </Reveal>
          <div className="mt-10 grid gap-7 md:grid-cols-3">
            {offered.map((program, i) => (
              <Reveal key={program.slug} delay={i * 80}>
                <div className="flex h-full flex-col rounded-card border border-ink/10 bg-white p-7">
                  <p className="text-[0.8rem] font-semibold uppercase tracking-[0.13em] text-grass-600">
                    {program.ages}
                  </p>
                  <h3 className="mt-2 font-display text-[1.4rem]">{program.name}</h3>
                  <p className="mt-3 flex-1 text-[0.96rem] leading-relaxed text-ink-muted">
                    {program.cardSummary}
                  </p>
                  <Button to={`/programs#${program.slug}`} variant="quiet" className="mt-5 self-start">
                    {program.cta}
                  </Button>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* ------------------------------------------------------------ gallery */}
      <Section tone="sky" curve>
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Inside the school"
              title={`The ${location.city} classroom`}
              lede="Low shelves, real tools, room to move and quiet corners to work in."
            />
          </Reveal>
          <div className="mt-12 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {location.photos.gallery.map((photo, i) => (
              <Reveal key={photo} delay={i * 70}>
                <Photo id={photo} ratio="4/5" className={i % 2 === 1 ? 'shadow-soft lg:mt-10' : 'shadow-soft'} />
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* --------------------------------------------------------- philosophy */}
      <Section tone="white" curve>
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
            <Reveal>
              <SectionHeading
                eyebrow="Montessori + bilingual"
                title="How the day is built"
                size="lg"
              />
              <p className="mt-6 max-w-prose leading-relaxed text-ink-muted">
                A long, uninterrupted work period sits at the centre of the morning.
                Children choose their work, teachers give individual and small-group
                lessons, and Spanish runs through all of it — not as a lesson, but as a
                second language for ordinary things.
              </p>
              <Button to="/approach" variant="secondary" className="mt-8" withArrow>
                Our full approach
              </Button>
            </Reveal>
            <Reveal delay={80}>
              <ul className="grid gap-6 sm:grid-cols-2">
                {montessoriPillars.map((pillar) => (
                  <li key={pillar.name} className="rounded-card bg-cream-100 p-6">
                    <h3 className="font-semibold text-ink">{pillar.name}</h3>
                    <p className="mt-2 text-[0.93rem] leading-relaxed text-ink-muted">
                      {pillar.body}
                    </p>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </Container>
      </Section>

      {/* -------------------------------------------------------- testimonial */}
      <Section tone="berry" spacing="tight" curve>
        <Container>
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16">
            <Reveal>
              <TestimonialCard
                quote={location.testimonial.quote}
                attribution={location.testimonial.attribution}
              />
            </Reveal>
            <Reveal delay={80}>
              <ReviewsPlaceholder city={location.city} />
            </Reveal>
          </div>
        </Container>
      </Section>

      {/* --------------------------------------------------- admissions + map */}
      <Section tone="white" curve>
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <Reveal>
              <SectionHeading
                eyebrow="Admissions"
                title={`Joining the ${location.city} community`}
                size="md"
              />
              <ol className="mt-8 space-y-7">
                {[
                  {
                    t: 'Request a tour',
                    d: 'Tell us your child’s age and roughly when you would like to start. We will suggest a time when the classroom is in full swing.',
                  },
                  {
                    t: 'Visit the school',
                    d: 'Walk the classroom, meet teachers and watch how children actually spend their morning. Bring your questions.',
                  },
                  {
                    t: 'Talk through the fit',
                    d: 'We discuss classroom placement, schedule options, extended care and any support your child needs — including an IFSP or IEP.',
                  },
                  {
                    t: 'Enrolment',
                    d: 'If it feels right on both sides, we walk you through paperwork, start dates and what to bring on the first day.',
                  },
                ].map((step, i) => (
                  <li key={step.t} className="flex gap-5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-coral-600 font-display text-[0.95rem] font-semibold text-cream-50">
                      {i + 1}
                    </span>
                    <span>
                      <span className="block font-semibold text-ink">{step.t}</span>
                      <span className="mt-1.5 block text-[0.96rem] leading-relaxed text-ink-muted">
                        {step.d}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
              <div className="mt-9 rounded-card border border-ink/10 bg-cream-100 p-6">
                <h3 className="font-semibold text-ink">Tuition &amp; availability</h3>
                <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-muted">
                  Tuition varies by age, schedule, program and location. Contact the{' '}
                  {location.city} school for current tuition and availability.
                </p>
                <Button to={`/admissions?location=${location.slug}`} variant="quiet" className="mt-4">
                  Request Tuition Information
                </Button>
              </div>
            </Reveal>

            <Reveal delay={80}>
              <MapPlaceholder location={location} />
              <div className="mt-8">
                <h3 className="font-display text-[1.35rem]">Questions about {location.city}</h3>
                <FAQAccordion items={location.faqs} className="mt-4" />
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>

      <CTASection
        eyebrow={`Visit ${location.city}`}
        title={`See the ${location.city} classroom for yourself.`}
        body="Meet the teachers, explore the classroom and see how a Somos day feels for your child."
        primaryLabel={`Schedule a ${location.city} Tour`}
        primaryTo={`/admissions?location=${location.slug}`}
        secondaryLabel="Compare Both Schools"
        secondaryTo="/locations"
        photo={location.photos.welcome}
      />
    </>
  );
}
