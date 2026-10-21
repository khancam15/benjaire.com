// Company facts and shared settings. Company-first: never add a person's
// name, photo, bio or private contact details here (PRD §3.2).
export const SITE = {
  name: 'Benjaire',
  // Legal entity: legal pages and Organization schema.
  legalName: 'Benjaire LLC',
  // Canonical company description: homepage lead and Organization schema.
  // Reuse it word for word on company profiles; don't paraphrase per page.
  description:
    'Benjaire is a New York company developing consumer brands and digital solutions that combine technology, design, and business innovation. It operates two business pillars, Digital Solutions and Consumer Brands, under one identity.',
  // Default meta description (120 to 160 characters).
  metaDescription:
    'Benjaire is a New York company developing consumer brands and digital solutions that combine technology, design, and business innovation.',
  // Short boilerplate for footers, social bios and directories.
  boilerplate:
    'Benjaire develops digital solutions and consumer brands that combine technology, design and business innovation. Based in New York.',
  url: 'https://benjaire.com',
  email: 'contact@benjaire.com',
  location: 'New York, NY',
  founded: 2022,
} as const;

export const NAV = [
  { href: '/digital', label: 'Digital Solutions' },
  { href: '/brands', label: 'Brands' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
] as const;

// Inquiry categories (PRD §3.4). `value` is what the URL (?category=) and
// the form handler use; routing to inboxes is configured server-side (M5).
export const CATEGORIES = [
  { value: 'digital', label: 'Digital Solutions' },
  { value: 'general', label: 'General Business Inquiry' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'supplier', label: 'Supplier / Manufacturing' },
] as const;

// Supplier areas of interest (PRD §3.5). "Exploring" language only:
// no MOQs, partner names or capability claims.
export const SUPPLIER_AREAS = [
  'Consumer technology accessories',
  'Smartphone accessories',
  'Laptop accessories',
  'Audio device accessories',
  'Lifestyle products',
] as const;

// Cloudflare Turnstile site key (public by design). The secret key lives
// only in the Worker's secrets as TURNSTILE_SECRET_KEY.
export const TURNSTILE_SITE_KEY = '0x4AAAAAAFVZs6h_1DsCs70r';

// Benjaire Flow checkout (Stripe Payment Links, public by design). A tier with
// a link gets a buy button to /api/checkout, which opens a Stripe Checkout
// Session and falls back to this link; an empty link sends that tier's button
// to the contact form. Keep in sync with PAYMENT_LINKS in worker/lib.ts.
// Each link should redirect after payment to /digital/flow-thanks?tier=<key>.
// done_for_you is Flow Installed: with a link, buyers pay first and book their
// kickoff call on the thanks page; while it is empty the button books a fit call.
export const FLOW_CHECKOUT = {
  starter: 'https://buy.stripe.com/5kQfZjd5C99Qf7Ta0R5AQ02',
  professional: 'https://buy.stripe.com/aFabJ31mUdq63pb0qh5AQ03',
  done_for_you: '',
} as const;

// Calendly booking page for prospects (fit and discovery calls), embedded by
// the Booking component. Swap for a single event's link to skip the event list.
export const BOOKING_URL = 'https://calendly.com/benjaireco';

// Calendly event Flow Installed buyers book on the thanks page after paying.
export const FLOW_INSTALLED_KICKOFF = 'https://calendly.com/benjaireco/flow-installed-kickoff-call';
