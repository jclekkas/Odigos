export const site = {
  name: 'Somos Early Learning',
  shortName: 'Somos',
  /** Update this before a production launch — it drives canonical URLs and JSON-LD. */
  origin: 'https://somos-early-learning.netlify.app',
  tagline: 'Bilingual Montessori learning built around the whole child.',
  description:
    'Somos Early Learning is a bilingual Montessori early-learning community for children ages 2–5, with schools in Germantown and Ellicott City, Maryland.',
  email: 'info@somosearlylearning.com',
  founded: null as string | null,
} as const;

export const primaryNav = [
  { label: 'Programs', href: '/programs' },
  { label: 'Our Approach', href: '/approach' },
  { label: 'Locations', href: '/locations' },
  { label: 'Admissions', href: '/admissions' },
  { label: 'About', href: '/about' },
  { label: 'Families', href: '/families' },
] as const;

export const footerNav = [
  { label: 'Programs', href: '/programs' },
  { label: 'Our Approach', href: '/approach' },
  { label: 'Locations', href: '/locations' },
  { label: 'Admissions', href: '/admissions' },
  { label: 'About', href: '/about' },
  { label: 'Families', href: '/families' },
  { label: 'Careers', href: '/careers' },
] as const;

export const legalNav = [
  { label: 'Privacy', href: '/privacy' },
  { label: 'Accessibility', href: '/accessibility' },
] as const;
