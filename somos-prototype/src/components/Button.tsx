import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'quiet' | 'onDark' | 'onDarkGhost';
type Size = 'sm' | 'md' | 'lg';

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-pill font-semibold tracking-[-0.005em] transition-[background-color,color,border-color,transform,box-shadow] duration-200 ease-somos active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60';

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-clay-600 text-white shadow-soft hover:bg-clay-700 hover:shadow-lift',
  secondary:
    'border border-ink/20 bg-transparent text-ink hover:border-ink/45 hover:bg-ink/[0.04]',
  quiet: 'text-clay-700 underline-offset-4 hover:underline px-0',
  onDark: 'bg-cream-50 text-ink hover:bg-white shadow-soft',
  onDarkGhost:
    'border border-cream-100/40 text-cream-50 hover:border-cream-100/80 hover:bg-cream-50/10',
};

const SIZES: Record<Size, string> = {
  sm: 'min-h-[40px] px-4 text-[0.9rem]',
  md: 'min-h-[48px] px-6 text-[0.98rem]',
  lg: 'min-h-[54px] px-7 text-[1.02rem]',
};

type Common = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
  withArrow?: boolean;
};

function Inner({ children, withArrow }: { children: ReactNode; withArrow?: boolean }) {
  return (
    <>
      <span>{children}</span>
      {withArrow ? (
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          className="h-4 w-4 shrink-0 transition-transform duration-200 ease-somos group-hover:translate-x-0.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 10h11M11 5.5 15.5 10 11 14.5" />
        </svg>
      ) : null}
    </>
  );
}

export function Button({
  to,
  href,
  type = 'button',
  onClick,
  variant = 'primary',
  size = 'md',
  className,
  children,
  withArrow,
  ...rest
}: Common & {
  to?: string;
  href?: string;
  type?: 'button' | 'submit';
  onClick?: () => void;
  'aria-label'?: string;
  tabIndex?: number;
}) {
  const classes = cn('group', BASE, VARIANTS[variant], variant !== 'quiet' && SIZES[size], className);
  if (to) {
    return (
      <Link to={to} className={classes} onClick={onClick} {...rest}>
        <Inner withArrow={withArrow}>{children}</Inner>
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} className={classes} onClick={onClick} {...rest}>
        <Inner withArrow={withArrow}>{children}</Inner>
      </a>
    );
  }
  return (
    <button type={type} className={classes} onClick={onClick} {...rest}>
      <Inner withArrow={withArrow}>{children}</Inner>
    </button>
  );
}
