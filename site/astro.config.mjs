// @ts-check
import { defineConfig } from 'astro/config';

// Static output only (ADR-0001). Pages are emitted as `about.html` etc.;
// Cloudflare Pages serves them at clean URLs (`/about`) and redirects the
// legacy `.html` paths automatically (ADR-0002, PRD §4.1).
export default defineConfig({
  site: 'https://benjaire.com',
  output: 'static',
  trailingSlash: 'never',
  build: { format: 'file', inlineStylesheets: 'never' },
});
