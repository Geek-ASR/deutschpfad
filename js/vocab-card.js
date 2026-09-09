/**
 * Renders a single vocabulary item (per docs/content-model.md) into a
 * card DOM element. Generic across topics — a noun with an article and
 * plural, a number, or a verb should all render sensibly, showing only
 * the fields that are actually present.
 */

import { createSpeakButton } from "./speak.js";

/**
 * @param {object} item a vocabulary item matching the content model
 * @returns {HTMLElement}
 */
export function renderVocabCard(item) {
  const card = document.createElement("article");
  card.className = "vocab-card";
  card.setAttribute("data-vocab-id", item.id);

  const head = document.createElement("div");
  head.className = "vocab-card-head";

  const term = document.createElement("p");
  term.className = "vocab-term";
  term.lang = "de";
  const articlePrefix = item.article ? `${item.article} ` : "";
  term.textContent = `${articlePrefix}${item.german}`;
  head.appendChild(term);

  const speakBtn = createSpeakButton(`${articlePrefix}${item.german}`, "Listen");
  if (speakBtn) head.appendChild(speakBtn);

  card.appendChild(head);

  const english = document.createElement("p");
  english.className = "vocab-english";
  english.textContent = item.english;
  card.appendChild(english);

  if (item.plural) {
    const plural = document.createElement("p");
    plural.className = "vocab-meta";
    plural.innerHTML = `Plural: <span lang="de">${item.plural}</span>`;
    card.appendChild(plural);
  }

  if (Array.isArray(item.examples) && item.examples.length) {
    const examples = document.createElement("ul");
    examples.className = "vocab-examples";
    item.examples.forEach((ex) => {
      const li = document.createElement("li");
      const de = document.createElement("span");
      de.lang = "de";
      de.className = "vocab-example-de";
      de.textContent = ex.de;
      const en = document.createElement("span");
      en.className = "vocab-example-en";
      en.textContent = ex.en;
      li.appendChild(de);
      li.appendChild(en);
      examples.appendChild(li);
    });
    card.appendChild(examples);
  }

  return card;
}

/**
 * Render a list of vocabulary items into a container element.
 * @param {object[]} items
 * @param {HTMLElement} container
 */
export function renderVocabGrid(items, container) {
  container.innerHTML = "";
  container.classList.add("vocab-grid");
  items.forEach((item) => container.appendChild(renderVocabCard(item)));
}
