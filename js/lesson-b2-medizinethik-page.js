/**
 * Page script for lessons/b2-medizinethik.html — B2 Unit 18. The
 * "question" picker walks five core ethical questions; the
 * "workforce" picker gives example sentences about the system's
 * pressure points.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "b2-unit-18-medizinethik";

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

const MED_IDS = [
  "med-patientenverfuegung", "med-sterbehilfe", "med-organspende", "med-organspendeausweis",
  "med-einwilligung", "med-schweigepflicht", "med-medizinethik", "med-gentherapie",
  "med-impfpflicht", "med-priorisierung", "med-pflegenotstand", "med-aerztemangel",
  "med-gesundheitskompetenz", "med-placebo", "med-klinische-studie", "med-biotechnologie",
  "med-genom", "med-stammzellenforschung", "med-selbstbestimmungsrecht", "med-wuerde",
  "med-triage", "med-lebensqualitaet", "med-patientenautonomie", "med-ethikkommission",
  "med-hippokratischer-eid", "med-dilemma", "med-abwaegen-anwendung", "med-review",
];

const QUESTIONS = [
  { key: "sterbehilfe", label: "Wie viel Selbstbestimmung am Lebensende?", line: "Über die Sterbehilfe wird in Deutschland seit Jahren gestritten.", note: "weighs das Selbstbestimmungsrecht against die Menschenwürde and die Lebensqualität." },
  { key: "organspende", label: "Wer entscheidet über Organspende?", line: "Die Organspende kann Leben retten.", note: "documented on der Organspendeausweis — a decision many countries are debating how to structure." },
  { key: "impfpflicht", label: "Individuelle Freiheit vs. Allgemeinwohl?", line: "Über eine Impfpflicht wird in vielen Ländern diskutiert.", note: "one person's Selbstbestimmungsrecht weighed against public health." },
  { key: "priorisierung", label: "Wer wird zuerst behandelt?", line: "Die Priorisierung von Intensivbetten war während der Pandemie besonders umstritten.", note: "die Triage in its starkest form — a genuine ethisches Dilemma." },
  { key: "stammzellen", label: "Wie weit darf Forschung gehen?", line: "Die Stammzellenforschung ist in Deutschland gesetzlich stark reguliert.", note: "reviewed by an Ethikkommission before it can proceed." },
];

const WORKFORCE = [
  { key: "aerztemangel", label: "Ärztemangel", response: "Der Ärztemangel auf dem Land wird immer gravierender." },
  { key: "pflegenotstand", label: "Pflegenotstand", response: "Der Pflegenotstand belastet vor allem Krankenhäuser und Pflegeheime." },
  { key: "klinischestudie", label: "Klinische Studie", response: "Jede klinische Studie muss von einer Ethikkommission genehmigt werden." },
  { key: "gesundheitskompetenz", label: "Gesundheitskompetenz", response: "Bessere Gesundheitskompetenz könnte viele Fehlentscheidungen vermeiden." },
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

function initQuestionPicker() {
  initPicker({
    buttonsId: "question-picker-buttons",
    resultId: "question-picker-result",
    options: QUESTIONS,
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

function initWorkforcePicker() {
  initPicker({
    buttonsId: "workforce-picker-buttons",
    resultId: "workforce-picker-result",
    options: WORKFORCE,
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

  initQuestionPicker();
  initWorkforcePicker();

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("Fragen der Medizinethik werden immer wichtiger.", "Questions of medical ethics are becoming increasingly important."));
  discoverList.appendChild(sentenceCard("Das Selbstbestimmungsrecht des Patienten steht im Zentrum der Debatte.", "The patient's right to self-determination is at the centre of the debate."));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Das menschliche Genom wurde vor über zwanzig Jahren entschlüsselt.", "The human genome was decoded over twenty years ago."));
  applyList.appendChild(sentenceCard("Der hippokratische Eid gilt bis heute als moralischer Grundsatz der Medizin.", "The Hippocratic oath is still considered a moral foundation of medicine today."));
  applyList.appendChild(sentenceCard("Ärzte stehen bei der Priorisierung oft vor einem schwierigen Dilemma.", "Doctors often face a difficult dilemma when prioritising care."));

  try {
    const vocab = await loadJSON("../data/vocabulary/b2-medizinethik.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(MED_IDS.map(byId).filter(Boolean), document.getElementById("grid-med"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-med").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/b2-medizinethik-quiz.json");

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
