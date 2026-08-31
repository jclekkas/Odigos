/**
 * The accent rotation, taken straight from the icons in the Somos logo:
 * wordmark green, "early learning" blue, lightbulb yellow, apple red,
 * star pink, star purple, palette teal.
 *
 * Peer elements — learning areas, trust strip, programme cards, location
 * cards, testimonials — each take their own colour so the page stays as
 * lively as the mark it belongs to.
 *
 * `chip` is the only token safe to put text on: every pairing is chosen to
 * clear 4.5:1, which is why the yellow chip takes ink where the rest take
 * white. `solid` is for decorative fills that carry no text.
 */
export const PILLAR_ACCENTS = [
  { text: 'text-grass-700', bg: 'bg-grass-50', tint: 'bg-grass-100', solid: 'bg-grass-400', chip: 'bg-grass-600 text-white', border: 'border-grass-400', dot: 'bg-grass-400' },
  { text: 'text-sky-600', bg: 'bg-sky-50', tint: 'bg-sky-100', solid: 'bg-sky-400', chip: 'bg-sky-500 text-white', border: 'border-sky-400', dot: 'bg-sky-400' },
  { text: 'text-sun-700', bg: 'bg-sun-50', tint: 'bg-sun-100', solid: 'bg-sun-400', chip: 'bg-sun-400 text-ink', border: 'border-sun-400', dot: 'bg-sun-400' },
  { text: 'text-berry-600', bg: 'bg-berry-50', tint: 'bg-berry-100', solid: 'bg-berry-400', chip: 'bg-berry-600 text-white', border: 'border-berry-400', dot: 'bg-berry-400' },
  { text: 'text-grape-600', bg: 'bg-grape-50', tint: 'bg-grape-100', solid: 'bg-grape-400', chip: 'bg-grape-600 text-white', border: 'border-grape-400', dot: 'bg-grape-400' },
  { text: 'text-teal-600', bg: 'bg-teal-50', tint: 'bg-teal-100', solid: 'bg-teal-400', chip: 'bg-teal-600 text-white', border: 'border-teal-400', dot: 'bg-teal-400' },
  { text: 'text-coral-600', bg: 'bg-coral-50', tint: 'bg-coral-100', solid: 'bg-coral-400', chip: 'bg-coral-600 text-white', border: 'border-coral-400', dot: 'bg-coral-400' },
] as const;
