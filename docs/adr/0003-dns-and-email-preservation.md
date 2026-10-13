# ADR-0003: DNS and email preservation

- **Status:** Accepted (owner approval 2026-10-13)
- **Date:** 2026-10-13

## Context
`contact@benjaire.com` is the company's only published inbox and must keep working. **Confirmed:** DNS is on Cloudflare and the address is a Cloudflare Email Routing forwarder to a private inbox. The recommended hosting move (ADR-0002) changes **only the website records** (`benjaire.com`, `www`). The MX, SPF, and Email Routing records stay untouched, and no nameserver change is involved. The procedure below still applies so nothing changes silently.

## Decision (proposed)
No DNS, email-routing, or production-hosting change happens without explicit owner approval. Any approved change follows this procedure:

1. **Inventory.** Export the zone file from Cloudflare (DNS → Records → Export) and store it privately, **never in this public repository**. Note the current website records and their proxy status.
2. **Stage.** Deploy to Cloudflare Pages and verify the site at its `*.pages.dev` preview URL. Make no DNS changes yet.
3. **Prepare.** If the website records are DNS-only, lower their TTL ahead of time. Proxied records switch almost instantly.
4. **Test email before.** Send and receive test messages to and from `contact@benjaire.com` and record the results.
5. **Cut over** after owner approval: attach `benjaire.com` and `www` as custom domains on the Pages project, which replaces only those records. Leave every other record in the zone (email and unrelated services) alone.
6. **Verify.** Check site, HTTPS, redirects, MX resolution, and send/receive tests, plus SPF/DKIM/DMARC pass results in the headers of a received message.
7. **Rollback.** Restore the original website records from the export (GitHub Pages IPs/CNAME). GitHub Pages stays deployed until verification is complete. Keep the export privately.

## Consequences
- Migration takes longer, but email risk is controlled and reversible.
- The form's sending domain needs SPF/DKIM records for the email API (ADR-0004). These are DNS changes and need the same approval.
