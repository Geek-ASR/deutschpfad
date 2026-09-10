/**
 * Page script for lessons/a2-subordinate-clauses.html — A2 Unit 4,
 * same shape as the other A2/A1 grammar-unit glue. The picker shows a
 * two-clause sentence per conjunction with the verb that moved (or
 * pointedly didn't) highlighted via the shared .word-breakdown-part
 * chip, plus a one-line note on where the verb lands. No new CSS.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "a2-unit-4-subordinate-clauses";

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

const SUB_IDS = [
  "sub-weil",
  "sub-dass",
  "sub-wenn",
  "sub-ob",
  "sub-obwohl",
  "sub-denn",
  "sub-deshalb",
  "sub-glauben",
  "sub-denken",
  "sub-wissen",
  "sub-hoffen",
  "sub-bleiben",
  "sub-verstehen",
];

// `verb` is the word to highlight in `sentence`. `note` says what
// happened to the word order.
const SUB_CONJUNCTIONS = [
  { key: "weil", label: "weil", conj: "weil", meaning: "because", sentence: "Ich bleibe zu Hause, weil es regnet.", verb: "regnet", note: "subordinating — verb goes to the end", sentenceEn: "I'm staying home because it's raining." },
  { key: "dass", label: "dass", conj: "dass", meaning: "that", sentence: "Ich glaube, dass er recht hat.", verb: "hat", note: "subordinating — verb goes to the end", sentenceEn: "I think that he's right." },
  { key: "wenn", label: "wenn", conj: "wenn", meaning: "when / if", sentence: "Wenn es regnet, bleibe ich zu Hause.", verb: "bleibe", note: "clause is first → main clause starts with its verb", sentenceEn: "When it rains, I stay home." },
  { key: "ob", label: "ob", conj: "ob", meaning: "whether", sentence: "Ich weiß nicht, ob er kommt.", verb: "kommt", note: "subordinating — verb goes to the end", sentenceEn: "I don't know whether he's coming." },
  { key: "obwohl", label: "obwohl", conj: "obwohl", meaning: "although", sentence: "Ich gehe spazieren, obwohl es regnet.", verb: "regnet", note: "subordinating — verb goes to the end", sentenceEn: "I'm going for a walk although it's raining." },
  { key: "denn", label: "denn", conj: "denn", meaning: "because (the trap)", sentence: "Ich bleibe zu Hause, denn es regnet.", verb: "regnet", note: "coordinating — word order does NOT change", sentenceEn: "I'm staying home because it's raining." },
  { key: "deshalb", label: "deshalb", conj: "deshalb", meaning: "therefore", sentence: "Es regnet, deshalb bleibe ich zu Hause.", verb: "bleibe", note: "adverb in position 1 → verb comes second", sentenceEn: "It's raining, so I'm staying home." },
];

const WHY_OPTIONS = [
  { key: "wohne", label: "I live in Germany", response: "Ich lerne Deutsch, weil ich in Deutschland wohne." },
  { key: "sprache", label: "I like the language", response: "Ich lerne Deutsch, weil ich die Sprache mag." },
  { key: "arbeite", label: "I work here", response: "Ich lerne Deutsch, weil ich hier arbeite." },
  { key: "kurs", label: "I'm taking a course", response: "Ich lerne Deutsch, weil ich einen Deutschkurs mache." },
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

function initSubPicker() {
  initPicker({
    buttonsId: "sub-picker-buttons",
    resultId: "sub-picker-result",
    options: SUB_CONJUNCTIONS,
    renderResult: (option, el) => {
      el.innerHTML = "";

      const heading = document.createElement("span");
      heading.className = "picker-result-word";
      heading.lang = "de";
      heading.textContent = `${option.conj} — "${option.meaning}"`;
      el.appendChild(heading);

      el.appendChild(metaRow("Word order", option.note));
      el.appendChild(highlightedSentence(option.sentence, option.verb));

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

function initWhyPicker() {
  initPicker({
    buttonsId: "why-picker-buttons",
    resultId: "why-picker-result",
    options: WHY_OPTIONS,
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

  initSubPicker();
  initWhyPicker();

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("Ich lerne Deutsch, weil ich in Berlin wohne.", "I'm learning German because I live in Berlin."));
  discoverList.appendChild(sentenceCard("Wenn ich Zeit habe, besuche ich meine Familie.", "When I have time, I visit my family."));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Ich glaube, dass das Wetter morgen besser wird.", "I think the weather will be better tomorrow."));
  applyList.appendChild(sentenceCard("Ich weiß nicht, ob der Supermarkt heute offen ist.", "I don't know whether the supermarket is open today."));
  applyList.appendChild(sentenceCard("Es ist kalt, deshalb ziehe ich eine Jacke an.", "It's cold, so I'm putting on a jacket."));

  try {
    const vocab = await loadJSON("../data/vocabulary/a2-subordinate-clauses.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(SUB_IDS.map(byId).filter(Boolean), document.getElementById("grid-subordinate"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-subordinate").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/a2-subordinate-clauses-quiz.json");

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
