import { cn } from '@/lib/cn';
import { getPhoto, photoSrc } from '@/lib/media';

type Props = {
  id: string;
  className?: string;
  imgClassName?: string;
  ratio?: string;
  priority?: boolean;
  rounded?: string;
  overlay?: 'none' | 'soft' | 'strong' | 'bottom';
  altOverride?: string;
  /** Fill the parent element instead of holding its own aspect ratio. */
  fill?: boolean;
};

const OVERLAY: Record<NonNullable<Props['overlay']>, string> = {
  none: '',
  soft: 'bg-gradient-to-tr from-forest-900/35 via-forest-900/10 to-transparent',
  strong: 'bg-gradient-to-tr from-forest-900/65 via-forest-900/35 to-forest-900/10',
  bottom: 'bg-gradient-to-t from-forest-900/70 via-forest-900/15 to-transparent',
};

/**
 * Every photograph on the site goes through here, so real Somos photography
 * can be swapped in slot by slot from src/data/media.manifest.json.
 */
export function Photo({
  id,
  className,
  imgClassName,
  ratio,
  priority = false,
  rounded = 'rounded-card',
  overlay = 'none',
  altOverride,
  fill = false,
}: Props) {
  const slot = getPhoto(id);
  const aspect = (ratio ?? slot.ratio).replace('/', ' / ');
  return (
    <div
      className={cn('relative overflow-hidden bg-cream-200', fill && 'absolute inset-0', rounded, className)}
      style={fill ? undefined : { aspectRatio: aspect }}
    >
      <img
        src={photoSrc(id)}
        alt={altOverride ?? slot.alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        {...(priority ? ({ fetchpriority: 'high' } as Record<string, string>) : {})}
        className={cn('h-full w-full object-cover', imgClassName)}
      />
      {overlay !== 'none' ? (
        <div className={cn('pointer-events-none absolute inset-0', OVERLAY[overlay])} />
      ) : null}
    </div>
  );
}
