# Content model

This defines the shape of `/data` content, so new content is built
against a stable schema instead of ad hoc shapes per file. See "Status"
below for what actually exists today versus what's still just a planned
shape.

## Principles

- Content is data (JSON), not markup. UI code renders it; it doesn't
  contain it.
- Every learning item carries enough metadata to be searchable, linkable,
  and reviewable independently of the page that first introduces it (see
  "knowledge graph" idea in the project brief — vocabulary connects to
  grammar, stories, and scenarios via shared ids/tags, not duplication).
- No source, no entry. Every non-original item needs a `source` and
  `license` (see `CONTENT-LICENSE.md`).

## Vocabulary item

```json
{
  "id": "der-hund",
  "german": "Hund",
  "article": "der",
  "plural": "Hunde",
  "english": "dog",
  "partOfSpeech": "noun",
  "cefr": "A1",
  "topic": "animals",
  "examples": [
    { "de": "Ich habe einen Hund.", "en": "I have a dog." }
  ],
  "audio": null,
  "relatedWords": ["haustier", "welpe"],
  "grammarTags": ["accusative-example"],
  "source": "original",
  "license": "CC-BY-SA-4.0"
}
```

For verbs, `article`/`plural` are replaced with conjugation-relevant
fields (`infinitive`, `separable`, `conjugation`, `commonConstructions`).
For numbers (`partOfSpeech: "number"`), `article`/`plural` are simply
omitted and a `value` field (the integer itself) is added instead — see
`data/vocabulary/numbers.json` for the implemented example.

## Lesson

A lesson is a sequence through the site's core learning loop (discover →
understand → pattern → practice → retrieve → apply → quiz → review). The
schema will reference vocabulary/grammar items by `id` rather than
duplicating their content, e.g.:

```json
{
  "id": "a1-unit-3-numbers",
  "cefr": "A1",
  "unit": 3,
  "title": "Numbers",
  "objective": "I can understand and use numbers in everyday situations.",
  "vocabularyRefs": ["eins", "zwei", "zwanzig", "einundzwanzig"],
  "grammarRefs": ["compound-numbers"],
  "steps": ["discover", "understand", "pattern", "practice", "retrieve", "apply", "quiz"]
}
```

## Grammar note ("Warum?" explanations)

```json
{
  "id": "why-der-die-das",
  "question": "Why der/die/das?",
  "simple": "…",
  "examples": ["…"],
  "technical": "…",
  "relatedGrammar": ["noun-gender"],
  "cefr": "A1"
}
```

## Common fields across content types

| Field | Purpose |
|---|---|
| `id` | stable slug, used for cross-references and localStorage keys |
| `cefr` | A1–C2, drives filtering and level pages |
| `topic` | groups related content (e.g. "animals", "travel") |
| `source` / `license` | provenance — required for anything not original |

## Quiz question sets

Kept separate from lesson files, grouped by which loop step they belong
to. See `docs/quiz-engine.md` for the question-type contract.

```json
{
  "id": "a1-unit-3-numbers-quiz",
  "lessonRef": "a1-unit-3-numbers",
  "practice": [ /* question objects */ ],
  "retrieve": [ /* question objects */ ],
  "quiz": [ /* question objects */ ]
}
```

## Story

`data/stories/<id>.json`. `paragraphs` is an array of paragraphs, each an
array of sentence strings (kept separate from the glossary so the reader
tokenizes and joins them at render time — see `docs/story-reader.md`).
`glossary` keys are the exact lowercased word forms as they appear in the
text (no lemmatizing/stemming — a story is authored against its own
vocabulary, not a dictionary). `comprehension` is a quiz question array
in the same shape as a lesson's quiz set.

```json
{
  "id": "a1-der-erste-tag",
  "title": "Der erste Tag an der Universität",
  "titleEn": "The First Day at University",
  "cefr": "A1",
  "topic": "student-life",
  "source": "original",
  "license": "CC-BY-SA-4.0",
  "paragraphs": [["Heute ist mein erster Tag …", "…"]],
  "glossary": {
    "universität": { "german": "die Universität", "plural": "die Universitäten", "english": "university", "partOfSpeech": "noun" }
  },
  "comprehension": [ /* question objects, same shape as a lesson quiz */ ]
}
```

## History timeline event

`data/history/timeline.json` — a flat array. Each event carries the same
text at two CEFR levels (`simple`/`detailed`) rather than the four levels
sketched in the original project brief — two was enough to demonstrate
the "same event, different level" idea without doubling the historical
research and fact-checking burden per event.

```json
{
  "id": "reunification",
  "yearLabel": "1989–1990",
  "titleEn": "Reunification",
  "titleDe": "Die Wiedervereinigung",
  "simple": { "cefr": "A1", "de": "…", "en": "…" },
  "detailed": { "cefr": "B1", "de": "…", "en": "…" }
}
```

## Geography

`data/geography/germany.json` — one object with `country` (a few
top-level facts), `states` (all 16 Bundesländer, name + capital), and
`cities` (major cities, same `simple`/`detailed` shape as a timeline
event). See `docs/roadmap.md` Phase 4 for why this ships as a fact-based
explorer rather than an SVG map of Germany's actual borders.

## Scenario

`data/scenarios/<id>.json` — a branching dialogue. See
`docs/scenario-engine.md` for how `steps`/`choices`/`next` drive the
conversation.

```json
{
  "id": "bahnhof",
  "title": "Am Bahnhof",
  "titleEn": "At the Train Station",
  "cefr": "A1",
  "situationDe": "…", "situationEn": "…",
  "startStep": "s1",
  "steps": [
    {
      "id": "s1",
      "npc": "Guten Tag! Wie kann ich Ihnen helfen?", "npcEn": "…",
      "choices": [
        { "de": "…", "en": "…", "best": true, "next": "s2" },
        { "de": "…", "en": "…", "best": false, "feedback": "…", "next": "s1" }
      ]
    }
  ],
  "comprehension": [ /* question objects, same shape as a lesson quiz */ ]
}
```

## Listening set

`data/listening/<id>.json` — a flat question array using the
`listening-choice`/`listening-typing` types (`docs/quiz-engine.md`), each
with an `audioText` field that's spoken but never shown as text.

## Mock exam

`data/exams/<id>.json` — a full timed practice test. `sections` is an
array of auto-gradable, timed sections (Hören, Lesen, Schreiben Teil 1
so far), each a question array in the same shape `docs/quiz-engine.md`
defines, run through `js/exam-engine.js`'s `runTimedSection` rather than
`runQuiz` (see that doc for why). A question may carry an optional
`partLabel` (a small "Teil 1"-style heading shown above it when it
changes) and/or `passage: { de, en }` (reference text shown above the
question — a notice, a short letter, a given-facts paragraph for a
form-fill task). `schreibenTeil2` and `sprechen` are separate, plainly
structured blocks for the two skills nothing here can machine-grade —
free writing and speaking both need a person, so they render as
self-check practice (a model answer to compare against; example
prompts to say out loud) instead of pretending to score them.

```json
{
  "id": "a1-mock-exam-1",
  "title": "A1 Mock Exam 1",
  "cefr": "A1",
  "sections": [
    {
      "id": "hoeren",
      "label": "Hören", "labelEn": "Listening",
      "timeLimitSeconds": 600,
      "instructions": "…",
      "questions": [ /* question objects, same shape as a lesson quiz */ ]
    }
  ],
  "schreibenTeil2": { "instructions": "…", "prompts": ["…"], "modelAnswer": "…" },
  "sprechen": { "instructions": "…", "teile": [ { "title": "…", "examples": ["…"] } ] }
}
```

## Pronunciation sound

`data/pronunciation/sounds.json` — a flat array. Most entries have
`examples` directly; a sound with more than one pronunciation rule (only
`ch` so far) uses `variants` instead, each with its own `label`, `tip`,
and `examples`. See `js/pronunciation.js` for how the two shapes render.

## Status

Real and in use: `data/vocabulary/greetings.json` + `data/lessons/a1-unit-1-greetings.json`
+ `data/quizzes/a1-greetings-quiz.json` (the Greetings lesson),
`data/vocabulary/introductions.json` + `data/lessons/a1-unit-2-introductions.json`
+ `data/quizzes/a1-introductions-quiz.json` (the Introducing Yourself
lesson), `data/vocabulary/numbers.json` + `data/lessons/a1-unit-3-numbers.json`
+ `data/quizzes/a1-numbers-quiz.json` (the Numbers lesson),
`data/vocabulary/family.json` + `data/lessons/a1-unit-4-family.json`
+ `data/quizzes/a1-family-quiz.json` (the Family lesson),
`data/vocabulary/colors.json` + `data/lessons/a1-unit-5-colors.json`
+ `data/quizzes/a1-colors-quiz.json` (the Colors lesson),
`data/vocabulary/calendar.json` + `data/lessons/a1-unit-6-calendar.json`
+ `data/quizzes/a1-calendar-quiz.json` (the Days/Months/Seasons lesson),
`data/vocabulary/time.json` + `data/lessons/a1-unit-7-time.json`
+ `data/quizzes/a1-time-quiz.json` (the Time lesson),
`data/vocabulary/food.json` + `data/lessons/a1-unit-8-food.json`
+ `data/quizzes/a1-food-quiz.json` (the Food lesson),
`data/vocabulary/drinks.json` + `data/lessons/a1-unit-9-drinks.json`
+ `data/quizzes/a1-drinks-quiz.json` (the Drinks lesson),
`data/vocabulary/home.json` + `data/lessons/a1-unit-10-home.json`
+ `data/quizzes/a1-home-quiz.json` (the Home lesson),
`data/vocabulary/animals.json` + `data/lessons/a1-unit-11-animals.json`
+ `data/quizzes/a1-animals-quiz.json` (the Animals lesson),
`data/vocabulary/daily-life.json` + `data/lessons/a1-unit-12-daily-life.json`
+ `data/quizzes/a1-daily-life-quiz.json` (the Daily Life lesson — the
twelfth and last of the original topic units),
`data/vocabulary/questions-negation.json` +
`data/lessons/a1-unit-13-questions-negation.json` +
`data/quizzes/a1-questions-negation-quiz.json` (the Questions &
Negation lesson — the first of four grammar units in the A1
exam-readiness expansion, see `docs/roadmap.md`),
`data/vocabulary/pronouns-cases.json` +
`data/lessons/a1-unit-14-pronouns-cases.json` +
`data/quizzes/a1-pronouns-cases-quiz.json` (the Pronouns & Cases
lesson — the second grammar unit),
`data/vocabulary/modal-verbs.json` +
`data/lessons/a1-unit-15-modal-verbs.json` +
`data/quizzes/a1-modal-verbs-quiz.json` (the Modal Verbs lesson — the
third grammar unit), `data/vocabulary/perfekt.json` +
`data/lessons/a1-unit-16-perfekt.json` +
`data/quizzes/a1-perfekt-quiz.json` (the Perfekt lesson — the fourth
and last grammar unit, completing that phase of the expansion),
`data/stories/a1-der-erste-tag.json` (the first story),
`data/history/timeline.json` (7 events), `data/geography/germany.json`
(16 states, 5 cities), `data/scenarios/bahnhof.json` (the first
scenario), `data/listening/practice-1.json` (8 questions),
`data/pronunciation/sounds.json` (11 sounds), and
`data/exams/a1-mock-exam-1.json` and `a1-mock-exam-2.json` (two mock
exams — 25 auto-graded questions each across Hören/Lesen/Schreiben-Teil-1,
plus self-check Schreiben Teil 2 and Sprechen blocks; exam 2 draws on
the six vocabulary-bank-only topics too), and — with no lesson
attached, feeding only the vocabulary
bank — `data/vocabulary/weather.json`, `clothing.json`, `transport.json`,
`body-health.json`, `shopping.json`, and `professions.json` (25 words
each, six exam-relevant topic areas no unit covers, taking the
vocabulary total to 631); and the first A2 unit —
`data/vocabulary/a2-praeteritum.json` + `a2-praeteritum-quiz.json` +
`lessons/a2-praeteritum.html` (Präteritum / simple past), the same
lesson/quiz shapes as the A1 units with no engine changes. Everything
else is still to be written, one unit/story/event/scenario at a time —
see `docs/roadmap.md`'s buildout sections for what's left.

Note that individual compound numbers (21–99, 101–999) are deliberately
*not* stored as vocabulary items — `js/number-words-de.js` generates them
from the ten or so irregular base forms that are, per the project's
"teach the logic, not a list" principle.
