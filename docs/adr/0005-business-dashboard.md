# ADR-0005: Private business dashboard

- **Status:** Accepted (owner approval 2026-10-18)
- **Date:** 2026-10-18

## Context
The owner wants one private place to see website traffic, product sales and downloads, inquiry handling, n8n automation health, Cloudflare infrastructure status and a simple financial overview. Today that information is spread across the Cloudflare dashboard, Stripe, n8n and email digests.

**Verified on 2026-10-18 (read-only discovery):**
- One Cloudflare Worker (`benjaire-com`) serves the site and `/api/contact`. The account has no D1 databases and no KV namespaces, and R2 is not enabled.
- The site's CSP already allows the Cloudflare Web Analytics beacon. Whether the site is registered in Web Analytics still needs a check in the dashboard.
- Deploys run through Cloudflare Workers Builds, not GitHub Actions. GitHub Actions runs only the Site CI checks.
- n8n Cloud runs the Benjaire Flow workflows (intake, status updates, reply reminders, Monday digest, error alerts) and the shop delivery workflow. Inquiries, orders and download counts live in n8n data tables.
- Stripe is the payment processor (Payment Links, live mode). One webhook sends `checkout.session.completed` to n8n.
- No expense or accounting system is connected.

## Options
| Option | Pros | Cons |
|---|---|---|
| A. Add dashboard routes to the `benjaire-com` Worker | No new project | Mixes a private admin surface into the public site; site deploys and dashboard deploys share a blast radius |
| **B. Separate Worker `benjaire-dashboard` behind Cloudflare Access** | Isolated from the public site; same vendor and tooling; Access, D1 and Cron Triggers are on the free tier | One more project to maintain |
| C. Third-party BI tool (Looker Studio, Metabase Cloud) | Little code | New vendor; customer data leaves Cloudflare; weak fit for n8n and Workers Builds data |

## Decision (proposed)
**Option B.** A separate Worker with static assets and a small server-side API:
1. **Access control:** Cloudflare Access in front of every hostname the Worker answers on. The Worker also verifies the Access JWT on every request and refuses anything without a valid one, so a misconfigured route fails closed. `workers_dev` and `preview_urls` stay off.
2. **Server-side integrations only.** API tokens live in Worker secrets; the browser talks only to the dashboard's own API.
   - Cloudflare: GraphQL Analytics and REST (Workers deployments, Workers Builds, DNS), read-only token.
   - Stripe: restricted read-only key.
   - GitHub: fine-grained read-only token for this repository.
   - n8n: a dedicated n8n workflow pushes **aggregated, PII-free** metrics to the dashboard on a schedule, signed with a shared secret. No n8n API key and no customer records leave n8n.
3. **Storage:** one D1 database for daily snapshots (so period comparisons survive upstream retention limits), manual finance entries, alerts and an audit log. No KV; the Workers Cache API covers short-lived response caching.
4. **Refresh:** Cron Triggers collect data on a schedule; the open dashboard polls its own API. No server-sent events, because no upstream source is real time.
5. **Data labels:** every metric shows whether it is live, delayed, estimated, manual or not connected, and where it came from.
6. **Domain:** `dashboard.benjaire.com`, attached only after owner approval (it is a DNS change, ADR-0003).

## Consequences
- No change to the public site, its Worker or its DNS records.
- Expected incremental cost is $0 on Cloudflare's free tiers. The n8n metrics workflow uses n8n executions, so its schedule must fit the n8n plan's monthly execution quota.
- Financial figures that have no integration (expenses) are entered by hand, and every change is recorded in the audit log.
- The dashboard source lives in a separate private repository (`benjaire-dashboard`), not in this public one.

## Owner decisions (2026-10-18)
- Architecture: Option B, as above.
- Source code: a new private repository.
- n8n: the push design (aggregates only, signed). The new n8n workflow is a production n8n change and gets its own approval when built.
- Sign-in: Cloudflare Access with Google login, allow list of one address. Sessions last 24 hours.
- Domain: `dashboard.benjaire.com` is attached only after the dashboard is built and tested, under a separate approval (ADR-0003).
- Not adopted for now: automatic deletion of old inquiries in n8n.
