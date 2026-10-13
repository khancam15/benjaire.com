// Generates the Benjaire logo SVGs (docs/design-system.md §8).
// Usage: node scripts/build-logos.mjs <outDir>
//
// Rendering rules (crisp in every browser, including Safari/iOS):
//  - no SVG filters and no masks in web assets
//  - all geometry is baked into one coordinate system, so the bronze
//    gradient (userSpaceOnUse) is applied directly to fills and strokes
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const out = process.argv[2] ?? 'public/brand';
mkdirSync(out, { recursive: true });

// Monogram "B", traced from the owner's logo (583 × 608 box).
const MONO = 'M3,3 H405 C478,3 518,45 518,122 C518,178 510,224 490,258 C548,286 580,335 580,410 V462 C580,556 540,605 482,605 H88 V265 L168,335 V530 H432 C474,530 495,508 495,466 V405 C495,355 470,315 430,315 H323 V450 H243 V235 H378 C415,235 438,212 438,175 V140 C438,105 418,80 395,80 H88 V245 L8,180 V3 Z';
const MONO_W = 583;
const MONO_H = 608;

// Wordmark glyph centerlines in a 90-unit cap box (monoline, extended).
const G = {
  B: 'M6,6 V84 H64 Q84,84 84,64 V64 Q84,45 64,45 H6 M6,6 H62 Q80,6 80,24 V27 Q80,45 62,45',
  E: 'M84,6 H6 V84 H84 M6,45 H76',
  N: 'M6,84 V6 L84,84 V6',
  J: 'M84,6 V64 Q84,84 64,84 H26 Q6,84 6,64 V58',
  A: 'M6,84 L45,6 L84,84',
  I: 'M6,6 V84',
  R: 'M6,84 V6 H64 Q84,6 84,26 V28 Q84,48 64,48 H6 M54,48 L84,84',
};
const SEQ = [['B', 0], ['E', 152], ['N', 304], ['J', 456], ['A', 608], ['I', 760], ['R', 834], ['E', 986]];
const WORD_W = 1076;
const STROKE = 18; // heavier than v1 (15): holds up at small sizes
const PAD = STROKE / 2 - 6; // stroke overhang beyond the 0..90 box

/** Scale and translate an absolute-coordinate path (M L H V Q C Z). */
function transform(d, s, tx, ty) {
  const tokens = d.match(/[MLHVQCZ]|-?\d*\.?\d+/g);
  const outTokens = [];
  let cmd = '';
  let axis = 0;
  for (const t of tokens) {
    if (/[A-Z]/.test(t)) { cmd = t; axis = 0; outTokens.push(t); continue; }
    const n = Number(t);
    let v;
    if (cmd === 'H') v = n * s + tx;
    else if (cmd === 'V') v = n * s + ty;
    else { v = axis % 2 === 0 ? n * s + tx : n * s + ty; axis++; }
    outTokens.push(String(Math.round(v * 100) / 100));
  }
  return outTokens.join(' ').replace(/ ([MLHVQCZ])/g, '\n$1').replace(/([MLHVQCZ]) /g, '$1');
}

const mono = (s, tx, ty) => transform(MONO, s, tx, ty);
const word = (s, tx, ty) => SEQ.map(([c, x]) => transform(G[c], s, tx + x * s, ty)).join(' ');

const BRONZE = [
  // Soft brushed-bronze sweep (a gentle highlight, not a stripe).
  [0, '#5e3d24'], [0.3, '#7f5232'], [0.52, '#a5764b'], [0.74, '#7f5232'], [1, '#5e3d24'],
];
const gradient = (id, w, h) =>
  `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${w}" y2="${h}">${BRONZE.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('')}</linearGradient>`;

function svg({ id, w, h, monoD, wordD, wordStroke, paint }) {
  const fill = paint === 'bronze' ? `url(#${id})` : paint;
  const defs = paint === 'bronze' ? `<defs>${gradient(id, w, h)}</defs>` : '';
  const parts = [];
  if (monoD) parts.push(`<path fill="${fill}" d="${monoD}"/>`);
  if (wordD) parts.push(`<path fill="none" stroke="${fill}" stroke-width="${wordStroke}" stroke-linejoin="round" d="${wordD}"/>`);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="Benjaire"><title>Benjaire</title>${defs}${parts.join('')}</svg>\n`;
}

// Layouts (all numbers in the output's own units).
function vertical() {
  const s = 1.49; // wordmark scale under the monogram
  const ww = WORD_W * s + 2 * PAD * s;
  const w = Math.ceil(Math.max(ww, MONO_W));
  const gap = 184;
  const h = Math.ceil(MONO_H + gap + (90 + 2 * PAD) * s);
  return { w, h, monoD: mono(1, (w - MONO_W) / 2, 0), wordD: word(s, (w - WORD_W * s) / 2, MONO_H + gap + PAD * s), wordStroke: STROKE * s };
}
function horizontal() {
  const cap = MONO_H * 0.42; // larger wordmark than v1 (0.36) for the nav
  const s = cap / 90;
  const gap = 170;
  const w = Math.ceil(MONO_W + gap + WORD_W * s + 2 * PAD * s);
  const h = MONO_H;
  return { w, h, monoD: mono(1, 0, 0), wordD: word(s, MONO_W + gap + PAD * s, (MONO_H - 90 * s) / 2), wordStroke: STROKE * s };
}
function monogram() {
  return { w: MONO_W, h: MONO_H, monoD: mono(1, 0, 0) };
}
function wordmark() {
  const w = Math.ceil(WORD_W + 2 * PAD);
  const h = Math.ceil(90 + 2 * PAD);
  return { w, h, wordD: word(1, PAD, PAD), wordStroke: STROKE };
}

const layouts = { 'lockup-vertical': vertical(), 'lockup-horizontal': horizontal(), monogram: monogram(), wordmark: wordmark() };
for (const [name, l] of Object.entries(layouts)) {
  writeFileSync(join(out, `benjaire-${name}.svg`), svg({ id: `bj-${name}`, ...l, paint: 'bronze' }));
  writeFileSync(join(out, `benjaire-${name}-cream.svg`), svg({ id: `bj-${name}-c`, ...l, paint: '#fdfaf5' }));
}

// Favicon: bronze monogram on a cream rounded square.
const f = 0.9 * (800 * 0.62) / MONO_H; // monogram ≈ 56% of the tile height
const fx = (800 - MONO_W * f) / 2;
const fy = (800 - MONO_H * f) / 2;
writeFileSync(
  join(out, '..', 'favicon.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800"><title>Benjaire</title><defs>${gradient('fv', 800, 800)}</defs><rect width="800" height="800" rx="160" fill="#fdfaf5"/><path fill="url(#fv)" d="${mono(f, fx, fy)}"/></svg>\n`,
);
console.log(`Logos written to ${out}: ${Object.keys(layouts).length * 2} files + favicon.`);
