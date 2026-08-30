export type Lang = 'en' | 'es';

/** A string that exists in both languages. The type makes an untranslated
 *  string a compile error rather than a thing a reviewer notices in Spanish. */
export interface L {
  en: string;
  es: string;
}

export const pick = (value: L, lang: Lang): string => value[lang];
