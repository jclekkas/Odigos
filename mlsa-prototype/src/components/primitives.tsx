import { forwardRef, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, type LucideIcon } from 'lucide-react';
import { useLang } from '@/i18n/LanguageContext';

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/** Horizontal page gutter. One place to change the shell width. */
export function Shell({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx('shell', className)}>{children}</div>;
}

/**
 * A page section. `as` lets a caller keep the landmark semantics honest —
 * not every visual band is a <section> worth announcing.
 */
export function Section({
  children,
  className,
  id,
  labelledBy,
  tone = 'canvas',
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  labelledBy?: string;
  tone?: 'canvas' | 'surface' | 'sunk' | 'deep';
}) {
  const tones = {
    canvas: 'bg-canvas',
    surface: 'bg-surface',
    sunk: 'bg-sunk',
    deep: 'bg-primary-deep text-white on-dark',
  } as const;

  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cx('py-14 sm:py-16 lg:py-20', tones[tone], className)}
    >
      <Shell>{children}</Shell>
    </section>
  );
}

/** Section heading + optional lead, with consistent spacing and hierarchy. */
export function SectionHeader({
  id,
  eyebrow,
  title,
  lead,
  align = 'left',
  serif = false,
  onDark = false,
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  lead?: string;
  align?: 'left' | 'center';
  serif?: boolean;
  /** Invert the type ramp for the deep-primary band. */
  onDark?: boolean;
}) {
  return (
    <div className={cx('mb-8 sm:mb-10', align === 'center' && 'mx-auto text-center')}>
      {eyebrow ? (
        <p className={cx('eyebrow mb-3', onDark && 'text-white/70')}>{eyebrow}</p>
      ) : null}
      <h2
        id={id}
        className={cx(
          'text-fluid-h2',
          onDark ? 'text-white' : 'text-ink',
          serif && 'font-serif font-semibold',
          align === 'center' ? 'mx-auto max-w-3xl' : 'max-w-3xl',
        )}
      >
        {title}
      </h2>
      {lead ? (
        <p
          className={cx(
            'mt-4 prose-measure',
            onDark && 'text-white/85',
            align === 'center' && 'mx-auto',
          )}
        >
          {lead}
        </p>
      ) : null}
    </div>
  );
}

/**
 * An outbound link. Always announces that it leaves the site — descriptive
 * link text is not enough when the destination is a different organisation's
 * property, and "opens in a new tab" must be spoken, not just drawn.
 */
export const ExternalTextLink = forwardRef<
  HTMLAnchorElement,
  { href: string; children: ReactNode; className?: string; showIcon?: boolean }
>(function ExternalTextLink({ href, children, className, showIcon = true }, ref) {
  const { t, copy } = useLang();
  return (
    <a
      ref={ref}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cx('inline-flex items-center gap-1.5', className)}
    >
      <span>{children}</span>
      {showIcon ? <ExternalLink aria-hidden="true" className="h-4 w-4 shrink-0" /> : null}
      <span className="sr-only"> ({t(copy.global.opensInNewTab)})</span>
    </a>
  );
});

/**
 * One button component that renders as a router Link, an anchor or a button
 * depending on what it actually does. Keeps semantics correct: navigation is a
 * link, action is a button.
 */
type ButtonVariant = 'primary' | 'secondary' | 'quiet' | 'on-dark';

const variantClass: Record<ButtonVariant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  quiet: 'btn-quiet',
  'on-dark': 'btn-on-dark',
};

export function ActionButton({
  to,
  href,
  onClick,
  variant = 'primary',
  className,
  children,
  icon: Icon,
  external,
}: {
  to?: string;
  href?: string;
  onClick?: () => void;
  variant?: ButtonVariant;
  className?: string;
  children: ReactNode;
  icon?: LucideIcon;
  external?: boolean;
}) {
  const { t, copy } = useLang();
  const classes = cx(variantClass[variant], className);
  const content = (
    <>
      {Icon ? <Icon aria-hidden="true" className="h-5 w-5 shrink-0" /> : null}
      <span>{children}</span>
      {external ? (
        <>
          <ExternalLink aria-hidden="true" className="h-4 w-4 shrink-0 opacity-80" />
          <span className="sr-only"> ({t(copy.global.opensInNewTab)})</span>
        </>
      ) : null}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes}>
        {content}
      </Link>
    );
  }
  if (href) {
    return (
      <a
        href={href}
        className={classes}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {content}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} className={classes}>
      {content}
    </button>
  );
}

/** A small labelled chip. Never the only carrier of meaning. */
export function Tag({
  children,
  tone = 'neutral',
  className,
}: {
  children: ReactNode;
  tone?: 'neutral' | 'primary' | 'accent' | 'notice';
  className?: string;
}) {
  const tones = {
    neutral: 'bg-sunk text-ink-soft border-line',
    primary: 'bg-primary-tint text-primary-deep border-primary-border',
    accent: 'bg-accent-tint text-accent border-accent-border',
    notice: 'bg-notice-tint text-notice border-notice-border',
  } as const;
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
