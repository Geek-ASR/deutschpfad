/**
 * Page script for lessons/b2-partizipialphrasen.html — B2 Unit 8.
 * The "use" picker walks five participial-phrase readings; the
 * "reduce" picker gives example scene-setting sentences. No new CSS.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "b2-unit-8-partizipialphrasen";

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

const PAV_IDS = [
  "pav-partizip1-gleichzeitig", "pav-partizip2-passiv",
  "pav-subjekt-identitaet", "pav-komma-regel", "pav-umformung-temporal",
  "pav-umformung-kausal", "pav-frage-beispiel", "pav-erschoepft-beispiel",
  "pav-berlin-beispiel", "pav-laechelnd-beispiel", "pav-bewundert-beispiel",
  "pav-ueberzeugt-beispiel", "pav-ansprechen", "pav-erschoepfen",
  "pav-laecheln", "pav-bewundern", "pav-ueberzeugen",
  "pav-nachdem-vs-partizip", "pav-weil-vs-partizip",
  "pav-waehrend-vs-partizip1", "pav-erstaunt", "pav-getrieben",
  "pav-umgeben", "pav-begleitet", "pav-erstaunt-beispiel",
  "pav-getrieben-beispiel", "pav-umgeben-beispiel", "pav-begleitet-beispiel",
];

const USES = [
  { key: "gleichzeitig", label: "Simultaneous action (Partizip I)", line: "Lächelnd verließ sie den Raum.", note: "Partizip I describes what the subject is doing at the same time as the main action — like 'während sie lächelte'." },
  { key: "passiv", label: "Passive meaning (Partizip II)", line: "Von allen bewundert, genoss er seinen Erfolg.", note: "Partizip II here means something was done TO the subject — 'weil er von allen bewundert wurde'." },
  { key: "vorzeitig", label: "Completed before the main action (Partizip II, sein-verbs)", line: "In Berlin angekommen, suchte sie sofort ein Hotel.", note: "for sein-verbs, Partizip II can mean the action already finished — 'nachdem sie angekommen war'." },
  { key: "kausal", label: "Explaining a reason", line: "Erschöpft von der langen Reise, schlief er sofort ein.", note: "context tells you this is causal, not just descriptive — 'weil er erschöpft war'." },
  { key: "subjekt-regel", label: "The shared-subject rule", line: "Auf die Frage angesprochen, antwortete sie ruhig.", note: "the person 'angesprochen' must be the same as the main clause's subject 'sie' — this always has to match." },
];

const REDUCE = [
  { key: "warten", label: "Jemand wartet und ist müde", response: "Müde vom langen Warten, setzte sie sich auf eine Bank." },
  { key: "kritik", label: "Jemand reagiert auf Kritik", response: "Von der Kritik getroffen, verteidigte er seine Entscheidung." },
  { key: "erfolg", label: "Jemand feiert einen Erfolg", response: "Überrascht vom eigenen Erfolg, wusste sie zunächst nicht, was sie sagen sollte." },
  { key: "gericht", label: "Eine Szene vor Gericht", response: "Begleitet von ihrem Anwalt, betrat sie ruhig den Gerichtssaal." },
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
  discoverList.appendChild(sentenceCard("Lächelnd verließ sie den Raum.", "Smiling, she left the room."));
  discoverList.appendChild(sentenceCard("Von allen bewundert, genoss er seinen Erfolg.", "Admired by everyone, he enjoyed his success."));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Überzeugt von ihrem Plan, begann sie sofort mit der Umsetzung.", "Convinced of her plan, she immediately began implementing it."));
  applyList.appendChild(sentenceCard("Getrieben von Ehrgeiz, arbeitete er Tag und Nacht.", "Driven by ambition, he worked day and night."));
  applyList.appendChild(sentenceCard("Umgeben von Journalisten, verließ er das Gerichtsgebäude.", "Surrounded by journalists, he left the courthouse."));

  try {
    const vocab = await loadJSON("../data/vocabulary/b2-partizipialphrasen.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(PAV_IDS.map(byId).filter(Boolean), document.getElementById("grid-pav"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-pav").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/b2-partizipialphrasen-quiz.json");

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
