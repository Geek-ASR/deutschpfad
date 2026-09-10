/**
 * Page script for lessons/a2-reflexive-verbs.html — A2 Unit 5, same
 * shape as the other A2/A1 grammar-unit glue. The picker shows each
 * reflexive verb in a sentence with the reflexive pronoun chipped
 * (shared .word-breakdown-part) and a note on the case. No new CSS.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "a2-unit-5-reflexive-verbs";

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

const REFL_IDS = [
  "refl-sich",
  "refl-sich-freuen",
  "refl-sich-fuehlen",
  "refl-sich-beeilen",
  "refl-sich-erinnern",
  "refl-sich-treffen",
  "refl-sich-unterhalten",
  "refl-sich-setzen",
  "refl-sich-ausruhen",
  "refl-sich-waschen",
  "refl-sich-die-zaehne-putzen",
  "refl-sich-vorstellen",
  "refl-sich-fertig-machen",
];

// `pronoun` is the reflexive pronoun to highlight in `sentence`.
const REFL_VERBS = [
  { key: "freuen", label: "sich freuen", verb: "sich freuen", meaning: "to look forward to", sentence: "Ich freue mich auf das Wochenende.", pronoun: "mich", note: "accusative — truly reflexive", sentenceEn: "I'm looking forward to the weekend." },
  { key: "fuehlen", label: "sich fühlen", verb: "sich fühlen", meaning: "to feel (a way)", sentence: "Wie fühlst du dich heute?", pronoun: "dich", note: "accusative", sentenceEn: "How do you feel today?" },
  { key: "beeilen", label: "sich beeilen", verb: "sich beeilen", meaning: "to hurry", sentence: "Wir müssen uns beeilen.", pronoun: "uns", note: "accusative — truly reflexive", sentenceEn: "We have to hurry." },
  { key: "erinnern", label: "sich erinnern", verb: "sich erinnern", meaning: "to remember", sentence: "Erinnerst du dich an unseren ersten Tag?", pronoun: "dich", note: "accusative — truly reflexive", sentenceEn: "Do you remember our first day?" },
  { key: "treffen", label: "sich treffen", verb: "sich treffen", meaning: "to meet each other", sentence: "Wir treffen uns um acht Uhr.", pronoun: "uns", note: "accusative — reciprocal", sentenceEn: "We're meeting at eight o'clock." },
  { key: "setzen", label: "sich setzen", verb: "sich setzen", meaning: "to sit down", sentence: "Setzen Sie sich, bitte.", pronoun: "sich", note: "accusative — formal Sie uses sich", sentenceEn: "Please sit down." },
  { key: "waschen-akk", label: "sich waschen", verb: "sich waschen", meaning: "to wash oneself", sentence: "Ich wasche mich.", pronoun: "mich", note: "accusative — no other object", sentenceEn: "I wash (myself)." },
  { key: "waschen-dat", label: "…die Hände waschen", verb: "sich die Hände waschen", meaning: "to wash one's hands", sentence: "Ich wasche mir die Hände.", pronoun: "mir", note: "DATIVE — there's a direct object (die Hände)", sentenceEn: "I wash my hands." },
  { key: "zaehne", label: "…die Zähne putzen", verb: "sich die Zähne putzen", meaning: "to brush one's teeth", sentence: "Er putzt sich die Zähne.", pronoun: "sich", note: "DATIVE — direct object (die Zähne); 3rd person is sich", sentenceEn: "He brushes his teeth." },
];

const FEEL_OPTIONS = [
  { key: "gut", label: "Good", response: "Ich fühle mich gut." },
  { key: "muede", label: "Tired", response: "Ich fühle mich müde." },
  { key: "nichtgut", label: "Not so good", response: "Ich fühle mich nicht so gut." },
  { key: "freue", label: "Looking forward to tonight", response: "Ich freue mich auf heute Abend." },
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
  row.innerHTML = `${label}: <strong style="color: var(--color-ink)">${word}</strong>`;
  return row;
}

function highlightedSentence(sentence, word) {
  const chip = `<span class="word-breakdown-part" data-type="stem" style="display:inline-block">${word}</span>`;
  const p = document.createElement("p");
  p.lang = "de";
  p.style.fontSize = "var(--text-md)";
  p.style.width = "100%";
  p.style.lineHeight = "2.2";
  p.innerHTML = sentence.replace(new RegExp("\\b" + word + "\\b"), chip);
  return p;
}

function initReflPicker() {
  initPicker({
    buttonsId: "refl-picker-buttons",
    resultId: "refl-picker-result",
    options: REFL_VERBS,
    renderResult: (option, el) => {
      el.innerHTML = "";

      const heading = document.createElement("span");
      heading.className = "picker-result-word";
      heading.lang = "de";
      heading.textContent = `${option.verb} — "${option.meaning}"`;
      el.appendChild(heading);

      el.appendChild(metaRow("Reflexive pronoun", `${option.pronoun} (${option.note})`));
      el.appendChild(highlightedSentence(option.sentence, option.pronoun));

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

function initFeelPicker() {
  initPicker({
    buttonsId: "feel-picker-buttons",
    resultId: "feel-picker-result",
    options: FEEL_OPTIONS,
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

  initReflPicker();
  initFeelPicker();

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("Ich freue mich auf das Wochenende.", "I'm looking forward to the weekend."));
  discoverList.appendChild(sentenceCard("Setz dich, wir müssen uns unterhalten.", "Sit down, we need to talk."));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Morgens dusche ich mich und ziehe mich an.", "In the morning I shower and get dressed."));
  applyList.appendChild(sentenceCard("Ich erinnere mich nicht an seinen Namen.", "I don't remember his name."));
  applyList.appendChild(sentenceCard("Beeil dich, der Zug fährt gleich!", "Hurry up, the train's leaving soon!"));

  try {
    const vocab = await loadJSON("../data/vocabulary/a2-reflexive-verbs.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(REFL_IDS.map(byId).filter(Boolean), document.getElementById("grid-reflexive"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-reflexive").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/a2-reflexive-verbs-quiz.json");

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
