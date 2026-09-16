/**
 * Page script for lessons/c1-geschichte-20-jahrhundert.html —
 * C1 Unit 10 (topic unit). The "type" picker walks five key terms;
 * the "timeline" picker matches a period to what followed it.
 * No new CSS.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "c1-unit-10-geschichte-20-jahrhundert";

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

const GES_IDS = [
  "ges-intro", "ges-weimarer-republik", "ges-nationalsozialismus",
  "ges-diktatur", "ges-zweiter-weltkrieg", "ges-holocaust",
  "ges-widerstandskaempfer", "ges-teilung", "ges-besatzungszone",
  "ges-ddr", "ges-brd", "ges-kalter-krieg", "ges-mauerbau",
  "ges-mauerfall", "ges-wiedervereinigung", "ges-wirtschaftswunder",
  "ges-vergangenheitsbewaeltigung", "ges-erinnerungskultur",
  "ges-zeitzeuge", "ges-stasi", "ges-fluchthilfe", "ges-vertreibung",
  "ges-exil", "ges-verfolgung", "ges-gedenkstaette", "ges-jahrestag",
  "ges-umbruch", "ges-zeitgeschichte",
];

const USES = [
  { key: "weimar", label: "Weimarer Republik", line: "Die Weimarer Republik bestand von 1919 bis 1933.", note: "Germany's first parliamentary democracy — named after the city where its constitution was drafted." },
  { key: "teilung", label: "Teilung Deutschlands", line: "Die Teilung Deutschlands dauerte von 1949 bis 1990.", note: "A direct consequence of the postwar occupation zones hardening into the Cold War border." },
  { key: "mauerfall", label: "Mauerfall", line: "Der Mauerfall 1989 markierte das Ende der deutschen Teilung.", note: "9 November 1989 — the event that opened the path to reunification." },
  { key: "vergangenheitsbewaeltigung", label: "Vergangenheitsbewältigung", line: "Die Vergangenheitsbewältigung ist bis heute ein zentrales Thema der deutschen Erinnerungskultur.", note: "The ongoing collective process of confronting and processing the Nazi period." },
  { key: "zeitzeuge", label: "Zeitzeuge", line: "Ein Zeitzeuge berichtete den Schülern von seinen Erlebnissen während des Krieges.", note: "Someone who personally lived through a historical event and can testify to it firsthand." },
];

const REDUCE = [
  { key: "weimar", label: "Weimarer Republik (1919–1933)", response: "Nationalsozialismus (1933–1945)" },
  { key: "besatzung", label: "Besatzungszonen (nach 1945)", response: "Teilung Deutschlands: DDR und BRD (1949)" },
  { key: "mauerbau", label: "Mauerbau (1961)", response: "Mauerfall (1989)" },
  { key: "mauerfall", label: "Mauerfall (1989)", response: "Wiedervereinigung (1990)" },
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
  discoverList.appendChild(sentenceCard("Der Mauerbau 1961 trennte Ost- und Westberlin.", "The building of the Wall in 1961 separated East and West Berlin."));
  discoverList.appendChild(sentenceCard("Die Wiedervereinigung wurde am 3. Oktober 1990 vollzogen.", "Reunification was completed on 3 October 1990."));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Die Stasi überwachte Millionen von DDR-Bürgern.", "The Stasi surveilled millions of GDR citizens."));
  applyList.appendChild(sentenceCard("Viele Schriftsteller gingen während der NS-Zeit ins Exil.", "Many writers went into exile during the Nazi period."));
  applyList.appendChild(sentenceCard("Die deutsche Erinnerungskultur zeigt sich in zahlreichen Gedenkstätten und Jahrestagen.", "German remembrance culture is expressed in numerous memorials and anniversaries."));

  try {
    const vocab = await loadJSON("../data/vocabulary/c1-geschichte-20-jahrhundert.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(GES_IDS.map(byId).filter(Boolean), document.getElementById("grid-ges"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-ges").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/c1-geschichte-20-jahrhundert-quiz.json");

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
