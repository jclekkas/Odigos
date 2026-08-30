import { Link } from 'react-router-dom';
import { Phone, MapPin, Printer, ExternalLink, FlaskConical } from 'lucide-react';
import { useLang } from '@/i18n/LanguageContext';
import { HELPLINE, OFFICES, ORG, FAX } from '@/data/organization';
import { Shell } from './primitives';

/**
 * Footer.
 *
 * Structured as four real navigation groups rather than one long list, each
 * with a heading that the group's <ul> is labelled by — so a screen-reader user
 * can skip "Get Involved" wholesale instead of hearing twenty links in a row.
 *
 * The funder/nonprofit disclaimer appears once, here, rather than on every
 * screen. The prototype disclaimer sits below it and is unambiguous: this is
 * not MLSA's site and collects nothing.
 */
export function Footer() {
  const { t, copy } = useLang();
  const l = copy.footer.links;

  const groups = [
    {
      heading: t(copy.footer.helpHeading),
      links: [
        { label: t(l.needHelp), to: '/get-help' },
        { label: t(l.apply), to: '/get-help#apply' },
        { label: t(l.helpline), to: '/get-help#helpline' },
        { label: t(l.montanalawhelp), href: ORG.sisterSite.url, external: true },
      ],
    },
    {
      heading: t(copy.footer.aboutHeading),
      links: [
        { label: t(l.about), to: '/about' },
        { label: t(l.ourWork), to: '/our-work' },
        { label: t(l.news), to: '/about#accountability' },
        { label: t(l.careers), to: '/about#support' },
      ],
    },
    {
      heading: t(copy.footer.involvedHeading),
      links: [
        { label: t(l.volunteer), to: '/about#support' },
        { label: t(l.donate), to: '/about#support' },
        { label: t(l.partner), to: '/about#support' },
      ],
    },
    {
      heading: t(copy.footer.contactHeading),
      links: [
        { label: t(l.contact), to: '/get-help#helpline' },
        { label: t(l.accessibility), to: '/get-help#access' },
        { label: t(l.privacy), to: '/concept' },
        { label: t(l.disclaimer), to: '/concept' },
      ],
    },
  ];

  return (
    <footer className="border-t border-line bg-sunk">
      <Shell>
        <div className="grid gap-10 py-12 sm:py-14 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,2fr)]">
          {/* Identity + direct contact */}
          <div>
            <p className="text-[1.0625rem] font-semibold text-ink">{t(copy.global.orgName)}</p>
            <p className="mt-2 max-w-sm text-[0.9375rem] leading-relaxed text-ink-soft">
              {t(copy.footer.tagline)}
            </p>

            <div className="mt-6 space-y-3 text-[0.9375rem]">
              <p className="flex items-start gap-2.5 text-ink-soft">
                <Phone aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>
                  <span className="font-semibold text-ink">{t(copy.global.helplineLabel)}: </span>
                  <a
                    href={HELPLINE.phoneHref}
                    className="font-semibold text-primary underline decoration-primary/40 underline-offset-[3px] hover:decoration-primary"
                  >
                    {HELPLINE.phoneDisplay}
                  </a>
                  <span className="block text-ink-muted">
                    {t(HELPLINE.days)}, {t(HELPLINE.hours)}
                  </span>
                </span>
              </p>

              <p className="flex items-start gap-2.5 text-ink-soft">
                <MapPin aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>
                  <span className="font-semibold text-ink">{t(copy.footer.mailingLabel)}: </span>
                  {OFFICES[0].address}, {OFFICES[0].cityState}
                  <span className="block text-ink-muted">
                    {t(copy.footer.officesLabel)} {OFFICES.map((o) => o.city).join(', ')}
                  </span>
                </span>
              </p>

              <p className="flex items-start gap-2.5 text-ink-soft">
                <Printer aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>
                  <span className="font-semibold text-ink">{t(copy.footer.faxLabel)}: </span>
                  {FAX}
                </span>
              </p>
            </div>
          </div>

          {/* Navigation groups */}
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {groups.map((group) => (
              <nav key={group.heading} aria-label={group.heading}>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink">
                  {group.heading}
                </h2>
                <ul className="space-y-1">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      {'external' in link && link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-[36px] items-center gap-1.5 py-1 text-[0.9375rem] text-ink-soft hover:text-primary hover:underline hover:underline-offset-[3px]"
                        >
                          {link.label}
                          <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
                          <span className="sr-only"> ({t(copy.global.opensInNewTab)})</span>
                        </a>
                      ) : (
                        <Link
                          to={link.to!}
                          className="inline-flex min-h-[36px] items-center py-1 text-[0.9375rem] text-ink-soft hover:text-primary hover:underline hover:underline-offset-[3px]"
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        {/* Legal + prototype disclosure */}
        <div className="border-t border-line-strong py-7">
          <p className="max-w-3xl text-sm leading-relaxed text-ink-muted">
            {t(copy.footer.fundingNote)}
          </p>

          <div className="mt-5 rounded-card border border-line-strong bg-canvas p-4 sm:p-5">
            <div className="flex gap-3">
              <FlaskConical aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-ink-muted" />
              <div>
                <p className="text-sm font-semibold text-ink">{t(copy.global.prototypeBadge)}</p>
                <p className="mt-1 max-w-3xl text-sm leading-relaxed text-ink-muted">
                  {t(copy.footer.prototypeFooter)}
                </p>
                <Link
                  to="/concept"
                  className="mt-3 inline-flex min-h-[36px] items-center text-sm font-semibold text-primary underline decoration-primary/40 underline-offset-[3px] hover:decoration-primary"
                >
                  {t(copy.global.aboutThisConcept)}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Shell>
    </footer>
  );
}
