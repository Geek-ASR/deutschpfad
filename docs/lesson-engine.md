# Lesson engine

## What exists today

`js/lesson-loop.js` is the generic part: given a container holding
`[data-step]` sections, it builds an accessible ARIA-tabs stepper (click
or arrow-key navigable) plus Back/Next buttons, and shows one step at a
time. It knows nothing about lesson content — a page supplies the step
markup and mount points; `lesson-loop.js` only handles moving between
them.

`js/lesson-numbers-page.js` is the first lesson's page-specific glue: it
fetches `data/vocabulary/numbers.json` and `data/quizzes/a1-numbers-quiz.json`,
renders vocabulary grids and quizzes into mount points already present in
`lessons/a1-numbers.html`, and wires up two bespoke widgets (a number
builder and a free-form number-to-German converter) built on
`js/number-words-de.js`.

## Note on genericity

This is deliberately *not* a fully generic "interpret arbitrary lesson
JSON and render any lesson" engine yet. Only one lesson exists, so
abstracting a content-description format now would be guessing at
requirements a second lesson hasn't stated. The reusable pieces that
clearly do generalize — the stepper (`lesson-loop.js`), quiz engine
(`quiz-engine.js`), vocabulary card renderer (`vocab-card.js`), and
speech helper (`speak.js`) — are already factored out and used exactly
this way. The parts that are still page-specific (the numbers widgets)
should move into a shared engine once a second and third lesson need the
same shape — not before (rule of three).

## Where per-lesson content lives

- `data/lessons/<id>.json` — metadata: objective, CEFR, references to
  its vocabulary and quiz data files.
- `data/vocabulary/<topic>.json` — vocabulary items, per
  `docs/content-model.md`.
- `data/quizzes/<id>-quiz.json` — question sets, grouped by the step
  they belong to (`practice`, `retrieve`, `quiz`).
- `lessons/<id>.html` + a matching `js/lesson-<id>-page.js` — the page
  itself and its glue script.

## Scoring and persistence

Nothing in this phase writes to `localStorage`. The quiz engine's
`onFinish` callback receives a `{ correct, total, mode }` result and a
lesson page can do whatever it wants with that — today, `lessons/a1-numbers.html`
just displays a message. Reading and persisting that result is Phase 3's
job (see `docs/roadmap.md`), and is intentionally not built here so the
two concerns stay separable.
