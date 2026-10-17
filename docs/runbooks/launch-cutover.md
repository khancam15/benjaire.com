# Runbook: benjaire.com launch cutover (M6)

> **Status: completed.** benjaire.com and www.benjaire.com are served by the
> Cloudflare Worker `benjaire-com`; Always Use HTTPS and the www to apex 301
> were turned on 2026-10-14. Sections A to E are kept as the record and as the
> rollback procedure. Section F lists what is still open.

Moves benjaire.com from the legacy GitHub Pages site to the new site on the
Cloudflare Worker `benjaire-com`. **Email is not affected:** MX, SPF, DKIM, DMARC
and Email Routing records are not touched. The procedure follows ADR-0003.

- **Who:** owner (Cloudflare dashboard). Claude verifies and handles the repo.
- **Time:** about 15 minutes, with about 1–2 minutes of site downtime between steps C1 and C2.
- **When:** a quiet time of day. Not before every item in section A is ticked.

## A. Go / no-go checklist

| # | Item | Status |
|---|---|---|
| A1 | Copy on Home, About, Brands and Contact approved by the owner | ☐ |
| A2 | Legal: Privacy Policy and Terms reviewed by counsel, **or** the owner decides to launch with the drafts (they stay `noindex` and out of the sitemap until reviewed) | ☐ |
| A3 | Contact form tested end to end on the preview (delivered, category subject, Reply-To works) | ☑ 2026-10-13 |
| A4 | Lighthouse (mobile) ≥ 95 on Home, About, Brands, Contact | ☑ 2026-10-13: 100 / 100 / 100 / 100 |
| A5 | Latest `main` deployed to `benjaire-com` and showing **Ready** | ☐ |
| A6 | DNS zone export saved privately (rollback copy) | ☑ 2026-10-13 |
| A7 | Turnstile widget hostnames include `benjaire.com` and `www.benjaire.com` | ☐ check |
| A8 | Search Console: verification file still answers 200 (served by the Worker) | ☑ in code |

## B. Values to keep for rollback

Current website records (DNS only, not proxied):

| Type | Name | Content |
|---|---|---|
| A | `benjaire.com` | GitHub Pages IP, as in the zone export |
| CNAME | `www` | `<owner>.github.io`, as in the zone export |

## C. Cutover

1. **C1. Remove the two website records.** Cloudflare → benjaire.com → **DNS → Records**. Delete **only** the `A benjaire.com` and the `CNAME www` records. Leave every MX and TXT record and the other subdomain alone.
2. **C2. Attach the domains to the Worker.** **Workers & Pages → benjaire-com → Settings → Domains & Routes → + Add → Custom domain**:
   - `benjaire.com` → Add domain
   - `www.benjaire.com` → Add domain

   Cloudflare creates the DNS records and the HTTPS certificate. Wait until both show **Active** (usually 1–5 minutes).
3. **C3. Redirect www to the root.** **Rules → Redirect Rules → Create rule → template "Redirect from WWW to root"**. Use a 301 that preserves the path and query string, then Deploy.

## D. Verify (in this order)

| # | Check | Expected |
|---|---|---|
| D1 | Open https://benjaire.com | Pavilion design (v0.3), identity v4 logo |
| D2 | https://benjaire.com/about.html | 301 → `/about` |
| D3 | https://www.benjaire.com/contact | 301 → `https://benjaire.com/contact` |
| D4 | http://benjaire.com | Redirects to HTTPS |
| D5 | Send a test from https://benjaire.com/contact | "Thanks…", and the email arrives with the category subject |
| D6 | Email contact@benjaire.com from another account | Arrives in the inbox (Email Routing unaffected) |
| D7 | https://benjaire.com/google16283c1e65acebfc.html | 200, verification text |
| D8 | Response headers on https://benjaire.com | `content-security-policy`, `strict-transport-security`, `x-frame-options: DENY` |

## E. Rollback (any time, about 5 minutes)

1. **benjaire-com → Settings → Domains & Routes:** remove the `benjaire.com` and `www.benjaire.com` custom domains.
2. **DNS → Records:** re-add the two records from section B exactly as they were, both **DNS only**.
3. Disable the www redirect rule.
4. GitHub Pages still serves the legacy site from `main` until the cleanup PR (section F) is merged, so don't merge that PR until D1–D8 pass.

Note: the new site sends HSTS (`max-age` 1 year). After a rollback, browsers that visited keep forcing HTTPS, which GitHub Pages supports, so this is harmless.

## F. After launch (Claude, via PR)

1. Submit `https://benjaire.com/sitemap.xml` in Google Search Console. Optionally add a DNS-verified **Domain** property for sturdier verification.
2. Cleanup PR (done 2026-10-17):
   - Remove the legacy root site: `index.html`, `about.html`, `contact.html`, `assets/`, `CNAME`, the root `sitemap.xml` and `robots.txt`, the root verification file, `_config.yml`.
   - Retire or retarget the legacy `security-audit.yml` workflow (its checks expect meta-tag CSP on root HTML).
   - Update the README to describe the new site only.
3. Owner: GitHub repo → Settings → Pages → unpublish GitHub Pages.
4. Optional: delete or disconnect the old `benjaire` Pages project.
5. About 2–4 weeks after launch: tighten DMARC to `p=quarantine` and SPF to `-all` (PRD V-15).
6. M7: two weeks of monitoring (form delivery, Search Console coverage, Core Web Vitals).
