import { ArrowRight, Heart, FileBarChart, Users, Handshake, Phone } from 'lucide-react';
import { useLang } from '@/i18n/LanguageContext';
import { useRouteAnnounce } from '@/hooks/useRouteAnnounce';
import { Hero } from '@/components/Hero';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Section, SectionHeader, ActionButton } from '@/components/primitives';
import { ImpactMetric, SourceNote } from '@/components/ImpactMetric';
import { Testimonial } from '@/components/Testimonial';
import { MontanaReach } from '@/components/MontanaReach';
import { CTASection } from '@/components/CTASection';
import { IMPACT, ORG, HELPLINE } from '@/data/organization';

export function About() {
  const { t, copy } = useLang();
  useRouteAnnounce(t(copy.nav.about));

  return (
    <>
      <Hero
        eyebrow={`${ORG.foundedYear} — ${new Date().getFullYear()}`}
        title={t(copy.about.title)}
        lead={t(copy.about.lead)}
        serif
        actions={
          <>
            <ActionButton to="/our-work" variant="secondary" icon={ArrowRight}>
              {t(copy.nav.ourWork)}
            </ActionButton>
            <ActionButton to="/about#support" variant="secondary" icon={Heart}>
              {t(copy.about.supportCta)}
            </ActionButton>
          </>
        }
      >
        <div className="mt-8">
          <Breadcrumb current={t(copy.nav.about)} />
        </div>
      </Hero>

      {/* WHAT MLSA DOES --------------------------------------------------- */}
      <Section tone="surface" labelledBy="story-heading">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-14">
          <div>
            <SectionHeader id="story-heading" title={t(copy.about.storyTitle)} serif />
            <p className="max-w-measure text-fluid-lead leading-relaxed text-ink-soft">
              {t(copy.about.storyBody)}
            </p>
            <p className="mt-6 max-w-measure text-[0.9375rem] leading-relaxed text-ink-muted">
              {ORG.foundedNote}
            </p>
          </div>
          <div className="lg:pt-4">
            <Testimonial />
          </div>
        </div>
      </Section>

      {/* ACROSS MONTANA --------------------------------------------------- */}
      <Section labelledBy="reach-heading">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:items-center lg:gap-14">
          <div>
            <SectionHeader
              id="reach-heading"
              eyebrow={t({ en: 'Statewide', es: 'En todo el estado' })}
              title={t(copy.about.reachTitle)}
              serif
            />
            <p className="max-w-measure text-fluid-lead leading-relaxed text-ink-soft">
              {t(copy.about.reachBody)}
            </p>
          </div>
          <MontanaReach />
        </div>
      </Section>

      {/* IMPACT ------------------------------------------------------------ */}
      <Section tone="deep" labelledBy="impact-heading">
        <SectionHeader
          id="impact-heading"
          title={t(copy.about.impactTitle)}
          lead={t(copy.about.impactLead)}
          onDark
        />
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {IMPACT.map((metric) => (
            <li key={metric.label.en}>
              <ImpactMetric
                value={t(metric.value)}
                label={t(metric.label)}
                detail={t(metric.detail)}
                onDark
              />
            </li>
          ))}
        </ul>
        <SourceNote onDark>{t(copy.global.verifiedNote)}</SourceNote>
      </Section>

      {/* COMMUNITIES ------------------------------------------------------- */}
      <Section tone="surface" labelledBy="communities-heading">
        <div className="max-w-3xl">
          <SectionHeader
            id="communities-heading"
            eyebrow={t({ en: 'Communities', es: 'Comunidades' })}
            title={t(copy.about.communitiesTitle)}
            serif
          />
          <p className="max-w-measure text-fluid-lead leading-relaxed text-ink-soft">
            {t(copy.about.communitiesBody)}
          </p>
        </div>
      </Section>

      {/* ACCOUNTABILITY ---------------------------------------------------- */}
      <Section id="accountability" tone="sunk" labelledBy="accountability-heading">
        <SectionHeader
          id="accountability-heading"
          eyebrow={t({ en: 'For funders and donors', es: 'Para financiadores y donantes' })}
          title={t(copy.about.accountabilityTitle)}
          lead={t(copy.about.accountabilityBody)}
        />
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {copy.about.accountabilityItems.map((item) => (
            <li key={item.en}>
              {/* Deliberately non-interactive: these would link to MLSA's
                  published materials on a live site. A dead link that looks
                  live is worse than a labelled placeholder. */}
              <div className="flex h-full items-start gap-3 rounded-card border border-dashed border-line-strong bg-canvas p-4">
                <FileBarChart aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-ink-muted" />
                <div>
                  <p className="text-[0.9375rem] font-semibold text-ink">{t(item)}</p>
                  <p className="mt-0.5 text-xs text-ink-muted">{t(copy.global.placeholder)}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      {/* SUPPORT ----------------------------------------------------------- */}
      <Section id="support" labelledBy="support-heading">
        <SectionHeader
          id="support-heading"
          eyebrow={t({ en: 'Get involved', es: 'Participe' })}
          title={t(copy.about.supportTitle)}
          lead={t(copy.about.supportBody)}
          serif
        />
        <ul className="grid gap-4 sm:grid-cols-3">
          {[
            { icon: Users, title: copy.home.volunteerTitle, body: copy.home.volunteerBody },
            { icon: Heart, title: copy.home.donateTitle, body: copy.home.donateBody },
            { icon: Handshake, title: copy.home.partnerTitle, body: copy.home.partnerBody },
          ].map(({ icon: Icon, title, body }) => (
            <li key={title.en}>
              <div className="flex h-full flex-col rounded-card border border-line bg-surface p-6 shadow-card">
                <Icon aria-hidden="true" className="mb-3 h-7 w-7 text-primary" />
                <h3 className="text-fluid-h3 font-semibold text-ink">{t(title)}</h3>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-soft">{t(body)}</p>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <CTASection
        title={t({
          en: 'Looking for legal help yourself?',
          es: '¿Busca ayuda legal usted mismo?',
        })}
        body={t({
          en: 'Everything on this page describes the organization. If you have a civil legal problem right now, start here instead.',
          es: 'Todo en esta página describe a la organización. Si tiene un problema legal civil ahora mismo, empiece aquí.',
        })}
      >
        <ActionButton to="/get-help" variant="quiet" icon={ArrowRight}>
          {t(copy.global.getLegalHelp)}
        </ActionButton>
        <ActionButton
          href={HELPLINE.phoneHref}
          variant="on-dark"
          icon={Phone}
        >
          {HELPLINE.phoneDisplay}
        </ActionButton>
      </CTASection>
    </>
  );
}
