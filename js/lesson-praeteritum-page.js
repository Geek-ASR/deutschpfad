/**
 * Page script for lessons/a2-praeteritum.html — the first A2 unit, same
 * shape as the A1 grammar-unit glue scripts (lesson-perfekt-page.js in
 * particular). Composes the generic engines (lesson-loop, vocab-card,
 * quiz-engine, picker-widget, speak) plus this lesson's own picker
 * content: the Präteritum form + pattern per verb, and a "when you were
 * little" apply picker.
 *
 * Reuses the inline word-highlight technique from Modal Verbs / Perfekt
 * — a .word-breakdown-part chip on the one changed word in a sentence,
 * here the Präteritum verb — with no new CSS.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "a2-unit-1-praeteritum";

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

const PRAET_IDS = [
  "prat-sein",
  "prat-haben",
  "prat-werden",
  "prat-koennen",
  "prat-wollen",
  "prat-muessen",
  "prat-gehen",
  "prat-kommen",
  "prat-machen",
  "prat-sagen",
  "prat-geben",
  "prat-damals",
  "prat-als",
  "prat-wissen",
  "prat-denken",
  "prat-bringen",
  "prat-sehen",
  "prat-finden",
  "prat-nehmen",
  "prat-fahren",
  "prat-essen",
  "prat-trinken",
  "prat-schlafen",
  "prat-bleiben",
  "prat-heissen",
  "prat-arbeiten",
  "prat-wohnen",
];

const PRAET_VERBS = [
  { key: "sein", label: "sein", infinitive: "sein", meaning: "to be", form: "war", pattern: "irregular — used in speech", sentence: "Gestern war ich zu Hause.", sentenceEn: "Yesterday I was at home." },
  { key: "haben", label: "haben", infinitive: "haben", meaning: "to have", form: "hatte", pattern: "irregular — used in speech", sentence: "Ich hatte keine Zeit.", sentenceEn: "I had no time." },
  { key: "werden", label: "werden", infinitive: "werden", meaning: "to become / to get", form: "wurde", pattern: "irregular", sentence: "Es wurde dunkel.", sentenceEn: "It got dark." },
  { key: "koennen", label: "können", infinitive: "können", meaning: "can / to be able to", form: "konnte", pattern: "modal — used in speech", sentence: "Ich konnte nicht schlafen.", sentenceEn: "I couldn't sleep." },
  { key: "wollen", label: "wollen", infinitive: "wollen", meaning: "to want to", form: "wollte", pattern: "modal — used in speech", sentence: "Wir wollten nach Hause gehen.", sentenceEn: "We wanted to go home." },
  { key: "muessen", label: "müssen", infinitive: "müssen", meaning: "must / to have to", form: "musste", pattern: "modal — used in speech", sentence: "Ich musste früh aufstehen.", sentenceEn: "I had to get up early." },
  { key: "gehen", label: "gehen", infinitive: "gehen", meaning: "to go", form: "ging", pattern: "strong — vowel change, no -te", sentence: "Ich ging jeden Tag zur Arbeit.", sentenceEn: "I went to work every day." },
  { key: "kommen", label: "kommen", infinitive: "kommen", meaning: "to come", form: "kam", pattern: "strong — vowel change, no -te", sentence: "Der Bus kam zu spät.", sentenceEn: "The bus came too late." },
  { key: "machen", label: "machen", infinitive: "machen", meaning: "to do / to make", form: "machte", pattern: "weak — stem + -te", sentence: "Sie machte das Fenster auf.", sentenceEn: "She opened the window." },
  { key: "sagen", label: "sagen", infinitive: "sagen", meaning: "to say", form: "sagte", pattern: "weak — stem + -te", sentence: "Er sagte nichts.", sentenceEn: "He said nothing." },
  { key: "geben", label: "geben", infinitive: "geben", meaning: "to give (es gab = there was)", form: "gab", pattern: "strong — vowel change, no -te", sentence: "Es gab viel zu essen.", sentenceEn: "There was a lot to eat." },
];

const CHILDHOOD_OPTIONS = [
  { key: "hund", label: "Had a dog", response: "Als ich klein war, hatte ich einen Hund." },
  { key: "schwimmen", label: "Couldn't swim", response: "Als ich klein war, konnte ich nicht schwimmen." },
  { key: "lehrer", label: "Wanted to be a teacher", response: "Als ich klein war, wollte ich Lehrer werden." },
  { key: "berlin", label: "Lived in another city", response: "Damals wohnte ich in einer anderen Stadt." },
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

function highlightedSentence(sentence, verbWord) {
  const chip = `<span class="word-breakdown-part" data-type="stem" style="display:inline-block">${verbWord}</span>`;
  const p = document.createElement("p");
  p.lang = "de";
  p.style.fontSize = "var(--text-md)";
  p.style.width = "100%";
  p.style.lineHeight = "2.2";
  p.innerHTML = sentence.replace(verbWord, chip);
  return p;
}

function initPraetPicker() {
  initPicker({
    buttonsId: "praet-picker-buttons",
    resultId: "praet-picker-result",
    options: PRAET_VERBS,
    renderResult: (option, el) => {
      el.innerHTML = "";

      const heading = document.createElement("span");
      heading.className = "picker-result-word";
      heading.lang = "de";
      heading.textContent = `${option.infinitive} → ${option.form}`;
      el.appendChild(heading);

      el.appendChild(metaRow("Meaning", option.meaning));
      el.appendChild(metaRow("Pattern", option.pattern));
      el.appendChild(highlightedSentence(option.sentence, option.form));

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

function initChildhoodPicker() {
  initPicker({
    buttonsId: "childhood-picker-buttons",
    resultId: "childhood-picker-result",
    options: CHILDHOOD_OPTIONS,
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

  initPraetPicker();
  initChildhoodPicker();

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("Als ich klein war, hatte ich einen Hund.", "When I was little, I had a dog."));
  discoverList.appendChild(sentenceCard("Es war kalt und es gab viel Schnee.", "It was cold and there was a lot of snow."));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Ich konnte gestern nicht kommen.", "I couldn't come yesterday."));
  applyList.appendChild(sentenceCard("Damals wohnte ich in Berlin.", "Back then I lived in Berlin."));
  applyList.appendChild(sentenceCard("Der Film war lang, aber gut.", "The film was long, but good."));

  try {
    const vocab = await loadJSON("../data/vocabulary/a2-praeteritum.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(PRAET_IDS.map(byId).filter(Boolean), document.getElementById("grid-praeteritum"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-praeteritum").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/a2-praeteritum-quiz.json");

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
