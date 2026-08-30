import {
  ArrowRight,
  Phone,
  FileText,
  BookOpen,
  Globe,
  Languages,
  Building2,
  CircleHelp,
  ShieldCheck,
} from 'lucide-react';
import { useLang } from '@/i18n/LanguageContext';
import { useRouteAnnounce } from '@/hooks/useRouteAnnounce';
import { Hero } from '@/components/Hero';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Section, SectionHeader, ActionButton, Shell, Tag } from '@/components/primitives';
import { Alert } from '@/components/Alert';
import { AccessibleAccordion } from '@/components/AccessibleAccordion';
import { QuickExitNote } from '@/components/QuickExit';
import { CTASection } from '@/components/CTASection';
import { HELPLINE, ORG, OFFICES } from '@/data/organization';

export function GetHelp() {
  const { t, copy } = useLang();
  useRouteAnnounce(t(copy.getHelp.navLabel));

  const faqItems = copy.getHelp.faq.map((item) => ({ q: t(item.q), a: t(item.a) }));

  return (
    <>
      <Hero
        tone="warm"
        title={t(copy.getHelp.title)}
        lead={t(copy.getHelp.lead)}
        serif
        support={t(copy.global.notALawFirmNote)}
        actions={
          <>
            <ActionButton href={ORG.sisterSite.applyUrl} external icon={FileText}>
              {t(copy.getHelp.applyCta)}
            </ActionButton>
            <ActionButton href={HELPLINE.phoneHref} variant="secondary" icon={Phone}>
              {HELPLINE.phoneDisplay}
            </ActionButton>
          </>
        }
      >
        <div className="mt-8">
          <Breadcrumb current={t(copy.getHelp.navLabel)} />
        </div>
      </Hero>

      {/* THREE PRIMARY ROUTES ------------------------------------------- */}
      <Section tone="surface" labelledBy="routes-heading">
        <SectionHeader
          id="routes-heading"
          eyebrow={t({ en: 'Choose one', es: 'Elija una' })}
          title={t(copy.getHelp.routesTitle)}
        />

        <div className="grid gap-5 lg:grid-cols-3">
          {/* 1. Apply */}
          <article
            id="apply"
            className="flex scroll-mt-28 flex-col rounded-card border-2 border-primary-border bg-primary-tint/40 p-6 shadow-card sm:p-7"
          >
            <Tag tone="primary" className="mb-4 self-start">
              {t({ en: 'Option 1', es: 'Opción 1' })}
            </Tag>
            <FileText aria-hidden="true" className="mb-3 h-7 w-7 text-primary" />
            <h3 className="text-fluid-h3 font-semibold text-ink">{t(copy.getHelp.applyTitle)}</h3>
            <p className="mt-2 flex-1 text-[0.9375rem] leading-relaxed text-ink-soft">
              {t(copy.getHelp.applyBody)}
            </p>
            <div className="mt-5">
              <ActionButton href={ORG.sisterSite.applyUrl} external className="w-full">
                {t(copy.getHelp.applyCta)}
              </ActionButton>
            </div>
            <p className="mt-3 text-sm text-ink-muted">{t(copy.getHelp.applyNote)}</p>
          </article>

          {/* 2. Call — hours come from the CMS record, not from markup */}
          <article
            id="helpline"
            className="flex scroll-mt-28 flex-col rounded-card border border-line bg-surface p-6 shadow-card sm:p-7"
          >
            <Tag className="mb-4 self-start">{t({ en: 'Option 2', es: 'Opción 2' })}</Tag>
            <Phone aria-hidden="true" className="mb-3 h-7 w-7 text-primary" />
            <h3 className="text-fluid-h3 font-semibold text-ink">{t(copy.getHelp.callTitle)}</h3>
            <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-soft">
              {t(copy.getHelp.callBody)}
            </p>

            <dl className="mt-4 flex-1 rounded border border-line bg-canvas p-4 text-[0.9375rem]">
              <dt className="font-semibold text-ink">{t(copy.getHelp.callHoursLabel)}</dt>
              <dd className="mt-1 text-ink-soft">
                {t(HELPLINE.days)}
                <br />
                {t(HELPLINE.hours)} ({t(HELPLINE.timezone)})
              </dd>
            </dl>

            <div className="mt-5">
              <ActionButton href={HELPLINE.phoneHref} variant="secondary" className="w-full">
                {t(copy.getHelp.callCta)}
              </ActionButton>
            </div>
          </article>

          {/* 3. Self-help */}
          <article
            id="resources"
            className="flex scroll-mt-28 flex-col rounded-card border border-line bg-surface p-6 shadow-card sm:p-7"
          >
            <Tag tone="accent" className="mb-4 self-start">
              {t({ en: 'Option 3', es: 'Opción 3' })}
            </Tag>
            <BookOpen aria-hidden="true" className="mb-3 h-7 w-7 text-accent" />
            <h3 className="text-fluid-h3 font-semibold text-ink">{t(copy.getHelp.formsTitle)}</h3>
            <p className="mt-2 flex-1 text-[0.9375rem] leading-relaxed text-ink-soft">
              {t(copy.getHelp.formsBody)}
            </p>
            <div className="mt-5">
              <ActionButton href={ORG.sisterSite.url} external variant="secondary" className="w-full">
                {t(copy.getHelp.formsCta)}
              </ActionButton>
            </div>
            <p className="mt-3 text-sm text-ink-muted">
              {t({
                en: 'MontanaLawHelp.org is maintained by MLSA.',
                es: 'MontanaLawHelp.org es administrado por MLSA.',
              })}
            </p>
          </article>
        </div>
      </Section>

      {/* EXPECTATION SETTING -------------------------------------------- */}
      <Section labelledBy="steps-heading">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] lg:gap-14">
          <div>
            <SectionHeader
              id="steps-heading"
              eyebrow={t({ en: 'What to expect', es: 'Qué esperar' })}
              title={t(copy.getHelp.stepsTitle)}
              lead={t(copy.getHelp.stepsLead)}
              serif
            />
            <Alert tone="notice" title={t({ en: 'Important', es: 'Importante' })}>
              {t(copy.getHelp.stepsDisclaimer)}
            </Alert>
          </div>

          {/* An ordered list, because the order is the information. */}
          <ol className="space-y-4">
            {copy.getHelp.steps.map((step, index) => (
              <li
                key={step.title.en}
                className="flex gap-4 rounded-card border border-line bg-surface p-5"
              >
                <span
                  aria-hidden="true"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-[0.9375rem] font-bold text-white"
                >
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <h3 className="text-[1.0625rem] font-semibold text-ink">{t(step.title)}</h3>
                  <p className="mt-1 text-[0.9375rem] leading-relaxed text-ink-soft">
                    {t(step.body)}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      {/* ACCESS NEEDS ---------------------------------------------------- */}
      <Section id="access" tone="sunk" labelledBy="access-heading">
        <SectionHeader
          id="access-heading"
          eyebrow={t({ en: 'Access', es: 'Acceso' })}
          title={t(copy.getHelp.accessTitle)}
          lead={t(copy.getHelp.accessLead)}
          serif
        />

        <ul className="grid gap-4 sm:grid-cols-2">
          {[
            {
              icon: Languages,
              title: copy.getHelp.accessSpanishTitle,
              body: copy.getHelp.accessSpanishBody,
              placeholder: false,
            },
            {
              icon: Phone,
              title: copy.getHelp.accessPhoneTitle,
              body: copy.getHelp.accessPhoneBody,
              placeholder: false,
            },
            {
              icon: Building2,
              title: copy.getHelp.accessInPersonTitle,
              body: copy.getHelp.accessInPersonBody,
              placeholder: false,
            },
            {
              icon: CircleHelp,
              title: copy.getHelp.accessTbdTitle,
              body: copy.getHelp.accessTbdBody,
              // The honest one. See the note in the body copy.
              placeholder: true,
            },
          ].map(({ icon: Icon, title, body, placeholder }) => (
            <li key={title.en}>
              <div
                className={
                  placeholder
                    ? 'flex h-full flex-col rounded-card border border-dashed border-line-strong bg-canvas p-5 sm:p-6'
                    : 'flex h-full flex-col rounded-card border border-line bg-surface p-5 shadow-card sm:p-6'
                }
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <Icon aria-hidden="true" className="h-6 w-6 text-primary" />
                  {placeholder ? (
                    <Tag tone="notice">{t(copy.global.placeholder)}</Tag>
                  ) : null}
                </div>
                <h3 className="text-[1.0625rem] font-semibold text-ink">{t(title)}</h3>
                <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-ink-soft">{t(body)}</p>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      {/* SAFETY ---------------------------------------------------------- */}
      <Section tone="surface" labelledBy="safety-heading">
        <div className="max-w-3xl">
          <SectionHeader
            id="safety-heading"
            eyebrow={t({ en: 'Safety', es: 'Seguridad' })}
            title={t(copy.getHelp.safetyTitle)}
          />
          <div className="rounded-card border-2 border-accent-border bg-accent-tint p-6 sm:p-7">
            <div className="flex gap-4">
              <ShieldCheck aria-hidden="true" className="mt-0.5 h-6 w-6 shrink-0 text-accent" />
              <div>
                <p className="text-[1.0625rem] leading-relaxed text-ink">
                  {t(copy.getHelp.safetyBody)}
                </p>
                <p className="mt-4 font-semibold text-ink">{t(copy.getHelp.safetyEmergency)}</p>
              </div>
            </div>
          </div>
          <QuickExitNote className="mt-4" />
        </div>
      </Section>

      {/* FAQ -------------------------------------------------------------- */}
      <Section labelledBy="faq-heading">
        <div className="max-w-3xl">
          <SectionHeader id="faq-heading" title={t(copy.getHelp.faqTitle)} />
          <AccessibleAccordion items={faqItems} headingLevel={3} />
        </div>
      </Section>

      <CTASection
        title={t({ en: 'Ready to apply?', es: '¿Listo para solicitar ayuda?' })}
        body={t({
          en: 'The online application is open at any time and takes about 10 to 15 minutes.',
          es: 'La solicitud en línea está disponible en todo momento y toma entre 10 y 15 minutos.',
        })}
      >
        <ActionButton href={ORG.sisterSite.applyUrl} external variant="quiet" icon={ArrowRight}>
          {t(copy.getHelp.applyCta)}
        </ActionButton>
        <ActionButton
          href={ORG.sisterSite.url}
          external
          variant="on-dark"
          icon={Globe}
        >
          {t(copy.global.visitMontanaLawHelp)}
        </ActionButton>
      </CTASection>

      <Shell>
        <p className="py-6 text-sm text-ink-muted">
          {t({
            en: `MLSA has offices in ${OFFICES.map((o) => o.city).join(', ')}. Details on this page come from MLSA's public materials.`,
            es: `MLSA tiene oficinas en ${OFFICES.map((o) => o.city).join(', ')}. Los datos de esta página provienen de los materiales públicos de MLSA.`,
          })}
        </p>
      </Shell>
    </>
  );
}
