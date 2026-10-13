# ADR-0002: Hosting platform

- **Status:** Proposed (infrastructure facts confirmed 2026-10-13; awaiting owner approval)
- **Date:** 2026-10-13

## Context
The site is currently on GitHub Pages (per the repo `CNAME` and README). The owner prefers Cloudflare but has **not** approved migration. Requirements: real HTTP security headers, one small serverless function for the contact form, preview deploys, redirects, low cost and low maintenance, and **no disruption to email**.

**Confirmed facts:** DNS for `benjaire.com` is already on Cloudflare, and `contact@benjaire.com` uses Cloudflare Email Routing. Cloudflare Pages needs the apex domain's DNS on Cloudflare, which is **already the case**. Moving hosting to Pages needs **no nameserver change**: it replaces only the website records for `benjaire.com`/`www` and leaves MX and Email Routing alone.

## Options
| Option | Headers | Form function | DNS change needed | Cost (MVP) | Notes |
|---|---|---|---|---|---|
| A. Stay on GitHub Pages | No (meta CSP only) | No; needs a third-party form backend | None | $0 | Lowest risk, weakest security posture |
| B. GitHub Pages behind the Cloudflare proxy | Yes (Cloudflare rules) | Via a separate Cloudflare Worker | Nameservers to Cloudflare | $0 | Two platforms to manage |
| **C. Cloudflare Pages** | Yes (`_headers`) | Yes (Pages Functions) | Nameservers to Cloudflare (for the apex) | $0 at expected traffic | Hosting, CDN, DNS, Turnstile, and analytics in one place |
| D. Netlify or Vercel | Yes | Yes | No; A/CNAME records at the current DNS provider | $0 at expected traffic | Avoids a nameserver move; adds a separate vendor for bot protection |

## Decision (proposed)
**Option C (Cloudflare Pages).** With DNS, email, and bot protection already at Cloudflare, it adds no new vendor and needs no nameserver change. It's the best fit for cost, security, and maintenance. Option D no longer has an advantage, and Option B would split hosting across two platforms. **Option A** stays the fallback if migration isn't approved (PRD §8.3).

## Consequences
- C: there's one vendor for hosting, DNS, the CDN, email routing, and bot protection, with preview deploys per pull request. The cutover follows ADR-0003 and needs owner approval at the M1 and M6 gates.
- The concentration risk (a Cloudflare account compromise affects site, DNS, and email at once) is mitigated by hardware-key or app-based 2FA on the Cloudflare account and a stored zone export.
- GitHub Pages stays deployable until the cutover is verified, as the rollback target.
- Because the build output is static (ADR-0001), switching between C and D later is cheap.
