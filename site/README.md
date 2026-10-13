# benjaire.com: new site (Astro)

The rebuilt Benjaire website (PRD milestones M3 onward). It lives in this
folder so the current site at the repository root keeps serving benjaire.com
from GitHub Pages until the approved cutover (M6, ADR-0002).

## Run locally

Requires Node 22.12 or newer.

```bash
cd site
npm ci
npm run dev        # http://localhost:4321
npm run build      # static output in site/dist
npm run preview    # serve the build
```

## Checks (also run in CI: `.github/workflows/site-ci.yml`)

```bash
npx astro check        # types
npm run build
npm run test:links     # internal links and assets
npm run test:a11y      # axe, WCAG 2.2 AA, desktop and mobile widths
```

## Where things live

| Path | What |
|---|---|
| `src/site.ts` | Company facts, nav, inquiry categories, supplier areas |
| `src/styles/global.css` | Design tokens and styles (see `docs/design-system.md`) |
| `src/layouts/Base.astro` | Page shell: meta tags, nav, footer |
| `src/pages/` | One file per page |
| `src/content/brands/` | Brand entries (one JSON file per **publicly approved** brand) |
| `src/scripts/contact.ts` | Contact form behaviour (sending switches on in M5) |
| `public/brand/` | Logo files (bronze, textured, cream) |

## Adding a brand

See `src/content/brands/README.md`. This repository is public: never commit
unreleased brands.

## Cloudflare Pages settings (set by the owner)

| Setting | Value |
|---|---|
| Root directory | `site` |
| Build command | `npm run build` |
| Output directory | `dist` |
| Environment variable | `NODE_VERSION` = `22` |

Connecting the project creates preview deployments only. benjaire.com keeps
pointing at GitHub Pages until the M6 cutover is approved.
