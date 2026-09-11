/**
 * Page script for lessons/b2-wissenschaft.html — B2 Unit 12. The
 * "stage" picker walks five stages of the research process; the
 * "word pair" picker contrasts easily confused near-synonyms.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "b2-unit-12-wissenschaft";

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

const WIS_IDS = [
  "wis-forschung", "wis-studie", "wis-experiment", "wis-versuch",
  "wis-erkenntnis", "wis-beleg", "wis-wissenschaft", "wis-wissenschaftlich",
  "wis-stichprobe", "wis-auswertung", "wis-auswerten", "wis-reproduzierbar",
  "wis-forschungsfrage", "wis-fachgebiet", "wis-fortschritt", "wis-innovation",
  "wis-patent", "wis-promovieren", "wis-doktortitel", "wis-publikation",
  "wis-publizieren", "wis-peer-review", "wis-foerderung", "wis-labor",
  "wis-grundlagenforschung", "wis-angewandte-forschung",
  "wis-hypothese-vs-erkenntnis", "wis-widerlegen",
];

const STAGES = [
  { key: "frage", label: "1. Die Forschungsfrage", line: "Die Forschungsfrage lautet: Welche Faktoren beeinflussen den Lernerfolg?", note: "every study starts with a question it sets out to answer." },
  { key: "stichprobe", label: "2. Die Stichprobe", line: "Die Stichprobe war für allgemeine Aussagen zu klein.", note: "who or what actually gets studied — often smaller than the whole population." },
  { key: "auswertung", label: "3. Die Auswertung", line: "Die Auswertung der Daten dauerte mehrere Monate.", note: "analysing what the data actually shows." },
  { key: "review", label: "4. Das Peer-Review", line: "Die Studie musste ein strenges Peer-Review durchlaufen.", note: "other experts check the work before it's accepted." },
  { key: "publikation", label: "5. Die Publikation", line: "Seine erste Publikation erschien noch während des Studiums.", note: "the finished study, now public and citable." },
];

const WORD_PAIRS = [
  { key: "forschung-studie", label: "die Forschung vs. die Studie", response: "Sie arbeitet in der Forschung — ihre neueste Studie erscheint nächsten Monat." },
  { key: "experiment-versuch", label: "das Experiment vs. der Versuch", response: "Im zweiten Versuch klappte das Experiment endlich." },
  { key: "beleg-nachweis", label: "der Beleg vs. der Nachweis (B1)", response: "Die Fotos dienen als Beleg — für die Behörde braucht sie trotzdem einen offiziellen Nachweis." },
  { key: "grundlagen-angewandt", label: "Grundlagenforschung vs. angewandte Forschung", response: "Grundlagenforschung führt oft erst Jahrzehnte später zu angewandter Forschung." },
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

function initStagePicker() {
  initPicker({
    buttonsId: "stage-picker-buttons",
    resultId: "stage-picker-result",
    options: STAGES,
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

function initWordPairPicker() {
  initPicker({
    buttonsId: "wordpair-picker-buttons",
    resultId: "wordpair-picker-result",
    options: WORD_PAIRS,
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

  initStagePicker();
  initWordPairPicker();

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("Die Studie wurde in einer renommierten Fachzeitschrift veröffentlicht.", "The study was published in a renowned academic journal."));
  discoverList.appendChild(sentenceCard("Ohne reproduzierbare Ergebnisse ist eine Studie wenig wert.", "Without reproducible results, a study is worth little."));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Grundlagenforschung führt oft erst Jahrzehnte später zu Anwendungen.", "Basic research often leads to applications only decades later."));
  applyList.appendChild(sentenceCard("Ohne staatliche Förderung wäre das Projekt nicht möglich gewesen.", "Without state funding, the project wouldn't have been possible."));
  applyList.appendChild(sentenceCard("Neue Daten haben die alte Theorie widerlegt.", "New data has disproven the old theory."));

  try {
    const vocab = await loadJSON("../data/vocabulary/b2-wissenschaft.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(WIS_IDS.map(byId).filter(Boolean), document.getElementById("grid-wis"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-wis").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/b2-wissenschaft-quiz.json");

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
