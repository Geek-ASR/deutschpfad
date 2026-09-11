/**
 * Page script for lessons/b1-ernaehrung.html — B1 Unit 23 (topic unit).
 * The "topic" picker walks core food-discourse ideas (diet, labels,
 * waste, allergies, meat/farming); the "habit" picker answers "how do
 * you shop and eat?" No new CSS.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "b1-unit-23-ernaehrung";

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

const ERN_IDS = [
  "ern-ernaehrung", "ern-lebensmittel", "ern-lebensmittelverschwendung",
  "ern-mindesthaltbarkeitsdatum", "ern-inhaltsstoffe", "ern-kennzeichnung",
  "ern-unvertraeglichkeit", "ern-allergie", "ern-massentierhaltung",
  "ern-fleischkonsum", "ern-konsumverhalten", "ern-bio-lebensmittel",
  "ern-fertiggericht", "ern-verzehr", "ern-nahrungsmittelindustrie",
  "ern-geschmack", "ern-gesund", "ern-nachhaltig", "ern-regional",
  "ern-saisonal", "ern-verarbeitet", "ern-sich-ernaehren", "ern-vertragen",
  "ern-verzichten", "ern-konsumieren", "ern-verschwenden",
  "ern-zubereiten", "ern-geniessen",
];

const TOPICS = [
  { key: "ernaehrung", moment: "Talking about how you eat", line: "Ich ernähre mich hauptsächlich vegetarisch, aber ich achte auch auf eine ausgewogene Ernährung.", note: "\"sich ernähren von\" + Dat — the standard verb for describing your diet." },
  { key: "mhd", moment: "Reading a food label", line: "Das Mindesthaltbarkeitsdatum ist abgelaufen, aber das Lebensmittel ist oft noch genießbar.", note: "the MHD (best-before date) isn't the same as an expiry date — many foods are fine to eat after it." },
  { key: "verschwendung", moment: "Talking about food waste", line: "In Deutschland werden jedes Jahr Millionen Tonnen Lebensmittel verschwendet.", note: "Lebensmittelverschwendung is a major topic connecting food, economics, and the environment (Unit 16)." },
  { key: "unvertraeglichkeit", moment: "Talking about allergies and intolerances", line: "Sie hat eine Laktoseintoleranz und verträgt deshalb keine Milchprodukte.", note: "\"etwas (nicht) vertragen\" is the key verb — different from \"mögen\" (to like)." },
  { key: "fleischkonsum", moment: "Talking about meat and farming", line: "Viele Menschen reduzieren ihren Fleischkonsum aus Sorge um Massentierhaltung und Klima.", note: "this discussion links directly to Unit 16's climate vocabulary — a common essay topic combination." },
];

const HABITS = [
  { key: "einkaufen", label: "Beim Einkaufen", response: "Ich kaufe möglichst regional und saisonal ein und achte auf die Inhaltsstoffe." },
  { key: "kochen", label: "Beim Kochen", response: "Ich bereite mein Essen meistens selbst zu, statt Fertiggerichte zu kaufen." },
  { key: "verschwendung", label: "Gegen Verschwendung", response: "Ich plane meine Einkäufe, damit ich weniger Lebensmittel verschwende." },
  { key: "genuss", label: "Genuss", response: "Ich genieße gutes Essen, aber ich versuche auch, meinen Fleischkonsum zu reduzieren." },
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

function initTopicPicker() {
  initPicker({
    buttonsId: "topic-picker-buttons",
    resultId: "topic-picker-result",
    options: TOPICS,
    renderResult: (option, el) => {
      el.innerHTML = "";

      const heading = document.createElement("span");
      heading.className = "picker-result-word";
      heading.textContent = option.moment;
      el.appendChild(heading);

      const line = document.createElement("p");
      line.lang = "de";
      line.style.width = "100%";
      line.style.margin = "0";
      line.style.fontSize = "var(--text-md)";
      line.style.lineHeight = "1.9";
      line.textContent = option.line;
      el.appendChild(line);

      const note = document.createElement("p");
      note.className = "picker-result-meta";
      note.style.width = "100%";
      note.style.marginTop = "var(--space-2)";
      note.textContent = option.note;
      el.appendChild(note);

      const speakBtn = createSpeakButton(option.line, "Listen");
      if (speakBtn) el.appendChild(speakBtn);
    },
  });
}

function initHabitPicker() {
  initPicker({
    buttonsId: "habit-picker-buttons",
    resultId: "habit-picker-result",
    options: HABITS,
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

  initTopicPicker();
  initHabitPicker();

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("Eine ausgewogene Ernährung besteht aus viel Gemüse, Obst und wenig verarbeiteten Lebensmitteln.", "A balanced diet consists of lots of vegetables, fruit, and few processed foods."));
  discoverList.appendChild(sentenceCard("Immer mehr Menschen achten beim Einkaufen auf die Kennzeichnung und die Inhaltsstoffe.", "More and more people pay attention to labeling and ingredients when shopping."));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Statt Fertiggerichte zu kaufen, bereite ich mein Essen meistens selbst zu.", "Instead of buying ready-made meals, I usually prepare my food myself."));
  applyList.appendChild(sentenceCard("Um Lebensmittelverschwendung zu vermeiden, plane ich meine Einkäufe genau.", "To avoid food waste, I plan my shopping carefully."));
  applyList.appendChild(sentenceCard("Viele Menschen reduzieren ihren Fleischkonsum aus Sorge um die Massentierhaltung.", "Many people are reducing their meat consumption out of concern for factory farming."));

  try {
    const vocab = await loadJSON("../data/vocabulary/b1-ernaehrung.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(ERN_IDS.map(byId).filter(Boolean), document.getElementById("grid-ern"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-ern").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/b1-ernaehrung-quiz.json");

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
