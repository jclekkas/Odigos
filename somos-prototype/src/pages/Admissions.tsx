import { Seo } from '@/lib/seo';
import { breadcrumbJsonLd } from '@/lib/jsonld';
import { Container, Section, SectionHeading } from '@/components/Primitives';
import { Photo } from '@/components/Photo';
import { Reveal } from '@/components/Reveal';
import { TourForm } from '@/components/TourForm';
import { FAQAccordion } from '@/components/FAQAccordion';
import { locations } from '@/data/locations';
import { site } from '@/data/site';

const ADMISSIONS_FAQS = [
  {
    q: 'What happens on a tour?',
    a: 'You will walk the classroom while children are working, meet teachers, and have time to ask whatever you need to. Tours usually take around 30–45 minutes. Children are welcome.',
  },
  {
    q: 'When should we apply?',
    a: 'Families often begin looking six to twelve months ahead, but classrooms open up throughout the year as children move on. It is always worth asking what is available now.',
  },
  {
    q: 'How much does it cost?',
    a: 'Tuition varies by age, schedule, program and location. Contact your preferred Somos school for current tuition and availability.',
  },
  {
    q: 'Do you support children with an IFSP or IEP?',
    a: 'Yes. Somos includes children with IFSP and IEP plans. Share your child’s plan with the school so we can talk specifically about what support looks like day to day.',
  },
  {
    q: 'Is there publicly funded Pre-K?',
    a: 'Somos participates in publicly supported early-learning programming at qualifying locations and programs. Contact the school to find out what is available and whether your family qualifies.',
  },
];

export default function Admissions() {
  return (
    <>
      <Seo
        title="Schedule a Preschool Tour | Somos Early Learning"
        description="Book a tour of a Somos Early Learning bilingual Montessori school in Germantown or Ellicott City, Maryland. Meet the teachers and see a classroom in action."
        path="/admissions"
        jsonLd={[
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Admissions', path: '/admissions' },
          ]),
        ]}
      />

      <section className="bg-cream-50">
        <Container className="pt-8 sm:pt-12">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16">
            <div>
              <p className="eyebrow">Admissions</p>
              <h1 className="mt-5 text-display-lg">Come see Somos for yourself.</h1>
              <p className="lede mt-6 max-w-xl">
                A tour is the fastest way to know whether a school is right for your
                child. Tell us a little about your family and we will find a time when
                the classroom is at its most honest — busy, and in the middle of a
                morning.
              </p>
              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {[
                  'Around 30–45 minutes',
                  'Children are welcome',
                  'Meet the teachers',
                  'No obligation at all',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-[0.96rem] text-ink-muted">
                    <span
                      aria-hidden="true"
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sage-100 text-sage-700"
                    >
                      <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m3.5 8.4 3 3 6-6.8" />
                      </svg>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="hidden lg:block">
              <Photo id="admissions-side" ratio="4/5" priority className="shadow-soft" />
            </div>
          </div>
        </Container>
      </section>

      <Section tone="white" spacing="tight" curve>
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
            <div>
              <h2 className="sr-only">Tour request form</h2>
              <TourForm />
            </div>

            <div>
              <h2 className="font-display text-[1.5rem]">Prefer to talk to someone?</h2>
              <p className="mt-3 leading-relaxed text-ink-muted">
                Call the school directly. Directors answer the phone between lessons, so
                if you get voicemail, leave a message and they will call you back.
              </p>

              <div className="mt-7 space-y-5">
                {locations.map((loc) => (
                  <div key={loc.slug} className="rounded-card border border-ink/10 bg-white p-6">
                    <h3 className="font-display text-[1.28rem]">{loc.city}</h3>
                    <address className="mt-2 not-italic leading-relaxed text-ink-muted">
                      {loc.street}
                      <br />
                      {loc.cityStateZip}
                    </address>
                    <a
                      href={`tel:${loc.phone.replace(/\D/g, '')}`}
                      className="mt-3 inline-flex min-h-[44px] items-center font-semibold text-clay-700 underline-offset-4 hover:underline"
                    >
                      {loc.phone}
                    </a>
                  </div>
                ))}
                <div className="rounded-card border border-ink/10 bg-cream-100 p-6">
                  <h3 className="font-semibold">Email either school</h3>
                  <a
                    href={`mailto:${site.email}`}
                    className="mt-2 inline-flex min-h-[44px] items-center font-semibold text-clay-700 underline-offset-4 hover:underline"
                  >
                    {site.email}
                  </a>
                </div>
              </div>

              <div className="mt-8 rounded-card border border-ochre-300/60 bg-ochre-100/50 p-6">
                <h3 className="font-semibold text-ink">Tuition &amp; availability</h3>
                <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-muted">
                  Tuition varies by age, schedule, program and location. Ask on your tour,
                  or note it in the form and we will send current figures for the school
                  you are considering.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <Section tone="sky" curve>
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
            <Reveal>
              <SectionHeading eyebrow="Before you visit" title="Admissions questions" size="md" />
            </Reveal>
            <Reveal delay={70}>
              <FAQAccordion items={ADMISSIONS_FAQS} />
            </Reveal>
          </div>
        </Container>
      </Section>
    </>
  );
}
