/**
 * Page script for lessons/c1-literatur.html — C1 Unit 9 (topic unit).
 * The "type" picker walks five key terms; the "narrator" picker
 * matches a description of a narrative style to its term. No new
 * CSS.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "c1-unit-9-literatur";

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

const LIT_IDS = [
  "lit-gattungen", "lit-epik", "lit-lyrik", "lit-dramatik", "lit-roman",
  "lit-erzaehlperspektive", "lit-auktorial", "lit-ich-erzaehler",
  "lit-personal", "lit-unzuverlaessig", "lit-rueckblende", "lit-stilmittel",
  "lit-metapher", "lit-symbol", "lit-motiv", "lit-ironie", "lit-leitmotiv",
  "lit-interpretieren", "lit-deuten", "lit-textanalyse", "lit-spannungsbogen",
  "lit-wendepunkt", "lit-handlung", "lit-figur", "lit-protagonist",
  "lit-epoche", "lit-nachkriegsliteratur", "lit-truemmerliteratur",
];

const USES = [
  { key: "gattungen", label: "die drei Gattungen", line: "Die drei literarischen Gattungen sind Epik, Lyrik und Dramatik.", note: "Every specific literary form fits under one of these three." },
  { key: "metapher", label: "Metapher", line: "In der Metapher \"das Leben ist eine Reise\" wird ein Bild auf einen anderen Sachverhalt übertragen.", note: "A word or image transferred from one thing to describe another, without \"like\" or \"as\"." },
  { key: "unzuverlaessig", label: "unzuverlässiger Erzähler", line: "Ein unzuverlässiger Erzähler lässt Zweifel an der eigenen Darstellung aufkommen.", note: "A narrator whose account the reader has reason to doubt." },
  { key: "leitmotiv", label: "Leitmotiv", line: "Ein Leitmotiv kehrt an mehreren Stellen des Werks wieder.", note: "A Motiv that recurs deliberately at key moments, signalling a theme each time." },
  { key: "truemmerliteratur", label: "Trümmerliteratur", line: "Die Trümmerliteratur beschreibt schonungslos den Alltag im zerstörten Nachkriegsdeutschland.", note: "A stripped-down, unsentimental strand of late-1940s German postwar literature." },
];

const REDUCE = [
  { key: "auktorial", label: "This narrator knows every character's thoughts, past and future.", response: "auktorialer Erzähler" },
  { key: "ich", label: "This narrator is also a character, telling the story from their own view.", response: "Ich-Erzähler" },
  { key: "personal", label: "This narrator stays tightly bound to one character's perspective.", response: "personaler Erzähler" },
  { key: "unzuverlaessig", label: "This narrator's account can't quite be trusted.", response: "unzuverlässiger Erzähler" },
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
  discoverList.appendChild(sentenceCard("Der Roman spielt im Berlin der 1920er Jahre.", "The novel is set in the Berlin of the 1920s."));
  discoverList.appendChild(sentenceCard("Der Ich-Erzähler schildert die Ereignisse aus seiner eigenen Sicht, was Zweifel an seiner Darstellung weckt.", "The first-person narrator describes the events from his own perspective, which raises doubts about his account."));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Das Motiv der Einsamkeit zieht sich durch den ganzen Roman.", "The motif of loneliness runs through the entire novel."));
  applyList.appendChild(sentenceCard("Der Spannungsbogen erreicht seinen Höhepunkt im letzten Kapitel.", "The dramatic arc reaches its peak in the final chapter."));
  applyList.appendChild(sentenceCard("Die Nachkriegsliteratur verarbeitet die Erfahrungen des Krieges.", "Postwar literature works through the experiences of the war."));

  try {
    const vocab = await loadJSON("../data/vocabulary/c1-literatur.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(LIT_IDS.map(byId).filter(Boolean), document.getElementById("grid-lit"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-lit").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/c1-literatur-quiz.json");

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
