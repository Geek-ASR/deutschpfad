/**
 * Page script for lessons/a1-questions-negation.html. Lesson-specific
 * glue, same role as js/lesson-daily-life-page.js — composes the generic
 * engines (lesson-loop, vocab-card, quiz-engine, picker-widget, speak)
 * plus this lesson's own picker content (question words, nicht/kein
 * choice, doch contradictions). Three pickers instead of the usual two,
 * since this unit bundles two related grammar mechanisms (question word
 * order and negation) rather than one.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "a1-unit-13-questions-negation";

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

const QN_IDS = [
  "qn-wer",
  "qn-was",
  "qn-wann",
  "qn-wo",
  "qn-warum",
  "qn-wie",
  "qn-wieviel",
  "qn-wieviele",
  "qn-woher",
  "qn-wohin",
  "qn-welche",
  "qn-nicht",
  "qn-kein",
  "qn-doch",
];

const QUESTION_WORDS = [
  { key: "wer", label: "wer", german: "wer", meaning: "who", sentence: "Wer ist das?", sentenceEn: "Who is that?" },
  { key: "was", label: "was", german: "was", meaning: "what", sentence: "Was machst du?", sentenceEn: "What are you doing?" },
  { key: "wann", label: "wann", german: "wann", meaning: "when", sentence: "Wann kommst du?", sentenceEn: "When are you coming?" },
  { key: "wo", label: "wo", german: "wo", meaning: "where", sentence: "Wo wohnst du?", sentenceEn: "Where do you live?" },
  { key: "warum", label: "warum", german: "warum", meaning: "why", sentence: "Warum lernst du Deutsch?", sentenceEn: "Why are you learning German?" },
  { key: "wie", label: "wie", german: "wie", meaning: "how", sentence: "Wie heißt du?", sentenceEn: "What's your name?" },
  { key: "woher", label: "woher", german: "woher", meaning: "where from", sentence: "Woher kommst du?", sentenceEn: "Where are you from?" },
  { key: "wohin", label: "wohin", german: "wohin", meaning: "where to", sentence: "Wohin gehst du?", sentenceEn: "Where are you going?" },
];

const NEGATION_EXAMPLES = [
  { key: "zeit", label: "„Ich habe ___ Zeit.“", prompt: "Ich habe ___ Zeit.", answer: "keine", full: "Ich habe keine Zeit.", explanation: "„die Zeit“ is a noun — kein negates nouns, and „die“-words take „keine.“" },
  { key: "film", label: "„Der Film ist ___ gut.“", prompt: "Der Film ist ___ gut.", answer: "nicht", full: "Der Film ist nicht gut.", explanation: "„gut“ is an adjective, not a noun — nicht negates everything that isn't a noun." },
  { key: "kaffee", label: "„Ich trinke ___ Kaffee.“", prompt: "Ich trinke ___ Kaffee.", answer: "keinen", full: "Ich trinke keinen Kaffee.", explanation: "„der Kaffee“ is masculine — kein becomes keinen here, the same shift einen made in the Drinks unit." },
  { key: "mitkommen", label: "„Ich komme ___ mit.“", prompt: "Ich komme ___ mit.", answer: "nicht", full: "Ich komme nicht mit.", explanation: "„komme ... mit“ is a verb (mitkommen) — nicht negates verbs." },
  { key: "problem", label: "„Das ist ___ Problem.“", prompt: "Das ist ___ Problem.", answer: "kein", full: "Das ist kein Problem.", explanation: "„das Problem“ is neuter — kein stays kein for das-words, same as ein did." },
];

const DOCH_EXAMPLES = [
  { key: "hunger", label: "Hast du keinen Hunger?", question: "Hast du keinen Hunger?", questionEn: "Aren't you hungry?", answer: "Doch, ich habe Hunger!" },
  { key: "deutsch", label: "Sprichst du nicht Deutsch?", question: "Sprichst du nicht Deutsch?", questionEn: "Don't you speak German?", answer: "Doch, ich spreche Deutsch!" },
  { key: "schokolade", label: "Magst du keine Schokolade?", question: "Magst du keine Schokolade?", questionEn: "Don't you like chocolate?", answer: "Doch, ich mag Schokolade!" },
  { key: "mitkommen", label: "Kommst du nicht mit?", question: "Kommst du nicht mit?", questionEn: "Aren't you coming along?", answer: "Doch, ich komme mit!" },
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

function initQuestionPicker() {
  initPicker({
    buttonsId: "question-picker-buttons",
    resultId: "question-picker-result",
    options: QUESTION_WORDS,
    renderResult: (option, el) => {
      el.innerHTML = "";
      const word = document.createElement("span");
      word.className = "picker-result-word";
      word.lang = "de";
      word.textContent = option.sentence;
      el.appendChild(word);
      const speakBtn = createSpeakButton(option.sentence, "Listen");
      if (speakBtn) el.appendChild(speakBtn);
      const meta = document.createElement("p");
      meta.className = "picker-result-meta";
      meta.textContent = `"${option.sentenceEn}" — ${option.german} = "${option.meaning}"`;
      el.appendChild(meta);
    },
  });
}

function initNegationPicker() {
  initPicker({
    buttonsId: "negation-picker-buttons",
    resultId: "negation-picker-result",
    options: NEGATION_EXAMPLES,
    renderResult: (option, el) => {
      el.innerHTML = "";
      const word = document.createElement("span");
      word.className = "picker-result-word";
      word.lang = "de";
      word.style.fontSize = "var(--text-md)";
      word.textContent = option.full;
      el.appendChild(word);
      const speakBtn = createSpeakButton(option.full, "Listen");
      if (speakBtn) el.appendChild(speakBtn);
      const meta = document.createElement("p");
      meta.className = "picker-result-meta";
      meta.textContent = option.explanation;
      el.appendChild(meta);
    },
  });
}

function initDochPicker() {
  initPicker({
    buttonsId: "doch-picker-buttons",
    resultId: "doch-picker-result",
    options: DOCH_EXAMPLES,
    renderResult: (option, el) => {
      el.innerHTML = "";
      const word = document.createElement("span");
      word.className = "picker-result-word";
      word.lang = "de";
      word.style.fontSize = "var(--text-md)";
      word.textContent = option.answer;
      el.appendChild(word);
      const speakBtn = createSpeakButton(option.answer, "Listen");
      if (speakBtn) el.appendChild(speakBtn);
      const meta = document.createElement("p");
      meta.className = "picker-result-meta";
      meta.textContent = `Question: "${option.questionEn}" — the true answer is yes, so it's doch, not ja.`;
      el.appendChild(meta);
    },
  });
}

async function main() {
  markLessonVisited(LESSON_ID);

  const stepsContainer = document.getElementById("lesson-steps");
  initLessonLoop({ container: stepsContainer, stepLabels: STEP_LABELS });

  initQuestionPicker();
  initNegationPicker();
  initDochPicker();

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("Wann kommst du?", "When are you coming?"));
  discoverList.appendChild(sentenceCard("Ich habe keine Zeit.", "I don't have time."));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Wie viele Geschwister hast du?", "How many siblings do you have?"));
  applyList.appendChild(sentenceCard("Welche Farbe magst du?", "Which color do you like?"));
  applyList.appendChild(sentenceCard("Das ist kein Problem.", "That's not a problem."));

  try {
    const vocab = await loadJSON("../data/vocabulary/questions-negation.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(QN_IDS.map(byId).filter(Boolean), document.getElementById("grid-qn"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-qn").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/a1-questions-negation-quiz.json");

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
