/**
 * Page script for lessons/b2-funktionsverbgefuege.html — B2 Unit 6.
 * The "use" picker walks five common support-verb constructions; the
 * "formal" picker gives example sentences for a given situation.
 * No new CSS.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "b2-unit-6-funktionsverbgefuege";

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

const FVG_IDS = [
  "fvg-in-kraft-treten", "fvg-ruecksicht-nehmen", "fvg-zur-verfuegung-stellen",
  "fvg-anspruch-erheben", "fvg-entscheidung-treffen", "fvg-zum-ausdruck-bringen",
  "fvg-kritik-ueben", "fvg-in-anspruch-nehmen", "fvg-einfluss-nehmen",
  "fvg-zur-sprache-bringen", "fvg-stellung-nehmen", "fvg-in-betracht-ziehen",
  "fvg-unter-beweis-stellen", "fvg-kontakt-aufnehmen", "fvg-anwendung-finden",
  "fvg-ausser-kraft-setzen", "fvg-in-frage-stellen", "fvg-abstand-nehmen",
  "fvg-beruecksichtigen", "fvg-bereitstellen", "fvg-beanspruchen",
  "fvg-ausdruecken", "fvg-kritisieren", "fvg-beeinflussen", "fvg-erwaegen",
  "fvg-kontaktieren", "fvg-bezweifeln", "fvg-verbalisierung-hinweis",
];

const USES = [
  { key: "in-kraft", label: "A law taking effect", line: "Das neue Gesetz tritt am ersten Januar in Kraft.", note: "\"in Kraft treten\" = to take effect — the standard way to say a law/rule starts applying." },
  { key: "verfuegung", label: "Making something available", line: "Die Universität stellt allen Studierenden kostenlose Lernmaterialien zur Verfügung.", note: "\"zur Verfügung stellen\" = to make available — a very common formal alternative to bereitstellen." },
  { key: "kritik", label: "Criticizing something", line: "Viele Experten üben Kritik an der neuen Regelung.", note: "\"Kritik üben an\" + Dat = to criticize — more formal than the plain verb kritisieren." },
  { key: "entscheidung", label: "Making a decision", line: "Die Kommission muss noch eine wichtige Entscheidung treffen.", note: "\"eine Entscheidung treffen\" = to make a decision — treffen, not machen, is the fixed verb here." },
  { key: "frage-stellen", label: "Questioning something", line: "Die Studie stellt die bisherigen Annahmen grundlegend in Frage.", note: "\"in Frage stellen\" = to call into question — a formal way to express doubt or challenge." },
];

const FORMAL = [
  { key: "gesetz", label: "Ein Gesetz", response: "Das Gesetz tritt nächsten Monat in Kraft und muss dann von allen beachtet werden." },
  { key: "kontakt", label: "Kontakt aufnehmen", response: "Bei Fragen können Sie jederzeit Kontakt mit uns aufnehmen." },
  { key: "zweifel", label: "Zweifel äußern", response: "Einige Wissenschaftler stellen die Ergebnisse der Studie in Frage." },
  { key: "hilfe", label: "Unterstützung anbieten", response: "Die Organisation stellt Betroffenen kostenlose Beratung zur Verfügung." },
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

function initFormalPicker() {
  initPicker({
    buttonsId: "formal-picker-buttons",
    resultId: "formal-picker-result",
    options: FORMAL,
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
  initFormalPicker();

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("Die Kommission muss noch eine wichtige Entscheidung treffen.", "The commission still has to make an important decision."));
  discoverList.appendChild(sentenceCard("Bei der Planung wurde auf die Bedürfnisse älterer Menschen Rücksicht genommen.", "The needs of older people were taken into consideration in the planning."));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Die Ministerin wollte zu den Vorwürfen nicht Stellung nehmen.", "The minister didn't want to comment on the allegations."));
  applyList.appendChild(sentenceCard("Man sollte auch alternative Lösungen in Betracht ziehen.", "One should also consider alternative solutions."));
  applyList.appendChild(sentenceCard("Die alte Verordnung wurde zum Jahresende außer Kraft gesetzt.", "The old regulation was repealed at the end of the year."));

  try {
    const vocab = await loadJSON("../data/vocabulary/b2-funktionsverbgefuege.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(FVG_IDS.map(byId).filter(Boolean), document.getElementById("grid-fvg"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-fvg").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/b2-funktionsverbgefuege-quiz.json");

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
