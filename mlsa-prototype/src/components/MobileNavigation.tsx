import { Link, NavLink } from 'react-router-dom';
import { X, Search as SearchIcon, ArrowRight, Phone } from 'lucide-react';
import { useLang } from '@/i18n/LanguageContext';
import { useDialog } from '@/hooks/useDialog';
import { HELPLINE } from '@/data/organization';
import { LanguageToggle } from './LanguageToggle';
import { QuickExit, QuickExitNote } from './QuickExit';
import { PRIMARY_NAV } from './navigation';
import { cx } from './primitives';

/**
 * The mobile navigation drawer.
 *
 * A real dialog: `role="dialog"`, `aria-modal`, focus trapped inside, Escape to
 * close, focus returned to the menu button afterwards, and the page behind it
 * locked from scrolling. All of that comes from `useDialog`, shared with the
 * search overlay so the two behave the same way under a keyboard.
 *
 * Ordering matches the desktop header, and the two things a person in trouble
 * needs — apply, and call — sit above the fold of the drawer, not at the end.
 */
export function MobileNavigation({
  open,
  onClose,
  onOpenSearch,
}: {
  open: boolean;
  onClose: () => void;
  onOpenSearch: () => void;
}) {
  const { t, copy } = useLang();
  const panelRef = useDialog(open, onClose);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Clicking the scrim closes the drawer; it is not itself focusable, and
          the close button below covers the accessible path. */}
      <div
        className="absolute inset-0 bg-ink/45"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={t(copy.global.menu)}
        tabIndex={-1}
        className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col overflow-y-auto bg-canvas shadow-overlay"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <p className="text-sm font-semibold text-ink-muted">{t(copy.global.menu)}</p>
          <button
            type="button"
            onClick={onClose}
            className="btn min-h-[44px] border border-line-strong bg-surface px-3 text-sm font-semibold text-ink-soft hover:border-primary hover:text-primary"
          >
            <X aria-hidden="true" className="h-4 w-4" />
            <span>{t(copy.global.closeMenu)}</span>
          </button>
        </div>

        <div className="flex flex-col gap-3 border-b border-line px-5 py-4">
          <Link to="/get-help" className="btn-primary w-full">
            <span>{t(copy.global.getLegalHelp)}</span>
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
          <a href={HELPLINE.phoneHref} className="btn-secondary w-full">
            <Phone aria-hidden="true" className="h-4 w-4" />
            <span>{HELPLINE.phoneDisplay}</span>
          </a>
        </div>

        <nav aria-label={t(copy.nav.primaryLabel)} className="px-5 py-2">
          <ul className="flex flex-col">
            {PRIMARY_NAV.map((item) => (
              <li key={item.to} className="border-b border-line last:border-b-0">
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    cx(
                      'flex min-h-[52px] items-center justify-between gap-3 py-3 text-[1.0625rem]',
                      isActive ? 'font-semibold text-primary' : 'font-medium text-ink',
                    )
                  }
                >
                  <span>{t(item.label)}</span>
                  <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0 text-ink-muted" />
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-auto flex flex-col gap-3 border-t border-line px-5 py-4">
          <button
            type="button"
            onClick={onOpenSearch}
            className="btn min-h-[44px] w-full border border-line-strong bg-surface text-sm font-semibold text-ink-soft hover:border-primary hover:text-primary"
          >
            <SearchIcon aria-hidden="true" className="h-4 w-4" />
            <span>{t(copy.global.search)}</span>
          </button>
          <LanguageToggle full />
          <QuickExit full />
          <QuickExitNote />
        </div>
      </div>
    </div>
  );
}
