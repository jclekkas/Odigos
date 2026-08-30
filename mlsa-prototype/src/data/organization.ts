/**
 * VERIFIED ORGANISATIONAL FACTS
 * ----------------------------------------------------------------------------
 * Everything in this file was taken from Montana Legal Services Association's
 * own public materials (mtlsa.org / montanalawhelp.org). Nothing here is
 * invented. Anything that could NOT be verified is either omitted entirely or
 * carries `verified: false`, which the UI renders as a visible placeholder
 * rather than presenting it as fact.
 *
 * In a real engagement this module is the seam where a CMS would attach.
 * Announcements, HelpLine hours and impact figures all change; they are modelled
 * as content, not as markup.
 */

export type Provenance = {
  /** True only when the value was found in MLSA's published materials. */
  verified: boolean;
  /** Where the value came from, shown in the prototype's source notes. */
  source?: string;
};

export const ORG = {
  legalName: 'Montana Legal Services Association',
  shortName: 'MLSA',
  foundedISO: '1966-05-05',
  foundedYear: 1966,
  /** Source: mtlsa.org — "MLSA 60th Anniversary Timeline" / About Us. */
  foundedNote: 'Founded May 5, 1966 to provide civil legal aid to Montanans living in poverty.',
  sisterSite: {
    name: 'MontanaLawHelp.org',
    url: 'https://www.montanalawhelp.org/',
    applyUrl: 'https://www.montanalawhelp.org/apply-legal-services',
  },
  officialSite: 'https://www.mtlsa.org/',
} as const;

/** HelpLine — modelled as CMS content because published hours change. */
export const HELPLINE = {
  phoneDisplay: '1-800-666-6899',
  phoneHref: 'tel:+18006666899',
  /** Source: mtlsa.org / montanalawhelp.org — "Tuesday through Thursday, 9:00 am – 1:00 pm". */
  days: { en: 'Tuesday – Thursday', es: 'Martes a jueves' },
  hours: { en: '9:00 a.m. – 1:00 p.m.', es: '9:00 a. m. – 1:00 p. m.' },
  timezone: { en: 'Mountain Time', es: 'hora de la montaña' },
  lastVerified: '2026-08',
  verified: true,
} as const;

/** Source: mtlsa.org contact / resource map. */
export const OFFICES = [
  {
    city: 'Helena',
    address: '616 Helena Ave, Suite 100',
    cityState: 'Helena, MT 59601',
    verified: true,
  },
  { city: 'Billings', address: null, cityState: null, verified: true },
  { city: 'Missoula', address: null, cityState: null, verified: true },
] as const;

export const FAX = '1-406-442-9817';

/**
 * Impact figures.
 *
 * Note what is NOT here: an annual "people served" number. MLSA's public
 * materials say "thousands of Montanans each year" without publishing a
 * figure we could confirm, so the prototype says exactly that and no more.
 * Inventing a number would be the easiest thing on this page to get wrong.
 */
export const IMPACT: Array<{
  value: { en: string; es: string };
  label: { en: string; es: string };
  detail: { en: string; es: string };
} & Provenance> = [
  {
    value: { en: '60 years', es: '60 años' },
    label: { en: 'Serving Montana since 1966', es: 'Al servicio de Montana desde 1966' },
    detail: {
      en: 'MLSA was founded on May 5, 1966 to provide civil legal aid to Montanans living in poverty.',
      es: 'MLSA se fundó el 5 de mayo de 1966 para brindar asistencia legal civil a los habitantes de Montana que viven en la pobreza.',
    },
    verified: true,
    source: 'mtlsa.org — About Us / 60th Anniversary Timeline',
  },
  {
    value: { en: 'All 56', es: 'Los 56' },
    label: { en: 'Montana counties served', es: 'condados de Montana atendidos' },
    detail: {
      en: 'MLSA provides civil legal services to low-income Montanans living in all 56 Montana counties.',
      es: 'MLSA brinda servicios legales civiles a habitantes de Montana de bajos ingresos en los 56 condados del estado.',
    },
    verified: true,
    source: 'mtlsa.org — About Us',
  },
  {
    value: { en: 'Every', es: 'Todas' },
    label: { en: 'Tribal Reservation in Montana', es: 'las reservaciones tribales de Montana' },
    detail: {
      en: 'Services are provided on all Tribal Reservations in Montana.',
      es: 'Se brindan servicios en todas las reservaciones tribales de Montana.',
    },
    verified: true,
    source: 'mtlsa.org — About Us',
  },
  {
    value: { en: 'Thousands', es: 'Miles' },
    label: { en: 'of Montanans assisted each year', es: 'de habitantes de Montana asistidos cada año' },
    detail: {
      en: 'MLSA provides legal information, advice and representation to thousands of Montanans each year. MLSA does not publish a figure we could verify, so this prototype does not state one.',
      es: 'MLSA brinda información legal, asesoría y representación a miles de habitantes de Montana cada año. MLSA no publica una cifra que hayamos podido verificar, por lo que este prototipo no indica ninguna.',
    },
    verified: true,
    source: 'mtlsa.org — About Us (no numeric figure published)',
  },
];

/**
 * Client testimonial, quoted from MLSA's public website. Not paraphrased,
 * not composited, not written for this prototype.
 */
export const TESTIMONIAL = {
  quote: {
    en: 'Without the help of MLSA I would not have been able to find legal services. Their rapid response to my situation single handedly provided me with exactly what I needed.',
    es: 'Sin la ayuda de MLSA no habría podido encontrar servicios legales. Su rápida respuesta a mi situación me dio exactamente lo que necesitaba.',
  },
  /** MLSA publishes this without an attributed name; we do not invent one. */
  attribution: {
    en: 'MLSA client, published on mtlsa.org',
    es: 'Cliente de MLSA, publicado en mtlsa.org',
  },
  translationNote: {
    en: null,
    es: 'Traducción de una cita publicada en inglés.',
  },
  verified: true,
} as const;

/**
 * Announcement bar content. Structured as a CMS record — type, dates and
 * dismissibility are data, so operations staff can post a notice without
 * a developer. The copy below is representative prototype content.
 */
export type Announcement = {
  id: string;
  tone: 'info' | 'notice';
  message: { en: string; es: string };
  linkLabel: { en: string; es: string } | null;
  href: string | null;
  dismissible: boolean;
  isPlaceholder: boolean;
};

export const ANNOUNCEMENT: Announcement | null = {
  id: 'helpline-hours-2026',
  tone: 'info',
  message: {
    en: `HelpLine: ${HELPLINE.days.en}, ${HELPLINE.hours.en} Apply online any time.`,
    es: `Línea de ayuda: ${HELPLINE.days.es}, ${HELPLINE.hours.es} Solicite en línea a cualquier hora.`,
  },
  linkLabel: { en: 'Ways to apply', es: 'Formas de solicitar ayuda' },
  href: '/get-help',
  dismissible: true,
  isPlaceholder: false,
};

/** Where Quick Exit sends the browser. Deliberately neutral and unremarkable. */
export const QUICK_EXIT_URL = 'https://weather.com/';
