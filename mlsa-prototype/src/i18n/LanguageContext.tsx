import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { L, Lang } from './types';
import { COPY } from './copy';

interface LanguageValue {
  lang: Lang;
  setLang: (next: Lang) => void;
  /** Resolve a bilingual string against the active language. */
  t: (value: L) => string;
  /** The full copy deck, already resolved. */
  copy: typeof COPY;
}

const LanguageContext = createContext<LanguageValue | null>(null);

const STORAGE_KEY = 'mlsa-prototype-lang';

function readInitialLang(): Lang {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'en' || stored === 'es') return stored;
  } catch {
    /* Private browsing or blocked storage — fall through to the default. */
  }
  // A Spanish-preferring browser gets Spanish first, rather than having to
  // find a toggle. The toggle still overrides, and the choice is remembered.
  if (typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('es')) {
    return 'es';
  }
  return 'en';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readInitialLang);

  // Keep the document language in sync so assistive technology switches its
  // pronunciation rules. This is the part a translate widget cannot do.
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* Not being able to remember the choice is not a reason to fail. */
    }
  }, []);

  const value = useMemo<LanguageValue>(
    () => ({
      lang,
      setLang,
      t: (v: L) => v[lang],
      copy: COPY,
    }),
    [lang, setLang],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLang(): LanguageValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLang must be used inside <LanguageProvider>');
  return ctx;
}
