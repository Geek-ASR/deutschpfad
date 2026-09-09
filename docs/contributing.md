# Contributing

## Principles

- No framework, no build step, no new dependencies without a clear reason
  — see `docs/architecture.md` before proposing a stack change.
- Content is data, not markup: new lessons/vocabulary/stories go in
  `/data` as JSON per `docs/content-model.md`, not hard-coded into HTML.
- Every non-original piece of content needs `source` and `license` fields
  — see `CONTENT-LICENSE.md`. If provenance can't be verified, it doesn't
  go in.
- No feature ships as a mockup. If something can't be made to actually
  work yet, it's left out rather than faked.

## Workflow

- Small, incremental commits with short, descriptive messages (see the
  existing git log for the style).
- Run the site locally before committing: `python3 -m http.server 8000`
  (or any static file server) — there's no build step to run.
- Check new pages for: valid internal links, keyboard navigability, and
  that headings/landmarks stay semantic.

## Git identity / AI assistance

This project is maintained by Aditya Rekhe. Development has used AI
assistance (Claude Code); commits are made under the maintainer's own git
identity, with changes reviewed before committing. This is disclosed here
and in `about.html` rather than concealed.
