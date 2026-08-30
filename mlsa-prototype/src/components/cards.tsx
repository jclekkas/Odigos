import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ExternalLink, type LucideIcon } from 'lucide-react';
import { useLang } from '@/i18n/LanguageContext';
import { cx } from './primitives';

/**
 * ActionCard — the "What do you need today?" card.
 *
 * The whole card is one link, not a card containing a link, so there is exactly
 * one tab stop and one large touch target per choice. The heading is real
 * heading markup, so someone navigating by headings hears the four options as a
 * list of choices rather than as decoration.
 */
export function ActionCard({
  title,
  body,
  cta,
  to,
  href,
  external,
  icon: Icon,
  headingLevel = 'h3',
}: {
  title: string;
  body: string;
  cta: string;
  to?: string;
  href?: string;
  external?: boolean;
  icon: LucideIcon;
  headingLevel?: 'h3' | 'h4';
}) {
  const { t, copy } = useLang();
  const Heading = headingLevel;

  const inner = (
    <>
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-[10px] bg-primary-tint text-primary transition-colors group-hover:bg-primary group-hover:text-white">
        <Icon aria-hidden="true" className="h-6 w-6" />
      </span>
      <Heading className="text-fluid-h3 font-semibold text-ink">{title}</Heading>
      <p className="mt-2 flex-1 text-[0.9375rem] leading-relaxed text-ink-soft">{body}</p>
      <span className="mt-5 inline-flex items-center gap-1.5 text-[0.9375rem] font-semibold text-primary">
        {cta}
        {external ? (
          <>
            <ExternalLink aria-hidden="true" className="h-4 w-4" />
            <span className="sr-only"> ({t(copy.global.opensInNewTab)})</span>
          </>
        ) : (
          <ArrowRight
            aria-hidden="true"
            className="h-4 w-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transform-none"
          />
        )}
      </span>
    </>
  );

  const classes =
    'group flex h-full flex-col rounded-card border-2 border-line bg-surface p-6 shadow-card transition-all hover:-translate-y-0.5 hover:border-primary-border hover:shadow-lift motion-reduce:transform-none sm:p-7';

  if (external && href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {inner}
      </a>
    );
  }
  return (
    <Link to={to ?? '/'} className={classes}>
      {inner}
    </Link>
  );
}

/**
 * PracticeAreaCard — one area of MLSA's work.
 *
 * Carries the plain-language summary and, optionally, the everyday phrases
 * people actually use ("notice to vacate", not "landlord-tenant"). Those
 * phrases exist for recognition, not decoration: a person scanning for their
 * own situation should find their own words on the page.
 */
export function PracticeAreaCard({
  id,
  icon: Icon,
  name,
  summary,
  examples,
  groupLabel,
}: {
  id: string;
  icon: LucideIcon;
  name: string;
  summary: string;
  examples?: string[];
  groupLabel: string;
}) {
  const { t, copy } = useLang();

  return (
    <article
      id={id}
      className="flex h-full scroll-mt-28 flex-col rounded-card border border-line bg-surface p-5 shadow-card sm:p-6"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-primary-tint text-primary">
          <Icon aria-hidden="true" className="h-5 w-5" />
        </span>
        {/* The category is written out, so grouping never depends on colour. */}
        <span className="rounded-full bg-sunk px-2.5 py-1 text-xs font-semibold text-ink-muted">
          {groupLabel}
        </span>
      </div>

      <h3 className="text-fluid-h3 font-semibold text-ink">{name}</h3>
      <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-soft">{summary}</p>

      {examples?.length ? (
        <div className="mt-4">
          <p className="eyebrow mb-2">{t(copy.ourWork.examplesLabel)}</p>
          <ul className="flex flex-wrap gap-1.5">
            {examples.slice(0, 4).map((example) => (
              <li
                key={example}
                className="rounded border border-line bg-canvas px-2 py-1 text-xs text-ink-soft"
              >
                {example}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <Link
        to="/get-help"
        className="mt-5 inline-flex min-h-[44px] items-center gap-1.5 self-start text-[0.9375rem] font-semibold text-primary underline decoration-primary/40 underline-offset-[3px] hover:decoration-primary"
      >
        {/* Descriptive link text: "Learn more" alone is meaningless out of
            context, so the area name is appended for screen readers. */}
        {t(copy.ourWork.cardCta)}
        <span className="sr-only"> — {name}</span>
        <ArrowRight aria-hidden="true" className="h-4 w-4" />
      </Link>
    </article>
  );
}

/** A plain content card used for the ecosystem and involvement sections. */
export function InfoCard({
  eyebrow,
  title,
  body,
  children,
  className,
}: {
  eyebrow?: string;
  title: string;
  body: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cx(
        'flex h-full flex-col rounded-card border border-line bg-surface p-6 shadow-card sm:p-7',
        className,
      )}
    >
      {eyebrow ? <p className="eyebrow mb-2">{eyebrow}</p> : null}
      <h3 className="text-fluid-h3 font-semibold text-ink">{title}</h3>
      <p className="mt-2 flex-1 text-[0.9375rem] leading-relaxed text-ink-soft">{body}</p>
      {children ? <div className="mt-5">{children}</div> : null}
    </div>
  );
}
