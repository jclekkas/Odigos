import { Seo } from '@/lib/seo';
import { Container, Section } from '@/components/Primitives';
import { site } from '@/data/site';

const COMMITMENTS = [
  'Colour contrast that meets WCAG 2.2 AA for text and interface elements',
  'A visible focus outline on every interactive element',
  'Full keyboard operation, including the menu, accordions and the tour form',
  'Semantic headings in a logical order, with one H1 per page',
  'Descriptive alternative text on meaningful images',
  'Form fields with real labels, and errors described in text rather than colour alone',
  'Touch targets sized for small hands and hurried mornings',
  'Motion that respects the reduced-motion setting on your device',
];

export default function Accessibility() {
  return (
    <>
      <Seo
        title="Accessibility | Somos Early Learning"
        description="Somos Early Learning's commitment to an accessible website, and how to tell us about a barrier you encounter."
        path="/accessibility"
      />
      <Section tone="cream">
        <Container>
          <p className="eyebrow">Legal</p>
          <h1 className="mt-5 text-display-lg">Accessibility</h1>
          <div className="mt-10 max-w-prose space-y-5 leading-relaxed text-ink-muted">
            <p>
              A school website should work for every family, including parents and
              guardians who use screen readers, keyboard navigation, magnification or
              captions. This site is built to the WCAG 2.2 AA design principles.
            </p>
          </div>
          <ul className="mt-8 grid max-w-3xl gap-3 sm:grid-cols-2">
            {COMMITMENTS.map((item) => (
              <li key={item} className="flex gap-3 text-[0.96rem] leading-relaxed text-ink-muted">
                <span
                  aria-hidden="true"
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-grass-500"
                />
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-10 max-w-prose space-y-5 leading-relaxed text-ink-muted">
            <p>
              Accessibility is never finished. If something on this site is difficult or
              impossible for you to use, tell us and we will fix it — and in the meantime
              we will give you the same information another way.
            </p>
            <p>
              Email{' '}
              <a
                href={`mailto:${site.email}`}
                className="font-semibold text-grass-700 underline underline-offset-4"
              >
                {site.email}
              </a>{' '}
              or call either school directly.
            </p>
          </div>
        </Container>
      </Section>
    </>
  );
}
