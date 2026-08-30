import { LogOut } from 'lucide-react';
import { QUICK_EXIT_URL } from '@/data/organization';
import { useLang } from '@/i18n/LanguageContext';
import { cx } from './primitives';

/**
 * Quick Exit.
 *
 * Deliberately a calm utility rather than an alarm. Two details matter:
 *
 *  1. `location.replace` rather than `assign`, so the current page is not left
 *     one Back press away.
 *  2. We say plainly that it does not clear history. A safety control that
 *     over-promises is worse than no safety control, because someone will rely
 *     on it. The honest limitation is stated wherever the button appears.
 */
export function QuickExit({ className, full = false }: { className?: string; full?: boolean }) {
  const { t, copy } = useLang();

  const exit = () => {
    // Replace the current entry, then open a neutral destination.
    window.location.replace(QUICK_EXIT_URL);
  };

  return (
    <button
      type="button"
      onClick={exit}
      className={cx(
        'btn min-h-[44px] whitespace-nowrap border-2 border-accent-border bg-accent-tint px-2 text-[0.75rem] font-semibold text-accent hover:bg-accent hover:text-white sm:px-3.5 sm:text-sm',
        full && 'w-full',
        className,
      )}
    >
      <LogOut aria-hidden="true" className="h-4 w-4 shrink-0" />
      <span>{t(copy.global.quickExit)}</span>
    </button>
  );
}

/** The plain-language caveat that must travel with the button. */
export function QuickExitNote({ className }: { className?: string }) {
  const { t, copy } = useLang();
  return (
    <p className={cx('text-sm leading-relaxed text-ink-muted', className)}>
      {t(copy.global.quickExitHelp)}
    </p>
  );
}
