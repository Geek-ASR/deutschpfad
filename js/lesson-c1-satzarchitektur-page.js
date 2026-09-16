/**
 * Page script for lessons/c1-satzarchitektur.html — C1 Unit 8.
 * The "type" picker walks five sentence-architecture patterns; the
 * "layers" picker shows a core sentence grow one layer at a time.
 * No new CSS.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "c1-unit-8-satzarchitektur";

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

const SA_IDS = [
  "sa-intro", "sa-satzklammer", "sa-schachtelsatz", "sa-nebensatz-im-nebensatz",
  "sa-verbendstellung-mehrfach", "sa-nachfeld", "sa-vergleich-nachfeld",
  "sa-infinitiv-nachfeld", "sa-einschub-erweitert", "sa-apposition",
  "sa-lesestrategie-kernsatz", "sa-schreibstrategie-schichten",
  "sa-doppelpunkt-strukturieren", "sa-semikolon", "sa-gliederung",
  "sa-abschnitt", "sa-struktur", "sa-aufbau", "sa-verschachtelt",
  "sa-uebersichtlichkeit", "sa-unuebersichtlich", "sa-verstaendlich",
  "sa-verstaendlichkeit", "sa-textstelle", "sa-gliedern", "sa-straffen",
  "sa-komplex", "sa-absatz",
];

const USES = [
  { key: "schachtelsatz", label: "Schachtelsatz", line: "Er sagte, dass er glaube, dass die Lösung, die sie vorgeschlagen hatten, funktionieren werde.", note: "Three layers deep — a dass-clause inside a dass-clause, with a relative clause nested further in." },
  { key: "nachfeld", label: "Vergleich im Nachfeld", line: "Er ist schneller gelaufen, als wir erwartet hatten.", note: "The comparison trails after the final verb, instead of crowding the middle field." },
  { key: "einschub", label: "Einschub / Parenthese", line: "Das Projekt – so hieß es zumindest offiziell – sei termingerecht abgeschlossen worden.", note: "A parenthetical aside, marked by dashes, combined with Konjunktiv I for reported doubt." },
  { key: "apposition", label: "Apposition", line: "Angela Merkel, ehemalige Bundeskanzlerin, hielt die Eröffnungsrede.", note: "A compact alternative to a full relative clause." },
  { key: "kernsatz", label: "Kernsatz finden (Lesestrategie)", line: "Kernsatz: \"Die Erhöhung tritt in Kraft.\"", note: "Strip every attribute and embedded clause away first — then add the layers back one at a time." },
];

const REDUCE = [
  {
    key: "layer1",
    label: "Kernsatz",
    response: "Die Erhöhung tritt in Kraft.",
  },
  {
    key: "layer2",
    label: "+ Genitivattribut",
    response: "Die Erhöhung der Recyclingquote tritt in Kraft.",
  },
  {
    key: "layer3",
    label: "+ Präpositionalattribut",
    response: "Die Erhöhung der Recyclingquote im Rahmen der Reform tritt in Kraft.",
  },
  {
    key: "layer4",
    label: "+ erweitertes Attribut",
    response: "Die vom Ministerium im Rahmen der Reform beschlossene Erhöhung der Recyclingquote tritt im Januar in Kraft.",
  },
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

function initReducePicker() {
  initPicker({
    buttonsId: "reduce-picker-buttons",
    resultId: "reduce-picker-result",
    options: REDUCE,
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
  initReducePicker();

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("Die Erhöhung tritt in Kraft.", "The increase takes effect."));
  discoverList.appendChild(sentenceCard("Die vom Ministerium im Rahmen der Reform beschlossene Erhöhung der Recyclingquote der Kommunen tritt im Januar in Kraft.", "The increase in municipalities' recycling quota, decided by the ministry as part of the reform, takes effect in January."));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Sie erklärte, dass das Ergebnis, das die Forscher veröffentlicht hatten, große Aufmerksamkeit erregte.", "She explained that the result, which the researchers had published, attracted great attention."));
  applyList.appendChild(sentenceCard("Die Untersuchung kommt zu einem eindeutigen Ergebnis: Die Maßnahme zeigt keine Wirkung.", "The investigation reaches a clear conclusion: the measure has no effect."));
  applyList.appendChild(sentenceCard("Die Nachfrage sinkt; die Preise bleiben dennoch stabil.", "Demand is falling; prices nevertheless remain stable."));

  try {
    const vocab = await loadJSON("../data/vocabulary/c1-satzarchitektur.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(SA_IDS.map(byId).filter(Boolean), document.getElementById("grid-sa"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-sa").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/c1-satzarchitektur-quiz.json");

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
