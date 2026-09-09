/**
 * Page script for lessons/a1-perfekt.html. Lesson-specific glue, same
 * role as js/lesson-modal-verbs-page.js — composes the generic engines
 * (lesson-loop, vocab-card, quiz-engine, picker-widget, speak) plus this
 * lesson's own picker content (haben/sein + participle formation, "what
 * did you do yesterday").
 *
 * Reuses the same inline sentence-highlighting technique Modal Verbs
 * introduced — .word-breakdown-part chips on two separate words within a
 * full sentence (the conjugated auxiliary, the participle at the end) —
 * for the third "verb bracket" unit in a row (Daily Life, Modal Verbs,
 * now Perfekt). Zero new CSS again.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "a1-unit-16-perfekt";

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

const PERFEKT_IDS = [
  "perf-machen",
  "perf-spielen",
  "perf-lernen",
  "perf-gehen",
  "perf-essen",
  "perf-trinken",
  "perf-studieren",
  "perf-aufstehen",
  "perf-aufraeumen",
  "perf-gestern",
  "perf-wochenende",
];

const PERFEKT_VERBS = [
  { key: "machen", label: "machen", infinitive: "machen", meaning: "to do / to make", auxiliary: "haben", auxWord: "hast", participle: "gemacht", pattern: "regular (ge- + -t)", sentence: "Was hast du gestern gemacht?", sentenceEn: "What did you do yesterday?" },
  { key: "spielen", label: "spielen", infinitive: "spielen", meaning: "to play", auxiliary: "haben", auxWord: "habe", participle: "gespielt", pattern: "regular (ge- + -t)", sentence: "Ich habe mit meinem Bruder gespielt.", sentenceEn: "I played with my brother." },
  { key: "lernen", label: "lernen", infinitive: "lernen", meaning: "to learn", auxiliary: "haben", auxWord: "habe", participle: "gelernt", pattern: "regular (ge- + -t)", sentence: "Ich habe Deutsch gelernt.", sentenceEn: "I learned German." },
  { key: "gehen", label: "gehen", infinitive: "gehen", meaning: "to go", auxiliary: "sein", auxWord: "bin", participle: "gegangen", pattern: "irregular (ge- + -en, vowel change)", sentence: "Ich bin einkaufen gegangen.", sentenceEn: "I went shopping." },
  { key: "essen", label: "essen", infinitive: "essen", meaning: "to eat", auxiliary: "haben", auxWord: "habe", participle: "gegessen", pattern: "irregular (ge- + -en, vowel change)", sentence: "Ich habe Pizza gegessen.", sentenceEn: "I ate pizza." },
  { key: "trinken", label: "trinken", infinitive: "trinken", meaning: "to drink", auxiliary: "haben", auxWord: "habe", participle: "getrunken", pattern: "irregular (ge- + -en, vowel change)", sentence: "Ich habe Kaffee getrunken.", sentenceEn: "I drank coffee." },
  { key: "studieren", label: "studieren", infinitive: "studieren", meaning: "to study (at university)", auxiliary: "haben", auxWord: "habe", participle: "studiert", pattern: "-ieren verb (no ge-)", sentence: "Ich habe Informatik studiert.", sentenceEn: "I studied computer science." },
  { key: "aufstehen", label: "aufstehen", infinitive: "aufstehen", meaning: "to get up", auxiliary: "sein", auxWord: "bin", participle: "aufgestanden", pattern: "separable (ge- in the middle)", sentence: "Ich bin früh aufgestanden.", sentenceEn: "I got up early." },
];

const YESTERDAY_OPTIONS = [
  { key: "kaffee", label: "Drank coffee", response: "Ich habe Kaffee getrunken." },
  { key: "einkaufen", label: "Went shopping", response: "Ich bin einkaufen gegangen." },
  { key: "aufraeumen", label: "Tidied my room", response: "Ich habe mein Zimmer aufgeräumt." },
  { key: "lernen", label: "Learned German", response: "Ich habe Deutsch gelernt." },
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

function highlightedSentence(sentence, auxWord, participleWord) {
  const wrap = (word) =>
    `<span class="word-breakdown-part" data-type="stem" style="display:inline-block">${word}</span>`;
  const wrapEnding = (word) =>
    `<span class="word-breakdown-part" data-type="ending" style="display:inline-block">${word}</span>`;

  let html = sentence.replace(auxWord, wrap(auxWord));
  html = html.replace(participleWord, wrapEnding(participleWord));

  const p = document.createElement("p");
  p.lang = "de";
  p.style.fontSize = "var(--text-md)";
  p.style.width = "100%";
  p.style.lineHeight = "2.2";
  p.innerHTML = html;
  return p;
}

function initPerfektPicker() {
  initPicker({
    buttonsId: "perfekt-picker-buttons",
    resultId: "perfekt-picker-result",
    options: PERFEKT_VERBS,
    renderResult: (option, el) => {
      el.innerHTML = "";

      const heading = document.createElement("span");
      heading.className = "picker-result-word";
      heading.lang = "de";
      heading.textContent = `${option.infinitive} — "${option.meaning}"`;
      el.appendChild(heading);

      el.appendChild(caseRow("Auxiliary", option.auxiliary));
      el.appendChild(caseRow("Participle", `${option.participle} (${option.pattern})`));
      el.appendChild(highlightedSentence(option.sentence, option.auxWord, option.participle));

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

function initYesterdayPicker() {
  initPicker({
    buttonsId: "yesterday-picker-buttons",
    resultId: "yesterday-picker-result",
    options: YESTERDAY_OPTIONS,
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

  initPerfektPicker();
  initYesterdayPicker();

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("Was hast du gestern gemacht?", "What did you do yesterday?"));
  discoverList.appendChild(sentenceCard("Ich bin einkaufen gegangen.", "I went shopping."));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Was hast du am Wochenende gemacht?", "What did you do on the weekend?"));
  applyList.appendChild(sentenceCard("Ich habe Informatik studiert.", "I studied computer science."));
  applyList.appendChild(sentenceCard("Ich habe mit meinem Bruder gespielt.", "I played with my brother."));

  try {
    const vocab = await loadJSON("../data/vocabulary/perfekt.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(PERFEKT_IDS.map(byId).filter(Boolean), document.getElementById("grid-perfekt"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-perfekt").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/a1-perfekt-quiz.json");

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
