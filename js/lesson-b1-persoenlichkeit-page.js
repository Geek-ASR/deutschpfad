/**
 * Page script for lessons/b1-persoenlichkeit.html — B1 Unit 22 (topic unit).
 * The "topic" picker walks five personality traits; the "habit" picker
 * answers "how do you handle conflict?" No new CSS.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "b1-unit-22-persoenlichkeit";

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

const PER_IDS = [
  "per-charakter", "per-charaktereigenschaft", "per-konflikt",
  "per-streit", "per-meinungsverschiedenheit", "per-kompromiss",
  "per-missverstaendnis", "per-vorwurf", "per-kritik",
  "per-selbstbewusstsein", "per-ehrgeizig", "per-geduldig", "per-stur",
  "per-egoistisch", "per-grosszuegig", "per-einfuehlsam",
  "per-selbstbewusst", "per-zurueckhaltend", "per-verlaesslich",
  "per-nachtragend", "per-sich-einigen", "per-nachgeben",
  "per-vermitteln", "per-vorwerfen", "per-verzeihen", "per-klaeren",
  "per-ansprechen", "per-kritisieren",
];

const TOPICS = [
  { key: "ehrgeizig", trait: "ehrgeizig", line: "Er ist sehr ehrgeizig und will in seinem Job immer der Beste sein.", note: "ehrgeizig can be positive or slightly critical, depending on tone — context matters." },
  { key: "stur", trait: "stur", line: "Meine Schwester ist ziemlich stur — sie ändert ihre Meinung fast nie.", note: "a clearly negative trait — someone who won't budge, even when they're wrong." },
  { key: "grosszuegig", trait: "großzügig", line: "Unser Nachbar ist sehr großzügig und hilft jedem, der ihn braucht.", note: "generous — with money, time, or forgiveness." },
  { key: "einfuehlsam", trait: "einfühlsam", line: "Sie ist sehr einfühlsam und merkt sofort, wenn es jemandem schlecht geht.", note: "empathetic — good at sensing and responding to others' feelings." },
  { key: "nachtragend", trait: "nicht nachtragend", line: "Zum Glück ist er nicht nachtragend — nach dem Streit war für ihn alles vergessen.", note: "\"nachtragend sein\" = to hold a grudge; here negated, which is a common, useful pattern." },
];

const HABITS = [
  { key: "ansprechen", label: "Ein Problem ansprechen", response: "Ich spreche ein Problem lieber direkt an, statt es zu ignorieren." },
  { key: "kompromiss", label: "Einen Kompromiss finden", response: "Ich versuche immer, mich mit der anderen Person auf einen Kompromiss zu einigen." },
  { key: "nachgeben", label: "Nachgeben", response: "Bei kleinen Meinungsverschiedenheiten gebe ich manchmal einfach nach." },
  { key: "verzeihen", label: "Verzeihen", response: "Wenn sich jemand entschuldigt, verzeihe ich normalerweise schnell." },
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

function initTopicPicker() {
  initPicker({
    buttonsId: "topic-picker-buttons",
    resultId: "topic-picker-result",
    options: TOPICS,
    renderResult: (option, el) => {
      el.innerHTML = "";

      const heading = document.createElement("span");
      heading.className = "picker-result-word";
      heading.textContent = option.trait;
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

function initHabitPicker() {
  initPicker({
    buttonsId: "habit-picker-buttons",
    resultId: "habit-picker-result",
    options: HABITS,
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

  initTopicPicker();
  initHabitPicker();

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("Jeder Mensch hat unterschiedliche Charaktereigenschaften, die sein Verhalten in einem Konflikt prägen.", "Every person has different character traits that shape how they behave in a conflict."));
  discoverList.appendChild(sentenceCard("Ein kleines Missverständnis kann schnell zu einem echten Streit werden.", "A small misunderstanding can quickly turn into a real argument."));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Bevor der Streit eskaliert, sollte man versuchen, das Missverständnis zu klären.", "Before the argument escalates, one should try to clarify the misunderstanding."));
  applyList.appendChild(sentenceCard("Ein guter Freund vermittelt zwischen den beiden, ohne Partei zu ergreifen.", "A good friend mediates between the two without taking sides."));
  applyList.appendChild(sentenceCard("Nach dem Vorwurf hat sie sich entschuldigt, und er hat ihr verziehen.", "After the accusation, she apologized, and he forgave her."));

  try {
    const vocab = await loadJSON("../data/vocabulary/b1-persoenlichkeit.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(PER_IDS.map(byId).filter(Boolean), document.getElementById("grid-per"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-per").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/b1-persoenlichkeit-quiz.json");

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
