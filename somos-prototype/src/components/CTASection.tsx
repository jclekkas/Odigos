import { Button } from '@/components/Button';
import { Container, SectionHeading } from '@/components/Primitives';
import { Photo } from '@/components/Photo';
import { Reveal } from '@/components/Reveal';
import { Sun, Dots, Wave } from '@/components/Doodles';

export function CTASection({
  eyebrow = 'Come and visit',
  title = 'The best way to understand Somos is to experience it.',
  body = 'Meet the teachers, explore the classroom and see how a Somos day actually feels for your child. Visits are relaxed, unhurried and free.',
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
    <section className="relative overflow-hidden bg-sun-200 pt-20 sm:pt-24 lg:pt-28">
      <Sun className="absolute -left-10 -top-10 h-40 w-40 text-sun-300" />
      <Dots className="absolute right-10 top-14 hidden h-16 w-32 text-coral-300 lg:block" rows={4} cols={8} />

      <Container className="relative pb-24 sm:pb-28">
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
                className="absolute -inset-4 rotate-[3deg] rounded-blob bg-white/80"
              />
              <Photo id={photo} ratio="4/3" rounded="rounded-blob" className="relative shadow-lift" />
            </div>
          </Reveal>
        </div>
      </Container>

      <Wave className="absolute inset-x-0 bottom-0 text-cream-100" />
    </section>
  );
}
