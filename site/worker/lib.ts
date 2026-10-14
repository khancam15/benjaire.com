// Pure contact-form logic (no Cloudflare APIs) so it can be unit-tested
// with `node --test`. Keep the category list in sync with src/site.ts.

export const CATEGORIES: Record<string, string> = {
  digital: 'Digital Solutions',
  general: 'General Business Inquiry',
  partnership: 'Partnership',
  supplier: 'Supplier / Manufacturing',
};

export const LIMITS = { name: 120, email: 254, company: 160, messageMin: 20, messageMax: 5000 } as const;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export interface Inquiry {
  category: string;
  name: string;
  email: string;
  company: string;
  message: string;
}

export type FieldErrors = Partial<Record<keyof Inquiry | 'consent', string>>;

/** Collapse whitespace and strip control characters (header-injection safe). */
export function cleanLine(value: unknown, max: number): string {
  return String(value ?? '')
    .replace(/[\u0000-\u001f\u007f]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

/** Keep line breaks in the message body but drop other control characters. */
export function cleanBody(value: unknown, max: number): string {
  return String(value ?? '')
    .replace(/\r\n?/g, '\n')
    .replace(/[\u0000-\u0008\u000b-\u001f\u007f]+/g, '')
    .trim()
    .slice(0, max);
}

export function validate(form: FormData): { inquiry?: Inquiry; errors: FieldErrors } {
  const errors: FieldErrors = {};
  const category = cleanLine(form.get('category'), 40);
  const name = cleanLine(form.get('name'), LIMITS.name);
  const email = cleanLine(form.get('email'), LIMITS.email);
  const company = cleanLine(form.get('company'), LIMITS.company);
  const message = cleanBody(form.get('message'), LIMITS.messageMax);

  if (!(category in CATEGORIES)) errors.category = 'Choose what your message is about.';
  if (!name) errors.name = 'Enter your name.';
  if (!EMAIL_RE.test(email)) errors.email = 'Enter a valid email address.';
  if (message.length < LIMITS.messageMin) errors.message = `Tell us a little more: at least ${LIMITS.messageMin} characters.`;
  if (!form.get('consent')) errors.consent = 'Please agree to the Privacy Policy so we can reply.';

  return Object.keys(errors).length ? { errors } : { inquiry: { category, name, email, company, message }, errors };
}

/**
 * Recipient for a category. CATEGORY_RECIPIENTS is optional JSON such as
 * {"supplier":"sourcing@example.com"}; anything unmapped goes to the default.
 * Every address must be a verified Email Routing destination.
 */
export function recipientFor(category: string, fallback: string, mapJson?: string): string {
  if (mapJson) {
    try {
      const map = JSON.parse(mapJson) as Record<string, string>;
      if (typeof map[category] === 'string' && map[category].includes('@')) return map[category];
    } catch {
      /* ignore malformed config and use the default */
    }
  }
  return fallback;
}

export function composeEmail(i: Inquiry, meta: { receivedAt: string; host: string }) {
  const label = CATEGORIES[i.category];
  const subject = `[${label}] ${i.name}${i.company ? ` · ${i.company}` : ''}`.slice(0, 200);
  const text = [
    `New inquiry from ${meta.host}`,
    '',
    `Category: ${label}`,
    `Name:     ${i.name}`,
    `Email:    ${i.email}`,
    `Company:  ${i.company || '(not given)'}`,
    `Received: ${meta.receivedAt}`,
    '',
    '--- Message ---',
    i.message,
    '',
    'Reply to this email to answer the sender directly.',
  ].join('\n');
  return { subject, text };
}

/** Only accept POSTs whose Origin is one of our own hosts. */
export function originAllowed(origin: string | null, allowedHosts: string): boolean {
  if (!origin) return false;
  try {
    const url = new URL(origin);
    const hosts = allowedHosts.split(',').map((h) => h.trim()).filter(Boolean);
    if (url.protocol !== 'https:' && url.hostname !== 'localhost') return false;
    return url.hostname === 'localhost' || hosts.includes(url.hostname) || url.hostname.endsWith('-benjaire-com.benjaireco.workers.dev');
  } catch {
    return false;
  }
}

/** RFC 2047 encode a header value when it contains non-ASCII characters. */
function encodeHeader(value: string): string {
  return /^[\x20-\x7e]*$/.test(value) ? value : `=?UTF-8?B?${toBase64(value)}?=`;
}

function toBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

/**
 * Build a plain-text MIME message for Cloudflare's classic `send_email`
 * (EmailMessage), which works with Email Routing verified destinations.
 * Inputs are already stripped of CR/LF by validate(), so headers are safe.
 */
export function buildMime(opts: {
  from: { name: string; email: string };
  to: string;
  replyTo: { name: string; email: string };
  subject: string;
  text: string;
  messageId: string;
  date: Date;
}): string {
  const addr = (a: { name: string; email: string }) => `${encodeHeader(a.name.replace(/["\\]/g, ''))} <${a.email}>`;
  const body = toBase64(opts.text).replace(/.{1,76}/g, '$&\r\n');
  return [
    `From: ${addr(opts.from)}`,
    `To: <${opts.to}>`,
    `Reply-To: ${addr(opts.replyTo)}`,
    `Subject: ${encodeHeader(opts.subject)}`,
    `Date: ${opts.date.toUTCString()}`,
    `Message-ID: ${opts.messageId}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    body,
  ].join('\r\n');
}
