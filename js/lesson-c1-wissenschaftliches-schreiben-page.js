/**
 * Page script for lessons/c1-wissenschaftliches-schreiben.html —
 * C1 Unit 12 (topic unit). The "type" picker walks five key terms;
 * the "fix it" picker matches a drafting problem to the term for
 * fixing it. No new CSS.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "c1-unit-12-wissenschaftliches-schreiben";

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

const WS_IDS = [
  "ws-intro", "ws-einleitung", "ws-hauptteil", "ws-schluss",
  "ws-roter-faden", "ws-gliederungspunkt", "ws-kohaerenz", "ws-kohaerent",
  "ws-zitieren", "ws-woertlich-sinngemaess", "ws-quellenangabe",
  "ws-fussnote", "ws-literaturverzeichnis", "ws-plagiat", "ws-sachlich",
  "ws-praezise", "ws-redundant", "ws-praegnant", "ws-stringent",
  "ws-konsistent", "ws-entwurf", "ws-ueberarbeiten", "ws-korrekturlesen",
  "ws-formulierung", "ws-praezisieren", "ws-abstract", "ws-formulieren",
  "ws-redundanz",
];

const USES = [
  { key: "roter-faden", label: "roter Faden", line: "Ein roter Faden hält den Text auch über viele Seiten hinweg zusammen.", note: "The single line of reasoning that should stay visible from the Einleitung to the Schluss." },
  { key: "zitat", label: "wörtliches vs. sinngemäßes Zitat", line: "Ein wörtliches Zitat steht in Anführungszeichen, ein sinngemäßes Zitat gibt den Gedanken in eigenen Worten wieder.", note: "Both still need a Quellenangabe, or the result risks being a Plagiat." },
  { key: "sachlich", label: "sachlich", line: "Ein wissenschaftlicher Text sollte sachlich und nicht emotional geschrieben sein.", note: "The expected register of academic writing — measured, fact-focused." },
  { key: "stringent", label: "stringent", line: "Die Argumentation sollte stringent von der These zum Schluss führen.", note: "An argument that proceeds logically from point to point with nothing missing." },
  { key: "ueberarbeiten", label: "überarbeiten vs. Korrekturlesen", line: "Ein guter Text wird mehrfach überarbeitet.", note: "überarbeiten is deeper content revision; Korrekturlesen is the final pass for typos." },
];

const REDUCE = [
  { key: "redundant", label: "The same idea gets repeated three times.", response: "Redundanz streichen" },
  { key: "vague", label: "A sentence is too vague — it doesn't say exactly what's meant.", response: "die Formulierung präzisieren" },
  { key: "quelle", label: "An idea is borrowed from another text with no attribution.", response: "eine Quellenangabe ergänzen" },
  { key: "typo", label: "The final draft still has typos.", response: "Korrekturlesen" },
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
  discoverList.appendChild(sentenceCard("Der erste Entwurf muss selten perfekt sein.", "The first draft rarely needs to be perfect."));
  discoverList.appendChild(sentenceCard("Ein guter Text wird mehrfach überarbeitet, bis er sachlich, präzise und kohärent ist.", "A good text gets revised multiple times, until it is factual, precise, and coherent."));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Jede Quellenangabe muss vollständig und nachprüfbar sein.", "Every citation must be complete and verifiable."));
  applyList.appendChild(sentenceCard("Das Abstract fasst Ziel, Methode und Ergebnis der Arbeit in wenigen Sätzen zusammen.", "The abstract summarises the paper's aim, method, and result in a few sentences."));
  applyList.appendChild(sentenceCard("Redundante Formulierungen sollten beim Überarbeiten gestrichen werden.", "Redundant phrasing should be cut during revision."));

  try {
    const vocab = await loadJSON("../data/vocabulary/c1-wissenschaftliches-schreiben.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(WS_IDS.map(byId).filter(Boolean), document.getElementById("grid-ws"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-ws").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/c1-wissenschaftliches-schreiben-quiz.json");

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
