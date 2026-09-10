/**
 * Page script for lessons/a2-adjective-endings-none.html — A2 Unit 16,
 * same shape as Units 12 & 14. The picker puts an article-less noun
 * phrase in a sentence in a specific case; the strong adjective
 * ending is chipped (Unicode-aware, for heißem etc.) and matched to
 * the article ending it copies. No new CSS.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "a2-unit-16-adjective-endings-none";

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

const STRONG_IDS = [
  "se-viel",
  "se-etwas",
  "se-frisch",
  "se-heiss",
  "se-lecker",
  "se-scharf",
  "se-mild",
  "se-gebraten",
  "se-gekocht",
  "se-hausgemacht",
  "se-frei",
  "se-herzlich",
  "se-typisch",
];

// chip = the exact adjective+ending token to highlight in `sentence`.
const PHRASES = [
  { key: "nom-m", label: "no article + adj + Kaffee — Nom, m", sentence: "Guter Kaffee schmeckt auch ohne Zucker.", chip: "Guter", ending: "-er", like: "der" },
  { key: "nomacc-f", label: "no article + adj + Milch — Nom/Akk, f", sentence: "Zum Müsli nehme ich frische Milch.", chip: "frische", ending: "-e", like: "die" },
  { key: "nomacc-n", label: "no article + adj + Wasser — Nom/Akk, n", sentence: "Nach dem Sport trinke ich kaltes Wasser.", chip: "kaltes", ending: "-es", like: "das" },
  { key: "nomacc-pl", label: "no article + adj + Leute — plural", sentence: "Auf der Feier waren nette Leute.", chip: "nette", ending: "-e", like: "die (plural)" },
  { key: "akk-m", label: "no article + adj + Tee — Akkusativ, m", sentence: "Ich trinke lieber heißen Tee als kalten Saft.", chip: "heißen", ending: "-en", like: "den" },
  { key: "dat-m", label: "mit + adj + Tee — Dativ, m", sentence: "Mit heißem Tee wird dir schnell wärmer.", chip: "heißem", ending: "-em", like: "dem" },
  { key: "dat-f", label: "mit + adj + Milch — Dativ, f", sentence: "Einen Kaffee mit warmer Milch, bitte.", chip: "warmer", ending: "-er", like: "der (dative)" },
  { key: "after-viel", label: "viel + adj + Luft — after viel", sentence: "Am Meer gibt es viel frische Luft.", chip: "frische", ending: "-e", like: "die — viel doesn't decline, so the adjective is strong" },
];

const PHRASE_OPTIONS = [
  { key: "geburtstag", label: "It's someone's birthday", response: "Herzlichen Glückwunsch zum Geburtstag!" },
  { key: "essen", label: "Just before a meal", response: "Guten Appetit!" },
  { key: "freitag", label: "It's Friday afternoon", response: "Schönes Wochenende!" },
  { key: "danke", label: "Someone helped you a lot", response: "Vielen Dank für deine Hilfe!" },
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
  const chip = `<span class="word-breakdown-part" data-type="ending" style="display:inline-block">${word}</span>`;
  return sentence.replace(rx, chip);
}

function initStrPicker() {
  initPicker({
    buttonsId: "str-picker-buttons",
    resultId: "str-picker-result",
    options: PHRASES,
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
      meta.innerHTML = `ending <strong style="color: var(--color-ink)">${option.ending}</strong> — the ending <span lang="de">${option.like}</span> would have had`;
      el.appendChild(meta);

      const speakBtn = createSpeakButton(option.sentence, "Listen");
      if (speakBtn) el.appendChild(speakBtn);
    },
  });
}

function initPhrasePicker() {
  initPicker({
    buttonsId: "phrase-picker-buttons",
    resultId: "phrase-picker-result",
    options: PHRASE_OPTIONS,
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

  initStrPicker();
  initPhrasePicker();

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("der gute Kaffee — Unit 12", "the good coffee (after der → ending -e)"));
  discoverList.appendChild(sentenceCard("guter Kaffee", "good coffee (no article → ending -er, the one der carried)"));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Auf der Karte steht: gebratener Fisch mit frischem Gemüse und hausgemachten Nudeln.", "The menu says: fried fish with fresh vegetables and homemade pasta."));
  applyList.appendChild(sentenceCard("Ich hätte gern etwas heißen Tee und ein Stück hausgemachten Kuchen.", "I'd like some hot tea and a piece of homemade cake."));
  applyList.appendChild(sentenceCard("Typisch deutsches Essen ist oft deftig: Wurst, Kartoffeln, Sauerkraut.", "Typical German food is often hearty: sausage, potatoes, sauerkraut."));

  try {
    const vocab = await loadJSON("../data/vocabulary/a2-adjective-endings-none.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(STRONG_IDS.map(byId).filter(Boolean), document.getElementById("grid-strong"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-strong").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/a2-adjective-endings-none-quiz.json");

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
