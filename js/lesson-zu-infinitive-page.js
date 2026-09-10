/**
 * Page script for lessons/a2-zu-infinitive.html — A2 Unit 18, same
 * shape as the other A2 grammar-unit glue. The picker shows a full
 * sentence with the "zu + infinitive" phrase chipped (Unicode-aware)
 * and a note on the trigger type. No new CSS.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "a2-unit-18-zu-infinitive";

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

const ZU_IDS = [
  "zi-vorhaben",
  "zi-versuchen",
  "zi-hoffen",
  "zi-vergessen",
  "zi-anfangen",
  "zi-aufhoeren",
  "zi-vorschlagen",
  "zi-sich-entscheiden",
  "zi-lust-haben",
  "zi-absicht",
  "zi-um-zu",
  "zi-ohne-zu",
  "zi-statt-zu",
];

// chip = the exact "zu … infinitive" span to highlight in `sentence`.
const TRIGGERS = [
  { key: "vorhaben", label: "vorhaben — to plan", sentence: "Ich habe vor, im Sommer nach Wien zu ziehen.", chip: "zu ziehen", note: "trigger verb → comma + zu + infinitive at the end" },
  { key: "versuchen", label: "versuchen — to try (separable inf.)", sentence: "Ich versuche, jeden Tag früher aufzustehen.", chip: "aufzustehen", note: "separable verb → zu goes INSIDE: auf·zu·stehen" },
  { key: "hoffen", label: "hoffen — to hope (separable inf.)", sentence: "Wir hoffen, euch bald wiederzusehen.", chip: "wiederzusehen", note: "separable: wieder·zu·sehen" },
  { key: "vergessen", label: "vergessen — to forget", sentence: "Vergiss nicht, das Formular zu unterschreiben.", chip: "zu unterschreiben", note: "\"Vergiss nicht, … zu …!\" — a common reminder" },
  { key: "anfangen", label: "anfangen — to start", sentence: "Sie hat angefangen, Gitarre zu lernen.", chip: "zu lernen", note: "anfangen / beginnen → zu + infinitive" },
  { key: "lust", label: "Lust haben — to fancy", sentence: "Hast du Lust, heute Abend ins Kino zu gehen?", chip: "zu gehen", note: "\"Hast du Lust, … zu …?\" — an invitation" },
  { key: "um-zu", label: "um … zu — (in order) to", sentence: "Ich lerne Deutsch, um in Deutschland zu studieren.", chip: "um in Deutschland zu studieren", note: "purpose — only if the subject is the same; else use damit (Unit 4)" },
  { key: "ohne-zu", label: "ohne … zu — without doing", sentence: "Er ist gegangen, ohne sich zu verabschieden.", chip: "ohne sich zu verabschieden", note: "same subject in both parts" },
];

const PLAN_OPTIONS = [
  { key: "umziehen", label: "Planning to move next month", response: "Ich habe vor, nächsten Monat umzuziehen." },
  { key: "pruefung", label: "Hoping to pass the exam", response: "Ich hoffe, die Prüfung zu bestehen." },
  { key: "zucker", label: "Trying to eat less sugar", response: "Ich versuche, weniger Zucker zu essen." },
  { key: "arbeiten", label: "Learning German to work here", response: "Ich lerne Deutsch, um hier arbeiten zu können." },
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

function chipInto(sentence, phrase) {
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const rx = new RegExp("(?<![\\p{L}\\p{N}_])" + escaped + "(?![\\p{L}\\p{N}_])", "u");
  const chip = `<span class="word-breakdown-part" data-type="stem" style="display:inline-block">${phrase}</span>`;
  return sentence.replace(rx, chip);
}

function initZuPicker() {
  initPicker({
    buttonsId: "zu-picker-buttons",
    resultId: "zu-picker-result",
    options: TRIGGERS,
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

function initPlanPicker() {
  initPicker({
    buttonsId: "plan-picker-buttons",
    resultId: "plan-picker-result",
    options: PLAN_OPTIONS,
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

  initZuPicker();
  initPlanPicker();

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("Ich versuche etwas. Ich stehe früh auf.", "I'm trying something. I get up early."));
  discoverList.appendChild(sentenceCard("Ich versuche, früh aufzustehen.", "I'm trying to get up early."));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Es ist nicht leicht, in einer neuen Stadt Freunde zu finden.", "It's not easy to make friends in a new city."));
  applyList.appendChild(sentenceCard("Statt zu jammern, könntest du versuchen, eine Lösung zu finden.", "Instead of complaining, you could try to find a solution."));
  applyList.appendChild(sentenceCard("Ich habe die Absicht, nächstes Jahr die B1-Prüfung zu machen.", "I intend to take the B1 exam next year."));

  try {
    const vocab = await loadJSON("../data/vocabulary/a2-zu-infinitive.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(ZU_IDS.map(byId).filter(Boolean), document.getElementById("grid-zu"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-zu").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/a2-zu-infinitive-quiz.json");

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
