/**
 * Interactive story reader: renders paragraphs of German text with
 * click-to-look-up vocabulary, per a story's glossary. Generic across
 * any story with this shape (paragraphs + glossary) — not specific to
 * any one story, unlike the numbers lesson's page script.
 *
 * A word becomes clickable only if it's a key in the story's glossary
 * (matched case-insensitively, exact inflected form as it appears in
 * the text — there's no stemming/lemmatizing here, so a story's
 * glossary is authored against the specific word forms it actually
 * uses). Anything not in the glossary renders as plain text rather than
 * guessing.
 */

import { speakGerman, speechSupported } from "./speak.js";
import { saveWord, unsaveWord, isWordSaved } from "./progress-store.js";

const WORD_RE = /[A-Za-zÀ-ÖØ-öø-ÿß]+|[^A-Za-zÀ-ÖØ-öø-ÿß]+/g;

function tokenize(text) {
  return text.match(WORD_RE) || [];
}

function isWordToken(tok) {
  return /^[A-Za-zÀ-ÖØ-öø-ÿß]+$/.test(tok);
}

let activePopover = null;

function closePopover() {
  if (activePopover) {
    activePopover.remove();
    activePopover = null;
  }
  document.removeEventListener("click", handleOutsideClick, true);
  document.removeEventListener("keydown", handleEscape, true);
}

function handleOutsideClick(e) {
  if (activePopover && !activePopover.contains(e.target) && e.target.dataset?.storyWordKey === undefined) {
    closePopover();
  }
}

function handleEscape(e) {
  if (e.key === "Escape") closePopover();
}

function openPopover(anchorEl, key, entry, storyId) {
  closePopover();

  const pop = document.createElement("div");
  pop.className = "story-popover";
  pop.setAttribute("role", "dialog");
  pop.setAttribute("aria-label", `Vocabulary: ${entry.german}`);

  const term = document.createElement("p");
  term.className = "story-popover-term";
  term.lang = "de";
  term.textContent = entry.german;
  pop.appendChild(term);

  if (entry.plural) {
    const plural = document.createElement("p");
    plural.className = "story-popover-meta";
    plural.innerHTML = `Plural: <span lang="de">${entry.plural}</span>`;
    pop.appendChild(plural);
  }

  const english = document.createElement("p");
  english.className = "story-popover-english";
  english.textContent = entry.english;
  pop.appendChild(english);

  const actions = document.createElement("div");
  actions.className = "story-popover-actions";

  if (speechSupported()) {
    const listenBtn = document.createElement("button");
    listenBtn.type = "button";
    listenBtn.className = "btn btn-sm btn-secondary";
    listenBtn.textContent = "🔊 Listen";
    listenBtn.addEventListener("click", () => speakGerman(entry.german));
    actions.appendChild(listenBtn);
  }

  const saveKey = `${storyId}:${key}`;
  const saveBtn = document.createElement("button");
  saveBtn.type = "button";
  saveBtn.className = "btn btn-sm btn-secondary";
  const setSaveLabel = () => {
    saveBtn.textContent = isWordSaved(saveKey) ? "★ Saved" : "☆ Save";
  };
  setSaveLabel();
  saveBtn.addEventListener("click", () => {
    if (isWordSaved(saveKey)) {
      unsaveWord(saveKey);
      anchorEl.classList.remove("is-saved");
    } else {
      saveWord(saveKey, { german: entry.german, english: entry.english, plural: entry.plural || null, storyId });
      anchorEl.classList.add("is-saved");
    }
    setSaveLabel();
  });
  actions.appendChild(saveBtn);

  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.className = "story-popover-close";
  closeBtn.setAttribute("aria-label", "Close");
  closeBtn.textContent = "×";
  closeBtn.addEventListener("click", closePopover);

  pop.appendChild(actions);
  pop.appendChild(closeBtn);
  document.body.appendChild(pop);

  const rect = anchorEl.getBoundingClientRect();
  const popRect = pop.getBoundingClientRect();
  let top = window.scrollY + rect.bottom + 8;
  let left = window.scrollX + rect.left;
  const maxLeft = window.scrollX + document.documentElement.clientWidth - popRect.width - 12;
  left = Math.max(window.scrollX + 12, Math.min(left, maxLeft));
  if (rect.bottom + popRect.height + 12 > window.innerHeight) {
    top = window.scrollY + rect.top - popRect.height - 8;
  }
  pop.style.top = `${top}px`;
  pop.style.left = `${left}px`;

  activePopover = pop;
  closeBtn.focus();

  document.addEventListener("click", handleOutsideClick, true);
  document.addEventListener("keydown", handleEscape, true);
}

/**
 * @param {object} opts
 * @param {HTMLElement} opts.container
 * @param {string[][]} opts.paragraphs — arrays of sentences per paragraph
 * @param {Record<string, object>} opts.glossary
 * @param {string} opts.storyId
 */
export function renderStoryReader({ container, paragraphs, glossary, storyId }) {
  container.innerHTML = "";
  paragraphs.forEach((sentences) => {
    const p = document.createElement("p");
    p.className = "story-paragraph";
    p.lang = "de";

    const fullText = sentences.join(" ");
    tokenize(fullText).forEach((tok) => {
      if (isWordToken(tok)) {
        const key = tok.toLowerCase();
        const entry = glossary[key];
        if (entry) {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "story-word";
          if (isWordSaved(`${storyId}:${key}`)) btn.classList.add("is-saved");
          btn.textContent = tok;
          btn.dataset.storyWordKey = key;
          btn.addEventListener("click", (e) => {
            e.stopPropagation();
            openPopover(btn, key, entry, storyId);
          });
          p.appendChild(btn);
          return;
        }
      }
      p.appendChild(document.createTextNode(tok));
    });

    container.appendChild(p);
  });
}
