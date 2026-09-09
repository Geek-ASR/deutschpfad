# Local progress storage

`js/progress-store.js` is the only file that reads or writes
`localStorage`. Everything else (lesson pages, the dashboard) goes
through its exported functions — nothing else should call
`localStorage` directly, so this stays the one place the schema and its
invariants are enforced.

## Storage key

One key, `deutschpfad:progress:v1`, holding one JSON object. Not several
keys, so export/import can just be "the whole blob" and there's no risk
of related fields (say, a lesson's completion flag and its quiz history)
getting out of sync from a partial write.

## Shape

```json
{
  "schemaVersion": 1,
  "createdAt": "ISO timestamp",
  "updatedAt": "ISO timestamp",
  "settings": {},
  "streak": { "current": 0, "longest": 0, "lastActiveDate": "YYYY-MM-DD" },
  "lessons": {
    "a1-unit-3-numbers": {
      "completed": true,
      "firstVisited": "ISO timestamp",
      "lastVisited": "ISO timestamp",
      "quizAttempts": 2,
      "quizBest": { "correct": 7, "total": 8 }
    }
  },
  "stories": {
    "a1-der-erste-tag": {
      "completed": true,
      "firstVisited": "ISO timestamp",
      "lastVisited": "ISO timestamp",
      "quizAttempts": 1,
      "quizBest": { "correct": 4, "total": 5 }
    }
  },
  "scenarios": { "bahnhof": { "...": "same shape as lessons/stories" } },
  "listening": { "listening-practice-1": { "...": "same shape as lessons/stories" } },
  "savedWords": {
    "a1-der-erste-tag:universität": {
      "german": "die Universität",
      "english": "university",
      "savedAt": "ISO timestamp"
    }
  },
  "review": {
    "a1-unit-3-numbers:q3": {
      "sourceId": "a1-unit-3-numbers",
      "question": { "...": "a full quiz-engine question object" },
      "box": 2,
      "stage": "learning",
      "nextReviewDate": "YYYY-MM-DD",
      "lastSeen": "YYYY-MM-DD",
      "timesSeen": 3,
      "timesCorrect": 2
    }
  },
  "quizHistory": [
    { "contentId": "a1-unit-3-numbers", "type": "lessons", "date": "ISO timestamp", "correct": 7, "total": 8 },
    { "contentId": "a1-der-erste-tag", "type": "stories", "date": "ISO timestamp", "correct": 4, "total": 5 }
  ]
}
```

`quizHistory` is capped at 50 entries (oldest dropped first) so it can't
grow without bound over months of use. Unlike `lessons`/`stories`/etc.,
it's a shared activity log — every content type's quiz pushes an entry
(via the internal `pushQuizHistory` helper), so "recent quizzes" and
"quiz average" on the dashboard reflect everything. `type` is just the
bucket name (`"lessons"`, `"stories"`, `"scenarios"`, `"listening"`) in
case a caller needs to tell entries apart.

`stories` mirrors the `lessons` shape but is a separate bucket, kept
separate from `quizHistory` and the "lessons completed" count. See
`recordStoryQuizResult` in `js/progress-store.js`.

`savedWords` is a flat personal glossary (the reader's ⭐ button, see
`docs/story-reader.md`) — unrelated to the spaced-review schedule; saving
a word doesn't create a review item.

## One generic activity core, four named buckets

`markLessonVisited`/`markStoryVisited`/`markScenarioVisited`/`markListeningVisited`
and `recordQuizResult`/`recordStoryQuizResult`/`recordScenarioResult`/`recordListeningResult`
are thin, clearly-named wrappers over two internal functions —
`markVisited(bucket, id)` and `recordActivityResult(bucket, id, result)`
— added once a third content type (scenarios) made the duplication
between the first two worth generalizing (see `docs/lesson-engine.md`'s
"rule of three"). Each bucket (`lessons`, `stories`, `scenarios`,
`listening`) stays separate, so "lessons completed" — which drives the
dashboard's estimated-level meter — never gets inflated by finishing a
story, a scenario, or a listening set. They share two internal helpers:
`scheduleReviewFromResponses` (a review item doesn't care which content
type taught it — hence the generic `sourceId`, not `lessonId`) and
`pushQuizHistory` (all four write to the same shared `quizHistory` log,
tagged with `type`, so "recent quizzes" and "quiz average" reflect all
quiz activity, not lessons only).

The public API (the exported `mark*`/`record*` functions) is unchanged
by this refactor — a lesson, story, scenario, or listening page calls
its own named function and never needs to know "bucket" is a string
internally.

## Spaced review: a 5-box Leitner scheduler

Five boxes, intervals **1 / 3 / 7 / 14 / 30 days**, mapped to four
learner-facing stages:

| Box | Interval | Stage shown on the dashboard |
|---|---|---|
| 0 | 1 day | New |
| 1–2 | 3 / 7 days | Learning |
| 3 | 14 days | Review |
| 4 | 30 days | Mastered |

A correct answer advances one box (capped at 4); an incorrect answer
resets to box 0. `nextReviewDate` is recalculated from *today* each time,
not accumulated — so a missed review doesn't compound into a wildly wrong
date.

**Only scored quiz results create or update review items** — practice
and retrieve-step answers (see `docs/quiz-engine.md`'s modes) never touch
the scheduler. This keeps the mental model simple: what gets scheduled
for review is exactly what you were formally quizzed on, not every
button you clicked on the page.

A review item stores a full question-object snapshot at the time it was
first scheduled (see `js/quiz-engine.js`'s `responses[].question`), so a
later review session can feed it straight back into `runQuiz()` without
re-fetching the original lesson's data files.

## Streak

Calculated on the learner's local calendar date, not UTC, so a streak
follows the day as the learner experiences it. Activity is recorded on
every scored quiz completion and every review-session completion.
Same-day activity doesn't double-count; a gap of more than one day resets
`current` to 1 (but `longest` is preserved).

## Export / import

`exportProgressJSON()` returns the entire blob, pretty-printed —
literally what a learner downloads. `importProgressFromObject()` does a
minimal shape check (`schemaVersion`, `lessons`, `review`, and
`quizHistory` must be present and the right type) and, if it passes,
**replaces** local data wholesale — the dashboard's import button confirms
this with the learner first, since it's destructive to whatever was on
that device.

## Corruption handling

`getProgress()` never throws: a missing key, invalid JSON, or a blob
that fails the shape check all fall back to a fresh default rather than
crashing a page. A partially-shaped but plausible object (e.g. missing
`settings`) is repaired by merging onto the defaults rather than
discarded outright.
