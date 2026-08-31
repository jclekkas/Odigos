import { trustPoints } from '@/data/programs';
import { PILLAR_ACCENTS } from '@/lib/accents';
import { cn } from '@/lib/cn';

const ICONS: Record<string, JSX.Element> = {
  'Bilingual English + Spanish': (
    <>
      <path d="M3 12h18" />
      <path d="M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18Z" />
      <circle cx="12" cy="12" r="9" />
    </>
  ),
  'Montessori-Inspired Learning': (
    <>
      <path d="M4 18h16" />
      <path d="M6 18V9l6-4 6 4v9" />
      <path d="M10 18v-5h4v5" />
    </>
  ),
  'Ages 2–5': (
    <>
      <circle cx="12" cy="7.5" r="3.5" />
      <path d="M5 20c0-3.9 3.1-7 7-7s7 3.1 7 7" />
    </>
  ),
  'Small-Group Environment': (
    <>
      <circle cx="8" cy="9" r="2.6" />
      <circle cx="16" cy="9" r="2.6" />
      <path d="M3 19c0-2.8 2.2-5 5-5" />
      <path d="M21 19c0-2.8-2.2-5-5-5" />
      <path d="M9.5 19h5" />
    </>
  ),
  'Maryland Licensed Programs': (
    <>
      <path d="M12 3.5 5 6.5v5c0 4.3 2.9 8.1 7 9 4.1-.9 7-4.7 7-9v-5l-7-3Z" />
      <path d="m9.3 12 1.9 1.9 3.6-3.7" />
    </>
  ),
};

export function TrustStrip() {
  return (
    <section aria-label="What Somos offers" className="border-y border-ink/[0.07] bg-cream-100">
      <div className="container-somos">
        <ul className="grid grid-cols-2 gap-x-6 gap-y-7 py-9 md:grid-cols-3 lg:grid-cols-5 lg:gap-x-4">
          {trustPoints.map((point, i) => {
            const accent = PILLAR_ACCENTS[i % PILLAR_ACCENTS.length];
            return (
            <li key={point.label} className="flex items-start gap-3">
              <span
                aria-hidden="true"
                className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full', accent.bg, accent.text)}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-[1.35rem] w-[1.35rem]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {ICONS[point.label]}
                </svg>
              </span>
              <span className="min-w-0 pt-1">
                <span className="block text-[0.95rem] font-semibold leading-snug text-ink">
                  {point.label}
                </span>
                <span className="mt-0.5 block text-[0.83rem] leading-snug text-ink-soft">
                  {point.detail}
                </span>
              </span>
            </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
