// Fails if any internal link or asset in the built site points nowhere.
// Usage: node scripts/check-links.mjs dist
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.argv[2] ?? 'dist';
const pages = [];
const walk = (dir) => {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (p.endsWith('.html')) pages.push(p);
  }
};
walk(root);

const resolve = (url) => {
  const path = decodeURIComponent(url.split(/[?#]/)[0]);
  if (path === '/' || path === '') return join(root, 'index.html');
  const candidates = [join(root, path), join(root, `${path}.html`), join(root, path, 'index.html')];
  return candidates.find((c) => existsSync(c) && statSync(c).isFile());
};

let broken = 0;
for (const page of pages) {
  const html = readFileSync(page, 'utf8');
  for (const [, url] of html.matchAll(/(?:href|src)="(\/[^"]*)"/g)) {
    // /api/* is answered by the Worker, not a built file (tested in worker/).
    if (url.startsWith('//') || url.startsWith('/api/')) continue;
    if (!resolve(url)) {
      broken++;
      console.error(`✗ ${relative(root, page)} → ${url}`);
    }
  }
}
console.log(`${pages.length} pages checked, ${broken} broken internal link(s).`);
process.exit(broken ? 1 : 0);
