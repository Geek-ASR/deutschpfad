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

**Unit 7 — Travel & Holidays (Perfekt with `sein`)** — done. The
first A2 topic unit, reactivating A1's Perfekt: verbs of movement
form the Perfekt with `sein` (`ist gefahren`, `ist geflogen`,
`ist angekommen`, `ist geblieben`) while everything else — and every
reflexive verb — keeps `haben`; separable travel verbs put the `ge-`
between prefix and stem (`abgeflogen`, `angekommen`, `umgestiegen`);
and destinations split `nach` (city / article-less country /
`nach Hause`) from `in die` (`die Schweiz`, `die Türkei`, `die USA`),
with `an die`/`auf` for coasts and islands (the Unit 3 movement =
Akkusativ rule). Picker shows each verb present-then-Perfekt with the
auxiliary named and the participle chipped; a "where did you go?"
apply picker. 13 vocab items (6 verbs + trip/holiday nouns, distinct
from the A1 transport gap-fill list), 32-question quiz.

**Unit 8 — City Life & Getting Around (the Imperative)** — done.
Directions as the vehicle for the imperative, which had no unit of
its own yet: the `Sie` form (verb first, like a yes/no question),
the `du` form (bare stem, no pronoun — `e → i/ie` kept as `Nimm`,
`Gib`; `a → ä` dropped as `Fahr`; `-t`/`-d` stems keep the `-e` as
`Warte`), and the `ihr` form; separable verbs splitting in commands
(`Biegen Sie … ab`, callback to Unit 7); the polite indirect
question (`Können Sie mir sagen, wo der Bahnhof ist?` — verb to the
end, callback to Unit 4); and ordinals for streets and floors (`die
zweite Straße`, `im ersten Stock`, callback to A1 Numbers). Picker
shows each instruction as a `Sie`-command and a `du`-command with
the verb chipped; a "someone asks you the way" apply picker. 13
vocab items (city nouns + `abbiegen` + `entlang`, distinct from the
A1 transport gap-fill list), 32-question quiz.

**Unit 9 — Health & the Body (`weh tun` + Dativ, `sollte`)** — done.
Two ways to report a symptom: `weh tun` with the person in the Dativ
and the body part as subject (`Mir tut der Kopf weh`, plural →
`Die Füße tun mir weh`), and the always-plural `-schmerzen` compounds
with `haben` (`Ich habe Kopfschmerzen`). Advice with `sollte` — the
first Konjunktiv II form, softer than `musst` — with its full
paradigm, plus `zum`/`beim Arzt` (Unit 6), `seit` + present for "how
long", and the reflexives `sich erkälten` / `sich verletzen` (dative
with a body part, Unit 5 pattern). Picker shows each symptom said
both ways plus a `sollte` line; a "you're at the doctor's" apply
picker. 13 vocab items (`sich erkälten`, `der Husten`, `die Grippe`,
`die Praxis`, `die Krankenversicherung`, `die Krankmeldung`, `das
Knie`, `die Schulter`, …), additive over the A1 body-health gap-fill
list, 32-question quiz.

**Unit 10 — The Genitiv (`wessen`, `wegen`/`während`/`trotz`)** —
done. The fourth and last case: linking two nouns with the
possessing one second (`das Ende des Films`, `das Auto meiner
Eltern`), the `des`/`der` article forms and ein-word equivalents
(`meines`/`meiner`), the `-s` vs. `-es` ending on masculine/neuter
nouns, `-en` on any adjective, and `wessen?`. The four Genitiv
prepositions `wegen` / `während` / `trotz` / `(an)statt`, with the
`trotz` (preposition) vs. `trotzdem` (adverb, verb-second) trap —
same shape as the Unit 4 `deshalb` trap. Honest note on how people
actually speak: `von` + Dativ for possession, `wegen` + Dativ
colloquially, names + `-s`. Picker shows eight phrases in the
Genitiv with the article chipped, the ending rule, and the `von`
paraphrase; a "why are you late?" apply picker. 13 vocab items (the
4 prepositions + `wessen` + `trotzdem`/`deswegen` adverbs + reason
nouns), 32-question quiz.

**Unit 11 — Work & Job-Hunting (`als` + profession, `werden`)** —
done. Two article-dropping structures: `als` + profession
(`Ich arbeite als Ingenieur`) — flagged as the third job for `als`
after "than" (Unit 2) and "when" (Unit 1) — and `werden` +
profession (`Ich möchte Lehrerin werden`), with `werden`'s irregular
`du wirst` / `er wird`. A career told in the Perfekt with `haben`
(Unit 7) — `Ich habe drei Jahre bei einer Bank gearbeitet`, `eine
Ausbildung als … gemacht`, `mein Studium abgeschlossen` — plus
`bei` + company (Unit 6) and reflexive `sich bewerben` with `um` +
Akkusativ (for a post) vs. `bei` + Dativ (to a firm), from Unit 5.
Picker shows each profession as an `als` line, a `werden` line and a
Perfekt career line with the bare job word chipped; a "tell me about
yourself" interview apply picker. 13 vocab items (`sich bewerben`,
`die Bewerbung`, `der Lebenslauf`, `das Vorstellungsgespräch`, `die
Ausbildung`, `einstellen`, `kündigen`, `selbstständig`, `werden`, …),
additive over the A1 professions gap-fill list, 32-question quiz.

**Unit 12 — Adjective Endings after `der/die/das` (weak
declension)** — done. The first of the three adjective-ending
patterns: predicate adjectives (after `sein`/`werden`) never change;
attributive ones after the definite article take only `-e` or `-en`.
`-e` in five slots (nominative singular m/f/n, accusative singular
f/n), `-en` everywhere else (masculine accusative, every dative,
every genitive from Unit 10, the whole plural), shown as a compact
four-case table. Same endings after the der-words `dieser` / `jeder`
/ `welcher` / `mancher` / `alle`, and comparatives/superlatives
decline too (Unit 2). Picker puts eight phrases in a specific case
in context with the ending chipped and the reason named; an
accusative "which one in the shop?" apply picker. 13 vocab items
(the 5 der-words + `wichtig`, `richtig`, `falsch`, `möglich`,
`nötig`, `eigen`, `verschieden`, `ganz`), 32-question quiz. The
shared chip regex was made Unicode-aware in Unit 11 (plain `\b`
breaks on umlauts) and this unit reuses that.

**Unit 13 — The Konjunktiv II (`würde`, `wäre`, `hätte`,
`könnte`)** — done. Scoped to the two A2 jobs: politeness and
wishes. The everyday builder `würde` + infinitive-at-the-end, plus
the six short forms used directly — `sein → wäre`, `haben → hätte`,
`können → könnte`, `dürfen → dürfte`, `müssen → müsste`, and the
already-familiar `möchte` (mögen) and `sollte` (sollen, Unit 9) —
with the umlaut flagged as the marker (`hatte → hätte`). Polite
requests by fronting the modal (`Könnten Sie …?`, `Dürfte ich …?`),
`Ich hätte gern …` for ordering, `an deiner Stelle würde ich …`, one
light `wenn`-sentence flagged as B1. Reuses the Unicode-aware chip
helper (Unit 11) since `wäre`/`müsste`/`bräuchte` start with an
umlaut. Picker shows each verb present-then-Konjunktiv with the
K-II form chipped; a "make it polite" apply picker. 13 vocab items
(the K-II forms + `hätte gern` / `würde gern` / `an deiner Stelle`
phrases + `der Wunsch`, `die Bitte`, `höflich`), 32-question quiz.

**Unit 14 — Adjective Endings after `ein`/`kein`/possessives (mixed
declension)** — done. Built straight onto Unit 12: same predicate /
attributive split, and after `ein`-words the endings are the weak set
from Unit 12 with exactly three exceptions — nominative masculine
(`ein alter Mann` → `-er`), nominative neuter and accusative neuter
(`ein kleines Kind` → `-es`), the three slots where `ein` itself has
no ending so the adjective fills it in. Everything else (`eine`,
`einen`, `einem`, `einer`, the whole plural) is weak `-e`/`-en`,
identical to Unit 12. `kein` and the possessives decline like `ein`;
plural after `keine`/`meine` is always `-en`; `dunkel`/`teuer` drop
the `-e-` before an ending. Compact four-case table with the three
special cells marked. Picker puts eight phrases in context with the
ending chipped and labelled "a fill-in" or "weak, like Unit 12"; a
"describe it" apply picker. 13 vocab items (`kein` + `modern`,
`bequem`, `günstig`, `hell`, `dunkel`, `ruhig`, `laut`, `sauber`,
`gemütlich`, …), 32-question quiz.

**Unit 15 — The Passive (`werden`) & the Amt** — done. The present
passive: `werden` conjugated + past participle at the end
(`Das Formular wird ausgefüllt`), the doer with `von` + Dativ,
`man` shown as the interchangeable active alternative, and
modal + `… + past participle + werden` (`Der Ausweis kann online
beantragt werden`) — the register of forms and official notices.
Light notes: `worden` (not `geworden`) in the Perfekt passive, and
`werden`'s three jobs (become / future / passive). Picker shows each
action as an active `man` line, a present-passive line and a
modal-passive line with the participle chipped; a "what does the
clerk say?" apply picker. 13 vocab items — Amt bureaucracy:
`das Amt`, `der Antrag`, `beantragen`, `das Formular`, `ausfüllen`,
`prüfen`, `bearbeiten`, `die Unterschrift`, `unterschreiben`, `die
Anmeldung`, `der Bescheid`, `die Gebühr`, `der Sachbearbeiter` —
with the inseparable-`be-`/no-`ge-` participle rule flagged.
32-question quiz.

**Unit 16 — Adjective Endings with No Article (strong declension)**
— done, completing the adjective-ending trilogy. With no article the
adjective carries the whole case/gender signal: it takes the ending
`der/die/das/dem/den` would have had (`guter Kaffee`, `kaltes
Wasser`, `mit heißem Tee`) — the article endings minus the `d-`. The
one twist: genitive m/n is `-en` not `-es` (`ein Glas guten Weins`),
recognise-only. Where it turns up: mass nouns, bare plurals, after
`viel`/`etwas`/`wenig`, menus/recipes, and fixed phrases (`vielen
Dank`, `herzlichen Glückwunsch`, `guten Appetit` — all article-less
accusative). Four-case table; a three-pattern decision rule in the
wrap-up (der-word → weak; ein-word → mixed; nothing → strong).
Picker: eight article-less phrases in context, ending chipped and
matched to its article ending; a "say it for the occasion" fixed-
phrase apply picker. 13 vocab items (`viel`, `etwas` + food
adjectives `frisch`, `heiß`, `lecker`, `scharf`, `mild`, `gebraten`,
`gekocht`, `hausgemacht`, `typisch`, plus `frei`, `herzlich`).
32-question quiz.

### Phase 1 — grammar gap units

A pass to close the remaining A2 grammar syllabus gaps
(relative clauses, `zu`-infinitives, verbs + prepositions & `da-`/
`wo-` compounds, n-declension, temporal clauses, two-part
connectors). Grammar-forward, ~13 vocab each.

**Unit 17 — Relative Clauses** — done. The relative pronouns are the
article table with four exceptions — dative plural `denen` and the
four genitives `dessen`/`deren` ("whose"); gender/number from the
antecedent, case from the role inside the clause, verb to the end
(Unit 4), commas around the whole clause. Preposition in front of
the pronoun (`die Firma, bei der ich arbeite` — never stranded),
`was` after `etwas`/`nichts`/`alles`/`das`, `wo` for places. Picker
joins two sentences with the pronoun chipped and the gender-then-case
reasoning; a "describe them in one sentence" apply picker. 13 vocab
items (`dessen`, `deren`, `denen`, `was`, `wo` + antecedent nouns
`die Person`, `der Mensch`, `die Sache`, `das Ding`, `der Typ`, `der
Nachbar`, `die Kollegin`, `die Gegend` — the last two n-nouns
previewing Unit 19). 32-question quiz.

**Unit 18 — `zu` + Infinitive Clauses** — done. After a comma, an
infinitive phrase with `zu` right before the infinitive at the end,
triggered by verbs like `vorhaben` / `versuchen` / `hoffen` /
`vergessen` / `anfangen` / `aufhören` / `vorschlagen` / `sich
entscheiden` / `Lust haben` and `es ist wichtig / schwer / …`.
Separable verbs take `zu` inside (`aufzustehen`, `einzukaufen`). No
`zu` after a modal or after `werden` (future) — flagged as the
contrast. Plus `um … zu` (purpose, same subject only — else `damit`,
Unit 4), `ohne … zu`, and `(an)statt … zu` (callback to Unit 10's
`anstatt` + Genitiv). Picker shows a full sentence with the `zu`
phrase chipped; a "say what you're planning" apply picker. 13 vocab
items (the trigger verbs + `die Absicht` + `um`/`ohne`/`statt … zu`).
32-question quiz.

**Unit 19 — The n-Declension (weak masculine nouns)** — done. The
small group of masculine nouns that add `-n`/`-en` in every case
except the nominative singular: person/animal words ending in `-e`
(`der Junge`, `der Kunde`, `der Kollege`, `der Experte`),
international `-ent`/`-ant`/`-ist`/`-at` words (`der Student`, `der
Praktikant`, `der Polizist`, `der Journalist`, `der Tourist`, `der
Kandidat`), and a memorised set (`der Herr`, `der Nachbar`, `der
Bauer`). Two irregulars: `der Herr → den Herrn` but `die Herren`
plural; `der Name → des Namens` (extra `-s` in the genitive). The
classic error is the accusative/dative form (`den Studenten`, not
`den Student`). Four-case table for `der Kollege`. Picker shows each
noun in a role with the form chipped; a "talk about people at work"
apply picker. 13 vocab items. 32-question quiz.

**Unit 20 — Verbs with Fixed Prepositions (+ `da-`/`wo-` compounds)**
— done. Learn the verb and its preposition as a pair (`warten auf`,
`denken an`, `sich interessieren für`, `Angst haben vor`, `teilnehmen
an`, `sich kümmern um`, `träumen von`, `gehören zu`, `sich gewöhnen
an`, `bitten um`, `sich ärgern über`, `sich freuen auf`/`über`); the
preposition fixes the case. `da(r)` + preposition to replace "prep +
a thing" (`darauf`, `damit`, `dafür`, `darüber` — `-r-` before a
vowel), `wo(r)` + preposition to ask (`Worauf …?`, `Wofür …?`). People
keep the preposition + a real pronoun / `auf wen` — never `darauf`/
`worauf`. da-compounds can point forward to a `dass`-clause or
`zu`-infinitive (Unit 18). Picker shows each verb with a noun, as a
da-compound, and as a wo-question; a "answer the question about you"
apply picker. 13 vocab items. 32-question quiz.

**Unit 21 — Temporal Clauses (`bevor`, `nachdem`, `während`, `bis`,
`seitdem`, `sobald`, `solange`)** — done. All subordinating
conjunctions of time (verb to the end, Unit 4), clause first or
second. Two details: `nachdem` takes the Perfekt in its clause;
`seitdem` keeps the present tense for something ongoing (cf. the
preposition `seit`, Unit 6). Look-alikes flagged: `bevor`/`vor`,
`nachdem`/`nach`, `während` and `bis` as both conjunction and
preposition, `seit`/`seitdem`. Plus an `als` (one past event) vs.
`wenn` (repeated / present / future) recap and the sequencing
adverbs `zuerst`/`dann`/`danach`/`schließlich`. Picker shows a
sentence with the moved verb chipped and a meaning note; a "describe
your routine step by step" apply picker. 13 vocab items. 32-question
quiz.

**Unit 22 — Two-Part Connectors & Adjectival Nouns** — done, closing
Phase 1. The fixed pairs `entweder … oder`, `weder … noch` (no extra
`nicht`), `sowohl … als auch`, `nicht nur …, sondern auch` (comma
before `sondern`), `zwar …, aber`, and `je …, desto/umso …` with its
own word order (`je` + verb-to-end, `desto` + verb-second).
Adjectival nouns — an adjective capitalised and still declined
(`der/ein/die Deutsche(r/n)`, `Angestellte`, `Verwandte`, `Bekannte`,
`Erwachsene`, `Jugendliche`, `Reisende`) — and the neuter `-es` after
`etwas`/`nichts`/`viel`/`wenig` (Unit 16) vs. `-e` after `alles`
(`etwas Neues`, `alles Gute`). Picker chips both halves of each pair;
a "say it about yourself" apply picker. 13 vocab items. 32-question
quiz.

### Phase 2 — topic units

~8 topic units at ~28 words each to carry A2 vocabulary toward the
~600–650-word target: housing / flat-hunting, media & internet,
education & studying, feelings & relationships, environment &
recycling, celebrations & invitations, eating out, money & banking.

**Unit 23 — Housing & Flat-Hunting** — done (first Phase 2 unit). 28
vocab items: `die Miete`, `die Nebenkosten`, `die Warmmiete` /
`Kaltmiete`, `die Kaution`, `der Vermieter` / `Mieter`, `der
Mietvertrag`, `die WG`, `die Wohnungssuche`, `das Inserat`, `die
Besichtigung`, `der Umzug`, `einziehen` / `ausziehen` (Perfekt with
`sein`), `mieten` / `vermieten`, `besichtigen`, `renovieren`,
`möbliert`, `der Quadratmeter`, `der Grundriss`, `die Ausstattung`,
`die Heizung`, `der Balkon`, `der Keller`, `der Hausmeister`, `die
Hausordnung`. Picker decodes a real rental ad (`KM`/`WM`/`NK`,
`2 ZKB`, `EBK`, `provisionsfrei`, `Altbau`/`Neubau`, `Erstbezug`);
a "what do you say at the viewing?" apply picker (with a `sich
bewerben um` + Konjunktiv II callback). 32-question quiz.

**Unit 24 — Media & Internet** — done. 28 vocab items: `das WLAN`,
`die App`, `das Smartphone`, `die Nachricht`, `der Anhang`, `der
Betreff`, `der Link`, `die Webseite`, `das Passwort`, `das
Benutzerkonto`, `das Profil`, `der Beitrag`, `der Kommentar`, `die
Datei`, `der Ordner`, `die sozialen Medien`, plus the verbs
`herunterladen` / `hochladen` (separable), `speichern` / `löschen`,
`teilen`, `sich anmelden` / `sich abmelden` (reflexive + separable),
`klicken auf`, `googeln`, `surfen`, `abstürzen` (Perfekt with
`sein`), `funktionieren` (`-ieren` → no `ge-`). Grammar spotlight
pulls together Units 7, 15, 18. Picker shows each verb with its
prefix/pronoun chipped; a "say it about your habits online" apply
picker. 32-question quiz.

**Unit 25 — Education & Studying** — done. 28 vocab items: `die Uni`
/ `Fachhochschule`, `der Studiengang`, `das Studienfach`, `das
Semester`, `die Vorlesung` / `Seminar`, `der Stundenplan`, `die
Note`, `das Zeugnis`, `die Klausur` / `Hausarbeit` / `Referat`, `die
Bibliothek` / `Mensa`, `der Abschluss` / `Bachelor` / `Master`, `das
Abitur`, `das Stipendium`, `der Dozent` (n-noun, Unit 19), plus
`studieren` (vs. `lernen`), `bestehen` / `durchfallen` (Perfekt with
`sein`), `sich einschreiben`, `wiederholen`, `abgeben`, `belegen`,
`sich vorbereiten auf` (Unit 20). Understand step covers the four
contrasts learners trip on, including the German grade scales
(university 1,0–5,0 vs. school 1–6). Picker is a German-uni
glossary; a "talk about your studies" apply picker. 32-question quiz.

**Unit 26 — Feelings & Relationships** — done. 28 vocab items: `die
Stimmung`, `das Gefühl`, `gut gelaunt`, `aufgeregt`, `nervös`,
`enttäuscht`, `stolz auf`, `eifersüchtig auf`, `genervt von`,
`erleichtert`, `überrascht von`, `neugierig auf`, `gestresst`,
`zufrieden mit`, `die Beziehung`, `der Partner`, `die Freundschaft`,
`der/die Verlobte` (adjectival noun), plus the reflexive verbs `sich
verlieben in` / `sich verabreden mit` / `sich streiten mit` / `sich
vertragen` / `sich trennen von` / `sich verstehen mit`, `flirten
mit`, `kennenlernen`, and `vertrauen` (+ plain Dativ). Deliberate
synthesis of Unit 5 (reflexive verbs) + Unit 20 (fixed
prepositions). Picker chips the reflexive pronoun or the fixed
preposition; a "how are things with you?" apply picker. 32-question
quiz.

**Unit 27 — Environment & Recycling** — done. 28 vocab items: `die
Umwelt` / `der Umweltschutz`, `der Klimawandel`, `das Klima` (vs.
`das Wetter`), `die Umweltverschmutzung`, `die Mülltrennung`, `der
Abfall`, `die Mülltonne`, `der Restmüll` / `Biomüll`, `das Altglas`
/ `Altpapier`, `die Verpackung`, `das Pfand` / `der Pfandautomat`,
`die Plastiktüte`, `die Mehrwegflasche`, `die Nachhaltigkeit`, plus
`trennen` (Müll trennen), `wegwerfen` (separable), `recyceln`,
`sparen`, `vermeiden` / `verbrauchen` (inseparable, no `ge-`),
`schützen`, and the adjectives `umweltfreundlich`, `nachhaltig`,
`bio` (uninflected). Picker sorts eight kinds of waste into the
right German bin (Biomüll / Altpapier / Altglas / Gelber Sack /
Restmüll / Pfand / Sondermüll / Sperrmüll); a "what do you do for
the environment?" apply picker. 32-question quiz.

**Unit 28 — Celebrations & Invitations** — done. 28 vocab items: `die
Feier`, `die Einladung`, `der Anlass`, `der Gastgeber`, `der Gast`,
`die Überraschung`, `das Geschenk`, `der Feiertag`, `die Hochzeit`,
`der Empfang`, `der Sekt`, `die Rede`, `die Deko`, `die Torte` (vs.
`Kuchen`), `die Kerze`, `die Zusage` / `Absage`, `Weihnachten` /
`Silvester` (no article), plus `einladen zu` (separable),
`feiern`, `gratulieren` (+ Dativ + `zu`), `schenken` (Dativ + Akk),
`zusagen` / `absagen` (separable), `anstoßen auf` (separable),
`mitbringen` (separable), `sich verkleiden`. Understand step focuses
on the Dativ-of-the-person verbs. Picker chips the separable prefix /
reflexive pronoun / Dativ phrase; a "reply to an invitation" apply
picker. 32-question quiz.

**Unit 29 — Eating Out** — done. 28 vocab items: `das Lokal`, `die
Kneipe`, `die Speisekarte`, `die Vorspeise` / `das Hauptgericht` /
`der Nachtisch` / `die Beilage`, `das Tagesgericht`, `die
Bedienung`, `die Rechnung`, `das Trinkgeld`, `die Reservierung`,
`die Portion`, `die Bestellung`, `die Serviette`, `das Besteck`,
`die Empfehlung`, plus `bestellen` / `empfehlen` (+ Dativ, stem
change) / `reservieren`, `sich beschweren über` (reflexive + prep),
`bezahlen`, `schmecken` (+ Dativ, like `gefallen`), `servieren`,
`probieren`, and `vegetarisch` / `versalzen` / `durch·medium·blutig`.
Picker walks the moments of a meal (reserving → ordering →
recommendation → complaint → paying → tipping → dietary needs), with
the German rituals (`Ich hätte gern …`, `Zusammen oder getrennt?`,
`Stimmt so`). Apply picker: "order a meal". 32-question quiz.

**Unit 30 — Money & Banking** — done, closing Phase 2. 28 vocab
items: `das Girokonto`, `die Filiale`, `der Geldautomat` (n-noun),
`die EC-Karte` / `Kreditkarte`, `die PIN`, `die Überweisung`, `der
Dauerauftrag` vs. `die Lastschrift`, `der Kontoauszug` /
`Kontostand`, `die Zinsen` / `Schulden` (plural-only), `der Kredit`,
`das Bargeld`, `der Schein` / `die Münze`, `der Kassenbon`, plus
`überweisen` (inseparable, no `ge-`, `auf` + Akk), `abheben` /
`einzahlen` / `ausgeben` / `zurückzahlen` / `umtauschen` (all
separable), `sparen` (`auf` + Akk), `sich lohnen` (impersonal
reflexive), `leihen` (lend vs. borrow), `reklamieren` (`-ieren`, no
`ge-`). Understand step nails `Dauerauftrag` vs. `Lastschrift` and
the prefix rules. Picker walks eight bank/shop moments (opening an
account → ATM → paying → transfers → balance → return → complaint);
a "talk about money" apply picker. 32-question quiz.

### Phase 2 — done

Eight topic units (23–30) at ~28 words each. A2-specific vocabulary
now ~577; total site vocabulary ~1140.

### Phase 3 — vocabulary-expansion pass + A2 mock exams

**Expansion pass — done.** Eight of the A2 grammar units carried
topic-sized vocabulary underweight at 13 items, so they were
enlarged: **Travel & Holidays** (7) → 31, **City Life** (8) → 28,
**Health & the Body** (9) → 29 (all effectively topic units in
disguise); and **Präteritum** (1) → 27, **Comparatives** (2) → 28,
**Reflexive Verbs** (5) → 28, **Work & Job-Hunting** (11) → 27,
**Verbs with Fixed Prepositions** (20) → 28. New items only added to
the vocab list and the flashcard grid; the pickers, quizzes and
grammar explanations are unchanged. A2-specific vocabulary is now
**632** (site total ~1260), within the telc/Goethe A2 range.

**Two "Start Deutsch 2" (A2) mock exams — done.**
`data/exams/a2-mock-exam-1.json` and `a2-mock-exam-2.json`, in the
same schema and engine as the A1 exams. Each has an auto-graded
Hören (12 listening-choice), Lesen (12 multiple-choice with short
texts: notices, e-mails, ads to match, an opinion text) and
Schreiben Teil 1 (6 form-fill), plus a self-check Schreiben Teil 2
(model answer) and Sprechen module (three tasks with examples).
Longer texts and times than A1; built only from A2 vocabulary and
grammar (Perfekt/Präteritum, comparatives, prepositions, subordinate
and relative clauses, Konjunktiv II politeness, the Phase 2 topic
vocabulary). `mock-exam.html` now offers all four from one dropdown
(`A1 — Mock Exam 1/2`, `A2 — Mock Exam 1/2`); the page is retitled
"Mock Exams".

### A2 — substantially complete

30 lesson units, 2 mock exams, ~630 A2-specific vocabulary items in
the vocabulary bank (site total ~1,270). The A2 grammar syllabus and
the exam formats are covered end to end.

**Polish pass — done.**

- The `deutschpfad.example` placeholder is gone: every canonical tag,
  `sitemap.xml` `<loc>`, and the `robots.txt` sitemap line now point at
  `https://geek-asr.github.io/deutschpfad/`.
- A2 story: **"Die Wohnungssuche"** (`stories/a2-die-wohnungssuche.html`)
  — an original 8-paragraph elementary story about finding a room in a
  WG, ~44 glossary entries, 5-question comprehension check. Uses
  Perfekt/Präteritum, `weil`/`dass`/`als` clauses, and comparatives.
- A2 scenario: **"Beim Arzt"** (`scenarios/beim-arzt.html`) — a
  6-step branching conversation: describe symptoms, agree to an
  examination, answer the allergy question, and ask for a
  Krankschreibung. 4-question comprehension check.
- `js/story-page.js` and `js/scenario-page.js` now read
  `data-story-id` / `data-story-src` (and the scenario equivalents)
  off their mount elements, so one glue script serves every story and
  every scenario. The A1 pages carry explicit attributes; the scripts
  still fall back to the A1 content if the attributes are absent.
- `explore.html` "Stories" and "Real-life scenarios" cards now list
  both the A1 and A2 pieces.
- The dashboard "Estimated level" meter is now per-level: `getStats()`
  exposes `a2UnitsCompleted` alongside `a1UnitsCompleted`, and
  `renderMeter` draws an A1 bar (of 16) plus an A2 bar (of 30) that
  appears once A1 is finished or the first A2 unit is done. The caption
  reads "Building A1" → "A1 complete — ready for A2" → "Beginning A2" →
  "Finishing A2" → "A2 complete — ready for B1".

With that, the A2 level is content-complete.

## B1 curriculum buildout

B1 (Goethe/telc *Zertifikat B1* / the DTZ) is the next level. Same
architecture as A1/A2 — `data/*.json` consumed by the generic engines,
one lesson page + page script per unit, no new engine code. Planned
shape, subject to change as it's built:

- **Grammar backbone (~16–18 units):** the full Konjunktiv II (present
  + past), Passiv in every tense and with modals, concessive/causal
  connectors (`obwohl`, `trotzdem`, `deshalb`, `denn`), final clauses
  (`damit` / `um…zu`, `statt…zu`, `ohne…zu`), temporal clauses with
  `nachdem` + Plusquamperfekt, extended relative clauses (with
  prepositions, `was`/`wo(r)-`), Genitiv prepositions
  (`wegen`, `trotz`, `während`, `aufgrund`), verbs/adjectives/nouns
  with fixed prepositions + `da`-/`wo`-compounds, Futur I/II for
  prediction and assumption, indirect speech with Konjunktiv I,
  participles as adjectives (Partizip I/II), nominalisation ↔
  verbalisation, two-part connectors (`je … desto`, `sowohl … als
  auch`, `weder … noch`), subjective modal verbs, `lassen` /
  `sich lassen`, and word formation (prefixes/suffixes).
- **Topic units (~12–14 units, ~26–30 words each):** work &
  applications, education & recognition of qualifications, health &
  the German health system, housing & the Nebenkostenabrechnung,
  environment & climate, media & digital life, mobility & travel,
  consumer rights & contracts, family & care, society & volunteering,
  personality & conflict, food & consumption, culture & leisure,
  and dealing with authorities (Antrag, Frist, Bescheid, Widerspruch).
- **Then:** a B1 story and scenario, and two full *Zertifikat B1*
  mock exams (Lesen / Hören / Schreiben / Sprechen) on the existing
  exam engine.

**Unit 1 — The Konjunktiv II — done.**
`lessons/b1-konjunktiv-2.html`, 28-item vocabulary
(`data/vocabulary/b1-konjunktiv-2.json`), 32-question quiz set. Covers
`würde`/`wäre`/`hätte` + the modal forms for requests and advice, the
single past form (`hätte gemacht`, `wäre gegangen`), the modal double
infinitive (`hätte … sollen`, `hätte … sein können`), irreale
Bedingungssätze, irreale Wünsche, `als ob`, `beinahe`/`fast` + past
K II, and `sonst` for the consequence without a `wenn`-clause. Wired
into `levels.html` (new B1 unit list), the vocabulary bank, the
dashboard title map, and the sitemap.

**Unit 2 — The Passive — done.**
`lessons/b1-passiv.html`, 28-item vocabulary
(`data/vocabulary/b1-passiv.json`), 32-question quiz set. Covers the
Vorgangspassiv in all six forms (`wird` / `wurde` / `ist … worden` /
`war … worden` / `wird … werden` / modal + `… werden`), the
`worden` vs. `geworden` trap, the Zustandspassiv (`sein` + Partizip
II) against the Vorgangspassiv, `von` + Dativ vs. `durch` + Akkusativ
for the agent, the subjectless "es"-Passiv, active↔passive
transformation, and the alternatives `man` / `sich lassen` /
`sein + zu` / `-bar`. Same wiring as Unit 1.

**Unit 3 — Connectors: Reasons and Concessions — done.**
`lessons/b1-konnektoren.html`, 29-item vocabulary
(`data/vocabulary/b1-konnektoren.json`), 32-question quiz set.
Sorts the causal / concessive / consecutive connectors into three
word-order groups — subordinating (`weil`, `da`, `obwohl`, `während`,
`sodass`: verb last), coordinating (`denn`: position zero, no change),
and conjunctional adverbs (`deshalb`, `deswegen`, `daher`, `darum`,
`trotzdem`, `dennoch`, `folglich`: position 1, verb second) — plus the
mid-clause adverbs `nämlich` / `allerdings`, the prepositions `trotz` /
`wegen` + Genitiv, and the two-part `zwar … aber` /
`einerseits … andererseits`. The quiz is word-order-heavy. Same wiring
as Unit 1.

**Unit 4 — Purpose Clauses — done.**
`lessons/b1-finalsaetze.html`, 26-item vocabulary
(`data/vocabulary/b1-finalsaetze.json`), 32-question quiz set. The
same-subject vs different-subject test for `um … zu` vs `damit`, the
`zu` slotting inside separable verbs (`um mitzukommen`), `ohne … zu` /
`ohne dass`, `(an)statt … zu` / `anstatt dass`, and the plain
`zu`-infinitive after `vorhaben` / `versuchen` / `sich bemühen` /
`zögern` etc., plus the purpose nouns `Zweck` / `Ziel` / `Absicht` /
`Voraussetzung` and `wozu` / `dazu` / `mit dem Ziel, … zu …`. Same
wiring as Unit 1.

**Unit 5 — Time Clauses and Tense Sequencing — done.**
`lessons/b1-temporalsaetze.html`, 28-item vocabulary
(`data/vocabulary/b1-temporalsaetze.json`), 32-question quiz set.
The tense discipline B1 tests: `nachdem` + Plusquamperfekt (one step
back), `bevor` / `während` / `solange` with no tense shift, `seit` /
`seitdem` taking the Präsens for an ongoing state, plus `bis`,
`sobald`, `sooft`, `kaum dass`, the `als` / `wenn` / `wann` trio, and
the nominal short forms `nach dem` / `vor der` + Dativ, `während des`
+ Genitiv. Sequencing adverbs `vorher` / `nachher` / `anschließend` /
`inzwischen` / `zuvor` round it out. Same wiring as Unit 1.

**Unit 6 — Relative Clauses II — done.**
`lessons/b1-relativsaetze.html`, 27-item vocabulary
(`data/vocabulary/b1-relativsaetze.json`), 32-question quiz set.
Extends the A2 relative-clause unit into: preposition + relative
pronoun with the preposition setting the case (`mit dem` / `für das`
/ `bei der` / `über den` / `auf den`), the `wo(r)-` forms for things
(`worum`, `worauf`, `worüber`, `womit`), `was` after
`alles` / `nichts` / `etwas` / neuter superlatives and after a whole
main clause, `wo` / `wohin` / `woher` as place relatives, the free
relative `wer …, der …` / `was …, das …`, `welcher` as a formal
alternative, and `derjenige, der …`. Same wiring as Unit 1.

**Unit 7 — Genitive Prepositions — done.**
`lessons/b1-genitiv-praepositionen.html`, 27-item vocabulary
(`data/vocabulary/b1-genitiv-praepositionen.json`), 32-question quiz
set. The fuller set beyond the A2 four (`wegen` / `trotz` / `während` /
`statt`): `aufgrund`, `infolge`, `angesichts` (reason); `ungeachtet`
(concession); `innerhalb` / `außerhalb` / `oberhalb` / `jenseits` /
`anlässlich` (time and place); `laut` / `hinsichtlich` / `bezüglich` /
`seitens` (source and topic); `mithilfe` / `anhand` / `mittels`
(means); `zwecks` / `abzüglich`. Plus the form (`des …(e)s` vs
`der …`), the spoken-German shift to the Dative (`wegen dem Stau`),
the uninflected bare noun (`laut Gesetz`), the living adjective +
Genitive patterns (`sich … bewusst`, `… verdächtig`), and reading
officialese. Same wiring as Unit 1.

**Unit 8 — Subjective Modal Verbs — done.**
`lessons/b1-subjektive-modalverben.html`, 28-item vocabulary
(`data/vocabulary/b1-subjektive-modalverben.json`), 32-question quiz
set. The objective-vs-subjective split (`Sie muss arbeiten` vs.
`Sie muss krank sein`), the certainty scale `muss` → `dürfte` →
`kann/könnte` → `mag`, the evidence-source pair `soll` (hearsay) vs.
`will` (a doubted self-claim), `wird (wohl)` for expectation, and the
past-tense Infinitiv Perfekt (`muss … getan haben` — modal stays
present tense, never Präteritum). Matching adverbs
(`wahrscheinlich`/`vermutlich`/`angeblich`/`offenbar`/`sicher`) and
verbs (`annehmen`/`vermuten`/`bezweifeln`/`behaupten`) round it out.
Same wiring as Unit 1.

**Unit 9 — Participles as Adjectives — done.**
`lessons/b1-partizipien.html`, 27-item vocabulary
(`data/vocabulary/b1-partizipien.json`), 32-question quiz set.
Partizip I (`das lachende Kind`, active/ongoing) vs. Partizip II
(`die gekochten Kartoffeln`, passive/completed) as ordinary
adjectives; the extended participle construction that compresses a
relative clause (`der schnell fahrende Zug`, `die von der Firma
entwickelte Software`) with the reading skill of unpacking it back
into a relative clause; `zu` + Partizip I (`die zu lösende Aufgabe`);
substantivised participles (`der/die Reisende`, `der/die
Angestellte`, `der/die Vorsitzende`); the
`spannend`/`gespannt`-type cause-vs-feeler contrast; and fossilised
Partizip-I words (`entsprechend`, `betreffend`, `folgend`). Same
wiring as Unit 1.

**Unit 10 — Nominalisation — done.**
`lessons/b1-nominalisierung.html`, 28-item vocabulary
(`data/vocabulary/b1-nominalisierung.json`), 32-question quiz set.
Building nouns from verbs (`-ung`: `entscheiden` → `die
Entscheidung`; the substantivised infinitive: `rauchen` → `das
Rauchen`; the irregular `-e` group: `helfen` → `die Hilfe`) and from
adjectives (`-heit`/`-keit`/`-igkeit`: `möglich` → `die
Möglichkeit`), plus `-schaft`/`-tum`/`-nis` and the `-er` agent
pattern; then compressing a clause into `bei`/`nach`/`vor`/`durch`/
`mit` + a noun phrase (mapped to `wenn`/`nachdem`/`bevor`/`weil`/
`als`), tying together the Genitiv prepositions of Unit 7 and the
extended participles of Unit 9 as the three ingredients of the
`Nominalstil`; and `Verbalisierung`, the reverse reading skill for
unpacking officialese (`bei Nichtzahlung der Miete` → `wenn die
Miete nicht gezahlt wird`). Same wiring as Unit 1.

**Unit 11 — Indirect Speech (Konjunktiv I) — done.**
`lessons/b1-indirekte-rede.html`, 28-item vocabulary
(`data/vocabulary/b1-indirekte-rede.json`), 32-question quiz set.
Konjunktiv I formation (stem + endings; `sein` → `sei`, `haben` →
`habe`, `werden` → `werde`) and the one rule that matters in
practice — when a Konjunktiv I form collides with the indicative
(`ich`/`wir`/`sie`-plural mostly do), German substitutes Konjunktiv
II instead (`sie kämen`, not `sie kommen`). `dass`-clause vs.
verb-second without `dass`; the reported past as a single `habe`/
`sei` + Partizip II regardless of the original tense; reported
yes/no questions with `ob` and W-questions keeping the question
word; reported commands with `sollen`; and the note that this is
mainly a written/news register — in speech, `dass` + indicative or
the Unit 8 subjective modals (`soll`/`will`) do the same job. Same
wiring as Unit 1.

Remaining grammar-backbone items from the original plan: verbs/
adjectives/nouns with fixed prepositions (beyond the `wo(r)-` forms
already covered in Unit 6), Futur I/II for prediction, two-part
connectors (`je … desto`, `sowohl … als auch`, `weder … noch`),
`lassen`/`sich lassen` as a family (touched briefly as a Passiv
alternative in Unit 2), and word formation (prefixes/suffixes).
These can come next, interleaved with the ~13 planned topic units.

### B1 topic units

**Unit 12 — Work & Applications — done.**
`lessons/b1-arbeitswelt.html`, 28-item vocabulary
(`data/vocabulary/b1-arbeitswelt.json`), 32-question quiz set. Goes
beyond the A2 basics of applying (A2 Unit 11) into the workplace
itself: contract types (`Vollzeit`/`Teilzeit`,
`befristet`/`unbefristet`), flexible work (`Homeoffice`,
`Gleitzeit`, `Überstunden`), leaving a job well (`Kündigungsfrist`,
`Arbeitszeugnis`, `Referenz`, `fristlose Kündigung`, `Abmahnung`),
growing in a job (`Weiterbildung`, `Aufstieg`, `befördert werden`,
`Mitarbeitergespräch`, `Gehaltsverhandlung`, `Feedback`), and the
adjectives German job ads actually use (`teamfähig`, `belastbar`,
`eigenverantwortlich`, `zuständig` vs. `verantwortlich`). Same
wiring as Unit 1 (topic-unit picker style, not grammar-transform
style).

**Unit 13 — Education & Recognition of Qualifications — done.**
`lessons/b1-bildung.html`, 28-item vocabulary
(`data/vocabulary/b1-bildung.json`), 32-question quiz set. A topic
picked deliberately for this site's international-student audience:
the recognition process for a foreign qualification
(`Anerkennung`, `Zeugnisbewertung`, `Gleichwertigkeit`,
`Defizitbescheid`, `Nachqualifizierung`, the `Anerkennungsgesetz`'s
right to a review regardless of nationality) alongside the German
school and university system (`Grundschule` →
`Hauptschule`/`Realschule`/`Gymnasium`, `duale Ausbildung`,
`Fernstudium`, `Volkshochschule`, `Immatrikulation`/
`Exmatrikulation`, `Regelstudienzeit`, `Numerus clausus`). Same
wiring as Unit 1.

**Unit 14 — Health & the German Health System — done.**
`lessons/b1-gesundheitssystem.html`, 27-item vocabulary
(`data/vocabulary/b1-gesundheitssystem.json`), 32-question quiz set.
Goes beyond the A2 illness/body-parts unit into how the system is
organised: `gesetzliche` vs. `private Krankenversicherung`,
`Krankenkasse`, `Versicherungspflicht`, the `Hausarzt` →
`Überweisung` → `Facharzt` path, `Zuzahlung`/`Rezeptgebühr`,
`Vorsorgeuntersuchung`/`Impfung`, `Notaufnahme` (112) vs. the
`ärztliche Notdienst` (116117), `stationär` vs. `ambulant`,
`Pflegeversicherung`, `Reha`, and `Psychotherapie`. Same wiring as
Unit 1.

**Unit 15 — Housing & the Nebenkostenabrechnung — done.**
`lessons/b1-wohnen.html`, 28-item vocabulary
(`data/vocabulary/b1-wohnen.json`), 32-question quiz set. Goes
beyond A2's flat-hunting basics into living in a German rental and
knowing tenant rights: the annual `Nebenkostenabrechnung`
(`Vorauszahlung`/`Nachzahlung`/`Guthaben`/`Betriebskosten`),
`Mangel`/`Mängelanzeige`/`Mietminderung`,
`Mieterhöhung`/`Mietspiegel`/`ortsüblich`, giving notice
(`kündigen`) vs. a landlord's narrow grounds (`Eigenbedarf`),
`Schönheitsreparaturen`/`Renovierungspflicht`,
`Übergabeprotokoll`, and tenant-protection resources
(`Mieterverein`, `Mieterschutz`). Same wiring as Unit 1.

**Unit 16 — Environment & Climate — done.**
`lessons/b1-umwelt-klima.html`, 28-item vocabulary
(`data/vocabulary/b1-umwelt-klima.json`), 32-question quiz set. Goes
beyond A2 Unit 27's recycling/Mülltrennung basics into climate
policy and discourse: `Erderwärmung`/`Treibhausgase`/`CO2-Ausstoß`,
`Klimaziel`/`klimaneutral`, the `Energiewende` and
`erneuerbare Energien` (`Windkraft`/`Solarenergie`) vs. `fossile
Brennstoffe`, the `Kohleausstieg`, `Elektroauto` and `ökologischer
Fußabdruck`, the fixed-preposition verbs `umsteigen auf` /
`verzichten auf` / `sich engagieren für`, plus `reduzieren`,
`verursachen`, `umweltbewusst`, and the consequences side:
`Dürre`/`Überschwemmung`/`Extremwetter`, `Meeresspiegel`,
`Artenvielfalt`/`aussterben`/`bedroht`, `Emissionshandel`, and
`Maßnahme`. Picker walks five climate topics (energy, transport,
consumption, weather, biodiversity); a second "what do you do for
the climate?" apply picker. Same wiring as Unit 1.

**Unit 17 — Media & Digital Life — done.**
`lessons/b1-medien-digital.html`, 28-item vocabulary
(`data/vocabulary/b1-medien-digital.json`), 32-question quiz set.
Goes beyond A2 Unit 24's WLAN/app mechanics into discussing media as
a topic: `Massenmedien`/`Berichterstattung`/`Nachrichten` (vs. the
A2 `Nachricht`) and `Quelle`, `Falschmeldung`/`Medienkompetenz`/
`glaubwürdig`, `Digitalisierung`, `Datenschutz` vs. `Privatsphäre`,
`Urheberrecht`, `Algorithmus`/`Plattform`/`Filterblase`/
`Meinungsbildung`/`Werbung`, `Medienkonsum`/`Bildschirmzeit`/
`Abhängigkeit`/`süchtig nach`, `Streamingdienst`, plus the verbs
`beeinflussen`, `veröffentlichen`, `recherchieren`, `manipulieren`,
`sich informieren über`, and `überprüfen`. Picker walks five media
topics (news sourcing, misinformation, algorithms, privacy, screen
time); a second "how do you use media?" apply picker. Same wiring
as Unit 1.

**Unit 18 — Mobility & Travel — done.**
`lessons/b1-mobilitaet.html`, 28-item vocabulary
(`data/vocabulary/b1-mobilitaet.json`), 32-question quiz set. Goes
beyond A2 Unit 7's fahren/fliegen/Perfekt basics and Unit 8's
directions into commuting and travel logistics: `ÖPNV`/`Nahverkehr`
vs. `Fernverkehr`, `Verbindung`/`Anschluss`/`Fahrplan`,
`Verspätung`/`Stau`/`Baustelle`, `Fahrgastrechte` and
`Entschädigung`, `Ersatzverkehr`, `das Deutschlandticket`,
`Carsharing`/`Mitfahrgelegenheit`, `der Führerschein`, plus the
verbs `pendeln`, `buchen`/`stornieren`/`umbuchen`, `ausfallen`
(separable, sein), `sich verspäten`, `erreichen` (vs. verpassen),
and the adjectives `klimafreundlich` (callback to Unit 16),
`zuverlässig`, `überfüllt` (Partizip, callback to Unit 9). Picker
walks five mobility situations (commuting, delays, cancellations,
passenger rights, car-free alternatives); a second "how do you get
around?" apply picker. Same wiring as Unit 1.

**Unit 19 — Consumer Rights & Contracts — done.**
`lessons/b1-verbraucherrecht.html`, 28-item vocabulary
(`data/vocabulary/b1-verbraucherrecht.json`), 32-question quiz set.
Goes beyond A2 Unit 30's reklamieren/umtauschen basics into
contracts and consumer law: `Vertrag`/`AGB`/`Kleingedruckte`/
`verbindlich`, `Widerrufsrecht` (the 14-day distance-purchase
right), `Garantie` (voluntary, manufacturer) vs. `Gewährleistung`
(statutory, seller) — a deliberate contrast pair —
`Kündigungsfrist`/`Vertragslaufzeit`/`fristlos`,
`Reklamation`/`mangelhaft`/`Erstattung`/`Verbraucherzentrale`, plus
the verbs `abschließen` (einen Vertrag), `widerrufen`, `kündigen`,
`erstatten`, `haften für`, `beanstanden`, `abonnieren`. Picker walks
five consumer situations (online purchases, warranty claims,
signing, cancelling, complaints); a second "what would you do?"
apply picker. Same wiring as Unit 1.

**Unit 20 — Family & Care — done.**
`lessons/b1-familie.html`, 28-item vocabulary
(`data/vocabulary/b1-familie.json`), 32-question quiz set. Goes
beyond A1's kinship nouns and A2 Unit 26's relationship verbs into
family as a social topic: `Elternzeit` vs. `Elterngeld`,
`Kinderbetreuung`/`Kita`, `die Vereinbarkeit` (von Familie und
Beruf), `Patchwork-Familie`/`Angehörige`/`verwandt mit`,
`Pflege`/`pflegebedürftig`/`Pflegeheim`/`Altenpflege`,
`Sorgerecht`/`Unterhalt`/`Erziehungsberechtigte`,
`Generation`/`Generationenvertrag`, `alleinerziehend`, plus the
verbs `erziehen`, `sich kümmern um`, `unterstützen`, `betreuen`,
`versorgen`, `aufwachsen` (separable, sein), `vererben`. Deliberate
nominalisation callback to Unit 10 (Erziehung/Betreuung/Pflege are
all nominalised verbs). Picker walks five family topics (parental
leave, childcare, elder care, blended families, generations); a
second "how does your family handle it?" apply picker. Same wiring
as Unit 1.

**Unit 21 — Society & Volunteering — done.**
`lessons/b1-gesellschaft.html`, 28-item vocabulary
(`data/vocabulary/b1-gesellschaft.json`), 32-question quiz set.
Civic-life vocabulary: `Ehrenamt`/`ehrenamtlich`/`freiwillig`/
`Freiwillige`, `Verein`/`Vorstand`/`Mitgliedsbeitrag`/
`Mitgliederversammlung`, `Spende`/`spenden`, `Vielfalt`/`Toleranz`/
`Solidarität`/`Zusammenhalt`/`Gemeinschaft`, `Gesellschaft`/
`gesellschaftlich`/`Zivilgesellschaft`/`Integration`,
`Initiative`/`Nachbarschaftshilfe`/`Obdachlosigkeit`, plus the verbs
`sich einsetzen für`, `sich beteiligen an`, `fördern`, `mitwirken
an` (separable), `wählen`, `gründen`. Deliberate nominalisation
callback to Unit 10 (Integration/Beteiligung). Picker walks five
ways to get involved (volunteering, donating, club structure,
diversity/cohesion, local help); a second "how would you get
involved?" apply picker. Same wiring as Unit 1.

**Unit 22 — Personality & Conflict — done.**
`lessons/b1-persoenlichkeit.html`, 28-item vocabulary
(`data/vocabulary/b1-persoenlichkeit.json`), 32-question quiz set.
Goes beyond A2 Unit 26's mood adjectives and relationship verbs into
character description and conflict resolution: `Charakter`/
`Charaktereigenschaft`, the trait adjectives `ehrgeizig`/`geduldig`/
`stur`/`egoistisch`/`großzügig`/`einfühlsam`/`selbstbewusst`/
`zurückhaltend`/`verlässlich`/`nachtragend`,
`Konflikt`/`Streit`/`Meinungsverschiedenheit`/`Kompromiss`/
`Missverständnis`/`Vorwurf`/`Kritik`/`Selbstbewusstsein`, plus the
verbs `sich einigen auf`, `nachgeben` (separable), `vermitteln`,
`vorwerfen` (separable, Dativ+Akk), `verzeihen` (+Dativ), `klären`,
`ansprechen` (separable), `kritisieren`. Picker walks five
personality traits; a second "how do you handle conflict?" apply
picker. Same wiring as Unit 1.

**Unit 23 — Food & Consumption — done.**
`lessons/b1-ernaehrung.html`, 28-item vocabulary
(`data/vocabulary/b1-ernaehrung.json`), 32-question quiz set. Goes
beyond A1's food nouns and A2 Unit 29's restaurant vocabulary into
diet, labels, and food ethics: `Ernährung`/`sich ernähren von`,
`Lebensmittel`/`Mindesthaltbarkeitsdatum`/`Inhaltsstoffe`/
`Kennzeichnung`, `Allergie`/`Unverträglichkeit`/`vertragen`,
`Massentierhaltung`/`Fleischkonsum`/`Nahrungsmittelindustrie`/
`Konsumverhalten`, `Bio-Lebensmittel`/`regional`/`saisonal`/
`nachhaltig` (callback to Unit 16), `Fertiggericht`/`verarbeitet`
(Partizip, callback to Unit 9), `Lebensmittelverschwendung`/
`verschwenden`, plus `verzichten auf`, `konsumieren`, `zubereiten`,
`genießen`. Picker walks five food topics (diet, labels, waste,
allergies, meat/farming); a second "how do you shop and eat?" apply
picker. Same wiring as Unit 1.

**Unit 24 — Culture & Leisure — done.**
`lessons/b1-kultur-freizeit.html`, 28-item vocabulary
(`data/vocabulary/b1-kultur-freizeit.json`), 32-question quiz set.
Goes beyond A1's Freizeit/Hobby into cultural life and meaningful
leisure: `Kulturangebot`/`Veranstaltung`/`Ausstellung`/`Aufführung`/
`Eintritt`/`Festival`, `Tradition`/`Brauch`/`Kulturerbe`/`Heimat`
(the culturally loaded belonging word), `Hochkultur` vs.
`Popkultur`/`anspruchsvoll`/`vielfältig` (adjective form of Unit
21's Vielfalt), `Erholung`/`Muße`/`Abwechslung`/`entspannend`, plus
the verbs `teilnehmen an` (separable), `besichtigen`, `sich
entspannen`, `pflegen` (a tradition, not a person — contrast with
Unit 20), `stattfinden` (separable), `veranstalten`, `sich
auskennen mit` (reflexive + separable). Picker walks five ways to
spend free time (events, cultural offerings, tradition, relaxation,
identity); a second "how do you spend your leisure time?" apply
picker. Same wiring as Unit 1.

**Unit 25 — Dealing with Authorities — done. Closes the planned B1
topic-unit list.**
`lessons/b1-behoerden.html`, 28-item vocabulary
(`data/vocabulary/b1-behoerden.json`), 32-question quiz set. Goes
beyond A2 Unit 15's Amt/Antrag/Formular basics into what happens
after you apply: `Behörde`/`Ausländerbehörde`/`Zuständigkeit`,
`Aufenthaltstitel`/`Aufenthaltserlaubnis`/`Verlängerung`,
`Bescheid`/`Genehmigung`/`Ablehnung`/`rechtskräftig`,
`Widerspruch`/`Widerspruchsfrist`/`Einspruch`/`fristgerecht`,
`Nachweis`/`Bescheinigung`/`Vollmacht`/`Akte`/`Antragsteller`, plus
the verbs `einlegen` (Widerspruch, separable), `ablehnen`
(separable), `genehmigen`, `verlängern`, `nachweisen` (separable),
`einreichen` (separable), `sich wenden an` (reflexive). Picker walks
five authority situations (permits, rejections, proof, jurisdiction,
power of attorney); a second "what would you do?" apply picker.
Explicit callback to A2 Unit 15's passive and B1 Unit 11's indirect
speech. Same wiring as Unit 1.

All 13 planned B1 topic units are now done (Units 12–25, alongside
the 11 grammar-backbone units 1–11). Remaining for B1: a story, a
scenario, and two full *Zertifikat B1* mock exams — plus the 5
optional grammar-backbone extras noted after Unit 11, still not
committed to a specific position.

**B1 story — "Der Widerspruch" — done.**
`stories/b1-der-widerspruch.html`, backed by
`data/stories/b1-der-widerspruch.json`. 8 paragraphs (24 sentences,
longer and syntactically denser than the A1/A2 stories), a
41-entry click-to-look-up glossary, and a 6-question comprehension
quiz. Follows the same international-student narrator through a
rejected residence-permit renewal and a successful Widerspruch —
deliberately exercises Konjunktiv II (Unit 1), the passive (Unit 2),
connectors (Unit 3), reported/indirect claims via `sei … gewesen`
(Unit 11's Konjunktiv I), separable verbs (`einlegen`, `beilegen`,
`hinnehmen`), and the Unit 25 Behörden vocabulary throughout. Same
generic `story-reader.js`/`story-page.js` engine as the A1/A2
stories — no engine changes. Wired into `explore.html`'s Stories
card and the dashboard's `CONTENT_TITLES`.

**B1 scenario — "Das Vorstellungsgespräch" — done.**
`scenarios/b1-vorstellungsgespraech.html`, backed by
`data/scenarios/b1-vorstellungsgespraech.json`. A 7-step branching
job-interview conversation (one more step than the A2 Beim-Arzt
scenario, each exchange longer and syntactically denser) — self-
introduction, strengths/weaknesses, a question about converting a
student `Aufenthaltstitel` to one for `Erwerbstätigkeit` (a direct,
deliberate callback to Unit 25 and the B1 story), salary
negotiation, notice period, questions for the interviewer, and a
professional close. Each step has one "best" reply that advances and
one weaker reply that loops back with English feedback, same engine
as Bahnhof/Beim-Arzt. 6-question comprehension quiz. Same generic
`scenario-engine.js`/`scenario-page.js` — no engine changes. Wired
into `explore.html`'s Scenarios card and the dashboard's
`CONTENT_TITLES`.

B1 is now feature-complete except for its two full *Zertifikat B1*
mock exams (Lesen/Hören/Schreiben/Sprechen) and the 5 optional
grammar-backbone extras noted after Unit 11.

**B1 Mock Exam 1 — done.**
`data/exams/b1-mock-exam-1.json`, added to `mock-exam.html`'s
existing dropdown (`EXAMS` list in `js/mock-exam-page.js`) —
same shared exam page and `exam-engine.js` as the four A1/A2 exams,
zero engine changes. 12 Hören items (3 parts: Durchsagen/Nachrichten,
Im Alltag, Gespräche und Meinungen — Behörden, mobility, media, and
family/work topics from Units 16–25), 12 Lesen items (3 parts: two
paired short texts, a 4-question article on the Deutschlandticket,
and a paired official-notice/opinion-text part built directly on
Unit 25's Widerspruch vocabulary), a 6-item Schreiben Teil 1
fill-the-gap exercise themed around filing a Widerspruch, a Schreiben
Teil 2 formal-email task (~80–100 words, about a Housing Unit 15
Mangel and Mietminderung) with a model answer, and a 3-teil Sprechen
module (self-introduction, Homeoffice opinion, negotiating a
roommate conflict — callback to Unit 22). While in
`js/mock-exam-page.js`, fixed a pre-existing bug where the pass/fail
note always said "A1 exams" regardless of which exam was actually
running — now reads `examData.cefr` dynamically. `mock-exam.html`'s
copy and intro list updated for B1 timings.

**B1 Mock Exam 2 — done. Closes out B1.**
`data/exams/b1-mock-exam-2.json`, added to the same `EXAMS`
dropdown. Deliberately different topics from Exam 1's Widerspruch/
housing/mobility focus: Hören and Lesen draw on Kita/Fortbildung,
Sperrmüll and food-product recalls, qualifications recognition
(Zeugnisanerkennungsstelle, callback to Unit 13), the Energiewende
and erneuerbare Energien (Unit 16), Garantie vs. Gewährleistung
(Unit 19), and food waste (Unit 23). Schreiben Teil 1 is themed
around a job application (Anschreiben, Berufserfahrung, Stärke,
Gehaltsvorstellung, Aufenthaltstitel zur Erwerbstätigkeit,
Vorstellungsgespräch — a direct callback to the B1 scenario).
Schreiben Teil 2 is a formal email negotiating a later start date
after a job offer. Sprechen covers education/recognition,
sustainable consumption, and planning a cultural outing together.
Same shared exam page and engine, zero code changes needed.

**B1 is now fully complete**: 11 grammar-backbone units, 13 topic
units, a story, a scenario, and two full mock exams. The 5 optional
grammar-backbone extras noted after Unit 11 are folded into B2's
grammar backbone below instead of staying dangling — see Units 1–5.

## B2 curriculum buildout

B2 (Goethe/telc *Zertifikat B2*) is the next level. Same architecture
as A1/A2/B1 — `data/*.json` consumed by the generic engines, one
lesson page + page script per unit, no new engine code needed so far
across four levels. Planned shape, subject to change as it's built:

- **Grammar backbone (~10–11 units, revised after Unit 5 — see the
  correction note below):** opens with the 5 items deferred from B1
  — fixed-preposition verbs/adjectives/nouns beyond wo(r)- forms
  plus `da`-/`wo`-compounds, **Futur I/II for prediction and
  assumption**, two-part connectors (`je … desto`, `sowohl … als
  auch`, `weder … noch`, `nicht nur … sondern auch`), `lassen` /
  `sich lassen`, and word formation (prefix semantics
  `ent-`/`er-`/`zer-`/`ver-`/`be-`, adjective suffixes) — then moves
  into genuinely new B2 territory: Funktionsverbgefüge (`in Kraft
  treten`, `Rücksicht nehmen auf`, `zur Verfügung stellen`,
  `Anspruch erheben`, `eine Entscheidung treffen`), Modalpartikeln
  (`ja`, `doch`, `eben`, `halt`, `ruhig`, `schon`, `bloß`, `mal`) for
  spoken-register nuance, participial *adverbial* phrases that
  reduce a whole clause rather than modify a noun (`Auf die Frage
  angesprochen, antwortete sie …` — distinct from B1 Unit 9's
  attributive participles), Konjunktiv I with modal verbs and the
  future in reported speech (`er könne`, `sie müsse`, `es werde` —
  deepening B1 Unit 11's core mechanics rather than repeating them),
  and hedged/academic Konjunktiv II (`man könnte argumentieren,
  dass …`, `es wäre denkbar, dass …`).

  **Second correction, made while planning Unit 7:** the "rare
  Genitiv/concessive prepositions" item above (`ungeachtet`,
  `angesichts`, etc.) turned out to already be covered in full by
  B1 Unit 7, which — on rereading it properly rather than from
  memory again — covers 27 Genitiv prepositions including
  `ungeachtet`, `angesichts`, `infolge`, `anlässlich`, `mithilfe`,
  `anhand`, `mittels`, `zwecks`, and `abzüglich`. Dropped from the
  B2 list entirely rather than shipped thin/padded with only the
  handful of genuinely obscure leftovers (`zugunsten`, `zulasten`,
  `mangels`, `kraft`) that would remain.

  **Correction, made after shipping Unit 5:** the B2 plan as first
  written listed several items that turned out, on actually
  rereading each B1 unit's shipped scope rather than trusting a
  from-memory summary, to already be substantially covered there —
  extended participial *attributes* (B1 Unit 9), Zustandspassiv vs.
  Vorgangspassiv plus modals-in-passive plus `sein` + `zu` +
  Infinitiv as a passive alternative (all B1 Unit 2), `als ob`/`als
  wenn` (B1 Unit 1), Nominalstil vs. Verbalstil (B1 Unit 10), and
  the core mechanics of Konjunktiv I indirect speech across tenses
  (B1 Unit 11). Those were dropped from the B2 list rather than
  reshipped. One real overlap had already shipped by the time this
  was caught: B2 Unit 3 (Two-Part Connectors) re-teaches `zwar …
  aber` and `einerseits … andererseits`, both already introduced in
  B1 Unit 3 — left as-is rather than reworked, since the B2 unit
  adds real depth (five more pairs, plus abwägen/Vor- und Nachteile
  vocabulary) rather than just repeating the B1 content, but noted
  here for anyone auditing the curriculum.
- **Topic units (~14 units, ~28–32 words each):** career &
  professional development, science & research, politics & society,
  economy & globalisation, media & digitalisation (deepened — AI,
  cybersecurity, freedom of speech), migration & integration,
  comparing education systems, health & medical ethics, environmental
  & international climate policy, law & the justice system, art &
  culture's social role, technology & innovation, social justice &
  inequality, and intercultural communication.
- **Then:** a B2 story and scenario, and two full *Zertifikat B2*
  mock exams (Lesen / Hören / Schreiben / Sprechen) on the existing
  exam engine.

**Unit 1 — Futur I & II — done.**
`lessons/b2-futur.html`, 28-item vocabulary
(`data/vocabulary/b2-futur.json`), 32-question quiz set. Covers
Futur I formation (`werden` + Infinitiv) for predictions and
promises — genuinely about the future, unlike everyday spoken German
which mostly uses the present tense for planned events — Futur I +
`wohl`/`wahrscheinlich`/`vermutlich` for an assumption about *right
now* (the classic learner trap: it looks like future tense but means
present), and Futur II (`werden` + Partizip II + `haben`/`sein`) for
both an assumption about something already finished and a genuine
future "will have done X by deadline Y" meaning. Picker walks five
uses (promise, prediction, present-tense guess, past-tense guess,
deadline); a second "make your own prediction" apply picker.
Explicit callback to Unit 8's subjective modal verbs
(`dürfte`/`müsste` as Konjunktiv II alternatives to Futur II for
assumptions) and Unit 1's Konjunktiv II. Same wiring as every prior
unit.

**Unit 2 — Fixed-Preposition Verbs, Adjectives & Nouns (deepened)
— done.**
`lessons/b2-feste-praepositionen.html`, 28-item vocabulary
(`data/vocabulary/b2-feste-praepositionen.json`), 32-question quiz
set. Explicitly goes beyond A2 Unit 20's 13 everyday verbs
(`warten auf`, `sich freuen auf/über`, etc. — none repeated here)
into the abstract, academic-register vocabulary of analysis and
argument: nouns and adjectives with fixed prepositions for the first
time (`der Zusammenhang mit`, `die Auswirkung auf`, `der Einfluss
auf`, `die Abhängigkeit von`, `der Bezug auf`, `typisch/
charakteristisch/bekannt für`, `angewiesen auf`, `unabhängig von`),
plus the academic verb cluster `beruhen auf` (+ Dativ, unusually),
`bestehen aus`, `resultieren aus`, `sich richten nach`, `sich
beziehen auf`, `sich unterscheiden von`, `sich auszeichnen durch`,
`hinweisen auf`, `hindeuten auf`, and `zurückführen auf`. Deepens
`da(r)-`/`wo(r)-` compounds into their academic-writing job of
pointing forward to a whole `dass`-clause, plus the fixed formal
phrases `im Hinblick darauf, dass …` and `darauf zurückzuführen,
dass …`. Picker walks five academic uses (connection, basis,
pointing something out, dependency, cause); a second "complete an
academic sentence" apply picker. Same wiring as every prior unit.

**Unit 3 — Two-Part Connectors — done.**
`lessons/b2-zweiteilige-konnektoren.html`, 28-item vocabulary
(`data/vocabulary/b2-zweiteilige-konnektoren.json`), 32-question
quiz set. All seven pairs: `je … desto` (with its distinctive
word order — `desto` counts as position 1), the parallel pairs
`sowohl … als auch` / `weder … noch`, the asymmetrical pairs
`nicht nur …, sondern auch` / `entweder … oder`, the concessive/
weighing pairs `zwar …, aber` / `einerseits …, andererseits`, plus
the related-but-distinct `je nachdem`. Rounds out with
`abwägen`/`die Abwägung`/`der Vorteil`/`der Nachteil` — the
pros-and-cons vocabulary these connectors constantly appear
alongside. Picker walks all seven uses; a second "weigh the pros
and cons" apply picker. Explicit callback to B1 Unit 3's single
connectors (`obwohl`, `trotzdem`, `deshalb`, `denn`). Same wiring
as every prior unit.

**Unit 4 — lassen & sich lassen — done.**
`lessons/b2-lassen.html`, 28-item vocabulary
(`data/vocabulary/b2-lassen.json`), 32-question quiz set. The
causative `lassen` + Infinitiv (`Ich lasse mir die Haare
schneiden`), `sich lassen` + Infinitiv as a passive alternative
(`Das Problem lässt sich lösen`), the Perfekt double infinitive
(`hat … schneiden lassen`, never `gelassen`), the fixed idioms
`Lass mich in Ruhe` / `Lass das!`, and lassen for leaving a state
unchanged. The bulk of the unit is the easily-confused verb family:
`verlassen` (leave a place — the classic trap), `hinterlassen`
(leave behind an object/message), `zulassen`
(permit formally, + noun `die Zulassung`), `unterlassen` (refrain
from, legal register), `loslassen` (let go of), `nachlassen`
(diminish/wane), plus `erlauben` and the single-word alternatives
`machbar`/`lösbar`. Picker walks five uses (causative, passive
alternative, permission, leaving a state, Perfekt); a second
picker for causative/impossible-to-change situations. Explicit
callback to the true passive (B1 Unit 2) as the first of B2's
three passive-alternative constructions — `haben`/`sein` + `zu` +
Infinitiv is still to come. Same wiring as every prior unit.

**Unit 5 — Word Formation (Prefixes & Suffixes) — done. Closes out
all 5 items deferred from B1.**
`lessons/b2-wortbildung.html`, 28-item vocabulary
(`data/vocabulary/b2-wortbildung.json`), 32-question quiz set.
Deliberately distinct from B1 Unit 10's noun-forming suffixes
(`-ung`/`-heit`/`-keit`/`-igkeit`, none repeated here): the five
semantic verb prefixes `ent-` (beginning/removal: `entdecken`,
`entstehen`, `entfernen`), `er-` (achieved result: `erreichen`,
`erfinden`, `erfahren`), `zer-` (destruction, the most reliable
prefix in German: `zerbrechen`, `zerstören`), `ver-` (change of
state, often negative: `verschwinden`, `verlieren`, `sich
verletzen`), and `be-` (transitivizing, absorbing a preposition:
`beantworten` vs. `antworten auf`, `besteigen` vs. `steigen auf`);
the negating prefixes `un-`/`miss-`; the adjective-forming suffixes
`-lich`/`-ig`/`-voll`/`-reich`/`-los`/`-isch`; and a brief compound-
noun note (the last element determines gender, plus the Fugen-s).
Picker walks all five verb-prefix meanings; a second "build a word"
apply picker. Explicit callback to B1 Unit 10 as the noun-formation
companion piece. Same wiring as every prior unit.

All 5 grammar-backbone items deferred from B1 are now done (Units
1–5). B2's remaining planned grammar backbone (~10 more units) moves
into genuinely new B2 territory: extended participial attributes,
Passiv with modals across every tense, `haben`/`sein` + `zu` +
Infinitiv, deepened Konjunktiv II/I, advanced Konnektoren,
Funktionsverbgefüge, rare Genitiv/concessive prepositions,
participial adverbial phrases, Konjunktiv I with modals/future, and
Modalpartikeln — see the corrected B2 planning note above Unit 1 for
the full list (and the note explaining what was dropped and why).

**Unit 6 — Funktionsverbgefüge (Support-Verb Constructions) —
done.**
`lessons/b2-funktionsverbgefuege.html`, 28-item vocabulary
(`data/vocabulary/b2-funktionsverbgefuege.json`), 32-question quiz
set. The first genuinely new B2 grammar topic after closing out
B1's 5 deferred items. Eighteen fixed light-verb + noun phrases
grouped by verb family — the `nehmen`-family (`Rücksicht nehmen
auf`, `in Anspruch nehmen`, `Einfluss nehmen auf`, `Kontakt
aufnehmen mit`, `Abstand nehmen von`), the `stellen`-family (`zur
Verfügung stellen`, `in Frage stellen`, `unter Beweis stellen`),
the `treten`/`setzen` opposite pair (`in Kraft treten` / `außer
Kraft setzen`), the `bringen`-family (`zum Ausdruck bringen`, `zur
Sprache bringen`), and standalones (`Kritik üben an`, `eine
Entscheidung treffen`, `Anspruch erheben auf`, `in Betracht
ziehen`, `Anwendung finden`) — plus the single-verb equivalent for
each (`berücksichtigen`, `bereitstellen`, `beanspruchen`,
`ausdrücken`, `kritisieren`, `beeinflussen`, `erwägen`,
`kontaktieren`, `bezweifeln`), explicitly framed as the same
unpacking skill as B1 Unit 10's Verbalisierung. Picker walks five
common Funktionsverbgefüge; a second "say it formally" apply
picker. Same wiring as every prior unit.

**Unit 7 — Modalpartikeln — done.**
`lessons/b2-modalpartikeln.html`, 28-item vocabulary
(`data/vocabulary/b2-modalpartikeln.json`), 32-question quiz set.
Confirmed genuinely new territory (checked against every prior
level, not just B1) — flavoring particles that change attitude, not
propositional meaning: `ja` (obvious/surprising), `doch` (softening
a command into encouragement, or reminding — plus the standalone
contradiction `Doch!` against a negative question), `eben`/`halt`
(resignation, the second more colloquial/regional), `ruhig`
(reassuring permission in an imperative), `schon` (reassurance,
explicitly contrasted with its literal "already" sense), `bloß`/
`nur` (urgency in a warning or wish), `mal` (softening a request),
and the curiosity/exclamation trio `denn`/`vielleicht`/
`eigentlich` — each explicitly contrasted with its unrelated
"plain" meaning elsewhere (`denn` as B1 Unit 3's causal conjunction,
`vielleicht` as "maybe," `eigentlich` as "actually"). Picker walks
five common particles; a second "add the right flavor" apply
picker. Explicitly framed as spoken register — pairs with the
scenarios (Bahnhof, Beim Arzt, Das Vorstellungsgespräch) rather
than formal writing, a deliberate contrast with Unit 6's
Funktionsverbgefüge. Same wiring as every prior unit.

**Unit 8 — Participial Adverbial Phrases — done.**
`lessons/b2-partizipialphrasen.html`, 28-item vocabulary
(`data/vocabulary/b2-partizipialphrasen.json`), 32-question quiz
set. Verified against B1 Unit 9's actual vocabulary file (not just
its roadmap summary) before writing a word — Unit 9 is entirely
attributive (a participle before a noun: `der schnell fahrende
Zug`); this unit is the adverbial use, a comma-set-off participial
phrase standing in for a whole subordinate clause and modifying the
main clause, not any single noun. Partizip I for simultaneous
action (`Lächelnd verließ sie den Raum`), Partizip II for passive
meaning (`Von allen bewundert, genoss er seinen Erfolg`) or, for
sein-verbs, action completed before the main clause (`In Berlin
angekommen, suchte sie ein Hotel`), the non-negotiable shared-
subject rule, the comma rule, and the reading skill of unpacking
each phrase into `nachdem`/`weil`/`während`. Built on the verbs
`ansprechen`, `erschöpfen`, `lächeln`, `bewundern`, `überzeugen` and
the adjectival participles `erstaunt`, `getrieben`, `umgeben`,
`begleitet`. Picker walks five readings; a second "describe a
scene" apply picker. Same wiring as every prior unit.

**Unit 9 — Konjunktiv I: Modal Verbs & Reporting the Future —
done.**
`lessons/b2-konjunktiv1-modalverben.html`, 28-item vocabulary
(`data/vocabulary/b2-konjunktiv1-modalverben.json`), 32-question
quiz set. Verified against B1 Unit 11's actual vocabulary file
before writing a word — Unit 11 covers sein/haben/werden in
Konjunktiv I, the Ersatzform rule, reported questions and commands,
and the reporting-verb vocabulary, but never systematically covers
the six modal verbs' own Konjunktiv I forms. This unit fills that
gap: `ich könne`/`müsse`/`dürfe`/`wolle`/`solle`/`möge`, explicitly
noting that (unlike most verbs) modal Konjunktiv I singular forms
rarely collide with the indicative so they're used freely, while
the 1st/3rd person plural still needs Unit 11's Konjunktiv II
Ersatzform (`wir könnten`, `sie müssten`). Two genuinely new
constructions beyond the modal forms themselves: the reported past
with a modal as a double infinitive (`sie habe nicht kommen
können`, never a participle like `gekonnt`), and Futur II in
reported speech for a claim about a future-completed action (`er
werde das bis Freitag abgeschlossen haben`), deepening B2 Unit 1's
Futur II. Explicitly contrasts Konjunktiv I (reporting someone
else's claim) with B1 Unit 8's subjective `dürfte`/`müsste`
(voicing the speaker's own guess). Closes with register vocabulary
that pairs naturally with reported speech: `zufolge` (postposed,
contrasted with B1 Unit 7's `laut`), `vermeintlich`, `dementieren`,
`bestätigen`, `spekulieren` — checked individually against every
prior vocabulary file to confirm none were already covered (`laut`,
`angeblich`, `glaubwürdig`, and `die Quelle` were already B1
content and excluded). Picker walks the six modal forms; a second
"pick a reporting word" apply picker. Same wiring as every prior
unit.

**Unit 10 — Hedged & Academic Konjunktiv II — done.** Closes out
the B2 grammar backbone.
`lessons/b2-akademischer-konjunktiv2.html`, 28-item vocabulary
(`data/vocabulary/b2-akademischer-konjunktiv2.json`), 32-question
quiz set. Verified against B1's actual Konjunktiv II vocabulary file
first — B1 Unit "konjunktiv-2" covers the everyday register in full
(würde/wäre/hätte/könnte/müsste/sollte/dürfte, past Konjunktiv II,
wenn-clauses, unreal wishes, als ob, polite requests) but never the
rhetorical, essay-writing use of the same forms. This unit repurposes
Konjunktiv II as a hedging tool for structured argument:
`man könnte argumentieren/einwenden/meinen, dass …`,
`es wäre denkbar, dass …`, `es ließe sich sagen/behaupten, dass …`
(explicitly built on B2 Unit 4's `sich lassen`), and
`es wäre zu fragen, ob …` (built on B1 Unit 2's `sein + zu +
Infinitiv`). Explicitly contrasts three related-but-distinct tools:
B1 Unit 8's `dürfte`/`müsste` (the speaker's own guess about a
fact), B2 Unit 9's Konjunktiv I (reporting someone else's claim),
and this unit's hedges (softening the writer's own argument). Also
covers `es mag sein, dass …, aber …` — explicitly flagged as the
plain indicative of `mögen`, not B2 Unit 9's Konjunktiv I `möge` —
and the idiom `nicht von der Hand zu weisen`. Closing essay-register
vocabulary (`die These`, `das Gegenargument`, `der Standpunkt`,
`plausibel`, `umstritten`, `nachvollziehbar`, `relativieren`,
`verallgemeinern`, `vorausgesetzt(, dass)`) checked individually
against every prior vocabulary file — `behaupten` (B1 Unit 8) and
`in Frage stellen` (B2 Unit 6) were already covered and excluded,
cross-referenced instead. Picker walks five hedging phrases; a
second "pick an essay word" apply picker. Same wiring as every
prior unit.

This completes the B2 grammar backbone at 10 units total (5 items
closed out from B1, plus Funktionsverbgefüge, Modalpartikeln,
participial adverbial phrases, Konjunktiv I with modals/future, and
hedged/academic Konjunktiv II). Next: the ~14 B2 topic units listed
above, then a B2 story, a B2 scenario, and two *Zertifikat B2* mock
exams — mirroring B1's completed arc.

**Unit 11 — Career & Professional Development — done.** The first
B2 topic unit.
`lessons/b2-karriere.html`, 28-item vocabulary
(`data/vocabulary/b2-karriere.json`), 32-question quiz set. Checked
against B1 Unit 8's Arbeitswelt file and A2's work unit before
writing a word, since both already cover everyday workplace
vocabulary — job ads, contract types, notice periods, performance
reviews, Lebenslauf/Anschreiben/Probezeit, salary negotiation. This
unit goes further: three distinct career-path words (`die
Karriereleiter` for climbing within a field, `der Quereinstieg` for
an informal sideways move, `die Umschulung` for a formal
often-state-supported retraining program), workplace structure
(`der/die Vorgesetzte` as an adjectival noun like `der/die
Angestellte`, `die Führungskraft`, `der Betriebsrat` as a distinctly
German institution, `flache Hierarchien`), self-employment (`sich
selbstständig machen` — the verb phrase, deepening A2's adjective
`selbstständig`; `der/die Freiberufler(in)`, legally narrower than
English "freelancer"; `ein Gewerbe anmelden`), and the soft-skill
vocabulary job ads lean on (`Durchsetzungsvermögen`,
`Verhandlungsgeschick`, `Eigeninitiative`, `interkulturelle
Kompetenz`). `Lebenslauf`, `Anschreiben`, `Probezeit`, and
`selbstständig` (the adjective) were confirmed already covered at
A2 and excluded. Picker walks five career paths; a second "what
would you say?" apply picker for workplace situations — the same
two-picker shape as every B1 topic unit. Same wiring as every prior
unit.

**Unit 12 — Science & Research — done.**
`lessons/b2-wissenschaft.html`, 28-item vocabulary
(`data/vocabulary/b2-wissenschaft.json`), 32-question quiz set.
Checked every candidate word against every prior vocabulary file
first — `der Nachweis`/`nachweisen` (B1 Unit 25, bureaucratic proof),
`die Untersuchung` (A2, medical examination), `veröffentlichen` (B1
media and passive units), and `fördern` (B1 Unit 21, community
support) were already covered in other senses and excluded or
explicitly contrasted rather than reshipped. Organised as a
research pipeline (Forschungsfrage → Stichprobe → Auswertung →
Peer-Review → Publikation) plus a cluster of near-synonyms this
topic is notorious for blurring: `die Forschung` (the field) vs.
`die Studie` (one project), `das Experiment` (a formal controlled
test) vs. `der Versuch` (broader, also "an attempt"), `der Beleg`
(a specific piece of evidence) vs. B1's `der Nachweis` (official
proof), and `publizieren` (formal/academic) vs. B1's
`veröffentlichen`. Explicitly ties together three related terms
across three units: B1's `die Hypothese` (an untested assumption) →
B2 Unit 10's `die These` (an argued claim) → this unit's `die
Erkenntnis` (an established finding). Also covers
`Grundlagenforschung` vs. `angewandte Forschung`,
`reproduzierbar`, `promovieren`/`der Doktortitel`, `die Förderung`,
`das Peer-Review` (loanword), and `widerlegen`. Picker walks the
five-stage research pipeline; a second "tell the pair apart" apply
picker for the near-synonym clusters. Same wiring as every prior
unit.

**Unit 13 — Politics & Society — done.**
`lessons/b2-politik.html`, 28-item vocabulary
(`data/vocabulary/b2-politik.json`), 32-question quiz set. Checked
against B1 Unit 21's Gesellschaft file first — B1 covers civic and
volunteering vocabulary (`das Ehrenamt`, `der Verein`, `die
Zivilgesellschaft`, `sich einsetzen für`, and the basic verb
`wählen`) but nothing about how Germany's political system actually
works. This unit covers that system directly: the electoral and
party landscape (`die Wahl`, `der Wahlkreis`, `die Partei`, `die
Koalition`, `die Opposition`, `der Wähler`, `die
Wahlbeteiligung`), government structure (`die Regierung`, `der
Bundestag`, `der Bundeskanzler` — explicitly noting he's elected by
the Bundestag, not directly by voters, a common point of confusion
— `der/die Abgeordnete` as an adjectival noun like B2 Unit 11's
`der/die Vorgesetzte`, `die Fraktion`), and constitutional concepts
specific to Germany (`das Grundgesetz`, not the generic
`Verfassung`; `die Gewaltenteilung`; `der Rechtsstaat`; `die
Meinungsfreiheit`). Explicitly distinguishes `abstimmen` (voting on
an issue inside a body) from B1's `wählen` (electing a person or
party), and `demonstrieren` from B1's broader `sich einsetzen für`.
Closes with contemporary political-discourse vocabulary
(`der Protest`, `der Populismus`, `der Extremismus`). `der
Kandidat` (A2, taught for N-declension) and `sich engagieren` (B1
Unit 16) were confirmed already covered and excluded or
cross-referenced instead. Picker walks five pieces of how the
system fits together; a second "read the headline" apply picker.
Same wiring as every prior unit.

**Unit 14 — Economy & Globalisation — done.**
`lessons/b2-wirtschaft.html`, 28-item vocabulary
(`data/vocabulary/b2-wirtschaft.json`), 32-question quiz set.
No prior unit covers economics directly, so this was mostly fresh
ground — checked anyway and found one genuine overlap: A2's `der
Zoll` (the customs checkpoint at a border) is reused here in its
distinct economic sense (a tariff on traded goods), explicitly
flagged in the note rather than silently repeated. Covers core
indicators (`die Konjunktur` vs. `das Wachstum`, `die Inflation`,
`die Rezession`, `der Arbeitsmarkt`), trade (`der Export`/`der
Import`, `die Lieferkette`, `der Handel`, `der Freihandel`, `der
Binnenmarkt`, `der Zoll`/`die Strafzölle`), corporate and financial
vocabulary (`der Konzern`, `multinational`, `die Aktie`, `die
Börse`), the `Angebot`/`Nachfrage` pair, and Germany-specific `die
soziale Marktwirtschaft`. Picker walks five economic indicators; a
second "read the headline" apply picker for business-news
scenarios. Same wiring as every prior unit.

**Unit 15 — Media & Digitalisation, Deepened — done.**
`lessons/b2-digitalisierung.html`, 28-item vocabulary
(`data/vocabulary/b2-digitalisierung.json`), 32-question quiz set.
Checked against B1 Unit 17's media/digital file first — B1 covers
the everyday layer (`die Plattform`, `der Algorithmus`, `die
Filterblase`, `der Datenschutz`, `die Falschmeldung`,
`glaubwürdig`, `süchtig`) but nothing about AI, cybersecurity, or
platform regulation. This unit adds that layer: `künstliche
Intelligenz` (explicitly contrasted with B1's `der Algorithmus` —
fixed rules vs. a system that can learn and adapt) and `die
Automatisierung`; a cybersecurity cluster (`die Cybersicherheit`,
`die Cyberkriminalität`, `der Hackerangriff`, `hacken`, `das
Datenleck`, `die Verschlüsselung`); the platform-regulation debate
(`die Hassrede`, `die Zensur`, `die Regulierung`, `die
Netzneutralität`, `Meinungsfreiheit im Netz` — explicitly applying
B2 Unit 13's `die Meinungsfreiheit` to the digital sphere); and
`die Überwachung`, explicitly distinguished from B1's `der
Datenschutz` (the right that's meant to limit it). Also covers
`der Deepfake` and `das Cybermobbing` (loanwords), `der Bot`/`der
Chatbot`, `die digitale Kluft`, `die Big-Tech-Konzerne` (building
on B2 Unit 14's `der Konzern`), and closes by tying `die
Verantwortung der Plattformen` back to B1's `die Falschmeldung`.
Built alongside Unit 14 specifically so the two units' vocabulary
(Konzern, Arbeitsmarkt, multinational) could cross-reference each
other deliberately. Picker walks five digital-security concepts; a
second "follow the debate" apply picker. Same wiring as every prior
unit.

**Unit 16 — Migration & Integration — done.**
`lessons/b2-migration.html`, 28-item vocabulary
(`data/vocabulary/b2-migration.json`), 32-question quiz set. Checked
against B1 Unit 25 (Behörden) first — B1 already covers the
bureaucratic process in depth (Ausländerbehörde, Aufenthaltstitel,
Bescheid, Widerspruch, Antragsteller, etc.), and B1 Unit 21
(Gesellschaft) already covers `die Integration` itself. This unit
deliberately stays off that ground and covers the social and policy
layer instead: migration types (`die Einwanderung`/`die
Auswanderung`, `der Migrationshintergrund`, `die Herkunft`), the
asylum-specific vocabulary B1 didn't cover (`die Flucht`, `der
Flüchtling`, `die Fluchtursache`, `das Asyl`, `der Asylantrag`,
`das Asylrecht` — explicitly tied to B2 Unit 13's `das
Grundgesetz`), citizenship (`die Staatsangehörigkeit`, `die
Einbürgerung`, `die doppelte Staatsbürgerschaft`), and the
discrimination/debate cluster (`die Diskriminierung`, `der
Rassismus`, `das Vorurteil`, `die Willkommenskultur`, and the two
genuinely contested terms `die Leitkultur` and `die
Parallelgesellschaft`, explicitly flagged as disputed rather than
neutral). `die Integration` and `die Vielfalt` (B1 Unit 21) and
`die Heimat` (B1 Unit 24) were confirmed already covered and
excluded; `die Eingliederung` is introduced instead as a more
formal, labour-market-flavoured near-synonym of Integration. Picker
walks one migration story from arrival to citizenship; a second
"recognise the term" apply picker for the contested-vocabulary
cluster. Same wiring as every prior unit.

**Unit 17 — Comparing Education Systems — done, with a scope
correction made before writing any content.**
`lessons/b2-bildungspolitik.html`, 28-item vocabulary
(`data/vocabulary/b2-bildungspolitik.json`), 32-question quiz set.
Checking B1 Unit 8 (Bildung) before starting, as the overlap
discipline established for the grammar backbone now requires,
turned up a much bigger overlap than expected: B1 Unit 8 already
covers the German school system's structure in depth (Grundschule,
Gymnasium, Berufsschule, duale Ausbildung), university
administration (Immatrikulation, Exmatrikulation, ECTS,
Prüfungsordnung, Numerus clausus), and the qualification-recognition
process (Anerkennung, Zeugnisbewertung, Gleichwertigkeit) — exactly
the ground a literal "comparing education systems" unit would have
covered. Rather than reship that content, this unit was
**redirected to the education-policy and debate register instead**:
`die Bildungsgerechtigkeit`, `die Chancengleichheit`, `die
Bildungsungleichheit`, `die PISA-Studie`, teaching-method contrasts
(`der Frontalunterricht` vs. `handlungsorientierter Unterricht`,
`die Ganztagsschule` vs. `die Halbtagsschule`), funding and
structural comparison (`die Bildungsausgaben`, `die Privatschule`
vs. `die öffentliche Schule`, `die Eliteuniversität` — explicitly
noting Germany has no strong tradition of these, unlike some other
countries), and named callbacks to `der Fachkräftemangel` (B2 Unit
11, here as `der Lehrermangel`) and B2 Unit 15's digitalisation
debate (`die Digitalisierung der Schulen`). Every candidate word was
checked individually against every prior vocabulary file and came
back clean — confirming the redirected angle is genuinely new
territory, not just B1 Unit 8 under a different name. Picker walks
five comparative contrasts; a second "name the issue" apply picker
for common policy debates. Same wiring as every prior unit.

## Explicitly out of scope (by design)

- Any backend, database, authentication, or paid/AI API.
- Requiring an account to use or save progress.
