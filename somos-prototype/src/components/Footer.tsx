import { Link } from 'react-router-dom';
import { footerNav, legalNav, site } from '@/data/site';
import { locations } from '@/data/locations';
import { LogoBadge } from '@/components/Logo';

export function Footer() {
  const year = 2026;
  return (
    <footer className="bg-cream-100 text-ink">
      <div aria-hidden="true" className="flex h-1.5">
        <span className="flex-1 bg-coral-500" />
        <span className="flex-1 bg-sun-500" />
        <span className="flex-1 bg-grass-500" />
        <span className="flex-1 bg-sky-500" />
        <span className="flex-1 bg-berry-300" />
      </div>
      <div className="container-somos py-16 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr_1.4fr]">
          <div>
            <LogoBadge className="h-32 w-32" />
            <p className="mt-5 max-w-sm text-[0.97rem] leading-relaxed text-ink-muted">
              A bilingual Montessori early-learning community for children ages 2–5,
              helping young children become independent, curious and kind.
            </p>
            <a
              href={`mailto:${site.email}`}
              className="mt-6 inline-flex min-h-[44px] items-center text-[0.97rem] font-semibold text-grass-700 underline decoration-grass-200 underline-offset-4 transition-colors hover:decoration-grass-600"
            >
              {site.email}
            </a>
          </div>

          <nav aria-label="Footer">
            <h2 className="text-eyebrow font-extrabold uppercase tracking-[0.14em] text-grass-700">
              Explore
            </h2>
            <ul className="mt-5 space-y-1">
              {footerNav.map((item) => (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className="inline-flex min-h-[40px] items-center text-[0.97rem] text-ink-muted transition-colors hover:text-grass-700"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-eyebrow font-extrabold uppercase tracking-[0.14em] text-grass-700">
              Our Schools
            </h2>
            <div className="mt-5 grid gap-8 sm:grid-cols-2">
              {locations.map((loc) => (
                <div key={loc.slug}>
                  <Link
                    to={`/locations/${loc.slug}`}
                    className="font-display text-[1.2rem] text-ink underline decoration-transparent underline-offset-4 transition-colors hover:decoration-ink/40"
                  >
                    {loc.city}
                  </Link>
                  <address className="mt-2 not-italic text-[0.94rem] leading-relaxed text-ink-muted">
                    {loc.street}
                    <br />
                    {loc.cityStateZip}
                  </address>
                  <a
                    href={`tel:${loc.phone.replace(/\D/g, '')}`}
                    className="mt-2 inline-flex min-h-[40px] items-center text-[0.94rem] font-semibold text-grass-700 underline decoration-grass-200 underline-offset-4 hover:decoration-grass-600"
                  >
                    {loc.phone}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-5 border-t border-ink/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[0.88rem] text-ink-soft">
            © {year} {site.name}. All rights reserved.
          </p>
          <ul className="flex flex-wrap items-center gap-x-6">
            {legalNav.map((item) => (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className="inline-flex min-h-[40px] items-center text-[0.88rem] text-ink-soft transition-colors hover:text-ink"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
