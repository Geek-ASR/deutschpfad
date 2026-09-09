/**
 * Page script for lessons/a1-home.html. Lesson-specific glue, same role
 * as js/lesson-drinks-page.js — composes the generic engines (lesson-loop,
 * vocab-card, quiz-engine, picker-widget, speak) plus this lesson's own
 * picker content (rooms with im/in der/auf dem, favorite relaxing spot).
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "a1-unit-10-home";

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

const HOME_IDS = [
  "home-haus",
  "home-wohnung",
  "home-wohnzimmer",
  "home-schlafzimmer",
  "home-kueche",
  "home-badezimmer",
  "home-flur",
  "home-balkon",
  "home-garten",
  "home-tisch",
  "home-stuhl",
  "home-bett",
  "home-schrank",
  "home-sofa",
  "home-regal",
  "home-lampe",
  "home-fenster",
];

const HOME_IDS_MORE = [
  "home-tuer",
  "home-wand",
  "home-boden",
  "home-spiegel",
  "home-teppich",
  "home-vorhang",
  "home-kuehlschrank",
  "home-herd",
  "home-waschmaschine",
  "home-dusche",
  "home-toilette",
  "home-schluessel",
  "home-miete",
  "home-vermieter",
  "home-nachbar",
  "home-wohnen",
  "home-putzen",
  "home-klein",
  "home-gemuetlich",
  "home-gross",
];

// The location phrase ("im", "in der", or the auf-dem exception) is
// baked in per room, demonstrating the dative pattern without needing
// runtime grammar logic.
const ROOM_PICKER_OPTIONS = [
  { key: "wohnzimmer", label: "Wohnzimmer", article: "das", locative: "im Wohnzimmer", meaning: "in the living room" },
  { key: "schlafzimmer", label: "Schlafzimmer", article: "das", locative: "im Schlafzimmer", meaning: "in the bedroom" },
  { key: "kueche", label: "Küche", article: "die", locative: "in der Küche", meaning: "in the kitchen" },
  { key: "badezimmer", label: "Badezimmer", article: "das", locative: "im Badezimmer", meaning: "in the bathroom" },
  { key: "flur", label: "Flur", article: "der", locative: "im Flur", meaning: "in the hallway" },
  { key: "balkon", label: "Balkon", article: "der", locative: "auf dem Balkon", meaning: "on the balcony" },
  { key: "garten", label: "Garten", article: "der", locative: "im Garten", meaning: "in the garden" },
];

const RELAX_OPTIONS = [
  { key: "wohnzimmer", label: "Living room", response: "Ich entspanne mich am liebsten im Wohnzimmer." },
  { key: "schlafzimmer", label: "Bedroom", response: "Ich entspanne mich am liebsten im Schlafzimmer." },
  { key: "balkon", label: "Balcony", response: "Ich entspanne mich am liebsten auf dem Balkon." },
  { key: "garten", label: "Garden", response: "Ich entspanne mich am liebsten im Garten." },
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

function initRoomPicker() {
  initPicker({
    buttonsId: "room-picker-buttons",
    resultId: "room-picker-result",
    options: ROOM_PICKER_OPTIONS,
    renderResult: (option, el) => {
      el.innerHTML = "";
      const word = document.createElement("span");
      word.className = "picker-result-word";
      word.lang = "de";
      word.textContent = option.locative;
      el.appendChild(word);
      const speakBtn = createSpeakButton(option.locative, "Listen");
      if (speakBtn) el.appendChild(speakBtn);
      const meta = document.createElement("p");
      meta.className = "picker-result-meta";
      meta.textContent = `"${option.meaning}" — ${option.article} ${option.label}`;
      el.appendChild(meta);
    },
  });
}

function initRelaxPicker() {
  initPicker({
    buttonsId: "relax-picker-buttons",
    resultId: "relax-picker-result",
    options: RELAX_OPTIONS,
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

  initRoomPicker();
  initRelaxPicker();

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("Wo ist der Fernseher? – Er ist im Wohnzimmer.", "Where is the TV? – It's in the living room."));
  discoverList.appendChild(sentenceCard("Ich koche gern in der Küche.", "I like cooking in the kitchen."));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Meine Wohnung ist klein, aber gemütlich.", "My apartment is small but cozy."));
  applyList.appendChild(sentenceCard("Wir sitzen abends auf dem Sofa.", "We sit on the sofa in the evening."));
  applyList.appendChild(sentenceCard("Die Bücher stehen im Regal.", "The books are on the shelf."));

  try {
    const vocab = await loadJSON("../data/vocabulary/home.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(HOME_IDS.map(byId).filter(Boolean), document.getElementById("grid-home"));
    renderVocabGrid(HOME_IDS_MORE.map(byId).filter(Boolean), document.getElementById("grid-home-more"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-home").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/a1-home-quiz.json");

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
