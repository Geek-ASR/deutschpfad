/**
 * Page script for lessons/b2-zweiteilige-konnektoren.html — B2 Unit 3.
 * The "use" picker walks the seven two-part connector pairs; the
 * "weigh" picker gives a pros-and-cons example for a given topic.
 * No new CSS.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "b2-unit-3-zweiteilige-konnektoren";

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

const TPC_IDS = [
  "tpc-je-desto", "tpc-sowohl-als-auch", "tpc-weder-noch",
  "tpc-nicht-nur-sondern-auch", "tpc-entweder-oder", "tpc-zwar-aber",
  "tpc-einerseits-andererseits", "tpc-je-nachdem", "tpc-je", "tpc-desto",
  "tpc-sowohl", "tpc-weder", "tpc-entweder", "tpc-einerseits",
  "tpc-andererseits", "tpc-abwaegen", "tpc-die-abwaegung", "tpc-vorteil",
  "tpc-nachteil", "tpc-wortstellung-hinweis", "tpc-je-desto-beispiel",
  "tpc-sowohl-beispiel", "tpc-weder-beispiel", "tpc-nicht-nur-beispiel",
  "tpc-entweder-beispiel", "tpc-zwar-beispiel", "tpc-einerseits-beispiel",
  "tpc-oder",
];

const USES = [
  { key: "je-desto", label: "The more X, the more Y", line: "Je mehr man übt, desto sicherer wird man.", note: "je + verb-final; desto + comparative + verb-second (inverted, like after any adverb starting a clause)." },
  { key: "sowohl", label: "Both X and Y", line: "Sowohl die Kosten als auch der Zeitaufwand sprechen dagegen.", note: "sowohl connects two elements that are equally true — no negative meaning at all." },
  { key: "weder", label: "Neither X nor Y", line: "Das Projekt wurde weder rechtzeitig fertig noch im Budget abgeschlossen.", note: "weder … noch negates both elements — don't add nicht as well, that would be a double negative." },
  { key: "nicht-nur", label: "Not only X but also Y", line: "Die Reform betrifft nicht nur die Wirtschaft, sondern auch die Gesellschaft.", note: "emphasizes that the second element is surprising or additional, not just equal." },
  { key: "einerseits", label: "On one hand... on the other", line: "Einerseits spart man Zeit, andererseits verliert man den persönlichen Kontakt.", note: "the classic frame for weighing pros and cons in an essay or discussion." },
];

const WEIGH = [
  { key: "homeoffice", label: "Homeoffice", response: "Einerseits spart man Zeit beim Pendeln, andererseits fehlt oft der direkte Kontakt zu Kollegen." },
  { key: "umzug", label: "Ein Umzug ins Ausland", response: "Ein Umzug ins Ausland bringt sowohl neue Chancen als auch große Herausforderungen mit sich." },
  { key: "entscheidung", label: "Eine schwierige Entscheidung", response: "Die Idee ist zwar reizvoll, aber mit einem hohen Risiko verbunden." },
  { key: "qualifikation", label: "Fehlende Qualifikation", response: "Ohne die richtige Qualifikation findet man weder eine gute Stelle noch ein angemessenes Gehalt." },
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

function initUsePicker() {
  initPicker({
    buttonsId: "use-picker-buttons",
    resultId: "use-picker-result",
    options: USES,
    renderResult: (option, el) => {
      el.innerHTML = "";

      const heading = document.createElement("span");
      heading.className = "picker-result-word";
      heading.textContent = option.label;
      el.appendChild(heading);

      const line = document.createElement("p");
      line.lang = "de";
      line.style.width = "100%";
      line.style.margin = "0";
      line.style.fontSize = "var(--text-md)";
      line.style.lineHeight = "1.9";
      line.textContent = option.line;
      el.appendChild(line);

      const note = document.createElement("p");
      note.className = "picker-result-meta";
      note.style.width = "100%";
      note.style.marginTop = "var(--space-2)";
      note.textContent = option.note;
      el.appendChild(note);

      const speakBtn = createSpeakButton(option.line, "Listen");
      if (speakBtn) el.appendChild(speakBtn);
    },
  });
}

function initWeighPicker() {
  initPicker({
    buttonsId: "weigh-picker-buttons",
    resultId: "weigh-picker-result",
    options: WEIGH,
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

  initUsePicker();
  initWeighPicker();

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("Je mehr man übt, desto sicherer wird man.", "The more you practice, the more confident you become."));
  discoverList.appendChild(sentenceCard("Einerseits spart man Zeit, andererseits verliert man den persönlichen Kontakt.", "On the one hand you save time, on the other hand you lose personal contact."));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Die Reform betrifft nicht nur die Wirtschaft, sondern auch die Gesellschaft.", "The reform affects not only the economy but also society."));
  applyList.appendChild(sentenceCard("Bevor man sich entscheidet, sollte man die Vor- und Nachteile sorgfältig abwägen.", "Before deciding, one should carefully weigh the advantages and disadvantages."));
  applyList.appendChild(sentenceCard("Entweder wir handeln jetzt, oder das Problem wird noch größer.", "Either we act now, or the problem will get even bigger."));

  try {
    const vocab = await loadJSON("../data/vocabulary/b2-zweiteilige-konnektoren.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(TPC_IDS.map(byId).filter(Boolean), document.getElementById("grid-tpc"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-tpc").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/b2-zweiteilige-konnektoren-quiz.json");

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
