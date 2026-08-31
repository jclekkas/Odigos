import { locations } from '@/data/locations';

/** Every route that gets its own static HTML file at build time. */
export const staticRoutes: string[] = [
  '/',
  '/programs',
  '/approach',
  '/locations',
  ...locations.map((l) => `/locations/${l.slug}`),
  '/admissions',
  '/about',
  '/families',
  '/careers',
  '/privacy',
  '/accessibility',
];
