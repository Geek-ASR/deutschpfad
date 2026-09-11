/**
 * Page script for lessons/b1-familie.html — B1 Unit 20 (topic unit).
 * The "topic" picker walks core family-discourse ideas (parental leave,
 * childcare, elder care, blended families, generations); the "habit"
 * picker answers "how does your family handle it?" No new CSS.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "b1-unit-20-familie";

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

const FAM_IDS = [
  "fam-erziehung", "fam-elternzeit", "fam-elterngeld",
  "fam-kinderbetreuung", "fam-kita", "fam-vereinbarkeit",
  "fam-patchwork-familie", "fam-generation", "fam-angehoerige",
  "fam-pflege", "fam-pflegeheim", "fam-altenpflege", "fam-haushalt",
  "fam-sorgerecht", "fam-unterhalt", "fam-erziehungsberechtigte",
  "fam-generationenvertrag", "fam-alleinerziehend",
  "fam-pflegebeduerftig", "fam-erwachsen", "fam-verwandt",
  "fam-erziehen", "fam-sich-kuemmern", "fam-unterstuetzen",
  "fam-betreuen", "fam-versorgen", "fam-aufwachsen", "fam-vererben",
];

const TOPICS = [
  { key: "elternzeit", moment: "Talking about parental leave", line: "Beide Eltern können Elternzeit nehmen und bekommen währenddessen Elterngeld.", note: "Elternzeit (the leave) and Elterngeld (the allowance paid during it) are related but different — one is the leave, one is the money." },
  { key: "kinderbetreuung", moment: "Talking about childcare", line: "Ohne einen Kitaplatz ist es für viele Eltern schwierig, Familie und Beruf zu vereinbaren.", note: "\"die Vereinbarkeit von Familie und Beruf\" = work-family balance — a very common phrase in this topic." },
  { key: "pflege", moment: "Talking about caring for a relative", line: "Wenn ein Angehöriger pflegebedürftig wird, übernehmen oft die eigenen Kinder die Pflege.", note: "\"die Pflege\" covers caring for both children and the elderly or sick — context tells you which." },
  { key: "patchwork", moment: "Talking about modern family structures", line: "Immer mehr Kinder wachsen in einer Patchwork-Familie mit Stiefgeschwistern auf.", note: "\"aufwachsen\" is separable and conjugates with sein: die Kinder sind aufgewachsen." },
  { key: "generationen", moment: "Talking about generations", line: "Jüngere Generationen finanzieren über den Generationenvertrag die Renten der älteren.", note: "der Generationenvertrag is the German pension system's basic principle — today's workers fund today's retirees." },
];

const HABITS = [
  { key: "erziehung", label: "Erziehung", response: "Meine Eltern haben uns ziemlich locker erzogen, aber Bildung war ihnen immer wichtig." },
  { key: "pflege", label: "Pflege der Eltern", response: "Wenn meine Eltern einmal pflegebedürftig werden, möchte ich mich so gut wie möglich um sie kümmern." },
  { key: "unterstuetzung", label: "Gegenseitige Unterstützung", response: "Meine Familie unterstützt mich finanziell während des Studiums, dafür helfe ich oft im Haushalt." },
  { key: "entfernung", label: "Familie im Ausland", response: "Meine Familie lebt weit weg, deshalb telefonieren wir regelmäßig und besuchen uns, wann immer es geht." },
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
      heading.textContent = option.moment;
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
  discoverList.appendChild(sentenceCard("In Deutschland können beide Elternteile Elternzeit nehmen und dabei Elterngeld bekommen.", "In Germany, both parents can take parental leave and receive parental allowance during it."));
  discoverList.appendChild(sentenceCard("Immer mehr erwachsene Kinder kümmern sich um pflegebedürftige Eltern.", "More and more adult children are taking care of parents in need of care."));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Ohne ausreichende Kinderbetreuung ist die Vereinbarkeit von Familie und Beruf schwierig.", "Without adequate childcare, balancing family and career is difficult."));
  applyList.appendChild(sentenceCard("Viele Kinder wachsen heute in einer Patchwork-Familie mit mehreren Geschwistern auf.", "Many children today grow up in a blended family with several siblings."));
  applyList.appendChild(sentenceCard("Wenn die Eltern sich trennen, entscheidet oft ein Gericht über das Sorgerecht.", "When parents separate, a court often decides on custody."));

  try {
    const vocab = await loadJSON("../data/vocabulary/b1-familie.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(FAM_IDS.map(byId).filter(Boolean), document.getElementById("grid-fam"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-fam").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/b1-familie-quiz.json");

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
