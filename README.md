# El Badry Transport — شركة البدري لنقل

Bilingual (Arabic RTL / English LTR) single-page marketing site for a moving
and shipping company. Vanilla HTML/CSS/JS, no frameworks, no build step,
fully self-hosted — it works offline except the live map frame and the
contact-form POST.

## Run it

Any static server from the project root, e.g.:

```bash
npx serve .
# or
python -m http.server 8000
```

Then open the printed URL. (`file://` also renders; only `fetch`-based
probes are skipped.)

## Project structure

```text
index.html                  # the whole page (sections 1–12, Arabic default)
css/
  style.css                 # custom styles only (brand vars, layout, themes)
images/                     # content imagery (kebab-case names) + favicon.svg
js/
  script.js                 # all interactions, numbered §1–12
  lang.js                   # AR ⇄ EN dictionary + toggle engine
assets/
  vendor/
    fontawesome/css/        # all.min.css (needs ../webfonts — keep together)
    fontawesome/webfonts/   # icon font files (8)
    aos/                    # aos.css + aos.js (scroll animations)
  fonts/                    # Cairo + Poppins woff2 (24) + fonts.css
```

Rules:

- **Never mix custom and third-party code.** Vendor upgrades = drop-in
  replacement inside `assets/vendor/...` (keep Font Awesome's
  `css/ + ../webfonts/` relative layout intact).
- **kebab-case** for files, ids, and classes (`contact-form`, `back-to-top`).
  JS locals stay camelCase.
- One language per concern: content lives in HTML, strings in `lang.js`.

## Localization (how to add/change text)

1. Static text: tag the element — `data-i18n="key"` (text),
   `data-i18n-ph="key"` (placeholder), `data-i18n-aria="key"` (aria-label).
   If the element wraps an icon, put the attribute on an inner `<span>`,
   never on the icon's parent.
2. Add the `key` to **both** `ar` and `en` in `js/lang.js`.
3. Dynamic strings (validation, toasts, WhatsApp template): use the `js_*`
   keys via the global `t(key)` in `js/script.js`.
4. Toggle = `#lang-toggle` (persisted in `localStorage`, flips
   `<html lang dir>`, fires `langchange` for dynamic content like gallery
   aria-labels). English uses Poppins-first typography automatically.

## Contact form

Status: **live** — the form POSTs to Formspree and submissions land in
the Formspree dashboard. It validates inline (Egyptian mobile format,
required service), shows a bilingual success/error message, clears the
fields on success, and reveals a prefilled WhatsApp fallback button if
the POST fails (rate limit, network) so no lead is lost. A `_gotcha`
honeypot field blocks spam bots without a captcha.

- The form ID lives in the form's `action` attribute in `index.html`
  (`https://formspree.io/f/<id>`) and is intentionally kept out of this
  README.
- To change the destination email, log into the Formspree dashboard
  (form settings → notification email).
- If `action` ever reverts to `YOUR_FORM_ID`, submissions open WhatsApp
  with the quote prefilled instead of failing silently.

## Map

Live Google embed online; branded SVG fallback card + interactive-map link
when unreachable (probed on load and on online/offline flips).

## Deploy

Static hosting only (GitHub Pages, Netlify, any web server). Set the
canonical/OG URLs in `index.html` to the real domain before launch.

Local CSS/JS references in `index.html` carry a cache-busting version
string (`?v=YYYYMMDD`, e.g. `css/style.css?v=20261004`). **Bump this
string on every release that edits CSS or JS**, otherwise visitors may
keep seeing the cached copy. Vendored files under `assets/vendor/`
already carry stable versions — leave them alone.

## License

MIT — see [LICENSE](LICENSE).
