/**
 * Page script for lessons/b2-migration.html — B2 Unit 16. The
 * "pathway" picker walks five stages/aspects of a migration story;
 * the "term" picker gives example sentences for the contested
 * cultural-debate vocabulary.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "b2-unit-16-migration";

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

const MIG_IDS = [
  "mig-migration", "mig-einwanderung", "mig-auswanderung", "mig-migrationshintergrund",
  "mig-herkunft", "mig-flucht", "mig-fluechtling", "mig-fluchtursache",
  "mig-asyl", "mig-asylantrag", "mig-asylrecht", "mig-abschiebung",
  "mig-staatsangehoerigkeit", "mig-einbuergerung", "mig-doppelte-staatsbuergerschaft",
  "mig-multikulturell", "mig-diskriminierung", "mig-rassismus", "mig-vorurteil",
  "mig-willkommenskultur", "mig-parallelgesellschaft", "mig-leitkultur",
  "mig-integrationskurs", "mig-spracherwerb", "mig-generation", "mig-eingliederung",
  "mig-zuwanderer", "mig-diaspora",
];

const PATHWAY = [
  { key: "flucht", label: "1. die Flucht / der Asylantrag", line: "Sie bat in Deutschland um Asyl.", note: "for those fleeing danger — a distinct, urgent category within Migration." },
  { key: "integrationskurs", label: "2. der Integrationskurs", line: "Der Integrationskurs umfasst Sprachunterricht und einen Orientierungskurs.", note: "language and orientation, the official first step toward settling in." },
  { key: "eingliederung", label: "3. die Eingliederung", line: "Die Eingliederung in den Arbeitsmarkt gelingt oft über eine Ausbildung.", note: "finding a place in working life — a formal near-synonym of Integration." },
  { key: "einbuergerung", label: "4. die Einbürgerung", line: "Nach acht Jahren konnte sie die deutsche Staatsangehörigkeit beantragen.", note: "the legal endpoint many aim for — becoming a citizen." },
  { key: "generation", label: "5. die zweite Generation", line: "Viele der zweiten Generation fühlen sich beiden Kulturen zugehörig.", note: "the story continues into the next generation, born in the new country." },
];

const TERMS = [
  { key: "willkommenskultur", label: "Willkommenskultur", response: "Viele Freiwillige prägten damals die deutsche Willkommenskultur." },
  { key: "leitkultur", label: "Leitkultur", response: "Über den Begriff \"Leitkultur\" wird seit Jahren gestritten." },
  { key: "parallelgesellschaft", label: "Parallelgesellschaft", response: "Der Begriff \"Parallelgesellschaft\" wird in der Debatte oft kontrovers verwendet." },
  { key: "diskriminierung", label: "Diskriminierung", response: "Diskriminierung auf dem Wohnungsmarkt bleibt ein reales Problem." },
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

function initPathwayPicker() {
  initPicker({
    buttonsId: "pathway-picker-buttons",
    resultId: "pathway-picker-result",
    options: PATHWAY,
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

function initTermPicker() {
  initPicker({
    buttonsId: "term-picker-buttons",
    resultId: "term-picker-result",
    options: TERMS,
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

  initPathwayPicker();
  initTermPicker();

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("Migration hat die Gesellschaft in den letzten Jahrzehnten stark geprägt.", "Migration has strongly shaped society over recent decades."));
  discoverList.appendChild(sentenceCard("Der Spracherwerb gilt als Schlüssel zur Integration.", "Language acquisition is seen as the key to integration."));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Das Asylrecht ist im deutschen Grundgesetz verankert.", "The right to asylum is enshrined in the German Basic Law."));
  applyList.appendChild(sentenceCard("Seit der Reform ist die doppelte Staatsbürgerschaft leichter möglich.", "Since the reform, dual citizenship has become easier to obtain."));
  applyList.appendChild(sentenceCard("Die türkische Diaspora in Deutschland ist eine der größten weltweit.", "The Turkish diaspora in Germany is one of the largest in the world."));

  try {
    const vocab = await loadJSON("../data/vocabulary/b2-migration.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(MIG_IDS.map(byId).filter(Boolean), document.getElementById("grid-mig"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-mig").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/b2-migration-quiz.json");

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
