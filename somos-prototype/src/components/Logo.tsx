import { useId } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/cn';

/**
 * A recreation of the Somos mark, drawn as SVG so it stays crisp at any size.
 * The official artwork should replace this — see public/brand/README.md.
 *
 * The heart carries the logo's colours and a few of its learning icons, at a
 * level of detail that still reads at a 32px header size.
 */
function HeartArt({ id }: { id: string }) {
  return (
    <>
      <defs>
        <clipPath id={id}>
          <path d="M50 90C8 62 2 34 16 20 30 6 46 12 50 26c4-14 20-20 34-6 14 14 8 42-34 70Z" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <rect x="-20" y="0" width="34" height="94" fill="#16A360" />
        <rect x="14" y="0" width="18" height="94" fill="#1C74BB" />
        <rect x="32" y="0" width="18" height="94" fill="#FFC81F" />
        <rect x="50" y="0" width="18" height="94" fill="#E5449B" />
        <rect x="68" y="0" width="16" height="94" fill="#8A47A8" />
        <rect x="84" y="0" width="36" height="94" fill="#2FB6A8" />
        <path d="M0 0h100v28C70 42 30 14 0 28Z" fill="#FFFFFF" opacity="0.14" />

        {/* A few of the logo's icons, knocked out in white */}
        <path d="M23 30.5 25.6 36l6 .8-4.4 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6L14.4 36.8l6-.8Z" fill="#FFFFFF" />
        <circle cx="50" cy="35" r="6.4" fill="#FFFFFF" />
        <path d="M50 27.2c1.4-2.6 4.2-3 4.2-3s-.5 3-3 3.9Z" fill="#FFFFFF" />
        <path d="M77 28.5 79.2 33l5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5-3.6-3.5 5-.7Z" fill="#FFFFFF" />
        <rect x="29" y="54" width="18" height="13" rx="2.2" fill="#FFFFFF" />
        <path d="M38 54.6v11.8" stroke="#2FB6A8" strokeWidth="1.6" />
        <circle cx="62" cy="60" r="6.4" fill="#FFFFFF" />
        <circle cx="62" cy="60" r="2.3" fill="#E5449B" />
      </g>
    </>
  );
}

export function LogoMark({ className }: { className?: string }) {
  const id = useId();
  return (
    <svg viewBox="0 0 100 94" className={className} aria-hidden="true">
      <HeartArt id={`heart${id}`} />
    </svg>
  );
}

/** Header lockup: mark plus stacked wordmark. */
export function Logo({ className, onClick }: { className?: string; onClick?: () => void }) {
  return (
    <Link
      to="/"
      onClick={onClick}
      className={cn('group inline-flex items-center gap-3', className)}
      aria-label="Somos Early Learning — home"
    >
      <LogoMark className="h-10 w-10 shrink-0 transition-transform duration-300 ease-bounce group-hover:-rotate-6" />
      <span className="leading-none">
        <span className="block font-display text-[1.45rem] font-extrabold tracking-[0.02em] text-grass-600">
          SOMOS
        </span>
        <span className="mt-1 hidden text-[0.72rem] font-extrabold uppercase tracking-[0.16em] text-sky-500 sm:block">
          Early Learning
        </span>
      </span>
    </Link>
  );
}

/** The full circular badge, for places with room for it. */
export function LogoBadge({ className }: { className?: string }) {
  const id = useId();
  return (
    <svg viewBox="0 0 200 200" className={className} role="img" aria-label="Somos Early Learning">
      <defs>
        {/* Left to right over the top: glyphs sit upright, facing out. */}
        <path id={`top${id}`} d="M26 100a74 74 0 0 1 148 0" fill="none" />
        {/* Left to right under the bottom, so the words stay upright too. */}
        <path id={`bottom${id}`} d="M28 100a72 72 0 0 0 144 0" fill="none" />
      </defs>

      <text fill="#16A360" fontSize="30" fontWeight="800" letterSpacing="4" className="font-display">
        <textPath href={`#top${id}`} startOffset="50%" textAnchor="middle">
          SOMOS
        </textPath>
      </text>

      <text fill="#1C74BB" fontSize="16" fontWeight="700" letterSpacing="3.2" className="font-display">
        <textPath href={`#bottom${id}`} startOffset="50%" textAnchor="middle">
          EARLY LEARNING
        </textPath>
      </text>

      <g transform="translate(61 63) scale(0.78)">
        <HeartArt id={`heart${id}`} />
      </g>

      <g stroke="#16A360" strokeWidth="2.8" strokeLinecap="round">
        <path d="M14 94v12M8.8 97l10.4 6M19.2 97 8.8 103" />
        <path d="M186 94v12M180.8 97l10.4 6M191.2 97l-10.4 6" />
      </g>
    </svg>
  );
}
