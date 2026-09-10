/**
 * Page script for lessons/b1-finalsaetze.html — B1 Unit 4.
 * The "purpose" picker shows each structure (um … zu, damit, ohne … zu,
 * statt … zu, plain zu-infinitive) with a worked example and the
 * same/different-subject rule; the "goal" picker states a personal aim
 * as a purpose clause. No new CSS.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "b1-unit-4-finalsaetze";

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

const FIN_IDS = [
  "fin-um-zu", "fin-damit", "fin-um-zu-trennbar", "fin-ohne-zu", "fin-ohne-dass",
  "fin-statt-zu", "fin-anstatt-dass", "fin-zu-infinitiv", "fin-zweck", "fin-ziel",
  "fin-absicht", "fin-vorhaben", "fin-dienen", "fin-dazu", "fin-zwecks",
  "fin-erreichen", "fin-schaffen", "fin-versuchen", "fin-vermeiden",
  "fin-sich-bemuehen", "fin-beabsichtigen", "fin-zoegern", "fin-anstrengung",
  "fin-voraussetzung", "fin-mit-dem-ziel", "fin-wozu",
];

const STRUCTURES = [
  { key: "umzu", label: "um … zu + Infinitiv", line: "Ich stehe früh auf, um in Ruhe zu frühstücken.", note: "Same subject in both halves (ich / ich). No subject after \"um\"; Infinitiv last. This is the default." },
  { key: "damit", label: "damit + Nebensatz", line: "Ich stehe früh auf, damit die Kinder pünktlich in der Schule sind.", note: "Different subjects (ich / die Kinder). Subordinating → verb (\"sind\") at the end." },
  { key: "trennbar", label: "zu with a separable verb", line: "Sie ist zu beschäftigt, um heute mitzukommen.", note: "\"mit-zu-kommen\" — the zu sits between prefix and stem, one word. Compare: \"um zu verstehen\" (not separable)." },
  { key: "ohnezu", label: "ohne … zu + Infinitiv", line: "Er unterschrieb den Vertrag, ohne ihn zu lesen.", note: "Something expected didn't happen. Same subject. Different subject → \"ohne dass\": \"…, ohne dass ich es merkte.\"" },
  { key: "stattzu", label: "(an)statt … zu + Infinitiv", line: "Statt mit dem Auto zu fahren, nehme ich das Rad.", note: "\"instead of doing\". \"statt\" = \"anstatt\". Different subject → \"anstatt dass\"." },
  { key: "zuinf", label: "plain zu + Infinitiv", line: "Ich habe vor, im Sommer einen Sprachkurs zu machen.", note: "After verbs like vorhaben, versuchen, vergessen, sich freuen, and \"es ist wichtig, … zu …\". Comma before the zu-phrase." },
];

const GOALS = [
  { key: "job", label: "Get a job here", response: "Ich verbessere mein Deutsch, um bald hier arbeiten zu können." },
  { key: "pruefung", label: "Pass the B1 exam", response: "Ich übe jeden Tag, damit ich die B1-Prüfung beim ersten Versuch bestehe." },
  { key: "kontakte", label: "Make local friends", response: "Ich gehe zum Sportverein, um Leute aus der Nachbarschaft kennenzulernen." },
  { key: "geld", label: "Save for a trip", response: "Ich koche öfter selbst, statt jeden Tag essen zu gehen — mit dem Ziel, im Sommer zu verreisen." },
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

function structureRenderer(option, el) {
  el.innerHTML = "";

  const heading = document.createElement("span");
  heading.className = "picker-result-word";
  heading.lang = "de";
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
}

function goalRenderer(option, el) {
  el.innerHTML = "";
  const word = document.createElement("span");
  word.className = "picker-result-word";
  word.lang = "de";
  word.style.fontSize = "var(--text-md)";
  word.textContent = option.response;
  el.appendChild(word);
  const speakBtn = createSpeakButton(option.response, "Listen");
  if (speakBtn) el.appendChild(speakBtn);
}

async function main() {
  markLessonVisited(LESSON_ID);

  const stepsContainer = document.getElementById("lesson-steps");
  initLessonLoop({ container: stepsContainer, stepLabels: STEP_LABELS });

  initPicker({
    buttonsId: "pur-picker-buttons",
    resultId: "pur-picker-result",
    options: STRUCTURES,
    renderResult: structureRenderer,
  });
  initPicker({
    buttonsId: "goal-picker-buttons",
    resultId: "goal-picker-result",
    options: GOALS,
    renderResult: goalRenderer,
  });

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("Ich mache eine Liste, um nichts zu vergessen.", "I make a list so as not to forget anything."));
  discoverList.appendChild(sentenceCard("Ich mache eine Liste, damit mein Mitbewohner auch weiß, was fehlt.", "I make a list so that my flatmate also knows what's missing."));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Um Zeit zu sparen, bereite ich das Essen am Vorabend vor.", "To save time, I prepare the meal the evening before."));
  applyList.appendChild(sentenceCard("Sie ist zur Beratung gegangen, ohne vorher einen Termin zu machen.", "She went to the advice session without making an appointment first."));
  applyList.appendChild(sentenceCard("Statt sich zu beschweren, hat er einen Vorschlag geschrieben.", "Instead of complaining, he wrote a proposal."));

  try {
    const vocab = await loadJSON("../data/vocabulary/b1-finalsaetze.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(FIN_IDS.map(byId).filter(Boolean), document.getElementById("grid-fin"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-fin").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/b1-finalsaetze-quiz.json");

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
