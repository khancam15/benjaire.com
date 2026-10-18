// Builds public/og/benjaire-og.png, the 1200x630 company share card: the
// Pavilion render on the right fading into the pearl ground, the logo lockup,
// and the slogan "Building brands. Powering businesses."
// Run from site/: node scripts/build-og.mjs
// Needs Archivo, Inter and IBM Plex Mono installed as system fonts (the
// @fontsource woff2 files converted to TTF work) because the text is SVG.
import sharp from 'sharp';

const W = 1200, H = 630;
const OUT = 'public/og/benjaire-og.png';

// Pavilion: scaled to the card height, shifted so the arch sits right of centre.
const scale = H / 1536;
const scene = await sharp('src/assets/home/pavilion.jpg')
  .resize({ height: H })
  .extract({ left: Math.round(340 * scale), top: 0, width: W - 400, height: H })
  .toBuffer();

const lockup = await sharp('public/brand/benjaire-lockup-horizontal-graphite.svg', { density: 300 })
  .resize({ height: 34 })
  .png()
  .toBuffer();

const ground = Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${W}" height="${H}" fill="#f3f3f1"/>
</svg>`);

// Pearl veil over the left edge of the render so the headline stays legible.
const veil = Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="v" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0" stop-color="#f3f3f1" stop-opacity="1"/>
      <stop offset="0.5" stop-color="#f3f3f1" stop-opacity="1"/>
      <stop offset="0.66" stop-color="#f3f3f1" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#v)"/>
</svg>`);

const copy = Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <text font-family="Archivo" font-weight="400" font-size="56" letter-spacing="-1.6" fill="#1f2124">
    <tspan x="62" y="446">Building brands.</tspan>
  </text>
  <text font-family="Archivo" font-weight="400" font-size="56" letter-spacing="-1.6" fill="#6f747b">
    <tspan x="62" y="510">Powering businesses.</tspan>
  </text>
  <text x="64" y="572" font-family="IBM Plex Mono" font-size="15" letter-spacing="2" fill="#5f646b">BENJAIRE.COM · NEW YORK</text>
</svg>`);

await sharp(ground)
  .composite([
    { input: scene, left: 400, top: 0 },
    { input: veil, left: 0, top: 0 },
    { input: lockup, left: 64, top: 64 },
    { input: copy, left: 0, top: 0 },
  ])
  .png({ compressionLevel: 9 })
  .toFile(OUT);
console.log(`wrote ${OUT}`);
