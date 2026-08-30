import { CircleCheck } from 'lucide-react';
import { cx } from './primitives';

/**
 * A single impact figure.
 *
 * The `detail` line is not filler — it is the citation. Every number on this
 * site can be traced to something MLSA published, and the one figure MLSA does
 * not publish (people served per year) is stated as "thousands" because that is
 * the actual claim in their materials. Inventing a number here would be the
 * easiest and worst mistake available.
 */
export function ImpactMetric({
  value,
  label,
  detail,
  onDark = false,
}: {
  value: string;
  label: string;
  detail?: string;
  onDark?: boolean;
}) {
  return (
    <div
      className={cx(
        'flex flex-col rounded-card border p-5 sm:p-6',
        onDark ? 'border-white/20 bg-white/[0.06]' : 'border-line bg-surface shadow-card',
      )}
    >
      <p
        className={cx(
          'font-serif text-[clamp(2rem,1.5rem+1.8vw,2.75rem)] font-semibold leading-none',
          onDark ? 'text-white' : 'text-primary',
        )}
      >
        {value}
      </p>
      <p
        className={cx(
          'mt-2 text-[0.9375rem] font-semibold leading-snug',
          onDark ? 'text-white' : 'text-ink',
        )}
      >
        {label}
      </p>
      {detail ? (
        <p
          className={cx(
            'mt-3 border-t pt-3 text-sm leading-relaxed',
            onDark ? 'border-white/15 text-white/75' : 'border-line text-ink-muted',
          )}
        >
          {detail}
        </p>
      ) : null}
    </div>
  );
}

/** Marks a block whose figures all come from MLSA's published materials. */
export function SourceNote({ children, onDark = false }: { children: string; onDark?: boolean }) {
  return (
    <p
      className={cx(
        'mt-6 flex items-start gap-2 text-sm',
        onDark ? 'text-white/70' : 'text-ink-muted',
      )}
    >
      <CircleCheck aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{children}</span>
    </p>
  );
}
