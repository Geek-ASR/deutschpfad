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

The six phases built the engine; populating the curriculum with it was
the first pass tracked unit by unit in `docs/roadmap.md`, and all
twelve originally-planned A1 topic units are live: Greetings,
Introducing Yourself, Numbers, Family, Colors, Days/Months/Seasons,
Time, Food, Drinks, Home, Animals, and Daily Life
(`lessons/a1-greetings.html`, `lessons/a1-introductions.html`,
`lessons/a1-numbers.html` — built first, out of sequence, as the
engine's reference lesson — `lessons/a1-family.html`,
`lessons/a1-colors.html`, `lessons/a1-calendar.html`,
`lessons/a1-time.html`, `lessons/a1-food.html`,
`lessons/a1-drinks.html`, `lessons/a1-home.html`,
`lessons/a1-animals.html`, `lessons/a1-daily-life.html`) — alongside
one story, one scenario, one listening set, and the Pronunciation Lab.

Those twelve units cover the curriculum's *topics*, but not enough
*volume* to pass a real A1 exam — roughly 200 vocabulary items against
the ~600–650 words the Goethe-Institut's official A1 word list expects,
plus real grammar gaps (modal verbs, past tense, pronoun cases,
negation) the topic units never touched. An **A1 exam-readiness
expansion** is now underway to close that gap: four new grammar units,
a vocabulary-expansion pass across all twelve existing units, a
vocabulary-bank/flashcard page, and a timed mock-exam mode. All four
grammar units are now live — Questions & Negation
(`lessons/a1-questions-negation.html`), Pronouns & Cases
(`lessons/a1-pronouns-cases.html`), Modal Verbs
(`lessons/a1-modal-verbs.html`), and Perfekt/past tense
(`lessons/a1-perfekt.html`) — closing the site's biggest grammar gaps
(modal verbs, personal pronoun cases, negation, and the past tense)
with the same picker/quiz engines used throughout, no new code
required. The vocabulary-expansion pass across the twelve topic units is now
underway too — eleven of twelve are done (Greetings, Introducing
Yourself, Numbers, Family, Colors, Days/Months/Seasons, Time, Food,
Drinks, Home, Animals), each roughly doubling vocabulary and quiz
depth. Numbers, Calendar, and Animals are worth noting specifically:
each has a category that's deliberately already complete (cardinal
numbers; the fixed 7 days/12 months/4 seasons; the 7 German
plural-formation patterns), so their expansions added genuinely new
adjacent content instead of padding an already-finished list —
ordinal numbers (a real addition to `js/number-words-de.js`),
relative time vocabulary (heute, Woche, Geburtstag), and more animals
that reinforce the same 7 plural patterns with fresh examples plus
farm/zoo vocabulary. Remaining: Daily Life, the vocabulary bank, and
the mock-exam mode. Full plan and reasoning in `docs/roadmap.md`'s
"A1 exam-readiness expansion" section.

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
