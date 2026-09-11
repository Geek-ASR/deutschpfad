/**
 * Page script for lessons/b2-modalpartikeln.html — B2 Unit 7.
 * The "use" picker walks five common modal particles; the "flavor"
 * picker gives example sentences for a given communicative goal.
 * No new CSS.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "b2-unit-7-modalpartikeln";

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

const MP_IDS = [
  "mp-ja", "mp-doch", "mp-eben", "mp-halt", "mp-ruhig", "mp-schon",
  "mp-bloss", "mp-nur", "mp-mal", "mp-denn", "mp-vielleicht",
  "mp-eigentlich", "mp-ja-beispiel", "mp-doch-beispiel",
  "mp-doch-widerspruch", "mp-eben-beispiel", "mp-halt-beispiel",
  "mp-ruhig-beispiel", "mp-schon-beispiel", "mp-bloss-beispiel",
  "mp-nur-beispiel", "mp-mal-beispiel", "mp-denn-beispiel",
  "mp-vielleicht-beispiel", "mp-eigentlich-beispiel",
  "mp-schon-vs-bereits", "mp-denn-vs-weil", "mp-partikel-hinweis",
];

const USES = [
  { key: "ja", label: "ja — shared, obvious knowledge", line: "Das ist ja toll!", note: "ja signals that something should already be obvious or known — often with surprise or enthusiasm." },
  { key: "doch", label: "doch — insisting or reminding", line: "Komm doch mit!", note: "doch softens/strengthens an imperative into encouragement — 'come on, join us' rather than a bare command." },
  { key: "eben-halt", label: "eben/halt — that's just how it is", line: "Man kann halt nicht alles haben.", note: "eben and halt both express resignation — halt is more colloquial and regional (esp. southern Germany), eben more neutral." },
  { key: "ruhig", label: "ruhig — reassuring permission", line: "Frag ruhig, wenn du etwas nicht verstehst.", note: "ruhig in an imperative reassures the listener that an action is fine, no need to hesitate." },
  { key: "denn", label: "denn — genuine curiosity in a question", line: "Was machst du denn da?", note: "this denn is a completely different word from the causal conjunction denn (B1 Unit 3) — here it adds interest or mild surprise to a question." },
];

const FLAVOR = [
  { key: "warnung", label: "Eine Warnung geben", response: "Mach das bloß nicht, das könnte gefährlich sein!" },
  { key: "beruhigen", label: "Jemanden beruhigen", response: "Mach dir keine Sorgen, das wird schon gut gehen." },
  { key: "bitte", label: "Eine Bitte weicher machen", response: "Kannst du mir mal helfen?" },
  { key: "erstaunen", label: "Erstaunen ausdrücken", response: "Das ist ja unglaublich!" },
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

function initFlavorPicker() {
  initPicker({
    buttonsId: "flavor-picker-buttons",
    resultId: "flavor-picker-result",
    options: FLAVOR,
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
  initFlavorPicker();

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("Das ist ja toll!", "That's great!"));
  discoverList.appendChild(sentenceCard("Komm doch mit!", "Come on, join us!"));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Wenn ich das nur gewusst hätte!", "If only I had known that!"));
  applyList.appendChild(sentenceCard("Wie spät ist es eigentlich?", "What time is it, by the way?"));
  applyList.appendChild(sentenceCard("Du hast doch keine Zeit, oder? — Doch, ich habe Zeit!", "You don't have time, do you? — Yes I do!"));

  try {
    const vocab = await loadJSON("../data/vocabulary/b2-modalpartikeln.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(MP_IDS.map(byId).filter(Boolean), document.getElementById("grid-mp"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-mp").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/b2-modalpartikeln-quiz.json");

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
