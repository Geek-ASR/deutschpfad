/**
 * Page script for lessons/b1-indirekte-rede.html — B1 Unit 11.
 * The "report" picker takes a direct quote and shows how it's reported
 * (Konjunktiv I, or its Konjunktiv II substitute); the "news" picker
 * gives a fuller journalistic-style report. No new CSS.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "b1-unit-11-indirekte-rede";

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

const IR_IDS = [
  "ir-konjunktiv-1-bildung", "ir-sein-konjunktiv1", "ir-haben-konjunktiv1",
  "ir-werden-konjunktiv1", "ir-er-komme", "ir-du-kommest", "ir-ersatz-konjunktiv2",
  "ir-sie-kaemen-beispiel", "ir-dass-satz", "ir-ohne-dass", "ir-vergangenheit",
  "ir-vergangenheit-beispiel", "ir-ob-frage", "ir-w-frage", "ir-aufforderung",
  "ir-register", "ir-distanz", "ir-berichten", "ir-erklaeren", "ir-betonen",
  "ir-hinzufuegen", "ir-meinen", "ir-mitteilen", "ir-aeussern", "ir-zitat",
  "ir-woertliche-rede", "ir-indirekte-rede", "ir-nachrichtensprache",
];

const REPORTS = [
  { key: "muede", label: "\"Ich bin müde.\"", line: "Sie sagte, sie sei müde. (dass-Variante: Sie sagte, dass sie müde sei.)", note: "sein → sei, a clearly distinct Konjunktiv I form. No substitution needed." },
  { key: "komme", label: "\"Ich komme später.\"", line: "Er sagte, er komme später.", note: "\"er komme\" is distinct from the indicative \"er kommt\" — safe to use directly." },
  { key: "wirkommen", label: "\"Wir kommen später.\"", line: "Sie sagten, sie kämen später. (nicht: sie kommen)", note: "Konjunktiv I \"sie kommen\" would be identical to the indicative, so Konjunktiv II \"kämen\" steps in." },
  { key: "war", label: "\"Ich war krank.\"", line: "Er sagte, er sei krank gewesen.", note: "the reported past: sei (Konjunktiv I) + Partizip II — one form, whatever tense the original was." },
  { key: "kommstdu", label: "\"Kommst du?\"", line: "Sie fragte, ob ich käme.", note: "yes/no question → \"ob\", verb to the end." },
  { key: "wannkommst", label: "\"Wann kommst du?\"", line: "Er fragte, wann ich käme.", note: "W-question → the question word carries over, verb to the end." },
  { key: "machdas", label: "\"Mach das!\"", line: "Er sagte, ich solle das machen.", note: "a command becomes sollen + Infinitiv." },
];

const NEWS = [
  { key: "politiker", label: "A politician's statement", response: "Der Minister erklärte, die Regierung werde das Gesetz unterstützen. Man habe die Folgen sorgfältig geprüft." },
  { key: "firma", label: "A company statement", response: "Die Firma teilte mit, sie habe von den Vorwürfen erst am Montag erfahren. Man wolle den Fall genau untersuchen." },
  { key: "zeuge", label: "A witness statement", response: "Der Zeuge sagte, er habe nichts Ungewöhnliches bemerkt. Er sei zur Tatzeit nicht in der Nähe gewesen." },
  { key: "wetter", label: "A weather report", response: "Der Wetterdienst teilte mit, es werde am Wochenende kälter. Vereinzelt könne es auch schneien." },
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

function pickerRenderer(option, el) {
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
}

function newsRenderer(option, el) {
  el.innerHTML = "";
  const word = document.createElement("span");
  word.className = "picker-result-word";
  word.lang = "de";
  word.style.fontSize = "var(--text-md)";
  word.textContent = option.response;
  el.appendChild(word);
  const speakBtn = createSpeakButton(option.response, "Listen");
  if (speakBtn) el.appendChild(speakBtn);
}

async function main() {
  markLessonVisited(LESSON_ID);

  const stepsContainer = document.getElementById("lesson-steps");
  initLessonLoop({ container: stepsContainer, stepLabels: STEP_LABELS });

  initPicker({
    buttonsId: "report-picker-buttons",
    resultId: "report-picker-result",
    options: REPORTS,
    renderResult: pickerRenderer,
  });
  initPicker({
    buttonsId: "news-picker-buttons",
    resultId: "news-picker-result",
    options: NEWS,
    renderResult: newsRenderer,
  });

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("\"Wir haben die Situation im Griff\", sagte die Sprecherin.", "\"We have the situation under control,\" the spokesperson said. (wörtliche Rede)"));
  discoverList.appendChild(sentenceCard("Die Sprecherin sagte, man habe die Situation im Griff.", "The spokesperson said they had the situation under control. (indirekte Rede)"));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Der Vermieter erklärte, er habe die Kündigung nicht erhalten.", "The landlord stated that he had not received the termination notice."));
  applyList.appendChild(sentenceCard("Die Kollegin fragte, ob wir das Meeting verschieben könnten.", "The colleague asked whether we could postpone the meeting."));
  applyList.appendChild(sentenceCard("Der Chef sagte, alle sollten pünktlich zur Besprechung kommen.", "The boss said everyone should come to the meeting on time."));

  try {
    const vocab = await loadJSON("../data/vocabulary/b1-indirekte-rede.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(IR_IDS.map(byId).filter(Boolean), document.getElementById("grid-ir"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-ir").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/b1-indirekte-rede-quiz.json");

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
