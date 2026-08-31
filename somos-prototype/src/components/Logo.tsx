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
  decorative = false,
}: {
  className?: string;
  plate?: boolean;
  /** For placements where the name is already announced nearby. */
  decorative?: boolean;
}) {
  const img = (
    <img
      src="/brand/somos-logo.svg"
      alt={decorative ? '' : 'Somos Early Learning'}
      aria-hidden={decorative || undefined}
      className={cn('h-full w-full', plate && 'p-2')}
    />
  );
  return (
    <span className={cn('inline-block', plate && 'rounded-full bg-white shadow-soft', className)}>
      {img}
    </span>
  );
}

/**
 * Header lockup — the badge alone; it already carries the school's name. It
 * sits on a white coin so the artwork keeps the white ground it is drawn for,
 * and so it reads as a seal rather than a small picture in the corner.
 */
export function Logo({
  className,
  coinClassName,
  onClick,
}: {
  className?: string;
  coinClassName?: string;
  onClick?: () => void;
}) {
  return (
    <Link
      to="/"
      onClick={onClick}
      className={cn('group inline-flex shrink-0 items-center', className)}
      aria-label="Somos Early Learning — home"
    >
      <span
        className={cn(
          'grid place-items-center rounded-full bg-white shadow-soft ring-1 ring-ink/[0.06] transition-[height,width,transform] duration-300 ease-somos group-hover:-rotate-3',
          coinClassName
        )}
      >
        {/* The link carries the accessible name, so the image stays decorative. */}
        <img src="/brand/somos-logo.svg" alt="" className="h-[86%] w-[86%]" />
      </span>
    </Link>
  );
}
