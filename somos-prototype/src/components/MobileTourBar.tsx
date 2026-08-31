import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/Button';
import { cn } from '@/lib/cn';

/**
 * Appears once a visitor has committed to reading, and stays out of the way on
 * the page where the tour form already is.
 */
export function MobileTourBar() {
  const [visible, setVisible] = useState(false);
  const { pathname } = useLocation();
  const suppressed = pathname.startsWith('/admissions');

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 620);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (suppressed) return null;

  return (
    <div
      aria-hidden={!visible}
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-cream-50/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md transition-transform duration-300 ease-somos sm:hidden',
        visible ? 'translate-y-0' : 'translate-y-full'
      )}
    >
      <div className="flex items-center gap-3">
        <p className="min-w-0 flex-1 text-[0.82rem] leading-snug text-ink-muted">
          Germantown &amp; Ellicott City
          <span className="block font-semibold text-ink">Visits available year-round</span>
        </p>
        <Button to="/admissions" size="sm" className="shrink-0" tabIndex={visible ? 0 : -1}>
          Schedule a Tour
        </Button>
      </div>
    </div>
  );
}
