/**
 * Generates one placeholder plate per photo slot in src/data/media.manifest.json.
 *
 * These stand in for photography that has not been shot yet. Each plate is a
 * bright, two-colour abstract scene — sunrises, rainbows, gardens, stacked
 * blocks — built from soft geometry rather than clip art, so the site reads
 * warm and cheerful while the real photographs are being produced.
 *
 * To replace one: drop a real photo into public/photos/ and point that slot's
 * `file` field at it. Nothing else changes.
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, unlinkSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'public', 'photos');
const manifest = JSON.parse(readFileSync(join(root, 'src/data/media.manifest.json'), 'utf8'));

/** Five steps per palette, lightest first — saturated and cheerful. */
const TONES = {
  sunlit: ['#FFF6D6', '#FFE9A6', '#FFD955', '#FFC531', '#F2AE12'],
  warm: ['#FFEFE6', '#FFD9C6', '#FFB79B', '#FF9576', '#F2704A'],
  clay: ['#FFEDE8', '#FFD2C4', '#FFAB93', '#FF7350', '#EE5233'],
  sage: ['#E8F8E9', '#CDF0CF', '#A6E2A9', '#77CE7D', '#4CB963'],
  ochre: ['#FFF7DD', '#FFEDB4', '#FFDF7A', '#FFCE41', '#F5B41C'],
  sky: ['#E6F5FD', '#C6E8F8', '#93D3F0', '#66C0E9', '#3BA9E0'],
  blossom: ['#FFEDF3', '#FFD3E1', '#FFACC7', '#FA85AC', '#F05C90'],
};

const TONE_NAMES = Object.keys(TONES);

/** Motif hues that sit happily beside each base hue. */
const PARTNERS = {
  sunlit: ['sky', 'sage', 'blossom', 'clay'],
  warm: ['sage', 'sky', 'ochre', 'blossom'],
  clay: ['ochre', 'sky', 'sage', 'blossom'],
  sage: ['ochre', 'clay', 'sky', 'blossom'],
  ochre: ['sky', 'sage', 'clay', 'blossom'],
  sky: ['ochre', 'clay', 'sage', 'blossom'],
  blossom: ['sage', 'ochre', 'sky', 'clay'],
};

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rng(seed) {
  let t = seed;
  return () => {
    t += 0x6d2b79f5;
    let x = t;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

const r = (n) => Math.round(n * 10) / 10;

/** Scattered confetti, the one motif every scene shares. */
function confetti(w, h, c, a, pick, count = 7, b = a) {
  const u = Math.min(w, h);
  const out = [];
  for (let i = 0; i < count; i += 1) {
    const cx = r(pick(0.05, 0.95) * w);
    const cy = r(pick(0.05, 0.55) * h);
    const rad = r(pick(0.012, 0.028) * u);
    const fill = i % 3 === 0 ? a[4] : i % 3 === 1 ? b[3] : c[4];
    out.push(`<circle cx="${cx}" cy="${cy}" r="${rad}" fill="${fill}" opacity="0.85"/>`);
  }
  return out.join('\n  ');
}

/** Rolling hills under a big sun. */
function sunrise(w, h, c, a, pick, b) {
  const u = Math.min(w, h);
  const base = h * pick(0.52, 0.64);
  const sunX = r(pick(0.28, 0.72) * w);
  const sunY = r(base - u * pick(0.2, 0.34));
  const sunR = r(u * pick(0.13, 0.19));
  const rays = Array.from({ length: 10 }, (_, i) => {
    const ang = (i / 10) * Math.PI * 2;
    const x1 = r(sunX + Math.cos(ang) * sunR * 1.35);
    const y1 = r(sunY + Math.sin(ang) * sunR * 1.35);
    const x2 = r(sunX + Math.cos(ang) * sunR * 1.68);
    const y2 = r(sunY + Math.sin(ang) * sunR * 1.68);
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${a[4]}" stroke-width="${r(u * 0.018)}" stroke-linecap="round" opacity="0.75"/>`;
  }).join('\n  ');
  const hills = [2, 3, 4].map((step, i) => {
    const y = base + i * h * 0.13;
    const lift = h * pick(0.05, 0.13);
    return `<path d="M0 ${r(y)} C ${r(w * 0.3)} ${r(y - lift)}, ${r(w * 0.66)} ${r(y + lift * 0.7)}, ${w} ${r(y - lift * 0.5)} L ${w} ${h} L 0 ${h} Z" fill="${c[step]}"/>`;
  });
  return `
  ${rays}
  <circle cx="${sunX}" cy="${sunY}" r="${sunR}" fill="${a[4]}"/>
  <circle cx="${sunX}" cy="${sunY}" r="${r(sunR * 0.5)}" fill="${a[1]}"/>
  ${confetti(w, h, c, a, pick, 7, b)}
  ${hills.join('\n  ')}`;
}

/** Nested arcs. */
function rainbow(w, h, c, a, pick, b) {
  const u = Math.min(w, h);
  const cx = r(pick(0.38, 0.62) * w);
  const cy = r(pick(0.7, 0.84) * h);
  // Keep the widest arc comfortably inside the frame on any aspect ratio.
  const maxRadius = Math.min(cx, w - cx, cy) * 0.88;
  const band = Math.min(u * pick(0.075, 0.1), (maxRadius - u * 0.06) / 4);
  const colors = [c[4], a[4], b[3], c[2]];
  const arcs = colors
    .map((col, i) => {
      const rad = band * (colors.length - i) + u * 0.06;
      return `<path d="M ${r(cx - rad)} ${cy} A ${r(rad)} ${r(rad)} 0 0 1 ${r(cx + rad)} ${cy}" fill="none" stroke="${col}" stroke-width="${r(band * 0.9)}" stroke-linecap="round"/>`;
    })
    .join('\n  ');
  const ground = r(cy);
  return `
  ${confetti(w, h, c, a, pick, 9, b)}
  ${arcs}
  <path d="M0 ${ground} H ${w} V ${h} H 0 Z" fill="${c[2]}"/>`;
}

/** A small grove: canopies on stems above a meadow. */
function garden(w, h, c, a, pick, b) {
  const u = Math.min(w, h);
  const ground = h * pick(0.66, 0.8);
  const trees = Array.from({ length: 3 }, (_, i) => {
    const x = r(w * (0.2 + i * 0.3) + pick(-0.05, 0.05) * w);
    const canopy = r(u * pick(0.11, 0.17));
    const top = r(ground - canopy * pick(1.5, 2.1));
    const fill = i === 1 ? a[4] : i === 0 ? c[4] : b[3];
    return `<rect x="${r(x - u * 0.014)}" y="${r(top)}" width="${r(u * 0.028)}" height="${r(ground - top)}" rx="${r(u * 0.014)}" fill="${c[4]}" opacity="0.55"/>
  <circle cx="${x}" cy="${top}" r="${canopy}" fill="${fill}" opacity="0.9"/>`;
  }).join('\n  ');
  const sunX = r(pick(0.1, 0.86) * w);
  const sunY = r(pick(0.1, 0.28) * h);
  return `
  <circle cx="${sunX}" cy="${sunY}" r="${r(u * 0.1)}" fill="${a[3]}"/>
  ${confetti(w, h, c, a, pick, 6, b)}
  ${trees}
  <path d="M0 ${r(ground)} C ${r(w * 0.35)} ${r(ground - h * 0.05)}, ${r(w * 0.7)} ${r(ground + h * 0.04)}, ${w} ${r(ground - h * 0.02)} L ${w} ${h} L 0 ${h} Z" fill="${c[3]}"/>`;
}

/** Stacked blocks — the shelf, the tower, the work in progress. */
function blocks(w, h, c, a, pick, b) {
  const u = Math.min(w, h);
  const ground = h * pick(0.72, 0.86);
  const bw = u * pick(0.16, 0.22);
  const x0 = Math.min(w * pick(0.2, 0.5), w - bw * 2.1);
  const rows = [
    { x: x0, wd: bw * 1.9, ht: bw * 0.6, fill: c[4] },
    { x: x0 + bw * 0.18, wd: bw * 1.45, ht: bw * 0.55, fill: a[4] },
    { x: x0 + bw * 0.42, wd: bw * 0.95, ht: bw * 0.5, fill: b[3] },
  ];
  let y = ground;
  const stack = rows
    .map((row) => {
      y -= row.ht;
      return `<rect x="${r(row.x)}" y="${r(y)}" width="${r(row.wd)}" height="${r(row.ht)}" rx="${r(row.ht * 0.32)}" fill="${row.fill}"/>`;
    })
    .join('\n  ');
  const ballR = r(bw * 0.3);
  return `
  ${confetti(w, h, c, a, pick, 7, b)}
  <circle cx="${r(x0 + bw * 0.9)}" cy="${r(y - ballR)}" r="${ballR}" fill="${a[3]}"/>
  ${stack}
  <path d="M0 ${r(ground)} H ${w} V ${h} H 0 Z" fill="${c[2]}"/>`;
}

const COMPOSITIONS = [sunrise, rainbow, garden, blocks];

function plate({ id, ratio, tone }) {
  const [rw, rh] = ratio.split('/').map(Number);
  const w = 1400;
  const h = Math.round((w * rh) / rw);
  const toneName = TONES[tone] ? tone : 'warm';
  const c = TONES[toneName];
  const partners = PARTNERS[toneName] ?? TONE_NAMES;
  const a = TONES[partners[hash(`${id}:partner`) % partners.length]];
  const b = TONES[partners[hash(`${id}:third`) % partners.length]];
  const rand = rng(hash(id));
  const pick = (min, max) => min + rand() * (max - min);
  const compose = COMPOSITIONS[hash(`${id}:composition`) % COMPOSITIONS.length];

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="presentation">
  <defs>
    <linearGradient id="sky" x1="0.1" y1="0" x2="0.5" y2="1">
      <stop offset="0%" stop-color="${c[0]}"/>
      <stop offset="100%" stop-color="${c[1]}"/>
    </linearGradient>
    <filter id="grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
    </filter>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#sky)"/>
  ${compose(w, h, c, a, pick, b)}
  <rect width="${w}" height="${h}" filter="url(#grain)" opacity="0.05" style="mix-blend-mode:multiply"/>
</svg>
`;
}

mkdirSync(outDir, { recursive: true });
for (const f of readdirSync(outDir)) {
  if (f.startsWith('plate-') && f.endsWith('.svg')) unlinkSync(join(outDir, f));
}
for (const photo of manifest.photos) {
  writeFileSync(join(outDir, `plate-${photo.id}.svg`), plate(photo));
}
console.log(`generated ${manifest.photos.length} placeholder plates -> public/photos/`);
