import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useLang } from '@/i18n/LanguageContext';

/**
 * Breadcrumb. `aria-current="page"` marks the final crumb, which is plain text
 * rather than a link to the page you are already on.
 */
export function Breadcrumb({ current }: { current: string }) {
  const { t, copy } = useLang();

  return (
    <nav aria-label={t(copy.global.breadcrumb)} className="mb-6">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-ink-muted">
        <li>
          <Link
            to="/"
            className="inline-flex min-h-[32px] items-center font-medium text-primary underline decoration-primary/40 underline-offset-[3px] hover:decoration-primary"
          >
            {t(copy.global.home)}
          </Link>
        </li>
        <li aria-hidden="true" className="flex items-center">
          <ChevronRight aria-hidden="true" className="h-4 w-4" />
        </li>
        <li aria-current="page" className="font-medium text-ink-soft">
          {current}
        </li>
      </ol>
    </nav>
  );
}
