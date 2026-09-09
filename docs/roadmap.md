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

## Phase 2 — Curriculum engine — next

- Content schema implementation (`/data/vocabulary`, `/data/lessons`)
  per `docs/content-model.md`.
- Lesson engine: renders a lesson through the discover → understand →
  pattern → practice → retrieve → apply → quiz loop.
- Vocabulary engine: structured word cards (article + noun + plural,
  examples, related words), driven by data, not hard-coded HTML.
- Quiz engine: multiple question types (not just multiple choice),
  starting with the A1 Numbers unit as the reference implementation.

## Phase 3 — Local progress

- `localStorage`-backed progress store (lessons done, vocab status,
  streak, settings) — no server, ever.
- Export/import progress as a JSON file.
- Progress dashboard (skills breakdown, honestly labeled as an estimate,
  not a certification).
- Lightweight spaced-review scheduling for vocabulary.

## Phase 4 — Stories, history, geography

- Interactive story reader with click-to-look-up vocabulary.
- German history timeline with level-appropriate text per event.
- Interactive Germany map.

## Phase 5 — Scenarios, listening, pronunciation

- Real-life scenario simulations (train station, university, etc.).
- International-student German module.
- Listening exercises and a pronunciation lab (no external speech API).

## Phase 6 — Polish

- Full accessibility pass, performance pass, error handling, SEO pass.
- Production deployment checklist (see `docs/deployment.md`).

## Explicitly out of scope (by design)

- Any backend, database, authentication, or paid/AI API.
- Requiring an account to use or save progress.
