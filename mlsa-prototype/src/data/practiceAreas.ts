import type { LucideIcon } from 'lucide-react';
import {
  Home,
  ShieldCheck,
  Users,
  CreditCard,
  HeartPulse,
  Receipt,
  Landmark,
  Sprout,
  UserCheck,
  MessagesSquare,
} from 'lucide-react';

/**
 * MLSA's practice areas.
 *
 * Source: MLSA's published description of its work — "domestic violence, crime
 * victim rights, Social Security Disability, consumer rights, housing and
 * landlord-tenant relations, family law, public benefits, migrant issues and
 * Indian law", plus the programme pages published under mtlsa.org/our-work/.
 *
 * Descriptions are written in plain language for a general reader. They
 * describe the *kind of problem* a person might have, not the legal doctrine —
 * someone facing eviction searches for "my landlord", not "landlord-tenant".
 */

export type PracticeAreaGroup = 'safety' | 'home' | 'money' | 'family' | 'community';

export interface PracticeArea {
  id: string;
  icon: LucideIcon;
  group: PracticeAreaGroup;
  name: { en: string; es: string };
  /** One sentence. Plain language. No jargon. */
  summary: { en: string; es: string };
  /** Everyday phrasings a person might actually use. Feeds the search index. */
  examples: { en: string[]; es: string[] };
}

export const PRACTICE_AREA_GROUPS: Array<{
  id: PracticeAreaGroup | 'all';
  label: { en: string; es: string };
}> = [
  { id: 'all', label: { en: 'All areas', es: 'Todas las áreas' } },
  { id: 'safety', label: { en: 'Safety', es: 'Seguridad' } },
  { id: 'home', label: { en: 'Housing', es: 'Vivienda' } },
  { id: 'money', label: { en: 'Money & benefits', es: 'Dinero y beneficios' } },
  { id: 'family', label: { en: 'Family', es: 'Familia' } },
  { id: 'community', label: { en: 'Community & tribal', es: 'Comunidad y tribal' } },
];

export const PRACTICE_AREAS: PracticeArea[] = [
  {
    id: 'domestic-violence',
    icon: ShieldCheck,
    group: 'safety',
    name: { en: 'Domestic Violence & Safety', es: 'Violencia doméstica y seguridad' },
    summary: {
      en: 'Help with orders of protection and legal steps that support your safety.',
      es: 'Ayuda con órdenes de protección y pasos legales que respaldan su seguridad.',
    },
    examples: {
      en: ['order of protection', 'restraining order', 'abuse', 'stalking', 'safety planning'],
      es: ['orden de protección', 'abuso', 'acoso', 'plan de seguridad'],
    },
  },
  {
    id: 'crime-victim-rights',
    icon: UserCheck,
    group: 'safety',
    name: { en: 'Crime Victim Rights', es: 'Derechos de las víctimas de delitos' },
    summary: {
      en: 'Help understanding and asserting the rights you have as a victim of a crime.',
      es: 'Ayuda para comprender y ejercer los derechos que tiene como víctima de un delito.',
    },
    examples: {
      en: ['victim rights', 'crime victim', 'restitution'],
      es: ['derechos de la víctima', 'víctima de delito', 'restitución'],
    },
  },
  {
    id: 'housing',
    icon: Home,
    group: 'home',
    name: { en: 'Housing Rights', es: 'Derechos de vivienda' },
    summary: {
      en: 'Problems with a landlord, an eviction notice, repairs, or losing your housing.',
      es: 'Problemas con el arrendador, un aviso de desalojo, reparaciones o la pérdida de su vivienda.',
    },
    examples: {
      en: ['eviction', 'landlord', 'rent', 'repairs', 'security deposit', 'foreclosure', 'notice to vacate'],
      es: ['desalojo', 'arrendador', 'renta', 'reparaciones', 'depósito de seguridad', 'aviso de desalojo'],
    },
  },
  {
    id: 'consumer',
    icon: CreditCard,
    group: 'money',
    name: { en: 'Consumer & Debt', es: 'Consumidor y deudas' },
    summary: {
      en: 'Debt collection, unfair lending, garnishment, bankruptcy questions and scams.',
      es: 'Cobro de deudas, préstamos abusivos, embargo de salario, preguntas sobre bancarrota y estafas.',
    },
    examples: {
      en: ['debt', 'debt collector', 'garnishment', 'bankruptcy', 'loan', 'scam', 'credit'],
      es: ['deuda', 'cobrador', 'embargo', 'bancarrota', 'préstamo', 'estafa', 'crédito'],
    },
  },
  {
    id: 'public-benefits',
    icon: HeartPulse,
    group: 'money',
    name: { en: 'Public Benefits', es: 'Beneficios públicos' },
    summary: {
      en: 'Benefits that were denied, reduced or stopped — including Social Security Disability.',
      es: 'Beneficios negados, reducidos o suspendidos, incluida la discapacidad del Seguro Social.',
    },
    examples: {
      en: ['SNAP', 'food stamps', 'Medicaid', 'Social Security', 'disability', 'SSI', 'benefits denied', 'TANF'],
      es: ['SNAP', 'cupones de alimentos', 'Medicaid', 'Seguro Social', 'discapacidad', 'beneficios negados'],
    },
  },
  {
    id: 'tax',
    icon: Receipt,
    group: 'money',
    name: { en: 'Tax Issues', es: 'Asuntos de impuestos' },
    summary: {
      en: 'Disputes with the IRS, tax notices you do not understand, and questions about filing.',
      es: 'Disputas con el IRS, avisos de impuestos que no comprende y preguntas relacionadas.',
    },
    examples: {
      en: ['IRS', 'tax', 'tax notice', 'audit', 'refund'],
      es: ['IRS', 'impuestos', 'aviso de impuestos', 'auditoría', 'reembolso'],
    },
  },
  {
    id: 'family',
    icon: Users,
    group: 'family',
    name: { en: 'Family Issues', es: 'Asuntos familiares' },
    summary: {
      en: 'Divorce, parenting plans, custody and other changes to family relationships.',
      es: 'Divorcio, planes de crianza, custodia y otros cambios en las relaciones familiares.',
    },
    examples: {
      en: ['divorce', 'custody', 'parenting plan', 'child support', 'separation', 'guardianship'],
      es: ['divorcio', 'custodia', 'plan de crianza', 'manutención', 'separación', 'tutela'],
    },
  },
  {
    id: 'mediation',
    icon: MessagesSquare,
    group: 'family',
    name: { en: 'Family Transition & Mediation', es: 'Transición familiar y mediación' },
    summary: {
      en: 'Support for families working through change, including mediation options.',
      es: 'Apoyo para familias que atraviesan cambios, incluidas opciones de mediación.',
    },
    examples: {
      en: ['mediation', 'family transition', 'agreement', 'co-parenting'],
      es: ['mediación', 'transición familiar', 'acuerdo', 'crianza compartida'],
    },
  },
  {
    id: 'tribal',
    icon: Landmark,
    group: 'community',
    name: { en: 'Tribal Law', es: 'Derecho tribal' },
    summary: {
      en: 'Legal help for Native Montanans, including matters in Tribal courts.',
      es: 'Ayuda legal para nativos de Montana, incluidos asuntos en cortes tribales.',
    },
    examples: {
      en: ['tribal court', 'Indian law', 'ICWA', 'reservation', 'Native American'],
      es: ['corte tribal', 'ley indígena', 'reservación', 'nativo americano'],
    },
  },
  {
    id: 'agricultural-workers',
    icon: Sprout,
    group: 'community',
    name: { en: 'Agricultural Workers', es: 'Trabajadores agrícolas' },
    summary: {
      en: 'Help for farm and migrant workers with wages, housing and working conditions.',
      es: 'Ayuda para trabajadores agrícolas y migrantes con salarios, vivienda y condiciones laborales.',
    },
    examples: {
      en: ['farm worker', 'migrant', 'wages', 'unpaid wages', 'labor camp'],
      es: ['trabajador agrícola', 'migrante', 'salarios', 'salarios no pagados'],
    },
  },
];
