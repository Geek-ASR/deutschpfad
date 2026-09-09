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
`data/stories/a1-der-erste-tag.json` (the first story),
`data/history/timeline.json` (7 events), `data/geography/germany.json`
(16 states, 5 cities), `data/scenarios/bahnhof.json` (the first
scenario), `data/listening/practice-1.json` (8 questions), and
`data/pronunciation/sounds.json` (11 sounds). Everything else is still
to be written, one unit/story/event/scenario at a time — see
`docs/roadmap.md`'s "A1 curriculum buildout" table for what's left.

Note that individual compound numbers (21–99, 101–999) are deliberately
*not* stored as vocabulary items — `js/number-words-de.js` generates them
from the ten or so irregular base forms that are, per the project's
"teach the logic, not a list" principle.
