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

## Status

`data/vocabulary/numbers.json`, `data/lessons/a1-unit-3-numbers.json`,
and `data/quizzes/a1-numbers-quiz.json` are real, in use by
`lessons/a1-numbers.html` — the first data to follow this schema.
Everything else under `/data` is still to be written, one unit at a
time (see `docs/roadmap.md`). Note that individual compound numbers
(21–99, 101–999) are deliberately *not* stored as vocabulary items —
`js/number-words-de.js` generates them from the ten or so irregular base
forms that are, per the project's "teach the logic, not a list"
principle.
