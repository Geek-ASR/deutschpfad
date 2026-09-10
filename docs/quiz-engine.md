# Quiz engine

`js/quiz-engine.js` — `runQuiz({ container, questions, mode, onFinish })`.
Topic-agnostic: it has no idea what a "number" or a "noun" is, only how to
render a question, evaluate a response, and report a result.

## Question types (today)

- `multiple-choice` — `choices: string[]`, `correctIndex: number`.
- `typing` — `acceptedAnswers: string[]`, free-text input.
- `fill-blank` — like `typing`, plus `sentence: "Text ___ more text"`
  (the `___` is replaced with the input field inline).
- `listening-choice` — like `multiple-choice`, plus `audioText: string`
  (spoken via the Web Speech API through a Play/Replay button; never
  rendered as visible text, so the learner has to actually listen).
- `listening-typing` — like `typing`, plus `audioText`, same Play button.

The two listening types don't get their own evaluator or renderer
branch — internally, `CHOICE_TYPES`/`TEXT_TYPES`/`LISTENING_TYPES` are
just `Set`s that `multiple-choice`/`listening-choice` and
`typing`/`listening-typing` both belong to, so a listening question
*is* a multiple-choice or typing question, plus a Play button prepended
by `renderListenControl()`. `question.prompt` for a listening type
should be a generic instruction ("Listen, then type what you hear"),
never content that gives away `audioText`.

Typed answers are compared with `js/text-match.js`'s `answerMatches()`,
which lowercases, trims, and treats ü/ö/ä/ß as their ASCII substitutes
(ue/oe/ae/ss) — so "dreissig" and "dreißig" both count as correct. This
matters for the target audience: many learners type on keyboards without
easy access to German characters.

## Adding a question type

Two places need a case: `evaluate()` (how to check correctness) and
`renderQuestion()` (how to render the input) — unless the new type is
really a variant of an existing one (as the listening types are), in
which case adding it to the relevant `Set` may be all that's needed.
Everything else — progress display, feedback, scoring, the summary
screen — is shared.

Types not yet implemented, listed in the original project brief:
matching, ordering, sentence construction, translation, article/plural
selection. None were needed yet; add them when a lesson, story, or
scenario actually needs one rather than speculatively.

## Modes

- `"quiz"` — scored, shows a prominent final tally, meant for the
  loop's formal "Quiz" step.
- `"practice"` — same mechanics, softer framing on the summary screen
  (no implication that the score is being recorded anywhere), meant for
  the lower-stakes "Practice"/"Retrieve" steps.

## Persistence

None, by design in this phase — see `docs/lesson-engine.md`'s "Scoring
and persistence" section.

## Reuse beyond `runQuiz`

`renderQuestion`, `evaluate`, and `correctAnswerLabel` are also
exported (not just `runQuiz`). The mock exam (`js/exam-engine.js`,
`docs/roadmap.md`'s A1 exam-readiness expansion) needed the same
question rendering and scoring but a different flow — no feedback
until a whole timed section ends, plus a countdown, to actually
simulate exam conditions rather than `runQuiz`'s instant-feedback
practice loop. Rather than duplicate the rendering logic for every
question type, `js/exam-engine.js` imports these three pieces and
composes its own flow control around them. If a third context ever
needs question rendering with yet another flow, this is the seam to
extend from.
