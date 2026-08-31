import type { ElementType, ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function Container({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={cn('container-somos', className)}>{children}</div>;
}

type SectionProps = {
  id?: string;
  as?: ElementType;
  tone?: 'cream' | 'white' | 'grass' | 'sky' | 'sun' | 'berry' | 'skyBold' | 'sunBold';
  /** Soft rounded shoulder where this section meets the one above it. */
  curve?: boolean;
  spacing?: 'default' | 'tight' | 'loose';
  className?: string;
  children: ReactNode;
};

const TONE: Record<NonNullable<SectionProps['tone']>, string> = {
  cream: 'bg-cream-50 text-ink',
  white: 'bg-white text-ink',
  grass: 'bg-grass-50 text-ink',
  sky: 'bg-sky-50 text-ink',
  sun: 'bg-sun-50 text-ink',
  berry: 'bg-berry-50 text-ink',
  skyBold: 'bg-sky-300 text-ink',
  sunBold: 'bg-sun-300 text-ink',
};

const SPACING: Record<NonNullable<SectionProps['spacing']>, string> = {
  tight: 'py-14 sm:py-16',
  default: 'py-20 sm:py-24 lg:py-28',
  loose: 'py-24 sm:py-32 lg:py-40',
};

export function Section({
  id,
  as: Tag = 'section',
  tone = 'cream',
  spacing = 'default',
  curve = false,
  className,
  children,
}: SectionProps) {
  return (
    <Tag
      id={id}
      className={cn(
        TONE[tone],
        SPACING[spacing],
        curve && 'relative rounded-t-[2rem] sm:rounded-t-[3.5rem]',
        className
      )}
    >
      {children}
    </Tag>
  );
}

export function Eyebrow({ children, onDark }: { children: ReactNode; onDark?: boolean }) {
  return (
    <p className={cn('eyebrow', onDark && 'bg-white/25 text-white')}>{children}</p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  lede,
  align = 'left',
  onDark = false,
  as: Tag = 'h2',
  size = 'md',
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  lede?: ReactNode;
  align?: 'left' | 'center';
  onDark?: boolean;
  as?: ElementType;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const sizes = {
    sm: 'text-display-sm',
    md: 'text-display-md',
    lg: 'text-display-lg',
  } as const;
  return (
    <div
      className={cn(
        'max-w-3xl',
        align === 'center' && 'mx-auto text-center',
        className
      )}
    >
      {eyebrow ? <Eyebrow onDark={onDark}>{eyebrow}</Eyebrow> : null}
      <Tag
        className={cn(
          sizes[size],
          eyebrow ? 'mt-4' : '',
          onDark ? 'text-cream-50' : 'text-ink'
        )}
      >
        {title}
      </Tag>
      {lede ? (
        <p className={cn('lede mt-5', onDark && 'text-cream-100/80')}>{lede}</p>
      ) : null}
    </div>
  );
}
