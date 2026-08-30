import { useMemo, useState } from 'react';
import { Check, ArrowRight, Users, Network } from 'lucide-react';
import { useLang } from '@/i18n/LanguageContext';
import { useRouteAnnounce } from '@/hooks/useRouteAnnounce';
import { Hero } from '@/components/Hero';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Section, SectionHeader, ActionButton, cx } from '@/components/primitives';
import { PracticeAreaCard } from '@/components/cards';
import { CTASection } from '@/components/CTASection';
import { PRACTICE_AREAS, PRACTICE_AREA_GROUPS, type PracticeAreaGroup } from '@/data/practiceAreas';
import { HELPLINE } from '@/data/organization';

export function OurWork() {
  const { t, copy, lang } = useLang();
  useRouteAnnounce(t(copy.nav.ourWork));

  const [active, setActive] = useState<PracticeAreaGroup | 'all'>('all');

  const visible = useMemo(
    () => (active === 'all' ? PRACTICE_AREAS : PRACTICE_AREAS.filter((a) => a.group === active)),
    [active],
  );

  const groupLabel = (id: string) =>
    t(PRACTICE_AREA_GROUPS.find((g) => g.id === id)?.label ?? { en: '', es: '' });

  return (
    <>
      <Hero
        title={t(copy.ourWork.title)}
        lead={t(copy.ourWork.lead)}
        serif
      >
        <div className="mt-8">
          <Breadcrumb current={t(copy.nav.ourWork)} />
        </div>
      </Hero>

      {/* FILTERABLE PRACTICE AREAS --------------------------------------- */}
      <Section tone="surface" labelledBy="areas-heading">
        <SectionHeader
          id="areas-heading"
          eyebrow={t({ en: 'Areas of work', es: 'Áreas de trabajo' })}
          title={t({ en: 'What MLSA works on', es: 'En qué trabaja MLSA' })}
          lead={t({
            en: 'These are the civil legal areas MLSA works in. If your problem does not appear here, it is still worth applying — the application is how eligibility is decided.',
            es: 'Estas son las áreas legales civiles en las que trabaja MLSA. Si su problema no aparece aquí, vale la pena solicitar ayuda de todos modos: la solicitud es lo que determina la elegibilidad.',
          })}
        />

        {/*
          Filters are toggle buttons in a labelled group, not a select, so each
          option is one large target and the current state is exposed through
          aria-pressed. The active state is carried by a check icon and a border
          as well as by colour.
        */}
        <div role="group" aria-labelledby="filter-label" className="mb-3">
          <p id="filter-label" className="eyebrow mb-3">
            {t(copy.ourWork.filterLabel)}
          </p>
          <ul className="flex flex-wrap gap-2">
            {PRACTICE_AREA_GROUPS.map((group) => {
              const isActive = active === group.id;
              return (
                <li key={group.id}>
                  <button
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setActive(group.id)}
                    className={cx(
                      'btn min-h-[44px] border-2 px-4 text-sm',
                      isActive
                        ? 'border-primary bg-primary text-white'
                        : 'border-line-strong bg-surface text-ink-soft hover:border-primary hover:text-primary',
                    )}
                  >
                    {isActive ? <Check aria-hidden="true" className="h-4 w-4 shrink-0" /> : null}
                    <span>{t(group.label)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* The result count is announced so filtering is perceivable without
            sight of the list reflowing. */}
        <p role="status" aria-live="polite" className="mb-7 text-sm text-ink-muted">
          {t(copy.ourWork.resultsCount(visible.length))}
        </p>

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((area) => (
            <li key={area.id}>
              <PracticeAreaCard
                id={area.id}
                icon={area.icon}
                name={t(area.name)}
                summary={t(area.summary)}
                examples={area.examples[lang]}
                groupLabel={groupLabel(area.group)}
              />
            </li>
          ))}
        </ul>
      </Section>

      {/* SYSTEMIC ADVOCACY ----------------------------------------------- */}
      <Section tone="sunk" labelledBy="systemic-heading">
        <SectionHeader
          id="systemic-heading"
          eyebrow={t({ en: 'How the work is done', es: 'Cómo se hace el trabajo' })}
          title={t(copy.ourWork.systemicTitle)}
          lead={t(copy.ourWork.systemicLead)}
          serif
        />

        <div className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-card border border-line bg-surface p-6 shadow-card sm:p-7">
            <Users aria-hidden="true" className="mb-3 h-7 w-7 text-primary" />
            <h3 className="text-fluid-h3 font-semibold text-ink">{t(copy.ourWork.caseWorkTitle)}</h3>
            <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-soft">
              {t(copy.ourWork.caseWorkBody)}
            </p>
          </div>

          <div className="rounded-card border-2 border-primary-border bg-primary-tint/40 p-6 sm:p-7">
            <Network aria-hidden="true" className="mb-3 h-7 w-7 text-primary" />
            <h3 className="text-fluid-h3 font-semibold text-ink">
              {t(copy.ourWork.systemicWorkTitle)}
            </h3>
            <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-soft">
              {t(copy.ourWork.systemicWorkBody)}
            </p>
          </div>
        </div>

        <p className="mt-6 max-w-measure font-serif text-fluid-lead leading-relaxed text-ink">
          {t(copy.ourWork.systemicNote)}
        </p>
      </Section>

      <CTASection
        title={t({
          en: 'Not sure which of these fits your situation?',
          es: '¿No sabe cuál de estas áreas corresponde a su situación?',
        })}
        body={t({
          en: 'You do not need to know the legal category. Describe what is happening and MLSA will work out the rest.',
          es: 'No necesita conocer la categoría legal. Describa lo que está ocurriendo y MLSA se encargará del resto.',
        })}
      >
        <ActionButton to="/get-help" variant="quiet" icon={ArrowRight}>
          {t(copy.global.getLegalHelp)}
        </ActionButton>
        <ActionButton
          href={HELPLINE.phoneHref}
          variant="on-dark"
        >
          {HELPLINE.phoneDisplay}
        </ActionButton>
      </CTASection>
    </>
  );
}
