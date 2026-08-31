import { useId, useState } from 'react';
import { cn } from '@/lib/cn';

export type Faq = { q: string; a: string };

export function FAQAccordion({ items, className }: { items: readonly Faq[]; className?: string }) {
  const [open, setOpen] = useState<number | null>(0);
  const baseId = useId();

  return (
    <div className={cn('divide-y divide-ink/10 border-y border-ink/10', className)}>
      {items.map((item, i) => {
        const isOpen = open === i;
        const panelId = `${baseId}-panel-${i}`;
        const buttonId = `${baseId}-button-${i}`;
        return (
          <div key={item.q}>
            <h3>
              <button
                type="button"
                id={buttonId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-start justify-between gap-6 py-6 text-left"
              >
                <span className="font-display text-[1.16rem] leading-snug text-ink">
                  {item.q}
                </span>
                <span
                  aria-hidden="true"
                  className={cn(
                    'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-ink/15 transition-[transform,background-color,border-color] duration-300 ease-somos',
                    isOpen && 'rotate-45 border-grass-600 bg-grass-600 text-white'
                  )}
                >
                  <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
                    <path d="M8 2.5v11M2.5 8h11" />
                  </svg>
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              hidden={!isOpen}
              className="pb-7 pr-12"
            >
              <p className="max-w-prose leading-relaxed text-ink-muted">{item.a}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
