# Electrical Solutions architecture

This project is intentionally a static, multi-page product catalogue. It does not pretend to have a server or database: every public page can be hosted from a CDN or a small Nginx container.

```text
Browser
  -> semantic HTML pages
  -> shared CSS design system
  -> shared JavaScript catalogue/search behavior
  -> direct phone and WhatsApp hand-off
```

## Pages

- Home and company positioning
- Searchable/filterable product catalogue
- Dynamic product details selected from URL state
- About and contact pages
- Privacy and terms pages

## Delivery decisions

- Static hosting keeps the brochure/catalogue fast and inexpensive.
- Responsive CSS and one shared script avoid framework overhead for a small content site.
- Contact actions transfer the visitor to phone or WhatsApp instead of collecting personal data on an unnecessary backend.
- Node's built-in test runner verifies the complete page set, navigation, catalogue interactions, responsive metadata, and contact paths.
- The Docker image serves the same source through Nginx, matching conventional production static hosting.
