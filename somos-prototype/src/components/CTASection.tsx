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
    <section className="relative overflow-hidden bg-forest-800 text-cream-100">
      <div className="absolute inset-0 opacity-25" aria-hidden="true">
        <Photo id={photo} fill rounded="rounded-none" altOverride="" />
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-forest-900 via-forest-800/95 to-forest-800/70"
      />
      <Container className="relative py-24 sm:py-28 lg:py-32">
        <Reveal className="max-w-2xl">
          <SectionHeading
            eyebrow={eyebrow}
            title={title}
            lede={body}
            onDark
            size="lg"
          />
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button to={primaryTo} variant="onDark" size="lg" withArrow>
              {primaryLabel}
            </Button>
            <Button to={secondaryTo} variant="onDarkGhost" size="lg">
              {secondaryLabel}
            </Button>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
