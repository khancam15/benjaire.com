# Benjaire.com — Product Requirements Document (Draft v0.1)

| | |
|---|---|
| **Status** | Draft — awaiting stakeholder review. No development starts until approved. |
| **Date** | 2026-10-13 |
| **Product** | benjaire.com, Benjaire's corporate website |
| **Tagline** | Brands for the Modern Era |

Items marked **[ASSUMPTION]** are decisions I made to move the draft forward. Items marked **[OPEN]** need your answer before they can be finalized. Section 13 collects every open question in one place.

---

## 1. Current State (Baseline)

I reviewed the existing repository before writing this plan. The site is not starting from zero:

| Area | What exists today |
|---|---|
| Pages | `index.html` (hero plus an "Our Brands" section that is currently **empty**), `about.html`, `contact.html` |
| Stack | Hand-written HTML/CSS, one shared stylesheet and script, Google Fonts |
| Hosting | GitHub Pages from `main`, custom domain via `CNAME` |
| Contact | Client-side form sending through **EmailJS** (third-party), plus `contact@benjaire.com` |
| SEO | Titles, meta descriptions, Open Graph, JSON-LD `Organization`, `sitemap.xml`, `robots.txt`, Google Search Console verification |
| Security | Content Security Policy in a `<meta>` tag on every page, SRI on the EmailJS script, a security audit script plus a GitHub Action |
| Policies in the README | (a) Benjaire stays **anonymous**: no founder names, bios, or photos. (b) The site is **intentionally three pages**. (c) Brands live on **their own domains**, not on benjaire.com. |

**Gaps against the stated goal:**
1. The brand portfolio, the main proof of what Benjaire does, has no content.
2. There is nothing for suppliers, manufacturers, or partners beyond a generic contact form.
3. There is no privacy policy or terms of use, even though the form collects personal data.
4. GitHub Pages cannot send HTTP security headers. A CSP in a `<meta>` tag **ignores `frame-ancestors`**, so the site's anti-clickjacking rule is not enforced today.
5. The form has no server-side validation, no spam protection, and no routing by inquiry type. It relies on a client-side vendor.
6. Adding brands or pages means hand-copying HTML, including nav, footer, CSP, and meta tags, across files. This does not scale.

> **Key tension to resolve:** the project brief ("primary digital headquarters", five audiences, room to expand) goes beyond the current README policy ("intentionally three pages"). This PRD proposes a modest expansion that keeps the anonymity rule and the separate-brand-domains rule. **[OPEN]** Please confirm that expanding past three pages is intended.

---

## 2. Problem Statement

Benjaire needs one credible, central online home that explains who the company is and what it does, shows its brands, and sends each kind of visitor (partner, consumer, supplier, collaborator, researcher) to the right next step. It also needs a foundation that can absorb new brands and future digital services without a rebuild.

## 3. Objectives & Success Metrics

| # | Objective | Metric (target, first 6 months after launch) **[ASSUMPTION — please adjust]** |
|---|---|---|
| O1 | Establish credibility | Lighthouse ≥ 95 in all four categories. Zero broken links. Legal pages live. |
| O2 | Showcase the brand portfolio | ≥ 30% of homepage sessions reach the Brands section or page. Outbound brand-click rate tracked. |
| O3 | Generate qualified inquiries | Inquiries tagged by type. Spam below 5% of submissions. Reply SLA of 24h kept. |
| O4 | Be found | Ranks #1 for "Benjaire". Rich results valid in Search Console. |
| O5 | Scale cheaply | A new brand can be added in < 30 minutes by editing one content file, with no layout changes. |

## 4. Audiences & Needs

| Audience | Primary need | Key question | Primary action |
|---|---|---|---|
| Business partners | Judge legitimacy and fit | "Is this a real, capable operator?" | Partnership inquiry |
| Consumers | Find a brand's official site and support | "Is this brand legit, and where do I buy or get help?" | Click through to brand site or brand support |
| Suppliers & manufacturers | Know what Benjaire sources and how to engage | "Do they work with suppliers like me?" | Supplier inquiry |
| Collaborators (creators, agencies, designers) | Know the collaboration model | "How do I pitch them?" | Collaboration inquiry |
| General researchers (press, investors, job seekers) | Facts fast | "What is Benjaire, where is it, how do I reach them?" | Read About; press/general inquiry |

## 5. MVP Definition

**MVP principle:** credibility and routing, not content volume. A focused, fast, static site that answers "what is Benjaire, what does it own, and how do I engage" for every audience.

### In scope (MVP)

| Page / feature | Purpose |
|---|---|
| **Home** | Positioning, a short business-model summary, featured brands, audience routing ("Partner with us / Suppliers / Contact") |
| **Brands** (index page) | A card per brand: logo, one-line description, category, status (Live / Coming soon), outbound link to the brand's own domain |
| **About** | Mission, what Benjaire does (build → operate → grow brands), focus areas (consumer tech, digital, lifestyle), principles. No individuals named, per the anonymity policy. |
| **Partners & Suppliers** (one page, two sections) | Who Benjaire works with, what it looks for (categories, quality, compliance), the engagement process, and a call to action that opens the inquiry form with the right type pre-selected |
| **Contact** | Upgraded inquiry form with an **inquiry type** (Partnership, Supplier/Manufacturing, Collaboration, Press, Brand/consumer support, Other), server-side validation, spam protection, routing by type, and confirmation states |
| **Legal** | Privacy Policy, Terms of Use, Accessibility Statement |
| **System pages** | Custom 404, sitemap, robots, social share images |
| **Analytics** | Privacy-friendly, cookieless page and event analytics (no consent banner needed) |

### Out of scope for the MVP (later phases)
News/press room, careers, brand detail pages hosted on benjaire.com, e-commerce, a customer login, a CMS UI for non-technical editors, a newsletter, multiple languages.

> **[ASSUMPTION]** Consumer support for a specific brand is handled on that brand's own site. The Benjaire Brands page links there, and the "Brand/consumer support" inquiry type is a fallback.

## 6. User Stories & Acceptance Criteria

**US-1 — Understand Benjaire (all visitors)**
*As a visitor, I want to understand what Benjaire is within 10 seconds so I can decide whether to engage.*
- AC1: The home hero shows the company name, tagline, a one-sentence description, and a primary call to action above the fold at 375px and 1440px widths.
- AC2: The home page has a "What we do" section covering build, operate, and grow, plus the three focus areas.
- AC3: The Largest Contentful Paint is ≤ 2.5s on a mid-range mobile phone over 4G.

**US-2 — Browse the brand portfolio (consumer, partner)**
*As a visitor, I want to see the brands Benjaire owns so I can confirm legitimacy and visit them.*
- AC1: The Brands page lists every brand from one structured content source, with name, logo, category, description, status, and URL.
- AC2: External links open the brand site with `rel="noopener noreferrer"` and are marked as external for screen readers.
- AC3: "Coming soon" brands show no broken link.
- AC4: The home page shows up to N featured brands taken from the same source.
- AC5: Each brand click is tracked as an analytics event, without personal data.

**US-3 — Submit a partnership inquiry (partner)**
*As a potential partner, I want to send a structured inquiry so the right person responds.*
- AC1: The form fields are name, email, company, inquiry type (required), message (required), and consent to the privacy policy.
- AC2: Validation runs both client-side and server-side. Errors are announced to screen readers and tied to their fields.
- AC3: Spam protection (Cloudflare Turnstile or equivalent, plus a honeypot field and a rate limit) rejects bots without a visible CAPTCHA for most humans.
- AC4: On success, the user sees a confirmation and an auto-acknowledgement email. The internal email is tagged with the inquiry type.
- AC5: On failure, the user sees an error and the fallback `contact@benjaire.com`. No input is lost.
- AC6: No API secret is exposed in client code.

**US-4 — Engage as a supplier (supplier/manufacturer)**
*As a manufacturer, I want to know what Benjaire sources and how to engage.*
- AC1: The Partners & Suppliers page lists product categories of interest, baseline expectations (quality, compliance, MOQ range **[OPEN]**), and the engagement process.
- AC2: The call to action opens Contact with "Supplier/Manufacturing" pre-selected, through a URL parameter.
- AC3: Optional supplier fields (company website, country, product category) appear only for that inquiry type.

**US-5 — Find facts quickly (press/researcher)**
- AC1: The About page states the location (New York, NY), founding year (2022), focus areas, and contact details.
- AC2: `Organization` structured data validates in Google's Rich Results Test.

**US-6 — Trust and compliance (all)**
- AC1: The Privacy Policy, Terms, and Accessibility Statement are linked from every footer.
- AC2: No cookies are set by default. The privacy policy names every processor (host, form/email provider, analytics).

**US-7 — Add a brand (internal operator)**
*As a Benjaire operator, I want to add a brand by editing one file so the site scales without developer work on layouts.*
- AC1: Adding one entry (a Markdown/JSON file plus a logo) creates the brand card, the sitemap entry if applicable, and the home feature if flagged.
- AC2: A build check fails if required brand fields are missing.

**US-8 — Accessible to everyone**
- AC1: Every page meets WCAG 2.2 AA. Everything works by keyboard alone, with visible focus states and a skip link, and motion respects `prefers-reduced-motion`.

## 7. Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-1 | Shared layout (header, nav, footer) defined once and reused on all pages | Must |
| FR-2 | Responsive navigation with an accessible mobile menu (Escape closes it, focus is trapped while open, works without JS) | Must |
| FR-3 | Brand data in structured content files, validated by a schema at build time | Must |
| FR-4 | Brands index and home featured-brands section rendered from the brand data | Must |
| FR-5 | Contact form with inquiry types, conditional fields, prefill from a URL parameter, and success/error states | Must |
| FR-6 | Server-side form handler: validation, spam check, rate limit, email delivery to the inbox for that type, auto-acknowledgement | Must |
| FR-7 | Legal pages and a 404 page | Must |
| FR-8 | Generated sitemap.xml, robots.txt, canonical URLs, Open Graph and Twitter images per page | Must |
| FR-9 | Clean URLs (`/about`) with permanent (301) redirects from the legacy `/about.html` and `/contact.html` | Must |
| FR-10 | Cookieless analytics with events for brand clicks, form submits, and calls to action | Should |
| FR-11 | Per-brand detail pages on benjaire.com (short profile plus outbound link) | Could (Phase 2) |
| FR-12 | Newsroom/press kit (logo download, boilerplate) | Could (Phase 2) |
| FR-13 | Careers page | Won't (MVP) |

## 8. Non-Functional Requirements

### 8.1 Performance
- Core Web Vitals at the 75th percentile on mobile: LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1.
- Page weight ≤ 500 KB on first load, excluding brand logos. JS ≤ 50 KB gzipped, used only for progressive enhancement.
- AVIF/WebP images with explicit width and height, responsive `srcset`, lazy loading below the fold. Fonts self-hosted and subset, with `font-display: swap`. The current 6.3 MB `hero-bg.png` should be retired in favor of the 137 KB WebP plus an AVIF variant.
- Static pages served from a CDN with immutable caching for hashed assets.

### 8.2 Security
- **Real HTTP response headers**, not `<meta>`: a strict CSP (nonce- or hash-based, no `'unsafe-inline'`), `frame-ancestors 'none'`, HSTS with preload, `X-Content-Type-Options`, `Referrer-Policy: strict-origin-when-cross-origin`, and `Permissions-Policy`.
- Form: server-side validation and sanitization, bot protection, per-IP rate limiting, maximum lengths, and no HTML in emails. Secrets live only in the host's environment variables.
- Third parties kept to a minimum: no tag managers, and every external origin listed in the CSP.
- Email authentication on benjaire.com (SPF, DKIM, DMARC at `p=quarantine` or stricter) so form mail and replies are delivered and the domain cannot easily be spoofed. **[OPEN]** What email provider do you use?
- Dependabot or Renovate, the existing security audit in CI, and a `security.txt`.
- Branch protection on `main`, required CI checks, and squash merges (already the convention).

### 8.3 Accessibility
- WCAG 2.2 AA: contrast ≥ 4.5:1, semantic landmarks, one H1 per page, form labels and error associations, focus states, a skip link, reduced motion, and no information conveyed by color alone.
- Automated axe/Lighthouse checks in CI, plus a manual keyboard and screen-reader pass (VoiceOver and NVDA) before launch.

### 8.4 SEO
- Unique titles and meta descriptions, canonical tags, and a generated sitemap.
- JSON-LD: `Organization` (with `sameAs` for official social accounts **[OPEN]**), `WebSite`, `BreadcrumbList`, and an `ItemList` of brands on the Brands page. Each brand as an `Organization`/`Brand` with `parentOrganization`.
- Preserve existing rankings: 301 redirects for the legacy `.html` URLs, and resubmit the sitemap in Search Console.
- Open Graph images per page (1200×630).

### 8.5 Privacy & Compliance
- Privacy policy covering form data, processors, retention (for example, 24 months for inquiries **[ASSUMPTION]**), and CCPA/CPRA and NY SHIELD Act considerations. Cookieless analytics avoid the need for a consent banner in the US. If you expect meaningful EU/UK traffic, GDPR notices apply. **[OPEN]**
- Legal copy must be reviewed by counsel. I can draft templates but cannot provide legal advice.

### 8.6 Reliability & Maintainability
- Static output, so there is no server to keep up. Uptime is the host's SLA (≥ 99.9%).
- Every pull request gets a preview deployment for review before merge.
- A README runbook covers adding a brand, editing copy, and deploying/rolling back.

## 9. Recommended Technology Stack

I compared three options:

| Option | Pros | Cons | Verdict |
|---|---|---|---|
| A. Keep hand-written HTML on GitHub Pages | Zero migration, simplest | No shared layouts, no brand data model, no HTTP headers, no server-side form | Doesn't meet the scale and security goals |
| **B. Astro static site + Cloudflare Pages (with Pages Functions)** | Ships zero JS by default (fast), shared layouts and components, typed content collections for brands, real headers through `_headers`, serverless form handler and Turnstile on the same platform, free tier, PR previews | One-time migration and a Node build step | **Recommended** |
| C. Next.js on Vercel + headless CMS | Very flexible, good for future apps | More complexity and JS than a corporate site needs, more vendors, CMS cost | Overkill for the MVP; a possible later step if Benjaire builds a logged-in digital product |

**Recommended stack (Option B) [ASSUMPTION — needs your sign-off, since it changes hosting]:**
- **Framework:** Astro (static output), TypeScript, Content Collections with Zod schemas for brands.
- **Styling:** Plain CSS with design tokens (custom properties), carried over from the current `site.css` so the look stays the same. No CSS framework is needed at this size.
- **Hosting/CDN:** Cloudflare Pages, which supports the custom domain, automatic HTTPS, `_headers`/`_redirects`, and preview deployments.
- **Forms:** A Cloudflare Pages Function, with Turnstile for bot protection and a transactional email API (Resend or Postmark) to deliver mail. This replaces EmailJS.
- **Analytics:** Cloudflare Web Analytics (free, cookieless). Plausible is an alternative if you want custom event dashboards.
- **DNS:** Moving DNS to Cloudflare is simplest. If you prefer to keep your current registrar, CNAME setup also works.
- **CI:** GitHub Actions running build, type-check, link check, axe/Lighthouse CI, and the existing security audit.
- **Content editing:** Markdown/JSON in Git for the MVP. A Git-based CMS (Decap or TinaCMS) can be added later for non-technical editors without changing the architecture.

*If you prefer to stay on GitHub Pages*, Astro still works there. The trade-offs: security headers stay meta-only (no `frame-ancestors`, no HSTS control), and the form needs a third-party endpoint (Formspree, or keep EmailJS plus Turnstile).

## 10. Information Architecture (MVP)

```
/                     Home
/brands               Brand portfolio
/about                About Benjaire
/partners             Partners & Suppliers
/contact              Contact (accepts ?type=partnership|supplier|collaboration|press|support)
/legal/privacy        Privacy Policy
/legal/terms          Terms of Use
/accessibility        Accessibility Statement
/404                  Not found
(/about.html, /contact.html → 301 redirects)
```
Primary nav: Brands · About · Partners · Contact. The footer adds the legal links, email, and location.

## 11. Phased Roadmap

| Phase | Scope | Exit criteria | Rough effort* |
|---|---|---|---|
| **0. Discovery & approval** | Answer the open questions, approve the PRD, gather brand assets and copy | PRD signed off, brand list and assets received | — |
| **1. Foundation** | Astro scaffold, migrate the current 3 pages pixel-for-pixel, design tokens, shared layout, CI, Cloudflare Pages preview | Preview matches the live site; Lighthouse ≥ 95 | 2–3 days |
| **2. MVP content & features** | Brands collection and page, Partners & Suppliers page, home sections, legal pages, 404, SEO/structured data | Every user story's acceptance criteria pass on preview | 3–5 days |
| **3. Forms & security** | Pages Function form handler, Turnstile, email delivery, `_headers` with strict CSP, SPF/DKIM/DMARC check | Spam and failure tests pass; securityheaders.com grade A | 2–3 days |
| **4. QA & launch** | Accessibility audit, cross-browser/device testing, redirects, DNS cutover, Search Console resubmission, analytics checks | Launch checklist complete; rollback plan tested | 1–2 days |
| **5. Post-launch (Phase 2)** | Brand detail pages, press kit/newsroom, Git-based CMS, newsletter, careers | Prioritized from analytics and inquiry data | Ongoing |

*The effort estimates assume content and assets are ready on time. Copy and brand assets are usually the critical path, not engineering.

## 12. Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|
| Brand content and assets not ready (the Brands section is empty today) | MVP looks thin and hurts credibility | High | Launch with "Coming soon" cards if needed; collect content in Phase 0 |
| Losing search ranking during the URL migration | Traffic dip | Medium | 301 redirects, keep titles and meta, resubmit the sitemap, monitor Search Console |
| DNS/hosting cutover downtime or email disruption | Site or email outage | Low–Med | Lower TTLs beforehand, leave MX records untouched, cut over in a low-traffic window, keep GitHub Pages as a rollback |
| Form spam or abuse | Inbox flood, cost | High without controls | Turnstile, honeypot, rate limit, length caps |
| Form email lands in spam | Missed leads | Medium | SPF/DKIM/DMARC, a verified sending domain, auto-ack monitoring |
| Strict CSP breaks inline scripts or styles | Broken UI | Medium | Move inline code to external files; test CSP in report-only mode on preview first |
| Anonymity policy versus credibility (no people shown) | Partners may want to know who's behind it | Medium | Build credibility through brands, process, an entity statement, and fast replies. Revisit the policy if partner feedback requires it. |
| Scope creep toward e-commerce or apps | Delays the MVP | Medium | Keep commerce on brand domains; any new digital service gets its own PRD |
| Vendor lock-in (Cloudflare) | Migration cost later | Low | Astro output is portable static files; the form function is about 100 lines and easy to port |
| Legal pages not reviewed | Compliance exposure | Medium | Counsel review before launch |

## 13. Open Questions (please answer to finalize)

**Business & content**
1. **Brands:** How many brands exist today, and which can be shown publicly? For each one: name, category, one-liner, URL, status, and logo files.
2. Should the Brands page link **only** to external brand domains (current policy), or should benjaire.com also host short brand profile pages?
3. Is the "three-page site" policy being retired in favor of this expanded plan?
4. Does the anonymity rule still hold (no founders or team)? Is a generic "Leadership" or "Team" section ever acceptable?
5. **Suppliers:** Which product categories, regions, certifications, and MOQ ranges should the supplier section mention, if any?
6. Are partnerships focused on retail/distribution, licensing, co-branding, investment, acquisitions, or something else?
7. What should Benjaire be called publicly? Should "holding company", "brand company", or "brand studio" be used consistently?

**Functionality**
8. Should inquiries go to one inbox (`contact@`) or to separate addresses by type (for example `partners@` and `suppliers@`)?
9. Do you need a newsletter or email signup in the MVP?
10. Do you need careers or press pages at launch?
11. Who will edit content after launch: you through Git, or a non-technical teammate who needs a CMS?

**Design**
12. Should the current visual identity (colors, type, hero) be **kept and refined**, or is a **redesign** in scope? Do you have brand guidelines, a logo file, or Figma designs?
13. Can you name 2–3 reference sites whose tone you like?
14. Should the site support both light and dark mode?

**Hosting & operations**
15. Do you approve moving hosting from GitHub Pages to **Cloudflare Pages** (recommended), or should we stay on GitHub Pages?
16. Where is the domain registered, and where is DNS managed? What provides `contact@benjaire.com` (Google Workspace or another provider)?
17. Is replacing EmailJS with a server-side form handler OK? Do you have a preferred email delivery provider?
18. Which analytics do you prefer: Cloudflare Web Analytics, Plausible, or GA4? Note that GA4 requires cookie consent handling.
19. Is there any budget limit for monthly services? The recommended stack can run at $0–20/month.

**Future scalability**
20. Over 12–24 months, what "digital services" might live on benjaire.com: a partner portal, investor relations, brand dashboards, or apps? This decides whether Option B stays sufficient or whether we plan for Option C.
21. Do you need international or multi-language support?

## 14. Approval

| Role | Name | Decision | Date |
|---|---|---|---|
| Owner | | ☐ Approved ☐ Changes requested | |

*Development begins only after this section is signed off.*
