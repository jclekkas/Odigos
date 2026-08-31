import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'sunny' | 'quiet' | 'onDark' | 'onDarkGhost';
type Size = 'sm' | 'md' | 'lg';

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-pill font-display font-bold tracking-[-0.01em] transition-[background-color,color,border-color,transform,box-shadow] duration-200 ease-bounce hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-coral-600 text-white shadow-pop hover:bg-coral-700',
  secondary:
    'border-2 border-ink/15 bg-white text-ink shadow-soft hover:border-ink/30 hover:bg-cream-50',
  sunny: 'bg-sun-400 text-ink shadow-[0_4px_0_0_rgba(143,101,10,0.3)] hover:bg-sun-300',
  quiet: 'text-coral-700 underline decoration-2 decoration-coral-200 underline-offset-4 hover:decoration-coral-500 px-0',
  onDark: 'bg-white text-ink shadow-soft hover:bg-cream-50',
  onDarkGhost: 'border-2 border-white/70 text-white hover:border-white hover:bg-white/15',
};

const SIZES: Record<Size, string> = {
  sm: 'min-h-[44px] px-5 text-[0.92rem]',
  md: 'min-h-[52px] px-7 text-[1rem]',
  lg: 'min-h-[60px] px-8 text-[1.08rem]',
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
