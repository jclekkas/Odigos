import { Button } from '@/components/Button';
import type { Location } from '@/data/locations';

/**
 * Stands in for an embedded map. Kept as a designed block rather than a live
 * iframe so the prototype loads nothing from third parties; swap the inner
 * element for a map embed at build-out.
 */
export function MapPlaceholder({ location }: { location: Location }) {
  const href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.mapQuery)}`;
  return (
    <div className="overflow-hidden rounded-card border border-ink/10 bg-cream-100">
      <div
        className="relative grid min-h-[280px] place-items-center bg-grass-50"
        style={{
          backgroundImage:
            'linear-gradient(rgba(84,102,78,0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(84,102,78,0.10) 1px, transparent 1px)',
          backgroundSize: '38px 38px',
        }}
      >
        <div
          aria-hidden="true"
          className="absolute left-[18%] top-0 h-full w-16 -rotate-12 bg-cream-100/80"
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-[62%] h-10 bg-cream-100/70"
        />
        <div className="relative flex flex-col items-center px-6 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-grass-600 text-white shadow-soft">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11Z" />
              <circle cx="12" cy="10" r="2.6" />
            </svg>
          </span>
          <p className="mt-4 font-display text-[1.15rem]">{location.street}</p>
          <p className="text-[0.93rem] text-ink-muted">{location.cityStateZip}</p>
        </div>
      </div>
      <div className="flex flex-col gap-3 border-t border-ink/10 p-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[0.9rem] text-ink-muted">
          {location.region}, Maryland
        </p>
        <Button href={href} variant="secondary" size="sm">
          Open in Google Maps
        </Button>
      </div>
    </div>
  );
}

/**
 * Reserved, correctly proportioned space for a future Google review feed.
 */
export function ReviewsPlaceholder({ city }: { city: string }) {
  return (
    <div className="rounded-card border border-dashed border-ink/20 bg-cream-100 p-7">
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className="flex gap-1 text-sun-500">
          {Array.from({ length: 5 }).map((_, i) => (
            <svg key={i} viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
              <path d="M10 1.6l2.5 5.1 5.6.8-4 3.9 1 5.6L10 14.4 4.9 17l1-5.6-4-3.9 5.6-.8L10 1.6Z" />
            </svg>
          ))}
        </span>
        <p className="text-[0.9rem] font-semibold text-ink">Google reviews</p>
      </div>
      <p className="mt-3 max-w-prose text-[0.94rem] leading-relaxed text-ink-muted">
        Live reviews for the {city} school will appear here once the Google Business
        Profile feed is connected. Verified reviews carry more weight with families
        than anything a website can say about itself.
      </p>
    </div>
  );
}
