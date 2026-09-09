# Lesson engine

## What exists today

`js/lesson-loop.js` is the generic part: given a container holding
`[data-step]` sections, it builds an accessible ARIA-tabs stepper (click
or arrow-key navigable) plus Back/Next buttons, and shows one step at a
time. It knows nothing about lesson content — a page supplies the step
markup and mount points; `lesson-loop.js` only handles moving between
them.

`js/lesson-numbers-page.js`, `js/lesson-greetings-page.js`,
`js/lesson-introductions-page.js`, `js/lesson-family-page.js`,
`js/lesson-colors-page.js`, `js/lesson-calendar-page.js`,
`js/lesson-time-page.js`, `js/lesson-food-page.js`,
`js/lesson-drinks-page.js`, and `js/lesson-home-page.js` are each
lesson's page-specific glue: fetch that lesson's vocabulary/quiz JSON,
render vocab grids and quizzes into mount points already present in the
matching `lessons/<id>.html`, and wire up whatever bespoke widget the
topic needs (Numbers: a compound-number builder and a free-form
number-to-German converter, built on `js/number-words-de.js`.
Greetings: a time-of-day picker, a formality picker, and a "how are
you" responder. Introductions: a verb stem/ending picker and a
personalized "build your introduction" text-input widget. Family: a
family-member picker showing article + possessive, and a family-size
picker. Colors: a color picker with a literal color swatch, and a
favorite-color picker. Days/Months/Seasons: a day-of-week picker and a
season picker, both showing the fused am/im preposition. Time: a clock
picker with a live-rendered analog clock face, and a study-time-of-day
picker. Food: a food picker demonstrating gern, and a favorite-food
picker demonstrating am liebsten. Drinks: a drink-ordering picker
showing the ein/eine/einen pattern, and a favorite-drink picker. Home:
a room picker showing im/in der/auf dem, and a favorite-relaxing-spot
picker).

## Note on genericity

Three lessons in, two things that started page-specific got promoted to
shared once the *third* lesson actually needed them — not before (rule
of three, followed through rather than just stated). Family, Colors,
Days/Months/Seasons, Time, Food, Drinks, and Home then all shipped
using `initPicker()` exactly as it already stood, with no further
extension needed:

- **`js/picker-widget.js`'s `initPicker()`** — "click a button, reveal a
  result." Built inline inside `lesson-greetings-page.js` for its three
  pickers; extracted to its own module once Introductions' verb picker
  needed the identical shape, then re-imported by the Greetings page
  too (its three pickers are now thinner as a result — see the git
  history for that diff if you want to see how little changed).
- **`.word-breakdown`/`.word-breakdown-part` CSS** — "decompose a word
  into color-coded parts." Started as `.number-breakdown` for Numbers'
  compound-number builder; renamed generic and extended with
  `stem`/`ending` color variants (alongside the existing
  `ones`/`tens`/`teens`/`hundreds`/`connector`) once Introductions'
  verb-conjugation widget needed the same visual pattern for a
  completely different kind of word decomposition.
- **Fully shared from the start, used identically by all three**: the
  stepper (`lesson-loop.js`), quiz engine (`quiz-engine.js`), vocabulary
  card renderer (`vocab-card.js`), and speech helper (`speak.js`).
- **Still fully page-specific, no shared pattern visible yet**: the
  content itself, obviously, and the "build your introduction" text-input
  widget — the only widget so far that takes free-text input rather
  than a fixed set of buttons or two `<select>`s, so it doesn't (yet)
  share a shape with anything else.

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
and it's each lesson page's job to decide what to do with that. All
ten lessons pass it straight to `recordQuizResult()`
(`js/progress-store.js`, see `docs/local-storage.md`), which is the
actual persistence layer. That separation — quiz engine reports, page
decides, store persists — is why adding each new lesson's persistence
has stayed a one-line call (`recordQuizResult(LESSON_ID, result)`)
rather than new plumbing every time.
