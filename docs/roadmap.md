# Roadmap

Tracked in phases, per `docs/architecture.md`'s "no giant operations"
principle. Each phase should be usable and honest on its own — no phase
ships pages that look finished but don't work.

## Phase 1 — Foundation — done

- Project structure, `.gitignore`, MIT license, content license, README.
- Design system: color/type/spacing tokens, base reset, layout, and
  component styles (no CSS framework).
- Homepage, CEFR levels overview, about/privacy page, 404 page.
- Accessible responsive nav, SEO basics (meta, OG tags, sitemap, robots).

## Phase 2 — Curriculum engine — in progress

- Done: content schema implemented for vocabulary, lessons, and quizzes
  (`/data/vocabulary/numbers.json`, `/data/lessons/`, `/data/quizzes/`),
  per `docs/content-model.md`.
- Done: quiz engine (`js/quiz-engine.js`) — multiple-choice, typing, and
  fill-blank question types, practice and scored quiz modes, forgiving
  ASCII-umlaut answer matching for learners without a German keyboard.
- Done: vocabulary card renderer (`js/vocab-card.js`) and a free,
  zero-cost pronunciation button (`js/speak.js`, via the browser's
  built-in Web Speech API — no audio files, no API key).
- Done: lesson step-navigation UI (`js/lesson-loop.js`, an accessible
  ARIA-tabs stepper) and the A1 Unit 3: Numbers lesson
  (`lessons/a1-numbers.html`) as the reference implementation — including
  an interactive number-builder widget and a free-form number-to-German
  converter, both built on `js/number-words-de.js`, which *generates*
  German numbers from the same rule a learner is taught rather than
  storing a list. See `docs/lesson-engine.md` and `docs/quiz-engine.md`.
- Still to do: the rest of the A1 units (greetings, introductions,
  family, colors, etc.) — each is expected to need some page-specific
  glue like Numbers did, until enough of them exist to extract a more
  generic content-driven lesson renderer (see "Note on genericity" in
  `docs/lesson-engine.md`).

## Phase 3 — Local progress — done

- `js/progress-store.js`: single-key `localStorage` store (lessons,
  streak, quiz history, review schedule) — no server, ever. See
  `docs/local-storage.md` for the schema.
- Five-box spaced-review scheduler (1/3/7/14/30-day intervals),
  populated only from scored quiz results (not practice/retrieve), with
  a real "Review now" session on the dashboard that feeds due items back
  through the quiz engine and reschedules them from the result.
- `dashboard.html`: lessons completed, streak, quiz average, an
  estimated-level meter, a review-stage breakdown, and recent quiz
  history — all computed from real local data, with an honest empty
  state rather than a populated-looking placeholder.
- Export (file download) and import (with a confirm step, since it's
  destructive) — round-trip tested. A "reset all progress" control too.
- The Numbers lesson and every honesty-note across the site (`about.html`,
  `levels.html`) updated from future tense ("will include...") to present
  tense now that this is real, not upcoming.
- Not done: a skills-by-category breakdown (Reading/Listening/Speaking/
  etc.) — deliberately omitted rather than faked, since only one lesson
  exists and most categories have no exercises yet to measure. Revisit
  once enough lesson variety exists to make it a real measurement.

## Phase 4 — Stories, history, geography

- Interactive story reader with click-to-look-up vocabulary.
- German history timeline with level-appropriate text per event.
- Interactive Germany map.

## Phase 5 — Scenarios, listening, pronunciation

- Real-life scenario simulations (train station, university, etc.).
- International-student German module.
- Listening exercises and a pronunciation lab (no external speech API).

## Phase 6 — Polish

- Full accessibility pass, performance pass, error handling, SEO pass.
- Production deployment checklist (see `docs/deployment.md`).

## Explicitly out of scope (by design)

- Any backend, database, authentication, or paid/AI API.
- Requiring an account to use or save progress.
