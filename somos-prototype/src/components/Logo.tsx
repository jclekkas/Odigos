import { Link } from 'react-router-dom';
import { cn } from '@/lib/cn';

/**
 * The logo is consumed as a file, never redrawn in code:
 *
 *   public/brand/somos-logo.svg   full circular badge
 *   public/brand/somos-mark.svg   heart only, for small sizes
 *   public/favicon.svg            copy of the mark
 *
 * Overwrite those three files with the official artwork and the site picks it
 * up everywhere — no component changes. See public/brand/README.md.
 *
 * The files currently in place are a stand-in; they are not the official
 * artwork.
 */

/** Heart only. Use where the badge's arced wordmarks would be unreadable. */
export function LogoMark({ className }: { className?: string }) {
  return <img src="/brand/somos-mark.svg" alt="" aria-hidden="true" className={className} />;
}

/**
 * The full badge. `plate` puts it on a white coin, for the times it has to sit
 * on a colour — the artwork is drawn for a white ground.
 */
export function LogoBadge({
  className,
  plate = false,
}: {
  className?: string;
  plate?: boolean;
}) {
  const img = (
    <img
      src="/brand/somos-logo.svg"
      alt="Somos Early Learning"
      className={cn('h-full w-full', plate && 'p-2')}
    />
  );
  return (
    <span className={cn('inline-block', plate && 'rounded-full bg-white shadow-soft', className)}>
      {img}
    </span>
  );
}

/** Header lockup — the badge alone; it already carries the school's name. */
export function Logo({ className, onClick }: { className?: string; onClick?: () => void }) {
  return (
    <Link
      to="/"
      onClick={onClick}
      className={cn('group inline-flex items-center', className)}
      aria-label="Somos Early Learning — home"
    >
      {/* The link carries the accessible name, so the image stays decorative. */}
      <img
        src="/brand/somos-logo.svg"
        alt=""
        className="h-full w-auto transition-transform duration-300 ease-bounce group-hover:-rotate-3"
      />
    </Link>
  );
}
