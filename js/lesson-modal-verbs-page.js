/**
 * Page script for lessons/a1-modal-verbs.html. Lesson-specific glue, same
 * role as js/lesson-pronouns-cases-page.js — composes the generic engines
 * (lesson-loop, vocab-card, quiz-engine, picker-widget, speak) plus this
 * lesson's own picker content (modal verb conjugation + the "verb
 * bracket" word order, weekend plans).
 *
 * Reuses .word-breakdown-part chips to highlight the two halves of the
 * bracket (the conjugated modal, the displaced infinitive) inline within
 * a full sentence — a new use of the existing class (highlighting two
 * words within a sentence, not decomposing one word into parts), but
 * still zero new CSS.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "a1-unit-15-modal-verbs";

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

const MODAL_IDS = [
  "modal-koennen",
  "modal-muessen",
  "modal-wollen",
  "modal-duerfen",
  "modal-sollen",
  "modal-moegen",
  "modal-moechten",
];

const MODALS = [
  { key: "koennen", label: "können", infinitive: "können", meaning: "can / to be able to", ich: "kann", du: "kannst", er: "kann", modalWord: "kann", mainVerbWord: "kochen", sentence: "Ich kann gut kochen.", sentenceEn: "I can cook well." },
  { key: "muessen", label: "müssen", infinitive: "müssen", meaning: "must / to have to", ich: "muss", du: "musst", er: "muss", modalWord: "muss", mainVerbWord: "aufstehen", sentence: "Ich muss früh aufstehen.", sentenceEn: "I have to get up early." },
  { key: "wollen", label: "wollen", infinitive: "wollen", meaning: "to want to", ich: "will", du: "willst", er: "will", modalWord: "will", mainVerbWord: "lernen", sentence: "Ich will Deutsch lernen.", sentenceEn: "I want to learn German." },
  { key: "duerfen", label: "dürfen", infinitive: "dürfen", meaning: "may / to be allowed to", ich: "darf", du: "darfst", er: "darf", modalWord: "Darf", mainVerbWord: "öffnen", sentence: "Darf ich das Fenster öffnen?", sentenceEn: "May I open the window?" },
  { key: "sollen", label: "sollen", infinitive: "sollen", meaning: "should / to be supposed to", ich: "soll", du: "sollst", er: "soll", modalWord: "sollst", mainVerbWord: "trinken", sentence: "Du sollst mehr Wasser trinken.", sentenceEn: "You should drink more water." },
  { key: "moegen", label: "mögen", infinitive: "mögen", meaning: "to like", ich: "mag", du: "magst", er: "mag", modalWord: "mag", mainVerbWord: null, sentence: "Ich mag Pizza.", sentenceEn: "I like pizza. (no second verb needed)" },
  { key: "moechten", label: "möchten", infinitive: "möchten", meaning: "would like to", ich: "möchte", du: "möchtest", er: "möchte", modalWord: "möchte", mainVerbWord: "trinken", sentence: "Ich möchte einen Kaffee trinken.", sentenceEn: "I would like to drink a coffee." },
];

const WEEKEND_OPTIONS = [
  { key: "einkaufen", label: "Go shopping", response: "Ich will einkaufen." },
  { key: "fernsehen", label: "Watch TV", response: "Ich will fernsehen." },
  { key: "kochen", label: "Cook", response: "Ich will kochen." },
  { key: "aufraeumen", label: "Tidy my room", response: "Ich will mein Zimmer aufräumen." },
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

function caseRow(label, word) {
  const row = document.createElement("p");
  row.className = "picker-result-meta";
  row.style.width = "100%";
  row.style.margin = "0";
  row.innerHTML = `${label}: <strong lang="de" style="color: var(--color-ink)">${word}</strong>`;
  return row;
}

function highlightedSentence(sentence, modalWord, mainVerbWord) {
  const wrap = (word) =>
    `<span class="word-breakdown-part" data-type="stem" style="display:inline-block">${word}</span>`;
  const wrapEnding = (word) =>
    `<span class="word-breakdown-part" data-type="ending" style="display:inline-block">${word}</span>`;

  let html = sentence.replace(modalWord, wrap(modalWord));
  if (mainVerbWord) {
    html = html.replace(mainVerbWord, wrapEnding(mainVerbWord));
  }

  const p = document.createElement("p");
  p.lang = "de";
  p.style.fontSize = "var(--text-md)";
  p.style.width = "100%";
  p.style.lineHeight = "2.2";
  p.innerHTML = html;
  return p;
}

function initModalPicker() {
  initPicker({
    buttonsId: "modal-picker-buttons",
    resultId: "modal-picker-result",
    options: MODALS,
    renderResult: (option, el) => {
      el.innerHTML = "";

      const heading = document.createElement("span");
      heading.className = "picker-result-word";
      heading.lang = "de";
      heading.textContent = `${option.infinitive} — "${option.meaning}"`;
      el.appendChild(heading);

      el.appendChild(caseRow("ich", option.ich));
      el.appendChild(caseRow("du", option.du));
      el.appendChild(caseRow("er/sie/es", option.er));

      el.appendChild(highlightedSentence(option.sentence, option.modalWord, option.mainVerbWord));

      const englishNote = document.createElement("p");
      englishNote.className = "picker-result-meta";
      englishNote.style.width = "100%";
      englishNote.style.marginTop = "0";
      englishNote.textContent = `"${option.sentenceEn}"`;
      el.appendChild(englishNote);

      const speakBtn = createSpeakButton(option.sentence, "Listen");
      if (speakBtn) el.appendChild(speakBtn);
    },
  });
}

function initWeekendPicker() {
  initPicker({
    buttonsId: "weekend-picker-buttons",
    resultId: "weekend-picker-result",
    options: WEEKEND_OPTIONS,
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

  initModalPicker();
  initWeekendPicker();

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("Ich kann gut Deutsch sprechen.", "I can speak German well."));
  discoverList.appendChild(sentenceCard("Ich muss früh aufstehen.", "I have to get up early."));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Darfst du am Wochenende ausgehen?", "Are you allowed to go out on the weekend?"));
  applyList.appendChild(sentenceCard("Ich mag Pizza, aber ich muss gesund essen.", "I like pizza, but I have to eat healthy."));
  applyList.appendChild(sentenceCard("Möchtest du mitkommen?", "Would you like to come along?"));

  try {
    const vocab = await loadJSON("../data/vocabulary/modal-verbs.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(MODAL_IDS.map(byId).filter(Boolean), document.getElementById("grid-modals"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-modals").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/a1-modal-verbs-quiz.json");

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
