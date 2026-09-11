/**
 * Page script for lessons/b2-soziale-gerechtigkeit.html — B2 Unit 23
 * (the economic/structural layer of fairness, distinct from B2 Unit
 * 16's discrimination angle and Unit 17's educational-equity angle).
 * The "measure" picker walks five ways inequality gets measured and
 * addressed; the "debate" picker gives example sentences for policy
 * arguments.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "b2-unit-23-soziale-gerechtigkeit";

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

const SGR_IDS = [
  "sgr-ungleichheit", "sgr-vermoegensungleichheit", "sgr-einkommensungleichheit", "sgr-armut",
  "sgr-armutsgrenze", "sgr-soziale-mobilitaet", "sgr-sozialstaat", "sgr-soziales-netz",
  "sgr-umverteilung", "sgr-mindestlohn", "sgr-erbschaft", "sgr-erbschaftssteuer",
  "sgr-klassismus", "sgr-strukturelle-benachteiligung", "sgr-chancengerechtigkeit", "sgr-prekariat",
  "sgr-niedriglohnsektor", "sgr-soziale-gerechtigkeit", "sgr-soziale-herkunft", "sgr-soziale-kluft",
  "sgr-soziale-schicht", "sgr-generationengerechtigkeit", "sgr-teufelskreis", "sgr-aufstiegschancen",
  "sgr-transferleistung", "sgr-gini-koeffizient", "sgr-gerecht-vs-gleich", "sgr-review",
];

const MEASURES = [
  { key: "gini", label: "der Gini-Koeffizient", line: "Der Gini-Koeffizient wird häufig verwendet, um Länder international zu vergleichen.", note: "0 means perfect equality, 1 means maximum inequality — a single number for a whole country." },
  { key: "armutsgrenze", label: "die Armutsgrenze", line: "Fast jeder sechste Bürger lebt unter der Armutsgrenze.", note: "a specific income threshold, not just a vague sense of struggling." },
  { key: "mindestlohn", label: "der Mindestlohn", line: "Der Mindestlohn wurde zu Jahresbeginn angehoben.", note: "a direct policy lever aimed at Einkommensungleichheit." },
  { key: "erbschaftssteuer", label: "die Erbschaftssteuer", line: "Über eine höhere Erbschaftssteuer wird regelmäßig diskutiert.", note: "aimed at Vermögensungleichheit specifically, across generations." },
  { key: "transferleistung", label: "die Transferleistung", line: "Transferleistungen machen einen erheblichen Teil des Staatshaushalts aus.", note: "the concrete mechanism behind der Sozialstaat and die Umverteilung." },
];

const DEBATES = [
  { key: "klassismus", label: "Klassismus", response: "Klassismus wird in Debatten über Ungleichheit oft übersehen." },
  { key: "struktur", label: "Strukturelle Benachteiligung", response: "Strukturelle Benachteiligung lässt sich nicht allein durch gute Absichten beheben." },
  { key: "prekariat", label: "Das Prekariat", response: "Viele Soloselbstständige zählen inzwischen zum Prekariat." },
  { key: "generationen", label: "Generationengerechtigkeit", response: "Generationengerechtigkeit spielt in der Rentendebatte eine große Rolle." },
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

function initMeasurePicker() {
  initPicker({
    buttonsId: "measure-picker-buttons",
    resultId: "measure-picker-result",
    options: MEASURES,
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

function initDebatePicker() {
  initPicker({
    buttonsId: "debate-picker-buttons",
    resultId: "debate-picker-result",
    options: DEBATES,
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

  initMeasurePicker();
  initDebatePicker();

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("Die Ungleichheit zwischen Arm und Reich wächst in vielen Ländern.", "Inequality between rich and poor is growing in many countries."));
  discoverList.appendChild(sentenceCard("Gleiche Regeln für alle sind nicht automatisch gerecht.", "Equal rules for everyone aren't automatically fair."));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Kinder aus einkommensschwachen Familien haben oft geringere Aufstiegschancen.", "Children from low-income families often have fewer chances of upward mobility."));
  applyList.appendChild(sentenceCard("Ohne gute Bildung ist es schwer, aus dem Teufelskreis der Armut auszubrechen.", "Without good education, it's hard to break out of the poverty trap."));
  applyList.appendChild(sentenceCard("Menschen aus unterschiedlichen sozialen Schichten leben oft in getrennten Vierteln.", "People from different social classes often live in separate neighbourhoods."));

  try {
    const vocab = await loadJSON("../data/vocabulary/b2-soziale-gerechtigkeit.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(SGR_IDS.map(byId).filter(Boolean), document.getElementById("grid-sgr"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-sgr").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/b2-soziale-gerechtigkeit-quiz.json");

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
