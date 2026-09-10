# Deployment

## GitHub Pages (the only supported target)

1. Push the repository to GitHub.
2. Settings → Pages → Build and deployment → **Deploy from a branch**.
3. Branch: `main`, folder: `/ (root)`.

No GitHub Actions workflow is required — there's no build step. Every file
in the repository is served as-is.

## Before going live

- [ ] Replace the placeholder `https://deutschpfad.example/` canonical URL
      and Open Graph tags in every top-level page and `robots.txt` /
      `sitemap.xml` with the real GitHub Pages URL
      (`https://<username>.github.io/<repo>/`) or custom domain — as of
      Phase 5 that's `index.html`, `levels.html`, `about.html`,
      `dashboard.html`, `vocabulary.html`, `mock-exam.html`,
      `explore.html`, `history.html`, `geography.html`, `listening.html`,
      `pronunciation.html`, every page under `lessons/`,
      `stories/a1-der-erste-tag.html`, and `scenarios/bahnhof.html`.
      (`dashboard.html` carries `<meta name="robots" content="noindex">`
      and is deliberately left out of `sitemap.xml` — it's a per-browser
      personal page with no shared content for a search index.)
- [ ] If using a custom domain, add a `CNAME` file at the repo root with
      the domain name (GitHub Pages generates this automatically if set
      through the Settings UI — either approach works, just keep them in
      sync).
- [ ] If the repo is served from a subpath (`username.github.io/repo/`
      rather than a custom domain or a `username.github.io` repo), double
      check that all internal links stay relative (they do today — no
      leading `/` in `href`s) so the site works from a subpath without
      edits.

## Cache behavior

Static assets have no cache-busting scheme yet (no hashed filenames).
GitHub Pages sets short-lived caching by default, so this is low-risk
today; revisit if/when the site introduces heavier assets (audio, images)
where stale caches would matter more.
