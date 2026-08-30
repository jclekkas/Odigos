import { Languages } from 'lucide-react';
import { useLang } from '@/i18n/LanguageContext';
import { cx } from './primitives';

/**
 * The language control.
 *
 * Not a translate widget. This switches a hand-written Spanish content deck and
 * updates `document.documentElement.lang`, so assistive technology switches its
 * pronunciation with it. The label is always written in the language being
 * offered — a Spanish speaker looking for a way in should see "Español", not
 * the English word "Spanish".
 */
export function LanguageToggle({ className, full = false }: { className?: string; full?: boolean }) {
  const { lang, setLang } = useLang();
  const next = lang === 'en' ? 'es' : 'en';
  const label = next === 'es' ? 'Español' : 'English';

  return (
    <button
      type="button"
      onClick={() => setLang(next)}
      lang={next}
      // The visible label is one word; the accessible name says what pressing it does.
      aria-label={next === 'es' ? 'Cambiar a español — switch to Spanish' : 'Switch to English — cambiar a inglés'}
      className={cx(
        'btn min-h-[44px] border border-line-strong bg-surface px-3.5 text-sm font-semibold text-ink-soft hover:border-primary hover:text-primary',
        full && 'w-full',
        className,
      )}
    >
      <Languages aria-hidden="true" className="h-4 w-4 shrink-0" />
      <span>{label}</span>
    </button>
  );
}
