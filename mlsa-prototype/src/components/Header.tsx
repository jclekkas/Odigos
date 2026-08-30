import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, Search as SearchIcon, ArrowRight } from 'lucide-react';
import { useLang } from '@/i18n/LanguageContext';
import { Wordmark } from './Wordmark';
import { QuickExit } from './QuickExit';
import { LanguageToggle } from './LanguageToggle';
import { MobileNavigation } from './MobileNavigation';
import { PRIMARY_NAV } from './navigation';
import { cx } from './primitives';

/**
 * The header, in two rows on desktop.
 *
 * Language, search and Quick Exit are utilities — they belong on a thin bar
 * above the masthead, not competing with navigation. Trying to fit all of it on
 * one row is what makes institutional headers wrap and look cramped. Quick Exit
 * is duplicated into the mobile row because it is a safety control and must be
 * reachable at every width without opening a menu.
 */
export function Header({ onOpenSearch }: { onOpenSearch: () => void }) {
  const { t, copy } = useLang();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  // Navigating always closes the drawer, including via browser Back.
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname, location.hash]);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/95 backdrop-blur supports-[backdrop-filter]:bg-canvas/85">
      {/*
        Utility bar at every width.
        Language, search and Quick Exit are utilities and get their own row.
        On mobile this is what frees the masthead to show the organisation's
        full name instead of clipping it — and it puts Español and Quick Exit
        one tap away rather than behind the menu, which is the point of both.
      */}
      <div className="border-b border-line/70">
        <div className="shell flex items-center justify-end gap-1 py-1.5 sm:gap-1.5">
          <LanguageToggle className="min-h-[36px] border-0 bg-transparent px-2.5 hover:bg-primary-tint sm:px-3" />
          <button
            type="button"
            onClick={onOpenSearch}
            className="btn min-h-[36px] whitespace-nowrap border-0 bg-transparent px-2.5 text-sm font-semibold text-ink-soft hover:bg-primary-tint hover:text-primary sm:px-3"
          >
            <SearchIcon aria-hidden="true" className="h-4 w-4 shrink-0" />
            <span>{t(copy.global.search)}</span>
          </button>
          <QuickExit className="min-h-[36px]" />
        </div>
      </div>

      {/* Masthead */}
      <div className="shell">
        <div className="flex h-[4.25rem] items-center justify-between gap-2 sm:gap-6">
          <Wordmark />

          <nav
            aria-label={t(copy.nav.primaryLabel)}
            className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 lg:flex xl:gap-1"
          >
            {PRIMARY_NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  cx(
                    'relative flex min-h-[44px] items-center whitespace-nowrap rounded px-2.5 text-[0.9375rem] font-medium transition-colors xl:px-3',
                    // Active state is carried by weight and an underline bar,
                    // never by colour alone.
                    isActive
                      ? 'font-semibold text-primary after:absolute after:inset-x-2.5 after:bottom-1 after:h-0.5 after:rounded-full after:bg-primary xl:after:inset-x-3'
                      : 'text-ink-soft hover:text-ink',
                  )
                }
              >
                {t(item.label)}
              </NavLink>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <Link
              to="/get-help"
              className="btn-primary hidden whitespace-nowrap px-4 text-sm sm:inline-flex"
            >
              <span>{t(copy.global.getLegalHelp)}</span>
              <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0" />
            </Link>

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-expanded={menuOpen}
              aria-haspopup="dialog"
              className="btn min-h-[44px] shrink-0 border border-line-strong bg-surface px-2 text-sm font-semibold text-ink-soft hover:border-primary hover:text-primary sm:px-3 lg:hidden"
            >
              <Menu aria-hidden="true" className="h-5 w-5 shrink-0" />
              <span className="hidden sm:inline">{t(copy.global.menu)}</span>
              <span className="sr-only sm:hidden">{t(copy.global.openMenu)}</span>
            </button>
          </div>
        </div>
      </div>

      <MobileNavigation
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onOpenSearch={() => {
          setMenuOpen(false);
          onOpenSearch();
        }}
      />
    </header>
  );
}
