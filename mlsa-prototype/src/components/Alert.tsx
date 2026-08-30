import type { ReactNode } from 'react';
import { Info, TriangleAlert, ShieldCheck, FlaskConical } from 'lucide-react';
import { cx } from './primitives';

type AlertTone = 'info' | 'notice' | 'safety' | 'prototype';

const TONES: Record<
  AlertTone,
  { wrapper: string; icon: typeof Info; iconClass: string }
> = {
  info: {
    wrapper: 'border-primary-border bg-primary-tint text-primary-deep',
    icon: Info,
    iconClass: 'text-primary',
  },
  notice: {
    wrapper: 'border-notice-border bg-notice-tint text-ink',
    icon: TriangleAlert,
    iconClass: 'text-notice',
  },
  safety: {
    wrapper: 'border-accent-border bg-accent-tint text-ink',
    icon: ShieldCheck,
    iconClass: 'text-accent',
  },
  prototype: {
    wrapper: 'border-line-strong bg-sunk text-ink-soft',
    icon: FlaskConical,
    iconClass: 'text-ink-muted',
  },
};

/**
 * An inline message.
 *
 * The icon is not decoration and the colour is not the message: every alert
 * carries a visible text `title`, so the meaning survives greyscale, low
 * vision, and a screen reader that never sees the border colour at all.
 */
export function Alert({
  tone = 'info',
  title,
  children,
  className,
  live = false,
}: {
  tone?: AlertTone;
  title: string;
  children?: ReactNode;
  className?: string;
  live?: boolean;
}) {
  const { wrapper, icon: Icon, iconClass } = TONES[tone];
  return (
    <div
      className={cx('rounded-card border p-4 sm:p-5', wrapper, className)}
      {...(live ? { role: 'status', 'aria-live': 'polite' } : {})}
    >
      <div className="flex gap-3">
        <Icon aria-hidden="true" className={cx('mt-0.5 h-5 w-5 shrink-0', iconClass)} />
        <div className="min-w-0">
          <p className="text-[0.9375rem] font-semibold leading-snug">{title}</p>
          {children ? (
            <div className="mt-1.5 text-[0.9375rem] leading-relaxed text-ink-soft">{children}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
