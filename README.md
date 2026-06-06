# IREM Website

Static website for the **Institut de Recherche et Exploration Musicale** (IREM).  
Built with plain HTML, CSS, and vanilla JavaScript — no framework, no build step.

## Project Structure

```
index.html            Home
about.html            About
services.html         Services
portfolio.html        Projects & Case Studies
contact.html          Contact (email — no form)
privacy-policy.html   Privacy Policy
terms-of-service.html Terms of Service
404.html              Custom not-found page (noindex)
css/style.css         All styles (layout, dark mode, responsive)
js/config.js          Contact details + runtime email assembly (anti-scrape)
js/main.js            Dark mode, burger menu, EN/FR language switcher
js/portfolio.js       Portfolio case study expand/collapse
public/media/         Images and assets
.nojekyll             Disables Jekyll processing on GitHub Pages
```

Live URL: **https://dh0516.github.io/IREM_Website/** (default GitHub Pages, no custom domain).

## Running locally

No build step needed. Open any `.html` file directly in a browser, or serve with:

```bash
python -m http.server 3000
```

## Git Workflow

1. Pull latest `main`

   ```bash
   git checkout main && git pull origin main
   ```

2. Create a new branch named today's date

   ```bash
   git checkout -b YYYYMMDD-FeatureName
   ```

3. Do your work, commit, push

   ```bash
   git push -u origin YYYYMMDD-FeatureName
   ```

4. Open a PR on GitHub: `YYYYMMDD-FeatureName` → `main`

5. A maintainer reviews and merges

---

## Deployment (GitHub Pages)

The site is fully static — no build step.

1. Push to GitHub. In **Settings → Pages**, set **Source = Deploy from a branch**,
   branch `main` (or `gh-pages`), folder **`/ (root)`**.
2. Enable **Enforce HTTPS**.
3. The site is served at **https://dh0516.github.io/IREM_Website/** — no custom
   domain, no DNS, nothing to pay for. The `og:url` tags already point here.
   - _Want a custom domain later?_ Buy one, add a `CNAME` file containing the
     domain, point its DNS at GitHub Pages, and update every `og:url`.
4. `.nojekyll` (repo root) disables Jekyll so files are served verbatim.
5. A custom `404.html` is served automatically for unknown routes.

> **Why GitHub Pages and not Cloudflare Pages?** The site is fully static with no
> backend and no contact form — visitors reach IREM by email — so the free GitHub
> Pages tier is sufficient. The anti-scrape email handling that previously relied
> on Cloudflare's "Email Address Obfuscation" is now done in `js/config.js` (the
> address is reassembled at runtime and never appears as a literal string in any
> served file).

---

## Contact & Security

There is **no contact form and no third-party services** — the site is 100%
static. Visitors reach IREM by email, via a runtime-built `mailto:` link. This
removes all the spam/captcha surface a form would create.

### Email obfuscation (anti-scrape)

The contact email is never written as a literal string in any `.html`/`.js` file.
`js/config.js` stores it as separate `emailUser` / `emailDomain` parts and
reassembles it at runtime. It then:

- fills every `[data-contact='email']` element with a `mailto:` link that shows
  the address (studio card, legal pages), and
- sets the `href` of every `[data-contact='email-button']` anchor (the "Email Us"
  button on `contact.html`) without ever printing the address as text.

To change the address, edit those two values in `js/config.js` — that's the only
place it lives.

> Verify nothing leaked after editing: searching the served files for the literal
> address should return **zero** matches, while the address still renders in the
> browser. Note: with `.nojekyll`, GitHub Pages serves Markdown files too, so keep
> the literal address out of `*.md` as well (or out of the deployed branch).

### Content-Security-Policy

Every page sets a strict CSP via a `<meta http-equiv="Content-Security-Policy">`
tag (GitHub Pages can't send custom HTTP headers):

```
default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'
```

All scripts and styles are first-party, and there are no inline `style`/`script`
attributes (the CTA-centering style lives in `css/style.css`), so the policy needs
no `'unsafe-inline'` exceptions.

### Analytics (optional)

No analytics are included. If you want privacy-friendly stats without a backend,
add a hosted counter (e.g. GoatCounter or Plausible) and extend the CSP
`script-src`/`connect-src` to allow its domain.

---

## SEO

Every page includes:

```html
<meta name="description" content="..." />
<meta property="og:title" content="..." />
<meta property="og:description" content="..." />
<meta property="og:url" content="https://irem.ca/..." />
<meta property="og:type" content="website" />
```

Update the `og:url` values once the production domain is confirmed.
