// benjaire.com Worker. Static pages are served from ./dist by the assets
// layer; only /api/* reaches this script (see wrangler.jsonc).
import { EmailMessage } from 'cloudflare:email';
import { buildMime, composeEmail, originAllowed, recipientFor, validate } from './lib';

const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};
const MAX_BODY = 20_000;

function respond(req: Request, status: number, body: Record<string, unknown>): Response {
  // Without JavaScript the browser posts a normal form: send it back to the
  // contact page with a status flag instead of showing raw JSON.
  const wantsJson = (req.headers.get('Accept') ?? '').includes('application/json');
  if (!wantsJson) {
    const url = new URL('/contact', req.url);
    url.searchParams.set('status', body.ok ? 'sent' : 'error');
    return Response.redirect(url.toString(), 303);
  }
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}

async function verifyTurnstile(token: string, secret: string, ip: string | null): Promise<boolean> {
  if (!token || !secret) return false;
  const form = new FormData();
  form.append('secret', secret);
  form.append('response', token);
  if (ip) form.append('remoteip', ip);
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: form });
  if (!res.ok) return false;
  const data = (await res.json()) as { success?: boolean; action?: string };
  return data.success === true && (data.action === undefined || data.action === 'contact');
}

async function handleContact(req: Request, env: Env): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: { Allow: 'POST' } });
  }
  if (!originAllowed(req.headers.get('Origin'), env.ALLOWED_HOSTS)) {
    return respond(req, 403, { ok: false, error: 'This form can only be sent from benjaire.com.' });
  }
  const length = Number(req.headers.get('Content-Length') ?? '0');
  if (length > MAX_BODY) return respond(req, 413, { ok: false, error: 'Your message is too long.' });

  const ip = req.headers.get('CF-Connecting-IP');
  const { success: underLimit } = await env.CONTACT_LIMITER.limit({ key: ip ?? 'unknown' });
  if (!underLimit) {
    return respond(req, 429, { ok: false, error: 'Too many messages in a short time. Please wait a minute and try again.' });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return respond(req, 400, { ok: false, error: 'The form could not be read. Please try again.' });
  }

  // Honeypot: real visitors never fill this hidden field. Pretend success.
  if (String(form.get('website') ?? '').trim()) return respond(req, 200, { ok: true });

  const human = await verifyTurnstile(String(form.get('cf-turnstile-response') ?? ''), env.TURNSTILE_SECRET_KEY, ip);
  if (!human) {
    return respond(req, 400, { ok: false, error: "We couldn't confirm you're not a robot. Please complete the check and try again." });
  }

  const { inquiry, errors } = validate(form);
  if (!inquiry) return respond(req, 422, { ok: false, error: 'Please fix the highlighted fields.', fields: errors });

  if (!env.CONTACT_TO) {
    console.error('CONTACT_TO is not configured');
    return respond(req, 503, { ok: false, error: 'The form is temporarily unavailable.' });
  }

  const { subject, text } = composeEmail(inquiry, { receivedAt: new Date().toISOString(), host: new URL(req.url).hostname });
  const to = recipientFor(inquiry.category, env.CONTACT_TO, env.CATEGORY_RECIPIENTS);
  const domain = env.MAIL_FROM.split('@')[1];
  const raw = buildMime({
    from: { name: 'Benjaire website', email: env.MAIL_FROM },
    to,
    replyTo: { name: inquiry.name, email: inquiry.email },
    subject,
    text,
    messageId: `<${crypto.randomUUID()}@${domain}>`,
    date: new Date(),
  });
  try {
    // Classic send_email: works with Email Routing verified destinations.
    await env.SEND_EMAIL.send(new EmailMessage(env.MAIL_FROM, to, raw));
  } catch (err) {
    console.error('send_email failed', err instanceof Error ? err.message : err);
    return respond(req, 502, { ok: false, error: "Your message couldn't be sent." });
  }
  return respond(req, 200, { ok: true });
}

export default {
  async fetch(req, env): Promise<Response> {
    const { pathname } = new URL(req.url);
    if (pathname === '/api/contact') return handleContact(req, env);
    return new Response('Not found', { status: 404, headers: { 'Cache-Control': 'no-store' } });
  },
} satisfies ExportedHandler<Env>;
