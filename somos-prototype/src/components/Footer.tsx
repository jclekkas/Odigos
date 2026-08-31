import { Link } from 'react-router-dom';
import { footerNav, legalNav, site } from '@/data/site';
import { locations } from '@/data/locations';
import { LogoMark } from '@/components/Logo';

export function Footer() {
  const year = 2026;
  return (
    <footer className="bg-forest-800 text-cream-100">
      <div className="container-somos py-16 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr_1.4fr]">
          <div>
            <div className="flex items-center gap-3">
              <LogoMark className="h-10 w-10" />
              <span
                className="font-display text-[1.5rem] text-cream-50"
                style={{ fontVariationSettings: "'wght' 600, 'SOFT' 40, 'opsz' 20" }}
              >
                somos
              </span>
            </div>
            <p className="mt-5 max-w-sm text-[0.97rem] leading-relaxed text-cream-100/75">
              A bilingual Montessori early-learning community for children ages 2–5,
              helping young children become independent, curious and kind.
            </p>
            <a
              href={`mailto:${site.email}`}
              className="mt-6 inline-flex min-h-[44px] items-center text-[0.97rem] text-cream-50 underline decoration-cream-100/30 underline-offset-4 transition-colors hover:decoration-cream-50"
            >
              {site.email}
            </a>
          </div>

          <nav aria-label="Footer">
            <h2 className="text-eyebrow font-semibold uppercase tracking-[0.16em] text-ochre-300">
              Explore
            </h2>
            <ul className="mt-5 space-y-1">
              {footerNav.map((item) => (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className="inline-flex min-h-[40px] items-center text-[0.97rem] text-cream-100/80 transition-colors hover:text-cream-50"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-eyebrow font-semibold uppercase tracking-[0.16em] text-ochre-300">
              Our Schools
            </h2>
            <div className="mt-5 grid gap-8 sm:grid-cols-2">
              {locations.map((loc) => (
                <div key={loc.slug}>
                  <Link
                    to={`/locations/${loc.slug}`}
                    className="font-display text-[1.2rem] text-cream-50 underline decoration-transparent underline-offset-4 transition-colors hover:decoration-cream-100/50"
                  >
                    {loc.city}
                  </Link>
                  <address className="mt-2 not-italic text-[0.94rem] leading-relaxed text-cream-100/75">
                    {loc.street}
                    <br />
                    {loc.cityStateZip}
                  </address>
                  <a
                    href={`tel:${loc.phone.replace(/\D/g, '')}`}
                    className="mt-2 inline-flex min-h-[40px] items-center text-[0.94rem] text-cream-50 underline decoration-cream-100/30 underline-offset-4 hover:decoration-cream-50"
                  >
                    {loc.phone}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-5 border-t border-cream-100/15 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[0.88rem] text-cream-100/60">
            © {year} {site.name}. All rights reserved.
          </p>
          <ul className="flex flex-wrap items-center gap-x-6">
            {legalNav.map((item) => (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className="inline-flex min-h-[40px] items-center text-[0.88rem] text-cream-100/60 transition-colors hover:text-cream-50"
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
