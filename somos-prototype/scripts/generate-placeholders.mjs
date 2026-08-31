/**
 * Generates one art-directed placeholder plate per photo slot in
 * src/data/media.manifest.json.
 *
 * These stand in for photography that has not been shot yet. They are
 * deliberately abstract — warm, textural, tonal compositions in the Somos
 * palette — so that layout, rhythm and colour can be judged now, and so the
 * site never shows a grey wireframe box to a client.
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

/** Five tonal steps per palette, lightest first. Deliberately kept in the
 *  bright half of each hue so the plates read sunny rather than heavy. */
const TONES = {
  sunlit: ['#FFFCEF', '#FFF3D2', '#FFE49F', '#FFCA69', '#F4AC38'],
  warm: ['#FFF8F1', '#FFEDDF', '#FFD8BF', '#FFBC98', '#F79868'],
  clay: ['#FFF4EF', '#FFE4D8', '#FFC6B1', '#FF9F80', '#F07954'],
  sage: ['#F5FCF2', '#E4F6DE', '#C3E9BA', '#9AD790', '#6DBD68'],
  ochre: ['#FFFDEC', '#FFF8CD', '#FFEE9B', '#FFDC5C', '#F2C231'],
  sky: ['#F4FBFE', '#E0F2FA', '#BAE2F1', '#8CCBE5', '#5AAFD4'],
  blossom: ['#FFF6F9', '#FDE7EE', '#F9CBDA', '#F3AAC2', '#E888A6'],
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

/** Soft overlapping bands, like light falling across a floor. */
function landscape(w, h, c, pick) {
  const base = h * pick(0.5, 0.62);
  const bands = [3, 2, 4].map((step, i) => {
    const y = base + i * h * 0.13;
    const lift = h * pick(0.05, 0.12);
    return `<path d="M0 ${r(y)} C ${r(w * 0.28)} ${r(y - lift)}, ${r(w * 0.62)} ${r(y + lift * 0.7)}, ${w} ${r(y - lift * 0.5)} L ${w} ${h} L 0 ${h} Z" fill="${c[step]}" opacity="${i === 0 ? 0.85 : 0.9}"/>`;
  });
  const sunX = w * pick(0.14, 0.82);
  const sunY = base * pick(0.32, 0.62);
  const sunR = Math.min(w, h) * pick(0.13, 0.2);
  return `
  <circle cx="${r(sunX)}" cy="${r(sunY)}" r="${r(sunR)}" fill="${c[1]}" opacity="0.85"/>
  <circle cx="${r(sunX)}" cy="${r(sunY)}" r="${r(sunR * 1.9)}" fill="${c[1]}" opacity="0.3"/>
  ${bands.join('\n  ')}`;
}

/** A doorway or window arch — the way into a room. */
function arch(w, h, c, pick) {
  const aw = w * pick(0.3, 0.44);
  const ah = h * pick(0.62, 0.8);
  const x = w * pick(0.16, 0.56);
  const y = h - ah - h * pick(0.02, 0.12);
  const rad = aw / 2;
  const inset = aw * 0.18;
  const ground = h * pick(0.78, 0.9);
  return `
  <path d="M0 ${r(ground)} H ${w} V ${h} H 0 Z" fill="${c[3]}" opacity="0.92"/>
  <path d="M${r(x)} ${r(y + ah)} V ${r(y + rad)} A ${r(rad)} ${r(rad)} 0 0 1 ${r(x + aw)} ${r(y + rad)} V ${r(y + ah)} Z" fill="${c[2]}"/>
  <path d="M${r(x + inset)} ${r(y + ah)} V ${r(y + rad)} A ${r(rad - inset)} ${r(rad - inset)} 0 0 1 ${r(x + aw - inset)} ${r(y + rad)} V ${r(y + ah)} Z" fill="${c[1]}" opacity="0.9"/>
  <circle cx="${r(x + aw * pick(0.3, 0.7))}" cy="${r(y + ah * pick(0.55, 0.78))}" r="${r(aw * 0.14)}" fill="${c[4]}" opacity="0.45"/>`;
}

/** Concentric arcs — growth rings, ripples, a child's circle. */
function orbit(w, h, c, pick) {
  const cx = w * pick(0.22, 0.78);
  const cy = h * pick(0.3, 0.7);
  const unit = Math.min(w, h) * pick(0.11, 0.15);
  const rings = [4, 3, 2, 1]
    .map((step, i) => `<circle cx="${r(cx)}" cy="${r(cy)}" r="${r(unit * (4 - i))}" fill="${c[step]}" opacity="${0.55 + i * 0.12}"/>`)
    .join('\n  ');
  const ribbon = h * pick(0.68, 0.84);
  return `
  ${rings}
  <path d="M0 ${r(ribbon)} C ${r(w * 0.3)} ${r(ribbon - h * 0.1)}, ${r(w * 0.7)} ${r(ribbon + h * 0.08)}, ${w} ${r(ribbon - h * 0.04)} L ${w} ${h} L 0 ${h} Z" fill="${c[3]}" opacity="0.9"/>`;
}

const COMPOSITIONS = [landscape, arch, orbit];

function plate({ id, ratio, tone }) {
  const [rw, rh] = ratio.split('/').map(Number);
  const w = 1400;
  const h = Math.round((w * rh) / rw);
  const c = TONES[tone] ?? TONES.warm;
  const rand = rng(hash(id));
  const pick = (min, max) => min + rand() * (max - min);
  const compose = COMPOSITIONS[hash(`${id}:composition`) % COMPOSITIONS.length];

  const shaftX = w * pick(0.05, 0.6);
  const shaftW = w * pick(0.16, 0.3);
  const skew = w * pick(0.05, 0.2);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="presentation">
  <defs>
    <linearGradient id="sky" x1="0.1" y1="0" x2="0.6" y2="1">
      <stop offset="0%" stop-color="${c[0]}"/>
      <stop offset="100%" stop-color="${c[3]}"/>
    </linearGradient>
    <linearGradient id="shaft" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.42"/>
      <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="bloom" cx="24%" cy="16%" r="82%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.38"/>
      <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/>
    </radialGradient>
    <filter id="grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
    </filter>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#sky)"/>
  ${compose(w, h, c, pick)}
  <polygon points="${r(shaftX)},0 ${r(shaftX + shaftW)},0 ${r(shaftX + shaftW + skew)},${h} ${r(shaftX + skew)},${h}" fill="url(#shaft)" opacity="0.45"/>
  <rect width="${w}" height="${h}" fill="url(#bloom)"/>
  <rect width="${w}" height="${h}" filter="url(#grain)" opacity="0.11" style="mix-blend-mode:multiply"/>
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
