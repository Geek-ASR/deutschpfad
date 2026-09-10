/**
 * Page script for lessons/a2-feelings-relationships.html — A2 Unit 26
 * (Phase 2 topic unit, 28 words). The picker shows each feeling /
 * relationship word in a sentence with the reflexive pronoun or the
 * fixed preposition chipped (Unicode-aware). No new CSS.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "a2-unit-26-feelings-relationships";

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

const FR_IDS = [
  "fr-stimmung", "fr-gefuehl", "fr-gutgelaunt", "fr-aufgeregt", "fr-nervoes",
  "fr-enttaeuscht", "fr-stolz", "fr-eifersuechtig", "fr-genervt", "fr-erleichtert",
  "fr-ueberrascht", "fr-neugierig", "fr-gestresst", "fr-zufrieden", "fr-beziehung",
  "fr-partner", "fr-freundschaft", "fr-verlobte", "fr-sich-verlieben", "fr-verliebt",
  "fr-sich-verabreden", "fr-sich-streiten", "fr-sich-vertragen", "fr-sich-trennen",
  "fr-flirten", "fr-kennenlernen", "fr-sich-verstehen", "fr-vertrauen",
];

// chip = the reflexive pronoun / fixed preposition phrase to highlight.
const FR_WORDS = [
  { key: "verlieben", label: "sich verlieben in — to fall in love with", sentence: "Er hat sich Hals über Kopf in sie verliebt.", chip: "in sie", note: "reflexive + sich verlieben IN + Akkusativ (Units 5 & 20)" },
  { key: "streiten", label: "sich streiten mit — to argue with", sentence: "Ich streite mich ständig mit meinem Bruder.", chip: "mit meinem Bruder", note: "reflexive + sich streiten MIT + Dativ (or ÜBER + Akk for the topic)" },
  { key: "trennen", label: "sich trennen von — to split up with", sentence: "Sie hat sich letzten Monat von ihrem Freund getrennt.", chip: "von ihrem Freund", note: "reflexive + sich trennen VON + Dativ; die Trennung = the break-up" },
  { key: "vertragen", label: "sich vertragen — to make up / get along", sentence: "Zum Glück vertragen wir uns wieder.", chip: "uns", note: "reflexive, NO preposition; the opposite of sich streiten" },
  { key: "verstehen", label: "sich verstehen mit — to get on with", sentence: "Mit meinen neuen Kollegen verstehe ich mich richtig gut.", chip: "Mit meinen neuen Kollegen", note: "reflexive + MIT + Dativ; different from plain \"verstehen\" (= to understand)" },
  { key: "stolz", label: "stolz auf — proud of", sentence: "Meine Eltern sind sehr stolz auf mich.", chip: "auf mich", note: "adjective + fixed preposition: stolz AUF + Akkusativ" },
  { key: "zufrieden", label: "zufrieden mit — content with", sentence: "Ich bin sehr zufrieden mit meiner neuen Wohnung.", chip: "mit meiner neuen Wohnung", note: "adjective + preposition: zufrieden MIT + Dativ (less strong than glücklich)" },
  { key: "vertrauen", label: "vertrauen — to trust", sentence: "Ich vertraue meiner besten Freundin blind.", chip: "meiner besten Freundin", note: "the person is simply in the Dativ — no preposition" },
];

const MOOD_OPTIONS = [
  { key: "gestresst", label: "A bit stressed at the moment", response: "Ich bin im Moment ziemlich gestresst, ich habe viel zu tun." },
  { key: "mitbewohner", label: "Getting on well with my flatmates", response: "Mit meinen Mitbewohnern verstehe ich mich richtig gut." },
  { key: "fern", label: "My best friend lives far away now", response: "Meine beste Freundin wohnt jetzt weit weg, aber wir schreiben uns fast täglich." },
  { key: "verliebt", label: "I think I've fallen in love", response: "Ich glaube, ich habe mich verliebt." },
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
  const chip = `<span class="word-breakdown-part" data-type="stem" style="display:inline-block">${word}</span>`;
  return sentence.replace(rx, chip);
}

function initEmoPicker() {
  initPicker({
    buttonsId: "emo-picker-buttons",
    resultId: "emo-picker-result",
    options: FR_WORDS,
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

function initMoodPicker() {
  initPicker({
    buttonsId: "mood-picker-buttons",
    resultId: "mood-picker-result",
    options: MOOD_OPTIONS,
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

  initEmoPicker();
  initMoodPicker();

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("Ich habe mich in ihn verliebt.", "I've fallen in love with him. (verb)"));
  discoverList.appendChild(sentenceCard("Ich bin total in ihn verliebt.", "I'm totally in love with him. (adjective)"));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Am Anfang haben wir uns oft gestritten, aber jetzt verstehen wir uns super.", "At first we argued a lot, but now we get on great."));
  applyList.appendChild(sentenceCard("Vor dem Referat war ich so aufgeregt, danach total erleichtert.", "Before the presentation I was so nervous, afterwards totally relieved."));
  applyList.appendChild(sentenceCard("Ich bin stolz auf meine Fortschritte und zufrieden mit dem Kurs.", "I'm proud of my progress and happy with the course."));

  try {
    const vocab = await loadJSON("../data/vocabulary/a2-feelings-relationships.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(FR_IDS.map(byId).filter(Boolean), document.getElementById("grid-feelings"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-feelings").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/a2-feelings-relationships-quiz.json");

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
