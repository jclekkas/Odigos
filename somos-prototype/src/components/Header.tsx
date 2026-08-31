import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { primaryNav } from '@/data/site';
import { locations } from '@/data/locations';
import { Button } from '@/components/Button';
import { Logo } from '@/components/Logo';
import { LanguageToggle } from '@/components/LanguageToggle';
import { cn } from '@/lib/cn';
import { PILLAR_ACCENTS } from '@/lib/accents';

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <>
      <a
        href="#main"
        className="sr-only rounded-pill bg-ink px-5 py-3 text-cream-50 focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70]"
      >
        Skip to content
      </a>

      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,border-color] duration-300 ease-somos',
          scrolled
            ? 'border-b border-ink/10 bg-cream-50/92 shadow-[0_6px_24px_-20px_rgba(43,38,34,0.6)] backdrop-blur-md'
            : 'border-b border-transparent bg-cream-50/80 backdrop-blur-sm'
        )}
      >
        <div className="container-somos">
          <div
            className={cn(
              'flex items-center justify-between gap-6 transition-[height] duration-300 ease-somos',
              scrolled ? 'h-[68px]' : 'h-[84px]'
            )}
          >
            <Logo />

            <nav aria-label="Primary" className="hidden lg:block">
              <ul className="flex items-center gap-1">
                {primaryNav.map((item) => (
                  <li key={item.href}>
                    <NavLink
                      to={item.href}
                      className={({ isActive }) =>
                        cn(
                          'relative inline-flex min-h-[40px] items-center rounded-pill px-3.5 text-[0.94rem] font-medium transition-colors duration-200',
                          isActive
                            ? 'text-coral-700'
                            : 'text-ink-muted hover:text-ink'
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {item.label}
                          <span
                            aria-hidden="true"
                            className={cn(
                              'absolute inset-x-3.5 -bottom-0.5 h-[2px] rounded-full bg-coral-600 transition-transform duration-300 ease-somos',
                              isActive ? 'scale-x-100' : 'scale-x-0'
                            )}
                          />
                        </>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="hidden items-center gap-4 lg:flex">
              <LanguageToggle />
              <Button to="/admissions" size="sm" withArrow>
                Schedule a Tour
              </Button>
            </div>

            <div className="flex items-center gap-2 lg:hidden">
              <Button to="/admissions" size="sm" className="px-4 text-[0.86rem] sm:px-5 sm:text-[0.9rem]">
                Schedule a Tour
              </Button>
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-controls="mobile-menu"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-ink/15 text-ink transition-colors hover:bg-ink/[0.04]"
              >
                <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
                  {open ? (
                    <>
                      <path d="M6 6l12 12" />
                      <path d="M18 6 6 18" />
                    </>
                  ) : (
                    <>
                      <path d="M3.5 7h17" />
                      <path d="M3.5 12h17" />
                      <path d="M3.5 17h17" />
                    </>
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <nav
        id="mobile-menu"
        aria-label="Mobile"
        hidden={!open}
        className="fixed inset-0 z-40 overflow-y-auto bg-cream-50 pt-[84px] lg:hidden"
      >
        <div className="container-somos pb-16 pt-6">
          <ul className="space-y-2.5">
              {primaryNav.map((item, i) => {
                const accent = PILLAR_ACCENTS[i % PILLAR_ACCENTS.length];
                return (
                  <li key={item.href}>
                    <Link
                      to={item.href}
                      className={cn(
                        'flex min-h-[64px] items-center justify-between rounded-card px-5 font-display text-[1.35rem] font-bold text-ink',
                        accent.bg
                      )}
                    >
                      {item.label}
                      <span
                        aria-hidden="true"
                        className={cn('flex h-8 w-8 items-center justify-center rounded-full', accent.chip)}
                      >
                        <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 10h11M11 5.5 15.5 10 11 14.5" />
                        </svg>
                      </span>
                    </Link>
                  </li>
                );
              })}
          </ul>

          <Button to="/admissions" size="lg" className="mt-8 w-full" withArrow>
            Schedule a Tour
          </Button>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {locations.map((loc) => (
              <div key={loc.slug} className="rounded-card border-2 border-ink/[0.07] bg-white p-5">
                <p className="font-display text-lg">{loc.city}</p>
                <p className="mt-1 text-sm text-ink-muted">
                  {loc.street}
                  <br />
                  {loc.cityStateZip}
                </p>
                <a
                  href={`tel:${loc.phone.replace(/\D/g, '')}`}
                  className="mt-3 inline-flex min-h-[44px] items-center font-semibold text-coral-700 underline-offset-4 hover:underline"
                >
                  {loc.phone}
                </a>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <LanguageToggle />
          </div>
        </div>
      </nav>
    </>
  );
}
