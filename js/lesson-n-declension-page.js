/**
 * Page script for lessons/a2-n-declension.html — A2 Unit 19, same
 * shape as the other A2 grammar-unit glue. The picker shows an n-noun
 * in a sentence in a specific role, with the noun form chipped and
 * the reason named. No new CSS.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "a2-unit-19-n-declension";

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

const ND_IDS = [
  "nd-kollege",
  "nd-kunde",
  "nd-junge",
  "nd-praktikant",
  "nd-polizist",
  "nd-journalist",
  "nd-tourist",
  "nd-herr",
  "nd-name",
  "nd-kandidat",
  "nd-experte",
  "nd-bauer",
  "nd-nachbar",
];

// chip = the exact noun form to highlight in `sentence`.
const NN_PHRASES = [
  { key: "kollege-nom", label: "der Kollege — subject (Nom. sg.)", sentence: "Der Kollege sitzt direkt neben mir.", chip: "Kollege", why: "nominative singular — the only bare form" },
  { key: "kollege-akk", label: "der Kollege — direct object (Akk.)", sentence: "Ich kenne den Kollegen schon lange.", chip: "Kollegen", why: "accusative → -n (any case but nom. sg.)" },
  { key: "kollege-dat", label: "der Kollege — dative", sentence: "Ich habe dem Kollegen bei dem Projekt geholfen.", chip: "Kollegen", why: "dative → -n" },
  { key: "student-akk", label: "der Student — direct object", sentence: "Wir haben den Studenten für das Praktikum genommen.", chip: "Studenten", why: "an -ent word → -en in every case but nom. sg." },
  { key: "nachbar-prep", label: "der Nachbar — after a preposition (bei)", sentence: "Ich war gestern bei meinem Nachbarn.", chip: "Nachbarn", why: "bei takes the Dativ → Nachbarn" },
  { key: "herr-akk", label: "der Herr — direct object (irregular)", sentence: "Kennen Sie den Herrn dort am Fenster?", chip: "Herrn", why: "der Herr is irregular: den/dem/des Herrn — but the plural is die Herren" },
  { key: "name-gen", label: "der Name — genitive (-ns)", sentence: "Die Aussprache des Namens ist schwierig.", chip: "Namens", why: "der Name is special: the genitive adds an extra -s" },
  { key: "kunden-pl", label: "die Kunden — plural", sentence: "Die Kunden warten schon seit zehn Minuten.", chip: "Kunden", why: "the plural is also -en, in every case" },
];

const PPL_OPTIONS = [
  { key: "telefon", label: "Phoned a colleague yesterday", response: "Ich habe gestern mit einem Kollegen telefoniert." },
  { key: "praktikant", label: "Do you know the new intern?", response: "Kennst du den neuen Praktikanten schon?" },
  { key: "nachbar", label: "Helping my neighbour in the garden", response: "Ich helfe meinem Nachbarn im Garten." },
  { key: "name", label: "What's the customer's name?", response: "Wie ist der Name des Kunden?" },
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

function initNnPicker() {
  initPicker({
    buttonsId: "nn-picker-buttons",
    resultId: "nn-picker-result",
    options: NN_PHRASES,
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
      meta.textContent = option.why;
      el.appendChild(meta);

      const speakBtn = createSpeakButton(option.sentence, "Listen");
      if (speakBtn) el.appendChild(speakBtn);
    },
  });
}

function initPplPicker() {
  initPicker({
    buttonsId: "ppl-picker-buttons",
    resultId: "ppl-picker-result",
    options: PPL_OPTIONS,
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

  initNnPicker();
  initPplPicker();

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("Das ist ein Student.", "That's a student. (subject — bare form)"));
  discoverList.appendChild(sentenceCard("Ich kenne den Studenten.", "I know the student. (object — Studenten)"));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Ich habe dem Praktikanten und dem neuen Kollegen alles gezeigt.", "I showed the intern and the new colleague everything."));
  applyList.appendChild(sentenceCard("Der Tourist hat den Polizisten nach dem Weg zum Museum gefragt.", "The tourist asked the police officer the way to the museum."));
  applyList.appendChild(sentenceCard("Wie war noch mal der Name des Herrn von gestern?", "What was the name of that gentleman from yesterday again?"));

  try {
    const vocab = await loadJSON("../data/vocabulary/a2-n-declension.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(ND_IDS.map(byId).filter(Boolean), document.getElementById("grid-ndecl"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-ndecl").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/a2-n-declension-quiz.json");

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
