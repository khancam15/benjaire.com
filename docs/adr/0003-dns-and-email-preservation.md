# ADR-0003: DNS and email preservation

- **Status:** Proposed
- **Date:** 2026-10-13

## Context
`contact@benjaire.com` is the company's only published inbox and must keep working. The DNS provider and email provider are **not yet known** (PRD V-1, V-2). Any hosting choice that changes nameservers (ADR-0002 options B and C) moves every DNS record, including MX, SPF, DKIM, DMARC, and the verification records. Mistakes there silently break email.

## Decision (proposed)
No DNS, email-routing, or production-hosting change happens without explicit owner approval. Any approved change follows this procedure:

1. **Inventory.** Export the full zone from the current DNS provider (not just a scan; DKIM selectors are not discoverable from public DNS). Record the MX, SPF, DKIM, DMARC, verification, `www`, and any other records.
2. **Stage.** Recreate the zone at the new provider without switching nameservers yet. Compare it record by record against the export.
3. **Prepare.** Lower TTLs to 300s at least 24–48 hours before the cutover. Confirm that the new host serves the site at its preview URL.
4. **Test email before.** Send and receive test messages to and from `contact@benjaire.com` and record the results.
5. **Cut over** during a low-traffic window, after owner approval.
6. **Verify.** Check site, HTTPS, redirects, MX resolution, and send/receive tests, plus SPF/DKIM/DMARC pass results in the headers of a received message.
7. **Rollback.** Revert the nameservers (or the A/CNAME records) to the original values from the export. GitHub Pages stays deployable until verification is complete. Keep the export permanently.

## Consequences
- Migration takes longer, but email risk is controlled and reversible.
- The form's sending domain needs SPF/DKIM records for the email API (ADR-0004). These are DNS changes and need the same approval.
