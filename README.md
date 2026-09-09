# Deutschpfad

A free German-language learning website for international students —
vocabulary, grammar, stories, history, geography, and real-life German, built
as a static site with **zero recurring infrastructure cost**.

No signup. No login. No payment. No backend. No database. No API keys.
Progress is stored only in the learner's browser (`localStorage`), with
export/import to move it between devices.

## Status

This project was built in incremental phases (see `docs/roadmap.md`), and
**all six are now done**: the design system and site structure; the lesson,
vocabulary, and quiz engines (`lessons/a1-numbers.html`); local progress
tracking with spaced review (`dashboard.html`); an interactive story
reader, a German history timeline, and a Germany facts explorer; a
real-life conversation scenario, audio-first listening practice, and a
Pronunciation Lab (all linked from `explore.html`); and a Phase 6 polish
pass that audited the whole site and fixed what it found — two real
heading-hierarchy skips, a cross-page CSS bug leaving some pages with
unstyled buttons, seven pages missing Open Graph tags, and eight pages
that went silently blank without JavaScript. Details in the roadmap.

This is a foundation, not a finished curriculum — one lesson, one story,
one scenario. Populating the rest of A1 (and beyond) with the same care
is the natural next work, using the engines this project now has.

## Stack

Plain HTML, CSS, and JavaScript (ES modules) — no framework, no build step,
no bundler. This is a deliberate choice: it keeps the site fast, inspectable,
accessible, and trivially deployable on GitHub Pages. See
`docs/architecture.md` for the reasoning.

## Project structure

```
/               top-level pages (index.html, levels.html, about.html, …)
/lessons        one page per lesson    /stories   one page per story
/scenarios      one page per scenario  (all three: more to come)
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
