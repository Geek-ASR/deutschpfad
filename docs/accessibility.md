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

## Still to verify as features land

- Screen-reader pass (VoiceOver/NVDA) once interactive components
  (quizzes, audio players) exist.
- Caption/transcript requirement for any audio or video content.
- Contrast audit once the palette is used in more contexts (badges on
  varied backgrounds, etc.).
