/**
 * Page script for lessons/a1-greetings.html. Lesson-specific glue, same
 * role as js/lesson-numbers-page.js — composes the generic engines
 * (lesson-loop, vocab-card, quiz-engine, picker-widget, speak) plus this
 * lesson's own picker content (time of day, formality, how-are-you).
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "a1-unit-1-greetings";

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

const GREETING_IDS = [
  "greet-hallo",
  "greet-guten-morgen",
  "greet-guten-tag",
  "greet-guten-abend",
  "greet-gute-nacht",
  "greet-tschuess",
  "greet-auf-wiedersehen",
];

const TIME_OPTIONS = [
  { key: "morning", label: "Morning", word: "Guten Morgen", note: "Used from waking up until about 10–11 am." },
  { key: "day", label: "Day", word: "Guten Tag", note: "The standard, all-purpose daytime greeting." },
  { key: "evening", label: "Evening", word: "Guten Abend", note: "Used from around 6 pm onward." },
  { key: "night", label: "Night", word: "Gute Nacht", note: "Not actually a greeting — only said when leaving or going to bed." },
];

const FORMALITY_OPTIONS = [
  { key: "formal", label: "A stranger or your professor", pronoun: "Sie", greeting: "Guten Tag", farewell: "Auf Wiedersehen" },
  { key: "informal", label: "A close friend", pronoun: "du", greeting: "Hallo", farewell: "Tschüss" },
];

const HOWAREYOU_OPTIONS = [
  { key: "good", label: "Good", response: "Mir geht es gut, danke!" },
  { key: "bad", label: "Not great", response: "Mir geht es nicht so gut." },
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

function initTimePicker() {
  initPicker({
    buttonsId: "time-picker-buttons",
    resultId: "time-picker-result",
    options: TIME_OPTIONS,
    renderResult: (option, el) => {
      el.innerHTML = "";
      const word = document.createElement("span");
      word.className = "picker-result-word";
      word.lang = "de";
      word.textContent = option.word;
      el.appendChild(word);
      const speakBtn = createSpeakButton(option.word, "Listen");
      if (speakBtn) el.appendChild(speakBtn);
      const meta = document.createElement("p");
      meta.className = "picker-result-meta";
      meta.textContent = option.note;
      el.appendChild(meta);
    },
  });
}

function initFormalityPicker() {
  initPicker({
    buttonsId: "formality-picker-buttons",
    resultId: "formality-picker-result",
    options: FORMALITY_OPTIONS,
    renderResult: (option, el) => {
      el.innerHTML = "";
      const word = document.createElement("span");
      word.className = "picker-result-word";
      word.lang = "de";
      word.textContent = option.pronoun;
      el.appendChild(word);
      const speakBtn = createSpeakButton(option.pronoun, "Listen");
      if (speakBtn) el.appendChild(speakBtn);
      const meta = document.createElement("p");
      meta.className = "picker-result-meta";
      meta.innerHTML = `Greeting: <span lang="de">${option.greeting}</span> · Farewell: <span lang="de">${option.farewell}</span>`;
      el.appendChild(meta);
    },
  });
}

function initHowAreYouPicker() {
  initPicker({
    buttonsId: "howareyou-picker-buttons",
    resultId: "howareyou-picker-result",
    options: HOWAREYOU_OPTIONS,
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

  initTimePicker();
  initFormalityPicker();
  initHowAreYouPicker();

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("Guten Morgen, Herr Professor!", "Good morning, Professor!"));
  discoverList.appendChild(sentenceCard("Hallo Lena! Wie geht's?", "Hi Lena! How are you?"));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Guten Tag, mein Name ist Aditya.", "Hello, my name is Aditya."));
  applyList.appendChild(sentenceCard("Tschüss! Bis morgen!", "Bye! See you tomorrow!"));
  applyList.appendChild(sentenceCard("Auf Wiedersehen, Frau Professorin.", "Goodbye, Professor."));

  try {
    const vocab = await loadJSON("../data/vocabulary/greetings.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(GREETING_IDS.map(byId).filter(Boolean), document.getElementById("grid-greetings"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-greetings").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/a1-greetings-quiz.json");

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
