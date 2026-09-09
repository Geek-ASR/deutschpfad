/**
 * Page script for lessons/a1-daily-life.html. Lesson-specific glue, same
 * role as js/lesson-animals-page.js — composes the generic engines
 * (lesson-loop, vocab-card, quiz-engine, picker-widget, speak) plus this
 * lesson's own picker content (separable-verb splitting, morning routine).
 *
 * The verb-splitting picker reuses the word-breakdown visual pattern for
 * a fourth lesson (after Numbers, Introductions, Animals) — here using
 * the existing "connector" data-type (already styled for compound
 * numbers' "und") for the "..." that shows the prefix travels across the
 * rest of the sentence. No CSS changes needed.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "a1-unit-12-daily-life";

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

const DAILY_IDS = [
  "daily-aufstehen",
  "daily-aufwachen",
  "daily-fernsehen",
  "daily-einkaufen",
  "daily-aufraeumen",
  "daily-anrufen",
  "daily-mitkommen",
  "daily-zurueckkommen",
  "daily-fruehstuecken",
  "daily-duschen",
  "daily-kochen",
  "daily-alltag",
  "daily-routine",
  "daily-wecker",
  "daily-zimmer",
];

const DAILY_IDS_MORE = [
  "daily-aufmachen",
  "daily-zumachen",
  "daily-anziehen",
  "daily-ausziehen",
  "daily-anfangen",
  "daily-aufhoeren",
  "daily-arbeiten",
  "daily-schlafen",
  "daily-lesen",
  "daily-spielen",
  "daily-lernen",
  "daily-arbeit",
  "daily-freizeit",
  "daily-hobby",
  "daily-sport",
  "daily-handy",
  "daily-computer",
  "daily-internet",
  "daily-zeitung",
  "daily-schliesslich",
];

const VERBS = [
  { key: "aufstehen", label: "aufstehen", infinitive: "aufstehen", meaning: "to get up", ich: "stehe", prefix: "auf", sentence: "Ich stehe um sieben Uhr auf." },
  { key: "aufwachen", label: "aufwachen", infinitive: "aufwachen", meaning: "to wake up", ich: "wache", prefix: "auf", sentence: "Ich wache früh auf." },
  { key: "fernsehen", label: "fernsehen", infinitive: "fernsehen", meaning: "to watch TV", ich: "sehe", prefix: "fern", sentence: "Abends sehe ich gern fern." },
  { key: "einkaufen", label: "einkaufen", infinitive: "einkaufen", meaning: "to shop", ich: "kaufe", prefix: "ein", sentence: "Ich kaufe im Supermarkt ein." },
  { key: "aufraeumen", label: "aufräumen", infinitive: "aufräumen", meaning: "to tidy up", ich: "räume", prefix: "auf", sentence: "Ich räume mein Zimmer auf." },
  { key: "anrufen", label: "anrufen", infinitive: "anrufen", meaning: "to call", ich: "rufe", prefix: "an", sentence: "Ich rufe meine Eltern an." },
  { key: "mitkommen", label: "mitkommen", infinitive: "mitkommen", meaning: "to come along", ich: "komme", prefix: "mit", sentence: "Kommst du mit?" },
  { key: "zurueckkommen", label: "zurückkommen", infinitive: "zurückkommen", meaning: "to come back", ich: "komme", prefix: "zurück", sentence: "Ich komme um sechs Uhr zurück." },
];

const FIRST_OPTIONS = [
  { key: "aufstehen", label: "Get up", response: "Zuerst stehe ich auf." },
  { key: "duschen", label: "Shower", response: "Zuerst dusche ich." },
  { key: "fruehstuecken", label: "Have breakfast", response: "Zuerst frühstücke ich." },
  { key: "fernsehen", label: "Watch TV", response: "Zuerst sehe ich fern." },
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

function initVerbPicker() {
  initPicker({
    buttonsId: "verb-picker-buttons",
    resultId: "verb-picker-result",
    options: VERBS,
    renderResult: (verb, el) => {
      document.getElementById("daily-verb-infinitive").innerHTML =
        `<span lang="de">${verb.infinitive}</span> ("${verb.meaning}")`;

      el.innerHTML = "";
      const stemSpan = document.createElement("span");
      stemSpan.className = "word-breakdown-part";
      stemSpan.dataset.type = "stem";
      stemSpan.lang = "de";
      stemSpan.textContent = `ich ${verb.ich}`;
      el.appendChild(stemSpan);

      const connectorSpan = document.createElement("span");
      connectorSpan.className = "word-breakdown-part";
      connectorSpan.dataset.type = "connector";
      connectorSpan.textContent = "...";
      el.appendChild(connectorSpan);

      const prefixSpan = document.createElement("span");
      prefixSpan.className = "word-breakdown-part";
      prefixSpan.dataset.type = "ending";
      prefixSpan.lang = "de";
      prefixSpan.textContent = verb.prefix;
      el.appendChild(prefixSpan);

      const result = document.createElement("p");
      result.className = "picker-result-meta";
      result.style.width = "100%";
      result.lang = "de";
      result.innerHTML = `= <strong style="color: var(--color-ink)">${verb.sentence}</strong>`;
      el.appendChild(result);

      const speakBtn = createSpeakButton(verb.sentence, "Listen");
      if (speakBtn) el.appendChild(speakBtn);
    },
  });
}

function initFirstPicker() {
  initPicker({
    buttonsId: "first-picker-buttons",
    resultId: "first-picker-result",
    options: FIRST_OPTIONS,
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

  initVerbPicker();
  initFirstPicker();

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("Ich stehe um sieben Uhr auf.", "I get up at seven o'clock."));
  discoverList.appendChild(sentenceCard("Ich räume mein Zimmer auf.", "I tidy up my room."));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Mein Alltag ist ziemlich normal.", "My everyday life is pretty normal."));
  applyList.appendChild(sentenceCard("Danach fahre ich zur Uni.", "Afterward I go to university."));
  applyList.appendChild(sentenceCard("Mein Wecker klingelt um sechs Uhr.", "My alarm clock rings at six o'clock."));

  try {
    const vocab = await loadJSON("../data/vocabulary/daily-life.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(DAILY_IDS.map(byId).filter(Boolean), document.getElementById("grid-daily"));
    renderVocabGrid(DAILY_IDS_MORE.map(byId).filter(Boolean), document.getElementById("grid-daily-more"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-daily").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/a1-daily-life-quiz.json");

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
