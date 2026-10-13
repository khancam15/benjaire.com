// Secrets and optional settings configured in the Cloudflare dashboard.
// They are not in wrangler.jsonc because this repository is public.
interface Env {
  TURNSTILE_SECRET_KEY: string;
  /** Verified Email Routing destination that receives inquiries. */
  CONTACT_TO: string;
  /** Optional JSON map of category → verified destination address. */
  CATEGORY_RECIPIENTS?: string;
}
