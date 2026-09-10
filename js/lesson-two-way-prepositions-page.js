/**
 * Page script for lessons/a2-two-way-prepositions.html — A2 Unit 3,
 * same shape as the other A2/A1 grammar-unit glue. This lesson's
 * picker shows the same preposition twice — once with a location
 * (Dativ) and once with movement toward it (Akkusativ) — with the
 * case-marked article highlighted in each, using the shared
 * .word-breakdown-part chip. No new CSS.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "a2-unit-3-two-way-prepositions";

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

const TWP_IDS = [
  "twp-in",
  "twp-an",
  "twp-auf",
  "twp-ueber",
  "twp-unter",
  "twp-vor",
  "twp-hinter",
  "twp-neben",
  "twp-zwischen",
  "twp-liegen",
  "twp-legen",
  "twp-stehen",
  "twp-stellen",
];

// wo = location (Dativ), wohin = movement (Akkusativ). article = the
// case-marked word to highlight in each sentence.
const TWP_PREPS = [
  { key: "in", label: "in", prep: "in", wo: "Das Buch ist im Regal.", woArticle: "im", wohin: "Ich stelle das Buch ins Regal.", wohinArticle: "ins" },
  { key: "an", label: "an", prep: "an", wo: "Das Bild hängt an der Wand.", woArticle: "der", wohin: "Ich hänge das Bild an die Wand.", wohinArticle: "die" },
  { key: "auf", label: "auf", prep: "auf", wo: "Die Tasse steht auf dem Tisch.", woArticle: "dem", wohin: "Ich stelle die Tasse auf den Tisch.", wohinArticle: "den" },
  { key: "ueber", label: "über", prep: "über", wo: "Die Lampe hängt über dem Tisch.", woArticle: "dem", wohin: "Ich hänge die Lampe über den Tisch.", wohinArticle: "den" },
  { key: "unter", label: "unter", prep: "unter", wo: "Die Katze liegt unter dem Bett.", woArticle: "dem", wohin: "Die Katze geht unter das Bett.", wohinArticle: "das" },
  { key: "vor", label: "vor", prep: "vor", wo: "Der Bus hält vor dem Haus.", woArticle: "dem", wohin: "Der Bus fährt vor das Haus.", wohinArticle: "das" },
  { key: "hinter", label: "hinter", prep: "hinter", wo: "Der Garten ist hinter dem Haus.", woArticle: "dem", wohin: "Ich gehe hinter das Haus.", wohinArticle: "das" },
  { key: "neben", label: "neben", prep: "neben", wo: "Die Apotheke ist neben dem Supermarkt.", woArticle: "dem", wohin: "Ich stelle den Stuhl neben das Bett.", wohinArticle: "das" },
  { key: "zwischen", label: "zwischen", prep: "zwischen", wo: "Die Bank ist zwischen der Post und dem Café.", woArticle: "der", wohin: "Ich stelle den Tisch zwischen die zwei Stühle.", wohinArticle: "die" },
];

const PHONE_OPTIONS = [
  { key: "tasche", label: "In my bag", response: "Mein Handy ist in meiner Tasche." },
  { key: "tisch", label: "On the table", response: "Mein Handy liegt auf dem Tisch." },
  { key: "bett", label: "Next to the bed", response: "Mein Handy ist neben dem Bett." },
  { key: "hand", label: "In my hand", response: "Mein Handy ist in meiner Hand." },
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

function caseLine(label, sentence, articleWord, tone) {
  const wrap = document.createElement("div");
  wrap.style.width = "100%";
  wrap.style.marginTop = "var(--space-2)";

  const tag = document.createElement("span");
  tag.className = "picker-result-meta";
  tag.style.margin = "0";
  tag.style.fontWeight = "700";
  tag.style.color = tone === "dativ" ? "var(--color-primary)" : "var(--color-accent)";
  tag.textContent = label;
  wrap.appendChild(tag);

  const chip = `<span class="word-breakdown-part" data-type="${tone === "dativ" ? "stem" : "ending"}" style="display:inline-block">${articleWord}</span>`;
  const p = document.createElement("p");
  p.lang = "de";
  p.style.fontSize = "var(--text-md)";
  p.style.lineHeight = "2.2";
  p.style.margin = "0";
  // highlight the case-marked word; use a word-boundary-ish replace so
  // "im" inside another word isn't hit (all target words here are
  // standalone tokens in their sentences).
  p.innerHTML = sentence.replace(new RegExp("\\b" + articleWord + "\\b"), chip);
  wrap.appendChild(p);

  const speakBtn = createSpeakButton(sentence, "Listen");
  if (speakBtn) wrap.appendChild(speakBtn);
  return wrap;
}

function initTwpPicker() {
  initPicker({
    buttonsId: "twp-picker-buttons",
    resultId: "twp-picker-result",
    options: TWP_PREPS,
    renderResult: (option, el) => {
      el.innerHTML = "";

      const heading = document.createElement("span");
      heading.className = "picker-result-word";
      heading.lang = "de";
      heading.textContent = option.prep;
      el.appendChild(heading);

      el.appendChild(caseLine("wo? → Dativ", option.wo, option.woArticle, "dativ"));
      el.appendChild(caseLine("wohin? → Akkusativ", option.wohin, option.wohinArticle, "akkusativ"));
    },
  });
}

function initPhonePicker() {
  initPicker({
    buttonsId: "phone-picker-buttons",
    resultId: "phone-picker-result",
    options: PHONE_OPTIONS,
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

  initTwpPicker();
  initPhonePicker();

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("Das Buch liegt auf dem Tisch.", "The book is lying on the table. (location)"));
  discoverList.appendChild(sentenceCard("Ich lege das Buch auf den Tisch.", "I put the book on the table. (movement)"));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Die Milch ist im Kühlschrank.", "The milk is in the fridge."));
  applyList.appendChild(sentenceCard("Stell die Flasche bitte in den Kühlschrank.", "Please put the bottle in the fridge."));
  applyList.appendChild(sentenceCard("Der Bahnhof ist hinter der Kirche.", "The station is behind the church."));

  try {
    const vocab = await loadJSON("../data/vocabulary/a2-two-way-prepositions.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(TWP_IDS.map(byId).filter(Boolean), document.getElementById("grid-two-way"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-two-way").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/a2-two-way-prepositions-quiz.json");

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
