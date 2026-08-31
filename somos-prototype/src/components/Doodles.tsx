import { cn } from '@/lib/cn';

/**
 * A small, deliberately limited set of hand-drawn marks — an underline, a
 * scatter of dots, a sun, a star, an arch. Used sparingly to give the page
 * personality without tipping into clip art.
 */

export function Squiggle({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 240 16"
      preserveAspectRatio="none"
      className={cn('absolute -bottom-[0.12em] left-0 h-[0.3em] w-full', className)}
    >
      <path
        d="M3 11.5C42 5 78 4.2 118 7.2c38 2.8 74 4.4 119 1.3"
        fill="none"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Sun({ className }: { className?: string }) {
  const rays = Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2;
    return (
      <line
        key={i}
        x1={32 + Math.cos(a) * 19}
        y1={32 + Math.sin(a) * 19}
        x2={32 + Math.cos(a) * 27}
        y2={32 + Math.sin(a) * 27}
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
      />
    );
  });
  return (
    <svg aria-hidden="true" viewBox="0 0 64 64" className={className}>
      {rays}
      <circle cx="32" cy="32" r="13" fill="currentColor" />
    </svg>
  );
}

export function Star({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" className={className}>
      <path
        d="M24 3c1.8 10.4 5.2 15.6 15.6 18.5C29.2 24.4 25.8 29.6 24 45c-1.8-15.4-5.2-20.6-15.6-23.5C18.8 18.6 22.2 13.4 24 3Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function Dots({ className, rows = 3, cols = 6 }: { className?: string; rows?: number; cols?: number }) {
  const circles = [];
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      circles.push(<circle key={`${x}-${y}`} cx={6 + x * 14} cy={6 + y * 14} r="3.4" fill="currentColor" />);
    }
  }
  return (
    <svg aria-hidden="true" viewBox={`0 0 ${cols * 14} ${rows * 14}`} className={className}>
      {circles}
    </svg>
  );
}

export function Arch({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 80 80" className={className}>
      <path d="M8 80V40a32 32 0 0 1 64 0v40Z" fill="currentColor" />
    </svg>
  );
}

/** Wavy divider used between big colour bands. */
export function Wave({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1440 48"
      preserveAspectRatio="none"
      className={cn('block h-6 w-full sm:h-10', className)}
    >
      <path d="M0 22c180 26 320-24 520-6s300 34 470 12 290-30 450-4V48H0Z" fill="currentColor" />
    </svg>
  );
}
