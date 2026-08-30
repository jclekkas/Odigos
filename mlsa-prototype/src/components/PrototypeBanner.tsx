import { Link } from 'react-router-dom';
import { FlaskConical } from 'lucide-react';
import { useLang } from '@/i18n/LanguageContext';

/**
 * The prototype disclaimer.
 *
 * Sits above everything, on every page, in the document order a screen reader
 * meets first. Deliberately quiet visually — it must not read as a cookie
 * banner people learn to dismiss — but it is never hidden and never
 * dismissible, because someone landing here has to be able to tell within a
 * second that this is not the organisation's real website.
 */
export function PrototypeBanner() {
  const { t, copy } = useLang();

  return (
    <div className="border-b border-ink/10 bg-ink text-white">
      <div className="shell flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 py-2">
        <p className="flex items-center gap-2 text-[0.8125rem] leading-snug text-white/90">
          <FlaskConical aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-white/70" />
          {/* The full sentence needs three lines on a 375px screen, which
              pushes the actual page below the fold. Short form on small,
              full form from sm up — both say the same thing. */}
          <span className="sm:hidden">{t(copy.global.prototypeNoticeShort)}</span>
          <span className="hidden sm:inline">{t(copy.global.prototypeNotice)}</span>
        </p>
        <Link
          to="/concept"
          className="on-dark inline-flex min-h-[32px] shrink-0 items-center whitespace-nowrap text-[0.8125rem] font-semibold text-white underline decoration-white/40 underline-offset-[3px] hover:decoration-white"
        >
          {t(copy.global.aboutThisConcept)}
        </Link>
      </div>
    </div>
  );
}
