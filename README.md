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

## Security Audit

Run the security checker before pushing changes:

```bash
./security-audit.sh
```

Run it against a custom directory:

```bash
./security-audit.sh /path/to/html-dir
```

## Deployment

The website is automatically deployed via GitHub Pages from the `main` branch.
