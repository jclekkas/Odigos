import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Search as SearchIcon, ArrowRight, ExternalLink, FlaskConical } from 'lucide-react';
import { useLang } from '@/i18n/LanguageContext';
import { useDialog } from '@/hooks/useDialog';
import { searchEntries, SEARCH_SUGGESTIONS, type ResultKind, type SearchEntry } from '@/data/searchIndex';
import { Tag, cx } from './primitives';

/**
 * Search — and specifically, labelled search.
 *
 * The ranking here is trivial and does not matter. What matters is that every
 * result declares whether it is an MLSA service you apply to or a
 * MontanaLawHelp resource you read. A person searching "eviction" needs both,
 * and needs to know which is which; that distinction is exactly the brand
 * confusion the two-property architecture creates, so search is where it has to
 * be solved rather than papered over.
 */
export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, copy, lang } = useLang();
  const panelRef = useDialog(open, onClose);
  const [query, setQuery] = useState('');

  const results = useMemo(() => searchEntries(query, lang), [query, lang]);
  const hasQuery = query.trim().length >= 2;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-ink/50" onClick={onClose} aria-hidden="true" />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="search-overlay-title"
        tabIndex={-1}
        className="absolute inset-x-0 top-0 max-h-full overflow-y-auto bg-canvas shadow-overlay"
      >
        <div className="shell py-5 sm:py-7">
          <div className="mb-4 flex items-start justify-between gap-4">
            <h2 id="search-overlay-title" className="text-fluid-h3 font-semibold text-ink">
              {t(copy.search.title)}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="btn min-h-[44px] border border-line-strong bg-surface px-3 text-sm font-semibold text-ink-soft hover:border-primary hover:text-primary"
            >
              <X aria-hidden="true" className="h-4 w-4" />
              <span>{t(copy.global.closeSearch)}</span>
            </button>
          </div>

          {/* A real form element with a real label. `search` role on the wrapper
              gives it a landmark; the label is visible, not a placeholder. */}
          <form role="search" onSubmit={(e) => e.preventDefault()} className="max-w-2xl">
            <label htmlFor="site-search" className="mb-2 block text-sm font-semibold text-ink">
              {t(copy.search.label)}
            </label>
            <div className="relative">
              <SearchIcon
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-muted"
              />
              <input
                id="site-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t(copy.search.placeholder)}
                autoComplete="off"
                aria-describedby="site-search-hint"
                className="min-h-[52px] w-full rounded-card border-2 border-line-strong bg-surface pl-12 pr-4 text-base text-ink placeholder:text-ink-muted focus:border-primary"
              />
            </div>
            <p id="site-search-hint" className="mt-2 text-sm leading-relaxed text-ink-muted">
              {t(copy.search.hint)}
            </p>
          </form>

          {!hasQuery ? (
            <div className="mt-6 max-w-2xl">
              <h3 className="eyebrow mb-3">{t(copy.search.suggestionsLabel)}</h3>
              <ul className="flex flex-wrap gap-2">
                {SEARCH_SUGGESTIONS.map((suggestion) => (
                  <li key={suggestion.en}>
                    <button
                      type="button"
                      onClick={() => setQuery(t(suggestion))}
                      className="btn min-h-[44px] border border-line-strong bg-surface px-4 text-sm font-medium text-ink-soft hover:border-primary hover:text-primary"
                    >
                      {t(suggestion)}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="mt-7">
              {/* Result count is announced, so a screen reader user learns the
                  list changed without having to go looking for it. */}
              <p role="status" aria-live="polite" className="eyebrow mb-3">
                {results.length > 0
                  ? t(copy.search.countLabel(results.length))
                  : t(copy.search.noResultsTitle)}
              </p>

              {results.length > 0 ? (
                <ul className="grid gap-3 lg:grid-cols-2">
                  {results.map((entry) => (
                    <li key={entry.id}>
                      <SearchResult entry={entry} onNavigate={onClose} />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="prose-measure">{t(copy.search.noResultsBody)}</p>
              )}
            </div>
          )}

          <p className="mt-8 flex items-start gap-2 border-t border-line pt-4 text-sm text-ink-muted">
            <FlaskConical aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
            {t(copy.search.prototypeNote)}
          </p>
        </div>
      </div>
    </div>
  );
}

function SearchResult({ entry, onNavigate }: { entry: SearchEntry; onNavigate: () => void }) {
  const { t, copy } = useLang();

  const kindLabel: Record<ResultKind, string> = {
    'mlsa-service': t(copy.search.typeMlsaService),
    'mlsa-page': t(copy.search.typeMlsaPage),
    montanalawhelp: t(copy.search.typeMlh),
  };
  const kindTone = {
    'mlsa-service': 'primary',
    'mlsa-page': 'neutral',
    montanalawhelp: 'accent',
  } as const;

  const body = (
    <>
      <div className="mb-1.5 flex items-center gap-2">
        <Tag tone={kindTone[entry.kind]}>{kindLabel[entry.kind]}</Tag>
      </div>
      <p className="text-[1.0625rem] font-semibold text-ink group-hover:text-primary">
        {t(entry.title)}
      </p>
      <p className="mt-1 text-[0.9375rem] leading-relaxed text-ink-soft">{t(entry.description)}</p>
    </>
  );

  const shared =
    'group flex h-full flex-col rounded-card border border-line bg-surface p-4 transition-colors hover:border-primary-border hover:bg-primary-tint/40';

  if (entry.external) {
    return (
      <a href={entry.href} target="_blank" rel="noopener noreferrer" className={cx(shared)}>
        {body}
        <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
          {t(copy.global.visitMontanaLawHelp)}
          <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
          <span className="sr-only"> ({t(copy.global.opensInNewTab)})</span>
        </span>
      </a>
    );
  }

  return (
    <Link to={entry.href} onClick={onNavigate} className={cx(shared)}>
      {body}
      <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
        {t(copy.global.learnMore)}
        <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
      </span>
    </Link>
  );
}
