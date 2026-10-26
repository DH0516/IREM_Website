# IREM Website

IREM's English and French website uses HTML, CSS, and JavaScript. The primary address is [irem.page](https://irem.page/). [GitHub Pages](https://dh0516.github.io/IREM_Website/) serves a second copy.

## Source and public snapshot

Develop in `DH0516/IREM_Website-private`. The public repository, `DH0516/IREM_Website`, contains the committed site files selected by `scripts/git/public-site-paths.txt`. Internal documents, scripts, tests, credentials, and original image folders are excluded.

Make changes on a dated private branch and open a PR to private `main`. Keep English pages at the root and French pages in `fr/` consistent. Both languages share `css/style.css` and the scripts in `js/`.

| File | Purpose |
| --- | --- |
| `index.html`, `about.html`, `services.html`, `portfolio.html` | Site content |
| `contact.html`, `privacy-policy.html`, `terms-of-service.html` | Contact and policies |
| `fr/` | French pages |
| `js/config.js` | Contact details |
| `js/main.js` | Theme, mobile menu, logo selection, and manual image galleries |
| `docs/design.md` | Design choices and reference guidance |
| `public/media/images/pages/`, `public/media/images/shared/` | Published images |
| `404.html`, `fr/404.html` | Error pages |
| `_headers` | Cloudflare response headers |
| `.nojekyll` | Serve static files directly on GitHub Pages |

## Local preview and checks

No build step is needed. Open a terminal in the repository directory, `/mnt/511GB/IREM_Website-private` on this machine, and run:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open [English](http://127.0.0.1:8000/) or [French](http://127.0.0.1:8000/fr/) in your browser. Keep the terminal open while previewing; press Ctrl+C to stop the server. Run the same command again to restart it. The server listens only on this machine.

Refresh the browser after editing files; this server does not refresh open pages automatically.

The checks run from the private repository and require Python 3.12 or later, Node.js 22.13 or a supported later release, Git, and Firefox. Install the development tools and enable the commit check once after cloning:

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements-dev.txt
npm ci --ignore-scripts
git config core.hooksPath .githooks
```

`npm run lint` runs [Ruff](https://docs.astral.sh/ruff/configuration/) for Python, [ESLint](https://eslint.org/docs/latest/use/configure/configuration-files) for JavaScript, the [deslop scanner](https://github.com/dabit3/deslop) from the AI-Deslopper collection, and the site validator. The rules live in `ruff.toml`, `eslint.config.mjs`, `scripts/deslop.mjs`, and `scripts/validate.py`. Deslop blocks its high-severity findings. AI-Deslopper rules that depend on design or intent still require review. The pre-commit hook rejects commits when lint fails, and CI runs the same command. Dependencies are pinned; these are development tools and add nothing to the served website.

Run the checks:

```sh
npm run lint
python3 -m unittest discover -s tests -p 'test_*.py'
node --test tests/browser.test.mjs
```

Browser tests use an isolated Firefox profile and a local server. Test artifacts stay in the ignored `tmp/` directory. They cover storage failures, logo selection and image failures, menu state, matching language links, project details, manual galleries, both themes at narrow and wide widths, image loading, and nested 404 pages. Publishing tests use local Git repositories.

## Publishing

Publishing requires GitHub CLI authentication and write access to the public repository. Configure its remote once in the private repository:

```sh
git remote add public https://github.com/DH0516/IREM_Website.git
```

After validation, commit the private changes. Preview the selected files, then publish a review branch:

```sh
python3 scripts/git/publish-public.py --ref HEAD --dry-run
python3 scripts/git/publish-public.py --ref HEAD --create-pr
```

The publisher starts from public `main`, replaces its tracked site files, and pushes public `dev`. It checks the remote branch tip before replacing an earlier snapshot. Review and merge the public PR to update the GitHub Pages copy.

On a push to private `main`, the deployment workflow first runs the static, publishing, and browser checks. If they pass and `PUBLIC_DEPLOY_TOKEN` is configured, it creates and merges a public deployment PR. The token needs contents and pull-request write access to `DH0516/IREM_Website`. Without it, validation runs and deployment is skipped with a warning.

GitHub Pages serves public `main` from the repository root. The Cloudflare Pages project `irem` serves `irem.page`, `www.irem.page`, and `irem.pages.dev`, as recorded in the private operations notes. Deployment connection settings are managed in the hosting accounts.

## Contact, privacy, and browser behavior

Visitors contact IREM by email. `js/config.js` builds the email links from separate address parts. This prevents simple literal-string matching; it does not hide the address from software that runs JavaScript.

The site stores the selected theme in local storage and the last displayed logo in tab-scoped session storage. Each tab starts with the original IREM logo image; later refreshes and page visits choose a different image from the original and three distinct existing variants. Both the header and footer use self-contained logo-only SVG files built from the existing images. Full-name images and the serif text wordmark are never logo choices. The original navy badge retains its color with clean edges; the other marks have transparent backgrounds and use light ink in dark mode. A variant replaces the visible image only after loading successfully. When session storage is blocked, the default logo remains. Theme switching and navigation still work when storage is unavailable. EN/FR language links and the moon/sun theme control are in the footer's final row, with accessible labels. Project details use native expandable sections, and galleries move only when the visitor uses them. Reduced-motion preferences disable smooth gallery scrolling.

The design uses IREM's existing navy identity, project photographs, and software screenshots. See [the design notes](docs/design.md) for layout and typography choices. Navigation and project details work without site scripts.

The site includes no analytics. `_headers` sets `Cache-Control: public, max-age=0, must-revalidate, no-transform` to prevent Cloudflare's automatic beacon injection. See [Cloudflare's explanation](https://developers.cloudflare.com/web-analytics/faq/).

Pages restrict scripts and styles to the site's origin. Each 404 page additionally permits its small inline root initializer through an exact CSP hash. This lets nested missing URLs resolve assets on both hosting paths. If that initializer changes, update its hash; validation checks it.

Metadata uses `https://irem.page/` as the primary address. Private historical plans, image prompts, and copy are stored in `docs/archive/` and excluded from publication. Use this README for current setup and publishing commands.
