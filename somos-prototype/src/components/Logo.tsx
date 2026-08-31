import { Link } from 'react-router-dom';
import { cn } from '@/lib/cn';

/**
 * The mark is three growing arcs sharing one root: two languages and one
 * community. Drawn rather than imported so it stays crisp at any size.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true" fill="none">
      <circle cx="20" cy="20" r="19" className="fill-clay-600" />
      <path
        d="M20 31c0-6.2 3.6-10.6 9-12.2"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        className="text-ochre-300"
      />
      <path
        d="M20 31c0-6.2-3.6-10.6-9-12.2"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        className="text-sage-300"
      />
      <path
        d="M20 31V12"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        className="text-cream-50"
      />
      <circle cx="20" cy="9.4" r="2.6" className="fill-cream-50" />
    </svg>
  );
}

export function Logo({
  onDark = false,
  className,
  onClick,
  alwaysShowSubline = false,
}: {
  onDark?: boolean;
  className?: string;
  onClick?: () => void;
  alwaysShowSubline?: boolean;
}) {
  return (
    <Link
      to="/"
      onClick={onClick}
      className={cn('group inline-flex items-center gap-3', className)}
      aria-label="Somos Early Learning — home"
    >
      <LogoMark className="h-9 w-9 shrink-0 transition-transform duration-300 ease-somos group-hover:-rotate-6" />
      <span className="leading-none">
        <span
          className={cn(
            'block font-display text-[1.42rem] tracking-[-0.02em]',
            onDark ? 'text-cream-50' : 'text-ink'
          )}
          style={{ fontVariationSettings: "'wght' 600, 'SOFT' 40, 'opsz' 20" }}
        >
          somos
        </span>
        <span
          className={cn(
            'mt-1 text-[0.7rem] font-semibold uppercase tracking-[0.18em]',
            alwaysShowSubline ? 'block' : 'hidden sm:block',
            onDark ? 'text-cream-100/70' : 'text-ink-soft'
          )}
        >
          Early Learning
        </span>
      </span>
    </Link>
  );
}
