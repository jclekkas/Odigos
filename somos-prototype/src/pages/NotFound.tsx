import { Seo } from '@/lib/seo';
import { Container, Section } from '@/components/Primitives';
import { Button } from '@/components/Button';
import { locations } from '@/data/locations';

export default function NotFound() {
  return (
    <>
      <Seo
        title="Page not found | Somos Early Learning"
        description="The page you were looking for is not here. Find our programs, schools and tour requests instead."
        path="/404"
      />
      <Section tone="cream" spacing="loose">
        <Container>
          <p className="eyebrow">404</p>
          <h1 className="mt-5 max-w-2xl text-display-lg">
            That page isn’t here — but the schools are.
          </h1>
          <p className="lede mt-6 max-w-xl">
            The page you were looking for may have moved. Start again from the homepage,
            or go straight to the school nearest you.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button to="/" size="lg" withArrow>
              Back to the homepage
            </Button>
            <Button to="/admissions" variant="secondary" size="lg">
              Schedule a Tour
            </Button>
          </div>
          <div className="mt-12 flex flex-wrap gap-3">
            {locations.map((loc) => (
              <Button key={loc.slug} to={`/locations/${loc.slug}`} variant="secondary" size="sm">
                {loc.city}
              </Button>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
