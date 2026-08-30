import { ArrowRight, Phone } from 'lucide-react';
import { useLang } from '@/i18n/LanguageContext';
import { useRouteAnnounce } from '@/hooks/useRouteAnnounce';
import { Section, ActionButton } from '@/components/primitives';
import { HELPLINE } from '@/data/organization';

/**
 * A 404 that still does the site's job: someone who mistyped a URL while
 * looking for legal help should not hit a dead end. Both ways in are here.
 */
export function NotFound() {
  const { t, copy } = useLang();
  useRouteAnnounce(t({ en: 'Page not found', es: 'Página no encontrada' }));

  return (
    <Section>
      <div className="max-w-measure py-8">
        <p className="eyebrow mb-3">404</p>
        <h1 tabIndex={-1} className="text-fluid-h1 font-serif text-ink outline-none">
          {t({ en: 'We could not find that page.', es: 'No pudimos encontrar esa página.' })}
        </h1>
        <p className="mt-4 text-fluid-lead leading-relaxed text-ink-soft">
          {t({
            en: 'The page may have moved. If you are looking for legal help, both ways to start are below.',
            es: 'Es posible que la página se haya movido. Si busca ayuda legal, aquí están las dos formas de empezar.',
          })}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <ActionButton to="/get-help" icon={ArrowRight}>
            {t(copy.global.getLegalHelp)}
          </ActionButton>
          <ActionButton href={HELPLINE.phoneHref} variant="secondary" icon={Phone}>
            {HELPLINE.phoneDisplay}
          </ActionButton>
        </div>
      </div>
    </Section>
  );
}
