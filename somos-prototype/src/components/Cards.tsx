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
    <article className="group flex h-full flex-col overflow-hidden rounded-card border-2 border-ink/[0.07] bg-white transition-[transform,box-shadow] duration-300 ease-bounce hover:-translate-y-1.5 hover:shadow-lift">
      <div className="relative">
        <Photo
          id={program.photo}
          ratio="4/3"
          rounded="rounded-none"
          imgClassName="transition-transform duration-700 ease-somos group-hover:scale-[1.04]"
        />
        <span
          className={cn(
            'absolute bottom-4 left-5 rounded-pill px-4 py-2 font-display text-[0.82rem] font-extrabold uppercase tracking-[0.06em] shadow-soft',
            accent.chip
          )}
        >
          {program.ages}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-7">
        <h3 className="font-display text-[1.6rem] font-extrabold tracking-[-0.02em]">{program.name}</h3>
        <p className="mt-3 flex-1 leading-relaxed text-ink-muted">{program.cardSummary}</p>
        <Link
          to={`/programs#${program.slug}`}
          className={cn(
            'group/link mt-6 inline-flex min-h-[46px] items-center gap-2 self-start rounded-pill px-5 font-display font-bold transition-transform duration-200 ease-bounce hover:-translate-y-0.5',
            accent.bg,
            accent.text
          )}
        >
          {program.cta}
          <svg viewBox="0 0 20 20" className="h-4 w-4 transition-transform duration-200 ease-somos group-hover/link:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
    <article className="group flex h-full flex-col overflow-hidden rounded-card border-2 border-ink/[0.07] bg-white transition-[transform,box-shadow] duration-300 ease-bounce hover:-translate-y-1.5 hover:shadow-lift">
      <div className="relative">
        <Photo
          id={location.photos.card}
          ratio="3/2"
          rounded="rounded-none"
          imgClassName="transition-transform duration-700 ease-somos group-hover:scale-[1.035]"
        />
        <span
          className={cn(
            'absolute left-5 top-5 rounded-pill px-4 py-2 font-display text-[0.74rem] font-extrabold uppercase tracking-[0.1em] shadow-soft',
            accent.chip
          )}
        >
          {location.region}, MD
        </span>
      </div>

      <div className="flex flex-1 flex-col p-7">
        <h3 className="font-display text-[2rem] font-extrabold tracking-[-0.025em] text-ink">{location.city}</h3>
        <address className="mt-4 not-italic leading-relaxed text-ink-muted">
          {location.street}
          <br />
          {location.cityStateZip}
        </address>
        <a
          href={`tel:${location.phone.replace(/\D/g, '')}`}
          className="mt-2 inline-flex min-h-[44px] items-center font-semibold text-coral-700 underline-offset-4 hover:underline"
        >
          {location.phone}
        </a>

        {variant === 'full' ? (
          <>
            <div className="mt-4 flex flex-wrap gap-2">
              {['Pre-Primary', 'Primary', 'Before & after care'].map((tag) => (
                <span
                  key={tag}
                  className={cn('rounded-pill px-3.5 py-1.5 text-[0.8rem] font-bold text-ink', accent.bg)}
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
  accentIndex = 0,
}: {
  quote: string;
  attribution: string;
  theme?: string;
  accentIndex?: number;
}) {
  const accent = PILLAR_ACCENTS[accentIndex % PILLAR_ACCENTS.length];
  return (
    <figure className={cn('flex h-full flex-col rounded-card p-8', accent.bg)}>
      <span
        className={cn(
          'flex h-12 w-12 items-center justify-center rounded-full',
          accent.chip
        )}
        aria-hidden="true"
      >
        <svg viewBox="0 0 32 24" className="h-4 w-5" fill="currentColor">
          <path d="M13.4 0v9.6c0 8-4.2 13-12.4 14.4l-1-3.6C4.6 19.2 7 16.7 7.4 13.2H0V0h13.4Zm18.6 0v9.6c0 8-4.2 13-12.4 14.4l-1-3.6c4.6-1.2 7-3.7 7.4-7.2H18.6V0H32Z" />
        </svg>
      </span>
      <blockquote className="mt-5 flex-1 font-display text-[1.28rem] font-semibold leading-[1.45] tracking-[-0.015em] text-ink">
        “{quote}”
      </blockquote>
      <figcaption className="mt-6 flex items-center gap-3 border-t-2 border-white/70 pt-5">
        <span
          aria-hidden="true"
          className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-display text-[0.95rem] font-extrabold', accent.chip)}
        >
          S
        </span>
        <span>
          <span className="block font-display font-bold text-ink">{attribution}</span>
          {theme ? <span className="block text-[0.88rem] text-ink-muted">{theme}</span> : null}
        </span>
      </figcaption>
    </figure>
  );
}
