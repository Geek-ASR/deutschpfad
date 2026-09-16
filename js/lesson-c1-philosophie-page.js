/**
 * Page script for lessons/c1-philosophie.html — C1 Unit 11 (topic unit).
 * The "type" picker walks five key terms; the "branch" picker
 * matches a question to the branch of philosophy that asks it.
 * No new CSS.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "c1-unit-11-philosophie";

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

const PHI_IDS = [
  "phi-intro", "phi-metaphysik", "phi-erkenntnistheorie", "phi-ethik",
  "phi-ontologie", "phi-existenz", "phi-vernunft", "phi-rationalitaet",
  "phi-praemisse", "phi-schlussfolgerung", "phi-syllogismus", "phi-axiom",
  "phi-dialektik", "phi-paradoxon", "phi-gedankenexperiment",
  "phi-determinismus", "phi-freier-wille", "phi-utilitarismus",
  "phi-kategorischer-imperativ", "phi-skeptizismus", "phi-relativismus",
  "phi-wahrheit", "phi-subjektivitaet", "phi-objektivitaet", "phi-objektiv",
  "phi-subjektiv", "phi-widerspruchsfrei", "phi-annahme",
];

const USES = [
  { key: "praemisse", label: "Prämisse → Schlussfolgerung", line: "Ein Argument ist nur so stark wie seine Prämissen.", note: "A Prämisse supports a Schlussfolgerung — put two together correctly and you have a Syllogismus." },
  { key: "determinismus", label: "Determinismus vs. freier Wille", line: "Der Determinismus geht davon aus, dass jedes Ereignis durch vorherige Ursachen festgelegt ist.", note: "Their compatibility is one of philosophy's classic disputes." },
  { key: "utilitarismus", label: "Utilitarismus vs. kategorischer Imperativ", line: "Der Utilitarismus bewertet Handlungen nach ihrem Nutzen für die größte Zahl an Menschen.", note: "Two rival approaches to ethics: consequences vs. duty." },
  { key: "paradoxon", label: "Paradoxon", line: "Ein Paradoxon scheint sich selbst zu widersprechen und ist doch nicht einfach falsch.", note: "Seems self-contradictory, yet may still hold a deeper truth." },
  { key: "gedankenexperiment", label: "Gedankenexperiment", line: "Ein Gedankenexperiment prüft eine Theorie, ohne dass ein echtes Experiment nötig wäre.", note: "Tests an idea through a hypothetical scenario rather than a real experiment." },
];

const REDUCE = [
  { key: "metaphysik", label: "What is real, beyond what we can observe?", response: "Metaphysik" },
  { key: "erkenntnistheorie", label: "What can we know, and how do we know it?", response: "Erkenntnistheorie" },
  { key: "ethik", label: "What counts as right action?", response: "Ethik" },
  { key: "ontologie", label: "What does it mean for something to exist at all?", response: "Ontologie" },
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
  discoverList.appendChild(sentenceCard("Ob der Mensch einen freien Willen hat, wird seit Jahrhunderten diskutiert.", "Whether humans have free will has been discussed for centuries."));
  discoverList.appendChild(sentenceCard("Über den Begriff der Wahrheit streiten Philosophen seit der Antike.", "Philosophers have argued about the concept of truth since antiquity."));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Kants kategorischer Imperativ verlangt, nur nach Maximen zu handeln, die man als allgemeines Gesetz wollen könnte.", "Kant's categorical imperative demands acting only according to maxims one could will to become universal law."));
  applyList.appendChild(sentenceCard("Der Relativismus bestreitet, dass es eine einzige, universell gültige Wahrheit gibt.", "Relativism disputes that there is a single, universally valid truth."));
  applyList.appendChild(sentenceCard("Die gesamte Theorie beruht auf einer einzigen, unbewiesenen Annahme.", "The entire theory rests on a single, unproven assumption."));

  try {
    const vocab = await loadJSON("../data/vocabulary/c1-philosophie.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(PHI_IDS.map(byId).filter(Boolean), document.getElementById("grid-phi"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-phi").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/c1-philosophie-quiz.json");

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
