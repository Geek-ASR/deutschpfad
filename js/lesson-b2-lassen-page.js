/**
 * Page script for lessons/b2-lassen.html — B2 Unit 4.
 * The "use" picker walks the jobs lassen/sich lassen do (causative,
 * passive alternative, permission, leaving a state, Perfekt); the
 * "causative" picker gives personal example sentences. No new CSS.
 */

import { initLessonLoop } from "./lesson-loop.js";
import { renderVocabGrid } from "./vocab-card.js";
import { runQuiz } from "./quiz-engine.js";
import { initPicker } from "./picker-widget.js";
import { createSpeakButton } from "./speak.js";
import { markLessonVisited, recordQuizResult } from "./progress-store.js";

const LESSON_ID = "b2-unit-4-lassen";

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

const LAS_IDS = [
  "las-lassen-infinitiv", "las-sich-lassen-infinitiv",
  "las-perfekt-doppelinfinitiv", "las-friseur-beispiel",
  "las-loesen-beispiel", "las-in-ruhe", "las-lass-das",
  "las-offen-lassen", "las-reparieren-lassen", "las-warten-lassen",
  "las-erklaeren-beispiel", "las-nicht-aendern-beispiel",
  "las-beobachten-beispiel", "las-vorstellen-beispiel", "las-zulassen",
  "las-verlassen", "las-hinterlassen", "las-loslassen", "las-unterlassen",
  "las-nachlassen", "las-erlauben", "las-zulassung", "las-machbar",
  "las-loesbar", "las-perfekt-friseur-beispiel",
  "las-behoerde-zulassen-beispiel", "las-verlassen-beispiel",
  "las-lassen-vs-verlassen",
];

const USES = [
  { key: "causative", label: "Having something done", line: "Ich lasse mir die Haare schneiden.", note: "lassen + Infinitiv = you don't do it yourself, you have someone else do it — mir is the person affected." },
  { key: "passive-alt", label: "Saying something can be done", line: "Das Problem lässt sich lösen.", note: "sich lassen + Infinitiv = a passive alternative to 'kann gelöst werden' — very common in formal writing." },
  { key: "permission", label: "Letting someone do something", line: "Die Eltern lassen ihre Tochter allein verreisen.", note: "lassen also means to allow/permit someone to do something — no sich here." },
  { key: "leave-as-is", label: "Leaving something as it is", line: "Lass die Tür bitte offen.", note: "lassen for leaving a state unchanged — the object stays in whatever condition you specify." },
  { key: "perfekt", label: "In the Perfekt (double infinitive)", line: "Ich habe mir die Haare schneiden lassen.", note: "like a modal verb, lassen + another infinitive uses a double infinitive in the Perfekt — never 'gelassen' here." },
];

const CAUSATIVE = [
  { key: "auto", label: "Das Auto", response: "Ich lasse mein Auto einmal im Jahr reparieren." },
  { key: "problem", label: "Ein Problem", response: "Dieses Problem lässt sich meiner Meinung nach nicht so leicht lösen." },
  { key: "erlaubnis", label: "Eine Erlaubnis geben", response: "Ich lasse meinen Mitbewohner gern meine Küche benutzen." },
  { key: "aendern", label: "Etwas, das man nicht ändern kann", response: "Die Vergangenheit lässt sich leider nicht ändern." },
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

function initCausativePicker() {
  initPicker({
    buttonsId: "causative-picker-buttons",
    resultId: "causative-picker-result",
    options: CAUSATIVE,
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
  initCausativePicker();

  const discoverList = document.getElementById("discover-examples");
  discoverList.appendChild(sentenceCard("Ich lasse das Fenster offen.", "I'm leaving the window open."));
  discoverList.appendChild(sentenceCard("Ich verlasse jetzt das Haus.", "I'm leaving the house now."));

  const applyList = document.getElementById("apply-examples");
  applyList.appendChild(sentenceCard("Es lässt sich leicht vorstellen, dass diese Entscheidung Kritik auslösen wird.", "It's easy to imagine that this decision will trigger criticism."));
  applyList.appendChild(sentenceCard("Bitte unterlassen Sie unnötigen Lärm nach 22 Uhr.", "Please refrain from unnecessary noise after 10pm."));
  applyList.appendChild(sentenceCard("Der Regen hat gegen Abend nachgelassen.", "The rain eased off toward evening."));

  try {
    const vocab = await loadJSON("../data/vocabulary/b2-lassen.json");
    const byId = (id) => vocab.find((v) => v.id === id);
    renderVocabGrid(LAS_IDS.map(byId).filter(Boolean), document.getElementById("grid-las"));
  } catch (err) {
    console.error(err);
    document.getElementById("grid-las").innerHTML =
      '<p class="quiz-empty">Couldn\'t load vocabulary data. If you opened this file directly, run it from a local server instead (see the README).</p>';
  }

  try {
    const quizData = await loadJSON("../data/quizzes/b2-lassen-quiz.json");

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
