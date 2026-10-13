# ADR-0004: Contact-form processing

- **Status:** Proposed
- **Date:** 2026-10-13

## Context
The current form sends from the browser through EmailJS. It has no server-side validation, no bot protection, and no categories. The new requirements: five inquiry categories, a single inbox (`contact@benjaire.com`) with the ability to add per-category recipients later without rebuilding, spam prevention, validation, secure server-side processing, and no database.

## Options
| Option | Server-side validation | Bot protection | Secrets hidden | Dependency on hosting |
|---|---|---|---|---|
| A. Keep EmailJS (+ CAPTCHA) | No | Partial | Public key only; templates live in the vendor | None |
| B. Hosted form backend (for example Formspree) | Yes (vendor) | Yes | Yes | None; works on GitHub Pages |
| **C. Own serverless function + Turnstile + transactional email API** | Yes (ours) | Yes (Turnstile, honeypot, rate limit) | Yes (environment variables) | Needs a host with functions (ADR-0002 C or D) |

## Decision (proposed)
**Option C:** one serverless function (about 150 lines) that:
1. Accepts a POST from the form only, and checks the Origin header.
2. Verifies the Turnstile token on the server.
3. Rejects submissions that fill the honeypot field and applies a per-IP rate limit.
4. Validates and normalizes the fields (allowed category values, lengths, email format), stripping any HTML and control characters.
5. Looks up the recipient in a **category→recipient config** (all five categories map to `contact@benjaire.com` at launch).
6. Sends the message with the subject `[Category] …` and Reply-To set to the sender. Two delivery options, chosen at M5:
   - **(a) Cloudflare's built-in `send_email` binding**, which sends to a verified Email Routing destination. No new vendor and no new DNS records. The destination is set as an environment variable. **[VERIFY at M5]** current platform limits.
   - **(b) A transactional email API** (Resend or Postmark) sending to `contact@benjaire.com`. Needs sending-domain DNS records (approval required).
7. Returns structured success or error JSON. The page shows accessible status messages and falls back to a plain `mailto:` link.

There is **no database**: submissions aren't stored, the inbox is the system of record, and data retention follows the mailbox. Fallback if no functions host is approved: **Option B**.

## Consequences
- EmailJS is removed, along with its CDN script and CSP exceptions.
- Option (a) needs no new vendor. Option (b) needs an email-API account and sending-domain DNS records, which need owner approval (ADR-0003).
- **The repository is public**, so the private destination inbox address is stored **only** in host environment variables and never in code, config files, or commit messages.
- Adding per-category inboxes later is a config-only change.
