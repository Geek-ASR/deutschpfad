/**
 * Page script for lessons/a1-family.html. Lesson-specific glue, same role
 * as js/lesson-greetings-page.js — composes the generic engines
 * (lesson-loop, vocab-card, quiz-engine, picker-widget, speak) plus this
 * lesson's own picker content (family members, family size).
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "a1-unit-4-family";

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

const FAMILY_IDS = [
  "fam-vater",
  "fam-mutter",
  "fam-eltern",
  "fam-bruder",
  "fam-schwester",
  "fam-geschwister",
  "fam-grossvater",
  "fam-grossmutter",
];

const FAMILY_OPTIONS = [
  { key: "vater", label: "Vater", article: "der", german: "Vater", possessive: "mein", meaning: "father" },
  { key: "mutter", label: "Mutter", article: "die", german: "Mutter", possessive: "meine", meaning: "mother" },
  { key: "bruder", label: "Bruder", article: "der", german: "Bruder", possessive: "mein", meaning: "brother" },
  { key: "schwester", label: "Schwester", article: "die", german: "Schwester", possessive: "meine", meaning: "sister" },
  { key: "grossvater", label: "Großvater", article: "der", german: "Großvater", possessive: "mein", meaning: "grandfather" },
  { key: "grossmutter", label: "Großmutter", article: "die", german: "Großmutter", possessive: "meine", meaning: "grandmother" },
  { key: "geschwister", label: "Geschwister", article: "die", german: "Geschwister", possessive: "meine", meaning: "siblings (plural)" },
];

const SIZE_OPTIONS = [
  { key: "big", label: "Big", response: "Meine Familie ist groß." },
  { key: "small", label: "Small", response: "Meine Familie ist klein." },
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

function initFamilyPicker() {
  initPicker({
    buttonsId: "family-picker-buttons",
    resultId: "family-picker-result",
    options: FAMILY_OPTIONS,
    renderResult: (option, el) => {
      el.innerHTML = "";
      const word = document.createElement("span");
      word.className = "picker-result-word";
      word.lang = "de";
      word.textContent = `${option.article} ${option.german}`;
      el.appendChild(word);
      const speakBtn = createSpeakButton(`${option.article} ${option.german}`, "Listen");
      if (speakBtn) el.appendChild(speakBtn);
      const meta = document.createElement("p");
      meta.className = "picker-result-meta";
      meta.innerHTML = `"${option.meaning}" · <span lang="de">${option.possessive} ${option.german}</span> ("my ${option.meaning}")`;
      el.appendChild(meta);
    },
  });
}

function initSizePicker() {
  initPicker({
    buttonsId: "size-picker-buttons",
    resultId: "size-picker-result",
    options: SIZE_OPTIONS,
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

  initFamilyPicker();
  initSizePicker();

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("Das ist mein Vater.", "This is my father."));
  discoverList.appendChild(sentenceCard("Das ist meine Schwester.", "This is my sister."));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Ich habe zwei Geschwister.", "I have two siblings."));
  applyList.appendChild(sentenceCard("Meine Eltern wohnen in Indien.", "My parents live in India."));
  applyList.appendChild(sentenceCard("Mein Onkel besucht uns im Sommer.", "My uncle visits us in summer."));

  try {
    const vocab = await loadJSON("../data/vocabulary/family.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(FAMILY_IDS.map(byId).filter(Boolean), document.getElementById("grid-family"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-family").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/a1-family-quiz.json");

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
