// Generates the Benjaire logo SVGs (docs/design-system.md §8).
// Usage: node scripts/build-logos.mjs <outDir>
//
// Rendering rules (crisp in every browser, including Safari/iOS):
//  - no SVG filters and no masks in web assets
//  - all geometry is baked into one coordinate system, flat single color
//  - "-cream" files are the light reverse for dark bands (pearl since v3;
//    the file name is kept so existing links keep working)
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const out = process.argv[2] ?? 'public/brand';
mkdirSync(out, { recursive: true });

// Monogram "B", identity v4 (2026-10-14): rebuilt on an 80-unit grid,
// Apple-style. One stroke weight (S) everywhere, corners are true circular
// arcs from one radius family (outer R, inner R - S, so every curve is
// concentric), the waist is the exact intersection of the two bowl circles,
// and both stem cuts are parallel 45 degree shears. Box: 576 x 608.
function buildMonogram({ S = 80, R = 152, gap = 40 } = {}) {
  const r = R - S;
  const bar = 236, bot = 608, xu = 512, xl = 576, stem2 = 240, cut = 160;
  const c1 = [xu - R, bar + S - R], c2 = [xl - R, bar + R];
  const dx = c2[0] - c1[0], dy = c2[1] - c1[1], d = Math.hypot(dx, dy), h = Math.sqrt(R * R - (d / 2) ** 2);
  const w = [c1[0] + dx / 2 + (dy / d) * h, c1[1] + dy / 2 - (dx / d) * h].map((v) => Math.round(v * 100) / 100);
  const A = (rad, x, y, sweep) => `A${rad},${rad} 0 0 ${sweep} ${x},${y}`;
  return [
    `M0,0 H${xu - R}`, A(R, xu, R, 1), `V${bar + S - R}`, A(R, w[0], w[1], 1), A(R, xl, bar + R, 1),
    `V${bot - R}`, A(R, xl - R, bot, 1), `H${S} V${cut + S + gap} L${2 * S},${cut + 2 * S + gap} V${bot - S}`,
    `H${xl - R}`, A(r, xl - S, bot - R, 0), `V${bar + R}`, A(r, xl - R, bar + S, 0),
    `H${stem2 + S} V448 H${stem2} V${bar} H${xu - R}`, A(r, xu - S, bar + S - R, 0), `V${R}`, A(r, xu - R, S, 0),
    `H${S} V${cut + S} L0,${cut} Z`,
  ].join(' ');
}
const MONO = buildMonogram();
const MONO_W = 576;
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

/** Scale and translate an absolute-coordinate path (M L H V Q C A Z). */
function transform(d, s, tx, ty) {
  const tokens = d.match(/[MLHVQCAZ]|-?\d*\.?\d+/g);
  const outTokens = [];
  let cmd = '';
  let axis = 0;
  for (const t of tokens) {
    if (/[A-Z]/.test(t)) { cmd = t; axis = 0; outTokens.push(t); continue; }
    const n = Number(t);
    let v;
    if (cmd === 'H') v = n * s + tx;
    else if (cmd === 'V') v = n * s + ty;
    else if (cmd === 'A') { // rx ry rotation large-arc sweep x y
      const k = axis++ % 7;
      v = k < 2 ? n * s : k < 5 ? n : k === 5 ? n * s + tx : n * s + ty;
    } else { v = axis % 2 === 0 ? n * s + tx : n * s + ty; axis++; }
    outTokens.push(String(Math.round(v * 100) / 100));
  }
  return outTokens.join(' ').replace(/ ([MLHVQCAZ])/g, '\n$1').replace(/([MLHVQCAZ]) /g, '$1');
}

const mono = (s, tx, ty) => transform(MONO, s, tx, ty);
const word = (s, tx, ty) => SEQ.map(([c, x]) => transform(G[c], s, tx + x * s, ty)).join(' ');

// Identity v4 (2026-10-14): flat, single-color marks (no gradients), the
// way modern identities like Apple's are specified. Charcoal ink on light
// grounds, pearl reverse on dark bands.
const INK = '#1f2124';
const PEARL = '#f3f3f1';

function svg({ w, h, monoD, wordD, wordStroke, paint }) {
  const parts = [];
  if (monoD) parts.push(`<path fill="${paint}" d="${monoD}"/>`);
  if (wordD) parts.push(`<path fill="none" stroke="${paint}" stroke-width="${wordStroke}" stroke-linejoin="round" d="${wordD}"/>`);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="Benjaire"><title>Benjaire</title>${parts.join('')}</svg>\n`;
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
  writeFileSync(join(out, `benjaire-${name}.svg`), svg({ ...l, paint: INK }));
  writeFileSync(join(out, `benjaire-${name}-cream.svg`), svg({ ...l, paint: PEARL }));
}

// Inline symbol for the nav (apple.com pattern: symbol only, inherits the
// link color through currentColor so hover and reverse states are CSS-only).
const MONO_D = mono(1, 0, 0).replace(/\n/g, ' ');
writeFileSync(
  join(out, '..', '..', 'src', 'components', 'LogoMark.astro'),
  `---
// Generated by scripts/build-logos.mjs. Do not edit by hand.
interface Props { class?: string; size?: number }
const { class: className, size = 22 } = Astro.props;
---
<svg class={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${MONO_W} ${MONO_H}" height={size} width={Math.round((size * ${MONO_W}) / ${MONO_H})} aria-hidden="true" focusable="false"><path fill="currentColor" d="${MONO_D}"/></svg>
`,
);

// Favicons (favicon.ico, favicon-32.png, favicon.svg, apple-touch-icon.png
// and public/icons/) use the primary logo, the v3 graphite gradient on pearl
// from docs/design/logo/v3/svg, and are no longer generated here so this
// script cannot overwrite them with the flat mark.

console.log(`Logos written to ${out}: ${Object.keys(layouts).length * 2} files, LogoMark.astro.`);
