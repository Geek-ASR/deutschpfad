/**
 * Page script for lessons/b2-technologie.html — B2 Unit 22 (the
 * startup/entrepreneurship layer of innovation, distinct from B2
 * Unit 12's research angle and Unit 15's AI/policy angle). The
 * "journey" picker walks five stages of a startup's life; the
 * "frontier" picker gives example sentences for emerging tech.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "b2-unit-22-technologie";

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

const TEC_IDS = [
  "tec-startup", "tec-gruenderszene", "tec-risikokapital", "tec-investor",
  "tec-investieren", "tec-inkubator", "tec-accelerator", "tec-skalierung",
  "tec-skalieren", "tec-prototyp", "tec-marktreife", "tec-disruptiv",
  "tec-scheitern", "tec-fehlerkultur", "tec-robotik", "tec-quantencomputer",
  "tec-internet-der-dinge", "tec-blockchain", "tec-kryptowaehrung", "tec-technologische-souveraenitaet",
  "tec-innovationsstandort", "tec-ausgruendung", "tec-geistiges-eigentum", "tec-businessplan",
  "tec-finanzierungsrunde", "tec-boersengang", "tec-wettbewerbsvorteil", "tec-review",
];

const JOURNEY = [
  { key: "prototyp", label: "1. der Prototyp", line: "Der erste Prototyp wurde in nur sechs Wochen entwickelt.", note: "an early working version — before anyone commits real money." },
  { key: "inkubator", label: "2. der Inkubator / Accelerator", line: "Der Inkubator unterstützt junge Gründerinnen mit Büroräumen und Beratung.", note: "structured early support — space, mentoring, sometimes a little funding." },
  { key: "finanzierung", label: "3. die Finanzierungsrunde", line: "Die zweite Finanzierungsrunde brachte zehn Millionen Euro ein.", note: "real Risikokapital, usually in stages — Seed, then Series A, B, C..." },
  { key: "skalierung", label: "4. die Skalierung", line: "Die Skalierung des Geschäftsmodells gelang schneller als erwartet.", note: "growing fast without costs growing at the same rate." },
  { key: "boersengang", label: "5. der Börsengang", line: "Nach Jahren des Wachstums plant das Unternehmen seinen Börsengang.", note: "the endgame for a successful, heavily scaled company." },
];

const FRONTIER = [
  { key: "robotik", label: "Robotik", response: "Die Robotik entwickelt sich rasant weiter." },
  { key: "quanten", label: "Quantencomputer", response: "Quantencomputer könnten bestimmte Berechnungen enorm beschleunigen." },
  { key: "iot", label: "Internet der Dinge", response: "Das Internet der Dinge verbindet immer mehr Alltagsgegenstände." },
  { key: "krypto", label: "Kryptowährung", response: "Der Wert der Kryptowährung schwankte stark." },
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

function initJourneyPicker() {
  initPicker({
    buttonsId: "journey-picker-buttons",
    resultId: "journey-picker-result",
    options: JOURNEY,
    renderResult: (option, el) => {
      el.innerHTML = "";

      const heading = document.createElement("span");
      heading.className = "picker-result-word";
      heading.textContent = option.label;
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

function initFrontierPicker() {
  initPicker({
    buttonsId: "frontier-picker-buttons",
    resultId: "frontier-picker-result",
    options: FRONTIER,
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

  initJourneyPicker();
  initFrontierPicker();

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("Berlin gilt als Zentrum der deutschen Gründerszene.", "Berlin is considered the centre of Germany's startup scene."));
  discoverList.appendChild(sentenceCard("Die Technologie gilt als disruptiv für die gesamte Branche.", "The technology is considered disruptive for the entire industry."));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Eine offene Fehlerkultur gilt als wichtige Voraussetzung für Innovation.", "An open culture around failure is seen as an important precondition for innovation."));
  applyList.appendChild(sentenceCard("Die EU investiert stark in technologische Souveränität bei Halbleitern.", "The EU is investing heavily in technological sovereignty over semiconductors."));
  applyList.appendChild(sentenceCard("Das Unternehmen ist eine Ausgründung der Technischen Universität.", "The company is a spin-off from the Technical University."));

  try {
    const vocab = await loadJSON("../data/vocabulary/b2-technologie.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(TEC_IDS.map(byId).filter(Boolean), document.getElementById("grid-tec"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-tec").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/b2-technologie-quiz.json");

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
