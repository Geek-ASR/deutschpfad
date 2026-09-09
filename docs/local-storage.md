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
    { "lessonId": "a1-unit-3-numbers", "date": "ISO timestamp", "correct": 7, "total": 8 }
  ]
}
```

`quizHistory` is capped at 50 entries (oldest dropped first) so it can't
grow without bound over months of use, and is lesson-only by design —
see "Lessons vs. stories" below.

`stories` mirrors the `lessons` shape but is a separate bucket, kept
separate from `quizHistory` and the "lessons completed" count. See
`recordStoryQuizResult` in `js/progress-store.js`.

`savedWords` is a flat personal glossary (the reader's ⭐ button, see
`docs/story-reader.md`) — unrelated to the spaced-review schedule; saving
a word doesn't create a review item.

## Lessons vs. stories

`recordQuizResult` (lessons) and `recordStoryQuizResult` (stories) are
separate functions writing separate buckets, so "lessons completed" —
which drives the dashboard's estimated-level meter — never gets inflated
by finishing a story's comprehension quiz. They share one thing: both
call the same internal `scheduleReviewFromResponses` helper, because a
vocabulary item scheduled for spaced review doesn't care whether a lesson
or a story taught it. That's also why a review item's source field is
named generically — `sourceId`, not `lessonId`.

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
