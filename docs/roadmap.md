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

## A1 curriculum buildout — done

All six phases above were about building the *engine*. This tracked
populating it — and as of Unit 12, all twelve units from the original
curriculum brief are live:

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
| 11 | Animals | done — `lessons/a1-animals.html` |
| 12 | Daily life | done — `lessons/a1-daily-life.html` |

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

Animals (Unit 11) reuses `.word-breakdown` (`css/lesson.css`) for a
third topic — a plural's stem and suffix, after compound numbers and
verb stems/endings — with zero CSS changes, confirming it's genuinely
generic rather than accidentally reusable twice. Caught one real bug
before shipping: the picker options were missing the `label` field
`initPicker()` reads for button text, so every button rendered blank —
found by screenshotting the widget rather than trusting a programmatic
text-content check, which would have passed anyway since the word
existed under a *different* field name. Fixed same-session
(`f296256`).

Daily Life (Unit 12) closes the A1 buildout with the curriculum's
biggest new grammar topic — separable verbs, where a conjugated verb's
prefix detaches and jumps to the end of the main clause
(`aufstehen` → `Ich stehe ... auf`) — and its own real exception
(`frühstücken` looks separable but isn't). It reuses `.word-breakdown`
for a fourth topic, this time putting the existing `connector`
data-type (first built for compound numbers' "und") to a new use: the
"..." showing the prefix travels across whatever sits between it and
the verb. Zero engine or CSS changes, same as most of the units before
it, and deliberately cross-references vocabulary from nine of the
eleven earlier units as a closing synthesis rather than introducing
an isolated final topic.

**What the twelve-unit buildout actually demonstrated**: the engine
built in Phases 1–6 needed exactly two extractions total
(`picker-widget.js`, `.word-breakdown`), both triggered by a real third
use rather than anticipated — and from Unit 4 onward, every single unit
shipped using existing engine code unchanged, adding at most one small
page-specific CSS class (`.color-swatch`, `.clock-face`) when a
lesson's content was genuinely visual and content-specific. That's the
practical payoff of "build the engine first, then populate it": the
tenth, eleventh, and twelfth units took the same shape of effort as the
fourth, not more.

## A1 exam-readiness expansion (in progress)

The twelve-unit buildout above covered the *topics* in the original
curriculum brief, but not enough *volume* to actually pass a real A1
exam. The Goethe-Institut's official "Start Deutsch 1" word list runs
to roughly 600–650 words; the twelve topic units together cover
somewhere around 200. Real A1 exams (Goethe, telc) also test grammar
the topic units never touched: modal verbs, the Perfekt (past) tense,
personal pronoun cases, full possessive-article paradigm beyond
mein/meine, negation, and the full set of question words. Vocabulary
breadth and grammar completeness are two different gaps, and closing
only one wouldn't be enough.

The plan, in order:

1. **Four missing-grammar units** — Questions & Negation, Pronouns &
   Cases, Modal Verbs, and Perfekt (Past Tense) — each using the exact
   same lesson-loop/picker/quiz-engine pattern as the twelve topic
   units, just aimed at a grammar mechanism instead of a vocabulary
   domain.
2. **A vocabulary-expansion pass** across all twelve topic units'
   `data/vocabulary/*.json` files, growing each toward its share of
   the real Goethe A1 word list, plus matching growth in each quiz's
   question bank. Pure content work — `vocab-card.js`,
   `renderVocabGrid()`, and the quiz engine already handle arbitrary
   list lengths with no code changes.
3. **A vocabulary-bank / flashcard page** pulling from every
   `data/vocabulary/*.json` file combined, so a learner can drill the
   full word list directly rather than only through individual lesson
   flows, using the existing Leitner scheduler in
   `js/progress-store.js`.
4. **A mock-exam mode** — a timed practice test following the real
   Goethe/telc A1 format (Hören, Lesen, Schreiben sections), built on
   the existing quiz-engine and listening infrastructure. This is the
   most direct lever for "can actually pass the exam," as opposed to
   "knows the vocabulary."

`js/dashboard-page.js`'s `TOTAL_PLANNED_A1_UNITS` was bumped from 12 to
16 to account for the four grammar units, with the level-label
thresholds rescaled to match (so "A1 complete" isn't declared three
units early).

**Unit 13 — Questions & Negation** is done
(`lessons/a1-questions-negation.html`): the three German sentence word
orders (statement: verb-second; yes/no question: verb-first;
W-question: W-word + verb-second), and the nicht/kein negation choice,
with kein explicitly tied back to the einen/eine/ein pattern from the
Drinks unit since it declines the same way. Also covers doch, the
particle for contradicting a negative question. Its quiz bank (32
questions total) is roughly double a typical topic unit's, as the
first concrete step toward exam-realistic depth — and it's a preview
of what step 2 above will do to the twelve existing units' quiz banks
too.

**Unit 14 — Pronouns & Cases** is done
(`lessons/a1-pronouns-cases.html`): the full personal-pronoun paradigm
(nominative/accusative/dative across all eight persons) and the full
possessive-article set (mein/dein/sein/ihr/unser/euer/Ihr), with the
possessives explicitly reusing the ein/kein declension pattern already
taught twice rather than presenting it as new mechanics. Flags two
real quirks: `es` and `er` share the same dative form (`ihm`), and
`ihr` (her/their) differs from `Ihr` (formal "your") only by
capitalization — same spoken word, different written word. Same
32-question depth as Unit 13, and three pickers again for the same
reason (two related mechanisms bundled into one unit).

**Unit 15 — Modal Verbs** is done (`lessons/a1-modal-verbs.html`):
können/müssen/wollen/dürfen/sollen/mögen plus möchten (already used in
the Drinks unit, now given its full paradigm) — sharing one irregular
pattern (identical ich/er forms, no ending) and reusing Daily Life's
"verb bracket" word order, just with a full infinitive at the end
instead of a separable prefix. Flags two real exceptions: sollen is
the only one that doesn't change its stem vowel, and mögen usually
stands alone with a noun rather than pairing with a second infinitive
(that pairing is what möchten is for). The picker puts
`.word-breakdown-part` chips to a new use here — highlighting two
separate words within a full sentence to show the bracket, rather than
decomposing one word into parts — still zero new CSS. Same
32-question depth as Units 13–14.

**Unit 16 — Perfekt (Past Tense)** is done (`lessons/a1-perfekt.html`),
completing the four-unit grammar phase. It's the third and last
"verb bracket" unit — a conjugated `haben`/`sein` in the normal spot,
a past participle at the end — after Daily Life's separable prefixes
and Modal Verbs' paired infinitives. Covers the haben/sein auxiliary
choice (rough test: if you can ask "wohin?" about the verb, it's
sein) and all four participle-formation patterns: regular
(ge-...-t), irregular (ge-...-en, vowel changes memorized per verb,
same as English "eat → eaten"), -ieren verbs (no ge- at all), and
separable verbs (ge- inserted between the prefix and the stem — e.g.
aufstehen → aufgestanden). Reuses Modal Verbs' inline
sentence-highlighting technique for a second lesson. Same 32-question
depth as Units 13–15.

**Grammar phase done. Vocabulary-expansion pass done** — all twelve
A1 topic units now have roughly double their original vocabulary and
quiz depth (full unit-by-unit breakdown below). Remaining in the A1
exam-readiness expansion: the vocabulary bank and the mock-exam mode.

### Vocabulary-expansion pass (done)

Growing each topic unit's vocabulary and quiz bank without touching
its original teaching narrative — new items get their own "more
words" grid alongside the original curated one, so the lesson a
learner first worked through hasn't changed shape, just grown a
reference section next to it. No engine changes needed for this
either; `vocab-card.js`'s grid and the quiz engine already handle any
list length.

| # | Unit | Status |
|---|---|---|
| 1 | Greetings | done — 15 → 35 vocab, 17 → 32 quiz |
| 2 | Introducing yourself | done — 16 → 35 vocab, 17 → 32 quiz |
| 3 | Numbers | done — added ordinal numbers (a real engine extension, `ordinalToGerman()` in `js/number-words-de.js`, not just more data — cardinals are deliberately already complete per `docs/content-model.md`), 17 → 32 quiz |
| 4 | Family | done — 16 → 35 vocab, 17 → 32 quiz |
| 5 | Colors | done — 12 → 25 vocab, 17 → 32 quiz |
| 6 | Days/months/seasons | done — 23 → 42 vocab (fixed categories, so the addition is adjacent time vocabulary — heute/morgen/Woche/Geburtstag/Weihnachten — not more days/months/seasons), 17 → 32 quiz |
| 7 | Time | done — 17 → 37 vocab (added Termin/pünktlich/Feierabend/Wecker/Öffnungszeiten and the core frequency adverbs immer/nie/oft/manchmal), 17 → 32 quiz |
| 8 | Food | done — 19 → 39 vocab (added the three daily meals, condiments, common produce, and hungrig/satt/lecker/vegetarisch; also fixed two dangling references — Frühstück and Schokolade were already used in examples/quiz text but never had their own entries), 17 → 32 quiz |
| 9 | Drinks | done — 17 → 37 vocab (added the core verb trinken, containers Glas/Tasse/Flasche, and the restaurant-ordering set Kellner/Speisekarte/bestellen/bezahlen/Rechnung/Trinkgeld), 17 → 32 quiz |
| 10 | Home | done — 18 → 38 vocab (added structural parts Tür/Wand/Boden, major appliances Kühlschrank/Herd/Waschmaschine, renting vocabulary Miete/Vermieter/Nachbar, and the core verb wohnen; also fixed two dangling references — klein and gemütlich were already used in the Wohnung example but never had their own entries), 17 → 32 quiz |
| 11 | Animals | done — 18 → 38 vocab (the original 18 are deliberately scoped to demonstrate each of the 7 plural-formation patterns exactly once, so the new words reinforce the same patterns with extra examples — Fuchs/Wolf mirror Kuh's add-e-umlaut, Giraffe/Ziege mirror Katze's add-n — plus farm/zoo/pet-care vocabulary), 17 → 32 quiz |
| 12 | Daily life | done — 18 → 38 vocab (more separable verbs reinforcing the split-prefix pattern — aufmachen/zumachen, anziehen/ausziehen, anfangen/aufhören — plus core daily verbs arbeiten/schlafen/lesen/spielen/lernen and the work/free-time noun set Arbeit/Freizeit/Hobby/Sport/Handy/Computer/Internet/Zeitung), 17 → 32 quiz |

Unit 3 is worth calling out specifically: it's the one unit where
"expand the vocabulary" would have been the wrong move (would
contradict the unit's own "teach the logic, not a list" design), so
the expansion took the form of covering a genuinely distinct grammar
topic (ordinal number formation) instead. `ordinalToGerman()` is
composed recursively the same way the existing `numberToGerman()` is,
and was verified against 23 hand-checked forms — including catching a
real bug in the 101–999 range before shipping (a flatter first
implementation produced "hunderteinsste" instead of the correct
"hunderterste," since only the last component under 100 actually
takes the ordinal ending).

### Vocabulary Bank (done)

`vocabulary.html` — the full A1 word list in one page, filterable by
topic and free-text search. It started as every word from the twelve
topic units and four grammar units (481 items), then got the six
exam-relevant topic areas no unit teaches — weather, clothing,
transport & directions, body & health, shopping & money, professions
(25 words each) — bringing the total to **631**, into the
Goethe-Institut's ~600–650-word A1 range. Those six live only here
(vocabulary + the bank's flashcards and Quiz Me), not as full
lessons; adding lessons for them is a possible follow-up if the
curriculum ever expands past sixteen units. Three ways to use it:

- **Flashcards** — one word at a time, front/back reveal, with a
  direction toggle (German-first or English-first, since a real exam
  tests both directions), audio, prev/next, and shuffle. The one
  genuinely new piece of UI this phase needed.
- **Browse list** — the filtered set as a static grid, reusing
  `vocab-card.js`'s `renderVocabGrid` completely unchanged: the exact
  same grid every lesson page already renders.
- **Quiz me** — generates a typing quiz (up to 20 questions) from
  whatever's currently filtered, using `quiz-engine.js`'s `runQuiz`
  unmodified. Results are scored and scheduled into the same
  spaced-review queue lesson quizzes feed: `progress-store.js` got one
  new bucket (`vocabPractice`) and a thin `recordVocabPracticeResult`
  wrapper, parallel to the four existing `record*Result` functions —
  so a word quizzed here shows up on the dashboard's due-for-review
  queue exactly like one quizzed in a lesson, without inflating the
  lessons-completed count the A1-progress meter is built on.

Also added a "Vocabulary" link to the site-wide nav (header and
footer) across all 27 pages plus `404.html`.

### A1 Mock Exams (done)

`mock-exam.html` — full, timed practice sittings in the real
Goethe/telc "Start Deutsch 1" format (Hören, Lesen, Schreiben,
Sprechen), built entirely from vocabulary and grammar the A1 units and
the vocabulary bank already cover, so they're actually attemptable by
a learner who's worked through the material rather than generic tests
pulled from nowhere. **Two exams** so far, picked from a dropdown on
the intro screen (`EXAMS` list in `js/mock-exam-page.js` + one JSON
file each); exam 2 leans on the six vocabulary-bank topics (weather,
clothing, transport, health, shopping, professions) so it isn't a
rerun of the same material. Each is tracked separately in the `exams`
bucket, so the dashboard shows attempts and best scores per exam.

A new engine, `js/exam-engine.js`, runs the three auto-gradable
sections (Hören 10 questions, Lesen 10 questions, Schreiben Teil 1's
5-field form-fill). It's deliberately not `runQuiz` reused — a lesson
quiz's whole design is instant feedback, and an exam's whole point is
the opposite: no right/wrong shown until a section ends, plus a
visible (advisory, non-punitive) countdown, because that's what
actually simulates exam pacing. What it does share with `runQuiz` is
all the actual question rendering and scoring — `js/quiz-engine.js`
now also exports `renderQuestion`/`evaluate`/`correctAnswerLabel`
(previously internal), so every existing question type works in the
exam with zero duplicated rendering code. See `docs/quiz-engine.md`'s
"Reuse beyond runQuiz" section.

Missed/answered questions schedule into the same spaced-review queue
lesson quizzes and the vocabulary bank feed
(`js/progress-store.js` gained an `exams` bucket and
`recordMockExamResult`, the same pattern as `vocabPractice` — kept out
of `lessons` so a completed exam doesn't inflate the A1-progress
meter, but now counted in the dashboard's "activities completed" tile
and breakdown line).

Schreiben Teil 2 (write a short message) and Sprechen (speaking) have
no honest way to be auto-graded without a backend or a human — no
fake AI scoring — so both render as self-check practice instead: a
textarea plus a reveal-able model answer for Schreiben, and the three
real Sprechen prompt formats (with links to the Pronunciation Lab and
the "Am Bahnhof" scenario) for speaking practice out loud.

Linked from `explore.html` (a new card) and the bottom of `levels.html`'s
A1 unit list (a capstone callout) rather than the global nav — a
milestone check taken occasionally, not a daily-use tool like
Dashboard or Vocabulary.

**This completes the A1 exam-readiness expansion** — all four parts
(grammar units, vocabulary-expansion pass, vocabulary bank, mock
exam) are now live.

## A2 curriculum buildout — in progress

A2 ("Waystage") builds on the completed A1 base. The lesson, quiz,
vocab-card, and picker engines are already proven — an A2 unit is
pure content in the same shapes (`data/vocabulary/a2-*.json` +
`data/quizzes/a2-*-quiz.json` + `lessons/a2-*.html` +
`js/lesson-*-page.js` + a `levels.html` link), so no engine work is
expected here.

The dashboard's estimated-level meter was made A1-specific for this
phase — `getStats()` gained `a1UnitsCompleted` (lesson ids starting
`a1-unit-`), which the meter and `levelLabel()` now use instead of the
all-lessons `lessonsCompleted`, so finishing an A2 unit no longer
pushes the "N of 16 planned A1 units" meter past 100%. A proper
per-level meter is a later concern, once A2 has more than a unit or
two.

**Unit 1 — Präteritum (Simple Past)** — done. The canonical A2
opener, directly continuing A1's Perfekt unit: the written past tense,
plus the spoken Präteritum for `sein`/`haben`/modals (`war`, `hatte`,
`konnte`, `musste`), the weak `-te` vs. strong vowel-change split,
`es gab`, and the `als` clause. Reuses the Modal Verbs / Perfekt
inline word-highlight technique (one chip on the Präteritum verb in a
sentence). 13 vocab items, 32-question quiz — same depth as the A1
grammar units.

**Unit 2 — Comparatives & Superlatives** — done. Adjective + `-er`
+ `als`, `am …-sten`, the short-adjective umlaut
(`alt → älter`, `groß → größer`), the `-esten` superlative after
`-t`/`-d`, the three irregulars (`gut → besser`, `viel → mehr`,
`gern → lieber` — the last one an explicit callback to A1 Food's
comparison ladder), and `so … wie` for "as … as". Same
base → comparative → superlative picker + word-highlight technique,
13 vocab items, 32-question quiz.

**Unit 3 — Two-Way Prepositions (Wo? / Wohin?)** — done. The nine
`in/an/auf/über/unter/vor/hinter/neben/zwischen`, and the one rule
that picks the case: location (answers `wo?`) → Dativ, movement
toward (answers `wohin?`) → Akkusativ; plus the position/motion verb
pairs (`liegen`/`legen`, `stehen`/`stellen`) and the fused forms
`im`/`ins`/`am`/`ans`. Builds on A1's Pronouns & Cases. The picker
shows each preposition twice — Dativ line and Akkusativ line, each
with the case-marked article chipped. 13 vocab items, 32-question
quiz.

**Unit 4 — Subordinate Clauses (weil, dass, wenn)** — done. The
verb-to-the-end word order after `weil`/`dass`/`wenn`/`ob`/`obwohl`,
the comma, the "kissing verbs" when the subordinate clause comes
first, the `denn` trap (coordinating — no movement) and the `deshalb`
trap (adverb — verb second), and `wenn` vs. `als` (callback to A2
Unit 1). Picker shows each conjunction's sentence with the moved
verb chipped and a word-order note. 13 vocab items (5 subordinators
+ the two traps + 6 reporting/clause verbs), 32-question quiz.

**Unit 5 — Reflexive Verbs** — done. The `mich/dich/sich/uns/euch/sich`
pronoun set, the accusative default vs. the dative when there's also
a direct object (`Ich wasche mir die Hände`, `sich die Zähne
putzen`), truly-reflexive verbs (`sich freuen`, `sich beeilen`,
`sich erinnern`), and pronoun word order (right after the verb).
Picker shows each verb's sentence with the reflexive pronoun chipped
and a case note; a "how do you feel today?" apply picker. 13 vocab
items, 32-question quiz.

**Unit 6 — Dative-only Prepositions (mit, nach, zu, von, bei, seit,
aus, gegenüber)** — done. The counterpart to Unit 3: this set takes
the Dativ every time, with no `wo?`/`wohin?` choice. Covers the
obligatory fused forms `zum`/`zur`/`vom`/`beim`, `nach` vs. `zu` for
"to" (cities/countries with no article and `nach Hause` vs. people
and headed-for places and `zu Hause`), `aus` (origin, material) vs.
`von` (from a person or point), and `seit` + present tense for an
action still going on. Picker shows each preposition's sentence with
the Dativ phrase it governs chipped, a usage note, and the fused
form; a "how do you get to work?" apply picker built on `mit` +
Dativ. 13 vocab items (8 prepositions + 5 fused-form / fixed
phrases), 32-question quiz.

Planned next A2 units (topic + grammar focus, subject to change):
travel & holidays (the perfect for trips, `fahren`/`fliegen` +
destinations), and city life & getting around (asking for and giving
directions, ordinal-numbered floors, opening hours). A2 vocabulary
depth target is roughly the telc/Goethe A2 list (~1300 words total,
so ~650 beyond A1's 631).

## Explicitly out of scope (by design)

- Any backend, database, authentication, or paid/AI API.
- Requiring an account to use or save progress.
