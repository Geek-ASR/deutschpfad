/**
 * Page script for lessons/b2-akademischer-konjunktiv2.html — B2 Unit 10.
 * The "hedge" picker walks five hedging phrases; the "flavor" picker
 * gives example sentences for the academic-vocabulary cluster.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "b2-unit-10-akademischer-konjunktiv2";

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

const AKV_IDS = [
  "akv-koennte-argumentieren", "akv-koennte-argumentieren-beispiel",
  "akv-waere-denkbar", "akv-waere-denkbar-beispiel",
  "akv-liesse-sich-sagen", "akv-liesse-sich-sagen-beispiel",
  "akv-koennte-einwenden", "akv-einwenden-verb",
  "akv-waere-zu-fragen", "akv-waere-zu-fragen-beispiel",
  "akv-liesse-sich-behaupten", "akv-man-koennte-meinen", "akv-meinen-beispiel",
  "akv-mag-sein-dass", "akv-mag-sein-beispiel", "akv-nicht-von-der-hand-zu-weisen",
  "akv-fraglich", "akv-so-koennte-man-sagen", "akv-drei-werkzeuge-vergleich",
  "akv-these", "akv-gegenargument", "akv-standpunkt",
  "akv-plausibel", "akv-umstritten", "akv-nachvollziehbar",
  "akv-relativieren", "akv-verallgemeinern", "akv-vorausgesetzt",
];

const HEDGES = [
  { key: "argumentieren", label: "man könnte argumentieren, dass …", line: "Man könnte argumentieren, dass die Reform zu spät kommt.", note: "the standard opener for a tentative claim you're about to examine, not assert as fact." },
  { key: "denkbar", label: "es wäre denkbar, dass …", line: "Es wäre denkbar, dass sich die Lage bis nächstes Jahr entspannt.", note: "even more tentative — flags an idea as merely possible." },
  { key: "liesse-sich-sagen", label: "es ließe sich sagen, dass …", line: "Es ließe sich sagen, dass beide Modelle ihre Berechtigung haben.", note: "builds on B2 Unit 4's sich lassen — a formal, slightly distanced way to say something." },
  { key: "einwenden", label: "man könnte einwenden, dass …", line: "Man könnte einwenden, dass die Kosten zu hoch wären.", note: "introduces a counterargument the writer will go on to address." },
  { key: "zu-fragen", label: "es wäre zu fragen, ob …", line: "Es wäre zu fragen, ob diese Zahlen überhaupt vergleichbar sind.", note: "combines B1's sein + zu + Infinitiv with Konjunktiv II to raise a critical question gently." },
];

const REGISTER_WORDS = [
  { key: "these", label: "die These — thesis, claim", response: "Die These des Autors lässt sich gut belegen." },
  { key: "gegenargument", label: "das Gegenargument — counterargument", response: "Ein wichtiges Gegenargument wurde bisher nicht erwähnt." },
  { key: "umstritten", label: "umstritten — controversial", response: "Die Studie ist in der Fachwelt umstritten." },
  { key: "relativieren", label: "relativieren — to qualify, put into perspective", response: "Diese Zahl muss man relativieren: sie stammt aus einer kleinen Stichprobe." },
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

function initHedgePicker() {
  initPicker({
    buttonsId: "hedge-picker-buttons",
    resultId: "hedge-picker-result",
    options: HEDGES,
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

function initRegisterPicker() {
  initPicker({
    buttonsId: "register-picker-buttons",
    resultId: "register-picker-result",
    options: REGISTER_WORDS,
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

  initHedgePicker();
  initRegisterPicker();

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("Man könnte argumentieren, dass mehr Homeoffice die Produktivität steigert.", "One could argue that more remote work increases productivity."));
  discoverList.appendChild(sentenceCard("Es mag sein, dass die Lösung teuer ist, aber sie ist langfristig sinnvoll.", "It may be that the solution is expensive, but it makes sense long-term."));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Der Einwand ist nicht von der Hand zu weisen.", "The objection is hard to dismiss."));
  applyList.appendChild(sentenceCard("Man sollte diesen Einzelfall nicht verallgemeinern.", "One shouldn't generalise from this single case."));
  applyList.appendChild(sentenceCard("Vorausgesetzt, die Zahlen stimmen, ist die These plausibel.", "Provided the figures are correct, the thesis is plausible."));

  try {
    const vocab = await loadJSON("../data/vocabulary/b2-akademischer-konjunktiv2.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(AKV_IDS.map(byId).filter(Boolean), document.getElementById("grid-akv"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-akv").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/b2-akademischer-konjunktiv2-quiz.json");

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
