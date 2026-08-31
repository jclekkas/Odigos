import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';

/**
 * Visual-only in this prototype: the Spanish site is represented, not built.
 * Selecting ES announces its status rather than leaving a dead control.
 */
export function LanguageToggle({ onDark = false }: { onDark?: boolean }) {
  const [lang, setLang] = useState<'en' | 'es'>('en');

  useEffect(() => {
    if (lang !== 'es') return;
    const t = window.setTimeout(() => setLang('en'), 3200);
    return () => window.clearTimeout(t);
  }, [lang]);

  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          'inline-flex items-center rounded-pill border p-0.5',
          onDark ? 'border-cream-100/30' : 'border-ink/15'
        )}
      >
        {(['en', 'es'] as const).map((code) => (
          <button
            key={code}
            type="button"
            aria-pressed={lang === code}
            onClick={() => setLang(code)}
            className={cn(
              'min-h-[32px] rounded-pill px-2.5 text-[0.72rem] font-bold uppercase tracking-[0.1em] transition-colors duration-200',
              lang === code
                ? 'bg-ink text-cream-50'
                : onDark
                  ? 'text-cream-100/70 hover:text-cream-50'
                  : 'text-ink-soft hover:text-ink'
            )}
          >
            {code}
          </button>
        ))}
      </div>
      <span
        role="status"
        className={cn(
          'text-[0.72rem] transition-opacity duration-300',
          lang === 'es' ? 'opacity-100' : 'opacity-0',
          onDark ? 'text-cream-100/70' : 'text-ink-soft'
        )}
      >
        {lang === 'es' ? 'Español — próximamente' : ''}
      </span>
    </div>
  );
}
