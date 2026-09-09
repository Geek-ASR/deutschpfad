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

## Phase 4 — Stories, history, geography — done

- `js/story-reader.js`: click-to-look-up vocabulary via a shared
  popover (meaning, plural, pronunciation, a ⭐ save toggle), generic
  across any story. First story: `stories/a1-der-erste-tag.html`, an
  original A1 story for the international-student audience, with a
  35-word glossary and a 5-question comprehension quiz. Saving a word
  and quiz results both persist via `js/progress-store.js`, in
  separate `stories`/`savedWords` buckets (see `docs/local-storage.md`).
- `history.html`: a 7-event timeline (Holy Roman Empire → reunification)
  in `js/timeline.js`, each event readable at two levels (simple A1 /
  detailed B1) via native `<details>` disclosure. The 1933–1945 entry
  covers the Nazi dictatorship and the Holocaust factually and briefly.
- `geography.html`: real facts, not a map — five major cities (same
  simple/detailed pattern as the timeline) and all 16 Bundesländer.
  Deliberately *not* an SVG map of Germany's borders — hand-drawing an
  accurate one without a reference source risked shipping something
  geographically wrong, which is worse than a fact-based explorer
  labeled honestly as not a map. Revisit once a verified map asset
  exists.
- `explore.html`: a hub linking Stories/History/Geography, since each
  is a single item for now — becomes a real index once there's enough
  content per section to need one.
- Not done: German-speaking-world coverage beyond Germany (Austria,
  Switzerland, etc.) — out of scope for this phase, not attempted.

## Phase 5 — Scenarios, listening, pronunciation — done

- `js/scenario.js`: a branching-dialogue engine (chat transcript +
  choices; wrong choices give feedback and retry, never a dead end).
  First scenario: `scenarios/bahnhof.html` (buying a train ticket),
  ending in a comprehension quiz like the lesson/story pattern.
- Two new quiz-engine question types, `listening-choice` and
  `listening-typing` — audio-first, via the same Web Speech API used
  for pronunciation, never showing the spoken text before answering.
  `listening.html` demonstrates both with 8 questions reusing
  vocabulary from the Numbers lesson and the story.
- `pronunciation.html`: 11 sounds that trip up English speakers, each
  with an articulation tip and example words. Deliberately listen-only
  — no "record yourself and compare" feature, because doing that
  honestly would mean sending microphone audio to a cloud speech
  service, breaking this site's own no-tracking promise (see
  `js/pronunciation.js`'s docstring).
- The progress store gained a fourth and fifth content bucket
  (`scenarios`, `listening`), which was the point at which the
  near-identical `recordQuizResult`/`recordStoryQuizResult` functions
  got generalized into one core with thin named wrappers (see
  `docs/local-storage.md`).
- The dashboard's KPI row was redesigned from 6 growing tiles down to 4
  fixed headline numbers (streak, quiz average, words in review,
  activities completed) plus a compact per-type breakdown line — 6+
  tiles stopped being "a handful of headline numbers."
- Not done: a second scenario, more listening sets, and the "German for
  International Students" module as its own distinct section — the one
  scenario shipped already targets that audience (buying a ticket),
  but a dedicated module (university admin, apartment-hunting, doctor's
  appointments) is still future work.

## Phase 6 — Polish — done

Audited and fixed, rather than rebuilt — this phase found and closed
real gaps across the site built in Phases 1–5:

- **Accessibility**: an automated heading-outline audit across all 13
  pages found the footer's sr-only "Site"/"Project" headings skipping
  straight from h1 to h3 on four pages with no h2 in between, and
  explore.html's card headings doing the same — both fixed (promoted
  to h2, with a shared `.card h2, h3` rule so visual size stays
  consistent regardless of which level is semantically correct).
  Keyboard-only navigation walked end to end (skip link, the number
  builder, a full listening question, a scenario choice) — six of
  seven checks passed directly; the seventh flagged a known Puppeteer
  limitation simulating native `<select>` dropdowns in headless mode,
  confirmed harmless by re-testing with Puppeteer's dedicated
  `page.select()` API.
- **No-JS resilience**: testing every page with JavaScript disabled
  found that lessons, stories, scenarios, history, geography,
  listening, pronunciation, and the dashboard all went silently blank
  — contradicting `docs/architecture.md`'s stated goal. Added an honest
  `<noscript>` message to each rather than attempting full no-JS
  content (which would mean duplicating every page's content outside
  its JSON data — out of proportion to the actual risk for this site).
- **A real cross-page CSS bug**: a page-weight audit that involved
  checking what each page's stylesheets actually cover turned up
  `.speak-btn` (used by five independent engines) styled only in
  `lesson.css` — so `history.html` and `geography.html`, which don't
  load that file, were rendering tiny unstyled native buttons instead
  of the round icon button used everywhere else. Moved to
  `components.css`, which every page loads; verified the fix on both
  previously-broken pages and confirmed no regression elsewhere.
- **SEO**: seven content pages (history, geography, listening,
  pronunciation, the lesson, the story, the scenario) had a title, meta
  description, and canonical link but no Open Graph tags — sharing any
  of those links would have shown a blank preview card. Fixed.
- **Performance**: measured actual page weight — the heaviest page
  (the Numbers lesson) is ~93 KB total across 17 requests, with zero
  external requests (no CDN, no web fonts, no third-party scripts).
  No build step or minification needed at this size; revisit only if a
  future phase adds real media assets.
- **Contrast**: a final comprehensive sweep covered every color pairing
  introduced since the Phase 1/3 fixes, including one genuinely
  easy-to-miss case — text at `opacity: 0.75` in the scenario chat
  bubbles — computed against its actual blended-with-background color,
  not the nominal token. All pass AA.

See `docs/deployment.md` for the pre-launch checklist (already
up to date — it's been maintained phase by phase, not written at the
end).

## A1 curriculum buildout (ongoing)

All six phases above were about building the *engine*. This tracks
populating it — the actual work now that there's somewhere to put
content. Twelve units, per the original curriculum brief:

| # | Unit | Status |
|---|---|---|
| 1 | Greetings | done — `lessons/a1-greetings.html` |
| 2 | Introducing yourself | done — `lessons/a1-introductions.html` |
| 3 | Numbers | done — `lessons/a1-numbers.html` (built first, as the engine's reference lesson) |
| 4 | Family | done — `lessons/a1-family.html` |
| 5 | Colors | done — `lessons/a1-colors.html` |
| 6 | Days / months / seasons | done — `lessons/a1-calendar.html` |
| 7 | Time | done — `lessons/a1-time.html` |
| 8 | Food | done — `lessons/a1-food.html` |
| 9 | Drinks | done — `lessons/a1-drinks.html` |
| 10 | Home | done — `lessons/a1-home.html` |
| 11 | Animals | not started |
| 12 | Daily life | not started |

Each unit gets: content data (`data/vocabulary/`, `data/lessons/`,
`data/quizzes/`), a lesson page reusing the existing engines
(`js/lesson-loop.js`, `js/vocab-card.js`, `js/quiz-engine.js`,
`js/picker-widget.js`), any unit-specific interactive widget the topic
calls for, and navigation/dashboard wiring.
`dashboard-page.js`'s `TOTAL_PLANNED_A1_UNITS` constant (currently 12)
and `CONTENT_TITLES` map need a one-line update per new lesson.

Two engine pieces got promoted from lesson-specific to shared once a
third lesson actually needed them (see `docs/lesson-engine.md`'s note on
genericity for the reasoning both times):

- `js/picker-widget.js`'s `initPicker()` — "click a button, reveal a
  result" — first built inline for Greetings' three pickers, extracted
  once Introductions' verb picker needed the identical shape.
- `.word-breakdown`/`.word-breakdown-part` CSS (`css/lesson.css`) —
  "decompose a word into color-coded parts" — first built for Numbers'
  compound-number builder as `.number-breakdown`, renamed generic and
  extended with `stem`/`ending` color variants once Introductions'
  verb-conjugation widget needed the same visual pattern.

Family (Unit 4) needed neither extension — its two pickers (family
member, family size) fit `initPicker()`'s existing "click a button,
reveal a result" shape exactly, and its grammar concept (mein/meine
possessive agreement) is taught through picker content and prose, not
a new widget.

Colors (Unit 5) reused `initPicker()` unchanged too (a color picker, a
favorite-color picker), and added exactly one small new piece:
`.color-swatch` in `css/lesson.css`, a literal colored square shown
beside each color word. This one is deliberately *not* generalized
into the picker widget itself — the swatch is specific to this one
lesson's content (an actual color to display), not a shape other
lessons are expected to share, so it stays a small page-adjacent style
rather than growing the shared engine.

Days/Months/Seasons (Unit 6) also reused `initPicker()` unchanged (a
day picker, a season picker) and needed no new CSS at all — the
biggest content unit so far (23 vocabulary items across three
categories), shipped with zero engine growth. Its content-side lesson
is the two reliable shortcuts (always `der`; `am` for days, `im` for
months and seasons) rather than 23 independent facts, which is what
kept a large vocabulary set from needing a bigger interface.

Time (Unit 7) reused `initPicker()` unchanged again, and added one
small new content-specific piece in the same spirit as `.color-swatch`:
a `.clock-face` in `css/lesson.css` — a dial with hour/minute hands
whose rotation angles are computed from the picked time
(`lesson-time-page.js`'s `makeClockFace()`) rather than hardcoded per
option, so the visualization can't drift out of sync with the text next
to it. Also not generalized into the picker widget — a clock is this
lesson's content, not a shape other lessons need.

Food (Unit 8) reused `initPicker()` unchanged too (a food picker, a
favorite-food picker) and needed zero new CSS — the fifth unit in a row
where `initPicker()` itself needed no changes (Colors and Time each
added one small content-specific CSS piece alongside it, but the picker
function itself hasn't changed since Introductions triggered its
extraction). Food's grammar hook (gern/lieber/am liebsten) is taught
entirely through picker content and prose, same pattern as Family's
mein/meine.

Drinks (Unit 9) reused `initPicker()` unchanged again — a sixth unit
running on the same picker code. Its picker options bake in a
per-item field (`accArticle`) for the ein/eine/einen accusative
preview rather than computing it from gender at render time, following
the same "hardcode content, don't add engine logic for one lesson's
pattern" approach as every prior unit's picker options.

Home (Unit 10) is the seventh unit running on `initPicker()` unchanged,
and is also the first unit to explicitly connect two previously-taught
patterns rather than introduce an isolated new one: it names the
Calendar unit's am/im as dative case (not just fixed vocabulary),
gives that case a feminine form (in der) to contrast against, and
recaps the Drinks unit's accusative preview alongside it — deliberately
building the curriculum's grammar arc instead of treating each unit as
independent.

## Explicitly out of scope (by design)

- Any backend, database, authentication, or paid/AI API.
- Requiring an account to use or save progress.
