/**
 * Page script for lessons/a2-temporal-clauses.html — A2 Unit 21, same
 * shape as the other A2 grammar-unit glue. The picker shows a sentence
 * with a time conjunction, the moved verb chipped, and a meaning note.
 * No new CSS.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "a2-unit-21-temporal-clauses";

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

const TC_IDS = [
  "tc-bevor",
  "tc-nachdem",
  "tc-waehrend",
  "tc-bis",
  "tc-seitdem",
  "tc-sobald",
  "tc-solange",
  "tc-als",
  "tc-wenn",
  "tc-zuerst",
  "tc-danach",
  "tc-schliesslich",
  "tc-gleichzeitig",
];

// chip = the clause-final verb to highlight in `sentence`.
const TC_CONJ = [
  { key: "bevor", label: "bevor — before", sentence: "Bevor ich ins Bett gehe, putze ich mir die Zähne.", chip: "gehe", note: "before — verb to the end (Unit 4). Not the preposition \"vor\"." },
  { key: "nachdem", label: "nachdem — after", sentence: "Nachdem wir gegessen haben, sind wir spazieren gegangen.", chip: "haben", note: "after — Perfekt in the nachdem-clause, present/past in the main clause." },
  { key: "waehrend", label: "während — while", sentence: "Während ich koche, deckt er den Tisch.", chip: "koche", note: "while (at the same time). Also a Genitiv preposition (Unit 10)." },
  { key: "bis", label: "bis — until", sentence: "Wir bleiben hier, bis der Regen aufhört.", chip: "aufhört", note: "until — the end point of an action. Also a preposition: bis Montag." },
  { key: "seitdem", label: "seitdem — since", sentence: "Seitdem ich in Deutschland wohne, fahre ich viel Rad.", chip: "wohne", note: "since (a past start, still true) — present tense. Compare \"seit\", Unit 6." },
  { key: "sobald", label: "sobald — as soon as", sentence: "Sobald ich zu Hause bin, rufe ich dich an.", chip: "bin", note: "as soon as — the moment one thing is done, the other follows." },
  { key: "solange", label: "solange — as long as", sentence: "Solange du krank bist, solltest du zu Hause bleiben.", chip: "bist", note: "as long as — for the whole time something lasts. One word." },
  { key: "als", label: "als — when (one past event)", sentence: "Als ich klein war, hatten wir einen Hund.", chip: "war", note: "when — a single event or state in the past. Repeated → wenn." },
];

const SEQ_OPTIONS = [
  { key: "morgens", label: "First / then / finally", response: "Zuerst dusche ich, dann frühstücke ich, und schließlich fahre ich zur Arbeit." },
  { key: "verlassen", label: "Before I leave the house", response: "Bevor ich das Haus verlasse, prüfe ich, ob ich alles habe." },
  { key: "buero", label: "As soon as I'm at the office", response: "Sobald ich im Büro bin, mache ich mir einen Kaffee." },
  { key: "feierabend", label: "After work", response: "Nachdem ich Feierabend gemacht habe, gehe ich oft joggen." },
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

function chipInto(sentence, word) {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const rx = new RegExp("(?<![\\p{L}\\p{N}_])" + escaped + "(?![\\p{L}\\p{N}_])", "u");
  const chip = `<span class="word-breakdown-part" data-type="stem" style="display:inline-block">${word}</span>`;
  return sentence.replace(rx, chip);
}

function initTcPicker() {
  initPicker({
    buttonsId: "tc-picker-buttons",
    resultId: "tc-picker-result",
    options: TC_CONJ,
    renderResult: (option, el) => {
      el.innerHTML = "";

      const heading = document.createElement("span");
      heading.className = "picker-result-word";
      heading.lang = "de";
      heading.textContent = option.label;
      el.appendChild(heading);

      const s = document.createElement("p");
      s.lang = "de";
      s.style.fontSize = "var(--text-md)";
      s.style.lineHeight = "2.2";
      s.style.width = "100%";
      s.innerHTML = chipInto(option.sentence, option.chip);
      el.appendChild(s);

      const meta = document.createElement("p");
      meta.className = "picker-result-meta";
      meta.style.width = "100%";
      meta.style.margin = "0";
      meta.textContent = option.note;
      el.appendChild(meta);

      const speakBtn = createSpeakButton(option.sentence, "Listen");
      if (speakBtn) el.appendChild(speakBtn);
    },
  });
}

function initSeqPicker() {
  initPicker({
    buttonsId: "seq-picker-buttons",
    resultId: "seq-picker-result",
    options: SEQ_OPTIONS,
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

  initTcPicker();
  initSeqPicker();

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("Bevor ich gehe, mache ich das Licht aus.", "Before I leave, I turn off the light."));
  discoverList.appendChild(sentenceCard("Nachdem ich das Licht ausgemacht habe, gehe ich.", "After I've turned off the light, I leave."));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Seitdem ich einen Deutschkurs mache, verstehe ich viel mehr.", "Since I've been doing a German course, I understand much more."));
  applyList.appendChild(sentenceCard("Wir warten am Bahnsteig, bis der Zug kommt.", "We wait on the platform until the train comes."));
  applyList.appendChild(sentenceCard("Als ich zum ersten Mal in Deutschland war, konnte ich fast nichts sagen.", "The first time I was in Germany, I could barely say a thing."));

  try {
    const vocab = await loadJSON("../data/vocabulary/a2-temporal-clauses.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(TC_IDS.map(byId).filter(Boolean), document.getElementById("grid-temporal"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-temporal").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/a2-temporal-clauses-quiz.json");

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
