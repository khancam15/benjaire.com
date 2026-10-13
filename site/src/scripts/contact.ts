// Contact form: category prefill, client-side validation and submission.
// Server-side validation, Turnstile and email delivery arrive in M5
// (ADR-0004). Until FORM_ENABLED is true the form explains that and points
// to the direct email address instead of pretending to send.
const FORM_ENABLED = false;
const EMAIL = 'contact@benjaire.com';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function initContactForm(): void {
  const form = document.getElementById('inquiry') as HTMLFormElement | null;
  if (!form) return;
  const status = document.getElementById('form-status') as HTMLElement;

  // ?category=supplier preselects a chip.
  const wanted = new URLSearchParams(location.search).get('category');
  if (wanted) {
    const chip = form.querySelector<HTMLInputElement>(`input[name="category"][value="${CSS.escape(wanted)}"]`);
    if (chip) chip.checked = true;
  }

  const setError = (id: string, msg: string) => {
    const err = document.getElementById(`${id}-err`);
    const field = document.getElementById(`f-${id}`);
    const input = document.getElementById(id);
    if (err) err.textContent = msg;
    field?.classList.toggle('has-error', !!msg);
    input?.setAttribute('aria-invalid', msg ? 'true' : 'false');
  };

  const validate = (): string | null => {
    const data = new FormData(form);
    const name = String(data.get('name') ?? '').trim();
    const email = String(data.get('email') ?? '').trim();
    const message = String(data.get('message') ?? '').trim();
    const checks: Array<[string, string]> = [
      ['name', name ? '' : 'Enter your name.'],
      ['email', !email ? 'Enter your email address.' : EMAIL_RE.test(email) ? '' : 'Enter a valid email address, like name@company.com.'],
      ['message', message.length >= 20 ? '' : 'Tell us a little more: at least 20 characters.'],
      ['consent', data.get('consent') ? '' : 'Please agree to the Privacy Policy so we can reply.'],
    ];
    let first: string | null = null;
    for (const [id, msg] of checks) {
      setError(id, msg);
      if (msg && !first) first = id;
    }
    return first;
  };

  const show = (tone: 'ok' | 'error', text: string) => {
    status.dataset.tone = tone;
    status.textContent = text;
    status.hidden = false;
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const firstInvalid = validate();
    if (firstInvalid) {
      document.getElementById(firstInvalid)?.focus();
      return;
    }
    if ((form.elements.namedItem('website') as HTMLInputElement).value) return; // honeypot

    if (!FORM_ENABLED) {
      show('error', `Online sending isn't switched on yet. Please email ${EMAIL}, and your message will reach the same inbox.`);
      return;
    }

    const button = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
    button.disabled = true;
    try {
      const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error(String(res.status));
      form.reset();
      show('ok', 'Thanks. Your message is on its way, and we reply within 24 hours.');
    } catch {
      show('error', `Your message couldn't be sent. Your text is still here, so try again, or email ${EMAIL}.`);
    } finally {
      button.disabled = false;
    }
  });
}
