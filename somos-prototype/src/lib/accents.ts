/**
 * The rotating accent set. Peer elements — the five learning areas, the trust
 * strip, programme cards, location cards, testimonials — each take their own
 * colour so the page stays lively rather than monotone.
 *
 * `chip` is the only token safe to put text on: each pairing is chosen so the
 * label clears 4.5:1, which is why the yellow chip takes ink and the rest take
 * white. `solid` is for decorative fills that carry no text.
 */
export const PILLAR_ACCENTS = [
  {
    text: 'text-coral-700',
    bg: 'bg-coral-50',
    tint: 'bg-coral-100',
    solid: 'bg-coral-500',
    chip: 'bg-coral-600 text-white',
    border: 'border-coral-400',
    dot: 'bg-coral-400',
  },
  {
    text: 'text-sun-700',
    bg: 'bg-sun-50',
    tint: 'bg-sun-100',
    solid: 'bg-sun-400',
    chip: 'bg-sun-400 text-ink',
    border: 'border-sun-400',
    dot: 'bg-sun-400',
  },
  {
    text: 'text-grass-600',
    bg: 'bg-grass-50',
    tint: 'bg-grass-100',
    solid: 'bg-grass-400',
    chip: 'bg-grass-600 text-white',
    border: 'border-grass-400',
    dot: 'bg-grass-400',
  },
  {
    text: 'text-sky-700',
    bg: 'bg-sky-50',
    tint: 'bg-sky-100',
    solid: 'bg-sky-400',
    chip: 'bg-sky-600 text-white',
    border: 'border-sky-400',
    dot: 'bg-sky-400',
  },
  {
    text: 'text-berry-700',
    bg: 'bg-berry-50',
    tint: 'bg-berry-100',
    solid: 'bg-berry-400',
    chip: 'bg-berry-600 text-white',
    border: 'border-berry-400',
    dot: 'bg-berry-400',
  },
] as const;
