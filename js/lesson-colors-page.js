/**
 * Page script for lessons/a1-colors.html. Lesson-specific glue, same role
 * as js/lesson-family-page.js — composes the generic engines
 * (lesson-loop, vocab-card, quiz-engine, picker-widget, speak) plus this
 * lesson's own picker content (colors, favorite color).
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "a1-unit-5-colors";

const STEP_LABELS = {
  discover: "Discover",
  understand: "Understand",
  pattern: "Pattern",
  practice: "Practice",
  retrieve: "Retrieve",
  apply: "Apply",
  quiz: "Quiz",
  review: "Review",
  "encounter-again": "Again",
};

const COLOR_IDS = [
  "color-rot",
  "color-blau",
  "color-gelb",
  "color-gruen",
  "color-schwarz",
  "color-weiss",
  "color-braun",
  "color-orange",
  "color-rosa",
  "color-lila",
  "color-grau",
  "color-bunt",
];

const COLOR_OPTIONS = [
  { key: "rot", label: "rot", german: "rot", hex: "#c0392b", meaning: "red", example: "Der Apfel ist rot." },
  { key: "blau", label: "blau", german: "blau", hex: "#1f5fa8", meaning: "blue", example: "Der Himmel ist blau." },
  { key: "gelb", label: "gelb", german: "gelb", hex: "#d4ac0d", meaning: "yellow", example: "Die Banane ist gelb." },
  { key: "gruen", label: "grün", german: "grün", hex: "#1e8449", meaning: "green", example: "Das Gras ist grün." },
  { key: "schwarz", label: "schwarz", german: "schwarz", hex: "#1c1c1c", meaning: "black", example: "Meine Tasche ist schwarz." },
  { key: "weiss", label: "weiß", german: "weiß", hex: "#ffffff", meaning: "white", example: "Der Schnee ist weiß." },
  { key: "braun", label: "braun", german: "braun", hex: "#6e4a2e", meaning: "brown", example: "Der Bär ist braun." },
  { key: "orange", label: "orange", german: "orange", hex: "#d35400", meaning: "orange", example: "Die Orange ist orange." },
  { key: "rosa", label: "rosa", german: "rosa", hex: "#d6567f", meaning: "pink", example: "Die Blume ist rosa." },
  { key: "lila", label: "lila", german: "lila", hex: "#7d3c98", meaning: "purple", example: "Die Trauben sind lila." },
  { key: "grau", label: "grau", german: "grau", hex: "#7f8c8d", meaning: "gray", example: "Der Himmel ist heute grau." },
  { key: "bunt", label: "bunt", german: "bunt", hex: null, meaning: "colorful", example: "Der Regenbogen ist bunt." },
];

const FAVORITE_OPTIONS = [
  { key: "blue", label: "Blue", response: "Meine Lieblingsfarbe ist blau." },
  { key: "green", label: "Green", response: "Meine Lieblingsfarbe ist grün." },
  { key: "black", label: "Black", response: "Meine Lieblingsfarbe ist schwarz." },
  { key: "red", label: "Red", response: "Meine Lieblingsfarbe ist rot." },
];

async function loadJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
  return res.json();
}

function sentenceCard(de, en) {
  const li = document.createElement("li");
  li.className = "card";

  const deP = document.createElement("p");
  deP.lang = "de";
  deP.style.fontWeight = "600";
  deP.style.display = "flex";
  deP.style.alignItems = "center";
  deP.style.gap = "0.5rem";
  const deText = document.createElement("span");
  deText.textContent = de;
  deP.appendChild(deText);
  const speakBtn = createSpeakButton(de, "Listen to sentence");
  if (speakBtn) deP.appendChild(speakBtn);

  const enP = document.createElement("p");
  enP.textContent = en;

  li.appendChild(deP);
  li.appendChild(enP);
  return li;
}

function makeSwatch(option) {
  const swatch = document.createElement("span");
  swatch.className = "color-swatch";
  swatch.setAttribute("aria-hidden", "true");
  if (option.hex) {
    swatch.style.backgroundColor = option.hex;
  } else {
    swatch.classList.add("color-swatch--bunt");
  }
  return swatch;
}

function initColorPicker() {
  initPicker({
    buttonsId: "color-picker-buttons",
    resultId: "color-picker-result",
    options: COLOR_OPTIONS,
    renderResult: (option, el) => {
      el.innerHTML = "";
      el.appendChild(makeSwatch(option));
      const word = document.createElement("span");
      word.className = "picker-result-word";
      word.lang = "de";
      word.textContent = option.german;
      el.appendChild(word);
      const speakBtn = createSpeakButton(option.german, "Listen");
      if (speakBtn) el.appendChild(speakBtn);
      const meta = document.createElement("p");
      meta.className = "picker-result-meta";
      meta.innerHTML = `"${option.meaning}" · <span lang="de">${option.example}</span>`;
      el.appendChild(meta);
    },
  });

  // Add a matching swatch beside each picker button's label too.
  const buttonsEl = document.getElementById("color-picker-buttons");
  Array.from(buttonsEl.children).forEach((btn, i) => {
    const option = COLOR_OPTIONS[i];
    btn.style.display = "inline-flex";
    btn.style.alignItems = "center";
    btn.style.gap = "0.5rem";
    btn.prepend(makeSwatch(option));
  });
}

function initFavoritePicker() {
  initPicker({
    buttonsId: "favorite-picker-buttons",
    resultId: "favorite-picker-result",
    options: FAVORITE_OPTIONS,
    renderResult: (option, el) => {
      el.innerHTML = "";
      const word = document.createElement("span");
      word.className = "picker-result-word";
      word.lang = "de";
      word.style.fontSize = "var(--text-md)";
      word.textContent = option.response;
      el.appendChild(word);
      const speakBtn = createSpeakButton(option.response, "Listen");
      if (speakBtn) el.appendChild(speakBtn);
    },
  });
}

async function main() {
  markLessonVisited(LESSON_ID);

  const stepsContainer = document.getElementById("lesson-steps");
  initLessonLoop({ container: stepsContainer, stepLabels: STEP_LABELS });

  initColorPicker();
  initFavoritePicker();

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("Der Himmel ist blau.", "The sky is blue."));
  discoverList.appendChild(sentenceCard("Meine Tasche ist schwarz.", "My bag is black."));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Mein Auto ist rot.", "My car is red."));
  applyList.appendChild(sentenceCard("Die Blätter sind bunt im Herbst.", "The leaves are colorful in autumn."));
  applyList.appendChild(sentenceCard("Ihre neuen Schuhe sind weiß.", "Her new shoes are white."));

  try {
    const vocab = await loadJSON("../data/vocabulary/colors.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(COLOR_IDS.map(byId).filter(Boolean), document.getElementById("grid-colors"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-colors").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/a1-colors-quiz.json");

    runQuiz({
      container: document.getElementById("practice-mount"),
      questions: quizData.practice,
      mode: "practice",
    });

    runQuiz({
      container: document.getElementById("retrieve-mount"),
      questions: quizData.retrieve,
      mode: "practice",
    });

    runQuiz({
      container: document.getElementById("quiz-mount"),
      questions: quizData.quiz,
      mode: "quiz",
      onFinish: (result) => {
        recordQuizResult(LESSON_ID, result);
        const after = document.getElementById("quiz-after");
        after.innerHTML = "";
        const p = document.createElement("p");
        p.className = "status-note";
        p.innerHTML =
          result.correct === result.total
            ? `All correct — saved to your <a href="../dashboard.html">local dashboard</a>. Hit "Try again" any time for another round (it won't overwrite your best score).`
            : `Saved to your <a href="../dashboard.html">local dashboard</a> — missed items are now scheduled for spaced review.`;
        after.appendChild(p);
      },
    });
  } catch (err) {
    console.error(err);
    ["practice-mount", "retrieve-mount", "quiz-mount"].forEach((id) => {
      document.getElementById(id).innerHTML =
        '<p class="quiz-empty">Couldn\'t load quiz data. If you opened this file directly, run it from a local server instead (see the README).</p>';
    });
  }
}

document.addEventListener("DOMContentLoaded", main);
