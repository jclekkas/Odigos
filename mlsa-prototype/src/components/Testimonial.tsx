import { Quote } from 'lucide-react';
import { TESTIMONIAL } from '@/data/organization';
import { useLang } from '@/i18n/LanguageContext';

/**
 * One client quote, taken verbatim from MLSA's public website.
 *
 * Not composited, not paraphrased, not written for this prototype. MLSA
 * publishes it without an attributed name, so no name is invented here — the
 * attribution says exactly what is known. In Spanish the quote is marked as a
 * translation, because presenting a translation as the speaker's own words is
 * a small dishonesty that a legal aid organisation cannot afford.
 */
export function Testimonial() {
  const { t, lang } = useLang();
  const translationNote = TESTIMONIAL.translationNote[lang];

  return (
    <figure className="rounded-card border border-line bg-surface p-6 shadow-card sm:p-8">
      <Quote aria-hidden="true" className="mb-4 h-8 w-8 text-primary-border" />
      <blockquote>
        <p className="font-serif text-[clamp(1.125rem,1rem+0.8vw,1.5rem)] leading-relaxed text-ink">
          {t(TESTIMONIAL.quote)}
        </p>
      </blockquote>
      <figcaption className="mt-5 border-t border-line pt-4 text-sm text-ink-muted">
        {t(TESTIMONIAL.attribution)}
        {translationNote ? <span className="block mt-1">{translationNote}</span> : null}
      </figcaption>
    </figure>
  );
}
