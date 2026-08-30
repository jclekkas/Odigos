import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  LifeBuoy,
  Briefcase,
  Phone,
  Search as SearchIcon,
  Building2,
  Globe,
  Users,
  Heart,
  Handshake,
} from 'lucide-react';
import { useLang } from '@/i18n/LanguageContext';
import { useRouteAnnounce } from '@/hooks/useRouteAnnounce';
import { Hero } from '@/components/Hero';
import { Section, SectionHeader, ActionButton, Shell } from '@/components/primitives';
import { ActionCard, PracticeAreaCard, InfoCard } from '@/components/cards';
import { ImpactMetric, SourceNote } from '@/components/ImpactMetric';
import { Testimonial } from '@/components/Testimonial';
import { CTASection } from '@/components/CTASection';
import { Alert } from '@/components/Alert';
import { PRACTICE_AREAS, PRACTICE_AREA_GROUPS } from '@/data/practiceAreas';
import { HELPLINE, IMPACT, ORG } from '@/data/organization';

export function Home({ onOpenSearch }: { onOpenSearch: () => void }) {
  const { t, copy, lang } = useLang();
  useRouteAnnounce(t(copy.global.orgName));

  const groupLabel = (id: string) =>
    t(PRACTICE_AREA_GROUPS.find((g) => g.id === id)?.label ?? { en: '', es: '' });

  /** The four intent cards. Icons are chosen to describe a *person's goal*,
   *  not a legal concept — no gavels, no scales, no columns. */
  const chooserIcons = [LifeBuoy, BookOpen, Briefcase, Heart];
  const chooserTargets: Array<{ to?: string; href?: string; external?: boolean }> = [
    { to: '/get-help' },
    { href: ORG.sisterSite.url, external: true },
    { to: '/about#support' },
    { to: '/about#support' },
  ];

  return (
    <>
      <Hero
        tone="warm"
        eyebrow={t(copy.home.heroEyebrow)}
        title={t(copy.home.heroTitle)}
        lead={t(copy.home.heroLead)}
        support={t(copy.home.heroSupport)}
        serif
        actions={
          <>
            <ActionButton to="/get-help" icon={ArrowRight}>
              {t(copy.home.heroPrimaryCta)}
            </ActionButton>
            <ActionButton href={ORG.sisterSite.url} external variant="secondary">
              {t(copy.home.heroSecondaryCta)}
            </ActionButton>
          </>
        }
        aside={
          /* The HelpLine card is not decoration: it is the second way in, for
             someone who cannot or will not use a web form. */
          <div className="rounded-card border-2 border-primary-border bg-surface p-6 shadow-card">
            <p className="eyebrow mb-3">{t(copy.global.helplineLabel)}</p>
            <a
              href={HELPLINE.phoneHref}
              className="inline-flex min-h-[44px] items-center gap-2 font-serif text-[clamp(1.5rem,1.2rem+1.2vw,2rem)] font-semibold text-primary underline decoration-primary/30 underline-offset-4 hover:decoration-primary"
            >
              <Phone aria-hidden="true" className="h-6 w-6 shrink-0" />
              {HELPLINE.phoneDisplay}
            </a>
            <dl className="mt-4 space-y-1 border-t border-line pt-4 text-[0.9375rem]">
              <div className="flex flex-wrap gap-x-2">
                <dt className="font-semibold text-ink">{t(copy.getHelp.callHoursLabel)}:</dt>
                <dd className="text-ink-soft">
                  {t(HELPLINE.days)}, {t(HELPLINE.hours)}
                </dd>
              </div>
            </dl>
            <Alert
              tone="info"
              title={t(copy.global.applyOnline)}
              className="mt-5"
            >
              {t({
                en: 'The online application is open at any time, including when the HelpLine is closed.',
                es: 'La solicitud en línea está disponible en todo momento, incluso cuando la línea de ayuda está cerrada.',
              })}
            </Alert>
            <p className="mt-4 text-sm text-ink-muted">{t(copy.home.heroAside)}</p>
          </div>
        }
      />

      {/*
        THE CORE THESIS OF THE PROTOTYPE.
        Placed immediately after the hero and before anything about the
        organisation, because "who are you and what do you need" has to be
        answerable before "what is MLSA" is even asked.
      */}
      <Section tone="surface" labelledBy="chooser-heading">
        <SectionHeader
          id="chooser-heading"
          title={t(copy.home.chooserTitle)}
          lead={t(copy.home.chooserLead)}
          serif
        />
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {copy.chooser.map((item, index) => (
            <li key={item.id}>
              <ActionCard
                icon={chooserIcons[index]}
                title={t(item.title)}
                body={t(item.body)}
                cta={t(item.cta)}
                {...chooserTargets[index]}
              />
            </li>
          ))}
        </ul>
      </Section>

      {/* Legal issue exploration */}
      <Section labelledBy="issues-heading">
        <SectionHeader
          id="issues-heading"
          eyebrow={t({ en: 'Areas of work', es: 'Áreas de trabajo' })}
          title={t(copy.home.issuesTitle)}
          lead={t(copy.home.issuesLead)}
        />
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PRACTICE_AREAS.slice(0, 9).map((area) => (
            <li key={area.id}>
              <PracticeAreaCard
                id={`home-${area.id}`}
                icon={area.icon}
                name={t(area.name)}
                summary={t(area.summary)}
                groupLabel={groupLabel(area.group)}
              />
            </li>
          ))}
        </ul>
        <div className="mt-8">
          <ActionButton to="/our-work" variant="secondary" icon={ArrowRight}>
            {t(copy.home.issuesCta)}
          </ActionButton>
        </div>
      </Section>

      {/* Impact — restrained, editorial, and sourced */}
      <Section tone="sunk" labelledBy="impact-heading">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-14">
          <div>
            <SectionHeader
              id="impact-heading"
              eyebrow={t({ en: 'Impact', es: 'Impacto' })}
              title={t(copy.home.impactTitle)}
              lead={t(copy.home.impactLead)}
              serif
            />
            <ul className="grid gap-4 sm:grid-cols-2">
              {IMPACT.slice(0, 4).map((metric) => (
                <li key={metric.label.en}>
                  <ImpactMetric value={t(metric.value)} label={t(metric.label)} />
                </li>
              ))}
            </ul>
            <SourceNote>{t(copy.global.verifiedNote)}</SourceNote>
          </div>
          <div className="lg:pt-16">
            <Testimonial />
          </div>
        </div>
      </Section>

      {/* Ecosystem: MLSA vs MontanaLawHelp */}
      <Section tone="surface" labelledBy="ecosystem-heading">
        <SectionHeader
          id="ecosystem-heading"
          title={t(copy.home.ecosystemTitle)}
          lead={t(copy.home.ecosystemLead)}
          serif
        />
        <div className="grid gap-4 lg:grid-cols-2 lg:gap-5">
          <InfoCard
            eyebrow={t({ en: 'The organization', es: 'La organización' })}
            title={t(copy.home.ecosystemMlsaTitle)}
            body={t(copy.home.ecosystemMlsaBody)}
          >
            <ActionButton to="/about" variant="secondary" icon={Building2}>
              {t(copy.home.ecosystemMlsaCta)}
            </ActionButton>
          </InfoCard>
          <InfoCard
            eyebrow={t({ en: 'Maintained by MLSA', es: 'Administrado por MLSA' })}
            title={t(copy.home.ecosystemMlhTitle)}
            body={t(copy.home.ecosystemMlhBody)}
          >
            <ActionButton href={ORG.sisterSite.url} external variant="secondary" icon={Globe}>
              {t(copy.home.ecosystemMlhCta)}
            </ActionButton>
          </InfoCard>
        </div>

        <div className="mt-6">
          <button
            type="button"
            onClick={onOpenSearch}
            className="btn-quiet"
          >
            <SearchIcon aria-hidden="true" className="h-4 w-4" />
            <span>
              {t({
                en: 'Search both — results are labelled by source',
                es: 'Busque en ambos: los resultados indican su origen',
              })}
            </span>
          </button>
        </div>
      </Section>

      {/* Get involved — deliberately quieter than the client-facing sections */}
      <Section labelledBy="involved-heading">
        <SectionHeader
          id="involved-heading"
          eyebrow={t({ en: 'Support the work', es: 'Apoye el trabajo' })}
          title={t(copy.home.involvedTitle)}
          lead={t(copy.home.involvedLead)}
        />
        <ul className="grid gap-4 sm:grid-cols-3">
          {[
            { icon: Users, title: copy.home.volunteerTitle, body: copy.home.volunteerBody },
            { icon: Heart, title: copy.home.donateTitle, body: copy.home.donateBody },
            { icon: Handshake, title: copy.home.partnerTitle, body: copy.home.partnerBody },
          ].map(({ icon: Icon, title, body }) => (
            <li key={title.en}>
              <div className="flex h-full flex-col rounded-card border border-line bg-surface p-5">
                <Icon aria-hidden="true" className="mb-3 h-6 w-6 text-primary" />
                <h3 className="text-[1.0625rem] font-semibold text-ink">{t(title)}</h3>
                <p className="mt-1.5 flex-1 text-[0.9375rem] leading-relaxed text-ink-soft">
                  {t(body)}
                </p>
                <Link
                  to="/about#support"
                  className="mt-4 inline-flex min-h-[44px] items-center gap-1.5 self-start text-[0.9375rem] font-semibold text-primary underline decoration-primary/40 underline-offset-[3px] hover:decoration-primary"
                >
                  {t(copy.global.learnMore)}
                  <span className="sr-only"> — {t(title)}</span>
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <CTASection
        eyebrow={t({ en: 'Free civil legal help', es: 'Ayuda legal civil gratuita' })}
        title={t({
          en: 'If you are not sure where to start, start here.',
          es: 'Si no sabe por dónde empezar, empiece aquí.',
        })}
        body={t({
          en: 'Answering a few basic questions about what you need can help you find the right next step.',
          es: 'Responder algunas preguntas básicas sobre lo que necesita puede ayudarle a encontrar el siguiente paso correcto.',
        })}
      >
        <ActionButton to="/get-help" variant="quiet" icon={ArrowRight}>
          {t(copy.global.getLegalHelp)}
        </ActionButton>
        <ActionButton href={HELPLINE.phoneHref} variant="on-dark" icon={Phone}>
          {HELPLINE.phoneDisplay}
        </ActionButton>
      </CTASection>

      {/* A small honesty note, kept out of the way. */}
      <Shell>
        <p className="py-6 text-center text-sm text-ink-muted" lang={lang}>
          {t(copy.global.notALawFirmNote)}
        </p>
      </Shell>
    </>
  );
}
