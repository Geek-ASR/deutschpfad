/**
 * Page script for lessons/a2-comparatives.html — A2 Unit 2, same shape
 * as lesson-praeteritum-page.js and the A1 grammar-unit glue. Composes
 * the generic engines plus this lesson's picker content: an
 * adjective's base → comparative → superlative forms with a highlighted
 * example sentence, and a "what do you prefer" apply picker.
 *
 * Reuses the inline word-highlight technique (one .word-breakdown-part
 * chip on the comparative form in a sentence). No new CSS.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "a2-unit-2-comparatives";

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

const COMP_IDS = [
  "comp-groesser",
  "comp-kleiner",
  "comp-aelter",
  "comp-juenger",
  "comp-teurer",
  "comp-schneller",
  "comp-besser",
  "comp-lieber",
  "comp-mehr",
  "comp-als",
  "comp-so-wie",
  "comp-am-besten",
  "comp-am-groessten",
];

const COMP_ADJECTIVES = [
  { key: "gross", label: "groß", base: "groß", comparative: "größer", superlative: "am größten", note: "adds umlaut", sentence: "Berlin ist größer als München.", sentenceEn: "Berlin is bigger than Munich." },
  { key: "klein", label: "klein", base: "klein", comparative: "kleiner", superlative: "am kleinsten", note: "regular, no umlaut", sentence: "Mein Zimmer ist kleiner als dein Zimmer.", sentenceEn: "My room is smaller than your room." },
  { key: "alt", label: "alt", base: "alt", comparative: "älter", superlative: "am ältesten", note: "adds umlaut; -esten after -t", sentence: "Mein Bruder ist älter als ich.", sentenceEn: "My brother is older than me." },
  { key: "jung", label: "jung", base: "jung", comparative: "jünger", superlative: "am jüngsten", note: "adds umlaut", sentence: "Meine Schwester ist jünger als ich.", sentenceEn: "My sister is younger than me." },
  { key: "teuer", label: "teuer", base: "teuer", comparative: "teurer", superlative: "am teuersten", note: "drops the middle -e-", sentence: "Die Jacke ist teurer als das Hemd.", sentenceEn: "The jacket is more expensive than the shirt." },
  { key: "schnell", label: "schnell", base: "schnell", comparative: "schneller", superlative: "am schnellsten", note: "regular", sentence: "Der Zug ist schneller als der Bus.", sentenceEn: "The train is faster than the bus." },
  { key: "gut", label: "gut", base: "gut", comparative: "besser", superlative: "am besten", note: "irregular", sentence: "Heute ist das Wetter besser als gestern.", sentenceEn: "Today the weather is better than yesterday." },
  { key: "viel", label: "viel", base: "viel", comparative: "mehr", superlative: "am meisten", note: "irregular", sentence: "Er hat mehr Zeit als ich.", sentenceEn: "He has more time than me." },
  { key: "gern", label: "gern", base: "gern", comparative: "lieber", superlative: "am liebsten", note: "irregular — from A1 Food", sentence: "Ich trinke lieber Tee als Kaffee.", sentenceEn: "I'd rather drink tea than coffee." },
];

const PREFER_OPTIONS = [
  { key: "tee", label: "Tea over coffee", response: "Ich trinke lieber Tee als Kaffee." },
  { key: "kaffee", label: "Coffee over tea", response: "Ich trinke lieber Kaffee als Tee." },
  { key: "stadt", label: "City over countryside", response: "Ich wohne lieber in der Stadt als auf dem Land." },
  { key: "sommer", label: "Summer over winter", response: "Ich mag den Sommer lieber als den Winter." },
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

function metaRow(label, word) {
  const row = document.createElement("p");
  row.className = "picker-result-meta";
  row.style.width = "100%";
  row.style.margin = "0";
  row.innerHTML = `${label}: <strong lang="de" style="color: var(--color-ink)">${word}</strong>`;
  return row;
}

function highlightedSentence(sentence, word) {
  const chip = `<span class="word-breakdown-part" data-type="stem" style="display:inline-block">${word}</span>`;
  const p = document.createElement("p");
  p.lang = "de";
  p.style.fontSize = "var(--text-md)";
  p.style.width = "100%";
  p.style.lineHeight = "2.2";
  p.innerHTML = sentence.replace(word, chip);
  return p;
}

function initCompPicker() {
  initPicker({
    buttonsId: "comp-picker-buttons",
    resultId: "comp-picker-result",
    options: COMP_ADJECTIVES,
    renderResult: (option, el) => {
      el.innerHTML = "";

      const heading = document.createElement("span");
      heading.className = "picker-result-word";
      heading.lang = "de";
      heading.textContent = `${option.base} → ${option.comparative} → ${option.superlative}`;
      el.appendChild(heading);

      el.appendChild(metaRow("Pattern", option.note));
      el.appendChild(highlightedSentence(option.sentence, option.comparative));

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

function initPreferPicker() {
  initPicker({
    buttonsId: "prefer-picker-buttons",
    resultId: "prefer-picker-result",
    options: PREFER_OPTIONS,
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

  initCompPicker();
  initPreferPicker();

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("Berlin ist größer als München.", "Berlin is bigger than Munich."));
  discoverList.appendChild(sentenceCard("Heute ist das Wetter besser als gestern.", "Today the weather is better than yesterday."));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Der Zug ist schneller, aber der Bus ist billiger.", "The train is faster, but the bus is cheaper."));
  applyList.appendChild(sentenceCard("Von allen Städten gefällt mir Hamburg am besten.", "Of all the cities, I like Hamburg best."));
  applyList.appendChild(sentenceCard("Meine Wohnung ist so groß wie deine.", "My apartment is as big as yours."));

  try {
    const vocab = await loadJSON("../data/vocabulary/a2-comparatives.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(COMP_IDS.map(byId).filter(Boolean), document.getElementById("grid-comparatives"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-comparatives").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/a2-comparatives-quiz.json");

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
