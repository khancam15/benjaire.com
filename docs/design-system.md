# Benjaire Design System (v0.2, proposal)

- **Status:** Approved by owner 2026-10-13 as the current direction (M2). Open to later refinement.
- **Approach:** refine and modernize the existing identity. Don't replace it.
- **Visual proposal:** [`docs/design/proposal/`](design/proposal/), with before/after screenshots at 1440px and 390px widths.

## 1. Principles
1. **Quiet confidence.** Neutral colors, generous space, and hairline structure instead of decoration.
2. **Company first.** The design speaks for Benjaire as an institution. No people, no hype.
3. **Honest content.** Nothing implies brands, partners, or capabilities that don't exist.
4. **Accessible by default.** WCAG 2.2 AA is the floor, not a target.

## 2. What's kept (recognizable identity)
| Element | Kept as is |
|---|---|
| Palette family | Warm neutrals with a single brown accent (now shifted warmer; see §4) |
| Type | Archivo (display, 500/700/800) and Inter (body, 400/500/600) |
| Wordmark | "BENJAIRE" in Archivo 800, uppercase, 0.1em tracking |
| Structure | Full-width hairline rules, flat surfaces, no shadows, no rounded corners |
| Labels | Wide-tracked uppercase eyebrows with a short accent rule |
| Motion | Gentle fade-and-rise reveal, disabled under `prefers-reduced-motion` |

## 3. What's refined (proposed changes)
| Change | Why |
|---|---|
| Fluid **type scale** (tokens below) | Consistent hierarchy from phone to desktop instead of one-off sizes |
| **Spacing scale** and a 1240px max content width | Better rhythm; lines stay readable on wide screens |
| Nav background uses the sand ground (was white) | One continuous surface; feels more premium |
| A **"Partner with us"** outlined button in the nav | Gives business visitors one clear primary action |
| Home gains "What we do", "Focus areas", the Brands section, and a "Work with Benjaire" band | Today the home page is only a hero and an empty heading |
| Beige bands (`--bg-raised`) alternate sections, and a **deep cocoa band** closes key pages | Hierarchy and a premium finish |
| **Warmer palette** (§4): cream, beige, latte, cocoa text, saddle-brown accent, caramel rules | Owner direction 2026-10-13 |
| A faint hairline grid behind the hero | A technology-forward hint that stays within the palette |
| Footer gains Legal links and a tagline | Trust and compliance |
| Form redesign: category chips, inline errors, consent, spam-protection slot | Meets PRD US-3 |
| `text-wrap: balance` on headings | Avoids awkward single-word last lines |
| **Remove `hero-bg.png` (6.3 MB) and `hero-bg.webp`** | Neither file is referenced anywhere |

## 4. Tokens

### Color (v0.2: cream, beige and cocoa palette, per owner direction 2026-10-13)
The palette shifts warmer and browner than the original near-black/umber. It's inspired by contemporary wellness and DTC brands, but every value is Benjaire's own.

| Token | Value | Use | Contrast on `--bg` |
|---|---|---|---|
| `--bg` | `#fdfaf5` | Cream page ground | — |
| `--bg-raised` | `#f4ebe0` | Beige bands, footer | — |
| `--surface` | `#e9dccb` | Latte tiles, logo wells | — |
| `--fg` | `#2a1d14` | Cocoa headings (replaces black) | 15.7:1 |
| `--fg-mid` | `#5a4637` | Body text | 8.5:1 |
| `--fg-low` | `#705b49` | Labels (≥ 4.7:1 on every surface) | 5.9:1 |
| `--fg-faint` | `#a08b77` | Decorative only, **never** text | 3.1:1 |
| `--accent` | `#6b4226` | Saddle brown: buttons, links, numbers | 8.3:1 (white on it: 8.6:1) |
| `--accent-hi` | `#8a5a36` | Hover | 5.6:1 |
| `--caramel` | `#b58357` | Decorative rules only, **never** text | 3.2:1 |
| `--cocoa` | `#2a1d14` | Dark closing band | Cream text on it: 15.7:1 |
| `--danger` | `#8f2716` | Form errors | 8.2:1 |

### Type scale (new)
| Token | Size | Use |
|---|---|---|
| `--t-h1` | `clamp(38px, 5vw + 14px, 76px)` | Page titles |
| `--t-h2` | `clamp(28px, 2.6vw + 16px, 44px)` | Section titles |
| `--t-h3` | `clamp(20px, 1vw + 16px, 26px)` | Card and pillar titles |
| `--t-lg` | `clamp(17px, .5vw + 15px, 20px)` | Lead paragraphs |
| `--t-base` | `clamp(15px, .3vw + 14px, 17px)` | Body |
| `--t-sm` | `13px` | Meta text |
| `--t-xs` | `11px` | Buttons, nav (uppercase, tracked) |

### Spacing (new)
`--s-1` 8 · `--s-2` 16 · `--s-3` 24 · `--s-4` 32 · `--s-5` 48 · `--s-6` 64 · `--s-7` 96 (px). Section padding: `clamp(72px, 10vw, 136px)`. Gutter: `clamp(20px, 5vw, 64px)`. Max width: `1240px`.

### Motion
Easing `cubic-bezier(.16, 1, .3, 1)`. Reveal: opacity plus a 20px rise over 0.9s. Hover transitions: 0.25s. Everything is disabled under reduced motion.

## 5. Components
| Component | Notes |
|---|---|
| **Nav** | Sticky, 72px, wordmark on the left, links plus a "Partner with us" outlined button. A hamburger appears below 900px (Escape closes it, focus returns to the toggle). |
| **Eyebrow** | 10px uppercase, 0.28em tracking, accent color, with a 32px rule before it |
| **Button / primary** | Umber fill, white text, at least 48px tall. Hover: lighter umber. |
| **Button / ghost** | Transparent with a hairline border. Hover: umber border and text. |
| **Pillar** | Number, title, and text, in three columns separated by hairlines |
| **Focus row** | Number, title, and description, with a hairline between rows |
| **Brand card** | Logo well, category and status, name, description, then "Visit site ↗" (live) or "Launching soon" |
| **Empty state** | Bordered panel with a status badge, heading, honest copy, and one call to action |
| **Fact list** | Label and value rows separated by hairlines (About, Contact) |
| **Form field** | Uppercase label, underline input, accent focus line, red error line plus a message tied to the field (`aria-describedby`) |
| **Category chips** | A radio group styled as chips; the selected one is filled umber |
| **Footer** | Four columns: Brand, Company, Contact, Legal |

## 6. Voice & copy rules
- Company voice ("Benjaire", "we"). Never an individual.
- Supplier copy uses only "exploring" and "interested in". No MOQs, no partner names, no capability claims.
- No invented brands. Sample cards exist only in proposal screenshots, clearly labelled.
- **All mockup copy is a draft for owner review.**

## 7. Proposal screenshots
| Page | Before | After |
|---|---|---|
| Home | `before-home-*` | `after-home-*` |
| About | `before-about-*` | `after-about-*` |
| Brands (launch, empty) | — (no page today) | `after-brands-*` |
| Brands (layout sample, never published) | — | `after-brands-sample-*` |
| Contact | `before-contact-*` | `after-contact-*` |
