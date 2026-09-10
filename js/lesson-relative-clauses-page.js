/**
 * Page script for lessons/a2-relative-clauses.html — A2 Unit 17, same
 * shape as the other A2 grammar-unit glue. The picker shows a joined
 * sentence with the relative pronoun chipped and the reason (gender
 * from the antecedent, case from the clause role). No new CSS.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "a2-unit-17-relative-clauses";

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

const REL_IDS = [
  "rc-dessen",
  "rc-deren",
  "rc-denen",
  "rc-was",
  "rc-wo",
  "rc-person",
  "rc-mensch",
  "rc-sache",
  "rc-ding",
  "rc-typ",
  "rc-nachbar",
  "rc-kollegin",
  "rc-gegend",
];

// chip = the relative pronoun (or prep + pronoun) to highlight.
const REL_PHRASES = [
  { key: "nom-m", label: "der Bruder — subject", sentence: "Das ist mein Bruder, der in Hamburg wohnt.", chip: "der", why: "points back to der Bruder (masc.) and is the subject of the clause → der (Nom.)" },
  { key: "akk-m", label: "der Mann — direct object", sentence: "Der Mann, den ich gestern getroffen habe, ist Arzt.", chip: "den", why: "masc. antecedent, but the direct object of \"treffen\" → den (Akk.)" },
  { key: "dat-f", label: "die Frau — dative verb (helfen)", sentence: "Die Frau, der ich geholfen habe, hat sich bedankt.", chip: "der", why: "fem. antecedent, and \"helfen\" takes the Dativ → der (Dat.)" },
  { key: "nom-n", label: "das Kind — subject", sentence: "Das Kind, das dort spielt, ist mein Neffe.", chip: "das", why: "neuter antecedent + subject → das" },
  { key: "nom-pl", label: "die Leute — subject (plural)", sentence: "Die Leute, die neben uns wohnen, sind sehr nett.", chip: "die", why: "plural antecedent + subject → die" },
  { key: "dat-pl", label: "die Kollegen — dative plural", sentence: "Die Kollegen, denen ich das erklärt habe, haben es verstanden.", chip: "denen", why: "plural + Dativ → denen — the one form that isn't \"den\"" },
  { key: "prep-f", label: "die Firma — after a preposition (bei)", sentence: "Die Firma, bei der ich arbeite, ist ziemlich klein.", chip: "bei der", why: "the preposition comes first: bei + fem. Dativ → \"bei der\"" },
  { key: "was", label: "etwas — was", sentence: "Das ist etwas, was ich nicht verstehe.", chip: "was", why: "after etwas / nichts / alles / das → was, not das" },
];

const WHO_OPTIONS = [
  { key: "kollegin", label: "The colleague who explained everything", response: "Das ist die Kollegin, die mir am Anfang alles erklärt hat." },
  { key: "buch", label: "The book I recommended to you", response: "Das ist das Buch, das ich dir empfohlen habe." },
  { key: "freund", label: "The friend I went on holiday with", response: "Das ist der Freund, mit dem ich in Urlaub war." },
  { key: "stadt", label: "The town where I was born", response: "Das ist die Stadt, in der ich geboren bin." },
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

function initRelPicker() {
  initPicker({
    buttonsId: "rel-picker-buttons",
    resultId: "rel-picker-result",
    options: REL_PHRASES,
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

function initWhoPicker() {
  initPicker({
    buttonsId: "who-picker-buttons",
    resultId: "who-picker-result",
    options: WHO_OPTIONS,
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

  initRelPicker();
  initWhoPicker();

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("Das ist mein Bruder. Er wohnt in Hamburg.", "That's my brother. He lives in Hamburg."));
  discoverList.appendChild(sentenceCard("Das ist mein Bruder, der in Hamburg wohnt.", "That's my brother, who lives in Hamburg."));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Der Kurs, den ich mache, ist online.", "The course I'm doing is online."));
  applyList.appendChild(sentenceCard("Die Wohnung, in der wir wohnen, ist zu klein geworden.", "The flat we live in has got too small."));
  applyList.appendChild(sentenceCard("Es gibt Menschen, denen man einfach vertraut.", "There are people you just trust."));

  try {
    const vocab = await loadJSON("../data/vocabulary/a2-relative-clauses.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(REL_IDS.map(byId).filter(Boolean), document.getElementById("grid-relative"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-relative").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/a2-relative-clauses-quiz.json");

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
