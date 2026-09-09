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
- Every page has exactly one `<h1>` and no skipped heading level —
  verified by an automated outline audit across all 13 pages (Phase 6),
  which caught and fixed two real skips: the footer's sr-only
  "Site"/"Project" headings jumping from h1 straight to h3 on pages
  with no h2 above them, and `explore.html`'s card headings doing the
  same. Both are h2 now, with a shared `.card h2, h3` rule
  (`css/components.css`) so a card's visual size stays consistent
  regardless of which level a given page's outline calls for.
- Every JS-fetched page (lessons, stories, scenarios, history,
  geography, listening, pronunciation, the dashboard) shows an honest
  `<noscript>` message instead of going silently blank when JavaScript
  is disabled or fails to load.

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

## Verified in the Phase 6 polish pass

- **Keyboard-only navigation**, walked end to end rather than
  spot-checked: skip link, the number-builder `<select>`s, a full
  listening question (Play → type → submit, no mouse), and a scenario
  choice — all keyboard-operable. (One automated check flagged the
  `<select>` as unresponsive to a simulated `ArrowDown`; re-testing with
  Puppeteer's dedicated `page.select()` API confirmed the underlying
  `change`-event handling works correctly — the flag was a known
  Puppeteer limitation simulating native OS dropdowns in headless mode,
  not a site bug.)
- **Contrast**, comprehensive final sweep: every color pairing
  introduced through Phase 5, including `opacity: 0.75` text in the
  scenario chat bubbles (computed against its actual blended color, not
  the nominal token — the case most likely to hide a real failure).
  All pass AA.

## Still outstanding

- A real screen-reader pass (VoiceOver/NVDA) — verified so far only via
  ARIA-role/landmark/heading-outline assertions in automated tests, not
  by actually listening to a screen reader read the site.
- Caption/transcript requirement for any audio or video content (the
  Numbers lesson's and Pronunciation Lab's speak buttons use the Web
  Speech API to read text already visible on the page, so no separate
  transcript is needed there — see the listening-questions trade-off
  above for the one place this site intentionally departs from that).
