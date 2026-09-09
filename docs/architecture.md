# Architecture

## Constraint

Zero recurring infrastructure cost. The site must run entirely as static
files on GitHub Pages: no backend, no database, no authentication server,
no paid API, no AI API, no server-side computation.

```
Browser
  ↓ static HTML / CSS / JS
  ↓ local JSON content files
  ↓ localStorage / IndexedDB (optional, on-device progress)
```

## Stack decision: plain HTML/CSS/JS, no framework, no build step

- **No framework.** React/Vue/etc. would add a build step, a dependency
  tree, and a layer between the code and what ships. For a mostly-content
  site with light interactivity, that cost isn't justified.
- **No build step.** What's in the repository is exactly what GitHub Pages
  serves. Nothing to compile, bundle, or go stale between a commit and a
  deploy.
- **No web fonts.** Headings and body text use system font stacks
  (`css/tokens.css`). This avoids a request to a third-party font host
  (a small privacy leak and a render-blocking cost) and keeps text visible
  instantly, including offline after first load.
- **ES modules for JS**, loaded with `<script type="module">`, so feature
  code (nav, and later the lesson/quiz/storage engines) stays in isolated
  files instead of one global script.

Trade-off accepted: page chrome (header/nav/footer) is duplicated across
HTML files rather than templated, since there's no build step to assemble
includes. This is fine at the current page count; if it becomes painful, a
zero-runtime-cost templating step (e.g. an `11ty` or plain Node build run
only in CI, still producing static output) is the natural next move —
but only if/when duplication actually causes bugs, not preemptively.

## File structure

```
/               top-level pages — one .html file per route
/lessons        one lesson per .html file, e.g. lessons/a1-numbers.html
/stories        one story per .html file, e.g. stories/a1-der-erste-tag.html
/scenarios      one scenario per .html file, e.g. scenarios/bahnhof.html
                — all three are subdirectories (not the root) since each
                is expected to grow to many pages; links inside them use
                "../" back to the shared css/js/assets, so they work
                unmodified from any deployment subpath
/css            tokens.css (design tokens) → base.css (reset/typography)
                → layout.css (page chrome, grid) → components.css
                (buttons, cards, etc.); lesson.css, dashboard.css,
                story.css, history.css, geography.css, scenario.css,
                and pronunciation.css are page-scoped, loaded only
                where needed
/js             ES modules, one concern per file — nav.js (site chrome)
                plus the content engines: quiz-engine.js, vocab-card.js,
                lesson-loop.js, story-reader.js, timeline.js,
                geography.js, scenario.js, pronunciation.js, speak.js,
                text-match.js, number-words-de.js (see
                docs/lesson-engine.md, docs/quiz-engine.md,
                docs/story-reader.md, and docs/scenario-engine.md), and
                progress-store.js (the only file that touches
                localStorage — see docs/local-storage.md). Page-specific
                glue scripts (one per route, e.g. history-page.js,
                listening-page.js) fetch that page's data and wire the
                relevant engine(s) to it.
/data           structured content as JSON (see content-model.md):
                vocabulary/, lessons/, quizzes/, stories/, history/,
                geography/, scenarios/, listening/, pronunciation/
/assets/svg     inline-able SVG assets (favicon, icons)
/docs           this documentation
```

## Why multi-page, not a single-page app

Each major section is a real `.html` file with a real URL:
`/levels.html`, `/about.html`, and (later) `/lessons/…`, `/stories/…`, etc.
This matters for the project's actual constraints:

- **SEO** — search engines index real pages with real content, not an
  empty shell that renders after JavaScript runs.
- **No-JS resilience** — core content (text, structure, navigation) works
  even if a script fails to load, which matters for learners on unreliable
  connections.
- **Simplicity** — no client-side router to write, test, or debug.

Interactivity (quizzes, vocabulary lookups, progress tracking) is layered
on top of real markup via small JS modules — progressive enhancement, not
a JS-dependent shell.

## Deployment

See the README for the step-by-step. In short: GitHub Pages, "deploy from
branch," `main` / root. No GitHub Actions workflow is needed because there
is no build step.

## Data/content separation

Educational content (vocabulary, lessons, stories, etc.) will live as JSON
under `/data`, not hard-coded into HTML or JS. See `content-model.md` for
the planned schema. This keeps content additions reviewable as data
changes, independent of engine/UI code.
