/**
 * Page script for lessons/a2-dative-prepositions.html — A2 Unit 6,
 * same shape as the other A2/A1 grammar-unit glue. The picker shows
 * each dative-only preposition in a sentence with the Dativ phrase it
 * governs chipped (shared .word-breakdown-part) and a usage note plus
 * any fused form. No new CSS.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "a2-unit-6-dative-prepositions";

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

const DP_IDS = [
  "dp-mit",
  "dp-nach",
  "dp-zu",
  "dp-von",
  "dp-bei",
  "dp-seit",
  "dp-aus",
  "dp-gegenueber",
  "dp-nach-hause",
  "dp-zu-hause",
  "dp-zum",
  "dp-vom",
  "dp-beim",
];

// `highlight` is the Dativ phrase (or fused form) to chip in `sentence`.
const DP_PREPS = [
  { key: "mit", label: "mit", prep: "mit", meaning: "with / by (transport)", sentence: "Ich fahre mit dem Bus zur Arbeit.", highlight: "dem Bus", note: "accompaniment, and “by” for transport", fused: null, sentenceEn: "I go to work by bus." },
  { key: "nach", label: "nach", prep: "nach", meaning: "to (places) / after", sentence: "Wir fliegen nach Berlin.", highlight: "Berlin", note: "cities and most countries — no article", fused: null, sentenceEn: "We're flying to Berlin." },
  { key: "zu", label: "zu", prep: "zu", meaning: "to (people & specific places)", sentence: "Ich gehe heute zum Arzt.", highlight: "zum", note: "a person, or a place you head for; zu dem → zum, zu der → zur", fused: "zum / zur", sentenceEn: "I'm going to the doctor today." },
  { key: "von", label: "von", prep: "von", meaning: "from / of / by", sentence: "Das ist ein Geschenk von meiner Mutter.", highlight: "meiner Mutter", note: "from a person or a starting point; von dem → vom", fused: "vom", sentenceEn: "That's a present from my mother." },
  { key: "bei", label: "bei", prep: "bei", meaning: "at (someone's place) / near", sentence: "Ich wohne noch bei meinen Eltern.", highlight: "meinen Eltern", note: "at a person's home, at a workplace; bei dem → beim", fused: "beim", sentenceEn: "I still live with my parents." },
  { key: "seit", label: "seit", prep: "seit", meaning: "since / for (up to now)", sentence: "Ich lerne seit einem Jahr Deutsch.", highlight: "einem Jahr", note: "still going on — stays in the present tense", fused: null, sentenceEn: "I've been learning German for a year." },
  { key: "aus", label: "aus", prep: "aus", meaning: "out of / from (origin) / made of", sentence: "Sie kommt aus der Türkei.", highlight: "der Türkei", note: "where someone is from; what a thing is made of", fused: null, sentenceEn: "She comes from Turkey." },
  { key: "gegenueber", label: "gegenüber", prep: "gegenüber", meaning: "opposite / across from", sentence: "Die Bank ist gegenüber dem Supermarkt.", highlight: "dem Supermarkt", note: "facing something; often placed after its noun", fused: null, sentenceEn: "The bank is across from the supermarket." },
];

const ROUTE_OPTIONS = [
  { key: "bus", label: "By bus", response: "Ich fahre mit dem Bus." },
  { key: "bahn", label: "By train", response: "Ich fahre mit der Bahn." },
  { key: "rad", label: "By bike", response: "Ich fahre mit dem Fahrrad." },
  { key: "fuss", label: "On foot", response: "Ich gehe zu Fuß." },
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

function highlightedSentence(sentence, phrase) {
  const chip = `<span class="word-breakdown-part" data-type="stem" style="display:inline-block">${phrase}</span>`;
  const p = document.createElement("p");
  p.lang = "de";
  p.style.fontSize = "var(--text-md)";
  p.style.width = "100%";
  p.style.lineHeight = "2.2";
  p.innerHTML = sentence.replace(new RegExp("\\b" + phrase + "\\b"), chip);
  return p;
}

function initDpPicker() {
  initPicker({
    buttonsId: "dp-picker-buttons",
    resultId: "dp-picker-result",
    options: DP_PREPS,
    renderResult: (option, el) => {
      el.innerHTML = "";

      const heading = document.createElement("span");
      heading.className = "picker-result-word";
      heading.lang = "de";
      heading.textContent = `${option.prep} — "${option.meaning}"`;
      el.appendChild(heading);

      el.appendChild(metaRow("Case", "always Dativ"));
      el.appendChild(highlightedSentence(option.sentence, option.highlight));

      const useNote = document.createElement("p");
      useNote.className = "picker-result-meta";
      useNote.style.width = "100%";
      useNote.style.marginTop = "0";
      useNote.textContent = option.note;
      el.appendChild(useNote);

      if (option.fused) {
        el.appendChild(metaRow("Fused form", option.fused));
      }

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

function initRoutePicker() {
  initPicker({
    buttonsId: "route-picker-buttons",
    resultId: "route-picker-result",
    options: ROUTE_OPTIONS,
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

  initDpPicker();
  initRoutePicker();

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("Ich wohne bei meiner Tante.", "I live at my aunt's place. (no movement — still Dativ)"));
  discoverList.appendChild(sentenceCard("Ich fahre mit dem Zug zu meiner Tante.", "I take the train to my aunt's. (movement — still Dativ)"));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Ich komme aus Indien und wohne seit zwei Jahren in Deutschland.", "I'm from India and have been living in Germany for two years."));
  applyList.appendChild(sentenceCard("Nach der Arbeit fahre ich mit dem Rad nach Hause.", "After work I ride home on my bike."));
  applyList.appendChild(sentenceCard("Die Haltestelle ist gegenüber der Post.", "The bus stop is across from the post office."));

  try {
    const vocab = await loadJSON("../data/vocabulary/a2-dative-prepositions.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(DP_IDS.map(byId).filter(Boolean), document.getElementById("grid-dative"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-dative").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/a2-dative-prepositions-quiz.json");

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
