# Accessibility

- Semantic HTML first: real `<nav>`, `<main>`, `<header>`, `<footer>`,
  heading hierarchy, and lists — not `<div>` soup with ARIA bolted on.
- Skip-to-content link on every page; visible `:focus-visible` outline
  (a color distinct from the brand blue, for clarity) instead of a
  suppressed default outline.
- `prefers-reduced-motion` is respected globally in `css/base.css` —
  animations and smooth-scroll are disabled, not just shortened.
- German-language text is wrapped in `<span lang="de">` so screen readers
  switch pronunciation correctly instead of reading German words with
  English phonetics.
- Mobile nav toggle is a real `<button>` with `aria-expanded` and
  `aria-controls`, closes on <kbd>Escape</kbd> with focus returned to the
  toggle, and is keyboard-operable without a mouse.
- Color is never the only signal (e.g. `aria-current="page"` plus a
  visual weight change on nav links, not just a color swap).
- Type scale uses `clamp()` for fluid, readable sizing rather than fixed
  pixel sizes that ignore user font-size preferences.
- The lesson stepper (`js/lesson-loop.js`) follows the ARIA tabs pattern
  (`tablist`/`tab`/`tabpanel`, arrow-key navigation, roving `tabindex`),
  verified with a real keyboard-driven test, not just visually.
  `js/quiz-engine.js` announces feedback via `aria-live="polite"` rather
  than relying on sighted users noticing a color change.
- Dashboard review-stage chips (New/Learning/Review/Mastered,
  `dashboard.html`) carry the stage as a text label on every chip, not
  color alone — the left-border color is a secondary cue. Same for the
  quiz engine's correct/incorrect states, which set text ("Correct." /
  "Not quite — the answer is…") alongside color.
- The dashboard's file-import control is a visible `<button>` that
  triggers a fully `hidden` file input via `click()`, not a `<label>`
  wrapping a visually-hidden input — the latter leaves a keyboard user's
  focus ring on an invisible 1px element instead of the button they can
  see.
- The history timeline (`history.html`) and geography city cards
  (`geography.html`) use native `<details>`/`<summary>` for their
  expand/collapse — keyboard operability, screen-reader semantics, and
  the open/closed state all come from the browser instead of a
  hand-rolled ARIA disclosure widget.
- The story reader's word popover (`js/story-reader.js`) has
  `role="dialog"` and an `aria-label` naming the word, moves focus to its
  close button on open, and is dismissible via Escape or an outside
  click — both paths verified with Puppeteer, not just the click-to-open
  path.
- The scenario dialogue transcript (`js/scenario.js`) is an
  `aria-live="polite"` region, so a screen-reader user hears each new
  NPC/learner line as it's added, the same as a sighted user sees it
  appear — not just the final state.

## Known trade-off: listening questions and screen readers

`listening-choice`/`listening-typing` questions (`js/quiz-engine.js`,
`listening.html`) deliberately withhold the spoken text from the visible
page — that's the point of a listening exercise. This is a genuine
accessibility tension for a screen-reader user who is also a Deaf or
hard-of-hearing German learner: the same design that makes the exercise
work for a sighted/hearing learner makes it unusable for them, and
there's no honest fix that doesn't defeat the exercise's purpose (a
visible transcript would just turn it back into a reading question).
Not resolved — noted here rather than papered over. If this becomes a
real barrier for a real user, the likely answer is an explicit
opt-in "show transcript" toggle rather than assuming which case applies.

## Still to verify as features land

- Screen-reader pass (VoiceOver/NVDA) — done informally via ARIA-role
  assertions in Puppeteer tests for the lesson stepper; a real
  screen-reader pass is still outstanding.
- Caption/transcript requirement for any audio or video content (the
  Numbers lesson's and Pronunciation Lab's speak buttons use the Web
  Speech API to read text already visible on the page, so no separate
  transcript is needed there — see the listening-questions trade-off
  above for the one place this site intentionally departs from that).
- Contrast audit once the palette is used in more contexts (badges on
  varied backgrounds, etc.) — done for Phase 1–3 additions (see git
  history for the two token fixes this produced); revisit each phase.
