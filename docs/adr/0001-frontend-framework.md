# ADR-0001: Frontend framework

- **Status:** Proposed
- **Date:** 2026-10-13

## Context
The site is hand-written HTML. The nav, footer, meta tags, and CSP are duplicated in every page. The site now needs a Brands page driven by content that can grow without template changes, more pages (Brands, Privacy, Terms, 404), and stricter security (no inline scripts). Priorities are credibility, design quality, and performance, with minimal complexity.

## Options
| Option | Pros | Cons |
|---|---|---|
| A. Keep hand-written HTML | No migration, no build step | Duplication grows with every page; no typed brand data; hard to enforce consistency |
| B. Eleventy (11ty) | Simple, fast, static | Weaker built-in content validation; fewer components |
| **C. Astro (static output)** | Ships zero JS by default; components and layouts; **Content Collections with schema validation** (the build fails on bad brand data); image optimization; deploys to any static host | Needs Node and a build step |
| D. Next.js | Very flexible for future apps | Heavier runtime and JS; server features we don't need; more lock-in to its hosting model |

## Decision (proposed)
**Astro in fully static mode**, TypeScript, Content Collections for brands, plain CSS with design tokens carried over from `assets/site.css`. No UI framework (React and similar) unless a future need justifies it.

## Consequences
- One shared layout; adding a page or brand means adding a file.
- The output is plain static files, portable to any host. Choosing a host isn't coupled to this decision.
- Contributors need Node LTS. CI must run `astro build` and `astro check`.
- Future apps (brand sites, commerce) are built as separate projects, not inside this one.
