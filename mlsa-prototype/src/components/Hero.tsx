import type { ReactNode } from 'react';
import { Shell, cx } from './primitives';

/**
 * Page hero.
 *
 * The <h1> takes `tabIndex={-1}` because route changes move focus here — in a
 * single-page app nothing else tells a screen reader the page changed.
 */
export function Hero({
  eyebrow,
  title,
  lead,
  support,
  actions,
  aside,
  serif = false,
  tone = 'canvas',
  children,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  support?: string;
  actions?: ReactNode;
  aside?: ReactNode;
  serif?: boolean;
  tone?: 'canvas' | 'warm';
  children?: ReactNode;
}) {
  return (
    <div
      className={cx(
        'border-b border-line',
        tone === 'warm'
          ? 'bg-gradient-to-b from-primary-tint/60 to-canvas'
          : 'bg-canvas',
      )}
    >
      <Shell>
        <div className="grid items-start gap-10 py-12 sm:py-16 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-14 lg:py-20">
          <div>
            {eyebrow ? <p className="eyebrow mb-4">{eyebrow}</p> : null}
            <h1
              tabIndex={-1}
              className={cx(
                'text-fluid-display text-ink outline-none',
                serif && 'font-serif',
              )}
            >
              {title}
            </h1>
            {lead ? (
              <p className="mt-5 max-w-[34rem] text-fluid-lead font-medium leading-relaxed text-ink-soft">
                {lead}
              </p>
            ) : null}
            {actions ? <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">{actions}</div> : null}
            {support ? (
              <p className="mt-7 max-w-measure border-t border-line pt-5 text-[0.9375rem] leading-relaxed text-ink-muted">
                {support}
              </p>
            ) : null}
            {children}
          </div>

          {aside ? <div className="lg:pt-2">{aside}</div> : null}
        </div>
      </Shell>
    </div>
  );
}
