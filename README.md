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
expansion** closed that gap in four parts, and **all four are now
done**:

1. **Four new grammar units** — Questions & Negation
   (`lessons/a1-questions-negation.html`), Pronouns & Cases
   (`lessons/a1-pronouns-cases.html`), Modal Verbs
   (`lessons/a1-modal-verbs.html`), and Perfekt/past tense
   (`lessons/a1-perfekt.html`) — closing the site's biggest grammar
   gaps with the same picker/quiz engines used throughout, no new
   code required.
2. **A vocabulary-expansion pass** across all twelve topic units,
   taking their vocabulary from roughly 200 items to 429 (481
   counting the grammar units), each unit roughly doubling its
   vocabulary and quiz depth. Numbers, Calendar, and Animals are
   worth noting specifically: each has a category that's deliberately
   already complete (cardinal numbers; the fixed 7 days/12 months/4
   seasons; the 7 German plural-formation patterns), so their
   expansions added genuinely new adjacent content instead of padding
   an already-finished list — ordinal numbers (a real addition to
   `js/number-words-de.js`), relative time vocabulary, and more
   animals reinforcing the same 7 plural patterns.
3. **A vocabulary bank** (`vocabulary.html`) — the full A1 word list
   in one searchable page, filterable by topic, with flashcards
   (front/back reveal, either direction, audio, shuffle), a
   browse-list view, and a "Quiz me" mode that generates a typing quiz
   from whatever's currently filtered. It also carries **six topic
   areas no unit covers** but every A1 exam expects — weather,
   clothing, transport & directions, body & health, shopping & money,
   professions (25 words each) — taking the vocabulary total from 481
   to **631**, into the Goethe-Institut's ~600–650-word A1 range.
4. **A1 mock exams** (`mock-exam.html`) — two full, timed practice
   sittings in the real Goethe/telc "Start Deutsch 1" format (Hören,
   Lesen, Schreiben, Sprechen), picked from a dropdown, built only from
   vocabulary and grammar the units and the vocabulary bank already
   cover (exam 2 leans on the six extra topic areas so it isn't a
   rerun). Hören, Lesen, and Schreiben's form-fill task are auto-graded
   through a new engine (`js/exam-engine.js`) built specifically for
   exam conditions — no feedback until a section ends, plus a countdown
   — sharing all its actual question rendering with the lesson quiz
   engine rather than duplicating it. Schreiben's open writing and the
   whole Sprechen module can't be honestly auto-graded without a
   backend or a person, so both are self-check practice instead (a
   model answer to compare against; real speaking prompts to try out
   loud).

Quiz results from the vocabulary bank and the mock exams all feed the
same local spaced-review schedule lesson quizzes do, so anything
tested in either place shows up on the dashboard's review queue too.
Full plan and reasoning in `docs/roadmap.md`'s "A1 exam-readiness
expansion" section.

**A2 has now begun.** The lesson/quiz engines carry over unchanged, so
an A2 unit is pure content in the same shapes. Ten units are live:
**Präteritum (Simple Past)** — the written past tense plus the spoken
Präteritum for sein/haben/modals; **Comparatives & Superlatives** —
bigger, better, best, plus `so … wie`; **Two-Way Prepositions** —
`in/an/auf/…` with the Dativ (location) vs. Akkusativ (movement)
rule; **Subordinate Clauses** — the verb-to-the-end word order after
`weil`/`dass`/`wenn`, with the `denn` and `deshalb` traps; and
**Reflexive Verbs** — the
`mich/dich/sich` pronoun set and accusative-vs-dative; and
**Dative-only Prepositions** —
`mit/nach/zu/von/bei/seit/aus/gegenüber`, which always take the
Dativ, plus the fused forms `zum/zur/vom/beim`; and **Travel &
Holidays** (`lessons/a2-travel-holidays.html`) — the first A2 topic
unit: the Perfekt with `sein` for movement verbs, separable travel
verbs (`abgeflogen`, `angekommen`, `umgestiegen`), and `nach` vs.
`in die` for destinations; and **City Life & Getting Around**
(`lessons/a2-city-life.html`) — the imperative (`Sie` / `du` / `ihr`)
for directions, separable verbs in commands, polite indirect
questions, and ordinals for streets and floors; and **Health & the
Body** (`lessons/a2-health-body.html`) — `weh tun` + Dativ, the
plural `-schmerzen` nouns, and `sollte` for advice; and **The
Genitiv** (`lessons/a2-genitiv.html`) — the fourth case (`des`/`der`,
the `-s`/`-es` ending) and the prepositions `wegen` / `während` /
`trotz` / `(an)statt`, with the spoken `von`-Dativ shortcut. The
dashboard's estimated-level meter was made A1-specific so finishing
an A2 unit doesn't push it past 100%. See `docs/roadmap.md`'s "A2
curriculum buildout" section for what's planned next.

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
