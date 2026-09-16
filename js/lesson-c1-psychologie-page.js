/**
 * Page script for lessons/c1-psychologie.html — C1 Unit 14 (topic
 * unit). The "type" picker walks five key terms; the "name it"
 * picker matches a scenario to the psychological process behind it.
 * No new CSS.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "c1-unit-14-psychologie";

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

const PSY_IDS = [
  "psy-intro", "psy-wahrnehmung", "psy-verhalten", "psy-verhaltensmuster",
  "psy-unterbewusstsein", "psy-praegung", "psy-trieb", "psy-motivation",
  "psy-impuls", "psy-antrieb", "psy-kognitive-verzerrung",
  "psy-kognitive-dissonanz", "psy-bestaetigungsfehler",
  "psy-herdenverhalten", "psy-gruppenzwang", "psy-suggestion",
  "psy-placebo-effekt", "psy-konditionierung", "psy-reiz", "psy-reflex",
  "psy-sozialisation", "psy-trauma", "psy-selbstwahrnehmung",
  "psy-persoenlichkeitsentwicklung", "psy-unbewusst", "psy-angeboren",
  "psy-erlernt", "psy-beeinflussbar",
];

const USES = [
  { key: "kognitive-verzerrung", label: "kognitive Verzerrung", line: "Eine kognitive Verzerrung lässt uns die Wirklichkeit systematisch falsch einschätzen.", note: "The umbrella term for effects like Bestätigungsfehler and Herdenverhalten." },
  { key: "bestaetigungsfehler", label: "Bestätigungsfehler", line: "Der Bestätigungsfehler lässt uns vor allem das wahrnehmen, was die eigene Meinung stützt.", note: "The tendency to notice mainly what supports what we already believe." },
  { key: "konditionierung", label: "Konditionierung", line: "Durch Konditionierung lernt der Körper, auf einen bestimmten Reiz automatisch zu reagieren.", note: "Learning to associate a stimulus with a response through repeated pairing." },
  { key: "kognitive-dissonanz", label: "kognitive Dissonanz", line: "Kognitive Dissonanz entsteht, wenn Überzeugung und Verhalten nicht zusammenpassen.", note: "The uncomfortable tension when a belief and a behaviour contradict each other." },
  { key: "placebo", label: "Placebo-Effekt", line: "Der Placebo-Effekt zeigt, wie stark Erwartungen den Körper beeinflussen können.", note: "A measurable improvement caused by expectation, not by an actual treatment mechanism." },
];

const REDUCE = [
  { key: "confirm", label: "You only notice news stories that confirm what you already think.", response: "Bestätigungsfehler" },
  { key: "herd", label: "You do something just because everyone around you is doing it.", response: "Herdenverhalten" },
  { key: "peer", label: "You go along with the group even though you privately disagree.", response: "Gruppenzwang" },
  { key: "reflex", label: "Your hand pulls away from something hot before you even think about it.", response: "Reflex" },
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
  discoverList.appendChild(sentenceCard("Ein spontaner Impuls führt nicht immer zur besten Entscheidung.", "A spontaneous impulse doesn't always lead to the best decision."));
  discoverList.appendChild(sentenceCard("Viele Entscheidungen werden im Unterbewusstsein getroffen, bevor wir sie bewusst wahrnehmen.", "Many decisions are made in the subconscious before we consciously register them."));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Die Prägung in der Kindheit beeinflusst das spätere Verhalten stark.", "Formative experiences in childhood strongly influence later behaviour."));
  applyList.appendChild(sentenceCard("Ein Trauma kann sich noch Jahre später auf das Verhalten auswirken.", "A trauma can still affect behaviour years later."));
  applyList.appendChild(sentenceCard("Manche Verhaltensweisen sind angeboren, andere werden erlernt.", "Some behaviours are innate, others are learned."));

  try {
    const vocab = await loadJSON("../data/vocabulary/c1-psychologie.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(PSY_IDS.map(byId).filter(Boolean), document.getElementById("grid-psy"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-psy").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/c1-psychologie-quiz.json");

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
