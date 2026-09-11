/**
 * Page script for lessons/b2-internationale-klimapolitik.html — B2
 * Unit 19 (deepens B1 Unit 16's individual/national climate basics
 * into international diplomacy and policy). The "process" picker
 * walks five stages of international climate diplomacy; the
 * "concept" picker gives example sentences for key policy concepts.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "b2-unit-19-internationale-klimapolitik";

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

const IKP_IDS = [
  "ikp-pariser-abkommen", "ikp-klimagipfel", "ikp-klimakonferenz", "ikp-co2-steuer",
  "ikp-klimaabkommen", "ikp-entwicklungslaender", "ikp-industrielaender", "ikp-klimagerechtigkeit",
  "ikp-klimafolgenanpassung", "ikp-klimaschutz", "ikp-co2-bepreisung", "ikp-klimafluechtling",
  "ikp-dekarbonisierung", "ikp-kipppunkt", "ikp-treibhauseffekt", "ikp-oekosystem",
  "ikp-klimapolitik", "ikp-co2-grenzausgleich", "ikp-klimaneutralitaet", "ikp-globaler-sueden",
  "ikp-globaler-norden", "ikp-verursacherprinzip", "ikp-ressourcenknappheit", "ikp-klimadiplomatie",
  "ikp-un-klimarahmenkonvention", "ikp-resilienz", "ikp-anpassung-vs-schutz", "ikp-review",
];

const PROCESS = [
  { key: "unfccc", label: "1. die UN-Klimarahmenkonvention", line: "Die UN-Klimarahmenkonvention bildet die rechtliche Grundlage der Klimakonferenzen.", note: "the 1992 treaty that set up the whole diplomatic process." },
  { key: "konferenz", label: "2. die Klimakonferenz", line: "An der Klimakonferenz nahmen Vertreter aus fast 200 Ländern teil.", note: "the annual meeting where countries negotiate under that framework." },
  { key: "diplomatie", label: "3. die Klimadiplomatie", line: "Klimadiplomatie erfordert Kompromisse zwischen sehr unterschiedlichen Interessen.", note: "the negotiation process itself, balancing very different national interests." },
  { key: "abkommen", label: "4. das Pariser Abkommen", line: "Das Pariser Abkommen setzt sich das Ziel, die Erderwärmung auf 1,5 Grad zu begrenzen.", note: "the outcome — a binding (or semi-binding) agreement with shared targets." },
  { key: "umsetzung", label: "5. Klimaschutz vs. Klimafolgenanpassung", line: "Ohne ausreichenden Klimaschutz wird auch mehr Klimafolgenanpassung nötig sein.", note: "then implementation — preventing further warming and adapting to what's already locked in." },
];

const CONCEPTS = [
  { key: "gerechtigkeit", label: "Klimagerechtigkeit", response: "Klimagerechtigkeit fordert, historische Verantwortung stärker zu berücksichtigen." },
  { key: "fluechtling", label: "Klimaflüchtlinge", response: "Die Zahl der Klimaflüchtlinge könnte in den kommenden Jahrzehnten stark steigen." },
  { key: "grenzausgleich", label: "CO2-Grenzausgleich", response: "Der CO2-Grenzausgleich soll verhindern, dass Produktion einfach ins Ausland verlagert wird." },
  { key: "kipppunkt", label: "Kipppunkte", response: "Klimaforscher warnen davor, mehrere Kipppunkte gleichzeitig zu überschreiten." },
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

function initProcessPicker() {
  initPicker({
    buttonsId: "process-picker-buttons",
    resultId: "process-picker-result",
    options: PROCESS,
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

function initConceptPicker() {
  initPicker({
    buttonsId: "concept-picker-buttons",
    resultId: "concept-picker-result",
    options: CONCEPTS,
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

  initProcessPicker();
  initConceptPicker();

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("Die internationale Klimapolitik steht vor großen Herausforderungen.", "International climate policy faces major challenges."));
  discoverList.appendChild(sentenceCard("Der Globale Süden trägt die geringste historische Verantwortung, spürt aber die größten Folgen.", "The Global South bears the least historical responsibility, yet feels the greatest effects."));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Die EU strebt bis 2050 Klimaneutralität an.", "The EU is aiming for climate neutrality by 2050."));
  applyList.appendChild(sentenceCard("Der Plan soll die Resilienz von Küstenstädten gegenüber Überschwemmungen stärken.", "The plan is meant to strengthen coastal cities' resilience to flooding."));
  applyList.appendChild(sentenceCard("Wasserknappheit ist eine besonders spürbare Form der Ressourcenknappheit.", "Water shortage is a particularly noticeable form of resource scarcity."));

  try {
    const vocab = await loadJSON("../data/vocabulary/b2-internationale-klimapolitik.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(IKP_IDS.map(byId).filter(Boolean), document.getElementById("grid-ikp"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-ikp").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/b2-internationale-klimapolitik-quiz.json");

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
