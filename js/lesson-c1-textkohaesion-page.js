/**
 * Page script for lessons/c1-textkohaesion.html — C1 Unit 4.
 * The "type" picker walks five cohesion devices; the "front it"
 * picker moves a Mittelfeld connector to position 1 for emphasis.
 * No new CSS.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "c1-unit-4-textkohaesion";

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

const TK_IDS = [
  "tk-intro", "tk-des-weiteren", "tk-ferner", "tk-ueberdies", "tk-zudem",
  "tk-nicht-zuletzt", "tk-mithin", "tk-demzufolge", "tk-infolgedessen",
  "tk-zumal", "tk-insofern", "tk-vor-diesem-hintergrund",
  "tk-in-diesem-zusammenhang", "tk-im-uebrigen", "tk-nichtsdestotrotz",
  "tk-wortstellung", "tk-fazit", "tk-stichhaltig", "tk-schluessig",
  "tk-einwand", "tk-ausschlaggebend", "tk-verdeutlichen",
  "tk-veranschaulichen", "tk-untermauern", "tk-eroertern",
  "tk-massgeblich", "tk-entscheidend", "tk-ueberzeugend",
];

const USES = [
  { key: "zudem", label: "zudem (adding a point)", line: "Der Vorschlag ist zudem kostengünstig.", note: "The most common and versatile way to add a further point — works in the Mittelfeld or fronted at position 1." },
  { key: "mithin", label: "mithin (drawing a conclusion)", line: "Die Beweise sind eindeutig; die Entscheidung ist mithin gerechtfertigt.", note: "A formal consequence-connector — draws a conclusion from what was just argued." },
  { key: "zumal", label: "zumal (emphasising a reason)", line: "Wir sollten früh losfahren, zumal am Freitag mit Stau zu rechnen ist.", note: "A subordinating conjunction, like weil or da — the verb goes to the end of its clause." },
  { key: "hintergrund", label: "vor diesem Hintergrund (tying back)", line: "Vor diesem Hintergrund erscheint die Entscheidung nachvollziehbar.", note: "Ties a new point back to context or facts established earlier in the text." },
  { key: "nichtsdestotrotz", label: "nichtsdestotrotz (nevertheless)", line: "Die Lage ist schwierig; nichtsdestotrotz bleibt die Regierung optimistisch.", note: "A near-synonym of B1's dennoch and trotzdem, with nichtsdestoweniger as its more literary variant." },
];

const REDUCE = [
  { key: "zudem", label: "Der Vorschlag ist zudem kostengünstig.", response: "Zudem ist der Vorschlag kostengünstig." },
  { key: "ferner", label: "Die Frist sollte ferner verlängert werden.", response: "Ferner sollte die Frist verlängert werden." },
  { key: "demzufolge", label: "Stellen mussten demzufolge abgebaut werden.", response: "Demzufolge mussten Stellen abgebaut werden." },
  { key: "ueberdies", label: "Wichtige Informationen fehlen überdies.", response: "Überdies fehlen wichtige Informationen." },
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
  discoverList.appendChild(sentenceCard("Der Vorschlag ist außerdem kostengünstig.", "The proposal is also cost-effective."));
  discoverList.appendChild(sentenceCard("Der Vorschlag ist zudem kostengünstig, und die Umsetzung erscheint vor diesem Hintergrund unproblematisch.", "The proposal is, moreover, cost-effective, and against this background, implementation seems unproblematic."));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Die Ernte fiel schlecht aus; infolgedessen stiegen die Preise.", "The harvest was poor; as a consequence, prices rose."));
  applyList.appendChild(sentenceCard("Im Hauptteil werden die Vor- und Nachteile erörtert, bevor im Fazit eine Empfehlung folgt.", "The pros and cons are examined in depth in the main section, before a recommendation follows in the conclusion."));
  applyList.appendChild(sentenceCard("Die Zahlen untermauern die These; das Argument ist mithin stichhaltig.", "The figures back up the thesis; the argument is thus valid."));

  try {
    const vocab = await loadJSON("../data/vocabulary/c1-textkohaesion.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(TK_IDS.map(byId).filter(Boolean), document.getElementById("grid-tk"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-tk").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/c1-textkohaesion-quiz.json");

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
