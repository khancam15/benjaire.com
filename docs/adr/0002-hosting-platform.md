# ADR-0002: Hosting platform

- **Status:** Proposed, pending the infrastructure audit (PRD §9, V-1 to V-4)
- **Date:** 2026-10-13

## Context
The site is currently on GitHub Pages (per the repo `CNAME` and README). The owner prefers Cloudflare but has **not** approved migration. Requirements: real HTTP security headers, one small serverless function for the contact form, preview deploys, redirects, low cost and low maintenance, and **no disruption to email**.

Important constraint: putting the **apex domain** (`benjaire.com`) on Cloudflare Pages requires the domain's DNS to be hosted on Cloudflare (a nameserver change). That makes this a DNS migration, not just a hosting change. See ADR-0003.

## Options
| Option | Headers | Form function | DNS change needed | Cost (MVP) | Notes |
|---|---|---|---|---|---|
| A. Stay on GitHub Pages | No (meta CSP only) | No; needs a third-party form backend | None | $0 | Lowest risk, weakest security posture |
| B. GitHub Pages behind the Cloudflare proxy | Yes (Cloudflare rules) | Via a separate Cloudflare Worker | Nameservers to Cloudflare | $0 | Two platforms to manage |
| **C. Cloudflare Pages** | Yes (`_headers`) | Yes (Pages Functions) | Nameservers to Cloudflare (for the apex) | $0 at expected traffic | Hosting, CDN, DNS, Turnstile, and analytics in one place |
| D. Netlify or Vercel | Yes | Yes | No; A/CNAME records at the current DNS provider | $0 at expected traffic | Avoids a nameserver move; adds a separate vendor for bot protection |

## Decision (proposed)
**Option C (Cloudflare Pages)**, provided the M1 audit confirms the DNS zone and email can be moved safely. **If moving nameservers is judged too risky** (for example, the registrar/email bundle makes it hard), choose **Option D**, which gives the same capabilities without changing nameservers. **Option A** stays the fallback if no migration is approved (PRD §8.3).

## Consequences
- C: there's one vendor for hosting, DNS, the CDN, and bot protection, with preview deploys per pull request. It requires the ADR-0003 migration plan and owner approval at the M1 and M6 gates.
- GitHub Pages stays deployable until the cutover is verified, as the rollback target.
- Because the build output is static (ADR-0001), switching between C and D later is cheap.
