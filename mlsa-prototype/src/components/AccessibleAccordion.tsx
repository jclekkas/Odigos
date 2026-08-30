import { useId, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cx } from './primitives';

export interface AccordionItem {
  q: string;
  a: string;
}

/**
 * An accordion built on the disclosure pattern.
 *
 * Each header is a real <button> inside a heading, with `aria-expanded` and
 * `aria-controls` wired to its panel. Multiple panels may be open at once —
 * auto-collapsing the previous one is a common flourish that loses a user's
 * place, and this content is reference material people compare.
 *
 * The chevron rotates, but the state is also carried by `aria-expanded` and by
 * the panel simply being visible, so nothing depends on noticing an icon.
 */
export function AccessibleAccordion({
  items,
  headingLevel = 3,
}: {
  items: AccordionItem[];
  headingLevel?: 2 | 3 | 4;
}) {
  const baseId = useId();
  const [openIds, setOpenIds] = useState<Set<number>>(() => new Set());
  const Heading = `h${headingLevel}` as 'h2' | 'h3' | 'h4';

  const toggle = (index: number) => {
    setOpenIds((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  return (
    <div className="divide-y divide-line overflow-hidden rounded-card border border-line bg-surface">
      {items.map((item, index) => {
        const isOpen = openIds.has(index);
        const buttonId = `${baseId}-button-${index}`;
        const panelId = `${baseId}-panel-${index}`;

        return (
          <div key={item.q}>
            <Heading className="m-0">
              <button
                type="button"
                id={buttonId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(index)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-[1.0625rem] font-semibold text-ink hover:bg-sunk sm:px-6"
              >
                <span>{item.q}</span>
                <ChevronDown
                  aria-hidden="true"
                  className={cx(
                    'h-5 w-5 shrink-0 text-primary transition-transform duration-200 motion-reduce:transition-none',
                    isOpen && 'rotate-180',
                  )}
                />
              </button>
            </Heading>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              hidden={!isOpen}
              className="px-5 pb-5 sm:px-6"
            >
              <p className="max-w-measure text-[0.9375rem] leading-relaxed text-ink-soft">{item.a}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
