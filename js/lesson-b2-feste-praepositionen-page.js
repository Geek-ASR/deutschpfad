/**
 * Page script for lessons/b2-feste-praepositionen.html — B2 Unit 2.
 * The "use" picker walks academic/argumentative uses of fixed-
 * preposition expressions; the "academic" picker completes a
 * sentence for a given writing task. No new CSS.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "b2-unit-2-feste-praepositionen";

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

const FP_IDS = [
  "fp-zusammenhang", "fp-auswirkung", "fp-einfluss", "fp-abhaengigkeit",
  "fp-bezug", "fp-unterschied", "fp-beziehung", "fp-typisch",
  "fp-charakteristisch", "fp-bekannt", "fp-angewiesen", "fp-unabhaengig",
  "fp-sich-beschaeftigen", "fp-hinweisen", "fp-hindeuten", "fp-beruhen",
  "fp-bestehen", "fp-sich-auszeichnen", "fp-abhaengen", "fp-resultieren",
  "fp-sich-richten", "fp-sich-beziehen", "fp-sich-unterscheiden",
  "fp-zurueckfuehren", "fp-im-hinblick-darauf", "fp-in-bezug-darauf",
  "fp-woran", "fp-darauf-zurueckzufuehren",
];

const USES = [
  { key: "zusammenhang", label: "Explaining a connection", line: "Es gibt einen klaren Zusammenhang zwischen Bildung und Einkommen.", note: "\"der Zusammenhang zwischen X und Y\" — a core phrase for academic and argumentative writing." },
  { key: "beruhen", label: "Explaining what something is based on", line: "Die Entscheidung beruht auf mehreren wissenschaftlichen Studien.", note: "\"beruhen auf\" + Dat — to be founded/based on something, common in formal writing." },
  { key: "hinweisen", label: "Pointing something out", line: "Kritiker weisen darauf hin, dass der Netzausbau zu langsam vorangeht.", note: "\"hinweisen auf\" + Akk, separable — often used with a da(r)-compound pointing forward to a dass-clause." },
  { key: "abhaengen", label: "Explaining what something depends on", line: "Der Erfolg einer Reform hängt stark vom politischen Willen ab.", note: "\"abhängen von\" + Dat, separable — a very common academic-register verb." },
  { key: "zurueckfuehren", label: "Explaining a cause", line: "Der Rückgang lässt sich auf mehrere Faktoren zurückführen.", note: "\"zurückführen auf\" + Akk — to trace something back to its cause, often used with sich lassen (B1 Unit)." },
];

const ACADEMIC = [
  { key: "studie", label: "Über eine Studie sprechen", response: "Die Studie zeigt einen klaren Zusammenhang zwischen Schlafmangel und Konzentrationsproblemen." },
  { key: "kritik", label: "Kritik äußern", response: "Ich weise darauf hin, dass diese Argumentation auf falschen Annahmen beruht." },
  { key: "unterschied", label: "Einen Unterschied erklären", response: "Der Hauptunterschied zwischen den beiden Modellen besteht in der Finanzierung." },
  { key: "ursache", label: "Eine Ursache benennen", response: "Das Problem lässt sich vor allem auf fehlende Investitionen zurückführen." },
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

function initAcademicPicker() {
  initPicker({
    buttonsId: "academic-picker-buttons",
    resultId: "academic-picker-result",
    options: ACADEMIC,
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
  initAcademicPicker();

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("Es gibt einen klaren Zusammenhang zwischen Bildung und Einkommen.", "There is a clear connection between education and income."));
  discoverList.appendChild(sentenceCard("Kritiker weisen darauf hin, dass der Netzausbau zu langsam vorangeht.", "Critics point out that grid expansion is progressing too slowly."));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Der Hauptunterschied zwischen den beiden Modellen besteht in der Finanzierung.", "The main difference between the two models lies in the financing."));
  applyList.appendChild(sentenceCard("Der Rückgang lässt sich auf mehrere Faktoren zurückführen.", "The decline can be traced back to several factors."));
  applyList.appendChild(sentenceCard("Viele ländliche Regionen sind auf ein funktionierendes Nahverkehrsnetz angewiesen.", "Many rural regions are reliant on a functioning local transport network."));

  try {
    const vocab = await loadJSON("../data/vocabulary/b2-feste-praepositionen.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(FP_IDS.map(byId).filter(Boolean), document.getElementById("grid-fp"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-fp").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/b2-feste-praepositionen-quiz.json");

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
