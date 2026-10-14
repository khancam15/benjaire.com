// Runs axe-core (WCAG 2.2 A/AA rules) against every built page.
// Usage: node scripts/a11y.mjs dist   (serves dist on a local port)
import { createServer } from 'node:http';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, extname } from 'node:path';
import { chromium } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';

const root = process.argv[2] ?? 'dist';
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff' };
const server = createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/index.html';
  let file = join(root, p);
  if (!existsSync(file) && existsSync(`${file}.html`)) file = `${file}.html`;
  if (!existsSync(file)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream' });
  res.end(readFileSync(file));
}).listen(0);
const base = `http://localhost:${server.address().port}`;

const pages = readdirSync(root).filter((f) => f.endsWith('.html') && !f.startsWith('google'));
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
let violations = 0;
for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
  const context = await browser.newContext({ viewport });
  // Test our own markup only: third-party widgets (Turnstile) keep network
  // connections open, which would make runs slow and non-deterministic.
  await context.route((url) => url.hostname !== 'localhost', (route) => route.abort());
  const page = await context.newPage();
  for (const f of pages) {
    await page.goto(`${base}/${f}`, { waitUntil: 'load' });
    // Let entrance animations (the homepage hero fades in) settle before measuring contrast.
    await page.waitForTimeout(1600);
    const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
    const serious = result.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    for (const v of serious) console.error(`✗ [${viewport.width}px] ${f}: ${v.id} (${v.nodes.length}) ${v.help}`);
    violations += serious.length;
  }
  await context.close();
}
await browser.close();
server.close();
console.log(`${pages.length} pages × 2 widths checked, ${violations} serious/critical violation(s).`);
process.exit(violations ? 1 : 0);
