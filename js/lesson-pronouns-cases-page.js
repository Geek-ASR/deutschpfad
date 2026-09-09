/**
 * Page script for lessons/a1-pronouns-cases.html. Lesson-specific glue,
 * same role as js/lesson-questions-negation-page.js — composes the
 * generic engines (lesson-loop, vocab-card, quiz-engine, picker-widget,
 * speak) plus this lesson's own picker content (personal pronoun case
 * forms, possessive-article gender forms, thanking the right person).
 * Three pickers, same reasoning as Questions & Negation: this unit
 * bundles two related grammar mechanisms (pronoun cases, possessives)
 * rather than one.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "a1-unit-14-pronouns-cases";

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

const PC_IDS = [
  "pron-ich",
  "pron-du",
  "pron-er",
  "pron-sie-sg",
  "pron-es",
  "pron-wir",
  "pron-ihr",
  "pron-sie-pl",
  "pron-mich",
  "pron-dich",
  "pron-mir",
  "pron-dir",
  "poss-mein",
  "poss-dein",
  "poss-sein",
  "poss-ihr",
  "poss-unser",
  "poss-euer",
  "poss-ihr-formal",
  "pc-kind",
];

const PRONOUNS = [
  { key: "ich", label: "ich", nom: "ich", acc: "mich", dat: "mir", meaning: "I", example: "Kannst du mir helfen?", exampleEn: "Can you help me?" },
  { key: "du", label: "du", nom: "du", acc: "dich", dat: "dir", meaning: "you (informal)", example: "Ich mag dich.", exampleEn: "I like you." },
  { key: "er", label: "er", nom: "er", acc: "ihn", dat: "ihm", meaning: "he / it", example: "Ich sehe ihn.", exampleEn: "I see him." },
  { key: "sie-sg", label: "sie", nom: "sie", acc: "sie", dat: "ihr", meaning: "she / it", example: "Ich gebe ihr das Buch.", exampleEn: "I give her the book." },
  { key: "es", label: "es", nom: "es", acc: "es", dat: "ihm", meaning: "it", example: "Es regnet.", exampleEn: "It's raining." },
  { key: "wir", label: "wir", nom: "wir", acc: "uns", dat: "uns", meaning: "we", example: "Er besucht uns.", exampleEn: "He visits us." },
  { key: "ihr", label: "ihr", nom: "ihr", acc: "euch", dat: "euch", meaning: "you (plural, informal)", example: "Ich rufe euch an.", exampleEn: "I'll call you (all)." },
  { key: "sie-pl", label: "sie / Sie", nom: "sie / Sie", acc: "sie / Sie", dat: "ihnen / Ihnen", meaning: "they / you (formal)", example: "Ich danke Ihnen.", exampleEn: "Thank you (formal)." },
];

const POSSESSIVES = [
  { key: "mein", label: "mein", masc: "mein Bruder", fem: "meine Schwester", neut: "mein Kind", meaning: "my" },
  { key: "dein", label: "dein", masc: "dein Bruder", fem: "deine Schwester", neut: "dein Kind", meaning: "your (informal)" },
  { key: "sein", label: "sein", masc: "sein Bruder", fem: "seine Schwester", neut: "sein Kind", meaning: "his / its" },
  { key: "ihr", label: "ihr", masc: "ihr Bruder", fem: "ihre Schwester", neut: "ihr Kind", meaning: "her / their" },
  { key: "unser", label: "unser", masc: "unser Bruder", fem: "unsere Schwester", neut: "unser Kind", meaning: "our" },
  { key: "euer", label: "euer", masc: "euer Bruder", fem: "eure Schwester", neut: "euer Kind", meaning: "your (plural, informal) — note eure, not euere" },
  { key: "ihr-formal", label: "Ihr", masc: "Ihr Bruder", fem: "Ihre Schwester", neut: "Ihr Kind", meaning: "your (formal)" },
];

const THANKS_OPTIONS = [
  { key: "friend", label: "A close friend", response: "Ich danke dir!" },
  { key: "professor", label: "Your professor", response: "Ich danke Ihnen!" },
  { key: "friends", label: "A group of friends", response: "Ich danke euch!" },
  { key: "strangers", label: "People you just met formally", response: "Ich danke Ihnen!" },
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

function initPronounPicker() {
  initPicker({
    buttonsId: "pronoun-picker-buttons",
    resultId: "pronoun-picker-result",
    options: PRONOUNS,
    renderResult: (option, el) => {
      el.innerHTML = "";

      const heading = document.createElement("span");
      heading.className = "picker-result-word";
      heading.textContent = `"${option.meaning}"`;
      el.appendChild(heading);

      el.appendChild(caseRow("Nominative (subject)", option.nom));
      el.appendChild(caseRow("Accusative (direct object)", option.acc));
      el.appendChild(caseRow("Dative (indirect object)", option.dat));

      const example = document.createElement("p");
      example.className = "picker-result-meta";
      example.style.width = "100%";
      example.style.marginTop = "var(--space-2)";
      example.lang = "de";
      example.innerHTML = `<span lang="de">${option.example}</span> — "${option.exampleEn}"`;
      el.appendChild(example);

      const speakBtn = createSpeakButton(option.example, "Listen");
      if (speakBtn) el.appendChild(speakBtn);
    },
  });
}

function initPossessivePicker() {
  initPicker({
    buttonsId: "possessive-picker-buttons",
    resultId: "possessive-picker-result",
    options: POSSESSIVES,
    renderResult: (option, el) => {
      el.innerHTML = "";

      const heading = document.createElement("span");
      heading.className = "picker-result-word";
      heading.textContent = `"${option.meaning}"`;
      el.appendChild(heading);

      el.appendChild(caseRow("der-word (masculine)", option.masc));
      el.appendChild(caseRow("die-word (feminine)", option.fem));
      el.appendChild(caseRow("das-word (neuter)", option.neut));

      const speakBtn = createSpeakButton(`${option.masc}. ${option.fem}. ${option.neut}.`, "Listen");
      if (speakBtn) el.appendChild(speakBtn);
    },
  });
}

function initThanksPicker() {
  initPicker({
    buttonsId: "thanks-picker-buttons",
    resultId: "thanks-picker-result",
    options: THANKS_OPTIONS,
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

  initPronounPicker();
  initPossessivePicker();
  initThanksPicker();

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("Ich sehe dich.", "I see you."));
  discoverList.appendChild(sentenceCard("Kannst du mir helfen?", "Can you help me?"));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Unser Haus ist groß.", "Our house is big."));
  applyList.appendChild(sentenceCard("Ist das euer Auto?", "Is that your (plural) car?"));
  applyList.appendChild(sentenceCard("Das Kind spielt im Garten.", "The child plays in the garden."));

  try {
    const vocab = await loadJSON("../data/vocabulary/pronouns-cases.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(PC_IDS.map(byId).filter(Boolean), document.getElementById("grid-pc"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-pc").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/a1-pronouns-cases-quiz.json");

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
