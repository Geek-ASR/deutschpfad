/**
 * Page script for lessons/a1-numbers.html. This is the one place in the
 * codebase allowed to be lesson-specific glue — it composes the generic
 * engines (lesson-loop, vocab-card, quiz-engine, number-words-de, speak)
 * into this particular lesson's content. If a second lesson needs the
 * same shape, that's the point at which the shared parts here should
 * move into a real generic lesson engine (see docs/lesson-engine.md).
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { numberToGerman } from "./number-words-de.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "a1-unit-3-numbers";

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

async function loadJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
  return res.json();
}

function sentenceCard(deTemplate, enTemplate, number) {
  const li = document.createElement("li");
  li.className = "card";
  const word = numberToGerman(number).word;
  const de = deTemplate.replace("{n}", word);
  const en = enTemplate.replace("{n}", String(number));

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

function renderBreakdown(mountEl, wordMountEl, numberMountEl, result, number) {
  numberMountEl.textContent = String(number);
  wordMountEl.textContent = result.word;
  mountEl.innerHTML = "";
  result.parts.forEach((part) => {
    const span = document.createElement("span");
    span.className = "number-breakdown-part";
    span.dataset.type = part.type;
    span.lang = "de";
    span.textContent = part.text;
    mountEl.appendChild(span);
  });
}

function initNumberBuilder() {
  const onesSelect = document.getElementById("builder-ones");
  const tensSelect = document.getElementById("builder-tens");
  const numberEl = document.getElementById("builder-number");
  const breakdownEl = document.getElementById("builder-breakdown");

  function update() {
    const ones = Number(onesSelect.value);
    const tens = Number(tensSelect.value);
    const n = tens + ones;
    const result = numberToGerman(n);
    numberEl.textContent = String(n);
    breakdownEl.innerHTML = "";
    result.parts.forEach((part) => {
      const span = document.createElement("span");
      span.className = "number-breakdown-part";
      span.dataset.type = part.type;
      span.lang = "de";
      span.textContent = part.text;
      breakdownEl.appendChild(span);
    });
    const speakBtn = createSpeakButton(result.word, "Listen");
    if (speakBtn) {
      speakBtn.classList.add("speak-btn");
      breakdownEl.appendChild(speakBtn);
    }
  }

  onesSelect.addEventListener("change", update);
  tensSelect.addEventListener("change", update);
  update();
}

function initExplorer() {
  const input = document.getElementById("explore-input");
  const output = document.getElementById("explore-output");
  const speakMount = document.getElementById("explore-speak-mount");

  function update() {
    const raw = input.value.trim();
    speakMount.innerHTML = "";
    if (raw === "") {
      output.textContent = "—";
      return;
    }
    const n = Number(raw);
    if (!Number.isInteger(n) || n < 0 || n > 999) {
      output.textContent = "Type a whole number from 0–999.";
      return;
    }
    const result = numberToGerman(n);
    output.textContent = result.word;
    const speakBtn = createSpeakButton(result.word, "Listen");
    if (speakBtn) speakMount.appendChild(speakBtn);
  }

  input.addEventListener("input", update);
}

async function main() {
  markLessonVisited(LESSON_ID);

  // Step navigation works immediately, independent of data loading.
  const stepsContainer = document.getElementById("lesson-steps");
  initLessonLoop({ container: stepsContainer, stepLabels: STEP_LABELS });

  initNumberBuilder();
  initExplorer();

  // Discover + Apply: example sentences built from the same conversion
  // logic taught later, so they can never drift out of sync with it.
  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("Ich bin {n} Jahre alt.", "I am {n} years old.", 21));
  discoverList.appendChild(sentenceCard("Das kostet {n} Euro.", "That costs {n} euros.", 15));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Ich bin {n} Jahre alt.", "I am {n} years old.", 19));
  applyList.appendChild(sentenceCard("Das kostet {n} Euro.", "That costs {n} euros.", 47));
  applyList.appendChild(sentenceCard("Der Kurs hat {n} Studenten.", "The course has {n} students.", 32));

  try {
    const vocab = await loadJSON("../data/vocabulary/numbers.json");
    const byId = (id) => vocab.find((v) => v.id === id);

    renderVocabGrid(
      Array.from({ length: 11 }, (_, n) => byId(`num-${n}`)).filter(Boolean),
      document.getElementById("grid-0-10")
    );
    renderVocabGrid(
      Array.from({ length: 9 }, (_, i) => byId(`num-${i + 11}`)).filter(Boolean),
      document.getElementById("grid-11-19")
    );
    renderVocabGrid(
      [20, 30, 40, 50, 60, 70, 80, 90, 100].map((n) => byId(`num-${n}`)).filter(Boolean),
      document.getElementById("grid-tens")
    );
  } catch (err) {
    console.error(err);
    ["grid-0-10", "grid-11-19", "grid-tens"].forEach((id) => {
      document.getElementById(id).innerHTML =
        '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
    });
  }

  try {
    const quizData = await loadJSON("../data/quizzes/a1-numbers-quiz.json");

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
            : `Saved to your <a href="../dashboard.html">local dashboard</a> — missed items are now scheduled for spaced review. See the next step for how that works.`;
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
