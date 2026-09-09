/**
 * Page script for lessons/a1-food.html. Lesson-specific glue, same role
 * as js/lesson-time-page.js — composes the generic engines (lesson-loop,
 * vocab-card, quiz-engine, picker-widget, speak) plus this lesson's own
 * picker content (foods with gern, favorite food).
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "a1-unit-8-food";

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

const FOOD_IDS = [
  "food-apfel",
  "food-banane",
  "food-brot",
  "food-kaese",
  "food-milch",
  "food-ei",
  "food-reis",
  "food-nudeln",
  "food-gemuese",
  "food-salat",
  "food-suppe",
  "food-fleisch",
  "food-fisch",
  "food-pizza",
  "food-kuchen",
  "food-obst",
];

const FOOD_PICKER_OPTIONS = [
  { key: "apfel", label: "Apfel", article: "der", german: "Äpfel", meaning: "apples" },
  { key: "brot", label: "Brot", article: "das", german: "Brot", meaning: "bread" },
  { key: "kaese", label: "Käse", article: "der", german: "Käse", meaning: "cheese" },
  { key: "nudeln", label: "Nudeln", article: "die", german: "Nudeln", meaning: "pasta" },
  { key: "gemuese", label: "Gemüse", article: "das", german: "Gemüse", meaning: "vegetables" },
  { key: "suppe", label: "Suppe", article: "die", german: "Suppe", meaning: "soup" },
  { key: "fisch", label: "Fisch", article: "der", german: "Fisch", meaning: "fish" },
  { key: "kuchen", label: "Kuchen", article: "der", german: "Kuchen", meaning: "cake" },
];

const FAVORITE_FOOD_OPTIONS = [
  { key: "pizza", label: "Pizza", response: "Ich esse am liebsten Pizza." },
  { key: "kuchen", label: "Cake", response: "Ich esse am liebsten Kuchen." },
  { key: "obst", label: "Fruit", response: "Ich esse am liebsten Obst." },
  { key: "fisch", label: "Fish", response: "Ich esse am liebsten Fisch." },
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

function initFoodPicker() {
  initPicker({
    buttonsId: "food-picker-buttons",
    resultId: "food-picker-result",
    options: FOOD_PICKER_OPTIONS,
    renderResult: (option, el) => {
      el.innerHTML = "";
      const sentence = `Ich esse gern ${option.german}.`;
      const word = document.createElement("span");
      word.className = "picker-result-word";
      word.lang = "de";
      word.textContent = sentence;
      el.appendChild(word);
      const speakBtn = createSpeakButton(sentence, "Listen");
      if (speakBtn) el.appendChild(speakBtn);
      const meta = document.createElement("p");
      meta.className = "picker-result-meta";
      meta.textContent = `"I like eating ${option.meaning}." — ${option.article} ${option.label}`;
      el.appendChild(meta);
    },
  });
}

function initFavoriteFoodPicker() {
  initPicker({
    buttonsId: "favorite-food-picker-buttons",
    resultId: "favorite-food-picker-result",
    options: FAVORITE_FOOD_OPTIONS,
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

  initFoodPicker();
  initFavoriteFoodPicker();

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("Ich esse gern Pizza.", "I like eating pizza."));
  discoverList.appendChild(sentenceCard("Was isst du am liebsten?", "What do you like eating best?"));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Ich esse lieber Nudeln als Reis.", "I prefer eating pasta to rice."));
  applyList.appendChild(sentenceCard("Er isst kein Fleisch.", "He doesn't eat meat."));
  applyList.appendChild(sentenceCard("Zum Frühstück esse ich Brot und ein Ei.", "For breakfast I eat bread and an egg."));

  try {
    const vocab = await loadJSON("../data/vocabulary/food.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(FOOD_IDS.map(byId).filter(Boolean), document.getElementById("grid-food"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-food").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/a1-food-quiz.json");

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
