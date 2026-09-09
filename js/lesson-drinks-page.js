/**
 * Page script for lessons/a1-drinks.html. Lesson-specific glue, same role
 * as js/lesson-food-page.js — composes the generic engines (lesson-loop,
 * vocab-card, quiz-engine, picker-widget, speak) plus this lesson's own
 * picker content (ordering a drink, favorite drink).
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "a1-unit-9-drinks";

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

const DRINK_IDS = [
  "drink-wasser",
  "drink-kaffee",
  "drink-tee",
  "drink-saft",
  "drink-limonade",
  "drink-bier",
  "drink-wein",
  "drink-cola",
  "drink-orangensaft",
  "drink-mineralwasser",
  "drink-kakao",
  "drink-getraenk",
  "drink-zucker",
  "drink-eis",
];

// The accusative-indefinite-article form ("ein" for das/die drinks,
// "einen" for der drinks) is baked in per option, demonstrating the
// pattern without needing runtime grammar logic.
const DRINK_PICKER_OPTIONS = [
  { key: "wasser", label: "Wasser", article: "das", accArticle: "ein", german: "Wasser" },
  { key: "kaffee", label: "Kaffee", article: "der", accArticle: "einen", german: "Kaffee" },
  { key: "tee", label: "Tee", article: "der", accArticle: "einen", german: "Tee" },
  { key: "saft", label: "Saft", article: "der", accArticle: "einen", german: "Saft" },
  { key: "limonade", label: "Limonade", article: "die", accArticle: "eine", german: "Limonade" },
  { key: "bier", label: "Bier", article: "das", accArticle: "ein", german: "Bier" },
  { key: "wein", label: "Wein", article: "der", accArticle: "einen", german: "Wein" },
  { key: "cola", label: "Cola", article: "die", accArticle: "eine", german: "Cola" },
];

const FAVORITE_DRINK_OPTIONS = [
  { key: "kaffee", label: "Coffee", response: "Ich hätte gern einen Kaffee." },
  { key: "tee", label: "Tea", response: "Ich hätte gern einen Tee." },
  { key: "wasser", label: "Water", response: "Ich hätte gern ein Wasser." },
  { key: "kakao", label: "Hot chocolate", response: "Ich hätte gern einen Kakao." },
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

function initDrinkPicker() {
  initPicker({
    buttonsId: "drink-picker-buttons",
    resultId: "drink-picker-result",
    options: DRINK_PICKER_OPTIONS,
    renderResult: (option, el) => {
      el.innerHTML = "";
      const sentence = `Ich möchte ${option.accArticle} ${option.german}, bitte.`;
      const word = document.createElement("span");
      word.className = "picker-result-word";
      word.lang = "de";
      word.textContent = sentence;
      el.appendChild(word);
      const speakBtn = createSpeakButton(sentence, "Listen");
      if (speakBtn) el.appendChild(speakBtn);
      const meta = document.createElement("p");
      meta.className = "picker-result-meta";
      meta.textContent = `${option.article} ${option.label} → "${option.accArticle}" in the request`;
      el.appendChild(meta);
    },
  });
}

function initFavoriteDrinkPicker() {
  initPicker({
    buttonsId: "favorite-drink-picker-buttons",
    resultId: "favorite-drink-picker-result",
    options: FAVORITE_DRINK_OPTIONS,
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

  initDrinkPicker();
  initFavoriteDrinkPicker();

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("Ich möchte einen Kaffee, bitte.", "I would like a coffee, please."));
  discoverList.appendChild(sentenceCard("Ich hätte gern ein Wasser.", "I would like a water."));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Ein Tee ohne Zucker, bitte.", "A tea without sugar, please."));
  applyList.appendChild(sentenceCard("Ich hätte gern eine Cola mit Eis.", "I would like a cola with ice."));
  applyList.appendChild(sentenceCard("Was für ein Getränk möchtest du?", "What kind of drink would you like?"));

  try {
    const vocab = await loadJSON("../data/vocabulary/drinks.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(DRINK_IDS.map(byId).filter(Boolean), document.getElementById("grid-drinks"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-drinks").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/a1-drinks-quiz.json");

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
