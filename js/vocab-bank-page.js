/**
 * Page script for vocabulary.html. Loads every vocabulary file the site
 * has (all twelve topic units plus the four grammar units), and lets a
 * learner filter/search across all of it, study it as flashcards, or
 * generate an on-the-spot typing quiz from whatever's currently
 * filtered.
 *
 * Reuses the existing engines rather than inventing new ones:
 *  - js/vocab-card.js's renderVocabGrid for the "Browse list" view —
 *    identical to what every lesson's vocabulary grid already renders.
 *  - js/quiz-engine.js's runQuiz for "Quiz me" — the generated questions
 *    are plain "typing" questions, the same shape every lesson quiz
 *    already uses, so the engine needs no changes and results feed the
 *    same spaced-review schedule (js/progress-store.js's
 *    recordVocabPracticeResult, a thin wrapper parallel to
 *    recordQuizResult).
 * The flashcard view is the one genuinely new piece of UI here — a
 * single-card, front/back study interaction that doesn't exist
 * elsewhere on the site.
 */

import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { createSpeakButton } from "./speak.js";
import { recordVocabPracticeResult } from "./progress-store.js";

const TOPICS = [
  { topic: "greetings", label: "Greetings" },
  { topic: "introductions", label: "Introducing Yourself" },
  { topic: "numbers", label: "Numbers" },
  { topic: "family", label: "Family" },
  { topic: "colors", label: "Colors" },
  { topic: "calendar", label: "Days, Months & Seasons" },
  { topic: "time", label: "Time" },
  { topic: "food", label: "Food" },
  { topic: "drinks", label: "Drinks" },
  { topic: "home", label: "Home" },
  { topic: "animals", label: "Animals" },
  { topic: "daily-life", label: "Daily Life" },
  { topic: "questions-negation", label: "Questions & Negation" },
  { topic: "pronouns-cases", label: "Pronouns & Cases" },
  { topic: "modal-verbs", label: "Modal Verbs" },
  { topic: "perfekt", label: "Perfekt (Past Tense)" },
  { topic: "weather", label: "Weather" },
  { topic: "clothing", label: "Clothing" },
  { topic: "transport", label: "Transport & Directions" },
  { topic: "body-health", label: "Body & Health" },
  { topic: "shopping", label: "Shopping & Money" },
  { topic: "professions", label: "Professions" },
  { topic: "a2-praeteritum", label: "A2 · Präteritum" },
  { topic: "a2-comparatives", label: "A2 · Comparatives" },
  { topic: "a2-two-way-prepositions", label: "A2 · Two-Way Prepositions" },
  { topic: "a2-subordinate-clauses", label: "A2 · Subordinate Clauses" },
  { topic: "a2-reflexive-verbs", label: "A2 · Reflexive Verbs" },
  { topic: "a2-dative-prepositions", label: "A2 · Dative-only Prepositions" },
  { topic: "a2-travel-holidays", label: "A2 · Travel & Holidays" },
  { topic: "a2-city-life", label: "A2 · City Life & Getting Around" },
  { topic: "a2-health-body", label: "A2 · Health & the Body" },
  { topic: "a2-genitiv", label: "A2 · The Genitiv" },
  { topic: "a2-work", label: "A2 · Work & Job-Hunting" },
  { topic: "a2-adjective-endings", label: "A2 · Adjective Endings" },
  { topic: "a2-konjunktiv-2", label: "A2 · The Konjunktiv II" },
  { topic: "a2-adjective-endings-ein", label: "A2 · Adjective Endings (ein/kein)" },
  { topic: "a2-passive-amt", label: "A2 · The Passive & the Amt" },
  { topic: "a2-adjective-endings-none", label: "A2 · Adjective Endings (no article)" },
  { topic: "a2-relative-clauses", label: "A2 · Relative Clauses" },
  { topic: "a2-zu-infinitive", label: "A2 · zu + Infinitive" },
  { topic: "a2-n-declension", label: "A2 · The n-Declension" },
  { topic: "a2-verbs-prepositions", label: "A2 · Verbs + Prepositions" },
  { topic: "a2-temporal-clauses", label: "A2 · Temporal Clauses" },
  { topic: "a2-connectors-adjectival-nouns", label: "A2 · Connectors & Adjectival Nouns" },
];
const TOPIC_LABEL = Object.fromEntries(TOPICS.map((t) => [t.topic, t.label]));

// Quiz questions are always "type the German word for <english>" — every
// existing lesson quiz already follows this convention, and it breaks
// down for "phrase" entries (things like "Wo ist...?" or "Ich möchte...",
// which don't reduce to one clean typed answer), so those are excluded
// from the generated quiz pool. They're still fully visible in
// flashcards and the browse list.
const QUIZABLE_POS = new Set([
  "noun", "verb", "adjective", "adverb", "number",
  "interjection", "pronoun", "determiner", "preposition", "particle",
]);
const MAX_QUIZ_QUESTIONS = 20;

let allWords = [];
let filtered = [];
let cardIndex = 0;
let revealed = false;
let direction = "de-en"; // "de-en" shows German first, "en-de" shows English first
let currentView = "flashcards";

async function loadJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
  return res.json();
}

function shuffle(arr) {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function stripForMatch(str) {
  return str.replace(/[.?!]+$/g, "").trim();
}

function toQuizQuestion(word) {
  const answers = [stripForMatch(word.german)];
  if (word.article) answers.push(stripForMatch(`${word.article} ${word.german}`));
  return {
    id: word.id,
    type: "typing",
    prompt: `Type the German word for "${word.english}."`,
    acceptedAnswers: answers,
  };
}

function populateTopicSelect() {
  const select = document.getElementById("vb-topic-select");
  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "All topics";
  select.appendChild(allOption);
  TOPICS.forEach(({ topic, label }) => {
    const option = document.createElement("option");
    option.value = topic;
    option.textContent = label;
    select.appendChild(option);
  });
}

function applyFilters() {
  const topic = document.getElementById("vb-topic-select").value;
  const query = document.getElementById("vb-search-input").value.trim().toLowerCase();

  filtered = allWords.filter((w) => {
    if (topic !== "all" && w.topic !== topic) return false;
    if (query) {
      const haystack = `${w.german} ${w.english} ${w.article || ""}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });

  cardIndex = 0;
  revealed = false;
  document.getElementById("vb-count").textContent =
    `${filtered.length} word${filtered.length === 1 ? "" : "s"}`;

  renderFlashcard();
  if (currentView === "browse") renderBrowse();
}

function renderBrowse() {
  renderVocabGrid(filtered, document.getElementById("vb-browse-grid"));
}

function frontOf(word) {
  return direction === "en-de" ? word.english : `${word.article ? word.article + " " : ""}${word.german}`;
}

function backOf(word) {
  return direction === "en-de" ? `${word.article ? word.article + " " : ""}${word.german}` : word.english;
}

function renderFlashcard() {
  const mount = document.getElementById("vb-flashcard-mount");
  const progress = document.getElementById("vb-flashcard-progress");
  mount.innerHTML = "";

  if (filtered.length === 0) {
    progress.textContent = "";
    const p = document.createElement("p");
    p.className = "flashcard-empty";
    p.textContent = "No words match this filter.";
    mount.appendChild(p);
    return;
  }

  const word = filtered[cardIndex];
  progress.textContent = `${cardIndex + 1} of ${filtered.length} — ${TOPIC_LABEL[word.topic] || word.topic}`;

  const front = document.createElement("p");
  front.className = "flashcard-front";
  if (direction === "de-en") front.lang = "de";
  front.textContent = frontOf(word);
  mount.appendChild(front);

  if (direction === "de-en") {
    const speakBtn = createSpeakButton(frontOf(word), "Listen");
    if (speakBtn) mount.appendChild(speakBtn);
  }

  document.getElementById("vb-reveal-btn").textContent = revealed ? "Hide answer" : "Show answer";

  if (!revealed) {
    const hint = document.createElement("p");
    hint.className = "flashcard-hint";
    hint.textContent = 'Try to recall it, then click "Show answer."';
    mount.appendChild(hint);
    return;
  }

  const back = document.createElement("div");
  back.className = "flashcard-back";

  const backMain = document.createElement("p");
  backMain.className = "flashcard-back-main";
  if (direction === "en-de") backMain.lang = "de";
  backMain.textContent = backOf(word);
  back.appendChild(backMain);

  if (direction === "en-de") {
    const speakBtn = createSpeakButton(backOf(word), "Listen");
    if (speakBtn) back.appendChild(speakBtn);
  }

  if (word.plural) {
    const p = document.createElement("p");
    p.className = "flashcard-meta";
    p.innerHTML = `Plural: <span lang="de">${word.plural}</span>`;
    back.appendChild(p);
  }

  if (Array.isArray(word.examples) && word.examples.length) {
    const ul = document.createElement("ul");
    ul.className = "flashcard-examples";
    word.examples.forEach((ex) => {
      const li = document.createElement("li");
      const de = document.createElement("span");
      de.className = "vocab-example-de";
      de.lang = "de";
      de.textContent = ex.de;
      const en = document.createElement("span");
      en.className = "vocab-example-en";
      en.textContent = ex.en;
      li.appendChild(de);
      li.appendChild(en);
      ul.appendChild(li);
    });
    back.appendChild(ul);
  }

  mount.appendChild(back);
}

function goNext() {
  if (filtered.length === 0) return;
  cardIndex = (cardIndex + 1) % filtered.length;
  revealed = false;
  renderFlashcard();
}

function goPrev() {
  if (filtered.length === 0) return;
  cardIndex = (cardIndex - 1 + filtered.length) % filtered.length;
  revealed = false;
  renderFlashcard();
}

function switchView(view) {
  currentView = view;
  const flashView = document.getElementById("vb-flashcard-view");
  const browseView = document.getElementById("vb-browse-view");
  const flashBtn = document.getElementById("vb-view-flashcards");
  const browseBtn = document.getElementById("vb-view-browse");

  flashView.hidden = view !== "flashcards";
  browseView.hidden = view !== "browse";
  flashBtn.classList.toggle("is-active", view === "flashcards");
  flashBtn.setAttribute("aria-selected", String(view === "flashcards"));
  browseBtn.classList.toggle("is-active", view === "browse");
  browseBtn.setAttribute("aria-selected", String(view === "browse"));

  if (view === "browse") renderBrowse();
}

function startQuiz() {
  const pool = filtered.filter((w) => QUIZABLE_POS.has(w.partOfSpeech));
  const quizMount = document.getElementById("vb-quiz-mount");
  const afterMount = document.getElementById("vb-quiz-after");
  afterMount.innerHTML = "";

  if (pool.length === 0) {
    quizMount.innerHTML =
      '<p class="quiz-empty">No quizzable words in this filter — try a broader unit or clearing the search.</p>';
    return;
  }

  const sample = shuffle(pool).slice(0, Math.min(MAX_QUIZ_QUESTIONS, pool.length));
  const questions = sample.map(toQuizQuestion);

  runQuiz({
    container: quizMount,
    questions,
    mode: "quiz",
    onFinish: (result) => {
      recordVocabPracticeResult(result);
      const p = document.createElement("p");
      p.className = "status-note";
      p.innerHTML =
        result.correct === result.total
          ? `All correct — saved to your <a href="dashboard.html">local dashboard</a>. Hit "Try again" any time for another round.`
          : `Saved to your <a href="dashboard.html">local dashboard</a> — missed words are now scheduled for spaced review.`;
      afterMount.appendChild(p);
    },
  });
}

function wireControls() {
  document.getElementById("vb-topic-select").addEventListener("change", applyFilters);
  document.getElementById("vb-search-input").addEventListener("input", applyFilters);

  document.getElementById("vb-view-flashcards").addEventListener("click", () => switchView("flashcards"));
  document.getElementById("vb-view-browse").addEventListener("click", () => switchView("browse"));

  document.getElementById("vb-prev-btn").addEventListener("click", goPrev);
  document.getElementById("vb-next-btn").addEventListener("click", goNext);
  document.getElementById("vb-shuffle-btn").addEventListener("click", () => {
    filtered = shuffle(filtered);
    cardIndex = 0;
    revealed = false;
    renderFlashcard();
  });
  document.getElementById("vb-reveal-btn").addEventListener("click", () => {
    revealed = !revealed;
    renderFlashcard();
  });

  document.getElementById("vb-direction-btn").addEventListener("click", (e) => {
    direction = direction === "de-en" ? "en-de" : "de-en";
    e.target.textContent = direction === "de-en" ? "Show German first" : "Show English first";
    revealed = false;
    renderFlashcard();
  });

  document.getElementById("vb-quiz-btn").addEventListener("click", startQuiz);
}

async function main() {
  try {
    const files = await Promise.all(TOPICS.map((t) => loadJSON(`data/vocabulary/${t.topic}.json`)));
    allWords = files.flat();
  } catch (err) {
    console.error(err);
    document.getElementById("vb-loading").hidden = true;
    document.getElementById("vb-empty").hidden = false;
    return;
  }

  populateTopicSelect();
  wireControls();
  applyFilters();

  document.getElementById("vb-loading").hidden = true;
  document.getElementById("vb-content").hidden = false;
}

document.addEventListener("DOMContentLoaded", main);
