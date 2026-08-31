import { site } from '@/data/site';
import { locations, type Location } from '@/data/locations';

const url = (path: string) => `${site.origin}${path}`;

/** Only verified, publicly stated information belongs in structured data. */
export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    '@id': `${site.origin}/#organization`,
    name: site.name,
    url: url('/'),
    email: site.email,
    description: site.description,
    areaServed: 'Maryland',
    department: locations.map((loc) => ({ '@id': `${site.origin}/locations/${loc.slug}#school` })),
  };
}

export function schoolJsonLd(loc: Location) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Preschool',
    '@id': `${site.origin}/locations/${loc.slug}#school`,
    name: loc.name,
    url: url(`/locations/${loc.slug}`),
    telephone: loc.phone,
    email: site.email,
    parentOrganization: { '@id': `${site.origin}/#organization` },
    address: {
      '@type': 'PostalAddress',
      streetAddress: loc.street,
      addressLocality: loc.city,
      addressRegion: 'MD',
      postalCode: loc.cityStateZip.split(' ').pop(),
      addressCountry: 'US',
    },
  };
}

export function breadcrumbJsonLd(trail: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: url(item.path),
    })),
  };
}

export function faqJsonLd(items: readonly { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };
}
