# Benjaire.com

Personal website for Benjaire, a multi-venture holding company operating at the intersection of technology, commerce, and innovation.

## Description

This repository contains the source code for benjaire.com, a static website hosted on GitHub Pages.

## Technologies Used

- HTML5
- CSS3 (inline styles)
- Google Fonts

## Getting Started

To view the website locally:

1. Clone the repository
2. Start a local static server from the project root:

```bash
python3 -m http.server 5501
```

3. Open `http://localhost:5501` in your browser

## Development Best Practices

Use this repository as a lightweight static site. Keep changes simple, reviewable, and easy to deploy through GitHub Pages.

- Preserve the current page content unless a change is explicitly about copy, positioning, or messaging.
- Keep UI changes consistent across pages: navigation, typography, spacing, colors, responsive breakpoints, and footer treatment should feel like one system.
- Prefer semantic HTML elements such as `main`, `section`, `article`, `nav`, `button`, `details`, and `summary`.
- Add descriptive `alt` text to meaningful images. Decorative images should use empty `alt=""`.
- Include `width` and `height` on images when known to reduce layout shift.
- Use responsive CSS with stable layout constraints such as `grid`, `max-width`, `minmax()`, `clamp()`, and media queries.
- Keep JavaScript small and progressive. If JavaScript fails, core navigation and page content should still be usable.
- Avoid inline event attributes like `onclick`; use `addEventListener` in scripts.
- Add keyboard support for interactive UI, including visible focus states and Escape-to-close behavior for menus or overlays.
- Respect `prefers-reduced-motion` when adding transitions, scroll effects, or reveal animations.
- Test changed pages on desktop and mobile widths before deploying.

Recommended local checks after editing:

```bash
python3 scripts/ui_audit.py .
python3 scripts/security_audit.py .
./security-audit.sh .
```

## Security Audit

Run the security checker before pushing changes:

```bash
./security-audit.sh
```

Python audit utilities are also available:

```bash
python3 scripts/security_audit.py .
python3 scripts/ui_audit.py .
```

Run it against a custom directory:

```bash
./security-audit.sh /path/to/html-dir
python3 scripts/security_audit.py /path/to/html-dir
python3 scripts/ui_audit.py /path/to/html-dir
```

## Security Best Practices

This is a static website, so security work is mostly about reducing browser attack surface, avoiding accidental secret exposure, and keeping deploys predictable.

- Keep the Content Security Policy on every HTML page.
- Avoid adding third-party scripts. If a dependency is required, document why it is needed and load it only from a trusted HTTPS source.
- Do not commit secrets, API keys, private certificates, analytics tokens, service account files, or `.env` files.
- Do not use `eval()`, `document.write()`, unsafe `innerHTML` assignments, or `javascript:` URLs.
- Use `rel="noopener noreferrer"` for every `target="_blank"` link.
- Keep external resources on HTTPS only.
- Keep `frame-ancestors 'none'`, `base-uri 'self'`, and `connect-src 'none'` in the CSP unless the site truly needs a broader policy.
- Treat forms as high-risk. If forms are added, validate server-side, protect against spam, and review CSRF behavior for the destination service.
- Review image and font sources before adding them to the CSP.
- Run the security audits before pushing to `main`.

Current note: pages use inline CSS and JavaScript, so the CSP currently includes `'unsafe-inline'`. A stricter future improvement would move styles and scripts into external files or use CSP hashes.

## Deployment

The website is automatically deployed via GitHub Pages from the `main` branch.
