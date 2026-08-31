/**
 * A rotating set of accent colours. Used wherever a list of peers benefits
 * from being visually distinct — the five learning areas, the trust strip,
 * the programme cards — so the page reads cheerful rather than monotone.
 */
export const PILLAR_ACCENTS = [
  { border: 'border-clay-400', text: 'text-clay-700', bg: 'bg-clay-50', dot: 'bg-clay-500' },
  { border: 'border-ochre-500', text: 'text-ochre-700', bg: 'bg-ochre-50', dot: 'bg-ochre-500' },
  { border: 'border-sage-500', text: 'text-sage-700', bg: 'bg-sage-50', dot: 'bg-sage-500' },
  { border: 'border-sky-500', text: 'text-sky-700', bg: 'bg-sky-50', dot: 'bg-sky-500' },
  { border: 'border-blossom-300', text: 'text-blossom-700', bg: 'bg-blossom-50', dot: 'bg-blossom-300' },
] as const;
