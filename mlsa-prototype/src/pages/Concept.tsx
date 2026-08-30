import { ArrowRight, ExternalLink } from 'lucide-react';
import { useLang } from '@/i18n/LanguageContext';
import { useRouteAnnounce } from '@/hooks/useRouteAnnounce';
import { Hero } from '@/components/Hero';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Section, SectionHeader, ActionButton } from '@/components/primitives';
import { CTASection } from '@/components/CTASection';
import { ORG } from '@/data/organization';

/**
 * The page for the person evaluating the proposal.
 *
 * Written as product strategy, not marketing: what each decision was testing,
 * and — just as importantly — what was deliberately not decided.
 */
export function Concept() {
  const { t, copy } = useLang();
  useRouteAnnounce(t(copy.global.aboutThisConcept));

  return (
    <>
      <Hero
        eyebrow={t(copy.global.prototypeBadge)}
        title={t(copy.concept.title)}
        lead={t(copy.concept.lead)}
        serif
      >
        <div className="mt-8">
          <Breadcrumb current={t(copy.global.aboutThisConcept)} />
        </div>
      </Hero>

      {/* FOUR HYPOTHESES --------------------------------------------------- */}
      <Section tone="surface" labelledBy="hypotheses-heading">
        <SectionHeader id="hypotheses-heading" title={t(copy.concept.hypothesesTitle)} serif />
        <ol className="grid gap-5 lg:grid-cols-2">
          {copy.concept.hypotheses.map((item) => (
            <li key={item.n}>
              <article className="flex h-full flex-col rounded-card border border-line bg-canvas p-6 shadow-card sm:p-7">
                <p
                  aria-hidden="true"
                  className="mb-3 font-serif text-[2rem] font-semibold leading-none text-primary-soft"
                >
                  {item.n}
                </p>
                <h3 className="text-fluid-h3 font-semibold text-ink">{t(item.title)}</h3>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-soft">{t(item.body)}</p>
              </article>
            </li>
          ))}
        </ol>
      </Section>

      {/* WHAT IS VISIBLE IN THE BUILD -------------------------------------- */}
      <Section tone="sunk" labelledBy="decisions-heading">
        <SectionHeader
          id="decisions-heading"
          eyebrow={t({ en: 'Implementation', es: 'Implementación' })}
          title={t(copy.concept.decisionsTitle)}
          serif
        />
        <ul className="grid gap-4 sm:grid-cols-2">
          {copy.concept.decisions.map((item) => (
            <li key={item.title.en}>
              <div className="flex h-full flex-col rounded-card border border-line bg-surface p-6 shadow-card">
                <h3 className="text-[1.0625rem] font-semibold text-ink">{t(item.title)}</h3>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-soft">{t(item.body)}</p>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      {/* SOURCES ------------------------------------------------------------ */}
      <Section labelledBy="sources-heading">
        <div className="max-w-3xl">
          <SectionHeader
            id="sources-heading"
            title={t(copy.concept.sourcesTitle)}
            lead={t(copy.concept.sourcesBody)}
          />
          <ul className="space-y-2">
            {[ORG.officialSite, ORG.sisterSite.url].map((url) => (
              <li key={url}>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] items-center gap-2 font-medium text-primary underline decoration-primary/40 underline-offset-[3px] hover:decoration-primary"
                >
                  {url}
                  <ExternalLink aria-hidden="true" className="h-4 w-4" />
                  <span className="sr-only"> ({t(copy.global.opensInNewTab)})</span>
                </a>
              </li>
            ))}
          </ul>

          <div className="mt-8 rounded-card border-2 border-line-strong bg-sunk p-6">
            <h3 className="text-[1.0625rem] font-semibold text-ink">
              {t({ en: 'What is deliberately absent', es: 'Lo que falta deliberadamente' })}
            </h3>
            <ul className="mt-3 space-y-2 text-[0.9375rem] leading-relaxed text-ink-soft">
              {[
                {
                  en: 'A new name, logo or brand system — those belong after stakeholder research, not before it.',
                  es: 'Un nombre, logotipo o sistema de marca nuevo: eso corresponde después de la investigación con las partes interesadas, no antes.',
                },
                {
                  en: 'An annual "people served" figure, because MLSA does not publish one we could verify.',
                  es: 'Una cifra anual de «personas atendidas», porque MLSA no publica una que hayamos podido verificar.',
                },
                {
                  en: 'Specifics of interpretation, relay and alternative-format services, which we could not confirm.',
                  es: 'Los detalles de los servicios de interpretación, retransmisión y formatos alternativos, que no pudimos confirmar.',
                },
                {
                  en: 'Photography of clients. Stock imagery of people in distress would misrepresent both MLSA and the people it serves.',
                  es: 'Fotografías de clientes. Las imágenes de archivo de personas en apuros tergiversarían tanto a MLSA como a las personas a las que sirve.',
                },
                {
                  en: 'A working intake form. This prototype collects and transmits nothing.',
                  es: 'Un formulario de admisión funcional. Este prototipo no recopila ni transmite nada.',
                },
              ].map((item) => (
                <li key={item.en} className="flex gap-2.5">
                  <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span>{t(item)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <CTASection title={t(copy.concept.closingTitle)} body={t(copy.concept.closing)}>
        <ActionButton to="/" variant="quiet" icon={ArrowRight}>
          {t({ en: 'Back to the prototype', es: 'Volver al prototipo' })}
        </ActionButton>
      </CTASection>
    </>
  );
}
