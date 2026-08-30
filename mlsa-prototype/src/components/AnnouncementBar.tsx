import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Info, X, ArrowRight } from 'lucide-react';
import { ANNOUNCEMENT } from '@/data/organization';
import { useLang } from '@/i18n/LanguageContext';

/**
 * A time-sensitive operational notice.
 *
 * Modelled as a CMS record (see `ANNOUNCEMENT`): tone, dates, link and
 * dismissibility are content, so staff can post "the HelpLine is closed
 * Thursday" without a deploy. Visually it is a quiet band, not a takeover —
 * it must not compete with the hero, which is what the person actually came for.
 */
export function AnnouncementBar() {
  const { t } = useLang();
  const [dismissed, setDismissed] = useState(false);

  if (!ANNOUNCEMENT || dismissed) return null;

  const { message, linkLabel, href, dismissible } = ANNOUNCEMENT;

  return (
    <aside
      aria-label={t({ en: 'Site announcement', es: 'Aviso del sitio' })}
      className="border-b border-primary-border/70 bg-primary-tint"
    >
      <div className="shell flex items-start gap-3 py-2.5 sm:items-center">
        <Info aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-primary sm:mt-0" />
        <p className="min-w-0 flex-1 text-sm leading-relaxed text-primary-deep">
          {t(message)}{' '}
          {href && linkLabel ? (
            <Link
              to={href}
              className="inline-flex items-center gap-1 font-semibold underline decoration-primary/40 underline-offset-[3px] hover:decoration-primary"
            >
              {t(linkLabel)}
              <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
            </Link>
          ) : null}
        </p>
        {dismissible ? (
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="-m-2 flex h-11 w-11 shrink-0 items-center justify-center rounded text-primary-deep hover:bg-primary-border/40"
            aria-label={t({ en: 'Dismiss announcement', es: 'Descartar el aviso' })}
          >
            <X aria-hidden="true" className="h-4 w-4" />
          </button>
        ) : null}
      </div>
    </aside>
  );
}
