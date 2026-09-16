/**
 * Page script for lessons/c1-konzessive-ausdruecke.html — C1 Unit 6.
 * The "type" picker walks five concessive patterns; the "rewrite"
 * picker turns a plain contrast into an advanced concessive
 * construction. No new CSS.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "c1-unit-6-konzessive-ausdruecke";

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

const KZ_IDS = [
  "kz-intro", "kz-obschon", "kz-wenngleich", "kz-auch-wenn", "kz-wenn-auch",
  "kz-selbst-wenn", "kz-so-auch", "kz-wie-auch-immer", "kz-ob-oder",
  "kz-unabhaengig-davon", "kz-abgesehen-davon", "kz-zugegebenermassen",
  "kz-trotz-alledem", "kz-immerhin", "kz-widerstand", "kz-hindernis",
  "kz-rueckschlag", "kz-ueberwinden", "kz-trotzig", "kz-einschraenkung",
  "kz-unbeirrt", "kz-beharren", "kz-standhalten", "kz-letztlich",
  "kz-hartnaeckig", "kz-durchhaltevermoegen", "kz-beharrlichkeit",
  "kz-vergeblich",
];

const USES = [
  { key: "auch-wenn", label: "auch wenn (hypothetical concession)", line: "Auch wenn die Erfolgsaussichten gering sind, versuchen wir es.", note: "Unlike obwohl, doesn't require the condition to be an established fact." },
  { key: "so-auch", label: "so + Adjektiv + auch", line: "So schwierig die Aufgabe auch ist, wir schaffen sie.", note: "Grants a high degree of the adjective without it changing the conclusion." },
  { key: "wie-auch-immer", label: "wie auch immer + Verb", line: "Wie auch immer die Entscheidung ausfällt, wir akzeptieren sie.", note: "Grants every possible outcome in advance — built on Unit 5's embedded-question word order." },
  { key: "unabhaengig", label: "unabhängig davon, ob/wie …", line: "Unabhängig davon, wie die Wahl ausgeht, bleibt die Herausforderung bestehen.", note: "Combines this unit's construction with an embedded question from Unit 5." },
  { key: "zugegebenermassen", label: "zugegebenermaßen (concede, then pivot)", line: "Zugegebenermaßen war der erste Entwurf schwach.", note: "Concedes a point up front — pairs naturally with Unit 5's zugeben and einräumen." },
];

const REDUCE = [
  { key: "aufgabe", label: "Die Aufgabe ist schwierig. Trotzdem schaffen wir sie.", response: "So schwierig die Aufgabe auch ist, wir schaffen sie." },
  { key: "entscheidung", label: "Die Entscheidung könnte so oder so ausfallen. Wir akzeptieren sie in jedem Fall.", response: "Wie auch immer die Entscheidung ausfällt, wir akzeptieren sie." },
  { key: "wahl", label: "Egal wie die Wahl ausgeht, die Herausforderung bleibt bestehen.", response: "Unabhängig davon, wie die Wahl ausgeht, bleibt die Herausforderung bestehen." },
  { key: "mitmachen", label: "Er will vielleicht nicht, aber er muss trotzdem mitmachen.", response: "Ob er will oder nicht, er muss mitmachen." },
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
  discoverList.appendChild(sentenceCard("Obwohl die Kritik berechtigt war, änderte sich wenig.", "Although the criticism was justified, little changed."));
  discoverList.appendChild(sentenceCard("Wenngleich die Kritik berechtigt war, änderte sich wenig.", "Although the criticism was justified, little changed."));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Selbst wenn wir uns beeilen, schaffen wir es nicht mehr rechtzeitig.", "Even if we hurry, we won't make it in time."));
  applyList.appendChild(sentenceCard("Abgesehen davon, dass die Kosten hoch sind, überzeugt das Konzept.", "Apart from the fact that the costs are high, the concept is convincing."));
  applyList.appendChild(sentenceCard("Trotz alledem hielt die Mannschaft zusammen.", "Despite everything, the team stuck together."));

  try {
    const vocab = await loadJSON("../data/vocabulary/c1-konzessive-ausdruecke.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(KZ_IDS.map(byId).filter(Boolean), document.getElementById("grid-kz"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-kz").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/c1-konzessive-ausdruecke-quiz.json");

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
