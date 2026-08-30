import type { L } from '@/i18n/types';
import { PRACTICE_AREAS } from './practiceAreas';
import { ORG } from './organization';

/**
 * A deliberately small, hand-built search index.
 *
 * The interesting part is not the ranking — it is the `kind` field. A person
 * searching "eviction" is served by two different things at once: an MLSA
 * service they can apply to, and a MontanaLawHelp article they can read right
 * now. Search is where the two-property information architecture either becomes
 * clear or stays confusing, so results carry their source on the face.
 */

export type ResultKind = 'mlsa-service' | 'mlsa-page' | 'montanalawhelp';

export interface SearchEntry {
  id: string;
  kind: ResultKind;
  title: L;
  description: L;
  /** Internal route, or an absolute URL for MontanaLawHelp resources. */
  href: string;
  external?: boolean;
  keywords: { en: string[]; es: string[] };
}

/** Practice areas are services; they generate their own entries. */
const practiceAreaEntries: SearchEntry[] = PRACTICE_AREAS.map((area) => ({
  id: `service-${area.id}`,
  kind: 'mlsa-service',
  title: area.name,
  description: area.summary,
  href: `/our-work#${area.id}`,
  keywords: {
    en: [...area.examples.en, area.name.en.toLowerCase()],
    es: [...area.examples.es, area.name.es.toLowerCase()],
  },
}));

const pageEntries: SearchEntry[] = [
  {
    id: 'apply',
    kind: 'mlsa-page',
    title: { en: 'Apply for Legal Help', es: 'Solicite ayuda legal' },
    description: {
      en: 'Apply online or by phone to see whether MLSA can help with your civil legal problem.',
      es: 'Solicite en línea o por teléfono para saber si MLSA puede ayudarle con su problema legal civil.',
    },
    href: '/get-help',
    keywords: {
      en: ['apply', 'application', 'get help', 'intake', 'helpline', 'phone', 'eligibility', 'qualify'],
      es: ['solicitar', 'solicitud', 'ayuda', 'línea de ayuda', 'teléfono', 'elegibilidad', 'calificar'],
    },
  },
  {
    id: 'helpline',
    kind: 'mlsa-service',
    title: { en: 'MLSA HelpLine', es: 'Línea de ayuda de MLSA' },
    description: {
      en: 'Call 1-800-666-6899 during published hours to apply by phone.',
      es: 'Llame al 1-800-666-6899 durante el horario publicado para solicitar ayuda por teléfono.',
    },
    href: '/get-help#helpline',
    keywords: {
      en: ['helpline', 'phone', 'call', 'hours', 'talk to someone', '800'],
      es: ['línea de ayuda', 'teléfono', 'llamar', 'horario', 'hablar con alguien'],
    },
  },
  {
    id: 'our-work',
    kind: 'mlsa-page',
    title: { en: 'Our Work', es: 'Nuestro trabajo' },
    description: {
      en: 'The civil legal areas MLSA works in, and how systemic advocacy differs from individual cases.',
      es: 'Las áreas legales civiles en las que trabaja MLSA y en qué se diferencia la defensa sistémica de los casos individuales.',
    },
    href: '/our-work',
    keywords: {
      en: ['practice areas', 'programs', 'services', 'advocacy', 'what we do'],
      es: ['áreas de práctica', 'programas', 'servicios', 'defensa', 'qué hacemos'],
    },
  },
  {
    id: 'about',
    kind: 'mlsa-page',
    title: { en: 'About MLSA', es: 'Acerca de MLSA' },
    description: {
      en: 'History since 1966, statewide reach, impact and accountability.',
      es: 'Historia desde 1966, alcance estatal, impacto y rendición de cuentas.',
    },
    href: '/about',
    keywords: {
      en: ['about', 'history', 'impact', 'donate', 'funders', 'offices', 'counties', 'annual report'],
      es: ['acerca de', 'historia', 'impacto', 'donar', 'financiadores', 'oficinas', 'condados'],
    },
  },
  {
    id: 'volunteer',
    kind: 'mlsa-page',
    title: { en: 'Volunteer with MLSA', es: 'Sea voluntario con MLSA' },
    description: {
      en: 'Pro bono opportunities for Montana attorneys and other eligible volunteers.',
      es: 'Oportunidades pro bono para abogados de Montana y otros voluntarios elegibles.',
    },
    href: '/about#support',
    keywords: {
      en: ['volunteer', 'pro bono', 'attorney', 'lawyer', 'give time'],
      es: ['voluntario', 'pro bono', 'abogado', 'donar tiempo'],
    },
  },
];

const montanaLawHelpEntries: SearchEntry[] = [
  {
    id: 'mlh-eviction',
    kind: 'montanalawhelp',
    title: { en: 'Eviction Resources', es: 'Recursos sobre desalojo' },
    description: {
      en: 'Free articles, court forms and step-by-step guides about eviction in Montana.',
      es: 'Artículos gratuitos, formularios judiciales y guías paso a paso sobre el desalojo en Montana.',
    },
    href: ORG.sisterSite.url,
    external: true,
    keywords: {
      en: ['eviction', 'evicted', 'landlord', 'notice to vacate', 'rent', 'lease'],
      es: ['desalojo', 'desalojado', 'arrendador', 'aviso de desalojo', 'renta', 'contrato'],
    },
  },
  {
    id: 'mlh-divorce',
    kind: 'montanalawhelp',
    title: { en: 'Divorce & Parenting Forms', es: 'Formularios de divorcio y crianza' },
    description: {
      en: 'Self-help forms and instructions for divorce and parenting plans in Montana.',
      es: 'Formularios de autoayuda e instrucciones para el divorcio y los planes de crianza en Montana.',
    },
    href: ORG.sisterSite.url,
    external: true,
    keywords: {
      en: ['divorce', 'dissolution', 'parenting plan', 'custody', 'forms', 'child support'],
      es: ['divorcio', 'disolución', 'plan de crianza', 'custodia', 'formularios', 'manutención'],
    },
  },
  {
    id: 'mlh-debt',
    kind: 'montanalawhelp',
    title: { en: 'Debt & Money Problems', es: 'Deudas y problemas de dinero' },
    description: {
      en: 'What to do about debt collectors, garnishment and court judgments.',
      es: 'Qué hacer ante cobradores de deudas, embargos de salario y fallos judiciales.',
    },
    href: ORG.sisterSite.url,
    external: true,
    keywords: {
      en: ['debt', 'debt collector', 'garnishment', 'judgment', 'bankruptcy', 'money'],
      es: ['deuda', 'cobrador', 'embargo', 'fallo', 'bancarrota', 'dinero'],
    },
  },
  {
    id: 'mlh-benefits',
    kind: 'montanalawhelp',
    title: { en: 'Public Benefits Information', es: 'Información sobre beneficios públicos' },
    description: {
      en: 'Information about SNAP, Medicaid, disability benefits and appealing a denial.',
      es: 'Información sobre SNAP, Medicaid, beneficios por discapacidad y cómo apelar una negación.',
    },
    href: ORG.sisterSite.url,
    external: true,
    keywords: {
      en: ['benefits', 'SNAP', 'food stamps', 'medicaid', 'disability', 'appeal', 'denied'],
      es: ['beneficios', 'SNAP', 'cupones de alimentos', 'medicaid', 'discapacidad', 'apelar', 'negado'],
    },
  },
  {
    id: 'mlh-protection-order',
    kind: 'montanalawhelp',
    title: { en: 'Orders of Protection', es: 'Órdenes de protección' },
    description: {
      en: 'How orders of protection work in Montana, and the forms to ask for one.',
      es: 'Cómo funcionan las órdenes de protección en Montana y los formularios para solicitar una.',
    },
    href: ORG.sisterSite.url,
    external: true,
    keywords: {
      en: ['protection order', 'restraining order', 'domestic violence', 'abuse', 'safety'],
      es: ['orden de protección', 'violencia doméstica', 'abuso', 'seguridad'],
    },
  },
  {
    id: 'mlh-apply',
    kind: 'montanalawhelp',
    title: { en: 'Online Application for Legal Help', es: 'Solicitud en línea de ayuda legal' },
    description: {
      en: 'The online application for MLSA services, open at any time. Takes about 10–15 minutes.',
      es: 'La solicitud en línea de los servicios de MLSA, disponible en todo momento. Toma entre 10 y 15 minutos.',
    },
    href: ORG.sisterSite.applyUrl,
    external: true,
    keywords: {
      en: ['apply', 'application', 'online', 'form', 'intake', 'sign up'],
      es: ['solicitar', 'solicitud', 'en línea', 'formulario', 'inscribirse'],
    },
  },
];

export const SEARCH_INDEX: SearchEntry[] = [
  ...pageEntries,
  ...practiceAreaEntries,
  ...montanaLawHelpEntries,
];

export const SEARCH_SUGGESTIONS: L[] = [
  { en: 'eviction', es: 'desalojo' },
  { en: 'divorce', es: 'divorcio' },
  { en: 'debt', es: 'deuda' },
  { en: 'benefits', es: 'beneficios' },
];

const normalize = (value: string): string =>
  value
    .toLowerCase()
    .normalize('NFD')
    // Strip accents so "desalojó" matches "desalojo" and vice versa.
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

/**
 * Scores an entry against a query. Title matches beat keyword matches, and
 * a whole-word match beats a substring, so "rent" does not rank "parenting"
 * above "renting".
 */
export function searchEntries(query: string, lang: 'en' | 'es'): SearchEntry[] {
  const q = normalize(query);
  if (q.length < 2) return [];
  const terms = q.split(/\s+/).filter(Boolean);

  const scored = SEARCH_INDEX.map((entry) => {
    const title = normalize(entry.title[lang]);
    const description = normalize(entry.description[lang]);
    const keywords = entry.keywords[lang].map(normalize);
    // Search both languages' keywords: a Spanish speaker may still type "SNAP".
    const otherKeywords = entry.keywords[lang === 'en' ? 'es' : 'en'].map(normalize);

    let score = 0;
    for (const term of terms) {
      if (title === term) score += 100;
      else if (title.startsWith(term)) score += 60;
      else if (title.includes(term)) score += 40;

      if (keywords.some((k) => k === term)) score += 45;
      else if (keywords.some((k) => k.includes(term))) score += 25;

      if (otherKeywords.some((k) => k.includes(term))) score += 10;
      if (description.includes(term)) score += 8;
    }
    return { entry, score };
  })
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, 8).map((row) => row.entry);
}
