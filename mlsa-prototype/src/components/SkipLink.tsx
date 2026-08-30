import { useLang } from '@/i18n/LanguageContext';

/**
 * Skip link. Hidden until focused, then rendered as a full-size, high-contrast
 * control — a skip link that is hard to see once focused is not a skip link.
 */
export function SkipLink() {
  const { t, copy } = useLang();
  return (
    <a
      href="#main"
      className="sr-only-focusable absolute left-4 top-4 z-[60] rounded-card bg-primary px-5 py-3 text-base font-semibold text-white shadow-lift"
    >
      {t(copy.global.skipToContent)}
    </a>
  );
}
