/**
 * Page script for lessons/a1-animals.html. Lesson-specific glue, same
 * role as js/lesson-home-page.js — composes the generic engines
 * (lesson-loop, vocab-card, quiz-engine, picker-widget, speak) plus this
 * lesson's own picker content (plural patterns, favorite animal).
 *
 * The plural picker reuses the word-breakdown visual pattern
 * (js/lesson-introductions-page.js's stem/ending split) for a third
 * lesson — here decomposing a plural into its stem and suffix instead
 * of a verb into its stem and ending, with no CSS changes needed.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "a1-unit-11-animals";

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

const ANIMAL_IDS = [
  "animal-hund",
  "animal-kuh",
  "animal-huhn",
  "animal-katze",
  "animal-baer",
  "animal-vogel",
  "animal-kaninchen",
  "animal-kaenguru",
  "animal-pferd",
  "animal-schwein",
  "animal-schaf",
  "animal-ente",
  "animal-loewe",
  "animal-elefant",
  "animal-affe",
  "animal-maus",
  "animal-tier",
  "animal-haustier",
];

const ANIMAL_IDS_MORE = [
  "animal-fisch",
  "animal-schmetterling",
  "animal-biene",
  "animal-spinne",
  "animal-frosch",
  "animal-schildkroete",
  "animal-fuchs",
  "animal-wolf",
  "animal-ziege",
  "animal-esel",
  "animal-tiger",
  "animal-giraffe",
  "animal-zoo",
  "animal-bauernhof",
  "animal-wald",
  "animal-fuettern",
  "animal-streicheln",
  "animal-wild",
  "animal-zahm",
  "animal-schwanz",
];

// One animal per plural pattern. "stem" is the plural word up to where
// the suffix begins (already umlauted where relevant); "ending" is the
// suffix itself, empty for the umlaut-only and no-change patterns.
const ANIMALS = [
  { key: "hund", label: "Hund", article: "der", singular: "Hund", meaning: "dog", plural: "Hunde", stem: "Hund", ending: "e", patternName: "add -e" },
  { key: "kuh", label: "Kuh", article: "die", singular: "Kuh", meaning: "cow", plural: "Kühe", stem: "Küh", ending: "e", patternName: "add -e + umlaut" },
  { key: "huhn", label: "Huhn", article: "das", singular: "Huhn", meaning: "chicken", plural: "Hühner", stem: "Hühn", ending: "er", patternName: "add -er + umlaut" },
  { key: "katze", label: "Katze", article: "die", singular: "Katze", meaning: "cat", plural: "Katzen", stem: "Katze", ending: "n", patternName: "add -n" },
  { key: "baer", label: "Bär", article: "der", singular: "Bär", meaning: "bear", plural: "Bären", stem: "Bär", ending: "en", patternName: "add -en" },
  { key: "vogel", label: "Vogel", article: "der", singular: "Vogel", meaning: "bird", plural: "Vögel", stem: "Vögel", ending: "", patternName: "umlaut only" },
  { key: "kaninchen", label: "Kaninchen", article: "das", singular: "Kaninchen", meaning: "rabbit", plural: "Kaninchen", stem: "Kaninchen", ending: "", patternName: "no change" },
  { key: "kaenguru", label: "Känguru", article: "das", singular: "Känguru", meaning: "kangaroo", plural: "Kängurus", stem: "Känguru", ending: "s", patternName: "add -s" },
];

const FAVORITE_ANIMAL_OPTIONS = [
  { key: "hund", label: "Dog", response: "Mein Lieblingstier ist der Hund." },
  { key: "katze", label: "Cat", response: "Mein Lieblingstier ist die Katze." },
  { key: "vogel", label: "Bird", response: "Mein Lieblingstier ist der Vogel." },
  { key: "elefant", label: "Elephant", response: "Mein Lieblingstier ist der Elefant." },
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

function initAnimalPicker() {
  initPicker({
    buttonsId: "animal-picker-buttons",
    resultId: "animal-picker-result",
    options: ANIMALS,
    renderResult: (animal, el) => {
      document.getElementById("animal-pattern-name").innerHTML =
        `<span lang="de">${animal.article} ${animal.singular}</span> ("${animal.meaning}") — pattern: ${animal.patternName}`;

      el.innerHTML = "";
      const stemSpan = document.createElement("span");
      stemSpan.className = "word-breakdown-part";
      stemSpan.dataset.type = "stem";
      stemSpan.lang = "de";
      stemSpan.textContent = animal.stem;
      el.appendChild(stemSpan);

      if (animal.ending) {
        const endingSpan = document.createElement("span");
        endingSpan.className = "word-breakdown-part";
        endingSpan.dataset.type = "ending";
        endingSpan.lang = "de";
        endingSpan.textContent = animal.ending;
        el.appendChild(endingSpan);
      }

      const result = document.createElement("span");
      result.style.color = "var(--color-ink-soft)";
      result.style.fontSize = "var(--text-base)";
      result.lang = "de";
      result.innerHTML = `= <strong style="color: var(--color-ink)">die ${animal.plural}</strong>`;
      el.appendChild(result);

      const speakBtn = createSpeakButton(`die ${animal.plural}`, "Listen");
      if (speakBtn) el.appendChild(speakBtn);
    },
  });
}

function initFavoriteAnimalPicker() {
  initPicker({
    buttonsId: "favorite-animal-picker-buttons",
    resultId: "favorite-animal-picker-result",
    options: FAVORITE_ANIMAL_OPTIONS,
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

  initAnimalPicker();
  initFavoriteAnimalPicker();

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("Ich habe einen Hund.", "I have a dog."));
  discoverList.appendChild(sentenceCard("Wir haben zwei Hunde.", "We have two dogs."));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Hast du ein Haustier?", "Do you have a pet?"));
  applyList.appendChild(sentenceCard("Der Löwe ist der König der Tiere.", "The lion is the king of the animals."));
  applyList.appendChild(sentenceCard("Die Katze jagt die Maus.", "The cat chases the mouse."));

  try {
    const vocab = await loadJSON("../data/vocabulary/animals.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(ANIMAL_IDS.map(byId).filter(Boolean), document.getElementById("grid-animals"));
    renderVocabGrid(ANIMAL_IDS_MORE.map(byId).filter(Boolean), document.getElementById("grid-animals-more"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-animals").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/a1-animals-quiz.json");

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
