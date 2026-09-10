/**
 * Page script for lessons/a2-adjective-endings.html — A2 Unit 12,
 * same shape as the other A2 grammar-unit glue. The picker shows a
 * noun phrase in a sentence in a specific case; the adjective ending
 * (-e / -en) is chipped and the case/reason is named. No new CSS.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "a2-unit-12-adjective-endings";

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

const ADJ_IDS = [
  "ae-dieser",
  "ae-jeder",
  "ae-welcher",
  "ae-mancher",
  "ae-alle",
  "ae-wichtig",
  "ae-richtig",
  "ae-falsch",
  "ae-moeglich",
  "ae-noetig",
  "ae-eigen",
  "ae-verschieden",
  "ae-ganz",
];

// chip = the exact adjective+ending token to highlight in `sentence`.
const PHRASES = [
  { key: "nom-m", label: "der + adj + Mann — Nominativ, m", sentence: "Der alte Mann wartet an der Tür.", chip: "alte", ending: "-e", why: "nominative masculine singular → -e" },
  { key: "akk-m", label: "den + adj + Mann — Akkusativ, m", sentence: "Ich kenne den alten Mann von nebenan.", chip: "alten", ending: "-en", why: "masculine accusative → -en (the one singular slot that isn't -e)" },
  { key: "nom-f", label: "die + adj + Frau — Nominativ, f", sentence: "Die junge Frau liest ein Buch.", chip: "junge", ending: "-e", why: "nominative feminine singular → -e" },
  { key: "dat-f", label: "der + adj + Frau — Dativ, f", sentence: "Ich helfe der jungen Frau mit den Taschen.", chip: "jungen", ending: "-en", why: "every dative → -en" },
  { key: "nom-n", label: "das + adj + Kind — Nom/Akk, n", sentence: "Das kleine Kind schläft schon.", chip: "kleine", ending: "-e", why: "nominative and accusative neuter singular → -e" },
  { key: "dat-n", label: "dem + adj + Kind — Dativ, n", sentence: "Ich gebe dem kleinen Kind einen Apfel.", chip: "kleinen", ending: "-en", why: "every dative → -en" },
  { key: "nom-pl", label: "die + adj + Autos — plural", sentence: "Die neuen Autos sind ziemlich teuer.", chip: "neuen", ending: "-en", why: "the whole plural → -en, in every case" },
  { key: "dat-pl", label: "den + adj + Kindern — Dativ plural", sentence: "Sie spielt gern mit den kleinen Kindern.", chip: "kleinen", ending: "-en", why: "dative plural → -en (article is den, noun adds -n too)" },
];

const SHOP_OPTIONS = [
  { key: "pullover", label: "The red pullover (der)", response: "Ich nehme den roten Pullover." },
  { key: "tasche", label: "The blue bag (die)", response: "Ich möchte die blaue Tasche." },
  { key: "broetchen", label: "The small roll (das)", response: "Ich hätte gern das kleine Brötchen." },
  { key: "aepfel", label: "The green apples (plural)", response: "Ich nehme die grünen Äpfel." },
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

function initAdjPicker() {
  initPicker({
    buttonsId: "adj-picker-buttons",
    resultId: "adj-picker-result",
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
      meta.innerHTML = `ending <strong style="color: var(--color-ink)">${option.ending}</strong> — ${option.why}`;
      el.appendChild(meta);

      const speakBtn = createSpeakButton(option.sentence, "Listen");
      if (speakBtn) el.appendChild(speakBtn);
    },
  });
}

function initShopPicker() {
  initPicker({
    buttonsId: "shop-picker-buttons",
    resultId: "shop-picker-result",
    options: SHOP_OPTIONS,
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

  initAdjPicker();
  initShopPicker();

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("Der Mann ist alt.", "The man is old. (adjective after ist — no ending)"));
  discoverList.appendChild(sentenceCard("Der alte Mann wohnt neben uns.", "The old man lives next to us. (before the noun — ending -e)"));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Ich habe den ganzen Tag auf den wichtigen Anruf gewartet.", "I waited the whole day for the important call."));
  applyList.appendChild(sentenceCard("Mit dem neuen Kollegen und der neuen Kollegin verstehe ich mich gut.", "I get on well with the new (male) and new (female) colleague."));
  applyList.appendChild(sentenceCard("Welches blaue Hemd meinst du — das linke oder das rechte?", "Which blue shirt do you mean — the left one or the right one?"));

  try {
    const vocab = await loadJSON("../data/vocabulary/a2-adjective-endings.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(ADJ_IDS.map(byId).filter(Boolean), document.getElementById("grid-adjective"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-adjective").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/a2-adjective-endings-quiz.json");

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
