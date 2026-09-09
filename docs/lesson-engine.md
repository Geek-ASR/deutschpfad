# Lesson engine

## What exists today

`js/lesson-loop.js` is the generic part: given a container holding
`[data-step]` sections, it builds an accessible ARIA-tabs stepper (click
or arrow-key navigable) plus Back/Next buttons, and shows one step at a
time. It knows nothing about lesson content — a page supplies the step
markup and mount points; `lesson-loop.js` only handles moving between
them.

`js/lesson-numbers-page.js` and `js/lesson-greetings-page.js` are each
lesson's page-specific glue: fetch that lesson's vocabulary/quiz JSON,
render vocab grids and quizzes into mount points already present in the
matching `lessons/<id>.html`, and wire up whatever bespoke widget the
topic needs (Numbers: a compound-number builder and a free-form
number-to-German converter, built on `js/number-words-de.js`. Greetings:
a time-of-day picker, a formality picker, and a "how are you"
responder).

## Note on genericity

Two lessons in, here's what actually turned out to generalize versus
stay page-specific — real signal now, not a guess:

- **Fully shared, used identically by both**: the stepper
  (`lesson-loop.js`), quiz engine (`quiz-engine.js`), vocabulary card
  renderer (`vocab-card.js`), and speech helper (`speak.js`). This part
  of the original bet paid off.
- **A pattern that emerged, but stayed local**: both lessons' bespoke
  widgets turned out to share a shape — "pick a button, reveal a
  result" — which `lesson-greetings-page.js` factored into a small
  `initPicker()` helper *within that file*, plus a generic
  `.picker-widget`/`.picker-btn`/`.picker-result` CSS pattern in
  `lesson.css` (not greetings-specific, already named generically).
  It's *not* yet promoted to a shared JS module, because the Numbers
  widgets aren't quite the same shape — the builder computes a result
  from a formula (two `<select>`s → `numberToGerman()`), not a lookup
  from a fixed list. Extracting `initPicker()` into its own module is
  the obvious move once a *third* lesson needs plain button→lookup
  pickers — not before (rule of three still holds, just closer now).
- **Still fully page-specific, no shared pattern visible yet**: the
  content itself, obviously, and each lesson's particular mix of
  widgets in its Pattern/Apply steps.

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

The quiz engine itself still doesn't touch `localStorage` — its
`onFinish` callback just reports `{ correct, total, mode, responses }`,
and it's each lesson page's job to decide what to do with that. Both
lessons pass it straight to `recordQuizResult()` (`js/progress-store.js`,
see `docs/local-storage.md`), which is the actual persistence layer.
That separation — quiz engine reports, page decides, store persists —
is why adding a second lesson's persistence was a one-line call
(`recordQuizResult(LESSON_ID, result)`) rather than new plumbing.
