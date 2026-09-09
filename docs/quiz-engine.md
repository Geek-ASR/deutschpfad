# Quiz engine

`js/quiz-engine.js` — `runQuiz({ container, questions, mode, onFinish })`.
Topic-agnostic: it has no idea what a "number" or a "noun" is, only how to
render a question, evaluate a response, and report a result.

## Question types (today)

- `multiple-choice` — `choices: string[]`, `correctIndex: number`.
- `typing` — `acceptedAnswers: string[]`, free-text input.
- `fill-blank` — like `typing`, plus `sentence: "Text ___ more text"`
  (the `___` is replaced with the input field inline).

Typed answers are compared with `js/text-match.js`'s `answerMatches()`,
which lowercases, trims, and treats ü/ö/ä/ß as their ASCII substitutes
(ue/oe/ae/ss) — so "dreissig" and "dreißig" both count as correct. This
matters for the target audience: many learners type on keyboards without
easy access to German characters.

## Adding a question type

Two places need a case: `evaluate()` (how to check correctness) and
`renderQuestion()` (how to render the input). Everything else — progress
display, feedback, scoring, the summary screen — is shared.

Types not yet implemented, listed in the original project brief: matching,
ordering, sentence construction, translation, listening-based questions,
article/plural selection. None were needed for the Numbers unit; add them
when a lesson actually needs them rather than speculatively.

## Modes

- `"quiz"` — scored, shows a prominent final tally, meant for the
  loop's formal "Quiz" step.
- `"practice"` — same mechanics, softer framing on the summary screen
  (no implication that the score is being recorded anywhere), meant for
  the lower-stakes "Practice"/"Retrieve" steps.

## Persistence

None, by design in this phase — see `docs/lesson-engine.md`'s "Scoring
and persistence" section.
