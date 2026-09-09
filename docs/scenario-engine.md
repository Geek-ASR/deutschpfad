# Scenario engine

`js/scenario.js` — `renderScenario({ container, scenario, onComplete })`.
Generic over any branching-dialogue scenario shaped like
`data/scenarios/bahnhof.json` (see `docs/content-model.md`).

## The interaction model

Each step has one NPC line and 2+ choices. Exactly one choice per step is
marked `best: true`; picking it appends a learner bubble to the
transcript and advances to that choice's `next` step. Picking any other
choice:

- does **not** add a learner bubble (nothing was "said" yet),
- shows its `feedback` text inline for ~2 seconds,
- then re-offers the *same* choices at the *same* step.

There is deliberately no dead end and no scored failure inside the
conversation itself — a learner can only move forward by finding the
appropriate phrase, but wrong choices cost nothing except a few seconds
and a hint. This mirrors the numbers lesson's practice philosophy:
low-stakes retry, not punishment.

## Ending

A choice's `next` can be the sentinel string `"end"` instead of a step
id, which renders a completion message and calls `onComplete()` once.
The page (`js/scenario-page.js` for `scenarios/bahnhof.html`) uses that
callback to reveal and mount the scenario's comprehension quiz — the
engine itself doesn't know a quiz exists, same separation of concerns as
the lesson and story engines.

## What it doesn't do (yet)

No branching *plot* — every path converges back to the same linear
sequence of steps, just with retries. A scenario with real forks (e.g.,
a different but still-valid route to the goal) would need `next` on the
*best* choice to vary too, which the data shape already supports; the
one scenario shipped so far just doesn't use it. Add a second scenario
before generalizing further — the same "don't abstract past one example"
rule as `docs/lesson-engine.md`.
