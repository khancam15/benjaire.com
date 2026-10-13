# Brands

Add one JSON file per **publicly approved** brand. The Brands page and the home
page teaser render from these files; with no files, both show the
"Portfolio in development" empty state.

**This repository is public.** Never commit unreleased or unapproved brands,
not even as drafts. Git history keeps everything.

```json
{
  "name": "Brand Name",
  "description": "One line, up to 160 characters.",
  "category": "consumer-tech",
  "status": "live",
  "website": "https://example.com",
  "logo": "/brands/brand-name.svg",
  "order": 10,
  "featured": true
}
```

- `category`: `consumer-tech`, `digital`, or `lifestyle`
- `status`: `live` (needs `website`) or `coming-soon` (only for publicly announced brands)
- `logo`: put the file in `site/public/brands/`; SVG preferred
- The build fails if a required field is missing or invalid.
