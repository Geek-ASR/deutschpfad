/**
 * Page script for lessons/c1-konditionale-ausdruecke.html — C1 Unit 2.
 * The "type" picker walks five conditional variants; the "rewrite"
 * picker turns a given wenn-sentence into an inverted one. No new CSS.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "c1-unit-2-konditionale-ausdruecke";

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

const KA_IDS = [
  "ka-inversion-intro", "ka-inversion-realis", "ka-inversion-konjunktiv",
  "ka-inversion-hatte", "ka-sollte-inversion", "ka-sofern", "ka-es-sei-denn",
  "ka-im-falle", "ka-unter-der-voraussetzung", "ka-unter-der-bedingung",
  "ka-andernfalls", "ka-vergleich-wenn-sofern", "ka-wortstellung-inversion",
  "ka-komma-inversion", "ka-widrigenfalls", "ka-notfalls", "ka-ausdruecklich",
  "ka-gueltig", "ka-unguelig", "ka-erfuellen", "ka-zutreffen", "ka-ereignis",
  "ka-eintreten", "ka-rechtzeitig", "ka-hypothetisch", "ka-ausnahme",
  "ka-vorbehalt", "ka-vorbehaltlich",
];

const USES = [
  { key: "realis", label: "Real condition (present)", line: "Regnet es, bleiben wir zu Hause.", note: "Wenn es regnet, … becomes Regnet es, … — the verb takes first position, the main clause keeps normal verb-second order." },
  { key: "konjunktiv", label: "Konjunktiv II condition", line: "Wäre ich reich, würde ich um die Welt reisen.", note: "The same inversion trick works with Konjunktiv II — B1's wenn-clauses, just without wenn." },
  { key: "sollte", label: "sollte-inversion (formal future)", line: "Sollte es regnen, bleiben wir zu Hause.", note: "sollte, inverted at the front, signals a possible-but-not-expected future condition — more formal and more tentative than the plain-present version." },
  { key: "sofern", label: "sofern (formal connector)", line: "Wir liefern kostenlos, sofern der Bestellwert 50 Euro übersteigt.", note: "A dedicated formal conjunction rather than inversion — common in contracts and official writing, takes normal subordinate-clause word order." },
  { key: "im-falle", label: "im Falle (prepositional alternative)", line: "Im Falle einer Verspätung informieren wir Sie umgehend.", note: "Compresses a whole condition into a prepositional phrase with the genitive — typical of formal notices." },
];

const REDUCE = [
  { key: "fragen", label: "Wenn du Fragen hast, melde dich.", response: "Hast du Fragen, melde dich." },
  { key: "vertrag", label: "Wenn er nicht rechtzeitig bezahlt, kündigen wir den Vertrag.", response: "Zahlt er nicht rechtzeitig, kündigen wir den Vertrag." },
  { key: "zeit", label: "Wenn ich Zeit hätte, würde ich dich besuchen.", response: "Hätte ich Zeit, würde ich dich besuchen." },
  { key: "wetter", label: "Wenn das Wetter schlecht wäre, würden wir zu Hause bleiben.", response: "Wäre das Wetter schlecht, würden wir zu Hause bleiben." },
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

function initUsePicker() {
  initPicker({
    buttonsId: "use-picker-buttons",
    resultId: "use-picker-result",
    options: USES,
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

function initReducePicker() {
  initPicker({
    buttonsId: "reduce-picker-buttons",
    resultId: "reduce-picker-result",
    options: REDUCE,
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

  initUsePicker();
  initReducePicker();

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("Regnet es, bleiben wir zu Hause.", "If it rains, we'll stay home."));
  discoverList.appendChild(sentenceCard("Sofern der Bestellwert 50 Euro übersteigt, liefern wir kostenlos.", "Provided the order value exceeds 50 euros, we deliver for free."));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Hätte ich das gewusst, wäre ich nicht gekommen.", "Had I known that, I wouldn't have come."));
  applyList.appendChild(sentenceCard("Die Rechnung ist bis zum 15. zu begleichen, widrigenfalls wird ein Mahnverfahren eingeleitet.", "The invoice must be settled by the 15th, failing which a reminder procedure will be initiated."));
  applyList.appendChild(sentenceCard("Vorbehaltlich der Genehmigung durch die Behörde beginnt das Projekt im März.", "Subject to approval by the authority, the project begins in March."));

  try {
    const vocab = await loadJSON("../data/vocabulary/c1-konditionale-ausdruecke.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(KA_IDS.map(byId).filter(Boolean), document.getElementById("grid-ka"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-ka").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/c1-konditionale-ausdruecke-quiz.json");

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
