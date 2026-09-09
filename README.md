# Deutschpfad

A free German-language learning website for international students —
vocabulary, grammar, stories, history, geography, and real-life German, built
as a static site with **zero recurring infrastructure cost**.

No signup. No login. No payment. No backend. No database. No API keys.
Progress is stored only in the learner's browser (`localStorage`), with
export/import to move it between devices.

## Status

This project is being built in incremental phases (see `docs/roadmap.md`).
**Phase 1 — foundation** (project structure, design system, homepage,
navigation, responsive layout) is complete. The lesson, vocabulary, and quiz
engines come next.

## Stack

Plain HTML, CSS, and JavaScript (ES modules) — no framework, no build step,
no bundler. This is a deliberate choice: it keeps the site fast, inspectable,
accessible, and trivially deployable on GitHub Pages. See
`docs/architecture.md` for the reasoning.

## Project structure

```
/               top-level pages (index.html, levels.html, about.html, …)
/css            design tokens + stylesheets (no CSS framework)
/js             site chrome and feature engines (ES modules)
/data           structured content (JSON) — vocabulary, lessons, etc.
/assets         SVGs and other static assets
/docs           architecture, curriculum, and content documentation
```

See `docs/content-model.md` for how content data is structured and
`docs/architecture.md` for how the pieces fit together.

## Running locally

No build step — just serve the folder statically. For example:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

Any static file server works (`npx serve`, VS Code's Live Server, etc.).

## Deploying

The site is plain static files, so GitHub Pages needs no build step:

1. Push this repository to GitHub.
2. In the repo, go to **Settings → Pages**.
3. Under "Build and deployment", choose **Deploy from a branch**.
4. Select the `main` branch and the `/ (root)` folder, then save.

The site will be published at `https://<username>.github.io/<repo>/`.

## License

Code is MIT-licensed (`LICENSE`). Educational content has its own license —
see `CONTENT-LICENSE.md`.

## Contributing

See `docs/contributing.md`.
