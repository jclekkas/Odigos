import { Link } from 'react-router-dom';
import { useLang } from '@/i18n/LanguageContext';
import { cx } from './primitives';

/**
 * A plain text wordmark — on purpose.
 *
 * MLSA's identity is not ours to replace, and a speculative logo drawn before
 * brand discovery would be the single most presumptuous thing in this
 * prototype. So the mark is set type: the organisation's real name, in the
 * provisional type scale, with the initials as an anchor. If MLSA's existing
 * mark were licensed for this use it would drop in here without any other
 * change.
 *
 * Two line-break lockups rather than one that wraps: at 375px, alongside a
 * Quick Exit button and a menu button, an auto-wrapping name breaks to three
 * ragged lines. The breaks are chosen, not left to the browser.
 */
export function Wordmark({ className }: { className?: string }) {
  const { t, copy } = useLang();

  return (
    <Link
      to="/"
      className={cx('group inline-flex min-w-0 items-center gap-2 rounded sm:gap-2.5', className)}
      aria-label={`${t(copy.global.orgName)} — ${t(copy.global.home)}`}
    >
      <span
        aria-hidden="true"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-primary text-[0.75rem] font-bold tracking-tight text-white sm:h-10 sm:w-10 sm:text-[0.8125rem]"
      >
        MLSA
      </span>

      {/* The accessible name comes from aria-label above, so these visual
          lockups are hidden from assistive technology to avoid a double read. */}
      <span aria-hidden="true" className="min-w-0 overflow-hidden leading-tight">
        {/* Compact lockup — below sm */}
        <span className="block sm:hidden">
          <span className="block whitespace-nowrap text-[0.8125rem] font-semibold text-ink">
            Montana Legal
          </span>
          <span className="block whitespace-nowrap text-[0.8125rem] font-semibold text-ink">
            Services Association
          </span>
        </span>

        {/* Full lockup — sm and up */}
        <span className="hidden sm:block">
          <span className="block whitespace-nowrap text-[0.9375rem] font-semibold text-ink lg:text-base">
            Montana Legal Services
          </span>
          <span className="block whitespace-nowrap text-xs font-medium text-ink-muted">
            Association
          </span>
        </span>
      </span>
    </Link>
  );
}
