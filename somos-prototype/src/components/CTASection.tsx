import { Button } from '@/components/Button';
import { Container, SectionHeading } from '@/components/Primitives';
import { Photo } from '@/components/Photo';
import { Reveal } from '@/components/Reveal';

export function CTASection({
  eyebrow = 'Visit us',
  title = 'The best way to understand Somos is to experience it.',
  body = 'Meet the teachers, explore the classroom and see how a Somos day actually feels for your child.',
  primaryLabel = 'Schedule a Tour',
  primaryTo = '/admissions',
  secondaryLabel = 'Explore Our Locations',
  secondaryTo = '/locations',
  photo = 'home-tour',
}: {
  eyebrow?: string;
  title?: string;
  body?: string;
  primaryLabel?: string;
  primaryTo?: string;
  secondaryLabel?: string;
  secondaryTo?: string;
  photo?: string;
}) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-ochre-100 via-cream-100 to-clay-50">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-ochre-300/40 blur-2xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-28 right-1/3 h-80 w-80 rounded-full bg-sage-100/70 blur-2xl"
      />

      <Container className="relative py-20 sm:py-24 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16">
          <Reveal>
            <SectionHeading eyebrow={eyebrow} title={title} lede={body} size="lg" />
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button to={primaryTo} size="lg" withArrow>
                {primaryLabel}
              </Button>
              <Button to={secondaryTo} variant="secondary" size="lg">
                {secondaryLabel}
              </Button>
            </div>
          </Reveal>

          <Reveal delay={90} className="hidden lg:block">
            <div className="relative">
              <div
                aria-hidden="true"
                className="absolute -inset-3 -rotate-2 rounded-[1.6rem] bg-white/70"
              />
              <Photo id={photo} ratio="4/3" className="relative shadow-lift" />
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
