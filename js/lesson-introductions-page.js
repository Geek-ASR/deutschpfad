/**
 * Page script for lessons/a1-introductions.html.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "a1-unit-2-introductions";

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

const VOCAB_IDS = [
  "intro-heissen",
  "intro-kommen",
  "intro-wohnen",
  "intro-sprechen",
  "intro-studieren",
  "intro-arbeiten",
  "intro-name",
  "intro-land",
  "intro-stadt",
  "intro-sprache",
  "intro-beruf",
  "intro-hobby",
];

// Every regular verb here follows the same rule: drop "-en", add "-e."
// Stored pre-split (not derived) since there are only six and — unlike
// number formation — the "rule" is really just "look at the infinitive
// and chop off two letters," not worth a generation function.
const VERBS = [
  { key: "heissen", label: "heißen", infinitive: "heißen", stem: "heiß", ending: "e", meaning: "to be called" },
  { key: "kommen", label: "kommen", infinitive: "kommen", stem: "komm", ending: "e", meaning: "to come" },
  { key: "wohnen", label: "wohnen", infinitive: "wohnen", stem: "wohn", ending: "e", meaning: "to live" },
  { key: "sprechen", label: "sprechen", infinitive: "sprechen", stem: "sprech", ending: "e", meaning: "to speak" },
  { key: "studieren", label: "studieren", infinitive: "studieren", stem: "studier", ending: "e", meaning: "to study" },
  { key: "arbeiten", label: "arbeiten", infinitive: "arbeiten", stem: "arbeit", ending: "e", meaning: "to work" },
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

function initVerbPicker() {
  initPicker({
    buttonsId: "verb-picker-buttons",
    resultId: "verb-breakdown",
    options: VERBS,
    renderResult: (verb, el) => {
      document.getElementById("verb-infinitive").textContent = `${verb.infinitive} (${verb.meaning})`;

      el.innerHTML = "";
      const stemSpan = document.createElement("span");
      stemSpan.className = "word-breakdown-part";
      stemSpan.dataset.type = "stem";
      stemSpan.lang = "de";
      stemSpan.textContent = verb.stem;
      const endingSpan = document.createElement("span");
      endingSpan.className = "word-breakdown-part";
      endingSpan.dataset.type = "ending";
      endingSpan.lang = "de";
      endingSpan.textContent = verb.ending;
      el.append(stemSpan, endingSpan);

      const result = document.createElement("span");
      result.style.color = "var(--color-ink-soft)";
      result.style.fontSize = "var(--text-base)";
      result.lang = "de";
      result.innerHTML = `= <strong style="color: var(--color-ink)">ich ${verb.stem}${verb.ending}</strong>`;
      el.appendChild(result);

      const speakBtn = createSpeakButton(`ich ${verb.stem}${verb.ending}`, "Listen");
      if (speakBtn) el.appendChild(speakBtn);
    },
  });
}

function initIntroBuilder() {
  const nameInput = document.getElementById("intro-name");
  const countryInput = document.getElementById("intro-country");
  const cityInput = document.getElementById("intro-city");
  const subjectInput = document.getElementById("intro-subject");
  const output = document.getElementById("intro-output");

  function update() {
    const name = nameInput.value.trim();
    const country = countryInput.value.trim();
    const city = cityInput.value.trim();
    const subject = subjectInput.value.trim();

    const sentences = [];
    if (name) sentences.push(`Ich heiße ${name}.`);
    if (country) sentences.push(`Ich komme aus ${country}.`);
    if (city) sentences.push(`Ich wohne in ${city}.`);
    if (subject) sentences.push(`Ich studiere ${subject}.`);

    output.innerHTML = "";
    if (sentences.length === 0) {
      const hint = document.createElement("p");
      hint.style.color = "var(--color-ink-soft)";
      hint.textContent = "Type at least your name to get started.";
      output.appendChild(hint);
      return;
    }

    const combined = sentences.join(" ");
    const word = document.createElement("p");
    word.className = "picker-result-word";
    word.style.fontSize = "var(--text-md)";
    word.lang = "de";
    word.textContent = combined;
    output.appendChild(word);
    const speakBtn = createSpeakButton(combined, "Listen");
    if (speakBtn) output.appendChild(speakBtn);
  }

  [nameInput, countryInput, cityInput, subjectInput].forEach((input) => {
    input.addEventListener("input", update);
  });
  update();
}

async function main() {
  markLessonVisited(LESSON_ID);

  const stepsContainer = document.getElementById("lesson-steps");
  initLessonLoop({ container: stepsContainer, stepLabels: STEP_LABELS });

  initVerbPicker();
  initIntroBuilder();

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("Ich heiße Aditya.", "My name is Aditya."));
  discoverList.appendChild(sentenceCard("Ich komme aus Indien. Ich studiere Informatik.", "I come from India. I study computer science."));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Ich wohne in Berlin.", "I live in Berlin."));
  applyList.appendChild(sentenceCard("Ich spreche Englisch und Hindi.", "I speak English and Hindi."));
  applyList.appendChild(sentenceCard("Ich arbeite als Kellner.", "I work as a waiter."));

  try {
    const vocab = await loadJSON("../data/vocabulary/introductions.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(VOCAB_IDS.map(byId).filter(Boolean), document.getElementById("grid-vocab"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-vocab").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/a1-introductions-quiz.json");

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
