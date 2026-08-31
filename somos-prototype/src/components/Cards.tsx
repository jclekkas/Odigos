import { Link } from 'react-router-dom';
import type { Program } from '@/data/programs';
import type { Location } from '@/data/locations';
import { Photo } from '@/components/Photo';
import { Button } from '@/components/Button';
import { cn } from '@/lib/cn';
import { PILLAR_ACCENTS } from '@/lib/accents';

export function ProgramCard({ program, accentIndex = 0 }: { program: Program; accentIndex?: number }) {
  const accent = PILLAR_ACCENTS[accentIndex % PILLAR_ACCENTS.length];
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-card border border-ink/10 bg-white transition-[transform,box-shadow,border-color] duration-300 ease-somos hover:-translate-y-1 hover:border-ink/15 hover:shadow-lift">
      <Photo
        id={program.photo}
        ratio="4/3"
        rounded="rounded-none"
        imgClassName="transition-transform duration-700 ease-somos group-hover:scale-[1.035]"
      />
      <div className={cn('h-1.5 w-full', accent.dot)} />
      <div className="flex flex-1 flex-col p-7">
        <p className={cn('text-[0.8rem] font-semibold uppercase tracking-[0.13em]', accent.text)}>
          {program.ages}
        </p>
        <h3 className="mt-2 text-display-sm">{program.name}</h3>
        <p className="mt-3 flex-1 text-[0.98rem] leading-relaxed text-ink-muted">
          {program.cardSummary}
        </p>
        <Link
          to={`/programs#${program.slug}`}
          className="group/link mt-6 inline-flex min-h-[44px] items-center gap-2 font-semibold text-clay-700"
        >
          {program.cta}
          <svg viewBox="0 0 20 20" className="h-4 w-4 transition-transform duration-200 ease-somos group-hover/link:translate-x-1" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 10h11M11 5.5 15.5 10 11 14.5" />
          </svg>
        </Link>
      </div>
    </article>
  );
}

export function LocationCard({
  location,
  variant = 'full',
  accentIndex = 0,
}: {
  location: Location;
  variant?: 'full' | 'compact';
  accentIndex?: number;
}) {
  const accent = PILLAR_ACCENTS[accentIndex % PILLAR_ACCENTS.length];
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-card border border-ink/10 bg-white transition-[transform,box-shadow] duration-300 ease-somos hover:-translate-y-1 hover:shadow-lift">
      <div className="relative">
        <Photo
          id={location.photos.card}
          ratio="3/2"
          rounded="rounded-none"
          imgClassName="transition-transform duration-700 ease-somos group-hover:scale-[1.035]"
        />
        <span
          className={cn(
            'absolute left-5 top-5 rounded-pill bg-white/95 px-3.5 py-1.5 text-[0.72rem] font-bold uppercase tracking-[0.14em] shadow-soft',
            accent.text
          )}
        >
          {location.region}, MD
        </span>
      </div>

      <div className="flex flex-1 flex-col p-7">
        <h3 className="font-display text-[1.9rem] leading-none text-ink">{location.city}</h3>
        <address className="mt-4 not-italic leading-relaxed text-ink-muted">
          {location.street}
          <br />
          {location.cityStateZip}
        </address>
        <a
          href={`tel:${location.phone.replace(/\D/g, '')}`}
          className="mt-2 inline-flex min-h-[44px] items-center font-semibold text-clay-700 underline-offset-4 hover:underline"
        >
          {location.phone}
        </a>

        {variant === 'full' ? (
          <>
            <div className="mt-4 flex flex-wrap gap-2">
              {['Pre-Primary', 'Primary', 'Before & after care'].map((tag) => (
                <span
                  key={tag}
                  className={cn('rounded-pill px-3 py-1.5 text-[0.78rem] font-medium text-ink', accent.bg)}
                >
                  {tag}
                </span>
              ))}
            </div>
            <p className="mt-4 text-[0.88rem] leading-relaxed text-ink-soft">
              Program availability varies — contact the school for current openings.
            </p>
          </>
        ) : null}

        <div className="mt-7 flex flex-1 flex-col justify-end gap-3 sm:flex-row sm:items-center">
          <Button to={`/locations/${location.slug}`} size="sm" className="sm:flex-1" withArrow>
            Explore {location.city}
          </Button>
          <Button
            to={`/admissions?location=${location.slug}`}
            variant="secondary"
            size="sm"
            className="sm:flex-1"
          >
            Schedule a Tour
          </Button>
        </div>
      </div>
    </article>
  );
}

export function TestimonialCard({
  quote,
  attribution,
  theme,
}: {
  quote: string;
  attribution: string;
  theme?: string;
}) {
  return (
    <figure className="flex h-full flex-col rounded-card border border-ink/10 bg-white p-8">
      <svg viewBox="0 0 32 24" className="h-7 w-9 text-ochre-300" fill="currentColor" aria-hidden="true">
        <path d="M13.4 0v9.6c0 8-4.2 13-12.4 14.4l-1-3.6C4.6 19.2 7 16.7 7.4 13.2H0V0h13.4Zm18.6 0v9.6c0 8-4.2 13-12.4 14.4l-1-3.6c4.6-1.2 7-3.7 7.4-7.2H18.6V0H32Z" />
      </svg>
      <blockquote className="mt-5 flex-1 font-display text-[1.22rem] leading-[1.55] text-ink">
        “{quote}”
      </blockquote>
      <figcaption className="mt-6 border-t border-ink/10 pt-5">
        <span className="block font-semibold text-ink">{attribution}</span>
        {theme ? (
          <span className="mt-0.5 block text-[0.85rem] text-ink-soft">{theme}</span>
        ) : null}
      </figcaption>
    </figure>
  );
}
