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

## Cloudflare settings (Workers & Pages → Create → Import a repository)

Cloudflare's current flow deploys static sites as a Worker with static assets,
configured by `wrangler.jsonc` in this folder.

| Setting | Value |
|---|---|
| Project name | `benjaire-com` (must match `name` in `wrangler.jsonc`) |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |
| Non-production branch deploy command | default (`npx wrangler versions upload`) |
| Advanced settings → Path (root directory) | `site` |
| Advanced settings → Build variables | `NODE_VERSION` = `22` |
| Preview builds | On |

The deployment gets a `*.workers.dev` address only. No routes or custom
domains are configured, so benjaire.com keeps pointing at GitHub Pages until
the M6 cutover is approved.
