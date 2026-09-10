/**
 * Page script for lessons/b1-passiv.html — B1 Unit 2.
 * The "form" picker conjugates one sentence through every passive
 * tense + the modal and Zustandspassiv variants; the "alt" picker
 * rephrases a passive sentence with man / sich lassen / sein + zu /
 * -bar. No new CSS.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "b1-unit-2-passiv";

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

const PASS_IDS = [
  "pass-wird-gemacht", "pass-wurde-gemacht", "pass-ist-worden", "pass-war-worden",
  "pass-wird-werden", "pass-modal", "pass-zustandspassiv", "pass-es-passiv",
  "pass-worden-vs-geworden", "pass-von", "pass-durch", "pass-man", "pass-sich-lassen",
  "pass-sein-zu", "pass-bar", "pass-vorgang", "pass-zustand", "pass-massnahme",
  "pass-erledigen", "pass-durchfuehren", "pass-bearbeiten", "pass-pruefen",
  "pass-genehmigen", "pass-ablehnen", "pass-veroeffentlichen", "pass-liefern",
  "pass-herstellen", "pass-verschieben",
];

const FORMS = [
  { key: "praesens", label: "Präsens", line: "Der Antrag wird geprüft.", note: "werden (present) + Partizip II. The everyday passive." },
  { key: "praeteritum", label: "Präteritum", line: "Der Antrag wurde geprüft.", note: "werden → wurde. The narrative / written past." },
  { key: "perfekt", label: "Perfekt", line: "Der Antrag ist geprüft worden.", note: "ist + Partizip II + worden. The spoken past. Never \"geworden\" here." },
  { key: "plusquamperfekt", label: "Plusquamperfekt", line: "Der Antrag war schon geprüft worden.", note: "war + Partizip II + worden. Done before another past moment." },
  { key: "futur", label: "Futur I", line: "Der Antrag wird geprüft werden.", note: "wird … + Partizip II + werden. Often just present + a time word instead." },
  { key: "modal", label: "mit Modalverb", line: "Der Antrag muss noch geprüft werden.", note: "modal (conjugated) … Partizip II + werden at the end." },
  { key: "zustand", label: "Zustandspassiv", line: "Der Antrag ist jetzt geprüft.", note: "sein + Partizip II = the resulting state, not the action." },
  { key: "subjektlos", label: "subjektlos (\"es\"-Passiv)", line: "Hier wird viel geprüft.", note: "no subject at all — focus is on the activity. \"Es\" drops after a fronted element." },
];

const ALTS = [
  { key: "man", label: "man + Aktiv", line: "Passiv: Der Antrag muss unterschrieben werden. → Man muss den Antrag unterschreiben.", note: "The easy spoken alternative — turn it back into an active sentence with \"man\"." },
  { key: "lassen", label: "sich lassen + Infinitiv", line: "Passiv: Das kann leicht gemacht werden. → Das lässt sich leicht machen.", note: "\"sich lassen\" = can be done. Common with machen, finden, öffnen, reparieren." },
  { key: "seinzu", label: "sein + zu + Infinitiv", line: "Passiv: Das Formular muss bis Freitag abgegeben werden. → Das Formular ist bis Freitag abzugeben.", note: "Formal. Carries a \"must / can\" meaning depending on context." },
  { key: "bar", label: "-bar (adjective)", line: "Passiv: Der Plan kann umgesetzt werden. → Der Plan ist umsetzbar.", note: "verb stem + -bar = \"can be …ed\", used like any adjective." },
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

function initFormPicker() {
  initPicker({
    buttonsId: "form-picker-buttons",
    resultId: "form-picker-result",
    options: FORMS,
    renderResult: (option, el) => {
      el.innerHTML = "";

      const heading = document.createElement("span");
      heading.className = "picker-result-word";
      heading.lang = "de";
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

function initAltPicker() {
  initPicker({
    buttonsId: "alt-picker-buttons",
    resultId: "alt-picker-result",
    options: ALTS,
    renderResult: (option, el) => {
      el.innerHTML = "";

      const heading = document.createElement("span");
      heading.className = "picker-result-word";
      heading.lang = "de";
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

async function main() {
  markLessonVisited(LESSON_ID);

  const stepsContainer = document.getElementById("lesson-steps");
  initLessonLoop({ container: stepsContainer, stepLabels: STEP_LABELS });

  initFormPicker();
  initAltPicker();

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("Ihr Antrag wird zurzeit bearbeitet. Sie werden schriftlich informiert.", "Your application is currently being processed. You will be informed in writing."));
  discoverList.appendChild(sentenceCard("In diesem Haus wird ab 22 Uhr nicht mehr Wäsche gewaschen.", "In this building, no laundry is done after 10 p.m."));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Mein Fahrrad wird gerade repariert — es ist gestern gebracht worden.", "My bike is being repaired right now — it was brought in yesterday."));
  applyList.appendChild(sentenceCard("Der Termin musste verschoben werden, weil ein Kollege krank geworden ist.", "The appointment had to be postponed because a colleague fell ill."));
  applyList.appendChild(sentenceCard("Das lässt sich sicher regeln — man muss nur rechtzeitig anrufen.", "That can surely be sorted out — you just have to call in good time."));

  try {
    const vocab = await loadJSON("../data/vocabulary/b1-passiv.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(PASS_IDS.map(byId).filter(Boolean), document.getElementById("grid-pass"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-pass").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/b1-passiv-quiz.json");

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
