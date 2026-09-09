# Story reader

`js/story-reader.js` — `renderStoryReader({ container, paragraphs, glossary, storyId })`.
Generic over any story with a paragraphs+glossary shape (see
`docs/content-model.md`), not specific to any one story.

## How word-matching works

A word in the text becomes clickable only if its lowercased form (with
surrounding punctuation stripped) is a key in the story's `glossary`.
There's no lemmatizing or stemming: "heiße" and "heißen" would need
separate glossary entries if both appeared in the text. This is a
deliberate simplicity trade-off — a story's glossary is authored against
the exact word forms it uses, not built from a general dictionary. It
means every story needs its glossary hand-checked against its text, but
avoids the much larger problem of German morphological analysis.

## The popover

One shared popover element (not one per word), positioned near whichever
word was clicked via `getBoundingClientRect`, flipping above the word if
there isn't room below. Shows the German term, plural (if present),
English gloss, a "Listen" button (Web Speech API, hidden entirely if
unsupported rather than shown broken), and a "Save" toggle. Dismisses on
Escape, on an outside click, or when a different word is clicked.

## Saving words

The ⭐ Save button writes to `js/progress-store.js`'s `savedWords` bucket
under the key `${storyId}:${glossaryKey}`, and toggles a `.is-saved` CSS
class on that word's button in the text — which also means a saved
word's highlight persists across visits (checked per-word at render
time), not just for the current session.

## Comprehension quiz and progress

A story's own page script (e.g. `js/story-page.js`) is responsible for
calling `markStoryVisited` and mounting the comprehension quiz via
`js/quiz-engine.js`, with `recordStoryQuizResult` in `onFinish` — the
reader module itself only renders text and handles the popover; it
doesn't know progress tracking exists, the same separation of concerns
as the lesson engine (see `docs/lesson-engine.md`).
